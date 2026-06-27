
-- Garantir tabela customers (Clientes Finais do Tenant)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    document TEXT, -- CPF
    birth_date DATE,
    notes TEXT,
    status TEXT DEFAULT 'active', -- active, blocked, inactive
    loyalty_points INTEGER DEFAULT 0,
    total_spent DECIMAL(10, 2) DEFAULT 0,
    last_visit_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Garantir tabela customer_credentials (Auth customizado por tenant)
CREATE TABLE IF NOT EXISTS customer_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    identity_type TEXT NOT NULL, -- 'email', 'cpf', 'phone'
    identity_value TEXT NOT NULL,
    secret_hash TEXT, -- bcrypt hash
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, identity_type, identity_value)
);

-- Garantir tabela appointments (Agendamentos)
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    service_id UUID REFERENCES services(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    start_at TIMESTAMP WITH TIME ZONE NOT NULL,
    end_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER NOT NULL,
    status TEXT DEFAULT 'scheduled', -- scheduled, confirmed, completed, cancelled, no_show
    price DECIMAL(10, 2),
    currency TEXT DEFAULT 'BRL',
    notes TEXT,
    channel TEXT DEFAULT 'manual', -- manual, online_booking, whatsapp
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Policies para Customers (Público pode criar, mas só ler o próprio se logado - aqui simplificado para MVP)
-- MVP: Permitir anon ler customers (cuidado com vazamento de dados, mas necessário para validação de CPF no front atual)
-- IDEALMENTE: Mudar lógica do front para usar RPC. Para agora: permitir leitura limitada.

CREATE POLICY "Public can select customers by document for login check" ON customers
FOR SELECT
USING (true); -- Muito permissivo, mas o código atual do front faz select direto na tabela customers para verificar se CPF existe.

CREATE POLICY "Public can insert customers (Register)" ON customers
FOR INSERT
WITH CHECK (true);

-- Policies para Credentials
CREATE POLICY "Public can read credentials for login check" ON customer_credentials
FOR SELECT
USING (true); -- EXTREMAMENTE PERIGOSO EM PROD REAL (expõe hashes). Necessário para o código atual funcionar.

CREATE POLICY "Public can insert credentials (Register)" ON customer_credentials
FOR INSERT
WITH CHECK (true);

-- Policies para Appointments
CREATE POLICY "Public can insert appointments" ON appointments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can read own appointments" ON appointments
FOR SELECT
USING (true); -- Permite frontend checar conflitos de agenda.
