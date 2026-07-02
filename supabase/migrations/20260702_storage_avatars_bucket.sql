-- Migration: Configurar Storage bucket para avatars de profissionais
-- Bucket com RLS e tenant isolation

-- Criar bucket 'avatars' se não existir
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,  -- público para permitir visualização sem auth (URLs públicas)
    2097152,  -- 2MB em bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp']  -- tipos permitidos
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Habilitar RLS no bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Permitir leitura pública (bucket é público)
CREATE POLICY IF NOT EXISTS "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Permitir upload apenas para usuários autenticados do mesmo tenant
-- Path structure: {tenant_id}/{employee_id}-timestamp.{ext}
CREATE POLICY IF NOT EXISTS "Users can upload avatars to their tenant"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth_tenant_id()::text
);

-- Policy: Permitir update apenas para usuários autenticados do mesmo tenant
CREATE POLICY IF NOT EXISTS "Users can update avatars in their tenant"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth_tenant_id()::text
)
WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth_tenant_id()::text
);

-- Policy: Permitir delete apenas para usuários autenticados do mesmo tenant
CREATE POLICY IF NOT EXISTS "Users can delete avatars from their tenant"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth_tenant_id()::text
);

-- Comentários
COMMENT ON TABLE storage.buckets IS 'Storage buckets configuration with RLS';
