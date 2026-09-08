-- Messages customers send from inside the app. A locked-out customer has no other
-- way to reach us, so these must land somewhere durable even if email delivery is
-- not configured yet.

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  email text,                                  -- copied at send time; survives account deletion
  sender_name text,
  subject text not null,
  body text not null,
  subscription_status text,                    -- what the customer saw when they wrote in
  subscription_plan text,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_support_messages_created
  on public.support_messages (handled, created_at desc);

alter table public.support_messages enable row level security;

-- Only the server (service_role) touches this table; customers never read it back.
revoke all on public.support_messages from anon, authenticated;
grant all on public.support_messages to service_role;

-- for a table created before the contact form gained its name field
alter table public.support_messages add column if not exists sender_name text;
