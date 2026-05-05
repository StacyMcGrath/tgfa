import { resolveRange, bucketSize } from '@/lib/dashboard/date-range'
import {
  fetchTeachers,
  fetchFamilies,
  bucketByDate,
  countMulti,
  countSingle,
} from '@/lib/dashboard/queries'
import { StatCard } from './_components/stat-card'
import { OverTimeChart } from './_components/charts'

type SearchParams = Record<string, string | string[] | undefined>

export default async function OverviewPage({
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

  const [teachers, families] = await Promise.all([
    fetchTeachers(range),
    fetchFamilies(range),
  ])

  const teacherCount = teachers.length
  const familyCount = families.length
  const total = teacherCount + familyCount

  const overTime = bucketByDate(teachers, families, bucketSize(range))

  const teacherTopics = countMulti(teachers, 'topics')
  const familyTopics = countMulti(families, 'topics')
  // Combined teacher + family for season; type widening with `any[]` cast since the
  // two row types differ but both have `season: string[]`.
  const allSeasons = countMulti(
    [...teachers, ...families] as { season: string[] }[],
    'season',
  )
  const allDurations = countSingle(
    [...teachers, ...families] as { program_duration: string }[],
    'program_duration',
  )

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-500">Showing {range.label.toLowerCase()}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total responses" value={total} />
        <StatCard label="Teachers" value={teacherCount} />
        <StatCard label="Parents / caregivers" value={familyCount} />
      </div>

      <OverTimeChart
        title={`Submissions over time (${bucketSize(range) === 'day' ? 'daily' : 'weekly'})`}
        data={overTime}
      />

      <section>
        <h2 className="text-base font-semibold text-zinc-900 mb-3">Key takeaways</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Top teacher topic"
            value={teacherTopics[0]?.name ?? '—'}
            hint={
              teacherTopics[0]
                ? `${teacherTopics[0].count} mention${teacherTopics[0].count === 1 ? '' : 's'}`
                : undefined
            }
          />
          <StatCard
            label="Top family topic"
            value={familyTopics[0]?.name ?? '—'}
            hint={
              familyTopics[0]
                ? `${familyTopics[0].count} mention${familyTopics[0].count === 1 ? '' : 's'}`
                : undefined
            }
          />
          <StatCard
            label="Most popular season"
            value={allSeasons[0]?.name ?? '—'}
            hint={
              allSeasons[0]
                ? `${allSeasons[0].count} pick${allSeasons[0].count === 1 ? '' : 's'}`
                : undefined
            }
          />
          <StatCard
            label="Common program length"
            value={allDurations[0]?.name ?? '—'}
            hint={
              allDurations[0]
                ? `${allDurations[0].count} pick${allDurations[0].count === 1 ? '' : 's'}`
                : undefined
            }
          />
        </div>
      </section>
    </div>
  )
}
