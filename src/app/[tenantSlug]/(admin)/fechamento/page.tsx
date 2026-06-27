"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import {
    Loader2, CheckCircle2, LockOpen, Lock,
    ClipboardList, AlertCircle, RefreshCw
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTenantBySlug, useTenantDailyClosings } from "@/hooks/useTenantRecords"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { formatCurrency } from "@/lib/utils"

// ──────────────────────────────────────────────────────────────────────────────
// Tipos locais
// ──────────────────────────────────────────────────────────────────────────────

interface CommissionByEmployee {
    employeeId: string
    employeeName: string
    totalServices: number
    baseAmount: number
    commissionRate: number
    commissionAmount: number
}

interface DaySummary {
    totalAppointments: number
    grossRevenue: number
    totalDiscounts: number
    netRevenue: number
    totalCommissions: number
    revenuePix: number
    revenueCash: number
    revenueDebit: number
    revenueCredit: number
    revenueOther: number
    commissionsByEmployee: CommissionByEmployee[]
}

const EMPTY_SUMMARY: DaySummary = {
    totalAppointments: 0, grossRevenue: 0, totalDiscounts: 0,
    netRevenue: 0, totalCommissions: 0, revenuePix: 0, revenueCash: 0,
    revenueDebit: 0, revenueCredit: 0, revenueOther: 0, commissionsByEmployee: [],
}

// ──────────────────────────────────────────────────────────────────────────────
// Page
// ──────────────────────────────────────────────────────────────────────────────

