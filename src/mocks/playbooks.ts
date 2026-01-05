export interface PlaybookAction {
    id: string
    title: string
    description: string
    category: "retention" | "billing" | "support" | "growth"
    estimatedImpact: string
    steps: string[]
    lastRunAt?: string
}

export const playbooks: PlaybookAction[] = [
    {
        id: "PB-001",
        title: "Conceder 7 dias extras de trial",
        description: "Para empresas com alto engajamento mas faturamento ainda em validação.",
        category: "retention",
        estimatedImpact: "+22% conversão → plano Starter",
        steps: [
            "Selecionar empresa em trial",
            "Definir data de expiração",
            "Enviar e-mail automático confirmando extensão"
        ],
        lastRunAt: "2024-12-26T18:00:00Z"
    },
    {
        id: "PB-002",
        title: "Forçar cobrança via PIX",
        description: "Reprocessa invoice pendente via link de pagamento instantâneo.",
        category: "billing",
        estimatedImpact: "+35% recuperação D+3",
        steps: [
            "Validar invoice pendente",
            "Gerar link PIX com vencimento 1h",
            "Notificar cliente via e-mail e WhatsApp"
        ]
    },
    {
        id: "PB-003",
        title: "Campanha de upgrade para Professional",
        description: "Oferece 10% OFF para contas no limite do plano Starter.",
        category: "growth",
        estimatedImpact: "+15% upsells",
        steps: [
            "Selecionar empresas com 90% de uso",
            "Personalizar e-mail com benefícios do Professional",
            "Acompanhar respostas por 7 dias"
        ],
        lastRunAt: "2024-12-20T15:30:00Z"
    },
    {
        id: "PB-004",
        title: "Reset de integrações críticas",
        description: "Executa sequência automática para restaurar integrações instáveis.",
        category: "support",
        estimatedImpact: "Normaliza 80% dos incidentes sem intervenção dev",
        steps: [
            "Verificar status atual das integrações",
            "Reiniciar webhooks e refresh tokens",
            "Enviar relatório para o cliente"
        ]
    }
]
