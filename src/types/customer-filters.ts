export interface CustomerFilters {
  // Busca geral
  search: string

  // Gênero
  gender: 'all' | 'male' | 'female' | 'not_informed'

  // Idade
  ageMin: number | null
  ageMax: number | null

  // Serviços
  hasService: 'all' | 'has' | 'never'

  // Última visita
  lastVisitMode: 'all' | 'recent' | 'period'
  lastVisitDays: number | null
  lastVisitFrom: Date | null
  lastVisitTo: Date | null

  // Sem agendamento futuro
  noFutureAppointment: boolean
}

export const DEFAULT_FILTERS: CustomerFilters = {
  search: '',
  gender: 'all',
  ageMin: null,
  ageMax: null,
  hasService: 'all',
  lastVisitMode: 'all',
  lastVisitDays: null,
  lastVisitFrom: null,
  lastVisitTo: null,
  noFutureAppointment: false
}

export function getActiveFilterCount(filters: CustomerFilters): number {
  let count = 0
  if (filters.search) count++
  if (filters.gender !== 'all') count++
  if (filters.ageMin !== null || filters.ageMax !== null) count++
  if (filters.hasService !== 'all') count++
  if (filters.lastVisitMode !== 'all') count++
  if (filters.noFutureAppointment) count++
  return count
}
