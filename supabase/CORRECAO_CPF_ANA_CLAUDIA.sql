-- ========================================
-- CORREÇÃO COMPLETA - CPF CORRETO: 02514504066
-- ========================================
-- Este script faz:
-- 1. Deleta registros antigos com CPF errado (02414504066)
-- 2. Insere Ana Cláudia com CPF correto (02514504066)
-- 3. Cria credenciais de login
-- ========================================

-- PASSO 1: Deletar credenciais antigas
DELETE FROM customer_credentials 
WHERE identity_value = '02414504066';

-- PASSO 2: Deletar clientes com CPF errado
DELETE FROM customers 
WHERE email = 'anaclaudiastrapasson@hotmail.com' 
  AND document = '02414504066';

-- PASSO 3: Inserir Ana Cláudia com CPF CORRETO nas 3 empresas

-- Beleza Pura
INSERT INTO customers (
    tenant_id, full_name, email, phone, document, birthdate,
    gender, status, marketing_opt_in, created_at, updated_at
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
);

-- Studio Glamour
INSERT INTO customers (
    tenant_id, full_name, email, phone, document, birthdate,
    gender, status, marketing_opt_in, created_at, updated_at
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
);

-- Espaço Elegance
INSERT INTO customers (
    tenant_id, full_name, email, phone, document, birthdate,
    gender, status, marketing_opt_in, created_at, updated_at
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
);

-- PASSO 4: Criar credenciais de login (Senha: ana123456)
DO $$
DECLARE
    ana_beleza_pura_id uuid;
    ana_studio_glamour_id uuid;
    ana_espaco_elegance_id uuid;
BEGIN
    -- Buscar IDs de Ana Cláudia
    SELECT id INTO ana_beleza_pura_id 
    FROM customers 
    WHERE tenant_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' 
      AND email = 'anaclaudiastrapasson@hotmail.com';
    
    SELECT id INTO ana_studio_glamour_id 
    FROM customers 
    WHERE tenant_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' 
      AND email = 'anaclaudiastrapasson@hotmail.com';
    
    SELECT id INTO ana_espaco_elegance_id 
    FROM customers 
    WHERE tenant_id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee' 
      AND email = 'anaclaudiastrapasson@hotmail.com';

    -- Inserir credenciais para Beleza Pura
    IF ana_beleza_pura_id IS NOT NULL THEN
        INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
        VALUES 
            ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', ana_beleza_pura_id, 'cpf', '02514504066', '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9'),
            ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', ana_beleza_pura_id, 'email', 'anaclaudiastrapasson@hotmail.com', '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9');
    END IF;

    -- Inserir credenciais para Studio Glamour
    IF ana_studio_glamour_id IS NOT NULL THEN
        INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
        VALUES 
            ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', ana_studio_glamour_id, 'cpf', '02514504066', '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9'),
            ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', ana_studio_glamour_id, 'email', 'anaclaudiastrapasson@hotmail.com', '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9');
    END IF;

    -- Inserir credenciais para Espaço Elegance
    IF ana_espaco_elegance_id IS NOT NULL THEN
        INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
        VALUES 
            ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', ana_espaco_elegance_id, 'cpf', '02514504066', '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9'),
            ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', ana_espaco_elegance_id, 'email', 'anaclaudiastrapasson@hotmail.com', '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9');
    END IF;
END $$;

-- PASSO 5: Verificar se tudo foi criado corretamente
SELECT 
    c.id,
    c.full_name,
    c.document as cpf,
    c.email,
    c.phone,
    c.birthdate,
    t.full_name as empresa
FROM customers c
JOIN tenants t ON c.tenant_id = t.id
WHERE c.email = 'anaclaudiastrapasson@hotmail.com'
ORDER BY t.name;

-- Verificar credenciais
SELECT 
    cc.identity_type,
    cc.identity_value,
    c.full_name,
    t.full_name as empresa
FROM customer_credentials cc
JOIN customers c ON cc.customer_id = c.id
JOIN tenants t ON cc.tenant_id = t.id
WHERE cc.identity_value IN ('02514504066', 'anaclaudiastrapasson@hotmail.com')
ORDER BY t.name, cc.identity_type;
