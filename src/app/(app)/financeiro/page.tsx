"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import {
    ArrowUpRight,
    CreditCard,
    DollarSign,
    Download,
    Filter,
    Handshake,
    Info,
    Search,
    Smartphone,
    TrendingUp,
    Users,
    Wallet,
    Loader2
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useTenant } from "@/contexts/tenant-context"
import { PdvQuickHub } from "@/components/PdvQuickHub"
import { useTenantAppointments, useTenantEmployees } from "@/hooks/useTenantRecords"
import { toast } from "sonner"

export default function FinanceiroPage() {
    const { currentTenant } = useTenant()

    // FETCH REAL DATA
    const { data: appointments, loading: loadingAppointments } = useTenantAppointments(currentTenant.id)
    const { data: employees, loading: loadingEmployees } = useTenantEmployees(currentTenant.id)

    const isLoading = loadingAppointments || loadingEmployees

    // 1. CALCULATE SUMMARY
    const summary = useMemo(() => {
        if (!appointments) return { totalRevenue: 0, pending: 0, commissions: 0, netProfit: 0, growth: "+0%" }

        const completed = appointments.filter(a => a.status === 'completed' || a.status === 'confirmed')
        const pending = appointments.filter(a => a.status === 'scheduled')

        // Revenue (Completed/Confirmed)
        const totalRevenue = completed.reduce((sum, a) => sum + (a.price || 0), 0)

        // Pending Revenue
        const pendingRevenue = pending.reduce((sum, a) => sum + (a.price || 0), 0)

        // Calculate Commissions (Mock Logic: Flat rate if not set)
        let totalCommissions = 0
        if (employees) {
            completed.forEach(apt => {
                const emp = employees.find(e => e.id === apt.employeeId)
                const rate = emp?.commissionRate || 40 // Default 40%
                totalCommissions += ((apt.price || 0) * rate) / 100
            })
        }

        return {
            totalRevenue,
            pending: pendingRevenue,
            commissions: totalCommissions,
            netProfit: totalRevenue - totalCommissions,
            growth: "+12.5%" // Placeholder for MVP
        }
    }, [appointments, employees])

    // 2. PREPARE TRANSACTIONS (Recent Activity)
    const transactions = useMemo(() => {
        if (!appointments) return []

        // Sort by date desc
        const sorted = [...appointments].sort((a, b) =>
            new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
        )

        return sorted.slice(0, 10).map(apt => {
            // Mock payment method logic based on random seed from ID for demo consistency
            // In real app, we would use `apt.metadata?.payment_method`
            const methods = ['Pix', 'Cartão', 'Dinheiro'] as const
            const methodIndex = apt.id.charCodeAt(0) % 3
            const method = methods[methodIndex]

            return {
                id: apt.id,
                customer: apt.customerName || "Cliente",
                service: apt.price ? `Serviço (R$ ${apt.price})` : "Serviço", // Simplified as we might not have service name joined yet
                amount: apt.price || 0,
                method: method,
                date: new Date(apt.startAt).toLocaleDateString('pt-BR'),
                status: apt.status === 'completed' || apt.status === 'confirmed' ? 'completed' : 'pending'
            }
        })
    }, [appointments])

    // 3. STAFF COMMISSIONS BREAKDOWN
    const staffCommissions = useMemo(() => {
        if (!employees || !appointments) return []

        return employees.map(emp => {
            const empApts = appointments.filter(a => a.employeeId === emp.id && (a.status === 'completed' || a.status === 'confirmed'))
            const totalGenerated = empApts.reduce((sum, a) => sum + (a.price || 0), 0)
            const rate = emp.commissionRate || 40

            return {
                name: emp.fullName,
                role: emp.role || "Profissional",
                totalGenerated,
                count: empApts.length,
                rate: `${rate}%`,
                commissionValue: (totalGenerated * rate) / 100
            }
        }).filter(s => s.totalGenerated > 0).sort((a, b) => b.totalGenerated - a.totalGenerated)
    }, [employees, appointments])


    const transactionIconMap: Record<string, any> = {
        Pix: Smartphone,
        "Cartão": CreditCard,
        "Dinheiro": Handshake,
        "Local": Wallet
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center text-muted-foreground gap-2"><Loader2 className="animate-spin" /> Carregando financeiro...</div>
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 md:px-6 py-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Financeiro</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Controle seu fluxo de caixa e comissões.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <Button variant="outline" className="rounded-xl border-slate-200 dark:border-zinc-800 w-full md:w-auto" onClick={() => toast.info("Exportação em PDF em breve!")}>
                        <Download className="w-4 h-4 mr-2" /> Exportar PDF
                    </Button>
                    <Button className="rounded-xl bg-primary text-white font-bold w-full md:w-auto" onClick={() => toast.success("Relatório gerado!")}>
                        Gerar Relatório Completo
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
            >
                <motion.div variants={itemVariants}>
                    <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-primary text-white relative overflow-hidden h-full group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10 space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Faturamento Realizado</p>
                                <h2 className="text-2xl font-black">R$ {summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                            </div>
                            <div className="flex items-center gap-1 text-xs font-bold text-emerald-300">
                                <ArrowUpRight className="w-3 h-3" /> {summary.growth} este mês
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900 h-full">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Lucro Líquido Est.</p>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">R$ {summary.netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Após descontar comissões</p>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900 h-full">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Total Comissões</p>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">R$ {summary.commissions.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                                <Info className="w-3 h-3" /> {staffCommissions.length} profissionais ativos
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                    <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900 h-full">
                        <div className="space-y-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">A Receber / Agendado</p>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">R$ {summary.pending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                            </div>
                            <Badge className="bg-amber-500/10 text-amber-600 border-none font-bold text-[10px] uppercase">
                                Projeção
                            </Badge>
                        </div>
                    </Card>
                </motion.div>
            </motion.div>

            <div className="rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur p-4 sm:p-6">
                <PdvQuickHub tenantId={currentTenant.id} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Transactions Table */}
                <Card className="lg:col-span-2 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Últimas Movimentações</h3>
                            <p className="text-slate-500 text-xs">Acompanhamento em tempo real.</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-xl bg-slate-50 dark:bg-zinc-800">
                                <Search className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="rounded-xl bg-slate-50 dark:bg-zinc-800">
                                <Filter className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {transactions.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                Nenhuma transação registrada ainda.
                            </div>
                        )}
                        {transactions.map((tx) => {
                            const MethodIcon = transactionIconMap[tx.method as string] || Wallet
                            return (
                                <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-4 rounded-3xl border border-slate-50 dark:border-zinc-800 hover:bg-slate-50/50 dark:hover:bg-zinc-800/50 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center",
                                                tx.method === 'Pix'
                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                    : tx.method === 'Cartão'
                                                        ? "bg-blue-500/10 text-blue-500"
                                                        : "bg-slate-500/10 text-slate-500"
                                            )}
                                        >
                                            <MethodIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white capitalize">{tx.customer}</h4>
                                            <p className="text-xs text-slate-400 font-medium">{tx.service} • {tx.method}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 dark:text-white">
                                            R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </p>
                                        <Badge
                                            className={cn(
                                                "font-bold text-[10px] uppercase px-2 py-0.5 rounded-full border-none",
                                                tx.status === 'completed'
                                                    ? "bg-emerald-500/10 text-emerald-500"
                                                    : "bg-amber-500/10 text-amber-500"
                                            )}
                                        >
                                            {tx.status === 'completed' ? 'Recebido' : 'Pendente'}
                                        </Badge>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <Button variant="ghost" className="w-full mt-6 rounded-2xl font-bold text-slate-400">
                        Ver todo o histórico
                    </Button>
                </Card>

                {/* Staff Commissions List */}
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-6 sm:p-8 space-y-8 flex flex-col h-full">
                    <div>
                        <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Comissões a Pagar</h3>
                        <p className="text-slate-500 text-xs">Baseado em atendimentos finalizados.</p>
                    </div>

                    <div className="space-y-6 flex-1 overflow-y-auto max-h-[400px] pr-2">
                        {staffCommissions.length === 0 && (
                            <p className="text-sm text-center text-muted-foreground py-4">
                                Nenhuma comissão gerada ainda.
                            </p>
                        )}
                        {staffCommissions.map((staff, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-slate-400">
                                            {staff.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{staff.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{staff.role}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 dark:text-white text-sm">R$ {staff.commissionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                        <p className="text-[10px] font-bold text-primary uppercase">{staff.rate}</p>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-slate-50 dark:bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary"
                                        style={{ width: `${Math.min((staff.totalGenerated / 5000) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 space-y-4 mt-auto">
                        <Button className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-zinc-800 text-white font-bold hover:bg-slate-800" disabled={staffCommissions.length === 0} onClick={() => toast.success("Pagamentos processados!")}>
                            Realizar Todos os Pagamentos
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 font-medium">
                            Os valores são calculados automaticamente.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    )
}
