-- Migration: Employee Service Commissions (Exceções de Comissão)
-- Sobrescreve a comissão padrão do profissional para serviços específicos

CREATE TABLE IF NOT EXISTS employee_service_commissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    commission_rate numeric NOT NULL, -- taxa específica (%), sobrescreve o padrão
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    -- Validação: comissão entre 0 e 100%
    CONSTRAINT valid_commission_rate CHECK (commission_rate >= 0 AND commission_rate <= 100),
    -- Uma exceção por profissional+serviço
    CONSTRAINT uq_employee_service UNIQUE(employee_id, service_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_employee_service_commissions_tenant ON employee_service_commissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_service_commissions_employee ON employee_service_commissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_service_commissions_service ON employee_service_commissions(service_id);

-- RLS (Row Level Security)
ALTER TABLE employee_service_commissions ENABLE ROW LEVEL SECURITY;

-- Tenant Isolation Policies
-- Leitura: autenticado vê apenas o próprio tenant (ou super_admin vê tudo)
CREATE POLICY "employee_service_commissions_select_tenant" ON employee_service_commissions
  FOR SELECT TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Insert: só pode inserir exceção no próprio tenant
CREATE POLICY "employee_service_commissions_insert_tenant" ON employee_service_commissions
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Update: só pode alterar exceção do próprio tenant
CREATE POLICY "employee_service_commissions_update_tenant" ON employee_service_commissions
  FOR UPDATE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  )
  WITH CHECK (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Delete: só pode remover exceção do próprio tenant
CREATE POLICY "employee_service_commissions_delete_tenant" ON employee_service_commissions
  FOR DELETE TO authenticated
  USING (
    tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
  );

-- Comentários
COMMENT ON TABLE employee_service_commissions IS 'Exceções de comissão: taxas específicas por profissional+serviço que sobrescrevem a taxa padrão';
COMMENT ON COLUMN employee_service_commissions.commission_rate IS 'Taxa de comissão específica (%) para este serviço, sobrescreve employees.commission_rate';
COMMENT ON CONSTRAINT uq_employee_service ON employee_service_commissions IS 'Apenas uma exceção por profissional+serviço';
