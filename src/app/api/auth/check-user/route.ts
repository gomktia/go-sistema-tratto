import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Rota server-side: verifica se email existe no Supabase Auth
// Usada pelo login para detectar company_admin (que não estão na tabela employees)
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json()

        if (!email || typeof email !== 'string') {
            return NextResponse.json({ exists: false }, { status: 400 })
        }

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!url || !serviceKey) {
            return NextResponse.json({ exists: false })
        }

        // Admin client com service_role — NUNCA expor no frontend
        const adminClient = createClient(url, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        })

        // Listar usuários filtrando por email (usa Admin API)
        const { data, error } = await adminClient.auth.admin.listUsers()

        if (error || !data) {
            return NextResponse.json({ exists: false })
        }

        const authUser = data.users.find(u => u.email === email)

        if (!authUser) {
            return NextResponse.json({ exists: false })
        }

        const metadata = authUser.user_metadata || {}
        const role = metadata.role as string | undefined

        return NextResponse.json({
            exists: true,
            userType: role || 'employee',
            data: {
                full_name: metadata.full_name || email.split('@')[0],
                email: authUser.email,
            }
        })
    } catch {
        return NextResponse.json({ exists: false })
    }
}
