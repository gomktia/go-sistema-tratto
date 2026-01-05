-- ============================================
-- SCRIPT SIMPLIFICADO - CRIAR PROFISSIONAIS
-- ============================================
-- 1. Execute: SELECT id FROM tenants;
-- 2. Copie o UUID do seu tenant
-- 3. Cole na linha 10 abaixo (substitua o exemplo)
-- 4. Execute este script completo
-- ============================================

DO $$
DECLARE
    v_tenant_id uuid := 'COLE-SEU-TENANT-ID-AQUI'; -- ⚠️ MUDE APENAS ESTA LINHA!
    maria_id uuid;
    ana_id uuid;
    juliana_id uuid;
    carlos_id uuid;
    patricia_id uuid;
BEGIN
    -- ============================================
    -- INSERIR PROFISSIONAIS
    -- ============================================

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
        'maria.silva@belezapura.com',
        '(11) 98765-4321',
        'Cabeleireira',
        'active',
        '#8B5CF6',
        40,
        '{"accepts_online_booking": true, "specialties": []}'::jsonb
    ) RETURNING id INTO maria_id;

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
        'ana.costa@belezapura.com',
        '(11) 98765-1234',
        'Manicure',
        'active',
        '#EC4899',
        50,
        '{"accepts_online_booking": true, "specialties": []}'::jsonb
    ) RETURNING id INTO ana_id;

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
        'juliana.santos@belezapura.com',
        '(11) 98765-5678',
        'Maquiadora',
        'active',
        '#06B6D4',
        45,
        '{"accepts_online_booking": false, "specialties": []}'::jsonb
    ) RETURNING id INTO juliana_id;

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
        'carlos.mendes@belezapura.com',
        '(11) 98765-9012',
        'Barbeiro',
        'active',
        '#10B981',
        40,
        '{"accepts_online_booking": true, "specialties": []}'::jsonb
    ) RETURNING id INTO carlos_id;

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
        'patricia.lima@belezapura.com',
        '(11) 98765-3456',
        'Esteticista',
        'active',
        '#F59E0B',
        50,
        '{"accepts_online_booking": true, "specialties": []}'::jsonb
    ) RETURNING id INTO patricia_id;

    -- ============================================
    -- ADICIONAR HORÁRIOS DE TRABALHO
    -- ============================================

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

    RAISE NOTICE '✅ 5 profissionais criados com sucesso!';
    RAISE NOTICE '✅ 30 horários de disponibilidade adicionados!';
END $$;

-- ============================================
-- VERIFICAÇÃO - Ver se deu certo
-- ============================================

SELECT
    full_name as "Nome",
    email as "Email",
    role as "Cargo",
    status as "Status",
    settings->>'accepts_online_booking' as "Aceita Online"
FROM employees
ORDER BY full_name;

-- ============================================
-- PRÓXIMO PASSO:
-- ============================================
-- 1. Se aparecer "✅ 5 profissionais criados com sucesso!"
-- 2. Acesse: /{tenantSlug}/servicos
-- 3. Clique em "Configurar" em qualquer serviço
-- 4. Role até "Profissionais Vinculados"
-- 5. Os 5 profissionais devem aparecer agora!
-- ============================================
