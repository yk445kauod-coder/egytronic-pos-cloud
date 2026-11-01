# Egytronic POS Cloud

Bilingual (Arabic/English, RTL) multi-tenant cloud POS.

**Stack:** Next.js 15 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS + Zustand + Supabase (Postgres, Auth, Realtime, Row Level Security).

## What works now
- Landing page (server-rendered, AR/EN) at `/`
- POS at `/pos`: magic-link login, create a business, add items, cart, discount, VAT, cash/card/wallet, dine-in/takeaway/delivery
- Atomic checkout in Postgres (`checkout()`): stock validated and decremented in one transaction, totals computed server-side
- Realtime stock sync across devices
- RLS isolates every business; only owner/manager can edit items

## Not built yet
Reports screen, receipt printing, customers, refunds, multi-branch, plan limits and billing, offline mode, tests.

## Setup
1. Create a Supabase project. Run `supabase/migrations/0001_init.sql` in the SQL editor.
2. Auth > URL configuration: add your site URL and `<site>/pos` as redirect URLs.
3. `cp .env.example .env.local` and fill the project URL and anon key.
4. `npm install && npm run dev`

## Deploy
Import the repo in Vercel (or Cloudflare Pages) and set the two `NEXT_PUBLIC_*` variables. CI (`.github/workflows/ci.yml`) builds and typechecks on every push.
