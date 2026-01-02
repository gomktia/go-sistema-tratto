"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import {
    LayoutDashboard,
    Building2,
    CreditCard,
    Package,
    Settings,
    LogOut,
    DollarSign,
    Megaphone,
    Smartphone,
    Scissors,
    LifeBuoy,
    Zap,
    ShieldCheck,
    FileText,
    Shield,
    Menu,
    X
} from "lucide-react"
import { Button } from "@/components/ui/button"

const superAdminMenuItems = [
    { icon: LayoutDashboard, label: "Visão Geral", href: "/super-admin/dashboard" },
    { icon: Shield, label: "Administradores", href: "/super-admin/administradores" },
    { icon: Building2, label: "Empresas", href: "/super-admin/empresas" },
    { icon: Package, label: "Planos", href: "/super-admin/planos" },
    { icon: CreditCard, label: "Financeiro (SA)", href: "/super-admin/financeiro" },
    { icon: FileText, label: "Cobranças", href: "/super-admin/cobrancas" },
    { icon: LifeBuoy, label: "Suporte", href: "/super-admin/suporte" },
    { icon: Zap, label: "Playbooks", href: "/super-admin/playbooks" },
    { icon: ShieldCheck, label: "Auditoria", href: "/super-admin/auditoria" },
    { icon: Settings, label: "Configurações (SA)", href: "/super-admin/configuracoes" },
]

const salonModules = [
    { icon: DollarSign, label: "Finanças (Salão)", href: "/financeiro" },
    { icon: Package, label: "Estoque & PDV", href: "/estoque" },
    { icon: Megaphone, label: "CRM & Marketing", href: "/crm" },
    { icon: Smartphone, label: "Vista Profissional", href: "/profissional" },
]

export function SuperAdminSidebar() {
    const pathname = usePathname()
    const { logout, user } = useAuth()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <>
            {/* Mobile Hamburger Button */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="fixed top-4 left-4 z-50 md:hidden rounded-xl bg-white/90 dark:bg-black/90 backdrop-blur-sm shadow-lg"
            >
                {isMobileMenuOpen ? (
                    <X className="w-5 h-5" />
                ) : (
                    <Menu className="w-5 h-5" />
                )}
            </Button>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "w-64 h-screen sticky top-0 border-r border-black/5 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur-xl flex flex-col z-40 transition-transform duration-300",
                // Mobile: slide from left
                "fixed md:static",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-black/5 dark:border-white/10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">SA</span>
                        </div>
                        <div>
                            <span className="font-semibold text-sm tracking-tight text-foreground">Super Admin</span>
                            <p className="text-xs text-muted-foreground">BeautyFlow</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
                    <div className="space-y-1">
                        <p className="px-3 mb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Plataforma</p>
                        {superAdminMenuItems.map((item) => {
                            const isActive = pathname.startsWith(item.href)
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                                        isActive
                                            ? "bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm"
                                            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-red-600 dark:text-red-400" : "text-muted-foreground group-hover:text-foreground")} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>

                    <div className="space-y-1 pt-4 border-t border-black/5 dark:border-white/10">
                        <p className="px-3 mb-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                            <Scissors className="w-3 h-3" /> Módulos Salão
                        </p>
                        {salonModules.map((item) => {
                            const isActive = pathname.startsWith(item.href)
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-sm"
                                            : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-black/5 dark:border-white/10 space-y-2">
                    <div className="px-3 py-2 rounded-lg bg-black/5 dark:bg-white/5">
                        <p className="text-xs font-medium text-muted-foreground">Logado como</p>
                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </aside>
        </>
    )
}
