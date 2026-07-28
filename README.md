# Time Slot Booking Web App

A simple time slot booking app: a Next.js frontend, and a backend built with
Supabase Edge Functions (instead of a separate Express server).

## Tech Stack

- **Frontend:** Next.js (React) + Tailwind CSS
- **Backend:** Supabase Edge Functions (serverless functions that run on Supabase itself)
- **Database:** Supabase (PostgreSQL)

## Folder Structure

```
slot-booking/
  frontend/                        Next.js app — the web page you see
  supabase/functions/bookings/       Edge Function: list + create bookings
  supabase/functions/bookings-delete/  Edge Function: delete a booking
  supabase_setup.sql                 Run this once in Supabase to set up the table + demo data
```

The frontend calls your Supabase Edge Functions directly (no separate server
to run or host) — Supabase hosts the backend code for you.

## 1. Set up the database

1. Create a project at [supabase.com](https://supabase.com)
2. Open the SQL Editor, paste in the contents of `supabase_setup.sql`, click Run
3. Go to Project Settings → API and copy your **Project URL** and **publishable (anon) key**

## 2. Install the Supabase CLI

This is the tool used to deploy Edge Functions. In a terminal:

```bash
npm install -g supabase
```

## 3. Log in and link your project

```bash
supabase login
```

This opens your browser to authorize. Then, inside the project folder:

```bash
supabase link --project-ref YOUR_PROJECT_REF
```

Your project ref is the part of your Supabase URL before `.supabase.co`
(e.g. if your URL is `https://abcdefgh.supabase.co`, the ref is `abcdefgh`).

## 4. Deploy the Edge Functions

```bash
supabase functions deploy bookings
supabase functions deploy bookings-delete
```

Each command prints a URL when done — something like:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/bookings
```

## 5. Set up the frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local`:
```
NEXT_PUBLIC_API_URL=https://YOUR_PROJECT_REF.supabase.co/functions/v1
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

Run it locally:
```bash
npm run dev
```

Open `http://localhost:3000` — it now talks to your live Edge Functions
even while running locally, since the functions are already deployed on
Supabase.

## 6. Deploy the frontend to Vercel

1. Push the `frontend` folder (or the whole repo) to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo
   - If your repo has both `frontend` and `supabase` folders, set the
     Vercel project's **Root Directory** to `frontend`
3. Add the same two environment variables in Vercel's project settings
4. Deploy

## Notes

- No login/signup, per the task requirements.
- Double-booking is prevented twice: a check inside the Edge Function before
  saving, and a `unique` database constraint as a backup.
- Edge Functions require the `Authorization: Bearer <anon key>` header on
  every request — the frontend code already includes this.
