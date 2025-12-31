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
    type Testimonial,
    galleryImages as galleryMocks,
    highlights as highlightMocks,
    testimonials as testimonialMocks
} from "@/mocks/marketing"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { getInitials } from "@/lib/utils"

interface CustomerRow {
    id: string
    tenant_id: string
    full_name: string
    email: string | null
    phone: string | null
    document: string | null
    last_visit_at: string | null
    total_spent: number | null
    loyalty_points: number | null
    status: string | null
}

interface ServiceRow {
    id: string
    tenant_id: string
    category_id?: string | null
    name: string
    description?: string | null
    duration_minutes?: number | null
    price?: number | null
    currency?: string | null
    requires_confirmation?: boolean | null
    is_active?: boolean | null
    metadata?: Record<string, unknown> | null
    image_url?: string | null
}

interface EmployeeRow {
    id: string
    tenant_id: string
    full_name: string
    email?: string | null
    phone?: string | null
    role?: string | null
    color_tag?: string | null
    commission_rate?: number | null
    status?: string | null
    accepts_online_booking?: boolean | null
    avatar_url?: string | null
    settings?: Record<string, unknown> | null
}

interface AppointmentRow {
    id: string
    tenant_id: string
    service_id?: string | null
    employee_id?: string | null
    customer_id?: string | null
    customers?:
    | {
        full_name?: string | null
    }
    | Array<{
        full_name?: string | null
    }>
    | null
    start_at: string
    end_at?: string | null
    duration_minutes?: number | null
    price?: number | null
    currency?: string | null
    status: string
    channel?: string | null
}

interface ProductRow {
    id: string
    tenant_id: string
    category_id?: string | null
    name: string
    description?: string | null
    price?: number | null
    cost?: number | null
    currency?: string | null
    track_inventory?: boolean | null
    stock_quantity?: number | null
    min_stock?: number | null
    unit?: string | null
    is_active?: boolean | null
    image_url?: string | null
    product_categories?:
    | {
        name?: string | null
    }
    | Array<{
        name?: string | null
    }>
    | null
}

interface ComboRow {
    id: string
    tenant_id: string
    name: string
    description?: string | null
    original_price?: number | null
    price?: number | null
    currency?: string | null
    image_url?: string | null
    category?: string | null
}

interface TenantRow {
    id: string
    name: string
    slug: string
    full_name?: string | null
    logo_url?: string | null
    theme?: Record<string, string | undefined> | null
    settings?: Record<string, string | undefined> | null
}

interface StaffAvailabilityRow {
    id: string
    tenant_id: string
    employee_id: string
    weekday: number
    start_time: string
    end_time: string
    is_active: boolean | null
}

interface GalleryImageRow {
    id: string
    tenant_id: string
    image_url: string
    title: string | null
    description: string | null
    display_order: number | null
}

interface HighlightRow {
    id: string
    tenant_id: string
    title: string
    description: string | null
    image_url: string | null
    type: string
    expires_at: string | null
}

interface ReviewRow {
    id: string
    tenant_id?: string // Schema might not have it directly if linked via appt, but let's check
    customer_email: string
    professional_id: string
    service_id: string
    rating: number
    comment: string | null
    is_approved: boolean
}

const defaultCurrency = "BRL"

const castClientStatus = (status?: string | null): ClientRecord["status"] => {
    if (status === "inactive" || status === "churned" || status === "active") {
        return status
    }
    return "active"
}

const mapRowToClient = (row: CustomerRow): ClientRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    name: row.full_name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    document: row.document ?? undefined,
    lastVisit: row.last_visit_at ?? new Date().toISOString(),
    totalSpent: Number(row.total_spent ?? 0),
    status: castClientStatus(row.status),
    avatar: "",
    loyaltyPoints: row.loyalty_points ?? undefined,
})

const mapMockClient = (client: typeof clients[number]): ClientRecord => ({
    id: client.id,
    tenantId: client.tenantId,
    name: client.name,
    email: client.email,
    phone: client.phone,
    document: undefined,
    lastVisit: client.lastVisit,
    totalSpent: client.totalSpent,
    status: castClientStatus(client.status),
    avatar: client.avatar ?? "",
    loyaltyPoints: undefined,
})

const mapRowToService = (row: ServiceRow): ServiceRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description ?? "",
    durationMinutes: row.duration_minutes ?? 0,
    price: Number(row.price ?? 0),
    currency: row.currency ?? defaultCurrency,
    requiresConfirmation: Boolean(row.requires_confirmation),
    isActive: row.is_active ?? true,
    categoryId: row.category_id ?? undefined,
    metadata: row.metadata ?? undefined,
    imageUrl: row.image_url ?? undefined,
})

