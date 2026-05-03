# 🎥 Video Demonstration Script

**Objective:** This script is designed for a 3 to 4-minute demonstration video. You will record your screen while navigating through the codebase, the live dashboard, and the database.

### [Scene 1: Introduction (0:00 - 0:30)]
*(Screen recording shows the GitHub repository or your code editor open to `schema.prisma`)*
**You**: "Hello everyone, my name is Lakshay Dhiman. Today, I'm thrilled to present my internship assignment: The **All India Villages B2B API Platform**. The core challenge of this project was taking raw, unstructured Indian census data and engineering it into a highly performant, serverless API capable of instantly querying over half a million village records."

### [Scene 2: Data Engineering & Database (0:30 - 1:15)]
*(Switch screen to `clean_data.py` and then to `seed.js`)*
**You**: "The journey started with data parsing. I wrote a Python script that walked through 35+ messy Excel files, normalizing strings and extracting the hierarchical structure: from States down to Districts, Sub-districts, and finally, 537,610 individual Villages. 
To store this massive dataset, I chose **NeonDB Serverless PostgreSQL** and mapped it using **Prisma ORM** in strict Third Normal Form. Because inserting half a million records all at once would crash most servers, I built a custom Node.js seeder that streams and chunks the CSV files, safely pumping all 537k rows into the cloud database in seconds."

### [Scene 3: Backend & API Security (1:15 - 2:00)]
*(Switch screen to `backend/api/index.js` focusing on the Upstash Rate Limiter code)*
**You**: "For the backend, I built an Express API designed specifically for Edge and Serverless environments like Vercel. 
Since this is designed as a B2B SaaS platform, security and monetization were crucial. I integrated **Upstash Redis** to handle strict multi-tier rate limiting. The middleware verifies `X-API-Key` and `X-API-Secret` headers using `bcrypt`, checks the user's billing plan in the database, and enforces request limits instantly at the edge—preventing abuse and allowing for scalable monetization."

### [Scene 4: The React Admin Dashboard (2:00 - 3:15)]
*(Open the browser to `http://localhost:5173/` and navigate the dashboard)*
**You**: "Finally, to manage the platform, I built a premium React Admin Dashboard using Vite and Tailwind CSS. 
*(Click on the Database Explorer tab)* 
Here on the Database tab, the dashboard is actively fetching real-time data directly from our NeonDB instance, showing the exact count of all states and sub-districts synced. 
*(Click on the Overview tab and use the Search Bar)* 
The global search bar hits our Express backend and instantly queries the half-million rows in NeonDB, returning fuzzy matches with their full hierarchical breadcrumbs.
*(Click on the API Requests Tab)*
We also have a live terminal-style request log that monitors incoming traffic to the API, displaying endpoints hit, latencies, and rate-limit triggers.
*(Click on B2B Users Tab)*
And of course, the B2B User Portal allows administrators to effortlessly generate and manage API keys for clients based on their subscription tier."

### [Scene 5: Conclusion (3:15 - 3:30)]
*(Switch back to the Overview tab or GitHub repo)*
**You**: "In conclusion, this project encompasses the full lifecycle of software engineering: from raw data pipelines and complex database modeling, to serverless backend security and building a beautiful, interactive frontend dashboard. Thank you for watching!"
