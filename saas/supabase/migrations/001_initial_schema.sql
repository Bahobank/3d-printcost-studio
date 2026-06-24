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