export default function FechamentoPage() {
    const params = useParams()
    const tenantSlug = params.tenantSlug as string
    const { data: tenant } = useTenantBySlug(tenantSlug)
    const { data: closings, refetch: refetchClosings } = useTenantDailyClosings(tenant?.id)

    const [selectedDate, setSelectedDate] = useState<string>(
        () => new Date().toLocaleDateString("en-CA") // YYYY-MM-DD local
    )
    const [dayData, setDayData] = useState<DaySummary | null>(null)
    const [loadingDay, setLoadingDay] = useState(false)
    const [closing, setClosing] = useState(false)

    const existingClosing = closings.find(c => c.closingDate === selectedDate)
    const isClosed = existingClosing?.status === "closed"

    // ── Busca atendimentos + comissões do dia ──────────────────────────────────
    const fetchDayData = useCallback(async () => {
        if (!tenant?.id || !isSupabaseConfigured) {
            setDayData(EMPTY_SUMMARY)
            return
        }
        const supabase = getSupabaseBrowserClient()
        if (!supabase) { setDayData(EMPTY_SUMMARY); return }

        setLoadingDay(true)
        try {
            // 1. Atendimentos concluídos no dia
            const { data: apts } = await supabase
                .from("appointments")
                .select("id, price, final_price, discount, payment_method")
                .eq("tenant_id", tenant.id)
                .eq("status", "completed")
                .gte("start_at", `${selectedDate}T00:00:00`)
                .lte("start_at", `${selectedDate}T23:59:59`)

            if (!apts || apts.length === 0) {
                setDayData(EMPTY_SUMMARY)
                return
            }

            // 2. Comissões persistidas para esses atendimentos
            const aptIds = apts.map(a => a.id)
            const { data: commRows } = await supabase
                .from("appointment_commissions")
                .select("employee_id, commission_rate, base_amount, commission_amount, appointment_id")
                .in("appointment_id", aptIds)

            // 3. Nomes dos profissionais
            const empIds = [...new Set((commRows ?? []).map(r => r.employee_id))]
            let empMap: Record<string, string> = {}
            if (empIds.length > 0) {
                const { data: emps } = await supabase
                    .from("employees")
                    .select("id, full_name")
                    .in("id", empIds)
                empMap = Object.fromEntries((emps ?? []).map(e => [e.id, e.full_name]))
            }

            // 4. Totaliza por forma de pagamento (valor líquido = final_price - discount)
            let grossRevenue = 0, totalDiscounts = 0
            let revenuePix = 0, revenueCash = 0, revenueDebit = 0, revenueCredit = 0, revenueOther = 0

            for (const apt of apts) {
                const fp   = Number(apt.final_price ?? apt.price ?? 0)
                const disc = Number(apt.discount ?? 0)
                const net  = fp - disc
                grossRevenue   += fp
                totalDiscounts += disc
                switch (apt.payment_method) {
                    case "pix":         revenuePix    += net; break
                    case "cash":        revenueCash   += net; break
                    case "debit_card":  revenueDebit  += net; break
                    case "credit_card": revenueCredit += net; break
                    default:            revenueOther  += net
                }
            }

            // 5. Agrega comissões por profissional
            const byEmp: Record<string, { name: string; services: number; base: number; rate: number; amount: number }> = {}
            for (const c of (commRows ?? [])) {
                if (!byEmp[c.employee_id]) {
                    byEmp[c.employee_id] = {
                        name: empMap[c.employee_id] ?? "Profissional",
                        services: 0, base: 0,
                        rate: Number(c.commission_rate), amount: 0,
                    }
                }
                byEmp[c.employee_id].services += 1
                byEmp[c.employee_id].base     += Number(c.base_amount)
                byEmp[c.employee_id].amount   += Number(c.commission_amount)
            }

            const totalCommissions = Object.values(byEmp).reduce((s, e) => s + e.amount, 0)

            setDayData({
                totalAppointments: apts.length,
                grossRevenue,
                totalDiscounts,
                netRevenue: grossRevenue - totalDiscounts,
                totalCommissions,
                revenuePix, revenueCash, revenueDebit, revenueCredit, revenueOther,
                commissionsByEmployee: Object.entries(byEmp).map(([id, e]) => ({
                    employeeId: id,
                    employeeName: e.name,
                    totalServices: e.services,
                    baseAmount: e.base,
                    commissionRate: e.rate,
                    commissionAmount: e.amount,
                })),
            })
        } catch (err) {
            console.error("[FechamentoPage] fetchDayData:", err)
            setDayData(EMPTY_SUMMARY)
        } finally {
            setLoadingDay(false)
        }
    }, [tenant?.id, selectedDate])

    useEffect(() => {
        if (tenant?.id) fetchDayData()
    }, [fetchDayData, tenant?.id])

    // ── Fechar o dia ──────────────────────────────────────────────────────────
    const handleCloseDay = async () => {
        if (!tenant?.id || !dayData || !isSupabaseConfigured) return
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return
        setClosing(true)
        try {
            await supabase.from("daily_closings").upsert({
                tenant_id:          tenant.id,
                closing_date:       selectedDate,
                total_appointments: dayData.totalAppointments,
                gross_revenue:      dayData.grossRevenue,
                total_discounts:    dayData.totalDiscounts,
                net_revenue:        dayData.netRevenue,
                total_commissions:  dayData.totalCommissions,
                revenue_pix:        dayData.revenuePix,
                revenue_cash:       dayData.revenueCash,
                revenue_debit:      dayData.revenueDebit,
                revenue_credit:     dayData.revenueCredit,
                revenue_other:      dayData.revenueOther,
                status:             "closed",
                closed_at:          new Date().toISOString(),
                updated_at:         new Date().toISOString(),
            }, { onConflict: "tenant_id,closing_date" })
            refetchClosings()
        } catch (err) {
            console.error("[FechamentoPage] handleCloseDay:", err)
        } finally {
            setClosing(false)
        }
    }

    // ── Reabrir o dia ─────────────────────────────────────────────────────────
    const handleReopenDay = async () => {
        if (!tenant?.id || !isSupabaseConfigured) return
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return
        setClosing(true)
        try {
            await supabase.from("daily_closings")
                .update({ status: "open", closed_at: null, updated_at: new Date().toISOString() })
                .eq("tenant_id", tenant.id)
                .eq("closing_date", selectedDate)
            refetchClosings()
        } catch (err) {
            console.error("[FechamentoPage] handleReopenDay:", err)
        } finally {
            setClosing(false)
        }
    }

    // ── Render ────────────────────────────────────────────────────────────────
    const summary = dayData ?? EMPTY_SUMMARY
    const paymentRows = [
        { label: "PIX",             value: summary.revenuePix    },
        { label: "Dinheiro",        value: summary.revenueCash   },
        { label: "Débito",          value: summary.revenueDebit  },
        { label: "Crédito",         value: summary.revenueCredit },
        { label: "Outro",           value: summary.revenueOther  },
    ]

    return (
        <div className="space-y-8 p-8 max-w-[1200px] mx-auto pb-32">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Fechamento do Dia</h1>
                    <p className="text-slate-500 text-lg">Confira, totalize e feche o caixa do dia.</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                    />
                    <Button variant="outline" size="icon" onClick={fetchDayData} disabled={loadingDay}>
                        {loadingDay ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    </Button>
                </div>
            </div>

            {/* Status do dia */}
            <div className="flex items-center gap-3">
                {isClosed ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 gap-1.5 px-3 py-1 text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Fechado em {existingClosing?.closedAt
                            ? new Date(existingClosing.closedAt).toLocaleString("pt-BR")
                            : "—"}
                    </Badge>
                ) : (
                    <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm text-amber-600 border-amber-300">
                        <AlertCircle className="w-4 h-4" />
                        Em aberto
                    </Badge>
                )}
            </div>

            {/* Cards de resumo */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: "Atendimentos", value: summary.totalAppointments, currency: false, color: "text-slate-900 dark:text-white" },
                    { label: "Faturamento Bruto", value: summary.grossRevenue, currency: true, color: "text-slate-900 dark:text-white" },
                    { label: "Descontos", value: summary.totalDiscounts, currency: true, color: "text-red-500" },
                    { label: "Líquido (Caixa)", value: summary.netRevenue, currency: true, color: "text-emerald-600" },
                    { label: "Comissões", value: summary.totalCommissions, currency: true, color: "text-blue-600" },
                ].map(card => (
                    <Card key={card.label} className="border-none shadow-sm bg-white dark:bg-zinc-900">
                        <CardContent className="pt-4 pb-4">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{card.label}</p>
                            <p className={`text-xl font-black ${card.color}`}>
                                {loadingDay
                                    ? <span className="inline-block w-16 h-5 bg-slate-100 animate-pulse rounded" />
                                    : card.currency
                                        ? formatCurrency(card.value as number)
                                        : card.value
                                }
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Por forma de pagamento */}
                <Card className="border-none shadow-md bg-white dark:bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-base">Por Forma de Pagamento</CardTitle>
                        <CardDescription>Valores recebidos líquidos (final_price − desconto)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {paymentRows.map(row => (
                                <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-zinc-800 last:border-0">
                                    <span className="text-sm font-medium text-slate-600 dark:text-zinc-300">{row.label}</span>
                                    <span className={`text-sm font-bold ${row.value > 0 ? "text-slate-900 dark:text-white" : "text-slate-300 dark:text-zinc-600"}`}>
                                        {formatCurrency(row.value)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Comissões por profissional */}
                <Card className="border-none shadow-md bg-white dark:bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="text-base">Comissões por Profissional</CardTitle>
                        <CardDescription>Calculadas no fechamento de cada atendimento (PR 4)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {summary.commissionsByEmployee.length === 0 ? (
                            <p className="text-sm text-slate-400 py-4 text-center">
                                {loadingDay ? "Carregando..." : "Nenhuma comissão registrada neste dia."}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {summary.commissionsByEmployee.map(emp => (
                                    <div key={emp.employeeId} className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-zinc-800 last:border-0">
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{emp.employeeName}</p>
                                            <p className="text-xs text-slate-400">
                                                {emp.totalServices} atend. · base {formatCurrency(emp.baseAmount)} · {emp.commissionRate}%
                                            </p>
                                        </div>
                                        <span className="text-sm font-bold text-blue-600">{formatCurrency(emp.commissionAmount)}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Ação de fechamento */}
            <div className="flex justify-end gap-3 pt-2">
                {isClosed ? (
                    <Button
                        variant="outline"
                        onClick={handleReopenDay}
                        disabled={closing}
                        className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                        {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <LockOpen className="w-4 h-4" />}
                        Reabrir o Dia
                    </Button>
                ) : (
                    <Button
                        onClick={handleCloseDay}
                        disabled={closing || loadingDay || summary.totalAppointments === 0}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {closing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                        Fechar o Dia
                    </Button>
                )}
            </div>

            {/* Histórico de fechamentos */}
            {closings.length > 0 && (
                <Card className="border-none shadow-md bg-white dark:bg-zinc-900">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <ClipboardList className="w-4 h-4" />
                            Histórico de Fechamentos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-xl border border-slate-100 dark:border-zinc-800 overflow-hidden">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 dark:bg-zinc-800/50 text-slate-500 font-medium text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3">Data</th>
                                        <th className="px-4 py-3">Atend.</th>
                                        <th className="px-4 py-3">Bruto</th>
                                        <th className="px-4 py-3">Descontos</th>
                                        <th className="px-4 py-3">Líquido</th>
                                        <th className="px-4 py-3">Comissões</th>
                                        <th className="px-4 py-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                    {closings.slice(0, 10).map(c => (
                                        <tr
                                            key={c.id}
                                            className="hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                            onClick={() => setSelectedDate(c.closingDate)}
                                        >
                                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                                                {new Date(c.closingDate + "T12:00:00").toLocaleDateString("pt-BR")}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">{c.totalAppointments}</td>
                                            <td className="px-4 py-3 text-slate-600">{formatCurrency(c.grossRevenue)}</td>
                                            <td className="px-4 py-3 text-red-400">{formatCurrency(c.totalDiscounts)}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white">{formatCurrency(c.netRevenue)}</td>
                                            <td className="px-4 py-3 text-blue-600">{formatCurrency(c.totalCommissions)}</td>
                                            <td className="px-4 py-3">
                                                {c.status === "closed" ? (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-0 text-xs">Fechado</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">Aberto</Badge>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
