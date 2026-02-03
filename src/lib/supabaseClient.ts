import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let client: SupabaseClient | null = null

/**
 * Lazy client creation so Next.js build/prerender doesn’t crash when env vars aren’t set yet.
 * (On Vercel, env vars will be present during build.)
 */
export function getSupabase() {
  if (client) return client
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  client = createClient(supabaseUrl, supabaseAnonKey)
  return client
}
