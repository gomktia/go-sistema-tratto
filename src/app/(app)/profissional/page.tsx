"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    ArrowUpRight,
    Bell,
    BellRing,
    Calendar,
    CheckCircle2,
    ClipboardCheck,
    Hand,
    MessageCircle,
    Pause,
    Play,
    Sparkles,
    Star,
    TrendingUp
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useTenant } from "@/contexts/tenant-context"

const upcomingClients = [
    { id: 2, customer: "Juliana Silva", service: "Corte + finishing", time: "16:45", status: "aguardando" },
    { id: 3, customer: "Carla Souza", service: "Penteado Social", time: "18:00", status: "confirmada" },
]

const quickShortcuts = [
    { id: "sale", title: "Registrar venda", helper: "PDV express" },
    { id: "note", title: "Adicionar nota", helper: "Lembretes do cliente" },
    { id: "pix", title: "Gerar link Pix", helper: "Pagamento instantâneo" },
    { id: "review", title: "Solicitar avaliação", helper: "Envia WhatsApp" },
]

const notificationPulse = [
    { id: "pix", title: "Pix recebido", detail: "R$ 180 de Bruna", tone: "emerald" },
    { id: "arrival", title: "Cliente chegou", detail: "Eduardo está na recepção", tone: "blue" },
    { id: "gap", title: "Janela liberada", detail: "17h10 disponível (30m)", tone: "amber" },
]

