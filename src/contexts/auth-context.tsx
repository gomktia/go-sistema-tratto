"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { supabase } from '@/lib/auth-helpers'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export type UserRole = 'super_admin' | 'company_admin' | 'employee' | 'customer'

interface User {
    id: string
    name: string
    email: string
    role: UserRole
    companyId?: string // Only for company_admin and employee
}

interface AuthContextType {
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    isAuthenticated: boolean
    isSuperAdmin: boolean
    isCompanyAdmin: boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Maps Supabase user to our User interface
 */
async function mapSupabaseUser(supabaseUser: SupabaseUser): Promise<User | null> {
    const metadata = supabaseUser.user_metadata
    const role = metadata.role as UserRole || 'customer'
    const tenantId = metadata.tenant_id

    // For super_admin, just return basic info
    if (role === 'super_admin') {
        return {
            id: supabaseUser.id,
            name: metadata.full_name || metadata.name || 'Super Admin',
            email: supabaseUser.email || '',
            role: 'super_admin',
        }
    }

    // For company_admin, fetch tenant info if needed
    if (role === 'company_admin') {
        return {
            id: supabaseUser.id,
            name: metadata.full_name || metadata.name || 'Administrador',
            email: supabaseUser.email || '',
            role: 'company_admin',
            companyId: tenantId,
        }
    }

    // For employee, fetch employee record
    if (role === 'employee') {
        const { data: employee } = await supabase
            .from('employees')
            .select('id, name, tenant_id')
            .eq('user_id', supabaseUser.id)
            .single()

        return {
            id: supabaseUser.id,
            name: employee?.name || metadata.full_name || metadata.name || 'Funcionário',
            email: supabaseUser.email || '',
            role: 'employee',
            companyId: employee?.tenant_id || tenantId,
        }
    }

    // For customer (shouldn't happen in this context, but handle it)
    return {
        id: supabaseUser.id,
        name: metadata.full_name || metadata.name || 'Cliente',
        email: supabaseUser.email || '',
        role: 'customer',
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check for existing session on mount
    useEffect(() => {
        let isMounted = true

        async function loadSession() {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (session?.user && isMounted) {
                    const mappedUser = await mapSupabaseUser(session.user)
                    setUser(mappedUser)
                } else if (isMounted) {
                    // DEMO FALLBACK: Check for demo session in storage
                    const demoSession = sessionStorage.getItem('demoSession')
                    if (demoSession) {
                        try {
                            const demoData = JSON.parse(demoSession)
                            const role = demoData.user?.user_metadata?.role || 'employee'
                            setUser({
                                id: demoData.user?.id || 'demo-id',
                                name: demoData.employee?.full_name || demoData.employee?.name || 'Usuário Demo',
                                email: demoData.user?.email || '',
                                role: role,
                                companyId: demoData.employee?.tenant_id
                            })
                        } catch (e) {
                            console.error('Invalid demo session')
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading session:', error)
            } finally {
                if (isMounted) {
                    setIsLoading(false)
                }
            }
        }

        loadSession()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user && isMounted) {
                const mappedUser = await mapSupabaseUser(session.user)
                setUser(mappedUser)
            } else if (event === 'SIGNED_OUT' && isMounted) {
                setUser(null)
                // Clear demo session on sign out event too
                sessionStorage.removeItem('demoSession')
            }
        })

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                console.error('Login error:', error.message)
                return false
            }

            if (!data.user) {
                return false
            }

            const mappedUser = await mapSupabaseUser(data.user)
            setUser(mappedUser)
            return true
        } catch (error) {
            console.error('Login exception:', error)
            return false
        }
    }

    const logout = async () => {
        try {
            await supabase.auth.signOut()
            sessionStorage.removeItem('demoSession')
            sessionStorage.removeItem('userType')
            sessionStorage.removeItem('tenantSlug')
            setUser(null)
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
            isSuperAdmin: user?.role === 'super_admin',
            isCompanyAdmin: user?.role === 'company_admin',
            isLoading,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
