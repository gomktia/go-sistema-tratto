"use client"

import { useEffect, useMemo, useState } from "react"
import { combos as comboMocks } from "@/mocks/combos"
import { tenants as tenantMocks, type Tenant as MockTenant } from "@/mocks/tenants"
import type { ClientRecord } from "@/types/crm"
import type {
    AppointmentRecord,
    ComboRecord,
    DailyClosingRecord,
    EmployeeRecord,
    ProductRecord,
    ServiceRecord,
    ServiceCategoryRecord,
    StaffAvailabilityRecord,
} from "@/types/catalog"
import {
    type GalleryImage,
    type Highlight,
    type Review,
    type Story,
} from "@/types/catalog"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"

// --------------------------------------------------------------------------
// MOCK DATA MAPPERS (Adapters) - Apenas para módulos ainda não migrados
// --------------------------------------------------------------------------

// 5. COMBOS
const mapMockCombo = (combo: typeof comboMocks[number]): ComboRecord => ({
    id: combo.id,
    tenantId: "tenant-1",
    name: combo.name,
    description: combo.description,
    originalPrice: combo.originalPrice,
    price: combo.price,
    currency: "BRL",
    imageUrl: combo.image,
    category: "Combos"
})


// --------------------------------------------------------------------------
// DB ROW MAPPERS (Supabase -> Domain)
// --------------------------------------------------------------------------

// Appointments (with relational data from customers and services)
const mapRowToAppointment = (row: any, closedDates?: Set<string>): AppointmentRecord => {
    const appointmentDate = row.start_at ? row.start_at.split('T')[0] : null
    const isBlocked = !!(closedDates && appointmentDate && closedDates.has(appointmentDate))

    return {
        id: row.id,
        tenantId: row.tenant_id,
        serviceId: row.service_id ?? undefined,
        employeeId: row.employee_id ?? undefined,
        customerId: row.customer_id ?? undefined,
        customerName: row.customers?.full_name ?? undefined,
        serviceName: row.services?.name ?? undefined,
        startAt: row.start_at,
        endAt: row.end_at ?? undefined,
        durationMinutes: row.duration_minutes ?? undefined,
        price: row.price ?? undefined,
        currency: row.currency ?? "BRL",
        channel: row.channel ?? undefined,
        status: row.status,
        notes: row.notes ?? undefined,
        finalPrice: row.final_price ?? undefined,
        discount: row.discount ?? undefined,
        paymentMethod: row.payment_method ?? undefined,
        isBlocked,
    }
}

// Customers
const mapRowToClient = (row: any): ClientRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    name: row.full_name,
    email: row.email,
    phone: row.phone,
    status: row.status || 'active', // Default fallback
    lastVisit: row.last_visit_at || new Date().toISOString(), // Default
    totalSpent: row.total_spent || 0,
    avatar: "", // Supabase doesn't have avatar yet for customers usually, or add column
})

const mapRowToService = (row: any): ServiceRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description,
    price: row.price,
    durationMinutes: row.duration_minutes,
    categoryId: row.category_id,
    isActive: row.is_active,
    imageUrl: row.image_url,
    requiresConfirmation: false,
    currency: "BRL"
})

const mapRowToServiceCategory = (row: any): ServiceCategoryRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    shortCode: row.short_code ?? undefined,
    description: row.description ?? undefined,
    color: row.color ?? undefined,
    icon: row.icon ?? undefined,
    displayOrder: row.display_order ?? 0,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
})

const mapRowToEmployee = (row: any): EmployeeRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    fullName: row.full_name,
    email: row.email || '',
    phone: row.phone || '',
    document: row.document || undefined,
    birthdate: row.birthdate || undefined,
    role: row.role,
    status: row.status || 'active',
    colorTag: row.color_tag,
    commissionRate: row.commission_rate ?? 0,
    acceptsOnlineBooking: row.accepts_online_booking ?? true,
    specialties: row.specialties || [],
    workingHours: row.working_hours || {},
    avatarUrl: row.avatar_url,
})

