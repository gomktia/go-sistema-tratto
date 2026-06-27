-- CORREÇÃO: CPF correto é 02514504066 (não 02414504066)
-- Deletar registros antigos e inserir com CPF correto

-- 1. Deletar cliente com CPF errado
DELETE FROM customers 
WHERE email = 'anaclaudiastrapasson@hotmail.com' 
  AND document = '02414504066';

-- 2. Inserir Ana Cláudia com CPF CORRETO nas 3 empresas

-- Beleza Pura
INSERT INTO customers (
    tenant_id,
    full_name,
    email,
    phone,
    document,
    birthdate,
    gender,
    status,
    marketing_opt_in,
    created_at,
    updated_at
) VALUES (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Ana Cláudia Strapasson',
    'anaclaudiastrapasson@hotmail.com',
    '5596253807',
    '02514504066',
    '1991-01-19',
    'female',
    'active',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Studio Glamour
INSERT INTO customers (
    tenant_id,
    full_name,
    email,
    phone,
    document,
    birthdate,
    gender,
    status,
    marketing_opt_in,
    created_at,
    updated_at
) VALUES (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Ana Cláudia Strapasson',
    'anaclaudiastrapasson@hotmail.com',
    '5596253807',
    '02514504066',
    '1991-01-19',
    'female',
    'active',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Espaço Elegance
INSERT INTO customers (
    tenant_id,
    full_name,
    email,
    phone,
    document,
    birthdate,
    gender,
    status,
    marketing_opt_in,
    created_at,
    updated_at
) VALUES (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    'Ana Cláudia Strapasson',
    'anaclaudiastrapasson@hotmail.com',
    '5596253807',
    '02514504066',
    '1991-01-19',
    'female',
    'active',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 3. Verificar se foi inserido corretamente
SELECT 
    c.id,
    c.full_name,
    c.email,
    c.phone,
    c.document,
    c.birthdate,
    t.full_name as empresa,
    c.created_at
FROM customers c
JOIN tenants t ON c.tenant_id = t.id
WHERE c.email = 'anaclaudiastrapasson@hotmail.com'
ORDER BY t.name;
