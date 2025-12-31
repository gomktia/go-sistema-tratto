-- ==============================================================================
-- BeautyFlow SAAS - Full Database Schema & Data Script
-- Generated based on existing architecture
-- ==============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. TABLES CREATION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS app_users (
    id uuid NOT NULL,
    full_name text,
    avatar_url text,
    locale text DEFAULT 'pt-BR'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS appointment_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id uuid NOT NULL,
    event_type text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    service_id uuid,
    employee_id uuid,
    customer_id uuid,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone,
    duration_minutes integer,
    price numeric,
    currency text DEFAULT 'BRL'::text,
    channel text,
    status text DEFAULT 'scheduled'::text NOT NULL,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    cancelled_at timestamp with time zone,
    cancelled_by text,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    actor_id uuid,
    action text NOT NULL,
    entity text,
    entity_id uuid,
    description text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS collections_actions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    invoice_id uuid,
    status text DEFAULT 'pending'::text,
    action_type text NOT NULL,
    due_date date,
    executed_at timestamp with time zone,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS combo_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    combo_id uuid NOT NULL,
    item_type text NOT NULL,
    item_id uuid NOT NULL,
    quantity integer DEFAULT 1,
    metadata jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS combos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    original_price numeric,
    price numeric NOT NULL,
    currency text DEFAULT 'BRL'::text,
    image_url text,
    category text,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS customer_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    identity_type text NOT NULL,
    identity_value text NOT NULL,
    secret_hash text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS customer_events (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_id uuid,
    event_type text NOT NULL,
    payload jsonb DEFAULT '{}'::jsonb,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS customer_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_id uuid,
    session_token text,
    ip_address text,
    user_agent text,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS customer_tag_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    tag_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    full_name text NOT NULL,
    email text,
    phone text,
    document text,
    birthdate date,
    gender text,
    notes text,
    last_visit_at timestamp with time zone,
    total_spent numeric DEFAULT 0,
    loyalty_points integer DEFAULT 0,
    status text DEFAULT 'active'::text,
    marketing_opt_in boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS daily_cash_flow (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    reference_date date NOT NULL,
    cash_in numeric DEFAULT 0,
    cash_out numeric DEFAULT 0,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS employees (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid,
    full_name text NOT NULL,
    email text,
    phone text,
    role text,
    status text DEFAULT 'active'::text,
    color_tag text,
    avatar_url text,
    commission_rate numeric DEFAULT 0,
    settings jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS financial_goals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    type text NOT NULL,
    target_value numeric NOT NULL,
    current_value numeric DEFAULT 0,
    period_start date NOT NULL,
    period_end date NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS funnel_steps (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    session_id uuid,
    funnel text NOT NULL,
    step text NOT NULL,
    status text DEFAULT 'in_progress'::text,
    metadata jsonb DEFAULT '{}'::jsonb,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS incidents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    severity text NOT NULL,
    status text NOT NULL,
    description text,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    resolved_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS integration_statuses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    status text NOT NULL,
    uptime text,
    last_incident text,
    metadata jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS inventory_movements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    product_id uuid NOT NULL,
    quantity integer NOT NULL,
    type text NOT NULL,
    reason text,
    source text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    invoice_id uuid NOT NULL,
    description text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric NOT NULL,
    total numeric NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_id uuid,
    number text NOT NULL,
    title text,
    description text,
    status text DEFAULT 'draft'::text NOT NULL,
    currency text DEFAULT 'BRL'::text,
    subtotal numeric DEFAULT 0,
    discount numeric DEFAULT 0,
    total numeric DEFAULT 0,
    due_date date,
    issued_at timestamp with time zone DEFAULT now(),
    paid_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    item_type text NOT NULL,
    item_id uuid,
    name text NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric NOT NULL,
    total numeric NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    customer_id uuid,
    source text DEFAULT 'shop'::text,
    channel text DEFAULT 'online'::text,
    status text DEFAULT 'pending'::text NOT NULL,
    subtotal numeric DEFAULT 0,
    discount numeric DEFAULT 0,
    total numeric DEFAULT 0,
    currency text DEFAULT 'BRL'::text,
    payment_status text DEFAULT 'pending'::text,
    notes text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    order_id uuid,
    source text DEFAULT 'pos'::text,
    method text NOT NULL,
    amount numeric NOT NULL,
    currency text DEFAULT 'BRL'::text,
    status text DEFAULT 'pending'::text NOT NULL,
    transaction_reference text,
    paid_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS payouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    employee_id uuid,
    amount numeric NOT NULL,
    currency text DEFAULT 'BRL'::text,
    status text DEFAULT 'pending'::text,
    scheduled_for date,
    processed_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    price numeric DEFAULT 0,
    currency text DEFAULT 'BRL'::text,
    billing_cycle text DEFAULT 'monthly'::text,
    features jsonb DEFAULT '[]'::jsonb,
    limits jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS playbook_runs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    playbook_id uuid NOT NULL,
    tenant_id uuid,
    status text NOT NULL,
    context jsonb DEFAULT '{}'::jsonb,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    finished_at timestamp with time zone,
    result text,
    metadata jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS playbooks (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    name text NOT NULL,
    description text,
    category text,
    trigger_type text,
    conditions jsonb DEFAULT '[]'::jsonb,
    actions jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS pos_session_payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id uuid NOT NULL,
    payment_id uuid,
    amount numeric NOT NULL,
    method text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS pos_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    opened_by uuid,
    closed_by uuid,
    opened_at timestamp with time zone DEFAULT now() NOT NULL,
    closed_at timestamp with time zone,
    opening_amount numeric DEFAULT 0,
    closing_amount numeric,
    status text DEFAULT 'open'::text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS product_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    color text,
    icon text,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    category_id uuid,
    name text NOT NULL,
    description text,
    sku text,
    barcode text,
    price numeric NOT NULL,
    cost numeric,
    currency text DEFAULT 'BRL'::text,
    track_inventory boolean DEFAULT true,
    stock_quantity integer DEFAULT 0,
    min_stock integer DEFAULT 0,
    unit text DEFAULT 'un'::text,
    is_active boolean DEFAULT true,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public_help_requests (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    channel text NOT NULL,
    contact text,
    context jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS revenue_snapshots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    total_revenue numeric DEFAULT 0,
    appointments_count integer DEFAULT 0,
    retail_revenue numeric DEFAULT 0,
    services_revenue numeric DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id text NOT NULL,
    customer_email text NOT NULL,
    professional_id text NOT NULL,
    service_id text NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS service_categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    color text,
    icon text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS service_staff (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    service_id uuid NOT NULL,
    employee_id uuid NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS services (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    category_id uuid,
    name text NOT NULL,
    description text,
    duration_minutes integer DEFAULT 60 NOT NULL,
    price numeric DEFAULT 0 NOT NULL,
    currency text DEFAULT 'BRL'::text NOT NULL,
    requires_confirmation boolean DEFAULT false,
    is_active boolean DEFAULT true,
    image_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS gallery_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    url text NOT NULL,
    title text,
    description text,
    category text,
    is_active boolean DEFAULT true,
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS highlights (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    image_url text,
    type text NOT NULL, -- 'vip_client', 'promotion', 'award'
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    appointment_id text NOT NULL,
    customer_email text NOT NULL,
    professional_id text NOT NULL,
    service_id text NOT NULL,
    rating integer NOT NULL,
    comment text,
    is_approved boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    PRIMARY KEY (id)
);

-- ==============================================================================
-- 2. SEED DATA (Example Data)
-- ==============================================================================
-- IMPORTANT: Creating data with suffix "-demo" to avoid conflicts with real data

-- Tenants
INSERT INTO tenants (id, name, slug, full_name, document, timezone, locale, settings, theme)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Beleza Pura Demo', 'beleza-pura-demo', 'Beleza Pura Demo LTDA', '12.345.678/0001-90', 'America/Sao_Paulo', 'pt-BR', '{"whatsapp": "+5511999887766", "address": "Rua das Flores, 123 - Centro", "city": "São Paulo", "state": "SP", "zip": "01234-567"}'::jsonb, '{"primaryColor": "#7c3aed", "accentColor": "#2563eb"}'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'Studio Glamour Demo', 'studio-glamour-demo', 'Studio Glamour Demo LTDA', '98.765.432/0001-10', 'America/Sao_Paulo', 'pt-BR', '{"whatsapp": "+5511988776655", "address": "Av. Paulista, 1000 - Bela Vista", "city": "São Paulo", "state": "SP", "zip": "01310-100"}'::jsonb, '{"primaryColor": "#ec4899", "accentColor": "#f97316"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug, -- Ensure slug matches ID if ID exists
    name = EXCLUDED.name;

-- Services
INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, currency, is_active, metadata)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Corte Feminino', 'Corte moderno com finalização', 60, 80.00, 'BRL', true, '{"bufferBefore": 0, "bufferAfter": 15}'::jsonb),
  ('a1111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Escova Progressiva', 'Tratamento com produtos profissionais', 180, 250.00, 'BRL', true, '{"bufferBefore": 15, "bufferAfter": 30}'::jsonb),
  ('a2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Corte Masculino', 'Corte + barba', 45, 50.00, 'BRL', true, '{"bufferBefore": 0, "bufferAfter": 10}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Employees
INSERT INTO employees (id, tenant_id, full_name, email, phone, role, status, color_tag, commission_rate)
VALUES
  ('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Julia Santos', 'julia@belezapura.com', '+5511999887755', 'Cabeleireira', 'active', '#ec4899', 0.40),
  ('e2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'Carlos Silva', 'carlos@studioglamour.com', '+5511988776644', 'Barbeiro', 'active', '#f97316', 0.45)
ON CONFLICT (id) DO NOTHING;

-- Customers
INSERT INTO customers (id, tenant_id, full_name, email, phone, document, birthdate, gender, loyalty_points, total_spent, marketing_opt_in)
VALUES
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Maria Silva', 'maria.silva@email.com', '+5511988887777', '123.456.789-01', '1990-05-15', 'F', 150, 850.00, true),
  ('c2222222-2222-2222-2222-222222222221', '22222222-2222-2222-2222-222222222222', 'João Pedro', 'joao.pedro@email.com', '+5511977776666', '456.789.012-34', '1988-03-10', 'M', 50, 250.00, true)
ON CONFLICT (id) DO NOTHING;
