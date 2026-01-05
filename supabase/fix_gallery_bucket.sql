-- Helper to create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO UPDATE
SET public = true;

-- Ensure RLS is enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- DROP existing policies to avoid conflicts/duplication during re-run
DROP POLICY IF EXISTS "Public Access to Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can Upload Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can Edit Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Users can Delete Images" ON storage.objects;

-- Re-create Policies
CREATE POLICY "Public Access to Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

CREATE POLICY "Authenticated Users can Upload Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

CREATE POLICY "Authenticated Users can Edit Images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'images' );

CREATE POLICY "Authenticated Users can Delete Images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'images' );
