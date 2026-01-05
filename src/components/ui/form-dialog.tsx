"use client"

import { ReactNode } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface FormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    children: ReactNode
    onSubmit: () => void
    onCancel?: () => void
    submitLabel?: string
    cancelLabel?: string
    isLoading?: boolean
}

export function FormDialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    onSubmit,
    onCancel,
    submitLabel = "Salvar",
    cancelLabel = "Cancelar",
    isLoading = false
}: FormDialogProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit()
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    <div className="py-4">
                        {children}
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onCancel?.()
                                onOpenChange(false)
                            }}
                            disabled={isLoading}
                        >
                            {cancelLabel}
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
