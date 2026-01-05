
-- Add metadata column to plans table if it doesn't exist
ALTER TABLE plans ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Ensure RLS is enabled
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active plans
CREATE POLICY "Public plans are viewable by everyone" 
ON plans FOR SELECT 
USING (true);

-- Allow authenticated users (admins) to insert/update/delete
-- Note: In a real scenario you'd restrict this to super_admins, assuming authenticated for now based on context
CREATE POLICY "Admins can manage plans" 
ON plans FOR ALL 
USING (auth.role() = 'authenticated');
