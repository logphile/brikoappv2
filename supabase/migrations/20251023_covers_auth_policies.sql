-- Allow public read and authenticated upsert/update for covers bucket
-- Read (anon) policy may already exist; include IF NOT EXISTS where supported
create policy if not exists "public read covers"
  on storage.objects for select
  to anon
  using (bucket_id = 'covers');

create policy if not exists "auth upsert covers"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'covers');

create policy if not exists "auth update covers"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'covers');
