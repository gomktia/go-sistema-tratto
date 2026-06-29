'use client'

import { useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { ImportEntityType } from '@/types/import'

import { exportToCSV } from '@/lib/import-export/csv-parser'
import { exportToXLSX } from '@/lib/import-export/xlsx-parser'
import {
  customerToTrinksFormat,
  serviceToTrinksFormat,
  employeeToTrinksFormat
} from '@/lib/import-export/transformers'

export function useExport(tenantId: string) {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = getSupabaseBrowserClient()

  /**
   * Exporta para CSV
   */
  const exportToCsv = async (type: ImportEntityType): Promise<void> => {
    if (!supabase) {
      setError('Erro de configuração do Supabase')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      let data: any[] = []
      let headers: string[] = []
      let filename = ''

      if (type === 'clientes') {
        const { data: customers, error: fetchError } = await supabase
          .from('customers')
          .select('*')
          .eq('tenant_id', tenantId)

        if (fetchError) throw fetchError

        data = (customers || []).map(customerToTrinksFormat)
        headers = [
          'CPF',
          'Origem',
          'Nome',
          'Telefone 1',
          'E-mail',
          'Data de Nascimento',
          'Observações',
          'Pontos de Fidelidade',
          'CEP',
          'Estado',
          'Endereço',
          'Número',
          'Complemento',
          'Bairro',
          'Cidade'
        ]
        filename = `clientes_${new Date().toISOString().split('T')[0]}.csv`
      } else if (type === 'servicos') {
        const { data: services, error: fetchError } = await supabase
          .from('services')
          .select('*')
          .eq('tenant_id', tenantId)

        if (fetchError) throw fetchError

        data = (services || []).map(serviceToTrinksFormat)
        headers = [
          'Nome',
          'Descrição',
          'Duração',
          'Categoria',
          'Tipo de Preço',
          'Preço Padrão',
          'Preço Promocional'
        ]
        filename = `servicos_${new Date().toISOString().split('T')[0]}.csv`
      } else if (type === 'profissionais') {
        const { data: employees, error: fetchError } = await supabase
          .from('employees')
          .select('*')
          .eq('tenant_id', tenantId)

        if (fetchError) throw fetchError

        data = (employees || []).map(employeeToTrinksFormat)
        headers = [
          'Nome completo',
          'Apelido',
          'Email',
          'Telefones',
          'CPF',
          'Função',
          'Status',
          'Possui agenda',
          'Data de nascimento',
          'Data Inicio',
          'Forma relação profissional',
          'Administrador'
        ]
        filename = `profissionais_${new Date().toISOString().split('T')[0]}.csv`
      }

      exportToCSV(data, headers, filename)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsExporting(false)
    }
  }

  /**
   * Exporta para XLSX
   */
  const exportToXlsx = async (type: ImportEntityType): Promise<void> => {
    if (!supabase) {
      setError('Erro de configuração do Supabase')
      return
    }

    setIsExporting(true)
    setError(null)

    try {
      let data: any[] = []
      let headers: string[] = []
      let filename = ''

      if (type === 'clientes') {
        const { data: customers, error: fetchError } = await supabase
          .from('customers')
          .select('*')
          .eq('tenant_id', tenantId)

        if (fetchError) throw fetchError

        data = (customers || []).map(customerToTrinksFormat)
        headers = [
          'CPF',
          'Origem',
          'Nome',
          'Telefone 1',
          'E-mail',
          'Data de Nascimento',
          'Observações',
          'Pontos de Fidelidade',
          'CEP',
          'Estado',
          'Endereço',
          'Número',
          'Complemento',
          'Bairro',
          'Cidade'
        ]
        filename = `clientes_${new Date().toISOString().split('T')[0]}.xlsx`
      } else if (type === 'servicos') {
        const { data: services, error: fetchError } = await supabase
          .from('services')
          .select('*')
          .eq('tenant_id', tenantId)

        if (fetchError) throw fetchError

        data = (services || []).map(serviceToTrinksFormat)
        headers = [
          'Nome',
          'Descrição',
          'Duração',
          'Categoria',
          'Tipo de Preço',
          'Preço Padrão',
          'Preço Promocional'
        ]
        filename = `servicos_${new Date().toISOString().split('T')[0]}.xlsx`
      } else if (type === 'profissionais') {
        const { data: employees, error: fetchError } = await supabase
          .from('employees')
          .select('*')
          .eq('tenant_id', tenantId)

        if (fetchError) throw fetchError

        data = (employees || []).map(employeeToTrinksFormat)
        headers = [
          'Nome completo',
          'Apelido',
          'Email',
          'Telefones',
          'CPF',
          'Função',
          'Status',
          'Possui agenda',
          'Data de nascimento',
          'Data Inicio',
          'Forma relação profissional',
          'Administrador'
        ]
        filename = `profissionais_${new Date().toISOString().split('T')[0]}.xlsx`
      }

      exportToXLSX(data, headers, filename)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsExporting(false)
    }
  }

  return {
    isExporting,
    error,
    exportToCsv,
    exportToXlsx
  }
}
