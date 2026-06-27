# Product Requirements Document (PRD)
# Tratto - Sistema de Gestão para Salões de Beleza

**Versão:** 1.0
**Data:** 26 de Junho de 2026
**Status:** Documentação de Sistema Existente

---

## 📋 Sumário Executivo

### Visão Geral do Produto

**Tratto** é uma plataforma SaaS multi-tenant completa para gestão de salões de beleza, barbearias e clínicas de estética. O sistema oferece soluções integradas para agendamento, gestão financeira, CRM, controle de estoque, programas de fidelidade e marketing digital.

### Proposta de Valor

- **Para Profissionais Autônomos:** Agenda inteligente, controle de clientes e comissões
- **Para Gerentes de Salão:** Gestão completa do negócio em uma única plataforma
- **Para Redes de Salões:** Gestão multi-unidades com visão consolidada
- **Para Clientes Finais:** Agendamento online simplificado e programa de fidelidade

### Modelo de Negócio

SaaS com 4 tiers de assinatura:

| Plano | Preço | Profissionais | Características |
|-------|-------|---------------|-----------------|
| **Trial** | Gratuito (15 dias) | Ilimitado | Acesso total às funcionalidades |
| **PRO** | R$ 49,90/mês | Até 2 | Essencial para autônomos |
| **Premium** | R$ 99,90/mês | Até 5 | Gestão completa + módulos avançados |
| **Elite** | R$ 199,90/mês | Ilimitado | Poder total + multi-unidades |

---

## 🎯 Objetivos do Produto

### Objetivos de Negócio

1. **Reduzir no-shows** através de notificações automáticas e confirmações
2. **Aumentar receita** via upsell (combos), programa de fidelidade e análise de dados
3. **Otimizar operação** com automação de processos administrativos
4. **Melhorar experiência do cliente** com agendamento online e atendimento personalizado
5. **Escalar negócio** permitindo gestão de múltiplas unidades

### Métricas de Sucesso (KPIs)

- Taxa de ocupação da agenda (target: >75%)
- Taxa de no-show (target: <10%)
- NPS (Net Promoter Score) clientes (target: >50)
- Ticket médio por atendimento
- Taxa de retenção de clientes mensais
- Receita recorrente mensal (MRR)
- Lifetime Value (LTV) por cliente

---

## 👥 Personas e Tipos de Usuário

### 1. Cliente Final (Customer)

**Perfil:** Pessoa física que agenda e consome serviços

**Necessidades:**
- Agendar serviços de forma rápida e fácil
- Visualizar histórico de atendimentos
- Acompanhar programa de fidelidade
- Receber lembretes de agendamentos
- Deixar avaliações

**Fluxo de Autenticação:**
- Acesso via: `/{tenantSlug}/login`
- Identificação: CPF ou Email
- Credenciais armazenadas em: `customer_credentials` (bcrypt)
- Redirecionamento: `/{tenantSlug}/profile`

---

### 2. Profissional/Funcionário (Employee)

**Perfil:** Cabeleireiro, manicure, esteticista, barbeiro

**Necessidades:**
- Visualizar agenda pessoal do dia
- Gerenciar disponibilidade e folgas
- Acompanhar comissões e faturamento
- Registrar atendimentos
- Comunicar com clientes

**Fluxo de Autenticação:**
- Acesso via: `/{tenantSlug}/login`
- Identificação: Email
- Credenciais: Supabase Auth (auth.users)
- Metadata: `{ role: 'employee', tenant_id: uuid }`
- Redirecionamento: `/{tenantSlug}/profissional/dashboard`

**Páginas Exclusivas:**
- `/profissional/agenda` - Agenda do dia
- `/profissional/dashboard` - Dashboard pessoal
- `/profissional/clientes` - Clientes atendidos
- `/profissional/financeiro` - Comissões e ganhos
- `/profissional/disponibilidade` - Horários de trabalho
- `/profissional/folgas` - Gerenciamento de folgas
- `/profissional/configuracoes` - Preferências

---

### 3. Gerente/Administrador do Salão (Company Admin)

**Perfil:** Dono ou gerente do estabelecimento

**Necessidades:**
- Visão 360° do negócio
- Gestão de equipe e agenda geral
- Controle financeiro completo
- Análise de desempenho
- Gerenciamento de estoque
- Configuração do tenant

**Fluxo de Autenticação:**
- Acesso via: `/{tenantSlug}/login` ou `/login`
- Identificação: Email
- Credenciais: Supabase Auth
- Metadata: `{ role: 'company_admin', tenant_id: uuid }`
- Redirecionamento: `/dashboard` ou `/{tenantSlug}/(admin)/dashboard`

**Módulos de Gestão:**

1. **Dashboard** - Visão geral do negócio
2. **Agenda** - Gestão centralizada de todos os agendamentos
3. **Clientes** - CRM completo
4. **Funcionários** - Gestão de equipe
5. **Serviços** - Catálogo de serviços
6. **Financeiro** - Receitas, despesas, comissões
7. **Estoque** - Controle de produtos
8. **Relatórios** - Analytics e BI
9. **Fidelidade** - Programa de pontos
10. **Social** - Galeria e marketing
11. **Integrações** - WhatsApp, Google Calendar, etc.
12. **Assinatura** - Gestão do plano
13. **Configurações** - Personalização do tenant

