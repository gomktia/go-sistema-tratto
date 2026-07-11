"use client"

import { useState } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { AgendaFilters, GridSize } from "@/types/agenda"
import type { AppointmentStatus, EmployeeRecord } from "@/types/catalog"
import { Calendar } from "@/components/ui/calendar"

interface AgendaSidebarProps {
    isOpen: boolean
    filters: AgendaFilters
    onFiltersChange: (filters: AgendaFilters) => void
    employees: EmployeeRecord[]
    serviceCategories: { id: string; name: string; shortCode?: string }[]
    onNewAppointment: () => void
    currentDate: Date
    onDateChange: (date: Date) => void
}

const STATUS_CONFIG: Array<{
    value: AppointmentStatus
    label: string
    color: string
}> = [
    { value: 'staff_unavailable', label: 'Ausência', color: '#D1D1D1' },
    { value: 'pending', label: 'Aguardando', color: '#EC9F73' },
    { value: 'confirmed', label: 'Confirmado', color: '#64A500' },
    { value: 'no_show', label: 'Não compareceu', color: '#949494' },
    { value: 'in_progress', label: 'Em atendimento', color: '#65DDC8' },
    { value: 'completed', label: 'Finalizado', color: '#88B2D5' },
    { value: 'cancelled', label: 'Cancelado', color: '#DA9CE0' },
]

