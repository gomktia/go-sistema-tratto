
import { createClient } from "@supabase/supabase-js"

type GenericDatabase = any

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase configuration incomplete in environment variables');
}

export const supabase = createClient<GenericDatabase>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
    },
})
