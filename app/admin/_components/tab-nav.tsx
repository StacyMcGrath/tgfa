'use client'

import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

const TABS: { href: string; label: string }[] = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/teachers', label: 'Teachers' },
  { href: '/admin/families', label: 'Parents/Caregivers' },
  { href: '/admin/responses', label: 'All Open Responses' },
]

export function TabNav() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Carry the date-range params across tabs; drop pagination & search since they're tab-specific.
  const carry = new URLSearchParams()
  for (const [k, v] of searchParams.entries()) {
    if (k === 'range' || k === 'start' || k === 'end') carry.set(k, v)
  }
  const queryString = carry.toString() ? `?${carry.toString()}` : ''

  function navigate(href: string) {
    router.push(`${href}${queryString}`)
  }

  return (
    <nav className="border-b border-zinc-200">
      {/* Mobile: native select picker */}
      <div className="sm:hidden p-3">
        <label className="block">
          <span className="sr-only">Switch tab</span>
          <select
            value={pathname}
            onChange={(e) => navigate(e.target.value)}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:outline-none focus:ring-2 focus:ring-brand-dark-blue"
          >
            {TABS.map((tab) => (
              <option key={tab.href} value={tab.href}>
                {tab.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Desktop: tab bar */}
      <ul className="hidden sm:flex gap-1 -mb-px">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <li key={tab.href}>
              <Link
                href={`${tab.href}${queryString}`}
                className={`inline-block px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-brand-dark-blue text-brand-dark-blue'
                    : 'border-transparent text-zinc-600 hover:text-zinc-900 hover:border-zinc-300'
                }`}
              >
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
