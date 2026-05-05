import { resolveRange } from '@/lib/dashboard/date-range'
import {
  fetchFamilies,
  countSingle,
  countMulti,
  countMultiExpandingOther,
  applyGradeFilter,
  parseGradesParam,
} from '@/lib/dashboard/queries'
import { CHILD_GRADE_OPTIONS } from '@/lib/survey/schema'
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
  return `/admin/families/export${s ? `?${s}` : ''}`
}

export default async function FamiliesPage({
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

  const allFamilies = await fetchFamilies(range)
  const selectedGrades = parseGradesParam(sp.grades)
  const families = applyGradeFilter(allFamilies, 'child_grades', selectedGrades)

  const childGrades = countMulti(families, 'child_grades')
  const topics = countMultiExpandingOther(families, 'topics', 'topics_other')
  const season = countMulti(families, 'season')
  const participation = countSingle(families, 'participation')
  const programDuration = countSingle(families, 'program_duration')
  const travelTime = countSingle(families, 'travel_time')

  return (
    <div className="space-y-6">
      <GradeFilterPills
        options={CHILD_GRADE_OPTIONS}
        label="Includes grade level"
        infoNote="Families with multiple grade levels appear in each they selected — preferences may reflect any of their children."
      />

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-zinc-500">
          {families.length} response{families.length === 1 ? '' : 's'} · showing{' '}
          {range.label.toLowerCase()}
          {selectedGrades.length > 0 && ` · including ${selectedGrades.join(', ')}`}
        </p>
        <CsvDownloadButton href={buildExportHref(sp)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <BarChartCard
          title="Children's grade levels"
          data={childGrades}
          color={BAR_COLORS[0]}
        />
        <BarChartCard title="Topics of interest" data={topics} color={BAR_COLORS[1]} />
        <BarChartCard
          title="Times of year that work"
          data={season}
          color={BAR_COLORS[2]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DonutCard title="How they'd participate" data={participation} />
        <DonutCard title="Ideal program duration" data={programDuration} />
        <DonutCard title="Reasonable travel time" data={travelTime} />
      </div>
    </div>
  )
}
