export type TicketStatus = "open" | "in_progress" | "waiting_customer" | "resolved"
export type TicketPriority = "low" | "medium" | "high" | "critical"

export interface SupportTicket {
    id: string
    companyId: string
    companyName: string
    subject: string
    channel: "email" | "chat" | "phone" | "whatsapp"
    priority: TicketPriority
    status: TicketStatus
    slaMinutes: number
    createdAt: string
    updatedAt: string
    owner: string
}

export interface IntegrationStatus {
    id: string
    name: string
    description: string
    uptime: string
    status: "online" | "degraded" | "offline"
    lastIncident?: string
}

export interface Incident {
    id: string
    title: string
    severity: "low" | "medium" | "high"
    timestamp: string
    description: string
    status: "monitoring" | "resolved" | "investigating"
}

export const supportTickets: SupportTicket[] = [
    {
        id: "TCK-9812",
        companyId: "1",
        companyName: "Salão Beleza Pura",
        subject: "Erro ao sincronizar agenda com Google",
        channel: "email",
        priority: "high",
        status: "in_progress",
        slaMinutes: 45,
        createdAt: "2024-12-27T09:15:00Z",
        updatedAt: "2024-12-27T10:05:00Z",
        owner: "Marina Costa"
    },
    {
        id: "TCK-9801",
        companyId: "2",
        companyName: "Studio Glamour Beauty",
        subject: "Dúvida sobre upgrade para Enterprise",
        channel: "chat",
        priority: "medium",
        status: "waiting_customer",
        slaMinutes: 120,
        createdAt: "2024-12-26T14:20:00Z",
        updatedAt: "2024-12-27T08:10:00Z",
        owner: "Paulo Lima"
    },
    {
        id: "TCK-9770",
        companyId: "3",
        companyName: "Espaço Elegance Spa",
        subject: "Envio de SMS não está disparando",
        channel: "whatsapp",
        priority: "critical",
        status: "open",
        slaMinutes: 20,
        createdAt: "2024-12-27T10:40:00Z",
        updatedAt: "2024-12-27T10:40:00Z",
        owner: "Equipe NOC"
    },
    {
        id: "TCK-9724",
        companyId: "4",
        companyName: "Barber Lab Experience",
        subject: "Solicitação de treinamento presencial",
        channel: "phone",
        priority: "low",
        status: "resolved",
        slaMinutes: 240,
        createdAt: "2024-12-25T11:00:00Z",
        updatedAt: "2024-12-26T09:30:00Z",
        owner: "Juliana Prado"
    }
]

export const integrationStatuses: IntegrationStatus[] = [
    {
        id: "int-1",
        name: "WhatsApp Cloud API",
        description: "Envio de notificações e lembretes",
        uptime: "99.92%",
        status: "online"
    },
    {
        id: "int-2",
        name: "Gateway de Pagamento",
        description: "Cobranças recorrentes e PIX",
        uptime: "99.10%",
        status: "degraded",
        lastIncident: "Latência elevada 09:20"
    },
    {
        id: "int-3",
        name: "Envio de SMS",
        description: "Mensagens transacionais e marketing",
        uptime: "98.40%",
        status: "offline",
        lastIncident: "Falha fornecedor 07:45"
    }
]

export const incidents: Incident[] = [
    {
        id: "INC-221",
        title: "Fila de Webhooks atrasada",
        severity: "high",
        timestamp: "2024-12-27T10:10:00Z",
        description: "Eventos de confirmação de pagamento com 8 minutos de atraso.",
        status: "investigating"
    },
    {
        id: "INC-220",
        title: "picos de latência API pública",
        severity: "medium",
        timestamp: "2024-12-26T21:00:00Z",
        description: "Oscilação detectada em endpoints /bookings.",
        status: "monitoring"
    },
    {
        id: "INC-217",
        title: "Integração SMS fornecedor B",
        severity: "low",
        timestamp: "2024-12-25T16:30:00Z",
        description: "Fornecedor aplicou patch corretivo. Operação normal.",
        status: "resolved"
    }
]
