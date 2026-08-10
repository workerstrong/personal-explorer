-- Phase 2: public profile images with admin-only writes.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('profile-media', 'profile-media', true, 8000000, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set public = true, file_size_limit = 8000000;

drop policy if exists "public reads profile media" on storage.objects;
create policy "public reads profile media" on storage.objects for select to public
using (bucket_id = 'profile-media');

drop policy if exists "admins upload profile media" on storage.objects;
create policy "admins upload profile media" on storage.objects for insert to authenticated
with check (bucket_id = 'profile-media' and public.is_site_admin());

drop policy if exists "admins update profile media" on storage.objects;
create policy "admins update profile media" on storage.objects for update to authenticated
using (bucket_id = 'profile-media' and public.is_site_admin())
with check (bucket_id = 'profile-media' and public.is_site_admin());

drop policy if exists "admins delete profile media" on storage.objects;
create policy "admins delete profile media" on storage.objects for delete to authenticated
using (bucket_id = 'profile-media' and public.is_site_admin());
