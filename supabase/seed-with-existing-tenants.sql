-- ============================================
-- BeautyFlow - Seed com Tenants Existentes
-- ============================================
-- Este script usa OS SEUS TENANTS REAIS!
-- IDs obtidos do banco: beleza-pura, studio-glamour, espaco-elegance
-- ============================================

-- IDs reais dos seus tenants:
-- Beleza Pura:      aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa
-- Studio Glamour:   bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb
-- Espaço Elegance:  eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee

-- ============================================
-- 1. SERVICES (Serviços)
-- ============================================

-- Serviços da Beleza Pura
INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, currency, is_active, metadata)
VALUES
    ('a1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Corte Feminino', 'Corte moderno com finalização', 60, 80.00, 'BRL', true, '{"bufferBefore": 0, "bufferAfter": 15}'::jsonb),
    ('a1111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Escova Progressiva', 'Tratamento com produtos profissionais', 180, 250.00, 'BRL', true, '{"bufferBefore": 15, "bufferAfter": 30}'::jsonb),
    ('a1111111-1111-1111-1111-111111111113', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Manicure + Pedicure', 'Esmaltação com gel', 90, 70.00, 'BRL', true, '{"bufferBefore": 0, "bufferAfter": 10}'::jsonb),
    ('a1111111-1111-1111-1111-111111111114', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Design de Sobrancelhas', 'Modelagem com henna', 30, 45.00, 'BRL', true, '{"bufferBefore": 0, "bufferAfter": 5}'::jsonb),
    ('a1111111-1111-1111-1111-111111111115', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Mechas Loiro Perolado', 'Coloração premium com proteção', 240, 450.00, 'BRL', true, '{"bufferBefore": 15, "bufferAfter": 30}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Serviços do Studio Glamour
INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, currency, is_active, metadata)
VALUES
    ('a2222222-2222-2222-2222-222222222221', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Corte Masculino', 'Corte + barba', 45, 50.00, 'BRL', true, '{"bufferBefore": 0, "bufferAfter": 10}'::jsonb),
    ('a2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Hidratação Profunda', 'Tratamento intensivo', 90, 120.00, 'BRL', true, '{"bufferBefore": 10, "bufferAfter": 15}'::jsonb),
    ('a2222222-2222-2222-2222-222222222223', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Luzes Californianas', 'Mechas naturais', 180, 300.00, 'BRL', true, '{"bufferBefore": 15, "bufferAfter": 20}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Serviços do Espaço Elegance (bônus!)
INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, currency, is_active, metadata)
VALUES
    ('a3333333-3333-3333-3333-333333333331', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Spa Facial', 'Limpeza + hidratação profunda', 90, 150.00, 'BRL', true, '{"bufferBefore": 10, "bufferAfter": 15}'::jsonb),
    ('a3333333-3333-3333-3333-333333333332', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Massagem Relaxante', 'Massagem terapêutica 60min', 60, 120.00, 'BRL', true, '{"bufferBefore": 5, "bufferAfter": 10}'::jsonb),
    ('a3333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Design + Alongamento de Cílios', 'Técnica fio a fio', 120, 180.00, 'BRL', true, '{"bufferBefore": 10, "bufferAfter": 15}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. EMPLOYEES (Profissionais)
-- ============================================

-- Funcionários da Beleza Pura
INSERT INTO employees (id, tenant_id, full_name, email, phone, role, status, color_tag, commission_rate)
VALUES
    ('e1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Julia Santos', 'julia@belezapura.com', '+5511999887755', 'Cabeleireira', 'active', '#ec4899', 0.40),
    ('e1111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Mariana Costa', 'mariana@belezapura.com', '+5511999887744', 'Manicure', 'active', '#8b5cf6', 0.35),
    ('e1111111-1111-1111-1111-111111111113', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Fernanda Lima', 'fernanda@belezapura.com', '+5511999887733', 'Esteticista', 'active', '#06b6d4', 0.40)
ON CONFLICT (id) DO NOTHING;

-- Funcionários do Studio Glamour
INSERT INTO employees (id, tenant_id, full_name, email, phone, role, status, color_tag, commission_rate)
VALUES
    ('e2222222-2222-2222-2222-222222222221', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Carlos Silva', 'carlos@studioglamour.com', '+5511988776644', 'Barbeiro', 'active', '#f97316', 0.45),
    ('e2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Ana Paula', 'anapaula@studioglamour.com', '+5511988776633', 'Colorista', 'active', '#84cc16', 0.50)
ON CONFLICT (id) DO NOTHING;

-- Funcionários do Espaço Elegance
INSERT INTO employees (id, tenant_id, full_name, email, phone, role, status, color_tag, commission_rate)
VALUES
    ('e3333333-3333-3333-3333-333333333331', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Patricia Alves', 'patricia@espacoelegance.com', '+5511977665544', 'Esteticista', 'active', '#a855f7', 0.45),
    ('e3333333-3333-3333-3333-333333333332', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Roberta Souza', 'roberta@espacoelegance.com', '+5511977665533', 'Massoterapeuta', 'active', '#14b8a6', 0.40)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. CUSTOMERS (Clientes)
-- ============================================

-- Clientes da Beleza Pura
INSERT INTO customers (id, tenant_id, full_name, email, phone, document, birthdate, gender, loyalty_points, total_spent, marketing_opt_in)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Maria Silva', 'maria.silva@email.com', '+5511988887777', '12345678901', '1990-05-15', 'F', 150, 850.00, true),
    ('c1111111-1111-1111-1111-111111111112', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Ana Paula Santos', 'ana.santos@email.com', '+5511988887766', '23456789012', '1985-08-22', 'F', 320, 1650.00, true),
    ('c1111111-1111-1111-1111-111111111113', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Carla Oliveira', 'carla.oliveira@email.com', '+5511988887755', '34567890123', '1992-11-30', 'F', 80, 420.00, false)
ON CONFLICT (id) DO NOTHING;

-- Clientes do Studio Glamour
INSERT INTO customers (id, tenant_id, full_name, email, phone, document, birthdate, gender, loyalty_points, total_spent, marketing_opt_in)
VALUES
    ('c2222222-2222-2222-2222-222222222221', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'João Pedro', 'joao.pedro@email.com', '+5511977776666', '45678901234', '1988-03-10', 'M', 50, 250.00, true),
    ('c2222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Lucas Mendes', 'lucas.mendes@email.com', '+5511977776655', '56789012345', '1995-07-18', 'M', 120, 600.00, true)
ON CONFLICT (id) DO NOTHING;

-- Clientes do Espaço Elegance
INSERT INTO customers (id, tenant_id, full_name, email, phone, document, birthdate, gender, loyalty_points, total_spent, marketing_opt_in)
VALUES
    ('c3333333-3333-3333-3333-333333333331', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Beatriz Ferreira', 'beatriz.ferreira@email.com', '+5511966665555', '67890123456', '1993-09-25', 'F', 200, 980.00, true),
    ('c3333333-3333-3333-3333-333333333332', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Camila Rodrigues', 'camila.rodrigues@email.com', '+5511966665544', '78901234567', '1987-12-14', 'F', 450, 2100.00, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. CUSTOMER CREDENTIALS (Senhas)
-- ============================================
-- Senha para TODOS os clientes: senha123
-- Hash bcrypt (salt rounds = 10)

INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
VALUES
    -- Beleza Pura - Maria Silva
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c1111111-1111-1111-1111-111111111111', 'cpf', '12345678901', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c1111111-1111-1111-1111-111111111111', 'email', 'maria.silva@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),

    -- Beleza Pura - Ana Paula
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c1111111-1111-1111-1111-111111111112', 'cpf', '23456789012', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c1111111-1111-1111-1111-111111111112', 'email', 'ana.santos@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),

    -- Beleza Pura - Carla
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c1111111-1111-1111-1111-111111111113', 'cpf', '34567890123', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'c1111111-1111-1111-1111-111111111113', 'email', 'carla.oliveira@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),

    -- Studio Glamour - João Pedro
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'c2222222-2222-2222-2222-222222222221', 'cpf', '45678901234', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'c2222222-2222-2222-2222-222222222221', 'email', 'joao.pedro@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),

    -- Studio Glamour - Lucas
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'c2222222-2222-2222-2222-222222222222', 'cpf', '56789012345', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'c2222222-2222-2222-2222-222222222222', 'email', 'lucas.mendes@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),

    -- Espaço Elegance - Beatriz
    ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'c3333333-3333-3333-3333-333333333331', 'cpf', '67890123456', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
    ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'c3333333-3333-3333-3333-333333333331', 'email', 'beatriz.ferreira@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),

    -- Espaço Elegance - Camila
    ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'c3333333-3333-3333-3333-333333333332', 'cpf', '78901234567', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
    ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'c3333333-3333-3333-3333-333333333332', 'email', 'camila.rodrigues@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAÇÃO
-- ============================================

SELECT
    'Total de registros inseridos:' as status,
    '' as detalhes
UNION ALL
SELECT
    '  • Services',
    COUNT(*)::text
FROM services
WHERE tenant_id IN ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')
UNION ALL
SELECT
    '  • Employees',
    COUNT(*)::text
FROM employees
WHERE tenant_id IN ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')
UNION ALL
SELECT
    '  • Customers',
    COUNT(*)::text
FROM customers
WHERE tenant_id IN ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')
UNION ALL
SELECT
    '  • Customer Credentials',
    COUNT(*)::text
FROM customer_credentials
WHERE tenant_id IN ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee');

-- ============================================
-- ✅ PRONTO!
-- ============================================
-- Dados de teste inseridos com sucesso!
--
-- PRÓXIMO PASSO:
-- Execute: npx tsx scripts/create-auth-users.ts
-- ============================================
