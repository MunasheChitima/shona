import Link from 'next/link'

const HERO_WORDS = [
  { shona: 'mhoro', english: 'hello' },
  { shona: 'masikati', english: 'good day' },
  { shona: 'manheru', english: 'good evening' },
  { shona: 'mhoroi', english: 'greetings to you' },
] as const

const VALUE_PILLARS = [
  {
    title: 'language with lineage',
    shona: 'mutauro une midzi',
    description:
      'every phrase is taught with history, social context, and the respect patterns that make shona feel truly alive.',
    span: 'md:col-span-2',
    icon: '🌳',
  },
  {
    title: 'diaspora confidence',
    shona: 'kumba kuri mumoyo',
    description:
      'built for people who heard shona growing up and want to read and write with confidence at home, weddings, and family calls.',
    span: 'md:col-span-1',
    icon: '🌍',
  },
  {
    title: 'spaced-repetition flashcards',
    shona: 'kudzokorora',
    description:
      'vocabulary decks organised by unit and difficulty so words you learn today stick around long enough to use tomorrow.',
    span: 'md:col-span-1',
    icon: '🃏',
  },
  {
    title: 'progress you can feel',
    shona: 'kufambira mberi',
    description:
      'micro-lessons and cultural quiz games stack into real language ability even when you only have ten minutes.',
    span: 'md:col-span-2',
    icon: '⚡',
  },
] as const

const EXPERIENCE_STEPS = [
  {
    step: '01',
    title: 'enter the courtyard',
    body: 'start with everyday greetings and bite-sized lessons that feel welcoming from the first tap.',
  },
  {
    step: '02',
    title: 'build your vocabulary',
    body: 'move through curated units with flashcards, translation practice, and culturally grounded examples.',
  },
  {
    step: '03',
    title: 'play and reinforce',
    body: 'memory match, cultural quizzes, and story-completion games turn what you learned into something you remember.',
  },
] as const

const IMPACT_METRICS = [
  { value: '5-10 min', label: 'daily sessions' },
  { value: 'culture-led', label: 'lesson design' },
  { value: 'spaced repetition', label: 'built in' },
] as const

