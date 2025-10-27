-- Subscriptions table for newsletter signups
create extension if not exists citext;
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  created_at timestamptz not null default now(),
  ip inet,
  user_id uuid
);

-- Unique index for email (guards dup signups)
create unique index if not exists subscriptions_email_key on public.subscriptions (email);

-- RLS: service role can do anything; anon blocked
alter table public.subscriptions enable row level security;

drop policy if exists "server can do anything" on public.subscriptions;
create policy "server can do anything"
  on public.subscriptions
  as permissive
  for all
  to service_role
  using (true)
  with check (true);
