'use client'

import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type {
  ImportSession,
  ImportEntityType,
  ImportRow,
  ImportRowStatus,
  ImportRowAction,
  ParsedData
} from '@/types/import'

import { parseCSV, detectTrinksFormat } from '@/lib/import-export/csv-parser'
import { parseXLSX } from '@/lib/import-export/xlsx-parser'
import {
  transformCustomerRow,
  transformServiceRow,
  transformEmployeeRow
} from '@/lib/import-export/transformers'
import {
  validateCustomer,
  validateService,
  validateEmployee
} from '@/lib/import-export/validators'
import {
  checkCustomerDuplicate,
  checkServiceDuplicate,
  checkEmployeeDuplicate
} from '@/lib/import-export/duplicate-detector'

export function useImport(tenantId: string) {
  const [session, setSession] = useState<ImportSession | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  /**
   * Parse arquivo e detecta tipo
   */
  const parseFile = async (
    file: File,
    type?: ImportEntityType
  ): Promise<void> => {
    setIsProcessing(true)
    setError(null)

    try {
      let parsedData: ParsedData

      // Detectar formato por extensão
      const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')

      if (isXLSX) {
        parsedData = await parseXLSX(file, type || 'clientes')
      } else {
        parsedData = await parseCSV(file, type || 'clientes')
      }

      // Auto-detectar tipo se não foi especificado
      let detectedType = type
      if (!detectedType) {
        detectedType = detectTrinksFormat(parsedData.headers)
        if (!detectedType) {
          throw new Error(
            'Não foi possível detectar o tipo de arquivo. Por favor, especifique manualmente.'
          )
        }
      }

      // Criar sessão inicial
      const newSession: ImportSession = {
        file,
        type: detectedType,
        rows: [],
        summary: {
          total: parsedData.rows.length,
          novos: 0,
          duplicados: 0,
          erros: 0
        }
      }

      setSession(newSession)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Detecta duplicatas e valida dados
   */
  const detectDuplicates = async (
    fileParam?: File,
    typeParam?: ImportEntityType
  ): Promise<void> => {
    // Se receber parâmetros, usar eles. Senão, pegar do session
    const file = fileParam || session?.file
    const type = typeParam || session?.type

    console.log('🔍 detectDuplicates START', { file: file?.name, type, hasSession: !!session })

    if (!file || !type) {
      console.log('❌ Missing file or type, aborting')
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      console.log('📝 Processing type:', type, 'file:', file.name)

      // Re-parse arquivo
      const isXLSX = file.name.endsWith('.xlsx') || file.name.endsWith('.xls')
      const parsedData = isXLSX
        ? await parseXLSX(file, type)
        : await parseCSV(file, type)

      console.log('📊 Parsed data:', { headers: parsedData.headers, rowCount: parsedData.rows.length })

      // Buscar registros existentes
      let existingRecords: any[] = []

      if (type === 'clientes') {
        const { data } = await supabase
          .from('customers')
          .select('*')
          .eq('tenant_id', tenantId)
        existingRecords = data || []
        console.log('📦 Existing customers:', existingRecords.length)
      } else if (type === 'servicos') {
        const { data } = await supabase
          .from('services')
          .select('*')
          .eq('tenant_id', tenantId)
        existingRecords = data || []
      } else if (type === 'profissionais') {
        const { data } = await supabase
          .from('employees')
          .select('*')
          .eq('tenant_id', tenantId)
        existingRecords = data || []
      }

      // Processar cada linha
      const rows: ImportRow[] = []
      let novos = 0
      let duplicados = 0
      let erros = 0

      for (let i = 0; i < parsedData.rows.length; i++) {
        const rawRow = parsedData.rows[i]

        // Transformar dados
        let transformedData: any
        if (type === 'clientes') {
          transformedData = transformCustomerRow(rawRow, tenantId)
        } else if (type === 'servicos') {
          transformedData = transformServiceRow(rawRow, tenantId)
        } else {
          transformedData = transformEmployeeRow(rawRow, tenantId)
        }

        // Validar
        let validation
        if (type === 'clientes') {
          validation = validateCustomer(transformedData)
        } else if (type === 'servicos') {
          validation = validateService(transformedData)
        } else {
          validation = validateEmployee(transformedData)
        }

        // Verificar duplicata
        let duplicateCheck
        if (type === 'clientes') {
          duplicateCheck = await checkCustomerDuplicate(
            transformedData,
            existingRecords
          )
        } else if (type === 'servicos') {
          duplicateCheck = await checkServiceDuplicate(
            transformedData,
            existingRecords
          )
        } else {
          duplicateCheck = await checkEmployeeDuplicate(
            transformedData,
            existingRecords
          )
        }

        // Determinar status e ação padrão
        let status: ImportRowStatus
        let action: ImportRowAction

        if (!validation.isValid) {
          status = 'erro'
          action = 'pular'
          erros++
        } else if (duplicateCheck.isDuplicate) {
          if (duplicateCheck.matchType === 'cpf' || duplicateCheck.matchType === 'email') {
            status =
              duplicateCheck.matchType === 'cpf' ? 'duplicado_cpf' : 'duplicado_email'
            action = 'atualizar'
          } else {
            status = 'possivel_duplicado_telefone'
            action = 'pular'
          }
          duplicados++
        } else {
          status = 'novo'
          action = 'importar'
          novos++
        }

        rows.push({
          row: i + 1,
          status,
          action,
          data: transformedData,
          errors: validation.errors,
          duplicateOf: duplicateCheck.existingRecord?.id,
          duplicateMatch: duplicateCheck.isDuplicate
            ? {
                type: duplicateCheck.matchType!,
                existingRecord: duplicateCheck.existingRecord
              }
            : undefined
        })
      }

      // Atualizar sessão
      console.log('💾 Setting session with rows:', {
        rowCount: rows.length,
        novos,
        duplicados,
        erros
      })

      const newSession: ImportSession = {
        file,
        type,
        rows,
        summary: {
          total: parsedData.rows.length,
          novos,
          duplicados,
          erros
        }
      }

      setSession(newSession)
      console.log('✅ Session updated!', newSession)
    } catch (err) {
      console.error('❌ Error in detectDuplicates:', err)
      setError((err as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Executa importação com base nas ações selecionadas
   */
  const executeImport = async (): Promise<void> => {
    if (!session) return

    setIsProcessing(true)
    setError(null)

    try {
      const { type, rows } = session

      console.log('🚀 executeImport:', { type, totalRows: rows.length })

      let importados = 0
      let atualizados = 0
      let pulados = 0
      let errosProcessamento = 0

      for (const row of rows) {
        console.log('Processing row:', { action: row.action, data: row.data })

        if (row.action === 'pular') {
          pulados++
          continue
        }

        try {
          if (type === 'clientes') {
            if (row.action === 'importar') {
              console.log('Inserting customer:', row.data)
              const { data: inserted, error: insertError } = await supabase
                .from('customers')
                .insert(row.data)
                .select()

              if (insertError) {
                console.error('Insert error:', insertError)
                throw insertError
              }
              console.log('✅ Inserted:', inserted)
              importados++
            } else if (row.action === 'atualizar' && row.duplicateOf) {
              console.log('Updating customer:', row.duplicateOf, row.data)
              const { error: updateError } = await supabase
                .from('customers')
                .update(row.data)
                .eq('id', row.duplicateOf)

              if (updateError) {
                console.error('Update error:', updateError)
                throw updateError
              }
              atualizados++
            }
          } else if (type === 'servicos') {
            if (row.action === 'importar') {
              const { error: insertError } = await supabase
                .from('services')
                .insert(row.data)

              if (insertError) throw insertError
              importados++
            } else if (row.action === 'atualizar' && row.duplicateOf) {
              const { error: updateError } = await supabase
                .from('services')
                .update(row.data)
                .eq('id', row.duplicateOf)

              if (updateError) throw updateError
              atualizados++
            }
          } else if (type === 'profissionais') {
            if (row.action === 'importar') {
              const { error: insertError } = await supabase
                .from('employees')
                .insert(row.data)

              if (insertError) throw insertError
              importados++
            } else if (row.action === 'atualizar' && row.duplicateOf) {
              const { error: updateError } = await supabase
                .from('employees')
                .update(row.data)
                .eq('id', row.duplicateOf)

              if (updateError) throw updateError
              atualizados++
            }
          }
        } catch (err) {
          console.error(`Erro ao processar linha ${row.row}:`, err)
          errosProcessamento++
        }
      }

      // Atualizar summary
      setSession({
        ...session,
        summary: {
          ...session.summary,
          importados,
          atualizados,
          pulados,
          processados: importados + atualizados + pulados + errosProcessamento
        }
      })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Atualiza ação de uma linha específica
   */
  const updateRowAction = (rowIndex: number, action: ImportRowAction): void => {
    if (!session) return

    const updatedRows = [...session.rows]
    updatedRows[rowIndex].action = action

    setSession({
      ...session,
      rows: updatedRows
    })
  }

  /**
   * Reseta sessão
   */
  const reset = (): void => {
    setSession(null)
    setError(null)
    setIsProcessing(false)
  }

  return {
    session,
    isProcessing,
    error,
    parseFile,
    detectDuplicates,
    executeImport,
    updateRowAction,
    reset
  }
}
