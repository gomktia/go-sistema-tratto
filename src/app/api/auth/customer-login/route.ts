import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Rota server-side: autentica clientes via customer_credentials
// O bcrypt roda aqui — o secret_hash NUNCA é enviado ao browser.
export async function POST(req: NextRequest) {
    try {
        const { identifier, password, tenantId } = await req.json()

        if (!identifier || !password || !tenantId) {
            return NextResponse.json(
                { exists: false, error: 'Parâmetros inválidos' },
                { status: 400 }
            )
        }

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!url || !serviceKey) {
            return NextResponse.json({ exists: false, error: 'Configuração ausente' })
        }

        const adminClient = createClient(url, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        const isEmail = identifier.includes('@')
        const identityType = isEmail ? 'email' : 'cpf'
        const identityValue = isEmail
            ? identifier.toLowerCase().trim()
            : identifier.replace(/\D/g, '')

        // Query 1: buscar credencial (sem join — FK não registrada no schema cache)
        const { data: credential, error: credError } = await adminClient
            .from('customer_credentials')
            .select('id, secret_hash, customer_id, tenant_id')
            .eq('identity_type', identityType)
            .eq('identity_value', identityValue)
            .eq('tenant_id', tenantId)
            .single()

        if (credError || !credential) {
            return NextResponse.json({ exists: false, error: 'Usuário não encontrado' })
        }

        // Comparação bcrypt server-side — secret_hash nunca sai daqui
        const valid = await bcrypt.compare(password, credential.secret_hash)

        if (!valid) {
            return NextResponse.json({ exists: false, error: 'Senha incorreta' })
        }

        // Query 2: buscar dados do cliente para retornar ao browser (sem hash)
        const { data: customer, error: custError } = await adminClient
            .from('customers')
            .select('id, full_name, email, phone, status, tenant_id')
            .eq('id', credential.customer_id)
            .single()

        if (custError || !customer) {
            return NextResponse.json({ exists: false, error: 'Cliente não encontrado' })
        }

        return NextResponse.json({
            exists: true,
            data: {
                id: customer.id,
                full_name: customer.full_name,
                email: customer.email,
                phone: customer.phone,
                status: customer.status,
                tenant_id: customer.tenant_id,
            }
        })
    } catch {
        return NextResponse.json({ exists: false, error: 'Erro interno' })
    }
}
