 "use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { appointments, services, clients } from "@/mocks/data"
import { useTenant } from "@/contexts/tenant-context"
import { useAuth } from "@/contexts/auth-context"
import {
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle,
    Calendar,
    Users,
    Activity,
    Coffee,
    BellRing,
    MessageSquare
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const quickActions = ["Registrar venda", "Adicionar nota", "Enviar lembrete", "Gerar link Pix"]
const liveSignals = [
    { id: "pix", title: "Pix recebido", detail: "R$ 180 • Cliente Bruna", tone: "emerald" },
    { id: "arrival", title: "Cliente chegou", detail: "Eduardo já está na recepção", tone: "blue" },
    { id: "gap", title: "Janela liberada", detail: "17h10 disponível por 30min", tone: "amber" },
] as const

export default function ProfissionalDashboard() {
    const { currentTenant } = useTenant()
    const { user } = useAuth()

    // Filter appointments for the logged-in professional only
    const todayAppointments = useMemo(() => {
        if (!user) return []

        return appointments
            .filter(apt =>
                apt.tenantId === currentTenant.id &&
                apt.staffId === user.id // Only show this professional's appointments
            )
            .map(apt => ({
                ...apt,
                service: services.find(service => service.id === apt.serviceId),
            }))
    }, [currentTenant.id, user])

    const timelineEvents = useMemo(() => (
        todayAppointments
            .map(apt => ({
                id: apt.id,
                customer: apt.customer,
                service: apt.service?.name ?? "Serviço",
                time: apt.time,
                status: apt.status,
            }))
            .slice(0, 5)
    ), [todayAppointments])

    const vipClients = useMemo(() => (
        clients
            .filter(client => client.tenantId === currentTenant.id)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 3)
    ), [currentTenant.id])

    const metrics = useMemo(() => ({
        revenue: 580,
        tips: 120,
        completion: 78,
        retention: "+12%",
    }), [])

    const statusMap: Record<string, { label: string, className: string }> = {
        confirmed: { label: "Confirmado", className: "bg-blue-500/10 text-blue-600" },
        completed: { label: "Concluído", className: "bg-emerald-500/10 text-emerald-600" },
        scheduled: { label: "Aguardando", className: "bg-amber-500/10 text-amber-600" },
        pending: { label: "Pendente", className: "bg-slate-500/10 text-slate-600" },
    }

    return (
        <div className="space-y-6 pb-20">
            <header className="space-y-1">
                <p className="text-xs uppercase tracking-[0.4em] text-primary/60">Vista profissional</p>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Bem-vindo, {user?.name}</h1>
                <p className="text-sm text-muted-foreground">
                    Seu cockpit diário: metas, agenda e sinais inteligentes.
                </p>
            </header>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard icon={DollarSign} label="Faturado hoje" value={`R$ ${metrics.revenue}`} footer="+R$ 350 em metas" />
                <MetricCard icon={TrendingUp} label="Metas batidas" value={`${metrics.completion}%`} footer="Meta diária 90%" progressValue={metrics.completion} />
                <MetricCard icon={Clock} label="Horas em serviço" value="5h 40m" footer="2h livres a partir das 16h" />
                <MetricCard icon={Users} label="Retenção" value={metrics.retention} footer="Clientes recorrentes da semana" />
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <Card className="rounded-[2rem] border-none shadow-lg bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Linha do dia</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {timelineEvents.map(event => {
                            const status = statusMap[event.status] ?? statusMap.confirmed
                            return (
                                <div key={event.id} className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{event.customer}</p>
                                            <p className="text-xs uppercase tracking-widest text-muted-foreground">{event.service}</p>
                                        </div>
                                        <Badge className={status.className}>{status.label}</Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-3 h-3" />
                                        {event.time}
                                    </div>
                                </div>
                            )
                        })}
                        {timelineEvents.length === 0 && (
                            <p className="text-sm text-muted-foreground">Sem compromissos para hoje.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-lg bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Metas e comissões</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-xs uppercase text-muted-foreground">Meta do dia</p>
                            <p className="text-lg font-bold">R$ 950 / R$ 1.200</p>
                            <Progress value={80} className="mt-2" />
                            <p className="text-xs text-muted-foreground">faltam R$ 250 para +10% de bônus</p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 space-y-2">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold">Comissão prevista</p>
                                <p className="text-sm font-bold text-primary">R$ 340</p>
                            </div>
                            <p className="text-xs text-muted-foreground">4 serviços concluídos • 1 upsell em andamento</p>
                            <Button variant="outline" size="sm" className="w-full rounded-xl mt-2">Ver detalhes</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-lg bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Check-in & bem-estar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button className="w-full h-12 rounded-2xl gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Iniciar expediente
                        </Button>
                        <Button variant="outline" className="w-full h-12 rounded-2xl gap-2">
                            <Coffee className="w-4 h-4" />
                            Registrar intervalo
                        </Button>
                        <Button variant="secondary" className="w-full h-12 rounded-2xl gap-2">
                            <Calendar className="w-4 h-4" />
                            Finalizar dia
                        </Button>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Ações rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-3">
                        {quickActions.map(action => (
                            <Button key={action} variant="outline" className="h-12 rounded-2xl justify-start">
                                {action}
                            </Button>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Clientes que amam você</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {vipClients.map(client => (
                            <div key={client.id} className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{client.name}</p>
                                    <p className="text-xs text-muted-foreground">Ticket médio R$ {client.totalSpent.toFixed(2)}</p>
                                </div>
                                <Badge variant="secondary" className="rounded-full">
                                    {client.status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Sinais em tempo real</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {liveSignals.map(signal => (
                            <div key={signal.id} className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${signal.tone === "emerald" ? "bg-emerald-500" : signal.tone === "blue" ? "bg-blue-500" : "bg-amber-500"}`}>
                                    {signal.id === "pix" && <Activity className="w-4 h-4" />}
                                    {signal.id === "arrival" && <BellRing className="w-4 h-4" />}
                                    {signal.id === "gap" && <Clock className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{signal.title}</p>
                                    <p className="text-xs text-muted-foreground">{signal.detail}</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Notas rápidas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 space-y-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Bruna Pires</p>
                            <p className="text-xs text-muted-foreground">Prefere finalização ondulada • traz referência pelo WhatsApp</p>
                        </div>
                        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 space-y-2">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Eduardo Ramos</p>
                            <p className="text-xs text-muted-foreground">Chegou 10 min antes • oferecer esfoliação do couro</p>
                        </div>
                        <Button variant="ghost" className="w-full rounded-2xl gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Registrar nova nota
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

function MetricCard({ icon: Icon, label, value, footer, progressValue }: { icon: LucideIcon, label: string, value: string, footer: string, progressValue?: number }) {
    return (
        <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
            <CardContent className="py-5 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
                {typeof progressValue === "number" && <Progress value={progressValue} className="h-1.5" />}
                <p className="text-xs text-muted-foreground">{footer}</p>
            </CardContent>
        </Card>
    )
}

