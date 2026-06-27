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
import { cn, formatCurrency } from "@/lib/utils"
// Note: These components might need adaptation if they use specific contexts, checking them later if needed
// For now, I'll comment out complex sub-components to ensure the page loads, and add them back progressively or replace with simple UI
// import { QuickActions } from "@/components/QuickActions"
// import { DailyGoals } from "@/components/DailyGoals"

import { useTenantAppointments } from "@/hooks/useTenantRecords"

export default function TenantDashboardPage() {
    const { currentTenant } = useTenant()

    // If we don't have a tenant yet (loading), show skeleton
    if (!currentTenant) {
        return <div className="min-h-screen flex items-center justify-center">Carregando painel...</div>
    }

    const { data: appointmentRecords, loading: isLoading } = useTenantAppointments(currentTenant.id)
    const [copied, setCopied] = useState(false)

    // Calculate Real Stats
    const today = new Date()
    const todayStr = today.toDateString()
    const appointments = appointmentRecords || []

    const appointmentsToday = appointments.filter(a => new Date(a.startAt).toDateString() === todayStr)
    const incomeToday = appointmentsToday
        .filter(a => a.status === 'confirmed' || a.status === 'completed')
        .reduce((sum, a) => sum + (a.price || 0), 0)

    const incomeMonth = appointments
        .filter(a => {
            const d = new Date(a.startAt)
            return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear() && (a.status === 'confirmed' || a.status === 'completed')
        })
        .reduce((sum, a) => sum + (a.price || 0), 0)

    const activeClients = new Set(appointments.map(a => a.customerName)).size

    const realStats = [
        { label: "Agendamentos Hoje", value: appointmentsToday.length.toString(), trend: "+5%", icon: Calendar },
        { label: "Faturamento Hoje", value: formatCurrency(incomeToday), trend: "+12%", icon: DollarSign },
        { label: "Faturamento Mês", value: formatCurrency(incomeMonth), trend: "+8%", icon: TrendingUp },
        { label: "Clientes Ativos", value: activeClients.toString(), trend: "+2%", icon: Users },
    ]

    // Chart Data (Last 7 Days)
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
        .slice(0, 5)

    const bookingUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/${currentTenant.slug}/book`
        : `https://tratto.app/${currentTenant.slug}/book`

    const copyToClipboard = () => {
        navigator.clipboard.writeText(bookingUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const insights = [
        {
            title: "Oportunidade Manhã",
            description: "Você tem horários livres amanhã de manhã. Crie uma oferta!",
            icon: Zap,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
        {
            title: "Serviço em Alta",
            description: "Hidratação Profunda teve um aumento de 30% na procura.",
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Retenção",
            description: "5 clientes completam 30 dias sem visita. Chame-os no WhatsApp.",
            icon: Heart,
            color: "text-pink-500",
            bg: "bg-pink-500/10"
        },
    ]

    return (
        <div className="space-y-8 pb-10 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Visão Geral</h2>
                    <p className="text-gray-600 dark:text-zinc-400 font-medium mt-1">Bem-vindo(a) ao painel da {currentTenant.name}.</p>
                </div>

                <Card className="flex items-center gap-4 px-6 py-4 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 shadow-lg rounded-2xl relative overflow-hidden group hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0 pr-4 relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Seu Link de Agendamento</p>
                        <p className="text-xs font-bold truncate bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{bookingUrl}</p>
                    </div>
                    <Button
                        size="sm"
                        onClick={copyToClipboard}
                        className="rounded-xl h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold shrink-0 shadow-lg relative z-10"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </Card>
            </div>

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
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
                            <div className={cn(
                                "flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full",
                                stat.trend.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
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
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-900" />
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">Total</span>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    stroke="#94a3b8"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                    fontWeight="bold"
                                />
                                <YAxis
                                    stroke="#94a3b8"
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
                                                    <p className="text-[10px] font-bold text-emerald-400 uppercase mt-1">{payload[0].payload.customers} atendimentos</p>
                                                </div>
                                            )
                                        }
                                        return null
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#0f172a"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Next Appointments */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 sm:p-8 min-h-[400px]">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">Agenda Hoje</h3>
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </div>

                        <div className="space-y-6">
                            {appointmentsToday.length === 0 ? (
                                <div className="text-center py-10">
                                    <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                                    <p className="text-sm text-slate-400">Agenda livre hoje!</p>
                                </div>
                            ) : (
                                topAppointments.map((apt, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-slate-400">
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
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <Button variant="ghost" className="w-full mt-8 rounded-2xl font-bold text-slate-400 hover:text-slate-900">
                            Ver Agenda Completa <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
