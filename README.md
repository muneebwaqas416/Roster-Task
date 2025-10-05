🧾 Collabstr Influencer Scraper

This project automates the process of scraping influencer profiles from Collabstr for specific role types (e.g. UGC Creator, Video Creator, etc.).
It fetches influencer names, profile links, and full role titles, and exports the data to CSV files.

The scraper is scalable, efficient, and compliant with modern web scraping best practices using Puppeteer and concurrency control.

🚀 Features

✅ Scrapes influencer profiles for any specified role type
✅ Automatically handles pagination and login when required
✅ Skips duplicate and invalid profiles (e.g. agencies, studios, etc.)
✅ Dynamically detects truncated roles (...) and fetches full details
✅ Validates profile URLs using Axios
✅ Supports up to 1,000+ profiles with concurrency limit (via p-limit)
✅ Saves clean, validated results to CSV files

🧠 Project Structure

📦 Roster Task
├── scripts/
│   ├── scrapper.js          # Main scraper logic (entry point)
│   ├── login.js             # Handles Collabstr login if needed
│   ├── saveToCSV.js         # Converts data to CSV and saves locally
│   ├── validateProfile.js   # Validates profile URLs concurrently
├── docs/
    ├── Technical Documentation.docx
├── data/
    ├── ugc_creater.csv
    ├── video.csv
├── package.json
└── README.md
└── .env

🛠️ Technologies Used

Tool	Purpose
Node.js	Runtime environment
Puppeteer	Headless browser automation for scraping
Axios	For lightweight URL validation
p-limit	Controls concurrency for scalable scraping
csv-writer	Saves clean results into .csv format

⚙️ Installation & Setup
	1.	Clone the Repository

git clone https://github.com/yourusername/collabstr-scraper.git
cd collabstr-scraper


	2.	Install Dependencies

npm install


	3.	Create a .env (optional for login)

COLLABSTR_EMAIL=youremail@example.com
COLLABSTR_PASSWORD=yourpassword


	4.	Run the Scraper

node scripts/scrapper.js

🧩 Configuration

You can modify the roleTypes and maxProfiles values at the bottom of scrapper.js:

const roleTypes = ["UGC Creator", "Video Creator"];
const maxProfiles = 50;

	•	roleTypes → list of influencer categories to scrape
	•	maxProfiles → maximum number of profiles per role

📊 Output Example

Each role type generates a CSV file like:

UGC Creator.csv
Video Creator.csv

Columns:
| Name | Role | Profile Link |

⚡ Scalability & Optimization

This scraper is designed to handle 1,000+ profiles efficiently using:
	•	p-limit for controlled concurrency
	•	Selective profile expansion (only opens pages when role is truncated)
	•	Network-safe navigation delays
	•	Reused browser instance to minimize resource use

	⚠️ For extremely large runs (1000+), increase system memory and consider rotating proxies to prevent throttling.

🧪 Validation

All fetched profiles are validated via validateProfile.js, which:
	•	Performs lightweight HEAD requests using Axios
	•	Ensures the profile URLs are reachable (non-404)
	•	Runs up to 50 concurrent validations safely

🧰 Example Console Output

🔎 Scraping role: UGC Creator
➡️ Going to next page: https://collabstr.com/influencers?c=UGC%20Creator&pg=2
✅ [12/50] Role already complete: Video Editor & UGC Specialist
🔁 [13/50] Fixed role: Amy Walker → Verified Influencer | Lifestyle & Beauty
✅ UGC Creator: 50 profiles fetched with full role titles
💾 Saved as UGC Creator.csv

🧤 Ethical Usage Notice

This scraper is built for educational and academic purposes (data collection assignment).
Do not use it for commercial or spam purposes.
Always comply with the website’s Terms of Service when scraping.

👨‍💻 Author

Muneeb Waqas
Full Stack Engineer | MERN & Automation Developer
📧 muneebwaqas@900.com

