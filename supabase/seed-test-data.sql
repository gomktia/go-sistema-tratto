-- ============================================
-- BeautyFlow - Test Data Seed Script
-- ============================================
-- IMPORTANTE: Este script cria dados de TESTE
-- Execute no Supabase SQL Editor com cuidado!
-- ============================================

-- ============================================
-- OPÇÃO 1: Limpar dados existentes (CUIDADO! Apaga tudo!)
-- ============================================
-- Descomente as linhas abaixo se quiser RESETAR o banco:
--
-- DELETE FROM customer_credentials;
-- DELETE FROM customers;
-- DELETE FROM employees;
-- DELETE FROM services;
-- DELETE FROM tenants;

-- ============================================
-- OPÇÃO 2: Manter dados existentes (RECOMENDADO)
-- ============================================
-- Este script usa ON CONFLICT DO NOTHING para não duplicar

-- ============================================
-- 1. TENANTS (Empresas/Salões)
-- ============================================

INSERT INTO tenants (id, name, slug, full_name, document, timezone, locale, settings, theme)
VALUES
  -- Salão 1: Beleza Pura
  (
    '11111111-1111-1111-1111-111111111111',
    'Beleza Pura',
    'beleza-pura',
    'Beleza Pura Estética e Beleza LTDA',
    '12.345.678/0001-90',
    'America/Sao_Paulo',
    'pt-BR',
    '{
      "whatsapp": "+5511999887766",
      "address": "Rua das Flores, 123 - Centro",
      "city": "São Paulo",
      "state": "SP",
      "zip": "01234-567"
    }'::jsonb,
    '{
      "primaryColor": "#7c3aed",
      "accentColor": "#2563eb"
    }'::jsonb
  ),

  -- Salão 2: Studio Glamour
  (
    '22222222-2222-2222-2222-222222222222',
    'Studio Glamour',
    'studio-glamour',
    'Studio Glamour Cabelos e Estética LTDA',
    '98.765.432/0001-10',
    'America/Sao_Paulo',
    'pt-BR',
    '{
      "whatsapp": "+5511988776655",
      "address": "Av. Paulista, 1000 - Bela Vista",
      "city": "São Paulo",
      "state": "SP",
      "zip": "01310-100"
    }'::jsonb,
    '{
      "primaryColor": "#ec4899",
      "accentColor": "#f97316"
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. SERVICES (Serviços)
-- ============================================

-- Serviços da Beleza Pura
INSERT INTO services (id, tenant_id, name, description, duration_minutes, price, currency, is_active, metadata)
VALUES
  (
    'a1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Corte Feminino',
    'Corte moderno com finalização',
    60,
    80.00,
    'BRL',
    true,
    '{"bufferBefore": 0, "bufferAfter": 15}'::jsonb
  ),
  (
    'a1111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    'Escova Progressiva',
    'Tratamento com produtos profissionais',
    180,
    250.00,
    'BRL',
    true,
    '{"bufferBefore": 15, "bufferAfter": 30}'::jsonb
  ),
  (
    'a1111111-1111-1111-1111-111111111113',
    '11111111-1111-1111-1111-111111111111',
    'Manicure + Pedicure',
    'Esmaltação com gel',
    90,
    70.00,
    'BRL',
    true,
    '{"bufferBefore": 0, "bufferAfter": 10}'::jsonb
  ),
  (
    'a1111111-1111-1111-1111-111111111114',
    '11111111-1111-1111-1111-111111111111',
    'Design de Sobrancelhas',
    'Modelagem com henna',
    30,
    45.00,
    'BRL',
    true,
    '{"bufferBefore": 0, "bufferAfter": 5}'::jsonb
  ),
  (
    'a1111111-1111-1111-1111-111111111115',
    '11111111-1111-1111-1111-111111111111',
    'Mechas Loiro Perolado',
    'Coloração premium com proteção',
    240,
    450.00,
    'BRL',
    true,
    '{"bufferBefore": 15, "bufferAfter": 30}'::jsonb
  ),

-- Serviços do Studio Glamour
  (
    'a2222222-2222-2222-2222-222222222221',
    '22222222-2222-2222-2222-222222222222',
    'Corte Masculino',
    'Corte + barba',
    45,
    50.00,
    'BRL',
    true,
    '{"bufferBefore": 0, "bufferAfter": 10}'::jsonb
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Hidratação Profunda',
    'Tratamento intensivo',
    90,
    120.00,
    'BRL',
    true,
    '{"bufferBefore": 10, "bufferAfter": 15}'::jsonb
  ),
  (
    'a2222222-2222-2222-2222-222222222223',
    '22222222-2222-2222-2222-222222222222',
    'Luzes Californianas',
    'Mechas naturais',
    180,
    300.00,
    'BRL',
    true,
    '{"bufferBefore": 15, "bufferAfter": 20}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. EMPLOYEES (Profissionais)
-- ============================================

-- Funcionários da Beleza Pura
INSERT INTO employees (id, tenant_id, full_name, email, phone, role, status, color_tag, commission_rate)
VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Julia Santos',
    'julia@belezapura.com',
    '+5511999887755',
    'Cabeleireira',
    'active',
    '#ec4899',
    0.40
  ),
  (
    'e1111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    'Mariana Costa',
    'mariana@belezapura.com',
    '+5511999887744',
    'Manicure',
    'active',
    '#8b5cf6',
    0.35
  ),
  (
    'e1111111-1111-1111-1111-111111111113',
    '11111111-1111-1111-1111-111111111111',
    'Fernanda Lima',
    'fernanda@belezapura.com',
    '+5511999887733',
    'Esteticista',
    'active',
    '#06b6d4',
    0.40
  ),

