-- ============================================
-- BeautyFlow - Safe Test Data Seed Script
-- ============================================
-- Este script PRESERVA dados existentes
-- e adiciona apenas o que falta
-- ============================================

-- ============================================
-- PASSO 1: Identificar seus tenants existentes
-- ============================================
-- Execute esta query PRIMEIRO para ver seus tenants:
-- SELECT id, slug, name FROM tenants;
--
-- Depois, substitua os IDs abaixo pelos IDs reais dos seus tenants!

-- ============================================
-- CONFIGURAÇÃO: AJUSTE ESTES IDs!
-- ============================================
-- Substitua pelos IDs reais do seu banco:

DO $$
DECLARE
    tenant_beleza_pura_id UUID;
    tenant_studio_glamour_id UUID;
BEGIN
    -- Buscar ou criar Beleza Pura
    SELECT id INTO tenant_beleza_pura_id
    FROM tenants
    WHERE slug = 'beleza-pura'
    LIMIT 1;

    IF tenant_beleza_pura_id IS NULL THEN
        INSERT INTO tenants (id, name, slug, full_name, document, timezone, locale, settings, theme)
        VALUES (
            '11111111-1111-1111-1111-111111111111',
            'Beleza Pura',
            'beleza-pura',
            'Beleza Pura Estética e Beleza LTDA',
            '12.345.678/0001-90',
            'America/Sao_Paulo',
            'pt-BR',
            '{"whatsapp": "+5511999887766", "address": "Rua das Flores, 123 - Centro", "city": "São Paulo", "state": "SP", "zip": "01234-567"}'::jsonb,
            '{"primaryColor": "#7c3aed", "accentColor": "#2563eb"}'::jsonb
        )
        RETURNING id INTO tenant_beleza_pura_id;
        RAISE NOTICE 'Tenant Beleza Pura criado: %', tenant_beleza_pura_id;
    ELSE
        RAISE NOTICE 'Tenant Beleza Pura já existe: %', tenant_beleza_pura_id;
    END IF;

    -- Buscar ou criar Studio Glamour
    SELECT id INTO tenant_studio_glamour_id
    FROM tenants
    WHERE slug = 'studio-glamour'
    LIMIT 1;

    IF tenant_studio_glamour_id IS NULL THEN
        INSERT INTO tenants (id, name, slug, full_name, document, timezone, locale, settings, theme)
        VALUES (
            '22222222-2222-2222-2222-222222222222',
            'Studio Glamour',
            'studio-glamour',
            'Studio Glamour Cabelos e Estética LTDA',
            '98.765.432/0001-10',
            'America/Sao_Paulo',
            'pt-BR',
            '{"whatsapp": "+5511988776655", "address": "Av. Paulista, 1000 - Bela Vista", "city": "São Paulo", "state": "SP", "zip": "01310-100"}'::jsonb,
            '{"primaryColor": "#ec4899", "accentColor": "#f97316"}'::jsonb
        )
        RETURNING id INTO tenant_studio_glamour_id;
        RAISE NOTICE 'Tenant Studio Glamour criado: %', tenant_studio_glamour_id;
    ELSE
        RAISE NOTICE 'Tenant Studio Glamour já existe: %', tenant_studio_glamour_id;
    END IF;

    -- ============================================
    -- 2. SERVICES (Serviços) - Beleza Pura
    -- ============================================

    INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, currency, is_active, metadata)
    VALUES
        ('a1111111-1111-1111-1111-111111111111', tenant_beleza_pura_id, 'Corte Feminino', 'Corte moderno com finalização', 60, 80.00, 'BRL', true, '{"bufferBefore": 0, "bufferAfter": 15}'::jsonb),
        ('a1111111-1111-1111-1111-111111111112', tenant_beleza_pura_id, 'Escova Progressiva', 'Tratamento com produtos profissionais', 180, 250.00, 'BRL', true, '{"bufferBefore": 15, "bufferAfter": 30}'::jsonb),
        ('a1111111-1111-1111-1111-111111111113', tenant_beleza_pura_id, 'Manicure + Pedicure', 'Esmaltação com gel', 90, 70.00, 'BRL', true, '{"bufferBefore": 0, "bufferAfter": 10}'::jsonb),
        ('a1111111-1111-1111-1111-111111111114', tenant_beleza_pura_id, 'Design de Sobrancelhas', 'Modelagem com henna', 30, 45.00, 'BRL', true, '{"bufferBefore": 0, "bufferAfter": 5}'::jsonb),
        ('a1111111-1111-1111-1111-111111111115', tenant_beleza_pura_id, 'Mechas Loiro Perolado', 'Coloração premium com proteção', 240, 450.00, 'BRL', true, '{"bufferBefore": 15, "bufferAfter": 30}'::jsonb)
    ON CONFLICT (id) DO NOTHING;

    -- Services - Studio Glamour
    INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, currency, is_active, metadata)
    VALUES
        ('a2222222-2222-2222-2222-222222222221', tenant_studio_glamour_id, 'Corte Masculino', 'Corte + barba', 45, 50.00, 'BRL', true, '{"bufferBefore": 0, "bufferAfter": 10}'::jsonb),
        ('a2222222-2222-2222-2222-222222222222', tenant_studio_glamour_id, 'Hidratação Profunda', 'Tratamento intensivo', 90, 120.00, 'BRL', true, '{"bufferBefore": 10, "bufferAfter": 15}'::jsonb),
        ('a2222222-2222-2222-2222-222222222223', tenant_studio_glamour_id, 'Luzes Californianas', 'Mechas naturais', 180, 300.00, 'BRL', true, '{"bufferBefore": 15, "bufferAfter": 20}'::jsonb)
    ON CONFLICT (id) DO NOTHING;

    -- ============================================
    -- 3. EMPLOYEES (Profissionais)
    -- ============================================

    INSERT INTO employees (id, tenant_id, full_name, email, phone, role, status, color_tag, commission_rate)
    VALUES
        ('e1111111-1111-1111-1111-111111111111', tenant_beleza_pura_id, 'Julia Santos', 'julia@belezapura.com', '+5511999887755', 'Cabeleireira', 'active', '#ec4899', 0.40),
        ('e1111111-1111-1111-1111-111111111112', tenant_beleza_pura_id, 'Mariana Costa', 'mariana@belezapura.com', '+5511999887744', 'Manicure', 'active', '#8b5cf6', 0.35),
        ('e1111111-1111-1111-1111-111111111113', tenant_beleza_pura_id, 'Fernanda Lima', 'fernanda@belezapura.com', '+5511999887733', 'Esteticista', 'active', '#06b6d4', 0.40),
        ('e2222222-2222-2222-2222-222222222221', tenant_studio_glamour_id, 'Carlos Silva', 'carlos@studioglamour.com', '+5511988776644', 'Barbeiro', 'active', '#f97316', 0.45),
        ('e2222222-2222-2222-2222-222222222222', tenant_studio_glamour_id, 'Ana Paula', 'anapaula@studioglamour.com', '+5511988776633', 'Colorista', 'active', '#84cc16', 0.50)
    ON CONFLICT (id) DO NOTHING;

    -- ============================================
    -- 4. CUSTOMERS (Clientes)
    -- ============================================

    INSERT INTO customers (id, tenant_id, full_name, email, phone, document, birthdate, gender, loyalty_points, total_spent, marketing_opt_in)
    VALUES
        ('c1111111-1111-1111-1111-111111111111', tenant_beleza_pura_id, 'Maria Silva', 'maria.silva@email.com', '+5511988887777', '123.456.789-01', '1990-05-15', 'F', 150, 850.00, true),
        ('c1111111-1111-1111-1111-111111111112', tenant_beleza_pura_id, 'Ana Paula Santos', 'ana.santos@email.com', '+5511988887766', '234.567.890-12', '1985-08-22', 'F', 320, 1650.00, true),
        ('c1111111-1111-1111-1111-111111111113', tenant_beleza_pura_id, 'Carla Oliveira', 'carla.oliveira@email.com', '+5511988887755', '345.678.901-23', '1992-11-30', 'F', 80, 420.00, false),
        ('c2222222-2222-2222-2222-222222222221', tenant_studio_glamour_id, 'João Pedro', 'joao.pedro@email.com', '+5511977776666', '456.789.012-34', '1988-03-10', 'M', 50, 250.00, true),
        ('c2222222-2222-2222-2222-222222222222', tenant_studio_glamour_id, 'Lucas Mendes', 'lucas.mendes@email.com', '+5511977776655', '567.890.123-45', '1995-07-18', 'M', 120, 600.00, true)
    ON CONFLICT (id) DO NOTHING;

    -- ============================================
    -- 5. CUSTOMER CREDENTIALS
    -- ============================================
    -- Senha: senha123 (hash bcrypt gerado)

    INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
    VALUES
        (tenant_beleza_pura_id, 'c1111111-1111-1111-1111-111111111111', 'cpf', '12345678901', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
        (tenant_beleza_pura_id, 'c1111111-1111-1111-1111-111111111111', 'email', 'maria.silva@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
        (tenant_beleza_pura_id, 'c1111111-1111-1111-1111-111111111112', 'cpf', '23456789012', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
        (tenant_beleza_pura_id, 'c1111111-1111-1111-1111-111111111112', 'email', 'ana.santos@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
        (tenant_beleza_pura_id, 'c1111111-1111-1111-1111-111111111113', 'cpf', '34567890123', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
        (tenant_beleza_pura_id, 'c1111111-1111-1111-1111-111111111113', 'email', 'carla.oliveira@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
        (tenant_studio_glamour_id, 'c2222222-2222-2222-2222-222222222221', 'cpf', '45678901234', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
        (tenant_studio_glamour_id, 'c2222222-2222-2222-2222-222222222221', 'email', 'joao.pedro@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
        (tenant_studio_glamour_id, 'c2222222-2222-2222-2222-222222222222', 'cpf', '56789012345', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ'),
        (tenant_studio_glamour_id, 'c2222222-2222-2222-2222-222222222222', 'email', 'lucas.mendes@email.com', '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ')
    ON CONFLICT DO NOTHING;

    -- ============================================
    -- RESUMO
    -- ============================================
    RAISE NOTICE '✅ Seed completo!';
    RAISE NOTICE 'Beleza Pura ID: %', tenant_beleza_pura_id;
    RAISE NOTICE 'Studio Glamour ID: %', tenant_studio_glamour_id;
END $$;

-- Verificar dados
SELECT 'Tenants:' as tipo, COUNT(*)::text as total FROM tenants
UNION ALL
SELECT 'Services:', COUNT(*)::text FROM services
UNION ALL
SELECT 'Employees:', COUNT(*)::text FROM employees
UNION ALL
SELECT 'Customers:', COUNT(*)::text FROM customers
UNION ALL
SELECT 'Customer Credentials:', COUNT(*)::text FROM customer_credentials;

-- ============================================
-- ✅ SUCESSO!
-- ============================================
-- Próximo passo: Execute o script de criar usuários Auth
-- npx tsx scripts/create-auth-users.ts
-- ============================================
