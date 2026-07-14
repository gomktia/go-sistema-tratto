-- ============================================================================
-- Migration: Service Categories
-- Created: 2026-07-13
-- Description: Creates service_categories table and updates services table
-- ============================================================================

-- Create service_categories table
create table if not exists public.service_categories (
    id uuid primary key default gen_random_uuid(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name text not null,
    short_code text, -- Código curto (ALO, CAB, INT, etc.)
    description text,
    color text, -- Cor hexadecimal para UI
    icon text, -- Nome do ícone (opcional)
    display_order integer default 0,
    is_active boolean default true,
    created_at timestamptz default now(),
    updated_at timestamptz default now(),

    -- Constraints
    constraint service_categories_name_length check (char_length(name) >= 2),
    constraint service_categories_short_code_length check (short_code is null or char_length(short_code) between 2 and 5)
);

-- Add category_id to services table (if not exists)
do $$
begin
    if not exists (
        select 1 from information_schema.columns
        where table_name = 'services' and column_name = 'category_id'
    ) then
        alter table public.services
        add column category_id uuid references public.service_categories(id) on delete set null;
    end if;
end $$;

-- Indexes
create index if not exists idx_service_categories_tenant on public.service_categories(tenant_id);
create index if not exists idx_service_categories_active on public.service_categories(tenant_id, is_active);
create index if not exists idx_services_category on public.services(category_id);

-- RLS Policies
alter table public.service_categories enable row level security;

-- Policy: Users can view categories from their tenant
create policy "Users can view their tenant categories"
    on public.service_categories for select
    using (
        exists (
            select 1 from public.tenants t
            where t.id = service_categories.tenant_id
            and t.id = auth_tenant_id()
        )
    );

-- Policy: Users can insert categories for their tenant
create policy "Users can insert categories for their tenant"
    on public.service_categories for insert
    with check (tenant_id = auth_tenant_id());

-- Policy: Users can update their tenant categories
create policy "Users can update their tenant categories"
    on public.service_categories for update
    using (tenant_id = auth_tenant_id());

-- Policy: Users can delete their tenant categories
create policy "Users can delete their tenant categories"
    on public.service_categories for delete
    using (tenant_id = auth_tenant_id());

-- Seed default categories (Trinks pattern)
-- Note: This will only insert if the table is empty for the tenant
-- In production, you might want to run this separately per tenant

comment on table public.service_categories is 'Service categories for organizing services (e.g., Cabelo, Mão, Sobrancelha)';
comment on column public.service_categories.short_code is 'Short code for UI filters (e.g., ALO, CAB, INT)';
comment on column public.service_categories.color is 'Hexadecimal color for category badge';
comment on column public.service_categories.display_order is 'Order for displaying categories in UI';
