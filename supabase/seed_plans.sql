
-- Clean existing plans to avoid duplicates/confusion during dev
DELETE FROM plans;

-- Starter
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

-- Professional
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

-- Enterprise
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
