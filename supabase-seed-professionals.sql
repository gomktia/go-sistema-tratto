-- ============================================
-- SCRIPT DE DADOS DE TESTE - PROFISSIONAIS
-- ============================================
-- Insere profissionais de exemplo com especialidades
-- ============================================

-- IMPORTANTE:
-- 1. Substitua '1' pelo ID do seu tenant (empresa) se for diferente
-- 2. Execute no SQL Editor do Supabase
-- 3. Este script é SEGURO - não deleta dados existentes
-- ============================================

-- ============================================
-- 1. VERIFICAR TENANT ID DISPONÍVEL
-- ============================================
-- Execute esta query primeiro para ver seus tenants:
-- SELECT id, name, slug FROM tenants;
-- Copie o ID do tenant que você quer usar

-- ============================================
-- 2. INSERIR PROFISSIONAIS
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
    '1', -- ⚠️ SUBSTITUA pelo seu tenant_id
    'Maria Silva',
    'maria.silva@belezapura.com',
    '(11) 98765-4321',
    'Cabeleireira',
    'active',
    '#8B5CF6', -- Roxo
    40, -- 40% de comissão
    '{"accepts_online_booking": true, "specialties": []}'::jsonb
) ON CONFLICT DO NOTHING;

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
    '1', -- ⚠️ SUBSTITUA pelo seu tenant_id
    'Ana Costa',
    'ana.costa@belezapura.com',
    '(11) 98765-1234',
    'Manicure',
    'active',
    '#EC4899', -- Rosa
    50,
    '{"accepts_online_booking": true, "specialties": []}'::jsonb
) ON CONFLICT DO NOTHING;

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
    '1', -- ⚠️ SUBSTITUA pelo seu tenant_id
    'Juliana Santos',
    'juliana.santos@belezapura.com',
    '(11) 98765-5678',
    'Maquiadora',
    'active',
    '#06B6D4', -- Ciano
    45,
    '{"accepts_online_booking": false, "specialties": []}'::jsonb
) ON CONFLICT DO NOTHING;

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
    '1', -- ⚠️ SUBSTITUA pelo seu tenant_id
    'Carlos Mendes',
    'carlos.mendes@belezapura.com',
    '(11) 98765-9012',
    'Barbeiro',
    'active',
    '#10B981', -- Verde
    40,
    '{"accepts_online_booking": true, "specialties": []}'::jsonb
) ON CONFLICT DO NOTHING;

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
    '1', -- ⚠️ SUBSTITUA pelo seu tenant_id
    'Patrícia Lima',
    'patricia.lima@belezapura.com',
    '(11) 98765-3456',
    'Esteticista',
    'active',
    '#F59E0B', -- Laranja
    50,
    '{"accepts_online_booking": true, "specialties": []}'::jsonb
) ON CONFLICT DO NOTHING;

-- ============================================
-- 3. ADICIONAR DISPONIBILIDADES (HORÁRIOS)
-- ============================================

-- Maria Silva - Segunda a Sexta 09:00-18:00, Sábado 09:00-14:00
DO $$
DECLARE
    maria_id text;
BEGIN
    -- Buscar ID da Maria
    SELECT id INTO maria_id FROM employees WHERE email = 'maria.silva@belezapura.com' LIMIT 1;

    IF maria_id IS NOT NULL THEN
        -- Segunda a Sexta
        FOR day IN 1..5 LOOP
            INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
            VALUES ('1', maria_id, day, '09:00', '18:00')
            ON CONFLICT DO NOTHING;
        END LOOP;

        -- Sábado
        INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
        VALUES ('1', maria_id, 6, '09:00', '14:00')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Ana Costa - Segunda a Sexta 10:00-19:00, Sábado 10:00-16:00
DO $$
DECLARE
    ana_id text;
