"use client"

import { useEffect, useMemo, useState } from "react"
import { clients, appointments as appointmentMocks } from "@/mocks/data"
import { services as serviceMocks, employees as employeeMocks } from "@/mocks/services"
import { inventory as productMocks } from "@/mocks/inventory"
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
// MOCK DATA MAPPERS (Adapters)
// --------------------------------------------------------------------------

// 1. CLIENTS
const mapMockClient = (client: typeof clients[number]): ClientRecord => ({
    id: client.id,
    tenantId: "tenant-1",
    name: client.name,
    email: client.email,
    phone: client.phone,
    status: client.status as "active" | "inactive" | "churned",
    lastVisit: client.lastVisit,
    totalSpent: client.totalSpent,
    avatar: client.avatar,
})

// 2. APPOINTMENTS
// Ajuste para bater com as propriedades reais que o componente de agenda espera (resourceId, etc.)
// Assumindo que resourceId = employeeId
const mapMockAppointment = (apt: typeof appointmentMocks[number]): AppointmentRecord => {
    // Construct simple start/end dates
    // Assuming apt.date is ISO string, we take the date part
    const datePart = apt.date.split('T')[0]
    const startAt = `${datePart}T${apt.time}:00`
    // Simple duration calculation for endAt
    const endAt = new Date(new Date(startAt).getTime() + apt.duration * 60000).toISOString()

    return {
        id: apt.id,
        tenantId: apt.tenantId,
        customerId: "mock-customer-id", // Mock doesn't link to customer ID
        customerName: apt.customer,
        employeeId: apt.staffId,
        serviceId: apt.serviceId,
        startAt: startAt,
        endAt: endAt,
        status: apt.status as AppointmentRecord["status"],
        price: 0, // Mock appointments don't have price snapshot
        currency: "BRL"
    }
}

// 3. SERVICES
const mapMockService = (srv: typeof serviceMocks[number]): ServiceRecord => ({
    id: srv.id,
    tenantId: "tenant-1",
    name: srv.name,
    description: srv.description,
    price: srv.price,
    durationMinutes: srv.duration, // Supondo que duration no mock seja total, adaptamos
    categoryId: undefined, // Mock uses category string, Type wants ID
    isActive: true,
    imageUrl: srv.imageUrl,
    requiresConfirmation: false,
    currency: "BRL"
})

// 4. EMPLOYEES
const mapMockEmployee = (emp: typeof employeeMocks[number]): EmployeeRecord => ({
    id: emp.id,
    tenantId: "tenant-1",
    fullName: emp.name,
    email: `${emp.name.toLowerCase().replace(" ", ".")}@example.com`,
    phone: "(00) 00000-0000",
    role: "professional", // Default
    status: emp.active ? "active" : "inactive",
    avatarUrl: "", // Mock doesn't have avatar
    specialties: emp.specialties,
    colorTag: "#10b981", // Default color
})

// 5. PRODUCTS
const mapMockProduct = (prod: typeof productMocks[number]): ProductRecord => ({
    id: prod.id,
    tenantId: "tenant-1",
    name: prod.name,
    description: "",
    categoryName: prod.category,
    price: prod.price,
    cost: prod.price * 0.5,
    stockQuantity: prod.stock,
    minStock: 5,
    unit: "un",
    isActive: true,
    imageUrl: prod.image,
    currency: "BRL",
    trackInventory: true
})

// 6. COMBOS
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

// 7. AVAILABILITY
// Gerar disponibilidade padrão para todos os funcionários mockados
const generateMockAvailability = (employeeId: string): StaffAvailabilityRecord[] => {
    const days = [0, 1, 2, 3, 4, 5, 6] // Dom a Sab
    return days.map(day => ({
        id: `avail-${employeeId}-${day}`,
        tenantId: "tenant-1",
        employeeId,
        weekday: day,
        startTime: "09:00",
        endTime: "18:00"
    }))
}

// --------------------------------------------------------------------------
// DB ROW MAPPERS (Supabase -> Domain)
// --------------------------------------------------------------------------

// Appointments
const mapRowToAppointment = (row: any): AppointmentRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    serviceId: row.service_id ?? undefined,
    employeeId: row.employee_id ?? undefined,
    customerId: row.customer_id ?? undefined,
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
})

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
    durationMinutes: row.duration,
    categoryId: row.category_id,
    isActive: row.active,
    imageUrl: row.image_url,
    requiresConfirmation: false,
    currency: "BRL"
})

const mapRowToEmployee = (row: any): EmployeeRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    fullName: row.full_name,
    email: row.email || '',
    phone: row.phone || '',
    role: row.role,
    status: row.status || 'active',
    colorTag: row.color_tag,
    commissionRate: row.commission_rate ?? 0,
    acceptsOnlineBooking: row.accepts_online_booking ?? true,
    specialties: row.specialties || [],
    workingHours: row.working_hours || {},
    avatarUrl: row.avatar_url,
})

// --------------------------------------------------------------------------
// HOOKS
// --------------------------------------------------------------------------

