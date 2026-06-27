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
