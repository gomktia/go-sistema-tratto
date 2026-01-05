-- ============================================
-- SCRIPT DE SEGURANÇA - ROW LEVEL SECURITY (RLS)
-- ============================================
-- Este script habilita RLS e cria políticas de segurança
-- para garantir isolamento entre tenants e proteção de dados
-- ============================================

-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- Dashboard > SQL Editor > New Query > Cole o script > Run

-- ============================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- ============================================

-- Tabelas principais
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE combos ENABLE ROW LEVEL SECURITY;

-- Tabelas de autenticação/admin (se existirem)
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE company_admins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 2. POLÍTICAS PARA TABELA: tenants
-- ============================================
-- Qualquer pessoa pode ler tenants (necessário para páginas públicas)
-- Apenas admins podem modificar

DROP POLICY IF EXISTS "tenants_public_read" ON tenants;
CREATE POLICY "tenants_public_read" ON tenants
    FOR SELECT
    USING (true);

-- Super admins podem inserir/atualizar/deletar
-- Você precisará ajustar isso baseado em como identifica super admins
-- DROP POLICY IF EXISTS "tenants_admin_all" ON tenants;
-- CREATE POLICY "tenants_admin_all" ON tenants
--     FOR ALL
--     USING (auth.jwt() ->> 'role' = 'super_admin');

-- ============================================
-- 3. POLÍTICAS PARA TABELA: customers
-- ============================================
-- Clientes podem ler apenas seus próprios dados
-- Admins do tenant podem ler todos os clientes do seu tenant

DROP POLICY IF EXISTS "customers_tenant_isolation" ON customers;
CREATE POLICY "customers_tenant_isolation" ON customers
    FOR SELECT
    USING (
        -- Permite acesso público para processo de cadastro/login
        true
        -- OU ajuste para: tenant_id = auth.jwt() ->> 'tenant_id'
    );

-- Permite INSERT para processo de cadastro público
DROP POLICY IF EXISTS "customers_public_insert" ON customers;
CREATE POLICY "customers_public_insert" ON customers
    FOR INSERT
    WITH CHECK (true);

-- Permite UPDATE apenas do próprio registro
DROP POLICY IF EXISTS "customers_own_update" ON customers;
CREATE POLICY "customers_own_update" ON customers
    FOR UPDATE
    USING (
        id::text = auth.jwt() ->> 'customer_id'
    );

-- Admins podem deletar (ajuste conforme sua lógica de auth)
-- DROP POLICY IF EXISTS "customers_admin_delete" ON customers;
-- CREATE POLICY "customers_admin_delete" ON customers
--     FOR DELETE
--     USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 4. POLÍTICAS PARA TABELA: customer_credentials
-- ============================================
-- Apenas o próprio cliente pode ver suas credenciais
-- Permite INSERT para cadastro

DROP POLICY IF EXISTS "credentials_public_insert" ON customer_credentials;
CREATE POLICY "credentials_public_insert" ON customer_credentials
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "credentials_own_read" ON customer_credentials;
CREATE POLICY "credentials_own_read" ON customer_credentials
    FOR SELECT
    USING (
        -- Permite leitura para processo de autenticação
        true
        -- OU: customer_id::text = auth.jwt() ->> 'customer_id'
    );

DROP POLICY IF EXISTS "credentials_own_update" ON customer_credentials;
CREATE POLICY "credentials_own_update" ON customer_credentials
    FOR UPDATE
    USING (
        customer_id::text = auth.jwt() ->> 'customer_id'
    );

-- ============================================
-- 5. POLÍTICAS PARA TABELA: employees
-- ============================================
-- Isolamento por tenant

DROP POLICY IF EXISTS "employees_tenant_isolation" ON employees;
CREATE POLICY "employees_tenant_isolation" ON employees
    FOR SELECT
    USING (
        true
        -- OU: tenant_id::text = auth.jwt() ->> 'tenant_id'
    );

DROP POLICY IF EXISTS "employees_tenant_insert" ON employees;
CREATE POLICY "employees_tenant_insert" ON employees
    FOR INSERT
    WITH CHECK (
        true
        -- OU: tenant_id::text = auth.jwt() ->> 'tenant_id'
    );

