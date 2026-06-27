-- ============================================
-- SCRIPT COMPLEMENTAR - HABILITAR RLS EM TODAS AS TABELAS
-- ============================================
-- Este script habilita RLS nas tabelas que ainda estão desprotegidas
-- Execute DEPOIS de supabase-rls-policies.sql
-- ============================================

-- ============================================
-- 1. HABILITAR RLS EM TABELAS FALTANTES
-- ============================================

-- Tabelas de usuários e autenticação
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Tabelas de logs e auditoria
ALTER TABLE appointment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Tabelas de collections/cobrança
ALTER TABLE collections_actions ENABLE ROW LEVEL SECURITY;

-- Tabelas de combos (detalhes)
ALTER TABLE combo_items ENABLE ROW LEVEL SECURITY;

-- Tabelas de clientes (eventos e sessões)
ALTER TABLE customer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Tabelas financeiras
ALTER TABLE daily_cash_flow ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE revenue_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Tabelas de funil/CRM
ALTER TABLE funnel_steps ENABLE ROW LEVEL SECURITY;

-- Tabelas de incidentes/suporte
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_help_requests ENABLE ROW LEVEL SECURITY;

-- Tabelas de integrações
ALTER TABLE integration_statuses ENABLE ROW LEVEL SECURITY;

-- Tabelas de inventário/estoque
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- Tabelas de pedidos/vendas
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Tabelas de planos/assinaturas
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Tabelas de playbooks/automação
ALTER TABLE playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_runs ENABLE ROW LEVEL SECURITY;

-- Tabelas de PDV/caixa
ALTER TABLE pos_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pos_session_payments ENABLE ROW LEVEL SECURITY;

-- Tabelas de serviços (categorias e staff)
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_staff ENABLE ROW LEVEL SECURITY;

-- Tabelas de tags
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLÍTICAS BÁSICAS PERMISSIVAS
-- ============================================
-- Estas políticas permitem acesso enquanto você não implementa Supabase Auth
-- IMPORTANTE: Substituir por políticas seguras depois!

-- app_users (provavelmente admin/funcionários)
CREATE POLICY "app_users_permissive" ON app_users FOR ALL USING (true);

-- Logs (apenas leitura para auditoria)
CREATE POLICY "appointment_logs_read" ON appointment_logs FOR SELECT USING (true);
CREATE POLICY "audit_logs_read" ON audit_logs FOR SELECT USING (true);

-- Collections
CREATE POLICY "collections_actions_permissive" ON collections_actions FOR ALL USING (true);

-- Combo items (público pode ver)
CREATE POLICY "combo_items_public_read" ON combo_items FOR SELECT USING (true);
CREATE POLICY "combo_items_tenant_modify" ON combo_items FOR ALL USING (true);

-- Customer events/sessions
CREATE POLICY "customer_events_tenant" ON customer_events FOR ALL USING (true);
CREATE POLICY "customer_sessions_tenant" ON customer_sessions FOR ALL USING (true);
CREATE POLICY "customer_tag_assignments_tenant" ON customer_tag_assignments FOR ALL USING (true);

-- Financeiro (apenas tenant)
CREATE POLICY "daily_cash_flow_tenant" ON daily_cash_flow FOR ALL USING (true);
CREATE POLICY "financial_goals_tenant" ON financial_goals FOR ALL USING (true);
CREATE POLICY "payments_tenant" ON payments FOR ALL USING (true);
CREATE POLICY "payouts_tenant" ON payouts FOR ALL USING (true);
CREATE POLICY "revenue_snapshots_tenant" ON revenue_snapshots FOR ALL USING (true);
CREATE POLICY "invoices_tenant" ON invoices FOR ALL USING (true);
CREATE POLICY "invoice_items_tenant" ON invoice_items FOR ALL USING (true);

-- Funil
CREATE POLICY "funnel_steps_tenant" ON funnel_steps FOR ALL USING (true);

