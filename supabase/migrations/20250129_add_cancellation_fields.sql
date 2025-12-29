-- Add cancellation tracking fields to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancelled_by TEXT;

-- Add index for cancelled appointments
CREATE INDEX IF NOT EXISTS idx_appointments_cancelled ON appointments(status) WHERE status = 'cancelled';

-- Add comment
COMMENT ON COLUMN appointments.cancelled_at IS 'Timestamp when the appointment was cancelled';
COMMENT ON COLUMN appointments.cancelled_by IS 'Email or identifier of who cancelled the appointment';
