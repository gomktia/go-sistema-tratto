-- Adicionar constraint para validar status permitidos
ALTER TABLE appointments
  DROP CONSTRAINT IF EXISTS appointments_status_check;

ALTER TABLE appointments
  ADD CONSTRAINT appointments_status_check
  CHECK (status IN (
    'staff_unavailable',
    'pending',
    'confirmed',
    'no_show',
    'in_progress',
    'completed',
    'cancelled'
  ));

-- Migrar status antigos para novos
UPDATE appointments SET status = 'staff_unavailable' WHERE status = 'blocked';
UPDATE appointments SET status = 'pending' WHERE status = 'scheduled';

-- Atualizar default para pending
ALTER TABLE appointments ALTER COLUMN status SET DEFAULT 'pending';
