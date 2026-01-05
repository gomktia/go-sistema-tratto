"use client"

import { MessageCircle } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface FloatingWhatsAppProps {
    phone: string
    tenantName: string
    className?: string
}

export function FloatingWhatsApp({ phone, tenantName, className }: FloatingWhatsAppProps) {
    const message = encodeURIComponent(`Olá! Estou no site do ${tenantName} e gostaria de tirar uma dúvida sobre agendamento.`)
    const whatsappUrl = `https://wa.me/${phone}?text=${message}`

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
                "fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-shadow",
                className
            )}
        >
            <MessageCircle className="w-8 h-8 fill-current" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                1
            </span>
        </motion.a>
    )
}
