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
        <div className="h-12 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center px-2 sm:px-3 gap-1.5 sm:gap-3">
            {/* Botão toggle sidebar */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="h-8 w-8 flex-shrink-0"
            >
                <Menu className="h-4 w-4" />
            </Button>

            {/* Navegação de data */}
            <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate('prev')}
                    className="h-8 w-8"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="min-w-[100px] sm:min-w-[140px] text-center">
                    <div className="text-xs sm:text-sm font-bold leading-tight">
                        {format(currentDate, "d MMM yyyy", { locale: ptBR })}
                    </div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground leading-tight capitalize hidden sm:block">
                        {format(currentDate, "EEEE", { locale: ptBR })}
                    </div>
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

            {/* Campo de busca - Escondido em mobile pequeno */}
            <div className="hidden md:flex flex-1 max-w-md">
                <div className="relative w-full">
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

            {/* Spacer para empurrar botões à direita em mobile */}
            <div className="flex-1 md:hidden" />

            {/* Botão + Agendar */}
            <Button
                onClick={onNewAppointment}
                className="h-8 px-2 sm:px-4 text-sm rounded-lg bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white font-semibold flex-shrink-0"
            >
                <Plus className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Agendar</span>
            </Button>

            {/* Botão configurações - Escondido em mobile pequeno */}
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hidden sm:flex flex-shrink-0"
            >
                <Settings className="h-3.5 w-3.5" />
            </Button>
        </div>
    )
})
