"use client"

import Link from "next/link"
import { CheckCircle2, Circle, ArrowRight, Palette, Users, Scissors, Globe, ShoppingBag } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { type Tenant } from "@/mocks/tenants"
import { services, employees } from "@/mocks/services"
import { inventory } from "@/mocks/inventory"

interface OnboardingChecklistProps {
    tenant: Tenant
    className?: string
    onStartWizard?: () => void
}

const icons = {
    brand: Palette,
    services: Scissors,
    team: Users,
    booking: Globe,
    shop: ShoppingBag,
}

export function OnboardingChecklist({ tenant, className, onStartWizard }: OnboardingChecklistProps) {
    const tenantServices = services.filter(service => service.tenantId === tenant.id)
    const tenantEmployees = employees.filter(employee => employee.tenantId === tenant.id)
    const tenantInventory = inventory.filter(item => item.tenantId === tenant.id && item.showOnline)

    const checklist = [
        {
            id: "brand",
            title: "Personalize a marca",
            description: "Defina cores, logo e domínio personalizado.",
            completed: Boolean(tenant.customPrimaryColor && tenant.customSecondaryColor),
            actionLabel: "Ir para Configurações",
            href: "/configuracoes",
        },
        {
            id: "services",
            title: "Cadastre serviços",
            description: "Adicione sua oferta principal e tempos de atendimento.",
            completed: tenantServices.length >= 3,
            actionLabel: "Gerenciar Serviços",
            href: "/servicos",
        },
        {
            id: "team",
            title: "Convide profissionais",
            description: "Garanta disponibilidade cadastrando o time.",
            completed: tenantEmployees.length >= 2,
            actionLabel: "Equipe e acessos",
            href: "/funcionarios",
        },
        {
            id: "booking",
            title: "Ative o agendamento online",
            description: "Compartilhe seu link e teste a jornada do cliente.",
            completed: Boolean(tenant.customDomain),
            actionLabel: "Ver Link Público",
            href: `/${tenant.slug}/book`,
        },
        {
            id: "shop",
            title: "Disponibilize a loja",
            description: "Selecione produtos para retirada ou delivery.",
            completed: tenantInventory.length > 0,
            actionLabel: "Configurar Loja",
            href: `/${tenant.slug}/shop`,
        },
    ]

    const completedCount = checklist.filter(item => item.completed).length
    const completionPercent = Math.round((completedCount / checklist.length) * 100)

    return (
        <Card className={cn("p-6 rounded-[2rem] border-none shadow-sm bg-white dark:bg-zinc-900", className)}>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div>
                    <p className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/70">Onboarding BeautyFlow</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Próximos passos para {tenant.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Complete a lista para liberar todo o potencial da plataforma.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Conclusão</p>
                        <p className="text-3xl font-black text-primary">{completionPercent}%</p>
                    </div>
                    {onStartWizard && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-slate-200 dark:border-zinc-700"
                            onClick={onStartWizard}
                        >
                            Iniciar passo a passo
                        </Button>
                    )}
                </div>
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden mb-6">
                <div
                    className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all"
                    style={{ width: `${completionPercent}%` }}
                />
            </div>

            <div className="space-y-4">
                {checklist.map((item) => {
                    const Icon = icons[item.id as keyof typeof icons] ?? Circle
                    return (
                        <div
                            key={item.id}
                            className={cn(
                                "flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border transition-colors",
                                item.completed
                                    ? "border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/60 dark:bg-emerald-900/10"
                                    : "border-slate-100 dark:border-zinc-800 bg-white/60 dark:bg-transparent"
                            )}
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                                    item.completed
                                        ? "border-emerald-300 bg-white dark:bg-zinc-900 text-emerald-500"
                                        : "border-slate-200 dark:border-zinc-700 text-slate-400"
                                )}>
                                    {item.completed ? (
                                        <CheckCircle2 className="w-6 h-6" />
                                    ) : (
                                        <Icon className="w-6 h-6" />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-slate-900 dark:text-white">{item.title}</p>
                                        <Badge
                                            variant={item.completed ? "default" : "outline"}
                                            className={cn(
                                                "text-[10px] font-bold uppercase tracking-widest border-none",
                                                item.completed
                                                    ? "bg-emerald-500 text-white"
                                                    : "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300"
                                            )}
                                        >
                                            {item.completed ? "Concluído" : "Pendente"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-zinc-400">{item.description}</p>
                                </div>
                            </div>
                            <Button
                                asChild
                                variant={item.completed ? "ghost" : "default"}
                                className={cn(
                                    "justify-between rounded-xl w-full sm:w-auto",
                                    item.completed ? "text-slate-500 hover:text-primary" : ""
                                )}
                            >
                                <Link href={item.href}>
                                    {item.actionLabel}
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                            </Button>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}

