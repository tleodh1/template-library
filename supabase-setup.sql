insert into storage.buckets (id, name, public, file_size_limit)
values ('templates', 'templates', true, 52428800)
on conflict (id) do update set public = true, file_size_limit = 52428800;

create policy "templates_public_read"
on storage.objects for select
using (bucket_id = 'templates');

create policy "templates_auth_insert"
on storage.objects for insert to authenticated
with check (bucket_id = 'templates');

create policy "templates_auth_update"
on storage.objects for update to authenticated
using (bucket_id = 'templates')
with check (bucket_id = 'templates');

create policy "templates_auth_delete"
on storage.objects for delete to authenticated
using (bucket_id = 'templates');