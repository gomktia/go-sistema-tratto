"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
    PlusCircle,
    CalendarPlus,
    Users,
    DollarSign,
    ShoppingBag,
    Sparkles,
    ArrowRight,
    Zap
} from "lucide-react"

const actions = [
    {
        icon: CalendarPlus,
        label: "Novo Agendamento",
        description: "Reserve um horário para cliente no balcão",
        href: "/agenda",
        gradient: "from-blue-600 to-indigo-600",
        bgLight: "bg-blue-50",
        textColor: "text-blue-600"
    },
    {
        icon: Users,
        label: "Cadastrar Cliente",
        description: "Adicione clientes e mantenha CRM atualizado",
        href: "/clientes",
        gradient: "from-emerald-600 to-teal-600",
        bgLight: "bg-emerald-50",
        textColor: "text-emerald-600"
    },
    {
        icon: DollarSign,
        label: "Lançar Venda",
        description: "Abra o PDV para registrar pagamento",
        href: "/financeiro",
        gradient: "from-amber-600 to-orange-600",
        bgLight: "bg-amber-50",
        textColor: "text-amber-600"
    },
    {
        icon: ShoppingBag,
        label: "Gerenciar Loja",
        description: "Atualize produtos e disponibilidade",
        href: "/estoque",
        gradient: "from-pink-600 to-rose-600",
        bgLight: "bg-pink-50",
        textColor: "text-pink-600"
    }
]

export function QuickActions() {
    return (
        <Card className="rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Atalhos Operacionais</p>
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white">O que fazer agora?</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hidden md:flex"
                >
                    <PlusCircle className="w-4 h-4" />
                    Criar fluxo
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actions.map((action, index) => {
                    const Icon = action.icon
                    return (
                        <motion.div
                            key={action.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link href={action.href} className="block h-full">
                                <div className="group h-full rounded-xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300 relative overflow-hidden">
                                    {/* Background decoration */}
                                    <div className={cn(
                                        "absolute top-0 right-0 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl -mr-16 -mt-16",
                                        action.bgLight
                                    )} />

                                    <div className="relative z-10">
                                        {/* Icon */}
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-5 shadow-lg shadow-black/10 group-hover:scale-110 transition-transform duration-300",
                                            action.gradient
                                        )}>
                                            <Icon className="w-7 h-7 text-white" />
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2 mb-4">
                                            <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                                {action.label}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-zinc-400 leading-relaxed">
                                                {action.description}
                                            </p>
                                        </div>

                                        {/* Action button */}
                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">
                                            <span>Acessar</span>
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    )
                })}
            </div>
        </Card>
    )
}
