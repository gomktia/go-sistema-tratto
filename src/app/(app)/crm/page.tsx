"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Heart,
    Ticket,
    Megaphone,
    Plus,
    Users,
    Clock,
    Send,
    Search,
    Filter,
    ArrowUpRight,
    TrendingUp,
    Gift,
    ShieldAlert,
    LayoutGrid,
    List as ListIcon,
    Settings
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export default function CRMPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    // Mock data for CRM
    const [coupons, setCoupons] = useState([
        { id: 1, code: "WELCOME10", type: "percent", value: 10, usage: 45, status: "active", expires: "2025-12-31" },
        { id: 2, code: "SUMMERFREE", type: "fixed", value: 20, usage: 12, status: "active", expires: "2025-12-15" },
        { id: 3, code: "VIPCLIENT", type: "percent", value: 25, usage: 8, status: "inactive", expires: "2025-11-20" },
    ])

    const inactiveCustomers = [
        { id: 1, name: "Fernanda Costa", lastVisit: "45 dias atrás", totalSpent: 850.00, risk: "high" },
        { id: 2, name: "Ricardo Santos", lastVisit: "30 dias atrás", totalSpent: 120.00, risk: "medium" },
        { id: 3, name: "Juliana Rocha", lastVisit: "60 dias atrás", totalSpent: 2200.00, risk: "high" },
        { id: 4, name: "Pedro Alvares", lastVisit: "25 dias atrás", totalSpent: 340.00, risk: "low" },
    ]

    return (
        <div className="p-6 space-y-8 max-w-7xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">CRM & Marketing</h1>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Fidelize clientes e recupere vendas.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-slate-200">
                        <Megaphone className="w-4 h-4 mr-2" /> Nova Campanha
                    </Button>
                    <Button className="rounded-xl bg-primary text-white font-bold">
                        <Plus className="w-4 h-4 mr-2" /> Criar Cupom
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Heart className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Taxa de Retenção</p>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">68%</h2>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                        <TrendingUp className="w-3 h-3" /> +4.2% este mês
                    </div>
                </Card>

                <Card className="p-6 rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 space-y-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Gift className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Cupons Ativos</p>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">12</h2>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">85 usos na última semana</p>
                </Card>

                <Card className="p-6 rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 space-y-4 text-white bg-slate-900">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Clientes em Risco</p>
                        <h2 className="text-2xl font-black">24</h2>
                    </div>
                    <p className="text-xs text-slate-400 font-medium">Não retornam há mais de 30 dias</p>
                </Card>
            </div>

            <Tabs defaultValue="campaigns" className="space-y-8">
                <TabsList className="bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl h-14 w-full md:w-auto">
                    <TabsTrigger value="campaigns" className="rounded-xl px-8 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 transition-all">
                        <Megaphone className="w-4 h-4 mr-2" /> Campanhas
                    </TabsTrigger>
                    <TabsTrigger value="coupons" className="rounded-xl px-8 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 transition-all">
                        <Ticket className="w-4 h-4 mr-2" /> Cupons de Desconto
                    </TabsTrigger>
                    <TabsTrigger value="recovery" className="rounded-xl px-8 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 transition-all text-red-500">
                        <Clock className="w-4 h-4 mr-2" /> Recuperação de Clientes
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="coupons">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">Gerenciador de Cupons</h3>
                            <div className="flex gap-4 items-center">
                                <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode('grid')}
                                        className={cn(
                                            "rounded-lg h-9 w-9 p-0 transition-all",
                                            viewMode === 'grid' ? "bg-white dark:bg-zinc-700 shadow-sm text-primary" : "text-slate-400"
                                        )}
                                    >
                                        <LayoutGrid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode('list')}
                                        className={cn(
                                            "rounded-lg h-9 w-9 p-0 transition-all",
                                            viewMode === 'list' ? "bg-white dark:bg-zinc-700 shadow-sm text-primary" : "text-slate-400"
                                        )}
                                    >
                                        <ListIcon className="w-4 h-4" />
                                    </Button>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-xl bg-slate-50 dark:bg-zinc-800">
                                    <Search className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {coupons.map(coupon => (
                                    <div key={coupon.id} className="relative p-6 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 group hover:border-primary transition-all overflow-hidden bg-slate-50/50 dark:bg-zinc-800/50">
                                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-primary/5 rounded-full group-hover:scale-150 transition-transform" />
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge className={cn(
                                                "font-bold text-[10px] uppercase",
                                                coupon.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-200 text-slate-400"
                                            )}>
                                                {coupon.status === 'active' ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                            <p className="text-xs font-bold text-slate-400">Expira em {coupon.expires}</p>
                                        </div>
                                        <h4 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white mb-1">{coupon.code}</h4>
                                        <p className="text-sm font-bold text-primary mb-6">
                                            {coupon.type === 'percent' ? `${coupon.value}% de desconto` : `R$ ${coupon.value} de desconto`}
                                        </p>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-zinc-800">
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{coupon.usage} usos</p>
                                            <Button variant="ghost" size="sm" className="font-bold text-primary text-xs h-8">Editar</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-zinc-800/50">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent border-slate-100 dark:border-zinc-800">
                                            <TableHead className="pl-6 py-4 font-bold text-[10px] uppercase tracking-widest">Código</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Desconto</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Expiração</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Usos</TableHead>
                                            <TableHead className="font-bold text-[10px] uppercase tracking-widest">Status</TableHead>
                                            <TableHead className="text-right pr-6 font-bold text-[10px] uppercase tracking-widest">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {coupons.map((coupon) => (
                                            <TableRow key={coupon.id} className="border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                                <TableCell className="pl-6 py-4">
                                                    <span className="font-black text-slate-900 dark:text-white tracking-tight">{coupon.code}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-bold text-primary">
                                                        {coupon.type === 'percent' ? `${coupon.value}%` : `R$ ${coupon.value}`}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs text-slate-400 font-medium">{coupon.expires}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">{coupon.usage}</span>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={cn(
                                                        "font-bold text-[9px] uppercase border-none",
                                                        coupon.status === 'active' ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 text-slate-400"
                                                    )}>
                                                        {coupon.status === 'active' ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary">
                                                        <Settings className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="recovery">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                                    <ShieldAlert className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Lista de Recuperação</h3>
                                    <p className="text-sm text-slate-500">Clientes que não realizam agendamentos há algum tempo.</p>
                                </div>
                            </div>
                            <Button className="rounded-xl bg-primary text-white font-bold h-12 px-6">
                                <Send className="w-4 h-4 mr-2" /> Notificar Todos via WhatsApp
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {inactiveCustomers.map(customer => (
                                <div key={customer.id} className="flex items-center justify-between p-6 rounded-3xl border border-red-50 dark:border-red-900/10 hover:bg-red-50/30 dark:hover:bg-red-900/5 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center font-black text-slate-400">
                                            {customer.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white">{customer.name}</h4>
                                            <div className="flex items-center gap-3 mt-1 text-xs font-medium text-slate-400">
                                                <span>Total gasto: R$ {customer.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1 text-red-500 font-bold">
                                                    <Clock className="w-3 h-3" /> {customer.lastVisit}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <Badge className={cn(
                                            "font-bold text-[10px] uppercase border-none",
                                            customer.risk === 'high' ? "bg-red-500/10 text-red-500" :
                                                customer.risk === 'medium' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                                        )}>
                                            Risco {customer.risk === 'high' ? 'Crítico' : customer.risk === 'medium' ? 'Médio' : 'Baixo'}
                                        </Badge>
                                        <Button className="rounded-xl bg-slate-900 dark:bg-zinc-800 text-white font-bold h-12 px-6 hover:bg-slate-800">
                                            <Send className="w-4 h-4 mr-2" /> Recuperar
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
