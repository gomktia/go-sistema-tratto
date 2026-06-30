'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { ClientRecord } from '@/types/crm'
import type { CustomerFilters } from '@/types/customer-filters'
import { differenceInYears } from 'date-fns'

interface UseCustomerFiltersResult {
  customers: ClientRecord[]
  loading: boolean
  error: string | null
  totalCount: number
  applyFilters: () => void
  refetch: () => void
}

export function useCustomerFilters(
  tenantId: string,
  filters: CustomerFilters,
  page: number = 1,
  pageSize: number = 50
): UseCustomerFiltersResult {
  const [customers, setCustomers] = useState<ClientRecord[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trigger, setTrigger] = useState(0)

  const refetch = useCallback(() => {
    setTrigger(prev => prev + 1)
  }, [])

  const fetchCustomers = useCallback(async () => {
    if (!tenantId) return

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setError('Erro de configuração do Supabase')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Base query
      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)

      // Filtro de busca
      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.like.%${filters.search}%`
        )
      }

      // Filtro de gênero
      if (filters.gender !== 'all') {
        if (filters.gender === 'not_informed') {
          query = query.is('gender', null)
        } else {
          const genderMap = { male: 'Masculino', female: 'Feminino' }
          query = query.eq('gender', genderMap[filters.gender as 'male' | 'female'])
        }
      }

      // Filtro de última visita
      if (filters.lastVisitMode === 'recent' && filters.lastVisitDays) {
        const daysAgo = new Date()
        daysAgo.setDate(daysAgo.getDate() - filters.lastVisitDays)
        query = query.gte('last_visit_at', daysAgo.toISOString())
      } else if (filters.lastVisitMode === 'period') {
        if (filters.lastVisitFrom) {
          query = query.gte('last_visit_at', filters.lastVisitFrom.toISOString())
        }
        if (filters.lastVisitTo) {
          query = query.lte('last_visit_at', filters.lastVisitTo.toISOString())
        }
      }

      // Paginação
      const start = (page - 1) * pageSize
      const end = start + pageSize - 1
      query = query.range(start, end)

      // Ordenação
      query = query.order('created_at', { ascending: false })

      const { data, error: fetchError, count } = await query

      if (fetchError) {
        console.error('Erro ao buscar clientes:', fetchError)
        setError(fetchError.message)
        return
      }

      let filteredData = data || []

      // Filtros client-side (que não podem ser feitos no Supabase facilmente)

      // Filtro de idade (calculado no frontend)
      if (filters.ageMin !== null || filters.ageMax !== null) {
        filteredData = filteredData.filter(customer => {
          if (!customer.birthdate) return false

          const age = differenceInYears(new Date(), new Date(customer.birthdate))

          if (filters.ageMin !== null && age < filters.ageMin) return false
          if (filters.ageMax !== null && age > filters.ageMax) return false

          return true
        })
      }

      // Para filtros que dependem de appointments, precisamos fazer queries separadas
      if (filters.hasService !== 'all' || filters.noFutureAppointment) {
        const customerIds = filteredData.map(c => c.id)

        if (customerIds.length > 0) {
          // Buscar appointments dos clientes
          const { data: appointments } = await supabase
            .from('appointments')
            .select('customer_id, start_at, status')
            .in('customer_id', customerIds)

          const appointmentsMap = new Map<string, any[]>()
          appointments?.forEach(apt => {
            if (!appointmentsMap.has(apt.customer_id)) {
              appointmentsMap.set(apt.customer_id, [])
            }
            appointmentsMap.get(apt.customer_id)?.push(apt)
          })

          // Filtro: fez/não fez serviço
          if (filters.hasService === 'has') {
            filteredData = filteredData.filter(c => appointmentsMap.has(c.id))
          } else if (filters.hasService === 'never') {
            filteredData = filteredData.filter(c => !appointmentsMap.has(c.id))
          }

          // Filtro: sem agendamento futuro
          if (filters.noFutureAppointment) {
            const now = new Date()
            filteredData = filteredData.filter(c => {
              const apts = appointmentsMap.get(c.id) || []
              const futureApts = apts.filter(apt =>
                new Date(apt.start_at) > now &&
                ['scheduled', 'confirmed'].includes(apt.status)
              )
              return futureApts.length === 0
            })
          }
        }
      }

      // Mapear para ClientRecord
      const mappedData: ClientRecord[] = filteredData.map(customer => ({
        id: customer.id,
        tenantId: customer.tenant_id,
        name: customer.full_name,
        email: customer.email || '',
        phone: customer.phone || '',
        cpf: customer.document || '',
        status: customer.status || 'active',
        lastVisit: customer.last_visit_at || new Date().toISOString(),
        totalSpent: Number(customer.total_spent) || 0,
        avatar: customer.avatar_url || '',
        points: customer.loyalty_points || 0
      }))

      setCustomers(mappedData)
      setTotalCount(count || 0)
    } catch (err) {
      console.error('Erro ao aplicar filtros:', err)
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [tenantId, filters, page, pageSize, trigger])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return {
    customers,
    loading,
    error,
    totalCount,
    applyFilters: refetch,
    refetch
  }
}