const mapRowToProduct = (row: any): ProductRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    categoryId: row.category_id ?? undefined,
    // category name stored in metadata.category (sem coluna de texto direta na tabela)
    categoryName: row.metadata?.category ?? undefined,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price ?? 0),
    cost: row.cost != null ? Number(row.cost) : undefined,
    currency: row.currency ?? 'BRL',
    trackInventory: Boolean(row.track_inventory ?? true),
    stockQuantity: Number(row.stock_quantity ?? 0),
    minStock: Number(row.min_stock ?? 0),
    unit: row.unit ?? 'un',
    isActive: Boolean(row.is_active ?? true),
    imageUrl: undefined, // coluna image_url não existe em products
})

// --------------------------------------------------------------------------
// HOOKS
// --------------------------------------------------------------------------

export function useTenantAppointments(tenantId?: string) {
    const [trigger, setTrigger] = useState(0)
    const [data, setData] = useState<AppointmentRecord[]>([])
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !!tenantId)

    const refetch = () => setTrigger(prev => prev + 1)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) {
            setLoading(false)
            setData([])
            return
        }

        let isMounted = true
        setLoading(true)

        // Buscar fechamentos e appointments em paralelo
        Promise.all([
            // 1. Buscar fechamentos fechados (status='closed')
            supabase
                .from("daily_closings")
                .select("closing_date")
                .eq("tenant_id", tenantId)
                .eq("status", "closed"),

            // 2. Buscar appointments com relações
            supabase
                .from("appointments")
                .select(`
                    id, tenant_id, service_id, employee_id, customer_id,
                    start_at, end_at, duration_minutes,
                    price, currency, channel, status, notes,
                    final_price, discount, payment_method,
                    customers(full_name),
                    services(name)
                `)
                .eq("tenant_id", tenantId)
                .order("start_at", { ascending: true })
        ]).then(([closingsResult, appointmentsResult]) => {
            if (!isMounted) return

            // Criar Set de datas fechadas para lookup rápido
            const closedDates = new Set<string>()
            if (closingsResult.data) {
                closingsResult.data.forEach(c => closedDates.add(c.closing_date))
            }

            if (appointmentsResult.error) {
                console.error("[useTenantAppointments] Erro ao carregar agendamentos:", appointmentsResult.error.message)
                setData([])
            } else {
                setData(appointmentsResult.data ? appointmentsResult.data.map(row => mapRowToAppointment(row, closedDates)) : [])
            }
            setLoading(false)
        }).catch(err => {
            if (!isMounted) return
            console.error("[useTenantAppointments] Erro ao carregar dados:", err)
            setData([])
            setLoading(false)
        })

        return () => { isMounted = false }
    }, [tenantId, trigger])

    return { data, loading, refetch }
}


export function useTenantServices(tenantId?: string) {
    const [data, setData] = useState<ServiceRecord[]>([])
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !!tenantId)
    const [error, setError] = useState<string | null>(null)
    const [trigger, setTrigger] = useState(0)

    const refetch = () => setTrigger(prev => prev + 1)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) {
            setLoading(false)
            setData([])
            setError(null)
            return
        }

        let isMounted = true
        setLoading(true)
        setError(null)

        supabase
            .from("services")
            .select("id, tenant_id, category_id, name, description, duration_minutes, price, is_active, image_url, requires_confirmation, metadata")
            .eq("tenant_id", tenantId)
            .order("name", { ascending: true })
            .then(({ data: rows, error: queryError }) => {
                if (!isMounted) return
                if (queryError) {
                    console.error("[useTenantServices] Erro ao carregar serviços:", queryError.message)
                    setError(queryError.message)
                    setData([])
                } else {
                    setError(null)
                    setData(rows ? rows.map(mapRowToService) : [])
                }
                setLoading(false)
            })

        return () => { isMounted = false }
    }, [tenantId, trigger])

    return { data, loading, error, refetch }
}

