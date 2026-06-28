-- =============================================================================
-- Migration: RLS com Isolamento Real por Tenant via JWT
-- =============================================================================
-- Estratégia:
--   • company_admin e employee: veem apenas dados do seu tenant
--     (tenant_id lido do user_metadata.tenant_id no JWT)
--   • super_admin: acesso a todos os tenants
--   • anon: SELECT em tabelas públicas (tenants, plans, reviews)
--             SELECT em serviços/profissionais (para página de agendamento público)
--   • service_role: bypass automático de RLS (padrão Supabase)
--
-- Substitui as policies "pilot_*" (anon com USING(true) — permissivo demais).
-- =============================================================================

-- ─── FUNÇÕES HELPER ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION auth_tenant_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT NULLIF(
    (auth.jwt() -> 'user_metadata' ->> 'tenant_id'),
    ''
  )::uuid
$$;

CREATE OR REPLACE FUNCTION auth_is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin',
    false
  )
$$;

-- =============================================================================
-- 1. TABELAS COM tenant_id — isolamento authenticated + super_admin bypass
-- =============================================================================

-- ── appointments ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_appointments" ON appointments;
DROP POLICY IF EXISTS "tenant_isolation_appointments" ON appointments;
CREATE POLICY "tenant_isolation_appointments" ON appointments
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── appointment_commissions ───────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_appointment_commissions" ON appointment_commissions;
DROP POLICY IF EXISTS "tenant_isolation_appointment_commissions" ON appointment_commissions;
CREATE POLICY "tenant_isolation_appointment_commissions" ON appointment_commissions
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── customers ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_customers" ON customers;
DROP POLICY IF EXISTS "tenant_isolation_customers" ON customers;
CREATE POLICY "tenant_isolation_customers" ON customers
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── employees — anon SELECT (para booking público) + authenticated isolado ───
DROP POLICY IF EXISTS "pilot_all_employees" ON employees;
DROP POLICY IF EXISTS "anon_read_employees" ON employees;
DROP POLICY IF EXISTS "tenant_isolation_employees" ON employees;
CREATE POLICY "anon_read_employees" ON employees
  FOR SELECT TO anon
  USING (true);
CREATE POLICY "tenant_isolation_employees" ON employees
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── services — anon SELECT (para booking público) + authenticated isolado ────
DROP POLICY IF EXISTS "pilot_all_services" ON services;
DROP POLICY IF EXISTS "anon_read_services" ON services;
DROP POLICY IF EXISTS "tenant_isolation_services" ON services;
CREATE POLICY "anon_read_services" ON services
  FOR SELECT TO anon
  USING (true);
CREATE POLICY "tenant_isolation_services" ON services
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── service_categories ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_service_categories" ON service_categories;
DROP POLICY IF EXISTS "tenant_isolation_service_categories" ON service_categories;
CREATE POLICY "tenant_isolation_service_categories" ON service_categories
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── staff_availability — anon SELECT (booking) + authenticated isolado ───────
DROP POLICY IF EXISTS "pilot_all_staff_availability" ON staff_availability;
DROP POLICY IF EXISTS "anon_read_staff_availability" ON staff_availability;
DROP POLICY IF EXISTS "tenant_isolation_staff_availability" ON staff_availability;
CREATE POLICY "anon_read_staff_availability" ON staff_availability
  FOR SELECT TO anon
  USING (true);
CREATE POLICY "tenant_isolation_staff_availability" ON staff_availability
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── gallery_images ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_gallery_images" ON gallery_images;
DROP POLICY IF EXISTS "anon_read_gallery_images" ON gallery_images;
DROP POLICY IF EXISTS "tenant_isolation_gallery_images" ON gallery_images;
CREATE POLICY "anon_read_gallery_images" ON gallery_images
  FOR SELECT TO anon USING (true);
CREATE POLICY "tenant_isolation_gallery_images" ON gallery_images
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── highlights ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_highlights" ON highlights;
DROP POLICY IF EXISTS "anon_read_highlights" ON highlights;
DROP POLICY IF EXISTS "tenant_isolation_highlights" ON highlights;
CREATE POLICY "anon_read_highlights" ON highlights
  FOR SELECT TO anon USING (true);