---

### 4. Super Administrador (Super Admin)

**Perfil:** Administrador da plataforma Tratto (não pertence a um tenant específico)

**Necessidades:**
- Gerenciar todos os tenants da plataforma
- Monitorar saúde do sistema
- Suporte a clientes
- Gestão de planos e cobranças
- Auditoria e compliance
- Configurações globais

**Fluxo de Autenticação:**
- Acesso via: `/system/login`
- Identificação: Email
- Credenciais: Supabase Auth
- Metadata: `{ role: 'super_admin' }`
- Redirecionamento: `/super-admin/dashboard`

**Módulos Super Admin:**

1. **Dashboard** - Métricas globais da plataforma
2. **Empresas** - Gestão de tenants
3. **Planos** - Configuração de planos de assinatura
4. **Cobranças** - Faturamento e inadimplência
5. **Financeiro** - Visão financeira da plataforma
6. **Administradores** - Gestão de super admins
7. **Suporte** - Sistema de tickets
8. **Auditoria** - Logs e compliance
9. **Playbooks** - Documentação e procedimentos
10. **Configurações** - Settings globais

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

#### Frontend
- **Framework:** Next.js 16.1.1 (App Router)
- **UI Library:** React 19.2.3
- **Linguagem:** TypeScript 5
- **Estilização:** TailwindCSS 3.4.19
- **Componentes:** Shadcn/UI + Radix UI
- **Animações:** Framer Motion 12.23.26
- **Gráficos:** Recharts 3.6.0
- **Formulários:** React Hook Form 7.69.0 + Zod 4.2.1
- **Data Handling:** date-fns 4.1.0

#### Backend & Database
- **BaaS:** Supabase
  - PostgreSQL (database)
  - Supabase Auth (autenticação)
  - Supabase Storage (arquivos)
  - Row Level Security (RLS)
- **ORM:** Supabase JS Client 2.89.0
- **Email:** Resend 6.6.0

#### Autenticação & Segurança
- **Auth Provider:** Supabase Auth + Custom Auth Layer
- **Password Hashing:** bcryptjs 3.0.3
- **Session Management:** Server-side + Client Context

#### DevOps & Tooling
- **Build:** Next.js Compiler
- **Linting:** ESLint 9
- **Package Manager:** npm
- **Deployment:** Vercel (assumido)

---

### Arquitetura de Pastas

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Rotas autenticadas (layout global)
│   │   ├── profissional/         # Área do profissional
│   │   ├── perfil/               # Perfil do usuário logado
│   │   ├── crm/                  # CRM global
│   │   ├── dashboard/            # Dashboard global
│   │   ├── financeiro/           # Financeiro global
│   │   ├── galeria/              # Galeria global
│   │   └── super-admin/          # Módulos do super admin
│   │       ├── dashboard/
│   │       ├── empresas/
│   │       ├── planos/
│   │       ├── cobrancas/
│   │       ├── financeiro/
│   │       ├── administradores/
│   │       ├── suporte/
│   │       ├── auditoria/
│   │       ├── playbooks/
│   │       └── configuracoes/
│   ├── [tenantSlug]/             # Rotas multi-tenant
│   │   ├── (admin)/              # Área administrativa do tenant
│   │   │   ├── dashboard/
│   │   │   ├── agenda/
│   │   │   ├── clientes/
│   │   │   ├── funcionarios/
│   │   │   ├── servicos/
│   │   │   ├── financeiro/
│   │   │   ├── estoque/
│   │   │   ├── relatorios/
│   │   │   ├── fidelidade/
│   │   │   ├── social/
│   │   │   ├── integracoes/
│   │   │   ├── assinatura/
│   │   │   ├── crm/
│   │   │   └── configuracoes/
│   │   ├── profissional/         # Área do profissional (tenant-scoped)
│   │   │   └── dashboard/
│   │   ├── login/                # Login do tenant
│   │   ├── signup/               # Cadastro de cliente
│   │   ├── profile/              # Perfil do cliente
│   │   ├── book/                 # Agendamento online
│   │   ├── shop/                 # Loja de produtos
│   │   ├── review/               # Avaliações
│   │   ├── forgot-password/      # Recuperação de senha
│   │   └── page.tsx              # Landing page do tenant
│   ├── system/
│   │   └── login/                # Login do super admin
│   ├── api/                      # API Routes
│   │   ├── admin/
│   │   │   ├── create-user/
│   │   │   ├── users/
│   │   │   └── companies/
│   │   └── send-email/
│   │       └── booking-confirmation/
│   ├── login/                    # Login genérico
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Componentes React
│   ├── ui/                       # Componentes base (Shadcn/UI)
│   ├── layout/                   # Layouts e navigation
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── ProfessionalSidebar.tsx
│   │   └── SuperAdminSidebar.tsx
│   ├── agenda/
│   ├── super-admin/
│   └── [feature-components]/
├── contexts/                     # React Contexts
│   ├── auth-context.tsx          # Autenticação
│   └── tenant-context.tsx        # Multi-tenancy
├── lib/                          # Bibliotecas e utilitários
│   ├── auth-helpers.ts           # Funções de autenticação
│   ├── email.ts                  # Email service
│   ├── email-templates/          # Templates de email
│   ├── utils.ts                  # Utilitários gerais
│   └── supabase/                 # Supabase clients
│       ├── client.ts             # Client-side
│       └── supabase.ts           # Server-side
├── services/                     # Business logic
│   └── invoice.ts
├── hooks/                        # Custom React hooks
│   ├── useSubscription.ts
│   └── useTenantRecords.ts
├── config/                       # Configurações
│   └── subscription.ts           # Planos de assinatura
├── types/                        # TypeScript types
│   ├── crm.ts
│   └── catalog.ts
└── mocks/                        # Dados mock (desenvolvimento)
    ├── data.ts
    ├── tenants.ts
    ├── customers.ts
    ├── services.ts
    ├── companies.ts
    ├── invoices.ts
    ├── notifications.ts
    ├── combos.ts
    ├── marketing.ts
    ├── audit.ts
    ├── support.ts
    ├── playbooks.ts
    └── inventory.ts
