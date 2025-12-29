"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Search,
    Star,
    Phone,
    Mail,
    Calendar,
    DollarSign,
    MessageCircle,
    Heart,
    TrendingUp
} from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import { useAuth } from "@/contexts/auth-context"
import { clients, appointments, services } from "@/mocks/data"
import { ReviewsList } from "@/components/ReviewsList"

export default function ProfissionalClientesPage() {
    const { currentTenant } = useTenant()
    const { user } = useAuth()
    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState<"all" | "vip" | "recent">("all")

    // Get clients that this professional has attended
    const myClients = useMemo(() => {
        if (!user) return []

        // Get all appointments for this professional
        const myAppointments = appointments.filter(
            apt => apt.tenantId === currentTenant.id && apt.staffId === user.id
        )

        // Extract unique client names
        const clientNames = new Set(myAppointments.map(apt => apt.customer))

        // Find client details and calculate stats
        return clients
            .filter(client =>
                client.tenantId === currentTenant.id &&
                clientNames.has(client.name)
            )
            .map(client => {
                const clientAppointments = myAppointments.filter(
                    apt => apt.customer === client.name
                )
                // Calculate total spent from services
                const totalSpent = clientAppointments.reduce((sum, apt) => {
                    const service = services.find(s => s.id === apt.serviceId)
                    return sum + (service?.price || 0)
                }, 0)
                const lastVisit = clientAppointments[clientAppointments.length - 1]?.date

                return {
                    ...client,
                    appointmentCount: clientAppointments.length,
                    totalSpentWithMe: totalSpent,
                    lastVisit,
                    isVip: totalSpent > 500
                }
            })
            .sort((a, b) => b.totalSpentWithMe - a.totalSpentWithMe)
    }, [user, currentTenant.id])

    // Filter clients
    const filteredClients = useMemo(() => {
        let result = myClients

        if (filter === "vip") {
            result = result.filter(client => client.isVip)
        } else if (filter === "recent") {
            result = result.filter(client => {
                if (!client.lastVisit) return false
                const daysSinceVisit = Math.floor(
                    (new Date().getTime() - new Date(client.lastVisit).getTime()) / (1000 * 60 * 60 * 24)
                )
                return daysSinceVisit <= 30
            })
        }

        if (searchTerm) {
            result = result.filter(client =>
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.phone.includes(searchTerm)
            )
        }

        return result
    }, [myClients, filter, searchTerm])

    const stats = useMemo(() => ({
        total: myClients.length,
        vip: myClients.filter(c => c.isVip).length,
        recent: myClients.filter(c => {
            if (!c.lastVisit) return false
            const days = Math.floor((new Date().getTime() - new Date(c.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
            return days <= 30
        }).length
    }), [myClients])

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Meus Clientes</h1>
                <p className="text-sm text-muted-foreground">
                    Clientes que você atendeu e suas preferências
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 rounded-2xl border-none shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Star className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total de Clientes</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 rounded-2xl border-none shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Heart className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.vip}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Clientes VIP</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 rounded-2xl border-none shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.recent}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Últimos 30 dias</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search & Filters */}
            <Card className="p-4 rounded-2xl border-none shadow-lg">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 rounded-xl"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={filter === "all" ? "default" : "outline"}
                            onClick={() => setFilter("all")}
                            className="rounded-xl"
                        >
                            Todos
                        </Button>
                        <Button
                            variant={filter === "vip" ? "default" : "outline"}
                            onClick={() => setFilter("vip")}
                            className="rounded-xl"
                        >
                            VIP
                        </Button>
                        <Button
                            variant={filter === "recent" ? "default" : "outline"}
                            onClick={() => setFilter("recent")}
                            className="rounded-xl"
                        >
                            Recentes
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Client List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClients.map((client, idx) => (
                    <motion.div
                        key={client.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className="p-6 rounded-2xl border-none shadow-lg hover:shadow-xl transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white">{client.name}</h3>
                                            {client.isVip && (
                                                <Badge className="bg-amber-500/10 text-amber-600 border-none text-xs">
                                                    VIP
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {client.appointmentCount} atendimentos
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-primary">
                                        R$ {client.totalSpentWithMe}
                                    </p>
                                    <p className="text-xs text-muted-foreground">gasto total</p>
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="w-4 h-4" />
                                    {client.phone}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="w-4 h-4" />
                                    {client.email}
                                </div>
                                {client.lastVisit && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4" />
                                        Última visita: {new Date(client.lastVisit).toLocaleDateString('pt-BR')}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1 rounded-xl">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Mensagem
                                </Button>
                                <Button variant="outline" size="sm" className="rounded-xl">
                                    <Calendar className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <Card className="p-12 rounded-2xl border-none shadow-lg text-center">
                    <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        {searchTerm
                            ? "Nenhum cliente encontrado com esse termo"
                            : "Você ainda não tem clientes atendidos"}
                    </p>
                </Card>
            )}
        </div>
    )
}
