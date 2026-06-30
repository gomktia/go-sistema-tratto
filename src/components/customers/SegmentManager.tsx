'use client'

import { useState } from 'react'
import { Save, FolderOpen, Edit2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useCustomerSegments } from '@/hooks/useCustomerSegments'
import type { CustomerFilters } from '@/types/customer-filters'
import type { CustomerSegment } from '@/types/customer-segments'

interface SegmentManagerProps {
  tenantId: string
  currentFilters: CustomerFilters
  onApplySegment: (filters: CustomerFilters) => void
}

export function SegmentManager({ tenantId, currentFilters, onApplySegment }: SegmentManagerProps) {
  const { segments, loading, createSegment, updateSegment, deleteSegment } = useCustomerSegments(tenantId)

  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment | null>(null)

  const [segmentName, setSegmentName] = useState('')
  const [segmentDescription, setSegmentDescription] = useState('')

  const handleSave = async () => {
    if (!segmentName.trim()) return

    await createSegment({
      name: segmentName.trim(),
      description: segmentDescription.trim() || undefined,
      filters: currentFilters
    })

    setSegmentName('')
    setSegmentDescription('')
    setShowSaveDialog(false)
  }

  const handleRename = async () => {
    if (!selectedSegment || !segmentName.trim()) return

    await updateSegment(selectedSegment.id, {
      name: segmentName.trim(),
      description: segmentDescription.trim() || undefined
    })

    setSegmentName('')
    setSegmentDescription('')
    setSelectedSegment(null)
    setShowRenameDialog(false)
  }

  const handleDelete = async () => {
    if (!selectedSegment) return

    await deleteSegment(selectedSegment.id)

    setSelectedSegment(null)
    setShowDeleteDialog(false)
  }

  const openRenameDialog = (segment: CustomerSegment) => {
    setSelectedSegment(segment)
    setSegmentName(segment.name)
    setSegmentDescription(segment.description || '')
    setShowRenameDialog(true)
  }

  const openDeleteDialog = (segment: CustomerSegment) => {
    setSelectedSegment(segment)
    setShowDeleteDialog(true)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Botão Salvar Segmento */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSaveDialog(true)}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          Salvar Filtro
        </Button>

        {/* Dropdown de Segmentos */}
        {segments.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <FolderOpen className="w-4 h-4" />
                Segmentos
                <Badge variant="secondary" className="ml-1">
                  {segments.length}
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel>Filtros Salvos</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {loading ? (
                <DropdownMenuItem disabled>Carregando...</DropdownMenuItem>
              ) : (
                segments.map((segment) => (
                  <DropdownMenuItem
                    key={segment.id}
                    className="flex items-center justify-between group"
                    onSelect={(e) => {
                      e.preventDefault()
                    }}
                  >
                    <button
                      className="flex-1 text-left"
                      onClick={() => onApplySegment(segment.filters)}
                    >
                      <div className="font-medium">{segment.name}</div>
                      {segment.description && (
                        <div className="text-xs text-muted-foreground">
                          {segment.description}
                        </div>
                      )}
                    </button>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation()
                          openRenameDialog(segment)
                        }}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-600 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDeleteDialog(segment)
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Dialog: Salvar Segmento */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Salvar Filtro</DialogTitle>
            <DialogDescription>
              Salve os filtros atuais para reutilizar rapidamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="segment-name">Nome do Segmento *</Label>
              <Input
                id="segment-name"
                placeholder="Ex: Clientes Inativos 30d"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="segment-desc">Descrição (opcional)</Label>
              <Input
                id="segment-desc"
                placeholder="Ex: Clientes sem visita nos últimos 30 dias"
                value={segmentDescription}
                onChange={(e) => setSegmentDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!segmentName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Renomear Segmento */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Segmento</DialogTitle>
            <DialogDescription>
              Altere o nome e descrição do segmento.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-segment-name">Nome do Segmento *</Label>
              <Input
                id="rename-segment-name"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rename-segment-desc">Descrição (opcional)</Label>
              <Input
                id="rename-segment-desc"
                value={segmentDescription}
                onChange={(e) => setSegmentDescription(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRename} disabled={!segmentName.trim()}>
              <Edit2 className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Excluir Segmento */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Segmento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir &ldquo;{selectedSegment?.name}&rdquo;?
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
