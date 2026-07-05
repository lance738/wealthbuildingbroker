# WBB Platform — Phases 2–3 Scaffold

Next.js + Supabase app implementing the Integrated Product Architecture:
one shared scoring engine powering the free Scorecard, the paid Dashboard ($49/mo),
and Boomerang ($149/mo) as a connected FastAPI service.

## What's here

| Path | Purpose |
|---|---|
| `lib/scoring/` | **The shared scoring engine.** Same 12 questions/logic as the static-site scorecard. One source of truth for free + paid tiers. |
| `app/scorecard/` | Free public scorecard route (no auth) — writes lead to Supabase, emails report via Resend |
| `app/api/leads/` | POST endpoint: saves lead + score snapshot, triggers report email |
| `app/api/webhooks/stripe/` | Stripe webhook → updates `entitlements` table (dashboard / boomerang tiers) |
| `app/api/boomerang/` | Proxy to the FastAPI Boomerang service (keep it separate until it earns a merge) |
| `supabase/migrations/001_init.sql` | Tables: `leads`, `score_snapshots`, `entitlements`, `purchases` |

## Setup

1. `npm install`
2. Copy `.env.example` → `.env.local`, fill in Supabase, Stripe, Resend keys
3. Run the migration in the Supabase SQL editor (or `supabase db push`)
4. In Stripe: create products — Toolkit $197 one-time, Dashboard $49/mo, Boomerang $149/mo — and point a webhook at `/api/webhooks/stripe` (events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`)
5. `npm run dev`

## Build sequence (from the architecture doc)

- **Phase 2 (weeks 3–8):** Dashboard on the client portal, gated by `entitlements`. The scoring engine here replaces the inline JS in the static scorecard — same numbers, persistent.
- **Phase 3 (weeks 8+):** Boomerang stays a separate FastAPI service; the portal reads it via `/api/boomerang`. Merge only once it's converting.
- **Sequencing rule:** never build the next tier until the current one is converting.
