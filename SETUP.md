# Together — Setup Guide

## 1. Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. SQL Editor → New query → paste the contents of `supabase/schema.sql` → Run
3. Copy your project's **URL**, **anon key**, and **service role key** (Settings → API)

## 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SESSION_SECRET=any-random-32+-char-string
```

For push notifications, generate VAPID keys once:
```bash
npx web-push generate-vapid-keys
```

Then add to `.env.local`:
```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_CONTACT=mailto:you@example.com
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 on your phone (or use ngrok for real push testing).

## 4. Deploy to Vercel

```bash
npx vercel
```

Add all env vars in Vercel dashboard → Settings → Environment Variables.

## How it works

- Person A goes to the app → **Start your space** → enters both names → gets a 6-char code
- Person B goes to the app → **Join with a code** → enters the code and their name
- Both are now paired — all data syncs in real time via Supabase Realtime
- Push notifications work once both enable them in Settings
