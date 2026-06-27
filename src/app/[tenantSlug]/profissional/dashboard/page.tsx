"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    Clock,
    DollarSign,
    Users,
    LogOut,
    RefreshCw,
    UserCircle
} from "lucide-react"

export default function ProfessionalDashboardPage() {
    const params = useParams()
    const router = useRouter()
    const tenantSlug = params.tenantSlug as string

    const [userType, setUserType] = useState<string | null>(null)

    useEffect(() => {
        // Check if user is authenticated
        const storedUserType = sessionStorage.getItem('userType')

        if (!storedUserType || storedUserType !== 'employee') {
            // Not authenticated as employee - redirect to login
            router.push(`/${tenantSlug}/login`)
            return
        }

        setUserType(storedUserType)
    }, [tenantSlug, router])

    const handleSwitchToClientMode = () => {
        // Store mode preference
        sessionStorage.setItem('viewMode', 'customer')
        // Redirect to customer profile/booking
        router.push(`/${tenantSlug}/book`)
    }

    const handleLogout = () => {
        sessionStorage.clear()
        router.push(`/${tenantSlug}/login`)
    }

    if (!userType) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 mx-auto animate-pulse" />
                    <p className="text-sm font-medium text-gray-600">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Dashboard Profissional</h1>
                            <p className="text-sm text-gray-600 dark:text-zinc-400">Gerencie seus agendamentos e atendimentos</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={handleSwitchToClientMode}
                                className="gap-2 rounded-full border-blue-200 text-blue-600 hover:bg-blue-50"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Modo Cliente
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="gap-2 text-red-600 hover:bg-red-50"
                            >
                                <LogOut className="w-4 h-4" />
                                Sair
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Info Banner */}
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                            <UserCircle className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Bem-vindo ao seu Dashboard!</h2>
                            <p className="text-sm text-gray-600 dark:text-zinc-400 mb-3">
                                Como profissional, você pode gerenciar seus atendimentos e também alternar para o modo cliente para agendar serviços com outros profissionais.
                            </p>
                            <Badge className="bg-purple-100 text-purple-700 border-none">
                                Sistema Inteligente - Dual Mode
                            </Badge>
                        </div>
                    </div>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">Agendamentos Hoje</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">0</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">Próximo Horário</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">--:--</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">Clientes Hoje</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">0</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-zinc-400">Faturamento Hoje</p>
                                <p className="text-2xl font-black text-gray-900 dark:text-white">R$ 0</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Upcoming Appointments */}
                <Card className="p-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white mb-4">Próximos Agendamentos</h2>
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 dark:text-zinc-700 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-zinc-400 font-medium">Nenhum agendamento para hoje</p>
                        <p className="text-sm text-gray-500 dark:text-zinc-500 mt-2">
                            Seus próximos atendimentos aparecerão aqui
                        </p>
                    </div>
                </Card>
            </main>
        </div>
    )
}
