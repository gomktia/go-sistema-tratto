"use client"

import { useState } from "react"
import { CheckCircle2, CreditCard, Shield, Zap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useTenant } from "@/contexts/tenant-context"

const plans = [
    {
        name: "Pro",
        price: "97",
        features: ["Até 2 profissionais", "Agendamento Online", "Lembretes WhatsApp", "Relatórios Básicos"],
        current: false
    },
    {
        name: "Premium",
        price: "197",
        popular: true,
        features: ["Até 5 profissionais", "Financeiro Avançado", "Comissões Automáticas", "Marketing & CRM", "Clube de Fidelidade"],
        current: true // Mocked status
    },
    {
        name: "Elite",
        price: "297",
        features: ["Profissionais Ilimitados", "Multi-unidades", "Domínio Personalizado", "Gerente de Conta", "API Aberta"],
        current: false
    }
]

export default function SubscriptionPage() {
    const { currentTenant } = useTenant()

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto pb-32">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <CreditCard className="w-8 h-8 text-primary" />
                        Minha Assinatura
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Gerencie seu plano e método de pagamento.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Plan Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-32 translate-x-16" />
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground border-none mb-4">Plano Ativo</Badge>
                                    <CardTitle className="text-4xl font-black">Premium</CardTitle>
                                    <CardDescription className="text-slate-300 mt-2">Renovação automática em 15/02/2026</CardDescription>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-bold">R$ 197<span className="text-lg font-normal text-slate-400">/mês</span></div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <div className="flex gap-4">
                                <div className="flex-1 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                                    <div className="text-sm text-slate-300 mb-1">Próxima Fatura</div>
                                    <div className="text-xl font-bold">R$ 197,00</div>
                                </div>
                                <div className="flex-1 bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/5">
                                    <div className="text-sm text-slate-300 mb-1">Forma de Pagamento</div>
                                    <div className="flex items-center gap-2 font-bold">
                                        <div className="w-8 h-5 bg-white rounded flex items-center justify-center">
                                            <div className="w-2 h-2 rounded-full bg-red-500" />
                                            <div className="w-2 h-2 rounded-full bg-yellow-500 -ml-1" />
                                        </div>
                                        •••• 4242
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-black/20 p-6 flex justify-between items-center z-10 relative">
                            <span className="text-sm text-slate-300 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-emerald-400" />
                                Pagamento seguro via Stripe
                            </span>
                            <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white hover:text-white">
                                Gerenciar no Portal de Cliente
                            </Button>
                        </CardFooter>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
                        {plans.map((plan) => (
                            <Card
                                key={plan.name}
                                className={`border-2 transition-all hover:scale-105 duration-300 ${plan.current ? 'border-primary shadow-lg ring-2 ring-primary/20 bg-primary/5' : 'border-slate-100 dark:border-zinc-800'}`}
                            >
                                <CardHeader>
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-xl">{plan.name}</h3>
                                        {plan.current && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                    </div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black">R$ {plan.price}</span>
                                        <span className="text-sm text-muted-foreground">/mês</span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        className="w-full"
                                        variant={plan.current ? "outline" : (plan.popular ? "default" : "secondary")}
                                        disabled={plan.current}
                                    >
                                        {plan.current ? "Plano Atual" : "Fazer Upgrade"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* FAQ / Help */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Zap className="w-5 h-5 text-amber-500" />
                                Precisa de mais poder?
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                            <p>
                                O plano <strong>Elite</strong> libera acesso à API e permite customização total (White Label).
                            </p>
                            <Separator />
                            <div className="space-y-2">
                                <h4 className="font-semibold text-foreground">Perguntas Frequentes</h4>
                                <ul className="space-y-3">
                                    <li>
                                        <p className="font-medium text-foreground">Como cancelo?</p>
                                        <p className="text-xs">Você pode cancelar a qualquer momento no botão "Gerenciar". O acesso continua até o fim do ciclo.</p>
                                    </li>
                                    <li>
                                        <p className="font-medium text-foreground">Emite nota fiscal?</p>
                                        <p className="text-xs">Sim, enviamos automaticamente para seu e-mail todo dia 1.</p>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
