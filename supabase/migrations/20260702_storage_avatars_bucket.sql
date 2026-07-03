-- Migration: Configurar Storage bucket para avatars de profissionais
-- Bucket com RLS e tenant isolation
--
-- IMPORTANTE: Esta migration assume que usuários autenticados já têm
-- employee records vinculados (employees.user_id = auth.uid()).
-- Se um usuário não tiver employee, não poderá fazer upload de avatars.

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

-- Dropar policies antigas se existirem
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload avatars to their tenant" ON storage.objects;
DROP POLICY IF EXISTS "Users can update avatars in their tenant" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete avatars from their tenant" ON storage.objects;

-- Policy: Permitir leitura pública (bucket é público)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Policy: Permitir upload apenas para usuários autenticados do mesmo tenant
-- Path structure: {tenant_id}/{employee_id}-timestamp.{ext}
-- Lógica: usuário deve ter ao menos 1 employee no tenant do path
CREATE POLICY "Users can upload avatars to their tenant"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars'
    AND EXISTS (
        SELECT 1 FROM employees
        WHERE user_id = auth.uid()
        AND tenant_id = (storage.foldername(name))[1]::uuid
    )
);

-- Policy: Permitir update apenas para usuários autenticados do mesmo tenant
CREATE POLICY "Users can update avatars in their tenant"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND EXISTS (
        SELECT 1 FROM employees
        WHERE user_id = auth.uid()
        AND tenant_id = (storage.foldername(name))[1]::uuid
    )
)
WITH CHECK (
    bucket_id = 'avatars'
    AND EXISTS (
        SELECT 1 FROM employees
        WHERE user_id = auth.uid()
        AND tenant_id = (storage.foldername(name))[1]::uuid
    )
);

-- Policy: Permitir delete apenas para usuários autenticados do mesmo tenant
CREATE POLICY "Users can delete avatars from their tenant"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars'
    AND EXISTS (
        SELECT 1 FROM employees
        WHERE user_id = auth.uid()
        AND tenant_id = (storage.foldername(name))[1]::uuid
    )
);

-- Comentários
COMMENT ON TABLE storage.buckets IS 'Storage buckets configuration with RLS';
