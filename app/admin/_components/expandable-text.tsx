'use client'

import { useState, type ReactNode } from 'react'

const COLLAPSED_LENGTH = 240

export function ExpandableText({
  text,
  highlightQuery,
}: {
  text: string
  highlightQuery?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const isLong = text.length > COLLAPSED_LENGTH
  const displayed = expanded || !isLong ? text : `${text.slice(0, COLLAPSED_LENGTH)}…`

  return (
    <p className="text-sm text-zinc-700 whitespace-pre-wrap">
      {highlightQuery ? highlight(displayed, highlightQuery) : displayed}
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="ml-1 text-brand-dark-blue hover:underline"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </p>
  )
}

function highlight(text: string, query: string): ReactNode {
  if (!query) return text
  const re = new RegExp(escapeRegex(query), 'i')
  const parts: ReactNode[] = []
  let remaining = text
  let key = 0

  while (remaining) {
    const match = remaining.match(re)
    if (!match || match.index === undefined) {
      parts.push(remaining)
      break
    }
    if (match.index > 0) {
      parts.push(remaining.slice(0, match.index))
    }
    parts.push(
      <mark key={key++} className="bg-brand-light-green/60 text-brand-dark-blue rounded px-0.5">
        {match[0]}
      </mark>,
    )
    remaining = remaining.slice(match.index + match[0].length)
  }

  return <>{parts}</>
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