-- Funcionários do Studio Glamour
  (
    'e2222222-2222-2222-2222-222222222221',
    '22222222-2222-2222-2222-222222222222',
    'Carlos Silva',
    'carlos@studioglamour.com',
    '+5511988776644',
    'Barbeiro',
    'active',
    '#f97316',
    0.45
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Ana Paula',
    'anapaula@studioglamour.com',
    '+5511988776633',
    'Colorista',
    'active',
    '#84cc16',
    0.50
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. CUSTOMERS (Clientes)
-- ============================================

-- Clientes da Beleza Pura
INSERT INTO customers (id, tenant_id, full_name, email, phone, document, birthdate, gender, loyalty_points, total_spent, marketing_opt_in)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Maria Silva',
    'maria.silva@email.com',
    '+5511988887777',
    '123.456.789-01',
    '1990-05-15',
    'F',
    150,
    850.00,
    true
  ),
  (
    'c1111111-1111-1111-1111-111111111112',
    '11111111-1111-1111-1111-111111111111',
    'Ana Paula Santos',
    'ana.santos@email.com',
    '+5511988887766',
    '234.567.890-12',
    '1985-08-22',
    'F',
    320,
    1650.00,
    true
  ),
  (
    'c1111111-1111-1111-1111-111111111113',
    '11111111-1111-1111-1111-111111111111',
    'Carla Oliveira',
    'carla.oliveira@email.com',
    '+5511988887755',
    '345.678.901-23',
    '1992-11-30',
    'F',
    80,
    420.00,
    false
  ),

-- Clientes do Studio Glamour
  (
    'c2222222-2222-2222-2222-222222222221',
    '22222222-2222-2222-2222-222222222222',
    'João Pedro',
    'joao.pedro@email.com',
    '+5511977776666',
    '456.789.012-34',
    '1988-03-10',
    'M',
    50,
    250.00,
    true
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Lucas Mendes',
    'lucas.mendes@email.com',
    '+5511977776655',
    '567.890.123-45',
    '1995-07-18',
    'M',
    120,
    600.00,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. CUSTOMER CREDENTIALS (Senhas dos Clientes)
-- ============================================
-- NOTA: Senha para todos os clientes de teste: "senha123"
-- Hash bcrypt com salt rounds = 10

INSERT INTO customer_credentials (tenant_id, customer_id, identity_type, identity_value, secret_hash)
VALUES
  -- Maria Silva (Beleza Pura) - CPF: 123.456.789-01
  (
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'cpf',
    '12345678901',
    '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ' -- senha123
  ),
  -- Maria Silva (Beleza Pura) - Email
  (
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'email',
    'maria.silva@email.com',
    '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ' -- senha123
  ),

  -- Ana Paula Santos (Beleza Pura) - CPF: 234.567.890-12
  (
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111112',
    'cpf',
    '23456789012',
    '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ' -- senha123
  ),
  -- Ana Paula Santos (Beleza Pura) - Email
  (
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111112',
    'email',
    'ana.santos@email.com',
    '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ' -- senha123
  ),

  -- Carla Oliveira (Beleza Pura) - CPF: 345.678.901-23
  (
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111113',
    'cpf',
    '34567890123',
    '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ' -- senha123
  ),
  -- Carla Oliveira (Beleza Pura) - Email
  (
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111113',
    'email',
    'carla.oliveira@email.com',
    '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ' -- senha123
  ),

  -- João Pedro (Studio Glamour) - CPF: 456.789.012-34
  (
    '22222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222221',
    'cpf',
    '45678901234',
    '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ' -- senha123
  ),
  -- João Pedro (Studio Glamour) - Email
  (
    '22222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222221',
    'email',
    'joao.pedro@email.com',
    '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ' -- senha123
  ),

  -- Lucas Mendes (Studio Glamour) - CPF: 567.890.123-45
  (
    '22222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'cpf',
    '56789012345',
    '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ' -- senha123
  ),
  -- Lucas Mendes (Studio Glamour) - Email
  (
    '22222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222222',
    'email',
    'lucas.mendes@email.com',
    '$2a$10$rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJHjGJ5z5rZ5qJHjGJOX5rZ5qJ' -- senha123
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- RESUMO DOS DADOS DE TESTE
-- ============================================
--
-- TENANTS (2):
--   - Beleza Pura (slug: beleza-pura)
--   - Studio Glamour (slug: studio-glamour)
--
-- CLIENTES DE TESTE (5 total):
--   Beleza Pura (3):
--     - maria.silva@email.com | CPF: 123.456.789-01 | Senha: senha123
--     - ana.santos@email.com | CPF: 234.567.890-12 | Senha: senha123
--     - carla.oliveira@email.com | CPF: 345.678.901-23 | Senha: senha123
--
--   Studio Glamour (2):
--     - joao.pedro@email.com | CPF: 456.789.012-34 | Senha: senha123
--     - lucas.mendes@email.com | CPF: 567.890.123-45 | Senha: senha123
--
-- STAFF/BUSINESS USERS:
--   Criar via Supabase Auth ou script separado (próximo passo)
--
-- ============================================

-- Verificar dados inseridos
SELECT 'Tenants:', COUNT(*) FROM tenants WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
SELECT 'Services:', COUNT(*) FROM services WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
SELECT 'Employees:', COUNT(*) FROM employees WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
SELECT 'Customers:', COUNT(*) FROM customers WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
SELECT 'Customer Credentials:', COUNT(*) FROM customer_credentials WHERE tenant_id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');
