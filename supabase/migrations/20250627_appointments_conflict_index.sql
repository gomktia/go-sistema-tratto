-- PR 2: Índice para otimizar consulta de conflito por profissional + tempo
-- Executar no Supabase SQL Editor

CREATE INDEX IF NOT EXISTS idx_appointments_employee_time
  ON appointments(employee_id, start_at, end_at)
  WHERE status != 'cancelled';
