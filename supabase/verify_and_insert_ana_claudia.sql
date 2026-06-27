-- Verificar os nomes corretos das empresas (tenants) no banco
SELECT id, name, slug, full_name 
FROM tenants 
ORDER BY created_at;

-- Se os nomes estiverem diferentes, use este SQL corrigido:
-- Primeiro, veja quais são os slugs/names reais:
SELECT id, name, slug, full_name FROM tenants;

-- Depois, insira Ana Cláudia usando os IDs corretos ou slugs corretos
-- Exemplo com slugs corretos (ajuste conforme necessário):
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
)
SELECT 
    t.id as tenant_id,
    'Ana Cláudia Strapasson' as full_name,
    'anaclaudiastrapasson@hotmail.com' as email,
    '5596253807' as phone,
    '02414504066' as document,
    '1991-01-19'::date as birthdate,
    'female' as gender,
    'active' as status,
    true as marketing_opt_in,
    NOW() as created_at,
    NOW() as updated_at
FROM tenants t
WHERE t.slug IN ('beleza-pura', 'espaco-elegance', 'studio-glamour')
   OR t.name IN ('beleza-pura', 'espaco-elegance', 'studio-glamour')
ON CONFLICT DO NOTHING;

-- Verificar se foi inserido:
SELECT 
    c.id,
    c.full_name,
    c.email,
    c.phone,
    c.birthdate,
    t.name as tenant_name,
    t.slug as tenant_slug,
    t.full_name as empresa_nome_completo
FROM customers c
JOIN tenants t ON c.tenant_id = t.id
WHERE c.email = 'anaclaudiastrapasson@hotmail.com'
ORDER BY t.name;
