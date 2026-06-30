import type { CustomerFilters } from './customer-filters'

export interface CustomerSegment {
  id: string
  tenant_id: string
  name: string
  description?: string
  filters: CustomerFilters
  created_by?: string
  created_at: string
  updated_at: string
}

export interface CreateSegmentInput {
  name: string
  description?: string
  filters: CustomerFilters
}

export interface UpdateSegmentInput {
  name?: string
  description?: string
  filters?: CustomerFilters
}
