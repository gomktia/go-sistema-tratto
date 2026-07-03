'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Percent, TrendingUp, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useEmployeeServiceCommissions } from '@/hooks/useEmployeeServiceCommissions'
import { useTenantServices } from '@/hooks/useTenantRecords'
import type {
  EmployeeServiceCommission,
  CreateEmployeeServiceCommissionInput
} from '@/types/employee-extended'
import { cn } from '@/lib/utils'

interface CommissionExceptionsManagerProps {
  tenantId: string
  employeeId: string
  defaultCommissionRate: number
}

export function CommissionExceptionsManager({
  tenantId,
  employeeId,
  defaultCommissionRate
}: CommissionExceptionsManagerProps) {
  const {
    data: exceptions,
    loading,
    error: hookError,
    createCommissionException,
    updateCommissionException,
    deleteCommissionException,
  } = useEmployeeServiceCommissions(tenantId, employeeId)

  const { data: services } = useTenantServices(tenantId)

  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<EmployeeServiceCommission | null>(null)
  const [deletingItem, setDeletingItem] = useState<EmployeeServiceCommission | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<CreateEmployeeServiceCommissionInput>({
    serviceId: '',
    commissionRate: defaultCommissionRate,
    notes: ''
  })

  const resetForm = () => {
    setFormData({
      serviceId: '',
      commissionRate: defaultCommissionRate,
      notes: ''
    })
    setEditingItem(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setShowDialog(true)
  }

  const openEditDialog = (item: EmployeeServiceCommission) => {
    setEditingItem(item)
    setFormData({
      serviceId: item.serviceId,
      commissionRate: item.commissionRate,
      notes: item.notes ?? ''
    })
    setShowDialog(true)
  }

  const openDeleteDialog = (item: EmployeeServiceCommission) => {
    setDeletingItem(item)
    setShowDeleteDialog(true)
  }

  const handleSave = async () => {
    if (!formData.serviceId) {
      return
    }

    setSaving(true)
    try {
      let result
      if (editingItem) {
        result = await updateCommissionException(editingItem.id, {
          commissionRate: formData.commissionRate,
          notes: formData.notes
        })
      } else {
        result = await createCommissionException(formData)
      }

      if (!result) {
        alert('Erro ao salvar exceção de comissão.')
        return
      }

      setShowDialog(false)
      resetForm()
    } catch (err) {
      alert('Erro ao salvar: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    setSaving(true)
    try {
      await deleteCommissionException(deletingItem.id)
      setShowDeleteDialog(false)
      setDeletingItem(null)
    } finally {
      setSaving(false)
    }
  }

  const getServiceName = (serviceId: string) => {
    return services.find(s => s.id === serviceId)?.name ?? 'Serviço'
  }

  const getAvailableServices = () => {
    const usedServiceIds = exceptions.map(e => e.serviceId)
    return services.filter(s => !usedServiceIds.includes(s.id))
  }

  const getDifference = (exceptionRate: number) => {
    const diff = exceptionRate - defaultCommissionRate
    if (diff === 0) return null
    return {
      value: Math.abs(diff),
      isHigher: diff > 0
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold">Exceções de Comissão</h4>
          <p className="text-xs text-muted-foreground">
            Taxas específicas por serviço (substitui {defaultCommissionRate}% padrão)
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreateDialog}
          size="sm"
          className="gap-2"
          disabled={getAvailableServices().length === 0}
        >
          <Plus className="w-4 h-4" />
          Adicionar Exceção
        </Button>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground py-4">Carregando exceções...</p>
      )}

      {!loading && exceptions.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Percent className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Nenhuma exceção cadastrada
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Todos os serviços usam a comissão padrão de {defaultCommissionRate}%
          </p>
        </div>
      )}

      {!loading && exceptions.length > 0 && (
        <div className="space-y-2">
          {exceptions.map((item) => {
            const diff = getDifference(item.commissionRate)
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {item.serviceName || getServiceName(item.serviceId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-bold">
                      {item.commissionRate}%
                    </Badge>
                    {diff && (
                      <div className={cn(
                        "flex items-center gap-1 text-xs",
                        diff.isHigher ? "text-green-600" : "text-orange-600"
                      )}>
                        {diff.isHigher ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {diff.isHigher ? '+' : '-'}{diff.value}% vs padrão
                      </div>
                    )}
                  </div>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground">{item.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => openEditDialog(item)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => openDeleteDialog(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Dialog Criar/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Exceção' : 'Nova Exceção de Comissão'}
            </DialogTitle>
            <DialogDescription>
              Defina uma taxa de comissão específica para um serviço
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Serviço</Label>
              {editingItem ? (
                <Input
                  value={editingItem.serviceName || getServiceName(editingItem.serviceId)}
                  disabled
                  className="bg-muted"
                />
              ) : (
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableServices().map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label>Taxa de Comissão (%)</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                  className="flex-1"
                />
                <Badge variant="outline" className="text-xs">
                  Padrão: {defaultCommissionRate}%
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                placeholder="Ex: Comissão especial para este serviço"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving || !formData.serviceId}>
              {saving ? 'Salvando...' : editingItem ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Excluir */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Exceção?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O serviço voltará a usar a comissão padrão de {defaultCommissionRate}%.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={saving}>
              {saving ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
