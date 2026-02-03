# Trading Journal (Hosted + Login)

Personal trading journal web app (mobile-friendly) with login and private data.

## Tech

- Next.js (App Router) + Tailwind
- Supabase (Postgres + Auth + Row Level Security)
- Deploy: Vercel

## 1) Create Supabase project

1. Go to https://supabase.com → New Project
2. In **SQL Editor**, run: `supabase/schema.sql`
3. In **Authentication → Providers**, keep Email enabled.

## 2) Configure environment variables

Copy `.env.example` to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 3) Run locally

```bash
npm install
npm run dev
```
Open http://localhost:3000

## 4) Deploy on Vercel (free)

1. Push this repo to GitHub
2. Vercel → New Project → Import GitHub repo
3. Set env vars in Vercel Project Settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

You’ll get a shareable link like:
`https://your-project.vercel.app`

## Notes (privacy)

- Trades table uses RLS policies so each user only sees their own trades.
- You can invite a friend by creating another account, or just show from your phone.
