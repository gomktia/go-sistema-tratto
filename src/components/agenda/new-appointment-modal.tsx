
"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTenantCustomers, useTenantServices, useTenantEmployees } from "@/hooks/useTenantRecords"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { AppointmentRecord } from "@/types/catalog"

interface NewAppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    tenantId: string
    appointment?: AppointmentRecord | null
}

type AppointmentType = "appointment" | "blocked"

const getDefaultFormData = () => ({
    customerId: "",
    serviceId: "",
    employeeId: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    notes: "",
})

export function NewAppointmentModal({ isOpen, onClose, onSuccess, tenantId, appointment }: NewAppointmentModalProps) {
    const [loading, setLoading] = useState(false)
    const [conflictError, setConflictError] = useState<string | null>(null)
    const [appointmentType, setAppointmentType] = useState<AppointmentType>("appointment")
    const [formData, setFormData] = useState(getDefaultFormData())

    const isBlocked = appointmentType === "blocked"
    const isEditing = Boolean(appointment)

    const isSubmitDisabled =
        loading ||
        !formData.employeeId ||
        !formData.date ||
        !formData.time ||
        (isBlocked && !formData.notes.trim()) ||
        (!isBlocked && (!formData.customerId || !formData.serviceId))

    const { data: customers } = useTenantCustomers(tenantId)
    const { data: services } = useTenantServices(tenantId)
    const { data: employees } = useTenantEmployees(tenantId)

    useEffect(() => {
        if (!isOpen) {
            setConflictError(null)
            return
        }

        if (!appointment) {
            setAppointmentType("appointment")
            setFormData(getDefaultFormData())
            return
        }

        const startAt = new Date(appointment.startAt)
        setAppointmentType(appointment.status === "blocked" ? "blocked" : "appointment")
        setFormData({
            customerId: appointment.customerId ?? "",
            serviceId: appointment.serviceId ?? "",
            employeeId: appointment.employeeId ?? "",
            date: format(startAt, "yyyy-MM-dd"),
            time: format(startAt, "HH:mm"),
            notes: appointment.notes ?? "",
        })
    }, [appointment, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = getSupabaseBrowserClient()
            if (!supabase) throw new Error("Supabase client failed to initialize")

            const startAt = new Date(`${formData.date}T${formData.time}:00`)

            let duration = 60
            let price = 0

            if (!isBlocked) {
                const service = services.find(s => s.id === formData.serviceId)
                duration = service?.durationMinutes || 60
                price = service?.price || 0
            }

            const endAt = new Date(startAt.getTime() + duration * 60000)

            // Verificar conflito de horário antes de salvar
            setConflictError(null)
            const conflictQuery = supabase
                .from("appointments")
                .select("id, start_at, end_at, notes")
                .eq("employee_id", formData.employeeId)
                .neq("status", "cancelled")
                .lt("start_at", endAt.toISOString())
                .gt("end_at", startAt.toISOString())

            if (isEditing && appointment) {
                conflictQuery.neq("id", appointment.id)
            }

            const { data: conflicts } = await conflictQuery

            if (conflicts && conflicts.length > 0) {
                const c = conflicts[0]
                const cStart = format(new Date(c.start_at), "HH:mm")
                const cEnd = c.end_at ? format(new Date(c.end_at), "HH:mm") : "?"
                setConflictError(
                    `Conflito: este profissional já tem um agendamento das ${cStart} às ${cEnd}.`
                )
                setLoading(false)
                return
            }

            const payload: Record<string, unknown> = {
                tenant_id: tenantId,
                employee_id: formData.employeeId,
                start_at: startAt.toISOString(),
                end_at: endAt.toISOString(),
                duration_minutes: duration,
                price,
                status: isBlocked ? "blocked" : "confirmed",
                channel: "admin",
                notes: formData.notes || null,
            }

            if (!isBlocked) {
                payload.customer_id = formData.customerId
                payload.service_id = formData.serviceId
            } else if (isEditing) {
                payload.customer_id = null
                payload.service_id = null
            }

            if (isEditing && appointment) {
                delete payload.status
                const { error } = await supabase
                    .from("appointments")
                    .update(payload)
                    .eq("id", appointment.id)

                if (error) throw error
            } else {
                const { error } = await supabase.from("appointments").insert(payload)

                if (error) throw error
            }

            onSuccess()
            onClose()
            setAppointmentType("appointment")
            setFormData(getDefaultFormData())

        } catch (error) {
            console.error("Erro ao salvar agendamento:", error)
            alert("Erro ao salvar agendamento. Verifique o console.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing
                            ? isBlocked ? "Editar Bloqueio" : "Editar Agendamento"
                            : isBlocked ? "Bloquear Horário" : "Novo Agendamento"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Ajuste profissional, data, horário e observações do registro."
                            : isBlocked
                            ? "Bloqueie um horário na agenda de um profissional."
                            : "Preencha os dados para criar um novo agendamento."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">

                    <div className="grid gap-2">
                        <Label>Tipo</Label>
                            <Select
                                value={appointmentType}
                                onValueChange={(val) => setAppointmentType(val as AppointmentType)}
                                disabled={isEditing}
                            >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="appointment">Agendamento</SelectItem>
                                <SelectItem value="blocked">Bloqueio de horário</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {!isBlocked && (
                        <>
                            <div className="grid gap-2">
                                <Label>Cliente</Label>
                                <Select
                                    value={formData.customerId}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, customerId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o cliente" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Serviço</Label>
                                <Select
                                    value={formData.serviceId}
                                    onValueChange={(val) => setFormData(prev => ({ ...prev, serviceId: val }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.map(s => (
                                            <SelectItem key={s.id} value={s.id}>{s.name} - R$ {s.price}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    <div className="grid gap-2">
                        <Label>Profissional</Label>
                        <Select
                            value={formData.employeeId}
                            onValueChange={(val) => setFormData(prev => ({ ...prev, employeeId: val }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o profissional" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map(e => (
                                    <SelectItem key={e.id} value={e.id}>{e.fullName}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Data</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="time">Horário</Label>
                            <Input
                                id="time"
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">
                            {isBlocked ? "Motivo *" : "Observações"}
                        </Label>
                        <textarea
                            id="notes"
                            rows={3}
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                            placeholder={isBlocked ? "Informe o motivo do bloqueio..." : "Observações sobre o agendamento..."}
                            value={formData.notes}
                            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        />
                    </div>

                    {conflictError && (
                        <p className="text-sm font-medium text-red-500 rounded-lg bg-red-50 px-3 py-2">
                            {conflictError}
                        </p>
                    )}

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={isSubmitDisabled}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Salvar Alterações" : isBlocked ? "Bloquear" : "Agendar"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
