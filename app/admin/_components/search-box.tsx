'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export function SearchBox({ defaultValue = '' }: { defaultValue?: string }) {
  const [q, setQ] = useState(defaultValue)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (q.trim()) {
      params.set('q', q.trim())
    } else {
      params.delete('q')
    }
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search open-text responses…"
        className="flex-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
      />
      <button
        type="submit"
        className="rounded-md bg-brand-dark-blue hover:bg-brand-dark-blue/90 text-white text-sm font-medium px-4 py-2"
      >
        Search
      </button>
    </form>
  )
}
