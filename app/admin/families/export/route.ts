import type { NextRequest } from 'next/server'
import { resolveRange } from '@/lib/dashboard/date-range'
import {
  fetchFamilies,
  applyGradeFilter,
  parseGradesParam,
  type FamilyRow,
} from '@/lib/dashboard/queries'

const COLUMNS: (keyof FamilyRow)[] = [
  'id',
  'created_at',
  'child_grades',
  'topics',
  'topics_other',
  'participation',
  'program_duration',
  'season',
  'travel_time',
  'perfect_experience',
  'anything_else',
  'contact_name',
  'contact_email',
]

export async function GET(request: NextRequest) {
  const sp = new URL(request.url).searchParams
  const range = resolveRange({
    range: sp.get('range') ?? undefined,
    start: sp.get('start') ?? undefined,
    end: sp.get('end') ?? undefined,
  })

  const allFamilies = await fetchFamilies(range)
  const selectedGrades = parseGradesParam(sp.get('grades') ?? undefined)
  const families = applyGradeFilter(allFamilies, 'child_grades', selectedGrades)
  const csv = toCsv(families, COLUMNS)
  const filename = `family_submissions_${rangeFilenameSlug(range.key)}.csv`

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