```

---

## 🗄️ Modelo de Dados (Database Schema)

### Arquitetura Multi-Tenant

Todos os dados são isolados por `tenant_id`, garantindo segregação completa entre diferentes estabelecimentos.

### Tabelas Principais (46 tabelas)

#### 1. **Gestão de Usuários e Autenticação**

**app_users**
```sql
- id (uuid, PK)
- full_name (text)
- avatar_url (text)
- locale (text, default: 'pt-BR')
- created_at, updated_at
```

**customer_credentials**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- customer_id (uuid, FK)
- identity_type (text) -- 'email' ou 'cpf'
- identity_value (text) -- valor do identificador
- secret_hash (text) -- senha bcrypt
- created_at, updated_at
```

**employees**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- user_id (uuid, FK -> auth.users)
- full_name (text)
- email (text)
- phone (text)
- role (text)
- status (text, default: 'active')
- color_tag (text) -- para visualização na agenda
- avatar_url (text)
- commission_rate (numeric, default: 0)
- settings (jsonb)
- created_at, updated_at
```

---

#### 2. **Gestão de Clientes (CRM)**

**customers**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- full_name (text, NOT NULL)
- email (text)
- phone (text)
- document (text)
- birthdate (date)
- gender (text)
- notes (text)
- last_visit_at (timestamp)
- total_spent (numeric, default: 0)
- loyalty_points (integer, default: 0)
- status (text, default: 'active')
- marketing_opt_in (boolean, default: true)
- created_at, updated_at
```

**customer_tag_assignments**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- customer_id (uuid, FK)
- tag_id (uuid, FK)
- created_at
```

**customer_events**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- customer_id (uuid, FK)
- event_type (text) -- 'visit', 'purchase', 'review', etc.
- payload (jsonb)
- occurred_at
```

**customer_sessions**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- customer_id (uuid, FK)
- session_token (text)
- ip_address (text)
- user_agent (text)
- started_at, ended_at
- metadata (jsonb)
```

---

#### 3. **Agendamentos**

**appointments**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- service_id (uuid, FK)
- employee_id (uuid, FK)
- customer_id (uuid, FK)
- start_at (timestamp, NOT NULL)
- end_at (timestamp)
- duration_minutes (integer)
- price (numeric)
- currency (text, default: 'BRL')
- channel (text) -- 'web', 'whatsapp', 'phone', 'walk-in'
- status (text, default: 'scheduled')
  -- 'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
- notes (text)
- metadata (jsonb)
- created_at, updated_at
- cancelled_at
- cancelled_by (text)
```

**appointment_logs**
```sql
- id (uuid, PK)
- appointment_id (uuid, FK)
- event_type (text) -- 'created', 'confirmed', 'rescheduled', 'cancelled', 'completed'
- description (text)
- created_at
- metadata (jsonb)
```

---

#### 4. **Catálogo de Serviços**

**services**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- name (text, NOT NULL)
- description (text)
- duration_minutes (integer)
- price (numeric)
- currency (text, default: 'BRL')
- category (text)
- is_active (boolean, default: true)
- image_url (text)
- metadata (jsonb)
- created_at
```

**combos**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- name (text, NOT NULL)
- description (text)
- original_price (numeric) -- soma dos itens individuais
- price (numeric, NOT NULL) -- preço promocional
- currency (text, default: 'BRL')
- image_url (text)
- category (text)
- is_active (boolean, default: true)
- metadata (jsonb)
- created_at
```

**combo_items**
```sql
- id (uuid, PK)
- combo_id (uuid, FK)
- item_type (text) -- 'service' ou 'product'
- item_id (uuid)
- quantity (integer, default: 1)
- metadata (jsonb)
```

---

#### 5. **Gestão Financeira**

**daily_cash_flow**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- reference_date (date, NOT NULL)
- cash_in (numeric, default: 0)
- cash_out (numeric, default: 0)
- notes (text)
- metadata (jsonb)
- created_at
```

**collections_actions**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- invoice_id (uuid, FK)
- status (text, default: 'pending')
- action_type (text) -- 'reminder', 'charge', 'collection'
- due_date (date)
- executed_at (timestamp)
- notes (text)
- metadata (jsonb)
- created_at
```

