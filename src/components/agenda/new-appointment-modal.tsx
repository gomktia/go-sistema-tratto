
"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTenantCustomers, useTenantServices, useTenantEmployees } from "@/hooks/useTenantRecords"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

interface NewAppointmentModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    tenantId: string
}

export function NewAppointmentModal({ isOpen, onClose, onSuccess, tenantId }: NewAppointmentModalProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        customerId: "",
        serviceId: "",
        employeeId: "",
        date: format(new Date(), "yyyy-MM-dd"),
        time: "09:00",
        notes: ""
    })

    const { data: customers } = useTenantCustomers(tenantId)
    const { data: services } = useTenantServices(tenantId)
    const { data: employees } = useTenantEmployees(tenantId)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const supabase = getSupabaseBrowserClient()
            if (!supabase) throw new Error("Supabase client failed to initialize")

            // Combine date and time
            const startAt = new Date(`${formData.date}T${formData.time}:00`)

            // Calculate end time based on service duration
            const service = services.find(s => s.id === formData.serviceId)
            const duration = service?.durationMinutes || 60
            const endAt = new Date(startAt.getTime() + duration * 60000)

            const { error } = await supabase
                .from("appointments")
                .insert({
                    tenant_id: tenantId,
                    customer_id: formData.customerId,
                    service_id: formData.serviceId,
                    employee_id: formData.employeeId,
                    start_at: startAt.toISOString(),
                    end_at: endAt.toISOString(),
                    duration_minutes: duration,
                    price: service?.price || 0,
                    status: "confirmed", // Auto confirm for admin
                    channel: "admin"
                })

            if (error) throw error

            onSuccess()
            onClose()
            // Reset form
            setFormData({
                customerId: "",
                serviceId: "",
                employeeId: "",
                date: format(new Date(), "yyyy-MM-dd"),
                time: "09:00",
                notes: ""
            })

        } catch (error) {
            console.error("Erro ao criar agendamento:", error)
            alert("Erro ao criar agendamento. Verifique o console.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                    <DialogDescription>
                        Preencha os dados para criar um novo agendamento.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="customer">Cliente</Label>
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
                        <Label htmlFor="service">Serviço</Label>
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

                    <div className="grid gap-2">
                        <Label htmlFor="employee">Profissional</Label>
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

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
                        <Button type="submit" disabled={loading || !formData.customerId || !formData.serviceId}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Agendar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
