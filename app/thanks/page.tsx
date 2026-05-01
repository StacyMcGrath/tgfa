export default function ThanksPage() {
  return (
    <main className="mx-auto flex max-w-xl flex-1 flex-col justify-center px-6 py-16 text-center">
      <div className="mb-4 flex justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-10 w-10 text-emerald-700"
          aria-hidden="true"
        >
          <path d="M20 4c-1 0-12-1-15 8-1 3 0 7 3 9 1-3 3-6 6-7-2 2-4 5-5 8 1 0 2 1 3 1 8 0 13-9 8-19z" />
        </svg>
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-emerald-900">
        Thank you.
      </h1>
      <p className="mt-4 text-base leading-7 text-zinc-700">
        Your response has been received. Your input will help shape future programming.
      </p>
    </main>
  )
}
