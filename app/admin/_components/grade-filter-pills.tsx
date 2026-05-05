'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

// Active-state pills use the grayscale ladder — same shades as the inline grade badges.
const GRADE_PILL_ACTIVE: Record<string, string> = {
  'Pre-school': 'bg-stone-200 text-stone-900 border-stone-400',
  'K-2': 'bg-stone-300 text-stone-900 border-stone-500',
  '3-5': 'bg-stone-400 text-stone-900 border-stone-600',
  '6-8': 'bg-stone-600 text-white border-stone-700',
  '9-12': 'bg-stone-800 text-white border-stone-900',
}

const DEFAULT_ACTIVE = 'bg-stone-400 text-stone-900 border-stone-600'
const INACTIVE = 'border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'

export function GradeFilterPills({
  options,
  label,
  infoNote,
}: {
  options: readonly string[]
  label: string
  infoNote?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const current = (searchParams.get('grades') ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const currentSet = new Set(current)

  function toggle(grade: string) {
    const next = new Set(currentSet)
    if (next.has(grade)) {
      next.delete(grade)
    } else {
      next.add(grade)
    }
    const params = new URLSearchParams(searchParams.toString())
    const list = options.filter((g) => next.has(g)) // preserve canonical order
    if (list.length === 0) {
      params.delete('grades')
    } else {
      params.set('grades', list.join(','))
    }
    for (const k of [...params.keys()]) {
      if (k.endsWith('_page') || k === 'page') params.delete(k)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-zinc-700">{label}:</span>
        {options.map((g) => {
          const active = currentSet.has(g)
          const activeClass = GRADE_PILL_ACTIVE[g] ?? DEFAULT_ACTIVE
          return (
            <button
              key={g}
              type="button"
              onClick={() => toggle(g)}
              className={`rounded-md border px-3 py-1 text-sm transition-colors ${
                active ? activeClass : INACTIVE
              }`}
            >
              {g}
            </button>
          )
        })}
        {current.length > 0 && (
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString())
              params.delete('grades')
              for (const k of [...params.keys()]) {
                if (k.endsWith('_page') || k === 'page') params.delete(k)
              }
              const qs = params.toString()
              router.push(qs ? `${pathname}?${qs}` : pathname)
            }}
            className="text-xs text-zinc-500 hover:text-zinc-800 underline ml-1"
          >
            clear
          </button>
        )}
      </div>
      {infoNote && (
        <p className="text-xs text-zinc-500 italic">{infoNote}</p>
      )}
    </div>
  )
}