---

#### 6. **Multi-Tenancy**

**tenants**
```sql
- id (uuid, PK)
- slug (text, UNIQUE) -- URL-friendly identifier
- name (text, NOT NULL)
- description (text)
- logo_url (text)
- banner_url (text)
- contact_phone (text)
- contact_email (text)
- address (jsonb)
- settings (jsonb) -- cores, horários, preferências
- subscription_plan (text) -- 'trial', 'pro', 'premium', 'elite'
- subscription_status (text, default: 'active')
- trial_ends_at (timestamp)
- status (text, default: 'active')
- created_at, updated_at
```

---

#### 7. **Auditoria e Logs**

**audit_logs**
```sql
- id (uuid, PK)
- tenant_id (uuid, FK)
- actor_id (uuid) -- quem fez a ação
- action (text, NOT NULL) -- 'create', 'update', 'delete'
- entity (text) -- 'customer', 'appointment', etc.
- entity_id (uuid)
- description (text)
- metadata (jsonb)
- created_at
```

---

### Segurança (Row Level Security)

**Status Atual:**
- ✅ RLS habilitado em todas as 46 tabelas
- ⚠️ Políticas permissivas (`USING (true)`) para compatibilidade com autenticação custom
- ⚠️ Sem isolamento automático entre tenants via JWT

**Próximos Passos:**
1. Migrar autenticação para Supabase Auth completo
2. Implementar políticas RLS restritivas baseadas em JWT
3. Adicionar `tenant_id` em claims do JWT
4. Aplicar isolamento automático entre tenants

**Exemplo de Política Ideal (Futuro):**
```sql
CREATE POLICY "customers_tenant_isolation" ON customers
    FOR SELECT
    USING (tenant_id = (auth.jwt() -> 'tenant_id')::uuid);
```

---

## 🔐 Sistema de Autenticação Inteligente

### Visão Geral

O Tratto implementa um **sistema de autenticação híbrido** que detecta automaticamente o tipo de usuário e aplica a estratégia de autenticação apropriada.

### Fluxo de Detecção

```
Usuário insere: CPF ou Email
         ↓
   Normalização
         ↓
    ┌────┴────┐
    ↓         ↓
  CPF?     Email?
    ↓         ↓
Cliente   Busca em ordem:
          1. Employee (employees table)
          2. Customer (customer_credentials)
         ↓
   Exibe badge colorido
   🟦 Cliente | 🟪 Profissional
   🟩 Gerente | 🟥 Admin
         ↓
   Solicita senha
         ↓
    Autenticação
         ↓
   Redirecionamento
```

### Arquivo Principal

**`src/lib/auth-helpers.ts`** (323 linhas)

Funções principais:
- `intelligentLogin()` - Login inteligente multi-tipo
- `checkUserExists()` - Verifica existência sem senha (step 1)
- `checkEmployeeAuth()` - Auth via Supabase Auth
- `checkCustomerAuth()` - Auth via customer_credentials
- `getUserTypeBadge()` - Badge visual por tipo

### Prioridade de Autenticação

**Se o identificador é EMAIL:**
1. ✅ Busca em `employees` (Supabase Auth) - PRIORIDADE
2. ✅ Se não encontrado, busca em `customer_credentials`

**Se o identificador é CPF:**
1. ✅ Busca apenas em `customer_credentials` (clientes)

### Modo Dual (Profissional + Cliente)

Um profissional pode também ser cliente do próprio salão.

**Implementação:**
- Login inicial como Employee (prioridade)
- Botão "Modo Cliente" no dashboard profissional
- Permite agendar serviços com outros profissionais
- Session storage mantém ambos os contextos

---

## 📱 Funcionalidades por Módulo

### 1. Sistema de Agendamentos

**Funcionalidades:**
- ✅ Agendamento online pelo cliente
- ✅ Visualização em grade (dia/semana/mês)
- ✅ Arrastar e soltar para reagendar
- ✅ Bloqueios de horário
- ✅ Atribuição de profissional
- ✅ Múltiplos serviços em um agendamento
- ✅ Confirmação automática (WhatsApp/Email)
- ✅ Lembretes automáticos
- ✅ Check-in de cliente
- ✅ Cancelamento com política
- ✅ Lista de espera
- ✅ Histórico de alterações (appointment_logs)

**Canais de Agendamento:**
- Web (cliente/admin)
- WhatsApp
- Telefone
- Walk-in (presencial)

**Status de Agendamento:**
- `scheduled` - Agendado
- `confirmed` - Confirmado pelo cliente
- `in_progress` - Em atendimento
- `completed` - Concluído
- `cancelled` - Cancelado
- `no_show` - Cliente não compareceu

---

### 2. CRM (Customer Relationship Management)

