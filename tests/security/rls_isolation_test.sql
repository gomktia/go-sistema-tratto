-- ============================================================================
-- RLS ISOLATION TEST - Tenant A vs Tenant B
-- ============================================================================
-- Objetivo: Validar isolamento entre tenants nas tabelas core
-- Data: 2026-07-14
-- Autor: Claude DevOps Agent
--
-- IMPORTANTE: Este script deve ser executado no Supabase SQL Editor
-- com usuários autenticados diferentes para simular isolamento real.
-- ============================================================================

-- ============================================================================
-- FASE 1: SETUP - Criar tenants e dados de teste
-- ============================================================================

-- Criar Tenant A
DO $$
DECLARE
    tenant_a_id uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
    tenant_b_id uuid := 'b0000000-0000-0000-0000-000000000001'::uuid;
BEGIN
    -- Inserir Tenant A (se não existir)
    INSERT INTO public.tenants (id, name, slug, status)
    VALUES (tenant_a_id, 'Test Tenant A', 'tenant-a-test', 'active')
    ON CONFLICT (id) DO NOTHING;

    -- Inserir Tenant B (se não existir)
    INSERT INTO public.tenants (id, name, slug, status)
    VALUES (tenant_b_id, 'Test Tenant B', 'tenant-b-test', 'active')
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Tenants de teste criados: % e %', tenant_a_id, tenant_b_id;
END $$;

-- ============================================================================
-- FASE 2: SEED - Popular dados em cada tenant
-- ============================================================================

-- Dados Tenant A
INSERT INTO public.customers (id, tenant_id, full_name, email, phone)
VALUES
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'Cliente A1', 'a1@tenant-a.com', '11111111111'),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'Cliente A2', 'a2@tenant-a.com', '11111111112')
ON CONFLICT DO NOTHING;

INSERT INTO public.employees (id, tenant_id, full_name, email, status)
VALUES
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'Funcionário A1', 'emp-a1@tenant-a.com', 'active'),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'Funcionário A2', 'emp-a2@tenant-a.com', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO public.services (id, tenant_id, name, duration_minutes, price)
VALUES
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'Serviço A1', 60, 10000),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'Serviço A2', 30, 5000)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (id, tenant_id, name, sku, price, stock_quantity)
VALUES
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'Produto A1', 'PROD-A1', 2000, 10),
    (gen_random_uuid(), 'a0000000-0000-0000-0000-000000000001', 'Produto A2', 'PROD-A2', 1500, 20)
ON CONFLICT DO NOTHING;

-- Dados Tenant B
INSERT INTO public.customers (id, tenant_id, full_name, email, phone)
VALUES
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Cliente B1', 'b1@tenant-b.com', '22222222221'),
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Cliente B2', 'b2@tenant-b.com', '22222222222')
ON CONFLICT DO NOTHING;

INSERT INTO public.employees (id, tenant_id, full_name, email, status)
VALUES
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Funcionário B1', 'emp-b1@tenant-b.com', 'active'),
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Funcionário B2', 'emp-b2@tenant-b.com', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO public.services (id, tenant_id, name, duration_minutes, price)
VALUES
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Serviço B1', 45, 8000),
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Serviço B2', 90, 15000)
ON CONFLICT DO NOTHING;

INSERT INTO public.products (id, tenant_id, name, sku, price, stock_quantity)
VALUES
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Produto B1', 'PROD-B1', 3000, 5),
    (gen_random_uuid(), 'b0000000-0000-0000-0000-000000000001', 'Produto B2', 'PROD-B2', 2500, 15)
ON CONFLICT DO NOTHING;

SELECT 'Dados de teste inseridos com sucesso' as status;

-- ============================================================================
-- FASE 3: VERIFICAÇÃO DE POLICIES - Confirmar que existem
-- ============================================================================

SELECT
    tablename,
    policyname,
    cmd as operation,
    roles,
    CASE
        WHEN qual::text LIKE '%auth_tenant_id%' THEN 'ISOLADO ✓'
        WHEN qual::text LIKE '%auth_is_super_admin%' THEN 'SUPER ADMIN BYPASS ✓'
        WHEN qual::text = 'true' THEN 'INSEGURO ✗'
        ELSE 'VERIFICAR'
    END as security_status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('customers', 'employees', 'services', 'products',
                   'appointments', 'appointment_commissions', 'daily_closings')
ORDER BY tablename, cmd;

-- ============================================================================
-- FASE 4: TESTES MANUAIS - Executar com diferentes usuários
-- ============================================================================

-- IMPORTANTE: Para testar RLS corretamente, você precisa:
-- 1. Criar usuários no Supabase Auth com user_metadata.tenant_id definido
-- 2. Logar com cada usuário
-- 3. Executar as queries abaixo

-- ----------------------------------------------------------------------------
-- TESTE 1: Usuário de Tenant A tentando acessar dados de Tenant B
-- ----------------------------------------------------------------------------
-- Pré-requisito: Logar com usuário que tem user_metadata.tenant_id = tenant_a_id
-- ESPERADO: Todas as queries abaixo devem retornar 0 rows

-- SELECT de Tenant B (deve falhar)
SELECT * FROM public.customers WHERE tenant_id = 'b0000000-0000-0000-0000-000000000001';
-- ESPERADO: 0 rows

SELECT * FROM public.employees WHERE tenant_id = 'b0000000-0000-0000-0000-000000000001';
-- ESPERADO: 0 rows

SELECT * FROM public.services WHERE tenant_id = 'b0000000-0000-0000-0000-000000000001';
-- ESPERADO: 0 rows

SELECT * FROM public.products WHERE tenant_id = 'b0000000-0000-0000-0000-000000000001';
-- ESPERADO: 0 rows

