-- ============================================
-- SCRIPT AUTOMÁTICO - USA O PRIMEIRO TENANT
-- ============================================
-- Este script descobre automaticamente seu tenant_id
-- e cria os profissionais para ele
-- ============================================

DO $$
DECLARE
    v_tenant_id uuid;
    v_tenant_name text;
    maria_id uuid;
    ana_id uuid;
    juliana_id uuid;
    carlos_id uuid;
    patricia_id uuid;
BEGIN
    -- ============================================
    -- DESCOBRIR TENANT AUTOMATICAMENTE
    -- ============================================

    -- Pega o primeiro tenant disponível
    SELECT id, name INTO v_tenant_id, v_tenant_name
    FROM tenants
    ORDER BY created_at DESC
    LIMIT 1;

    -- Verifica se encontrou algum tenant
    IF v_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum tenant encontrado! Crie um tenant primeiro.';
    END IF;

    RAISE NOTICE '📍 Usando tenant: % (ID: %)', v_tenant_name, v_tenant_id;

    -- ============================================
    -- INSERIR PROFISSIONAIS
    -- ============================================

    RAISE NOTICE '👤 Criando profissionais...';

    -- Profissional 1: Maria Silva (Cabeleireira)
    INSERT INTO employees (
        tenant_id,
        full_name,
        email,
        phone,
        role,
        status,
        color_tag,
        commission_rate,
        settings
    ) VALUES (
        v_tenant_id,
        'Maria Silva',
        'maria.silva@' || v_tenant_id || '.com',
        '(11) 98765-4321',
        'Cabeleireira',
        'active',
        '#8B5CF6',
        40,
        '{"accepts_online_booking": true, "specialties": []}'::jsonb
    ) RETURNING id INTO maria_id;
    RAISE NOTICE '  ✓ Maria Silva criada';

    -- Profissional 2: Ana Costa (Manicure)
    INSERT INTO employees (
        tenant_id,
        full_name,
        email,
        phone,
        role,
        status,
        color_tag,
        commission_rate,
        settings
    ) VALUES (
        v_tenant_id,
        'Ana Costa',
        'ana.costa@' || v_tenant_id || '.com',
        '(11) 98765-1234',
        'Manicure',
        'active',
        '#EC4899',
        50,
        '{"accepts_online_booking": true, "specialties": []}'::jsonb
    ) RETURNING id INTO ana_id;
    RAISE NOTICE '  ✓ Ana Costa criada';

    -- Profissional 3: Juliana Santos (Maquiadora)
    INSERT INTO employees (
        tenant_id,
        full_name,
        email,
        phone,
        role,
        status,
        color_tag,
        commission_rate,
        settings
    ) VALUES (
        v_tenant_id,
        'Juliana Santos',
        'juliana.santos@' || v_tenant_id || '.com',
        '(11) 98765-5678',
        'Maquiadora',
        'active',
        '#06B6D4',
        45,
        '{"accepts_online_booking": false, "specialties": []}'::jsonb
    ) RETURNING id INTO juliana_id;
    RAISE NOTICE '  ✓ Juliana Santos criada';

    -- Profissional 4: Carlos Mendes (Barbeiro)
    INSERT INTO employees (
        tenant_id,
        full_name,
        email,
        phone,
        role,
        status,
        color_tag,
        commission_rate,
        settings
    ) VALUES (
        v_tenant_id,
        'Carlos Mendes',
        'carlos.mendes@' || v_tenant_id || '.com',
        '(11) 98765-9012',
        'Barbeiro',
        'active',
        '#10B981',
        40,
        '{"accepts_online_booking": true, "specialties": []}'::jsonb
    ) RETURNING id INTO carlos_id;
    RAISE NOTICE '  ✓ Carlos Mendes criado';

    -- Profissional 5: Patrícia Lima (Esteticista)
    INSERT INTO employees (
        tenant_id,
        full_name,
        email,
        phone,
        role,
        status,
        color_tag,
        commission_rate,
        settings
    ) VALUES (
        v_tenant_id,
        'Patrícia Lima',
        'patricia.lima@' || v_tenant_id || '.com',
        '(11) 98765-3456',
        'Esteticista',
        'active',
        '#F59E0B',
        50,
        '{"accepts_online_booking": true, "specialties": []}'::jsonb
    ) RETURNING id INTO patricia_id;
    RAISE NOTICE '  ✓ Patrícia Lima criada';

    -- ============================================
    -- ADICIONAR HORÁRIOS DE TRABALHO
    -- ============================================

    RAISE NOTICE '⏰ Adicionando horários de trabalho...';

    -- Maria Silva: Segunda a Sexta 09:00-18:00, Sábado 09:00-14:00
    FOR i IN 1..5 LOOP
        INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
        VALUES (v_tenant_id, maria_id, i, '09:00', '18:00');
    END LOOP;
    INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
    VALUES (v_tenant_id, maria_id, 6, '09:00', '14:00');

    -- Ana Costa: Segunda a Sexta 10:00-19:00, Sábado 10:00-16:00
    FOR i IN 1..5 LOOP
        INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
        VALUES (v_tenant_id, ana_id, i, '10:00', '19:00');
    END LOOP;
    INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
    VALUES (v_tenant_id, ana_id, 6, '10:00', '16:00');

    -- Juliana Santos: Segunda a Sexta 08:00-17:00, Sábado 08:00-12:00
    FOR i IN 1..5 LOOP
        INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
        VALUES (v_tenant_id, juliana_id, i, '08:00', '17:00');
    END LOOP;
    INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
    VALUES (v_tenant_id, juliana_id, 6, '08:00', '12:00');

    -- Carlos Mendes: Segunda a Sexta 09:00-18:00, Sábado 09:00-15:00
    FOR i IN 1..5 LOOP
        INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
        VALUES (v_tenant_id, carlos_id, i, '09:00', '18:00');
    END LOOP;
    INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
    VALUES (v_tenant_id, carlos_id, 6, '09:00', '15:00');

    -- Patrícia Lima: Segunda a Sexta 09:00-19:00, Sábado 09:00-13:00
    FOR i IN 1..5 LOOP
        INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
        VALUES (v_tenant_id, patricia_id, i, '09:00', '19:00');
    END LOOP;
    INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
    VALUES (v_tenant_id, patricia_id, 6, '09:00', '13:00');

    -- ============================================
    -- SUCESSO!
    -- ============================================

    RAISE NOTICE '';
    RAISE NOTICE '🎉 SUCESSO!';
    RAISE NOTICE '✅ 5 profissionais criados';
    RAISE NOTICE '✅ 30 horários de disponibilidade';
    RAISE NOTICE '✅ Tenant: %', v_tenant_name;
    RAISE NOTICE '';
    RAISE NOTICE '📋 PRÓXIMO PASSO:';
    RAISE NOTICE '   Acesse: /%/servicos', (SELECT slug FROM tenants WHERE id = v_tenant_id);
    RAISE NOTICE '   e vincule os profissionais aos serviços!';
END $$;

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================

SELECT
    '✅ PROFISSIONAIS CRIADOS' as status,
    COUNT(*) as total
FROM employees
WHERE tenant_id = (SELECT id FROM tenants ORDER BY created_at DESC LIMIT 1);

SELECT
    full_name as "👤 Nome",
    role as "💼 Cargo",
    phone as "📞 Telefone",
    status as "Status"
FROM employees
WHERE tenant_id = (SELECT id FROM tenants ORDER BY created_at DESC LIMIT 1)
ORDER BY full_name;
