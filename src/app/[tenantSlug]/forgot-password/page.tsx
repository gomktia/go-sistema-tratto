"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, ArrowRight, Mail, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"
import { supabase } from "@/lib/auth-helpers"

export default function ForgotPasswordPage() {
    const params = useParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    const [tenant, setTenant] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

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
            } catch (err) {
                console.error('Error fetching tenant:', err)
                router.push('/')
            } finally {
                setLoading(false)
            }
        }

        fetchTenant()
    }, [tenantSlug, router])

    const tenantInitials = tenant ? getInitials(tenant.business_name || tenant.name || 'BeautyFlow') : 'BF'
    const tenantBadge = tenant?.logo || tenantInitials

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!email.includes('@')) {
            setError("Por favor, informe um email válido")
            return
        }

        setIsSubmitting(true)
        setError("")

        try {
            // Buscar o cliente pelo email
            const { data: credential, error: credentialError } = await supabase
                .from('customer_credentials')
                .select('*, customer:customer_id(name)')
                .eq('email', email)
                .single()

            if (credentialError || !credential) {
                setError("Email não encontrado. Verifique se você digitou corretamente.")
                setIsSubmitting(false)
                return
            }

            // Aqui você poderia enviar um email com link de redefinição
            // Por enquanto, vamos apenas marcar como sucesso
            setSuccess(true)

            // Em produção, você enviaria um email com um token de redefinição
            console.log('Reset password for:', email)
        } catch (error: any) {
            console.error('Forgot password error:', error)
            setError("Erro ao processar solicitação. Por favor, tente novamente.")
        } finally {
            setIsSubmitting(false)
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
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                            Recuperar Senha
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 font-medium">
                            {tenant.business_name || tenant.name}
                        </p>
                    </div>
                    <Badge className="bg-blue-50 text-blue-600 border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                        Redefinição de Senha
                    </Badge>
                </div>

                <Card className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-5 sm:space-y-6">
                    {!success ? (
                        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                            <div className="space-y-3">
                                <p className="text-sm text-gray-600 dark:text-zinc-400 text-center">
                                    Informe seu email cadastrado e enviaremos instruções para redefinir sua senha.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Email *
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <Input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            setError("")
                                        }}
                                        className="h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                                    <p className="text-xs font-bold text-red-600 text-center">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting || !email}
                                className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Enviando...
                                    </div>
                                ) : (
                                    <>
                                        Enviar Instruções
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </Button>

                            <div className="text-center space-y-2">
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                                    Lembrou sua senha?{' '}
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/${tenantSlug}/login`)}
                                        className="font-bold text-blue-600 hover:text-blue-700"
                                    >
                                        Fazer login
                                    </button>
                                </p>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 text-center">
                            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 mx-auto flex items-center justify-center">
                                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Email Enviado!
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-zinc-400">
                                    Enviamos instruções para redefinir sua senha para:
                                </p>
                                <p className="text-sm font-semibold text-blue-600">{email}</p>
                            </div>

                            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <p className="text-xs text-gray-600 dark:text-zinc-400">
                                    Verifique sua caixa de entrada e siga as instruções no email.
                                    O link expira em 24 horas.
                                </p>
                            </div>

                            <Button
                                onClick={() => router.push(`/${tenantSlug}/login`)}
                                className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/30"
                            >
                                Voltar ao Login
                            </Button>
                        </div>
                    )}
                </Card>

                <Button
                    variant="ghost"
                    onClick={() => router.push(`/${tenantSlug}/book`)}
                    className="w-full text-sm sm:text-base text-gray-500 font-semibold hover:text-blue-600 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar ao Agendamento
                </Button>
            </motion.div>
        </div>
    )
}
