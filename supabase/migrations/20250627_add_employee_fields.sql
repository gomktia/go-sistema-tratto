-- PR 1: Adicionar colunas necessárias para profissionais reais
-- Executar no Supabase SQL Editor

ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS specialties    text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS working_hours  jsonb   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS accepts_online_booking boolean DEFAULT true;

-- Comentário: commission_rate já existe (numeric, DEFAULT 0)
-- Garantir que o índice por tenant existe para performance
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON employees(tenant_id);
