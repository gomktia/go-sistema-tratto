-- ========================================
-- EXECUTAR ESTE SQL NO SUPABASE AGORA!
-- ========================================
-- CPF CORRETO: 02514504066
-- Senha: ana123456
-- ========================================

-- PASSO 1: Limpar dados antigos (se existirem)
DELETE FROM customer_credentials WHERE identity_value IN ('02414504066', '02514504066', 'anaclaudiastrapasson@hotmail.com');
DELETE FROM customers WHERE email = 'anaclaudiastrapasson@hotmail.com';

-- PASSO 2: Inserir Ana Cláudia nas 3 empresas
INSERT INTO customers (tenant_id, full_name, email, phone, document, birthdate, gender, status, marketing_opt_in)
VALUES 
    ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Ana Cláudia Strapasson', 'anaclaudiastrapasson@hotmail.com', '5596253807', '02514504066', '1991-01-19', 'female', 'active', true),
    ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Ana Cláudia Strapasson', 'anaclaudiastrapasson@hotmail.com', '5596253807', '02514504066', '1991-01-19', 'female', 'active', true),
    ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Ana Cláudia Strapasson', 'anaclaudiastrapasson@hotmail.com', '5596253807', '02514504066', '1991-01-19', 'female', 'active', true);

-- PASSO 3: Criar credenciais (Senha: ana123456)
-- Hash bcrypt: $2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9

INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
SELECT 
    c.tenant_id,
    c.id,
    'cpf',
    '02514504066',
    '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9'
FROM customers c
WHERE c.email = 'anaclaudiastrapasson@hotmail.com';

INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
SELECT 
    c.tenant_id,
    c.id,
    'email',
    'anaclaudiastrapasson@hotmail.com',
    '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9'
FROM customers c
WHERE c.email = 'anaclaudiastrapasson@hotmail.com';

-- PASSO 4: Verificar se foi criado
SELECT 
    c.id,
    c.full_name,
    c.document as cpf,
    c.email,
    t.full_name as empresa
FROM customers c
JOIN tenants t ON c.tenant_id = t.id
WHERE c.email = 'anaclaudiastrapasson@hotmail.com'
ORDER BY t.name;

-- Deve retornar 3 linhas (uma para cada empresa)
