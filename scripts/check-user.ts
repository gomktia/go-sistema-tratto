/**
 * Script para verificar se um usuário existe no Supabase
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkUser() {
  try {
    console.log('🔍 Buscando usuário: oseias01fab@gmail.com\n')

    // Listar todos os usuários
    const { data, error } = await supabase.auth.admin.listUsers()

    if (error) {
      console.error('❌ Erro:', error)
      return
    }

    // Buscar o usuário específico
    const user = data?.users.find(u => u.email === 'oseias01fab@gmail.com')

    if (!user) {
      console.log('❌ Usuário NÃO encontrado no Supabase Auth!')
      console.log('\nVou tentar criar novamente...\n')

      // Tentar criar
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'oseias01fab@gmail.com',
        password: 'Oseias01$',
        email_confirm: true,
        user_metadata: {
          role: 'super_admin',
          full_name: 'Oseias Fabricio'
        }
      })

      if (createError) {
        console.error('❌ Erro ao criar:', createError.message)
        return
      }

      console.log('✅ Usuário criado com sucesso!')
      console.log('ID:', newUser.user?.id)
      console.log('Email:', newUser.user?.email)

      // Criar app_users
      if (newUser.user) {
        const { error: appUserError } = await supabase
          .from('app_users')
          .insert({
            id: newUser.user.id,
            full_name: 'Oseias Fabricio',
            locale: 'pt-BR'
          })

        if (appUserError) {
          console.log('⚠️  Erro ao criar app_users:', appUserError.message)
        } else {
          console.log('✅ app_users criado')
        }
      }

      return
    }

    console.log('✅ Usuário ENCONTRADO no Supabase Auth!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('ID:', user.id)
    console.log('Email:', user.email)
    console.log('Email confirmado:', user.email_confirmed_at ? 'SIM' : 'NÃO')
    console.log('Criado em:', new Date(user.created_at).toLocaleString('pt-BR'))
    console.log('Último login:', user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('pt-BR') : 'Nunca')
    console.log('Metadata:', JSON.stringify(user.user_metadata, null, 2))
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Verificar app_users
    const { data: appUser, error: appUserError } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (appUserError) {
      console.log('\n⚠️  Usuário NÃO está na tabela app_users!')
      console.log('Vou criar agora...')

      const { error: insertError } = await supabase
        .from('app_users')
        .insert({
          id: user.id,
          full_name: 'Oseias Fabricio',
          locale: 'pt-BR'
        })

      if (insertError) {
        console.log('❌ Erro ao criar app_users:', insertError.message)
      } else {
        console.log('✅ app_users criado com sucesso!')
      }
    } else {
      console.log('\n✅ Usuário encontrado em app_users!')
      console.log('Nome:', appUser.full_name)
    }

    console.log('\n📝 Credenciais para teste:')
    console.log('Email: oseias01fab@gmail.com')
    console.log('Senha: Oseias01$')
    console.log('\n🔗 Login: http://localhost:3000/system/login')

  } catch (error: any) {
    console.error('❌ Erro:', error.message)
  }
}

checkUser()
