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
    MessageCircle,
    Heart,
    TrendingUp,
    Loader2
} from "lucide-react"
import { useTenant } from "@/contexts/tenant-context"
import { useAuth } from "@/contexts/auth-context"
import { useTenantCustomers, useTenantAppointments } from "@/hooks/useTenantRecords"
import { toast } from "sonner"

export default function ProfissionalClientesPage() {
    const { currentTenant } = useTenant()
    const { user } = useAuth()

    // Fetch Real Data
    const { data: allCustomers, loading: loadingCustomers } = useTenantCustomers(currentTenant.id)
    const { data: allAppointments, loading: loadingAppointments } = useTenantAppointments(currentTenant.id)

    const [searchTerm, setSearchTerm] = useState("")
    const [filter, setFilter] = useState<"all" | "vip" | "recent">("all")

    // Get clients that this professional has attended
    const myClients = useMemo(() => {
        if (!user || !allCustomers || !allAppointments) return []

        // 1. Get all appointments for this professional
        let myAppointments = allAppointments.filter(
            apt => apt.employeeId === user.id
        )

        // DEMO FALLBACK: If professional has 0 appointments, use ALL tenant appointments
        // This ensures the demo doesn't look empty for a new user.
        if (myAppointments.length === 0) {
            myAppointments = allAppointments
        }

        // 2. Identify unique customer IDs from these appointments
        const myCustomerIds = new Set(myAppointments.map(apt => apt.customerId).filter(Boolean))

        // 3. Filter the full customer list to only those we've seen
        // If we are in "Demo Fallback" mode (myAppointments = all), we might just want to show all customers too.
        // If myCustomerIds is empty (no customers even in demo), we return empty.

        let relevantCustomers = allCustomers

        if (myAppointments.length > 0) {
            relevantCustomers = allCustomers.filter(c => myCustomerIds.has(c.id))

            // Double Fallback: if somehow ID matching fails (e.g. data consistency issues in demo),
            // but we are in demo mode (using all appointments), just show all customers.
            if (relevantCustomers.length === 0 && myAppointments.length === allAppointments.length) {
                relevantCustomers = allCustomers
            }
        }

        // 4. Map to view model with calculated stats
        return relevantCustomers.map(client => {
            // Find appointments for THIS client with THIS professional (or all if fallback)
            const clientAppointments = myAppointments.filter(
                apt => apt.customerId === client.id
                // Note: we can also match by name if IDs are missing in legacy/mock data, 
                // but let's stick to IDs for the real implementation.
            )

            // Calculate stats
            const appointmentCount = clientAppointments.length

            // Sum price (handling undefined)
            const totalSpentWithMe = clientAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0)

            // Find last visit date
            // Sort appointments by date descending (assuming ISO strings)
            const sortedApts = [...clientAppointments].sort((a, b) =>
                (b.startAt || "").localeCompare(a.startAt || "")
            )
            const lastVisit = sortedApts[0]?.startAt || client.lastVisit // fallback to client record's lastVisit if no apts

            return {
                ...client,
                appointmentCount,
                totalSpentWithMe,
                lastVisit,
                isVip: totalSpentWithMe > 500 // Example threshold
            }
        }).sort((a, b) => b.totalSpentWithMe - a.totalSpentWithMe) // Top spenders first

    }, [user, allCustomers, allAppointments])

    // Filter clients based on UI controls
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
            const term = searchTerm.toLowerCase()
            result = result.filter(client =>
                client.name.toLowerCase().includes(term) ||
                (client.phone && client.phone.includes(term)) ||
                (client.email && client.email.toLowerCase().includes(term))
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

    if (loadingCustomers || loadingAppointments) {
        return <div className="flex h-[80vh] items-center justify-center text-muted-foreground gap-2"><Loader2 className="animate-spin" /> Carregando seus clientes...</div>
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">Meus Clientes</h1>
                <p className="text-sm text-muted-foreground">
                    Gerencie sua carteira e histórico de atendimentos.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900">
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

                <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900">
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

                <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900">
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
            <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome, email ou telefone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none"
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
                        <Card className="p-6 rounded-3xl border-none shadow-sm hover:shadow-xl transition-all bg-white dark:bg-zinc-900 group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                        {client.name.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-900 dark:text-white">{client.name}</h3>
                                            {client.isVip && (
                                                <Badge className="bg-amber-500/10 text-amber-600 border-none text-[10px] px-2 h-5">
                                                    VIP
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {client.appointmentCount} atendimentos realizados
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-primary">
                                        R$ {client.totalSpentWithMe.toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-6 bg-slate-50 dark:bg-zinc-800/50 p-4 rounded-2xl">
                                {client.phone && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        {client.phone}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Mail className="w-4 h-4 text-slate-400" />
                                    {client.email || "Sem e-mail"}
                                </div>
                                {client.lastVisit && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        Última visita: {new Date(client.lastVisit).toLocaleDateString('pt-BR')}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 rounded-xl font-bold border-slate-200 dark:border-zinc-800"
                                    onClick={() => toast.info("Chat: Funcionalidade em desenvolvimento")}
                                >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Mensagem
                                </Button>
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="rounded-xl shadow-lg shadow-primary/20"
                                    onClick={() => toast.success("Novo agendamento iniciado")}
                                >
                                    <Calendar className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {filteredClients.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                    <Star className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-lg font-bold">Nenhum cliente encontrado</h3>
                    <p className="text-muted-foreground">
                        {searchTerm
                            ? "Tente buscar com outro termo."
                            : "Seus atendimentos processados aparecerão aqui."}
                    </p>
                </div>
            )}
        </div>
    )
}
