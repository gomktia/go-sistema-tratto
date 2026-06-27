"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import {
    Trophy,
    Gift,
    Users,
    TrendingUp,
    Settings,
    Plus,
    Crown,
    Star,
    Sparkles,
    History
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function LoyaltyPage() {
    const params = useParams()
    const [rewards, setRewards] = useState([
        { id: 1, title: "Corte Gratuito", cost: 500, active: true },
        { id: 2, title: "Hidratação Premium", cost: 350, active: true },
        { id: 3, title: "10% OFF em Produtos", cost: 150, active: true },
    ])

    const [settings, setSettings] = useState({
        enabled: true,
        pointsPerCurrency: 1, // 1 ponto a cada R$ 1,00
        welcomeBonus: 50,
        expiryMonths: 12
    })

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto pb-32">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Crown className="w-8 h-8 text-amber-500 fill-amber-500" />
                        Clube Tratto
                    </h1>
                    <p className="text-slate-500 text-lg">Fidelização automática que faz seu cliente voltar sempre.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-full border border-amber-100">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                        <span className="text-sm font-bold text-amber-700">Clube Ativo</span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-indigo-600 to-violet-700 border-none text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
                    <CardHeader className="pb-2">
                        <CardTitle className="text-indigo-100 font-medium text-sm flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Pontos Distribuídos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black">125.400</div>
                        <p className="text-indigo-200 text-sm mt-1">Acumulados pelos clientes</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 shadow-sm border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-500 font-medium text-sm flex items-center gap-2">
                            <Gift className="w-4 h-4 text-amber-500" /> Recompensas Resgatadas
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 dark:text-white">48</div>
                        <p className="text-slate-400 text-sm mt-1">Este mês (+12% vs anterior)</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-zinc-900 shadow-sm border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-500 font-medium text-sm flex items-center gap-2">
                            <Users className="w-4 h-4 text-emerald-500" /> Membros do Clube
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-slate-900 dark:text-white">850</div>
                        <p className="text-slate-400 text-sm mt-1">92% da sua base de clientes</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="rewards" className="space-y-6">
                <TabsList className="bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                    <TabsTrigger value="rewards" className="rounded-lg gap-2 data-[state=active]:bg-white">
                        <Gift className="w-4 h-4" />
                        Recompensas
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-lg gap-2 data-[state=active]:bg-white">
                        <Settings className="w-4 h-4" />
                        Configurações
                    </TabsTrigger>
                    <TabsTrigger value="members" className="rounded-lg gap-2 data-[state=active]:bg-white">
                        <Users className="w-4 h-4" />
                        Membros
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="rewards">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Create New Reward Card */}
                        <button className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-slate-50 transition-all group h-[280px]">
                            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Plus className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="font-bold text-slate-900">Nova Recompensa</h3>
                            <p className="text-slate-500 text-sm text-center">Adicione um prêmio para seus clientes trocarem por pontos</p>
                        </button>

                        {rewards.map(reward => (
                            <Card key={reward.id} className="relative overflow-hidden hover:shadow-lg transition-all h-[280px] flex flex-col">
                                <div className="absolute top-0 right-0 px-4 py-1.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-bl-xl">
                                    ATIVO
                                </div>
                                <CardHeader>
                                    <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-2">
                                        <Trophy className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <CardTitle>{reward.title}</CardTitle>
                                    <CardDescription>Custo: {reward.cost} pontos</CardDescription>
                                </CardHeader>
                                <CardContent className="mt-auto">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-500">Resgates totais:</span>
                                            <span className="font-bold">124</span>
                                        </div>
                                        <Button variant="outline" className="w-full">Editar</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="settings">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Regras de Pontuação</CardTitle>
                                <CardDescription>Defina como seus clientes ganham pontos.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <Label className="flex flex-col gap-1">
                                        <span>Ativar Clube Fidelidade</span>
                                        <span className="font-normal text-slate-500 text-xs">Se desativado, clientes não acumulam pontos.</span>
                                    </Label>
                                    <Switch checked={settings.enabled} />
                                </div>

                                <div className="space-y-3">
                                    <Label>Conversão em Reais (R$)</Label>
                                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <span className="text-sm font-medium text-slate-600">A cada</span>
                                        <div className="font-bold text-slate-900">R$ 1,00</div>
                                        <span className="text-sm font-medium text-slate-600">gasto, o cliente ganha:</span>
                                        <div className="flex items-center gap-1 bg-white px-3 py-1 rounded shadow-sm border">
                                            <Input
                                                type="number"
                                                className="w-16 h-8 text-center border-none focus-visible:ring-0 p-0 font-bold"
                                                value={settings.pointsPerCurrency}
                                            />
                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Bônus de Boas-vindas</Label>
                                    <div className="flex items-center gap-2">
                                        <Input type="number" value={settings.welcomeBonus} className="w-24" />
                                        <span className="text-sm text-slate-500">pontos ao se cadastrar.</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label>Validade dos Pontos</Label>
                                    <div className="flex items-center gap-2">
                                        <Input type="number" value={settings.expiryMonths} className="w-24" />
                                        <span className="text-sm text-slate-500">meses após a data de ganho.</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="members">
                    <div className="p-10 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <Users className="w-10 h-10 mx-auto mb-4 opacity-20" />
                        <h3 className="font-medium text-slate-900">Lista de Membros</h3>
                        <p>Visualize o saldo de pontos de cada cliente aqui. Em breve.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
