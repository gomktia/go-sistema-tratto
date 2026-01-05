"use client"

import { useRef, useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { FormDialog } from "@/components/ui/form-dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Check, Star, Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

// Define the Plan type based on Supabase schema
interface Plan {
    id: string
    name: string
    code: string
    description: string
    price: number
    limits: {
        maxEmployees: number
        maxAppointments: number
    }
    features: string[]
    metadata: {
        popular: boolean
        cta?: string
        displayPrice?: string
    }
    billing_cycle: string
    is_active: boolean
}

export default function PlanosPage() {
    const [plans, setPlans] = useState<Plan[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showNewPlan, setShowNewPlan] = useState(false)
    const [showEditPlan, setShowEditPlan] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: 0,
        maxEmployees: 1,
        maxAppointmentsPerMonth: 100,
        features: [] as string[],
        popular: false,
        billingCycle: 'monthly',
        status: 'active'
    })

    const [newFeature, setNewFeature] = useState("")

    // Fetch Plans on Mount
    useEffect(() => {
        fetchPlans()
    }, [])

    const fetchPlans = async () => {
        setIsLoading(true)
        const supabase = getSupabaseBrowserClient()
        if (!supabase) {
            setIsLoading(false)
            return
        }

        try {
            const { data, error } = await supabase
                .from('plans')
                .select('*')
                .order('price', { ascending: true })

            if (error) throw error

            // Map DB structure to UI structure
            const mappedPlans: Plan[] = (data || []).map(p => ({
                id: p.id,
                name: p.name,
                code: p.code,
                description: p.description || "",
                price: p.price,
                billing_cycle: p.billing_cycle,
                features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || []),
                limits: typeof p.limits === 'string' ? JSON.parse(p.limits) : (p.limits || { maxEmployees: -1, maxAppointments: -1 }),
                metadata: typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || { popular: false }),
                is_active: p.is_active
            }))

            setPlans(mappedPlans)
        } catch (error) {
            console.error('Error fetching plans:', error)
            alert("Erro ao carregar planos")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreatePlan = async () => {
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        setIsSubmitting(true)

        try {
            const code = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

            const newPlanPayload = {
                name: formData.name,
                code: code,
                description: formData.description,
                price: formData.price,
                billing_cycle: formData.billingCycle,
                features: formData.features, // Supabase handles JSON array automatically if column type is proper or pass as JS object
                limits: {
                    maxEmployees: formData.maxEmployees,
                    maxAppointments: formData.maxAppointmentsPerMonth
                },
                metadata: {
                    popular: formData.popular,
                    cta: "Começar agora"
                },
                is_active: formData.status === 'active'
            }

            const { data, error } = await supabase
                .from('plans')
                .insert(newPlanPayload)
                .select()

            if (error) throw error

            if (typeof window !== 'undefined') window.alert("Plano criado com sucesso!")
            fetchPlans()
            setShowNewPlan(false)
            resetForm()
        } catch (error) {
            console.error("Error creating plan:", error)
            alert("Erro ao criar plano")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleEditPlan = async () => {
        if (!selectedPlan) return
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        setIsSubmitting(true)

        try {
            const updatePayload = {
                name: formData.name,
                description: formData.description,
                price: formData.price,
                billing_cycle: formData.billingCycle,
                features: formData.features,
                limits: {
                    maxEmployees: formData.maxEmployees,
                    maxAppointments: formData.maxAppointmentsPerMonth
                },
                metadata: {
                    ...selectedPlan.metadata,
                    popular: formData.popular
                },
                is_active: formData.status === 'active'
            }

            const { error } = await supabase
                .from('plans')
                .update(updatePayload)
                .eq('id', selectedPlan.id)

            if (error) throw error

            if (typeof window !== 'undefined') window.alert("Plano atualizado com sucesso!")
            fetchPlans()
            setShowEditPlan(false)
            resetForm()
        } catch (error) {
            console.error("Error updating plan:", error)
            alert("Erro ao atualizar plano")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeletePlan = async (plan: Plan) => {
        const supabase = getSupabaseBrowserClient()
        if (!supabase) return

        setIsSubmitting(true)

        try {
            const { error } = await supabase
                .from('plans')
                .delete()
                .eq('id', plan.id)

            if (error) throw error

            if (typeof window !== 'undefined') window.alert("Plano excluído com sucesso!")
            fetchPlans()
            setShowConfirm(false)
        } catch (error) {
            console.error("Error deleting plan:", error)
            alert("Erro ao excluir plano")
        } finally {
            setIsSubmitting(false)
        }
    }

    const openEditDialog = (plan: Plan) => {
        setSelectedPlan(plan)
        setFormData({
            name: plan.name,
            description: plan.description,
            price: plan.price,
            maxEmployees: plan.limits?.maxEmployees ?? -1,
            maxAppointmentsPerMonth: plan.limits?.maxAppointments ?? -1,
            features: [...plan.features],
            popular: plan.metadata?.popular ?? false,
            billingCycle: plan.billing_cycle,
            status: plan.is_active ? 'active' : 'inactive'
        })
        setShowEditPlan(true)
    }

    const openDeleteDialog = (plan: Plan) => {
        setSelectedPlan(plan)
        setShowConfirm(true)
    }

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: 0,
            maxEmployees: 1,
            maxAppointmentsPerMonth: 100,
            features: [],
            popular: false,
            billingCycle: 'monthly',
            status: 'active'
        })
        setSelectedPlan(null)
    }

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormData({ ...formData, features: [...formData.features, newFeature.trim()] })
            setNewFeature("")
        }
    }

    const removeFeature = (index: number) => {
        setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) })
    }

    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Planos</h2>
                    <p className="text-muted-foreground mt-1">
                        Gerencie os planos de assinatura da plataforma
                    </p>
                </div>
                <Button onClick={() => setShowNewPlan(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Plano
                </Button>
            </div>

            {/* Plans Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {plans.map((plan) => (
                    <Card key={plan.id} className={`rounded-2xl border-none shadow-sm backdrop-blur-md ${plan.metadata?.popular ? 'ring-2 ring-primary bg-primary/5' : 'bg-white/60 dark:bg-zinc-900/60'}`}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                {plan.metadata?.popular && (
                                    <Badge className="bg-primary text-white">
                                        <Star className="w-3 h-3 mr-1" />
                                        Popular
                                    </Badge>
                                )}
                            </div>
                            <CardDescription>{plan.description}</CardDescription>
                            <div className="mt-4">
                                {plan.metadata?.displayPrice ? (
                                    <span className="text-4xl font-bold">{plan.metadata.displayPrice}</span>
                                ) : (
                                    <>
                                        <span className="text-4xl font-bold">R$ {plan.price}</span>
                                        <span className="text-muted-foreground">/mês</span>
                                    </>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Limites:</p>
                                <ul className="space-y-1 text-sm">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        {plan.limits?.maxEmployees === -1 ? 'Funcionários ilimitados' : `Até ${plan.limits?.maxEmployees} funcionário(s)`}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-green-600" />
                                        {plan.limits?.maxAppointments === -1 ? 'Agendamentos ilimitados' : `${plan.limits?.maxAppointments} agendamentos/mês`}
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Funcionalidades:</p>
                                <ul className="space-y-1 text-sm">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-green-600" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-4 flex gap-2">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => openEditDialog(plan)}
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => openDeleteDialog(plan)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Excluir
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal Novo Plano */}
            <FormDialog
                open={showNewPlan}
                onOpenChange={setShowNewPlan}
                title="Novo Plano"
                description="Crie um novo plano de assinatura"
                onSubmit={handleCreatePlan}
                submitLabel={isSubmitting ? "Criando..." : "Criar Plano"}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Plano</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Professional"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Preço Mensal (R$)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                placeholder="197"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Descrição</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Ideal para salões em crescimento"
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="maxEmployees">Máx. Funcionários</Label>
                            <Input
                                id="maxEmployees"
                                type="number"
                                value={formData.maxEmployees}
                                onChange={(e) => setFormData({ ...formData, maxEmployees: Number(e.target.value) })}
                                placeholder="5"
                            />
                            <p className="text-xs text-muted-foreground">-1 para ilimitado</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxAppointments">Máx. Agendamentos/Mês</Label>
                            <Input
                                id="maxAppointments"
                                type="number"
                                value={formData.maxAppointmentsPerMonth}
                                onChange={(e) => setFormData({ ...formData, maxAppointmentsPerMonth: Number(e.target.value) })}
                                placeholder="500"
                            />
                            <p className="text-xs text-muted-foreground">-1 para ilimitado</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Funcionalidades</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Ex: Agendamento online"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            />
                            <Button type="button" onClick={addFeature} size="sm">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {formData.features.length > 0 && (
                            <ul className="space-y-1 mt-2">
                                {formData.features.map((feature, index) => (
                                    <li key={index} className="flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
                                        <span>{feature}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFeature(index)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="popular"
                            checked={formData.popular}
                            onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                        />
                        <Label htmlFor="popular">Marcar como popular</Label>
                    </div>
                </div>
            </FormDialog>

            {/* Modal Editar Plano */}
            <FormDialog
                open={showEditPlan}
                onOpenChange={setShowEditPlan}
                title="Editar Plano"
                description={`Editando ${selectedPlan?.name}`}
                onSubmit={handleEditPlan}
                submitLabel={isSubmitting ? "Salvando..." : "Salvar Alterações"}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome do Plano</Label>
                            <Input
                                id="edit-name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-price">Preço Mensal (R$)</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Descrição</Label>
                        <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-maxEmployees">Máx. Funcionários</Label>
                            <Input
                                id="edit-maxEmployees"
                                type="number"
                                value={formData.maxEmployees}
                                onChange={(e) => setFormData({ ...formData, maxEmployees: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-maxAppointments">Máx. Agendamentos/Mês</Label>
                            <Input
                                id="edit-maxAppointments"
                                type="number"
                                value={formData.maxAppointmentsPerMonth}
                                onChange={(e) => setFormData({ ...formData, maxAppointmentsPerMonth: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Funcionalidades</Label>
                        <div className="flex gap-2">
                            <Input
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                placeholder="Ex: Agendamento online"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            />
                            <Button type="button" onClick={addFeature} size="sm">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        {formData.features.length > 0 && (
                            <ul className="space-y-1 mt-2">
                                {formData.features.map((feature, index) => (
                                    <li key={index} className="flex items-center justify-between text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded">
                                        <span>{feature}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeFeature(index)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="edit-popular"
                            checked={formData.popular}
                            onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                        />
                        <Label htmlFor="edit-popular">Marcar como popular</Label>
                    </div>
                </div>
            </FormDialog>

            {/* Confirm Delete */}
            {selectedPlan && (
                <ConfirmDialog
                    open={showConfirm}
                    onOpenChange={setShowConfirm}
                    title="Excluir Plano"
                    description={`Tem certeza que deseja excluir o plano "${selectedPlan.name}"? Esta ação não pode ser desfeita.`}
                    onConfirm={() => handleDeletePlan(selectedPlan)}
                    variant="destructive"
                    confirmLabel={isSubmitting ? "Excluindo..." : "Excluir"}
                />
            )}
        </div>
    )
}
