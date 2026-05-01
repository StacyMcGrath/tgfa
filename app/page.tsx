import { SurveyForm } from './_components/survey-form'

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <header className="mb-10 space-y-4">
        <div className="flex items-center gap-3">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-7 w-7 text-emerald-700"
            aria-hidden="true"
          >
            <path d="M20 4c-1 0-12-1-15 8-1 3 0 7 3 9 1-3 3-6 6-7-2 2-4 5-5 8 1 0 2 1 3 1 8 0 13-9 8-19z" />
          </svg>
          <h1 className="text-3xl font-semibold tracking-tight text-emerald-900">
            Field trip interest survey
          </h1>
        </div>
        <p className="text-base leading-7 text-zinc-700">
          We are working with a local nonprofit community garden that grows organic
          produce for donation and distribution to local food pantries. Their mission
          is Fighting Hunger and Growing Community. As part of growing community, they
          are researching potential field trip programs to enhance their engagement
          with community schools and youth. Thank you for taking a moment to share
          your thoughts and help shape future programming.
        </p>
      </header>
      <SurveyForm />
    </main>
  )
}
