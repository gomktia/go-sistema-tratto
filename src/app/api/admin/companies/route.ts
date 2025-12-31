
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ message: 'Supabase configuration incomplete' }, { status: 500 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false }
        })

        const { data: tenants, error } = await supabaseAdmin
            .from('tenants')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching tenants:', error)
            return NextResponse.json({ message: error.message }, { status: 500 })
        }

        // Map to Company interface if needed, or return raw
        // We will return raw and let frontend map it, or map here.
        // Let's map it to match the mock Company interface partially
        const companies = tenants.map((t: any) => ({
            id: t.id,
            name: t.name,
            fullName: t.full_name,
            email: t.settings?.notification_email || '', // Infer email
            phone: t.settings?.whatsapp || '',
            address: `${t.settings?.address || ''} - ${t.settings?.city || ''}, ${t.settings?.state || ''}`,
            cpfCnpj: t.document,
            logo: null, // derived in frontend
            primaryColor: t.theme?.primaryColor || '#8B5CF6',
            secondaryColor: t.theme?.accentColor || '#A78BFA',
            customDomain: `${t.slug}.beautyflow.app`,
            planId: t.settings?.plan_id || 'starter',
            status: t.settings?.status || 'active',
            // Mock financial data as it likely doesn't exist yet
            subscriptionStartDate: t.created_at,
            subscriptionEndDate: new Date(new Date(t.created_at).setFullYear(new Date(t.created_at).getFullYear() + 1)).toISOString(),
            maxEmployees: 5,
            maxAppointmentsPerMonth: 100,
            currentEmployees: 0,
            currentAppointmentsThisMonth: 0,
            totalRevenue: 0,
            monthlyRevenue: 0,
            createdAt: t.created_at,
            updatedAt: t.updated_at || t.created_at
        }))

        return NextResponse.json(companies)

    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ message: 'Supabase configuration incomplete' }, { status: 500 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false }
        })

        const body = await request.json()

        // Generate UUID if not provided/auto-generated
        // Supabase can auto-generate if configured, but let's check

        const slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '')

        const newTenant = {
            name: body.name,
            full_name: body.fullName,
            slug: slug,
            document: body.cpfCnpj,
            // Store extra fields in settings/theme JSONB columns as identified in seed data
            settings: {
                notification_email: body.email,
                whatsapp: body.phone,
                address: body.address,
                plan_id: body.planId,
                status: 'trial' // Default to trial
            },
            theme: {
                primaryColor: '#8B5CF6',
                accentColor: '#A78BFA'
            },
            locale: 'pt-BR',
            timezone: 'America/Sao_Paulo'
        }

        const { data, error } = await supabaseAdmin
            .from('tenants')
            .insert(newTenant)
            .select()
            .single()

        if (error) {
            console.error('Error creating tenant:', error)
            return NextResponse.json({ message: error.message }, { status: 400 })
        }

        return NextResponse.json({ message: 'Empresa criada com sucesso', company: data }, { status: 201 })

    } catch (error: any) {
        console.error('Error creating tenant:', error)
        return NextResponse.json({ message: error.message }, { status: 500 })
    }
}