-- Incidentes/Suporte
CREATE POLICY "incidents_tenant" ON incidents FOR ALL USING (true);
CREATE POLICY "support_tickets_permissive" ON support_tickets FOR ALL USING (true);
CREATE POLICY "support_messages_permissive" ON support_messages FOR ALL USING (true);
CREATE POLICY "public_help_requests_public" ON public_help_requests FOR ALL USING (true);

-- Integrações
CREATE POLICY "integration_statuses_tenant" ON integration_statuses FOR ALL USING (true);

-- Inventário (público pode ver produtos)
CREATE POLICY "products_public_read" ON products FOR SELECT USING (true);
CREATE POLICY "products_tenant_modify" ON products FOR ALL USING (true);
CREATE POLICY "product_categories_public" ON product_categories FOR SELECT USING (true);
CREATE POLICY "inventory_movements_tenant" ON inventory_movements FOR ALL USING (true);

-- Pedidos
CREATE POLICY "orders_tenant" ON orders FOR ALL USING (true);
CREATE POLICY "order_items_tenant" ON order_items FOR ALL USING (true);

-- Planos (público pode ver)
CREATE POLICY "plans_public_read" ON plans FOR SELECT USING (true);
CREATE POLICY "plans_admin_modify" ON plans FOR ALL USING (true);
CREATE POLICY "subscriptions_tenant" ON subscriptions FOR ALL USING (true);

-- Playbooks
CREATE POLICY "playbooks_tenant" ON playbooks FOR ALL USING (true);
CREATE POLICY "playbook_runs_tenant" ON playbook_runs FOR ALL USING (true);

-- PDV
CREATE POLICY "pos_sessions_tenant" ON pos_sessions FOR ALL USING (true);
CREATE POLICY "pos_session_payments_tenant" ON pos_session_payments FOR ALL USING (true);

-- Service categories/staff (público pode ver)
CREATE POLICY "service_categories_public" ON service_categories FOR SELECT USING (true);
CREATE POLICY "service_staff_public" ON service_staff FOR SELECT USING (true);
CREATE POLICY "service_staff_tenant_modify" ON service_staff FOR ALL USING (true);

-- Tags
CREATE POLICY "tags_tenant" ON tags FOR ALL USING (true);

-- ============================================
-- 3. VERIFICAR RESULTADO
-- ============================================

SELECT
    schemaname,
    tablename,
    rowsecurity,
    CASE
        WHEN rowsecurity THEN '✅ PROTEGIDO'
        ELSE '❌ DESPROTEGIDO'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY rowsecurity DESC, tablename;

-- ============================================
-- 4. CONTAR TABELAS PROTEGIDAS VS DESPROTEGIDAS
-- ============================================

SELECT
    CASE
        WHEN rowsecurity THEN 'PROTEGIDO'
        ELSE 'DESPROTEGIDO'
    END as status,
    COUNT(*) as total
FROM pg_tables
WHERE schemaname = 'public'
GROUP BY rowsecurity;

-- ============================================
-- PRÓXIMOS PASSOS APÓS EXECUTAR ESTE SCRIPT:
-- ============================================
-- 1. ✅ Todas as tabelas terão RLS habilitado
-- 2. ✅ Políticas permissivas não vão quebrar a aplicação
-- 3. ⚠️ Ainda não há isolamento real entre tenants
-- 4. 📋 Implementar Supabase Auth (ver EXEMPLO-SUPABASE-AUTH.md)
-- 5. 🔒 Substituir políticas permissivas por seguras
--
-- EXEMPLO DE POLÍTICA SEGURA (após Supabase Auth):
-- DROP POLICY "products_tenant_modify" ON products;
-- CREATE POLICY "products_tenant_secure" ON products
--     FOR ALL
--     USING (tenant_id::text = auth.jwt() ->> 'tenant_id');
-- ============================================
