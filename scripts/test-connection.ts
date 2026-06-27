/**
 * Script para testar conexão com Supabase
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Verificando variáveis de ambiente...\n')

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL não encontrada!')
  process.exit(1)
}

if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY não encontrada!')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada!')
  process.exit(1)
}

console.log('✅ Variáveis de ambiente carregadas:')
console.log(`   URL: ${supabaseUrl}`)
console.log(`   Anon Key: ${supabaseAnonKey.substring(0, 20)}...`)
console.log(`   Service Key: ${supabaseServiceKey.substring(0, 20)}...`)
console.log('')

console.log('🔌 Testando conexão com Supabase...\n')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testConnection() {
  try {
    // Testar query simples
    const { data, error } = await supabase
      .from('tenants')
      .select('id, slug, name')
      .limit(5)

    if (error) {
      console.error('❌ Erro ao conectar:', error.message)
      process.exit(1)
    }

    console.log('✅ Conexão bem-sucedida!')
    console.log('')
    console.log('📋 Tenants encontrados no banco:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    if (data && data.length > 0) {
      data.forEach((tenant: any) => {
        console.log(`   • ${tenant.name} (${tenant.slug})`)
        console.log(`     ID: ${tenant.id}`)
      })
    } else {
      console.log('   (Nenhum tenant encontrado)')
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('')
    console.log('🎉 Tudo pronto para executar o seed!')
    console.log('')
    console.log('📝 Próximos passos:')
    console.log('   1. Execute o SQL: supabase/seed-with-existing-tenants.sql')
    console.log('   2. Execute: npx tsx scripts/create-auth-users.ts')

  } catch (error: any) {
    console.error('❌ Erro inesperado:', error.message)
    process.exit(1)
  }
}

testConnection()
