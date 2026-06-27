-- PR 3: Campos de conclusão/pagamento na tabela appointments
-- Executar no Supabase SQL Editor

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS final_price     numeric,
  ADD COLUMN IF NOT EXISTS discount        numeric  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method  text;

-- Comentário: final_price = valor cobrado após ajuste manual
--             discount    = desconto aplicado (R$, não %)
--             payment_method: 'pix' | 'cash' | 'credit_card' | 'debit_card' | 'other'
-- Compatibilidade futura: PR 4 usará final_price e employee.commission_rate
-- para calcular appointment_commissions — não há regras de maquininha hardcoded aqui.
