"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, ArrowRight, Lock, User, Briefcase, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, getInitials } from "@/lib/utils"
import { intelligentLogin, checkUserExists, type UserType, supabase } from "@/lib/auth-helpers"

interface DetectedUser {
    name: string
    email: string
    userType: UserType
    data: any
}

export default function CustomerLoginPage() {
    const params = useParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    const [tenant, setTenant] = useState<any>(null)
    const [tenantId, setTenantId] = useState<string>("")
    const [loading, setLoading] = useState(true)

    const [identifier, setIdentifier] = useState("")
    const [stage, setStage] = useState<'identify' | 'password' | 'signup'>('identify')
    const [password, setPassword] = useState("")
    const [detectedUser, setDetectedUser] = useState<DetectedUser | null>(null)
    const [error, setError] = useState("")
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    // Fetch tenant data from Supabase
    useEffect(() => {
        async function fetchTenant() {
            try {
                const { data, error } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('slug', tenantSlug)
                    .single()

                if (error || !data) {
                    console.error('Tenant not found:', error)
                    router.push('/')
                    return
                }

                setTenant(data)
                setTenantId(data.id)
            } catch (err) {
                console.error('Error fetching tenant:', err)
                router.push('/')
            } finally {
                setLoading(false)
            }
        }

        fetchTenant()
    }, [tenantSlug, router])

    const tenantInitials = useMemo(() => {
        if (!tenant) return 'BF'
        return getInitials(tenant.business_name || tenant.name || 'BeautyFlow')
    }, [tenant])

    const tenantBadge = tenant?.logo || tenantInitials

    const resetFlow = () => {
        setStage('identify')
        setDetectedUser(null)
        setPassword("")
        setError("")
    }

    const handleIdentify = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoggingIn(true)

        if (!tenantId) {
            setError("Erro ao identificar o salão")
            setIsLoggingIn(false)
            return
        }

        try {
            // Check if user exists in either system
            const result = await checkUserExists(identifier, tenantId)

            if (result.exists && result.data) {
                // Extract user information based on type
                let userName = ''
                let userEmail = identifier

                if (result.userType === 'customer') {
                    userName = result.data.customer?.name || 'Cliente'
                    userEmail = result.data.email || identifier
                } else {
                    // Employee/Admin
                    userName = result.data.full_name || 'Profissional'
                }

                setDetectedUser({
                    name: userName,
                    email: userEmail,
                    userType: result.userType!,
                    data: result.data
                })
                setStage('password')
                setPassword("")
            } else {
                // User not found - go to signup
                setDetectedUser(null)
                setStage('signup')
            }
        } catch (err: any) {
            console.error('Error checking user:', err)
            setError('Erro ao verificar usuário. Tente novamente.')
        } finally {
            setIsLoggingIn(false)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!detectedUser || !tenantId) return

        setError("")
        setIsLoggingIn(true)

        try {
            // Use intelligent login to authenticate
            const result = await intelligentLogin(identifier, password, tenantId)

            if (result.success) {
                // Store user session data securely
                sessionStorage.setItem('userType', result.userType!)
                sessionStorage.setItem('tenantSlug', tenantSlug)

                // For customers, store email securely
                if (result.userType === 'customer' && result.userData) {
                    const customerEmail = result.userData.email || identifier
                    sessionStorage.setItem('customerEmail', customerEmail)
                }

                // Redirect based on user type
                const fullPath = `/${tenantSlug}${result.redirectPath}`
                router.push(fullPath)
            } else {
                setError(result.error || "Falha no login. Verifique suas credenciais.")
            }
        } catch (err: any) {
            console.error('Login error:', err)
            setError("Erro ao fazer login. Tente novamente.")
        } finally {
            setIsLoggingIn(false)
        }
    }

    const loginSteps = [
        { id: 'identify', label: 'Identificação' },
        { id: 'password', label: 'Confirmação' },
        { id: 'signup', label: 'Primeiro acesso' },
    ]
    const currentStepIndex = loginSteps.findIndex(stepItem => stepItem.id === stage)

    // Get user type badge info
    const getUserTypeBadge = (userType: UserType) => {
        switch (userType) {
            case 'customer':
                return { label: 'Cliente', icon: User, color: 'border-blue-200 text-blue-600' }
            case 'employee':
                return { label: 'Profissional', icon: Briefcase, color: 'border-purple-200 text-purple-600' }
            case 'company_admin':
                return { label: 'Gerente', icon: UserCog, color: 'border-green-200 text-green-600' }
            case 'super_admin':
                return { label: 'Admin', icon: UserCog, color: 'border-red-200 text-red-600' }
            default:
                return { label: 'Usuário', icon: User, color: 'border-gray-200 text-gray-600' }
        }
    }

    if (loading) {
        return (
            <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mx-auto animate-pulse" />
                    <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">Carregando...</p>
                </div>
            </div>
        )
    }

    if (!tenant) {
        return null
    }

    return (
        <div className="fixed inset-0 bg-white dark:bg-zinc-950 flex items-center justify-center p-4 sm:p-6 font-sans overflow-auto">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-40" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10"
            >
                <div className="text-center space-y-3 sm:space-y-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mx-auto flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-2xl shadow-blue-500/30">
                        {tenantBadge}
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Área de Login</h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 font-medium">
                            {tenant.business_name || tenant.name} - Clientes e Profissionais
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {loginSteps.map((stepItem, index) => (
                        <div
                            key={stepItem.id}
                            className={cn(
                                "flex-1 h-2 rounded-full transition-all",
                                index <= currentStepIndex ? "bg-gradient-to-r from-blue-600 to-purple-600" : "bg-gray-200 dark:bg-zinc-800"
                            )}
                        />
                    ))}
                </div>

                <Card className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-6 sm:space-y-8">
                    {stage === 'identify' && (
                        <form onSubmit={handleIdentify} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    CPF ou e-mail
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="000.000.000-00 ou voce@email.com"
                                        value={identifier}
                                        onChange={(e) => setIdentifier(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Identificaremos automaticamente se você já possui cadastro.
                                </p>
                            </div>

                            {error && (
                                <p className="text-xs font-bold text-red-500 text-center">{error}</p>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoggingIn || !identifier}
                                className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoggingIn ? 'Verificando...' : 'Continuar'}
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </form>
                    )}

                    {stage === 'password' && detectedUser && (
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/50">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                                    {detectedUser.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-900 dark:text-white">{detectedUser.name}</p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400">{detectedUser.email}</p>
                                </div>
                                <Badge variant="outline" className={cn("rounded-full text-[10px] font-bold uppercase tracking-widest", getUserTypeBadge(detectedUser.userType).color)}>
                                    {getUserTypeBadge(detectedUser.userType).label}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Senha</label>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/${tenantSlug}/forgot-password`)}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                        Esqueceu sua senha?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-xs font-bold text-red-500 text-center">{error}</p>
                            )}

                            <div className="space-y-3">
                                <Button
                                    type="submit"
                                    disabled={isLoggingIn || !password}
                                    className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoggingIn ? 'Entrando...' : 'Entrar'}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={resetFlow}
                                    disabled={isLoggingIn}
                                    className="w-full h-10 rounded-xl text-gray-500 hover:text-blue-600"
                                >
                                    Não é você? Informar outro CPF/E-mail
                                </Button>
                            </div>
                        </form>
                    )}

                    {stage === 'signup' && (
                        <div className="space-y-6 text-center">
                            <Badge className="mx-auto w-fit bg-blue-50 text-blue-600 border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                                Primeiro acesso
                            </Badge>
                            <div className="space-y-2">
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">Ainda não encontramos você</h3>
                                <p className="text-sm text-gray-600 dark:text-zinc-400">
                                    Crie sua conta para acessar o portal ou agende online para criar automaticamente.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push(`/${tenantSlug}/signup`)}
                                    className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all"
                                >
                                    Criar Conta
                                </Button>
                                <Button
                                    onClick={() => router.push(`/${tenantSlug}/book`)}
                                    variant="outline"
                                    className="w-full h-12 rounded-full border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                                >
                                    Agendar e criar acesso
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={resetFlow}
                                    className="w-full h-10 rounded-xl text-gray-500 hover:text-blue-600"
                                >
                                    Tentar outro CPF/E-mail
                                </Button>
                            </div>
                        </div>
                    )}
                </Card>

                <Button
                    variant="ghost"
                    onClick={() => router.push(`/${tenantSlug}/book`)}
                    className="w-full text-gray-500 font-semibold hover:text-blue-600 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar ao Agendamento
                </Button>
            </motion.div>
        </div>
    )
}
