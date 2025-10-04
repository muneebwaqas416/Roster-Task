const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");

function saveToCSV(data, roleType) {
  try {
    const csv = parse(data, { fields: ["name", "profileLink", "role"] });
    const safeRole = roleType.replace(/\s+/g, "_").toLowerCase();

    // ✅ ensure "data" folder exists
    const dirPath = path.join(__dirname, "..", "data");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    const filePath = path.join(dirPath, `${safeRole}.csv`);
    fs.writeFileSync(filePath, csv);
    console.log(`✅ Saved ${data.length} records for ${roleType} to ${filePath}`);
  } catch (err) {
    console.error("❌ Error saving CSV:", err);
  }
}

module.exports = saveToCSV;