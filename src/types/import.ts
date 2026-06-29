import type { Customer } from '@/types/customer'
import type { ServiceRecord } from '@/types/service'
import type { EmployeeRecord } from '@/types/employee'

export type ImportEntityType = 'clientes' | 'servicos' | 'profissionais'

export type ImportRowStatus =
  | 'novo'
  | 'duplicado_cpf'
  | 'duplicado_email'
  | 'possivel_duplicado_telefone'
  | 'erro'

export type ImportRowAction = 'importar' | 'atualizar' | 'pular'

export interface ImportRow {
  row: number
  status: ImportRowStatus
  action: ImportRowAction
  data: Partial<Customer | ServiceRecord | EmployeeRecord>
  errors: string[]
  duplicateOf?: string
  duplicateMatch?: {
    type: 'cpf' | 'email' | 'telefone'
    existingRecord: Partial<Customer | ServiceRecord | EmployeeRecord>
  }
}

export interface ImportSummary {
  total: number
  novos: number
  duplicados: number
  erros: number
  processados?: number
  importados?: number
  atualizados?: number
  pulados?: number
}

export interface ImportSession {
  file: File
  type: ImportEntityType
  rows: ImportRow[]
  summary: ImportSummary
}

export interface ColumnMapping {
  [sourceColumn: string]: string // maps source column to target field
}

export interface ParsedData {
  headers: string[]
  rows: any[]
  encoding?: string
  delimiter?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export interface DuplicateCheckResult {
  isDuplicate: boolean
  matchType?: 'cpf' | 'email' | 'telefone'
  existingRecord?: any
}
