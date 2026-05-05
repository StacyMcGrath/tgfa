import { resolveRange } from '@/lib/dashboard/date-range'
import {
  fetchTeachers,
  fetchFamilies,
  parseGradesParam,
  type OpenTextEntry,
  type TeacherRow,
  type FamilyRow,
} from '@/lib/dashboard/queries'
import { CHILD_GRADE_OPTIONS } from '@/lib/survey/schema'
import { SearchBox } from '../_components/search-box'
import { OpenTextList } from '../_components/open-text-list'
import { RoleFilter } from '../_components/role-filter'
import { GradeFilterPills } from '../_components/grade-filter-pills'

type SearchParams = Record<string, string | string[] | undefined>

function getPage(sp: SearchParams, key: string): number {
  const v = sp[key]
  if (typeof v !== 'string') return 1
  const n = parseInt(v, 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

function entriesFor<T extends { id: string; created_at: string }>(
  rows: T[],
  field: keyof T,
  gradesField: keyof T,
  role?: 'teacher' | 'family',
): OpenTextEntry[] {
  return rows
    .filter((r) => typeof r[field] === 'string' && (r[field] as string).trim() !== '')
    .map((r) => {
      const entry: OpenTextEntry = {
        id: `${r.id}-${String(field)}`,
        text: r[field] as string,
        created_at: r.created_at,
      }
      if (role) entry.role = role
      const g = r[gradesField]
      if (Array.isArray(g) && g.length > 0) entry.grades = g as string[]
      return entry
    })
}

function mergeByDate(...lists: OpenTextEntry[][]): OpenTextEntry[] {
  return lists.flat().sort((a, b) => b.created_at.localeCompare(a.created_at))
}

export default async function ResponsesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const range = resolveRange({
    range: typeof sp.range === 'string' ? sp.range : undefined,
    start: typeof sp.start === 'string' ? sp.start : undefined,
    end: typeof sp.end === 'string' ? sp.end : undefined,
  })
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''
  const roleFilter = typeof sp.role === 'string' && (sp.role === 'teacher' || sp.role === 'family')
    ? sp.role
    : 'all'
  const selectedGrades = parseGradesParam(sp.grades)
  const gradesSet = new Set(selectedGrades)

  const [teachers, families] = await Promise.all([fetchTeachers(range), fetchFamilies(range)])

  const sections: { key: string; title: string; entries: OpenTextEntry[] }[] = [
    {
      key: 'curricular',
      title: 'Curricular tie-ins',
      entries: entriesFor<TeacherRow>(teachers, 'curricular_tie_ins', 'grades', 'teacher'),
    },
    {
      key: 'priorities',
      title: 'School / district priorities',
      entries: entriesFor<TeacherRow>(teachers, 'priority_tie_ins', 'grades', 'teacher'),
    },
    {
      key: 'perfect_visit',
      title: 'Perfect garden visit',
      entries: mergeByDate(
        entriesFor<TeacherRow>(teachers, 'perfect_visit', 'grades', 'teacher'),
        entriesFor<FamilyRow>(families, 'perfect_experience', 'child_grades', 'family'),
      ),
    },
    {
      key: 'anything_else',
      title: 'Anything else',
      entries: mergeByDate(
        entriesFor<TeacherRow>(teachers, 'anything_else', 'grades', 'teacher'),
        entriesFor<FamilyRow>(families, 'anything_else', 'child_grades', 'family'),
      ),
    },
  ]

  // Apply search + role + grade filters per section
  const lq = q.toLowerCase()
  const filtered = sections.map((s) => {
    let entries = s.entries
    if (roleFilter !== 'all') {
      entries = entries.filter((e) => e.role === roleFilter)
    }
    if (selectedGrades.length > 0) {
      entries = entries.filter((e) => e.grades?.some((g) => gradesSet.has(g)) ?? false)
    }
    if (q) {
      entries = entries.filter((e) => e.text.toLowerCase().includes(lq))
    }
    return { ...s, entries }
  })

  const totalMatches = filtered.reduce((sum, s) => sum + s.entries.length, 0)

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <SearchBox defaultValue={q} />
        <RoleFilter />
        <GradeFilterPills options={CHILD_GRADE_OPTIONS} label="Grade level" />
      </div>

      <p className="text-sm text-zinc-500">
        {q
          ? `${totalMatches} match${totalMatches === 1 ? '' : 'es'} for "${q}" · showing ${range.label.toLowerCase()}`
          : `${totalMatches} open response${totalMatches === 1 ? '' : 's'} · showing ${range.label.toLowerCase()}`}
        {roleFilter !== 'all' &&
          ` · ${roleFilter === 'teacher' ? 'teachers only' : 'parents only'}`}
      </p>

      {totalMatches === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white p-8 text-center text-sm text-zinc-500">
          {q ? `No responses match "${q}" in this range.` : 'No open-text responses yet.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((section) =>
            section.entries.length > 0 ? (
              <OpenTextList
                key={section.key}
                title={section.title}
                entries={section.entries}
                page={getPage(sp, `${section.key}_page`)}
                searchParams={sp}
                paramKey={`${section.key}_page`}
                highlightQuery={q || undefined}
              />
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}
