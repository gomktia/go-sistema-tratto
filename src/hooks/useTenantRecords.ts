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
    tags: ["VIP"],
    notes: "",
    preferences: { days: [], times: [] },
    lgpdConsent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
})

// 2. APPOINTMENTS
// Ajuste para bater com as propriedades reais que o componente de agenda espera (resourceId, etc.)
// Assumindo que resourceId = employeeId
const mapMockAppointment = (apt: typeof appointmentMocks[number]): AppointmentRecord => ({
    id: apt.id,
    tenantId: "tenant-1",
    clientId: apt.clientId,
    clientName: apt.clientName,
    professionalId: apt.professionalId,
    serviceId: apt.serviceId,
    start: apt.start,
    end: apt.end,
    status: apt.status as AppointmentRecord["status"],
    totalPrice: apt.price,
    notes: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Campos extras para visualização (opcionais, mas úteis se o componente usar)
    color: "#3b82f6",
    title: apt.clientName,
})

// 3. SERVICES
const mapMockService = (srv: typeof serviceMocks[number]): ServiceRecord => ({
    id: srv.id,
    tenantId: "tenant-1",
    name: srv.name,
    description: srv.description,
    price: srv.price,
    durationLines: srv.duration, // Supondo que duration no mock seja total, adaptamos
    category: srv.category,
    active: true,
    imageUrl: srv.image,
    commissionRate: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
})

// 4. EMPLOYEES
const mapMockEmployee = (emp: typeof employeeMocks[number]): EmployeeRecord => ({
    id: emp.id,
    tenantId: "tenant-1",
    name: emp.name,
    email: `${emp.name.toLowerCase().replace(" ", ".")}@example.com`,
    phone: "(00) 00000-0000",
    role: emp.role as "admin" | "manager" | "professional" | "receptionist",
    active: true,
    avatar: emp.avatar,
    specialties: emp.specialties,
    commissionRate: 50, // Default
    bio: "Profissional experiente...",
    instagram: "@salao",
    scheduleColor: "#10b981", // Default color
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
})

// 5. PRODUCTS
const mapMockProduct = (prod: typeof productMocks[number]): ProductRecord => ({
    id: prod.id,
    tenantId: "tenant-1",
    name: prod.name,
    description: "",
    sku: `SKU-${prod.id}`,
    barcode: "",
    category: prod.category,
    price: prod.price,
    costPrice: prod.price * 0.5,
    stockQuantity: prod.stock,
    minStockLevel: 5,
    unit: "un",
    supplier: "Fornecedor Padrão",
    active: true,
    imageUrl: prod.image,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
})

// 6. COMBOS
const mapMockCombo = (combo: typeof comboMocks[number]): ComboRecord => ({
    id: combo.id,
    tenantId: "tenant-1",
    name: combo.name,
    description: combo.description,
    services: combo.items.map(item => ({
        serviceId: item.serviceId,
        priceOverride: undefined, // Mock não tem isso explícito
        order: 0
    })),
    originalPrice: combo.originalPrice,
    finalPrice: combo.price,
    active: true,
    imageUrl: combo.image,
    validUntil: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
})

// 7. AVAILABILITY
// Gerar disponibilidade padrão para todos os funcionários mockados
const generateMockAvailability = (employeeId: string): StaffAvailabilityRecord[] => {
    const days = [0, 1, 2, 3, 4, 5, 6] // Dom a Sab
    return days.map(day => ({
        id: `avail-${employeeId}-${day}`,
        tenantId: "tenant-1",
        employeeId,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
        isWorkingDay: day !== 0, // Domingo folga
        breaks: [{ start: "12:00", end: "13:00" }]
    }))
}

// --------------------------------------------------------------------------
// DB ROW MAPPERS (Supabase -> Domain)
// --------------------------------------------------------------------------

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
    tags: [],   // Need relation table or jsonb
    notes: "",
    preferences: { days: [], times: [] },
    lgpdConsent: true,
    createdAt: new Date().toISOString(), // Missing in select usually
    updatedAt: new Date().toISOString()
})

