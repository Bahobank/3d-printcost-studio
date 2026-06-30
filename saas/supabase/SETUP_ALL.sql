-- 3D PrintCost Studio — combined database setup
-- Run this once in Supabase Dashboard -> SQL Editor. Safe to re-run (idempotent).

-- ===== 001_initial_schema.sql =====
create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  auth_provider text,
  trial_start_at timestamptz not null default now(),
  trial_end_at timestamptz not null default (now() + interval '7 days'),
  subscription_status text not null default 'trialing'
    check (subscription_status in ('trialing', 'active', 'past_due', 'canceled', 'expired', 'unpaid', 'incomplete', 'incomplete_expired', 'paused')),
  subscription_plan text check (subscription_plan in ('monthly', 'yearly')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  id text primary key,
  type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

create index if not exists user_profiles_subscription_status_idx on public.user_profiles(subscription_status);
create index if not exists user_profiles_stripe_customer_id_idx on public.user_profiles(stripe_customer_id);
create index if not exists user_profiles_stripe_subscription_id_idx on public.user_profiles(stripe_subscription_id);

create table if not exists public.printer_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  printer_type text not null check (printer_type in ('fdm', 'resin')),
  brand text not null,
  model text not null,
  avg_watt numeric default 0,
  max_watt numeric default 0,
  depreciation_percent numeric default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.material_stocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  material_category text not null check (material_category in ('filament', 'resin')),
  brand text,
  product_name text,
  material_type text,
  color_name text,
  finish_type text,
  color_hex text,
  initial_amount numeric not null default 0,
  remaining_amount numeric not null default 0,
  unit text not null default 'g',
  total_cost numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.print_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  printer_id uuid references public.printer_profiles(id) on delete set null,
  job_name text not null,
  job_status text not null default 'sale' check (job_status in ('sale', 'personal', 'failed')),
  produced_at date not null default current_date,
  hours integer not null default 0,
  minutes integer not null default 0,
  electricity_cost numeric not null default 0,
  machine_cost numeric not null default 0,
  labor_cost numeric not null default 0,
  other_cost numeric not null default 0,
  total_cost numeric not null default 0,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.print_job_materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  print_job_id uuid not null references public.print_jobs(id) on delete cascade,
  material_stock_id uuid references public.material_stocks(id) on delete set null,
  amount_used numeric not null default 0,
  unit text not null default 'g',
  cost numeric not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_name text not null,
  order_date date not null default current_date,
  image_url text,
  other_cost numeric not null default 0,
  sale_price numeric not null default 0,
  total_cost numeric not null default 0,
  profit numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  print_job_id uuid not null references public.print_jobs(id) on delete restrict,
  include_failed_cost boolean not null default false,
  created_at timestamptz not null default now(),
  unique(order_id, print_job_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_profiles_updated_at on public.user_profiles;
create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_printer_profiles_updated_at on public.printer_profiles;
create trigger set_printer_profiles_updated_at before update on public.printer_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_material_stocks_updated_at on public.material_stocks;
create trigger set_material_stocks_updated_at before update on public.material_stocks
for each row execute function public.set_updated_at();

drop trigger if exists set_print_jobs_updated_at on public.print_jobs;
create trigger set_print_jobs_updated_at before update on public.print_jobs
for each row execute function public.set_updated_at();

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    user_id,
    email,
    display_name,
    avatar_url,
    auth_provider,
    trial_start_at,
    trial_end_at,
    subscription_status
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_app_meta_data ->> 'provider', 'email'),
    now(),
    now() + interval '7 days',
    'trialing'
  )
  on conflict (user_id) do update
  set
    email = excluded.email,
    display_name = coalesce(public.user_profiles.display_name, excluded.display_name),
    avatar_url = coalesce(public.user_profiles.avatar_url, excluded.avatar_url),
    auth_provider = coalesce(public.user_profiles.auth_provider, excluded.auth_provider);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user_profile();

