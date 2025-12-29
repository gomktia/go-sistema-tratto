"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Sparkles, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import Link from "next/link"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const { login, user } = useAuth()
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const success = await login(email, password)

            if (success) {
                // Redirect based on user role (wait a tick for user state to update)
                setTimeout(() => {
                    // This will be updated by the auth context
                    window.location.href = "/dashboard"
                }, 100)
            } else {
                setError("Email ou senha inválidos")
            }
        } catch (err) {
            setError("Erro ao fazer login. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            switch (user.role) {
                case 'super_admin':
                    router.push('/super-admin/dashboard')
                    break
                case 'company_admin':
                    router.push('/dashboard')
                    break
                case 'employee':
                    router.push('/profissional/dashboard')
                    break
                default:
                    router.push('/dashboard')
            }
        }
    }, [user, router])

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white overflow-auto p-4">
            {/* Background decorations */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-40" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

            <div className="w-full max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2">BeautyFlow</h1>
                        <p className="text-gray-600 font-medium">Área para Empresas e Profissionais</p>
                    </div>

                    {/* Login Card */}
                    <Card className="p-8 bg-white/80 backdrop-blur-xl border border-gray-100 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                    Senha
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-12 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-all pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600 font-medium">{error}</p>
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Entrando...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Entrar
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </Card>

                    {/* Footer */}
                    <div className="mt-8 text-center space-y-4">
                        <p className="text-sm text-gray-600">
                            Não tem uma conta?{" "}
                            <Link href="/" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                Ver planos
                            </Link>
                        </p>
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                            <a href="#" className="hover:text-gray-700 transition-colors">Privacidade</a>
                            <span>•</span>
                            <a href="#" className="hover:text-gray-700 transition-colors">Termos</a>
                            <span>•</span>
                            <a href="#" className="hover:text-gray-700 transition-colors">Suporte</a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
