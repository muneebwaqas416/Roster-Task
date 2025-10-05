// validateProfiles.js
const axios = require("axios");
const pLimit = require("p-limit");

/**
 * Checks if a URL is valid by making a HEAD request
 * @param {string} url
 * @returns {Promise<boolean>}
 */
async function isUrlValid(url) {
    try {
      const res = await axios.head(url, {
        timeout: 5000
      });
      console.log(url, res.status);
      return res.status >= 200 && res.status < 400;
    } catch (err) {
      console.log("Error fetching:", url, err.message);
      return false;
    }
  }

/**
 * Validates an array of profiles concurrently
 * @param {Array} profiles - Array of profile objects with `profileLink`
 * @returns {Array} - Filtered array with only valid URLs
 */
async function validateProfiles(profiles) {
  const limit = pLimit(50); // maximum 50 concurrent requests
  const validated = await Promise.all(
    profiles.map(profile =>
      limit(async () => {
        const valid = await isUrlValid(profile.profileLink);
        return valid ? profile : null;
      })
    )
  );
  return validated.filter(Boolean);
}

module.exports = validateProfiles;