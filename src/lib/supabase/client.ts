/**
 * Supabase Browser Client
 *
 * Retorna a MESMA instância usada pelo AuthContext (auth-helpers),
 * garantindo que o JWT de autenticação seja enviado em todas as queries.
 *
 * Contexto: o cliente anterior usava persistSession:false e criava uma
 * instância separada — hooks rodavam como 'anon' mesmo após login,
 * impedindo que RLS baseado em auth.uid() funcionasse.
 */
import { supabase as sharedClient } from '@/lib/auth-helpers'

export function getSupabaseBrowserClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return null
    return sharedClient
}

export const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
