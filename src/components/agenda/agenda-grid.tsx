"use client"

import { useMemo, memo } from "react"
import { format, isSameDay } from "date-fns"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { EmployeeRecord, AppointmentRecord, ServiceRecord } from "@/types/catalog"
import type { GridSize } from "@/types/agenda"
import { ROW_HEIGHTS, COLUMN_WIDTHS } from "@/types/agenda"

// Generate time slots from 08:00 to 20:00
const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8)

type AppointmentView = AppointmentRecord & {
    service?: ServiceRecord
    startDate: Date
    duration: number
}

interface AgendaGridProps {
    employees: EmployeeRecord[]
    appointments: AppointmentView[]
    currentDate: Date
    gridSize: {
        row: GridSize
        column: GridSize
    }
    searchQuery?: string
    onAppointmentClick?: (appointment: AppointmentView) => void
    onUpdateStatus?: (appointmentId: string, newStatus: string) => void
}

const STATUS_COLORS: Record<string, string> = {
    staff_unavailable: '#D1D1D1',
    pending: '#EC9F73',
    confirmed: '#64A500',
    no_show: '#949494',
    in_progress: '#65DDC8',
    completed: '#88B2D5',
    cancelled: '#DA9CE0',
}

const STATUS_LABELS: Record<string, string> = {
    staff_unavailable: 'Ausência',
    pending: 'Aguardando',
    confirmed: 'Confirmado',
    no_show: 'Não compareceu',
    in_progress: 'Em atendimento',
    completed: 'Finalizado',
    cancelled: 'Cancelado',
}

