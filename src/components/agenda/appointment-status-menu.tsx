"use client"

import { memo, useState } from "react"
import { Check, ChevronRight } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { AppointmentStatus } from "@/types/catalog"
import { cn } from "@/lib/utils"

interface AppointmentStatusMenuProps {
    currentStatus: AppointmentStatus
    onStatusChange: (newStatus: AppointmentStatus) => void
    onComplete?: () => void // Callback para abrir modal de conclusão
    disabled?: boolean
}

const STATUS_OPTIONS: Array<{
    value: AppointmentStatus
    label: string
    requiresConfirmation: boolean
}> = [
    { value: 'pending', label: 'Aguardando Confirmação', requiresConfirmation: false },
    { value: 'confirmed', label: 'Confirmado', requiresConfirmation: false },
    { value: 'in_progress', label: 'Em Atendimento', requiresConfirmation: false },
    { value: 'completed', label: 'Finalizado', requiresConfirmation: false },
    { value: 'no_show', label: 'Cliente Faltou', requiresConfirmation: true },
    { value: 'cancelled', label: 'Cancelado', requiresConfirmation: true },
]

export const AppointmentStatusMenu = memo(function AppointmentStatusMenu({
    currentStatus,
    onStatusChange,
    onComplete,
    disabled = false,
}: AppointmentStatusMenuProps) {
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
    const [pendingStatus, setPendingStatus] = useState<AppointmentStatus | null>(null)

    const handleStatusClick = (status: AppointmentStatus, requiresConfirmation: boolean) => {
        if (status === currentStatus) return

        // Status "completed" abre modal de conclusão (se callback fornecido)
        if (status === 'completed' && onComplete) {
            onComplete()
            return
        }

        if (requiresConfirmation) {
            setPendingStatus(status)
            setConfirmDialogOpen(true)
        } else {
            onStatusChange(status)
        }
    }

    const handleConfirm = () => {
        if (pendingStatus) {
            onStatusChange(pendingStatus)
            setPendingStatus(null)
        }
        setConfirmDialogOpen(false)
    }

    const handleCancel = () => {
        setPendingStatus(null)
        setConfirmDialogOpen(false)
    }

    const getConfirmationMessage = () => {
        if (pendingStatus === 'cancelled') {
            return 'Tem certeza que deseja cancelar este agendamento?'
        }
        if (pendingStatus === 'no_show') {
            return 'Confirmar que o cliente não compareceu ao agendamento?'
        }
        return 'Confirmar alteração de status?'
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger
                    disabled={disabled}
                    className={cn(
                        "flex items-center gap-1.5 text-[9px] sm:text-xs font-bold px-2 py-1 rounded bg-white/90 hover:bg-white transition-colors border border-white/50",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    <span>Alterar Status</span>
                    <ChevronRight className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="start"
                    className="w-56"
                    onClick={(e) => e.stopPropagation()}
                >
                    {STATUS_OPTIONS.map((option) => (
                        <DropdownMenuItem
                            key={option.value}
                            onClick={(e) => {
                                e.stopPropagation()
                                handleStatusClick(option.value, option.requiresConfirmation)
                            }}
                            className={cn(
                                "flex items-center justify-between cursor-pointer",
                                currentStatus === option.value && "bg-accent"
                            )}
                        >
                            <span>{option.label}</span>
                            {currentStatus === option.value && (
                                <Check className="w-4 h-4 text-primary" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar alteração</AlertDialogTitle>
                        <AlertDialogDescription>
                            {getConfirmationMessage()}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>
                            Cancelar
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
})