BEGIN
    SELECT id INTO ana_id FROM employees WHERE email = 'ana.costa@belezapura.com' LIMIT 1;

    IF ana_id IS NOT NULL THEN
        FOR day IN 1..5 LOOP
            INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
            VALUES ('1', ana_id, day, '10:00', '19:00')
            ON CONFLICT DO NOTHING;
        END LOOP;

        INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
        VALUES ('1', ana_id, 6, '10:00', '16:00')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Juliana Santos - Segunda a Sexta 08:00-17:00, Sábado 08:00-12:00
DO $$
DECLARE
    juliana_id text;
BEGIN
    SELECT id INTO juliana_id FROM employees WHERE email = 'juliana.santos@belezapura.com' LIMIT 1;

    IF juliana_id IS NOT NULL THEN
        FOR day IN 1..5 LOOP
            INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
            VALUES ('1', juliana_id, day, '08:00', '17:00')
            ON CONFLICT DO NOTHING;
        END LOOP;

        INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
        VALUES ('1', juliana_id, 6, '08:00', '12:00')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Carlos Mendes - Segunda a Sexta 09:00-18:00, Sábado 09:00-15:00
DO $$
DECLARE
    carlos_id text;
BEGIN
    SELECT id INTO carlos_id FROM employees WHERE email = 'carlos.mendes@belezapura.com' LIMIT 1;

    IF carlos_id IS NOT NULL THEN
        FOR day IN 1..5 LOOP
            INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
            VALUES ('1', carlos_id, day, '09:00', '18:00')
            ON CONFLICT DO NOTHING;
        END LOOP;

        INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
        VALUES ('1', carlos_id, 6, '09:00', '15:00')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Patrícia Lima - Segunda a Sexta 09:00-19:00, Sábado 09:00-13:00
DO $$
DECLARE
    patricia_id text;
BEGIN
    SELECT id INTO patricia_id FROM employees WHERE email = 'patricia.lima@belezapura.com' LIMIT 1;

    IF patricia_id IS NOT NULL THEN
        FOR day IN 1..5 LOOP
            INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
            VALUES ('1', patricia_id, day, '09:00', '19:00')
            ON CONFLICT DO NOTHING;
        END LOOP;

        INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time)
        VALUES ('1', patricia_id, 6, '09:00', '13:00')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ============================================
-- 4. VERIFICAÇÃO - Execute para confirmar
-- ============================================

-- Ver profissionais cadastrados
SELECT
    id,
    full_name,
    email,
    role,
    status,
    commission_rate,
    settings->>'accepts_online_booking' as accepts_online_booking,
    jsonb_array_length(COALESCE(settings->'specialties', '[]'::jsonb)) as total_specialties
FROM employees
WHERE tenant_id = '1'
ORDER BY full_name;

-- Ver disponibilidades cadastradas
SELECT
    e.full_name,
    sa.weekday,
    CASE sa.weekday
        WHEN 0 THEN 'Domingo'
        WHEN 1 THEN 'Segunda'
        WHEN 2 THEN 'Terça'
        WHEN 3 THEN 'Quarta'
        WHEN 4 THEN 'Quinta'
        WHEN 5 THEN 'Sexta'
        WHEN 6 THEN 'Sábado'
    END as dia_semana,
    sa.start_time,
    sa.end_time
FROM staff_availability sa
JOIN employees e ON e.id = sa.employee_id
WHERE sa.tenant_id = '1'
ORDER BY e.full_name, sa.weekday;

-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- ✅ 5 profissionais cadastrados
-- ✅ ~30 horários de disponibilidade
-- ✅ Pronto para vincular aos serviços!
-- ============================================

-- PRÓXIMO PASSO:
-- 1. Execute este script no Supabase
-- 2. Acesse /{tenantSlug}/servicos
-- 3. Edite um serviço
-- 4. Na seção "Profissionais Vinculados" você verá:
--    - Maria Silva
--    - Ana Costa
--    - Juliana Santos
--    - Carlos Mendes
--    - Patrícia Lima
-- 5. Marque os profissionais para aquele serviço
-- 6. Salve!
-- ============================================
