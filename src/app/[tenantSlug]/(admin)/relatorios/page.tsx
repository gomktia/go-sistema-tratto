"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Calendar,
    Download,
    Users,
    Scissors,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"

export default function ReportsPage() {
    const params = useParams()

    // Mock Data
    const topServices = [
        { name: "Corte Masculino", amount: 12500, count: 250, growth: "+12%" },
        { name: "Barba Terapia", amount: 8400, count: 180, growth: "+5%" },
        { name: "Hidratação", amount: 4200, count: 45, growth: "-2%" },
        { name: "Coloração", amount: 3800, count: 22, growth: "+8%" },
    ]

    const topEmployees = [
        { name: "Carlos Silva", revenue: 15400, services: 180, rating: 4.9 },
        { name: "Ana Beatriz", revenue: 12800, services: 145, rating: 5.0 },
        { name: "João Pedro", revenue: 9500, services: 110, rating: 4.7 },
    ]

    return (
        <div className="space-y-8 p-8 max-w-[1600px] mx-auto pb-32">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-indigo-500 fill-indigo-500" />
                        Relatórios Gerenciais
                    </h1>
                    <p className="text-slate-500 text-lg">Inteligência de dados para tomada de decisão.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2">
                        <Calendar className="w-4 h-4" />
                        Este Mês
                    </Button>
                    <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                        <Download className="w-4 h-4" />
                        Exportar PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 border-none text-white shadow-xl relative overflow-hidden">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-blue-100 font-medium text-sm flex items-center gap-2">
                            Ticket Médio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black">R$ 145,00</div>
                        <p className="text-blue-200 text-xs mt-1 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> +12% vs mês anterior
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-500 font-medium text-sm">Taxa de Ocupação</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">78%</div>
                        <p className="text-emerald-500 text-xs mt-1 flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> Alta demanda (Sex/Sáb)
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-500 font-medium text-sm">Novos Clientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">45</div>
                        <p className="text-slate-400 text-xs mt-1">15% do total de atendimentos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-500 font-medium text-sm">Retenção</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 dark:text-white">82%</div>
                        <p className="text-amber-500 text-xs mt-1 flex items-center gap-1">
                            <ArrowDownRight className="w-3 h-3" /> Queda leve (-2%)
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Ranking de Serviços */}
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-purple-500" />
                            Serviços Mais Vendidos
                        </CardTitle>
                        <CardDescription>O que seus clientes mais procuram.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {topServices.map((service, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs">
                                            #{i + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{service.name}</p>
                                            <p className="text-xs text-slate-500">{service.count} realizados</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-slate-900">{formatCurrency(service.amount)}</p>
                                        <p className={`text-xs font-medium ${service.growth.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                                            {service.growth}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Ranking de Profissionais */}
                <Card className="border-none shadow-lg">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            Top Profissionais (Receita)
                        </CardTitle>
                        <CardDescription>Quem traz mais faturamento para o salão.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {topEmployees.map((emp, i) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${i === 0 ? 'bg-amber-400' : 'bg-slate-300'}`}>
                                            {i === 0 ? '👑' : emp.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{emp.name}</p>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <span>{emp.services} serviços</span>
                                                <span>•</span>
                                                <span className="flex items-center text-amber-500">
                                                    ★ {emp.rating}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-lg text-slate-900">{formatCurrency(emp.revenue)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
