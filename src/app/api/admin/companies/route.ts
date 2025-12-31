
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
    const supabase = getAdminClient()
    if (!supabase) {
        // Fallback to mock data if no DB connection for dev experience
        return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    // Fetch tenants with revenue snapshots/stats simulation if needed
    // For now simple fetch
    const { data: tenants, error } = await supabase
        .from('tenants')
        .select('*')
        .order('name')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Transform to match Company interface if needed. 
    // The Company interface in mocks has logic like 'currentEmployees', 'monthlyRevenue'.
    // We can do joins or purely return what we have. 
    // For the UI to work seamlessly with replaced mocks, we might need to map or enrich.
    // Let's return raw for now and see if UI adapts or if we need to mock the extra fields.

    // Simplistic mapping to match UI expectations where columns might be missing
    const enrichedData = tenants.map(t => ({
        ...t,
        planId: t.plan_id || 'starter',
        status: t.status || 'active',
        // Mocking stats for now as calculating them dynamically is heavy for this step
        currentEmployees: 0,
        maxEmployees: 10,
        monthlyRevenue: 0,
        subscriptionStartDate: t.subscription_start_date || new Date().toISOString(),
        subscriptionEndDate: t.subscription_end_date || new Date().toISOString(),
    }))

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
