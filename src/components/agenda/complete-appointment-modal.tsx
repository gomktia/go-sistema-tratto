"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type { AppointmentRecord } from "@/types/catalog"

const PAYMENT_METHODS = [
    { value: "pix",         label: "PIX" },
    { value: "cash",        label: "Dinheiro" },
    { value: "debit_card",  label: "Cartão de Débito" },
    { value: "credit_card", label: "Cartão de Crédito" },
    { value: "other",       label: "Outro" },
]

interface CompleteAppointmentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    appointment: AppointmentRecord | null
    onSuccess: () => void
}

export function CompleteAppointmentModal({
    open,
    onOpenChange,
    appointment,
    onSuccess,
}: CompleteAppointmentModalProps) {
    const [loading, setLoading] = useState(false)
    const [finalPrice, setFinalPrice] = useState<string>("")
    const [discount, setDiscount] = useState<string>("0")
    const [paymentMethod, setPaymentMethod] = useState<string>("")

    // Pré-preencher com o preço original do appointment ao abrir
    useEffect(() => {
        if (open && appointment) {
            setFinalPrice(String(appointment.price ?? 0))
            setDiscount("0")
            setPaymentMethod("")
        }
    }, [open, appointment])

    const parsedFinalPrice = parseFloat(finalPrice) || 0
    const parsedDiscount   = parseFloat(discount) || 0
    const netValue         = Math.max(0, parsedFinalPrice - parsedDiscount)

    const isSubmitDisabled =
        loading ||
        !paymentMethod ||
        parsedFinalPrice < 0 ||
        parsedDiscount < 0

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!appointment) return
        setLoading(true)

        try {
            if (isSupabaseConfigured) {
                const supabase = getSupabaseBrowserClient()
                if (!supabase) throw new Error("Supabase client failed to initialize")

                // 1. Salvar conclusão do atendimento
                const { error: aptError } = await supabase
                    .from("appointments")
                    .update({
                        final_price:    parsedFinalPrice,
                        discount:       parsedDiscount,
                        payment_method: paymentMethod,
                        status:         "completed",
                        updated_at:     new Date().toISOString(),
                    })
                    .eq("id", appointment.id)

                if (aptError) throw aptError

                // 2. Calcular e persistir comissão (se houver profissional)
                if (appointment.employeeId) {
                    // 2.1 Buscar comissão padrão do profissional
                    const { data: empRow } = await supabase
                        .from("employees")
                        .select("commission_rate")
                        .eq("id", appointment.employeeId)
                        .single()

                    const defaultCommissionRate = empRow?.commission_rate ?? 0

                    // 2.2 Verificar se existe exceção de comissão para este serviço
                    let commissionRate = defaultCommissionRate
                    if (appointment.serviceId) {
                        const { data: exceptionRow } = await supabase
                            .from("employee_service_commissions")
                            .select("commission_rate")
                            .eq("employee_id", appointment.employeeId)
                            .eq("service_id", appointment.serviceId)
                            .single()

                        // Regra hierárquica: exceção profissional+serviço > comissão padrão
                        if (exceptionRow) {
                            commissionRate = exceptionRow.commission_rate
                        }
                    }

                    const baseAmount      = netValue  // final_price - discount
                    const commissionAmt   = baseAmount * (commissionRate / 100)

                    // Upsert: re-conclusão sobrescreve a comissão anterior
                    await supabase.from("appointment_commissions").upsert({
                        tenant_id:         appointment.tenantId,
                        appointment_id:    appointment.id,
                        employee_id:       appointment.employeeId,
                        commission_rate:   commissionRate,
                        final_price:       parsedFinalPrice,
                        discount:          parsedDiscount,
                        base_amount:       baseAmount,
                        commission_amount: commissionAmt,
                    }, { onConflict: "appointment_id" })
                }
            }

            onSuccess()
            onOpenChange(false)
        } catch (err) {
            console.error("[CompleteAppointmentModal] Erro ao concluir atendimento:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        if (!loading) onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle>Concluir Atendimento</DialogTitle>
                    <DialogDescription>
                        Confirme o valor, desconto e forma de pagamento antes de fechar o atendimento.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {/* Resumo do atendimento */}
                    {appointment && (
                        <div className="rounded-xl bg-slate-50 dark:bg-zinc-800 px-4 py-3 space-y-1 text-sm">
                            <p className="font-bold text-slate-900 dark:text-white">
                                {appointment.customerName ?? "Cliente"}
                            </p>
                            <p className="text-slate-500 dark:text-zinc-400">
                                {appointment.serviceName ?? "Serviço"}
                            </p>
                        </div>
                    )}

                    {/* Valor final */}
                    <div className="grid gap-2">
                        <Label htmlFor="final_price" className="text-xs font-bold uppercase">
                            Valor Final (R$)
                        </Label>
                        <Input
                            id="final_price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={finalPrice}
                            onChange={(e) => setFinalPrice(e.target.value)}
                            placeholder="0,00"
                        />
                    </div>

                    {/* Desconto */}
                    <div className="grid gap-2">
                        <Label htmlFor="discount" className="text-xs font-bold uppercase">
                            Desconto (R$)
                        </Label>
                        <Input
                            id="discount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="0,00"
                        />
                    </div>

                    {/* Valor líquido calculado */}
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3">
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                            Total a cobrar
                        </span>
                        <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                            R$ {netValue.toFixed(2).replace(".", ",")}
                        </span>
                    </div>

                    {/* Forma de pagamento */}
                    <div className="grid gap-2">
                        <Label className="text-xs font-bold uppercase">Forma de Pagamento</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a forma de pagamento" />
                            </SelectTrigger>
                            <SelectContent>
                                {PAYMENT_METHODS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isSubmitDisabled}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Concluir Atendimento
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