const CULTURE_NOTES = [
  'respect forms that shift how greetings work across generations.',
  'food, family, and ceremony vocabulary used in real zimbabwean life.',
  'story-driven memory games that make language emotionally memorable.',
] as const

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#fffdf7] text-stone-900">
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-[#fffdf7]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <Link
            href="/"
            className="group flex items-center gap-2 tracking-tight text-stone-900 transition hover:text-stone-700"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-base ring-1 ring-stone-200">
              🇿🇼
            </span>
            <span className="text-sm font-medium sm:text-base">shona learn</span>
          </Link>
          <nav className="flex items-center gap-3" aria-label="Primary">
            <Link
              href="/learn"
              className="rounded-full bg-stone-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              start learning
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="relative px-6 pb-24 pt-16 lg:pb-28 lg:pt-20">
          <div className="relative mx-auto max-w-6xl">
            <div className="grid items-center gap-16 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12">
              <div className="max-w-2xl lg:max-w-none">
                <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white/70 px-3 py-1 text-xs font-medium tracking-wide text-stone-600">
                  open beta · built with care
                </p>
                <h1 className="text-4xl font-medium leading-[1.05] tracking-tight text-stone-900 sm:text-5xl md:text-6xl">
                  learn shona the way it&apos;s actually spoken.
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-stone-700">
                  structured lessons, real phrases, cultural depth. built for diaspora families,
                  global learners, and anyone ready to sound natural.
                </p>

                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Link
                    href="/learn"
                    className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-base font-medium text-white transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
                  >
                    begin your journey
                  </Link>
                  <Link
                    href="/games"
                    className="inline-flex items-center justify-center text-base font-medium text-stone-900 underline-offset-4 hover:underline"
                  >
                    explore the games
                  </Link>
                </div>

                <div className="mt-14 grid gap-4 sm:grid-cols-3">
                  {IMPACT_METRICS.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-4 backdrop-blur">
                      <p className="text-lg font-medium tracking-tight text-stone-900">{metric.value}</p>
                      <p className="mt-1 text-sm text-stone-500">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mx-auto w-full max-w-md lg:mr-0 lg:ml-auto lg:max-w-lg">
                <div className="relative space-y-4 rounded-2xl border border-stone-200 bg-white/80 p-6 backdrop-blur">
                  <div className="rounded-xl border border-stone-200 bg-[#fffdf7] p-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-stone-500">phrases you&apos;ll learn</p>
                    <div className="mt-3 space-y-2">
                      {HERO_WORDS.map((word) => (
                        <div key={word.shona} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 ring-1 ring-stone-100">
                          <div>
                            <p className="text-lg font-medium tracking-tight text-stone-900">{word.shona}</p>
                            <p className="text-xs text-stone-500">{word.english}</p>
                          </div>
                          <span className="h-1.5 w-12 rounded-full bg-emerald-600" aria-hidden />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-stone-200 bg-[#fffdf7] p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-stone-900">lesson progress</p>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        tracked
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-stone-100">
                      <div className="h-full w-3/4 rounded-full bg-emerald-600" />
                    </div>
                    <p className="mt-2 text-xs text-stone-500">bite-sized units and reviews keep you moving.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/learn"
                      className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-center text-sm font-medium text-stone-900 transition hover:border-stone-300"
                    >
                      lessons
                    </Link>
                    <Link
                      href="/flashcards"
                      className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-center text-sm font-medium text-stone-900 transition hover:border-stone-300"
                    >
                      flashcards
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-stone-200 bg-white/60 py-5">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 text-center text-sm text-stone-600">
            <span className="font-medium text-stone-900">zimbabwean identity</span>
            <span className="hidden text-stone-300 sm:inline" aria-hidden>·</span>
            <span>family-centered vocabulary</span>
            <span className="hidden text-stone-300 sm:inline" aria-hidden>·</span>
            <span>bite-sized daily lessons</span>
            <span className="hidden text-stone-300 sm:inline" aria-hidden>·</span>
            <span>culture in every lesson</span>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl">
              <h2 className="text-3xl font-medium tracking-tight text-stone-900 md:text-4xl">bright, alive, and rooted in zimbabwe.</h2>
              <p className="mt-4 text-lg text-stone-700">
                every section is designed to feel warm and intentional while honoring authentic language and culture.
              </p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {VALUE_PILLARS.map((f) => (
                <article
                  key={f.title}
                  className={`group relative rounded-2xl border border-stone-200 bg-white/80 p-8 backdrop-blur transition-colors hover:border-stone-300 ${f.span}`}
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xl">
                      {f.icon}
                    </span>
                    <div>
                      <h3 className="text-lg font-medium tracking-tight text-stone-900">{f.title}</h3>
                      <p className="mt-1 text-sm italic text-emerald-700">{f.shona}</p>
                      <p className="mt-3 leading-relaxed text-stone-700">{f.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-medium tracking-tight text-stone-900 md:text-4xl">a journey built like a story.</h2>
              <p className="mt-4 text-lg text-stone-700">
                every stage moves you from listening to fluent expression without losing joy.
              </p>
            </div>
            <ol className="mt-14 grid gap-6 md:grid-cols-3">
              {EXPERIENCE_STEPS.map((s) => (
                <li
                  key={s.step}
                  className="relative rounded-2xl border border-stone-200 bg-white/80 p-8 backdrop-blur"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-900 text-sm font-medium text-white">
                    {s.step}
                  </span>
                  <h3 className="mt-5 text-lg font-medium tracking-tight text-stone-900">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-stone-700">{s.body}</p>
                </li>
              ))}
            </ol>

            <div className="mt-12 rounded-2xl border border-stone-200 bg-white/80 p-8 backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-widest text-emerald-700">culture notes inside the curriculum</p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {CULTURE_NOTES.map((note) => (
                  <p key={note} className="rounded-xl border border-stone-100 bg-[#fffdf7] p-4 text-sm leading-relaxed text-stone-700">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-stone-200 px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <blockquote className="text-2xl font-medium leading-snug tracking-tight text-stone-900 md:text-3xl">
              mutauro unobatanidza mwoyo —{' '}
              <span className="text-emerald-700">language is where hearts meet and recognize each other.</span>
            </blockquote>
            <p className="mt-6 text-stone-600">
              shona learn is built around real conversation and cultural depth — gentle progress that respects your pace.
            </p>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl rounded-2xl border border-stone-200 bg-white/80 p-12 text-center backdrop-blur">
            <h2 className="text-3xl font-medium tracking-tight text-stone-900 md:text-4xl">ready to start?</h2>
            <p className="mt-4 text-lg text-stone-700">
              step into a learning experience built for the way shona is actually spoken.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center rounded-full bg-stone-900 px-8 py-3 text-base font-medium text-white transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
              >
                start learning now
              </Link>
              <Link
                href="/flashcards"
                className="inline-flex items-center justify-center text-base font-medium text-stone-900 underline-offset-4 hover:underline"
              >
                try a flashcard deck
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-[#fffdf7] px-6 py-10 text-sm text-stone-600">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-center sm:text-left">
            <span className="font-medium text-stone-900">shona learn</span>
            <span className="text-stone-400"> · </span>
            built with care for shona language and culture.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <Link href="/learn" className="text-stone-700 hover:text-stone-900">
              lessons
            </Link>
            <Link href="/flashcards" className="text-stone-700 hover:text-stone-900">
              flashcards
            </Link>
            <Link href="/games" className="text-stone-700 hover:text-stone-900">
              games
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
