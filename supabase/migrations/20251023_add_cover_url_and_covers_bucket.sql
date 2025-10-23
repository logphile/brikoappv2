-- Add cover_url column for project thumbnails
alter table if exists public.projects
  add column if not exists cover_url text;

-- Ensure public storage bucket 'covers' exists
-- and allow public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'covers'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('covers', 'covers', true);
  END IF;
END $$;

-- Public read policy on storage.objects for covers bucket
create policy if not exists "Public read covers"
  on storage.objects for select
  using (bucket_id = 'covers');