CREATE POLICY "tenant_isolation_highlights" ON highlights
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── products ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_products" ON products;
DROP POLICY IF EXISTS "tenant_isolation_products" ON products;
CREATE POLICY "tenant_isolation_products" ON products
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── product_categories ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_product_categories" ON product_categories;
DROP POLICY IF EXISTS "tenant_isolation_product_categories" ON product_categories;
CREATE POLICY "tenant_isolation_product_categories" ON product_categories
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── inventory_movements ───────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_inventory_movements" ON inventory_movements;
DROP POLICY IF EXISTS "tenant_isolation_inventory_movements" ON inventory_movements;
CREATE POLICY "tenant_isolation_inventory_movements" ON inventory_movements
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── combos ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_combos" ON combos;
DROP POLICY IF EXISTS "tenant_isolation_combos" ON combos;
CREATE POLICY "tenant_isolation_combos" ON combos
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── orders ────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_orders" ON orders;
DROP POLICY IF EXISTS "tenant_isolation_orders" ON orders;
CREATE POLICY "tenant_isolation_orders" ON orders
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── payments ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_payments" ON payments;
DROP POLICY IF EXISTS "tenant_isolation_payments" ON payments;
CREATE POLICY "tenant_isolation_payments" ON payments
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── payouts ───────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_payouts" ON payouts;
DROP POLICY IF EXISTS "tenant_isolation_payouts" ON payouts;
CREATE POLICY "tenant_isolation_payouts" ON payouts
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── invoices ──────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_invoices" ON invoices;
DROP POLICY IF EXISTS "tenant_isolation_invoices" ON invoices;
CREATE POLICY "tenant_isolation_invoices" ON invoices
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── audit_logs ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_audit_logs" ON audit_logs;
DROP POLICY IF EXISTS "tenant_isolation_audit_logs" ON audit_logs;
CREATE POLICY "tenant_isolation_audit_logs" ON audit_logs
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── customer_credentials ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_customer_credentials" ON customer_credentials;
DROP POLICY IF EXISTS "tenant_isolation_customer_credentials" ON customer_credentials;
CREATE POLICY "tenant_isolation_customer_credentials" ON customer_credentials
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());
-- anon pode verificar credenciais para login de clientes
DROP POLICY IF EXISTS "anon_read_customer_credentials" ON customer_credentials;
CREATE POLICY "anon_read_customer_credentials" ON customer_credentials
  FOR SELECT TO anon USING (true);

-- ── customer_events ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_customer_events" ON customer_events;
DROP POLICY IF EXISTS "tenant_isolation_customer_events" ON customer_events;
CREATE POLICY "tenant_isolation_customer_events" ON customer_events
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── customer_tag_assignments ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_customer_tag_assignments" ON customer_tag_assignments;
DROP POLICY IF EXISTS "tenant_isolation_customer_tag_assignments" ON customer_tag_assignments;
CREATE POLICY "tenant_isolation_customer_tag_assignments" ON customer_tag_assignments
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── pos_sessions ──────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_pos_sessions" ON pos_sessions;
DROP POLICY IF EXISTS "tenant_isolation_pos_sessions" ON pos_sessions;
CREATE POLICY "tenant_isolation_pos_sessions" ON pos_sessions
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── revenue_snapshots ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_revenue_snapshots" ON revenue_snapshots;
DROP POLICY IF EXISTS "tenant_isolation_revenue_snapshots" ON revenue_snapshots;
CREATE POLICY "tenant_isolation_revenue_snapshots" ON revenue_snapshots
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- ── daily_closings ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_daily_closings" ON daily_closings;
DROP POLICY IF EXISTS "tenant_isolation_daily_closings" ON daily_closings;
CREATE POLICY "tenant_isolation_daily_closings" ON daily_closings
  FOR ALL TO authenticated
  USING (auth_is_super_admin() OR tenant_id = auth_tenant_id())
  WITH CHECK (auth_is_super_admin() OR tenant_id = auth_tenant_id());

-- =============================================================================
-- 2. TABELAS GLOBAIS (sem tenant_id)
-- =============================================================================

