"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { type Tenant } from "@/mocks/tenants"
import { useMemo } from "react"
import { Star, Heart, Sparkles, MessageCircle } from "lucide-react"

interface CustomerTrustBarProps {
    tenant: Tenant
    className?: string
}

export function CustomerTrustBar({ tenant, className }: CustomerTrustBarProps) {
    const stats = useMemo(() => ([
        {
            label: "Avaliação média",
            value: "4,9/5",
            description: "Baseado em 1.240 avaliações",
            icon: Star,
            accent: "text-amber-500",
        },
        {
            label: "Clientes recorrentes",
            value: "82%",
            description: "Retornam a cada 45 dias",
            icon: Heart,
            accent: "text-rose-500",
        },
        {
            label: "Tempo de resposta",
            value: "4 min",
            description: "WhatsApp e Instagram",
            icon: MessageCircle,
            accent: "text-emerald-500",
        },
    ]), [])

    return (
        <Card className={cn("rounded-[2rem] border-none shadow-sm bg-white/90 dark:bg-zinc-900/80 backdrop-blur-xl p-4 md:p-6", className)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Confiança comprovada</p>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">{tenant.fullName}</h2>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">Atendendo beleza e bem-estar com padrão BeautyFlow.</p>
                </div>
                <Button className="gap-2 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                    Ver experiências reais
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {stats.map((stat) => {
                    const Icon = stat.icon
                    return (
                        <div key={stat.label} className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 p-4 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                <Icon className={cn("w-5 h-5", stat.accent)} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</p>
                                <p className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">{stat.description}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}



