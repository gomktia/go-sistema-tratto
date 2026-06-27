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
    workingHours?: Record<string, { start: string; end: string }[]>
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
    channel?: string
    status: string
    notes?: string
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

export type GalleryImage = {
    id: string
    tenantId: string
    url: string
    title?: string
    category?: string
    displayOrder?: number
}

export type Highlight = {
    id: string
    title: string
    description?: string
    imageUrl?: string
    type?: string
}

export type Review = {
    id: string
    author: string
    rating: number
    text: string
}

export type Story = {
    id: string
    url: string
}