const mapRowToService = (row: any): ServiceRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description,
    price: row.price,
    durationLines: row.duration,
    category: row.category_id, // Map ID to string or fetch category
    active: row.active,
    imageUrl: row.image_url,
    commissionRate: row.commission_rate,
    createdAt: row.created_at,
    updatedAt: row.updated_at
})

// --------------------------------------------------------------------------
// HOOKS
// --------------------------------------------------------------------------

export function useTenantAppointments(tenantId?: string) {
    // Fallback: Filtrar mocks pelo tenant (se tivéssemos multi-tenant mocks reais)
    const fallback = useMemo(() => {
        const normalized = appointmentMocks.map(mapMockAppointment)
        if (!tenantId) return normalized
        // Mock não tem tenantId, retornamos tudo por enquanto
        return normalized
    }, [tenantId])

    const [data, setData] = useState<AppointmentRecord[]>(fallback)
    const [loading, setLoading] = useState<boolean>(false) // Mock loading is instant

    // Aqui entraria o useEffect com Supabase
    // useEffect(() => { ... fetch from 'appointments' table ... }, [tenantId])

    return { data, loading }
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
    const fallback = useMemo(() => {
        const normalized = employeeMocks.map(mapMockEmployee)
        if (!tenantId) return normalized
        return normalized
    }, [tenantId])

    const [data, setData] = useState<EmployeeRecord[]>(fallback)
    const [loading, setLoading] = useState<boolean>(false)

    // useEffect(() => { ... fetch from 'employees' table ... }, [tenantId])

    return { data, loading }
}

export function useTenantProducts(tenantId?: string) {
    const fallback = useMemo(() => {
        const normalized = productMocks.map(mapMockProduct)
        if (!tenantId) return normalized
        return normalized
    }, [tenantId])

    const [data, setData] = useState<ProductRecord[]>(fallback)
    const [loading, setLoading] = useState<boolean>(false)

    return { data, loading }
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
    const [data, setData] = useState<GalleryImage[]>(fallback)
    const [loading, setLoading] = useState<boolean>(false)
    return { data, loading }
}

export function useTenantHighlights(tenantId?: string) {
    const fallback: Highlight[] = []
    const [data, setData] = useState<Highlight[]>(fallback)
    const [loading, setLoading] = useState<boolean>(false)
    return { data, loading }
}

export function useTenantReviews(tenantId?: string) {
    const fallback: Review[] = []
    const [data, setData] = useState<Review[]>(fallback)
    const [loading, setLoading] = useState<boolean>(false)
    return { data, loading }
}

export function useTenantStories(tenantId?: string) {
    const fallback: Story[] = []
    const [data, setData] = useState<Story[]>(fallback)
    const [loading, setLoading] = useState<boolean>(false)
    return { data, loading }
}

export function useTenantSettings(tenantId?: string) {
    // Mock settings
    const [data, setData] = useState({
        name: "Salão Exemplo",
        primaryColor: "#000000",
        logoUrl: "",
        address: "Rua Exemplo, 123"
    })
    const [loading, setLoading] = useState(false)
    return { data, loading }
}

export function useTenantTestimonials(tenantId?: string) {
    const fallback: any[] = []
    const [data, setData] = useState<any[]>(fallback)
    const [loading, setLoading] = useState<boolean>(false)
    return { data, loading }
}

export function useTenantBySlug(slug: string) {
    const fallback = useMemo(() => {
        return tenantMocks.find(t => t.slug === slug) || null
    }, [slug])

    const [data, setData] = useState<MockTenant | null>(fallback)
    const [loading, setLoading] = useState<boolean>(false)

    // TODO: Supabase implementation for getting tenant by slug

    return { data, loading }
}
