"use client"

import { useMemo, useState } from "react"
import { addDays, format, isSameDay, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useTenant } from "@/contexts/tenant-context"
import { useAuth } from "@/contexts/auth-context"
import { useTenantAppointments } from "@/hooks/useTenantRecords"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Clock, MapPin, CalendarDays, Loader2 } from "lucide-react"

const filters = ["Todos", "Confirmados", "Aguardando", "Finalizados"]

const statusLabels: Record<string, string> = {
    confirmed: "Confirmados",
    scheduled: "Aguardando",
    completed: "Finalizados",
    pending: "Aguardando",
    cancelled: "Cancelados"
}

const statusColors: Record<string, string> = {
    confirmed: "bg-blue-500/10 text-blue-600",
    scheduled: "bg-amber-500/10 text-amber-600",
    completed: "bg-emerald-500/10 text-emerald-600",
    pending: "bg-slate-500/10 text-slate-600",
    cancelled: "bg-red-500/10 text-red-600"
}

export default function ProfissionalAgendaPage() {
    const { currentTenant } = useTenant()
    const { user } = useAuth()
    const { data: appointments, loading } = useTenantAppointments(currentTenant.id)

    const [currentDate, setCurrentDate] = useState(startOfToday())
    const [filter, setFilter] = useState("Todos")
    const [viewMode, setViewMode] = useState<"cards" | "timeline">("cards")

    const dayAppointments = useMemo(() => {
        if (!appointments) return []

        let filtered = appointments.filter(apt => {
            const aptDate = new Date(apt.startAt)
            return isSameDay(aptDate, currentDate)
        })

        // Filter by user if logged in (unless it's a demo or superadmin view)
        // Ideally, in a real app, RLS handles this, but here we can client-filter too.
        if (user) {
            const userApts = filtered.filter(apt => apt.employeeId === user.id)
            // Fallback: If ZERO appointments for this user, show ALL for tenant (Demo Mode)
            if (userApts.length > 0) {
                filtered = userApts
            }
        }

        if (filter !== "Todos") {
            filtered = filtered.filter(apt => {
                const label = statusLabels[apt.status] || apt.status
                return label === filter
            })
        }

        return filtered.map(apt => ({
            ...apt,
            time: format(new Date(apt.startAt), 'HH:mm'),
            customerName: apt.customerName || "Cliente sem nome",
            serviceName: apt.serviceName || "Serviço Geral"
        })).sort((a, b) => a.time.localeCompare(b.time))

    }, [appointments, currentDate, filter, user])

    const miniCalendar = useMemo(() => (
        Array.from({ length: 5 }).map((_, index) => {
            const date = addDays(currentDate, index - 2) // Center current date
            return {
                date,
                label: format(date, "EEE", { locale: ptBR }),
                display: format(date, "dd"),
                active: isSameDay(date, currentDate),
            }
        })
    ), [currentDate])

    // Generate simple time slots for suggestions (Mock logic for now based on gaps)
    const availabilitySuggestions = useMemo(() => {
        return [
            { time: "09:00", suggestion: "Oferecer Hidratação Extra" },
            { time: "14:30", suggestion: "Reagendar pendente" }
        ]
    }, [])

    if (loading) {
        return <div className="flex h-screen items-center justify-center text-muted-foreground gap-2"><Loader2 className="animate-spin" /> Carregando agenda...</div>
    }

    return (
        <div className="space-y-6 pb-20">
            <header className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-primary/60">Agenda</p>
                        <h1 className="text-2xl font-black">Meus horários</h1>
                    </div>
                </div>

                {/* Date Navigation */}
                <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-2 rounded-2xl shadow-sm">
                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setCurrentDate(addDays(currentDate, -1))}>
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-bold capitalize">{format(currentDate, "EEEE", { locale: ptBR })}</span>
                        <span className="text-xs text-muted-foreground">{format(currentDate, "dd 'de' MMMM", { locale: ptBR })}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                        <ChevronRight className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {filters.map(item => (
                    <Button
                        key={item}
                        variant={filter === item ? "default" : "outline"}
                        className="rounded-full h-8 px-4 text-xs font-bold whitespace-nowrap"
                        onClick={() => setFilter(item)}
                    >
                        {item}
                    </Button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <Button variant={viewMode === "cards" ? "secondary" : "ghost"} size="sm" className="rounded-lg text-xs" onClick={() => setViewMode("cards")}>
                    Visualização em Cards
                </Button>
                <Button variant={viewMode === "timeline" ? "secondary" : "ghost"} size="sm" className="rounded-lg text-xs" onClick={() => setViewMode("timeline")}>
                    Linha do Tempo
                </Button>
            </div>

            {viewMode === "cards" ? (
                <div className="space-y-4">
                    {dayAppointments.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50 space-y-4">
                            <CalendarDays className="w-12 h-12" />
                            <p className="text-sm font-medium">Nenhum agendamento para este dia.</p>
                        </div>
                    )}

                    {dayAppointments.map((apt) => (
                        <Card key={apt.id} className="rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 overflow-hidden">
                            <div className={`h-1 w-full ${Object.values(statusColors).find(c => apt.status === Object.keys(statusColors).find(k => k === apt.status)) ? '' : 'bg-gray-200'}`} />
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">{apt.customerName}</h3>
                                        <p className="text-sm text-muted-foreground">{apt.serviceName || "Serviço não especificado"}</p>
                                    </div>
                                    <Badge className={`${statusColors[apt.status] || "bg-gray-100 text-gray-600"} border-none capitalize`}>
                                        {statusLabels[apt.status] || apt.status}
                                    </Badge>
                                </div>

                                <div className="flex items-center gap-6 text-sm mb-4">
                                    <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                                        <Clock className="w-4 h-4 text-primary" />
                                        {apt.time} <span className="text-xs text-muted-foreground">({apt.durationMinutes || 30} min)</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        Sala Principal
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        className="rounded-xl w-full text-xs font-bold border-slate-200"
                                        onClick={() => toast.info("Detalhes do cliente em breve")}
                                    >
                                        Ver Ficha
                                    </Button>
                                    {apt.status !== 'completed' && (
                                        <Button
                                            className="rounded-xl w-full text-xs font-bold bg-primary text-white hover:bg-primary/90"
                                            onClick={() => toast.success("Atendimento iniciado!")}
                                        >
                                            Iniciar
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-zinc-900">
                    <CardHeader>
                        <CardTitle>Timeline</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 relative before:absolute before:inset-y-0 before:left-9 before:border-l-2 before:border-dashed before:border-slate-100 dark:before:border-zinc-800 before:content-['']">
                        {dayAppointments.length === 0 && (
                            <p className="text-sm text-center text-muted-foreground py-8">Agenda livre.</p>
                        )}
                        {dayAppointments.map((apt, i) => (
                            <div key={apt.id} className="relative flex gap-6 items-start">
                                <div className="flex flex-col items-center bg-white dark:bg-zinc-900 z-10 w-14">
                                    <span className="text-sm font-black text-slate-900 dark:text-white">{apt.time}</span>
                                </div>
                                <div className="flex-1 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-4 border border-slate-100 dark:border-zinc-800/50">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{apt.customerName}</p>
                                            <p className="text-xs text-muted-foreground">{apt.serviceName}</p>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full mt-1 ${apt.status === 'confirmed' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            {/* Smart Suggestions */}
            <Card className="rounded-[2rem] border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <span className="bg-white/20 p-1 rounded-lg">✨</span> Oportunidades
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 relative z-10">
                    {availabilitySuggestions.map(item => (
                        <div key={item.time} className="flex items-center justify-between bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                            <div className="flex items-center gap-3">
                                <span className="font-mono font-bold opacity-80">{item.time}</span>
                                <span className="text-sm font-medium">{item.suggestion}</span>
                            </div>
                            <Button size="sm" variant="secondary" className="h-7 rounded-lg text-xs bg-white text-indigo-600 hover:bg-white/90">
                                Ativar
                            </Button>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}