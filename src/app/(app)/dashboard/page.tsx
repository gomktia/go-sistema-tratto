"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useTenant } from "@/contexts/tenant-context"
import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import {
    Calendar,
    TrendingUp,
    Users,
    DollarSign,
    Share2,
    Copy,
    Check,
    Sparkles,
    ArrowUpRight,
    Zap,
    ChevronRight,
    TrendingDown,
    Heart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { OnboardingChecklist } from "@/components/OnboardingChecklist"
import { QuickActions } from "@/components/QuickActions"
import { DailyGoals } from "@/components/DailyGoals"
import { OnboardingWizard } from "@/components/OnboardingWizard"
import { AccountHealthCard } from "@/components/AccountHealthCard"
import { useTenantAppointments } from "@/hooks/useTenantRecords" // Use HOOK instead of mock

export default function DashboardPage() {
    const { currentTenant } = useTenant()
    const { data: appointmentRecords, loading: isLoading } = useTenantAppointments(currentTenant.id)
    const [copied, setCopied] = useState(false)
    const [isWizardOpen, setIsWizardOpen] = useState(false)

    // Calculate Real Stats
    const today = new Date()
    const todayStr = today.toDateString()

    // Safety check for empty data
    const appointments = appointmentRecords || []

    const appointmentsToday = appointments.filter(a => new Date(a.startAt).toDateString() === todayStr)
    // Basic revenue calc (sum of price for valid appointments)
    const incomeToday = appointmentsToday
        .filter(a => a.status === 'confirmed' || a.status === 'completed')
        .reduce((sum, a) => sum + (a.price || 0), 0)

    const incomeMonth = appointments
        .filter(a => {
            const d = new Date(a.startAt)
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && (a.status === 'confirmed' || a.status === 'completed')
        })
        .reduce((sum, a) => sum + (a.price || 0), 0)

    // Rough active clients count (unique names)
    const activeClients = new Set(appointments.map(a => a.customerName)).size

    const realStats = [
        { label: "Agendamentos Hoje", value: appointmentsToday.length.toString(), trend: "+0%", icon: Calendar },
        { label: "Faturamento Hoje", value: `R$ ${incomeToday}`, trend: "+0%", icon: DollarSign },
        { label: "Faturamento Mês", value: `R$ ${incomeMonth}`, trend: "+0%", icon: TrendingUp },
        { label: "Clientes Ativos", value: activeClients.toString(), trend: "+0%", icon: Users },
    ]

    // Prepare Chart Data (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date()
        d.setDate(d.getDate() - (6 - i))
        return d
    })

    const chartData = last7Days.map(date => {
        const dateStr = date.toDateString()
        const dayApts = appointments.filter(a => new Date(a.startAt).toDateString() === dateStr && (a.status === 'confirmed' || a.status === 'completed'))
        const total = dayApts.reduce((sum, a) => sum + (a.price || 0), 0)
        return {
            name: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
            total: total,
            customers: dayApts.length
        }
    })

    const topAppointments = [...appointments]
        .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
        .filter(a => new Date(a.startAt) >= new Date())
        .slice(0, 3)

    const bookingUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${currentTenant.slug}/book`
        : `/${currentTenant.slug}/book`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const insights = [
        {
            title: "Oportunidade de Manhã",
            description: "Você tem horários livres amanhã. Que tal um cupom relâmpago?",
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: "Serviço em Alta",
            description: "Corte e Hidratação teve um aumento na procura esta semana.",
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Lembrete de Recompra",
            description: "5 clientes completam 30 dias desde a última visita.",
            icon: Heart,
            color: "text-pink-500",
            bg: "bg-pink-500/10"
        },
    ]

    if (isLoading) {
        return <div className="p-10 text-center text-muted-foreground">Carregando dados do painel...</div>
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">Visão Geral</h2>
                    <p className="text-gray-600 dark:text-zinc-400 font-medium mt-1">Insights e performance da {currentTenant.name}.</p>
                </div>

                <Card className="flex items-center gap-4 px-6 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 shadow-lg rounded-2xl relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0 pr-4 relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Link de Agendamento</p>
                        <p className="text-sm font-bold truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{bookingUrl}</p>
                    </div>
                    <Button
                        size="sm"
                        onClick={copyToClipboard}
                        className="rounded-xl h-10 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shrink-0 hover:scale-105 transition-all active:scale-95 shadow-lg shadow-blue-500/30 relative z-10"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <OnboardingChecklist
                    tenant={currentTenant}
                    className="mt-2"
                    onStartWizard={() => setIsWizardOpen(true)}
                />
                <AccountHealthCard tenantId={currentTenant.id} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <QuickActions />
                <DailyGoals tenantId={currentTenant.id} />
            </div>

            <OnboardingWizard
                open={isWizardOpen}
                onOpenChange={setIsWizardOpen}
                tenant={currentTenant}
            />

            {/* Strategic Insights Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.map((insight, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className="p-5 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 group cursor-pointer hover:shadow-lg hover:border-gray-200 transition-all">
                            <div className="flex gap-4">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", insight.bg)}>
                                    <insight.icon className={cn("w-6 h-6", insight.color)} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                                        {insight.title}
                                        <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h4>
                                    <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{insight.description}</p>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {realStats.map((stat, i) => (
                    <Card key={i} className="p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm hover:shadow-lg bg-white dark:bg-zinc-900 transition-all hover:border-gray-200">
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-4xl font-black bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">{stat.value}</h3>
                            <div className={cn(
                                "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
                                stat.trend.startsWith('+') ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
                            )}>
                                {stat.trend.startsWith('+') ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                {stat.trend}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Visual Chart */}
                <Card className="lg:col-span-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Performance de Vendas</h3>
                            <p className="text-xs text-slate-500 font-medium">Movimentação financeira dos últimos 7 dias.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Faturamento</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#cbd5e1"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    fontWeight="bold"
                                />
                                <YAxis
                                    stroke="#cbd5e1"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(v) => `R$${v}`}
                                    fontWeight="bold"
                                />
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-slate-900 p-4 rounded-2xl shadow-2xl border-none">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{payload[0].payload.name}</p>
                                                    <p className="text-xl font-black text-white">R$ {payload[0].value?.toLocaleString('pt-BR')}</p>
                                                    <p className="text-[10px] font-bold text-primary uppercase mt-1">{payload[0].payload.customers} atendimentos</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Status Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Agora no Salão</h3>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </div>

                        <div className="space-y-6">
                            {topAppointments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">Nenhum agendamento futuro.</p>
                            ) : (
                                topAppointments.map((apt, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                {apt.customerName?.charAt(0) || "C"}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{apt.customerName || "Cliente"}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate max-w-[120px]">{apt.serviceName ?? "Serviço"}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-slate-900 dark:text-white">
                                                {new Date(apt.startAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                            <Badge className={cn(
                                                "mt-1 text-[8px] font-bold uppercase border-none",
                                                apt.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-500" :
                                                    apt.status === 'completed' ? "bg-slate-100 text-slate-400" : "bg-primary/10 text-primary"
                                            )}>
                                                {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'completed' ? 'Finalizado' : 'Em breve'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Button variant="ghost" className="w-full mt-8 rounded-2xl font-bold text-slate-400 hover:text-primary">
                            Visualizar Agenda Completa <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Card>

                    {/* Pro Tip - Can remain static for now (global tip) */}
                    <Card className="p-6 sm:p-8 rounded-[2.5rem] bg-slate-900 text-white relative overflow-hidden">
                        <Sparkles className="absolute top-4 right-4 w-6 h-6 text-primary" />
                        <div className="relative z-10 space-y-4">
                            <h4 className="font-black text-lg leading-tight">Dica do Dia</h4>
                            <p className="text-xs text-slate-400 leading-relaxed italic">&ldquo;Clientes que compram o Shampoo Premium voltam 24% mais vezes. Ofereça no fechamento!&rdquo;</p>
                            <Button className="w-full h-12 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100">
                                Ver Relatório de Recompra
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