**Funcionalidades:**
- ✅ Cadastro completo de clientes
- ✅ Histórico de atendimentos
- ✅ Histórico de compras
- ✅ Notas e observações
- ✅ Tags e segmentação
- ✅ Eventos de cliente (tracking)
- ✅ Análise de comportamento
- ✅ Clientes VIP/Premium
- ✅ Aniversariantes do mês
- ✅ Clientes inativos (re-engajamento)
- ✅ Valor total gasto (total_spent)
- ✅ Última visita (last_visit_at)
- ✅ Opt-in marketing (LGPD compliant)

**Segmentação:**
- Por valor gasto
- Por frequência de visita
- Por serviços preferidos
- Por profissional preferido
- Por tags personalizadas
- Por status (ativo/inativo)

---

### 3. Gestão Financeira

**Módulos:**

**3.1. Receitas**
- Vendas de serviços
- Vendas de produtos
- Combos e pacotes
- Receitas por profissional
- Receitas por serviço
- Formas de pagamento

**3.2. Despesas**
- Custos operacionais
- Salários e comissões
- Compra de estoque
- Categorização de despesas

**3.3. Comissões**
- Cálculo automático por profissional
- Taxa configurável (commission_rate)
- Relatório de comissões
- Exportação para pagamento

**3.4. Fluxo de Caixa**
- Visão diária (daily_cash_flow)
- Projeções
- Comparativo mês a mês
- Gráficos de tendência

**3.5. Cobranças**
- Ações de cobrança (collections_actions)
- Lembretes automáticos
- Status de inadimplência
- Histórico de tentativas

---

### 4. Controle de Estoque

**Funcionalidades:**
- ✅ Cadastro de produtos
- ✅ Controle de quantidade
- ✅ Alertas de estoque baixo
- ✅ Histórico de movimentações
- ✅ Entrada/saída
- ✅ Inventário físico
- ✅ Fornecedores
- ✅ Custos e margens
- ✅ Integração com vendas

---

### 5. Programa de Fidelidade

**Sistema de Pontos:**
- Acúmulo por valor gasto
- Resgate em serviços/produtos
- Níveis/tiers de cliente
- Recompensas especiais
- Aniversário (bônus)

**Gamificação:**
- Badges/conquistas
- Ranking de clientes
- Desafios mensais
- Notificações de pontos

---

### 6. Galeria e Marketing

**Funcionalidades:**
- ✅ Upload de fotos (antes/depois)
- ✅ Organização por categoria
- ✅ Galeria pública no site do tenant
- ✅ Integração com redes sociais (planejado)
- ✅ Depoimentos de clientes
- ✅ Sistema de avaliações (reviews)
- ✅ Compartilhamento social

**Gestão de Reputação:**
- Coleta de reviews
- Moderação de comentários
- Resposta a avaliações
- Estatísticas de satisfação

---

### 7. Relatórios e Analytics

**Relatórios Disponíveis:**

**7.1. Operacionais**
- Agendamentos por período
- Taxa de ocupação
- Taxa de no-show
- Tempo médio de atendimento
- Serviços mais vendidos

**7.2. Financeiros**
- Faturamento por período
- Receitas vs Despesas
- Comissões por profissional
- Ticket médio
- Formas de pagamento

**7.3. Clientes**
- Novos clientes por período
- Taxa de retenção
- Clientes ativos vs inativos
- Lifetime Value (LTV)
- Clientes por origem

**7.4. Profissionais**
- Desempenho individual
- Ranking de produtividade
- Avaliações recebidas
- Faturamento gerado

---

### 8. Integrações

**Integrações Planejadas:**
- ✅ WhatsApp Business API
- ✅ Google Calendar
- 🚧 Instagram/Facebook
- 🚧 Mercado Pago
- 🚧 PagSeguro
- 🚧 Ifood (para estética)
- 🚧 Email marketing (Resend integrado)

---

### 9. Multi-Unidades (Elite Plan)

**Funcionalidades:**
- Gestão centralizada de múltiplas unidades
- Dashboard consolidado
- Transferência de funcionários
- Comparativo entre unidades
- Relatórios consolidados
- Configurações por unidade

---

### 10. Super Admin

**Gestão da Plataforma:**

**10.1. Empresas (Tenants)**
- Listar todos os tenants
- Criar novo tenant
- Editar informações
- Suspender/reativar
- Visualizar métricas

**10.2. Planos de Assinatura**
- Configurar planos
- Alterar preços
- Features por plano
- Períodos de trial

**10.3. Cobranças**
- Faturas pendentes
- Inadimplência
- Histórico de pagamentos
- Exportação financeira

**10.4. Suporte**
- Sistema de tickets
- Chat em tempo real (planejado)
- Base de conhecimento
- FAQs

**10.5. Auditoria**
- Logs de sistema (audit_logs)
- Ações de usuários
- Alterações críticas
- Compliance LGPD

**10.6. Playbooks**
- Documentação interna
- Processos operacionais
- Scripts de suporte
- Onboarding de clientes

---

## 🎨 Design System

### Componentes UI (Shadcn/UI)

**Componentes Base:**
- Button
- Input, Textarea
- Select, Checkbox, Switch
- Dialog, Alert Dialog, Confirm Dialog
- Form Dialog, Detail Drawer
- Tabs
- Card
- Table
- Badge
- Avatar
- Popover, Dropdown Menu
- Sheet
- Label
- Separator
- Progress
- Theme Toggle, Color Picker
- Image Upload

