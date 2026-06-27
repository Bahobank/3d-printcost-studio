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
