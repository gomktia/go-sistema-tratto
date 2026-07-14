-- ============================================================================
-- MIGRATION: Sistema de Pagamento de Comissões
-- Data: 2026-07-14
-- Descrição: Tabela para registrar histórico de pagamentos de comissões
-- ============================================================================

-- 1. CRIAR TABELA commission_payments
CREATE TABLE IF NOT EXISTS public.commission_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_amount integer NOT NULL, -- centavos
    payment_method text NOT NULL CHECK (payment_method IN ('cash', 'pix', 'transfer', 'check')),
    paid_at timestamptz NOT NULL DEFAULT now(),
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. ADICIONAR CAMPO commission_payment_id em appointment_commissions
ALTER TABLE public.appointment_commissions
ADD COLUMN IF NOT EXISTS commission_payment_id uuid REFERENCES public.commission_payments(id) ON DELETE SET NULL;

-- 3. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_commission_payments_tenant
ON public.commission_payments(tenant_id);

CREATE INDEX IF NOT EXISTS idx_commission_payments_employee
ON public.commission_payments(employee_id);

CREATE INDEX IF NOT EXISTS idx_commission_payments_period
ON public.commission_payments(tenant_id, period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_appointment_commissions_payment
ON public.appointment_commissions(commission_payment_id);

-- 4. RLS (Row Level Security)
ALTER TABLE public.commission_payments ENABLE ROW LEVEL SECURITY;

-- Policy: SELECT - usuários do tenant podem ver pagamentos do seu tenant
CREATE POLICY "Users can view commission payments from their tenant"
ON public.commission_payments
FOR SELECT
USING (
    tenant_id IN (
        SELECT t.id FROM public.tenants t
        WHERE t.id = auth_tenant_id()
    )
);

-- Policy: INSERT - usuários do tenant podem criar pagamentos
CREATE POLICY "Users can create commission payments for their tenant"
ON public.commission_payments
FOR INSERT
WITH CHECK (
    tenant_id IN (
        SELECT t.id FROM public.tenants t
        WHERE t.id = auth_tenant_id()
    )
);

-- Policy: UPDATE - usuários do tenant podem atualizar pagamentos do tenant
CREATE POLICY "Users can update commission payments from their tenant"
ON public.commission_payments
FOR UPDATE
USING (
    tenant_id IN (
        SELECT t.id FROM public.tenants t
        WHERE t.id = auth_tenant_id()
    )
);

-- Policy: DELETE - usuários do tenant podem deletar pagamentos do tenant
CREATE POLICY "Users can delete commission payments from their tenant"
ON public.commission_payments
FOR DELETE
USING (
    tenant_id IN (
        SELECT t.id FROM public.tenants t
        WHERE t.id = auth_tenant_id()
    )
);

-- 5. COMENTÁRIOS
COMMENT ON TABLE public.commission_payments IS 'Histórico de pagamentos de comissões aos profissionais';
COMMENT ON COLUMN public.commission_payments.period_start IS 'Data inicial do período das comissões pagas';
COMMENT ON COLUMN public.commission_payments.period_end IS 'Data final do período das comissões pagas';
COMMENT ON COLUMN public.commission_payments.total_amount IS 'Valor total pago em centavos';
COMMENT ON COLUMN public.commission_payments.payment_method IS 'Método de pagamento: cash, pix, transfer, check';
COMMENT ON COLUMN public.commission_payments.paid_at IS 'Data e hora em que o pagamento foi realizado';

COMMENT ON COLUMN public.appointment_commissions.commission_payment_id IS 'Referência ao pagamento que incluiu esta comissão';
