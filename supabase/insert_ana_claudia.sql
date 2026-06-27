-- Inserir cliente Ana Cláudia Strapasson nas 3 empresas principais

-- Beleza Pura (tenant_id será obtido da query)
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
WHERE t.name IN ('beleza-pura', 'espaco-elegance', 'studio-glamour')
ON CONFLICT DO NOTHING;

-- Verificar se foi inserido
SELECT 
    c.id,
    c.full_name,
    c.email,
    c.phone,
    c.birthdate,
    t.name as empresa
FROM customers c
JOIN tenants t ON c.tenant_id = t.id
WHERE c.email = 'anaclaudiastrapasson@hotmail.com'
ORDER BY t.name;
