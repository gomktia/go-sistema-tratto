"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FormDialog } from "@/components/ui/form-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    Check,
    X,
    AlertCircle,
    Loader2
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

type AbsenceType = "vacation" | "sick" | "personal" | "other"
type AbsenceStatus = "pending" | "approved" | "rejected"

interface Absence {
    id: string
    type: AbsenceType
    startDate: string
    endDate: string
    reason: string
    status: AbsenceStatus
    createdAt: string
    reviewedAt?: string
    reviewedBy?: string
}

const ABSENCE_TYPES: Record<AbsenceType, { label: string, color: string }> = {
    vacation: { label: "Férias", color: "bg-blue-500/10 text-blue-600" },
    sick: { label: "Atestado Médico", color: "bg-red-500/10 text-red-600" },
    personal: { label: "Assunto Pessoal", color: "bg-amber-500/10 text-amber-600" },
    other: { label: "Outro Motivo", color: "bg-slate-500/10 text-slate-600" },
}

const STATUS_CONFIG: Record<AbsenceStatus, { label: string, icon: any, color: string }> = {
    pending: { label: "Pendente", icon: Clock, color: "bg-amber-500/10 text-amber-600" },
    approved: { label: "Aprovado", icon: Check, color: "bg-emerald-500/10 text-emerald-600" },
    rejected: { label: "Rejeitado", icon: X, color: "bg-red-500/10 text-red-600" },
}

export default function FolgasPage() {
    const { user } = useAuth()
    const [showNewRequest, setShowNewRequest] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Mock absences
    const [absences, setAbsences] = useState<Absence[]>([
        {
            id: "1",
            type: "vacation",
            startDate: "2025-01-15",
            endDate: "2025-01-20",
            reason: "Férias de janeiro",
            status: "approved",
            createdAt: "2024-12-20",
            reviewedAt: "2024-12-21",
            reviewedBy: "Gerente"
        },
        {
            id: "2",
            type: "personal",
            startDate: "2025-02-10",
            endDate: "2025-02-10",
            reason: "Compromisso familiar",
            status: "pending",
            createdAt: "2025-01-05"
        }
    ])

    const [formData, setFormData] = useState({
        type: "vacation" as AbsenceType,
        startDate: "",
        endDate: "",
        reason: ""
    })

    const handleSubmit = async () => {
        setIsSubmitting(true)

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))

        const newAbsence: Absence = {
            id: String(absences.length + 1),
            ...formData,
            status: "pending",
            createdAt: new Date().toISOString()
        }

        setAbsences([newAbsence, ...absences])
        setShowNewRequest(false)
        setFormData({
            type: "vacation",
            startDate: "",
            endDate: "",
            reason: ""
        })
        setIsSubmitting(false)
    }

    const stats = {
        pending: absences.filter(a => a.status === "pending").length,
        approved: absences.filter(a => a.status === "approved").length,
        total: absences.length
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                        Folgas & Ausências
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Solicite e gerencie suas ausências
                    </p>
                </div>
                <Button onClick={() => setShowNewRequest(true)} className="rounded-xl gap-2">
                    <Plus className="w-4 h-4" />
                    Solicitar Folga
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 rounded-2xl border-none shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.pending}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pendentes</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 rounded-2xl border-none shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <Check className="w-6 h-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.approved}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Aprovadas</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4 rounded-2xl border-none shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <CalendarIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</p>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Absences List */}
            <div className="space-y-3">
                {absences.map((absence, idx) => {
                    const typeConfig = ABSENCE_TYPES[absence.type]
                    const statusConfig = STATUS_CONFIG[absence.status]
                    const StatusIcon = statusConfig.icon

                    const startDate = new Date(absence.startDate)
                    const endDate = new Date(absence.endDate)
                    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

                    return (
                        <motion.div
                            key={absence.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="p-6 rounded-2xl border-none shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <CalendarIcon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-900 dark:text-white">
                                                    {format(startDate, "dd 'de' MMMM", { locale: ptBR })}
                                                    {days > 1 && ` - ${format(endDate, "dd 'de' MMMM", { locale: ptBR })}`}
                                                </h3>
                                                <Badge className={typeConfig.color + " border-none text-xs"}>
                                                    {typeConfig.label}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                {days} {days === 1 ? 'dia' : 'dias'}
                                            </p>
                                            {absence.reason && (
                                                <p className="text-sm text-slate-600 dark:text-zinc-400">
                                                    {absence.reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge className={statusConfig.color + " border-none gap-1"}>
                                        <StatusIcon className="w-3 h-3" />
                                        {statusConfig.label}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800">
                                    <p className="text-xs text-muted-foreground">
                                        Solicitado em {format(new Date(absence.createdAt), "dd/MM/yyyy")}
                                    </p>
                                    {absence.reviewedAt && (
                                        <p className="text-xs text-muted-foreground">
                                            Revisado por {absence.reviewedBy} em {format(new Date(absence.reviewedAt), "dd/MM/yyyy")}
                                        </p>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    )
                })}

                {absences.length === 0 && (
                    <Card className="p-12 rounded-2xl border-none shadow-lg text-center">
                        <CalendarIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                            Você ainda não solicitou nenhuma folga
                        </p>
                    </Card>
                )}
            </div>

            {/* New Request Dialog */}
            <FormDialog
                open={showNewRequest}
                onOpenChange={setShowNewRequest}
                title="Solicitar Folga"
                description="Preencha os dados da sua solicitação"
                onSubmit={handleSubmit}
                submitLabel={isSubmitting ? "Enviando..." : "Enviar Solicitação"}
                isLoading={isSubmitting}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tipo de Ausência</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value: AbsenceType) => setFormData({ ...formData, type: value })}
                        >
                            <SelectTrigger className="h-11 rounded-xl">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(ABSENCE_TYPES).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>
                                        {config.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Data Início</Label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Data Fim</Label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                min={formData.startDate}
                                className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Motivo (opcional)</Label>
                        <Textarea
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Descreva o motivo da sua ausência..."
                            className="rounded-xl resize-none"
                            rows={3}
                        />
                    </div>

                    <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-700 dark:text-blue-200">
                                <p className="font-semibold mb-1">Importante:</p>
                                <p>Sua solicitação será enviada para aprovação do gerente. Você receberá uma notificação quando for analisada.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </FormDialog>
        </div>
    )
}
