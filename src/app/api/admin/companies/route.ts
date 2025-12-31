
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Helper to get Supabase Client
// Ideally use Service Role for Admin actions to bypass RLS, ensuring strict authorization layers above this if needed.
// For this MVP/Demo, we assume access to this route is protected or we mock auth for now.
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
    console.log('[API] /api/admin/companies - Starting request')

    const supabase = getAdminClient()
    if (!supabase) {
        console.error('[API] Supabase client not configured')
        return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    console.log('[API] Fetching tenants from database...')

    // 1. Fetch all tenants
    const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*')
        .order('name')

    if (error) {
        console.error('[API] Error fetching tenants:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`[API] Found ${tenants?.length || 0} tenants`)

    if (!tenants || tenants.length === 0) {
        console.log('[API] No tenants found, returning empty array')
        return NextResponse.json([])
    }

    // 2. Fetch customer counts for each tenant
    console.log('[API] Enriching tenant data with counts...')
    const enrichedData = await Promise.all(tenants.map(async (t) => {
        const { count } = await supabase
            .from('customers')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', t.id)

        // Fetch employees count
        const { count: employeesCount } = await supabase
            .from('employees')
            .select('*', { count: 'exact', head: true })
            .eq('tenant_id', t.id)

        return {
            ...t,
            planId: t.plan_id || 'starter',
            status: t.status || 'active',
            currentEmployees: employeesCount || 0,
            maxEmployees: 10,
            monthlyRevenue: 0,
            totalCustomers: count || 0,
            subscriptionStartDate: t.subscription_start_date || new Date().toISOString(),
            subscriptionEndDate: t.subscription_end_date || new Date().toISOString(),
        }
    }))

    console.log(`[API] Returning ${enrichedData.length} enriched companies`)
    return NextResponse.json(enrichedData)
}

export async function POST(request: Request) {
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

    const body = await request.json()
    // Body should contain { name, fullName, email, ... }

    // 1. Insert Tenant
    // Generate UUID/Slug on server or let DB handle defaults
    const { data, error } = await supabase
        .from('tenants')
        .insert({
            name: body.name,
            full_name: body.fullName,
            slug: body.name.toLowerCase().replace(/\s+/g, '-'),
            document: body.cpfCnpj,
            settings: {
                address: body.address,
                phone: body.phone,
                email: body.email // If email is not in main columns, put in settings or create new col
            },
            status: 'active',
            plan_id: body.planId
        })
        .select()
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(data)
}

// Handling PUT/PATCH for updates (Suspend, Delete/Soft-Delete)
export async function PATCH(request: Request) {
    const supabase = getAdminClient()
    if (!supabase) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })

    const body = await request.json()
    const { id, status, ...updates } = body

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })

    // If status update
    if (status) {
        const { data, error } = await supabase
            .from('tenants')
            .update({ status })
            .eq('id', id)
            .select()

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json(data[0])
    }

    return NextResponse.json({ message: "No action taken" })
}
