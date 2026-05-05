import type { NextRequest } from 'next/server'
import { resolveRange } from '@/lib/dashboard/date-range'
import {
  fetchTeachers,
  applyGradeFilter,
  parseGradesParam,
  type TeacherRow,
} from '@/lib/dashboard/queries'

const COLUMNS: (keyof TeacherRow)[] = [
  'id',
  'created_at',
  'grades',
  'subjects',
  'subjects_other',
  'topics',
  'topics_other',
  'format',
  'program_duration',
  'season',
  'group_size',
  'has_budget',
  'budget_range',
  'has_field_tripped',
  'travel_time',
  'curricular_tie_ins',
  'priority_tie_ins',
  'perfect_visit',
  'anything_else',
  'contact_name',
  'contact_email',
  'contact_school',
]

export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams
  const range = resolveRange({
    range: sp.get('range') ?? undefined,
    start: sp.get('start') ?? undefined,
    end: sp.get('end') ?? undefined,
  })

  const allTeachers = await fetchTeachers(range)
  const selectedGrades = parseGradesParam(sp.get('grades') ?? undefined)
  const teachers = applyGradeFilter(allTeachers, 'grades', selectedGrades)
  const csv = toCsv(teachers, COLUMNS)
  const filename = `teacher_submissions_${rangeFilenameSlug(range.key)}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

function toCsv<T extends Record<string, unknown>>(rows: T[], columns: (keyof T)[]): string {
  const header = columns.map(String).map(csvEscape).join(',')
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const v = row[col]
          if (Array.isArray(v)) return csvEscape(v.join('; '))
          if (typeof v === 'boolean') return v ? 'Yes' : 'No'
          if (v === null || v === undefined) return ''
          return csvEscape(String(v))
        })
        .join(','),
    )
    .join('\n')
  return body ? `${header}\n${body}` : header
}

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function rangeFilenameSlug(key: string): string {
  return key === 'all' ? 'all_time' : key.replace(/-/g, '_')
}
