-- =============================================================================
-- Migration: RLS Tenant Isolation — products e product_categories
-- =============================================================================
-- Remove a policy piloto aberta (anon USING true) e substitui por isolamento
-- real por tenant_id extraído do JWT do usuário autenticado.
--
-- Premissas de arquitetura (projeto pilot):
--   • Admins/employees fazem login via Supabase Auth → role 'authenticated'
--   • JWT.user_metadata.tenant_id = UUID do tenant do usuário
--   • JWT.user_metadata.role = 'company_admin' | 'employee' | 'super_admin'
--   • super_admin tem acesso a todos os tenants
--   • Clientes usam auth customizada (bcrypt) → permanecem 'anon'
--     e NÃO devem acessar produtos do admin.
-- =============================================================================

-- ─── products ────────────────────────────────────────────────────────────────

-- Remover policy piloto aberta
DROP POLICY IF EXISTS "pilot_all_products" ON products;

-- Leitura: autenticado vê apenas o próprio tenant (ou super_admin vê tudo)
CREATE POLICY "products_select_tenant" ON products
  FOR SELECT TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Insert: só pode inserir produto no próprio tenant
CREATE POLICY "products_insert_tenant" ON products
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Update: só pode alterar produto do próprio tenant
CREATE POLICY "products_update_tenant" ON products
  FOR UPDATE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  )
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Delete: só pode remover produto do próprio tenant
CREATE POLICY "products_delete_tenant" ON products
  FOR DELETE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- ─── product_categories ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS "pilot_all_product_categories" ON product_categories;

CREATE POLICY "product_categories_select_tenant" ON product_categories
  FOR SELECT TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

CREATE POLICY "product_categories_insert_tenant" ON product_categories
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

CREATE POLICY "product_categories_update_tenant" ON product_categories
  FOR UPDATE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  )
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

CREATE POLICY "product_categories_delete_tenant" ON product_categories
  FOR DELETE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- =============================================================================
-- Verificação após aplicar:
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE tablename IN ('products', 'product_categories');
--
-- Validação de cross-tenant (não deve retornar nada de outro tenant):
--   SELECT * FROM products WHERE tenant_id != '<meu_tenant_id>';
-- =============================================================================
