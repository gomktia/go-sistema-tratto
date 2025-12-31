
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const getAdminClient = () => {
    if (!supabaseUrl || !supabaseServiceKey) return null
    return createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    })
}

export async function GET() {
    console.log('[API] /api/admin/users - Starting request')

    const supabase = getAdminClient()
    if (!supabase) {
        console.error('[API] Supabase client not configured')
        return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    try {
        console.log('[API] Fetching users from app_users table...')

        // Fetch users from app_users
        const { data: appUsers, error } = await supabase
            .from('app_users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error("[API] Error fetching app_users:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log(`[API] Found ${appUsers?.length || 0} app_users`)

        if (!appUsers || appUsers.length === 0) {
            console.log('[API] No app_users found, returning empty array')
            return NextResponse.json([])
        }

        // List of known super admin emails
        const knownSuperAdmins = [
            'geison@beautyflow.app',
            'oseias@beautyflow.app',
            'geisonhoehr@gmail.com' // Added user's email
        ]

        const superAdmins = appUsers.map(u => {
            const isSuperAdmin =
                knownSuperAdmins.includes(u.email) ||
                u.email?.includes('admin') ||
                u.role === 'super_admin'

            if (isSuperAdmin) {
                return { ...u, role: 'super_admin' }
            }
            return u
        }).filter(u => u.role === 'super_admin')

        console.log(`[API] Filtered to ${superAdmins.length} super admins`)
        return NextResponse.json(superAdmins)
    } catch (err: any) {
        console.error('[API] Error in users endpoint:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
