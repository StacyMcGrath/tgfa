import { SurveyForm } from './_components/survey-form'

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <header className="mb-10 space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Field trip interest survey
        </h1>
        <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
          We&apos;re working with a local nonprofit community garden that grows organic
          produce for donation and distribution to local food pantries. As part of growing
          their community, they are researching a potential field trip program. Thank you
          for taking a moment to share your thoughts to help inform how this program is
          shaped.
        </p>
      </header>
      <SurveyForm />
    </main>
  )
}
