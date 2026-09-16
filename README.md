# AgriTrace

Mobile-first agricultural batch traceability MVP (Next.js + Supabase).

## Setup

1. Create a [Supabase](https://supabase.com) project.
2. Copy `.env.local.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`)
3. In the Supabase SQL editor, run in order:
   - `supabase/migrations/001_schema.sql`
   - `supabase/seed.sql`
4. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

## Demo data

After seeding: farmer **Ravi Kumar**, farm **Green Valley Farm**, batch **AGRI-2026-001** (Tomato / Anagha) with five activities and cooperative verification.
