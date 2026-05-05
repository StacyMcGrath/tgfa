'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'

// Brand palette
const DARK_BLUE = '#0f3c57'
const LIGHT_GREEN = '#d0de97'
const DARK_GREEN = '#9ab643'
const ORANGE = '#e2602e'
const RED = '#b03812'

const PRIMARY = DARK_BLUE
const TEXT = '#52525b' // zinc-600
const GRID = '#e4e4e7' // zinc-200
// Distinct hues across the brand palette so adjacent slices contrast clearly.
const DONUT_COLORS = [DARK_BLUE, DARK_GREEN, ORANGE, RED, LIGHT_GREEN]

const cardClass = 'rounded-lg border border-zinc-200 bg-white p-5'
const cardTitleClass = 'text-sm font-semibold text-zinc-900 mb-3'

export function BarChartCard({
  title,
  data,
  emptyMessage = 'No responses yet.',
  color = PRIMARY,
}: {
  title: string
  data: { name: string; count: number }[]
  emptyMessage?: string
  color?: string
}) {
  if (data.length === 0) {
    return (
      <div className={cardClass}>
        <h3 className={cardTitleClass}>{title}</h3>
        <p className="text-sm text-zinc-500">{emptyMessage}</p>
      </div>
    )
  }

  // Per-row slot is 40px; bar inside is 18px tall, leaving the rest as breathing room.
  const height = Math.max(160, data.length * 40 + 24)

  return (
    <div className={cardClass}>
      <h3 className={cardTitleClass}>{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke={GRID} />
          <XAxis type="number" stroke={TEXT} fontSize={12} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            stroke={TEXT}
            fontSize={12}
            width={140}
            tick={{ fill: TEXT }}
          />
          <Tooltip
            cursor={{ fill: '#f4f4f5' }}
            contentStyle={{ backgroundColor: 'white', borderColor: GRID, fontSize: 12 }}
          />
          <Bar dataKey="count" fill={color} radius={[0, 4, 4, 0]} barSize={18}>
            {data.map((_, i) => (
              <Cell key={i} fill={color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Brand palette colors for bar-chart rotation across charts on a tab. */
export const BAR_COLORS = [DARK_BLUE, DARK_GREEN, ORANGE, RED] as const

export function DonutCard({
  title,
  data,
  emptyMessage = 'No responses yet.',
}: {
  title: string
  data: { name: string; count: number }[]
  emptyMessage?: string
}) {
  const total = data.reduce((sum, d) => sum + d.count, 0)

  if (total === 0) {
    return (
      <div className={cardClass}>
        <h3 className={cardTitleClass}>{title}</h3>
        <p className="text-sm text-zinc-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cardClass}>
      <h3 className={cardTitleClass}>{title}</h3>
      <div className="flex flex-col items-center gap-4">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <ul className="w-full space-y-1.5 text-sm">
          {data.map((d, i) => (
            <li key={d.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 min-w-0">
                <span
                  className="inline-block h-3 w-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                />
                <span className="text-zinc-700">{d.name}</span>
              </span>
              <span className="text-zinc-500 tabular-nums whitespace-nowrap">
                {d.count} ({Math.round((d.count / total) * 100)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function OverTimeChart({
  title,
  data,
}: {
  title: string
  data: { date: string; total: number }[]
}) {
  if (data.length === 0) {
    return (
      <div className={cardClass}>
        <h3 className={cardTitleClass}>{title}</h3>
        <p className="text-sm text-zinc-500">No responses yet.</p>
      </div>
    )
  }

  return (
    <div className={cardClass}>
      <h3 className={cardTitleClass}>{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="overTimeFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={DARK_BLUE} stopOpacity={0.35} />
              <stop offset="95%" stopColor={DARK_BLUE} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID} vertical={false} />
          <XAxis dataKey="date" stroke={TEXT} fontSize={11} />
          <YAxis stroke={TEXT} fontSize={11} allowDecimals={false} />
          <Tooltip
            cursor={{ stroke: PRIMARY, strokeOpacity: 0.3 }}
            contentStyle={{ backgroundColor: 'white', borderColor: GRID, fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke={PRIMARY}
            fill="url(#overTimeFill)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
