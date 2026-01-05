export interface AuditEvent {
    id: string
    actor: string
    actorRole: "super_admin" | "support" | "system"
    action: string
    entity: string
    entityType: "company" | "plan" | "invoice" | "user"
    metadata: Record<string, string>
    createdAt: string
    status: "success" | "warning" | "error"
}

export const auditEvents: AuditEvent[] = [
    {
        id: "LOG-1203",
        actor: "Marina Costa",
        actorRole: "support",
        action: "Atualizou plano",
        entity: "Studio Glamour Beauty",
        entityType: "company",
        metadata: {
            from: "Professional",
            to: "Enterprise",
            reason: "Crescimento equipe"
        },
        createdAt: "2024-12-27T10:10:00Z",
        status: "success"
    },
    {
        id: "LOG-1199",
        actor: "Sistema",
        actorRole: "system",
        action: "Cobrança recorrente",
        entity: "Salão Beleza Pura",
        entityType: "invoice",
        metadata: {
            amount: "R$ 197,00",
            method: "PIX"
        },
        createdAt: "2024-12-27T09:55:00Z",
        status: "success"
    },
    {
        id: "LOG-1195",
        actor: "Paulo Lima",
        actorRole: "support",
        action: "Suspendeu empresa",
        entity: "Espaço Elegance Spa",
        entityType: "company",
        metadata: {
            reason: "Falta de pagamento",
            invoices: "2 pendentes"
        },
        createdAt: "2024-12-27T09:40:00Z",
        status: "warning"
    },
    {
        id: "LOG-1192",
        actor: "Sistema",
        actorRole: "system",
        action: "Envio de e-mail automático",
        entity: "Barber Lab Experience",
        entityType: "user",
        metadata: {
            template: "Trial ending",
            daysLeft: "3"
        },
        createdAt: "2024-12-27T09:00:00Z",
        status: "success"
    },
    {
        id: "LOG-1189",
        actor: "Lucas Prado",
        actorRole: "super_admin",
        action: "Aplicou crédito manual",
        entity: "Espaço Elegance Spa",
        entityType: "company",
        metadata: {
            amount: "R$ 150,00",
            reason: "Campanha fim de ano"
        },
        createdAt: "2024-12-26T18:30:00Z",
        status: "success"
    }
]