export function useTenantServiceCategories(tenantId?: string) {
    const [data, setData] = useState<ServiceCategoryRecord[]>([])
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !!tenantId)
    const [error, setError] = useState<string | null>(null)
    const [trigger, setTrigger] = useState(0)

    const refetch = () => setTrigger(prev => prev + 1)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) {
            setLoading(false)
            setData([])
            setError(null)
            return
        }

        let isMounted = true
        setLoading(true)
        setError(null)

        supabase
            .from("service_categories")
            .select("id, tenant_id, name, short_code, description, color, icon, display_order, is_active, created_at, updated_at")
            .eq("tenant_id", tenantId)
            .eq("is_active", true)
            .order("display_order", { ascending: true })
            .order("name", { ascending: true })
            .then(({ data: rows, error: queryError }) => {
                if (!isMounted) return
                if (queryError) {
                    console.error("[useTenantServiceCategories] Erro ao carregar categorias:", queryError.message)
                    setError(queryError.message)
                    setData([])
                } else {
                    setError(null)
                    setData(rows ? rows.map(mapRowToServiceCategory) : [])
                }
                setLoading(false)
            })

        return () => { isMounted = false }
    }, [tenantId, trigger])

    return { data, loading, error, refetch }
}

export function useTenantEmployees(tenantId?: string) {
    const [data, setData] = useState<EmployeeRecord[]>([])
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !!tenantId)
    const [error, setError] = useState<string | null>(null)
    const [trigger, setTrigger] = useState(0)

    const refetch = () => setTrigger(prev => prev + 1)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) {
            setLoading(false)
            setData([])
            setError(null)
            return
        }

        let isMounted = true
        setLoading(true)
        setError(null)

        supabase
            .from("employees")
            .select("*")
            .eq("tenant_id", tenantId)
            .neq("status", "deleted")
            .order("full_name", { ascending: true })
            .then(({ data: rows, error: queryError }) => {
                if (!isMounted) return
                if (queryError) {
                    console.error("[useTenantEmployees] Erro ao carregar profissionais:", queryError.message)
                    setError(queryError.message)
                    setData([])
                } else {
                    setError(null)
                    setData(rows ? rows.map(mapRowToEmployee) : [])
                }
                setLoading(false)
            })

        return () => { isMounted = false }
    }, [tenantId, trigger])

    return { data, loading, error, refetch }
}

export function useTenantProducts(tenantId?: string) {
    const [data, setData] = useState<ProductRecord[]>([])
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !!tenantId)
    const [trigger, setTrigger] = useState(0)

    const refetch = () => setTrigger(prev => prev + 1)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) {
            setLoading(false)
            setData([])
            return
        }

        let isMounted = true
        setLoading(true)

        supabase
            .from('products')
            .select('id, tenant_id, category_id, name, description, price, cost, currency, track_inventory, stock_quantity, min_stock, unit, is_active, metadata')
            .eq('tenant_id', tenantId)
            .order('name', { ascending: true })
            .then(({ data: rows, error }) => {
                if (!isMounted) return
                if (!error && rows) {
                    setData(rows.map(mapRowToProduct))
                } else {
                    console.error('[useTenantProducts] Erro ao carregar produtos:', error?.message)
                    setData([])
                }
                setLoading(false)
            })

        return () => { isMounted = false }
    }, [tenantId, trigger])

    return { data, loading, refetch }
}

export function useTenantCombos(tenantId?: string) {
    const fallback = useMemo(() => {
        const normalized = comboMocks.map(mapMockCombo)
        if (!tenantId) return normalized
        return normalized
    }, [tenantId])

    const [data, setData] = useState<ComboRecord[]>(fallback)
    const [loading, setLoading] = useState<boolean>(false)

    return { data, loading }
}

export function useTenantAvailability(tenantId?: string) {
    // Placeholder - availability is now read from employees.working_hours
    const [data] = useState<StaffAvailabilityRecord[]>([])
    const [loading] = useState<boolean>(false)
    // Hook implementation placeholder using tenantId
    useEffect(() => {
        if (tenantId) { /* future impl: read from staff_availability table if needed */ }
    }, [tenantId])
    return { data, loading }
}

export const useTenantStaffAvailability = useTenantAvailability;

// --------------------------------------------------------------------------
// EXTRA HOOKS (Marketing, etc.)
// --------------------------------------------------------------------------

// Mock Mappers for Extra Types
const mapMockAnnouncement = (ann: any): Highlight => ann
const mapMockReview = (rev: any): Review => rev
const mapMockStory = (story: any): Story => story

