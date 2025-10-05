require("dotenv").config();

async function loginCollabstr(page) {
  const email = process.env.COLLABSTR_EMAIL;
  const password = process.env.COLLABSTR_PASSWORD;
  if (!email || !password) {
    throw new Error("Missing credentials in .env file");
  }

  await page.goto("https://collabstr.com/login", { waitUntil: "networkidle2" });

  await page.type('input[name="email"]', email, { delay: 50 });
  await page.type('input[name="password"]', password, { delay: 50 });

  await Promise.all([
    page.click("button.submit.btn"),
    page.waitForNavigation({ waitUntil: "networkidle2" }),
  ]);

  console.log("Logged in successfully!");
}

module.exports = loginCollabstr;