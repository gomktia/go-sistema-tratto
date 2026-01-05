"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { appointments } from "@/mocks/data"
import { services } from "@/mocks/services"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Target, Sparkles, ArrowRight } from "lucide-react"

interface DailyGoalsProps {
    tenantId: string
    className?: string
}

const TARGETS = {
    appointments: 18,
    revenue: 3500,
    satisfaction: 90,
}

export function DailyGoals({ tenantId, className }: DailyGoalsProps) {
    const today = new Date()

    const { totalAppointments, completedAppointments, todaysRevenue } = useMemo(() => {
        const todays = appointments.filter((apt) => {
            if (apt.tenantId !== tenantId) return false
            const aptDate = new Date(apt.date)
            return (
                aptDate.getDate() === today.getDate() &&
                aptDate.getMonth() === today.getMonth() &&
                aptDate.getFullYear() === today.getFullYear()
            )
        })

        const completed = todays.filter((apt) => apt.status === "completed")
        const revenue = todays.reduce((sum, apt) => {
            const service = services.find((service) => service.id === apt.serviceId)
            return sum + (service?.price ?? 0)
        }, 0)

        return {
            totalAppointments: todays.length,
            completedAppointments: completed.length,
            todaysRevenue: revenue,
        }
    }, [tenantId, today])

    const appointmentProgress = Math.min(
        100,
        Math.round((totalAppointments / TARGETS.appointments) * 100)
    )
    const revenueProgress = Math.min(
        100,
        Math.round((todaysRevenue / TARGETS.revenue) * 100)
    )
    const satisfaction = TARGETS.satisfaction // Placeholder até termos dados reais

    const insights = [
        {
            title: "Slot nobre ainda livre",
            description: "Há um horário premium das 19h sem agendamento. Sugerir pacote VIP por WhatsApp.",
            accent: "text-primary",
        },
        {
            title: "Clientes recorrentes",
            description: "3 clientes VIP ainda não confirmaram. Envie lembrete personalizado.",
            accent: "text-emerald-500",
        },
    ]

    return (
        <Card className={cn("rounded-[2rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6", className)}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
                        Foco operacional • {format(today, "EEEE, dd 'de' MMM", { locale: ptBR })}
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Metas do dia</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                        Acompanhe o progresso em tempo real e acione o time com um clique.
                    </p>
                </div>
                <Button variant="ghost" className="gap-2 text-xs font-black uppercase tracking-widest">
                    <Target className="w-4 h-4" />
                    Ajustar metas
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <GoalCard
                    label="Agendamentos do dia"
                    progress={appointmentProgress}
                    value={`${totalAppointments}/${TARGETS.appointments}`}
                    trend={totalAppointments - completedAppointments}
                    trendLabel="pendentes"
                    positive={false}
                />
                <GoalCard
                    label="Faturamento previsto"
                    progress={revenueProgress}
                    value={`R$ ${todaysRevenue.toLocaleString("pt-BR")}`}
                    trend={TARGETS.revenue - todaysRevenue}
                    trendLabel="restantes"
                    positive={true}
                />
                <GoalCard
                    label="Satisfação estimada"
                    progress={satisfaction}
                    value={`${satisfaction}%`}
                    trend={4}
                    trendLabel="promoters a mais"
                    positive={true}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Insights acionáveis</p>
                            <h4 className="font-black text-slate-900 dark:text-white">Onde agir primeiro</h4>
                        </div>
                        <Badge variant="outline" className="text-[10px] uppercase tracking-widest border-slate-200 dark:border-zinc-700">
                            Atualizado há 3 min
                        </Badge>
                    </div>
                    <div className="space-y-3">
                        {insights.map((insight, index) => (
                            <motion.div
                                key={insight.title}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03]"
                            >
                                <p className={cn("text-sm font-black", insight.accent)}>{insight.title}</p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">{insight.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-gradient-to-br from-primary/10 to-purple-500/10 p-5 flex flex-col justify-between">
                    <div className="space-y-3">
                        <Badge className="bg-white/80 text-primary border-none text-[10px] tracking-widest uppercase">
                            Missão relâmpago
                        </Badge>
                        <h4 className="text-xl font-black text-slate-900 dark:text-white">
                            Fechar 5 upgrades até às 18h
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-zinc-300">
                            Sugestão: ofereça hidratação express pós-serviço para quem reservar hoje.
                        </p>
                    </div>
                    <Button className="mt-4 rounded-xl gap-2 font-black">
                        Acionar equipe
                        <Sparkles className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    )
}

function GoalCard({
    label,
    value,
    progress,
    trend,
    trendLabel,
    positive,
}: {
    label: string
    value: string
    progress: number
    trend: number
    trendLabel: string
    positive: boolean
}) {
    return (
        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-5">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">{label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 mt-4 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs font-bold uppercase tracking-widest">
                {positive ? (
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                    <TrendingDown className="w-3 h-3 text-amber-500" />
                )}
                <span className={positive ? "text-emerald-500" : "text-amber-500"}>
                    {positive ? "+" : "-"}
                    {Math.abs(trend)} {trendLabel}
                </span>
            </div>
        </div>
    )
}

