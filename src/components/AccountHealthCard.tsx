"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { companies, plans } from "@/mocks/companies"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ShieldCheck, AlertTriangle, Crown } from "lucide-react"

interface AccountHealthCardProps {
    tenantId: string
}

const statusVariants: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-600",
    trial: "bg-amber-500/10 text-amber-500",
    suspended: "bg-rose-500/10 text-rose-500",
    pending: "bg-blue-500/10 text-blue-500",
}

export function AccountHealthCard({ tenantId }: AccountHealthCardProps) {
    const company = companies.find((c) => c.id === tenantId)
    if (!company) return null

    const plan = plans.find((p) => p.id === company.planId)

    const employeeUsage = plan?.maxEmployees && plan.maxEmployees > 0
        ? Math.min(100, Math.round((company.currentEmployees / plan.maxEmployees) * 100))
        : 32

    const appointmentsUsage = plan?.maxAppointmentsPerMonth && plan.maxAppointmentsPerMonth > 0
        ? Math.min(100, Math.round((company.currentAppointmentsThisMonth / plan.maxAppointmentsPerMonth) * 100))
        : 58

    const warnings: string[] = []
    if (company.status === "trial" && company.trialEndsAt) {
        warnings.push(`Trial expira em ${format(new Date(company.trialEndsAt), "dd/MM", { locale: ptBR })}`)
    }
    if (plan?.maxEmployees && plan.maxEmployees > 0 && employeeUsage >= 80) {
        warnings.push("Quase atingindo o limite de colaboradores do plano")
    }

    return (
        <Card className="rounded-[2rem] border-none shadow-sm bg-gradient-to-br from-white to-primary/5 dark:from-zinc-900 dark:to-primary/10 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Saúde da conta</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{company.fullName}</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                        Plano {plan?.name ?? "Custom"} • Renovação em {format(new Date(company.subscriptionEndDate), "dd 'de' MMM", { locale: ptBR })}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge className={cn("text-[10px] uppercase tracking-widest border-none", statusVariants[company.status] ?? "bg-slate-100 text-slate-500")}>
                        {company.status === "active" && "Ativa"}
                        {company.status === "trial" && "Trial"}
                        {company.status === "suspended" && "Suspensa"}
                        {company.status === "pending" && "Pendente"}
                    </Badge>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-xs font-bold">
                        <ShieldCheck className="w-4 h-4" />
                        Ver contrato
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Equipe</p>
                        <span className="text-sm font-semibold text-slate-600 dark:text-zinc-200">
                            {company.currentEmployees}{plan?.maxEmployees && plan.maxEmployees > 0 ? ` / ${plan.maxEmployees}` : "+"}
                        </span>
                    </div>
                    <Progress value={employeeUsage} className="h-2 bg-slate-100 dark:bg-zinc-800" />
                    <p className="text-[11px] text-slate-400 mt-1">Inclua novos profissionais para liberar agenda extra.</p>
                </div>

                <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Agendamentos</p>
                        <span className="text-sm font-semibold text-slate-600 dark:text-zinc-200">
                            {company.currentAppointmentsThisMonth}{plan?.maxAppointmentsPerMonth && plan.maxAppointmentsPerMonth > 0 ? ` / ${plan.maxAppointmentsPerMonth}` : "+"}
                        </span>
                    </div>
                    <Progress value={appointmentsUsage} className="h-2 bg-slate-100 dark:bg-zinc-800" />
                    <p className="text-[11px] text-slate-400 mt-1">Movimento deste mês comparado ao limite do plano.</p>
                </div>
            </div>

            <div className="mt-6 flex flex-col lg:flex-row gap-4">
                <div className="flex-1 rounded-2xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Benefícios do plano</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {plan?.features.slice(0, 4).map((feature) => (
                            <Badge key={feature} variant="outline" className="rounded-xl border-slate-200 dark:border-zinc-700 text-[10px] uppercase tracking-widest">
                                {feature}
                            </Badge>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 p-4 min-w-[220px]">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Alertas</p>
                    </div>
                    {warnings.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-zinc-400">Tudo certo por aqui. Continue crescendo!</p>
                    ) : (
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-zinc-300">
                            {warnings.map((warning) => (
                                <li key={warning} className="flex items-start gap-2">
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                    {warning}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </Card>
    )
}



