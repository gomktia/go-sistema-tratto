-- ==============================================================================
-- Storage Policies Script (RLS)
-- Use this in the Supabase SQL Editor to automatically configure all buckets.
-- ==============================================================================

-- 1. Enable RLS on the storage.objects table (Standard Security Practice)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- BUCKET: IMAGES (Public Read, Authenticated Write)
-- ==============================================================================

-- Policy: Anyone can view images (Public Read)
CREATE POLICY "Public Access to Images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

-- Policy: Only Authenticated users can upload images
CREATE POLICY "Authenticated Users can Upload Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'images' );

-- Policy: Only Authenticated users can update/delete images
CREATE POLICY "Authenticated Users can Edit Images"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'images' );

CREATE POLICY "Authenticated Users can Delete Images"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'images' );


-- ==============================================================================
-- BUCKET: DOCUMENTS (Private, Tenant Scoped)
-- Assumes structure: documents/TENANT_ID/filename.ext
-- ==============================================================================

-- Helper function to extract tenant_id from path (e.g., 'tenant_id/file.pdf')
-- Checks if the user belongs to that tenant in tenant_users table
CREATE OR REPLACE FUNCTION public.check_user_tenant_access(folder_name text)
RETURNS boolean AS $$
BEGIN
  -- If folder_name is not a valid UUID, deny access (security check)
  IF folder_name !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN false;
  END IF;

  RETURN EXISTS (
    SELECT 1 
    FROM public.tenant_users 
    WHERE user_id = auth.uid() 
    AND tenant_id = folder_name::uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy: Tenant Access for Documents (Select, Insert, Update, Delete)
CREATE POLICY "Tenant Access to Documents"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'documents' 
  AND public.check_user_tenant_access((storage.foldername(name))[1])
)
WITH CHECK (
  bucket_id = 'documents' 
  AND public.check_user_tenant_access((storage.foldername(name))[1])
);


-- ==============================================================================
-- BUCKET: ATTACHMENTS (Private, Tenant Scoped)
-- Assumes structure: attachments/TENANT_ID/filename.ext
-- ==============================================================================

-- Policy: Tenant Access for Attachments (Select, Insert, Update, Delete)
CREATE POLICY "Tenant Access to Attachments"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'attachments' 
  AND public.check_user_tenant_access((storage.foldername(name))[1])
)
WITH CHECK (
  bucket_id = 'attachments' 
  AND public.check_user_tenant_access((storage.foldername(name))[1])
);
