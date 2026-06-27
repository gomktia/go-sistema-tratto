# 🗄️ Guia de Setup do Supabase - BeautyFlow

Este guia te ajudará a conectar o BeautyFlow com o Supabase e popular dados de teste de forma **segura**.

---

## 📋 Pré-requisitos

- [x] Conta no Supabase criada
- [x] Projeto no Supabase criado
- [x] Schema do banco já configurado (você já tem!)
- [ ] Node.js instalado (v18+)
- [ ] Variáveis de ambiente configuradas

---

## 🚀 Passo a Passo

### **1. Configurar Variáveis de Ambiente**

#### 1.1. Copiar o arquivo de exemplo:
```bash
cp .env.example .env.local
```

#### 1.2. Obter as chaves do Supabase:

1. Acesse: https://app.supabase.com/project/_/settings/api
2. Copie as seguintes informações:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** (⚠️ SECRETA!) → `SUPABASE_SERVICE_ROLE_KEY`

#### 1.3. Editar `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (diferente!)
```

⚠️ **IMPORTANTE:** Nunca commite o `.env.local` no Git!

---

### **2. Popular Dados de Teste**

#### 2.1. Executar o SQL Seed

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor** (menu lateral)
3. Clique em **"+ New query"**
4. Copie TODO o conteúdo de `supabase/seed-test-data.sql`
5. Cole no editor
6. Clique em **"Run"** (ou `Ctrl+Enter`)

✅ **Resultado esperado:**
```
Tenants: 2
Services: 8
Employees: 5
Customers: 5
Customer Credentials: 10
```

#### 2.2. Criar Usuários de Autenticação

**IMPORTANTE:** Este passo cria usuários no Supabase Auth (staff/admin).

```bash
# Instalar dependências (se ainda não tiver)
npm install

# Instalar tsx globalmente (para executar TypeScript)
npm install -D tsx dotenv

# Executar o script
npx tsx scripts/create-auth-users.ts
```

✅ **Resultado esperado:**
```
✅ Processo concluído!

📋 Resumo dos usuários criados:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Super Admin:
  📧 geisonhoehr@gmail.com | 🔑 123456

Beleza Pura:
  📧 gerente@belezapura.com | 🔑 senha (Admin)
  📧 julia@belezapura.com | 🔑 senha (Funcionária)

Studio Glamour:
  📧 gerente@studioglamour.com | 🔑 senha (Admin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

### **3. Testar a Conexão**

```bash
# Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

#### 3.1. Testar Login de Cliente

1. Acesse: http://localhost:3000/beleza-pura/login
2. Use um dos clientes:
   - **Email:** maria.silva@email.com
   - **CPF:** 123.456.789-01
   - **Senha:** senha123

#### 3.2. Testar Login de Empresa/Staff

1. Acesse: http://localhost:3000/login
2. Use:
   - **Email:** gerente@belezapura.com
   - **Senha:** senha

#### 3.3. Testar Login de Super Admin

1. Acesse: http://localhost:3000/system/login
2. Use:
   - **Email:** geisonhoehr@gmail.com
   - **Senha:** 123456

---

## 👥 Dados de Teste Completos

### 🏢 **TENANTS (Salões)**

| Nome | Slug | WhatsApp |
|------|------|----------|
| Beleza Pura | `beleza-pura` | +5511999887766 |
| Studio Glamour | `studio-glamour` | +5511988776655 |

---

### 👔 **STAFF & ADMIN** (Login via Supabase Auth)

#### Super Admin (Plataforma):
- 📧 `geisonhoehr@gmail.com` | 🔑 `123456`

#### Beleza Pura:
- 📧 `gerente@belezapura.com` | 🔑 `senha` (Admin)
- 📧 `julia@belezapura.com` | 🔑 `senha` (Cabeleireira)

#### Studio Glamour:
- 📧 `gerente@studioglamour.com` | 🔑 `senha` (Admin)

---

### 👤 **CLIENTES** (Login via `/{tenant}/login`)

#### Beleza Pura:

| Nome | Email | CPF | Senha | Pontos |
|------|-------|-----|-------|--------|
| Maria Silva | maria.silva@email.com | 123.456.789-01 | senha123 | 150 |
| Ana Paula Santos | ana.santos@email.com | 234.567.890-12 | senha123 | 320 |
| Carla Oliveira | carla.oliveira@email.com | 345.678.901-23 | senha123 | 80 |

#### Studio Glamour:

| Nome | Email | CPF | Senha | Pontos |
|------|-------|-----|-------|--------|
| João Pedro | joao.pedro@email.com | 456.789.012-34 | senha123 | 50 |
| Lucas Mendes | lucas.mendes@email.com | 567.890.123-45 | senha123 | 120 |

---

## 🔒 Segurança

### ✅ Boas Práticas Implementadas:

1. **Senhas com Hash:** Todas as senhas de clientes usam bcrypt
2. **Service Role Key Separada:** Nunca exposta no frontend
3. **RLS (Row Level Security):** Configure políticas no Supabase
4. **Credenciais Separadas:**
   - Staff/Admin → `auth.users` (Supabase Auth nativo)
   - Clientes → `customer_credentials` (tabela customizada)

### ⚠️ Para Produção:

- [ ] Mudar TODAS as senhas de teste
- [ ] Configurar RLS (Row Level Security) no Supabase
- [ ] Habilitar 2FA para Super Admin
- [ ] Usar variáveis de ambiente diferentes (production)
- [ ] Configurar CORS adequadamente
- [ ] Habilitar rate limiting

---

## 🐛 Troubleshooting

### Erro: "Failed to run sql query"
**Causa:** Sintaxe SQL incorreta ou tabelas já populadas
**Solução:**
- Verifique se copiou TODO o SQL
- Se quiser resetar, descomente as linhas de `DELETE` no início do arquivo

### Erro: "User already exists"
**Causa:** Usuário já foi criado anteriormente
**Solução:** Normal! O script pula usuários existentes automaticamente

### Erro: "SUPABASE_SERVICE_ROLE_KEY not configured"
**Causa:** Variável de ambiente não configurada
**Solução:**
1. Verifique se `.env.local` existe
2. Confirme que a chave está correta (é diferente da anon key!)
3. Reinicie o terminal

### Erro: "Invalid login credentials"
**Causa:** Senha incorreta ou usuário não existe
**Solução:**
- Confira se executou o script `create-auth-users.ts`
- Verifique no Supabase Dashboard → Authentication → Users

---

## 📚 Próximos Passos

Após configurar tudo:

1. ✅ Dados de teste populados
2. ✅ Autenticação funcionando
3. ⬜ Integrar `auth-context.tsx` com Supabase Auth real
4. ⬜ Implementar RLS (Row Level Security)
5. ⬜ Configurar webhooks (opcional)
6. ⬜ Deploy na Vercel

---

## 🆘 Precisa de Ajuda?

- 📖 [Documentação Supabase](https://supabase.com/docs)
- 🔐 [Guia de Auth](https://supabase.com/docs/guides/auth)
- 💬 [Discord Supabase](https://discord.supabase.com/)

---

**Criado com ❤️ para BeautyFlow**
