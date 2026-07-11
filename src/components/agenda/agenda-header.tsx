"use client"

import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Menu, Plus, Search, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface AgendaHeaderProps {
    currentDate: Date
    onDateChange: (date: Date) => void
    onToggleSidebar: () => void
    onNewAppointment: () => void
    sidebarOpen: boolean
}

export function AgendaHeader({
    currentDate,
    onDateChange,
    onToggleSidebar,
    onNewAppointment,
    sidebarOpen,
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
        <div className="h-16 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center px-4 gap-4">
            {/* Botão toggle sidebar */}
            <Button
                variant="ghost"
                size="icon"
                onClick={onToggleSidebar}
                className="h-10 w-10"
            >
                <Menu className="h-5 w-5" />
            </Button>

            {/* Navegação de data */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate('prev')}
                    className="h-9 w-9"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="min-w-[280px] text-center">
                    <span className="text-base font-bold">
                        {format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                    <span className="text-sm text-muted-foreground ml-2">
                        {format(currentDate, "EEEE", { locale: ptBR })}
                    </span>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate('next')}
                    className="h-9 w-9"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Campo de busca */}
            <div className="flex-1 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar clientes agendados hoje"
                    className="pl-10 h-10 rounded-xl border-slate-200 dark:border-zinc-800"
                />
            </div>

            {/* Botão + Agendar */}
            <Button
                onClick={onNewAppointment}
                className="h-10 px-6 rounded-xl bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white font-semibold"
            >
                <Plus className="h-4 w-4 mr-2" />
                Agendar
            </Button>

            {/* Botão configurações (opcional) */}
            <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
            >
                <Settings className="h-4 w-4" />
            </Button>
        </div>
    )
}
