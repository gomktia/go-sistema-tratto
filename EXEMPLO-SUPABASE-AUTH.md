# 🔐 Exemplo Prático: Implementar Supabase Auth

## 📦 1. Instalar Dependências

```bash
npm install @supabase/auth-helpers-nextjs @supabase/supabase-js
```

## 🔧 2. Configurar Cliente Supabase

### Criar: `src/lib/supabase/client.ts`

```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Para componentes CLIENT
export const createClient = () => {
  return createClientComponentClient()
}

// Para componentes SERVER
export const createServerClient = () => {
  return createServerComponentClient({ cookies })
}
```

## 🔑 3. Criar Função de Login

### Atualizar: `src/lib/auth-helpers.ts`

```typescript
import { createClient } from '@/lib/supabase/client'

export async function loginWithSupabaseAuth(email: string, password: string) {
  const supabase = createClient()

  // 1. Autenticar com Supabase
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError || !authData.user) {
    return { success: false, error: 'Email ou senha inválidos' }
  }

  // 2. Buscar dados do usuário (customer, employee, etc)
  const { data: customer } = await supabase
    .from('customers')
    .select('*, customer_credentials!inner(*)')
    .eq('customer_credentials.email', email)
    .single()

  if (!customer) {
    return { success: false, error: 'Usuário não encontrado' }
  }

  // 3. Atualizar JWT com custom claims
  await supabase.auth.updateUser({
    data: {
      tenant_id: customer.tenant_id,
      customer_id: customer.id,
      role: 'customer'
    }
  })

  return {
    success: true,
    user: authData.user,
    customer
  }
}
```

## 👤 4. Atualizar Página de Login

### Modificar: `src/app/[tenantSlug]/login/page.tsx`

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginWithSupabaseAuth } from "@/lib/auth-helpers"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = await loginWithSupabaseAuth(email, password)

    if (!result.success) {
      setError(result.error || "Erro ao fazer login")
      return
    }

    // Redirecionar baseado no tenant
    const tenantSlug = result.customer.tenant_slug // ou buscar do tenant
    router.push(`/${tenantSlug}/profile`)
  }

  return (
    // ... seu JSX de login
    <form onSubmit={handleLogin}>
      {/* ... campos de email e senha ... */}
    </form>
  )
}
```

## 🆕 5. Atualizar Página de Cadastro

### Modificar: `src/app/[tenantSlug]/signup/page.tsx`

```typescript
import { createClient } from "@/lib/supabase/client"

const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault()
  const supabase = createClient()

  // 1. Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.name,
        tenant_id: tenantId,
      }
    }
  })

  if (authError) {
    setError("Erro ao criar conta")
    return
  }

  // 2. Criar registro de customer (via trigger ou manualmente)
  const { error: customerError } = await supabase
    .from('customers')
    .insert({
      id: authData.user!.id, // Usar mesmo ID do auth
      tenant_id: tenantId,
      name: formData.name,
      phone: formData.phone,
      cpf: formData.cpf,
      email: formData.email,
    })

  if (customerError) {
    setError("Erro ao criar perfil")
    return
  }

  // 3. Redirecionar para confirmação de email ou login
  router.push(`/${tenantSlug}/login?registered=true`)
}
```

## 🔒 6. Criar Middleware para Proteção de Rotas

### Criar: `middleware.ts` (na raiz do projeto)

```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Refresh session se expirada
  const { data: { session } } = await supabase.auth.getSession()

  // Proteger rotas do portal do cliente
  if (req.nextUrl.pathname.includes('/profile') && !session) {
    const tenantSlug = req.nextUrl.pathname.split('/')[1]
    return NextResponse.redirect(new URL(`/${tenantSlug}/login`, req.url))
  }

  return res
}

export const config = {
  matcher: ['/:tenantSlug/profile/:path*']
}
```

## 🛡️ 7. Atualizar Políticas RLS (Seguras)

### Executar no SQL Editor:

```sql
-- Política SEGURA para customers (substitui a permissiva)
DROP POLICY IF EXISTS "customers_tenant_isolation" ON customers;
CREATE POLICY "customers_tenant_isolation" ON customers
    FOR SELECT
    USING (
        -- Permite ler apenas do próprio tenant
        tenant_id::text = auth.jwt() ->> 'tenant_id'
    );

-- Cliente pode atualizar apenas próprio registro
DROP POLICY IF EXISTS "customers_own_update" ON customers;
CREATE POLICY "customers_own_update" ON customers
    FOR UPDATE
    USING (
        id = auth.uid()  -- auth.uid() retorna o ID do usuário autenticado
    );

-- Appointments: ver apenas do próprio tenant OU próprios agendamentos
DROP POLICY IF EXISTS "appointments_tenant_read" ON appointments;
CREATE POLICY "appointments_tenant_read" ON appointments
    FOR SELECT
    USING (
        tenant_id::text = auth.jwt() ->> 'tenant_id' OR
        customer_id = auth.uid()
    );
```

## 🧪 8. Testar Autenticação

### Criar: `src/app/test-auth/page.tsx`

```typescript
"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestAuthPage() {
  const [session, setSession] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      {session ? (
        <div>
          <p>✅ Autenticado como: {session.user.email}</p>
          <p>🆔 User ID: {session.user.id}</p>
          <p>🏢 Tenant ID: {session.user.user_metadata.tenant_id}</p>
          <pre className="mt-4 p-4 bg-gray-100 rounded">
            {JSON.stringify(session.user, null, 2)}
          </pre>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>❌ Não autenticado</p>
      )}
    </div>
  )
}
```

## 📊 9. Hook Personalizado para Auth

### Criar: `src/hooks/useAuth.ts`

```typescript
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Checar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudanças de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    signOut: () => supabase.auth.signOut(),
    isAuthenticated: !!user,
    tenantId: user?.user_metadata?.tenant_id,
    customerId: user?.id,
  }
}
```

## 🎯 10. Usar em Componentes

```typescript
"use client"

import { useAuth } from '@/hooks/useAuth'

export default function ProfilePage() {
  const { user, loading, tenantId } = useAuth()

  if (loading) return <div>Carregando...</div>
  if (!user) return <div>Não autenticado</div>

  return (
    <div>
      <h1>Perfil de {user.email}</h1>
      <p>Tenant: {tenantId}</p>
    </div>
  )
}
```

## ✅ Checklist de Implementação

- [ ] Instalar dependências Supabase Auth
- [ ] Criar cliente Supabase
- [ ] Implementar função de login
- [ ] Atualizar página de login
- [ ] Atualizar página de cadastro
- [ ] Criar middleware de proteção
- [ ] Atualizar políticas RLS (remover `true`, usar JWT)
- [ ] Testar login/logout
- [ ] Testar isolamento entre tenants
- [ ] Migrar dados existentes (se necessário)

## 🚨 Migração de Dados Existentes

Se você já tem clientes cadastrados com a autenticação antiga:

```sql
-- Script para migrar clientes existentes para Supabase Auth
-- CUIDADO: Teste em ambiente de desenvolvimento primeiro!

-- 1. Para cada cliente, você precisará:
--    a) Criar usuário no Supabase Auth
--    b) Atualizar customer.id com auth.uid()
--    c) Manter customer_credentials para referência

-- Exemplo manual (faça programaticamente):
-- SELECT email, password_hash FROM customer_credentials;
-- Para cada um, chamar supabase.auth.admin.createUser()
```

---

**Dificuldade:** ⭐⭐⭐ Média
**Tempo Estimado:** 4-6 horas
**Benefício:** 🔒🔒🔒🔒🔒 Segurança Máxima
