"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
    Calendar,
    MapPin,
    Star,
    Clock,
    ChevronRight,
    MessageCircle,
    Instagram,
    Phone,
    ArrowRight
} from "lucide-react"
import { useTenantBySlug, useTenantGallery, useTenantHighlights, useTenantTestimonials } from "@/hooks/useTenantRecords"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"

export default function TenantStorefrontPage() {
    const params = useParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    const { data: tenant, loading: tenantLoading } = useTenantBySlug(tenantSlug)
    const { data: gallery, loading: galleryLoading } = useTenantGallery(tenant?.id)
    const { data: highlights, loading: highlightsLoading } = useTenantHighlights(tenant?.id)
    const { data: testimonials, loading: testimonialsLoading } = useTenantTestimonials(tenant?.id)

    // Fallback/Mock data logic could be added here if tenant has no content yet, 
    // but for production lets show what is real or empty states elegantly.

    if (tenantLoading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!tenant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-zinc-950 p-6 text-center">
                <h1 className="text-2xl font-black mb-2">Salão não encontrado</h1>
                <p className="text-gray-500 mb-6">O endereço que você acessou não parece estar correto.</p>
                <Button onClick={() => router.push('/')}>Voltar para o início</Button>
            </div>
        )
    }

    const tenantInitials = getInitials(tenant.name)

    // Sort gallery by order if available
    const displayGallery = gallery?.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)) || []

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950 text-slate-900 dark:text-white pb-20">
            {/* HERO SECTION */}
            <div className="relative h-[40vh] md:h-[50vh] overflow-hidden bg-slate-900">
                {/* Background Image (Use first gallery image or fallback pattern) */}
                {displayGallery.length > 0 ? (
                    <div
                        className="absolute inset-0 bg-cover bg-center opacity-60"
                        style={{ backgroundImage: `url(${displayGallery[0].url})` }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40" />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-end justify-between gap-6">
                        <div className="flex items-end gap-6">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white dark:bg-zinc-900 shadow-2xl flex items-center justify-center text-4xl font-black text-primary p-2 shrink-0 border-4 border-white/10 backdrop-blur-sm"
                            >
                                {tenant.logo ? (
                                    <img src={tenant.logo} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    tenantInitials
                                )}
                            </motion.div>
                            <div className="mb-2">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-3xl md:text-5xl font-black text-white leading-tight"
                                >
                                    {tenant.name}
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-gray-300 font-medium text-sm md:text-base flex items-center gap-2 mt-2"
                                >
                                    <MapPin className="w-4 h-4 text-primary" />
                                    {tenant.settings?.address || "Endereço não informado"}
                                </motion.p>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="w-full md:w-auto"
                        >
                            <Button
                                size="lg"
                                className="w-full md:w-auto h-14 rounded-2xl text-lg font-bold shadow-[0_0_40px_-10px_rgba(var(--primary),0.5)] bg-white text-slate-900 hover:bg-gray-100"
                                onClick={() => router.push(`/${tenantSlug}/book`)}
                            >
                                Agendar Horário
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* CONTENT GRID */}
            <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">

                {/* LEFT COLUMN (Highlights & Info) */}
                <div className="md:col-span-2 space-y-12">

                    {/* About Section */}
                    <section>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <Star className="w-5 h-5 text-primary" /> Sobre Nós
                        </h2>
                        <div className="prose dark:prose-invert">
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                {tenant.settings?.description || "Bem-vindo ao nosso espaço! Oferecemos os melhores serviços de beleza e bem-estar, com uma equipe qualificada pronta para realçar sua beleza natural."}
                            </p>
                        </div>
                    </section>

                    {/* Gallery Preview */}
                    {displayGallery.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6">Nosso Espaço</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {displayGallery.slice(0, 6).map((img, i) => (
                                    <div key={img.id} className="aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-900">
                                        <img src={img.url} alt={img.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Testimonials */}
                    {testimonials && testimonials.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-6">O que dizem sobre nós</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {testimonials.slice(0, 3).map(t => (
                                    <Card key={t.id} className="border-none bg-slate-50 dark:bg-zinc-800/50 rounded-2xl p-6">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                                                {t.customerName.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex gap-1 text-amber-500 mb-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < t.rating ? "fill-current" : "opacity-30"}`} />
                                                    ))}
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 italic mb-2">"{t.testimonial}"</p>
                                                <p className="text-xs font-bold text-gray-500 uppercase">{t.customerName}</p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    )}

                </div>

                {/* RIGHT COLUMN (Sidebar Info) */}
                <div className="space-y-6">
                    <Card className="rounded-3xl border-none shadow-xl bg-white dark:bg-zinc-900 p-6 sticky top-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Horário de Funcionamento</h3>
                                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Seg - Sex</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">09:00 - 19:00</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Sábado</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">09:00 - 18:00</span>
                                    </div>
                                    <div className="flex justify-between text-red-500/80">
                                        <span>Domingo</span>
                                        <span>Fechado</span>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100 dark:border-zinc-800" />

                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Contato</h3>
                                <div className="space-y-3">
                                    {tenant.whatsapp ? (
                                        <a href={`https://wa.me/${tenant.whatsapp}`} target="_blank" className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 text-green-600 hover:bg-green-500/20 transition-colors">
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="font-bold text-sm">Whatsapp</span>
                                        </a>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-500">
                                            <Phone className="w-5 h-5" />
                                            <span className="font-bold text-sm">Sem contato cadastrado</span>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800/50 text-gray-600 dark:text-gray-400">
                                        <Instagram className="w-5 h-5" />
                                        <span className="font-medium text-sm">Instagram</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 rounded-xl text-base font-bold"
                                onClick={() => router.push(`/${tenantSlug}/book`)}
                            >
                                Agendar Visita
                            </Button>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    )
}
