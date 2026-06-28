-- =============================================================================
-- Migration: RLS Tenant Isolation — services e service_categories
-- =============================================================================
-- Remove as policies piloto abertas (anon USING true) e substitui por isolamento
-- real por tenant_id extraído do JWT do usuário autenticado.
--
-- Mesma arquitetura aplicada em products/product_categories:
--   • Admins/employees fazem login via Supabase Auth → role 'authenticated'
--   • JWT.user_metadata.tenant_id = UUID do tenant do usuário
--   • JWT.user_metadata.role = 'company_admin' | 'employee' | 'super_admin'
--   • super_admin tem acesso a todos os tenants
--   • Clientes usam auth customizada (bcrypt) → permanecem 'anon'
--     e NÃO devem acessar serviços do admin diretamente.
-- =============================================================================

-- ─── services ────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "pilot_all_services" ON services;

-- Leitura: autenticado vê apenas o próprio tenant (ou super_admin vê tudo)
CREATE POLICY "services_select_tenant" ON services
  FOR SELECT TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Insert: só pode inserir serviço no próprio tenant
CREATE POLICY "services_insert_tenant" ON services
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Update: só pode alterar serviço do próprio tenant
CREATE POLICY "services_update_tenant" ON services
  FOR UPDATE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  )
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Delete: só pode remover serviço do próprio tenant
CREATE POLICY "services_delete_tenant" ON services
  FOR DELETE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- ─── service_categories ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS "pilot_all_service_categories" ON service_categories;

CREATE POLICY "service_categories_select_tenant" ON service_categories
  FOR SELECT TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

CREATE POLICY "service_categories_insert_tenant" ON service_categories
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

CREATE POLICY "service_categories_update_tenant" ON service_categories
  FOR UPDATE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  )
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

CREATE POLICY "service_categories_delete_tenant" ON service_categories
  FOR DELETE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- =============================================================================
-- Verificação após aplicar:
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE tablename IN ('services', 'service_categories');
--
-- Validação de cross-tenant (não deve retornar nada de outro tenant):
--   SELECT * FROM services WHERE tenant_id != '<meu_tenant_id>';
-- =============================================================================
