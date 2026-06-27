-- Add status column to tenants table for Soft Delete
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Add subscription related columns if they are missing (used in Admin Page)
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS plan_id text DEFAULT 'starter',
ADD COLUMN IF NOT EXISTS subscription_start_date timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone DEFAULT (now() + interval '30 days'),
ADD COLUMN IF NOT EXISTS trial_ends_at timestamp with time zone;

-- Update existing tenants to have 'active' status
UPDATE tenants SET status = 'active' WHERE status IS NULL;
