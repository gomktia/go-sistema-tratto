"use client"

import { useState, useEffect } from "react"
import { companies as initialCompanies, plans, type Company } from "@/mocks/companies"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FormDialog } from "@/components/ui/form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DetailDrawer } from "@/components/ui/detail-drawer"
import { Search, MoreVertical, CheckCircle, XCircle, Pause, Play, Edit } from "lucide-react"
import { getInitials } from "@/lib/utils"

const activationScore = (company: Company) => {
    let score = 0
    if (company.customDomain) score += 25
    if (company.currentEmployees > 0) score += 25
    if (company.currentAppointmentsThisMonth > 0) score += 25
    if (company.monthlyRevenue > 0) score += 25
    return score
}

export default function EmpresasPage() {
    const [companies, setCompanies] = useState<Company[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [planFilter, setPlanFilter] = useState("all")

    // Modals state
    const [showNewCompany, setShowNewCompany] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
    const [confirmAction, setConfirmAction] = useState<{ title: string, description: string, action: () => void } | null>(null)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        fullName: "",
        email: "",
        phone: "",
        address: "",
        cpfCnpj: "",
        planId: "starter",
    })

    useEffect(() => {
        fetchCompanies()
    }, [])

    const fetchCompanies = async () => {
        console.log('[FRONTEND] Starting fetchCompanies...')
        setIsLoading(true)
        try {
            console.log('[FRONTEND] Fetching from /api/admin/companies')
            const response = await fetch('/api/admin/companies')
            console.log('[FRONTEND] Response status:', response.status, response.ok)

            if (response.ok) {
                const data = await response.json()
                console.log('[FRONTEND] Received data:', data)
                console.log('[FRONTEND] Data length:', data?.length)
                setCompanies(data)
                console.log('[FRONTEND] Companies state updated')
            } else {
                console.error('[FRONTEND] Response not OK:', response.status)
            }
        } catch (error) {
            console.error('[FRONTEND] Failed to fetch companies', error)
        } finally {
            setIsLoading(false)
            console.log('[FRONTEND] fetchCompanies completed')
        }
    }



    const filteredCompanies = companies
        .filter(company => {
            const name = company.fullName || (company as any).full_name || ''
            const email = company.email || (company as any).settings?.email || ''
            const searchLower = searchTerm.toLowerCase()
            return name.toLowerCase().includes(searchLower) || email.toLowerCase().includes(searchLower)
        })
        .filter(company => statusFilter === "all" || company.status === statusFilter)
        .filter(company => planFilter === "all" || company.planId === planFilter || (company as any).plan_id === planFilter)
        .sort((a, b) => activationScore(b) - activationScore(a))

    console.log('[FRONTEND] Filtered companies count:', filteredCompanies.length)


    const getStatusBadge = (status: string) => {
        const variants = {
            active: { label: 'Ativa', className: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' },
            trial: { label: 'Trial', className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400' },
            suspended: { label: 'Suspensa', className: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' },
            inactive: { label: 'Inativa', className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400' },
            pending: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' }
        }
        const variant = variants[status as keyof typeof variants] || variants.inactive
        return <Badge className={variant.className}>{variant.label}</Badge>
    }

    const handleCreateCompany = async () => {
        try {
            const response = await fetch('/api/admin/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                await fetchCompanies() // Reload list
                setShowNewCompany(false)
                setFormData({ name: "", fullName: "", email: "", phone: "", address: "", cpfCnpj: "", planId: "starter" })
            } else {
                alert('Erro ao criar empresa')
            }
        } catch (error) {
            console.error('Error creating company', error)
            alert('Erro ao criar empresa')
        }
    }

    const handleSuspend = (company: Company) => {
        setConfirmAction({
            title: "Suspender Empresa",
            description: `Tem certeza que deseja suspender "${company.fullName}"? A empresa não poderá acessar o sistema até ser reativada.`,
            action: async () => {
                try {
                    const response = await fetch('/api/admin/companies', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: company.id, status: 'suspended' })
                    })
                    if (response.ok) {
                        setCompanies(companies.map(c =>
                            c.id === company.id ? { ...c, status: 'suspended' as const } : c
                        ))
                    } else {
                        alert('Erro ao suspender empresa')
                    }
                } catch (error) {
                    console.error('Error suspending company', error)
                }
                setShowConfirm(false)
            }
        })
        setShowConfirm(true)
    }

    const handleReactivate = async (company: Company) => {
        try {
            const response = await fetch('/api/admin/companies', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: company.id, status: 'active' })
            })
            if (response.ok) {
                setCompanies(companies.map(c =>
                    c.id === company.id ? { ...c, status: 'active' as const } : c
                ))
            } else {
                alert('Erro ao reativar empresa')
            }
        } catch (error) {
            console.error('Error reactivating company', error)
        }
    }

    const handleDeactivate = (company: Company) => {
        setConfirmAction({
            title: "Desativar Empresa",
            description: `Tem certeza que deseja desativar "${company.fullName}"? Esta ação pode ser revertida posteriormente.`,
            action: async () => {
                try {
                    const response = await fetch('/api/admin/companies', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: company.id, status: 'inactive' })
                    })
                    if (response.ok) {
                        setCompanies(companies.map(c =>
                            c.id === company.id ? { ...c, status: 'inactive' as const } : c
                        ))
                    } else {
                        alert('Erro ao desativar empresa')
                    }
                } catch (error) {
                    console.error('Error deactivating company', error)
                }
                setShowConfirm(false)
            }
        })
        setShowConfirm(true)
    }

    const handleViewDetails = (company: Company) => {
        setSelectedCompany(company)
        setShowDetails(true)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Empresas</h2>
                    <p className="text-muted-foreground mt-1">
                        Gerencie todas as empresas cadastradas na plataforma
                    </p>
                </div>
                <Button onClick={() => setShowNewCompany(true)}>
                    Nova Empresa
                </Button>
            </div>

            {/* Search & Filters */}
            <Card className="rounded-2xl border-none shadow-sm bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md">
                <CardHeader>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por nome ou email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full lg:w-auto">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full lg:w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os status</SelectItem>
                                    <SelectItem value="active">Ativas</SelectItem>
                                    <SelectItem value="trial">Trial</SelectItem>
                                    <SelectItem value="suspended">Suspensas</SelectItem>
                                    <SelectItem value="pending">Pendentes</SelectItem>
                                    <SelectItem value="inactive">Inativas</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={planFilter} onValueChange={setPlanFilter}>
                                <SelectTrigger className="w-full lg:w-[180px]">
                                    <SelectValue placeholder="Plano" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os planos</SelectItem>
                                    {plans.map(plan => (
                                        <SelectItem key={plan.id} value={plan.id}>
                                            {plan.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Empresa</TableHead>
                                <TableHead>Plano</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Funcionários</TableHead>
                                <TableHead>Clientes</TableHead>
                                <TableHead>Ativação</TableHead>
                                <TableHead>Receita Mensal</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCompanies.map((company) => {
                                const plan = plans.find(p => p.id === company.planId)
                                return (
                                    <TableRow key={company.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                                                    {company.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium">{company.fullName}</p>
                                                    <p className="text-sm text-muted-foreground">{company.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{plan?.name}</p>
                                                <p className="text-sm text-muted-foreground">R$ {plan?.price}/mês</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(company.status)}</TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {company.currentEmployees}
                                                {company.maxEmployees > 0 && ` / ${company.maxEmployees}`}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-semibold">
                                                {(company as any).totalCustomers || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <Progress value={activationScore(company)} />
                                                <p className="text-[11px] text-muted-foreground">
                                                    {activationScore(company)}%
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-medium">
                                                R$ {company.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleViewDetails(company)}>
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Ver Detalhes
                                                    </DropdownMenuItem>
                                                    {company.status === 'active' && (
                                                        <DropdownMenuItem
                                                            className="text-orange-600"
                                                            onClick={() => handleSuspend(company)}
                                                        >
                                                            <Pause className="w-4 h-4 mr-2" />
                                                            Suspender
                                                        </DropdownMenuItem>
                                                    )}
                                                    {company.status === 'suspended' && (
                                                        <DropdownMenuItem
                                                            className="text-green-600"
                                                            onClick={() => handleReactivate(company)}
                                                        >
                                                            <Play className="w-4 h-4 mr-2" />
                                                            Reativar
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => handleDeactivate(company)}
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Desativar
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Modal Nova Empresa */}
            <FormDialog
                open={showNewCompany}
                onOpenChange={setShowNewCompany}
                title="Nova Empresa"
                description="Cadastre uma nova empresa na plataforma"
                onSubmit={handleCreateCompany}
                submitLabel="Criar Empresa"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Curto</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Beleza Pura"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input
                                id="fullName"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="Salão Beleza Pura"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contato@belezapura.com"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="(11) 99999-9999"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Rua, número, bairro, cidade"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cpfCnpj">CPF/CNPJ do Responsável</Label>
                        <Input
                            id="cpfCnpj"
                            value={formData.cpfCnpj}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '')
                                let formatted = value
                                if (value.length <= 11) {
                                    // CPF: 000.000.000-00
                                    formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                                } else if (value.length <= 14) {
                                    // CNPJ: 00.000.000/0000-00
                                    formatted = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                                }
                                setFormData({ ...formData, cpfCnpj: formatted })
                            }}
                            placeholder="000.000.000-00 ou 00.000.000/0000-00"
                            maxLength={18}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="planId">Plano</Label>
                            <Select value={formData.planId} onValueChange={(value) => setFormData({ ...formData, planId: value })}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {plans.map(plan => (
                                        <SelectItem key={plan.id} value={plan.id}>
                                            {plan.name} - R$ {plan.price}/mês
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </FormDialog>

            {/* Drawer Detalhes */}
            {selectedCompany && (
                <DetailDrawer
                    open={showDetails}
                    onClose={() => setShowDetails(false)}
                    title={selectedCompany.fullName}
                    description={selectedCompany.email}
                >
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                                {selectedCompany.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">{selectedCompany.fullName}</h3>
                                <p className="text-sm text-muted-foreground">{selectedCompany.customDomain}</p>
                                {getStatusBadge(selectedCompany.status)}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Informações de Contato</h4>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Email:</strong> {selectedCompany.email}</p>
                                    <p><strong>Telefone:</strong> {selectedCompany.phone}</p>
                                    <p><strong>Endereço:</strong> {selectedCompany.address}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Plano e Assinatura</h4>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Plano:</strong> {plans.find(p => p.id === selectedCompany.planId)?.name}</p>
                                    <p><strong>Início:</strong> {new Date(selectedCompany.subscriptionStartDate).toLocaleDateString('pt-BR')}</p>
                                    <p><strong>Vencimento:</strong> {new Date(selectedCompany.subscriptionEndDate).toLocaleDateString('pt-BR')}</p>
                                    {selectedCompany.trialEndsAt && (
                                        <p><strong>Trial até:</strong> {new Date(selectedCompany.trialEndsAt).toLocaleDateString('pt-BR')}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Uso</h4>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Funcionários:</strong> {selectedCompany.currentEmployees} / {selectedCompany.maxEmployees > 0 ? selectedCompany.maxEmployees : '∞'}</p>
                                    <p><strong>Agendamentos (mês):</strong> {selectedCompany.currentAppointmentsThisMonth} / {selectedCompany.maxAppointmentsPerMonth > 0 ? selectedCompany.maxAppointmentsPerMonth : '∞'}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-2">Financeiro</h4>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Receita Mensal:</strong> R$ {selectedCompany.monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                    <p><strong>Receita Total:</strong> R$ {selectedCompany.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full" variant="outline">
                            <Edit className="w-4 h-4 mr-2" />
                            Editar Empresa
                        </Button>
                    </div>
                </DetailDrawer>
            )}

            {/* Confirm Dialog */}
            {confirmAction && (
                <ConfirmDialog
                    open={showConfirm}
                    onOpenChange={setShowConfirm}
                    title={confirmAction.title}
                    description={confirmAction.description}
                    onConfirm={confirmAction.action}
                    variant="destructive"
                    confirmLabel="Confirmar"
                />
            )}
        </div>
    )
}
