'use client'

import { useState } from 'react'
import { Download, Upload, ChevronDown } from 'lucide-react'
import type { ImportEntityType } from '@/types/import'
import { useExport } from '@/hooks/useExport'
import { ImportWizard } from './ImportWizard'

interface ImportExportButtonProps {
  tenantId: string
  type: ImportEntityType
  onImportComplete?: () => void
}

export function ImportExportButton({
  tenantId,
  type,
  onImportComplete
}: ImportExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showImportWizard, setShowImportWizard] = useState(false)
  const { isExporting, exportToCsv, exportToXlsx } = useExport(tenantId)

  const handleExportCSV = async () => {
    setShowMenu(false)
    await exportToCsv(type)
  }

  const handleExportXLSX = async () => {
    setShowMenu(false)
    await exportToXlsx(type)
  }

  const handleImport = () => {
    setShowMenu(false)
    setShowImportWizard(true)
  }

  const handleImportComplete = () => {
    setShowImportWizard(false)
    onImportComplete?.()
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="h-4 w-4" />
          <span>Importar/Exportar</span>
          <ChevronDown className="h-4 w-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
              <div className="py-1">
                <button
                  onClick={handleImport}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700"
                >
                  <Upload className="h-4 w-4 text-gray-400" />
                  Importar dados
                </button>

                <div className="border-t border-gray-100 my-1" />

                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Exportar
                </div>

                <button
                  onClick={handleExportCSV}
                  disabled={isExporting}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700 disabled:opacity-50"
                >
                  <Download className="h-4 w-4 text-gray-400" />
                  Exportar CSV
                </button>

                <button
                  onClick={handleExportXLSX}
                  disabled={isExporting}
                  className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm text-gray-700 disabled:opacity-50"
                >
                  <Download className="h-4 w-4 text-gray-400" />
                  Exportar XLSX
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {showImportWizard && (
        <ImportWizard
          tenantId={tenantId}
          type={type}
          onClose={() => setShowImportWizard(false)}
          onComplete={handleImportComplete}
        />
      )}
    </>
  )
}