const mapMockService = (service: typeof serviceMocks[number]): ServiceRecord => ({
    id: service.id,
    tenantId: service.tenantId,
    name: service.name,
    description: service.description,
    durationMinutes: service.duration,
    price: service.price,
    currency: defaultCurrency,
    requiresConfirmation: service.requiresDeposit,
    isActive: service.active,
    metadata: {
        allowOnlineBooking: service.allowOnlineBooking,
        bufferBefore: service.bufferBefore,
        bufferAfter: service.bufferAfter,
    },
    imageUrl: service.imageUrl,
})

const mapRowToEmployee = (row: EmployeeRow): EmployeeRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    fullName: row.full_name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    role: row.role ?? undefined,
    colorTag: row.color_tag ?? undefined,
    commissionRate: row.commission_rate ?? undefined,
    status: row.status ?? "active",
    acceptsOnlineBooking: row.accepts_online_booking ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    specialties: Array.isArray((row.settings as { specialties?: unknown[] } | undefined)?.specialties)
        ? ((row.settings as { specialties?: unknown[] }).specialties || []).filter(
            (value): value is string => typeof value === "string"
        )
        : undefined,
})

const mapMockEmployee = (employee: typeof employeeMocks[number]): EmployeeRecord => ({
    id: employee.id,
    tenantId: employee.tenantId,
    fullName: employee.name,
    email: employee.email,
    phone: employee.phone,
    role: "Professional",
    colorTag: undefined,
    commissionRate: employee.commission,
    status: employee.active ? "active" : "inactive",
    acceptsOnlineBooking: employee.acceptsOnlineBooking,
    specialties: employee.specialties,
})

const mapRowToAppointment = (row: AppointmentRow): AppointmentRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    serviceId: row.service_id ?? undefined,
    serviceName: undefined,
    employeeId: row.employee_id ?? undefined,
    customerId: row.customer_id ?? undefined,
    customerName: Array.isArray(row.customers)
        ? row.customers[0]?.full_name ?? undefined
        : row.customers?.full_name ?? undefined,
    startAt: row.start_at,
    endAt: row.end_at ?? undefined,
    durationMinutes: row.duration_minutes ?? undefined,
    price: row.price ?? undefined,
    currency: row.currency ?? defaultCurrency,
    status: row.status,
    channel: row.channel ?? undefined,
})

const mapMockAppointment = (appointment: typeof appointmentMocks[number]): AppointmentRecord => ({
    id: appointment.id,
    tenantId: appointment.tenantId,
    serviceId: appointment.serviceId,
    employeeId: appointment.staffId,
    customerId: undefined,
    customerName: appointment.customer,
    startAt: appointment.date,
    endAt: undefined,
    durationMinutes: appointment.duration,
    price: undefined,
    currency: defaultCurrency,
    status: appointment.status,
    channel: "mock",
})

const mapRowToProduct = (row: ProductRow): ProductRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    categoryId: row.category_id ?? undefined,
    categoryName: Array.isArray(row.product_categories)
        ? row.product_categories[0]?.name ?? undefined
        : row.product_categories?.name ?? undefined,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price ?? 0),
    cost: row.cost ?? undefined,
    currency: row.currency ?? defaultCurrency,
    trackInventory: row.track_inventory ?? true,
    stockQuantity: row.stock_quantity ?? 0,
    minStock: row.min_stock ?? 0,
    unit: row.unit ?? "un",
    isActive: row.is_active ?? true,
    imageUrl: row.image_url ?? undefined,
})

const mapMockProduct = (product: typeof productMocks[number]): ProductRecord => ({
    id: product.id,
    tenantId: product.tenantId,
    categoryId: product.category,
    categoryName: product.category,
    name: product.name,
    description: product.description,
    price: product.price,
    cost: undefined,
    currency: defaultCurrency,
    trackInventory: true,
    stockQuantity: product.stock,
    minStock: product.minStock,
    unit: "un",
    isActive: product.showOnline,
    imageUrl: product.image,
})

