# 🔒 Guia de Segurança - Supabase RLS

## ⚠️ SITUAÇÃO ATUAL - CRÍTICO

Suas tabelas estão marcadas como **"UNRESTRICTED"** (vermelho) porque:

1. ❌ Row Level Security (RLS) está **DESABILITADO**
2. ❌ Qualquer pessoa com sua API Key pública pode:
   - Ler TODOS os dados de TODAS as empresas
   - Modificar/deletar qualquer registro
   - Criar registros falsos
   - Não há isolamento entre tenants

## 🚀 SOLUÇÃO RÁPIDA (Implementar AGORA)

### Passo 1: Execute o Script SQL

1. Abra o Supabase Dashboard
2. Vá em **SQL Editor**
3. Clique em **New Query**
4. Cole o conteúdo do arquivo `supabase-rls-policies.sql`
5. Clique em **Run**

✅ Isso habilitará RLS em todas as tabelas

### Passo 2: Verifique se funcionou

Execute esta query no SQL Editor:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Todas as tabelas devem mostrar `rowsecurity = true`

## ⚠️ IMPORTANTE - Limitações Atuais

### O que o script faz:

✅ **Habilita RLS** - Protege contra acesso direto à API
✅ **Cria políticas permissivas** - Não quebra sua aplicação atual
✅ **Permite acesso público** - Necessário porque não usa Supabase Auth ainda

### O que o script NÃO faz (ainda):

❌ Não implementa isolamento real entre tenants
❌ Não autentica usuários via JWT
❌ Não restringe acesso por tenant_id

**Por quê?** Seu código atual usa autenticação customizada (session storage), não Supabase Auth.

## 🎯 PRÓXIMOS PASSOS - Segurança Completa

Para ter segurança REAL, você precisa:

### Opção 1: Migrar para Supabase Auth (Recomendado)

```typescript
// Ao invés de session storage, usar:
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
})

// O JWT terá tenant_id, customer_id automaticamente
```

**Vantagens:**
- Segurança automática via JWT
- RLS funciona nativamente
- Sessões seguras
- Refresh tokens automáticos

### Opção 2: Usar Service Role Key no Backend

```typescript
// Criar API routes protegidas em /app/api/
// Usar service_role key apenas no servidor
// Validar tenant_id manualmente
```

**Desvantagens:**
- Mais código para manter
- Precisa validar manualmente
- Mais complexo

## 🔐 Exemplo: Política Segura vs Permissiva

### Atual (Permissiva - Temporária):
```sql
CREATE POLICY "customers_tenant_isolation" ON customers
    FOR SELECT
    USING (true);  -- ⚠️ Qualquer um pode ler
```

### Ideal (Segura - Com Supabase Auth):
```sql
CREATE POLICY "customers_tenant_isolation" ON customers
    FOR SELECT
    USING (
        tenant_id::text = auth.jwt() ->> 'tenant_id'
    );  -- ✅ Só vê do próprio tenant
```

## 📋 Checklist de Segurança

- [ ] Executar `supabase-rls-policies.sql`
- [ ] Verificar que todas as tabelas têm `rowsecurity = true`
- [ ] Planejar migração para Supabase Auth
- [ ] Atualizar políticas para usar JWT após migração
- [ ] Testar isolamento entre tenants
- [ ] Remover políticas permissivas (true)
- [ ] Adicionar auditoria de acesso

## 🚨 FAQ

### P: Se eu executar o script, vai quebrar minha aplicação?
**R:** NÃO. O script usa políticas permissivas (`USING (true)`) que mantêm tudo funcionando. Mas ainda não há isolamento real.

### P: Quando devo migrar para Supabase Auth?
**R:** O mais rápido possível. Enquanto isso, o RLS habilitado já oferece alguma proteção.

### P: Posso usar em produção assim?
**R:** Somente se for um ambiente controlado. Para produção real com múltiplos clientes, você PRECISA de isolamento via JWT.

### P: Como testo o isolamento?
**R:** Após implementar Supabase Auth:
1. Faça login como Tenant A
2. Tente acessar dados do Tenant B via console
3. Deve dar erro de permissão

## 📚 Recursos

- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [JWT Claims](https://supabase.com/docs/guides/auth/managing-user-data#using-triggers)

## 💡 Exemplo Completo: Login Seguro

### Antes (Inseguro):
```typescript
// src/app/[tenantSlug]/login/page.tsx
sessionStorage.setItem('customerEmail', email)
sessionStorage.setItem('userType', 'customer')
```

### Depois (Seguro):
```typescript
const supabase = createClientComponentClient()

// Login retorna JWT automaticamente
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})

// JWT contém: { tenant_id, customer_id, role }
// RLS usa automaticamente para filtrar dados
```

## ⏰ Timeline Recomendado

**Hoje:**
1. ✅ Executar script RLS (5 minutos)
2. ✅ Verificar que funcionou

**Esta Semana:**
1. 📖 Estudar Supabase Auth
2. 🔧 Planejar migração
3. 🧪 Criar ambiente de testes

**Próximas 2 Semanas:**
1. 🚀 Implementar Supabase Auth
2. 🔒 Atualizar políticas RLS
3. ✅ Testar isolamento

---

**Criado em:** 2025-12-29
**Versão:** 1.0
**Status:** CRÍTICO - Implementar IMEDIATAMENTE
