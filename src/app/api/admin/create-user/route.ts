import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // Validar se tem as credenciais necessárias
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { message: 'Configuração do Supabase incompleta' },
        { status: 500 }
      )
    }

    // Criar cliente Supabase com Service Role (admin)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Pegar dados do body
    const body = await request.json()
    const { email, password, full_name, role } = body

    // Validações
    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { message: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const emailExists = existingUser?.users.some(u => u.email === email)

    if (emailExists) {
      return NextResponse.json(
        { message: 'Este email já está cadastrado' },
        { status: 400 }
      )
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        role,
        full_name
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário:', authError)
      return NextResponse.json(
        { message: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { message: 'Erro ao criar usuário' },
        { status: 500 }
      )
    }

    // Criar registro na tabela app_users
    const { error: appUserError } = await supabaseAdmin
      .from('app_users')
      .insert({
        id: authData.user.id,
        full_name,
        locale: 'pt-BR'
      })

    if (appUserError) {
      console.error('Erro ao criar app_users:', appUserError)
      // Mesmo com erro aqui, o usuário Auth foi criado, então retornar sucesso parcial
    }

    return NextResponse.json({
      message: 'Administrador criado com sucesso',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role
      }
    }, { status: 201 })

  } catch (error: any) {
    console.error('Erro na API:', error)
    return NextResponse.json(
      { message: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
