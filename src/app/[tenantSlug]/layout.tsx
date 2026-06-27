"use client"

import { TenantProvider } from "@/contexts/tenant-context"
import { ThemeApplier } from "@/components/theme-applier"
import { useParams } from "next/navigation"

export default function TenantPublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const params = useParams()
    const tenantSlug = params.tenantSlug as string

    // Enforce TenantProvider for everything inside /[tenantSlug]
    return (
        <TenantProvider forcedSlug={tenantSlug}>
            <ThemeApplier /> {/* Apply Custom Colors */}
            {children}
        </TenantProvider>
    )
}
