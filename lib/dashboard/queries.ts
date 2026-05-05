import 'server-only'
import { getServiceRoleClient } from '@/lib/supabase/server'
import type { ResolvedRange } from './date-range'

export type TeacherRow = {
  id: string
  created_at: string
  grades: string[]
  subjects: string[]
  subjects_other: string | null
  topics: string[]
  topics_other: string | null
  format: string
  program_duration: string
  season: string[]
  group_size: string
  has_budget: boolean
  budget_range: string | null
  has_field_tripped: boolean
  travel_time: string
  curricular_tie_ins: string | null
  priority_tie_ins: string | null
  perfect_visit: string | null
  anything_else: string | null
  contact_name: string | null
  contact_email: string | null
  contact_school: string | null
}

export type FamilyRow = {
  id: string
  created_at: string
  child_grades: string[]
  topics: string[]
  topics_other: string | null
  participation: string
  program_duration: string
  season: string[]
  travel_time: string
  perfect_experience: string | null
  anything_else: string | null
  contact_name: string | null
  contact_email: string | null
}

export type DistributionPoint = { name: string; count: number }

export type OpenTextEntry = {
  id: string
  text: string
  created_at: string
  role?: 'teacher' | 'family'
  grades?: string[]
}

export type OpenTextSearchResult = {
  matchKey: string
  role: 'teacher' | 'family'
  question: string
  text: string
  created_at: string
}

// ─── Fetchers ─────────────────────────────────────────────────────────────

export async function fetchTeachers(range: ResolvedRange): Promise<TeacherRow[]> {
  const supabase = getServiceRoleClient()
  let q = supabase
    .from('teacher_submissions')
    .select('*')
    .order('created_at', { ascending: false })
  if (range.startISO) q = q.gte('created_at', range.startISO)
  if (range.endISO) q = q.lte('created_at', range.endISO)
  const { data, error } = await q
  if (error) throw error
  return (data as TeacherRow[]) ?? []
}

export async function fetchFamilies(range: ResolvedRange): Promise<FamilyRow[]> {
  const supabase = getServiceRoleClient()
  let q = supabase
    .from('family_submissions')
    .select('*')
    .order('created_at', { ascending: false })
  if (range.startISO) q = q.gte('created_at', range.startISO)
  if (range.endISO) q = q.lte('created_at', range.endISO)
  const { data, error } = await q
  if (error) throw error
  return (data as FamilyRow[]) ?? []
}

// ─── Distribution helpers (JS-side aggregation) ───────────────────────────

