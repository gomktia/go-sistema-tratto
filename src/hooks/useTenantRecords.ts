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
    categoryId: row.category_id, // Map ID to string or fetch category
    isActive: row.active,
    imageUrl: row.image_url,
    requiresConfirmation: false,
    currency: "BRL"
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
