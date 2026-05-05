import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// TEMP: set to true to re-enable the /admin auth gate. Currently disabled so
// the dashboard UI can be exercised without configuring Supabase Auth first.
const AUTH_ENABLED = false

export async function proxy(request: NextRequest) {
  if (!AUTH_ENABLED) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const url = process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    // Misconfiguration — let the request through; the page will surface a clearer error.
    return response
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  // IMPORTANT: don't run other code between createServerClient and getUser.
  // getUser refreshes the session cookie if needed.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const redirect = request.nextUrl.clone()
    redirect.pathname = '/login'
    redirect.search = `?redirectTo=${encodeURIComponent(
      request.nextUrl.pathname + request.nextUrl.search,
    )}`
    return NextResponse.redirect(redirect)
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*'],
}
