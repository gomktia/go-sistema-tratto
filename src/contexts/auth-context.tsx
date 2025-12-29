"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for development
const MOCK_USERS: User[] = [
    {
        id: 'super-1',
        name: 'Geison Hoehr',
        email: 'geisonhoehr@gmail.com',
        role: 'super_admin'
    },
    {
        id: 'super-2',
        name: 'Oseias Santos',
        email: 'oseias01fab@gmail.com',
        role: 'super_admin'
    },
    {
        id: 'super-3',
        name: 'Admin Master',
        email: 'admin@beautyflow.com',
        role: 'super_admin'
    },
    {
        id: 'company-1',
        name: 'Gerente Beleza Pura',
        email: 'gerente@belezapura.com',
        role: 'company_admin',
        companyId: '1'
    },
    {
        id: 'company-2',
        name: 'Gerente Studio Glamour',
        email: 'gerente@studioglamour.com',
        role: 'company_admin',
        companyId: '2'
    }
]

// Mock passwords for development (in production, use proper hashing)
const MOCK_PASSWORDS: Record<string, string> = {
    'geisonhoehr@gmail.com': '123456',
    'oseias01fab@gmail.com': 'Oseias01$',
    'admin@beautyflow.com': 'admin',
    'gerente@belezapura.com': 'senha',
    'gerente@studioglamour.com': 'senha'
}

function getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    const savedUser = window.localStorage.getItem('currentUser')
    if (!savedUser) return null
    try {
        return JSON.parse(savedUser) as User
    } catch (error) {
        console.error('Error loading user:', error)
        return null
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => getStoredUser())

    const login = async (email: string, password: string): Promise<boolean> => {
        // Mock authentication - in production, this would call an API
        const foundUser = MOCK_USERS.find(u => u.email === email)

        if (foundUser && MOCK_PASSWORDS[email] === password) {
            setUser(foundUser)
            localStorage.setItem('currentUser', JSON.stringify(foundUser))
            return true
        }

        return false
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('currentUser')
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            isAuthenticated: !!user,
            isSuperAdmin: user?.role === 'super_admin',
            isCompanyAdmin: user?.role === 'company_admin'
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
