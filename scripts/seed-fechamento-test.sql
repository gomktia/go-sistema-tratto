-- ============================================================================
-- SCRIPT DE SEED: Dados de Teste para Fechamento
-- ============================================================================
-- Objetivo: Criar appointments concluídos para testar bloqueio de dia fechado
-- Como executar:
--   1. Copie este script
--   2. Cole no Supabase SQL Editor
--   3. Execute
-- ============================================================================

-- CONFIGURAÇÃO: Altere estas variáveis conforme seu ambiente
DO $$
DECLARE
    v_tenant_id uuid;
    v_employee_id uuid;
    v_customer_id uuid;
    v_service_id uuid;
    v_today date := CURRENT_DATE;
BEGIN
    -- 1. BUSCAR OU CRIAR TENANT DE TESTE
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'beleza-pura-demo' LIMIT 1;

    IF v_tenant_id IS NULL THEN
        -- Criar tenant se não existir
        INSERT INTO tenants (id, name, slug, status)
        VALUES (gen_random_uuid(), 'Beleza Pura Demo', 'beleza-pura-demo', 'active')
        RETURNING id INTO v_tenant_id;

        RAISE NOTICE 'Tenant criado: %', v_tenant_id;
    ELSE
        RAISE NOTICE 'Usando tenant existente: %', v_tenant_id;
    END IF;

    -- 2. BUSCAR OU CRIAR PROFISSIONAL
    SELECT id INTO v_employee_id FROM employees
    WHERE tenant_id = v_tenant_id AND status = 'active' LIMIT 1;

    IF v_employee_id IS NULL THEN
        INSERT INTO employees (id, tenant_id, full_name, email, role, status, commission_rate, color_tag)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Maria Silva',
            'maria@belezapura.com',
            'Manicure',
            'active',
            15.0,
            '#EC9F73'
        )
        RETURNING id INTO v_employee_id;

        RAISE NOTICE 'Profissional criado: %', v_employee_id;
    ELSE
        RAISE NOTICE 'Usando profissional existente: %', v_employee_id;
    END IF;

    -- 3. BUSCAR OU CRIAR CLIENTE
    SELECT id INTO v_customer_id FROM customers
    WHERE tenant_id = v_tenant_id LIMIT 1;

    IF v_customer_id IS NULL THEN
        INSERT INTO customers (id, tenant_id, full_name, email, phone, status)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Ana Costa',
            'ana@email.com',
            '11987654321',
            'active'
        )
        RETURNING id INTO v_customer_id;

        RAISE NOTICE 'Cliente criado: %', v_customer_id;
    ELSE
        RAISE NOTICE 'Usando cliente existente: %', v_customer_id;
    END IF;

    -- 4. BUSCAR OU CRIAR SERVIÇO
    SELECT id INTO v_service_id FROM services
    WHERE tenant_id = v_tenant_id AND is_active = true LIMIT 1;

    IF v_service_id IS NULL THEN
        INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, is_active)
        VALUES (
            gen_random_uuid(),
            v_tenant_id,
            'Manicure Completa',
            'Manicure com esmaltação',
            60,
            5000, -- R$ 50,00 em centavos
            true
        )
        RETURNING id INTO v_service_id;

        RAISE NOTICE 'Serviço criado: %', v_service_id;
    ELSE
        RAISE NOTICE 'Usando serviço existente: %', v_service_id;
    END IF;

    -- 5. CRIAR APPOINTMENTS CONCLUÍDOS PARA HOJE
    RAISE NOTICE 'Criando appointments para: %', v_today;

    -- Appointment 1: 09:00 - Concluído, pago com PIX
    INSERT INTO appointments (
        id, tenant_id, customer_id, employee_id, service_id,
        start_at, end_at, duration_minutes,
        price, final_price, discount, payment_method,
        status, channel
    ) VALUES (
        gen_random_uuid(),
        v_tenant_id,
        v_customer_id,
        v_employee_id,
        v_service_id,
        v_today + TIME '09:00:00',
        v_today + TIME '10:00:00',
        60,
        5000, -- preço original
        5000, -- preço final (sem desconto)
        0,    -- desconto
        'pix',
        'completed',
        'admin'
    );

    -- Appointment 2: 10:30 - Concluído, pago em dinheiro com desconto
    INSERT INTO appointments (
        id, tenant_id, customer_id, employee_id, service_id,
        start_at, end_at, duration_minutes,
        price, final_price, discount, payment_method,
        status, channel
    ) VALUES (
        gen_random_uuid(),
        v_tenant_id,
        v_customer_id,
        v_employee_id,
        v_service_id,
        v_today + TIME '10:30:00',
        v_today + TIME '11:30:00',
        60,
        5000, -- preço original
        4500, -- preço final
        500,  -- desconto de R$ 5,00
        'cash',
        'completed',
        'admin'
    );

    -- Appointment 3: 14:00 - Concluído, pago com cartão de crédito
    INSERT INTO appointments (
        id, tenant_id, customer_id, employee_id, service_id,
        start_at, end_at, duration_minutes,
        price, final_price, discount, payment_method,
        status, channel
    ) VALUES (
        gen_random_uuid(),
        v_tenant_id,
        v_customer_id,
        v_employee_id,
        v_service_id,
        v_today + TIME '14:00:00',
        v_today + TIME '15:00:00',
        60,
        5000,
        5000,
        0,
        'credit_card',
        'completed',
        'admin'
    );

    -- Appointment 4: 16:00 - Concluído, pago com cartão de débito
    INSERT INTO appointments (
        id, tenant_id, customer_id, employee_id, service_id,
        start_at, end_at, duration_minutes,
        price, final_price, discount, payment_method,
        status, channel
    ) VALUES (
        gen_random_uuid(),
        v_tenant_id,
        v_customer_id,
        v_employee_id,
        v_service_id,
        v_today + TIME '16:00:00',
        v_today + TIME '17:00:00',
        60,
        5000,
        5000,
        0,
        'debit_card',
        'completed',
        'admin'
    );

    RAISE NOTICE '✅ 4 appointments concluídos criados para hoje!';
    RAISE NOTICE '';
    RAISE NOTICE 'PRÓXIMOS PASSOS:';
    RAISE NOTICE '1. Acesse: http://localhost:3000/beleza-pura-demo/fechamento';
    RAISE NOTICE '2. Selecione a data de HOJE';
    RAISE NOTICE '3. Clique "Fechar o Dia"';
    RAISE NOTICE '4. Vá para agenda e teste o bloqueio!';
    RAISE NOTICE '';
    RAISE NOTICE 'Totais esperados:';
    RAISE NOTICE '- Atendimentos: 4';
    RAISE NOTICE '- Faturamento Bruto: R$ 200,00';
    RAISE NOTICE '- Descontos: R$ 5,00';
    RAISE NOTICE '- Líquido: R$ 195,00';
    RAISE NOTICE '- PIX: R$ 50,00';
    RAISE NOTICE '- Dinheiro: R$ 45,00';
    RAISE NOTICE '- Crédito: R$ 50,00';
    RAISE NOTICE '- Débito: R$ 50,00';

END $$;
