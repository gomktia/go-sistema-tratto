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
    Wallet
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTenantBySlug, useTenantEmployees, useTenantCommissions, useTenantAppointments } from "@/hooks/useTenantRecords"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

type PeriodFilter = 'today' | 'week' | 'month'

export default function FinancialPage() {
    const params = useParams()
    const tenantSlug = params.tenantSlug as string
    const { data: tenant } = useTenantBySlug(tenantSlug)
    const { data: employees } = useTenantEmployees(tenant?.id)
    const { data: commissionRows } = useTenantCommissions(tenant?.id)
    const { data: allAppointments } = useTenantAppointments(tenant?.id)

    // --- FILTRO DE PERÍODO ---
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('month')

    // --- CONFIGURAÇÕES DE COMISSÃO (Estado Local Mockado) ---
    const [settings, setSettings] = useState({
        cardFeeCredit: 3.5, // 3.5%
        cardFeeDebit: 1.5,  // 1.5%
        defaultCommission: 40, // 40%
        deductFeesFromCommission: true // Se true, desconta taxa cartão antes de calcular comissão
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

    // --- COMISSÕES PERSISTIDAS (appointment_commissions) ---
    const commissions = employees.flatMap(emp => {
        const rows = commissionRows.filter(r => r.employeeId === emp.id)
        if (rows.length === 0) return []
        const grossValue       = rows.reduce((sum, r) => sum + r.finalPrice, 0)
        const deductions       = rows.reduce((sum, r) => sum + r.discount, 0)
        const baseValue        = rows.reduce((sum, r) => sum + r.baseAmount, 0)
        const commissionAmount = rows.reduce((sum, r) => sum + r.commissionAmount, 0)
        const rate             = rows[0]?.commissionRate ?? 0
        return [{
            id: emp.id,
            name: emp.fullName,
            totalServices: rows.length,
            grossValue,          // final_price acumulado
            deductions,          // discount acumulado
            baseValue,           // base_amount acumulado (grossValue - deductions)
            commissionRate: rate / 100,
            finalValue: commissionAmount,
            status: commissionAmount > 0 ? 'pending' : 'paid',
        }]
    })


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
                <TabsList className="bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <TabsTrigger value="commissions" className="flex-1 rounded-lg gap-2 data-[state=active]:bg-white">
                        <Users className="w-4 h-4" />
                        Pagamento de Comissões
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="flex-1 rounded-lg gap-2 data-[state=active]:bg-white">
                        <Percent className="w-4 h-4" />
                        Configurar Taxas
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="commissions">
                    <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Fechamento de Comissões</CardTitle>
                                    <CardDescription>Comissões calculadas no fechamento de cada atendimento e persistidas no banco.</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-xs font-normal gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Cálculo: (Valor Final - Desconto) x % Profissional
                                </Badge>
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
                                                    <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                                        Pagar
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-none shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-purple-600" />
                                    Taxas da Maquininha
                                </CardTitle>
                                <CardDescription>Informe as taxas para descontar antes da comissão.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-slate-700">Crédito (%)</label>
                                        <span className="text-sm font-bold text-purple-600">{settings.cardFeeCredit}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="10" step="0.1"
                                        value={settings.cardFeeCredit}
                                        onChange={(e) => updateSetting('cardFeeCredit', Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                    <p className="text-xs text-slate-400">Quanto sua máquina cobra no crédito.</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <label className="text-sm font-medium text-slate-700">Débito (%)</label>
                                        <span className="text-sm font-bold text-purple-600">{settings.cardFeeDebit}%</span>
                                    </div>
                                    <input
                                        type="range" min="0" max="5" step="0.1"
                                        value={settings.cardFeeDebit}
                                        onChange={(e) => updateSetting('cardFeeDebit', Number(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                    />
                                </div>
                            </CardContent>
                        </Card>

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
        </div>
    )
}
