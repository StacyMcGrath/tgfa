import { NextResponse, type NextRequest } from 'next/server'
import { getSessionClient } from '@/lib/supabase/auth-server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const redirectTo = searchParams.get('redirectTo') || '/admin'

  if (code) {
    const supabase = await getSessionClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`)
    }
    console.error('exchangeCodeForSession failed:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=Could+not+sign+you+in.+Please+try+again.`)
}
