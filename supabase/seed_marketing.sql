-- ==============================================================================
-- POPULAÇÃO DE DADOS DE MARKETING (Mocks -> Real Data)
-- Tenant: Beleza Pura Demo (11111111-1111-1111-1111-111111111111)
-- ==============================================================================

-- 1. ATUALIZAR SERVIÇOS EXISTENTES COM FOTOS
-- Corte Feminino
UPDATE services 
SET image_url = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80'
WHERE id = 'a1111111-1111-1111-1111-111111111111';

-- Escova (Mapeado para Escova Progressiva no seed original ou criando novo se preferir manter nome exato)
UPDATE services 
SET image_url = 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80'
WHERE id = 'a1111111-1111-1111-1111-111111111112'; 

-- 2. INSERIR NOVOS SERVIÇOS (QUE ESTAVAM APENAS NO MOCK JS)
INSERT INTO services (id, tenant_id, name, category_id, description, duration_minutes, price, is_active, image_url, requires_confirmation)
VALUES 
  -- Manicure
  ('a1111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'Manicure', null, 'Manicure completa', 30, 35.00, true, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80', false),
  -- Maquiagem para Noiva
  ('a1111111-1111-1111-1111-111111111114', '11111111-1111-1111-1111-111111111111', 'Maquiagem para Noiva', null, 'Maquiagem completa para noivas com teste prévio', 120, 250.00, true, 'https://images.unsplash.com/photo-1487412947132-28a5d36a9085?auto=format&fit=crop&q=80', true)
ON CONFLICT (id) DO UPDATE SET image_url = EXCLUDED.image_url;

-- 3. INSERIR IMAGENS DA GALERIA
INSERT INTO gallery_images (tenant_id, url, title, category, display_order)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80', 'Interior do Salão', 'space', 1),
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80', 'Corte Moderno', 'hair', 2),
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80', 'Manicure de Luxo', 'nails', 3);

-- 4. INSERIR DESTAQUES (HIGHLIGHTS)
INSERT INTO highlights (tenant_id, title, description, image_url, type)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Cliente VIP da Semana', 'Parabéns Maria Silva por completar 50 visitas!', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80', 'vip_client'),
  ('11111111-1111-1111-1111-111111111111', 'Melhor Salão da Região 2024', 'Prêmio de excelência em atendimento.', 'https://images.unsplash.com/photo-1570172619643-989c49155cc3?auto=format&fit=crop&q=80', 'award');

-- 5. INSERIR DEPOIMENTOS (REVIEWS)
-- Usando IDs fictícios para appointment e professionals já que é só visual
INSERT INTO reviews (appointment_id, customer_email, professional_id, service_id, rating, comment, is_approved)
VALUES
  ('mock-ppt-1', 'fernanda@email.com', 'Julia Santos', 'Maquiagem', 5, 'A equipe fez meu dia mais especial! A maquiagem durou a festa toda.', true),
  ('mock-ppt-2', 'carla@email.com', 'Maria Silva', 'Geral', 5, 'O ambiente é super aconchegante e o café é uma delícia.', true);
