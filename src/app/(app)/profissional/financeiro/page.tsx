"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { DollarSign, Wallet, BarChart2, Download, ArrowUpRight, ShieldCheck, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useTenant } from "@/contexts/tenant-context"
import { useTenantAppointments, useTenantEmployees } from "@/hooks/useTenantRecords"

export default function ProfissionalFinanceiroPage() {
    const { user } = useAuth()
    const { currentTenant } = useTenant()

    // Fetch data hook
    const { data: appointments, loading: loadingApts } = useTenantAppointments(currentTenant.id)
    const { data: employees, loading: loadingEmps } = useTenantEmployees(currentTenant.id)

    // Derived State
    const currentEmployee = useMemo(() => {
        if (!employees || !user) return null
        return employees.find(e => e.email === user.email)
    }, [employees, user])

    const commissionRate = useMemo(() => {
        return currentEmployee?.commissionRate ? (currentEmployee.commissionRate / 100) : 0.5 // Default 50% if not set
    }, [currentEmployee])

    const myAppointments = useMemo(() => {
        if (!appointments || !currentEmployee) return []
        return appointments.filter(apt => apt.employeeId === currentEmployee.id)
    }, [appointments, currentEmployee])

    // Financial Calculations
    const stats = useMemo(() => {
        const today = new Date()

        let availableBalance = 0
        let currentMonthCommission = 0
        let nextRelease = 0

        const recentEntries: Array<{ id: string, description: string, amount: number, date: string }> = []

        myAppointments.forEach(apt => {
            const aptDate = new Date(apt.startAt)
            const price = apt.price || 0
            const commission = price * commissionRate

            // Current Month Commission
            if (aptDate.getMonth() === today.getMonth() && aptDate.getFullYear() === today.getFullYear()) {
                currentMonthCommission += commission
            }

            // Available Balance (Completed appointments)
            if (apt.status === 'completed') {
                availableBalance += commission
                recentEntries.push({
                    id: apt.id,
                    description: apt.serviceName || "Serviço",
                    amount: commission,
                    date: aptDate.toLocaleDateString()
                })
            }

            // Next Release (Pending/Confirmed appointments)
            if (apt.status === 'confirmed' || apt.status === 'pending') {
                nextRelease += commission
            }
        })

        // Sort entries by date desc
        recentEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return {
            availableBalance,
            currentMonthCommission,
            nextRelease,
            recentEntries: recentEntries.slice(0, 5) // Last 5
        }
    }, [myAppointments, commissionRate])

    // Mock payouts for now (Harder to track without a 'payouts' table)
    const payouts = [
        { id: "pix", title: "Pix automático", amount: `R$ ${stats.availableBalance.toFixed(2)}`, detail: "Disponível para saque", action: "Sacar" },
    ]

    const goal = 5000 // Mock monthly goal
    const goalProgress = Math.min((stats.currentMonthCommission / goal) * 100, 100)

    if (loadingApts || loadingEmps) {
        return <div className="flex h-screen items-center justify-center text-muted-foreground gap-2"><Loader2 className="animate-spin" /> Carregando financeiro...</div>
    }

    if (!currentEmployee) {
        // Fallback or "Not Authorized" views could go here, but for now we assume they are an employee
        // Ideally show "Link your profile" message
        return (
            <div className="space-y-6 pb-20">
                <header className="space-y-1">
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">Acesso Restrito</h1>
                    <p className="text-sm text-muted-foreground">Seu usuário não está vinculado a um perfil de profissional neste salão.</p>
                </header>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20">
            <header className="space-y-1">
                <p className="text-xs uppercase tracking-[0.3em] text-primary/60">Financeiro</p>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Minhas comissões</h1>
                <p className="text-sm text-muted-foreground">Acompanhe seus ganhos em tempo real.</p>
            </header>

            <section className="grid gap-4 sm:grid-cols-2">
                <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                    <CardContent className="py-6 space-y-2">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Saldo disponível</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">R$ {stats.availableBalance.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">Você recebe {commissionRate * 100}% de comissão.</p>
                    </CardContent>
                </Card>
                <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                    <CardContent className="py-6 space-y-2">
                        <p className="text-xs uppercase tracking-widest text-muted-foreground">Comissão mês atual</p>
                        <p className="text-3xl font-black text-slate-900 dark:text-white">R$ {stats.currentMonthCommission.toFixed(2)}</p>
                        <Progress value={goalProgress} className="h-1.5" />
                        <p className="text-xs text-muted-foreground">{goalProgress.toFixed(0)}% da meta de R$ {goal}</p>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader className="flex flex-col gap-1">
                        <CardTitle>Entradas recentes</CardTitle>
                        <p className="text-sm text-muted-foreground">Últimos serviços finalizados</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {stats.recentEntries.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">Nenhuma entrada recente.</p>
                        ) : (
                            stats.recentEntries.map(entry => (
                                <div key={entry.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">{entry.description}</p>
                                        <p className="text-xs text-muted-foreground">{entry.date}</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white text-emerald-600">+ R$ {entry.amount.toFixed(2)}</p>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Painel de retiradas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {payouts.map(item => (
                            <div key={item.id} className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase text-muted-foreground">{item.title}</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{item.amount}</p>
                                    <p className="text-xs text-muted-foreground">{item.detail}</p>
                                </div>
                                <Button variant="ghost" className="rounded-full text-xs gap-1">
                                    {item.action}
                                    <ArrowUpRight className="w-3 h-3" />
                                </Button>
                            </div>
                        ))}
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-4 flex items-center justify-between gap-4 bg-slate-50/50">
                            <div>
                                <p className="text-xs uppercase text-muted-foreground">A receber (Futuro)</p>
                                <p className="text-lg font-bold text-slate-400">R$ {stats.nextRelease.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">Agendamentos confirmados</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Insights (Beta)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-3">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Ticket Médio</p>
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-black text-primary">
                                    R$ {myAppointments.length > 0 ? (stats.currentMonthCommission / myAppointments.length).toFixed(2) : "0.00"}
                                </p>
                                <p className="text-xs text-muted-foreground">Por atendimento</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                <CardHeader>
                    <CardTitle>Retiradas & ações</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2">
                    <Button className="h-12 rounded-2xl gap-2" onClick={() => alert("Solicitação de retirada enviada para análise!")}>
                        <DollarSign className="w-4 h-4" />
                        Solicitar retirada
                    </Button>
                    <Button variant="outline" className="h-12 rounded-2xl gap-2" onClick={() => alert("Extrato sendo gerado. O download iniciará em breve.")}>
                        <Download className="w-4 h-4" />
                        Exportar extrato
                    </Button>
                    <Button variant="secondary" className="h-12 rounded-2xl gap-2" onClick={() => alert("Histórico completo indisponível na versão demo.")}>
                        <Wallet className="w-4 h-4" />
                        Ver histórico
                    </Button>
                    <Button variant="ghost" className="h-12 rounded-2xl gap-2" onClick={() => alert("Tudo certo com suas metas! Continue assim.")}>
                        <BarChart2 className="w-4 h-4" />
                        Comparar metas
                    </Button>
                </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                <CardHeader>
                    <CardTitle>Proteção & conformidade</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            Dossiê fiscal atualizado
                        </p>
                        <p className="text-xs text-muted-foreground">Envie suas notas até sexta-feira</p>
                    </div>
                    <Button variant="ghost" className="rounded-full text-xs gap-1">
                        Ver orientações
                        <ArrowUpRight className="w-3 h-3" />
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