export function useTenantCustomers(tenantId?: string) {
    const [trigger, setTrigger] = useState(0)
    const [data, setData] = useState<ClientRecord[]>([])
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !!tenantId)
    const [error, setError] = useState<string | null>(null)

    const refetch = () => setTrigger(prev => prev + 1)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) {
            setLoading(false)
            setData([])
            setError(null)
            return
        }

        let isMounted = true
        setLoading(true)
        setError(null)

        supabase
            .from("customers")
            .select("id, tenant_id, full_name, email, phone, document, last_visit_at, total_spent, loyalty_points, status")
            .eq("tenant_id", tenantId)
            .order("full_name", { ascending: true })
            .then(({ data: rows, error: queryError }) => {
                if (!isMounted) return

                if (queryError) {
                    console.error("[useTenantCustomers] Erro ao carregar clientes:", queryError.message)
                    setError(queryError.message)
                    setData([])
                } else {
                    setError(null)
                    setData(rows ? rows.map(mapRowToClient) : [])
                }
                setLoading(false)
            })

        return () => { isMounted = false }
    }, [tenantId, trigger])

    return { data, loading, error, refetch }
}

export function useTenantGallery(tenantId?: string) {
    const fallback: GalleryImage[] = []
    const [data] = useState<GalleryImage[]>(fallback)
    const [loading] = useState<boolean>(false)
    // Hook implementation placeholder using tenantId
    useEffect(() => {
        if (tenantId) { /* future impl */ }
    }, [tenantId])
    return { data, loading }
}

export function useTenantHighlights(tenantId?: string) {
    const fallback: Highlight[] = []
    const [data] = useState<Highlight[]>(fallback)
    const [loading] = useState<boolean>(false)
    // Hook implementation placeholder using tenantId
    useEffect(() => {
        if (tenantId) { /* future impl */ }
    }, [tenantId])
    return { data, loading }
}

export function useTenantReviews(tenantId?: string) {
    const fallback: Review[] = []
    const [data] = useState<Review[]>(fallback)
    const [loading] = useState<boolean>(false)
    // Hook implementation placeholder using tenantId
    useEffect(() => {
        if (tenantId) { /* future impl */ }
    }, [tenantId])
    return { data, loading }
}

export function useTenantStories(tenantId?: string) {
    const fallback: Story[] = []
    const [data] = useState<Story[]>(fallback)
    const [loading] = useState<boolean>(false)
    // Hook implementation placeholder using tenantId
    useEffect(() => {
        if (tenantId) { /* future impl */ }
    }, [tenantId])
    return { data, loading }
}

export function useTenantSettings(tenantId?: string) {
    // Mock settings
    const [data] = useState({
        name: "Salão Exemplo",
        primaryColor: "#000000",
        logoUrl: "",
        address: "Rua Exemplo, 123"
    })
    const [loading] = useState(false)
    // Hook implementation placeholder using tenantId
    useEffect(() => {
        if (tenantId) { /* future impl */ }
    }, [tenantId])
    return { data, loading }
}

interface Testimonial {
    id: string;
    tenantId: string;
    text: string;
    isApproved: boolean;
    customerName: string;
    rating: number;
    testimonial: string;
    imageUrl?: string;
    customerRole?: string;
}

export function useTenantTestimonials(tenantId?: string) {
    const fallback: Testimonial[] = []
    const [data] = useState<Testimonial[]>(fallback)
    const [loading] = useState<boolean>(false)
    // Hook implementation placeholder using tenantId
    useEffect(() => {
        if (tenantId) { /* future impl */ }
    }, [tenantId])
    return { data, loading }
}

// ---- Comissões por atendimento (PR 4) ----
export function useTenantCommissions(tenantId?: string) {
    const [data, setData] = useState<import("@/types/catalog").CommissionRow[]>([])
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !!tenantId)
    const [trigger, setTrigger] = useState(0)

    const refetch = () => setTrigger(prev => prev + 1)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) {
            setLoading(false)
            setData([])
            return
        }

        let isMounted = true
        setLoading(true)

        supabase
            .from("appointment_commissions")
            .select("*")
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false })
            .then(({ data: rows, error }) => {
                if (!isMounted) return
                if (error) {
                    console.error("[useTenantCommissions] Erro ao carregar comissões:", error.message)
                    setData([])
                } else {
                    setData((rows ?? []).map(r => ({
                        id: r.id,
                        tenantId: r.tenant_id,
                        appointmentId: r.appointment_id,
                        employeeId: r.employee_id,
                        commissionRate: r.commission_rate,
                        finalPrice: r.final_price,
                        discount: r.discount ?? 0,
                        baseAmount: r.base_amount,
                        commissionAmount: r.commission_amount,
                        createdAt: r.created_at,
                    })))
                }
                setLoading(false)
            })

        return () => { isMounted = false }
    }, [tenantId, trigger])

    return { data, loading, refetch }
}

