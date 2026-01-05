"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, Check, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { appointments, services } from "@/mocks/data"
import { employees } from "@/mocks/services"

export default function ReviewPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const appointmentId = searchParams.get("appointment")

    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [appointment, setAppointment] = useState<any>(null)

    useEffect(() => {
        if (appointmentId) {
            // Find appointment details
            const apt = appointments.find(a => a.id === appointmentId)
            if (apt) {
                const service = services.find(s => s.id === apt.serviceId)
                const professional = employees.find(e => e.id === apt.staffId)
                setAppointment({
                    ...apt,
                    serviceName: service?.name || "Serviço",
                    professionalName: professional?.name || "Profissional"
                })
            }
        }
    }, [appointmentId])

    const handleSubmit = async () => {
        if (rating === 0) {
            alert("Por favor, selecione uma classificação")
            return
        }

        setIsSubmitting(true)

        try {
            // Get customer email from sessionStorage
            const customerEmail = sessionStorage.getItem("customerEmail")

            // Insert review into Supabase
            const { data, error } = await supabase
                .from("reviews")
                .insert({
                    appointment_id: appointmentId,
                    customer_email: customerEmail,
                    professional_id: appointment?.staffId,
                    service_id: appointment?.serviceId,
                    rating: rating,
                    comment: comment,
                    created_at: new Date().toISOString()
                })

            if (error) {
                console.error("Error submitting review:", error)
                alert("Erro ao enviar avaliação. Por favor, tente novamente.")
            } else {
                setSubmitted(true)
                setTimeout(() => {
                    router.push("/profile")
                }, 2000)
            }
        } catch (error) {
            console.error("Error:", error)
            alert("Erro ao enviar avaliação. Por favor, tente novamente.")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!appointment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
                <Card className="p-8 rounded-3xl border-none shadow-2xl max-w-md w-full text-center">
                    <p className="text-muted-foreground">Carregando...</p>
                </Card>
            </div>
        )
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="p-8 rounded-3xl border-none shadow-2xl max-w-md w-full text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                            Avaliação Enviada!
                        </h2>
                        <p className="text-muted-foreground mb-4">
                            Obrigado pelo seu feedback
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Redirecionando...
                        </p>
                    </Card>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 rounded-xl"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>

                <Card className="p-8 rounded-3xl border-none shadow-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                            Como foi sua experiência?
                        </h1>
                        <p className="text-muted-foreground">
                            Sua opinião nos ajuda a melhorar
                        </p>
                    </div>

                    {/* Appointment Info */}
                    <div className="bg-slate-50 dark:bg-zinc-800 rounded-2xl p-6 mb-8">
                        <div className="flex items-start justify-between">
                            <div>
                                <Badge className="mb-2 bg-primary/10 text-primary border-none">
                                    {appointment.serviceName}
                                </Badge>
                                <p className="text-sm text-muted-foreground mb-1">
                                    Profissional: <span className="font-semibold text-foreground">{appointment.professionalName}</span>
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Data: {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Star Rating */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-4 text-center">
                            Classificação
                        </label>
                        <div className="flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-12 h-12 transition-colors ${
                                            star <= (hoveredRating || rating)
                                                ? "fill-amber-400 text-amber-400"
                                                : "text-slate-300 dark:text-zinc-600"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                                {rating === 1 && "Muito Insatisfeito"}
                                {rating === 2 && "Insatisfeito"}
                                {rating === 3 && "Neutro"}
                                {rating === 4 && "Satisfeito"}
                                {rating === 5 && "Muito Satisfeito"}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div className="mb-8">
                        <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-3">
                            Comentário (opcional)
                        </label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Compartilhe detalhes sobre sua experiência..."
                            className="min-h-32 rounded-xl bg-slate-50 dark:bg-zinc-800 border-none resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground mt-2 text-right">
                            {comment.length}/500
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={rating === 0 || isSubmitting}
                        className="w-full h-12 rounded-xl text-base font-bold"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Enviando...
                            </div>
                        ) : (
                            "Enviar Avaliação"
                        )}
                    </Button>
                </Card>
            </div>
        </div>
    )
}
