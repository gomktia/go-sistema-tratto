"use client"

import { useMemo, useState, useEffect } from "react"
import { differenceInDays } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import { companies, plans, type Company } from "@/mocks/companies"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import {
    Building2,
    DollarSign,
    TrendingUp,
    Users,
    AlertCircle,
    LineChart,
    Gauge,
    AlertTriangle,
    Target
} from "lucide-react"

function calculateActivationScore(company: Company) {
    let score = 0
    if (company.customDomain) score += 25
    if (company.currentEmployees > 0) score += 25
    if (company.currentAppointmentsThisMonth > 0) score += 25
    if (company.monthlyRevenue > 0) score += 25
    return score
}

export default function SuperAdminDashboard() {
    const { user } = useAuth()

    const totalCompanies = companies.length
    const activeCompanies = companies.filter(c => c.status === 'active').length
    const trialCompanies = companies.filter(c => c.status === 'trial').length
    const suspendedCompanies = companies.filter(c => c.status === 'suspended').length

    const mrr = companies
        .filter(c => c.status === 'active')
        .reduce((sum, company) => {
            const plan = plans.find(p => p.id === company.planId)
            return sum + (plan?.price || 0)
        }, 0)

    const avgActivation = Math.round(
        companies.reduce((sum, company) => sum + calculateActivationScore(company), 0) / totalCompanies
    )

    const planBreakdown = plans.map(plan => {
        const planCompanies = companies.filter(c => c.planId === plan.id)
        const adoptionRate = planCompanies.length
            ? Math.round(planCompanies.filter(c => c.currentAppointmentsThisMonth > 0).length / planCompanies.length * 100)
            : 0
        return {
            ...plan,
            companies: planCompanies.length,
            mrr: planCompanies.length * plan.price,
            adoptionRate,
        }
    })

    const activationLeaders = useMemo(() => {
        return [...companies]
            .map(company => ({
                company,
                score: calculateActivationScore(company)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
    }, [])

    const atRiskCompanies = companies.filter(company => {
        if (company.status === 'suspended') return true
        if (company.status === 'trial' && company.trialEndsAt) {
            const days = differenceInDays(new Date(company.trialEndsAt), new Date())
            return days <= 5
        }
        return company.monthlyRevenue < 500
    })


    const [totalClients, setTotalClients] = useState(0)

    useEffect(() => {
        // Fetch total clients across all tenants (Note: this should be an optimized RPC in production)
        const fetchStats = async () => {
            const supabase = getSupabaseBrowserClient()
            if (!supabase) return
            const { count } = await supabase.from('customers').select('*', { count: 'exact', head: true })
            setTotalClients(count || 0)
        }
        fetchStats()
    }, [])

    const stats = [
        {
            label: 'Total de Empresas',
            value: totalCompanies,
            icon: Building2,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100 dark:bg-blue-900/20'
        },
        {
            label: 'Total de Clientes',
            value: totalClients,
            icon: Users,
            color: 'text-green-600',
            bgColor: 'bg-green-100 dark:bg-green-900/20'
        },
        {
            label: 'MRR estimado',
            value: `R$ ${mrr.toLocaleString('pt-BR')}`,
            icon: DollarSign,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100 dark:bg-purple-900/20'
        },
        {
            label: 'Activation médio',
            value: `${avgActivation}%`,
            icon: Gauge,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100 dark:bg-amber-900/20'
        }
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Super Admin</h2>
                <p className="text-muted-foreground mt-1">
                    Bem-vindo, {user?.name}! Monitoramento completo da plataforma.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon
                    return (
                        <Card key={i} className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md hover:shadow-md transition-shadow">
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
                <Card className="lg:col-span-2 rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
                    <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Performance por plano</CardTitle>
                            <p className="text-sm text-muted-foreground">Distribuição de empresas, MRR e adoção.</p>
                        </div>
                        <Badge variant="outline" className="gap-1 text-xs">
                            <LineChart className="w-3 h-3" />
                            Atualizado agora
                        </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {planBreakdown.map(plan => (
                            <div key={plan.id} className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 bg-white/70 dark:bg-zinc-900/70">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold">{plan.name}</p>
                                        <p className="text-xs text-muted-foreground">{plan.companies} empresas • R$ {plan.mrr.toLocaleString('pt-BR')}/m</p>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">Adoção {plan.adoptionRate}%</Badge>
                                </div>
                                <Progress value={plan.adoptionRate} className="mt-3" />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
                    <CardHeader>
                        <CardTitle>Alertas & Recomendações</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {atRiskCompanies.slice(0, 4).map((company) => (
                            <div key={company.id} className="flex items-start gap-3 rounded-2xl border border-slate-100 dark:border-zinc-800 p-3">
                                <AlertTriangle className="w-4 h-4 mt-1 text-amber-500" />
                                <div>
                                    <p className="text-sm font-semibold">{company.fullName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {company.status === 'suspended'
                                            ? "Conta suspensa por falta de pagamento."
                                            : company.status === 'trial'
                                                ? `Trial expira em ${company.trialEndsAt ? differenceInDays(new Date(company.trialEndsAt), new Date()) : 0} dias`
                                                : "Receita abaixo do esperado."}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {atRiskCompanies.length === 0 && (
                            <p className="text-sm text-muted-foreground">Nenhum alerta crítico no momento.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md">
                <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Activation Funnel</CardTitle>
                        <p className="text-sm text-muted-foreground">Top empresas prontas para upsell ou lançamento.</p>
                    </div>
                    <Badge className="gap-1 bg-primary/10 text-primary">
                        <Target className="w-3 h-3" />
                        Meta: 85% até o fim do mês
                    </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                    {activationLeaders.map(({ company, score }) => (
                        <div key={company.id} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 text-white font-black flex items-center justify-center">
                                {company.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm">{company.fullName}</p>
                                    <span className="text-sm font-bold">{score}%</span>
                                </div>
                                <Progress value={score} className="mt-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    {company.currentAppointmentsThisMonth} agendamentos • {company.currentEmployees} colaboradores
                                </p>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {suspendedCompanies > 0 && (
                <Card className="rounded-2xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                            <p className="text-sm text-red-600 dark:text-red-400">
                                <strong>{suspendedCompanies}</strong> empresa(s) suspensa(s) por falta de pagamento
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
