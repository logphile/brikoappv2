-- Schema
create schema if not exists analytics;

-- Raw events
create table if not exists analytics.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete set null,
  event       text not null,
  path        text,
  ref         text,
  project_id  uuid,
  props       jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

-- Indexes for speed
create index if not exists analytics_events_created_at on analytics.events (created_at desc);
create index if not exists analytics_events_event       on analytics.events (event);
create index if not exists analytics_events_ref         on analytics.events (ref);

-- RLS
alter table analytics.events enable row level security;

-- Allow anyone (anon or authenticated) to INSERT analytics (keeps client simple)
 do $$
 begin
   if not exists (
     select 1 from pg_policies
     where schemaname='analytics' and tablename='events' and policyname='events_insert_any'
   ) then
     execute $DDL$
       create policy "events_insert_any"
       on analytics.events for insert
       to anon, authenticated
       with check (true);
     $DDL$;
   end if;
 end $$;

-- Views for quick dashboard queries

-- 1) Daily event counts (last 30 days)
create or replace view analytics.daily_counts as
select
  date_trunc('day', created_at)::date as day,
  event,
  count(*) as n
from analytics.events
where created_at >= now() - interval '30 days'
group by 1, 2
order by 1 desc, 2;

-- 2) KPIs for last 7 days
create or replace view analytics.kpis_7d as
with w as (
  select *
  from analytics.events
  where created_at >= now() - interval '7 days'
)
select
  (select count(*) from w where event = 'upload_start')        as uploads_7d,
  (select count(*) from w where event = 'mosaic_generated')    as mosaics_7d,
  (select count(*) from w where event = 'save_project')        as saves_7d,
  (select count(*) from w where event = 'export_pdf')          as pdf_7d,
  (select count(*) from w where event = 'export_png')          as png_7d,
  (select count(*) from w where event = 'export_csv')          as csv_7d,
  (select count(*) from w where event = 'share_click')         as shares_7d;
