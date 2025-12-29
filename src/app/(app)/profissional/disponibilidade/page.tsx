"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
    Clock,
    Calendar,
    Plus,
    Trash2,
    Check,
    AlertCircle,
    Save
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { employees } from "@/mocks/services"

const DAYS_OF_WEEK = [
    { id: 'monday', label: 'Segunda-feira' },
    { id: 'tuesday', label: 'Terça-feira' },
    { id: 'wednesday', label: 'Quarta-feira' },
    { id: 'thursday', label: 'Quinta-feira' },
    { id: 'friday', label: 'Sexta-feira' },
    { id: 'saturday', label: 'Sábado' },
    { id: 'sunday', label: 'Domingo' },
]

type TimeSlot = {
    start: string
    end: string
}

type Schedule = {
    [dayId: string]: {
        enabled: boolean
        slots: TimeSlot[]
    }
}

export default function DisponibilidadePage() {
    const { user } = useAuth()

    // Get current employee data
    const currentEmployee = employees.find(emp => emp.id === user?.id)

    // Initialize schedule from employee working hours
    const [schedule, setSchedule] = useState<Schedule>(() => {
        const initial: Schedule = {}
        DAYS_OF_WEEK.forEach(day => {
            const employeeSlots = currentEmployee?.workingHours?.[day.id] || []
            initial[day.id] = {
                enabled: employeeSlots.length > 0,
                slots: employeeSlots.length > 0 ? employeeSlots : [{ start: '09:00', end: '18:00' }]
            }
        })
        return initial
    })

    const [hasChanges, setHasChanges] = useState(false)

    const toggleDay = (dayId: string) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                enabled: !prev[dayId].enabled
            }
        }))
        setHasChanges(true)
    }

    const updateSlot = (dayId: string, index: number, field: 'start' | 'end', value: string) => {
        setSchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                slots: prev[dayId].slots.map((slot, i) =>
                    i === index ? { ...slot, [field]: value } : slot
                )
            }
        }))
        setHasChanges(true)
    }

    const addSlot = (dayId: string) => {
        const lastSlot = schedule[dayId].slots[schedule[dayId].slots.length - 1]
        const newStart = lastSlot ? lastSlot.end : '09:00'

        setSchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                slots: [...prev[dayId].slots, { start: newStart, end: '18:00' }]
            }
        }))
        setHasChanges(true)
    }

    const removeSlot = (dayId: string, index: number) => {
        if (schedule[dayId].slots.length === 1) return

        setSchedule(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                slots: prev[dayId].slots.filter((_, i) => i !== index)
            }
        }))
        setHasChanges(true)
    }

    const handleSave = () => {
        // Here you would save to backend/Supabase
        console.log('Saving schedule:', schedule)
        setHasChanges(false)
        // Show success message
    }

    const totalHoursPerWeek = Object.entries(schedule).reduce((total, [_, day]) => {
        if (!day.enabled) return total

        const dayHours = day.slots.reduce((sum, slot) => {
            const [startHour, startMin] = slot.start.split(':').map(Number)
            const [endHour, endMin] = slot.end.split(':').map(Number)
            const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
            return sum + (minutes / 60)
        }, 0)

        return total + dayHours
    }, 0)

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                        Minha Disponibilidade
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Gerencie seus horários de atendimento
                    </p>
                </div>
                {hasChanges && (
                    <Button onClick={handleSave} className="rounded-xl gap-2">
                        <Save className="w-4 h-4" />
                        Salvar Alterações
                    </Button>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 rounded-2xl border-none shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {totalHoursPerWeek.toFixed(1)}h
                            </p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                Horas por Semana
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 rounded-2xl border-none shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">
                                {Object.values(schedule).filter(d => d.enabled).length}
                            </p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                Dias Ativos
                            </p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 rounded-2xl border-none shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            {currentEmployee?.acceptsOnlineBooking ? (
                                <Check className="w-6 h-6 text-emerald-600" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                Agendamento Online
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {currentEmployee?.acceptsOnlineBooking ? 'Ativo' : 'Desativado'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Schedule Editor */}
            <div className="space-y-3">
                {DAYS_OF_WEEK.map((day) => (
                    <motion.div
                        key={day.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Card className="p-6 rounded-2xl border-none shadow-lg">
                            <div className="space-y-4">
                                {/* Day Header */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Switch
                                            checked={schedule[day.id].enabled}
                                            onCheckedChange={() => toggleDay(day.id)}
                                        />
                                        <div>
                                            <Label className="text-base font-bold text-slate-900 dark:text-white">
                                                {day.label}
                                            </Label>
                                            {!schedule[day.id].enabled && (
                                                <p className="text-xs text-muted-foreground">
                                                    Dia de folga
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {schedule[day.id].enabled && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => addSlot(day.id)}
                                            className="rounded-xl gap-2"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Adicionar Turno
                                        </Button>
                                    )}
                                </div>

                                {/* Time Slots */}
                                {schedule[day.id].enabled && (
                                    <div className="space-y-3 ml-10">
                                        {schedule[day.id].slots.map((slot, index) => (
                                            <div key={index} className="flex items-center gap-3">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <input
                                                        type="time"
                                                        value={slot.start}
                                                        onChange={(e) => updateSlot(day.id, index, 'start', e.target.value)}
                                                        className="h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-medium"
                                                    />
                                                    <span className="text-muted-foreground">até</span>
                                                    <input
                                                        type="time"
                                                        value={slot.end}
                                                        onChange={(e) => updateSlot(day.id, index, 'end', e.target.value)}
                                                        className="h-10 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-sm font-medium"
                                                    />
                                                    <Badge variant="outline" className="text-xs">
                                                        {(() => {
                                                            const [startHour, startMin] = slot.start.split(':').map(Number)
                                                            const [endHour, endMin] = slot.end.split(':').map(Number)
                                                            const minutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
                                                            const hours = Math.floor(minutes / 60)
                                                            const mins = minutes % 60
                                                            return `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
                                                        })()}
                                                    </Badge>
                                                </div>
                                                {schedule[day.id].slots.length > 1 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeSlot(day.id, index)}
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Info Card */}
            <Card className="p-6 rounded-2xl border-none bg-blue-50 dark:bg-blue-900/20 border-blue-100">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                            Como funciona?
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
                            <li>• Ative os dias que você trabalha</li>
                            <li>• Configure os horários de cada turno</li>
                            <li>• Adicione múltiplos turnos no mesmo dia (ex: manhã e tarde)</li>
                            <li>• Suas alterações afetam novos agendamentos imediatamente</li>
                        </ul>
                    </div>
                </div>
            </Card>
        </div>
    )
}
