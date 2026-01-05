"use client"

import { companies, plans } from "@/mocks/companies"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
    DollarSign,
    TrendingUp,
    AlertTriangle,
    CreditCard,
    RefreshCw,
    Download,
    Wallet,
    ShieldAlert
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { useMemo } from "react"

const mockInvoices = [
    { id: "INV-202401", company: "Beleza Pura", amount: 197, status: "paid", method: "pix", due: "2024-12-25" },
    { id: "INV-202402", company: "Studio Glamour", amount: 497, status: "paid", method: "card", due: "2024-12-24" },
    { id: "INV-202403", company: "Espaço Elegance", amount: 97, status: "pending", method: "boleto", due: "2024-12-20" },
    { id: "INV-202404", company: "Barber Lab", amount: 197, status: "failed", method: "card", due: "2024-12-18" },
]

const mockCollections = [
    { label: "PIX", value: 52 },
    { label: "Cartão Crédito", value: 35 },
    { label: "Boleto", value: 13 },
]

export default function FinanceiroPage() {
    const mrr = useMemo(() => (
        companies
            .filter(c => c.status === 'active')
            .reduce((sum, company) => {
                const plan = plans.find(p => p.id === company.planId)
                return sum + (plan?.price || 0)
            }, 0)
    ), [])

    const totalRevenue = mrr * 12
    const activeSubscriptions = companies.filter(c => c.status === 'active').length
    const pendingPayments = companies.filter(c => c.status === 'suspended').length

    const revenueData = [
        { month: 'Jan', revenue: 291 },
        { month: 'Fev', revenue: 291 },
        { month: 'Mar', revenue: 488 },
        { month: 'Abr', revenue: 488 },
        { month: 'Mai', revenue: 488 },
        { month: 'Jun', revenue: 685 },
        { month: 'Jul', revenue: 685 },
        { month: 'Ago', revenue: 685 },
        { month: 'Set', revenue: 685 },
        { month: 'Out', revenue: 685 },
        { month: 'Nov', revenue: 685 },
        { month: 'Dez', revenue: 685 }
    ]

    const planDistribution = plans.map(plan => ({
        name: plan.name,
        subscribers: companies.filter(c => c.planId === plan.id && c.status === 'active').length,
        revenue: companies
            .filter(c => c.planId === plan.id && c.status === 'active')
            .reduce((sum) => sum + plan.price, 0)
    }))

    const stats = [
        {
            label: 'MRR (Receita Mensal)',
            value: `R$ ${mrr.toLocaleString('pt-BR')}`,
            icon: DollarSign,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20'
        },
        {
            label: 'Receita Anual (Projeção)',
            value: `R$ ${totalRevenue.toLocaleString('pt-BR')}`,
            icon: TrendingUp,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20'
        },
        {
            label: 'Assinaturas Ativas',
            value: activeSubscriptions,
            icon: CreditCard,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20'
        },
        {
            label: 'Pagamentos Pendentes',
            value: pendingPayments,
            icon: AlertTriangle,
            color: 'text-red-600',
            bgColor: 'bg-red-100 dark:bg-red-900/20'
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Financeiro da Plataforma</h2>
                    <p className="text-muted-foreground mt-1">
                        Monitoramento completo de receitas, cobranças e inadimplência.
                    </p>
                </div>
                <Button className="gap-2 rounded-full">
                    <Download className="w-4 h-4" />
                    Exportar CSV
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <Card key={i} className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {stat.label}
                                    </CardTitle>
                                    <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                                        <Icon className={`w-5 h-5 ${stat.color}`} />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Evolução da Receita</CardTitle>
                        <CardDescription>Receita mensal recorrente ao longo do ano</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="month"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `R$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="revenue"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Coletas por método</CardTitle>
                        <CardDescription>Resumo da última semana</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {mockCollections.map(collection => (
                            <div key={collection.label} className="flex items-center gap-4">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{collection.label}</p>
                                    <Progress value={collection.value} className="h-2 mt-1" />
                                </div>
                                <p className="text-sm font-bold text-slate-700 dark:text-white">{collection.value}%</p>
                            </div>
                        ))}
                        <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 space-y-2">
                            <p className="text-xs text-muted-foreground uppercase tracking-widest">Recomendações</p>
                            <p className="text-sm text-slate-600 dark:text-zinc-300">Ofereça 10% OFF no upgrade anual para boletos pendentes há mais de 5 dias.</p>
                            <Button variant="outline" size="sm" className="rounded-full">Ver playbook</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Distribuição por Plano</CardTitle>
                        <CardDescription>Receita por plano ativo</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={planDistribution}>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                                    <YAxis stroke="#888888" fontSize={12} />
                                    <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 30px rgba(0,0,0,0.08)" }} />
                                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                        <div>
                            <CardTitle>Invoices recentes</CardTitle>
                            <CardDescription>Cobranças monitoradas</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" className="rounded-full gap-2">
                            <RefreshCw className="w-4 h-4" />
                            Atualizar
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {mockInvoices.map(invoice => (
                            <div key={invoice.id} className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-zinc-800 p-4">
                                <div>
                                    <p className="text-sm font-semibold">{invoice.company}</p>
                                    <p className="text-xs text-muted-foreground">{invoice.id} • vence {invoice.due}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">R$ {invoice.amount.toFixed(2)}</p>
                                    <Badge className="mt-1 capitalize" variant="secondary">
                                        {invoice.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                <CardHeader>
                    <CardTitle>Alertas e ações</CardTitle>
                    <CardDescription>Priorize dunning, ofertas e suporte</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: "Trials acabando", value: "6 empresas", action: "Enviar oferta Professional" },
                        { label: "Pendências +5 dias", value: "3 invoices", action: "Rodar playbook PIX" },
                        { label: "Chargebacks", value: "1 caso", action: "Abrir ticket financeiro" },
                        { label: "MRR em risco", value: "R$ 1.091", action: "Priorizar dunning" }
                    ].map(alert => (
                        <div key={alert.label} className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{alert.label}</p>
                            <p className="text-xl font-black text-slate-900 dark:text-white">{alert.value}</p>
                            <p className="text-xs text-primary font-semibold">{alert.action}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
