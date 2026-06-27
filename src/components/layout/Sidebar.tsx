"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useTenant } from "@/contexts/tenant-context"
import { useSubscription } from "@/hooks/useSubscription"
import { cn } from "@/lib/utils"
import {
    Calendar,
    LayoutDashboard,
    Users,
    Settings,
    Scissors,
    UserCircle,
    LogOut,
    Building2,
    DollarSign,
    Package,
    Megaphone,
    Smartphone,
    Menu,
    X,
    Image as ImageIcon,
    BarChart3,
    Trophy,
    CreditCard,
    Lock,
    Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
    const pathname = usePathname()
    const { logout } = useAuth()
    const { currentTenant } = useTenant()
    const { checkPermission, isExpired } = useSubscription(currentTenant)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Dynamic Menu Structure
    const slug = currentTenant?.slug || 'demo'
    const menuSections = [
        {
            title: "Principal",
            items: [
                { icon: LayoutDashboard, label: "Visão Geral", href: `/${slug}/dashboard`, permission: null },
                { icon: Calendar, label: "Agenda", href: `/${slug}/agenda`, permission: null },
            ]
        },
        {
            title: "Gestão",
            items: [
                { icon: Users, label: "Clientes", href: `/${slug}/clientes`, permission: null },
                { icon: Scissors, label: "Serviços", href: `/${slug}/servicos`, permission: null },
                { icon: ImageIcon, label: "Galeria", href: `/${slug}/galeria`, permission: 'marketingGallery' },
                { icon: UserCircle, label: "Funcionários", href: `/${slug}/funcionarios`, permission: null },
                { icon: DollarSign, label: "Financeiro", href: `/${slug}/financeiro`, permission: 'financialModule' },
                { icon: Package, label: "Estoque & PDV", href: `/${slug}/estoque`, permission: 'inventoryModule' },
                { icon: Megaphone, label: "CRM & Marketing", href: `/${slug}/crm`, permission: 'marketingGallery' },
                { icon: Sparkles, label: "Social IA", href: `/${slug}/social`, permission: 'marketingGallery' },
                { icon: BarChart3, label: "Relatórios", href: `/${slug}/relatorios`, permission: 'financialModule' },
                { icon: Trophy, label: "Clube Fidelidade", href: `/${slug}/fidelidade`, permission: 'fidelityClub' },
                { icon: Smartphone, label: "Vista Profissional", href: `/${slug}/profissional`, permission: null },
            ]
        },
        {
            title: "Configurações",
            items: [
                { icon: Building2, label: "Perfil", href: `/${slug}/perfil`, permission: null },
                { icon: CreditCard, label: "Assinatura", href: `/${slug}/assinatura`, permission: null },
                { icon: Settings, label: "Configurações", href: `/${slug}/configuracoes`, permission: null },
                { icon: Package, label: "Integrações", href: `/${slug}/integracoes`, permission: 'multiUnit' },
            ]
        }
    ]

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
                    <div className="flex items-center gap-2 text-primary">
                        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                            <Scissors className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-lg tracking-tight text-foreground">Tratto</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto scrollbar-hide">
                    {menuSections.map((section) => (
                        <div key={section.title}>
                            <p className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                {section.title}
                            </p>
                            <div className="space-y-1">
                                {section.items.map((item) => {
                                    const isActive = pathname.startsWith(item.href)
                                    // Subscription Check
                                    // @ts-expect-error - permission string mapping check
                                    const isLocked = item.permission ? !checkPermission(item.permission) : false
                                    const Icon = item.icon

                                    return (
                                        <Link
                                            key={item.href}
                                            href={isLocked ? '#' : item.href} // Disable link if locked
                                            onClick={(e) => {
                                                if (isLocked) {
                                                    e.preventDefault()
                                                    // Trigger upgrade modal (future impl)
                                                    alert("Funcionalidade bloqueada no seu plano atual. Faça o upgrade!")
                                                }
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative select-none",
                                                isActive
                                                    ? "bg-primary/10 text-primary shadow-sm"
                                                    : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground",
                                                isLocked && "opacity-60 cursor-not-allowed hover:bg-transparent"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                                                {item.label}
                                            </div>

                                            {isLocked && (
                                                <Lock className="w-3 h-3 text-amber-500" />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* User / Logout */}
                <div className="p-4 border-t border-black/5 dark:border-white/10">
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