export const AgendaGrid = memo(function AgendaGrid({
    employees,
    appointments,
    currentDate,
    gridSize,
    searchQuery,
    onAppointmentClick,
    onUpdateStatus,
}: AgendaGridProps) {
    const rowHeight = ROW_HEIGHTS[gridSize.row]
    const columnWidth = COLUMN_WIDTHS[gridSize.column]

    // Converter altura de string para número (para cálculos)
    const rowHeightPx = parseInt(rowHeight)

    // Filtrar appointments para o dia atual
    const todayAppointments = useMemo(
        () => appointments.filter(apt => isSameDay(apt.startDate, currentDate)),
        [appointments, currentDate]
    )

    const getAppointmentLayout = (apt: AppointmentView) => {
        const startHour = apt.startDate.getHours()
        const startMinute = apt.startDate.getMinutes()
        const offsetMinutes = (startHour - 8) * 60 + startMinute
        const top = (offsetMinutes / 60) * rowHeightPx

        const height = (apt.duration / 60) * rowHeightPx

        return {
            top: `${top}px`,
            height: `${height}px`,
        }
    }

    const getStatusColor = (status: string) => STATUS_COLORS[status] ?? STATUS_COLORS.pending

    const getStatusLabel = (status: string) => STATUS_LABELS[status] ?? status

    const getStatusStyles = (status: string) => {
        const color = getStatusColor(status)
        return {
            borderLeftColor: color,
            backgroundColor: `${color}D9`, // D9 = 85% opacity
        }
    }

    const isToday = isSameDay(currentDate, new Date())
    const currentTime = new Date()
    const currentIndicatorPos = isToday
        ? ((currentTime.getHours() - 8) * 60 + currentTime.getMinutes()) / 60 * rowHeightPx
        : -100

    return (
        <div className="flex-1 flex overflow-hidden touch-pan-x">
            {/* Coluna de horários */}
            <div
                className="border-r border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 sticky left-0 z-20"
                style={{ width: '60px' }}
            >
                <div className="h-14 border-b border-slate-200 dark:border-zinc-800" />
                <div className="overflow-y-auto">
                    {timeSlots.map(hour => (
                        <div
                            key={hour}
                            className="flex flex-col items-center justify-start pt-2 sm:pt-3 border-b border-slate-200 dark:border-zinc-800 relative"
                            style={{ height: rowHeight }}
                        >
                            <span className="text-xs sm:text-sm font-bold text-foreground">
                                {String(hour).padStart(2, '0')}:00
                            </span>
                            {/* Linha pontilhada na meia hora */}
                            <div
                                className="absolute left-0 right-0 border-t border-dashed border-slate-200 dark:border-zinc-700/50"
                                style={{ top: '50%' }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Grid de profissionais */}
            <div className="flex-1 flex overflow-x-auto scroll-smooth">
                <AnimatePresence mode="popLayout">
                    {employees.map((employee, idx) => {
                        const employeeAppointments = todayAppointments.filter(
                            apt => apt.employeeId === employee.id
                        )

                        // Largura responsiva: menor em mobile
                        const mobileWidth = '160px'
                        const desktopWidth = columnWidth

                        return (
                            <motion.div
                                key={employee.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05, duration: 0.4 }}
                                className="border-r border-slate-200 dark:border-zinc-800 last:border-r-0 relative flex-shrink-0"
                                style={{
                                    width: `min(${mobileWidth}, 100vw - 60px)`,
                                    minWidth: mobileWidth
                                }}
                            >
                                {/* Header do profissional */}
                                <div
                                    className="h-14 border-b border-slate-200 dark:border-zinc-800 px-2 sm:px-3 flex items-center gap-1.5 sm:gap-2.5 bg-white dark:bg-zinc-900 sticky top-0 z-10"
                                >
                                    {employee.avatarUrl ? (
                                        <img
                                            src={employee.avatarUrl}
                                            alt={employee.fullName}
                                            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover shadow-sm flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow-sm flex-shrink-0">
                                            {employee.fullName.charAt(0)}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-xs sm:text-sm truncate text-foreground">
                                            {employee.fullName}
                                        </p>
                                        {employee.role && (
                                            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                                {employee.role}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Grid de horários */}
                                <div className="relative">
                                    {timeSlots.map(hour => (
                                        <div
                                            key={hour}
                                            className="border-b border-slate-100 dark:border-zinc-800/50 relative hover:bg-slate-50 dark:hover:bg-zinc-900/30 transition-colors"
                                            style={{ height: rowHeight }}
                                        >
                                            {/* Linha pontilhada na meia hora */}
                                            <div
                                                className="absolute left-0 right-0 border-t border-dashed border-slate-200 dark:border-zinc-700/50"
                                                style={{ top: '50%' }}
                                            />
                                        </div>
                                    ))}

                                    {/* Indicador de hora atual */}
                                    {isToday && currentIndicatorPos >= 0 && (
                                        <motion.div
                                            className="absolute left-0 right-0 z-10 pointer-events-none"
                                            style={{ top: currentIndicatorPos }}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className="absolute left-0 w-2 h-2 -ml-1 -mt-1 rounded-full bg-red-500 border-2 border-white dark:border-zinc-900" />
                                            <div className="h-0.5 w-full bg-red-500" />
                                        </motion.div>
                                    )}

                                    {/* Cards de agendamento */}
                                    <AnimatePresence>
                                        {employeeAppointments.map(apt => {
                                            const layout = getAppointmentLayout(apt)
                                            const startLabel = format(apt.startDate, 'HH:mm')
                                            const endTime = new Date(
                                                apt.startDate.getTime() + apt.duration * 60000
                                            )
                                            const endLabel = format(endTime, 'HH:mm')

                                            const isHighlighted = searchQuery && searchQuery.trim().length > 0

                                            return (
                                                <motion.div
                                                    key={apt.id}
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    whileHover={{ scale: 1.02, y: -2 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className={cn(
                                                        "absolute left-1 right-1 sm:left-2 sm:right-2 rounded-lg sm:rounded-xl overflow-hidden shadow-lg cursor-pointer group active:shadow-xl touch-manipulation",
                                                        isHighlighted && "ring-2 ring-yellow-400 ring-offset-2"
                                                    )}
                                                    onClick={() => onAppointmentClick?.(apt)}
                                                    style={{
                                                        top: layout.top,
                                                        height: layout.height,
                                                        minHeight: '44px', // Touch target mínimo
                                                        zIndex: isHighlighted ? 10 : 5,
                                                    }}
                                                >
                                                    <div
                                                        className="absolute inset-0 border-l-4 backdrop-blur-sm transition-all duration-300"
                                                        style={getStatusStyles(apt.status)}
                                                    />

                                                    <div className="relative h-full flex flex-col p-2 sm:p-3 text-white">
                                                        <div className="flex items-center justify-between gap-1 sm:gap-2 mb-0.5 sm:mb-1">
                                                            <span className="text-[10px] sm:text-xs font-bold">
                                                                {startLabel} - {endLabel}
                                                            </span>
                                                            <Badge
                                                                variant="outline"
                                                                className="h-4 sm:h-5 text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 bg-white/90 border-none"
                                                                style={{
                                                                    color: getStatusColor(apt.status),
                                                                }}
                                                            >
                                                                {apt.duration}m
                                                            </Badge>
                                                        </div>
                                                        <p className="font-bold text-xs sm:text-sm mb-0.5 sm:mb-1 line-clamp-1">
                                                            {apt.customerName ?? 'Cliente'}
                                                        </p>
                                                        <p className="text-[10px] sm:text-xs font-medium opacity-90 line-clamp-1">
                                                            {apt.service?.name ?? apt.serviceName ?? 'Serviço'}
                                                        </p>

                                                        {/* Botões de ação (aparecem no hover em telas maiores) */}
                                                        <div className="flex flex-wrap gap-1 mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {apt.status === 'pending' && (
                                                                <button
                                                                    onClick={e => {
                                                                        e.stopPropagation()
                                                                        onUpdateStatus?.(apt.id, 'confirmed')
                                                                    }}
                                                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#64A500]/20 hover:bg-[#64A500]/40 transition-colors"
                                                                    style={{ color: '#64A500' }}
                                                                >
                                                                    Confirmar
                                                                </button>
                                                            )}

                                                            {apt.status === 'confirmed' && (
                                                                <button
                                                                    onClick={e => {
                                                                        e.stopPropagation()
                                                                        onUpdateStatus?.(apt.id, 'in_progress')
                                                                    }}
                                                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#65DDC8]/20 hover:bg-[#65DDC8]/40 transition-colors"
                                                                    style={{ color: '#65DDC8' }}
                                                                >
                                                                    Iniciar
                                                                </button>
                                                            )}

                                                            {apt.status === 'in_progress' && (
                                                                <button
                                                                    onClick={e => {
                                                                        e.stopPropagation()
                                                                        onUpdateStatus?.(apt.id, 'completed')
                                                                    }}
                                                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#88B2D5]/20 hover:bg-[#88B2D5]/40 transition-colors"
                                                                    style={{ color: '#88B2D5' }}
                                                                >
                                                                    Finalizar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </div>
    )
})
