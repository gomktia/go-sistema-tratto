-- Create reviews table for customer feedback
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    professional_id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_professional ON reviews(professional_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service ON reviews(service_id);
CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_email);
CREATE INDEX IF NOT EXISTS idx_reviews_appointment ON reviews(appointment_id);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read reviews
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

-- Policy: Customers can insert their own reviews
CREATE POLICY "Customers can create reviews" ON reviews
    FOR INSERT WITH CHECK (true);

-- Policy: Customers can update their own reviews (optional - if you want to allow edits)
CREATE POLICY "Customers can update their own reviews" ON reviews
    FOR UPDATE USING (customer_email = current_setting('request.jwt.claim.email', true));

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reviews_updated_at_trigger
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_reviews_updated_at();

-- Add comment to table
COMMENT ON TABLE reviews IS 'Customer reviews and ratings for services and professionals';