**Componentes Customizados:**
- `CustomerTrustBar` - Barra de confiança
- `AccountHealthCard` - Card de saúde da conta
- `DailyGoals` - Metas diárias
- `ReviewsList` - Lista de avaliações
- `CustomerReviews` - Reviews de clientes
- `OnboardingWizard` - Wizard de onboarding
- `OnboardingChecklist` - Checklist de setup
- `PdvQuickHub` - Hub rápido PDV
- `QuickActions` - Ações rápidas
- `FloatingWhatsApp` - Botão flutuante WhatsApp
- `NewAppointmentModal` - Modal de novo agendamento
- `CompanyCard` - Card de empresa (super admin)

### Layouts

**3 tipos de layout:**
1. **AppLayout** - Layout global autenticado
2. **TenantLayout** - Layout específico do tenant
3. **SuperAdminLayout** - Layout do super admin

**Sidebars:**
- `Sidebar` - Sidebar padrão (company admin)
- `ProfessionalSidebar` - Sidebar do profissional
- `SuperAdminSidebar` - Sidebar do super admin

### Temas

**Sistema de Temas:**
- ✅ Dark/Light mode (next-themes)
- ✅ Personalização de cores por tenant
- ✅ Theme Provider global
- ✅ Theme Applier dinâmico

---

## 📧 Sistema de Emails

**Email Service:** Resend (integrado)

**Templates Disponíveis:**
- `welcome.ts` - Boas-vindas
- `password-reset.ts` - Recuperação de senha
- `booking-confirmation.ts` - Confirmação de agendamento
- `base.ts` - Template base

**API Route:**
- `/api/send-email/booking-confirmation`

---

## 🚀 Roadmap de Desenvolvimento

### Fase 1: MVP (Concluído) ✅
- [x] Autenticação multi-tipo
- [x] Sistema de agendamentos
- [x] Cadastro de clientes
- [x] Cadastro de serviços
- [x] Dashboard básico
- [x] Multi-tenancy

### Fase 2: Core Features (Concluído) ✅
- [x] CRM completo
- [x] Gestão financeira
- [x] Controle de estoque
- [x] Sistema de comissões
- [x] Relatórios básicos
- [x] Programa de fidelidade

### Fase 3: Automação e Integrações (Em Andamento) 🚧
- [x] Email templates
- [ ] WhatsApp Business API
- [ ] Confirmações automáticas
- [ ] Lembretes automáticos
- [ ] Google Calendar sync
- [ ] Gateway de pagamento

### Fase 4: Analytics e BI (Próximo) 📋
- [ ] Dashboard avançado
- [ ] Relatórios customizáveis
- [ ] Exportação de dados
- [ ] Previsão de demanda
- [ ] Análise de rentabilidade

### Fase 5: Growth Features (Futuro) 🔮
- [ ] App mobile (React Native)
- [ ] Chatbot de atendimento
- [ ] Integrações sociais completas
- [ ] Marketplace de profissionais
- [ ] API pública para parceiros
- [ ] White-label

---

## 🔒 Segurança e Compliance

### Segurança Implementada

**Autenticação:**
- ✅ Supabase Auth para staff/admin
- ✅ Bcrypt para senhas de clientes
- ✅ Session management server-side
- ✅ HTTPS obrigatório (produção)

**Database:**
- ✅ Row Level Security (RLS) habilitado
- ⚠️ Políticas permissivas (migração em andamento)
- ✅ Foreign keys e constraints
- ✅ Audit logs completos

**Frontend:**
- ✅ Sanitização de inputs
- ✅ Validação client + server (Zod)
- ✅ CSRF protection (Next.js)
- ✅ XSS protection

### LGPD Compliance

**Privacidade:**
- ✅ Opt-in marketing explícito
- ✅ Termo de consentimento
- ✅ Direito ao esquecimento (planejado)
- ✅ Portabilidade de dados (planejado)
- ✅ Anonimização de logs

**Dados Sensíveis:**
- CPF armazenado normalizado
- Senhas com hash bcrypt (10 rounds)
- Dados bancários não armazenados
- Logs de acesso (customer_sessions)

---

## 📊 KPIs e Métricas (Monitoramento)

### Métricas de Produto

**Engajamento:**
- DAU/MAU (Daily/Monthly Active Users)
- Taxa de retenção (D1, D7, D30)
- Frequência de agendamentos
- Tempo médio na plataforma

**Operacionais:**
- Taxa de ocupação da agenda
- Taxa de no-show
- Tempo médio de atendimento
- Utilização de recursos (profissionais)

**Financeiras:**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User)
- Churn rate
- LTV/CAC ratio

### Métricas Técnicas

**Performance:**
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)

**Disponibilidade:**
- Uptime (target: 99.9%)
- Error rate (target: <0.1%)
- API response time (target: <200ms)

---

## 🧪 Estratégia de Testes

### Testes Planejados

**Unit Tests:**
- Funções de autenticação
- Cálculos financeiros
- Lógica de negócio
- Utilities

**Integration Tests:**
- Fluxo de agendamento completo
- Processamento de pagamentos
- Envio de emails
- Sincronização com integrações

