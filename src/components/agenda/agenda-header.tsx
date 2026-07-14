"use client"

import { memo } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Menu, Plus, Search, Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AgendaHeaderProps {
    currentDate: Date
    onDateChange: (date: Date) => void
    onToggleSidebar: () => void
    onNewAppointment: () => void
    sidebarOpen: boolean
    searchQuery: string
    onSearchChange: (query: string) => void
    totalAppointments?: number
    filteredCount?: number
}

export const AgendaHeader = memo(function AgendaHeader({
    currentDate,
    onDateChange,
    onToggleSidebar,
    onNewAppointment,
    sidebarOpen,
    searchQuery,
    onSearchChange,
    totalAppointments,
    filteredCount,
}: AgendaHeaderProps) {
    const navigateDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate)
        if (direction === 'next') {
            newDate.setDate(currentDate.getDate() + 1)
        } else {
            newDate.setDate(currentDate.getDate() - 1)
        }
        onDateChange(newDate)
    }

    return (
        <div className="h-12 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center px-3 gap-3">
            {/* Botão toggle sidebar */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="h-8 w-8"
            >
                <Menu className="h-4 w-4" />
            </Button>

            {/* Navegação de data */}
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate('prev')}
                    className="h-8 w-8"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="min-w-[200px] text-center">
                    <span className="text-sm font-bold">
                        {format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1.5">
                        {format(currentDate, "EEEE", { locale: ptBR })}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate('next')}
                    className="h-8 w-8"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Campo de busca */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Escape') {
                                onSearchChange('')
                            }
                        }}
                        placeholder="Buscar clientes agendados hoje"
                        className="pl-9 pr-9 h-8 text-sm rounded-lg border-slate-200 dark:border-zinc-800"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onSearchChange('')}
                            className="absolute right-0.5 top-1/2 -translate-y-1/2 h-7 w-7"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Botão + Agendar */}
            <Button
                onClick={onNewAppointment}
                className="h-8 px-4 text-sm rounded-lg bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white font-semibold"
            >
                <Plus className="h-4 w-4 mr-1.5" />
                Agendar
            </Button>

            {/* Botão configurações (opcional) */}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
            >
                <Settings className="h-3.5 w-3.5" />
            </Button>
        </div>
    )
})