export function countSingle<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T,
): DistributionPoint[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const v = row[field]
    if (typeof v !== 'string' || !v) continue
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function countMulti<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T,
): DistributionPoint[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const arr = row[field]
    if (!Array.isArray(arr)) continue
    for (const v of arr) {
      if (typeof v !== 'string') continue
      counts.set(v, (counts.get(v) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Like `countMulti`, but when the array contains "Other", the row's `otherField`
 * write-in text is substituted in. So "Subjects: [Math, Other]" + subjects_other
 * = "Music Theory" counts as Math + Music Theory rather than Math + Other.
 *
 * Falls back to "Other" if the write-in is missing or empty.
 */
export function countMultiExpandingOther<T extends Record<string, unknown>>(
  rows: T[],
  multiField: keyof T,
  otherField: keyof T,
  otherKey: string = 'Other',
): DistributionPoint[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const arr = row[multiField]
    if (!Array.isArray(arr)) continue
    for (const v of arr) {
      if (typeof v !== 'string') continue
      let name = v
      if (v === otherKey) {
        const text = row[otherField]
        if (typeof text === 'string' && text.trim()) {
          name = text.trim()
        }
      }
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function countBoolean<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T,
): DistributionPoint[] {
  let yes = 0
  let no = 0
  for (const row of rows) {
    if (row[field] === true) yes++
    else if (row[field] === false) no++
  }
  return [
    { name: 'Yes', count: yes },
    { name: 'No', count: no },
  ]
}

// ─── Submissions over time ────────────────────────────────────────────────

export type OverTimePoint = { date: string; teachers: number; families: number; total: number }

export function bucketByDate(
  teachers: TeacherRow[],
  families: FamilyRow[],
  bucket: 'day' | 'week',
): OverTimePoint[] {
  const buckets = new Map<string, OverTimePoint>()

  const bucketKey = (iso: string): string => {
    const d = new Date(iso)
    if (bucket === 'week') {
      const dow = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() - dow + 1) // Monday
    }
    return d.toISOString().slice(0, 10)
  }

  const add = (iso: string, side: 'teachers' | 'families') => {
    const key = bucketKey(iso)
    const existing = buckets.get(key) ?? { date: key, teachers: 0, families: 0, total: 0 }
    existing[side] += 1
    existing.total += 1
    buckets.set(key, existing)
  }

  teachers.forEach((t) => add(t.created_at, 'teachers'))
  families.forEach((f) => add(f.created_at, 'families'))

  return [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date))
}

// ─── Open-text per question (Teachers / Families tabs) ────────────────────

export function teacherOpenTexts(rows: TeacherRow[]) {
  return {
    curricularTieIns: nonEmpty(rows, 'curricular_tie_ins', 'grades'),
    priorityTieIns: nonEmpty(rows, 'priority_tie_ins', 'grades'),
    perfectVisit: nonEmpty(rows, 'perfect_visit', 'grades'),
    anythingElse: nonEmpty(rows, 'anything_else', 'grades'),
    subjectsOther: nonEmpty(rows, 'subjects_other', 'grades'),
    topicsOther: nonEmpty(rows, 'topics_other', 'grades'),
  }
}

export function familyOpenTexts(rows: FamilyRow[]) {
  return {
    perfectExperience: nonEmpty(rows, 'perfect_experience', 'child_grades'),
    anythingElse: nonEmpty(rows, 'anything_else', 'child_grades'),
    topicsOther: nonEmpty(rows, 'topics_other', 'child_grades'),
  }
}

function nonEmpty<T extends { id: string; created_at: string }>(
  rows: T[],
  field: keyof T,
  gradesField?: keyof T,
): OpenTextEntry[] {
  return rows
    .filter((r) => typeof r[field] === 'string' && (r[field] as string).trim() !== '')
    .map((r) => {
      const entry: OpenTextEntry = {
        id: r.id,
        text: r[field] as string,
        created_at: r.created_at,
      }
      if (gradesField) {
        const g = r[gradesField]
        if (Array.isArray(g) && g.length > 0) entry.grades = g as string[]
      }
      return entry
    })
}

/**
 * Filter rows by grade overlap. If `selected` is empty, all rows pass.
 * Otherwise keep rows where the row's grades array shares ≥1 element with selected.
 */
export function applyGradeFilter<T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T,
  selected: string[],
): T[] {
  if (selected.length === 0) return rows
  const wanted = new Set(selected)
  return rows.filter((row) => {
    const arr = row[field]
    if (!Array.isArray(arr)) return false
    return arr.some((v) => typeof v === 'string' && wanted.has(v))
  })
}

/** Parse a comma-separated `?grades=K-2,3-5` URL param into an array. */
export function parseGradesParam(raw: string | string[] | undefined): string[] {
  if (typeof raw !== 'string') return []
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

// ─── Open-text search (Open responses tab) ────────────────────────────────

const TEACHER_TEXT_FIELDS: { field: keyof TeacherRow; label: string }[] = [
  { field: 'subjects_other', label: 'Subjects — Other' },
  { field: 'topics_other', label: 'Topics — Other' },
  { field: 'curricular_tie_ins', label: 'Curricular tie-ins' },
  { field: 'priority_tie_ins', label: 'School / district priorities' },
  { field: 'perfect_visit', label: 'Perfect garden visit' },
  { field: 'anything_else', label: 'Anything else' },
]

const FAMILY_TEXT_FIELDS: { field: keyof FamilyRow; label: string }[] = [
  { field: 'topics_other', label: 'Topics — Other' },
  { field: 'perfect_experience', label: 'Perfect garden experience' },
  { field: 'anything_else', label: 'Anything else' },
]

export function searchOpenText(
  teachers: TeacherRow[],
  families: FamilyRow[],
  query: string,
): OpenTextSearchResult[] {
  const q = query.trim().toLowerCase()
  const out: OpenTextSearchResult[] = []

  for (const t of teachers) {
    for (const { field, label } of TEACHER_TEXT_FIELDS) {
      const text = (t[field] as string | null) ?? ''
      if (!text) continue
      if (q && !text.toLowerCase().includes(q)) continue
      out.push({
        matchKey: `${t.id}:${String(field)}`,
        role: 'teacher',
        question: label,
        text,
        created_at: t.created_at,
      })
    }
  }

  for (const f of families) {
    for (const { field, label } of FAMILY_TEXT_FIELDS) {
      const text = (f[field] as string | null) ?? ''
      if (!text) continue
      if (q && !text.toLowerCase().includes(q)) continue
      out.push({
        matchKey: `${f.id}:${String(field)}`,
        role: 'family',
        question: label,
        text,
        created_at: f.created_at,
      })
    }
  }

  return out.sort((a, b) => b.created_at.localeCompare(a.created_at))
}
