"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, Calendar, Edit, Trash2, LayoutGrid, List as ListIcon, Wallet, AlertCircle, Users, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ClientRecord } from "@/types/crm"
import { useTenant } from "@/contexts/tenant-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { differenceInDays } from "date-fns"
import { useTenantCustomers } from "@/hooks/useTenantRecords"
import { Checkbox } from "@/components/ui/checkbox"
import { ImportExportButton } from "@/components/import-export/ImportExportButton"
import { useCustomerFilters } from "@/hooks/useCustomerFilters"
import { CustomerFilterPanel } from "@/components/customers/CustomerFilterPanel"
import { CustomerPagination } from "@/components/customers/CustomerPagination"
import type { CustomerFilters } from "@/types/customer-filters"

// Mapeamento de cor por status
const getStatusColor = (status: string) => {
    switch (status) {
        case "active":
            return "bg-emerald-500"
        case "inactive":
            return "bg-slate-300"
        case "churned":
            return "bg-rose-500"
        default:
            return "bg-slate-300"
    }
}

// Utilitário para gerar ID único (simulação)
const generateClientId = () => Math.random().toString(36).substr(2, 9)

export default function ClientesPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list') // Mudado para lista por padrão

    // -------------------------------------------------------------------------
    // STATE & DATA
    // -------------------------------------------------------------------------
    const { currentTenant } = useTenant()

    // Estado de filtros e paginação
    const [filters, setFilters] = useState<CustomerFilters>({
        search: "",
        gender: "all",
        ageMin: null,
        ageMax: null,
        hasService: "all",
        lastVisitMode: "all",
        lastVisitDays: null,
        lastVisitFrom: null,
        lastVisitTo: null,
        noFutureAppointment: false
    })
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 50

    // Hook de filtros com paginação
    const {
        customers: filteredClients,
        loading: isLoading,
        error: loadError,
        totalCount,
        refetch
    } = useCustomerFilters(currentTenant.id, filters, currentPage, pageSize)

    const [selectedClients, setSelectedClients] = useState<string[]>([])

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: ""
    })

    const [showNewClient, setShowNewClient] = useState(false)
    const [showEditClient, setShowEditClient] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null)

    // -------------------------------------------------------------------------
    // STATS PARA OS CARDS
    // -------------------------------------------------------------------------
    const stats = useMemo(() => {
        return {
            total: totalCount,
            active: filteredClients.filter(c => c.status === 'active').length,
            inactive: filteredClients.filter(c => c.status !== 'active').length
        }
    }, [filteredClients, totalCount])

    // Contador de filtros ativos
    const activeFiltersCount = useMemo(() => {
        let count = 0
        if (filters.search) count++
        if (filters.gender !== "all") count++
        if (filters.ageMin !== null || filters.ageMax !== null) count++
        if (filters.hasService !== "all") count++
        if (filters.lastVisitMode !== "all") count++
        if (filters.noFutureAppointment) count++
        return count
    }, [filters])


    // -------------------------------------------------------------------------
    // ACTIONS
    // -------------------------------------------------------------------------
    const resetForm = () => {
        setFormData({ name: "", email: "", phone: "", cpf: "" })
        setSelectedClient(null)
    }

    const handleCreateClient = async () => {
        const supabase = getSupabaseBrowserClient()

        if (!supabase) {
            toast.error("Erro de configuração do Supabase")
            return
        }

        const newClient = {
            tenant_id: currentTenant.id,
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            document: formData.cpf,
            status: 'active',
            last_visit_at: new Date().toISOString(),
            total_spent: 0
        }

        const { error } = await supabase.from('customers').insert(newClient)

        if (error) {
            toast.error("Erro ao criar cliente")
            console.error(error)
            return
        }

        toast.success("Cliente criado com sucesso")
        refetch()
        setShowNewClient(false)
        resetForm()
    }

    const openEditDialog = (client: ClientRecord) => {
        setSelectedClient(client)
        setFormData({
            name: client.name,
            email: client.email,
            phone: client.phone,
            cpf: "" // Missing in type, assuming empty or add to type
        })
        setShowEditClient(true)
    }

    const handleEditClient = async () => {
        if (!selectedClient) return

        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        const { error } = await supabase
            .from('customers')
            .update({
                full_name: formData.name,
                email: formData.email,
                phone: formData.phone,
                document: formData.cpf
            })
            .eq('id', selectedClient.id)
            .eq('tenant_id', currentTenant.id)

        if (error) {
            toast.error("Erro ao atualizar cliente")
            console.error(error)
            return
        }

        toast.success("Cliente atualizado com sucesso")
        refetch()
        setShowEditClient(false)
        resetForm()
    }

    const openDeleteDialog = (client: ClientRecord) => {
        setSelectedClient(client)
        setShowConfirm(true)
    }

    const handleDeleteClient = async () => {
        if (!selectedClient) return

        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', selectedClient.id)
            .eq('tenant_id', currentTenant.id)

        if (error) {
            toast.error("Erro ao excluir cliente")
            console.error(error)
            return
        }

        toast.success("Cliente excluído com sucesso")
        refetch()
        setShowConfirm(false)
        setSelectedClient(null)
    }

    const handleBulkDelete = async () => {
        if (selectedClients.length === 0) return

        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        const { error } = await supabase
            .from('customers')
            .delete()
            .in('id', selectedClients)
            .eq('tenant_id', currentTenant.id)

        if (error) {
            toast.error("Erro ao excluir clientes selecionados")
            console.error(error)
            return
        }

        toast.success(`${selectedClients.length} clientes excluídos com sucesso`)
        refetch()
        setSelectedClients([])
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedClients(filteredClients.map(c => c.id))
        } else {
            setSelectedClients([])
        }
    }

    // Handler para aplicar filtros
    const handleFiltersChange = (newFilters: CustomerFilters) => {
        setFilters(newFilters)
        setCurrentPage(1) // Reset para primeira página ao filtrar
        setSelectedClients([]) // Limpar seleção ao filtrar
    }

    // Handler para limpar filtros
    const handleClearFilters = () => {
        setFilters({
            search: "",
            gender: "all",
            ageMin: null,
            ageMax: null,
            hasService: "all",
            lastVisitMode: "all",
            lastVisitDays: null,
            lastVisitFrom: null,
            lastVisitTo: null,
            noFutureAppointment: false
        })
        setCurrentPage(1)
        setSelectedClients([])
    }

    // Handler para mudança de página
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        setSelectedClients([]) // Limpar seleção ao mudar de página
    }

    const handleSelectOne = (checked: boolean, clientId: string) => {
        if (checked) {
            setSelectedClients(prev => [...prev, clientId])
        } else {
            setSelectedClients(prev => prev.filter(id => id !== clientId))
        }
    }

    // Importação gerenciada por ImportExportButton

    // Exportação gerenciada por ImportExportButton

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------


    return (
        <div className="space-y-8 relative">
            {selectedClients.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-full p-2 px-6 flex items-center gap-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
                    <div className="flex items-center gap-3 pr-6 border-r border-slate-200 dark:border-zinc-800">
                        <Badge variant="default" className="rounded-full h-6 px-2">{selectedClients.length}</Badge>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">selecionados</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full px-4"
                            onClick={handleBulkDelete}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir Tudo
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedClients([])}
                            className="rounded-full px-4"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={showNewClient} onOpenChange={setShowNewClient}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Cliente</DialogTitle>
                        <DialogDescription>Preencha os dados abaixo.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome Completo</Label>
                            <Input
                                placeholder="Ex: Ana Silva"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                placeholder="email@exemplo.com"
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input
                                placeholder="(00) 00000-0000"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CPF</Label>
                            <Input
                                placeholder="000.000.000-00"
                                value={formData.cpf}
                                onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewClient(false)}>Cancelar</Button>
                        <Button onClick={handleCreateClient}>Salvar Cliente</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showEditClient} onOpenChange={setShowEditClient}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Editar Cliente</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Telefone</Label>
                            <Input
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditClient(false)}>Cancelar</Button>
                        <Button onClick={handleEditClient}>Salvar Alterações</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title="Excluir cliente?"
                description={`Tem certeza que deseja remover ${selectedClient?.name}? Essa ação não pode ser desfeita.`}
                confirmLabel="Excluir"
                cancelLabel="Cancelar"
                onConfirm={handleDeleteClient}
                variant="destructive"
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Clientes</h1>
                    <p className="text-muted-foreground mt-1">Gerencie sua base e fidelize seu público.</p>
                </div>
            </div>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <StatCard label="Total de Clientes" value={stats.total} helper="Base atual" />
                <StatCard label="Ativos" value={stats.active} helper="Clientes ativos" />
                <StatCard label="Inativos" value={stats.inactive} helper="Requerem atenção" />
            </section>

            {/* Painel de Filtros */}
            <CustomerFilterPanel
                tenantId={currentTenant.id}
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onApply={refetch}
            />

            {/* Barra de Ações */}
            <section className="flex flex-col sm:flex-row gap-4">
                <Button
                    variant="outline"
                    className="gap-2 rounded-2xl bg-white/50 border-transparent hover:bg-white hover:border-black/5 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 dark:hover:border-white/5"
                    onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                >
                    {viewMode === 'grid' ? <ListIcon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                    <span className="hidden sm:inline">{viewMode === 'grid' ? 'Lista' : 'Grade'}</span>
                </Button>
                <div className="flex-1" />
                <ImportExportButton
                    tenantId={currentTenant.id}
                    type="clientes"
                    onImportComplete={refetch}
                />
                <Button className="rounded-2xl gap-2" onClick={() => setShowNewClient(true)}>
                    <Plus className="w-4 h-4" />
                    Novo Cliente
                </Button>
            </section>



            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm font-medium text-muted-foreground">Carregando clientes...</p>
                </div>
            )}

            {/* Error State */}
            {!isLoading && loadError && (
                <Card className="rounded-2xl border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30">
                    <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold text-red-800 dark:text-red-200">Não foi possível carregar clientes</h3>
                            <p className="text-sm text-red-600 dark:text-red-400 max-w-md">{loadError}</p>
                        </div>
                        <Button variant="outline" onClick={() => refetch()} className="rounded-xl border-red-300 text-red-700 hover:bg-red-100">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Tentar novamente
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {!isLoading && !loadError && filteredClients.length === 0 && totalCount === 0 && (
                <Card className="rounded-2xl border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center">
                            <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Nenhum cliente cadastrado</h3>
                            <p className="text-sm text-muted-foreground max-w-md">Comece adicionando seu primeiro cliente ou importe uma lista.</p>
                        </div>
                        <Button onClick={() => setShowNewClient(true)} className="rounded-xl">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar Cliente
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Content View - Only show when we have data */}
            {!isLoading && !loadError && filteredClients.length > 0 && (viewMode === 'list' ? (
                <>
                    <div className="hidden md:block rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm overflow-hidden">
                        <Table>
                            <TableHeader className="bg-black/5 dark:bg-white/5">
                                <TableRow className="hover:bg-transparent border-black/5 dark:border-white/5">
                                    <TableHead className="w-[50px]">
                                        <Checkbox
                                            checked={filteredClients.length > 0 && selectedClients.length === filteredClients.length}
                                            onCheckedChange={(checked) => handleSelectAll(!!checked)}
                                        />
                                    </TableHead>
                                    <TableHead className="w-[300px]">Cliente</TableHead>
                                    <TableHead>Contato</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Última Visita</TableHead>
                                    <TableHead className="text-right">Total Gasto</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClients.map((client) => (
                                    <TableRow key={client.id} className="border-black/5 dark:border-white/5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedClients.includes(client.id)}
                                                onCheckedChange={(checked) => handleSelectOne(!!checked, client.id)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-sm">
                                                    <AvatarImage src={client.avatar} alt={client.name} />
                                                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-foreground">{client.name}</div>
                                                    <div className="text-xs text-muted-foreground">ID: #{client.id}</div>
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {getClientTags(client).map(tag => (
                                                            <Badge key={tag} variant="secondary" className="text-[10px] rounded-full">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Mail className="w-3 h-3" />
                                                    {client.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Phone className="w-3 h-3" />
                                                    {client.phone}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${client.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                    client.status === 'inactive' ? 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400' :
                                                        'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                                                {client.status === 'active' ? 'Ativo' :
                                                    client.status === 'inactive' ? 'Inativo' : 'Churn'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(client.lastVisit).toLocaleDateString()}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            R$ {client.totalSpent.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuItem onClick={() => openEditDialog(client)}>
                                                        <Edit className="w-4 h-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600 focus:text-red-600"
                                                        onClick={() => openDeleteDialog(client)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="grid md:hidden grid-cols-1 gap-4">
                        {filteredClients.map(client => (
                            <ClientCard
                                key={client.id}
                                client={client}
                                onEdit={() => openEditDialog(client)}
                                onDelete={() => openDeleteDialog(client)}
                            />
                        ))}
                    </div>
                </>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClients.map((client) => (
                        <ClientCard
                            key={client.id}
                            client={client}
                            onEdit={() => openEditDialog(client)}
                            onDelete={() => openDeleteDialog(client)}
                        />
                    ))}
                </div>
            ))}

            {/* Paginação */}
            {!isLoading && !loadError && filteredClients.length > 0 && (
                <CustomerPagination
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                />
            )}

            <div className="md:hidden fixed bottom-4 left-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-3">
                <Button className="flex-1 rounded-xl" onClick={() => setShowNewClient(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl border">
                    <Filter className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

interface ClientCardProps {
    client: ClientRecord
    onEdit: () => void
    onDelete: () => void
}

function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
    const tags = getClientTags(client)
    return (
        <div className="group relative bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 shadow-sm hover:shadow-xl hover:bg-white dark:hover:bg-zinc-900 transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
                <Avatar className="h-14 w-14 border-4 border-white dark:border-zinc-800 shadow-md">
                    <AvatarImage src={client.avatar} alt={client.name} />
                    <AvatarFallback className="bg-primary/5 text-primary font-black text-xl">{client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex gap-2">
                    <Button onClick={onEdit} variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-primary">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={onDelete} variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-2 mb-6">
                <h4 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase">{client.name}</h4>
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${client.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest">
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-zinc-800 mb-6">
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Última Visita</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                        {new Date(client.lastVisit).toLocaleDateString()}
                    </p>
                </div>
                <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Gasto</p>
                    <p className="text-xs font-black text-emerald-500">
                        R$ {client.totalSpent.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Mail className="w-3.5 h-3.5" />
                    {client.email}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                    <Phone className="w-3.5 h-3.5" />
                    {client.phone}
                </div>
            </div>

            <div className="mt-6 pt-4 flex items-center justify-between border-t border-slate-50 dark:border-zinc-800/50">
                <div className="flex items-center gap-1.5 font-bold text-[10px] text-primary bg-primary/5 px-2 py-1 rounded-lg">
                    <Wallet className="w-3 h-3" /> Fidelidade Level 1
                </div>
                <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary">
                    Histórico
                </Button>
            </div>
        </div>
    )
}

function getClientTags(client: ClientRecord) {
    const tags: string[] = []
    const days = differenceInDays(new Date(), new Date(client.lastVisit))
    if (client.totalSpent >= 1000) tags.push("VIP")
    if (days <= 30) tags.push("Recente")
    if (days > 60) tags.push("Reativar")
    if (client.status === "churned") tags.push("Churn")
    return tags
}

function StatCard({ label, value, helper }: { label: string, value: string | number, helper: string }) {
    return (
        <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{value}</p>
            <p className="text-xs text-muted-foreground">{helper}</p>
        </div>
    )
}

function SegmentCard({ label, description, count, active, onClick }: { label: string, description: string, count: number, active: boolean, onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "rounded-2xl border border-black/5 dark:border-white/5 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-4 text-left transition-all",
                active ? "shadow-lg ring-2 ring-primary/30" : "hover:shadow-md"
            )}
        >
            <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Badge variant={active ? "default" : "secondary"} className="rounded-full">
                    {count}
                </Badge>
            </div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-primary/60">Segmento</div>
        </button>
    )
}

