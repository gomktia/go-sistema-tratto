"use client"

import { useMemo, useRef, useState, useEffect, type ChangeEvent } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { format, parseISO, differenceInHours, isAfter, addHours } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    AlertCircle,
    Bell,
    Calendar,
    ChevronLeft,
    Clock,
    ExternalLink,
    History,
    Lock,
    MapPin,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Tag,
    TrendingUp,
    User,
    Star
} from "lucide-react"
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { tenants } from "@/mocks/tenants"
import { appointments } from "@/mocks/data"
import { services } from "@/mocks/services"
import { mockCustomers, type Customer } from "@/mocks/customers"
import { combos } from "@/mocks/combos"
import { cn, getInitials } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export default function CustomerProfilePage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    // Try to get email from sessionStorage first (secure), fallback to URL params (legacy support)
    const [customerEmail, setCustomerEmail] = useState<string | null>(null)

    useEffect(() => {
        // Check sessionStorage first
        const storedEmail = sessionStorage.getItem('customerEmail')
        if (storedEmail) {
            setCustomerEmail(storedEmail)
            return
        }

        // Fallback to URL params (legacy support)
        const urlEmail = searchParams.get('email')
        if (urlEmail) {
            setCustomerEmail(urlEmail)
            // Store in sessionStorage for future use
            sessionStorage.setItem('customerEmail', urlEmail)
        } else {
            // No authentication found, redirect to login
            router.push(`/${tenantSlug}/login`)
        }
    }, [searchParams, tenantSlug, router])

    const tenant = useMemo(() => {
        return tenants.find(t => t.slug === tenantSlug) || tenants[0]
    }, [tenantSlug])

    const customer = useMemo<Customer | null>(() => {
        if (!customerEmail) return null
        const existing = mockCustomers.find(c => c.email === customerEmail)
        if (existing) return existing
        return {
            id: `generated-${customerEmail}`,
            tenantId: tenant.id,
            name: customerEmail.split('@')[0],
            email: customerEmail,
            phone: "",
            cpf: "",
            points: 150,
            status: 'active',
            lastVisit: new Date().toISOString(),
            totalSpent: 0,
            avatar: "",
        }
    }, [customerEmail, tenant.id])

    // Find all appointments for this email
    const allAppointments = useMemo(() => {
        if (!customerEmail) return []
        return appointments.filter(apt => apt.customer.toLowerCase().includes(customerEmail.split('@')[0].toLowerCase()))
    }, [customerEmail])

    const upcomingAppointment = useMemo(() => {
        return allAppointments
            .map((apt) => {
                const fullDate = parseISO(apt.date)
                const [hours, minutes] = apt.time.split(":").map(Number)
                fullDate.setHours(hours, minutes, 0, 0)
                return { ...apt, fullDate }
            })
            .filter((apt) => isAfter(apt.fullDate, new Date()))
            .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())[0]
    }, [allAppointments])

    const upcomingService = useMemo(() => {
        if (!upcomingAppointment) return null
        return services.find((service) => service.id === upcomingAppointment.serviceId) || null
    }, [upcomingAppointment])

    const isFirstAccess = allAppointments.length === 0
    const [avatarPreview, setAvatarPreview] = useState<string>(customer?.avatar || "")
    const avatarInputRef = useRef<HTMLInputElement>(null)

    const timelineEvents = useMemo(() => {
        const future = allAppointments
            .map((apt) => {
                const fullDate = parseISO(apt.date)
                const [hours, minutes] = apt.time.split(":").map(Number)
                fullDate.setHours(hours, minutes, 0, 0)
                return { ...apt, fullDate }
            })
            .filter((apt) => isAfter(apt.fullDate, new Date()))
            .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())

        const past = allAppointments
            .filter(apt => apt.status === 'completed')
            .map(apt => {
                const fullDate = parseISO(apt.date)
                const [hours, minutes] = apt.time.split(":").map(Number)
                fullDate.setHours(hours, minutes, 0, 0)
                return { ...apt, fullDate }
            })
            .sort((a, b) => b.fullDate.getTime() - a.fullDate.getTime())

        return [...future.slice(0, 2), ...past.slice(0, 3)]
    }, [allAppointments])

    const tenantCombos = useMemo(() => combos.filter(combo => combo.tenantId === tenant.id).slice(0, 3), [tenant.id])

    const totalSpent = useMemo(() => {
        return allAppointments.reduce((sum, apt) => {
            const serviceInfo = services.find(service => service.id === apt.serviceId)
            return sum + (serviceInfo?.price ?? 0)
        }, 0)
    }, [allAppointments])

    const averageTicket = allAppointments.length > 0 ? totalSpent / allAppointments.length : 0

    const favoriteServices = useMemo(() => {
        const counts = new Map<string, { id: string; total: number; serviceName: string; lastDate: string }>()
        allAppointments.forEach(apt => {
            if (!apt.serviceId) return
            const serviceInfo = services.find(service => service.id === apt.serviceId)
            if (!serviceInfo) return
            const existing = counts.get(apt.serviceId)
            counts.set(apt.serviceId, {
                id: apt.serviceId,
                total: (existing?.total ?? 0) + 1,
                serviceName: serviceInfo.name,
                lastDate: apt.date
            })
        })
        return Array.from(counts.values())
            .sort((a, b) => b.total - a.total)
            .slice(0, 3)
    }, [allAppointments])

    // Mock data - These features are planned but not yet functional
    const dependentProfiles = useMemo(() => [], [])  // Disabled mock data

    const purchaseHistory = useMemo(() => [], [])  // Disabled mock data

    const walletSummary = {
        credits: 0,  // Disabled mock data
        vouchers: []  // Disabled mock data
    }

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    }

    const handleAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setAvatarPreview(reader.result)
            }
        }
        reader.readAsDataURL(file)
    }

    const triggerAvatarUpload = () => {
        avatarInputRef.current?.click()
    }

    if (!customerEmail) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-4">
                    <h1 className="text-2xl font-bold">Perfil não encontrado</h1>
                    <p className="text-slate-500">Por favor, acesse o link enviado após o seu agendamento.</p>
                    <Button onClick={() => router.back()} variant="outline">Voltar</Button>
                </div>
            </div>
        )
    }

    const AppointmentCard = ({ apt }: { apt: typeof appointments[0] }) => {
        const aptTenant = tenants.find(t => t.id === apt.tenantId)
        const aptService = services.find(s => s.id === apt.serviceId)
        const [isCancelling, setIsCancelling] = useState(false)

        // Cancellation Logic: 24h rule
        const appointmentDate = parseISO(apt.date)
        const [hours, minutes] = apt.time.split(':').map(Number)
        const fullAptDate = addHours(appointmentDate, hours)
        const canCancel = differenceInHours(fullAptDate, new Date()) >= 24 && apt.status === 'confirmed'

        const handleCancelRequest = async () => {
            if (canCancel) {
                // Confirm cancellation
                const confirmed = window.confirm(
                    `Tem certeza que deseja cancelar o agendamento de ${aptService?.name} no dia ${format(fullAptDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}?`
                )

                if (!confirmed) return

                setIsCancelling(true)

                try {
                    // Update appointment status in Supabase
                    const { error } = await supabase
                        .from('appointments')
                        .update({
                            status: 'cancelled',
                            cancelled_at: new Date().toISOString(),
                            cancelled_by: customerEmail
                        })
                        .eq('id', apt.id)

                    if (error) {
                        console.error('Error cancelling appointment:', error)
                        alert('Erro ao cancelar agendamento. Por favor, tente novamente ou entre em contato pelo WhatsApp.')
                    } else {
                        alert('Agendamento cancelado com sucesso!')
                        // Refresh the page to update the appointments list
                        window.location.reload()
                    }
                } catch (error) {
                    console.error('Error:', error)
                    alert('Erro ao cancelar agendamento. Por favor, tente novamente.')
                } finally {
                    setIsCancelling(false)
                }
            } else {
                // Can't cancel online, redirect to WhatsApp
                const message = encodeURIComponent(`Olá! Gostaria de cancelar meu agendamento de ${aptService?.name} no dia ${format(fullAptDate, "dd/MM")}.`)
                window.open(`https://wa.me/${aptTenant?.whatsapp}?text=${message}`, '_blank')
            }
        }

        return (
            <Card className="p-5 rounded-3xl border-none shadow-sm bg-white dark:bg-zinc-900 group">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex items-center justify-center text-sm font-black text-primary">
                            {aptTenant ? (aptTenant.logo || getInitials(aptTenant.fullName || aptTenant.name)) : getInitials(apt.customer)}
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white uppercase text-[10px] tracking-widest">{aptTenant?.name}</h4>
                            <p className="text-sm font-black text-slate-900 dark:text-white">{aptService?.name}</p>
                        </div>
                    </div>
                    <Badge className={cn(
                        "rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-tighter",
                        apt.status === 'confirmed' ? "bg-emerald-500/10 text-emerald-600 border-none" :
                            apt.status === 'completed' ? "bg-slate-500/10 text-slate-600 border-none" : "bg-blue-500/10 text-blue-600 border-none"
                    )}>
                        {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'completed' ? 'Concluído' : 'Agendado'}
                    </Badge>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-zinc-400">
                        <Calendar className="w-4 h-4 text-primary" />
                        {format(parseISO(apt.date), "dd 'de' MMM", { locale: ptBR })}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-zinc-400">
                        <Clock className="w-4 h-4 text-primary" />
                        {apt.time}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">R$ {aptService?.price},00</span>
                    </div>
                    <div className="flex gap-2">
                        {apt.status === 'completed' ? (
                            <Button
                                variant="default"
                                size="sm"
                                onClick={() => router.push(`/${tenantSlug}/review?appointment=${apt.id}`)}
                                className="h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider px-4 bg-amber-500 hover:bg-amber-600"
                            >
                                <Star className="w-3 h-3 mr-1" />
                                Avaliar
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelRequest}
                                disabled={isCancelling}
                                className={cn(
                                    "h-9 rounded-xl font-bold text-[10px] uppercase tracking-wider px-4",
                                    canCancel ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-slate-400 hover:text-primary hover:bg-slate-50",
                                    isCancelling && "opacity-50 cursor-not-allowed"
                                )}
                            >
                                {isCancelling ? 'Cancelando...' : canCancel ? 'Cancelar' : 'Falar com Salão'}
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/50 px-6 py-4">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <Button variant="ghost" size="icon" onClick={() => router.push(`/${tenantSlug}/book`)} className="rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="text-center">
                        <h1 className="text-lg font-black tracking-tight">Painel Beauty</h1>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] leading-none mt-0.5">Meu Universo {tenant.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/${tenantSlug}/shop`)}
                            className="rounded-full bg-slate-100 dark:bg-zinc-800"
                        >
                            <ShoppingBag className="w-5 h-5 text-slate-400" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/${tenantSlug}/login`)} // Simulating Logout/Switch
                            className="rounded-full bg-slate-100 dark:bg-zinc-800"
                        >
                            <User className="w-5 h-5 text-slate-400" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6 space-y-8">
                <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                />
                <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                    {upcomingAppointment ? (
                        <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Seu próximo horário</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                        {format(upcomingAppointment.fullDate, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-zinc-400">
                                        {upcomingService?.name || "Serviço agendado"} • {upcomingAppointment.status}
                                    </p>
                                </div>
                                <Badge variant="outline" className="rounded-full border-emerald-200 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                    Confirmado
                                </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button className="flex-1 rounded-2xl bg-primary text-white font-bold h-12" onClick={() => router.push(`/${tenantSlug}/book`)}>
                                    Reagendar
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 rounded-2xl border-slate-200 dark:border-zinc-800 h-12 font-bold"
                                    onClick={() => router.push(`/${tenantSlug}/book`)}
                                >
                                    Marcar novo serviço
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-primary to-purple-500 text-white space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Primeiro acesso</p>
                            <h3 className="text-2xl font-black leading-tight">Comece a construir seu histórico de beleza</h3>
                            <p className="text-sm text-white/80">
                                Agende seu primeiro horário e acompanhe tudo por aqui: confirmações, pontos e ofertas exclusivas.
                            </p>
                            <Button
                                onClick={() => router.push(`/${tenantSlug}/book`)}
                                className="w-full h-12 rounded-2xl bg-white text-primary font-black hover:bg-white/95"
                            >
                                Agendar agora
                            </Button>
                        </Card>
                    )}
                </motion.div>

                {/* Loyalty Card */}
                <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                    <Card className="p-8 rounded-[2.5rem] border-none shadow-2xl bg-slate-900 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="space-y-4 flex-1">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Beauty Rewards</p>
                                    <h2 className="text-4xl font-black">{customer?.name}</h2>
                                    <p className="text-slate-400 font-medium text-sm">{customer?.email}</p>
                                </div>
                                {isFirstAccess && (
                                    <Badge className="bg-white/10 backdrop-blur-md text-white border-none rounded-full px-4 py-1.5 font-bold uppercase text-[10px] tracking-widest">
                                        Primeiro acesso
                                    </Badge>
                                )}
                                <div className="flex gap-3">
                                    <Badge className="bg-white/10 backdrop-blur-md text-white border-none rounded-full px-4 py-1.5 font-bold uppercase text-[10px] tracking-widest">
                                        Nível Diamante
                                    </Badge>
                                    <Badge className="bg-emerald-500/20 text-emerald-400 border-none rounded-full px-4 py-1.5 font-bold uppercase text-[10px] tracking-widest">
                                        Ativo
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex flex-col items-center lg:items-end gap-4">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-28 h-28 rounded-full border-4 border-white/10 shadow-xl overflow-hidden bg-slate-800 flex items-center justify-center text-3xl font-black">
                                        {avatarPreview ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={avatarPreview} alt={customer?.name} className="w-full h-full object-cover" />
                                        ) : (
                                            getInitials(customer?.name || "Cliente")
                                        )}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                    className="rounded-full px-4 text-xs uppercase tracking-[0.3em]"
                                        onClick={triggerAvatarUpload}
                                    >
                                        Trocar foto
                                    </Button>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Saldo Atual</p>
                                    <div className="flex items-center justify-end gap-3 text-primary">
                                        <Sparkles className="w-10 h-10" />
                                        <span className="text-6xl font-black tracking-tighter">{customer?.points ?? 0}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">BeautyPoints</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {timelineEvents.length > 0 && (
                    <motion.div initial="hidden" animate="visible" variants={containerVariants}>
                        <Card className="p-6 rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-zinc-900 space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Linha do tempo</p>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Sua jornada Beauty</h3>
                                </div>
                                <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest">
                                    {timelineEvents.length} eventos
                                </Badge>
                            </div>
                            <div className="space-y-3">
                                {timelineEvents.map((event) => {
                                    const serviceInfo = services.find(service => service.id === event.serviceId)
                                    const statusLabel = event.status === 'completed' ? 'Concluído' : event.status === 'confirmed' ? 'Confirmado' : 'Agendado'
                                    return (
                                        <div key={event.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-zinc-800 p-3">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-800 flex flex-col items-center justify-center">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {format(event.fullDate, "dd", { locale: ptBR })}
                                                </span>
                                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                                    {format(event.fullDate, "MMM", { locale: ptBR })}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{serviceInfo?.name || "Serviço"}</p>
                                                <p className="text-xs text-slate-500">{format(event.fullDate, "HH:mm", { locale: ptBR })} • {event.status === 'completed' ? 'Realizado' : 'Próximo'}</p>
                                            </div>
                                            <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-widest">
                                                {statusLabel}
                                            </Badge>
                                        </div>
                                    )
                                })}
                            </div>
                        </Card>
                    </motion.div>
                )}

                {/* Reminders Status Section */}
                <motion.div
                    initial="hidden" animate="visible" variants={containerVariants}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="p-6 rounded-[2.5rem] border-none shadow-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 group">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center relative">
                                    <Bell className="w-6 h-6 text-primary" />
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-zinc-900 rounded-full" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        Lembretes Ativos
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-zinc-400">Enviaremos notificações 1 dia e 1 hora antes.</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="rounded-full border-slate-200 dark:border-zinc-800 text-slate-400 font-bold text-[10px] uppercase">
                                Automático
                            </Badge>
                        </div>
                    </Card>
                </motion.div>

                {/* Info Alert */}
                <Card className="p-4 rounded-3xl bg-amber-500/5 border-amber-500/10 flex gap-3 items-center">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 uppercase tracking-widest leading-normal">
                        Cancelamentos permitidos até 24h antes. Após esse prazo, entre em contato direto pelo WhatsApp.
                    </p>
                </Card>

                {/* History Tabs */}
                <Tabs defaultValue="tenant" className="w-full">
                    <TabsList className="w-full bg-slate-200/50 dark:bg-zinc-900 p-1.5 rounded-2xl h-14 mb-6">
                        <TabsTrigger
                            value="tenant"
                            className="flex-1 rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all"
                        >
                            No Salão
                        </TabsTrigger>
                        <TabsTrigger
                            value="all"
                            className="flex-1 rounded-xl font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm transition-all text-xs"
                        >
                            Histórico Global
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="tenant" className="space-y-4 outline-none">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Próximas Visitas em {tenant.name}
                            </h3>
                        </div>
                        {allAppointments.filter(apt => apt.status === 'confirmed' || apt.status === 'scheduled').length > 0 ? (
                            allAppointments
                                .filter(apt => apt.status === 'confirmed' || apt.status === 'scheduled')
                                .map(apt => <AppointmentCard key={apt.id} apt={apt} />)
                        ) : (
                            <div className="py-12 text-center rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-zinc-800">
                                <Calendar className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                <p className="text-slate-400 font-medium italic text-sm">Nenhum agendamento futuro.</p>
                            </div>
                        )}

                        <div className="pt-8 mb-4 px-2">
                            <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest">Resgate seus Pontos</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-6 rounded-3xl border-none bg-primary/5 hover:bg-primary/10 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className="bg-white dark:bg-zinc-800 text-primary border-none rounded-full px-3 font-black">500 PTS</Badge>
                                    <Sparkles className="w-6 h-6 text-primary" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Design de Sobrancelha</h4>
                                <p className="text-xs text-slate-500 mt-1">Troque seus pontos agora.</p>
                                <Button className="w-full mt-4 rounded-2xl h-10 font-black text-[10px] uppercase tracking-widest">Resgatar</Button>
                            </Card>
                            <Card className="p-6 rounded-3xl border-none bg-slate-100 dark:bg-zinc-800 opacity-60">
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className="bg-white dark:bg-zinc-700 text-slate-400 border-none rounded-full px-3 font-black">2000 PTS</Badge>
                                    <Lock className="w-6 h-6 text-slate-400" />
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Escova + Hidratação</h4>
                                <p className="text-xs text-slate-500 mt-1">Faltam {2000 - (customer?.points ?? 0)} pontos.</p>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="all" className="space-y-4 outline-none">
                        <div className="flex items-center justify-between mb-2 px-2">
                            <h3 className="font-bold text-slate-400 text-[10px] uppercase tracking-widest flex items-center gap-2">
                                <History className="w-3 h-3" /> Histórico Completo
                            </h3>
                        </div>
                        {allAppointments.map(apt => <AppointmentCard key={apt.id} apt={apt} />)}
                    </TabsContent>
                </Tabs>

                <motion.div initial="hidden" animate="visible" variants={containerVariants} transition={{ delay: 0.1 }}>
                    <div className="grid gap-6">
                        <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Resumo financeiro</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Seu impacto no salão</h3>
                                </div>
                                <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> +18% vs último trimestre
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Total gasto</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">R$ {totalSpent.toFixed(2)}</p>
                                    <p className="text-xs text-slate-400">Últimos 12 meses</p>
                                </div>
                                <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ticket médio</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">R$ {averageTicket.toFixed(2)}</p>
                                    <p className="text-xs text-slate-400">Por serviço</p>
                                </div>
                            </div>
                            {favoriteServices.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Serviços queridinhos</p>
                                    <div className="space-y-2">
                                        {favoriteServices.map(service => (
                                            <div key={service.id} className="flex items-center justify-between rounded-2xl border border-slate-100 dark:border-zinc-800 px-4 py-2">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{service.serviceName}</p>
                                                    <p className="text-xs text-slate-400">{service.total}x realizados</p>
                                                </div>
                                                <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-widest">
                                                    favorito
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>

                        <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-primary/10 via-primary/5 to-slate-50 dark:from-primary/20 dark:via-zinc-900 dark:to-zinc-900 space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">Dependentes e presentes</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Controle quem pode usar seu saldo</h3>
                                </div>
                                <Badge className="bg-amber-500/10 text-amber-600 border-none rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                                    Em breve
                                </Badge>
                            </div>
                            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 px-6 py-12 text-center">
                                <p className="text-sm text-muted-foreground mb-2">
                                    Funcionalidade em desenvolvimento
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Em breve você poderá adicionar dependentes e comprar gift cards
                                </p>
                            </div>
                        </Card>

                        <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Carteira & Cupons</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Ative benefícios antes de pagar</h3>
                                </div>
                                <Badge className="bg-amber-500/10 text-amber-600 border-none rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                                    Em breve
                                </Badge>
                            </div>
                            <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 px-6 py-12 text-center">
                                <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-sm text-muted-foreground mb-2">
                                    Carteira digital em desenvolvimento
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Em breve você poderá gerenciar saldo BeautyCash e cupons de desconto
                                </p>
                            </div>
                        </Card>

                        <Card className="p-6 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Loja integrada</p>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Compre produtos do salão</h3>
                                </div>
                                <Button variant="outline" className="rounded-full font-bold" onClick={() => router.push(`/${tenantSlug}/shop`)}>
                                    Ver loja
                                </Button>
                            </div>
                            {tenantCombos.length > 0 && (
                                <div className="space-y-3">
                                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Combos recomendados</p>
                                    <div className="space-y-3">
                                        {tenantCombos.map(combo => (
                                            <div key={combo.id} className="rounded-2xl border border-slate-100 dark:border-zinc-800 p-4 flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold text-slate-900 dark:text-white">{combo.name}</p>
                                                    <Badge className="rounded-full text-[10px] uppercase tracking-widest">R$ {combo.price}</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-2">{combo.description}</p>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <Button className="flex-1 rounded-2xl h-11" onClick={() => router.push(`/${tenantSlug}/book?combo=${combo.id}`)}>
                                                        Usar cupom
                                                    </Button>
                                                    <Button variant="outline" className="flex-1 rounded-2xl h-11" onClick={() => router.push(`/${tenantSlug}/shop?highlight=${combo.id}`)}>
                                                        Ver detalhes
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </motion.div>
            </main>
            <FloatingWhatsApp phone={tenant.whatsapp} tenantName={tenant.name} />
        </div>
    )
}
