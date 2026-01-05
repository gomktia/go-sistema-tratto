"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { Quote, Star } from "lucide-react"
import { cn } from "@/lib/utils"

const reviews = [
    {
        id: "1",
        name: "Mariana Vieira",
        role: "Cliente há 2 anos",
        rating: 5,
        message: "“Melhor experiência de beleza que já tive! O agendamento online é super prático e sempre recebo lembretes pelo WhatsApp.”",
        avatar: "https://i.pravatar.cc/150?u=mariana",
    },
    {
        id: "2",
        name: "Ana Paula Lima",
        role: "Assinante Clube Hidratação",
        rating: 5,
        message: "“Consigo ver meus históricos e reagendar em segundos. Me sinto VIP toda vez que chego no salão.”",
        avatar: "https://i.pravatar.cc/150?u=anapaula",
    },
    {
        id: "3",
        name: "Juliana Campos",
        role: "Cliente corporativa",
        rating: 4,
        message: "“Adoro o carinho em cada detalhe e a loja com retirada express. Só queria mais horários aos domingos.”",
        avatar: "https://i.pravatar.cc/150?u=juliana",
    },
]

export function CustomerReviews({ tenantName, className }: { tenantName: string; className?: string }) {
    return (
        <Card className={cn("rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-primary/5 to-purple-500/10 p-6 md:p-10 space-y-8", className)}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">As favoritas do {tenantName}</p>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Depoimentos reais</h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 max-w-xl">Quem frequenta já sabe: agenda inteligente, atendimento VIP e experiências que fidelizam.</p>
                </div>
                <Badge className="rounded-full gap-1 bg-white text-primary border border-primary/10 shadow-sm">
                    <Star className="w-4 h-4 fill-current" />
                    4.9 de 5 no último mês
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {reviews.map((review, index) => (
                    <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="rounded-3xl border border-white/50 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 p-5 shadow-sm"
                    >
                        <Quote className="w-6 h-6 text-primary/50 mb-3" />
                        <p className="text-sm text-slate-700 dark:text-zinc-300 mb-4">{review.message}</p>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12 border border-white shadow">
                                <AvatarImage src={review.avatar} alt={review.name} />
                                <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{review.name}</p>
                                <p className="text-[11px] uppercase tracking-widest text-slate-400">{review.role}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </Card>
    )
}



