'use client'

import { AlertCircle, CheckCircle2, AlertTriangle, Plus, RefreshCw, SkipForward } from 'lucide-react'
import type { ImportRow, ImportEntityType, ImportRowAction } from '@/types/import'

interface PreviewTableProps {
  rows: ImportRow[]
  type: ImportEntityType
  onActionChange: (rowIndex: number, action: ImportRowAction) => void
}

export function PreviewTable({ rows, type, onActionChange }: PreviewTableProps) {
  const getStatusBadge = (status: ImportRow['status']) => {
    switch (status) {
      case 'novo':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Novo
          </div>
        )
      case 'duplicado_cpf':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-medium">
            <AlertTriangle className="h-3.5 w-3.5" />
            Duplicado (CPF)
          </div>
        )
      case 'duplicado_email':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-md text-xs font-medium">
            <AlertTriangle className="h-3.5 w-3.5" />
            Duplicado (Email)
          </div>
        )
      case 'possivel_duplicado_telefone':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
            <AlertTriangle className="h-3.5 w-3.5" />
            Possível duplicado
          </div>
        )
      case 'erro':
        return (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium">
            <AlertCircle className="h-3.5 w-3.5" />
            Erro
          </div>
        )
    }
  }

  const getActionIcon = (action: ImportRowAction) => {
    switch (action) {
      case 'importar':
        return <Plus className="h-3.5 w-3.5" />
      case 'atualizar':
        return <RefreshCw className="h-3.5 w-3.5" />
      case 'pular':
        return <SkipForward className="h-3.5 w-3.5" />
    }
  }

  const getActionLabel = (action: ImportRowAction) => {
    switch (action) {
      case 'importar':
        return 'Importar como novo'
      case 'atualizar':
        return 'Atualizar existente'
      case 'pular':
        return 'Pular'
    }
  }

  const getAvailableActions = (row: ImportRow): ImportRowAction[] => {
    if (row.status === 'erro') {
      return ['pular']
    }

    if (row.status === 'novo') {
      return ['importar', 'pular']
    }

    if (row.status === 'duplicado_cpf' || row.status === 'duplicado_email') {
      return ['atualizar', 'pular', 'importar']
    }

    if (row.status === 'possivel_duplicado_telefone') {
      return ['pular', 'atualizar', 'importar']
    }

    return ['importar', 'pular']
  }

  const renderRowData = (row: ImportRow) => {
    const data = row.data as any

    if (type === 'clientes') {
      return (
        <>
          <td className="px-4 py-3 text-sm text-gray-900">{data.name}</td>
          <td className="px-4 py-3 text-sm text-gray-600">{data.phone}</td>
          <td className="px-4 py-3 text-sm text-gray-600">{data.cpf || '-'}</td>
          <td className="px-4 py-3 text-sm text-gray-600">{data.email || '-'}</td>
        </>
      )
    }

    if (type === 'servicos') {
      return (
        <>
          <td className="px-4 py-3 text-sm text-gray-900">{data.name}</td>
          <td className="px-4 py-3 text-sm text-gray-600">
            {data.durationMinutes} min
          </td>
          <td className="px-4 py-3 text-sm text-gray-600">
            R$ {data.price?.toFixed(2)}
          </td>
        </>
      )
    }

    if (type === 'profissionais') {
      return (
        <>
          <td className="px-4 py-3 text-sm text-gray-900">{data.fullName}</td>
          <td className="px-4 py-3 text-sm text-gray-600">{data.email}</td>
          <td className="px-4 py-3 text-sm text-gray-600">{data.phone}</td>
          <td className="px-4 py-3 text-sm text-gray-600">{data.role}</td>
        </>
      )
    }

    return null
  }

  const renderTableHeaders = () => {
    if (type === 'clientes') {
      return (
        <>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Nome
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Telefone
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            CPF
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Email
          </th>
        </>
      )
    }

    if (type === 'servicos') {
      return (
        <>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Nome
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Duração
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Preço
          </th>
        </>
      )
    }

    if (type === 'profissionais') {
      return (
        <>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Nome
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Email
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Telefone
          </th>
          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Função
          </th>
        </>
      )
    }

    return null
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto max-h-[500px]">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-12">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              {renderTableHeaders()}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-48">
                Ação
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.map((row, index) => (
              <tr
                key={index}
                className={`hover:bg-gray-50 ${
                  row.status === 'erro' ? 'bg-red-50' : ''
                }`}
              >
                <td className="px-4 py-3 text-sm text-gray-500">{row.row}</td>
                <td className="px-4 py-3">{getStatusBadge(row.status)}</td>
                {renderRowData(row)}
                <td className="px-4 py-3">
                  <select
                    value={row.action}
                    onChange={(e) =>
                      onActionChange(index, e.target.value as ImportRowAction)
                    }
                    disabled={row.status === 'erro'}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    {getAvailableActions(row).map((action) => (
                      <option key={action} value={action}>
                        {getActionLabel(action)}
                      </option>
                    ))}
                  </select>
                  {row.errors.length > 0 && (
                    <div className="mt-1 text-xs text-red-600">
                      {row.errors.join(', ')}
                    </div>
                  )}
                  {row.duplicateMatch && (
                    <div className="mt-1 text-xs text-yellow-600">
                      Encontrado: {row.duplicateMatch.existingRecord?.name ||
                        row.duplicateMatch.existingRecord?.fullName ||
                        'Registro existente'}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
