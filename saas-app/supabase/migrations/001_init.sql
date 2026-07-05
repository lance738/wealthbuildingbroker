-- WBB Platform — initial schema
-- leads: free scorecard email captures
-- score_snapshots: every scoring event (free quiz + monthly dashboard re-scores)
-- entitlements: what each customer can access (gates Dashboard / Boomerang)
-- purchases: one-time purchases (Toolkit)

create extension if not exists "pgcrypto";

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  source text not null default 'scorecard',        -- scorecard | toolkit-waitlist | dashboard-waitlist | boomerang-application
  created_at timestamptz not null default now()
);

create table if not exists score_snapshots (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade, -- set once they become a Dashboard subscriber
  total int not null check (total between 0 and 100),
  tier text not null,                                        -- at-risk | earning-not-keeping | building-wealth
  pillars jsonb not null,                                    -- {"Structure & Protection": 18, ...}
  answers jsonb,                                             -- raw answer indexes for re-computation
  created_at timestamptz not null default now()
);

create table if not exists entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  product text not null check (product in ('dashboard','boomerang')),
  status text not null default 'active',                     -- active | past_due | canceled
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product)
);

create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  user_id uuid references auth.users(id),
  product text not null default 'toolkit',
  stripe_payment_intent text,
  amount_cents int,
  created_at timestamptz not null default now()
);

-- RLS: users see only their own rows; service role bypasses for webhooks/API
alter table leads enable row level security;
alter table score_snapshots enable row level security;
alter table entitlements enable row level security;
alter table purchases enable row level security;

create policy "own snapshots" on score_snapshots for select using (auth.uid() = user_id);
create policy "own entitlements" on entitlements for select using (auth.uid() = user_id);
create policy "own purchases" on purchases for select using (auth.uid() = user_id);

create index if not exists idx_snapshots_user_created on score_snapshots (user_id, created_at desc);
create index if not exists idx_entitlements_customer on entitlements (stripe_customer_id);