**E2E Tests:**
- Jornada do cliente (agendamento)
- Jornada do profissional (atendimento)
- Jornada do gerente (configuração)
- Jornada do super admin (gestão)

**Performance Tests:**
- Carga de múltiplos tenants
- Consultas de relatórios pesados
- Upload de imagens
- Geração de exports

---

## 🌍 Internacionalização (i18n)

**Idiomas Planejados:**
1. 🇧🇷 Português (BR) - Atual
2. 🇺🇸 Inglês (planejado)
3. 🇪🇸 Espanhol (planejado)

**Estratégia:**
- Locale armazenado em `app_users.locale`
- Tradução de UI strings
- Formatação de datas/números
- Moedas múltiplas (BRL, USD, EUR)

---

## 💰 Modelo de Monetização

### Planos de Assinatura

Definidos em `src/config/subscription.ts`

#### Trial (R$ 0,00 - 15 dias)
- Acesso completo
- Ilimitado profissionais
- Todos os módulos
- Suporte VIP
- *Objetivo: Conversão para plano pago*

#### PRO (R$ 49,90/mês)
- Até 2 profissionais
- Agenda + CRM
- Sem módulos financeiros
- Suporte padrão
- *Target: Autônomos e pequenos espaços*

#### Premium (R$ 99,90/mês)
- Até 5 profissionais
- Todos os módulos exceto multi-unidades
- Galeria e marketing
- Suporte prioritário
- *Target: Salões em crescimento*

#### Elite (R$ 199,90/mês)
- Profissionais ilimitados
- Multi-unidades
- Clube de fidelidade
- Domínio customizado
- Suporte VIP
- *Target: Grandes salões e redes*

### Upsell Opportunities

1. **Add-ons:**
   - WhatsApp Business API (R$ 29,90/mês)
   - SMS notifications (R$ 19,90/mês)
   - Email marketing avançado (R$ 39,90/mês)

2. **Serviços:**
   - Onboarding personalizado (one-time)
   - Consultoria de negócio (mensal)
   - Design de marca (one-time)

3. **Comissão:**
   - Marketplace (taxa por transação)
   - Integração com delivery (comissão)

---

## 📝 Documentação Técnica Existente

### Arquivos de Documentação

1. **INTELLIGENT_LOGIN.md** - Sistema de login inteligente
2. **SUPABASE_SETUP.md** - Setup do Supabase
3. **SEGURANCA-SUPABASE.md** - Guia de segurança
4. **STATUS-SEGURANCA.md** - Status atual de segurança
5. **EXEMPLO-SUPABASE-AUTH.md** - Tutorial de autenticação
6. **GUIA-VINCULAR-PROFISSIONAIS.md** - Vinculação de profissionais
7. **INSTRUCOES_DATA_NASCIMENTO.md** - Instruções de data de nascimento
8. **PRODUCAO_CHECKLIST.md** - Checklist de produção
9. **CREDENCIAIS_ANA_CLAUDIA.md** - Credenciais de teste
10. **RELATORIO_TESTE_ANA_CLAUDIA.md** - Relatório de testes

### Scripts SQL

**Migrations:**
- `20250129_create_reviews_table.sql`
- `20250129_add_cancellation_fields.sql`

**Schema:**
- `full_schema.sql` (604 linhas) - Schema completo

**Seeds:**
- `seed-test-data.sql` - Dados de teste
- `seed-test-data-safe.sql` - Seed seguro
- `seed-with-existing-tenants.sql`
- `seed_barbearia_viking.sql`
- `seed_marketing.sql`
- `seed_plans.sql`
- `seed_plans_safe.sql`

**Correções:**
- `FIX_PLANS_MASTER.sql`
- `CORRECAO_CPF_ANA_CLAUDIA.sql`
- `CORRIGIR_SENHA_ANA.sql`
- `SOLUCAO_DEFINITIVA_SENHA.sql`

**Utilitários:**
- `storage_policies.sql`
- `fix_gallery_bucket.sql`
- `fix_gallery_bucket_v2.sql`
- `create_app_user_trigger.sql`
- `add_metadata_to_plans.sql`
- `add_tenant_status.sql`

**RLS:**
- `supabase-rls-policies.sql`
- `supabase-rls-complete.sql`
- `supabase-rls-final.sql`

---

## 🎓 Onboarding de Usuários

### Fluxo de Onboarding (Novo Tenant)

**Fase 1: Cadastro (5 min)**
1. Escolha de plano
2. Dados da empresa
3. Criação de conta admin
4. Escolha de slug (URL)

**Fase 2: Configuração Inicial (10 min)**
5. Upload de logo e cores
6. Configuração de horários
7. Cadastro de serviços iniciais
8. Cadastro de profissionais

**Fase 3: Ativação (5 min)**
9. Teste de agendamento
10. Configuração de notificações
11. Tour guiado pela plataforma
12. Checklist de setup

**Componentes:**
- `OnboardingWizard` - Wizard completo
- `OnboardingChecklist` - Checklist de tarefas

---

## 🆘 Suporte e Manutenção

### Níveis de Suporte

