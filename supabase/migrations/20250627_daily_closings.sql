-- PR 5: Fechamento diário por tenant
-- Executar no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS daily_closings (
    id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id           uuid        NOT NULL,
    closing_date        date        NOT NULL,

    -- Totais do dia (snapshot no momento do fechamento)
    total_appointments  int         NOT NULL DEFAULT 0,
    gross_revenue       numeric     NOT NULL DEFAULT 0,  -- soma de final_price
    total_discounts     numeric     NOT NULL DEFAULT 0,  -- soma de discount
    net_revenue         numeric     NOT NULL DEFAULT 0,  -- gross - discounts
    total_commissions   numeric     NOT NULL DEFAULT 0,  -- soma de commission_amount

    -- Detalhamento por forma de pagamento (valor líquido = final_price - discount)
    revenue_pix         numeric     NOT NULL DEFAULT 0,
    revenue_cash        numeric     NOT NULL DEFAULT 0,
    revenue_debit       numeric     NOT NULL DEFAULT 0,
    revenue_credit      numeric     NOT NULL DEFAULT 0,
    revenue_other       numeric     NOT NULL DEFAULT 0,

    -- Controle de status
    status              text        NOT NULL DEFAULT 'open',  -- 'open' | 'closed'
    closed_at           timestamptz,
    notes               text,

    created_at          timestamptz DEFAULT now() NOT NULL,
    updated_at          timestamptz DEFAULT now() NOT NULL,

    -- Um fechamento por tenant por dia; upsert seguro em reaberturas
    CONSTRAINT uq_daily_closing UNIQUE(tenant_id, closing_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_closings_tenant ON daily_closings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_daily_closings_date   ON daily_closings(closing_date DESC);

-- Observações:
-- gross_revenue  = soma de appointments.final_price (valor cobrado do cliente)
-- total_discounts = soma de appointments.discount (desconto comercial)
-- net_revenue    = gross_revenue - total_discounts (o que entrou no caixa)
-- total_commissions = soma de appointment_commissions.commission_amount (persistido no PR 4)
-- Forma de pagamento não afeta comissão; revenue_* reflete o net por método
