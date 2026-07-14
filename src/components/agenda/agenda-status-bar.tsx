"use client"

import { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { AppointmentStatus } from "@/types/catalog"
import { cn } from "@/lib/utils"

interface StatusCount {
    all: number
    pending: number
    confirmed: number
    in_progress: number
    completed: number
    cancelled: number
    no_show: number
}

interface AgendaStatusBarProps {
    statusCounts: StatusCount
    todayRevenue: number
    selectedStatuses: AppointmentStatus[]
    onStatusFilterChange: (statuses: AppointmentStatus[]) => void
    showCancelled: boolean
    onShowCancelledChange: (show: boolean) => void
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; status?: AppointmentStatus }> = {
    all: {
        label: "Todos",
        color: "text-slate-700 dark:text-slate-300",
        bgColor: "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700",
    },
    pending: {
        label: "Aguardando",
        color: "text-yellow-700 dark:text-yellow-300",
        bgColor: "bg-yellow-100/80 dark:bg-yellow-900/30 hover:bg-yellow-200/80 dark:hover:bg-yellow-900/50",
        status: "pending" as AppointmentStatus,
    },
    confirmed: {
        label: "Confirmado",
        color: "text-blue-700 dark:text-blue-300",
        bgColor: "bg-blue-100/80 dark:bg-blue-900/30 hover:bg-blue-200/80 dark:hover:bg-blue-900/50",
        status: "confirmed" as AppointmentStatus,
    },
    in_progress: {
        label: "Em atendimento",
        color: "text-purple-700 dark:text-purple-300",
        bgColor: "bg-purple-100/80 dark:bg-purple-900/30 hover:bg-purple-200/80 dark:hover:bg-purple-900/50",
        status: "in_progress" as AppointmentStatus,
    },
    completed: {
        label: "Finalizado",
        color: "text-green-700 dark:text-green-300",
        bgColor: "bg-green-100/80 dark:bg-green-900/30 hover:bg-green-200/80 dark:hover:bg-green-900/50",
        status: "completed" as AppointmentStatus,
    },
    cancelled: {
        label: "Cancelado",
        color: "text-red-700 dark:text-red-300",
        bgColor: "bg-red-100/80 dark:bg-red-900/30 hover:bg-red-200/80 dark:hover:bg-red-900/50",
        status: "cancelled" as AppointmentStatus,
    },
    no_show: {
        label: "Não compareceu",
        color: "text-orange-700 dark:text-orange-300",
        bgColor: "bg-orange-100/80 dark:bg-orange-900/30 hover:bg-orange-200/80 dark:hover:bg-orange-900/50",
        status: "no_show" as AppointmentStatus,
    },
}

export const AgendaStatusBar = memo(function AgendaStatusBar({
    statusCounts,
    todayRevenue,
    selectedStatuses,
    onStatusFilterChange,
    showCancelled,
    onShowCancelledChange,
}: AgendaStatusBarProps) {
    const isStatusSelected = (status: string) => {
        if (status === 'all') {
            return selectedStatuses.length === 0
        }
        return selectedStatuses.includes(status as AppointmentStatus)
    }

    const toggleStatus = (status: string) => {
        if (status === 'all') {
            onStatusFilterChange([])
            return
        }

        const statusValue = status as AppointmentStatus
        if (selectedStatuses.includes(statusValue)) {
            onStatusFilterChange(selectedStatuses.filter(s => s !== statusValue))
        } else {
            onStatusFilterChange([...selectedStatuses, statusValue])
        }
    }

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value / 100)
    }

    return (
        <div className="border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2">
            <div className="flex flex-wrap items-center gap-2 mb-2">
                {/* Filtros de Status */}
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                    const count = statusCounts[key as keyof StatusCount]
                    const selected = isStatusSelected(key)

                    return (
                        <Badge
                            key={key}
                            variant="outline"
                            onClick={() => toggleStatus(key)}
                            className={cn(
                                "cursor-pointer transition-all text-xs px-2 py-1 font-medium",
                                config.color,
                                selected ? config.bgColor : "bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800",
                                selected && "ring-2 ring-offset-1 ring-slate-300 dark:ring-slate-600"
                            )}
                        >
                            {config.label}
                            <span className="ml-1.5 font-bold">{count}</span>
                        </Badge>
                    )
                })}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm">
                {/* Totalizador de Receita */}
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Receita do dia:</span>
                    <span className="font-bold text-green-700 dark:text-green-400">
                        {formatCurrency(todayRevenue)}
                    </span>
                </div>

                {/* Toggle Cancelados */}
                <div className="flex items-center gap-2">
                    <Switch
                        id="show-cancelled"
                        checked={showCancelled}
                        onCheckedChange={onShowCancelledChange}
                        className="data-[state=checked]:bg-[#FF7A00]"
                    />
                    <Label htmlFor="show-cancelled" className="text-xs cursor-pointer">
                        Mostrar cancelados
                    </Label>
                </div>
            </div>
        </div>
    )
})
