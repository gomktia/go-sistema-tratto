"use client"

import { useMemo, useRef, useState, useEffect, type ChangeEvent } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format, parseISO, differenceInHours, isAfter, addHours } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
    AlertCircle,
    Bell,
    Calendar,
    ChevronLeft,
    Clock,
    CreditCard,
    Gift,
    LogOut,
    MapPin,
    Settings,
    ShieldCheck,
    ShoppingBag,
    Sparkles,
    Star,
    Trash2,
    TrendingUp,
    Upload,
    User,
    Wallet
} from "lucide-react"
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
    const [isLoading, setIsLoading] = useState(false)

    // --- Authentication Logic ---
    const [customerEmail, setCustomerEmail] = useState<string | null>(null)

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('customerEmail')
        if (storedEmail) {
            setCustomerEmail(storedEmail)
            return
        }
        const urlEmail = searchParams.get('email')
        if (urlEmail) {
            setCustomerEmail(urlEmail)
            sessionStorage.setItem('customerEmail', urlEmail)
        } else {
            // Redirect to login if no auth
            router.push(`/${tenantSlug}/login`)
        }
    }, [searchParams, tenantSlug, router])

    // --- Data Fetching & Memos ---
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

    const allAppointments = useMemo(() => {
        if (!customerEmail) return []
        return appointments.filter(apt => apt.customer.toLowerCase().includes(customerEmail.split('@')[0].toLowerCase()))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }, [customerEmail])

    const upcomingAppointments = useMemo(() => {
        return allAppointments.filter(apt => {
            const date = parseISO(apt.date)
            return isAfter(date, new Date()) && apt.status !== 'cancelled'
        }).reverse() // Closest first
    }, [allAppointments])

    const pastAppointments = useMemo(() => {
        return allAppointments.filter(apt => {
            const date = parseISO(apt.date)
            return !isAfter(date, new Date()) || apt.status === 'completed' || apt.status === 'cancelled'
        })
    }, [allAppointments])

    const totalSpent = useMemo(() => {
        return allAppointments
            .filter(apt => apt.status === 'completed')
            .reduce((sum, apt) => {
                const serviceInfo = services.find(service => service.id === apt.serviceId)
                return sum + (serviceInfo?.price ?? 0)
            }, 0)
    }, [allAppointments])

    // --- Actions ---
    const [avatarPreview, setAvatarPreview] = useState<string>(customer?.avatar || "")
    const avatarInputRef = useRef<HTMLInputElement>(null)

    const handleAvatarUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = "" // Reset input
        if (!file) return

        setIsLoading(true)
        try {
            const fileName = `avatars/${customerEmail}-${Date.now()}-${file.name}`

            const { data, error } = await supabase.storage
                .from('images') // Bucket name fixed via SQL
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (error) throw error

            const { data: publicData } = supabase.storage
                .from('images')
                .getPublicUrl(fileName)

            setAvatarPreview(publicData.publicUrl)

            // Note: In a real app with auth, we would update the user's profile table here:
            // await supabase.from('profiles').update({ avatar_url: publicData.publicUrl }).eq('email', customerEmail)

        } catch (error) {
            console.error("Upload error:", error)
            alert("Erro ao fazer upload da imagem. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = () => {
        sessionStorage.removeItem('customerEmail')
        router.push(`/${tenantSlug}/login`)
    }

    const handleCancelAppointment = async (aptId: string) => {
        setIsLoading(true)
        try {
            const { error } = await supabase
                .from('appointments')
                .update({
                    status: 'cancelled',
                    cancelled_at: new Date().toISOString(),
                    cancelled_by: customerEmail
                })
                .eq('id', aptId)

            if (error) throw error

            // For demo, force reload to see changes since we don't have real-time sub here
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert("Erro ao cancelar. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    if (!customerEmail) return null // Or loading spinner

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 font-sans selection:bg-primary/20">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-zinc-800/50 px-4 py-3">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push(`/${tenantSlug}/book`)} className="rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
                            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
                        </Button>
                        <div>
                            <h1 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                {tenant.name}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/${tenantSlug}/shop`)}
                            className="rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800"
                        >
                            <ShoppingBag className="w-5 h-5 text-slate-600 dark:text-zinc-400" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="rounded-full hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                            title="Sair"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Identity & Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden relative group">
                        <div className="absolute top-0 w-full h-32 bg-gradient-to-br from-primary/20 to-purple-500/20" />
                        <CardContent className="pt-20 px-6 pb-8 flex flex-col items-center text-center relative z-10">
                            <div className="relative mb-4">
                                <Avatar className="w-24 h-24 border-4 border-white dark:border-zinc-900 shadow-xl cursor-pointer hover:opacity-90 transition-opacity" onClick={() => avatarInputRef.current?.click()}>
                                    <AvatarImage src={avatarPreview} className="object-cover" />
                                    <AvatarFallback className="text-2xl font-black bg-slate-100 dark:bg-zinc-800 text-slate-400">
                                        {getInitials(customer?.name || "")}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm pointer-events-none">
                                    <Settings className="w-3 h-3" />
                                </div>
                                <input
                                    ref={avatarInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarUpload}
                                />
                            </div>

                            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">{customer?.name}</h2>
                            <p className="text-sm text-slate-500 dark:text-zinc-400 font-medium mb-6">{customer?.email}</p>

                            <div className="grid grid-cols-2 gap-4 w-full">
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Pontos</p>
                                    <p className="text-2xl font-black text-primary">{customer?.points || 0}</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-zinc-800/50 p-3 rounded-2xl border border-slate-100 dark:border-zinc-800">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Nível</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white mt-1.5">Diamante</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl relative overflow-hidden">
                        <Sparkles className="absolute top-4 right-4 w-12 h-12 text-white/5" />
                        <h3 className="font-bold text-lg mb-1">Beauty Prime</h3>
                        <p className="text-sm text-slate-300 mb-4 opacity-90">Seus benefícios exclusivos</p>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-sm font-medium">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                                </div>
                                5% de Cashback em produtos
                            </li>
                            <li className="flex items-center gap-3 text-sm font-medium">
                                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                                    <Gift className="w-3 h-3 text-pink-400" />
                                </div>
                                Presente no aniversário
                            </li>
                        </ul>
                    </Card>
                </div>

                {/* Main Column */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Welcome / Next Appointment Hero */}
                    <AnimatePresence mode="wait">
                        {upcomingAppointments.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="w-full"
                            >
                                <Card className="border-none shadow-xl bg-white dark:bg-zinc-900 overflow-hidden rounded-[2rem]">
                                    <div className="h-2 bg-primary w-full" />
                                    <CardContent className="p-6 md:p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <Badge className="mb-3 bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1 text-[10px] uppercase tracking-widest font-bold">
                                                    Próximo Agendamento
                                                </Badge>
                                                <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                                    {format(parseISO(upcomingAppointments[0].date), "dd 'de' MMMM", { locale: ptBR })}
                                                </h3>
                                                <p className="text-lg text-slate-500 dark:text-zinc-400 font-medium mt-1">
                                                    às {upcomingAppointments[0].time}
                                                </p>
                                            </div>
                                            <div className="text-right hidden sm:block">
                                                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mb-1">Serviço</p>
                                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                    {services.find(s => s.id === upcomingAppointments[0].serviceId)?.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                                            <Button className="flex-1 h-12 rounded-xl text-base font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20" onClick={() => router.push(`/${tenantSlug}/book`)}>
                                                Reagendar
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" className="flex-1 h-12 rounded-xl text-base font-bold border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:border-zinc-800 dark:hover:bg-red-900/20">
                                                        Cancelar
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-3xl p-6">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Cancelar agendamento?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Esta ação não pode ser desfeita. Se o cancelamento for feito com menos de 24h, uma taxa pode ser aplicada na próxima visita.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-xl">Voltar</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleCancelAppointment(upcomingAppointments[0].id)}
                                                            className="bg-red-500 hover:bg-red-600 rounded-xl"
                                                        >
                                                            Confirmar Cancelamento
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : (
                            <Card className="border-none shadow-xl bg-gradient-to-r from-primary to-purple-600 text-white overflow-hidden rounded-[2rem] p-8 md:p-12 text-center relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full mix-blend-overlay pointer-events-none" />
                                <div className="relative z-10 space-y-6">
                                    <h3 className="text-3xl font-black leading-tight">Hora de cuidar de você!</h3>
                                    <p className="text-white/80 max-w-md mx-auto text-lg">
                                        Nenhum agendamento futuro. Que tal marcar aquele momento especial essa semana?
                                    </p>
                                    <Button
                                        size="lg"
                                        onClick={() => router.push(`/${tenantSlug}/book`)}
                                        className="h-14 px-8 rounded-2xl bg-white text-primary font-black shadow-2xl hover:bg-slate-50 hover:scale-105 transition-all text-lg"
                                    >
                                        Agendar Seu Momento
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </AnimatePresence>

                    {/* Content Tabs */}
                    <Tabs defaultValue="appointments" className="w-full">
                        <TabsList className="w-full bg-transparrent p-0 h-auto gap-4 mb-6 flex flex-wrap justify-start">
                            <TabsTrigger
                                value="appointments"
                                className="rounded-full px-6 py-2.5 bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all font-bold text-sm"
                            >
                                Agendamentos
                            </TabsTrigger>
                            <TabsTrigger
                                value="history"
                                className="rounded-full px-6 py-2.5 bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all font-bold text-sm"
                            >
                                Histórico
                            </TabsTrigger>
                            <TabsTrigger
                                value="wallet"
                                className="rounded-full px-6 py-2.5 bg-white dark:bg-zinc-900 shadow-sm border border-slate-100 dark:border-zinc-800 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary transition-all font-bold text-sm"
                            >
                                Carteira
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="appointments" className="space-y-4 focus:outline-none">
                            {upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map(apt => (
                                    <Card key={apt.id} className="border-none shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-zinc-900 overflow-hidden">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 flex flex-col items-center justify-center text-primary">
                                                <span className="text-xl font-black leading-none">{format(parseISO(apt.date), "dd")}</span>
                                                <span className="text-[10px] font-bold uppercase">{format(parseISO(apt.date), "MMM", { locale: ptBR })}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-900 dark:text-white">
                                                    {services.find(s => s.id === apt.serviceId)?.name || "Serviço"}
                                                </h4>
                                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {apt.time}</span>
                                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {apt.professionalId || "Profissional"}</span>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-emerald-200 text-emerald-600 bg-emerald-50 text-[10px] font-bold uppercase px-3 py-1">
                                                Confirmado
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>Nenhum outro agendamento futuro.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="history" className="space-y-4 focus:outline-none">
                            {pastAppointments.length > 0 ? (
                                pastAppointments.map(apt => (
                                    <div key={apt.id} className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                                                {apt.status === 'completed' ? <ShieldCheck className="w-5 h-5 text-emerald-500" /> : <Trash2 className="w-5 h-5 text-red-400" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white line-through opacity-60">
                                                    {services.find(s => s.id === apt.serviceId)?.name || "Serviço"}
                                                </h4>
                                                <p className="text-xs text-slate-400">
                                                    {format(parseISO(apt.date), "dd/MM/yyyy")} • R$ {services.find(s => s.id === apt.serviceId)?.price}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 dark:bg-zinc-800">
                                            {apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-slate-400">
                                    <p>Histórico vazio.</p>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="wallet" className="focus:outline-none">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
                                    <div className="flex justify-between items-start mb-4">
                                        <CreditCard className="w-6 h-6 text-white/80" />
                                        <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-lg">Cashback</span>
                                    </div>
                                    <p className="text-3xl font-black mt-2">R$ 0,00</p>
                                    <p className="text-xs text-indigo-100 mt-1">Saldo disponível para uso</p>
                                </Card>
                                <Card className="p-6 bg-white dark:bg-zinc-900 border-dashed border-2 border-slate-200 dark:border-zinc-800 shadow-none flex flex-col justify-center items-center text-center">
                                    <Gift className="w-8 h-8 text-slate-300 mb-2" />
                                    <p className="font-bold text-slate-900 dark:text-white">Adicionar Voucher</p>
                                    <p className="text-xs text-slate-400 mb-3">Tem um código promocional?</p>
                                    <Button size="sm" variant="secondary" className="rounded-full text-xs font-bold" onClick={() => alert("Funcionalidade de vouchers em breve!")}>
                                        Inserir Código
                                    </Button>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>

                </div>
            </main>

            <FloatingWhatsApp phone={tenant.whatsapp} tenantName={tenant.name} />
        </div>
    )
}
