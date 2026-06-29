'use client'

import { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import type { ImportEntityType, ImportRowAction } from '@/types/import'
import { useImport } from '@/hooks/useImport'
import { PreviewTable } from './PreviewTable'

interface ImportWizardProps {
  tenantId: string
  type: ImportEntityType
  onClose: () => void
  onComplete: () => void
}

export function ImportWizard({ tenantId, type, onClose, onComplete }: ImportWizardProps) {
  const [step, setStep] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    session,
    isProcessing,
    error,
    parseFile,
    detectDuplicates,
    executeImport,
    updateRowAction,
    reset
  } = useImport(tenantId)

  const typeLabels = {
    clientes: 'Clientes',
    servicos: 'Serviços',
    profissionais: 'Profissionais'
  }

  const handleFileSelect = async (file: File | null) => {
    console.log('📁 File selected:', file?.name)
    if (!file) {
      console.log('❌ No file selected')
      return
    }

    try {
      console.log('⏳ Starting parse...')
      setStep(2) // Mostrar loading
      await parseFile(file, type)
      console.log('✅ Parse done, starting duplicate detection...')
      // Chamar detectDuplicates passando file e type diretamente
      await detectDuplicates(file, type)
      console.log('✅ Duplicate detection done, waiting for state update...')
      // Aguardar state update antes de ir pro preview
      setTimeout(() => {
        console.log('📊 Setting step 3')
        setStep(3)
      }, 500)
    } catch (err) {
      console.error('❌ Error in handleFileSelect:', err)
    }
  }

  const handleNext = async () => {
    if (step === 2) {
      await detectDuplicates()
      setTimeout(() => setStep(3), 500)
    } else if (step === 3) {
      console.log('🎬 User clicked Confirmar, executing import...')
      await executeImport()
      setTimeout(() => setStep(4), 500)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleComplete = () => {
    reset()
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Importar {typeLabels[type]}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1 && 'Selecione o arquivo para importar'}
              {step === 2 && 'Processando arquivo...'}
              {step === 3 && 'Revise e confirme os dados'}
              {step === 4 && 'Importação concluída'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s < step
                      ? 'bg-green-500 text-white'
                      : s === step
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? <CheckCircle2 className="h-5 w-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`h-1 w-16 mx-2 ${
                      s < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900">Erro</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="max-w-2xl mx-auto">
              <div
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-indigo-400 transition-colors"
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  const file = e.dataTransfer.files?.[0]
                  if (file) {
                    console.log('📦 File dropped:', file.name)
                    handleFileSelect(file)
                  }
                }}
              >
                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Arraste um arquivo CSV ou XLSX aqui
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Ou clique no botão abaixo para selecionar
                </p>
                <div className="relative inline-block">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      console.log('📄 File selected!', e.target.files?.[0]?.name)
                      handleFileSelect(e.target.files?.[0] || null)
                    }}
                  />
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer transition-colors pointer-events-none">
                    <Upload className="h-4 w-4" />
                    Escolher arquivo
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Formato esperado:
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {type === 'clientes' && (
                    <>
                      <li>• Colunas: CPF, Nome, Telefone 1, E-mail</li>
                      <li>• O arquivo do Trinks tem 6 linhas de cabeçalho (serão ignoradas automaticamente)</li>
                    </>
                  )}
                  {type === 'servicos' && (
                    <>
                      <li>• Colunas: Nome, Descrição, Duração, Preço Padrão</li>
                      <li>• Duração no formato: "1h", "60 min", "1h e 30 min"</li>
                    </>
                  )}
                  {type === 'profissionais' && (
                    <>
                      <li>• Colunas: Nome completo, Email, Telefones, Função</li>
                      <li>• Status: "Ativo" ou "Inativo"</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Processing */}
          {step === 2 && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Processando arquivo...
              </h3>
              <p className="text-sm text-gray-500">
                Aguarde enquanto analisamos os dados e verificamos duplicatas
              </p>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 3 && session && (
            <div>
              <div className="mb-6 grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {session.summary.total}
                  </div>
                  <div className="text-sm text-gray-600">Total de linhas</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-900">
                    {session.summary.novos}
                  </div>
                  <div className="text-sm text-green-600">Novos registros</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-900">
                    {session.summary.duplicados}
                  </div>
                  <div className="text-sm text-yellow-600">Duplicados</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-900">
                    {session.summary.erros}
                  </div>
                  <div className="text-sm text-red-600">Com erros</div>
                </div>
              </div>

              <PreviewTable
                rows={session.rows}
                type={type}
                onActionChange={updateRowAction}
              />
            </div>
          )}

          {/* Step 4: Complete */}
          {step === 4 && session && (
            <div className="max-w-2xl mx-auto text-center py-12">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Importação concluída!
              </h3>
              <p className="text-gray-600 mb-8">
                Os dados foram importados com sucesso
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-900">
                    {session.summary.importados || 0}
                  </div>
                  <div className="text-sm text-green-600">Importados</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-3xl font-bold text-blue-900">
                    {session.summary.atualizados || 0}
                  </div>
                  <div className="text-sm text-blue-600">Atualizados</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-3">
            {step === 3 && (
              <button
                onClick={handleNext}
                disabled={isProcessing}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar e Importar
              </button>
            )}

            {step === 4 && (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Concluir
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
