# TutorLink — Setup

A location-based tutoring web app: React + Tailwind frontend, Node/Express API, Supabase (PostgreSQL + PostGIS) backend.

## 1. Supabase setup
1. Open your project: https://qdaccndowszbytbwkybs.supabase.co
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**.
   This creates all tables, enums, PostGIS spatial column, RLS policies, the `search_nearby_tutors` RPC, and the `admin_stats` view.
3. Go to **Settings → API** and copy:
   - `Project URL` (already filled in `.env`)
   - `anon` public key
   - `service_role` secret key
4. Paste the keys into:
   - `backend/.env`  → `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   - `frontend/.env` → `VITE_SUPABASE_ANON_KEY`

## 2. Promote your first admin
After signing up the first time:
```sql
update public.users set role = 'admin' where email = 'you@example.com';
```

## 3. Run locally
```bash
# Terminal 1 — backend
cd backend
npm install
npm run dev          # http://localhost:5000

# Terminal 2 — frontend
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## 4. Deploy to Vercel
From the project root:
```bash
vercel
```
Vercel reads `vercel.json` and builds:
- `frontend/` as a static site
- `backend/api/index.js` as a serverless function under `/api/*`

Add the same env vars in Vercel project settings (both backend and frontend prefixed `VITE_`).

## File layout
```
supabase/schema.sql        Postgres + PostGIS + RLS
backend/                   Express API (auth, tutor, student, admin routes)
frontend/                  React + Vite + Tailwind + React Router
vercel.json                Routes /api/* → backend, /* → frontend
```