export function AgendaSidebar({
    isOpen,
    filters,
    onFiltersChange,
    employees,
    serviceCategories,
    onNewAppointment,
    currentDate,
    onDateChange,
}: AgendaSidebarProps) {
    // Agrupar profissionais por inicial
    const employeesByInitial = employees.reduce((acc, emp) => {
        const initial = emp.fullName.charAt(0).toUpperCase()
        if (!acc[initial]) acc[initial] = []
        acc[initial].push(emp)
        return acc
    }, {} as Record<string, EmployeeRecord[]>)

    const initials = Object.keys(employeesByInitial).sort()

    const toggleEmployee = (employeeId: string) => {
        if (employeeId === 'all') {
            onFiltersChange({
                ...filters,
                selectedEmployees: ['all'],
            })
            return
        }

        const current = filters.selectedEmployees
        const hasAll = current.includes('all')

        if (hasAll) {
            // Se "Todos" está selecionado, trocar para apenas esse profissional
            onFiltersChange({
                ...filters,
                selectedEmployees: [employeeId],
            })
        } else {
            const hasEmployee = current.includes(employeeId)
            const newSelection = hasEmployee
                ? current.filter(id => id !== employeeId)
                : [...current, employeeId]

            onFiltersChange({
                ...filters,
                selectedEmployees: newSelection.length === 0 ? ['all'] : newSelection,
            })
        }
    }

    const toggleCategory = (categoryId: string) => {
        if (categoryId === 'all') {
            onFiltersChange({
                ...filters,
                selectedServiceCategories: ['all'],
            })
            return
        }

        const current = filters.selectedServiceCategories
        const hasAll = current.includes('all')

        if (hasAll) {
            onFiltersChange({
                ...filters,
                selectedServiceCategories: [categoryId],
            })
        } else {
            const hasCategory = current.includes(categoryId)
            const newSelection = hasCategory
                ? current.filter(id => id !== categoryId)
                : [...current, categoryId]

            onFiltersChange({
                ...filters,
                selectedServiceCategories: newSelection.length === 0 ? ['all'] : newSelection,
            })
        }
    }

    const toggleStatus = (status: AppointmentStatus) => {
        const current = filters.selectedStatuses
        const hasStatus = current.includes(status)

        const newSelection = hasStatus
            ? current.filter(s => s !== status)
            : [...current, status]

        onFiltersChange({
            ...filters,
            selectedStatuses: newSelection,
        })
    }

    const isEmployeeSelected = (employeeId: string) => {
        if (employeeId === 'all') return filters.selectedEmployees.includes('all')
        return filters.selectedEmployees.includes(employeeId)
    }

    const isCategorySelected = (categoryId: string) => {
        if (categoryId === 'all') return filters.selectedServiceCategories.includes('all')
        return filters.selectedServiceCategories.includes(categoryId)
    }

    return (
        <div
            className={cn(
                "h-full border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
                isOpen ? "w-[280px]" : "w-0"
            )}
        >
            {isOpen && (
                <div className="flex flex-col h-full overflow-y-auto p-4 space-y-6">
                    {/* 1. Calendário Mensal */}
                    <div>
                        <Calendar
                            mode="single"
                            selected={currentDate}
                            onSelect={(date) => date && onDateChange(date)}
                            className="rounded-md border"
                        />
                    </div>

                    {/* 2. Botão Buscar e Agendar */}
                    <Button
                        onClick={onNewAppointment}
                        className="w-full bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white font-semibold rounded-xl h-11"
                    >
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Buscar e Agendar
                    </Button>

                    {/* 3. Seleção de Profissionais */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase text-muted-foreground">
                            Profissionais
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={isEmployeeSelected('all') ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleEmployee('all')}
                                className="h-8 px-3 rounded-lg text-xs font-semibold"
                            >
                                Todos
                            </Button>

                            {initials.map(initial => (
                                <Button
                                    key={initial}
                                    variant={
                                        employeesByInitial[initial].some(emp =>
                                            isEmployeeSelected(emp.id)
                                        ) && !isEmployeeSelected('all')
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => {
                                        // Seleciona todos os profissionais dessa inicial
                                        const empIds = employeesByInitial[initial].map(e => e.id)
                                        const allSelected = empIds.every(id =>
                                            filters.selectedEmployees.includes(id)
                                        )

                                        if (allSelected) {
                                            // Desselecionar todos dessa inicial
                                            const newSelection = filters.selectedEmployees.filter(
                                                id => !empIds.includes(id)
                                            )
                                            onFiltersChange({
                                                ...filters,
                                                selectedEmployees:
                                                    newSelection.length === 0 ? ['all'] : newSelection,
                                            })
                                        } else {
                                            // Selecionar todos dessa inicial
                                            const current = filters.selectedEmployees.filter(
                                                id => id !== 'all'
                                            )
                                            onFiltersChange({
                                                ...filters,
                                                selectedEmployees: [...new Set([...current, ...empIds])],
                                            })
                                        }
                                    }}
                                    className="h-8 w-8 p-0 rounded-lg text-xs font-bold"
                                >
                                    {initial}
                                </Button>
                            ))}
                        </div>

                        {/* Lista individual de profissionais */}
                        <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {employees.map(emp => (
                                <button
                                    key={emp.id}
                                    onClick={() => toggleEmployee(emp.id)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                                        isEmployeeSelected(emp.id) && !isEmployeeSelected('all')
                                            ? "bg-primary text-primary-foreground font-semibold"
                                            : "hover:bg-slate-100 dark:hover:bg-zinc-800"
                                    )}
                                >
                                    {emp.fullName}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Categoria de Serviço */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase text-muted-foreground">
                            Categorias
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={isCategorySelected('all') ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleCategory('all')}
                                className="h-8 px-3 rounded-lg text-xs font-semibold"
                            >
                                Todas
                            </Button>

                            {serviceCategories.map(cat => (
                                <Button
                                    key={cat.id}
                                    variant={
                                        isCategorySelected(cat.id) && !isCategorySelected('all')
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    onClick={() => toggleCategory(cat.id)}
                                    className="h-8 px-3 rounded-lg text-xs font-semibold"
                                >
                                    {cat.shortCode || cat.name}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* 5. Status do Agendamento */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase text-muted-foreground">
                            Status
                        </h3>

                        <div className="flex flex-wrap gap-2">
                            {STATUS_CONFIG.map(({ value, label, color }) => (
                                <Badge
                                    key={value}
                                    variant={
                                        filters.selectedStatuses.includes(value) ? 'default' : 'outline'
                                    }
                                    className={cn(
                                        "cursor-pointer transition-all h-7 px-3 text-xs font-semibold",
                                        filters.selectedStatuses.includes(value) &&
                                            "border-transparent text-white"
                                    )}
                                    style={
                                        filters.selectedStatuses.includes(value)
                                            ? { backgroundColor: color }
                                            : { borderColor: color, color: color }
                                    }
                                    onClick={() => toggleStatus(value)}
                                >
                                    {label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* 6. Fechamento de Conta */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase text-muted-foreground">
                            Fechamento
                        </h3>

                        <div className="flex gap-2">
                            <Button
                                variant={filters.accountClosure === 'open' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    onFiltersChange({ ...filters, accountClosure: 'open' })
                                }
                                className="flex-1 h-9 rounded-lg text-xs font-semibold"
                            >
                                Aberta
                            </Button>
                            <Button
                                variant={filters.accountClosure === 'closed' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() =>
                                    onFiltersChange({ ...filters, accountClosure: 'closed' })
                                }
                                className="flex-1 h-9 rounded-lg text-xs font-semibold"
                            >
                                Fechada
                            </Button>
                        </div>
                    </div>

                    {/* 7. Tamanho da Agenda */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase text-muted-foreground">
                            Tamanho da Agenda
                        </h3>

                        {/* Linha */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Linha (altura)</Label>
                            <RadioGroup
                                value={filters.gridSize.row}
                                onValueChange={(value: GridSize) =>
                                    onFiltersChange({
                                        ...filters,
                                        gridSize: { ...filters.gridSize, row: value },
                                    })
                                }
                                className="flex gap-2"
                            >
                                {(['PP', 'P', 'M', 'G'] as const).map(size => (
                                    <div key={size} className="flex items-center">
                                        <RadioGroupItem value={size} id={`row-${size}`} />
                                        <Label
                                            htmlFor={`row-${size}`}
                                            className="ml-2 text-xs cursor-pointer"
                                        >
                                            {size}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>

                        {/* Coluna */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Coluna (largura)</Label>
                            <RadioGroup
                                value={filters.gridSize.column}
                                onValueChange={(value: GridSize) =>
                                    onFiltersChange({
                                        ...filters,
                                        gridSize: { ...filters.gridSize, column: value },
                                    })
                                }
                                className="flex gap-2"
                            >
                                {(['PP', 'P', 'M', 'G'] as const).map(size => (
                                    <div key={size} className="flex items-center">
                                        <RadioGroupItem value={size} id={`col-${size}`} />
                                        <Label
                                            htmlFor={`col-${size}`}
                                            className="ml-2 text-xs cursor-pointer"
                                        >
                                            {size}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>

                    {/* 8. Exibição de Folga */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold uppercase text-muted-foreground">
                            Exibir Folga
                        </h3>

                        <div className="flex gap-2">
                            <Button
                                variant={filters.showAbsences ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onFiltersChange({ ...filters, showAbsences: true })}
                                className="flex-1 h-9 rounded-lg text-xs font-semibold"
                            >
                                Sim
                            </Button>
                            <Button
                                variant={!filters.showAbsences ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onFiltersChange({ ...filters, showAbsences: false })}
                                className="flex-1 h-9 rounded-lg text-xs font-semibold"
                            >
                                Não
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
