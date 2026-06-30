"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ImportExportButton } from "@/components/import-export/ImportExportButton"
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Percent,
    Mail,
    ChevronRight,
    LayoutGrid,
    List as ListIcon,
    Settings2,
    Loader2,
    AlertCircle,
    Users,
    RefreshCw,
} from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FormDialog } from "@/components/ui/form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTenantEmployees, useTenantServices } from "@/hooks/useTenantRecords"
import { useTenant } from "@/contexts/tenant-context"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { EmployeeRecord } from "@/types/catalog"
import { UnavailabilityManager } from "@/components/employees/UnavailabilityManager"
import { CommissionExceptionsManager } from "@/components/employees/CommissionExceptionsManager"
import { AvatarUpload } from "@/components/employees/AvatarUpload"

const weekDays = [
    { id: 'monday',    label: 'Segunda' },
    { id: 'tuesday',   label: 'Terça' },
    { id: 'wednesday', label: 'Quarta' },
    { id: 'thursday',  label: 'Quinta' },
    { id: 'friday',    label: 'Sexta' },
    { id: 'saturday',  label: 'Sábado' },
    { id: 'sunday',    label: 'Domingo' },
]

type FormData = {
    name: string
    email: string
    phone: string
    document: string
    birthdate: string
    role: string
    specialties: string[]
    workingHours: Record<string, { start: string; end: string }[]>
    commission: number
    acceptsOnlineBooking: boolean
}

const defaultForm: FormData = {
    name: "",
    email: "",
    phone: "",
    document: "",
    birthdate: "",
    role: "",
    specialties: [],
    workingHours: {},
    commission: 40,
    acceptsOnlineBooking: true,
}

