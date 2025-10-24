-- Feedback + Subscribers minimal tables with permissive INSERT policies
-- Create feedback table
create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  email text null,
  message text not null,
  created_at timestamptz default now()
);

-- Create subscribers table (email unique)
create table if not exists public.subscribers (
  email text primary key,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.feedback enable row level security;
alter table public.subscribers enable row level security;

-- Allow anon + authenticated to INSERT feedback (no SELECT by default)
create policy if not exists feedback_insert_anon
  on public.feedback for insert
  to anon
  with check (true);

create policy if not exists feedback_insert_auth
  on public.feedback for insert
  to authenticated
  with check (true);

-- Allow anon + authenticated to upsert subscribers by email (no SELECT by default)
create policy if not exists subscribers_insert_anon
  on public.subscribers for insert
  to anon
  with check (true);

create policy if not exists subscribers_insert_auth
  on public.subscribers for insert
  to authenticated
  with check (true);

create policy if not exists subscribers_update_auth
  on public.subscribers for update
  to authenticated
  using (true)
  with check (true);
