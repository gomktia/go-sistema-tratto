-- Migration: Employee Unavailability (Bloqueios de Agenda)
-- Cadastro de férias, folgas, atestados e bloqueios manuais

CREATE TABLE IF NOT EXISTS employee_unavailability (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reason text NOT NULL, -- 'ferias', 'folga', 'atestado', 'bloqueio_manual'
    start_date date NOT NULL,
    end_date date NOT NULL,
    all_day boolean DEFAULT true NOT NULL,
    start_time time, -- se all_day = false
    end_time time,   -- se all_day = false
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
    -- Validação: end_date >= start_date
    CONSTRAINT valid_date_range CHECK (end_date >= start_date),
    -- Se não for all_day, precisa ter horários
    CONSTRAINT valid_time_range CHECK (
        all_day = true OR (start_time IS NOT NULL AND end_time IS NOT NULL)
    )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_employee_unavailability_tenant ON employee_unavailability(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employee_unavailability_employee ON employee_unavailability(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_unavailability_dates ON employee_unavailability(start_date, end_date);

-- RLS (Row Level Security)
ALTER TABLE employee_unavailability ENABLE ROW LEVEL SECURITY;

-- Policy: tenant isolation
CREATE POLICY "tenant_isolation_employee_unavailability"
    ON employee_unavailability
    USING (true);

-- Comentários
COMMENT ON TABLE employee_unavailability IS 'Bloqueios de agenda dos profissionais (férias, folgas, atestados)';
COMMENT ON COLUMN employee_unavailability.reason IS 'Tipo de bloqueio: ferias, folga, atestado, bloqueio_manual';
COMMENT ON COLUMN employee_unavailability.all_day IS 'true = dia inteiro bloqueado, false = apenas horário específico';