export function useTenantAppointments(tenantId?: string) {
    const fallback = useMemo(() => {
        return appointmentMocks.map(mapMockAppointment)
    }, [])

    const [trigger, setTrigger] = useState(0)
    const [data, setData] = useState<AppointmentRecord[]>(fallback)
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !!tenantId)

    const refetch = () => setTrigger(prev => prev + 1)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) {
            setLoading(false)
            setData(fallback)
            return
        }

        let isMounted = true
        setLoading(true)

        supabase
            .from("appointments")
            .select("id, tenant_id, service_id, employee_id, customer_id, start_at, end_at, duration_minutes, price, currency, channel, status, notes, final_price, discount, payment_method")
            .eq("tenant_id", tenantId)
            .order("start_at", { ascending: true })
            .then(({ data: rows, error }) => {
                if (!isMounted) return
                if (error) {
                    console.error("[useTenantAppointments] Erro ao carregar agendamentos:", error.message)
                    setData(fallback)
                } else {
                    setData(rows ? rows.map(mapRowToAppointment) : fallback)
                }
                setLoading(false)
            })

        return () => { isMounted = false }
    }, [tenantId, fallback, trigger])

    return { data, loading, refetch }
}


export function useTenantServices(tenantId?: string) {
    const fallback = useMemo(() => {
        const normalized = serviceMocks.map(mapMockService)
        if (!tenantId) return normalized
        return normalized
    }, [tenantId])

    const [data, setData] = useState<ServiceRecord[]>(fallback)
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) {
            setLoading(false)
            setData(fallback)
            return
        }

        let isMounted = true
        setLoading(true)

        supabase
            .from("services")
            .select("*")
            .eq("tenant_id", tenantId)
            .eq("active", true)
            .then(({ data: rows, error }) => {
                if (!isMounted) return
                if (!error && rows) {
                    setData(rows.map(mapRowToService))
                } else {
                    console.error("Error fetching services:", error)
                    setData(fallback) // Fallback on error
                }
                setLoading(false)
            })

        return () => { isMounted = false }
    }, [tenantId, fallback])

    return { data, loading }
}

export function useTenantEmployees(tenantId?: string) {
    const fallback = useMemo(() => employeeMocks.map(mapMockEmployee), [])

    const [data, setData] = useState<EmployeeRecord[]>(fallback)
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured && !!tenantId)
    const [trigger, setTrigger] = useState(0)

    const refetch = () => setTrigger(prev => prev + 1)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) {
            setLoading(false)
            setData(fallback)
            return
        }

        let isMounted = true
        setLoading(true)

        supabase
            .from("employees")
            .select("*")
            .eq("tenant_id", tenantId)
            .neq("status", "deleted")
            .order("full_name", { ascending: true })
            .then(({ data: rows, error }) => {
                if (!isMounted) return
                if (!error && rows) {
                    setData(rows.map(mapRowToEmployee))
                } else {
                    console.error("[useTenantEmployees] Erro ao carregar profissionais:", error?.message)
                    setData(fallback)
                }
                setLoading(false)
            })

        return () => { isMounted = false }
    }, [tenantId, trigger, fallback])

    return { data, loading, refetch }
}

export function useTenantProducts(tenantId?: string) {
    const fallback = useMemo(() => {
        const normalized = productMocks.map(mapMockProduct)
        if (!tenantId) return normalized
        return normalized
    }, [tenantId])

    const [data, setData] = useState<ProductRecord[]>(fallback)
    const [loading, setLoading] = useState<boolean>(false)
    const refetch = () => { }

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
    // Generate availability for all employees
    const fallback = useMemo(() => {
        const employees = employeeMocks.map(mapMockEmployee)
        const allAvailabilities = employees.flatMap(emp => generateMockAvailability(emp.id))
        return allAvailabilities
    }, [])

    const [data, setData] = useState<StaffAvailabilityRecord[]>(fallback)
    const [loading, setLoading] = useState<boolean>(false)

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
    const fallback = useMemo(() => {
        const normalized = clients.map(mapMockClient)
        if (!tenantId) return normalized
        return normalized.filter(client => client.tenantId === tenantId)
    }, [tenantId])

    const [trigger, setTrigger] = useState(0)

    const refetch = () => setTrigger(prev => prev + 1)
    const [data, setData] = useState<ClientRecord[]>(fallback)
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase || !tenantId) {
            setLoading(false)
            setData(fallback)
            return
        }

        let isMounted = true
        setLoading(true)

        supabase
            .from("customers")
            .select("id, tenant_id, full_name, email, phone, document, last_visit_at, total_spent, loyalty_points, status")
            .eq("tenant_id", tenantId)
            .order("full_name", { ascending: true })
            .then(({ data: rows, error }) => {
                if (!isMounted) return

                if (error) {
                    console.error("[useTenantCustomers] Erro ao carregar clientes:", error.message)
                    setData(fallback)
                    setLoading(false)
                    return
                }

                // FIX: Trust empty DB array if no error
                if (!rows) {
                    setData(fallback)
                } else {
                    setData(rows.map(mapRowToClient))
                }
                setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [tenantId, fallback, trigger])

    return { data, loading, refetch }
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