// --------------------------------------------------------------------------
// useTenantDailyClosings — PR 5
// --------------------------------------------------------------------------
export function useTenantDailyClosings(tenantId?: string) {
    const [data, setData] = useState<DailyClosingRecord[]>([])
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !!tenantId)
    const [trigger, setTrigger] = useState(0)
    const refetch = () => setTrigger(prev => prev + 1)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) { setLoading(false); setData([]); return }
        let isMounted = true
        setLoading(true)

        supabase
            .from("daily_closings")
            .select("*")
            .eq("tenant_id", tenantId)
            .order("closing_date", { ascending: false })
            .limit(30)
            .then(({ data: rows, error }) => {
                if (!isMounted) return
                if (error) {
                    console.error("[useTenantDailyClosings]", error.message)
                    setData([])
                } else {
                    setData((rows ?? []).map(r => ({
                        id: r.id,
                        tenantId: r.tenant_id,
                        closingDate: r.closing_date,
                        totalAppointments: r.total_appointments,
                        grossRevenue: Number(r.gross_revenue),
                        totalDiscounts: Number(r.total_discounts),
                        netRevenue: Number(r.net_revenue),
                        totalCommissions: Number(r.total_commissions),
                        revenuePix: Number(r.revenue_pix),
                        revenueCash: Number(r.revenue_cash),
                        revenueDebit: Number(r.revenue_debit),
                        revenueCredit: Number(r.revenue_credit),
                        revenueOther: Number(r.revenue_other),
                        status: r.status as 'open' | 'closed',
                        closedAt: r.closed_at ?? undefined,
                        notes: r.notes ?? undefined,
                        createdAt: r.created_at,
                        updatedAt: r.updated_at,
                    })))
                }
                setLoading(false)
            })

        return () => { isMounted = false }
    }, [tenantId, trigger])

    return { data, loading, refetch }
}

export function useTenantBySlug(slug: string) {
    const fallback = useMemo(() => {
        return tenantMocks.find(t => t.slug === slug) || null
    }, [slug])

    const [data, setData] = useState<MockTenant | null>(fallback)
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !!slug)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !slug) {
            setLoading(false)
            return
        }
        let isMounted = true
        setLoading(true)
        supabase
            .from('tenants')
            .select('id, name, slug, full_name, logo, theme, settings, plan_id, subscription_status, trial_ends_at')
            .eq('slug', slug)
            .single()
            .then(({ data: row, error }) => {
                if (!isMounted) return
                if (error || !row) {
                    setData(fallback)
                } else {
                    const theme = (row.theme as Record<string, string> | null) ?? {}
                    const settings = (row.settings as Record<string, string> | null) ?? {}
                    setData({
                        id: row.id,
                        name: row.name,
                        slug: row.slug,
                        fullName: row.full_name || row.name,
                        logo: row.logo || (row.name || '').substring(0, 2).toUpperCase(),
                        customLogo: row.logo || undefined,
                        primaryColor: theme.primaryColor || '#7c3aed',
                        secondaryColor: theme.accentColor || '#a78bfa',
                        customPrimaryColor: theme.primaryColor,
                        customSecondaryColor: theme.accentColor,
                        description: settings.description || '',
                        customDomain: settings.custom_domain || `${row.slug}.tratto.app`,
                        whatsapp: settings.whatsapp || '',
                        schedulingType: settings.scheduling_type === 'shared' ? 'shared' : 'individual',
                        planId: (row.plan_id as MockTenant['planId']) || 'trial',
                        subscriptionStatus: (row.subscription_status as MockTenant['subscriptionStatus']) || 'trialing',
                        trialEndsAt: row.trial_ends_at || undefined,
                    })
                }
                setLoading(false)
            })
        return () => { isMounted = false }
    }, [slug, fallback])

    return { data, loading }
}

