-- sthanakhan@gmail.com is the shop's own account, used to hold the shop's own
-- sales. It must never expire.
--
-- Access is decided by subscription_status alone ('active' / 'past_due' pass),
-- so the date only affects what the billing screen displays. The wallet renewal
-- job touches only rows whose payment source is 'wallet', and Stripe only ever
-- cancels rows it owns, so 'access_code' with a far-future end is left alone by
-- everything that runs unattended - the same setup the influencer codes use.
--
-- Run in the Supabase SQL editor. No deploy needed.

update public.user_profiles
set
  subscription_status = 'active',
  subscription_plan = 'studio',
  billing_cycle = 'yearly',
  subscription_started_at = coalesce(subscription_started_at, now()),
  subscription_ends_at = '2099-12-31T23:59:59Z',
  subscription_payment_source = 'access_code',
  stripe_subscription_id = null,
  updated_at = now()
where lower(email) = 'sthanakhan@gmail.com';

-- Should return one row reading active / studio / 2099-12-31.
select email, subscription_status, subscription_plan, billing_cycle,
       subscription_ends_at, subscription_payment_source
from public.user_profiles
where lower(email) = 'sthanakhan@gmail.com';
