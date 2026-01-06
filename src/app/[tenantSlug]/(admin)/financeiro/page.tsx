"use client"

import { useState } from "react"
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
    Landmark,
    CheckCircle2,
    ArrowRight,
    Loader2,
    Briefcase
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useTenantBySlug, useTenantAppointments, useTenantEmployees } from "@/hooks/useTenantRecords"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export default function FinancialPage() {
    const params = useParams()
    const tenantSlug = params.tenantSlug as string
    const { data: tenant } = useTenantBySlug(tenantSlug)
    const { data: appointments } = useTenantAppointments(tenant?.id)
    const { data: employees } = useTenantEmployees(tenant?.id)

    // --- STRIPE STATES ---
    const [isStripeConnected, setIsStripeConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)

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

    const handleConnectStripe = () => {
        setIsConnecting(true)
        // Simulate OAuth flow
        setTimeout(() => {
            setIsConnecting(false)
            setIsStripeConnected(true)
            toast.success("Conta Stripe conectada com sucesso!")
        }, 2000)
    }

    // Mock Financial Data (To be replaced with real aggregations)
    const stats = {
        revenue: 45280.00,
        expenses: 12450.00,
        profit: 32830.00,
        pending: 3450.00
    }

    // --- CÁLCULO INTELIGENTE DE COMISSÕES ---
    const commissions = employees.map(emp => {
        const empAppointments = appointments
            .filter(a => a.employeeId === emp.id && a.status === 'completed')

        // Detalhamento do calculo
        let totalServiceValue = 0
        let totalDeductions = 0
        let commissionableAmount = 0

        empAppointments.forEach(apt => {
            const price = apt.price || 0
            const method = (apt as any).metadata?.payment_method || 'card' // Mock default

            // 1. Aplica taxa da maquininha?
            let feePercent = 0
            if (method === 'card') feePercent = settings.cardFeeCredit
            if (method === 'debit') feePercent = settings.cardFeeDebit

            const feeValue = price * (feePercent / 100)

            // 2. Base de cálculo
            const baseValue = settings.deductFeesFromCommission ? (price - feeValue) : price

            totalServiceValue += price
            totalDeductions += feeValue
            commissionableAmount += baseValue
        })

        // 3. Aplica % do Profissional
        const empRate = (emp as any).commissionRate || settings.defaultCommission
        const empCommissionRate = empRate / 100
        const finalCommission = commissionableAmount * empCommissionRate

        return {
            id: emp.id,
            name: emp.fullName,
            totalServices: empAppointments.length,
            grossValue: totalServiceValue,    // Faturamento Bruto
            deductions: totalDeductions,      // Taxas Maquininha
            baseValue: commissionableAmount,  // Base de Cálculo
            commissionRate: empCommissionRate,
            finalValue: finalCommission,      // Valor a Pagar
            status: finalCommission > 0 ? 'pending' : 'paid'
        }
    })


    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto pb-32">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Financeiro Inteligente</h1>
                    <p className="text-slate-500 text-lg">Seu lucro blindado com cálculo automático de taxas.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Este Mês
                    </Button>
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
                        <p className="text-xs text-emerald-600/80 mt-1">O que sobra no seu bolso (72%)</p>
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
                <TabsList className="bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl w-full flex flex-wrap h-auto gap-2">
                    <div className="flex gap-1 flex-1 min-w-[300px]">
                        <TabsTrigger value="commissions" className="flex-1 rounded-lg gap-2 data-[state=active]:bg-white">
                            <Users className="w-4 h-4" />
                            Pagamento de Comissões
                        </TabsTrigger>
                        <TabsTrigger value="settings" className="flex-1 rounded-lg gap-2 data-[state=active]:bg-white">
                            <Percent className="w-4 h-4" />
                            Configurar Taxas
                        </TabsTrigger>
                    </div>
                    <TabsTrigger value="online_payments" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-indigo-600 min-w-[180px]">
                        <Landmark className="w-4 h-4" />
                        Pagamentos Online
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="commissions">
                    <Card className="border-none shadow-lg bg-white dark:bg-zinc-900">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Fechamento de Comissões</CardTitle>
                                    <CardDescription>Valores calculados automaticamente descontando taxas de cartão.</CardDescription>
                                </div>
                                <Badge variant="outline" className="text-xs font-normal gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Cálculo: (Preço - Taxa Cartão) x % Profissional
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
                                            <th className="px-6 py-4 text-red-400" title="Taxas de cartão descontadas">Ded. Taxas</th>
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

                <TabsContent value="online_payments">
                    {!isStripeConnected ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                            <div className="space-y-6">
                                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none">Pagamentos Automatizados</Badge>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Receba enquanto dorme. Integrado com Stripe.</h2>
                                <p className="text-lg text-slate-500 leading-relaxed">
                                    Pare de cobrar manualmente no balcão. Com o Stripe Connect, seu cliente paga no agendamento e o dinheiro cai direto na sua conta bancária.
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5" /></div>
                                        <span className="font-medium text-slate-700">Recebimento via Cartão de Crédito, Débito e Pix</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Briefcase className="w-5 h-5" /></div>
                                        <span className="font-medium text-slate-700">Split de Pagamento Automático (Salão / Profissional)</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Wallet className="w-5 h-5" /></div>
                                        <span className="font-medium text-slate-700">Saques diários para sua conta bancária</span>
                                    </li>
                                </ul>
                                <div className="pt-4">
                                    <Button
                                        onClick={handleConnectStripe}
                                        disabled={isConnecting}
                                        className="h-14 px-8 rounded-full bg-[#635BFF] hover:bg-[#5851E1] text-white font-bold text-lg shadow-xl shadow-[#635BFF]/30 transition-all hover:scale-105"
                                    >
                                        {isConnecting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Conectando...
                                            </>
                                        ) : (
                                            <>
                                                Conectar com Stripe
                                                <ArrowRight className="w-5 h-5 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                    <p className="text-xs text-slate-400 mt-3 pl-2">Taxas a partir de 3.99% + R$ 0,39 por transação.</p>
                                </div>
                            </div>
                            <div className="relative">
                                {/* Decorative Mockup */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-[#635BFF]/20 to-transparent rounded-[3rem] blur-3xl -z-10" />
                                <Card className="border-none shadow-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 rounded-[2rem] relative overflow-hidden">
                                    {/* Mock Stripe Login */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b pb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-[#635BFF] rounded-md flex items-center justify-center text-white font-black text-xs">S</div>
                                                <span className="font-bold text-slate-900">Stripe</span>
                                            </div>
                                            <div className="text-xs text-slate-400">Ambiente Seguro</div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="h-2 w-1/3 bg-slate-200 rounded animate-pulse" />
                                            <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
                                            <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
                                            <div className="h-12 w-full bg-[#635BFF]/20 rounded-lg animate-pulse" />
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <Card className="bg-[#635BFF] text-white border-none shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-16" />
                                <CardHeader>
                                    <div className="flex justify-between items-start z-10">
                                        <div>
                                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-2">Conta Conectada</Badge>
                                            <CardTitle className="text-3xl font-black">Saldo Disponível</CardTitle>
                                        </div>
                                        <Landmark className="w-8 h-8 text-white/80" />
                                    </div>
                                </CardHeader>
                                <CardContent className="z-10 relative">
                                    <div className="text-5xl font-black tracking-tight mb-2">R$ 0,00</div>
                                    <p className="text-white/60 text-sm">Próximo pagamento automático: Amanhã</p>
                                </CardContent>
                                <CardFooter className="bg-black/10 p-4 flex gap-4 z-10 relative">
                                    <Button variant="secondary" className="flex-1 bg-white text-[#635BFF] hover:bg-white/90 border-none font-bold">
                                        Ver no Dashboard Stripe
                                    </Button>
                                    <Button variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10 hover:text-white">
                                        Configurações de Saque
                                    </Button>
                                </CardFooter>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-slate-500">Volume Bruto (Mês)</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-slate-900">R$ 0,00</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-slate-500">Taxas Stripe</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-red-500">- R$ 0,00</div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-slate-500">Líquido Estimado</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-emerald-600">R$ 0,00</div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
