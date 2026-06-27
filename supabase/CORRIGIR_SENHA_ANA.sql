-- ========================================
-- CORRIGIR SENHA DE ANA CLÁUDIA
-- ========================================
-- Vamos usar senha em TEXTO PLANO para teste
-- Em produção, SEMPRE use bcrypt hash!
-- ========================================

-- OPÇÃO 1: Atualizar credenciais com senha em texto plano (APENAS PARA TESTE)
UPDATE customer_credentials
SET secret_hash = 'ana123456'
WHERE identity_value IN ('02514504066', 'anaclaudiastrapasson@hotmail.com');

-- Verificar
SELECT 
    cc.identity_type,
    cc.identity_value,
    cc.secret_hash,
    c.full_name,
    t.full_name as empresa
FROM customer_credentials cc
JOIN customers c ON cc.customer_id = c.id
JOIN tenants t ON cc.tenant_id = t.id
WHERE cc.identity_value IN ('02514504066', 'anaclaudiastrapasson@hotmail.com')
ORDER BY t.name, cc.identity_type;

-- Deve mostrar secret_hash = 'ana123456' (texto plano)
