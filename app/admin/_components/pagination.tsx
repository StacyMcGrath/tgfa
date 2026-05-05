import Link from 'next/link'

export function Pagination({
  currentPage,
  totalPages,
  searchParams,
  paramKey = 'page',
}: {
  currentPage: number
  totalPages: number
  searchParams: Record<string, string | string[] | undefined>
  paramKey?: string
}) {
  if (totalPages <= 1) return null

  function buildHref(page: number): string {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(searchParams)) {
      if (k === paramKey) continue
      if (typeof v === 'string') params.set(k, v)
    }
    if (page > 1) params.set(paramKey, String(page))
    const qs = params.toString()
    return qs ? `?${qs}` : '?'
  }

  return (
    <nav className="flex items-center justify-between gap-3 mt-4 text-sm">
      <div className="text-zinc-500">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        {currentPage > 1 ? (
          <Link
            href={buildHref(currentPage - 1)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1 hover:border-zinc-400"
          >
            ← Previous
          </Link>
        ) : (
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-400">
            ← Previous
          </span>
        )}
        {currentPage < totalPages ? (
          <Link
            href={buildHref(currentPage + 1)}
            className="rounded-md border border-zinc-300 bg-white px-3 py-1 hover:border-zinc-400"
          >
            Next →
          </Link>
        ) : (
          <span className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-1 text-zinc-400">
            Next →
          </span>
        )}
      </div>
    </nav>
  )
}
