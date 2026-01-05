export type ServiceRecord = {
    id: string
    tenantId: string
    name: string
    description: string
    durationMinutes: number
    price: number
    currency: string
    requiresConfirmation: boolean
    isActive: boolean
    categoryId?: string
    metadata?: Record<string, unknown>
    imageUrl?: string
}

export type EmployeeRecord = {
    id: string
    tenantId: string
    fullName: string
    email: string
    phone: string
    role?: string
    status: string
    colorTag?: string
    commissionRate?: number
    acceptsOnlineBooking?: boolean
    specialties?: string[]
    avatarUrl?: string
}

export type StaffAvailabilityRecord = {
    id: string
    tenantId: string
    employeeId: string
    weekday: number
    startTime: string
    endTime: string
}

export type AppointmentRecord = {
    id: string
    tenantId: string
    serviceId?: string
    serviceName?: string
    employeeId?: string
    customerId?: string
    customerName?: string
    startAt: string
    endAt?: string
    durationMinutes?: number
    price?: number
    currency: string
    status: string
    channel?: string
}

export type ProductRecord = {
    id: string
    tenantId: string
    categoryId?: string
    categoryName?: string
    name: string
    description: string
    price: number
    cost?: number
    currency: string
    trackInventory: boolean
    stockQuantity: number
    minStock: number
    unit: string
    isActive: boolean
    imageUrl?: string
}

export type ComboRecord = {
    id: string
    tenantId: string
    name: string
    description: string
    originalPrice: number
    price: number
    currency: string
    imageUrl?: string
    category?: string
}

