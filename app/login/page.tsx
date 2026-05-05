import { Suspense } from 'react'
import { LoginForm } from './_components/login-form'

export const metadata = {
  title: 'Sign in',
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="mb-8 flex justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-10 w-10 text-brand-dark-green"
          aria-hidden="true"
        >
          <path d="M20 4c-1 0-12-1-15 8-1 3 0 7 3 9 1-3 3-6 6-7-2 2-4 5-5 8 1 0 2 1 3 1 8 0 13-9 8-19z" />
        </svg>
      </div>
      <h1 className="text-center text-2xl font-semibold tracking-tight text-brand-dark-blue">
        Sign in
      </h1>
      <p className="mt-2 text-center text-sm text-zinc-600">
        Enter your email and we&apos;ll send a magic link.
      </p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
