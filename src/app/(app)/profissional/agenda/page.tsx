"use client"

import { useMemo, useState } from "react"
import { addDays, format, isSameDay, startOfToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { appointments, services } from "@/mocks/data"
import { useTenant } from "@/contexts/tenant-context"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Clock, MapPin } from "lucide-react"

const filters = ["Todos", "Confirmados", "Aguardando", "Finalizados"]

const statusLabels: Record<string, string> = {
    confirmed: "Confirmados",
    scheduled: "Aguardando",
    completed: "Finalizados",
    pending: "Aguardando",
}

const timelineStyles: Record<string, string> = {
    confirmed: "bg-blue-500/10 text-blue-600",
    scheduled: "bg-amber-500/10 text-amber-600",
    completed: "bg-emerald-500/10 text-emerald-600",
    pending: "bg-slate-500/10 text-slate-600",
}

export default function ProfissionalAgendaPage() {
    const { currentTenant } = useTenant()
    const { user } = useAuth()
    const [currentDate, setCurrentDate] = useState(startOfToday())
    const [filter, setFilter] = useState("Todos")
    const [viewMode, setViewMode] = useState<"cards" | "timeline">("cards")

    // Filter appointments for the logged-in professional only
    const dayAppointments = useMemo(() => {
        if (!user) return []

        return appointments
            .filter(apt =>
                apt.tenantId === currentTenant.id &&
                apt.staffId === user.id // Only show this professional's appointments
            )
            .filter(apt => isSameDay(new Date(apt.date), currentDate))
            .filter(apt => filter === "Todos" || statusLabels[apt.status] === filter)
            .map(apt => ({
                ...apt,
                service: services.find(service => service.id === apt.serviceId),
            }))
    }, [currentTenant.id, currentDate, filter, user])

    const timelineSlots = useMemo(() => (
        dayAppointments
            .map(apt => ({
                id: apt.id,
                customer: apt.customer,
                service: apt.service?.name ?? "Serviço",
                status: apt.status,
                time: apt.time,
                duration: apt.duration,
            }))
            .sort((a, b) => a.time.localeCompare(b.time))
    ), [dayAppointments])

    const availabilitySuggestions = useMemo(() => (
        timelineSlots
            .filter(slot => slot.status !== "completed")
            .slice(0, 2)
            .map(slot => ({
                time: slot.time,
                suggestion: `Oferecer upgrade em ${slot.service}`,
            }))
    ), [timelineSlots])

    const miniCalendar = useMemo(() => (
        Array.from({ length: 5 }).map((_, index) => {
            const date = addDays(currentDate, index)
            return {
                date,
                label: format(date, "EEE", { locale: ptBR }),
                display: format(date, "dd"),
                active: isSameDay(date, currentDate),
            }
        })
    ), [currentDate])

    return (
        <div className="space-y-6">
            <header className="flex items-center justify-between">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-primary/60">Agenda</p>
                    <h1 className="text-2xl font-black">Meus horários</h1>
                    <p className="text-sm text-muted-foreground">Gerencie o dia sem confusão</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentDate(addDays(currentDate, -1))}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border text-sm font-semibold">
                        {format(currentDate, "dd 'de' MMM", { locale: ptBR })}
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </header>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {filters.map(item => (
                    <Button
                        key={item}
                        variant={filter === item ? "default" : "outline"}
                        className="rounded-full h-9 px-4"
                        onClick={() => setFilter(item)}
                    >
                        {item}
                    </Button>
                ))}
            </div>

            <div className="flex items-center gap-2">
                {miniCalendar.map(day => (
                    <button
                        key={day.display}
                        onClick={() => setCurrentDate(day.date)}
                        className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 border text-xs font-semibold transition-colors ${day.active ? "bg-primary text-white border-primary" : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"}`}
                    >
                        <span>{day.label}</span>
                        <span className="text-lg">{day.display}</span>
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <Button variant={viewMode === "cards" ? "default" : "outline"} className="rounded-full" onClick={() => setViewMode("cards")}>
                    Cartões
                </Button>
                <Button variant={viewMode === "timeline" ? "default" : "outline"} className="rounded-full" onClick={() => setViewMode("timeline")}>
                    Linha do tempo
                </Button>
            </div>

            {viewMode === "cards" ? (
                <div className="space-y-4">
                    {dayAppointments.length === 0 && (
                        <Card className="rounded-2xl border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                            <CardContent className="p-6 text-center text-sm text-muted-foreground">
                                Nenhum agendamento para este dia.
                            </CardContent>
                        </Card>
                    )}
                    {dayAppointments.map((apt) => (
                        <Card key={apt.id} className="rounded-2xl border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-base">{apt.customer}</CardTitle>
                                <Badge variant="outline" className="capitalize">{apt.status}</Badge>
                            </CardHeader>
                            <CardContent className="text-sm text-muted-foreground space-y-2">
                                <p className="font-semibold">{apt.service?.name}</p>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4" />
                                    {apt.time} • {apt.duration} min
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-4 h-4" />
                                    Sala 2 - {currentTenant.name}
                                </div>
                                <Button className="w-full h-10 rounded-xl mt-3">Iniciar atendimento</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Timeline inteligente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {timelineSlots.length === 0 && (
                            <p className="text-sm text-muted-foreground">Sem eventos registrados para este dia.</p>
                        )}
                        {timelineSlots.map(slot => (
                            <div key={slot.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-zinc-800 p-3">
                                <div className="w-16 text-center">
                                    <p className="text-xs font-bold text-muted-foreground">Horário</p>
                                    <p className="text-base font-black text-slate-900 dark:text-white">{slot.time}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{slot.customer}</p>
                                    <p className="text-xs text-muted-foreground">{slot.service}</p>
                                </div>
                                <Badge className={timelineStyles[slot.status] ?? "bg-slate-500/10 text-slate-600"}>
                                    {statusLabels[slot.status] ?? slot.status}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                <CardHeader>
                    <CardTitle>Encaixes e oportunidades</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {availabilitySuggestions.map(item => (
                        <div key={item.time} className="flex items-center justify-between rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-3">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex flex-col items-center justify-center text-primary font-black">
                                    {item.time}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.suggestion}</p>
                                    <p className="text-xs text-muted-foreground">Sugestão BeautyFlow</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="sm" className="rounded-full text-xs">Reservar</Button>
                        </div>
                    ))}
                    {availabilitySuggestions.length === 0 && (
                        <p className="text-sm text-muted-foreground">Sem janelas disponíveis para recomendações.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}