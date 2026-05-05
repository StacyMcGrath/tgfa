export type RangeKey =
  | 'past-24h'
  | 'past-7d'
  | 'past-30d'
  | 'past-90d'
  | 'past-1y'
  | 'all'
  | 'custom'

export type ResolvedRange = {
  key: RangeKey
  label: string
  startISO: string | null
  endISO: string | null
  customStart?: string
  customEnd?: string
}

const PRESETS: Record<Exclude<RangeKey, 'custom'>, { label: string; ms: number | null }> = {
  'past-24h': { label: 'Past 24 hours', ms: 24 * 60 * 60 * 1000 },
  'past-7d': { label: 'Past 7 days', ms: 7 * 24 * 60 * 60 * 1000 },
  'past-30d': { label: 'Past 30 days', ms: 30 * 24 * 60 * 60 * 1000 },
  'past-90d': { label: 'Past 90 days', ms: 90 * 24 * 60 * 60 * 1000 },
  'past-1y': { label: 'Past year', ms: 365 * 24 * 60 * 60 * 1000 },
  all: { label: 'All time', ms: null },
}

export const RANGE_OPTIONS: { key: RangeKey; label: string }[] = [
  { key: 'past-24h', label: 'Past 24 hours' },
  { key: 'past-7d', label: 'Past 7 days' },
  { key: 'past-30d', label: 'Past 30 days' },
  { key: 'past-90d', label: 'Past 90 days' },
  { key: 'past-1y', label: 'Past year' },
  { key: 'all', label: 'All time' },
  { key: 'custom', label: 'Custom range' },
]

export function resolveRange(searchParams: {
  range?: string
  start?: string
  end?: string
}): ResolvedRange {
  const key = (searchParams.range as RangeKey) || 'all'

  if (key === 'custom') {
    const start = searchParams.start
    const end = searchParams.end
    return {
      key: 'custom',
      label: 'Custom range',
      startISO: start ? new Date(`${start}T00:00:00.000Z`).toISOString() : null,
      endISO: end ? new Date(`${end}T23:59:59.999Z`).toISOString() : null,
      customStart: start,
      customEnd: end,
    }
  }

  const preset = PRESETS[key as Exclude<RangeKey, 'custom'>] ?? PRESETS.all
  return {
    key: (key in PRESETS ? key : 'all') as Exclude<RangeKey, 'custom'>,
    label: preset.label,
    startISO: preset.ms ? new Date(Date.now() - preset.ms).toISOString() : null,
    endISO: null,
  }
}

/** Day buckets for short ranges, weekly buckets for long ones. */
export function bucketSize(range: ResolvedRange): 'day' | 'week' {
  if (range.key === 'past-24h' || range.key === 'past-7d' || range.key === 'past-30d') return 'day'
  return 'week'
}

/** Build a URL search-param string for a given range, preserving an existing q/page if provided. */
export function buildRangeSearchParams(
  range: { key: RangeKey; customStart?: string; customEnd?: string },
  extras: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams()
  if (range.key !== 'all') params.set('range', range.key)
  if (range.key === 'custom') {
    if (range.customStart) params.set('start', range.customStart)
    if (range.customEnd) params.set('end', range.customEnd)
  }
  for (const [k, v] of Object.entries(extras)) {
    if (v) params.set(k, v)
  }
  const s = params.toString()
  return s ? `?${s}` : ''
}
