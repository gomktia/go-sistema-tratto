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
    document?: string
    birthdate?: string
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

export type AppointmentStatus =
    | 'staff_unavailable'
    | 'pending'
    | 'confirmed'
    | 'no_show'
    | 'in_progress'
    | 'completed'
    | 'cancelled'

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
    status: AppointmentStatus
    notes?: string
    // Campos de conclusão/pagamento (PR 3)
    finalPrice?: number
    discount?: number
    paymentMethod?: string
}

// Comissão por atendimento (PR 4)
export type CommissionRow = {
    id: string
    tenantId: string
    appointmentId: string
    employeeId: string
    commissionRate: number  // snapshot no fechamento (%)
    finalPrice: number      // valor cobrado do cliente
    discount: number        // desconto aplicado
    baseAmount: number      // finalPrice - discount
    commissionAmount: number // baseAmount * commissionRate / 100
    createdAt: string
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

// Fechamento diário (PR 5)
export type DailyClosingRecord = {
    id: string
    tenantId: string
    closingDate: string          // YYYY-MM-DD
    totalAppointments: number
    grossRevenue: number         // soma de final_price
    totalDiscounts: number       // soma de discount
    netRevenue: number           // gross - discounts
    totalCommissions: number     // soma de commission_amount
    revenuePix: number
    revenueCash: number
    revenueDebit: number
    revenueCredit: number
    revenueOther: number
    status: 'open' | 'closed'
    closedAt?: string
    notes?: string
    createdAt: string
    updatedAt: string
}