const mapTenantRow = (row: TenantRow): MockTenant => {
    const theme = row.theme ?? {}
    const settings = row.settings ?? {}
    const initials = getInitials(row.full_name || row.name || "")
    return {
        id: row.id,
        name: row.name,
        fullName: row.full_name || row.name,
        logo: row.logo_url || initials,
        customLogo: row.logo_url || undefined,
        primaryColor: theme.primary || "#7c3aed",
        secondaryColor: theme.secondary || "#a78bfa",
        customPrimaryColor: theme.primary,
        customSecondaryColor: theme.secondary,
        description: settings.description || `Conta ${row.name}`,
        customDomain: settings.custom_domain || `${row.slug}.beautyflow.app`,
        slug: row.slug,
        whatsapp: settings.whatsapp || "",
        schedulingType: settings.scheduling_type === "shared" ? "shared" : "individual",
        settings: settings
    }
}

const mapRowToCombo = (row: ComboRow): ComboRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    description: row.description ?? "",
    originalPrice: Number(row.original_price ?? 0),
    price: Number(row.price ?? 0),
    currency: row.currency ?? defaultCurrency,
    imageUrl: row.image_url ?? undefined,
    category: row.category ?? undefined,
})

const mapMockCombo = (combo: typeof comboMocks[number]): ComboRecord => ({
    id: combo.id,
    tenantId: combo.tenantId,
    name: combo.name,
    description: combo.description,
    originalPrice: combo.originalPrice,
    price: combo.price,
    currency: defaultCurrency,
    imageUrl: combo.image,
    category: combo.category,
})

const weekdayLookup: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
}

const mapRowToStaffAvailability = (row: StaffAvailabilityRow): StaffAvailabilityRecord => ({
    id: row.id,
    tenantId: row.tenant_id,
    employeeId: row.employee_id,
    weekday: row.weekday,
    startTime: row.start_time,
    endTime: row.end_time,
})

const mapMockAvailability = (employee: typeof employeeMocks[number]): StaffAvailabilityRecord[] => {
    return Object.entries(employee.workingHours ?? {}).flatMap(([weekday, slots]) => {
        const weekdayIndex = weekdayLookup[weekday] ?? null
        if (weekdayIndex === null) return []

        return slots.map((slot, index) => ({
            id: `${employee.id}-${weekday}-${index}`,
            tenantId: employee.tenantId,
            employeeId: employee.id,
            weekday: weekdayIndex,
            startTime: slot.start,
            endTime: slot.end,
        }))
    })
}

const mapRowToGalleryImage = (row: GalleryImageRow): GalleryImage => ({
    id: row.id,
    tenantId: row.tenant_id,
    url: row.image_url,
    title: row.title ?? "",
    description: row.description ?? undefined,
    category: "general",
    displayOrder: row.display_order ?? 0,
})

const mapRowToHighlight = (row: HighlightRow): Highlight => ({
    id: row.id,
    tenantId: row.tenant_id,
    title: row.title,
    description: row.description ?? "",
    imageUrl: row.image_url ?? "",
    type: (row.type as Highlight['type']) ?? 'promotion',
    expiresAt: row.expires_at ?? undefined,
})

const mapRowToTestimonial = (row: ReviewRow): Testimonial => ({
    id: row.id,
    tenantId: "11111111-1111-1111-1111-111111111111", // Placeholder or fetch if available
    customerName: row.customer_email.split('@')[0], // Fallback name from email
    customerRole: "Cliente",
    testimonial: row.comment ?? "",
    rating: row.rating,
    isApproved: row.is_approved,
    imageUrl: undefined // Review table doesn't have image
})

const mapMockGalleryImage = (image: GalleryImage): GalleryImage => image

export function useTenantCustomers(tenantId?: string) {
    const fallback = useMemo(() => {
        const normalized = clients.map(mapMockClient)
        if (!tenantId) return normalized
        return normalized.filter(client => client.tenantId === tenantId)
    }, [tenantId])

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

                if (!rows || rows.length === 0) {
                    setData(fallback)
                } else {
                    setData(rows.map(mapRowToClient))
                }
                setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [tenantId, fallback])

    return { data, loading }
}

function useTenantQuery<T>(
    tenantId: string | undefined,
    fetcher: (supabase: NonNullable<ReturnType<typeof getSupabaseBrowserClient>>, tenantId: string) => Promise<T[] | null>,
    fallbackData: T[]
) {
    const [data, setData] = useState<T[]>(fallbackData)
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!tenantId || !isSupabaseConfigured || !supabase) {
            setData(fallbackData)
            setLoading(false)
            return
        }

        let isMounted = true
        setLoading(true)

        fetcher(supabase, tenantId)
            .then(rows => {
                if (!isMounted) return
                if (!rows || rows.length === 0) {
                    setData(fallbackData)
                } else {
                    setData(rows)
                }
            })
            .catch(error => {
                console.error("[useTenantQuery]", error)
                if (isMounted) setData(fallbackData)
            })
            .finally(() => {
                if (isMounted) setLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [tenantId, fallbackData])

    return { data, loading }
}

