-- Week-3 schema: auth profiles, projects, mosaics, tilings, assets with RLS and RPC
-- Enable gen_random_uuid
create extension if not exists pgcrypto;

-- Profiles (optional, linked to Supabase auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

-- Core project
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  owner uuid references auth.users not null,
  title text not null,
  slug text unique not null,
  share_token text unique,
  is_public boolean default false,
  width int not null,
  height int not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Minimal persisted artifacts
create table if not exists public.mosaics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  palette_version text default 'mvp',
  -- MVP: use jsonb to store Uint16 grid indices (array) for simplicity in client inserts
  grid jsonb not null,
  created_at timestamptz default now()
);

create table if not exists public.tilings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  bricks jsonb not null,
  bom jsonb not null,
  est_total numeric not null,
  created_at timestamptz default now()
);

-- Public assets metadata (files live in Supabase Storage bucket 'public')
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade not null,
  kind text check (kind in ('preview_png','build_pdf','avatar_png')) not null,
  storage_path text not null,
  created_at timestamptz default now()
);

-- RLS enable
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.mosaics enable row level security;
alter table public.tilings enable row level security;
alter table public.assets enable row level security;

-- Profiles: self-access only
create policy if not exists profiles_self_rw on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Projects: owner-only R/W
create policy if not exists projects_owner_rw on public.projects
  for all using (owner = auth.uid()) with check (owner = auth.uid());

-- Mosaics/Tilings/Assets: follow parent project ownership
create policy if not exists mosaics_owner_rw on public.mosaics
  for all using (exists(select 1 from public.projects p where p.id=project_id and p.owner=auth.uid()))
  with check (exists(select 1 from public.projects p where p.id=project_id and p.owner=auth.uid()));

create policy if not exists tilings_owner_rw on public.tilings
  for all using (exists(select 1 from public.projects p where p.id=project_id and p.owner=auth.uid()))
  with check (exists(select 1 from public.projects p where p.id=project_id and p.owner=auth.uid()));

create policy if not exists assets_owner_rw on public.assets
  for all using (exists(select 1 from public.projects p where p.id=project_id and p.owner=auth.uid()))
  with check (exists(select 1 from public.projects p where p.id=project_id and p.owner=auth.uid()));

-- Public RPC for shared view (no auth)
create or replace function public.project_public_view(p_share_token text)
returns table (
  project jsonb,
  tiling jsonb,
  assets jsonb
)
language plpgsql
security definer
as $$
begin
  return query
  with proj as (
    select p.* from public.projects p where p.share_token = p_share_token and p.is_public = true
  )
  select
    to_jsonb(proj.*),
    (select to_jsonb(t.*) from public.tilings t where t.project_id = proj.id order by created_at desc limit 1),
    (select jsonb_agg(a.*) from public.assets a where a.project_id = proj.id)
  from proj;
end;
$$;
-- Allow unauthenticated users to call the share RPC
grant execute on function public.project_public_view(text) to anon;
