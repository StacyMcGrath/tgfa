'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

type RoleValue = 'all' | 'teacher' | 'family'

const OPTIONS: { value: RoleValue; label: string; activeClass: string }[] = [
  {
    value: 'all',
    label: 'All',
    activeClass: 'border-zinc-700 bg-zinc-200 text-zinc-900',
  },
  {
    value: 'teacher',
    label: 'Teachers',
    activeClass: 'border-brand-dark-green bg-brand-dark-green/25 text-zinc-900',
  },
  {
    value: 'family',
    label: 'Parents',
    activeClass: 'border-brand-orange bg-brand-orange/25 text-zinc-900',
  },
]

const INACTIVE = 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'

export function RoleFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('role') || 'all'

  function setRole(value: RoleValue) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('role')
    } else {
      params.set('role', value)
    }
    for (const k of [...params.keys()]) {
      if (k.endsWith('_page') || k === 'page') params.delete(k)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium text-zinc-700">Show:</span>
      {OPTIONS.map((opt) => {
        const active = current === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setRole(opt.value)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              active ? opt.activeClass : INACTIVE
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
