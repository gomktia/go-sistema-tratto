-- =============================================================================
-- Migration: Adicionar Foreign Keys na tabela appointments
-- =============================================================================
-- Causa raiz: appointments não tinha FKs definidas, causando erro 400 no
-- SELECT com JOINs (customers(full_name), services(name))
--
-- Impacto antes do fix:
--   - INSERT funcionava (status 201)
--   - SELECT falhava (status 400)
--   - Agenda aparecia vazia mesmo com appointments criados
-- =============================================================================

-- Adicionar foreign key para tenant_id
ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_tenant
  FOREIGN KEY (tenant_id)
  REFERENCES tenants(id)
  ON DELETE CASCADE;

-- Adicionar foreign key para employee_id
ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_employee
  FOREIGN KEY (employee_id)
  REFERENCES employees(id)
  ON DELETE RESTRICT;

-- Adicionar foreign key para customer_id (nullable, permite bloqueios sem cliente)
ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_customer
  FOREIGN KEY (customer_id)
  REFERENCES customers(id)
  ON DELETE SET NULL;

-- Adicionar foreign key para service_id (nullable, permite bloqueios sem serviço)
ALTER TABLE appointments
  ADD CONSTRAINT fk_appointments_service
  FOREIGN KEY (service_id)
  REFERENCES services(id)
  ON DELETE SET NULL;

-- Comentário para documentação
COMMENT ON CONSTRAINT fk_appointments_tenant ON appointments IS
  'Foreign key para tenant - DELETE CASCADE porque sem tenant não há appointments';

COMMENT ON CONSTRAINT fk_appointments_employee ON appointments IS
  'Foreign key para employee - DELETE RESTRICT para proteger histórico de appointments';

COMMENT ON CONSTRAINT fk_appointments_customer ON appointments IS
  'Foreign key para customer - DELETE SET NULL para manter appointment mesmo se cliente for deletado';

COMMENT ON CONSTRAINT fk_appointments_service ON appointments IS
  'Foreign key para service - DELETE SET NULL para manter appointment mesmo se serviço for deletado';

-- =============================================================================
-- Verificação após aplicar:
--   SELECT * FROM appointments LIMIT 1; -- deve retornar o appointment criado
--
-- No frontend, o SELECT com JOINs agora deve funcionar:
--   .select('*, customers(full_name), services(name)')
-- =============================================================================