alter table public.user_profiles enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.printer_profiles enable row level security;
alter table public.material_stocks enable row level security;
alter table public.print_jobs enable row level security;
alter table public.print_job_materials enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Users can read own profile" on public.user_profiles;
create policy "Users can read own profile"
on public.user_profiles for select
to authenticated
using (auth.uid() = user_id);

revoke all on public.stripe_webhook_events from anon, authenticated;

drop policy if exists "Users can manage own printers" on public.printer_profiles;
create policy "Users can manage own printers" on public.printer_profiles
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own materials" on public.material_stocks;
create policy "Users can manage own materials" on public.material_stocks
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own print jobs" on public.print_jobs;
create policy "Users can manage own print jobs" on public.print_jobs
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own print job materials" on public.print_job_materials;
create policy "Users can manage own print job materials" on public.print_job_materials
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own orders" on public.orders;
create policy "Users can manage own orders" on public.orders
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can manage own order items" on public.order_items;
create policy "Users can manage own order items" on public.order_items
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===== 002_subscription_trial_flow.sql =====
alter table public.user_profiles
  add column if not exists billing_cycle text,
  add column if not exists subscription_started_at timestamptz,
  add column if not exists subscription_ends_at timestamptz;

alter table public.user_profiles
  drop constraint if exists user_profiles_subscription_status_check;

alter table public.user_profiles
  add constraint user_profiles_subscription_status_check
  check (subscription_status in ('trialing', 'active', 'expired', 'canceled', 'past_due'));

alter table public.user_profiles
  drop constraint if exists user_profiles_subscription_plan_check;

alter table public.user_profiles
  add constraint user_profiles_subscription_plan_check
  check (subscription_plan is null or subscription_plan in ('maker', 'studio'));

alter table public.user_profiles
  drop constraint if exists user_profiles_billing_cycle_check;

alter table public.user_profiles
  add constraint user_profiles_billing_cycle_check
  check (billing_cycle is null or billing_cycle in ('monthly', 'yearly'));

create index if not exists user_profiles_billing_cycle_idx on public.user_profiles(billing_cycle);
create index if not exists user_profiles_subscription_plan_idx on public.user_profiles(subscription_plan);

-- ===== 003_profile_account_fields.sql =====
alter table public.user_profiles
  add column if not exists phone text,
  add column if not exists business_name text,
  add column if not exists job_title text,
  add column if not exists country_region text;

drop policy if exists "Users can update own profile" on public.user_profiles;
create policy "Users can update own profile"
on public.user_profiles for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

-- ===== 005_wallet_promo_codes.sql =====
alter table public.user_profiles
  add column if not exists subscription_payment_source text;

alter table public.user_profiles
  drop constraint if exists user_profiles_subscription_payment_source_check;

alter table public.user_profiles
  add constraint user_profiles_subscription_payment_source_check
  check (subscription_payment_source is null or subscription_payment_source in ('stripe_subscription', 'stripe_promptpay', 'wallet', 'access_code'));

create index if not exists user_profiles_subscription_payment_source_idx on public.user_profiles(subscription_payment_source);

create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  currency text not null default 'thb' check (currency = 'thb'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('topup', 'subscription_payment', 'subscription_renewal', 'refund', 'adjustment')),
  amount integer not null check (amount > 0),
  balance_before integer not null check (balance_before >= 0),
  balance_after integer not null check (balance_after >= 0),
  stripe_payment_intent text,
  stripe_charge_id text,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  type text not null check (type in ('discount', 'access')),
  discount_type text check (discount_type is null or discount_type in ('percent', 'fixed')),
  discount_value integer check (discount_value is null or discount_value >= 0),
  stripe_coupon_id text,
  access_months integer check (access_months is null or access_months > 0),
  access_lifetime boolean not null default false,
  allowed_plans text[] check (allowed_plans is null or allowed_plans <@ array['maker', 'studio']::text[]),
  allowed_cycles text[] check (allowed_cycles is null or allowed_cycles <@ array['monthly', 'yearly']::text[]),
  max_redemptions integer check (max_redemptions is null or max_redemptions > 0),
  redemption_count integer not null default 0 check (redemption_count >= 0),
  expires_at timestamptz,
  is_active boolean not null default true,
  owner_name text,
  owner_type text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists promo_codes_code_upper_idx on public.promo_codes (upper(code));

