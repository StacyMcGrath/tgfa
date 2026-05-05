import Link from 'next/link'

export function CsvDownloadButton({
  href,
  label = 'Download CSV',
}: {
  href: string
  label?: string
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white hover:border-zinc-400 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M12 4v12m0 0l-4-4m4 4l4-4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 18v2a1 1 0 001 1h14a1 1 0 001-1v-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </Link>
  )
}
