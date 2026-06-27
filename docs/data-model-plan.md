# Plano de Modelo de Dados (Pré-Supabase)

## 1. Princípios Gerais
- **Multi-tenant nativo**: toda tabela operada por empresas deve ter `tenant_id` e policies (RLS) garantindo isolamento.
- **Separação de papéis**: usuários podem pertencer a vários tenants; usamos `users` global + `tenant_users` com roles (`owner`, `admin`, `manager`, `staff`).
- **Modularidade**: dividir o schema em domínios (CRM, Agenda, Financeiro, Público, Super Admin). Facilita migrações incrementais e escalabilidade.
- **Auditoria & automação**: qualquer ação crítica gera eventos em `audit_logs` e permite disparar playbooks (`playbooks`, `playbook_steps`, `playbook_runs`).

## 2. Núcleo Compartilhado
| Tabela | Campos chave |
|--------|--------------|
| `tenants` | dados gerais, branding, configurações (timezone, idioma, vanity slug) |
| `plans` + `plan_features` | define limites/recursos para exibir no Super Admin |
| `subscriptions` | liga tenant ao plano vigente, ciclo, status, `trial_end` |
| `users` | identidade global, auth, fatores (quando migrarmos) |
| `tenant_users` | `tenant_id`, `user_id`, `role`, `permissions` |
| `notifications` | mensagens por usuário (usar para menu de alerts) |
| `audit_logs` | `actor_id`, `tenant_id`, `action`, `entity`, `metadata`, `ip` |

## 3. CRM e Clientes
| Tabela | Uso |
|--------|-----|
| `customers` | base primária (nome, CPF, contatos, preferências) |
| `customer_contacts` | múltiplos emails/telefones |
| `customer_tags` + `tags` | segmentação manual |
| `customer_events` | visitas, aniversários, fluxos automáticos |
| `customer_segments` | filtros salvos (usar JSON para critérios) |
| `customer_reviews` | usados no booking/shop trust bar |

## 4. Serviços, Profissionais e Agenda
| Tabela | Uso |
|--------|-----|
| `services` | catálogo com duração, preço, categoria, upsell flag |
| `service_staff` | quais profissionais executam cada serviço |
| `employees` / `professional_profiles` | dados internos (comissão, metas) |
| `staff_availability` | janelas de trabalho, exceções |
| `appointments` | agenda completa (cliente opcional, status, origem) |
| `appointment_notes`, `appointment_logs` | histórico e timeline |

## 5. Produtos, PDV e Loja Pública
| Tabela | Uso |
|--------|-----|
| `products`, `product_categories` | catálogo de venda |
| `inventory_levels`, `inventory_movements` | controle de estoque |
| `combos`, `combo_items` | pacotes exibidos no shop |
| `orders`, `order_items`, `order_payments` | funil público/shop |
| `carts`, `cart_items` | abandono/remarketing |
| `pos_sessions`, `pos_payments` | PDV rápido no admin |

## 6. Financeiro e Billing
| Tabela | Uso |
|--------|-----|
| `invoices`, `invoice_items` | billing SaaS e cobrança a clientes finais |
| `payments` | status, método, integra com PIX/cartão |
| `payouts` | repasses/comissões para profissionais |
| `financial_goals`, `daily_goals` | cards de metas no dashboard |
| `collections_actions` | dunning / alertas exibidos no Super Admin |

## 7. Suporte, Auditoria e Playbooks (Super Admin)
| Tabela | Uso |
|--------|-----|
| `support_tickets`, `ticket_messages` | módulo de suporte |
| `integrations_status` | uptime dos conectores (WhatsApp, SMS, Pagamentos) |
| `incidents` | linha do tempo de incidentes exibida no painel |
| `playbooks`, `playbook_steps`, `playbook_runs` | automações e simulações |

## 8. Onboarding e Saúde da Conta
| Tabela | Uso |
|--------|-----|
| `onboarding_steps`, `onboarding_progress` | checklist + wizard |
| `account_health` | limites vs consumo (serviços, clientes, usuários) |
| `activation_scores` | métrica usada em `super-admin/empresas` |

## 9. Público: Login, Booking, Perfil, Shop
| Tabela | Uso |
|--------|-----|
| `customer_sessions` | controle de acesso público |
| `funnel_steps` | analytics de booking/shop |
| `public_help_requests` | clique em “WhatsApp ajuda” |
| `upsell_offers` | order bump no booking |

## 10. Sequência de Migrações (Sugestão)
1. **Fundação**: `tenants`, `plans`, `subscriptions`, `users`, `tenant_users`.
2. **Catálogo & CRM**: `services`, `employees`, `customers`, `customer_tags`.
3. **Agenda**: `appointments`, `staff_availability`, `appointment_logs`.
4. **Produtos & PDV**: `products`, `inventory`, `orders`, `order_payments`.
5. **Financeiro/Billing**: `invoices`, `payments`, `payouts`.
6. **Super Admin**: `support_tickets`, `audit_logs`, `playbooks`, `incidents`.
7. **Público & Analytics**: `customer_sessions`, `funnel_steps`, `upsell_offers`.

## 11. Próximos Passos
- Validar esse blueprint com os fluxos atuais (já revisados) e definir as colunas obrigatórias de cada tabela.
- Criar migrations iniciais via MCP (`supabase apply_migration`) seguindo a sequência acima.
- Preparar scripts de seed para popular `plans`, `services` demo, `tenants` mock.
- Ajustar os providers do app (`tenant-context`, `auth-context`) para consumir o Supabase assim que as tabelas base estiverem prontas.

