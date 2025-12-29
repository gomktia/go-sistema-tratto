/**
 * Script para criar usuários de teste no Supabase Auth
 *
 * IMPORTANTE: Execute este script DEPOIS de rodar o seed SQL
 *
 * Como usar:
 * 1. Configure as variáveis de ambiente (.env.local)
 * 2. Execute: npx tsx scripts/create-auth-users.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Service Role Key (admin)

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!')
  console.error('Certifique-se de ter:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (Service Role Key, não o anon key!)')
  process.exit(1)
}

// Cliente Supabase com permissões de admin
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// ============================================
// USUÁRIOS DE TESTE
// ============================================

const TEST_USERS = [
  {
    email: 'geisonhoehr@gmail.com',
    password: '123456',
    full_name: 'Geison Hoehr',
    role: 'super_admin',
    user_metadata: {
      role: 'super_admin',
      full_name: 'Geison Hoehr'
    }
  },
  {
    email: 'oseias01fab@gmail.com',
    password: 'Oseias01$',
    full_name: 'Oseias Fabricio',
    role: 'super_admin',
    user_metadata: {
      role: 'super_admin',
      full_name: 'Oseias Fabricio'
    }
  },
  {
    email: 'gerente@belezapura.com',
    password: 'senha',
    full_name: 'Gerente Beleza Pura',
    role: 'company_admin',
    tenant_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    user_metadata: {
      role: 'company_admin',
      tenant_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      full_name: 'Gerente Beleza Pura'
    }
  },
  {
    email: 'julia@belezapura.com',
    password: 'senha',
    full_name: 'Julia Santos',
    role: 'employee',
    tenant_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    employee_id: 'e1111111-1111-1111-1111-111111111111',
    user_metadata: {
      role: 'employee',
      tenant_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      employee_id: 'e1111111-1111-1111-1111-111111111111',
      full_name: 'Julia Santos'
    }
  },
  {
    email: 'gerente@studioglamour.com',
    password: 'senha',
    full_name: 'Gerente Studio Glamour',
    role: 'company_admin',
    tenant_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    user_metadata: {
      role: 'company_admin',
      tenant_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      full_name: 'Gerente Studio Glamour'
    }
  },
  {
    email: 'gerente@espacoelegance.com',
    password: 'senha',
    full_name: 'Gerente Espaço Elegance',
    role: 'company_admin',
    tenant_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    user_metadata: {
      role: 'company_admin',
      tenant_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      full_name: 'Gerente Espaço Elegance'
    }
  }
]

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function createAuthUsers() {
  console.log('🚀 Iniciando criação de usuários de teste...\n')

  for (const user of TEST_USERS) {
    try {
      console.log(`📝 Criando usuário: ${user.email}`)

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Confirmar email automaticamente
        user_metadata: user.user_metadata
      })

      if (authError) {
        if (authError.message.includes('already exists') || authError.message.includes('already registered')) {
          console.log(`  ⚠️  Usuário já existe: ${user.email}`)
          continue
        }
        throw authError
      }

      if (!authData.user) {
        throw new Error('Usuário criado mas não retornou dados')
      }

      console.log(`  ✅ Usuário criado com sucesso! ID: ${authData.user.id}`)

      // Criar registro na tabela app_users
      const { error: appUserError } = await supabase
        .from('app_users')
        .insert({
          id: authData.user.id, // Mesmo ID do auth.users
          full_name: user.full_name,
          locale: 'pt-BR'
        })

      if (appUserError) {
        if (appUserError.message.includes('duplicate') || appUserError.code === '23505') {
          console.log(`  ⚠️  app_users já existe para ${user.email}`)
        } else {
          console.error(`  ❌ Erro ao criar app_users: ${appUserError.message}`)
        }
      } else {
        console.log(`  ✅ Registro app_users criado`)
      }

      // Se for employee, vincular com a tabela employees
      if (user.role === 'employee' && user.employee_id) {
        const { error: employeeError } = await supabase
          .from('employees')
          .update({ user_id: authData.user.id })
          .eq('id', user.employee_id)

        if (employeeError) {
          console.error(`  ❌ Erro ao vincular employee: ${employeeError.message}`)
        } else {
          console.log(`  ✅ Employee vinculado`)
        }
      }

      console.log('') // Linha em branco

    } catch (error: any) {
      console.error(`❌ Erro ao criar ${user.email}:`, error.message)
      console.log('') // Linha em branco
    }
  }

  console.log('✅ Processo concluído!\n')
  console.log('📋 Resumo dos usuários criados:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Super Admin:')
  console.log('  📧 geisonhoehr@gmail.com | 🔑 123456')
  console.log('')
  console.log('Beleza Pura:')
  console.log('  📧 gerente@belezapura.com | 🔑 senha (Admin)')
  console.log('  📧 julia@belezapura.com | 🔑 senha (Funcionária)')
  console.log('')
  console.log('Studio Glamour:')
  console.log('  📧 gerente@studioglamour.com | 🔑 senha (Admin)')
  console.log('')
  console.log('Espaço Elegance:')
  console.log('  📧 gerente@espacoelegance.com | 🔑 senha (Admin)')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

// Executar
createAuthUsers()
  .then(() => {
    console.log('\n🎉 Sucesso! Todos os usuários foram criados.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal:', error)
    process.exit(1)
  })
