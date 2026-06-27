-- ==============================================================================
-- PASSO 1: Criar tabela tenants (ausente no full_schema.sql)
-- Execute este arquivo ANTES do full_schema.sql
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    full_name text,
    document text,
    timezone text DEFAULT 'America/Sao_Paulo',
    locale text DEFAULT 'pt-BR',
    logo text,
    description text,
    settings jsonb DEFAULT '{}'::jsonb,
    theme jsonb DEFAULT '{}'::jsonb,
    plan_id text DEFAULT 'trial',
    subscription_status text DEFAULT 'trialing',
    trial_ends_at timestamp with time zone,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id),
    UNIQUE (slug)
);
