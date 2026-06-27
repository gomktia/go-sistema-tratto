-- =============================================================================
-- Migration: RLS (Row Level Security) — Isolamento Multi-Tenant
-- =============================================================================
-- Estratégia de pré-produção (pilot):
--   • ENABLE ROW LEVEL SECURITY em todas as tabelas
--   • Role anon: acesso permissivo (o frontend sempre filtra por tenant_id)
--   • Role service_role: bypass automático de RLS (padrão Supabase)
--
-- IMPORTANTE — TODO ANTES DE PRODUÇÃO PÚBLICA:
--   Substituir policies "pilot_*" por policies baseadas em auth.uid()
--   ligando o usuário autenticado ao seu tenant_id.
--   Ex: USING (tenant_id = get_user_tenant_id())
-- =============================================================================

-- ─── HELPER: drop policy se já existir (idempotente) ─────────────────────────
-- Usamos IF NOT EXISTS no CREATE POLICY (disponível a partir do PG 9.5)

-- =============================================================================
-- 1. TABELAS COM tenant_id direto
--    Policy: anon pode ler/escrever (frontend sempre filtra por tenant_id)
-- =============================================================================

-- appointments
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_appointments" ON appointments;
CREATE POLICY "pilot_all_appointments" ON appointments
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- appointment_commissions
ALTER TABLE appointment_commissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_appointment_commissions" ON appointment_commissions;
CREATE POLICY "pilot_all_appointment_commissions" ON appointment_commissions
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_customers" ON customers;
CREATE POLICY "pilot_all_customers" ON customers
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- employees
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_employees" ON employees;
CREATE POLICY "pilot_all_employees" ON employees
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- services
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_services" ON services;
CREATE POLICY "pilot_all_services" ON services
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- service_categories
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_service_categories" ON service_categories;
CREATE POLICY "pilot_all_service_categories" ON service_categories
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- staff_availability
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_staff_availability" ON staff_availability;
CREATE POLICY "pilot_all_staff_availability" ON staff_availability
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- gallery_images
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_gallery_images" ON gallery_images;
CREATE POLICY "pilot_all_gallery_images" ON gallery_images
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- highlights
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_highlights" ON highlights;
CREATE POLICY "pilot_all_highlights" ON highlights
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_products" ON products;
CREATE POLICY "pilot_all_products" ON products
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- product_categories
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_product_categories" ON product_categories;
CREATE POLICY "pilot_all_product_categories" ON product_categories
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- inventory_movements
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_inventory_movements" ON inventory_movements;
CREATE POLICY "pilot_all_inventory_movements" ON inventory_movements
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- combos
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_combos" ON combos;
CREATE POLICY "pilot_all_combos" ON combos
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_orders" ON orders;
CREATE POLICY "pilot_all_orders" ON orders
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_payments" ON payments;
CREATE POLICY "pilot_all_payments" ON payments
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- payouts
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_payouts" ON payouts;
CREATE POLICY "pilot_all_payouts" ON payouts
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_invoices" ON invoices;
CREATE POLICY "pilot_all_invoices" ON invoices
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_audit_logs" ON audit_logs;
CREATE POLICY "pilot_all_audit_logs" ON audit_logs
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- customer_credentials
ALTER TABLE customer_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_customer_credentials" ON customer_credentials;
CREATE POLICY "pilot_all_customer_credentials" ON customer_credentials
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- customer_events
ALTER TABLE customer_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_customer_events" ON customer_events;
CREATE POLICY "pilot_all_customer_events" ON customer_events
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- customer_tag_assignments
ALTER TABLE customer_tag_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_customer_tag_assignments" ON customer_tag_assignments;
CREATE POLICY "pilot_all_customer_tag_assignments" ON customer_tag_assignments
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- pos_sessions
ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_pos_sessions" ON pos_sessions;
CREATE POLICY "pilot_all_pos_sessions" ON pos_sessions
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- revenue_snapshots
ALTER TABLE revenue_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_revenue_snapshots" ON revenue_snapshots;
CREATE POLICY "pilot_all_revenue_snapshots" ON revenue_snapshots
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- daily_closings
ALTER TABLE daily_closings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_daily_closings" ON daily_closings;
CREATE POLICY "pilot_all_daily_closings" ON daily_closings
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- =============================================================================
-- 2. TABELA TENANTS — apenas SELECT para anon (escrita via service_role)
-- =============================================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tenants_select_public" ON tenants;
CREATE POLICY "tenants_select_public" ON tenants
  FOR SELECT TO anon USING (true);

-- =============================================================================
-- 3. TABELAS SEM tenant_id direto (junction, global, logs)
-- =============================================================================

-- app_users (perfis ligados ao auth.uid)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_app_users" ON app_users;
CREATE POLICY "pilot_all_app_users" ON app_users
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- appointment_logs (lookup por appointment_id)
ALTER TABLE appointment_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_appointment_logs" ON appointment_logs;
CREATE POLICY "pilot_all_appointment_logs" ON appointment_logs
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- service_staff (junction service × employee)
ALTER TABLE service_staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_service_staff" ON service_staff;
CREATE POLICY "pilot_all_service_staff" ON service_staff
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- combo_items (junction combo × item)
ALTER TABLE combo_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_combo_items" ON combo_items;
CREATE POLICY "pilot_all_combo_items" ON combo_items
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- order_items (junction order × item)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pilot_all_order_items" ON order_items;
CREATE POLICY "pilot_all_order_items" ON order_items
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- reviews (leitura pública de avaliações)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "reviews_select_public" ON reviews;
CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "pilot_insert_reviews" ON reviews;
CREATE POLICY "pilot_insert_reviews" ON reviews
  FOR INSERT TO anon WITH CHECK (true);

-- plans (configuração global — somente leitura para anon)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plans_select_public" ON plans;
CREATE POLICY "plans_select_public" ON plans
  FOR SELECT TO anon USING (true);

-- =============================================================================
-- Verificação inline
-- =============================================================================
-- SELECT schemaname, tablename, rowsecurity
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY tablename;
