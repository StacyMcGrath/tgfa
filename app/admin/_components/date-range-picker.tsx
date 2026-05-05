'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { RANGE_OPTIONS, type RangeKey } from '@/lib/dashboard/date-range'

export function DateRangePicker() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentKey = (searchParams.get('range') as RangeKey) || 'all'
  const [showCustom, setShowCustom] = useState(currentKey === 'custom')
  const [start, setStart] = useState(searchParams.get('start') || '')
  const [end, setEnd] = useState(searchParams.get('end') || '')

  function setRange(key: RangeKey) {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'all') {
      params.delete('range')
    } else {
      params.set('range', key)
    }
    if (key !== 'custom') {
      params.delete('start')
      params.delete('end')
    }
    // Drop any per-section pagination params on range change
    for (const k of [...params.keys()]) {
      if (k.endsWith('_page') || k === 'page') params.delete(k)
    }
    setShowCustom(key === 'custom')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function applyCustom(e: FormEvent) {
    e.preventDefault()
    if (!start || !end) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('range', 'custom')
    params.set('start', start)
    params.set('end', end)
    for (const k of [...params.keys()]) {
      if (k.endsWith('_page') || k === 'page') params.delete(k)
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <select
        value={currentKey}
        onChange={(e) => setRange(e.target.value as RangeKey)}
        className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
        aria-label="Date range"
      >
        {RANGE_OPTIONS.map((opt) => (
          <option key={opt.key} value={opt.key}>
            {opt.label}
          </option>
        ))}
      </select>

      {showCustom && (
        <form onSubmit={applyCustom} className="flex items-center gap-2">
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            required
            aria-label="Start date"
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
          />
          <span className="text-sm text-zinc-500">to</span>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            required
            aria-label="End date"
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
          />
          <button
            type="submit"
            className="rounded-md bg-brand-dark-blue hover:bg-brand-dark-blue/90 text-white text-sm font-medium px-3 py-1"
          >
            Apply
          </button>
        </form>
      )}
    </div>
  )
}
