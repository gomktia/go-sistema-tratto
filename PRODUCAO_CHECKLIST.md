# Checklist de Preparação para Produção - BeautyFlow SAAS

Este documento lista os itens críticos identificados que precisam ser abordados antes de lançar a aplicação em um ambiente de produção real.

## 1. Segurança e Multi-tenancy (Crítico 🚨)
- [ ] **Middleware de Subdomínios:** O arquivo `src/middleware.ts` atual não tem a lógica ativa para redirecionar `tenant.beautyflow.app` para `/tenant`. Atualmente, o sistema só funciona acessando manualmente `/tenant-slug`.
  - **Ação:** Implementar reescrita de URL baseada em hostname.
- [ ] **RLS Policies (Row Level Security):** Verificar se TODAS as tabelas (`customers`, `appointments`, `services`) têm policies `USING (tenant_id = ...)` ativas.
  - **Risco:** Sem isso, um hacker inteligente poderia tentar acessar agendamentos de outro salão via API do Supabase.

## 2. Comunicação e Notificações (Falta Implementação 📧)
- [ ] **Envio de E-mails:** Não há serviço de envio de e-mail (Resend, SendGrid, AWS SES) integrado.
  - **Impacto:** O cliente agenda, mas não recebe confirmação por e-mail. A recuperação de senha também não funcionará.
- [ ] **Integração WhatsApp:** O botão de WhatsApp apenas abre o link `wa.me`. Não há envio automático de mensagens (API de WhatsApp Business ou Twilio) para lembretes de agendamento.

## 3. Pagamentos e Financeiro (Falta Integração 💸)
- [ ] **Gateway de Pagamento:** O fluxo de pagamento no frontend é apenas visual (mock).
  - **Ação:** Integrar Stripe, Asaas ou Mercado Pago para processar Pix e Cartão de verdade.
- [ ] **Webhooks:** Não existem rotas de API para receber confirmação de pagamento do banco (`/api/webhooks/stripe`).
  - **Impacto:** O agendamento continuará "Pendente" mesmo se o cliente pagar, a menos que o admin aprove manualmente.

## 4. Infraestrutura e Build 
- [ ] **Variáveis de Ambiente:** Garantir que chaves como `NEXT_PUBLIC_ROOT_DOMAIN`, `SUPABASE_SERVICE_ROLE_KEY` estejam configuradas no Vercel/Ambiente de Produção.
- [ ] **Storage Buckets:** Garantir que os buckets `images` e `avatars` no Supabase sejam públicos ou tenham policies de leitura corretas para que as imagens carreguem em produção.

## 5. Qualidade de Dados (Data Integrity)
- [ ] **Migração de Mocks:** Ainda existem mocks hardcoded em alguns lugares (ex: listas de funcionários podem estar híbridas).
- [ ] **Validação de CPF:** A validação atual aceita qualquer número com 11 dígitos. Implementar validação de dígito verificador seria ideal para evitar spam.

---

### Recomendação de Próximos Passos:

1.  **Prioridade 1:** Consertar o **Middleware** para que o sistema funcione como SAAS de verdade (URL bonita).
2.  **Prioridade 2:** Implementar **Envio de Email Básico** (pelo menos para "Esqueci minha senha" e "Confirmação de Agendamento").
3.  **Prioridade 3:** Revisar policies RLS no Supabase.

O que você gostaria de atacar primeiro?
