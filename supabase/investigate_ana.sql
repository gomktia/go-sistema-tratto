
-- Investigação do Agendamento da Ana Cláudia

DO $$
DECLARE
    v_tenant_id UUID;
    v_customer_id UUID;
    v_customer_email TEXT := 'anaclaudia@example.com'; -- Ajustar se souber o email correto, vou tentar buscar por nome tb
BEGIN
    RAISE NOTICE '--- INICIANDO INVESTIGACAO ---';

    -- 1. Buscar Tenant 'Beleza Pura'
    SELECT id INTO v_tenant_id FROM tenants WHERE name ILIKE '%Beleza Pura%' LIMIT 1;
    IF v_tenant_id IS NULL THEN
        RAISE NOTICE 'Tenant Beleza Pura nao encontrado.';
        RETURN;
    END IF;
    RAISE NOTICE 'Tenant ID (Beleza Pura): %', v_tenant_id;

    -- 2. Buscar Cliente Ana Cláudia
    -- Tentando buscar por nome aproximado no tenant correto
    SELECT id INTO v_customer_id 
    FROM customers 
    WHERE tenant_id = v_tenant_id 
    AND full_name ILIKE '%Ana Cláudia Strapasson%' 
    LIMIT 1;

    IF v_customer_id IS NULL THEN
        RAISE NOTICE 'Cliente Ana Cláudia nao encontrada no tenant Beleza Pura.';
        -- Tentar buscar em todos os tenants para ver se foi criado errado
        FOR v_customer_id IN SELECT id FROM customers WHERE full_name ILIKE '%Ana Cláudia Strapasson%' LOOP
             RAISE NOTICE 'AVISO: Cliente encontrada em outro tenant ou duplicada. ID: %', v_customer_id;
        END LOOP;
        RETURN;
    END IF;
    RAISE NOTICE 'Cliente ID: %', v_customer_id;

    -- 3. Listar Agendamentos
    RAISE NOTICE '--- AGENDAMENTOS ENCONTRADOS ---';
    FOR v_customer_id IN 
        SELECT id 
        FROM appointments 
        WHERE customer_id = v_customer_id 
    LOOP
        RAISE NOTICE 'Agendamento ID: %', v_customer_id;
    END LOOP;

    -- Query detalhada para visualizacao (nao conseguimos ver resultset de DO block facilmente, entao vou fazer selects diretos abaixo)
END $$;

-- SELECTS PARA VISUALIZACAO DIRETA DOS DADOS
SELECT t.name as tenant_name, c.full_name, c.email, a.start_at, a.status, e.full_name as employee_name, s.name as service_name
FROM appointments a
JOIN customers c ON a.customer_id = c.id
JOIN tenants t ON a.tenant_id = t.id
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN employees e ON a.employee_id = e.id
WHERE c.full_name ILIKE '%Ana Cláudia Strapasson%';
