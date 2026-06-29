"use client"

import { Bell, ChevronDown, Check, Search, Command, Calendar, DollarSign, Settings, Timer, Megaphone, LogOut, User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { usePathname } from "next/navigation"
import { useTenant } from "@/contexts/tenant-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { notifications as initialNotifications } from "@/mocks/notifications"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

export function Header() {
    const pathname = usePathname()
    const pathSegments = pathname.split('/').filter(Boolean)
    const pageTitleMap: Record<string, string> = {
        dashboard: "Visão Geral",
        agenda: "Agenda",
        clientes: "Clientes",
        servicos: "Serviços",
        galeria: "Galeria",
        funcionarios: "Funcionários",
        financeiro: "Financeiro",
        estoque: "Estoque",
        crm: "Marketing & CRM",
        profissional: "Área do Profissional",
        perfil: "Perfil",
        configuracoes: "Configurações",
        integracoes: "Integrações"
    }

    const currentPath = pathSegments[0] || "dashboard"
    const pageTitle = pageTitleMap[currentPath] || currentPath.charAt(0).toUpperCase() + currentPath.slice(1)

    const { currentTenant, setCurrentTenant, allTenants } = useTenant()
    const { isSuperAdmin, logout } = useAuth()
    const [isTenantMenuOpen, setIsTenantMenuOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState(initialNotifications)

    const unreadCount = notifications.filter(n => !n.read).length

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ))
    }

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
    }

    const notificationIconMap: Record<string, LucideIcon> = {
        appointment: Calendar,
        payment: DollarSign,
        system: Settings,
        reminder: Timer
    }

    const getNotificationIcon = (type: string) => notificationIconMap[type] || Megaphone

    const handleTenantSelect = (tenantId: string) => {
        const tenant = allTenants.find(t => t.id === tenantId)
        if (!tenant) return
        setCurrentTenant(tenant)
        setIsTenantMenuOpen(false)
    }

    return (
        <header className="h-20 sticky top-0 z-30 flex items-center justify-between px-8 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
            {/* Left: Page Title & Search Bar */}
            <div className="flex items-center gap-8 flex-1">
                <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white hidden md:block">{pageTitle}</h1>

                {/* Command+K Search Mockup */}
                <div className="relative max-w-md w-full group hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar por clientes, funcionários..."
                        className="w-full h-11 bg-slate-100 dark:bg-zinc-900 border-none rounded-2xl pl-11 pr-12 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-1 bg-white dark:bg-zinc-800 rounded-lg border border-slate-200 dark:border-zinc-700 shadow-sm pointer-events-none">
                        <Command className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-400">K</span>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 pr-4 border-r border-slate-200 dark:border-zinc-800">
                    <ThemeToggle />

                    {/* Notifications */}
                    <div className="relative">
                        <button
                            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                            className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors group"
                        >
                            <Bell className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-black">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        {/* Notifications Dropdown */}
                        <AnimatePresence>
                            {isNotificationsOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-4 w-[400px] bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden z-50 p-6 space-y-4"
                                    >
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Notificações</h3>
                                            <button onClick={markAllAsRead} className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                                                Limpar Todas
                                            </button>
                                        </div>

                                        <div className="max-h-[450px] overflow-y-auto space-y-2 -mx-2 px-2 scrollbar-none">
                                            {notifications.length === 0 ? (
                                                <div className="py-20 text-center space-y-2">
                                                    <div className="w-16 h-16 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                                                        <Bell className="w-8 h-8 text-slate-300" />
                                                    </div>
                                                    <p className="text-sm font-bold text-slate-400">Tudo limpo por aqui!</p>
                                                </div>
                                            ) : (
                                                notifications.map((n) => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => markAsRead(n.id)}
                                                        className={cn(
                                                            "p-4 rounded-2xl flex gap-4 cursor-pointer transition-all group",
                                                            !n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50 dark:hover:bg-zinc-800/50"
                                                        )}
                                                    >
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                                                            {(() => {
                                                                const Icon = getNotificationIcon(n.type)
                                                                return <Icon className="w-5 h-5 text-primary" />
                                                            })()}
                                                        </div>
                                                        <div className="flex-1 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-bold text-sm text-slate-900 dark:text-white leading-none">{n.title}</p>
                                                                {!n.read && <div className="w-2 h-2 bg-primary rounded-full" />}
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-medium">{n.message}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* User Profile Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-3 p-1 rounded-xl bg-slate-50 dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 hover:shadow-md transition-all group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-lg" suppressHydrationWarning>
                            {currentTenant.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="text-left hidden lg:block pr-2" suppressHydrationWarning>
                            <p className="text-xs font-black text-slate-900 dark:text-white leading-none mb-1">{currentTenant.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{isSuperAdmin ? 'Super Admin' : 'Administrador'}</p>
                        </div>
                        <ChevronDown className="w-4 h-4 text-slate-400 mr-2 group-hover:text-primary transition-colors" />
                    </button>

                    <AnimatePresence>
                        {isUserMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                    className="absolute right-0 mt-3 w-[280px] rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xl z-50 overflow-hidden"
                                >
                                    {/* User Info */}
                                    <div className="p-4 border-b border-slate-100 dark:border-zinc-800">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{currentTenant.name}</p>
                                        <p className="text-xs text-slate-400">{isSuperAdmin ? 'Super Admin' : 'Administrador'}</p>
                                    </div>

                                    {/* Tenant Selector (Super Admin only) */}
                                    {isSuperAdmin && allTenants.length > 1 && (
                                        <div className="border-b border-slate-100 dark:border-zinc-800">
                                            <p className="px-4 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trocar Empresa</p>
                                            <div className="max-h-40 overflow-y-auto">
                                                {allTenants.map((tenant) => {
                                                    const isActive = tenant.id === currentTenant.id
                                                    return (
                                                        <button
                                                            key={tenant.id}
                                                            onClick={() => {
                                                                handleTenantSelect(tenant.id)
                                                                setIsUserMenuOpen(false)
                                                            }}
                                                            className={cn(
                                                                "w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors text-sm",
                                                                isActive && "bg-primary/5"
                                                            )}
                                                        >
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                                                                {tenant.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="flex-1 truncate text-slate-700 dark:text-zinc-300">{tenant.name}</span>
                                                            {isActive && <Check className="w-4 h-4 text-primary" />}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Menu Actions */}
                                    <div className="p-2">
                                        <Link
                                            href={`/${currentTenant.slug}/configuracoes`}
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors"
                                        >
                                            <Settings className="w-4 h-4" />
                                            Configurações
                                        </Link>
                                        <button
                                            onClick={() => {
                                                setIsUserMenuOpen(false)
                                                logout()
                                            }}
                                            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sair
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}