export function useTenantServices(tenantId?: string) {
    const fallback = useMemo(() => {
        if (!tenantId) return serviceMocks.map(mapMockService)
        return serviceMocks.filter(service => service.tenantId === tenantId).map(mapMockService)
    }, [tenantId])

    return useTenantQuery<ServiceRecord>(
        tenantId,
        async (supabase, currentTenantId) => {
            const { data, error } = await supabase
                .from("services")
                .select("id, tenant_id, category_id, name, description, duration_minutes, price, currency, requires_confirmation, is_active, metadata, image_url")
                .eq("tenant_id", currentTenantId)
                .order("name")

            if (error) {
                console.error("[useTenantServices] ", error.message)
                return null
            }
            return data?.map(mapRowToService) ?? null
        },
        fallback
    )
}

export function useTenantEmployees(tenantId?: string) {
    const fallback = useMemo(() => {
        if (!tenantId) return employeeMocks.map(mapMockEmployee)
        return employeeMocks.filter(employee => employee.tenantId === tenantId).map(mapMockEmployee)
    }, [tenantId])

    return useTenantQuery<EmployeeRecord>(
        tenantId,
        async (supabase, currentTenantId) => {
            const { data, error } = await supabase
                .from("employees")
                .select("id, tenant_id, full_name, email, phone, role, color_tag, commission_rate, status, accepts_online_booking, avatar_url, settings")
                .eq("tenant_id", currentTenantId)
                .order("full_name")

            if (error) {
                console.error("[useTenantEmployees] ", error.message)
                return null
            }
            return data?.map(mapRowToEmployee) ?? null
        },
        fallback
    )
}

export function useTenantAppointments(tenantId?: string) {
    const fallback = useMemo(() => {
        if (!tenantId) return appointmentMocks.map(mapMockAppointment)
        return appointmentMocks.filter(appointment => appointment.tenantId === tenantId).map(mapMockAppointment)
    }, [tenantId])

    return useTenantQuery<AppointmentRecord>(
        tenantId,
        async (supabase, currentTenantId) => {
            const { data, error } = await supabase
                .from("appointments")
                .select("id, tenant_id, service_id, employee_id, customer_id, start_at, end_at, duration_minutes, price, currency, status, channel, customers(full_name)")
                .eq("tenant_id", currentTenantId)
                .order("start_at")

            if (error) {
                console.error("[useTenantAppointments] ", error.message)
                return null
            }
            return data?.map(mapRowToAppointment) ?? null
        },
        fallback
    )
}

export function useTenantProducts(tenantId?: string) {
    const fallback = useMemo(() => {
        if (!tenantId) return productMocks.map(mapMockProduct)
        return productMocks.filter(product => product.tenantId === tenantId).map(mapMockProduct)
    }, [tenantId])

    return useTenantQuery<ProductRecord>(
        tenantId,
        async (supabase, currentTenantId) => {
            const { data, error } = await supabase
                .from("products")
                .select("id, tenant_id, category_id, name, description, price, cost, currency, track_inventory, stock_quantity, min_stock, unit, is_active, image_url, product_categories(name)")
                .eq("tenant_id", currentTenantId)
                .order("name")

            if (error) {
                console.error("[useTenantProducts] ", error.message)
                return null
            }
            return data?.map(mapRowToProduct) ?? null
        },
        fallback
    )
}

export function useTenantCombos(tenantId?: string) {
    const fallback = useMemo(() => {
        if (!tenantId) return comboMocks.map(mapMockCombo)
        return comboMocks.filter(combo => combo.tenantId === tenantId).map(mapMockCombo)
    }, [tenantId])

    return useTenantQuery<ComboRecord>(
        tenantId,
        async (supabase, currentTenantId) => {
            const { data, error } = await supabase
                .from("combos")
                .select("id, tenant_id, name, description, original_price, price, currency, image_url, category")
                .eq("tenant_id", currentTenantId)
                .order("name")

            if (error) {
                console.error("[useTenantCombos] ", error.message)
                return null
            }
            return data?.map(mapRowToCombo) ?? null
        },
        fallback
    )
}

