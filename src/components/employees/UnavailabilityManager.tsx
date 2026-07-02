'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
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
import { useEmployeeUnavailability } from '@/hooks/useEmployeeUnavailability'
import type {
  EmployeeUnavailability,
  UnavailabilityReason,
  CreateEmployeeUnavailabilityInput
} from '@/types/employee-extended'
import { unavailabilityReasonLabels, unavailabilityReasonColors } from '@/types/employee-extended'
import { cn } from '@/lib/utils'

interface UnavailabilityManagerProps {
  tenantId: string
  employeeId: string
}

export function UnavailabilityManager({ tenantId, employeeId }: UnavailabilityManagerProps) {
  const {
    data: unavailabilities,
    loading,
    createUnavailability,
    updateUnavailability,
    deleteUnavailability,
  } = useEmployeeUnavailability(tenantId, employeeId)

  const [showDialog, setShowDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [editingItem, setEditingItem] = useState<EmployeeUnavailability | null>(null)
  const [deletingItem, setDeletingItem] = useState<EmployeeUnavailability | null>(null)
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState<CreateEmployeeUnavailabilityInput>({
    reason: 'ferias',
    startDate: '',
    endDate: '',
    allDay: true,
    startTime: '09:00',
    endTime: '18:00',
    notes: ''
  })

  const resetForm = () => {
    setFormData({
      reason: 'ferias',
      startDate: '',
      endDate: '',
      allDay: true,
      startTime: '09:00',
      endTime: '18:00',
      notes: ''
    })
    setEditingItem(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setShowDialog(true)
  }

  const openEditDialog = (item: EmployeeUnavailability) => {
    setEditingItem(item)
    setFormData({
      reason: item.reason,
      startDate: item.startDate,
      endDate: item.endDate,
      allDay: item.allDay,
      startTime: item.startTime ?? '09:00',
      endTime: item.endTime ?? '18:00',
      notes: item.notes ?? ''
    })
    setShowDialog(true)
  }

  const openDeleteDialog = (item: EmployeeUnavailability) => {
    setDeletingItem(item)
    setShowDeleteDialog(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editingItem) {
        await updateUnavailability(editingItem.id, formData)
      } else {
        await createUnavailability(formData)
      }
      setShowDialog(false)
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingItem) return
    setSaving(true)
    try {
      await deleteUnavailability(deletingItem.id)
      setShowDeleteDialog(false)
      setDeletingItem(null)
    } finally {
      setSaving(false)
    }
  }

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`
  }

  const getBadgeColor = (reason: UnavailabilityReason) => {
    const color = unavailabilityReasonColors[reason]
    const colorMap = {
      blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
    }
    return colorMap[color as keyof typeof colorMap]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold">Bloqueios de Agenda</h4>
          <p className="text-xs text-muted-foreground">Férias, folgas e indisponibilidades</p>
        </div>
        <Button type="button" onClick={openCreateDialog} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Bloqueio
        </Button>
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground py-4">Carregando bloqueios...</p>
      )}

      {!loading && unavailabilities.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum bloqueio cadastrado</p>
        </div>
      )}

      {!loading && unavailabilities.length > 0 && (
        <div className="space-y-2">
          {unavailabilities.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={cn('text-xs', getBadgeColor(item.reason))}>
                    {unavailabilityReasonLabels[item.reason]}
                  </Badge>
                  <span className="text-sm font-medium">
                    {formatDateRange(item.startDate, item.endDate)}
                  </span>
                </div>
                {!item.allDay && item.startTime && item.endTime && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {item.startTime} - {item.endTime}
                  </div>
                )}
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
          ))}
        </div>
      )}

      {/* Dialog Criar/Editar */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar Bloqueio' : 'Novo Bloqueio'}
            </DialogTitle>
            <DialogDescription>
              Configure o período de indisponibilidade do profissional
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Bloqueio</Label>
              <Select
                value={formData.reason}
                onValueChange={(value) => setFormData({ ...formData, reason: value as UnavailabilityReason })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ferias">Férias</SelectItem>
                  <SelectItem value="folga">Folga</SelectItem>
                  <SelectItem value="atestado">Atestado Médico</SelectItem>
                  <SelectItem value="bloqueio_manual">Bloqueio Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Dia Inteiro</p>
                <p className="text-xs text-muted-foreground">Bloqueia o dia todo</p>
              </div>
              <Switch
                checked={formData.allDay}
                onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })}
              />
            </div>

            {!formData.allDay && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hora Início</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora Fim</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Observações (opcional)</Label>
              <Textarea
                placeholder="Ex: Viagem programada"
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
            <Button type="button" onClick={handleSave} disabled={saving || !formData.startDate || !formData.endDate}>
              {saving ? 'Salvando...' : editingItem ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Excluir */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Bloqueio?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O bloqueio será removido permanentemente.
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
