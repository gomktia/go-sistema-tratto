"use client"

import { useMemo, type ComponentType } from "react"
import { supportTickets, integrationStatuses, incidents, type SupportTicket } from "@/mocks/support"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    ShieldCheck,
    Zap,
    Activity,
    Headphones,
    AlertTriangle,
    Clock,
    LifeBuoy,
} from "lucide-react"
import { cn } from "@/lib/utils"

const priorityStyles = {
    low: "bg-slate-100 text-slate-600",
    medium: "bg-blue-100 text-blue-600",
    high: "bg-amber-100 text-amber-600",
    critical: "bg-red-100 text-red-600"
} as const

const statusLabels: Record<SupportTicket["status"], string> = {
    open: "Aberto",
    in_progress: "Em andamento",
    waiting_customer: "Aguardando cliente",
    resolved: "Resolvido"
}

export default function SuportePage() {
    const openTickets = supportTickets.filter(t => t.status !== "resolved")
    const averageSla = Math.round(
        openTickets.reduce((sum, ticket) => sum + ticket.slaMinutes, 0) / (openTickets.length || 1)
    )
    const criticalCount = supportTickets.filter(t => t.priority === "critical" && t.status !== "resolved").length
    const uptimeAverage = useMemo(() => {
        const total = integrationStatuses.reduce((sum, integration) => sum + parseFloat(integration.uptime), 0)
        return `${(total / integrationStatuses.length).toFixed(2)}%`
    }, [])

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Centro de Suporte</h2>
                <p className="text-muted-foreground mt-1">
                    Visão em tempo real de tickets, integrações e incidentes críticos.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <OverviewCard
                    title="Tickets abertos"
                    value={openTickets.length}
                    icon={Headphones}
                    description={`${criticalCount} críticos aguardando`}
                    accent="text-blue-600"
                />
                <OverviewCard
                    title="SLA médio"
                    value={`${averageSla} min`}
                    icon={Clock}
                    description="Meta: 30 minutos"
                    accent="text-amber-600"
                />
                <OverviewCard
                    title="Uptime integrações"
                    value={uptimeAverage}
                    icon={Activity}
                    description="Últimas 24 horas"
                    accent="text-emerald-600"
                />
                <OverviewCard
                    title="Alertas ativos"
                    value={incidents.filter(i => i.status !== "resolved").length}
                    icon={AlertTriangle}
                    description="Monitorando incidentes"
                    accent="text-red-600"
                />
            </div>

            <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
                <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <div>
                        <CardTitle>Tickets em atendimento</CardTitle>
                        <p className="text-sm text-muted-foreground">Últimas interações recebidas por canal.</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full gap-2">
                        <LifeBuoy className="w-4 h-4" />
                        Abrir novo ticket
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Assunto</TableHead>
                                <TableHead>Prioridade</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Responsável</TableHead>
                                <TableHead>SLA</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {supportTickets.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-semibold">{ticket.id}</TableCell>
                                    <TableCell>
                                        <p className="font-medium">{ticket.companyName}</p>
                                        <p className="text-xs text-muted-foreground capitalize">{ticket.channel}</p>
                                    </TableCell>
                                    <TableCell className="max-w-[260px]">
                                        <p className="text-sm">{ticket.subject}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={cn(
                                                "border-none",
                                                priorityStyles[ticket.priority]
                                            )}
                                        >
                                            {ticket.priority}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-xs capitalize">
                                            {statusLabels[ticket.status]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm">{ticket.owner}</TableCell>
                                    <TableCell className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                        {ticket.slaMinutes} min
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md lg:col-span-2">
                    <CardHeader className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                        <div>
                            <CardTitle>Integrações & uptime</CardTitle>
                            <p className="text-sm text-muted-foreground">Status atual e histórico de incidentes.</p>
                        </div>
                        <Badge variant="secondary" className="gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            Monitoramento em tempo real
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {integrationStatuses.map((integration) => (
                            <div key={integration.id} className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-sm">{integration.name}</p>
                                    <p className="text-xs text-muted-foreground">{integration.description}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className={cn(
                                        "text-xs capitalize",
                                        integration.status === "online" && "text-emerald-600 border-emerald-200",
                                        integration.status === "degraded" && "text-amber-600 border-amber-200",
                                        integration.status === "offline" && "text-red-600 border-red-200"
                                    )}>
                                        {integration.status}
                                    </Badge>
                                    <p className="text-sm font-semibold text-slate-600 dark:text-zinc-200">{integration.uptime} uptime</p>
                                </div>
                                {integration.lastIncident && (
                                    <p className="text-xs text-amber-600">Último incidente: {integration.lastIncident}</p>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Incidentes recentes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {incidents.map((incident) => (
                            <div key={incident.id} className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold">{incident.title}</p>
                                    <Badge
                                        className={cn(
                                            incident.severity === "high" && "bg-red-100 text-red-600",
                                            incident.severity === "medium" && "bg-amber-100 text-amber-600",
                        incident.severity === "low" && "bg-slate-100 text-slate-600"
                                        )}
                                    >
                                        {incident.severity}
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{new Date(incident.timestamp).toLocaleString("pt-BR")}</p>
                                <p className="text-sm text-slate-600 dark:text-zinc-300">{incident.description}</p>
                                <Badge variant="outline" className="text-xs capitalize">{incident.status}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function OverviewCard({
    title,
    value,
    description,
    icon: Icon,
    accent
}: {
    title: string
    value: string | number
    description: string
    icon: ComponentType<{ className?: string }>
    accent: string
}) {
    return (
        <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md hover:shadow-md transition-shadow">
            <CardHeader className="pb-1">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    <Icon className={cn("w-5 h-5", accent)} />
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    )
}

