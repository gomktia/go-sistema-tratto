"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, Calendar, Edit, Trash2, LayoutGrid, List as ListIcon, Wallet, Gift, AlertTriangle, Send, Activity, MessageSquare, PhoneCall, Sparkles, CheckSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { clients } from "@/mocks/data"
import type { ClientRecord } from "@/types/crm"
import { useTenant } from "@/contexts/tenant-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
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

const mapMockClient = (client: typeof clients[number]): ClientRecord => ({
    id: client.id,
    tenantId: "tenant-1", // Default for mocks
    name: client.name,
    email: client.email,
    phone: client.phone,
    status: client.status as "active" | "inactive" | "churned",
    lastVisit: client.lastVisit,
    totalSpent: client.totalSpent,
    avatar: client.avatar,
    tags: ["VIP", "Recente"],
    notes: "Cliente preferencial",
    preferences: {
        professionalId: "prof-1",
        serviceId: "serv-1",
        days: ["SEG", "QUA"],
        times: ["morning"]
    },
    lgpdConsent: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
})

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
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchTerm, setSearchTerm] = useState("")

    // -------------------------------------------------------------------------
    // STATE & DATA
    // -------------------------------------------------------------------------
    const { currentTenant } = useTenant()
    const { data: tenantCustomers, refetch } = useTenantCustomers(currentTenant.id)
    const [clientsList, setClientsList] = useState<ClientRecord[]>([])

    // Sync local state with fetched data
    useEffect(() => {
        setClientsList(tenantCustomers)
    }, [tenantCustomers])

    const [activeSavedFilter, setActiveSavedFilter] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [importMessage, setImportMessage] = useState("")

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
    // MEMOIZED FILTERS
    // -------------------------------------------------------------------------
    const filteredClients = useMemo(() => {
        return clientsList.filter(client => {
            const matchesSearch =
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.phone.includes(searchTerm)

            let matchesFilter = true
            if (activeSavedFilter) {
                // Lógica simulada de filtros salvos
                if (activeSavedFilter === "Aniversariantes") {
                    // Exemplo: filtrar quem faz aniversário esse mês (mock)
                    matchesFilter = true
                } else if (activeSavedFilter === "Ausentes 30d") {
                    const days = differenceInDays(new Date(), new Date(client.lastVisit))
                    matchesFilter = days > 30
                } else if (activeSavedFilter === "VIPs") {
                    matchesFilter = client.totalSpent > 1000
                }
            }

            return matchesSearch && matchesFilter
        })
    }, [clientsList, searchTerm, activeSavedFilter])


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
        const { error } = await supabase
            .from('customers')
            .delete()
            .in('id', selectedClients)

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

    const handleSelectOne = (checked: boolean, clientId: string) => {
        if (checked) {
            setSelectedClients(prev => [...prev, clientId])
        } else {
            setSelectedClients(prev => prev.filter(id => id !== clientId))
        }
    }

    const handleImportClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return

        const reader = new FileReader()
        reader.onload = async () => {
            const text = reader.result?.toString() ?? ""
            const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)

            // Basic CSV/TXT parsing: Name, Email, Phone
            const imported = lines.map(line => {
                const parts = line.split(/[;,]/) // Split by comma or semicolon
                // Simple heuristic
                const name = parts[0]?.trim()
                const email = parts[1]?.trim()
                const phone = parts[2]?.trim()

                if (!name) return null

                return {
                    tenant_id: currentTenant.id,
                    full_name: name,
                    email: email || null,
                    phone: phone || null,
                    status: 'active',
                    last_visit_at: new Date().toISOString(),
                    total_spent: 0
                }
            }).filter(Boolean)

            if (imported.length === 0) {
                toast.error("Nenhum cliente válido encontrado no arquivo.")
                return
            }

            const supabase = getSupabaseBrowserClient()
            if (!supabase) return

            // Bulk insert
            const { error } = await supabase.from('customers').insert(imported)

            if (error) {
                toast.error("Erro ao salvar clientes importados.")
                console.error(error)
                return
            }

            toast.success(`${imported.length} cliente(s) importado(s) e salvos com sucesso.`)
            refetch()
        }
        reader.onerror = () => toast.error("Não foi possível ler o arquivo selecionado.")
        reader.readAsText(file, "utf-8")
    }

    const handleExport = (format: "csv" | "txt") => {
        if (clientsList.length === 0) return

        let content = ""
        const mimeType = format === "csv" ? "text/csv" : "text/plain"
        const extension = format

        if (format === "csv") {
            content = "Nome,Email,Telefone,Status,Última Visita,Total Gasto\n"
            clientsList.forEach(c => {
                content += `"${c.name}","${c.email}","${c.phone}","${c.status}","${c.lastVisit}","${c.totalSpent}"\n`
            })
        } else {
            clientsList.forEach(c => {
                content += `${c.name} | ${c.email} | ${c.phone}\n`
            })
        }

        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `clientes_export.${extension}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        toast.success("Exportação concluída!")
    }

    // -------------------------------------------------------------------------
    // RENDER
    // -------------------------------------------------------------------------

    // Mock stats
    const automationRecommendations = [
        { id: 1, title: "Reativação de Inativos", description: "Recupere clientes que não vêm há 60 dias.", impact: "Alta", type: "recovery" },
        { id: 2, title: "Lembrete de Retorno", description: "Incentive o retorno após 30 dias.", impact: "Média", type: "retention" },
    ]

    const upcomingEvents = [
        { id: 1, title: "Aniversariantes do Mês", date: "Julho", action: "Enviar cupom", impact: "Fidelização" },
        { id: 2, title: "Dia do Cliente", date: "15 Set", action: "Campanha especial", impact: "Vendas" },
    ]

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
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileImport}
            />

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
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={handleDeleteClient}
                variant="destructive"
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Clientes</h1>
                    <p className="text-muted-foreground mt-1">Gerencie sua base e fidelize seu público.</p>
                </div>
            </div>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Total de Clientes" value={clientsList.length} helper="+12% vs mês anterior" />
                <StatCard label="Novos este mês" value="24" helper="Meta: 30" />
                <StatCard label="Inativos (30d)" value="8" helper="Oportunidade de reativação" />
                <StatCard label="LTV Médio" value="R$ 450" helper="Lifetime Value" />
            </section>

            <section className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome, email ou telefone..."
                            className="pl-9 rounded-2xl bg-white/50 border-transparent hover:bg-white hover:border-black/5 focus:bg-white transition-all dark:bg-zinc-900/50 dark:hover:bg-zinc-900 dark:hover:border-white/5 dark:focus:bg-zinc-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        variant="outline"
                        className="gap-2 rounded-2xl bg-white/50 border-transparent hover:bg-white hover:border-black/5 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 dark:hover:border-white/5"
                        onClick={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
                    >
                        {viewMode === 'grid' ? <ListIcon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                        <span className="hidden sm:inline">{viewMode === 'grid' ? 'Lista' : 'Grade'}</span>
                    </Button>
                    <Button className="rounded-2xl gap-2" onClick={() => setShowNewClient(true)}>
                        <Plus className="w-4 h-4" />
                        Novo Cliente
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2 pb-2">
                    {["Todos", "Aniversariantes", "Ausentes 30d", "VIPs"].map((filter) => (
                        <Badge
                            key={filter}
                            variant={activeSavedFilter === filter ? "default" : "outline"}
                            className="cursor-pointer rounded-full h-8 px-4 hover:bg-primary/5 hover:text-primary transition-colors"
                            onClick={() => setActiveSavedFilter(activeSavedFilter === filter ? null : filter)}
                        >
                            {filter}
                        </Badge>
                    ))}
                </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Saúde do funil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs font-medium">
                                <span>Novos vs Recorrentes</span>
                                <span>65% Recorrente</span>
                            </div>
                            <Progress value={65} className="h-2 rounded-full" />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                <p className="text-xs uppercase font-bold opacity-70">Taxa Retenção</p>
                                <p className="text-xl font-black mt-1">92%</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                                <p className="text-xs uppercase font-bold opacity-70">Churn Mensal</p>
                                <p className="text-xl font-black mt-1">1.2%</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Ao vivo agora</CardTitle>
                        <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Loja movimentada
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { client: "Mariana Costa", action: "Check-in realizado", time: "2 min atrás", type: "checkin", detail: "Corte + Hidratação", status: "Em andamento" },
                            { client: "Carlos Souza", action: "Agendou online", time: "15 min atrás", type: "booking", detail: "Barba e Cabelo", status: "Confirmado" },
                            { client: "Fernanda Lima", action: "Avaliou serviço", time: "45 min atrás", type: "review", detail: "5 estrelas - Adorou!", status: "Concluído" },
                        ].map((signal, i) => {
                            const toneClass =
                                signal.type === 'checkin' ? 'bg-blue-500/10 text-blue-600' :
                                    signal.type === 'booking' ? 'bg-purple-500/10 text-purple-600' :
                                        'bg-amber-500/10 text-amber-600'

                            const Icon =
                                signal.type === 'checkin' ? Calendar :
                                    signal.type === 'booking' ? PhoneCall : Sparkles

                            return (
                                <div key={i} className="flex items-center gap-3 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-colors">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${toneClass}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{signal.client}</p>
                                        <p className="text-xs text-muted-foreground">{signal.detail}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{signal.time}</p>
                                        <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-widest mt-1">
                                            {signal.status}
                                        </Badge>
                                    </div>
                                </div>
                            )
                        })}
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Playbooks automáticos</CardTitle>
                        <p className="text-sm text-muted-foreground">Ative fluxos para cada cenário.</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {automationRecommendations.map(item => (
                            <div key={item.id} className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                                        <p className="text-xs text-muted-foreground">{item.description}</p>
                                    </div>
                                    <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest">
                                        {item.impact}
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="sm" className="h-9 rounded-full gap-2 text-primary hover:text-primary">
                                    <Sparkles className="w-4 h-4" />
                                    Ativar fluxo
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>

            <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/70 dark:bg-zinc-900/70 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Ações inteligentes</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">Ative campanhas e tags sem sair da base</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" className="rounded-2xl" onClick={() => alert("Campanha agendada!")}>
                        Enviar campanha
                    </Button>
                    <Button variant="outline" className="rounded-2xl" onClick={() => alert("Tag aplicada!")}>
                        Adicionar etiqueta
                    </Button>
                    <Button variant="default" className="rounded-2xl" onClick={() => alert("Exportação iniciada!")}>
                        Exportar Segmento
                    </Button>
                </div>
            </div>

            <Card className="rounded-[2rem] border-none shadow-sm bg-white/80 dark:bg-zinc-900/70">
                <CardHeader>
                    <CardTitle>Importação & Exportação</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Importe novos clientes via arquivos `.csv` ou `.txt` e exporte sua base atual com um clique.
                    </p>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-3">
                        <Button className="rounded-2xl" onClick={handleImportClick}>
                            Importar CSV/TXT
                        </Button>
                        <Button variant="outline" className="rounded-2xl" onClick={() => handleExport("csv")}>
                            Exportar CSV
                        </Button>
                        <Button variant="outline" className="rounded-2xl" onClick={() => handleExport("txt")}>
                            Exportar TXT
                        </Button>
                    </div>
                    {importMessage && (
                        <p className="text-xs font-semibold text-primary">{importMessage}</p>
                    )}
                    <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
                        Formato sugerido: Nome,Email,Telefone
                    </p>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Eventos importantes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {upcomingEvents.map(event => (
                            <div key={event.id} className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-3">
                                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary font-black flex flex-col items-center justify-center">
                                    <span className="text-[10px] uppercase tracking-[0.3em]">Data</span>
                                    <span className="text-sm">{event.date}</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</p>
                                    <p className="text-xs text-muted-foreground">{event.action}</p>
                                </div>
                                <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest">
                                    {event.impact}
                                </Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                    <CardHeader>
                        <CardTitle>Campanhas recomendadas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Reativação risco</p>
                                <p className="text-xs text-muted-foreground">30 clientes aguardando incentivo</p>
                            </div>
                            <Button variant="outline" className="rounded-full text-xs gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Executar
                            </Button>
                        </div>
                        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Surpresa VIP</p>
                                <p className="text-xs text-muted-foreground">Aniversariantes da semana</p>
                            </div>
                            <Button variant="outline" className="rounded-full text-xs gap-1">
                                <Gift className="w-3 h-3" />
                                Programar
                            </Button>
                        </div>
                        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Campanha recorrência</p>
                                <p className="text-xs text-muted-foreground">Clientes ativos há 15 dias</p>
                            </div>
                            <Button variant="outline" className="rounded-full text-xs gap-1">
                                <Send className="w-3 h-3" />
                                Disparar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content View */}
            {viewMode === 'list' ? (
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
            )}
            <div className="md:hidden fixed bottom-4 left-4 right-4 flex items-center gap-2 bg-white/90 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-3">
                <Button className="flex-1 rounded-xl" onClick={() => setShowNewClient(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => alert("Campanha mobile!")}>
                    <Send className="w-4 h-4 mr-2" />
                    Campanha
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
