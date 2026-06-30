-- In-app announcements: show a one-time popup to a specific user (by email) or to
-- everyone (target_email null) when they open the app. Each user dismisses
-- independently, and dismissals are stored server-side so a popup never reappears
-- on any device once acknowledged.
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  target_email text,                       -- null = ทุกคน, มีค่า = เฉพาะอีเมลนี้
  title text not null,
  body text not null,
  image_url text,
  cta_label text,
  cta_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_announcements_active
  on public.announcements (is_active, created_at desc);
create index if not exists idx_announcements_target_email
  on public.announcements (lower(target_email));

create table if not exists public.announcement_dismissals (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  dismissed_at timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

alter table public.announcements enable row level security;
alter table public.announcement_dismissals enable row level security;

-- Readers: any authenticated user may read active announcements addressed to them
-- (or to everyone). Server routes use the service_role key and bypass RLS anyway.
drop policy if exists "Read announcements for me" on public.announcements;
create policy "Read announcements for me" on public.announcements
  for select to authenticated
  using (
    is_active
    and (
      target_email is null
      or lower(target_email) = lower((select auth.jwt() ->> 'email'))
    )
  );

drop policy if exists "Manage own dismissals" on public.announcement_dismissals;
create policy "Manage own dismissals" on public.announcement_dismissals
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant all on public.announcements to anon, authenticated, service_role;
grant all on public.announcement_dismissals to anon, authenticated, service_role;

notify pgrst, 'reload schema';