create table if not exists public.promo_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid not null references public.promo_codes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id text,
  redeemed_at timestamptz not null default now(),
  access_starts_at timestamptz,
  access_ends_at timestamptz
);

create index if not exists wallets_user_id_idx on public.wallets(user_id);
create index if not exists wallet_transactions_user_id_idx on public.wallet_transactions(user_id);
create index if not exists wallet_transactions_wallet_id_idx on public.wallet_transactions(wallet_id);
create index if not exists promo_redemptions_user_id_idx on public.promo_redemptions(user_id);
create index if not exists promo_redemptions_code_id_idx on public.promo_redemptions(code_id);

drop trigger if exists set_wallets_updated_at on public.wallets;
create trigger set_wallets_updated_at
before update on public.wallets
for each row execute function public.set_updated_at();

drop trigger if exists set_promo_codes_updated_at on public.promo_codes;
create trigger set_promo_codes_updated_at
before update on public.promo_codes
for each row execute function public.set_updated_at();

alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.promo_codes enable row level security;
alter table public.promo_redemptions enable row level security;

revoke all on public.promo_codes from anon, authenticated;

drop policy if exists "Users can read own wallet" on public.wallets;
create policy "Users can read own wallet"
on public.wallets for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own wallet transactions" on public.wallet_transactions;
create policy "Users can read own wallet transactions"
on public.wallet_transactions for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can read own promo redemptions" on public.promo_redemptions;
create policy "Users can read own promo redemptions"
on public.promo_redemptions for select
to authenticated
using ((select auth.uid()) = user_id);


-- ===== role grants (required so the service_role webhook can write) =====
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
revoke all on public.stripe_webhook_events from anon, authenticated;
revoke all on public.promo_codes from anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
notify pgrst, 'reload schema';

-- ===== 006_referral.sql =====
alter table public.user_profiles
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references auth.users(id) on delete set null,
  add column if not exists referral_credited boolean not null default false;
create unique index if not exists user_profiles_referral_code_key on public.user_profiles (upper(referral_code));
create index if not exists user_profiles_referred_by_idx on public.user_profiles (referred_by);
grant all on all tables in schema public to anon, authenticated, service_role;
notify pgrst, 'reload schema';

-- ===== 007_app_state.sql =====
create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  device_updated_at timestamptz,
  updated_at timestamptz not null default now()
);
alter table public.app_state enable row level security;
drop policy if exists "Users manage own app state" on public.app_state;
create policy "Users manage own app state" on public.app_state
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop trigger if exists set_app_state_updated_at on public.app_state;
create trigger set_app_state_updated_at before update on public.app_state
  for each row execute function public.set_updated_at();
grant all on public.app_state to anon, authenticated, service_role;

-- ===== 008_announcements.sql =====
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  target_email text,
  title text not null,
  body text not null,
  image_url text,
  cta_label text,
  cta_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_announcements_active on public.announcements (is_active, created_at desc);
create index if not exists idx_announcements_target_email on public.announcements (lower(target_email));
create table if not exists public.announcement_dismissals (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  dismissed_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);
alter table public.announcements enable row level security;
alter table public.announcement_dismissals enable row level security;
drop policy if exists "Read announcements for me" on public.announcements;
create policy "Read announcements for me" on public.announcements
  for select to authenticated
  using (is_active and (target_email is null or lower(target_email) = lower((select auth.jwt() ->> 'email'))));
drop policy if exists "Manage own dismissals" on public.announcement_dismissals;
create policy "Manage own dismissals" on public.announcement_dismissals
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant all on public.announcements to anon, authenticated, service_role;
grant all on public.announcement_dismissals to anon, authenticated, service_role;

notify pgrst, 'reload schema';
