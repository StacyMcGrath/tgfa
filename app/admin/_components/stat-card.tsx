export function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint?: string
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-1 text-3xl font-semibold text-brand-dark-blue tabular-nums">{value}</div>
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </div>
  )
}
