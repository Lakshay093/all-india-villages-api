# 📚 All India Villages API: Complete Project Documentation

## 1. Project Overview
The **All India Villages API** is a highly scalable, serverless backend infrastructure paired with a premium B2B (Business-to-Business) Admin Dashboard. The goal of this project was to ingest massive, unformatted raw census data containing every village in India, clean it, build a strict relational database, and serve it via secure, monetizable API endpoints.

## 2. Technical Architecture & Decisions
- **Data Engineering**: Built a robust Python script using `pandas` to recursively walk through 30+ raw Excel/ODS census files, normalize the text, extract hierarchical relationships, and export them into 4 pristine CSVs (`states.csv`, `districts.csv`, `sub_districts.csv`, `villages.csv`).
- **Database (NeonDB Serverless PostgreSQL)**: 
  - Chosen for its ability to scale compute to zero when idle and instantly wake up on Edge requests.
  - Implemented a strict **3rd Normal Form (3NF)** relational schema via **Prisma ORM**. This ensures data integrity across the 537,610 village records.
- **Backend Infrastructure**: 
  - A Node.js + Express API designed specifically to be deployed as serverless functions on Vercel. 
  - Employs a custom data seeder using Node streams (`csv-parser`) to chunk-insert 500,000+ rows efficiently without blowing up memory.
- **Security & Monetization (Upstash Redis)**: 
  - Implemented secure API authentication requiring hashed `X-API-Key` and `X-API-Secret` headers. 
  - Integrated **Upstash Redis** to enforce multi-tier rate limiting (e.g., Free users get 100 requests/day, Ultra users get 10,000 requests/day).
- **Frontend Dashboard**: 
  - Built with React 18, Vite, and Tailwind CSS.
  - Features real-time state fetches from NeonDB, a beautiful dark-mode glassmorphic UI, live interactive Search, API Key Management, and simulated API traffic logs.

## 3. Core Technologies Used
* **Frontend**: React 18, Vite, Tailwind CSS, Recharts, Lucide Icons.
* **Backend**: Node.js, Express.js, Bcrypt, @upstash/redis, @upstash/ratelimit.
* **Database**: PostgreSQL (NeonDB serverless), Prisma ORM (`@prisma/client`).
* **Data Processing**: Python 3, Pandas, Openpyxl.
* **Deployment Setup**: Vercel `vercel.json` routing configurations.