**Standard (Pro Plan):**
- Email support (resposta em 24h)
- Base de conhecimento
- FAQs
- Tutoriais em vídeo

**Priority (Premium Plan):**
- Email support (resposta em 12h)
- Chat support (horário comercial)
- Acesso a webinars
- Consultoria mensal

**VIP (Elite Plan):**
- Email support (resposta em 4h)
- Chat support (24/7)
- Telefone dedicado
- Account manager
- Consultoria semanal
- Acesso antecipado a features

### Sistema de Tickets

**Status:**
- `open` - Aberto
- `in_progress` - Em atendimento
- `waiting_customer` - Aguardando cliente
- `resolved` - Resolvido
- `closed` - Fechado

**Prioridade:**
- P1 - Crítico (sistema fora)
- P2 - Alto (feature quebrada)
- P3 - Médio (bug menor)
- P4 - Baixo (melhoria)

---

## 🔄 Ciclo de Vida do Cliente

### Acquisition
1. Landing page otimizada
2. Trial de 15 dias
3. Onboarding guiado
4. Quick wins iniciais

### Activation
1. Primeiro agendamento
2. Primeiro cliente cadastrado
3. Primeira venda registrada
4. Configuração completa

### Retention
1. Features que geram hábito
2. Notificações de valor
3. Suporte proativo
4. Webinars e treinamentos

### Revenue
1. Upsell para planos superiores
2. Add-ons e integrações
3. Serviços de consultoria
4. Marketplace

### Referral
1. Programa de indicação
2. Casos de sucesso
3. Testimonials
4. Incentivos

---

## 🎯 Diferenciais Competitivos

### Vs. Concorrentes Tradicionais

**Tratto oferece:**
1. ✅ **Multi-tenant nativo** - Cada salão com sua URL própria
2. ✅ **Autenticação inteligente** - Detecta automaticamente tipo de usuário
3. ✅ **Modo dual** - Profissional pode ser cliente
4. ✅ **Programa de fidelidade** - Gamificação integrada
5. ✅ **Multi-unidades** - Gestão de redes de salões
6. ✅ **Planos flexíveis** - Do autônomo à rede
7. ✅ **Tech moderna** - Next.js, React, TypeScript
8. ✅ **Mobile-first** - Design responsivo
9. ✅ **Open to integrations** - API-first architecture
10. ✅ **LGPD compliant** - Privacidade by design

---

## 📈 Casos de Uso

### Caso 1: Profissional Autônomo

**Persona:** Julia, cabeleireira autônoma

**Pain Points:**
- Perde tempo com confirmações manuais
- Clientes esquecem agendamentos
- Difícil controlar comissões
- Não tem visão do faturamento

**Como Tratto Resolve:**
- ✅ Confirmações automáticas por WhatsApp
- ✅ Lembretes automáticos 24h antes
- ✅ Dashboard de comissões em tempo real
- ✅ Relatório financeiro mensal

**Plano Recomendado:** PRO (R$ 49,90)

---

### Caso 2: Salão de Porte Médio

**Persona:** Carlos, dono de salão com 8 profissionais

**Pain Points:**
- Agenda desorganizada (papel + WhatsApp)
- Clientes reclamam de espera
- Não sabe quais serviços vendem mais
- Perde tempo com caixa manual

**Como Tratto Resolve:**
- ✅ Agenda centralizada visual
- ✅ Confirmação automática reduz no-shows
- ✅ Relatórios de serviços mais vendidos
- ✅ Fluxo de caixa automatizado

**Plano Recomendado:** Premium (R$ 99,90)

---

### Caso 3: Rede de Salões

**Persona:** Mariana, gestora de 5 unidades

**Pain Points:**
- Dados descentralizados
- Difícil comparar desempenho entre unidades
- Transferência de profissionais é caótica
- Relatórios consolidados demoram dias

**Como Tratto Resolve:**
- ✅ Dashboard consolidado multi-unidades
- ✅ Comparativo automático de performance
- ✅ Transferência digital de funcionários
- ✅ Relatórios em tempo real

**Plano Recomendado:** Elite (R$ 199,90)

---

## 🏁 Conclusão

Tratto é uma plataforma completa e moderna para gestão de salões de beleza, desenvolvida com tecnologias de ponta e arquitetura escalável. O sistema cobre todos os aspectos operacionais, desde agendamento até análise financeira, oferecendo uma solução integrada que cresce junto com o negócio do cliente.

### Próximos Passos Recomendados

1. **Migração de Autenticação Completa**
   - Unificar auth em Supabase Auth
   - Implementar RLS restritivo
   - JWT com tenant_id nos claims

2. **Automações de Marketing**
   - WhatsApp Business API
   - Campanhas de reativação
   - Email marketing segmentado

3. **Mobile Apps**
   - App para clientes (React Native)
   - App para profissionais (agenda mobile)

4. **Marketplace**
   - Descoberta de profissionais
   - Agendamento cross-tenant
   - Comissionamento de plataforma

5. **BI Avançado**
   - Dashboards customizáveis
   - Exportação de dados
   - Integrações com Google Data Studio

---

**Documento gerado em:** 26/06/2026
**Versão do Sistema:** 0.1.0
**Próxima Revisão:** Trimestral
