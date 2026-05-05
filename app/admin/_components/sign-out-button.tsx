'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getBrowserClient } from '@/lib/supabase/auth-browser'

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function signOut() {
    setPending(true)
    const supabase = getBrowserClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors disabled:opacity-50"
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </button>
  )
}
