insert into storage.buckets (id, name, public, file_size_limit)
values ('templates', 'templates', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;

drop policy if exists "templates_public_read" on storage.objects;
drop policy if exists "templates_anon_insert" on storage.objects;
drop policy if exists "templates_anon_update" on storage.objects;
drop policy if exists "templates_anon_delete" on storage.objects;
drop policy if exists "templates_auth_insert" on storage.objects;
drop policy if exists "templates_auth_update" on storage.objects;
drop policy if exists "templates_auth_delete" on storage.objects;
drop policy if exists "templates_admin_insert" on storage.objects;
drop policy if exists "templates_admin_update" on storage.objects;
drop policy if exists "templates_admin_delete" on storage.objects;

create policy "templates_public_read" on storage.objects
for select to public using (bucket_id = 'templates');

create policy "templates_admin_insert" on storage.objects
for insert to authenticated
with check (bucket_id = 'templates' and auth.uid() is not null
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "templates_admin_update" on storage.objects
for update to authenticated
using (bucket_id = 'templates' and auth.uid() is not null
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
with check (bucket_id = 'templates' and auth.uid() is not null
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create policy "templates_admin_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'templates' and auth.uid() is not null
  and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
