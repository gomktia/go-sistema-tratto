import type { ValidationResult } from '@/types/import'

/**
 * Normaliza CPF removendo formatação
 * 123.456.789-00 → 12345678900
 */
export function normalizeCPF(cpf: string | null | undefined): string {
  if (!cpf) return ''
  return cpf.replace(/[^\d]/g, '')
}

/**
 * Valida CPF usando algoritmo de dígitos verificadores
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = normalizeCPF(cpf)
  if (cleaned.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleaned)) return false // todos iguais

  let sum = 0
  let remainder: number

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleaned.substring(10, 11))) return false

  return true
}

/**
 * Normaliza telefone removendo formatação
 * (55) 99137-9412 → 55991379412
 */
export function normalizePhone(phone: string | null | undefined): string {
  if (!phone) return ''
  return phone.replace(/[^\d]/g, '')
}

/**
 * Normaliza email
 */
export function normalizeEmail(email: string | null | undefined): string {
  if (!email) return ''
  return email.toLowerCase().trim()
}

/**
 * Valida formato de email básico
 */
export function validateEmail(email: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Converte data do formato Trinks (dd/mm/yyyy) para ISO (yyyy-mm-dd)
 */
export function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null

  const parts = dateStr.split('/')
  if (parts.length !== 3) return null

  const [day, month, year] = parts
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

  if (isNaN(date.getTime())) return null

  return date.toISOString().split('T')[0]
}

/**
 * Converte duração do formato Trinks para minutos
 * "3h" → 180
 * "60 min" → 60
 * "1h e 20 min" → 80
 */
export function parseDuration(durationStr: string | null | undefined): number | null {
  if (!durationStr) return null

  const hourMatch = durationStr.match(/(\d+)\s*h/)
  const minMatch = durationStr.match(/(\d+)\s*min/)

  let minutes = 0

  if (hourMatch) {
    minutes += parseInt(hourMatch[1]) * 60
  }

  if (minMatch) {
    minutes += parseInt(minMatch[1])
  }

  return minutes > 0 ? minutes : null
}

/**
 * Converte preço do formato Trinks (200,00) para float
 */
export function parsePrice(priceStr: string | null | undefined): number | null {
  if (!priceStr) return null

  const cleaned = priceStr.replace(/[^\d,]/g, '').replace(',', '.')
  const price = parseFloat(cleaned)

  return isNaN(price) ? null : price
}

/**
 * Valida campos obrigatórios de Cliente
 */
export function validateCustomer(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.full_name || data.full_name.trim() === '') {
    errors.push('Nome é obrigatório')
  }

  if (!data.phone || data.phone.trim() === '') {
    errors.push('Telefone é obrigatório')
  }

  if (data.document && !validateCPF(data.document)) {
    errors.push('CPF inválido')
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push('Email inválido')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida campos obrigatórios de Serviço
 */
export function validateService(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.name || data.name.trim() === '') {
    errors.push('Nome é obrigatório')
  }

  if (!data.durationMinutes || data.durationMinutes <= 0) {
    errors.push('Duração é obrigatória e deve ser maior que 0')
  }

  if (!data.price || data.price < 0) {
    errors.push('Preço é obrigatório e não pode ser negativo')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Valida campos obrigatórios de Profissional
 */
export function validateEmployee(data: any): ValidationResult {
  const errors: string[] = []

  if (!data.fullName || data.fullName.trim() === '') {
    errors.push('Nome completo é obrigatório')
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Email válido é obrigatório')
  }

  if (!data.phone || data.phone.trim() === '') {
    errors.push('Telefone é obrigatório')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