-- INSERT em Tenant B (deve falhar)
INSERT INTO public.customers (tenant_id, full_name, email, phone)
VALUES ('b0000000-0000-0000-0000-000000000001', 'Hacker', 'hack@evil.com', '99999999999');
-- ESPERADO: ERROR - new row violates row-level security policy

-- UPDATE de Tenant B (deve falhar)
UPDATE public.customers
SET full_name = 'Hacked'
WHERE tenant_id = 'b0000000-0000-0000-0000-000000000001';
-- ESPERADO: 0 rows affected (ou error)

-- DELETE de Tenant B (deve falhar)
DELETE FROM public.customers
WHERE tenant_id = 'b0000000-0000-0000-0000-000000000001';
-- ESPERADO: 0 rows affected (ou error)

-- ----------------------------------------------------------------------------
-- TESTE 2: Usuário de Tenant A acessando próprios dados
-- ----------------------------------------------------------------------------
-- ESPERADO: Todas as queries abaixo devem retornar dados

SELECT COUNT(*) as my_customers FROM public.customers WHERE tenant_id = 'a0000000-0000-0000-0000-000000000001';
-- ESPERADO: 2 rows

SELECT COUNT(*) as my_employees FROM public.employees WHERE tenant_id = 'a0000000-0000-0000-0000-000000000001';
-- ESPERADO: 2 rows

SELECT COUNT(*) as my_services FROM public.services WHERE tenant_id = 'a0000000-0000-0000-0000-000000000001';
-- ESPERADO: 2 rows

SELECT COUNT(*) as my_products FROM public.products WHERE tenant_id = 'a0000000-0000-0000-0000-000000000001';
-- ESPERADO: 2 rows

-- ----------------------------------------------------------------------------
-- TESTE 3: Super Admin acessando todos os dados
-- ----------------------------------------------------------------------------
-- Pré-requisito: Logar com usuário que tem user_metadata.role = 'super_admin'
-- ESPERADO: Ver dados de AMBOS os tenants

SELECT tenant_id, COUNT(*) as total
FROM public.customers
WHERE tenant_id IN ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001')
GROUP BY tenant_id
ORDER BY tenant_id;
-- ESPERADO: 2 rows (tenant A: 2, tenant B: 2)

-- ============================================================================
-- FASE 5: VALIDAÇÃO AUTOMÁTICA - Verificar integridade das policies
-- ============================================================================

-- Verificar que todas as tabelas têm RLS habilitado
SELECT
    tablename,
    CASE WHEN rowsecurity THEN '✓ RLS ENABLED' ELSE '✗ RLS DISABLED' END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('customers', 'employees', 'services', 'products',
                   'appointments', 'appointment_commissions', 'daily_closings',
                   'service_categories', 'product_categories', 'tenants')
ORDER BY tablename;

-- Verificar que helper functions existem
SELECT
    proname as function_name,
    prosecdef as is_security_definer,
    provolatile as volatility,
    CASE
        WHEN proname = 'auth_tenant_id' THEN '✓ Retorna tenant_id do JWT'
        WHEN proname = 'auth_is_super_admin' THEN '✓ Verifica role super_admin'
        ELSE ''
    END as description
FROM pg_proc
WHERE proname IN ('auth_tenant_id', 'auth_is_super_admin')
  AND pronamespace = 'public'::regnamespace;

-- Verificar que policies usam as helper functions
SELECT
    tablename,
    COUNT(*) as total_policies,
    COUNT(*) FILTER (WHERE qual::text LIKE '%auth_tenant_id%') as uses_tenant_isolation,
    COUNT(*) FILTER (WHERE qual::text LIKE '%auth_is_super_admin%') as has_super_admin_bypass,
    COUNT(*) FILTER (WHERE qual::text = 'true') as insecure_policies
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('customers', 'employees', 'services', 'products',
                   'appointments', 'appointment_commissions', 'daily_closings')
GROUP BY tablename
ORDER BY tablename;

-- ============================================================================
-- FASE 6: CLEANUP (Opcional - Executar após testes)
-- ============================================================================

-- ATENÇÃO: Isto vai deletar todos os dados de teste!
-- Descomente apenas se quiser limpar após os testes

-- DELETE FROM public.customers WHERE tenant_id IN ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001');
-- DELETE FROM public.employees WHERE tenant_id IN ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001');
-- DELETE FROM public.services WHERE tenant_id IN ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001');
-- DELETE FROM public.products WHERE tenant_id IN ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001');
-- DELETE FROM public.tenants WHERE id IN ('a0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001');

-- ============================================================================
-- CHECKLIST DE VALIDAÇÃO
-- ============================================================================

/*
[ ] FASE 1: Setup executado sem erros
[ ] FASE 2: Dados inseridos em ambos os tenants
[ ] FASE 3: Policies verificadas - todas usando auth_tenant_id()
[ ] FASE 4: Testes manuais executados
    [ ] Tenant A não vê dados de Tenant B (0 rows)
    [ ] Tenant A não consegue INSERT/UPDATE/DELETE em Tenant B
    [ ] Tenant A vê próprios dados corretamente
    [ ] Super Admin vê dados de ambos os tenants
[ ] FASE 5: Validação automática
    [ ] Todas tabelas têm RLS enabled
    [ ] Helper functions existem e são SECURITY DEFINER
    [ ] Policies usam helper functions (não hardcoded)
    [ ] Nenhuma policy insegura (qual = true)

RESULTADO ESPERADO: ✅ PASSOU em todos os testes
Se algum teste falhar: ✗ FALHOU - Verificar policies e corrigir
*/

-- ============================================================================
-- FIM DO SCRIPT DE TESTE
-- ============================================================================
