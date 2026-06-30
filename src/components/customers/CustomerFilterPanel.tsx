'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { CustomerFilters } from '@/types/customer-filters'
import { DEFAULT_FILTERS, getActiveFilterCount } from '@/types/customer-filters'

interface CustomerFilterPanelProps {
  filters: CustomerFilters
  onFiltersChange: (filters: CustomerFilters) => void
  onApply: () => void
}

export function CustomerFilterPanel({
  filters,
  onFiltersChange,
  onApply
}: CustomerFilterPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const activeCount = getActiveFilterCount(filters)

  const handleClear = () => {
    onFiltersChange(DEFAULT_FILTERS)
    onApply()
  }

  const updateFilter = <K extends keyof CustomerFilters>(
    key: K,
    value: CustomerFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  return (
    <div className="space-y-4">
      {/* Busca sempre visível */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar por nome, telefone ou e-mail..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="flex-1"
        />
        <Button
          variant="outline"
          onClick={() => setExpanded(!expanded)}
          className="gap-2"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Filtros
          {activeCount > 0 && (
            <Badge variant="default" className="ml-1">
              {activeCount}
            </Badge>
          )}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" onClick={handleClear} className="gap-2">
            <X className="w-4 h-4" />
            Limpar
          </Button>
        )}
      </div>

      {/* Filtros avançados (colapsáveis) */}
      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-zinc-900">
          {/* Gênero */}
          <div className="space-y-2">
            <Label>Gênero</Label>
            <Select
              value={filters.gender}
              onValueChange={(value) =>
                updateFilter('gender', value as CustomerFilters['gender'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
                <SelectItem value="not_informed">Não informado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Idade */}
          <div className="space-y-2">
            <Label>Idade entre</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.ageMin ?? ''}
                onChange={(e) =>
                  updateFilter('ageMin', e.target.value ? parseInt(e.target.value) : null)
                }
                className="w-20"
              />
              <span>e</span>
              <Input
                type="number"
                placeholder="Max"
                value={filters.ageMax ?? ''}
                onChange={(e) =>
                  updateFilter('ageMax', e.target.value ? parseInt(e.target.value) : null)
                }
                className="w-20"
              />
              <span>anos</span>
            </div>
          </div>

          {/* Fez/não fez serviço */}
          <div className="space-y-2">
            <Label>Histórico de serviços</Label>
            <RadioGroup
              value={filters.hasService}
              onValueChange={(value) =>
                updateFilter('hasService', value as CustomerFilters['hasService'])
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="service-all" />
                <Label htmlFor="service-all" className="font-normal">Todos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="has" id="service-has" />
                <Label htmlFor="service-has" className="font-normal">Fez algum serviço</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="never" id="service-never" />
                <Label htmlFor="service-never" className="font-normal">Nunca fez serviço</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Última visita */}
          <div className="space-y-2">
            <Label>Última visita</Label>
            <RadioGroup
              value={filters.lastVisitMode}
              onValueChange={(value) =>
                updateFilter('lastVisitMode', value as CustomerFilters['lastVisitMode'])
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="visit-all" />
                <Label htmlFor="visit-all" className="font-normal">Todos</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="recent" id="visit-recent" />
                <Label htmlFor="visit-recent" className="font-normal">Nos últimos</Label>
                {filters.lastVisitMode === 'recent' && (
                  <Input
                    type="number"
                    value={filters.lastVisitDays ?? ''}
                    onChange={(e) =>
                      updateFilter('lastVisitDays', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="30"
                    className="w-16 h-8"
                  />
                )}
                {filters.lastVisitMode === 'recent' && <span className="text-sm">dias</span>}
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="period" id="visit-period" />
                <Label htmlFor="visit-period" className="font-normal">Período específico</Label>
              </div>
            </RadioGroup>

            {filters.lastVisitMode === 'period' && (
              <div className="flex items-center gap-2 mt-2">
                <Input
                  type="date"
                  value={filters.lastVisitFrom?.toISOString().split('T')[0] ?? ''}
                  onChange={(e) =>
                    updateFilter('lastVisitFrom', e.target.value ? new Date(e.target.value) : null)
                  }
                />
                <span>até</span>
                <Input
                  type="date"
                  value={filters.lastVisitTo?.toISOString().split('T')[0] ?? ''}
                  onChange={(e) =>
                    updateFilter('lastVisitTo', e.target.value ? new Date(e.target.value) : null)
                  }
                />
              </div>
            )}
          </div>

          {/* Sem agendamento futuro */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="no-future"
                checked={filters.noFutureAppointment}
                onCheckedChange={(checked) =>
                  updateFilter('noFutureAppointment', !!checked)
                }
              />
              <Label htmlFor="no-future" className="font-normal">
                Sem agendamento futuro
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Clientes que não têm agendamentos confirmados
            </p>
          </div>

          {/* Botão aplicar */}
          <div className="flex items-end">
            <Button onClick={onApply} className="w-full">
              Aplicar Filtros
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
