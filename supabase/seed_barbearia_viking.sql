
-- ==============================================================================
-- 0. CORREÇÃO DE SCHEMA (GARANTIR TODAS AS COLUNAS NECESSÁRIAS)
-- ==============================================================================

-- Tabela TENANTS
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_id UUID REFERENCES plans(id) ON DELETE SET NULL;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{}'::jsonb;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;

-- Tabela REVIEWS (Depoimentos)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS professional_id UUID REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES services(id) ON DELETE SET NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS comment TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;

-- CORREÇÃO CRÍTICA: Se a coluna appointment_id existir e for NOT NULL, precisamos alterá-la para permitir NULL
-- pois depoimentos genéricos podem não estar ligados a um agendamento específico nesta fase.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reviews' AND column_name = 'appointment_id') THEN
        ALTER TABLE reviews ALTER COLUMN appointment_id DROP NOT NULL;
    END IF;
END $$;


-- ==============================================================================
-- 1. CRIAR O NOVO TENANT (Barbearia Viking)
-- ==============================================================================
DO $$
DECLARE
    new_tenant_id UUID;
    viking_plan_id UUID;
    emp_ragnar UUID;
    emp_bjorn UUID;
    emp_lagertha UUID;
    srv_corte_viking UUID;
    srv_barba_lenhador UUID;
    srv_hidratacao_couro UUID;
    prod_oleo UUID;
    prod_pomada UUID;
    cli_erik UUID;
    cli_olaf UUID;
    cli_astrid UUID;
    cli_ivar UUID;
    cli_sigrid UUID;
