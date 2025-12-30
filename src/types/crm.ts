export type ClientRecord = {
    id: string
    tenantId: string
    name: string
    email: string
    phone: string
    cpf?: string
    lastVisit: string
    totalSpent: number
    status: "active" | "inactive" | "churned"
    avatar: string
    document?: string
    loyaltyPoints?: number
}

