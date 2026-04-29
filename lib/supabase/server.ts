import 'server-only'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function getServiceRoleClient(): SupabaseClient {
  const url = process.env.SUPABASE_DATABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars (SUPABASE_DATABASE_URL, SUPABASE_SERVICE_ROLE_KEY). Run dev via `netlify dev` to inject them.',
    )
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
