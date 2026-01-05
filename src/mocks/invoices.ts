export type InvoiceStatus = "paid" | "pending" | "failed" | "overdue" | "refunded"
export type PaymentMethod = "pix" | "card" | "boleto"

export interface Invoice {
    id: string
    companyId: string
    companyName: string
    planId: string
    amount: number
    method: PaymentMethod
    status: InvoiceStatus
    dueDate: string
    createdAt: string
    paidAt?: string
    attempts: number
    lastAttemptAt?: string
}

export const invoices: Invoice[] = [
    {
        id: "INV-2024-0012",
        companyId: "1",
        companyName: "Salão Beleza Pura",
        planId: "professional",
        amount: 197,
        method: "pix",
        status: "paid",
        createdAt: "2024-12-01T09:00:00Z",
        dueDate: "2024-12-05T09:00:00Z",
        paidAt: "2024-12-02T14:20:00Z",
        attempts: 1,
        lastAttemptAt: "2024-12-02T14:20:00Z"
    },
    {
        id: "INV-2024-0013",
        companyId: "2",
        companyName: "Studio Glamour Beauty",
        planId: "enterprise",
        amount: 497,
        method: "card",
        status: "pending",
        createdAt: "2024-12-15T08:30:00Z",
        dueDate: "2024-12-20T08:30:00Z",
        attempts: 2,
        lastAttemptAt: "2024-12-21T09:00:00Z"
    },
    {
        id: "INV-2024-0014",
        companyId: "3",
        companyName: "Espaço Elegance Spa",
        planId: "starter",
        amount: 97,
        method: "boleto",
        status: "overdue",
        createdAt: "2024-12-10T10:00:00Z",
        dueDate: "2024-12-15T10:00:00Z",
        attempts: 3,
        lastAttemptAt: "2024-12-22T11:00:00Z"
    },
    {
        id: "INV-2024-0015",
        companyId: "4",
        companyName: "Barber Lab Experience",
        planId: "professional",
        amount: 197,
        method: "card",
        status: "failed",
        createdAt: "2024-12-18T11:00:00Z",
        dueDate: "2024-12-23T11:00:00Z",
        attempts: 2,
        lastAttemptAt: "2024-12-24T12:30:00Z"
    }
]


