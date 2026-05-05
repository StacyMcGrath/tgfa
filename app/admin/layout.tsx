import type { ReactNode } from 'react'
import { getCurrentUser } from '@/lib/supabase/auth-server'
import { TabNav } from './_components/tab-nav'
import { DateRangePicker } from './_components/date-range-picker'
import { SignOutButton } from './_components/sign-out-button'

export const metadata = {
  title: 'Survey results',
}

// Admin pages read user-scoped data and live cookies — always render dynamically.
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  return (
    <div className="min-h-full bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-brand-dark-green"
              aria-hidden="true"
            >
              <path d="M20 4c-1 0-12-1-15 8-1 3 0 7 3 9 1-3 3-6 6-7-2 2-4 5-5 8 1 0 2 1 3 1 8 0 13-9 8-19z" />
            </svg>
            <h1 className="text-lg font-semibold text-brand-dark-blue">Survey results</h1>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-600">
            {user?.email && <span className="hidden sm:inline">{user.email}</span>}
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex justify-end mb-3">
          <DateRangePicker />
        </div>
        <TabNav />
        <div className="mt-6">{children}</div>
      </main>
    </div>
  )
}
