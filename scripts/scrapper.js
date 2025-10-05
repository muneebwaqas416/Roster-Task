const puppeteer = require("puppeteer");
const loginCollabstr = require("./login");
const saveToCSV = require("./savetoCSV");
const validateProfiles = require("./validateProfile");

async function scrapeCollabstr(roleType, maxProfiles = 50) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();
  const baseUrl = `https://collabstr.com/influencers?c=${encodeURIComponent(roleType)}`;
  await page.goto(baseUrl, { waitUntil: "networkidle2" });

  const hasNextPage = (await page.$("a.pagination-arrow-holder")) !== null;
  if (hasNextPage && maxProfiles > 50) {
    console.log(`🔐 ${roleType} exceeds 50 → logging in...`);
    await loginCollabstr(page);
    await page.goto(baseUrl, { waitUntil: "networkidle2" });
  }

  const profilesMap = new Map();
  let keepGoing = true;

  while (keepGoing && profilesMap.size < maxProfiles) {
    await page.waitForSelector(".profile-listing-holder", { timeout: 15000 });

    const pageProfiles = await page.evaluate(() => {
      const nodes = document.querySelectorAll(".profile-listing-holder");
      return Array.from(nodes).map((node) => ({
        name: node.querySelector(".profile-listing-owner-name")?.textContent?.trim() || "",
        profileLink: node.querySelector("a")?.href || "",
        role:
          node.querySelector(".profile-listing-title")?.getAttribute("title")?.trim() ||
          node.querySelector(".profile-listing-title")?.textContent?.trim() ||
          "",
      }));
    });

    const blacklist =
      /(studio|media|agency|productions|designs|labs|official|channel|team|llc|inc|ltd|pvt|gmbh|plc|co|company|group)|^the\s/i;

    pageProfiles.forEach((p) => {
      if (
        p.name &&
        !blacklist.test(p.name) &&
        !profilesMap.has(p.profileLink)
      ) {
        profilesMap.set(p.profileLink, p);
      }
    });

    if (profilesMap.size >= maxProfiles) break;

    const nextHref = await page.evaluate(() => {
      const links = document.querySelectorAll("a.pagination-arrow-holder");
      for (let link of links) {
        if (link.innerText.includes("Next Page")) return link.href;
      }
      return null;
    });

    if (nextHref) {
      console.log("➡️ Going to next page:", nextHref);
      await page.goto(nextHref, { waitUntil: "networkidle2" });
    } else {
      keepGoing = false;
    }
  }

  console.log("\n🎯 Checking incomplete roles...");
  const profilesArray = Array.from(profilesMap.values()).slice(0, maxProfiles);

  for (let i = 0; i < profilesArray.length; i++) {
    const p = profilesArray[i];

    // ✅ Only open the profile if role is incomplete or contains "..."
    if (!p.role || p.role.includes("…") || p.role.includes("...")) {
      try {
        const profilePage = await browser.newPage();
        await profilePage.goto(p.profileLink, { waitUntil: "networkidle2" });
        await profilePage.waitForSelector(".listing-title.header-title", { timeout: 10000 });

        const fullRole = await profilePage.$eval(".listing-title.header-title", (el) =>
          el.textContent.trim()
        );

        p.role = fullRole;
        await profilePage.close();

        console.log(`🔁 [${i + 1}/${profilesArray.length}] Fixed role: ${p.name} → ${p.role}`);
        await new Promise((r) => setTimeout(r, 800));
      } catch (err) {
        console.warn(`⚠️ Could not fetch full role for ${p.profileLink}: ${err.message}`);
      }
    } else {
      console.log(`✅ [${i + 1}/${profilesArray.length}] Role already complete: ${p.role}`);
    }
  }

  await browser.close();

  // Optional: URL validation
  // const validProfiles = await validateProfiles(profilesArray);

  return profilesArray.slice(0, maxProfiles);
}

(async () => {
  const roleTypes = ["UGC Creator", "Video"];
  const maxProfiles = 50;

  for (const role of roleTypes) {
    console.log(`\n🔎 Scraping role: ${role}`);
    const result = await scrapeCollabstr(role, maxProfiles);
    console.log(`✅ ${role}: ${result.length} profiles fetched with full role titles`);
    saveToCSV(result, role);
  }
})();