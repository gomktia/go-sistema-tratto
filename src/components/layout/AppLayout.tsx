"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CalendarDays, Wallet, User as UserIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useTenant } from "@/contexts/tenant-context"
import { cn } from "@/lib/utils"
import { SuperAdminSidebar } from "./SuperAdminSidebar"
import { Sidebar } from "./Sidebar"
import { ProfessionalSidebar } from "./ProfessionalSidebar"
import { Header } from "./Header"

interface AppLayoutProps {
    children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const { isSuperAdmin, user } = useAuth()
    const pathname = usePathname()

    const isEmployee = user?.role === 'employee'

    // Desktop: Choose sidebar based on user role
    let SidebarComponent
    if (isSuperAdmin) {
        SidebarComponent = SuperAdminSidebar
    } else if (isEmployee) {
        SidebarComponent = ProfessionalSidebar  // Professional gets their own sidebar
    } else {
        SidebarComponent = Sidebar  // Company admin gets full sidebar
    }

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <SidebarComponent />
            <div className="flex-1 flex flex-col w-full md:w-auto min-w-0">
                <Header />
                <main className="flex-1 p-4 md:p-8 w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}

function ProfessionalShell({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const { user } = useAuth()
    const { currentTenant } = useTenant()

    const navItems = [
        { href: "/profissional/dashboard", label: "Home", icon: Home },
        { href: "/profissional/agenda", label: "Agenda", icon: CalendarDays },
        { href: "/profissional/financeiro", label: "Financeiro", icon: Wallet },
        { href: "/perfil", label: "Perfil", icon: UserIcon },
    ]

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950">
            <header className="px-5 py-4 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.4em] text-primary/60">Olá, {user?.name}</p>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">{currentTenant.name}</h1>
                </div>
                <Badge variant="secondary" className="rounded-full">
                    Vista Profissional
                </Badge>
            </header>
            <main className="flex-1 px-4 py-6">
                {children}
            </main>
            <nav className="sticky bottom-0 inset-x-0 bg-white dark:bg-zinc-900 border-t border-black/5 dark:border-white/5 px-4 py-3 flex items-center justify-between">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const active = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 text-xs font-semibold transition-colors",
                                active ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
        </div>
    )
}
