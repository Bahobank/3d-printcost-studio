-- Single-tier referral: store each user's referral code, who referred them, and
-- whether their referrer has already been credited (credit once on first payment).
alter table public.user_profiles
  add column if not exists referral_code text,
  add column if not exists referred_by uuid references auth.users(id) on delete set null,
  add column if not exists referral_credited boolean not null default false;

create unique index if not exists user_profiles_referral_code_key on public.user_profiles (upper(referral_code));
create index if not exists user_profiles_referred_by_idx on public.user_profiles (referred_by);

notify pgrst, 'reload schema';
