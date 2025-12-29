"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Shield, ArrowRight, AlertCircle, Eye, EyeOff, Lock } from "lucide-react"
import { motion } from "framer-motion"

export default function SystemLoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const { login, user, isSuperAdmin } = useAuth()
    const router = useRouter()

    // Redirect if already logged in as super admin
    useEffect(() => {
        if (user && isSuperAdmin) {
            router.push("/super-admin/dashboard")
        } else if (user && !isSuperAdmin) {
            // Logged in but not super admin - redirect to appropriate page
            setError("Acesso negado. Esta área é apenas para Super Administradores.")
        }
    }, [user, isSuperAdmin, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const success = await login(email, password)

            if (success) {
                // The useEffect will handle redirect if user is super_admin
                // If not super admin, show error
                setTimeout(() => {
                    // Check will happen in useEffect
                }, 100)
            } else {
                setError("Acesso negado. Credenciais de super admin inválidas.")
            }
        } catch (err) {
            setError("Erro ao fazer login. Tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-auto p-4">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />

            {/* Glow effects */}
            <div className="absolute top-20 left-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
            <div className="absolute top-40 right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000" />

            <div className="w-full max-w-md relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Logo and Title */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-600 flex items-center justify-center shadow-2xl">
                                <Shield className="w-8 h-8 text-gray-300" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-black text-white mb-2">System Access</h1>
                        <p className="text-gray-400 font-medium">Área restrita - Super Admin</p>
                    </div>

                    {/* Login Card */}
                    <Card className="p-8 bg-gray-800/50 backdrop-blur-xl border border-gray-700 shadow-2xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-300">
                                    Email de Administrador
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@beautyflow.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className="h-12 rounded-xl bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold text-gray-300">
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
                                        className="h-12 rounded-xl bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
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
                                    className="p-4 rounded-xl bg-red-900/20 border border-red-800 flex items-start gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-400 font-medium">{error}</p>
                                </motion.div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-semibold border border-gray-600 shadow-lg transition-all"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Verificando...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Acessar Sistema
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                )}
                            </Button>
                        </form>

                        {/* Security notice */}
                        <div className="mt-6 p-4 bg-gray-900/30 rounded-xl border border-gray-700">
                            <div className="flex items-start gap-3">
                                <Shield className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-gray-400 leading-relaxed">
                                    <p className="font-semibold mb-1">Acesso Seguro</p>
                                    <p>Esta área é monitorada. Todas as tentativas de login são registradas.</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Footer */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            BeautyFlow Platform Administration • v1.0.0
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
