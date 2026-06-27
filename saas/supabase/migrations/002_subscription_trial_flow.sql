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
