'use client'

import { useState, type FormEvent } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase/auth-browser'

type Status = 'idle' | 'sending' | 'error'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorFromUrl = searchParams.get('error')
  const redirectTo = searchParams.get('redirectTo') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(errorFromUrl)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) return
    setStatus('sending')
    setErrorMsg(null)

    const supabase = getBrowserClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setStatus('error')
      return
    }

    router.push(redirectTo)
    router.refresh()
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

      <label className="block">
        <span className="text-sm text-zinc-700">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
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
        {status === 'sending' ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
