"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Mail, Phone, Calendar, Edit, Trash2, LayoutGrid, List as ListIcon, Wallet, Gift, AlertTriangle, Send, Activity, MessageSquare, PhoneCall, Sparkles } from "lucide-react"
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { FormDialog } from "@/components/ui/form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { differenceInDays } from "date-fns"
import { useTenantCustomers } from "@/hooks/useTenantRecords"

const mapMockClient = (client: typeof clients[number]): ClientRecord => ({
    id: client.id,
    tenantId: client.tenantId,
    name: client.name,
    email: client.email,
    phone: client.phone,
    lastVisit: client.lastVisit,
    totalSpent: client.totalSpent,
    status: client.status === "inactive" || client.status === "churned" ? client.status : "active",
    avatar: client.avatar ?? "",
})

interface Segment {
    id: string
    label: string
    description: string
    filter: (client: ClientRecord) => boolean
}

const segments: Segment[] = [
    {
        id: "vip",
        label: "VIPs",
        description: "Ticket médio acima de R$ 1.000",
        filter: (client) => client.totalSpent >= 1000
    },
    {
        id: "recent",
        label: "Recentes",
        description: "Visitaram nos últimos 30 dias",
        filter: (client) => differenceInDays(new Date(), new Date(client.lastVisit)) <= 30
    },
    {
        id: "risk",
        label: "Em risco",
        description: "60+ dias sem visitar",
        filter: (client) => differenceInDays(new Date(), new Date(client.lastVisit)) > 60
    }
]

const statusOptions = [
    { id: "active", label: "Ativos" },
    { id: "inactive", label: "Inativos" },
    { id: "churned", label: "Churn" },
]

const spendingFilters = [
    { id: "all", label: "Todos os tickets", range: null },
    { id: "low", label: "Até R$ 200", range: [0, 200] },
    { id: "medium", label: "R$ 200 - R$ 800", range: [200, 800] },
    { id: "high", label: "Acima de R$ 800", range: [800, Infinity] },
]

const availableTags = [
    { id: "VIP", label: "VIP" },
    { id: "Recente", label: "Recentes" },
    { id: "Reativar", label: "Reativar" },
    { id: "Churn", label: "Churn" },
]

const savedFilters = [
    {
        id: "vip_reengage",
        title: "VIP • Recompra",
        description: "Ativos, ticket alto, últimos 30 dias",
        status: ["active"],
        spending: "high",
        tags: ["VIP"],
        segment: "recent"
    },
    {
        id: "risk_campaign",
        title: "Em risco",
        description: "60+ dias sem visitar",
        status: [],
        spending: "all",
        tags: ["Reativar"],
        segment: "risk"
    },
    {
        id: "churn_alert",
        title: "Churn alert",
        description: "Clientes perdidos para reativar",
        status: ["churned"],
        spending: "all",
        tags: ["Churn"]
    }
]

const upcomingEvents = [
    { id: "birthday", title: "Aniversário • Juliana", date: "03 Jan", action: "Enviar mimo VIP", impact: "+85% retenção" },
    { id: "loyalty", title: "Pontos expiram • Lucas", date: "Hoje", action: "Ativar campanha fidelidade", impact: "Ticket +R$120" },
    { id: "risk", title: "90 dias sem visita • Carla", date: "Amanhã", action: "Oferecer combo glow", impact: "Recuperação 42%" },
]

const lifecycleStages = [
    { id: "acquisition", label: "Aquisição digital", description: "Novos cadastros no mês", value: 48, delta: "+12%" },
    { id: "activation", label: "Conversão para 1º serviço", description: "Clientes que efetivaram atendimento", value: 64, delta: "+5%" },
    { id: "retention", label: "Base fiel", description: "Clientes que retornam em 45 dias", value: 58, delta: "+3%" },
]

