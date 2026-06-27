# 3D PrintCost Studio Handoff

## What This Project Is

3D PrintCost Studio is a SaaS web app for managing 3D printing business workflows: cost calculation, material/printer stock, job history, profit dashboards, trial/subscription access, billing, wallet top-ups, promo/access codes, and Stripe payments.

The main application lives in `saas/` and is built with Next.js App Router, React, TypeScript, Tailwind CSS, Supabase, and Stripe.

## Main Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth and database
- Stripe Checkout, Billing, PromptPay, webhooks, and Wallet top-ups
- Vercel deployment

## Important Folders

- `saas/src/app/` - Next.js routes, pages, and API routes
- `saas/src/components/` - shared React components and pricing/payment UI
- `saas/src/lib/` - auth, billing, wallet, promo, Supabase, Stripe helpers
- `saas/supabase/migrations/` - database schema migrations
- `saas/public/` - static assets
- `outputs/` - legacy/static exported calculator assets

## Payment Notes

- Card payments use Stripe Checkout subscription mode.
- PromptPay uses Stripe Checkout one-time payment mode only.
- PromptPay must use `mode: "payment"`, `currency: "thb"`, and `payment_method_types: ["promptpay"]`.
- The frontend must never mark payments as successful by itself.
- Fulfillment happens in `saas/src/app/api/stripe/webhook/route.ts`.
- Production blocks Stripe test keys so real users are not sent to Stripe test payment pages.
- To accept real payments, Vercel Production must use live Stripe keys and live webhook secrets.

## Environment Variables

Copy `saas/.env.example` to `saas/.env.local` for local development.

Required production variables:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_MAKER_MONTHLY`
- `STRIPE_PRICE_MAKER_YEARLY`
- `STRIPE_PRICE_STUDIO_MONTHLY`
- `STRIPE_PRICE_STUDIO_YEARLY`

Do not commit `.env`, `.env.local`, or `.env.*.local`.

## Local Setup

```bash
cd saas
npm install
npm run dev
```

Build check:

```bash
cd saas
npm run build
```

## Current Deployment

Production domain:

```text
https://3dprintcost.studio
```

Vercel project:

```text
baho-studio/saas
```

