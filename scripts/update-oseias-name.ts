/**
 * Script para atualizar o nome do Oseias no Supabase
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

async function updateName() {
  try {
    console.log('🔍 Buscando usuário: oseias01fab@gmail.com\n')

    // Buscar usuário
    const { data } = await supabase.auth.admin.listUsers()
    const user = data?.users.find(u => u.email === 'oseias01fab@gmail.com')

    if (!user) {
      console.log('❌ Usuário não encontrado!')
      return
    }

    console.log('✅ Usuário encontrado! ID:', user.id)
    console.log('Nome atual:', user.user_metadata?.full_name || 'Sem nome')

    // Atualizar metadata no auth
    const { error: authError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          full_name: 'Oseias Santos'
        }
      }
    )

    if (authError) {
      console.error('❌ Erro ao atualizar auth:', authError.message)
      return
    }

    console.log('✅ Nome atualizado no auth.users')

    // Atualizar na tabela app_users
    const { error: appUserError } = await supabase
      .from('app_users')
      .update({ full_name: 'Oseias Santos' })
      .eq('id', user.id)

    if (appUserError) {
      console.log('⚠️  Erro ao atualizar app_users:', appUserError.message)
    } else {
      console.log('✅ Nome atualizado em app_users')
    }

    console.log('\n🎉 Nome atualizado com sucesso!')
    console.log('Novo nome: Oseias Santos')

  } catch (error: any) {
    console.error('❌ Erro:', error.message)
  }
}

updateName()
