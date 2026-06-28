-- =============================================================================
-- Migration: RLS Tenant Isolation — appointments e appointment_commissions
-- =============================================================================
-- Remove as policies piloto abertas (anon USING true) e substitui por isolamento
-- real por tenant_id extraído do JWT do usuário autenticado.
--
-- Mesma arquitetura aplicada em products/services:
--   - Admins/employees fazem login via Supabase Auth -> role 'authenticated'
--   - JWT.user_metadata.tenant_id = UUID do tenant do usuário
--   - JWT.user_metadata.role = 'company_admin' | 'employee' | 'super_admin'
--   - super_admin tem acesso a todos os tenants
--   - Clientes usam auth customizada (bcrypt) -> permanecem 'anon'
--     e NÃO devem acessar agendamentos do admin diretamente.
-- =============================================================================

-- ─── appointments ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "pilot_all_appointments" ON appointments;

-- Leitura: autenticado vê apenas o próprio tenant (ou super_admin vê tudo)
CREATE POLICY "appointments_select_tenant" ON appointments
  FOR SELECT TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Insert: só pode inserir agendamento no próprio tenant
CREATE POLICY "appointments_insert_tenant" ON appointments
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Update: só pode alterar agendamento do próprio tenant
CREATE POLICY "appointments_update_tenant" ON appointments
  FOR UPDATE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  )
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Delete: só pode remover agendamento do próprio tenant
CREATE POLICY "appointments_delete_tenant" ON appointments
  FOR DELETE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- ─── appointment_commissions ────────────────────────────────────────────────

DROP POLICY IF EXISTS "pilot_all_appointment_commissions" ON appointment_commissions;

CREATE POLICY "appointment_commissions_select_tenant" ON appointment_commissions
  FOR SELECT TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

CREATE POLICY "appointment_commissions_insert_tenant" ON appointment_commissions
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

CREATE POLICY "appointment_commissions_update_tenant" ON appointment_commissions
  FOR UPDATE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  )
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

CREATE POLICY "appointment_commissions_delete_tenant" ON appointment_commissions
  FOR DELETE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- =============================================================================
-- Verificação após aplicar:
--   SELECT policyname, cmd, roles FROM pg_policies
--   WHERE tablename IN ('appointments', 'appointment_commissions');
--
-- Validação de cross-tenant (não deve retornar nada de outro tenant):
--   SELECT * FROM appointments WHERE tenant_id != '<meu_tenant_id>';
-- =============================================================================