BEGIN
    -- Obter plano Enterprise (ou criar se não existir) para ter todos recursos
    SELECT id INTO viking_plan_id FROM plans WHERE name = 'Enterprise' LIMIT 1;
    
    IF viking_plan_id IS NULL THEN
        -- Fallback: Se não existe plano, cria um básico na hora para não falhar
        INSERT INTO plans (name, price, features) VALUES ('Enterprise', 299.90, '["multi_user", "analytics", "api"]') RETURNING id INTO viking_plan_id;
    END IF;

    -- Inserir Tenant (Verificando se já existe primeiro para não duplicar erro)
    SELECT id INTO new_tenant_id FROM tenants WHERE slug = 'barbearia-viking';
    
    IF new_tenant_id IS NOT NULL THEN
       -- Se já existe, só atualizamos para garantir configurações
       UPDATE tenants SET 
            plan_id = viking_plan_id,
            status = 'active',
            full_name = 'Barbearia Viking & Pub',
            theme = '{"primary": "#F59E0B", "secondary": "#1F2937"}',
            logo_url = 'https://img.freepik.com/premium-vector/viking-barber-shop-logo-design-template_445279-139.jpg',
            settings = '{"description": "Estilo nórdico para homens modernos. Cerveja gelada e barba afiada.", "whatsapp": "5511999998888", "address": "Rua Valhalla, 777 - Asgard", "scheduling_type": "individual"}'
       WHERE id = new_tenant_id;
    ELSE
        INSERT INTO tenants (name, slug, plan_id, status, full_name, logo_url, theme, settings)
        VALUES (
            'Barbearia Viking', 
            'barbearia-viking', 
            viking_plan_id, 
            'active', 
            'Barbearia Viking & Pub', 
            'https://img.freepik.com/premium-vector/viking-barber-shop-logo-design-template_445279-139.jpg', 
            '{"primary": "#F59E0B", "secondary": "#1F2937"}', 
            '{"description": "Estilo nórdico para homens modernos. Cerveja gelada e barba afiada.", "whatsapp": "5511999998888", "address": "Rua Valhalla, 777 - Asgard", "scheduling_type": "individual"}'
        )
        RETURNING id INTO new_tenant_id;
    END IF;

    -- Limpar dados antigos desse tenant se for re-seed
    DELETE FROM employees WHERE tenant_id = new_tenant_id;
    DELETE FROM services WHERE tenant_id = new_tenant_id;
    DELETE FROM products WHERE tenant_id = new_tenant_id;
    DELETE FROM customers WHERE tenant_id = new_tenant_id;
    DELETE FROM appointments WHERE tenant_id = new_tenant_id; 
    DELETE FROM reviews WHERE tenant_id = new_tenant_id; -- Limpar reviews tb

    -- 2. Criar Funcionários (Equipe Viking)
    INSERT INTO employees (tenant_id, full_name, role, email, commission_rate, settings) VALUES 
    (new_tenant_id, 'Ragnar Lothbrok', 'Mestre Barbeiro', 'ragnar@viking.com', 50, '{"specialties": ["corte", "barba"]}') RETURNING id INTO emp_ragnar;

    INSERT INTO employees (tenant_id, full_name, role, email, commission_rate, settings) VALUES 
    (new_tenant_id, 'Bjorn Ironside', 'Barbeiro Sênior', 'bjorn@viking.com', 45, '{"specialties": ["corte", "barba"]}') RETURNING id INTO emp_bjorn;

    INSERT INTO employees (tenant_id, full_name, role, email, commission_rate, settings) VALUES 
    (new_tenant_id, 'Lagertha Shieldmaiden', 'Espec. Capilar', 'lagertha@viking.com', 45, '{"specialties": ["tratamento", "corte"]}') RETURNING id INTO emp_lagertha;

    -- Disponibilidade (Horários) - Ragnar trampa muito
    INSERT INTO staff_availability (tenant_id, employee_id, weekday, start_time, end_time, is_active) VALUES
    (new_tenant_id, emp_ragnar, 1, '10:00', '20:00', true), -- Seg
    (new_tenant_id, emp_ragnar, 2, '10:00', '20:00', true), -- Ter
    (new_tenant_id, emp_ragnar, 3, '10:00', '20:00', true), -- Qua
    (new_tenant_id, emp_ragnar, 4, '10:00', '22:00', true), -- Qui
    (new_tenant_id, emp_ragnar, 5, '10:00', '22:00', true), -- Sex
    (new_tenant_id, emp_ragnar, 6, '09:00', '19:00', true); -- Sab

    -- 3. Criar Serviços Temáticos
    INSERT INTO services (tenant_id, name, description, price, duration_minutes, is_active) VALUES
    (new_tenant_id, 'Corte Viking (Degradê)', 'Corte moderno com navalha e toalha quente.', 60.00, 45, true) RETURNING id INTO srv_corte_viking;

    INSERT INTO services (tenant_id, name, description, price, duration_minutes, is_active) VALUES
    (new_tenant_id, 'Barba de Lenhador', 'Modelagem completa, hidratação de pele e óleo.', 45.00, 30, true) RETURNING id INTO srv_barba_lenhador;

    INSERT INTO services (tenant_id, name, description, price, duration_minutes, is_active) VALUES
    (new_tenant_id, 'Hidratação Valhalla', 'Tratamento profundo para couro cabeludo.', 80.00, 40, true) RETURNING id INTO srv_hidratacao_couro;

    -- Combo (Service Upsell)
    INSERT INTO combos (tenant_id, name, description, original_price, price, category) VALUES
    (new_tenant_id, 'Odin Completo', 'Corte + Barba + Cerveja Artesanal inclusa.', 105.00, 90.00, 'pacotes');

    -- 4. Criar Produtos (Venda/Estoque)
    INSERT INTO products (tenant_id, name, description, price, stock_quantity, min_stock, is_active) VALUES
    (new_tenant_id, 'Óleo de Barba Odin', 'Hidratação e brilho intenso.', 35.00, 50, 10, true) RETURNING id INTO prod_oleo;

    INSERT INTO products (tenant_id, name, description, price, stock_quantity, min_stock, is_active) VALUES
    (new_tenant_id, 'Pomada Modeladora Thor', 'Fixação forte efeito matte.', 40.00, 30, 5, true) RETURNING id INTO prod_pomada;

    -- 5. Criar Clientes Diversos
    INSERT INTO customers (tenant_id, full_name, email, phone, status, total_spent, last_visit_at) VALUES
    (new_tenant_id, 'Erik O Vermelho', 'erik@nordic.com', '11999990001', 'active', 450.00, NOW() - INTERVAL '5 days') RETURNING id INTO cli_erik;
    
    INSERT INTO customers (tenant_id, full_name, email, phone, status, total_spent, last_visit_at) VALUES
    (new_tenant_id, 'Olaf One-Eye', 'olaf@nordic.com', '11999990002', 'active', 1200.00, NOW() - INTERVAL '2 days') RETURNING id INTO cli_olaf; -- VIP

    INSERT INTO customers (tenant_id, full_name, email, phone, status, total_spent, last_visit_at) VALUES
    (new_tenant_id, 'Astrid Hofferson', 'astrid@nordic.com', '11999990003', 'active', 80.00, NOW() - INTERVAL '20 days') RETURNING id INTO cli_astrid;

    INSERT INTO customers (tenant_id, full_name, email, phone, status, total_spent, last_visit_at) VALUES
    (new_tenant_id, 'Ivar The Boneless', 'ivar@nordic.com', '11999990004', 'inactive', 0.00, NULL) RETURNING id INTO cli_ivar; -- Novo/Churned

     INSERT INTO customers (tenant_id, full_name, email, phone, status, total_spent, last_visit_at) VALUES
    (new_tenant_id, 'Sigrid A Altiva', 'sigrid@nordic.com', '11999990005', 'active', 300.00, NOW() - INTERVAL '1 day') RETURNING id INTO cli_sigrid;

    -- 6. Gerar Histórico de Agendamentos (Passado e Futuro)
    
    -- Passado (Completed)
    INSERT INTO appointments (tenant_id, customer_id, employee_id, service_id, start_at, end_at, duration_minutes, status, price, channel) VALUES
    (new_tenant_id, cli_olaf, emp_ragnar, srv_corte_viking, NOW() - INTERVAL '2 days' + TIME '14:00', NOW() - INTERVAL '2 days' + TIME '14:45', 45, 'completed', 60.00, 'online_booking');

    INSERT INTO appointments (tenant_id, customer_id, employee_id, service_id, start_at, end_at, duration_minutes, status, price, channel) VALUES
    (new_tenant_id, cli_olaf, emp_ragnar, srv_barba_lenhador, NOW() - INTERVAL '2 days' + TIME '14:45', NOW() - INTERVAL '2 days' + TIME '15:15', 30, 'completed', 45.00, 'online_booking');

    INSERT INTO appointments (tenant_id, customer_id, employee_id, service_id, start_at, end_at, duration_minutes, status, price, channel) VALUES
    (new_tenant_id, cli_erik, emp_bjorn, srv_corte_viking, NOW() - INTERVAL '5 days' + TIME '10:00', NOW() - INTERVAL '5 days' + TIME '10:45', 45, 'completed', 60.00, 'whatsapp');

    INSERT INTO appointments (tenant_id, customer_id, employee_id, service_id, start_at, end_at, duration_minutes, status, price, channel) VALUES
    (new_tenant_id, cli_sigrid, emp_lagertha, srv_hidratacao_couro, NOW() - INTERVAL '1 day' + TIME '16:00', NOW() - INTERVAL '1 day' + TIME '16:40', 40, 'completed', 80.00, 'online_booking');

    -- Futuro (Scheduled)
    INSERT INTO appointments (tenant_id, customer_id, employee_id, service_id, start_at, end_at, duration_minutes, status, price, channel) VALUES
    (new_tenant_id, cli_astrid, emp_lagertha, srv_corte_viking, NOW() + INTERVAL '1 day' + TIME '11:00', NOW() + INTERVAL '1 day' + TIME '11:45', 45, 'scheduled', 60.00, 'manual');

    INSERT INTO appointments (tenant_id, customer_id, employee_id, service_id, start_at, end_at, duration_minutes, status, price, channel) VALUES
    (new_tenant_id, cli_olaf, emp_ragnar, srv_barba_lenhador, NOW() + INTERVAL '3 days' + TIME '18:00', NOW() + INTERVAL '3 days' + TIME '18:30', 30, 'scheduled', 45.00, 'online_booking');

     -- 7. Reviews/Depoimentos (Agora com a tabela corrigida acima)
     INSERT INTO reviews (tenant_id, professional_id, service_id, customer_email, rating, comment, is_approved) VALUES
     (new_tenant_id, emp_ragnar, srv_corte_viking, 'olaf@nordic.com', 5, 'Melhor corte de Asgard! Ragnar é uma lenda.', true);

     INSERT INTO reviews (tenant_id, professional_id, service_id, customer_email, rating, comment, is_approved) VALUES
     (new_tenant_id, emp_lagertha, srv_hidratacao_couro, 'sigrid@nordic.com', 5, 'Ambiente incrível e atendimento de primeira.', true);

END $$;
