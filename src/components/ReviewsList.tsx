"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { format, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion } from "framer-motion"

interface Review {
    id: string
    appointment_id: string
    customer_email: string
    professional_id: string
    service_id: string
    rating: number
    comment: string | null
    created_at: string
}

interface ReviewsListProps {
    professionalId?: string
    serviceId?: string
    limit?: number
    showStats?: boolean
}

export function ReviewsList({ professionalId, serviceId, limit, showStats = true }: ReviewsListProps) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    })

    useEffect(() => {
        fetchReviews()
    }, [professionalId, serviceId])

    const fetchReviews = async () => {
        setLoading(true)
        try {
            let query = supabase
                .from("reviews")
                .select("*")
                .order("created_at", { ascending: false })

            if (professionalId) {
                query = query.eq("professional_id", professionalId)
            }

            if (serviceId) {
                query = query.eq("service_id", serviceId)
            }

            if (limit) {
                query = query.limit(limit)
            }

            const { data, error } = await query

            if (error) {
                console.error("Error fetching reviews:", error)
            } else {
                setReviews(data || [])
                calculateStats(data || [])
            }
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = (reviewsData: Review[]) => {
        if (reviewsData.length === 0) {
            setStats({ averageRating: 0, totalReviews: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } })
            return
        }

        const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0)
        const average = totalRating / reviewsData.length

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        reviewsData.forEach(review => {
            distribution[review.rating as keyof typeof distribution]++
        })

        setStats({
            averageRating: average,
            totalReviews: reviewsData.length,
            distribution
        })
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${
                            star <= rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300 dark:text-zinc-600"
                        }`}
                    />
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {showStats && stats.totalReviews > 0 && (
                <Card className="p-6 rounded-2xl border-none shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-5xl font-black text-slate-900 dark:text-white">
                                    {stats.averageRating.toFixed(1)}
                                </span>
                                <div>
                                    {renderStars(Math.round(stats.averageRating))}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {stats.totalReviews} {stats.totalReviews === 1 ? 'avaliação' : 'avaliações'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                            const count = stats.distribution[rating as keyof typeof stats.distribution]
                            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0
                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <span className="text-xs font-semibold w-3">{rating}</span>
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    <div className="flex-1 h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full transition-all"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            )}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <Card className="p-12 rounded-2xl border-none shadow-lg text-center">
                        <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">Nenhuma avaliação ainda</p>
                    </Card>
                ) : (
                    reviews.map((review, idx) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <Card className="p-5 rounded-2xl border-none shadow-lg hover:shadow-xl transition-all">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                            {review.customer_email.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {review.customer_email.split('@')[0]}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {format(parseISO(review.created_at), "dd 'de' MMM 'de' yyyy", { locale: ptBR })}
                                            </p>
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                                        {review.comment}
                                    </p>
                                )}
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    )
}
