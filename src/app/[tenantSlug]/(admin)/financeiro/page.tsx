"use client"

import { useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Calendar,
    Download,
    Filter,
    Users,
    Percent,
    AlertCircle,
    Wallet,
    History,
    CheckCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTenantBySlug, useTenantEmployees, useTenantCommissions, useTenantAppointments, useTenantCommissionPayments, useTenantDailyClosings } from "@/hooks/useTenantRecords"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CommissionPaymentRecord } from "@/types/catalog"

type PeriodFilter = 'today' | 'week' | 'month'
type PaymentMethod = 'cash' | 'pix' | 'transfer' | 'check'

export default function FinancialPage() {
    const params = useParams()
    const tenantSlug = params.tenantSlug as string
    const { data: tenant } = useTenantBySlug(tenantSlug)
    const { data: employees } = useTenantEmployees(tenant?.id)
    const { data: commissionRows, refetch: refetchCommissions } = useTenantCommissions(tenant?.id)
    const { data: allAppointments } = useTenantAppointments(tenant?.id)
    const { data: commissionPayments, refetch: refetchPayments } = useTenantCommissionPayments(tenant?.id)
    const { data: dailyClosings } = useTenantDailyClosings(tenant?.id)

    // --- FILTRO DE PERÍODO (STATS) ---
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('month')

    // --- FILTRO DE PERÍODO (COMISSÕES) ---
    const [commissionPeriod, setCommissionPeriod] = useState<PeriodFilter>('month')
    const [showPaidCommissions, setShowPaidCommissions] = useState(false)

    // --- MODAL DE PAGAMENTO ---
    const [paymentModalOpen, setPaymentModalOpen] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix')
    const [paymentNotes, setPaymentNotes] = useState('')
    const [paymentProcessing, setPaymentProcessing] = useState(false)

    // --- CONFIGURAÇÕES DE COMISSÃO (Estado Local Mockado) ---
    const [settings, setSettings] = useState({
        defaultCommission: 40, // 40%
    })

    // Função para atualizar configurações
    const updateSetting = (key: keyof typeof settings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    // --- CÁLCULO DE PERÍODO ---
    const getPeriodDates = (period: PeriodFilter) => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (period) {
            case 'today':
                return {
                    start: today,
                    end: new Date(today.getTime() + 24 * 60 * 60 * 1000)
                }
            case 'week':
                const weekStart = new Date(today)
                weekStart.setDate(today.getDate() - today.getDay()) // Domingo
                const weekEnd = new Date(weekStart)
                weekEnd.setDate(weekStart.getDate() + 7)
                return { start: weekStart, end: weekEnd }
            case 'month':
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
                const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
                return { start: monthStart, end: monthEnd }
            default:
                return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
        }
    }

    // --- STATS FINANCEIROS REAIS ---
    const stats = useMemo(() => {
        const { start, end } = getPeriodDates(selectedPeriod)

        // Filtrar appointments do período
        const periodAppointments = allAppointments.filter(apt => {
            const aptDate = new Date(apt.startAt)
            return aptDate >= start && aptDate <= end
        })

        // FATURAMENTO BRUTO: soma de finalPrice dos appointments concluídos
        const revenue = periodAppointments
            .filter(apt => apt.status === 'completed')
            .reduce((sum, apt) => sum + (apt.finalPrice || 0), 0)

        // COMISSÕES: soma das comissões do período
        const periodCommissions = commissionRows.filter(comm => {
            const commDate = new Date(comm.createdAt)
            return commDate >= start && commDate <= end
        })
        const commissionExpenses = periodCommissions.reduce((sum, comm) => sum + comm.commissionAmount, 0)

        // DESPESAS TOTAIS (por enquanto só comissões, pode adicionar taxas depois)
        const expenses = commissionExpenses

        // LUCRO LÍQUIDO
        const profit = revenue - expenses

        // PENDENTE: agendamentos confirmados ou pendentes
        const pending = periodAppointments
            .filter(apt => apt.status === 'pending' || apt.status === 'confirmed')
            .reduce((sum, apt) => sum + (apt.finalPrice || apt.price || 0), 0)

        return {
            revenue,
            expenses,
            profit,
            pending,
            profitMargin: revenue > 0 ? ((profit / revenue) * 100).toFixed(0) : '0'
        }
    }, [allAppointments, commissionRows, selectedPeriod])

    // --- COMISSÕES FILTRADAS POR PERÍODO E STATUS ---
    const commissions = useMemo(() => {
        const { start, end } = getPeriodDates(commissionPeriod)

        return employees.flatMap(emp => {
            // Filtrar comissões do profissional no período
            const rows = commissionRows.filter(r => {
                if (r.employeeId !== emp.id) return false
                const commDate = new Date(r.createdAt)
                const inPeriod = commDate >= start && commDate <= end

                // Filtrar por status de pagamento
                const isPaid = !!r.commissionPaymentId
                if (!showPaidCommissions && isPaid) return false // Ocultar pagas
                if (showPaidCommissions && !isPaid) return false // Mostrar só pagas

                return inPeriod
            })

            if (rows.length === 0) return []

            const grossValue       = rows.reduce((sum, r) => sum + r.finalPrice, 0)
            const deductions       = rows.reduce((sum, r) => sum + r.discount, 0)
            const baseValue        = rows.reduce((sum, r) => sum + r.baseAmount, 0)
            const commissionAmount = rows.reduce((sum, r) => sum + r.commissionAmount, 0)
            const rate             = rows[0]?.commissionRate ?? 0
            const isPaid           = rows.every(r => !!r.commissionPaymentId)

            return [{
                id: emp.id,
                name: emp.fullName,
                totalServices: rows.length,
                grossValue,
                deductions,
                baseValue,
                commissionRate: rate / 100,
                finalValue: commissionAmount,
                isPaid,
            }]
        })
    }, [employees, commissionRows, commissionPeriod, showPaidCommissions])

    // --- VALIDAÇÃO DE FECHAMENTO DIÁRIO ---
    const isPeriodClosed = useMemo(() => {
        const { start, end } = getPeriodDates(commissionPeriod)

        // Verificar se TODOS os dias do período estão fechados
        const closedDatesSet = new Set(dailyClosings.map(c => c.closingDate))

        // Iterar por cada dia do período
        let currentDate = new Date(start)
        while (currentDate <= end) {
            const dateStr = currentDate.toISOString().split('T')[0]
            if (!closedDatesSet.has(dateStr)) {
                return false // Dia não fechado encontrado
            }
            currentDate.setDate(currentDate.getDate() + 1)
        }

        return true // Todos os dias estão fechados
    }, [commissionPeriod, dailyClosings])

    // --- PROCESSAR PAGAMENTO DE COMISSÃO ---
    const handlePayCommission = async (employeeId: string, employeeName: string) => {
        if (!isPeriodClosed) {
            toast.error("Período não fechado", {
                description: "Feche todos os dias do período antes de pagar comissões."
            })
            return
        }

        setSelectedEmployee(employeeId)
        setPaymentModalOpen(true)
    }

    const confirmPayment = async () => {
        if (!selectedEmployee || !tenant?.id) return

        setPaymentProcessing(true)

        try {
            const supabase = await import("@/lib/supabase/client").then(m => m.getSupabaseBrowserClient())
            if (!supabase) throw new Error("Supabase client not available")

            const { start, end } = getPeriodDates(commissionPeriod)
            const periodStart = start.toISOString().split('T')[0]
            const periodEnd = end.toISOString().split('T')[0]

            // Buscar comissões não pagas do profissional no período
            const unpaidCommissions = commissionRows.filter(r => {
                if (r.employeeId !== selectedEmployee) return false
                if (r.commissionPaymentId) return false // Já paga
                const commDate = new Date(r.createdAt)
                return commDate >= start && commDate <= end
            })

            if (unpaidCommissions.length === 0) {
                toast.error("Nenhuma comissão pendente", {
                    description: "Todas as comissões deste profissional já foram pagas."
                })
                setPaymentProcessing(false)
                return
            }

            const totalAmount = unpaidCommissions.reduce((sum, r) => sum + r.commissionAmount, 0)

            // 1. Criar registro de pagamento
            const { data: payment, error: paymentError } = await supabase
                .from("commission_payments")
                .insert({
                    tenant_id: tenant.id,
                    employee_id: selectedEmployee,
                    period_start: periodStart,
                    period_end: periodEnd,
                    total_amount: totalAmount,
                    payment_method: paymentMethod,
                    notes: paymentNotes || null,
                })
                .select()
                .single()

            if (paymentError) throw paymentError

            // 2. Atualizar comissões para linkar ao pagamento
            const commissionIds = unpaidCommissions.map(r => r.id)
            const { error: updateError } = await supabase
                .from("appointment_commissions")
                .update({ commission_payment_id: payment.id })
                .in("id", commissionIds)

            if (updateError) throw updateError

            toast.success("Pagamento registrado!", {
                description: `${formatCurrency(totalAmount)} pago via ${paymentMethod}.`
            })

            // Resetar e fechar modal
            setPaymentModalOpen(false)
            setSelectedEmployee(null)
            setPaymentMethod('pix')
            setPaymentNotes('')

            // Refetch data
            refetchCommissions()
            refetchPayments()

        } catch (error) {
            console.error("Erro ao processar pagamento:", error)
            toast.error("Erro ao processar pagamento", {
                description: error instanceof Error ? error.message : "Erro desconhecido"
            })
        } finally {
            setPaymentProcessing(false)
        }
    }

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto pb-32">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Financeiro Inteligente</h1>
                    <p className="text-slate-500 text-lg">Seu lucro blindado com cálculo automático de taxas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                        <Button
                            size="sm"
                            variant={selectedPeriod === 'today' ? 'default' : 'ghost'}
                            onClick={() => setSelectedPeriod('today')}
                            className="h-8"
                        >
                            Hoje
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedPeriod === 'week' ? 'default' : 'ghost'}
                            onClick={() => setSelectedPeriod('week')}
                            className="h-8"
                        >
                            Semana
                        </Button>
                        <Button
                            size="sm"
                            variant={selectedPeriod === 'month' ? 'default' : 'ghost'}
                            onClick={() => setSelectedPeriod('month')}
                            className="h-8"
                        >
                            Mês
                        </Button>
                    </div>
                    <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                        <Download className="w-4 h-4" />
                        Relatório DRE
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none text-white shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-300">Faturamento Bruto</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.revenue)}</div>
                        <p className="text-xs text-slate-400 mt-1">Total passado na maquininha</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-zinc-900 shadow-sm border-l-4 border-l-red-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Comissões & Despesas</CardTitle>
                        <Users className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.expenses)}</div>
                        <p className="text-xs text-slate-400 mt-1">Sai do seu caixa</p>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Lucro Real (Líquido)</CardTitle>
                        <Wallet className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{formatCurrency(stats.profit)}</div>
                        <p className="text-xs text-emerald-600/80 mt-1">O que sobra no seu bolso ({stats.profitMargin}%)</p>
                    </CardContent>
                </Card>
                <Card className="bg-white dark:bg-zinc-900 shadow-sm border-l-4 border-l-amber-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Previsão Futura</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.pending)}</div>
                        <p className="text-xs text-slate-400 mt-1">Agendado para próxima semana</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="commissions" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl flex-wrap">
                    <TabsTrigger value="commissions" className="flex-1 min-w-[180px] rounded-lg gap-2 data-[state=active]:bg-white">
                        <Users className="w-4 h-4" />
                        Pagamento de Comissões
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex-1 min-w-[180px] rounded-lg gap-2 data-[state=active]:bg-white">
                        <History className="w-4 h-4" />
                        Histórico de Pagamentos
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex-1 min-w-[180px] rounded-lg gap-2 data-[state=active]:bg-white">
                        <Percent className="w-4 h-4" />
                        Configurar Taxas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="commissions">
                    <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
                        <CardHeader>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <CardTitle>Fechamento de Comissões</CardTitle>
                                    <CardDescription>Comissões calculadas no fechamento de cada atendimento e persistidas no banco.</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-xs font-normal gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Cálculo: (Valor Final - Desconto) x % Profissional
                                </Badge>
                            </div>

                            {/* Filtros de Comissões */}
                            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                    <Label className="text-xs text-slate-600">Período:</Label>
                                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                                        <Button
                                            size="sm"
                                            variant={commissionPeriod === 'today' ? 'default' : 'ghost'}
                                            onClick={() => setCommissionPeriod('today')}
                                            className="h-7 text-xs"
                                        >
                                            Hoje
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={commissionPeriod === 'week' ? 'default' : 'ghost'}
                                            onClick={() => setCommissionPeriod('week')}
                                            className="h-7 text-xs"
                                        >
                                            Semana
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={commissionPeriod === 'month' ? 'default' : 'ghost'}
                                            onClick={() => setCommissionPeriod('month')}
                                            className="h-7 text-xs"
                                        >
                                            Mês
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Label htmlFor="show-paid" className="text-xs text-slate-600 cursor-pointer">
                                        Exibir pagas:
                                    </Label>
                                    <input
                                        id="show-paid"
                                        type="checkbox"
                                        checked={showPaidCommissions}
                                        onChange={(e) => setShowPaidCommissions(e.target.checked)}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                                    />
                                </div>

                                {!isPeriodClosed && (
                                    <Badge variant="destructive" className="gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Período não fechado
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 font-medium text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Profissional</th>
                                            <th className="px-6 py-4">Fat. Bruto</th>
                                            <th className="px-6 py-4 text-red-400" title="Descontos aplicados no atendimento">Descontos</th>
                                            <th className="px-6 py-4 font-bold text-slate-700">Base Calc.</th>
                                            <th className="px-6 py-4">Sua %</th>
                                            <th className="px-6 py-4 text-emerald-600 font-bold bg-emerald-50/50">A PAGAR</th>
                                            <th className="px-6 py-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {commissions.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                                                    Nenhum serviço finalizado neste período.
                                                </td>
                                            </tr>
                                        )}
                                        {commissions.map((comm) => (
                                            <tr key={comm.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group">
                                                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                                    {comm.name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600">
                                                    {formatCurrency(comm.grossValue)}
                                                </td>
                                                <td className="px-6 py-4 text-red-400 text-xs">
                                                    - {formatCurrency(comm.deductions)}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700">
                                                    {formatCurrency(comm.baseValue)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-mono">
                                                        {(comm.commissionRate * 100)}%
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-emerald-600 text-lg bg-emerald-50/30 group-hover:bg-emerald-100/30 transition-colors">
                                                    {formatCurrency(comm.finalValue)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {comm.isPaid ? (
                                                        <Badge className="bg-slate-200 text-slate-600">
                                                            ✓ Pago
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handlePayCommission(comm.id, comm.name)}
                                                            disabled={!isPeriodClosed}
                                                            className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title={!isPeriodClosed ? "Feche o período antes de pagar" : "Pagar comissão"}
                                                        >
                                                            Pagar
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
                        <CardHeader>
                            <CardTitle>Histórico de Pagamentos</CardTitle>
                            <CardDescription>Registro de todos os pagamentos de comissões realizados.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 font-medium text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4">Data</th>
                                            <th className="px-6 py-4">Profissional</th>
                                            <th className="px-6 py-4">Período</th>
                                            <th className="px-6 py-4">Valor</th>
                                            <th className="px-6 py-4">Método</th>
                                            <th className="px-6 py-4">Observações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                        {commissionPayments.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                                    Nenhum pagamento registrado ainda.
                                                </td>
                                            </tr>
                                        )}
                                        {commissionPayments.map((payment) => {
                                            const employee = employees.find(e => e.id === payment.employeeId)
                                            const methodLabels: Record<PaymentMethod, string> = {
                                                pix: 'PIX',
                                                transfer: 'Transferência',
                                                cash: 'Dinheiro',
                                                check: 'Cheque'
                                            }

                                            return (
                                                <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                    <td className="px-6 py-4 text-slate-900 dark:text-white">
                                                        {new Date(payment.paidAt).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                                                        {employee?.fullName || 'Profissional não encontrado'}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600 text-xs">
                                                        {new Date(payment.periodStart).toLocaleDateString('pt-BR')} até{' '}
                                                        {new Date(payment.periodEnd).toLocaleDateString('pt-BR')}
                                                    </td>
                                                    <td className="px-6 py-4 font-bold text-emerald-600">
                                                        {formatCurrency(payment.totalAmount)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                                                            {methodLabels[payment.paymentMethod]}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                                        {payment.notes || '-'}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {commissionPayments.length > 0 && (
                                <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        <span>{commissionPayments.length} pagamento(s) registrado(s)</span>
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-white">
                                        Total pago: {formatCurrency(commissionPayments.reduce((sum, p) => sum + p.totalAmount, 0))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <div className="grid grid-cols-1 gap-6">
                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />
                                    Regras de Comissão
                                </CardTitle>
                                <CardDescription>Como o cálculo deve ser feito.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="space-y-0.5">
                                        <label className="text-sm font-medium text-slate-900">Descontar taxas da base?</label>
                                        <p className="text-xs text-slate-500">Se ativo, a comissão é calculada sobre o valor líquido.</p>
                                    </div>
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            checked={settings.deductFeesFromCommission}
                                            onChange={(e) => updateSetting('deductFeesFromCommission', e.target.checked)}
                                            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-slate-700">Comissão Padrão (%)</label>
                                        <span className="text-sm font-bold text-blue-600">{settings.defaultCommission}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="100" step="1"
                                        value={settings.defaultCommission}
                                        onChange={(e) => updateSetting('defaultCommission', Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Modal de Confirmação de Pagamento */}
            <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirmar Pagamento de Comissão</DialogTitle>
                        <DialogDescription>
                            Registre o pagamento das comissões do período selecionado.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="payment-employee" className="text-sm font-medium">
                                Profissional
                            </Label>
                            <Input
                                id="payment-employee"
                                value={employees.find(e => e.id === selectedEmployee)?.fullName || ''}
                                disabled
                                className="bg-slate-50"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payment-period" className="text-sm font-medium">
                                Período
                            </Label>
                            <Input
                                id="payment-period"
                                value={`${commissionPeriod === 'today' ? 'Hoje' : commissionPeriod === 'week' ? 'Esta Semana' : 'Este Mês'}`}
                                disabled
                                className="bg-slate-50"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payment-total" className="text-sm font-medium">
                                Valor Total
                            </Label>
                            <Input
                                id="payment-total"
                                value={formatCurrency(commissions.find(c => c.id === selectedEmployee)?.finalValue || 0)}
                                disabled
                                className="bg-slate-50 font-bold text-emerald-600"
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payment-method" className="text-sm font-medium">
                                Método de Pagamento *
                            </Label>
                            <Select value={paymentMethod} onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}>
                                <SelectTrigger id="payment-method">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pix">PIX</SelectItem>
                                    <SelectItem value="transfer">Transferência Bancária</SelectItem>
                                    <SelectItem value="cash">Dinheiro</SelectItem>
                                    <SelectItem value="check">Cheque</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="payment-notes" className="text-sm font-medium">
                                Observações (opcional)
                            </Label>
                            <textarea
                                id="payment-notes"
                                rows={3}
                                value={paymentNotes}
                                onChange={(e) => setPaymentNotes(e.target.value)}
                                placeholder="Ex: Comprovante #12345"
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setPaymentModalOpen(false)}
                            disabled={paymentProcessing}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmPayment}
                            disabled={paymentProcessing}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        >
                            {paymentProcessing ? "Processando..." : "Confirmar Pagamento"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
