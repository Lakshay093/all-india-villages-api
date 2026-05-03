# All India Villages API & B2B Dashboard

A comprehensive, edge-compatible B2B API platform serving over 537,610 hierarchical village records of India. Built with a modern serverless stack, this project features robust data pipelining, multi-tier API rate limiting, and a premium React Admin Dashboard.

## 🚀 Features

- **Massive Data Scale**: Exposes endpoints querying 537,610 villages across 36 States/UTs, 509 Districts, and 5,204 Sub-districts.
- **Serverless Edge Backend**: Built with Node.js and Express, fully optimized for Vercel Edge/Serverless deployment.
- **High-Performance Database**: Powered by NeonDB (Serverless PostgreSQL) and Prisma ORM for type-safe, ultra-fast queries.
- **B2B Authentication & Rate Limiting**: Secure `X-API-Key` and `X-API-Secret` (bcrypt hashed) headers. Rate limiting is enforced via Upstash Redis (e.g., Free Tier: 100 req/day, Pro Tier: 10,000 req/day).
- **Premium Admin Dashboard**: A sleek, dark-themed React UI utilizing Tailwind CSS, Recharts, and Lucide icons to visualize live database state, manage B2B users, and simulate live API traffic.

## 🛠️ Technology Stack

- **Data Pipeline**: Python, Pandas
- **Database**: NeonDB (PostgreSQL), Prisma ORM
- **Backend API**: Node.js, Express.js, Upstash Redis, Bcrypt
- **Frontend Dashboard**: React 18, Vite, Tailwind CSS, Recharts
- **Deployment**: Vercel

## 📂 Project Structure

```text
all-india-villages-api/
├── backend/                  # Serverless API logic
│   ├── api/index.js          # Express app & endpoints
│   ├── prisma/schema.prisma  # Database schema definition
│   ├── prisma/seed.js        # Optimized chunk-seeding script
│   └── vercel.json           # Vercel deployment configuration
├── frontend/                 # B2B Admin Dashboard
│   ├── src/Dashboard.jsx     # Main UI component
│   └── tailwind.config.js    # Tailwind UI styling
├── cleaned_data/             # Normalized CSV exports (States, Districts, etc.)
├── dataset/                  # Raw Indian Census Excel/ODS files
└── clean_data.py             # Python script for hierarchical data parsing
```

## 💻 Local Development

### 1. Database Setup
1. Create a [NeonDB](https://neon.tech/) PostgreSQL project.
2. Inside the `/backend` folder, copy `.env.example` to `.env` and insert your `DATABASE_URL`.
3. Push the schema and seed the 537,000+ records:
   ```bash
   cd backend
   npx prisma db push
   node prisma/seed.js
   ```

### 2. Start the Backend API
```bash
cd backend
npm install
npm run start
```
*The API will be available at `http://localhost:3001/api/v1`*

### 3. Start the Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
*View the dashboard at `http://localhost:5173`*

## 🌐 API Endpoints

- `GET /api/v1/states` - Returns all States and UTs.
- `GET /api/v1/districts?stateId={id}` - Returns all districts for a specific state.
- `GET /api/v1/subdistricts?districtId={id}` - Returns all sub-districts for a specific district.
- `GET /api/v1/villages?subDistrictId={id}` - Returns paginated villages.
- `GET /api/v1/search?q={query}` - Returns fuzzy-matched villages with full hierarchical context.

## 📝 License
This project was developed as part of an Internship assignment. Data provided is based on public census records.
