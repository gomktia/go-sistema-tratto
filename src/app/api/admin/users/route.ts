
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
    const supabase = getAdminClient()
    if (!supabase) {
        return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    try {
        // Fetch users from app_users
        const { data: appUsers, error } = await supabase
            .from('app_users')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error("Error fetching app_users:", error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // IMPORTANT: We cannot join with auth.users directly via client. 
        // We have to rely on role mapping if it exists, or just return app_users for now.
        // We will mock the role for known admins for now.

        const superAdmins = appUsers.map(u => {
            const isSuperAdmin = u.email === 'geison@beautyflow.app' ||
                u.email === 'oseias@beautyflow.app' ||
                u.email?.includes('admin') ||
                u.role === 'super_admin' // If field exists

            if (isSuperAdmin) {
                return { ...u, role: 'super_admin' }
            }
            return u
        }).filter(u => u.role === 'super_admin')

        return NextResponse.json(superAdmins)
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
