"use client"

import { ReactNode } from "react"
import { X } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface DetailDrawerProps {
    open: boolean
    onClose: () => void
    title: string
    description?: string
    children: ReactNode
}

export function DetailDrawer({
    open,
    onClose,
    title,
    description,
    children
}: DetailDrawerProps) {
    return (
        <Sheet open={open} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto">
                <SheetHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <SheetTitle>{title}</SheetTitle>
                            {description && <SheetDescription>{description}</SheetDescription>}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="h-8 w-8"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </SheetHeader>
                <div className="mt-6">
                    {children}
                </div>
            </SheetContent>
        </Sheet>
    )
}
