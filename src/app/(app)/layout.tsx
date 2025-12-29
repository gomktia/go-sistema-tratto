"use client"

import { AppLayout } from "@/components/layout/AppLayout"
import { TenantProvider } from "@/contexts/tenant-context"
import { ThemeApplier } from "@/components/theme-applier"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export default function Layout({
    children,
}: {
    children: React.ReactNode
}) {
    const { isAuthenticated, isSuperAdmin, isLoading } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        // Don't redirect while loading session
        if (isLoading) return

        // 1. Check if user is authenticated
        if (!isAuthenticated) {
            router.push("/login")
            return
        }

        // 2. Check for super-admin route protection
        if (pathname.startsWith("/super-admin") && !isSuperAdmin) {
            router.push("/dashboard")
        }
    }, [isAuthenticated, isSuperAdmin, isLoading, pathname, router])

    // Show loading state while checking session
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return null // Will redirect in useEffect
    }

    return (
        <TenantProvider>
            <ThemeApplier />
            <AppLayout>{children}</AppLayout>
        </TenantProvider>
    )
}