-- ── tenants — SELECT público, write apenas super_admin ───────────────────────
DROP POLICY IF EXISTS "tenants_select_public" ON tenants;
DROP POLICY IF EXISTS "super_admin_write_tenants" ON tenants;
CREATE POLICY "tenants_select_public" ON tenants
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "super_admin_write_tenants" ON tenants
  FOR ALL TO authenticated
  USING (auth_is_super_admin())
  WITH CHECK (auth_is_super_admin());

-- ── plans — apenas SELECT público ────────────────────────────────────────────
DROP POLICY IF EXISTS "plans_select_public" ON plans;
CREATE POLICY "plans_select_public" ON plans
  FOR SELECT TO anon, authenticated USING (true);

-- ── reviews — SELECT público, INSERT por anon (agendamento público) ───────────
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
DROP POLICY IF EXISTS "pilot_insert_reviews" ON reviews;
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_insert_public" ON reviews
  FOR INSERT TO anon WITH CHECK (true);

-- ── app_users — cada usuário vê apenas seu próprio perfil ─────────────────────
DROP POLICY IF EXISTS "pilot_all_app_users" ON app_users;
DROP POLICY IF EXISTS "self_access_app_users" ON app_users;
CREATE POLICY "self_access_app_users" ON app_users
  FOR ALL TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
CREATE POLICY "super_admin_all_app_users" ON app_users
  FOR ALL TO authenticated
  USING (auth_is_super_admin())
  WITH CHECK (auth_is_super_admin());

-- =============================================================================
-- 3. TABELAS JUNCTION (sem tenant_id direto — isolamento via subquery)
-- =============================================================================

-- ── appointment_logs ─────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_appointment_logs" ON appointment_logs;
DROP POLICY IF EXISTS "tenant_isolation_appointment_logs" ON appointment_logs;
CREATE POLICY "tenant_isolation_appointment_logs" ON appointment_logs
  FOR ALL TO authenticated
  USING (
    auth_is_super_admin() OR
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_id AND a.tenant_id = auth_tenant_id()
    )
  )
  WITH CHECK (
    auth_is_super_admin() OR
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.id = appointment_id AND a.tenant_id = auth_tenant_id()
    )
  );

-- ── service_staff ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_service_staff" ON service_staff;
DROP POLICY IF EXISTS "anon_read_service_staff" ON service_staff;
DROP POLICY IF EXISTS "tenant_isolation_service_staff" ON service_staff;
CREATE POLICY "anon_read_service_staff" ON service_staff
  FOR SELECT TO anon USING (true);
CREATE POLICY "tenant_isolation_service_staff" ON service_staff
  FOR ALL TO authenticated
  USING (
    auth_is_super_admin() OR
    EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = service_id AND s.tenant_id = auth_tenant_id()
    )
  )
  WITH CHECK (
    auth_is_super_admin() OR
    EXISTS (
      SELECT 1 FROM services s
      WHERE s.id = service_id AND s.tenant_id = auth_tenant_id()
    )
  );

-- ── combo_items ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_combo_items" ON combo_items;
DROP POLICY IF EXISTS "tenant_isolation_combo_items" ON combo_items;
CREATE POLICY "tenant_isolation_combo_items" ON combo_items
  FOR ALL TO authenticated
  USING (
    auth_is_super_admin() OR
    EXISTS (
      SELECT 1 FROM combos c
      WHERE c.id = combo_id AND c.tenant_id = auth_tenant_id()
    )
  )
  WITH CHECK (
    auth_is_super_admin() OR
    EXISTS (
      SELECT 1 FROM combos c
      WHERE c.id = combo_id AND c.tenant_id = auth_tenant_id()
    )
  );

-- ── order_items ───────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "pilot_all_order_items" ON order_items;
DROP POLICY IF EXISTS "tenant_isolation_order_items" ON order_items;
CREATE POLICY "tenant_isolation_order_items" ON order_items
  FOR ALL TO authenticated
  USING (
    auth_is_super_admin() OR
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.tenant_id = auth_tenant_id()
    )
  )
  WITH CHECK (
    auth_is_super_admin() OR
    EXISTS (
      SELECT 1 FROM orders o
      WHERE o.id = order_id AND o.tenant_id = auth_tenant_id()
    )
  );

-- =============================================================================
-- Verificação
-- =============================================================================
-- SELECT tablename, policyname, roles, cmd
-- FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;