export default function ProfessionalDashboard() {
    const router = useRouter()
    const { user } = useAuth()
    const { currentTenant } = useTenant()

    const [timerActive, setTimerActive] = useState(false)
    const [seconds, setSeconds] = useState(0)
    const [focusMode, setFocusMode] = useState(false)
    const [currentService] = useState({
        id: 1,
        customer: "Ana Ferreira",
        service: "Mechas + Hidratação",
        time: "14:30 - 16:30",
        duration: 120,
    })

    useEffect(() => {
        let interval: NodeJS.Timeout | undefined
        if (timerActive) {
            interval = setInterval(() => {
                setSeconds(prev => prev + 1)
            }, 1000)
        }
        return () => interval && clearInterval(interval)
    }, [timerActive])

    const formatTime = (totalSeconds: number) => {
        const hrs = Math.floor(totalSeconds / 3600)
        const mins = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60
        return `${hrs > 0 ? `${hrs}:` : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    const progress = Math.min((seconds / (currentService.duration * 60)) * 100, 100)

    const timeline = useMemo(() => {
        const base = [
            {
                id: "now",
                customer: currentService.customer,
                service: currentService.service,
                time: "Agora",
                status: timerActive ? "em_atendimento" : "pausado",
            },
            ...upcomingClients.map(client => ({
                id: client.id,
                customer: client.customer,
                service: client.service,
                time: client.time,
                status: client.status === "aguardando" ? "aguardando" : "confirmada"
            }))
        ]
        return base
    }, [timerActive, currentService.customer, currentService.service])

    const statusStyles: Record<string, string> = {
        em_atendimento: "bg-emerald-500/10 text-emerald-600",
        pausado: "bg-amber-500/10 text-amber-600",
        aguardando: "bg-blue-500/10 text-blue-600",
        confirmada: "bg-slate-500/10 text-slate-600",
    }

    const handleNavigation = (path: string) => {
        const tenantPath = currentTenant ? `/${currentTenant.slug}` : '/demo'
        router.push(`${tenantPath}/profissional${path}`)
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black p-4 pb-32 md:p-8 flex flex-col items-center">
            <div className="w-full max-w-md space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-slate-900 dark:text-white">Olá, {user?.name || 'Profissional'}</h2>
                            <Hand className="w-4 h-4 text-primary" />
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vista profissional</p>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full bg-white dark:bg-zinc-900 shadow-sm relative">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-900" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4 rounded-[1.5rem] border-none shadow-sm bg-primary text-white space-y-1">
                        <TrendingUp className="w-4 h-4 text-white/70" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Ganhos do dia</p>
                        <p className="text-lg font-black font-mono">R$ 420,00</p>
                        <p className="text-[10px] uppercase tracking-widest text-white/70">+R$ 180 Pix agora</p>
                    </Card>
                    <Card className="p-4 rounded-[1.5rem] border-none shadow-sm bg-white dark:bg-zinc-900 space-y-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avaliação</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">4.9/5.0</p>
                        <p className="text-[10px] text-slate-500">+12 avaliações esta semana</p>
                    </Card>
                </div>

                <Card className="p-6 rounded-[2rem] border-none shadow-2xl bg-white dark:bg-zinc-900 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <Badge className={cn("border-none font-bold text-[10px] uppercase", timerActive ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-600")}>
                            {timerActive ? "Em andamento" : "Pausado"}
                        </Badge>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-1">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{currentService.customer}</h3>
                            <p className="text-sm font-bold text-primary">{currentService.service}</p>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">{currentService.time}</p>
                        </div>

                        <div className="flex flex-col items-center py-6 space-y-4">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                <svg className="w-full h-full -rotate-90">
                                    <circle cx="80" cy="80" r="75" className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="8" fill="transparent" />
                                    <motion.circle
                                        cx="80"
                                        cy="80"
                                        r="75"
                                        className="stroke-primary"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={471}
                                        initial={{ strokeDashoffset: 471 }}
                                        animate={{ strokeDashoffset: 471 - (471 * progress) / 100 }}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-3xl font-mono font-black text-slate-900 dark:text-white">{formatTime(seconds)}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">decorrido</span>
                                </div>
                            </div>

                            <div className="flex gap-4 w-full">
                                {!timerActive ? (
                                    <Button onClick={() => setTimerActive(true)} className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800">
                                        <Play className="w-4 h-4 mr-2 fill-current" /> Iniciar
                                    </Button>
                                ) : (
                                    <Button onClick={() => setTimerActive(false)} variant="outline" className="flex-1 h-14 rounded-2xl border-slate-200 font-bold">
                                        <Pause className="w-4 h-4 mr-2 fill-current" /> Pausar
                                    </Button>
                                )}
                                <Button className="flex-1 h-14 rounded-2xl bg-primary text-white font-bold">
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Finalizar
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/90 dark:bg-zinc-900/80 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70">Fluxo em tempo real</p>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Linha do tempo</h3>
                        </div>
                        <Badge variant="outline" className="rounded-full text-[10px]">
                            {timeline.length} eventos
                        </Badge>
                    </div>
                    <div className="space-y-3">
                        {timeline.map(event => (
                            <div key={event.id} className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-zinc-800 p-3">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.customer}</p>
                                    <p className="text-xs text-muted-foreground">{event.service}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-slate-500">{event.time}</p>
                                    <Badge className={cn("mt-1", statusStyles[event.status])}>
                                        {event.status === "em_atendimento" && "Em atendimento"}
                                        {event.status === "pausado" && "Pausado"}
                                        {event.status === "aguardando" && "Aguardando"}
                                        {event.status === "confirmada" && "Confirmada"}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/90 dark:bg-zinc-900/80 p-5 space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70">Alertas inteligentes</p>
                            <h3 className="text-lg font-black">Pulso em tempo real</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setFocusMode(!focusMode)} className={cn("rounded-full text-xs font-bold", focusMode ? "text-emerald-600" : "text-slate-500")}>
                            {focusMode ? "Modo foco ativo" : "Ativar foco"}
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {notificationPulse.map((alert) => (
                            <div key={alert.id} className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-3">
                                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white", alert.tone === "emerald" ? "bg-emerald-500" : alert.tone === "blue" ? "bg-blue-500" : "bg-amber-500")}>
                                    {alert.id === "pix" && <Sparkles className="w-4 h-4" />}
                                    {alert.id === "arrival" && <BellRing className="w-4 h-4" />}
                                    {alert.id === "gap" && <Calendar className="w-4 h-4" />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{alert.title}</p>
                                    <p className="text-xs text-muted-foreground">{alert.detail}</p>
                                </div>
                                <ArrowUpRight className="ml-auto w-4 h-4 text-slate-300" />
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/90 dark:bg-zinc-900/80 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Ações rápidas</h3>
                        <Badge variant="secondary" className="rounded-full">Atalhos</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        {quickShortcuts.map(action => (
                            <Button
                                key={action.id}
                                variant="outline"
                                className="h-16 rounded-2xl flex flex-col items-start justify-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-all"
                                onClick={() => {
                                    if (action.id === 'sale') handleNavigation('/financeiro')
                                    else if (action.id === 'note') handleNavigation('/clientes')
                                    else if (action.id === 'pix') handleNavigation('/financeiro')
                                    else if (action.id === 'review') handleNavigation('/clientes')
                                    else alert("Funcionalidade em desenvolvimento: " + action.title)
                                }}
                            >
                                <span className="text-sm font-semibold text-slate-900 dark:text-white">{action.title}</span>
                                <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{action.helper}</span>
                            </Button>
                        ))}
                    </div>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/90 dark:bg-zinc-900/80 p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.3em] text-primary/70">Próximos clientes</p>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Fila organizada</h3>
                        </div>
                        <Button variant="ghost" className="text-xs font-bold text-primary p-0" onClick={() => handleNavigation('/agenda')}>Ver tudo</Button>
                    </div>
                    <div className="space-y-3">
                        {upcomingClients.map(item => (
                            <Card key={item.id} className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900 flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-zinc-800 flex flex-col items-center justify-center">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Hoje</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">{item.time}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{item.customer}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.service}</p>
                                    </div>
                                </div>
                                <ClipboardCheck className="w-5 h-5 text-slate-200 group-hover:text-primary transition-colors" />
                            </Card>
                        ))}
                    </div>
                </Card>
            </div>

            <p className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <MessageCircle className="w-3 h-3" /> Mobile Experience by BeautyFlow
            </p>
        </div>
    )
}