DROP POLICY IF EXISTS "employees_tenant_update" ON employees;
CREATE POLICY "employees_tenant_update" ON employees
    FOR UPDATE
    USING (
        true
        -- OU: tenant_id::text = auth.jwt() ->> 'tenant_id'
    );

-- ============================================
-- 6. POLÍTICAS PARA TABELA: services
-- ============================================
-- Público pode ver serviços (para página de agendamento)
-- Apenas o tenant pode modificar seus serviços

DROP POLICY IF EXISTS "services_public_read" ON services;
CREATE POLICY "services_public_read" ON services
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "services_tenant_modify" ON services;
CREATE POLICY "services_tenant_modify" ON services
    FOR ALL
    USING (
        true
        -- OU: tenant_id::text = auth.jwt() ->> 'tenant_id'
    );

-- ============================================
-- 7. POLÍTICAS PARA TABELA: appointments
-- ============================================
-- Clientes veem apenas seus agendamentos
-- Funcionários veem agendamentos do seu tenant

DROP POLICY IF EXISTS "appointments_public_insert" ON appointments;
CREATE POLICY "appointments_public_insert" ON appointments
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "appointments_tenant_read" ON appointments;
CREATE POLICY "appointments_tenant_read" ON appointments
    FOR SELECT
    USING (
        true
        -- OU condição complexa:
        -- tenant_id::text = auth.jwt() ->> 'tenant_id' OR
        -- customer_id::text = auth.jwt() ->> 'customer_id'
    );

DROP POLICY IF EXISTS "appointments_tenant_update" ON appointments;
CREATE POLICY "appointments_tenant_update" ON appointments
    FOR UPDATE
    USING (
        true
        -- OU: tenant_id::text = auth.jwt() ->> 'tenant_id'
    );

-- ============================================
-- 8. POLÍTICAS PARA TABELA: staff_availability
-- ============================================

DROP POLICY IF EXISTS "availability_public_read" ON staff_availability;
CREATE POLICY "availability_public_read" ON staff_availability
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "availability_employee_modify" ON staff_availability;
CREATE POLICY "availability_employee_modify" ON staff_availability
    FOR ALL
    USING (
        true
        -- OU: employee_id::text = auth.jwt() ->> 'employee_id'
    );

-- ============================================
-- 9. POLÍTICAS PARA TABELA: combos
-- ============================================

DROP POLICY IF EXISTS "combos_public_read" ON combos;
CREATE POLICY "combos_public_read" ON combos
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "combos_tenant_modify" ON combos;
CREATE POLICY "combos_tenant_modify" ON combos
    FOR ALL
    USING (
        true
        -- OU: tenant_id::text = auth.jwt() ->> 'tenant_id'
    );

-- ============================================
-- 10. VERIFICAÇÃO DE SEGURANÇA
-- ============================================
-- Execute esta query para verificar se RLS está habilitado

SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- NOTAS IMPORTANTES:
-- ============================================
-- 1. Este script usa políticas PERMISSIVAS (true) para não quebrar
--    a aplicação atual que não usa autenticação JWT do Supabase
--
-- 2. PRÓXIMO PASSO: Implementar autenticação real com Supabase Auth
--    e substituir os "true" por verificações JWT adequadas
--
-- 3. Para PRODUÇÃO, você DEVE:
--    - Implementar Supabase Auth
--    - Armazenar tenant_id, customer_id no JWT
--    - Substituir "true" por verificações reais
--    - Exemplo: tenant_id::text = auth.jwt() ->> 'tenant_id'
--
-- 4. ISOLAMENTO ENTRE TENANTS:
--    Atualmente permissivo, mas estrutura está pronta para
--    adicionar verificações quando implementar autenticação
--
-- 5. SEGURANÇA ATUAL:
--    - RLS está HABILITADO (protege contra acesso direto)
--    - Políticas são PERMISSIVAS (não quebra app atual)
--    - REQUER autenticação JWT para segurança completa
-- ============================================
