'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import type { CustomerSegment, CreateSegmentInput, UpdateSegmentInput } from '@/types/customer-segments'
import { toast } from 'sonner'

interface UseCustomerSegmentsResult {
  segments: CustomerSegment[]
  loading: boolean
  error: string | null
  createSegment: (input: CreateSegmentInput) => Promise<CustomerSegment | null>
  updateSegment: (id: string, input: UpdateSegmentInput) => Promise<boolean>
  deleteSegment: (id: string) => Promise<boolean>
  refetch: () => void
}

export function useCustomerSegments(tenantId: string): UseCustomerSegmentsResult {
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trigger, setTrigger] = useState(0)

  const refetch = useCallback(() => {
    setTrigger(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (!tenantId) return

    const fetchSegments = async () => {
      const supabase = getSupabaseBrowserClient()
      if (!supabase) {
        setError('Erro de configuração do Supabase')
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { data, error: fetchError } = await supabase
          .from('customer_segments')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('created_at', { ascending: false })

        if (fetchError) {
          console.error('Erro ao buscar segmentos:', fetchError)
          setError(fetchError.message)
          return
        }

        setSegments(data || [])
      } catch (err) {
        console.error('Erro ao buscar segmentos:', err)
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchSegments()
  }, [tenantId, trigger])

  const createSegment = useCallback(async (input: CreateSegmentInput): Promise<CustomerSegment | null> => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      toast.error('Erro de configuração do Supabase')
      return null
    }

    try {
      const { data, error: createError } = await supabase
        .from('customer_segments')
        .insert({
          tenant_id: tenantId,
          name: input.name,
          description: input.description,
          filters: input.filters
        })
        .select()
        .single()

      if (createError) {
        console.error('Erro ao criar segmento:', createError)
        toast.error('Erro ao salvar segmento')
        return null
      }

      toast.success('Segmento salvo com sucesso')
      refetch()
      return data
    } catch (err) {
      console.error('Erro ao criar segmento:', err)
      toast.error('Erro ao salvar segmento')
      return null
    }
  }, [tenantId, refetch])

  const updateSegment = useCallback(async (id: string, input: UpdateSegmentInput): Promise<boolean> => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      toast.error('Erro de configuração do Supabase')
      return false
    }

    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      }

      if (input.name !== undefined) updateData.name = input.name
      if (input.description !== undefined) updateData.description = input.description
      if (input.filters !== undefined) updateData.filters = input.filters

      const { error: updateError } = await supabase
        .from('customer_segments')
        .update(updateData)
        .eq('id', id)
        .eq('tenant_id', tenantId)

      if (updateError) {
        console.error('Erro ao atualizar segmento:', updateError)
        toast.error('Erro ao atualizar segmento')
        return false
      }

      toast.success('Segmento atualizado com sucesso')
      refetch()
      return true
    } catch (err) {
      console.error('Erro ao atualizar segmento:', err)
      toast.error('Erro ao atualizar segmento')
      return false
    }
  }, [tenantId, refetch])

  const deleteSegment = useCallback(async (id: string): Promise<boolean> => {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      toast.error('Erro de configuração do Supabase')
      return false
    }

    try {
      const { error: deleteError } = await supabase
        .from('customer_segments')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId)

      if (deleteError) {
        console.error('Erro ao excluir segmento:', deleteError)
        toast.error('Erro ao excluir segmento')
        return false
      }

      toast.success('Segmento excluído com sucesso')
      refetch()
      return true
    } catch (err) {
      console.error('Erro ao excluir segmento:', err)
      toast.error('Erro ao excluir segmento')
      return false
    }
  }, [tenantId, refetch])

  return {
    segments,
    loading,
    error,
    createSegment,
    updateSegment,
    deleteSegment,
    refetch
  }
}
