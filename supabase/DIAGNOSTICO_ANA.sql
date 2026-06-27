-- ========================================
-- DIAGNÓSTICO - Ver o que está no banco
-- ========================================

-- 1. Ver Ana Cláudia na tabela customers
SELECT 
    c.id,
    c.tenant_id,
    c.full_name,
    c.document,
    c.email,
    t.name as tenant_name
FROM customers c
JOIN tenants t ON c.tenant_id = t.id
WHERE c.email = 'anaclaudiastrapasson@hotmail.com'
ORDER BY t.name;

-- 2. Ver credenciais de Ana Cláudia
SELECT 
    cc.id,
    cc.tenant_id,
    cc.customer_id,
    cc.identity_type,
    cc.identity_value,
    cc.secret_hash,
    LENGTH(cc.secret_hash) as hash_length,
    SUBSTRING(cc.secret_hash, 1, 10) as hash_preview
FROM customer_credentials cc
WHERE cc.identity_value IN ('02514504066', 'anaclaudiastrapasson@hotmail.com')
ORDER BY cc.identity_type;

-- 3. Contar quantas credenciais existem
SELECT 
    COUNT(*) as total_credenciais,
    identity_type
FROM customer_credentials
WHERE identity_value IN ('02514504066', 'anaclaudiastrapasson@hotmail.com')
GROUP BY identity_type;
