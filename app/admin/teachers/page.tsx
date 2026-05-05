import { resolveRange } from '@/lib/dashboard/date-range'
import {
  fetchTeachers,
  countSingle,
  countMulti,
  countMultiExpandingOther,
  countBoolean,
  applyGradeFilter,
  parseGradesParam,
} from '@/lib/dashboard/queries'
import { GRADE_OPTIONS } from '@/lib/survey/schema'
import { BarChartCard, DonutCard, BAR_COLORS } from '../_components/charts'
import { CsvDownloadButton } from '../_components/csv-download-button'
import { GradeFilterPills } from '../_components/grade-filter-pills'

type SearchParams = Record<string, string | string[] | undefined>

function buildExportHref(sp: SearchParams): string {
  const params = new URLSearchParams()
  for (const k of ['range', 'start', 'end', 'grades']) {
    const v = sp[k]
    if (typeof v === 'string') params.set(k, v)
  }
  const s = params.toString()
  return `/admin/teachers/export${s ? `?${s}` : ''}`
}

export default async function TeachersPage({
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

  const allTeachers = await fetchTeachers(range)
  const selectedGrades = parseGradesParam(sp.grades)
  const teachers = applyGradeFilter(allTeachers, 'grades', selectedGrades)

  const grades = countMulti(teachers, 'grades')
  const subjects = countMultiExpandingOther(teachers, 'subjects', 'subjects_other')
  const topics = countMultiExpandingOther(teachers, 'topics', 'topics_other')
  const season = countMulti(teachers, 'season')
  const format = countSingle(teachers, 'format')
  const programDuration = countSingle(teachers, 'program_duration')
  const groupSize = countSingle(teachers, 'group_size')
  const travelTime = countSingle(teachers, 'travel_time')
  const hasBudget = countBoolean(teachers, 'has_budget')
  const hasFieldTripped = countBoolean(teachers, 'has_field_tripped')
  const budgetRange = countSingle(
    teachers.filter((t) => t.has_budget && t.budget_range),
    'budget_range',
  )

  return (
    <div className="space-y-6">
      <GradeFilterPills options={GRADE_OPTIONS} label="Grades taught" />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-zinc-500">
          {teachers.length} response{teachers.length === 1 ? '' : 's'} · showing{' '}
          {range.label.toLowerCase()}
          {selectedGrades.length > 0 && ` · ${selectedGrades.join(', ')} only`}
        </p>
        <CsvDownloadButton href={buildExportHref(sp)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartCard title="Grade(s) taught" data={grades} color={BAR_COLORS[0]} />
        <BarChartCard title="Subject(s) taught" data={subjects} color={BAR_COLORS[1]} />
        <BarChartCard
          title="Topics most valuable for students"
          data={topics}
          color={BAR_COLORS[2]}
        />
        <BarChartCard title="Times of year that work" data={season} color={BAR_COLORS[3]} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DonutCard title="Preferred format" data={format} />
        <DonutCard title="Ideal program duration" data={programDuration} />
        <DonutCard title="Group size" data={groupSize} />
        <DonutCard title="Reasonable travel time" data={travelTime} />
        <DonutCard title="Has a field-trip budget?" data={hasBudget} />
        <DonutCard title="Has done a field trip before?" data={hasFieldTripped} />
        {budgetRange.length > 0 && (
          <DonutCard title="Budget per student (those with a budget)" data={budgetRange} />
        )}
      </div>
    </div>
  )
}