export default function FuncionariosPage() {
    const router = useRouter()
    const { currentTenant } = useTenant()
    const tenantId = currentTenant?.id

    const { data: employees, loading, error: loadError, refetch } = useTenantEmployees(tenantId)
    const { data: services } = useTenantServices(tenantId)

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [searchTerm, setSearchTerm] = useState("")
    const [saving, setSaving] = useState(false)
    const [showNewEmployee, setShowNewEmployee] = useState(false)
    const [showEditEmployee, setShowEditEmployee] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeRecord | null>(null)
    const [formData, setFormData] = useState<FormData>(defaultForm)
    const [avatarUrl, setAvatarUrl] = useState<string>("")

    const filteredEmployees = employees.filter(emp =>
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.specialties ?? []).some(specId => {
            const service = services.find(s => s.id === specId)
            return service?.name.toLowerCase().includes(searchTerm.toLowerCase())
        })
    )

    // ---- Supabase mutations ----

    const handleCreateEmployee = async () => {
        if (!isSupabaseConfigured || !tenantId) {
            // fallback: só fecha o modal se não tem Supabase
            setShowNewEmployee(false)
            resetForm()
            return
        }
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        setSaving(true)
        const { error } = await supabase.from("employees").insert({
            tenant_id: tenantId,
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            document: formData.document || null,
            birthdate: formData.birthdate || null,
            role: formData.role || null,
            avatar_url: avatarUrl || null,
            specialties: formData.specialties,
            working_hours: formData.workingHours,
            commission_rate: formData.commission,
            accepts_online_booking: formData.acceptsOnlineBooking,
            status: "active",
        })

        setSaving(false)
        if (error) {
            console.error("[FuncionariosPage] Erro ao criar profissional:", error.message)
            return
        }
        setShowNewEmployee(false)
        resetForm()
        refetch()
    }

    const handleEditEmployee = async () => {
        if (!selectedEmployee) return
        if (!isSupabaseConfigured || !tenantId) {
            setShowEditEmployee(false)
            resetForm()
            return
        }
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        setSaving(true)
        const { error } = await supabase.from("employees").update({
            full_name: formData.name,
            email: formData.email,
            phone: formData.phone,
            document: formData.document || null,
            birthdate: formData.birthdate || null,
            role: formData.role || null,
            avatar_url: avatarUrl || null,
            specialties: formData.specialties,
            working_hours: formData.workingHours,
            commission_rate: formData.commission,
            accepts_online_booking: formData.acceptsOnlineBooking,
            updated_at: new Date().toISOString(),
        }).eq("id", selectedEmployee.id).eq("tenant_id", tenantId)

        setSaving(false)
        if (error) {
            console.error("[FuncionariosPage] Erro ao editar profissional:", error.message)
            return
        }
        setShowEditEmployee(false)
        resetForm()
        refetch()
    }

    const handleDeleteEmployee = async (employee: EmployeeRecord) => {
        if (!isSupabaseConfigured || !tenantId) {
            setShowConfirm(false)
            return
        }
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        // Soft-delete: marcar como inativo em vez de apagar
        const { error } = await supabase.from("employees")
            .update({ status: "deleted", updated_at: new Date().toISOString() })
            .eq("id", employee.id)
            .eq("tenant_id", tenantId)

        setShowConfirm(false)
        if (error) {
            console.error("[FuncionariosPage] Erro ao remover profissional:", error.message)
            return
        }
        refetch()
    }

    const openEditDialog = (employee: EmployeeRecord) => {
        setSelectedEmployee(employee)
        setFormData({
            name: employee.fullName,
            email: employee.email,
            phone: employee.phone,
            document: employee.document ?? '',
            birthdate: employee.birthdate ?? '',
            role: employee.role ?? '',
            specialties: employee.specialties ?? [],
            workingHours: employee.workingHours ?? {},
            commission: employee.commissionRate ?? 40,
            acceptsOnlineBooking: employee.acceptsOnlineBooking ?? true,
        })
        setAvatarUrl(employee.avatarUrl ?? '')
        setShowEditEmployee(true)
    }

    const resetForm = () => {
        setFormData(defaultForm)
        setAvatarUrl('')
        setSelectedEmployee(null)
    }

    const toggleSpecialty = (serviceId: string) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.includes(serviceId)
                ? prev.specialties.filter(id => id !== serviceId)
                : [...prev.specialties, serviceId],
        }))
    }

    const setWorkingHours = (dayId: string, start: string, end: string) => {
        setFormData(prev => ({
            ...prev,
            workingHours: { ...prev.workingHours, [dayId]: [{ start, end }] },
        }))
    }

    const removeWorkingDay = (dayId: string) => {
        setFormData(prev => {
            const newHours = { ...prev.workingHours }
            delete newHours[dayId]
            return { ...prev, workingHours: newHours }
        })
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Profissionais</h2>
                    <p className="text-slate-500 dark:text-zinc-400 font-medium">Cadastre e gerencie a equipe do salão.</p>
                </div>
                <div className="flex gap-3">
                    <ImportExportButton
                        tenantId={currentTenant.id}
                        type="profissionais"
                        onImportComplete={refetch}
                    />
                    <Button
                        onClick={() => setShowNewEmployee(true)}
                        className="rounded-xl h-12 px-6 bg-primary text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Profissional
                    </Button>
                </div>
            </div>

            {/* Search & Stats */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border-none shadow-sm">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar por nome ou especialidade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 pl-12 bg-slate-50 dark:bg-zinc-800 border-none rounded-2xl font-medium"
                    />
                </div>
                <div className="flex gap-4 items-center">
                    <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "rounded-lg h-9 w-9 p-0 transition-all",
                                viewMode === 'grid' ? "bg-white dark:bg-zinc-700 shadow-sm text-primary" : "text-slate-400"
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
                                viewMode === 'list' ? "bg-white dark:bg-zinc-700 shadow-sm text-primary" : "text-slate-400"
                            )}
                        >
                            <ListIcon className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex gap-8 border-l border-slate-100 dark:border-zinc-800 pl-8">
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : employees.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            )}

            {/* Error State */}
            {!loading && loadError && (
                <div className="flex flex-col items-center justify-center py-16 text-center bg-red-50 dark:bg-red-900/10 rounded-3xl">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-red-600 dark:text-red-400 font-bold mb-2">Erro ao carregar profissionais</p>
                    <p className="text-red-500/70 text-sm mb-4">{loadError}</p>
                    <Button onClick={refetch} variant="outline" className="rounded-xl">
                        <RefreshCw className="w-4 h-4 mr-2" /> Tentar novamente
                    </Button>
                </div>
            )}

            {/* Content View */}
            {!loading && !loadError && viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredEmployees.map((employee, idx) => (
                            <motion.div
                                key={employee.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="group relative overflow-hidden rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-zinc-900 p-8 hover:shadow-2xl transition-all duration-300">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl group-hover:scale-110 transition-transform overflow-hidden">
                                                {employee.avatarUrl ? (
                                                    <img
                                                        src={employee.avatarUrl}
                                                        alt={employee.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    employee.fullName.charAt(0)
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => openEditDialog(employee)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl h-10 w-10 bg-slate-50 dark:bg-zinc-800/50 hover:bg-primary hover:text-white transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => {
                                                        setSelectedEmployee(employee)
                                                        setShowConfirm(true)
                                                    }}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-xl h-10 w-10 bg-slate-50 dark:bg-zinc-800/50 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{employee.fullName}</h3>
                                            <div className="flex flex-wrap gap-1">
                                                {(employee.specialties ?? []).map(specId => {
                                                    const service = services.find(s => s.id === specId)
                                                    return (
                                                        <Badge key={specId} variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-[10px] py-0 border-none">
                                                            {service?.name || specId}
                                                        </Badge>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-3 py-6 border-y border-slate-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-zinc-400">
                                                <Mail className="w-4 h-4" />
                                                <span className="truncate">{employee.email}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-zinc-400">
                                                    <Percent className="w-4 h-4 text-emerald-500" />
                                                    Comissão
                                                </div>
                                                <span className="font-bold text-slate-900 dark:text-white">{employee.commissionRate ?? 0}%</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex gap-2">
                                                {employee.acceptsOnlineBooking && (
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[9px] uppercase tracking-tighter">
                                                        Booking Ativo
                                                    </Badge>
                                                )}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => router.push(`agenda?employee=${employee.id}`)}
                                                className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase hover:text-primary transition-colors h-auto p-0"
                                            >
                                                Ver Agenda <ChevronRight className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredEmployees.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-400">
                            <p className="text-lg font-bold">Nenhum profissional encontrado.</p>
                            <p className="text-sm">Clique em &quot;Novo Profissional&quot; para cadastrar.</p>
                        </div>
                    )}
                </div>
            )}

            {!loading && !loadError && viewMode === 'list' && (
                <div className="rounded-[2rem] overflow-hidden border-none shadow-sm bg-white dark:bg-zinc-900">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-slate-100 dark:border-zinc-800">
                                <TableHead className="pl-8 py-6 font-bold text-xs uppercase tracking-widest">Profissional</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-widest">Contatos</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-widest">Especialidades</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-widest">Comissão</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-widest">Status</TableHead>
                                <TableHead className="text-right pr-8 font-bold text-xs uppercase tracking-widest">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.map((employee) => (
                                <TableRow key={employee.id} className="border-slate-50 dark:border-zinc-800/50 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                                    <TableCell className="pl-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black overflow-hidden">
                                                {employee.avatarUrl ? (
                                                    <img
                                                        src={employee.avatarUrl}
                                                        alt={employee.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    employee.fullName.charAt(0)
                                                )}
                                            </div>
                                            <div className="font-bold text-slate-900 dark:text-white uppercase tracking-tight">{employee.fullName}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-tight">{employee.email}</div>
                                        <div className="text-[9px] text-slate-400 font-medium">{employee.phone}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                            {(employee.specialties ?? []).map(specId => {
                                                const service = services.find(s => s.id === specId)
                                                return (
                                                    <Badge key={specId} variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-[10px] py-0 border-none">
                                                        {service?.name || specId}
                                                    </Badge>
                                                )
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-900 dark:text-white">
                                        {employee.commissionRate ?? 0}%
                                    </TableCell>
                                    <TableCell>
                                        {employee.acceptsOnlineBooking ? (
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-bold text-[9px] uppercase">Online</Badge>
                                        ) : (
                                            <Badge className="bg-slate-100 dark:bg-zinc-800 text-slate-400 border-none font-bold text-[9px] uppercase">Offline</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                onClick={() => openEditDialog(employee)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary"
                                            >
                                                <Settings2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setSelectedEmployee(employee)
                                                    setShowConfirm(true)
                                                }}
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Modal Novo / Editar */}
            <FormDialog
                open={showNewEmployee || showEditEmployee}
                onOpenChange={showNewEmployee ? setShowNewEmployee : setShowEditEmployee}
                title={showNewEmployee ? "Novo Profissional" : "Editar Profissional"}
                description="Cadastre as informações e preferências do profissional."
                onSubmit={showNewEmployee ? handleCreateEmployee : handleEditEmployee}
                submitLabel={saving ? "Salvando..." : showNewEmployee ? "Concluir Cadastro" : "Salvar Alterações"}
            >
                {showEditEmployee && selectedEmployee ? (
                    <Tabs defaultValue="basico" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="basico">Dados Básicos</TabsTrigger>
                            <TabsTrigger value="bloqueios">Bloqueios</TabsTrigger>
                            <TabsTrigger value="comissoes">Exceções Comissão</TabsTrigger>
                        </TabsList>

                        <TabsContent value="basico" className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin mt-4">
                            {/* Foto do Profissional */}
                            {selectedEmployee && (
                                <div className="pb-6 border-b border-slate-100 dark:border-zinc-800">
                                    <AvatarUpload
                                        tenantId={currentTenant.id}
                                        employeeId={selectedEmployee.id}
                                        currentAvatarUrl={avatarUrl}
                                        onUploadComplete={(url) => setAvatarUrl(url)}
                                    />
                                </div>
                            )}

                            {/* Informações Básicas */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações Básicas</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-bold uppercase">Nome Completo</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Email</Label>
                                <Input
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Telefone</Label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">CPF</Label>
                                <Input
                                    value={formData.document}
                                    onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                                    placeholder="000.000.000-00"
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Data de Nascimento</Label>
                                <Input
                                    type="date"
                                    value={formData.birthdate}
                                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                        </div>

                        <div className="pt-4 space-y-2">
                            <Label className="text-xs font-bold uppercase">Cargo/Função</Label>
                            <Select
                                value={formData.role}
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none">
                                    <SelectValue placeholder="Selecione o cargo" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gerente">Gerente</SelectItem>
                                    <SelectItem value="cabeleireira">Cabeleireira</SelectItem>
                                    <SelectItem value="manicure">Manicure</SelectItem>
                                    <SelectItem value="esteticista">Esteticista</SelectItem>
                                    <SelectItem value="recepcionista">Recepcionista</SelectItem>
                                    <SelectItem value="assistente">Assistente</SelectItem>
                                    <SelectItem value="outro">Outro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Especialidades */}
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialidades</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {services.map(service => (
                                <div key={service.id} className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                                    <Checkbox
                                        id={service.id}
                                        checked={formData.specialties.includes(service.id)}
                                        onCheckedChange={() => toggleSpecialty(service.id)}
                                    />
                                    <label htmlFor={service.id} className="text-sm font-medium leading-none">
                                        {service.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Horários de Atendimento */}
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horários de Atendimento</h4>
                        <div className="space-y-3">
                            {weekDays.map(day => {
                                const hours = formData.workingHours[day.id]?.[0]
                                return (
                                    <div key={day.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={!!hours}
                                                onCheckedChange={(checked) => {
                                                    if (checked) setWorkingHours(day.id, "09:00", "18:00")
                                                    else removeWorkingDay(day.id)
                                                }}
                                            />
                                            <span className="text-sm font-bold uppercase tracking-tight w-20">{day.label}</span>
                                        </div>
                                        {hours && (
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="time"
                                                    value={hours.start}
                                                    onChange={(e) => setWorkingHours(day.id, e.target.value, hours.end)}
                                                    className="w-24 h-9 rounded-lg bg-white dark:bg-zinc-900 border-none text-xs font-bold"
                                                />
                                                <span className="text-slate-400 font-bold">às</span>
                                                <Input
                                                    type="time"
                                                    value={hours.end}
                                                    onChange={(e) => setWorkingHours(day.id, hours.start, e.target.value)}
                                                    className="w-24 h-9 rounded-lg bg-white dark:bg-zinc-900 border-none text-xs font-bold"
                                                />
                                            </div>
                                        )}
                                        {!hours && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-4">Folga</span>}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Preferências & Financeiro */}
                    <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferências & Financeiro</h4>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase">Comissão (%)</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={formData.commission}
                                    onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                                    className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                                <div>
                                    <p className="text-sm font-bold">Reserva Online</p>
                                    <p className="text-[10px] text-slate-400">Permitir que clientes agendem com este profissional</p>
                                </div>
                                <Switch
                                    checked={formData.acceptsOnlineBooking}
                                    onCheckedChange={(checked) => setFormData({ ...formData, acceptsOnlineBooking: checked })}
                                />
                            </div>
                        </div>
                    </div>
                        </TabsContent>

                        <TabsContent value="bloqueios" className="mt-4">
                            <UnavailabilityManager
                                tenantId={currentTenant.id}
                                employeeId={selectedEmployee.id}
                            />
                        </TabsContent>

                        <TabsContent value="comissoes" className="mt-4">
                            <CommissionExceptionsManager
                                tenantId={currentTenant.id}
                                employeeId={selectedEmployee.id}
                                defaultCommissionRate={selectedEmployee.commissionRate ?? 40}
                            />
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 scrollbar-thin">
                        {/* Informações Básicas */}
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Informações Básicas</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2 space-y-2">
                                    <Label className="text-xs font-bold uppercase">Nome Completo</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Email</Label>
                                    <Input
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Telefone</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Especialidades */}
                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Especialidades</h4>
                            <div className="grid grid-cols-2 gap-3">
                                {services.map(service => (
                                    <div key={service.id} className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-zinc-800 rounded-xl">
                                        <Checkbox
                                            id={service.id}
                                            checked={formData.specialties.includes(service.id)}
                                            onCheckedChange={() => toggleSpecialty(service.id)}
                                        />
                                        <label htmlFor={service.id} className="text-sm font-medium leading-none">
                                            {service.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Horários de Atendimento */}
                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Horários de Atendimento</h4>
                            <div className="space-y-3">
                                {weekDays.map(day => {
                                    const hours = formData.workingHours[day.id]?.[0]
                                    return (
                                        <div key={day.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={!!hours}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setWorkingHours(day.id, "09:00", "18:00")
                                                        else removeWorkingDay(day.id)
                                                    }}
                                                />
                                                <span className="text-sm font-bold uppercase tracking-tight w-20">{day.label}</span>
                                            </div>
                                            {hours && (
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="time"
                                                        value={hours.start}
                                                        onChange={(e) => setWorkingHours(day.id, e.target.value, hours.end)}
                                                        className="w-24 h-9 rounded-lg bg-white dark:bg-zinc-900 border-none text-xs font-bold"
                                                    />
                                                    <span className="text-slate-400 font-bold">às</span>
                                                    <Input
                                                        type="time"
                                                        value={hours.end}
                                                        onChange={(e) => setWorkingHours(day.id, hours.start, e.target.value)}
                                                        className="w-24 h-9 rounded-lg bg-white dark:bg-zinc-900 border-none text-xs font-bold"
                                                    />
                                                </div>
                                            )}
                                            {!hours && <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pr-4">Folga</span>}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Preferências & Financeiro */}
                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-zinc-800">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Preferências & Financeiro</h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase">Comissão (%)</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        value={formData.commission}
                                        onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
                                        className="rounded-xl h-12 bg-slate-50 dark:bg-zinc-800 border-none"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800 rounded-2xl">
                                    <div>
                                        <p className="text-sm font-bold">Reserva Online</p>
                                        <p className="text-[10px] text-slate-400">Permitir que clientes agendem com este profissional</p>
                                    </div>
                                    <Switch
                                        checked={formData.acceptsOnlineBooking}
                                        onCheckedChange={(checked) => setFormData({ ...formData, acceptsOnlineBooking: checked })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </FormDialog>

            <ConfirmDialog
                open={showConfirm}
                onOpenChange={setShowConfirm}
                title="Remover Profissional?"
                description="Esta ação removerá o acesso do profissional ao sistema. Os dados históricos permanecerão salvos."
                onConfirm={() => selectedEmployee && handleDeleteEmployee(selectedEmployee)}
                variant="destructive"
            />
        </div>
    )
}
