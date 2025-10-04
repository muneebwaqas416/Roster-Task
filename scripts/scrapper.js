const puppeteer = require("puppeteer");
const loginCollabstr = require("./login");
const saveToCSV = require("./savetoCSV");

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

  // Step 1: detect if more than 50 records exist
  const hasNextPage = await page.$("a.pagination-arrow-holder") !== null;

  // Step 2: if >50 requested AND multiple pages → login first
  if (hasNextPage && maxProfiles > 50) {
    console.log(`🔐 ${roleType} exceeds 50 → logging in first...`);
    await loginCollabstr(page);
    await page.goto(baseUrl, { waitUntil: "networkidle2" }); // reload logged in
  }

  let profiles = new Map();
  let keepGoing = true;

  while (keepGoing && profiles.size < maxProfiles) {
    await page.waitForSelector(".profile-listing-holder", { timeout: 10000 });

    const pageProfiles = await page.evaluate(() => {
      const nodes = document.querySelectorAll(".profile-listing-holder");
      return Array.from(nodes).map((node) => {
        const name = node.querySelector(".profile-listing-owner-name")?.textContent?.trim() || "";
        const link = node.querySelector("a")?.getAttribute("href") || "";
        const role = node.querySelector(".profile-listing-title")?.textContent?.trim() || "";

        return {
          name,
          profileLink: link.startsWith("http") ? link : `https://collabstr.com${link}`,
          role,
          email: "",
        };
      });
    });

    // ✅ filter & add to Map
    const blacklist = /(studio|media|agency|productions|designs|labs|official|channel|team|llc|inc|ltd|pvt|gmbh|plc|co|company|group)|^the\s/i;
    pageProfiles.forEach((p) => {
      if (p.name && !blacklist.test(p.name)) {
        profiles.set(p.profileLink, p);
      }
    });

    if (profiles.size >= maxProfiles) break;

    // ✅ specifically look for "Next Page" link
    const nextHref = await page.evaluate(() => {
      const links = document.querySelectorAll("a.pagination-arrow-holder");
      for (let link of links) {
        if (link.innerText.includes("Next Page")) {
          return link.href;
        }
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

  await browser.close();
  return Array.from(profiles.values()).slice(0, maxProfiles); // trim to maxProfiles
}

(async () => {
  const roleTypes = ["UGC Creator", "Video Creator"];
  const maxProfiles = 120;

  for (const role of roleTypes) {
    console.log(`\n🔎 Scraping role: ${role}`);
    const result = await scrapeCollabstr(role, maxProfiles);
    console.log(`✅ ${role}: ${result.length} profiles fetched`);
    saveToCSV(result, role); // save separate file for each role
  }
})();