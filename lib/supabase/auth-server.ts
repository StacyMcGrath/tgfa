import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Session-aware Supabase client for server components and route handlers.
 * Reads/writes auth cookies via next/headers. RLS-respecting (uses anon key
 * with the user's session token). Use this when you want operations scoped
 * to the signed-in user.
 *
 * Different from `getServiceRoleClient()` in lib/supabase/server.ts, which
 * bypasses RLS for admin reads of submission data.
 */
export async function getSessionClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_DATABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  const cookieStore = await cookies()

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server Components can't set cookies; middleware refreshes the session
          // on each /admin request, so this is a non-issue in practice.
        }
      },
    },
  })
}

export async function getCurrentUser() {
  const supabase = await getSessionClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
