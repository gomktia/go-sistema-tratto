"use client"

import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
    format,
    addDays,
    addWeeks,
    addMonths,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameDay,
    isWithinInterval,
    differenceInMinutes,
    isAfter,
    isBefore
} from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Plus,
    Users as UsersIcon,
    Clock,
    Activity,
    Sparkles,
    CheckCircle2,
    Grid3x3,
    CalendarDays,
    CalendarRange
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useTenant } from "@/contexts/tenant-context"
import { Progress } from "@/components/ui/progress"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useTenantAppointments, useTenantEmployees, useTenantServices } from "@/hooks/useTenantRecords"
import type { AppointmentRecord, ServiceRecord } from "@/types/catalog"
import { motion, AnimatePresence } from "framer-motion"
import { NewAppointmentModal } from "@/components/agenda/new-appointment-modal"

// Generate time slots from 08:00 to 20:00
const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8)

type ViewType = "day" | "week" | "month"

type AppointmentView = AppointmentRecord & {
    service?: ServiceRecord
    startDate: Date
    duration: number
}

export default function AgendaPage() {
    const searchParams = useSearchParams()
    const employeeFromUrl = searchParams.get('employee')

    const [currentDate, setCurrentDate] = useState<Date>(new Date()) // Initialize with server time, will update on mount
    const [selectedEmployee, setSelectedEmployee] = useState<string>(employeeFromUrl || "all")
    const [currentTime, setCurrentTime] = useState<Date>(new Date())
    const [viewType, setViewType] = useState<ViewType>("day")
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const { currentTenant } = useTenant()

    useEffect(() => {
        setIsMounted(true)
        setCurrentDate(new Date())
        setCurrentTime(new Date())
    }, [])



    // Update selected employee when URL param changes
    useEffect(() => {
        if (employeeFromUrl) {
            setSelectedEmployee(employeeFromUrl)
        }
    }, [employeeFromUrl])

    const { data: serviceRecords } = useTenantServices(currentTenant.id)
    const { data: employeeRecords } = useTenantEmployees(currentTenant.id)
    const { data: appointmentRecords } = useTenantAppointments(currentTenant.id)

    const serviceMap = useMemo(() => {
        const map = new Map<string, ServiceRecord>()
        serviceRecords.forEach(service => map.set(service.id, service))
        return map
    }, [serviceRecords])

    const tenantEmployees = employeeRecords

    const tenantAppointments = useMemo<AppointmentView[]>(() => (
        appointmentRecords.map((apt) => {
            const service = apt.serviceId ? serviceMap.get(apt.serviceId) : undefined
            const startDate = new Date(apt.startAt)
            const duration = apt.durationMinutes ?? service?.durationMinutes ?? 60
            return {
                ...apt,
                service,
                startDate,
                duration,
            }
        })
    ), [appointmentRecords, serviceMap])

    // Calculate date range based on view type
    const dateRange = useMemo(() => {
        switch (viewType) {
            case "week":
                return {
                    start: startOfWeek(currentDate, { locale: ptBR }),
                    end: endOfWeek(currentDate, { locale: ptBR })
                }
            case "month":
                return {
                    start: startOfMonth(currentDate),
                    end: endOfMonth(currentDate)
                }
            default: // day
                return {
                    start: currentDate,
                    end: currentDate
                }
        }
    }, [currentDate, viewType])

    const daysInRange = useMemo(() => {
        if (viewType === "day") return [currentDate]
        return eachDayOfInterval({ start: dateRange.start, end: dateRange.end })
    }, [dateRange, currentDate, viewType])

    const getBufferValue = (metadata: Record<string, unknown> | undefined, key: "bufferBefore" | "bufferAfter") => {
        const value = metadata?.[key]
        return typeof value === "number" ? value : 0
    }

    // Update real-time indicator every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    // Navigation handlers
    const navigate = (direction: 'prev' | 'next' | 'today') => {
        if (direction === 'today') {
            setCurrentDate(new Date())
            return
        }

        const multiplier = direction === 'next' ? 1 : -1
        switch (viewType) {
            case "day":
                setCurrentDate(addDays(currentDate, multiplier))
                break
            case "week":
                setCurrentDate(addWeeks(currentDate, multiplier))
                break
            case "month":
                setCurrentDate(addMonths(currentDate, multiplier))
                break
        }
    }

    const filteredAppointments = tenantAppointments.filter(apt => {
        const matchesEmployee = selectedEmployee === "all" || apt.employeeId === selectedEmployee

        if (viewType === "day") {
            return isSameDay(apt.startDate, currentDate) && matchesEmployee
        }

        return isWithinInterval(apt.startDate, { start: dateRange.start, end: dateRange.end }) && matchesEmployee
    })

    const getAppointmentWithBuffer = (apt: AppointmentView) => {
        const metadata = apt.service?.metadata as Record<string, unknown> | undefined
        const bufferBefore = getBufferValue(metadata, "bufferBefore")
        const bufferAfter = getBufferValue(metadata, "bufferAfter")
        const serviceDuration = apt.duration
        const startMinute = (apt.startDate.getHours() - 8) * 60 + apt.startDate.getMinutes() - bufferBefore
        const totalDuration = bufferBefore + serviceDuration + bufferAfter

        return {
            top: `${startMinute * 2.5}px`,
            height: `${totalDuration * 2.5}px`,
            serviceStart: bufferBefore * 2.5,
            serviceHeight: serviceDuration * 2.5,
            bufferBeforeHeight: bufferBefore * 2.5,
            bufferAfterHeight: bufferAfter * 2.5
        }
    }

    const getStatusStyles = (status: string) => {
        const styles = {
            pending: 'bg-amber-100/40 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-500/50 after:bg-amber-500',
            confirmed: 'bg-emerald-100/40 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-500/50 after:bg-emerald-500',
            completed: 'bg-slate-100/40 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-200/50 dark:border-slate-500/50 after:bg-slate-500',
            cancelled: 'bg-rose-100/40 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-200/50 dark:border-rose-500/50 after:bg-rose-500'
        }
        return styles[status as keyof typeof styles] || styles.pending
    }

    const employeesWithAppointments = selectedEmployee === "all"
        ? tenantEmployees
        : tenantEmployees.filter(e => e.id === selectedEmployee)

    const isToday = isSameDay(currentDate, new Date())
    const currentIndicatorPos = isToday
        ? ((currentTime.getHours() - 8) * 60 + currentTime.getMinutes()) * 2.5
        : -100

    // Day view - original grid view
    const dayView = (
        <div className="relative group/agenda">
            <Card className="rounded-[32px] border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
                <div className="flex h-[900px] overflow-hidden">
                    <div className="w-24 border-r border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 sticky left-0 z-20">
                        <div className="h-20 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-center">
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Horários</span>
                        </div>
                        <div className="h-full overflow-y-auto pb-20">
                            {timeSlots.map(hour => (
                                <div
                                    key={hour}
                                    className="h-[150px] flex flex-col items-center justify-start pt-4 border-b border-slate-200 dark:border-zinc-800"
                                >
                                    <span className="text-sm font-bold text-foreground">{String(hour).padStart(2, '0')}:00</span>
                                    <span className="text-xs text-muted-foreground mt-1">:30</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex overflow-x-auto">
                        <AnimatePresence mode="popLayout">
                            {employeesWithAppointments.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center p-10">
                                    <div className="text-center">
                                        <UsersIcon className="w-16 h-16 mx-auto text-slate-300 dark:text-zinc-700 mb-4" />
                                        <p className="text-lg font-bold text-slate-400">Nenhum profissional selecionado</p>
                                        <p className="text-sm text-slate-400 mt-2">Selecione um profissional ou visualize todos</p>
                                    </div>
                                </div>
                            ) : (
                                employeesWithAppointments.map((employee, idx) => {
                                    const employeeAppointments = filteredAppointments.filter(
                                        apt => apt.employeeId === employee.id
                                    )

                                    return (
                                        <motion.div
                                            key={employee.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: idx * 0.05, duration: 0.4 }}
                                            className="flex-1 min-w-[320px] border-r border-slate-200 dark:border-zinc-800 last:border-r-0 relative"
                                        >
                                            <div className="h-20 border-b border-slate-200 dark:border-zinc-800 px-6 flex items-center gap-4 bg-white dark:bg-zinc-900 sticky top-0 z-10">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                                                    {employee.fullName.charAt(0)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-base truncate text-foreground">{employee.fullName}</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">
                                                            {employeeAppointments.length} agendamentos
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="relative h-full overflow-y-auto pb-20">
                                                {timeSlots.map(hour => (
                                                    <div
                                                        key={hour}
                                                        className="h-[150px] border-b border-slate-100 dark:border-zinc-800/50 relative hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors"
                                                    />
                                                ))}

                                                {isToday && (
                                                    <motion.div
                                                        className="absolute left-0 right-0 z-10 pointer-events-none"
                                                        style={{ top: currentIndicatorPos }}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                    >
                                                        <div className="absolute left-0 w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-red-500 shadow-lg border-2 border-white dark:border-zinc-900" />
                                                        <div className="h-0.5 w-full bg-red-500" />
                                                    </motion.div>
                                                )}

                                                <AnimatePresence>
                                                    {employeeAppointments.map(apt => {
                                                        const layout = getAppointmentWithBuffer(apt)
                                                        const service = apt.service
                                                        const startLabel = format(apt.startDate, "HH:mm")
                                                        const endLabel = format(new Date(apt.startDate.getTime() + (apt.duration * 60000)), "HH:mm")

                                                        return (
                                                            <motion.div
                                                                key={apt.id}
                                                                initial={{ scale: 0.9, opacity: 0 }}
                                                                animate={{ scale: 1, opacity: 1 }}
                                                                whileHover={{ scale: 1.02, y: -2 }}
                                                                className="absolute left-3 right-3 rounded-2xl overflow-hidden shadow-lg group/card cursor-pointer"
                                                                style={{
                                                                    top: layout.top,
                                                                    height: layout.height,
                                                                    zIndex: 5
                                                                }}
                                                            >
                                                                <div className={cn(
                                                                    "absolute inset-0 border-l-4 border backdrop-blur-sm transition-all duration-300",
                                                                    getStatusStyles(apt.status)
                                                                )} />

                                                                <div className="relative h-full flex flex-col p-4">
                                                                    <div className="flex items-center justify-between gap-2 mb-2">
                                                                        <span className="text-xs font-bold">
                                                                            {startLabel} - {endLabel}
                                                                        </span>
                                                                        <Badge variant="outline" className="h-5 text-xs font-bold border-current">
                                                                            {apt.duration}m
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="font-bold text-sm mb-1 line-clamp-1">
                                                                        {apt.customerName ?? "Cliente"}
                                                                    </p>
                                                                    <p className="text-xs font-medium opacity-70 dark:opacity-90 line-clamp-1">
                                                                        {service?.name ?? apt.serviceName ?? "Serviço"}
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        )
                                                    })}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )
                                })
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </Card>
        </div>
    )

    // Week view
    const weekView = (
        <Card className="rounded-[32px] border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="p-6">
                <div className="grid grid-cols-7 gap-3">
                    {daysInRange.map((day, idx) => {
                        const dayAppointments = filteredAppointments.filter(apt => isSameDay(apt.startDate, day))
                        const isCurrentDay = isSameDay(day, new Date())

                        return (
                            <motion.div
                                key={day.toISOString()}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className={cn(
                                    "rounded-2xl border-2 overflow-hidden flex flex-col",
                                    isCurrentDay ? "border-primary bg-primary/5" : "border-slate-200 dark:border-zinc-800"
                                )}
                            >
                                {/* Header do dia - fixo */}
                                <div className={cn(
                                    "text-center py-3 px-2 border-b-2",
                                    isCurrentDay ? "border-primary bg-primary/10" : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50"
                                )}>
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                                        {format(day, "EEE", { locale: ptBR })}
                                    </p>
                                    <p className={cn(
                                        "text-xl font-bold mt-0.5",
                                        isCurrentDay ? "text-primary" : "text-foreground"
                                    )}>
                                        {format(day, "dd")}
                                    </p>
                                    {dayAppointments.length > 0 && (
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "mt-1 text-[10px] font-bold",
                                                isCurrentDay ? "border-primary text-primary" : ""
                                            )}
                                        >
                                            {dayAppointments.length} {dayAppointments.length === 1 ? 'agend.' : 'agends.'}
                                        </Badge>
                                    )}
                                </div>

                                {/* Lista de agendamentos - com scroll */}
                                <div className="flex-1 overflow-y-auto max-h-[500px] p-2 space-y-1.5">
                                    {dayAppointments.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                            <CalendarIcon className="w-8 h-8 text-slate-300 dark:text-zinc-700 mb-2" />
                                            <p className="text-[10px] text-muted-foreground font-medium">
                                                Sem agendamentos
                                            </p>
                                        </div>
                                    ) : (
                                        dayAppointments
                                            .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
                                            .map(apt => (
                                                <motion.div
                                                    key={apt.id}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={cn(
                                                        "p-2.5 rounded-lg border-l-[3px] cursor-pointer hover:shadow-lg dark:hover:shadow-xl transition-all backdrop-blur-sm",
                                                        getStatusStyles(apt.status)
                                                    )}
                                                >
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-[10px] font-bold">
                                                            {format(apt.startDate, "HH:mm")}
                                                        </span>
                                                        <Badge variant="outline" className="h-4 text-[9px] px-1.5 font-bold border-current">
                                                            {apt.duration}m
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs font-bold truncate leading-tight mb-0.5">
                                                        {apt.customerName ?? "Cliente"}
                                                    </p>
                                                    <p className="text-[10px] font-medium opacity-70 dark:opacity-90 truncate leading-tight">
                                                        {apt.service?.name ?? apt.serviceName ?? "Serviço"}
                                                    </p>
                                                    {selectedEmployee === "all" && (
                                                        <p className="text-[9px] font-bold opacity-60 dark:opacity-80 mt-1 truncate">
                                                            {tenantEmployees.find(e => e.id === apt.employeeId)?.fullName}
                                                        </p>
                                                    )}
                                                </motion.div>
                                            ))
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </Card>
    )

    // Month view
    const monthView = (
        <Card className="rounded-[32px] border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="p-6">
                <div className="grid grid-cols-7 gap-2">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                        <div key={day} className="text-center py-2 text-xs font-bold uppercase text-muted-foreground">
                            {day}
                        </div>
                    ))}
                    {daysInRange.map((day, idx) => {
                        const dayAppointments = filteredAppointments.filter(apt => isSameDay(apt.startDate, day))
                        const isCurrentDay = isSameDay(day, new Date())
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth()

                        return (
                            <motion.div
                                key={day.toISOString()}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.01 }}
                                className={cn(
                                    "aspect-square rounded-xl border p-2 cursor-pointer hover:border-primary transition-all",
                                    isCurrentDay && "border-primary bg-primary/10",
                                    !isCurrentMonth && "opacity-30",
                                    !isCurrentDay && "border-slate-200 dark:border-zinc-800"
                                )}
                                onClick={() => {
                                    setCurrentDate(day)
                                    setViewType("day")
                                }}
                            >
                                <p className={cn(
                                    "text-sm font-bold mb-1",
                                    isCurrentDay ? "text-primary" : "text-foreground"
                                )}>
                                    {format(day, "d")}
                                </p>
                                {dayAppointments.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <span className="text-[10px] font-bold text-muted-foreground">
                                            {dayAppointments.length}
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </Card>
    )

    // Stats
    const stats = useMemo(() => {
        const total = filteredAppointments.length
        const confirmed = filteredAppointments.filter(a => a.status === 'confirmed').length
        const pending = filteredAppointments.filter(a => a.status === 'pending').length
        const completed = filteredAppointments.filter(a => a.status === 'completed').length

        return { total, confirmed, pending, completed }
    }, [filteredAppointments])

    if (!isMounted) return <div className="h-screen w-full flex items-center justify-center text-muted-foreground">Carregando agenda...</div>

    return (
        <>
            <NewAppointmentModal
                isOpen={isNewAppointmentModalOpen}
                onClose={() => setIsNewAppointmentModalOpen(false)}
                onSuccess={() => {
                    window.location.reload()
                }}
                tenantId={currentTenant.id}
            />
            <div className="space-y-8 pb-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <CalendarIcon className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-semibold uppercase tracking-wider text-primary">Agenda Global</span>
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight text-foreground">
                            {viewType === "day" && format(currentDate, "dd 'de' MMMM", { locale: ptBR })}
                            {viewType === "week" && `Semana de ${format(dateRange.start, "dd/MM")} - ${format(dateRange.end, "dd/MM")}`}
                            {viewType === "month" && format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                        </h2>
                        <p className="text-muted-foreground mt-2">
                            Gerencie a escala e atendimentos {viewType === "day" ? "de hoje" : viewType === "week" ? "da semana" : "do mês"} em tempo real.
                        </p>
                    </div>
                    <Button
                        className="rounded-xl bg-primary hover:bg-primary/90 shadow-lg"
                        onClick={() => setIsNewAppointmentModalOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Agendamento
                    </Button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="rounded-2xl border-none shadow-sm bg-white dark:bg-zinc-900 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase text-muted-foreground">Total</p>
                                <p className="text-3xl font-bold text-foreground mt-1">{stats.total}</p>
                            </div>
                            <CalendarDays className="w-8 h-8 text-slate-400" />
                        </div>
                    </Card>
                    <Card className="rounded-2xl border-none shadow-sm bg-emerald-500/10 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase text-emerald-700">Confirmados</p>
                                <p className="text-3xl font-bold text-emerald-700 mt-1">{stats.confirmed}</p>
                            </div>
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                        </div>
                    </Card>
                    <Card className="rounded-2xl border-none shadow-sm bg-amber-500/10 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase text-amber-700">Pendentes</p>
                                <p className="text-3xl font-bold text-amber-700 mt-1">{stats.pending}</p>
                            </div>
                            <Clock className="w-8 h-8 text-amber-500" />
                        </div>
                    </Card>
                    <Card className="rounded-2xl border-none shadow-sm bg-slate-500/10 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase text-slate-700 dark:text-slate-400">Concluídos</p>
                                <p className="text-3xl font-bold text-slate-700 dark:text-slate-400 mt-1">{stats.completed}</p>
                            </div>
                            <Sparkles className="w-8 h-8 text-slate-500" />
                        </div>
                    </Card>
                </div>

                {/* Controls Bar */}
                <Card className="rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 p-5">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        {/* Date Navigation */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 p-1.5 rounded-2xl">
                            <Button variant="ghost" size="icon" onClick={() => navigate('prev')} className="h-10 w-10 rounded-xl">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate('today')}
                                className={cn(
                                    "px-6 rounded-xl font-medium transition-all",
                                    isToday ? "bg-white dark:bg-zinc-700 shadow-sm text-primary" : ""
                                )}
                            >
                                Hoje
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => navigate('next')} className="h-10 w-10 rounded-xl">
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Center Controls */}
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            {/* Employee Filter */}
                            <div className="flex items-center gap-3 min-w-[240px]">
                                <UsersIcon className="w-4 h-4 text-muted-foreground" />
                                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                                    <SelectTrigger className="border-slate-200 dark:border-zinc-800 rounded-xl h-10">
                                        <SelectValue placeholder="Selecione profissional" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        <SelectItem value="all" className="rounded-lg">Todos os profissionais ({tenantEmployees.length})</SelectItem>
                                        {tenantEmployees.length === 0 && (
                                            <div className="p-4 text-center text-sm text-muted-foreground">
                                                Nenhum profissional cadastrado
                                            </div>
                                        )}
                                        {tenantEmployees.map(emp => (
                                            <SelectItem key={emp.id} value={emp.id} className="rounded-lg">
                                                {emp.fullName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* View Type Selector */}
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 rounded-2xl p-1">
                            <Button
                                size="sm"
                                variant={viewType === "day" ? "default" : "ghost"}
                                className="rounded-xl"
                                onClick={() => setViewType("day")}
                            >
                                <Grid3x3 className="w-4 h-4 mr-2" />
                                Dia
                            </Button>
                            <Button
                                size="sm"
                                variant={viewType === "week" ? "default" : "ghost"}
                                className="rounded-xl"
                                onClick={() => setViewType("week")}
                            >
                                <CalendarDays className="w-4 h-4 mr-2" />
                                Semana
                            </Button>
                            <Button
                                size="sm"
                                variant={viewType === "month" ? "default" : "ghost"}
                                className="rounded-xl"
                                onClick={() => setViewType("month")}
                            >
                                <CalendarRange className="w-4 h-4 mr-2" />
                                Mês
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Calendar View */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={viewType}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {viewType === "day" && dayView}
                        {viewType === "week" && weekView}
                        {viewType === "month" && monthView}
                    </motion.div>
                </AnimatePresence>

                {/* Legend */}
                <div className="flex items-center justify-center">
                    <div className="flex items-center gap-6 px-8 py-4 rounded-3xl bg-white dark:bg-zinc-900 shadow-lg border border-slate-200 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Pendente</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Confirmado</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-slate-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Concluído</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Cancelado</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
