-- Instead of trying to own the table, we'll just create the policies on the storage.objects table
-- which usually belongs to the supabase_storage_admin role.
-- We cannot use ALTER TABLE ENABLE/DISABLE RLS if we don't own it, but USUALLY it is enabled by default.

-- 1. Create the bucket via the storage schema function if possible, or insert into buckets table
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do update set public = true;

-- 2. Drop policies IF they exist (Standard SQL style)
drop policy if exists "Public Access to Images" on storage.objects;
drop policy if exists "Authenticated Users can Upload Images" on storage.objects;
drop policy if exists "Authenticated Users can Edit Images" on storage.objects;
drop policy if exists "Authenticated Users can Delete Images" on storage.objects;

-- 3. Re-create the Policies
create policy "Public Access to Images"
on storage.objects for select
using ( bucket_id = 'images' );

create policy "Authenticated Users can Upload Images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'images' );

create policy "Authenticated Users can Edit Images"
on storage.objects for update
to authenticated
using ( bucket_id = 'images' );

create policy "Authenticated Users can Delete Images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'images' );
