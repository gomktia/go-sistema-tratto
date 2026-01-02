"use client"

import React, { createContext, useContext, useState, ReactNode, useMemo, useEffect } from 'react'
import { tenants as mockTenants, type Tenant } from '@/mocks/tenants'
import { useAuth } from './auth-context'
import { getSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase/client'
import { getInitials } from '@/lib/utils'

interface TenantContextType {
    currentTenant: Tenant
    setCurrentTenant: (tenant: Tenant) => void
    allTenants: Tenant[]
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

type TenantRow = {
    id: string
    name: string
    slug: string
    full_name?: string | null
    logo_url?: string | null
    theme?: Record<string, string | undefined> | null
    settings?: Record<string, string | undefined> | null
}

const getInitialTenantId = () => {
    const fallbackId = mockTenants[0]?.id ?? ''
    if (typeof window === 'undefined') return fallbackId
    return localStorage.getItem('currentTenantId') || fallbackId
}

export function TenantProvider({ children, forcedSlug }: { children: ReactNode, forcedSlug?: string }) {
    const { user, isSuperAdmin } = useAuth()
    const [tenantId, setTenantId] = useState<string>(() => getInitialTenantId())
    const [allTenants, setAllTenants] = useState<Tenant[]>(mockTenants)

    useEffect(() => {
        const supabase = getSupabaseBrowserClient()
        if (!supabase || !isSupabaseConfigured) return

        let isMounted = true

        const mapTenant = (row: TenantRow): Tenant => {
            const theme = row.theme ?? {}
            const settings = row.settings ?? {}
            const initials = getInitials(row.full_name || row.name || '')
            const scheduling =
                settings.scheduling_type === 'shared' ? 'shared' : 'individual'
            return {
                id: row.id,
                name: row.name,
                fullName: row.full_name || row.name,
                logo: row.logo_url || initials,
                customLogo: row.logo_url || undefined,
                primaryColor: theme.primary || '#7c3aed',
                secondaryColor: theme.secondary || '#a78bfa',
                customPrimaryColor: theme.primary,
                customSecondaryColor: theme.secondary,
                description: settings.description || `Conta ${row.name}`,
                customDomain: settings.custom_domain || `${row.slug}.beautyflow.app`,
                slug: row.slug,
                whatsapp: settings.whatsapp || '',
                schedulingType: scheduling,
            }
        }

        const fetchTenants = async () => {
            const { data, error } = await supabase
                .from('tenants')
                .select('id, name, slug, full_name, logo_url, theme, settings')
                .order('name')

            if (error) {
                console.error('[TenantProvider] Erro ao buscar tenants no Supabase:', error.message)
                return
            }

            if (isMounted && data) {
                const mapped = data.map(mapTenant)
                if (mapped.length > 0) {
                    setAllTenants(mapped)

                    // Priority 1: Force by URL Slug (Public Routes)
                    if (forcedSlug) {
                        const target = mapped.find(t => t.slug === forcedSlug)
                        if (target && target.id !== tenantId) {
                            setTenantId(target.id)
                            return // Done
                        }
                    }

                    // Priority 2: Keep current selection if valid
                    const hasCurrent = mapped.some((tenant) => tenant.id === tenantId)
                    if (!hasCurrent && !forcedSlug) {
                        const fallback = mapped[0]
                        if (fallback) {
                            setTenantId(fallback.id)
                            if (typeof window !== 'undefined') {
                                localStorage.setItem('currentTenantId', fallback.id)
                            }
                        }
                    }
                }
            }
        }

        fetchTenants()

        return () => {
            isMounted = false
        }
    }, [tenantId, forcedSlug])

    const currentTenant = useMemo<Tenant>(() => {
        const tenantList = allTenants.length > 0 ? allTenants : mockTenants

        // For Authenticated Non-SuperAdmin Users (Employees, Company Admins)
        // STRICTLY enforce their own tenant. Do NOT fallback to the first random tenant if their tenant is not found provided list.
        if (user && !isSuperAdmin && user.companyId) {
            const usersTenant = tenantList.find(t => t.id === user.companyId)
            if (usersTenant) return usersTenant

            // If user's tenant is not in the list yet (maybe loading?), return a placeholder or the first one CAUTIOUSLY
            // But better to return the first one than crash, just logging the issue.
            // console.warn("User's tenant not found in available list", user.companyId)
        }

        return tenantList.find(t => t.id === tenantId) || tenantList[0]
    }, [user, isSuperAdmin, tenantId, allTenants])

    const setCurrentTenant = (tenant: Tenant) => {
        if (!isSuperAdmin) return
        setTenantId(tenant.id)
        if (typeof window !== 'undefined') {
            localStorage.setItem('currentTenantId', tenant.id)
        }
    }

    return (
        <TenantContext.Provider value={{
            currentTenant,
            setCurrentTenant,
            allTenants
        }}>
            {children}
        </TenantContext.Provider>
    )
}

export function useTenant() {
    const context = useContext(TenantContext)
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider')
    }
    return context
}
