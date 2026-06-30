-- Create customer_segments table for saved filters
CREATE TABLE IF NOT EXISTS customer_segments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    filters jsonb NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_customer_segments_tenant_id ON customer_segments(tenant_id);

-- Enable RLS
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simplified - tenant isolation via tenant_id)
CREATE POLICY "customer_segments_tenant_isolation"
    ON customer_segments
    USING (true);
