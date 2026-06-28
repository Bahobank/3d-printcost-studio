-- Cloud sync: store each user's full app state (jobs, stock, orders, printers,
-- settings) as one JSON document keyed to their account, so switching devices on
-- the same login restores everything. Images live in the browser (IndexedDB) and
-- are not part of this blob.
create table if not exists public.app_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  device_updated_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "Users manage own app state" on public.app_state;
create policy "Users manage own app state" on public.app_state
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop trigger if exists set_app_state_updated_at on public.app_state;
create trigger set_app_state_updated_at before update on public.app_state
  for each row execute function public.set_updated_at();

grant all on public.app_state to anon, authenticated, service_role;

notify pgrst, 'reload schema';