const interactionSignals = [
    { id: "whatsapp-confirm", client: "Bruna Andrade", detail: "Confirmou horário via WhatsApp", time: "09:12", status: "Confirmado", channel: "WhatsApp", tone: "emerald", icon: MessageSquare },
    { id: "pix-reminder", client: "Leo Costa", detail: "Abriu lembrete Pix, aguardando confirmação", time: "10:05", status: "Aguardando", channel: "SMS", tone: "amber", icon: Activity },
    { id: "call-upsell", client: "Paula Freitas", detail: "Aceitou upgrade tratamento capilar", time: "11:40", status: "Upgrade", channel: "Ligação", tone: "blue", icon: PhoneCall },
]

const automationRecommendations = [
    { id: "post-service", title: "Follow-up pós-serviço", description: "Envia pesquisa + oferta 2h após atendimento.", impact: "+18% recompra" },
    { id: "winback", title: "Winback 60 dias", description: "Fluxo automático com cupom limitado.", impact: "Recuperação 32%" },
    { id: "vip-survey", title: "Pesquisa VIP trimestral", description: "Capta feedback de clientes de alto ticket.", impact: "+25 NPS" },
]

const toneClassMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    blue: "bg-blue-500/10 text-blue-600",
}

export default function ClientsPage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedSegment, setSelectedSegment] = useState("all")
    const [statusFilter, setStatusFilter] = useState<string[]>([])
    const [spendingFilter, setSpendingFilter] = useState("all")
    const [tagFilter, setTagFilter] = useState<string[]>([])
    const [showNewClient, setShowNewClient] = useState(false)
    const [showEditClient, setShowEditClient] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedClient, setSelectedClient] = useState<ClientRecord | null>(null)
    const [clientsList, setClientsList] = useState<ClientRecord[]>(clients.map(mapMockClient))
    const { currentTenant } = useTenant()
    const { data: tenantCustomers } = useTenantCustomers(currentTenant.id)
    const [activeSavedFilter, setActiveSavedFilter] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [importMessage, setImportMessage] = useState("")

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        cpf: ""
    })

    useEffect(() => {
        if (tenantCustomers.length > 0) {
            setClientsList(tenantCustomers)
        }
    }, [tenantCustomers])

    // Filter clients by current tenant
    const tenantClients = clientsList.filter(client => client.tenantId === currentTenant.id)

    const stats = useMemo(() => {
        const total = tenantClients.length
        const active = tenantClients.filter(client => client.status === "active").length
        const churned = tenantClients.filter(client => client.status === "churned").length
        const avgTicket = total ? tenantClients.reduce((acc, client) => acc + client.totalSpent, 0) / total : 0
        const retention = total ? Math.round((tenantClients.filter(client => differenceInDays(new Date(), new Date(client.lastVisit)) <= 30).length / total) * 100) : 0
        return { total, active, churned, avgTicket, retention }
    }, [tenantClients])

    const filteredClients = tenantClients
        .filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(client => {
            if (selectedSegment === "all") return true
            const segment = segments.find(segment => segment.id === selectedSegment)
            return segment ? segment.filter(client) : true
        })
        .filter(client => {
            if (statusFilter.length === 0) return true
            return statusFilter.includes(client.status)
        })
        .filter(client => {
            const filterConfig = spendingFilters.find(filter => filter.id === spendingFilter)
            if (!filterConfig || !filterConfig.range) return true
            const [min, max] = filterConfig.range
            return client.totalSpent >= min && client.totalSpent <= max
        })
        .filter(client => {
            if (tagFilter.length === 0) return true
            const clientTags = getClientTags(client)
            return tagFilter.every(tag => clientTags.includes(tag))
        })

    const generateClientId = () => {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
            return crypto.randomUUID()
        }
        return `client-${Date.now()}-${Math.random().toString(16).slice(2)}`
    }

    const handleCreateClient = () => {
        const newClient: ClientRecord = {
            id: generateClientId(),
            tenantId: currentTenant.id,
            ...formData,
            status: 'active',
            lastVisit: new Date().toISOString(),
            totalSpent: 0,
            avatar: ""
        }
        setClientsList([...clientsList, newClient])
        setShowNewClient(false)
        resetForm()
    }

    const handleEditClient = () => {
        if (!selectedClient) return
        setClientsList(clientsList.map(c =>
            c.id === selectedClient.id ? { ...c, ...formData } : c
        ))
        setShowEditClient(false)
        resetForm()
    }

    const handleDeleteClient = () => {
        if (!selectedClient) return
        setClientsList(clientsList.filter(c => c.id !== selectedClient.id))
        setShowConfirm(false)
        setSelectedClient(null)
    }

    const handleImportClick = () => {
        setImportMessage("")
        fileInputRef.current?.click()
    }

    const parseLineToClient = (line: string): ClientRecord | null => {
        const parts = line.split(/[,;\t]/).map(part => part.trim()).filter(Boolean)
        if (parts.length < 2) return null
        const [name, email, phone = ""] = parts
        if (!name || !email) return null
        return {
            id: generateClientId(),
            tenantId: currentTenant.id,
            name,
            email,
            phone,
            lastVisit: new Date().toISOString(),
            totalSpent: 0,
            status: "active",
            avatar: "",
        }
    }

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        event.target.value = ""
        if (!file) return

        const reader = new FileReader()
        reader.onload = () => {
            const text = reader.result?.toString() ?? ""
            const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean)
            const imported = lines
                .map(parseLineToClient)
                .filter((client): client is ClientRecord => client !== null)

            if (imported.length === 0) {
                setImportMessage("Nenhum cliente válido encontrado no arquivo.")
                return
            }

            setClientsList(prev => [...prev, ...imported])
            setImportMessage(`${imported.length} cliente(s) importado(s) com sucesso.`)
        }
        reader.onerror = () => setImportMessage("Não foi possível ler o arquivo selecionado.")
        reader.readAsText(file, "utf-8")
    }

    const handleExport = (format: "csv" | "txt") => {
        const tenantClients = clientsList.filter(client => client.tenantId === currentTenant.id)
        if (tenantClients.length === 0) {
            setImportMessage("Não há clientes para exportar.")
            return
        }

        const header = "Nome,Email,Telefone,Status"
        const rows = tenantClients.map(client => {
            const fields = [client.name, client.email, client.phone, client.status]
            return fields.map(field => `"${(field ?? "").replace(/"/g, '""')}"`).join(",")
        })
        const content = [header, ...rows].join("\n")
        const mime = format === "csv" ? "text/csv" : "text/plain"
        const extension = format === "csv" ? "csv" : "txt"

        const blob = new Blob([content], { type: `${mime};charset=utf-8;` })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `clientes-${currentTenant.slug}.${extension}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        setImportMessage(`Arquivo ${extension.toUpperCase()} exportado.`)
    }

    const openEditDialog = (client: ClientRecord) => {
        setSelectedClient(client)
        setFormData({
            name: client.name,
            email: client.email,
            phone: client.phone,
            cpf: client.cpf || ""
        })
        setShowEditClient(true)
    }

    const openDeleteDialog = (client: ClientRecord) => {
        setSelectedClient(client)
        setShowConfirm(true)
    }

    const resetForm = () => {
        setFormData({ name: "", email: "", phone: "", cpf: "" })
        setSelectedClient(null)
    }

    const handleApplySavedFilter = (filterConfig: (typeof savedFilters)[number]) => {
        setActiveSavedFilter(filterConfig.id)
        setStatusFilter(filterConfig.status ?? [])
        setSpendingFilter(filterConfig.spending ?? "all")
        setTagFilter(filterConfig.tags ?? [])
        setSelectedSegment(filterConfig.segment ?? "all")
    }

    return (
        <div className="space-y-8">
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                className="hidden"
                onChange={handleFileImport}
            />
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Clientes</h2>
                    <p className="text-muted-foreground mt-1">
                        Gerencie sua base, segmente em grupos e ative campanhas.
                    </p>
                </div>

                <FormDialog
                    open={showNewClient}
                    onOpenChange={setShowNewClient}
                    title="Novo Cliente"
                    description="Cadastre um novo cliente no sistema"
                    onSubmit={handleCreateClient}
                    submitLabel="Criar Cliente"
                >
                    <div className="space-y-4 text-left">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Maria Silva"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="maria@exemplo.com"
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
                        <div className="space-y-2">
                            <Label htmlFor="cpf">CPF</Label>
                            <Input
                                id="cpf"
                                value={formData.cpf}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '')
                                    const formatted = value.length <= 11 ? value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : formData.cpf
                                    setFormData({ ...formData, cpf: formatted })
                                }}
                                placeholder="000.000.000-00"
                                maxLength={14}
                                required
                            />
                        </div>
                    </div>
                </FormDialog>

                <Button className="shrink-0 shadow-lg shadow-primary/20" onClick={() => setShowNewClient(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Cliente
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <StatCard label="Base ativa" value={stats.active} helper={`${stats.total} clientes`} />
                <StatCard label="Churn" value={stats.churned} helper="Últimos 30 dias" />
                <StatCard label="Retenção" value={`${stats.retention}%`} helper="Visitou em 30 dias" />
                <StatCard label="Ticket médio" value={`R$ ${stats.avgTicket.toFixed(0)}`} helper="por cliente" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <SegmentCard
                    active={selectedSegment === "all"}
                    label="Todos"
                    description="Base completa"
                    count={stats.total}
                    onClick={() => setSelectedSegment("all")}
                />
                {segments.map(segment => (
                    <SegmentCard
                        key={segment.id}
                        active={selectedSegment === segment.id}
                        label={segment.label}
                        description={segment.description}
                        count={tenantClients.filter(segment.filter).length}
                        onClick={() => setSelectedSegment(segment.id)}
                    />
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {savedFilters.map(filter => (
                    <button
                        key={filter.id}
                        type="button"
                        onClick={() => handleApplySavedFilter(filter)}
                        className={cn(
                            "rounded-2xl border border-black/5 dark:border-white/5 bg-gradient-to-br from-white to-slate-50 dark:from-zinc-900 dark:to-zinc-950 p-4 text-left transition-all",
                            activeSavedFilter === filter.id ? "shadow-lg ring-2 ring-primary/30" : "hover:shadow-md"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900 dark:text-white">{filter.title}</p>
                                <p className="text-xs text-muted-foreground">{filter.description}</p>
                            </div>
                            <Badge variant={activeSavedFilter === filter.id ? "default" : "secondary"} className="rounded-full text-[10px]">
                                Aplicar
                            </Badge>
                        </div>
                        <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-primary/60">Filtro salvo</p>
                    </button>
                ))}
            </div>

            {/* Modals for Edit and Confirm */}
            <FormDialog
                open={showEditClient}
                onOpenChange={setShowEditClient}
                title="Editar Cliente"
                description={`Editando dados de ${selectedClient?.name}`}
                onSubmit={handleEditClient}
                submitLabel="Salvar Alterações"
            >
                <div className="space-y-4 text-left">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Nome Completo</Label>
                        <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                            id="edit-email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-phone">Telefone</Label>
                        <Input
                            id="edit-phone"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-cpf">CPF</Label>
                        <Input
                            id="edit-cpf"
                            value={formData.cpf}
                            onChange={(e) => {
                                const value = e.target.value.replace(/\D/g, '')
                                const formatted = value.length <= 11 ? value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : formData.cpf
                                setFormData({ ...formData, cpf: formatted })
                            }}
                            placeholder="000.000.000-00"
                            maxLength={14}
                            required
                        />
                    </div>
                </div>
            </FormDialog>

            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title="Excluir Cliente"
                description={`Tem certeza que deseja excluir "${selectedClient?.name}"? Esta ação não pode ser desfeita.`}
                onConfirm={handleDeleteClient}
                variant="destructive"
            />

            {/* Filters & View Toggle */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-white/60 dark:bg-zinc-900/60 p-1 rounded-xl border border-white/20 backdrop-blur-sm w-full max-w-md">
                    <div className="pl-3 text-muted-foreground">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        className="flex-1 bg-transparent border-none text-sm focus:outline-none p-2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex bg-white/60 dark:bg-zinc-900/60 p-1 rounded-xl border border-white/20 backdrop-blur-sm shadow-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        className={cn(
                            "rounded-lg h-9 w-9 p-0 transition-all",
                            viewMode === 'grid' ? "bg-white dark:bg-zinc-700 shadow-sm text-primary" : "text-muted-foreground"
                        )}
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewMode('list')}
                        className={cn(
                            "rounded-lg h-9 w-9 p-0 transition-all",
                            viewMode === 'list' ? "bg-white dark:bg-zinc-700 shadow-sm text-primary" : "text-muted-foreground"
                        )}
                    >
                        <ListIcon className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Smart Filters */}
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/70 dark:bg-zinc-900/70 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Status</p>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setStatusFilter([])}>
                            Limpar
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {statusOptions.map(option => {
                            const active = statusFilter.includes(option.id)
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() =>
                                        setStatusFilter(prev =>
                                            active ? prev.filter(id => id !== option.id) : [...prev, option.id]
                                        )
                                    }
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest transition-colors",
                                        active
                                            ? "bg-primary text-white shadow-lg"
                                            : "bg-slate-100 dark:bg-zinc-800 text-slate-500"
                                    )}
                                >
                                    {option.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
                <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/70 dark:bg-zinc-900/70 p-5 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Ticket Médio</p>
                    <div className="grid gap-2">
                        {spendingFilters.map(filter => (
                            <button
                                key={filter.id}
                                type="button"
                                onClick={() => setSpendingFilter(filter.id)}
                                className={cn(
                                    "w-full px-4 py-2 rounded-xl text-sm font-semibold text-left transition-colors",
                                    spendingFilter === filter.id
                                        ? "bg-slate-900 text-white shadow-lg"
                                        : "bg-slate-100 dark:bg-zinc-800 text-slate-600"
                                )}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl border border-black/5 dark:border-white/5 bg-white/70 dark:bg-zinc-900/70 p-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">Tags</p>
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setTagFilter([])}>
                            Limpar
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {availableTags.map(tag => {
                            const active = tagFilter.includes(tag.id)
                            return (
                                <button
                                    key={tag.id}
                                    type="button"
                                    onClick={() =>
                                        setTagFilter(prev =>
                                            active ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
                                        )
                                    }
                                    className={cn(
                                        "px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-widest border transition-colors",
                                        active
                                            ? "bg-primary/10 text-primary border-primary/30"
                                            : "border-slate-200 text-slate-500 dark:border-zinc-700 dark:text-zinc-400"
                                    )}
                                >
                                    {tag.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

        <section className="grid gap-4 lg:grid-cols-3">
            <Card className="rounded-[2rem] border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                <CardHeader>
                    <CardTitle>Saúde do funil</CardTitle>
                    <p className="text-sm text-muted-foreground">Acompanhe conversões por etapa do relacionamento.</p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {lifecycleStages.map(stage => (
                        <div key={stage.id} className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{stage.label}</p>
                                    <p className="text-xs text-muted-foreground">{stage.description}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-lg font-black text-slate-900 dark:text-white">{stage.value}%</p>
                                    <Badge variant="secondary" className="rounded-full text-[10px] uppercase tracking-widest">
                                        {stage.delta}
                                    </Badge>
                                </div>
                            </div>
                            <Progress value={stage.value} className="h-2 bg-slate-100 dark:bg-zinc-800" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-sm bg-white/70 dark:bg-zinc-900/70">
                <CardHeader>
                    <CardTitle>Sinais em tempo real</CardTitle>
                    <p className="text-sm text-muted-foreground">Interações que exigem resposta rápida.</p>
                </CardHeader>
                <CardContent className="space-y-3">
                    {interactionSignals.map(signal => {
                        const Icon = signal.icon
                        const toneClass = toneClassMap[signal.tone] ?? "bg-slate-200 text-slate-600"
                        return (
                            <div key={signal.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 dark:border-zinc-800 p-3">
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
