
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
        console.log('[API] Fetching users from auth.users...')

        // Fetch users from auth.users (this is where email is stored)
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

        if (authError) {
            console.error("[API] Error fetching auth users:", authError)
            return NextResponse.json({ error: authError.message }, { status: 500 })
        }

        console.log(`[API] Found ${authData?.users?.length || 0} auth users`)

        if (!authData?.users || authData.users.length === 0) {
            console.log('[API] No auth users found, returning empty array')
            return NextResponse.json([])
        }

        // Fetch app_users data to join
        const { data: appUsers, error: appError } = await supabase
            .from('app_users')
            .select('*')

        if (appError) {
            console.error("[API] Error fetching app_users:", appError)
        }

        console.log(`[API] Found ${appUsers?.length || 0} app_users`)

        // List of known super admin emails
        const knownSuperAdmins = [
            'geison@beautyflow.app',
            'oseias@beautyflow.app',
            'geisonhoehr@gmail.com'
        ]

        // Merge auth.users with app_users data
        const users = authData.users.map(authUser => {
            const appUser = appUsers?.find(au => au.id === authUser.id)

            const isSuperAdmin =
                knownSuperAdmins.includes(authUser.email || '') ||
                authUser.email?.includes('admin') ||
                (appUser as any)?.role === 'super_admin'

            return {
                id: authUser.id,
                email: authUser.email,
                full_name: appUser?.full_name || authUser.user_metadata?.full_name || authUser.email,
                avatar_url: appUser?.avatar_url || authUser.user_metadata?.avatar_url,
                created_at: authUser.created_at,
                updated_at: appUser?.updated_at || authUser.updated_at,
                role: isSuperAdmin ? 'super_admin' : ((appUser as any)?.role || 'user')
            }
        })

        const superAdmins = users.filter(u => u.role === 'super_admin')

        console.log(`[API] Filtered to ${superAdmins.length} super admins`)
        console.log('[API] Super admins:', superAdmins.map(u => u.email))

        return NextResponse.json(superAdmins)
    } catch (err: any) {
        console.error('[API] Error in users endpoint:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
