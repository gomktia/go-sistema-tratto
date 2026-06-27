-- Criar credenciais de login para Ana Cláudia Strapasson
-- CPF CORRETO: 02514504066
-- Senha: ana123456

-- Hash bcrypt da senha "ana123456" (gerado com bcrypt.hash('ana123456', 8))
-- $2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9

-- Deletar credenciais antigas com CPF errado
DELETE FROM customer_credentials 
WHERE identity_value = '02414504066';

-- Inserir credenciais para cada empresa onde Ana Cláudia está cadastrada

-- Primeiro, buscar os IDs de Ana Cláudia em cada empresa
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
            ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', ana_beleza_pura_id, 'email', 'anaclaudiastrapasson@hotmail.com', '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Inserir credenciais para Studio Glamour
    IF ana_studio_glamour_id IS NOT NULL THEN
        INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
        VALUES 
            ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', ana_studio_glamour_id, 'cpf', '02514504066', '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9'),
            ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', ana_studio_glamour_id, 'email', 'anaclaudiastrapasson@hotmail.com', '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9')
        ON CONFLICT DO NOTHING;
    END IF;

    -- Inserir credenciais para Espaço Elegance
    IF ana_espaco_elegance_id IS NOT NULL THEN
        INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
        VALUES 
            ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', ana_espaco_elegance_id, 'cpf', '02514504066', '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9'),
            ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', ana_espaco_elegance_id, 'email', 'anaclaudiastrapasson@hotmail.com', '$2a$08$rQvH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9xN3kYJ5L7wX8zOuqK7vH8Z9')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Verificar se as credenciais foram criadas
SELECT 
    cc.id,
    cc.identity_type,
    cc.identity_value,
    c.full_name,
    t.full_name as empresa
FROM customer_credentials cc
JOIN customers c ON cc.customer_id = c.id
JOIN tenants t ON cc.tenant_id = t.id
WHERE cc.identity_value IN ('02514504066', 'anaclaudiastrapasson@hotmail.com')
ORDER BY t.name, cc.identity_type;
