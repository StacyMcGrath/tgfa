import { ExpandableText } from './expandable-text'
import { Pagination } from './pagination'
import type { OpenTextEntry } from '@/lib/dashboard/queries'

const PAGE_SIZE = 10

// Canonical ordering for grade pills (covers both teacher and family options).
const GRADE_ORDER = ['Pre-school', 'K-2', '3-5', '6-8', '9-12']

// Grade pill style — neutral grayscale ladder (lightest = youngest, darkest = oldest).
// Color/saturation isn't doing the work; the lightness step is the identifier.
const GRADE_PILL_CLASSES: Record<string, string> = {
  'Pre-school': 'bg-stone-200 text-stone-900',
  'K-2': 'bg-stone-300 text-stone-900',
  '3-5': 'bg-stone-400 text-stone-900',
  '6-8': 'bg-stone-600 text-white',
  '9-12': 'bg-stone-800 text-white',
}

export function OpenTextList({
  title,
  entries,
  page,
  searchParams,
  paramKey,
  highlightQuery,
}: {
  title: string
  entries: OpenTextEntry[]
  page: number
  searchParams: Record<string, string | string[] | undefined>
  paramKey: string
  highlightQuery?: string
}) {
  if (entries.length === 0) {
    return (
      <details className="group rounded-lg border border-zinc-300 bg-white">
        <summary className="cursor-pointer px-5 py-3 list-none flex items-center justify-between gap-3">
          <span className="flex items-center gap-2">
            <Chevron />
            <span className="text-sm font-semibold text-zinc-900">{title}</span>
          </span>
          <span className="text-xs font-normal text-zinc-500">No responses yet</span>
        </summary>
      </details>
    )
  }

  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * PAGE_SIZE
  const slice = entries.slice(start, start + PAGE_SIZE)

  return (
    <details className="group rounded-lg border border-zinc-300 bg-white open:shadow-sm">
      <summary className="cursor-pointer px-5 py-3 list-none flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <Chevron />
          <span className="text-sm font-semibold text-zinc-900">{title}</span>
        </span>
        <span className="text-xs font-normal text-zinc-500">
          {entries.length} response{entries.length === 1 ? '' : 's'}
        </span>
      </summary>
      <div className="px-5 pb-5 border-t border-zinc-200">
        <ul className="divide-y divide-zinc-200">
          {slice.map((entry) => {
            const sortedGrades = entry.grades
              ? [...entry.grades].sort(
                  (a, b) => GRADE_ORDER.indexOf(a) - GRADE_ORDER.indexOf(b),
                )
              : []
            return (
              <li key={entry.id} className="py-4">
                {(entry.role || sortedGrades.length > 0) && (
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {entry.role && <RoleBadge role={entry.role} />}
                    {sortedGrades.map((g) => (
                      <GradePill key={g} grade={g} />
                    ))}
                  </div>
                )}
                <ExpandableText text={entry.text} highlightQuery={highlightQuery} />
              </li>
            )
          })}
        </ul>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          searchParams={searchParams}
          paramKey={paramKey}
        />
      </div>
    </details>
  )
}

function Chevron() {
  return (
    <svg
      className="h-4 w-4 text-zinc-500 shrink-0 transition-transform duration-150 group-open:rotate-90"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  )
}

function RoleBadge({ role }: { role: 'teacher' | 'family' }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider ${
        role === 'teacher'
          ? 'bg-brand-dark-green text-zinc-900'
          : 'bg-brand-orange text-zinc-900'
      }`}
    >
      {role === 'teacher' ? 'Teacher' : 'Parent'}
    </span>
  )
}

function GradePill({ grade }: { grade: string }) {
  const classes = GRADE_PILL_CLASSES[grade] ?? 'bg-stone-200 text-stone-900'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${classes}`}>
      {grade}
    </span>
  )
}
