-- Migration: Adicionar campos adicionais ao cadastro de profissionais
-- CPF, data de nascimento para cadastro completo

ALTER TABLE employees
    ADD COLUMN IF NOT EXISTS document text,           -- CPF/documento
    ADD COLUMN IF NOT EXISTS birthdate date;          -- Data de nascimento

-- Comentários
COMMENT ON COLUMN employees.document IS 'CPF ou documento de identificação do profissional';
COMMENT ON COLUMN employees.birthdate IS 'Data de nascimento do profissional';

-- Índice para busca por documento (opcional, útil para validação de duplicatas)
CREATE INDEX IF NOT EXISTS idx_employees_document ON employees(tenant_id, document) WHERE document IS NOT NULL;
