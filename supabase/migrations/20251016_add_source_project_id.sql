-- Optional lineage for remixes
alter table public.projects add column if not exists source_project_id uuid null;
create index if not exists idx_projects_source_project_id on public.projects(source_project_id);
