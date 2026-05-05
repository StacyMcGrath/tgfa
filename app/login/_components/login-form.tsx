'use client'

import { useState, type FormEvent } from 'react'
import { useSearchParams } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/auth-browser'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function LoginForm() {
  const searchParams = useSearchParams()
  const errorFromUrl = searchParams.get('error')
  const redirectTo = searchParams.get('redirectTo') || '/admin'

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(errorFromUrl)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setErrorMsg(null)

    const supabase = getBrowserClient()
    const callbackUrl = new URL('/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('redirectTo', redirectTo)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: callbackUrl.toString(),
        shouldCreateUser: false, // invite-only
      },
    })

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
    } else {
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    return (
      <div className="mt-8 rounded-md border border-brand-dark-green bg-brand-light-green/40 px-4 py-4 text-sm text-brand-dark-blue">
        Check your inbox at <strong>{email}</strong> for a link to sign in. You can close this tab.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <label className="block">
        <span className="text-sm text-zinc-700">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          autoFocus
          maxLength={200}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue focus:border-transparent"
        />
      </label>

      {errorMsg && (
        <div
          role="alert"
          className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {errorMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="w-full rounded-full bg-brand-dark-blue hover:bg-brand-dark-blue/90 disabled:bg-zinc-400 disabled:cursor-not-allowed text-white font-medium px-8 py-3 transition-colors"
      >
        {status === 'sending' ? 'Sending…' : 'Send magic link'}
      </button>
    </form>
  )
}
