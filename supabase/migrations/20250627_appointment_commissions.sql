-- PR 4: Tabela de comissões por atendimento
-- Executar no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS appointment_commissions (
    id                uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id         uuid        NOT NULL,
    appointment_id    uuid        NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    employee_id       uuid        NOT NULL,
    commission_rate   numeric     NOT NULL,  -- snapshot da taxa no momento do fechamento (%)
    final_price       numeric     NOT NULL,  -- appointment.final_price (valor cobrado do cliente)
    discount          numeric     NOT NULL DEFAULT 0, -- appointment.discount
    base_amount       numeric     NOT NULL,  -- = final_price - discount (base de cálculo)
    commission_amount numeric     NOT NULL,  -- = base_amount * commission_rate / 100
    created_at        timestamptz DEFAULT now() NOT NULL,
    -- Uma comissão por atendimento; upsert seguro na re-conclusão
    CONSTRAINT uq_appointment_commission UNIQUE(appointment_id)
);

-- Índices para queries do financeiro
CREATE INDEX IF NOT EXISTS idx_app_commissions_tenant    ON appointment_commissions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_app_commissions_employee  ON appointment_commissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_app_commissions_apt       ON appointment_commissions(appointment_id);

-- Observações:
-- base_amount = final_price - discount (forma de pagamento NÃO afeta comissão)
-- commission_rate é snapshot: o rate do profissional NO MOMENTO do fechamento
-- Sem desconto de taxa de cartão ou maquininha nesta tabela