export function useTenantBySlug(slug?: string) {
    const fallback = useMemo(() => {
        if (!slug) return null
        return tenantMocks.find(tenant => tenant.slug === slug) ?? null
    }, [slug])

    const [tenant, setTenant] = useState<MockTenant | null>(fallback)
    const [loading, setLoading] = useState<boolean>(isSupabaseConfigured)

    useEffect(() => {
        if (!slug) {
            setTenant(fallback)
            setLoading(false)
            return
        }

        const supabase = getSupabaseBrowserClient()
        if (!isSupabaseConfigured || !supabase) {
            setTenant(fallback)
            setLoading(false)
            return
        }

        let isMounted = true
        setLoading(true)

        const fetchTenant = async () => {
            const { data, error } = await supabase
                .from("tenants")
                .select("id, name, slug, full_name, logo_url, theme, settings")
                .eq("slug", slug)
                .maybeSingle()

            if (!isMounted) return

            if (error) {
                console.error("[useTenantBySlug]", error.message)
                setTenant(fallback)
            } else if (data) {
                setTenant(mapTenantRow(data))
            } else {
                setTenant(fallback)
            }

            setLoading(false)
        }

        fetchTenant()

        return () => {
            isMounted = false
        }
    }, [slug, fallback])

    return { tenant, loading }
}

export function useTenantStaffAvailability(tenantId?: string) {
    const fallback = useMemo(() => {
        if (!tenantId) {
            return employeeMocks.flatMap(mapMockAvailability)
        }
        return employeeMocks
            .filter(employee => employee.tenantId === tenantId)
            .flatMap(mapMockAvailability)
    }, [tenantId])

    return useTenantQuery<StaffAvailabilityRecord>(
        tenantId,
        async (supabase, currentTenantId) => {
            const { data, error } = await supabase
                .from("staff_availability")
                .select("id, tenant_id, employee_id, weekday, start_time, end_time, is_active")
                .eq("tenant_id", currentTenantId)
                .eq("is_active", true)
                .order("employee_id")

            if (error) {
                console.error("[useTenantStaffAvailability] ", error.message)
                return null
            }

            return data?.map(mapRowToStaffAvailability) ?? null
        },
        fallback
    )
}

export function useTenantGallery(tenantId?: string) {
    const fallback = useMemo(() => {
        if (!tenantId) return galleryMocks
        return galleryMocks.filter(img => img.tenantId === tenantId)
    }, [tenantId])

    return useTenantQuery<GalleryImage>(
        tenantId,
        async (supabase, currentTenantId) => {
            const { data, error } = await supabase
                .from("gallery_images")
                .select("id, tenant_id, image_url, title, description, display_order")
                .eq("tenant_id", currentTenantId)
                .order("display_order", { ascending: true })

            if (error) {
                console.error("[useTenantGallery] ", error.message)
                return null
            }

            return data?.map(mapRowToGalleryImage) ?? null
        },
        fallback
    )
}

export function useTenantHighlights(tenantId?: string) {
    const fallback = useMemo(() => {
        if (!tenantId) return highlightMocks
        return highlightMocks.filter(h => h.tenantId === tenantId)
    }, [tenantId])

    return useTenantQuery<Highlight>(
        tenantId,
        async (supabase, currentTenantId) => {
            const { data, error } = await supabase
                .from("highlights")
                .select("id, tenant_id, title, description, image_url, type, expires_at")
                .eq("tenant_id", currentTenantId)
                .eq("is_active", true)

            if (error) {
                console.error("[useTenantHighlights] ", error.message)
                return null
            }
            return data?.map(mapRowToHighlight) ?? null
        },
        fallback
    )
}

export function useTenantTestimonials(tenantId?: string) {
    const fallback = useMemo(() => {
        if (!tenantId) return testimonialMocks
        return testimonialMocks.filter(t => t.tenantId === tenantId)
    }, [tenantId])

    return useTenantQuery<Testimonial>(
        tenantId,
        async (supabase, currentTenantId) => {
            // Note: Reviews table might not have tenant_id directly if it's per appointment.
            // But usually for a multi-tenant system, we replicate tenant_id or link via appointment.
            // In full_schema.sql: reviews table does NOT have tenant_id currently (it has appointment_id).
            // This is a constraint. For now, we will assume we can fetch ALL reviews (demo mode) OR
            // we should have added tenant_id to reviews. 
            // Workaround: Fetch all for now as user just populated "Mock Data" into real table.
            // PROPER FIX: Add tenant_id to reviews table.

            const { data, error } = await supabase
                .from("reviews")
                .select("id, customer_email, professional_id, service_id, rating, comment, is_approved")
                .eq("is_approved", true)
                // .eq("tenant_id", currentTenantId) // Missing column in schema
                .limit(10)

            if (error) {
                console.error("[useTenantTestimonials] ", error.message)
                return null
            }
            return data?.map(mapRowToTestimonial) ?? null
        },
        fallback
    )
}


