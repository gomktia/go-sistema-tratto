"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Shield,
    UserPlus,
    Search,
    MoreVertical,
    Mail,
    Calendar,
    Key,
    AlertCircle,
    Check,
    X,
    Eye,
    EyeOff
} from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// Tipos de roles disponíveis
const ADMIN_ROLES = [
    { value: 'super_admin', label: 'Super Admin', description: 'Acesso total ao sistema', color: 'text-red-600 bg-red-50' },
    { value: 'support_admin', label: 'Suporte', description: 'Gerencia tickets e suporte', color: 'text-blue-600 bg-blue-50' },
    { value: 'financial_admin', label: 'Financeiro', description: 'Gerencia cobranças e pagamentos', color: 'text-green-600 bg-green-50' },
    { value: 'analytics_admin', label: 'Analytics', description: 'Acessa relatórios e métricas', color: 'text-purple-600 bg-purple-50' },
]

type AdminUser = {
    id: string
    email: string
    full_name: string
    role: string
    created_at: string
    last_sign_in_at?: string
}

export default function AdministradoresPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [isCreating, setIsCreating] = useState(false)
    const [showPassword, setShowPassword] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'support_admin'
    })
    const [formError, setFormError] = useState('')
    const [formSuccess, setFormSuccess] = useState('')

    useEffect(() => {
        loadAdmins()
    }, [])

    const loadAdmins = async () => {
        setIsLoading(true)
        try {
            const supabase = getSupabaseBrowserClient()
            if (!supabase) {
                throw new Error('Supabase não configurado')
            }

            // Buscar todos os app_users que são admins do sistema
            const { data, error } = await supabase
                .from('app_users')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error

            // TODO: Filtrar apenas admins quando tivermos o campo role na tabela
            // Client-side fix: filtrar por role = 'super_admin' ou se o email contém 'admin' para garantia em mocks
            const superAdmins = (data || []).filter((u: any) => u.role === 'super_admin' || u.email?.includes('admin') || u.email === 'geison@beautyflow.app' || u.email === 'oseias@beautyflow.app')
            setAdmins(superAdmins)
        } catch (error: any) {
            console.error('Erro ao carregar admins:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError('')
        setFormSuccess('')
        setIsCreating(true)

        try {
            // Validações
            if (!formData.email || !formData.password || !formData.full_name) {
                throw new Error('Preencha todos os campos obrigatórios')
            }

            if (formData.password.length < 6) {
                throw new Error('A senha deve ter no mínimo 6 caracteres')
            }

            // Aqui você precisará chamar uma API route ou Cloud Function
            // pois criar usuários requer a Service Role Key (não pode ser no frontend)
            const response = await fetch('/api/admin/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Erro ao criar administrador')
            }

            setFormSuccess('Administrador criado com sucesso!')
            setFormData({ email: '', password: '', full_name: '', role: 'support_admin' })

            // Recarregar lista
            setTimeout(() => {
                loadAdmins()
                setIsDialogOpen(false)
                setFormSuccess('')
            }, 2000)

        } catch (error: any) {
            setFormError(error.message)
        } finally {
            setIsCreating(false)
        }
    }

    const filteredAdmins = admins.filter(admin =>
        admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getRoleBadge = (role?: string) => {
        const roleConfig = ADMIN_ROLES.find(r => r.value === role) || ADMIN_ROLES[0]
        return (
            <Badge className={cn("text-xs font-semibold", roleConfig.color)}>
                {roleConfig.label}
            </Badge>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                                Administradores
                            </h2>
                            <p className="text-gray-600 dark:text-zinc-400 font-medium">
                                Gerencie os usuários com acesso ao painel administrativo
                            </p>
                        </div>
                    </div>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/30 gap-2">
                            <UserPlus className="w-4 h-4" />
                            Novo Administrador
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black">Criar Administrador</DialogTitle>
                            <DialogDescription>
                                Adicione um novo usuário com acesso ao painel administrativo
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateAdmin} className="space-y-6 mt-4">
                            {/* Nome Completo */}
                            <div className="space-y-2">
                                <Label htmlFor="full_name" className="text-sm font-semibold">
                                    Nome Completo *
                                </Label>
                                <Input
                                    id="full_name"
                                    placeholder="João Silva"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    required
                                    className="h-11"
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold">
                                    Email *
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="admin@beautyflow.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                    className="h-11"
                                />
                            </div>

                            {/* Senha */}
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold">
                                    Senha *
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        className="h-11 pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500">Mínimo 6 caracteres</p>
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-sm font-semibold">
                                    Tipo de Acesso *
                                </Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(value) => setFormData({ ...formData, role: value })}
                                >
                                    <SelectTrigger className="h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {ADMIN_ROLES.map((role) => (
                                            <SelectItem key={role.value} value={role.value}>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{role.label}</span>
                                                    <span className="text-xs text-gray-500">{role.description}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Erro/Sucesso */}
                            {formError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2"
                                >
                                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-600">{formError}</p>
                                </motion.div>
                            )}

                            {formSuccess && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl bg-green-50 border border-green-200 flex items-start gap-2"
                                >
                                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-green-600">{formSuccess}</p>
                                </motion.div>
                            )}

                            {/* Botões */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    className="flex-1"
                                    disabled={isCreating}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                                    disabled={isCreating}
                                >
                                    {isCreating ? 'Criando...' : 'Criar Administrador'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nome ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11"
                    />
                </div>
            </Card>

            {/* Lista de Administradores */}
            <Card className="p-6">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <p className="mt-4 text-gray-600">Carregando administradores...</p>
                    </div>
                ) : filteredAdmins.length === 0 ? (
                    <div className="text-center py-12">
                        <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                            {searchTerm ? 'Nenhum administrador encontrado' : 'Nenhum administrador cadastrado'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredAdmins.map((admin) => (
                            <motion.div
                                key={admin.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20">
                                            {admin.full_name?.charAt(0) || admin.email.charAt(0).toUpperCase()}
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-gray-900 dark:text-white">
                                                    {admin.full_name || 'Sem nome'}
                                                </h3>
                                                {getRoleBadge('super_admin')}
                                            </div>

                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-3 h-3" />
                                                    {admin.email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    Criado {new Date(admin.created_at).toLocaleDateString('pt-BR')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-full">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => {
                                                setFormData({
                                                    email: admin.email,
                                                    full_name: admin.full_name,
                                                    role: 'super_admin',
                                                    password: '' // Don't show password
                                                })
                                                setIsDialogOpen(true)
                                            }}>
                                                Editar
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => alert("Funcionalidade de remover admin")}>
                                                Remover
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Info Card */}
            <Card className="p-6 bg-blue-50 border-blue-100">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <Key className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h4 className="font-bold text-blue-900 mb-1">Sobre Permissões</h4>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>• <strong>Super Admin:</strong> Acesso total ao sistema (você!)</p>
                            <p>• <strong>Suporte:</strong> Gerencia tickets, playbooks e auditoria</p>
                            <p>• <strong>Financeiro:</strong> Gerencia cobranças, pagamentos e relatórios financeiros</p>
                            <p>• <strong>Analytics:</strong> Visualiza métricas e relatórios sem poder modificar</p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    )
}
