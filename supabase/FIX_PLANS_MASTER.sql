
-- ==============================================================================
-- MASTER SCRIPT: UPDATE PLANS SAFELY
-- ==============================================================================

-- 1. Ensure Table Structure & Permissions
ALTER TABLE plans ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access (if policy doesn't exist, we create it)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'Public plans are viewable by everyone'
    ) THEN
        CREATE POLICY "Public plans are viewable by everyone" 
        ON plans FOR SELECT 
        USING (true);
    END IF;
END $$;

-- Allow authenticated admins to manage (simplified for now)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'plans' AND policyname = 'Admins can manage plans'
    ) THEN
        CREATE POLICY "Admins can manage plans" 
        ON plans FOR ALL 
        USING (auth.role() = 'authenticated');
    END IF;
END $$;


-- 2. UPSERT PLANS (Update or Insert without deleting)

-- STARTER
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM plans WHERE code = 'starter' OR name = 'Starter') THEN
        UPDATE plans SET 
            price = 197.00,
            description = 'Ideal para salões iniciantes',
            features = '["Até 3 profissionais", "1 unidade/sala", "Portal de agendamento online", "Loja online básica", "Envio de promoções", "CRM básico", "Suporte por email"]'::jsonb,
            limits = '{"maxEmployees": 3, "maxAppointments": -1}'::jsonb,
            metadata = '{"popular": false, "cta": "Começar agora"}'::jsonb,
            is_active = true
        WHERE code = 'starter' OR name = 'Starter';
    ELSE
        INSERT INTO plans (name, code, description, price, currency, billing_cycle, features, limits, is_active, metadata)
        VALUES (
            'Starter',
            'starter',
            'Ideal para salões iniciantes',
            197.00,
            'BRL',
            'monthly',
            '["Até 3 profissionais", "1 unidade/sala", "Portal de agendamento online", "Loja online básica", "Envio de promoções", "CRM básico", "Suporte por email"]'::jsonb,
            '{"maxEmployees": 3, "maxAppointments": -1}'::jsonb,
            true,
            '{"popular": false, "cta": "Começar agora"}'::jsonb
        );
    END IF;
END $$;

-- PROFESSIONAL
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM plans WHERE code = 'professional' OR name = 'Professional') THEN
        UPDATE plans SET 
            price = 397.00,
            description = 'Para salões em crescimento',
            features = '["Profissionais ilimitados", "Até 3 unidades/salas", "Portal completo do cliente", "Loja online avançada", "Marketing automático", "WhatsApp Business API", "Programa de fidelidade", "Suporte prioritário 24/7"]'::jsonb,
            limits = '{"maxEmployees": -1, "maxAppointments": -1}'::jsonb,
            metadata = '{"popular": true, "cta": "Testar 14 dias grátis"}'::jsonb,
            is_active = true
        WHERE code = 'professional' OR name = 'Professional';
    ELSE
        INSERT INTO plans (name, code, description, price, currency, billing_cycle, features, limits, is_active, metadata)
        VALUES (
            'Professional',
            'professional',
            'Para salões em crescimento',
            397.00,
            'BRL',
            'monthly',
            '["Profissionais ilimitados", "Até 3 unidades/salas", "Portal completo do cliente", "Loja online avançada", "Marketing automático", "WhatsApp Business API", "Programa de fidelidade", "Suporte prioritário 24/7"]'::jsonb,
            '{"maxEmployees": -1, "maxAppointments": -1}'::jsonb,
            true,
            '{"popular": true, "cta": "Testar 14 dias grátis"}'::jsonb
        );
    END IF;
END $$;

-- ENTERPRISE
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM plans WHERE code = 'enterprise' OR name = 'Enterprise') THEN
        UPDATE plans SET 
            price = 0.00,
            description = 'Redes e franquias',
            features = '["Tudo do Professional", "Unidades ilimitadas", "Multi-lojas/franquias", "API customizada", "White label completo", "Gerente de conta dedicado", "SLA 99.9% garantido", "Treinamento presencial"]'::jsonb,
            limits = '{"maxEmployees": -1, "maxAppointments": -1}'::jsonb,
            metadata = '{"popular": false, "cta": "Falar com vendas", "displayPrice": "Custom"}'::jsonb,
            is_active = true
        WHERE code = 'enterprise' OR name = 'Enterprise';
    ELSE
        INSERT INTO plans (name, code, description, price, currency, billing_cycle, features, limits, is_active, metadata)
        VALUES (
            'Enterprise',
            'enterprise',
            'Redes e franquias',
            0.00,
            'BRL',
            'monthly',
            '["Tudo do Professional", "Unidades ilimitadas", "Multi-lojas/franquias", "API customizada", "White label completo", "Gerente de conta dedicado", "SLA 99.9% garantido", "Treinamento presencial"]'::jsonb,
            '{"maxEmployees": -1, "maxAppointments": -1}'::jsonb,
            true,
            '{"popular": false, "cta": "Falar com vendas", "displayPrice": "Custom"}'::jsonb
        );
    END IF;
END $$;
