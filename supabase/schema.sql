-- Enable UUIDs
create extension if not exists "uuid-ossp";

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  title text,
  type text check (type in ('mosaic','voxel')) default 'mosaic',
  settings jsonb,
  bom jsonb,
  est_price numeric,
  thumb_url text,
  is_public boolean default false,
  created_at timestamp with time zone default now()
);

-- RLS
alter table public.projects enable row level security;
create policy "allow read public" on public.projects
  for select using (is_public = true or auth.uid() = user_id);
create policy "owner write" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
