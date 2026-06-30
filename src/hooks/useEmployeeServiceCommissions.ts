"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type {
  EmployeeServiceCommission,
  CreateEmployeeServiceCommissionInput,
  UpdateEmployeeServiceCommissionInput
} from "@/types/employee-extended"

export function useEmployeeServiceCommissions(tenantId: string, employeeId: string) {
  const [data, setData] = useState<EmployeeServiceCommission[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trigger, setTrigger] = useState(0)

  const refetch = useCallback(() => setTrigger(prev => prev + 1), [])

  // Fetch exceções com nome do serviço
  useEffect(() => {
    if (!isSupabaseConfigured || !tenantId || !employeeId) {
      setData([])
      setLoading(false)
      return
    }

    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      setData([])
      setLoading(false)
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    supabase
      .from("employee_service_commissions")
      .select(`
        *,
        services (
          name
        )
      `)
      .eq("tenant_id", tenantId)
      .eq("employee_id", employeeId)
      .order("created_at", { ascending: false })
      .then(({ data: rows, error: fetchError }) => {
        if (!isMounted) return
        if (fetchError) {
          setError(fetchError.message)
          setData([])
        } else {
          setData(
            rows?.map(row => ({
              id: row.id,
              tenantId: row.tenant_id,
              employeeId: row.employee_id,
              serviceId: row.service_id,
              serviceName: (row.services as any)?.name ?? undefined,
              commissionRate: row.commission_rate,
              notes: row.notes ?? undefined,
              createdAt: row.created_at,
              updatedAt: row.updated_at
            })) || []
          )
        }
        setLoading(false)
      })

    return () => { isMounted = false }
  }, [tenantId, employeeId, trigger])

  // Create
  const createCommissionException = useCallback(async (input: CreateEmployeeServiceCommissionInput) => {
    if (!isSupabaseConfigured || !tenantId || !employeeId) return null

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return null

    const { data: created, error: createError } = await supabase
      .from("employee_service_commissions")
      .insert({
        tenant_id: tenantId,
        employee_id: employeeId,
        service_id: input.serviceId,
        commission_rate: input.commissionRate,
        notes: input.notes ?? null
      })
      .select()
      .single()

    if (createError) {
      setError(createError.message)
      return null
    }

    refetch()
    return created
  }, [tenantId, employeeId, refetch])

  // Update
  const updateCommissionException = useCallback(async (id: string, input: UpdateEmployeeServiceCommissionInput) => {
    if (!isSupabaseConfigured || !tenantId) return null

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return null

    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    if (input.commissionRate !== undefined) updateData.commission_rate = input.commissionRate
    if (input.notes !== undefined) updateData.notes = input.notes

    const { data: updated, error: updateError } = await supabase
      .from("employee_service_commissions")
      .update(updateData)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .select()
      .single()

    if (updateError) {
      setError(updateError.message)
      return null
    }

    refetch()
    return updated
  }, [tenantId, refetch])

  // Delete
  const deleteCommissionException = useCallback(async (id: string) => {
    if (!isSupabaseConfigured || !tenantId) return false

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return false

    const { error: deleteError } = await supabase
      .from("employee_service_commissions")
      .delete()
      .eq("id", id)
      .eq("tenant_id", tenantId)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    refetch()
    return true
  }, [tenantId, refetch])

  return {
    data,
    loading,
    error,
    refetch,
    createCommissionException,
    updateCommissionException,
    deleteCommissionException
  }
}
