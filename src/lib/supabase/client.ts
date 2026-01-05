import { createClient, type SupabaseClient } from "@supabase/supabase-js"

type GenericDatabase = any

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let browserClient: SupabaseClient<GenericDatabase> | null = null

export function getSupabaseBrowserClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        return null
    }

    if (!browserClient) {
        browserClient = createClient<GenericDatabase>(supabaseUrl, supabaseAnonKey, {
            auth: {
                persistSession: false,
            },
        })
    }

    return browserClient
}

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

