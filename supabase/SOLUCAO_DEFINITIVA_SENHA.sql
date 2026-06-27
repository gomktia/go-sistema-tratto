-- ========================================
-- SOLUÇÃO DEFINITIVA - Senha Ana Cláudia
-- ========================================

-- Deletar TODAS as credenciais antigas
DELETE FROM customer_credentials 
WHERE customer_id IN (
    SELECT id FROM customers WHERE email = 'anaclaudiastrapasson@hotmail.com'
);

-- Inserir credenciais CORRETAS com senha em texto plano
-- Senha: ana123456

INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
SELECT 
    c.tenant_id,
    c.id,
    'cpf',
    '02514504066',
    'ana123456'  -- Texto plano, o código aceita isso
FROM customers c
WHERE c.email = 'anaclaudiastrapasson@hotmail.com';

INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
SELECT 
    c.tenant_id,
    c.id,
    'email',
    'anaclaudiastrapasson@hotmail.com',
    'ana123456'  -- Texto plano, o código aceita isso
FROM customers c
WHERE c.email = 'anaclaudiastrapasson@hotmail.com';

-- Verificar o que foi criado
SELECT 
    cc.id,
    cc.identity_type,
    cc.identity_value,
    cc.secret_hash,
    c.full_name,
    c.document,
    t.name as empresa
FROM customer_credentials cc
JOIN customers c ON cc.customer_id = c.id
JOIN tenants t ON cc.tenant_id = t.id
WHERE c.email = 'anaclaudiastrapasson@hotmail.com'
ORDER BY t.name, cc.identity_type;

-- Deve mostrar 6 linhas (3 empresas x 2 tipos de credencial)
-- secret_hash deve ser 'ana123456' em todas
