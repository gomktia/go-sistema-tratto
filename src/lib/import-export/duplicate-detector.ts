import type { Customer } from '@/types/customer'
import type { DuplicateCheckResult } from '@/types/import'
import { normalizeCPF, normalizeEmail, normalizePhone } from './validators'

/**
 * Detecção hierárquica de duplicatas para clientes:
 * 1. CPF (se presente) → chave forte
 * 2. Email normalizado (fallback se sem CPF)
 * 3. Telefone normalizado → apenas sugestão, pede confirmação
 */
export async function checkCustomerDuplicate(
  customer: any,
  existingCustomers: any[]
): Promise<DuplicateCheckResult> {
  const cpf = customer.document ? normalizeCPF(customer.document) : null
  const email = customer.email ? normalizeEmail(customer.email) : null
  const phone = customer.phone ? normalizePhone(customer.phone) : null

  // 1. Verificar CPF (chave forte)
  if (cpf && cpf.length === 11) {
    const duplicateByCPF = existingCustomers.find(
      (c) => c.document && normalizeCPF(c.document) === cpf
    )

    if (duplicateByCPF) {
      return {
        isDuplicate: true,
        matchType: 'cpf',
        existingRecord: duplicateByCPF
      }
    }
  }

  // 2. Verificar Email (fallback)
  if (email && email.includes('@')) {
    const duplicateByEmail = existingCustomers.find(
      (c) => c.email && normalizeEmail(c.email) === email
    )

    if (duplicateByEmail) {
      return {
        isDuplicate: true,
        matchType: 'email',
        existingRecord: duplicateByEmail
      }
    }
  }

  // 3. Verificar Telefone (apenas sugestão)
  if (phone) {
    const duplicateByPhone = existingCustomers.find(
      (c) => c.phone && normalizePhone(c.phone) === phone
    )

    if (duplicateByPhone) {
      return {
        isDuplicate: true,
        matchType: 'telefone',
        existingRecord: duplicateByPhone
      }
    }
  }

  return {
    isDuplicate: false
  }
}

/**
 * Verifica duplicata de serviço por nome
 */
export async function checkServiceDuplicate(
  service: any,
  existingServices: any[]
): Promise<DuplicateCheckResult> {
  const normalizedName = service.name?.toLowerCase().trim()

  if (!normalizedName) {
    return { isDuplicate: false }
  }

  const duplicate = existingServices.find(
    (s) => s.name?.toLowerCase().trim() === normalizedName
  )

  if (duplicate) {
    return {
      isDuplicate: true,
      matchType: 'cpf', // usando cpf como tipo genérico para "chave forte"
      existingRecord: duplicate
    }
  }

  return {
    isDuplicate: false
  }
}

/**
 * Verifica duplicata de profissional por email
 */
export async function checkEmployeeDuplicate(
  employee: any,
  existingEmployees: any[]
): Promise<DuplicateCheckResult> {
  const email = employee.email ? normalizeEmail(employee.email) : null

  if (!email) {
    return { isDuplicate: false }
  }

  const duplicate = existingEmployees.find(
    (e) => e.email && normalizeEmail(e.email) === email
  )

  if (duplicate) {
    return {
      isDuplicate: true,
      matchType: 'email',
      existingRecord: duplicate
    }
  }

  return {
    isDuplicate: false
  }
}
