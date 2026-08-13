import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Lazily initialized so the client is created at request time, not build time.
let _instance: SupabaseClient | undefined

function getInstance(): SupabaseClient {
  return (_instance ??= createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  ))
}

export const supabaseAdmin: SupabaseClient = new Proxy(
  {} as SupabaseClient,
  { get: (_, prop) => getInstance()[prop as keyof SupabaseClient] }
)
