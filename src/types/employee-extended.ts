// Tipos estendidos para funcionalidades avançadas de profissionais

export type UnavailabilityReason = 'ferias' | 'folga' | 'atestado' | 'bloqueio_manual'

export interface EmployeeUnavailability {
  id: string
  tenantId: string
  employeeId: string
  reason: UnavailabilityReason
  startDate: string  // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
  allDay: boolean
  startTime?: string // HH:MM (se allDay = false)
  endTime?: string   // HH:MM (se allDay = false)
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeUnavailabilityInput {
  reason: UnavailabilityReason
  startDate: string
  endDate: string
  allDay: boolean
  startTime?: string
  endTime?: string
  notes?: string
}

export interface UpdateEmployeeUnavailabilityInput {
  reason?: UnavailabilityReason
  startDate?: string
  endDate?: string
  allDay?: boolean
  startTime?: string
  endTime?: string
  notes?: string
}

export interface EmployeeServiceCommission {
  id: string
  tenantId: string
  employeeId: string
  serviceId: string
  serviceName?: string // populated via join
  commissionRate: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface CreateEmployeeServiceCommissionInput {
  serviceId: string
  commissionRate: number
  notes?: string
}

export interface UpdateEmployeeServiceCommissionInput {
  commissionRate?: number
  notes?: string
}

// Helper para labels de tipos de bloqueio
export const unavailabilityReasonLabels: Record<UnavailabilityReason, string> = {
  ferias: 'Férias',
  folga: 'Folga',
  atestado: 'Atestado Médico',
  bloqueio_manual: 'Bloqueio Manual'
}

// Helper para cores por tipo de bloqueio
export const unavailabilityReasonColors: Record<UnavailabilityReason, string> = {
  ferias: 'blue',
  folga: 'green',
  atestado: 'red',
  bloqueio_manual: 'gray'
}
