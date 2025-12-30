"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, ArrowRight, User, Mail, Phone, Lock, IdCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn, getInitials } from "@/lib/utils"
import { supabase } from "@/lib/supabase"

export default function CustomerSignupPage() {
    const params = useParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    const [tenant, setTenant] = useState<any>(null)
    const [tenantId, setTenantId] = useState<string>("")
    const [loading, setLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        password: "",
        confirmPassword: ""
    })

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

    const tenantInitials = tenant ? getInitials(tenant.business_name || tenant.name || 'BeautyFlow') : 'BF'
    const tenantBadge = tenant?.logo || tenantInitials

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setError("")
    }

    const formatPhone = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
        }
        return value
    }

    const formatCPF = (value: string) => {
        const numbers = value.replace(/\D/g, '')
        if (numbers.length <= 11) {
            return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
        }
        return value
    }

    const validateForm = () => {
        if (!formData.name.trim()) {
            setError("Por favor, informe seu nome completo")
            return false
        }
        if (!formData.email.includes('@')) {
            setError("Por favor, informe um email válido")
            return false
        }
        if (formData.phone.replace(/\D/g, '').length < 10) {
            setError("Por favor, informe um telefone válido")
            return false
        }
        if (formData.cpf.replace(/\D/g, '').length !== 11) {
            setError("Por favor, informe um CPF válido")
            return false
        }
        if (formData.password.length < 6) {
            setError("A senha deve ter no mínimo 6 caracteres")
            return false
        }
        if (formData.password !== formData.confirmPassword) {
            setError("As senhas não coincidem")
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsSubmitting(true)
        setError("")

        try {
            // Check if customer already exists
            const { data: existingCustomer } = await supabase
                .from('customer_credentials')
                .select('id')
                .or(`email.eq.${formData.email},cpf.eq.${formData.cpf.replace(/\D/g, '')}`)
                .single()

            if (existingCustomer) {
                setError("Já existe um cadastro com este email ou CPF")
                setIsSubmitting(false)
                return
            }

            // Create customer record
            const { data: customer, error: customerError } = await supabase
                .from('customers')
                .insert({
                    tenant_id: tenantId,
                    name: formData.name,
                    phone: formData.phone.replace(/\D/g, ''),
                    cpf: formData.cpf.replace(/\D/g, ''),
                    points: 0,
                    status: 'active'
                })
                .select()
                .single()

            if (customerError || !customer) {
                console.error('Error creating customer:', customerError)
                setError("Erro ao criar cadastro. Por favor, tente novamente.")
                setIsSubmitting(false)
                return
            }

            // Create credentials
            const { error: credentialsError } = await supabase
                .from('customer_credentials')
                .insert({
                    customer_id: customer.id,
                    email: formData.email,
                    cpf: formData.cpf.replace(/\D/g, ''),
                    password_hash: formData.password // In production, this should be bcrypt hashed
                })

            if (credentialsError) {
                console.error('Error creating credentials:', credentialsError)
                // Try to delete the customer record since credential creation failed
                await supabase.from('customers').delete().eq('id', customer.id)
                setError("Erro ao criar credenciais. Por favor, tente novamente.")
                setIsSubmitting(false)
                return
            }

            // Success! Store session and redirect
            sessionStorage.setItem('customerEmail', formData.email)
            sessionStorage.setItem('userType', 'customer')
            sessionStorage.setItem('tenantSlug', tenantSlug)

            // Show success message
            alert('Cadastro realizado com sucesso! Você já pode fazer login.')

            // Redirect to login
            router.push(`/${tenantSlug}/login`)
        } catch (error: any) {
            console.error('Signup error:', error)
            setError("Erro ao criar cadastro. Por favor, tente novamente.")
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
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 dark:text-white">Criar Conta</h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 font-medium">
                            {tenant.business_name || tenant.name} - Cadastro de Cliente
                        </p>
                    </div>
                    <Badge className="bg-blue-50 text-blue-600 border-none rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                        Novo Cliente
                    </Badge>
                </div>

                <Card className="p-6 sm:p-8 rounded-2xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-100 dark:border-zinc-800 shadow-2xl space-y-5 sm:space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Nome Completo *
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="João Silva"
                                    value={formData.name}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Email */}
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
                                    placeholder="joao@email.com"
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    className="h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Telefone *
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="(11) 99999-9999"
                                    value={formData.phone}
                                    onChange={(e) => handleChange('phone', formatPhone(e.target.value))}
                                    maxLength={15}
                                    className="h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* CPF */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                CPF *
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <IdCard className="w-5 h-5" />
                                </div>
                                <Input
                                    type="text"
                                    placeholder="000.000.000-00"
                                    value={formData.cpf}
                                    onChange={(e) => handleChange('cpf', formatCPF(e.target.value))}
                                    maxLength={14}
                                    className="h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Senha *
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    className="h-12 pl-12 pr-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Confirmar Senha *
                            </Label>
                            <div className="relative group">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <Input
                                    type="password"
                                    placeholder="Digite a senha novamente"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
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
                            disabled={isSubmitting}
                            className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Criando conta...
                                </div>
                            ) : (
                                <>
                                    Criar Conta
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="text-center space-y-2">
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-zinc-400">
                            Já tem uma conta?{' '}
                            <button
                                onClick={() => router.push(`/${tenantSlug}/login`)}
                                className="font-bold text-blue-600 hover:text-blue-700"
                            >
                                Fazer login
                            </button>
                        </p>
                    </div>
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
