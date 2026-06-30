"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type {
  EmployeeUnavailability,
  CreateEmployeeUnavailabilityInput,
  UpdateEmployeeUnavailabilityInput
} from "@/types/employee-extended"

export function useEmployeeUnavailability(tenantId: string, employeeId: string) {
  const [data, setData] = useState<EmployeeUnavailability[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trigger, setTrigger] = useState(0)

  const refetch = useCallback(() => setTrigger(prev => prev + 1), [])

  // Fetch bloqueios
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
      .from("employee_unavailability")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("employee_id", employeeId)
      .order("start_date", { ascending: false })
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
              reason: row.reason,
              startDate: row.start_date,
              endDate: row.end_date,
              allDay: row.all_day,
              startTime: row.start_time ?? undefined,
              endTime: row.end_time ?? undefined,
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
  const createUnavailability = useCallback(async (input: CreateEmployeeUnavailabilityInput) => {
    if (!isSupabaseConfigured || !tenantId || !employeeId) return null

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return null

    const { data: created, error: createError } = await supabase
      .from("employee_unavailability")
      .insert({
        tenant_id: tenantId,
        employee_id: employeeId,
        reason: input.reason,
        start_date: input.startDate,
        end_date: input.endDate,
        all_day: input.allDay,
        start_time: input.startTime ?? null,
        end_time: input.endTime ?? null,
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
  const updateUnavailability = useCallback(async (id: string, input: UpdateEmployeeUnavailabilityInput) => {
    if (!isSupabaseConfigured || !tenantId) return null

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return null

    const updateData: any = {
      updated_at: new Date().toISOString()
    }
    if (input.reason !== undefined) updateData.reason = input.reason
    if (input.startDate !== undefined) updateData.start_date = input.startDate
    if (input.endDate !== undefined) updateData.end_date = input.endDate
    if (input.allDay !== undefined) updateData.all_day = input.allDay
    if (input.startTime !== undefined) updateData.start_time = input.startTime
    if (input.endTime !== undefined) updateData.end_time = input.endTime
    if (input.notes !== undefined) updateData.notes = input.notes

    const { data: updated, error: updateError } = await supabase
      .from("employee_unavailability")
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
  const deleteUnavailability = useCallback(async (id: string) => {
    if (!isSupabaseConfigured || !tenantId) return false

    const supabase = getSupabaseBrowserClient()
    if (!supabase) return false

    const { error: deleteError } = await supabase
      .from("employee_unavailability")
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
    createUnavailability,
    updateUnavailability,
    deleteUnavailability
  }
}
