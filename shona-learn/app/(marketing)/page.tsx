import Link from 'next/link'

const FEATURES = [
  {
    title: 'Mhoro first',
    shona: 'Kukwazisana',
    description:
      'Greetings, respect, and how Zimbabweans actually open a room — not robotic phrasebook drill.',
    span: 'md:col-span-2 md:row-span-1',
    accent: 'from-[#fce300]/25 to-transparent',
    icon: '👋',
  },
  {
    title: 'Diaspora-real',
    shona: 'Kumusha kunopfuura border',
    description:
      'Lessons that honour “I heard it at home my whole life” — bridging listening to confident speaking.',
    span: 'md:col-span-1',
    accent: 'from-[#ef3340]/15 to-transparent',
    icon: '🌍',
  },
  {
    title: 'Sound & culture',
    shona: 'Mutauro nemagariro',
    description:
      'Pronunciation practice plus the why behind words — warmth, humour, and context from Zimbabwe.',
    span: 'md:col-span-1',
    accent: 'from-[#0d8aed]/15 to-transparent',
    icon: '🇿🇼',
  },
  {
    title: 'Little windows of time',
    shona: 'Nguva diki',
    description:
      'Short sessions that fit commutes, lunch breaks, and bedtime — progress that does not need a sabbatical.',
    span: 'md:col-span-2',
    accent: 'from-emerald-400/15 to-transparent',
    icon: '⏱️',
  },
] as const

const STEPS = [
  { step: '1', title: 'Create a free account', body: 'No jargon — just your name and a password.' },
  { step: '2', title: 'Start with living greetings', body: 'Audio-first patterns you can use this weekend on a call home.' },
  { step: '3', title: 'Grow toward real talk', body: 'Vocabulary, games, and pronunciation that stack into conversation.' },
] as const

export default function Home() {
  return (
    <div className="min-h-screen text-white">
      {/* Background */}
      <div className="fixed inset-0 landing-hero-mesh -z-20" aria-hidden />
      <div className="fixed inset-0 opacity-[0.07] flag-stripes -z-10" aria-hidden />

      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#001f0d]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group flex items-center gap-2 font-bold tracking-tight text-white transition hover:text-[#fce300]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg ring-1 ring-white/15 transition group-hover:ring-[#fce300]/40">
              🇿🇼
            </span>
            <span className="text-sm sm:text-base">
              Shona Learn<span className="text-white/50 font-medium"> · ChiShona</span>
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary">
            <Link
              href="/learn"
              className="rounded-full bg-[#fce300] px-4 py-2 text-sm font-bold text-[#001f0d] shadow-lg shadow-black/20 transition hover:bg-[#fff48a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Start learning
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pb-20 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-28">
          <div className="relative mx-auto max-w-7xl">
            <div className="landing-shimmer-accent pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#fce300]/10 blur-3xl" aria-hidden />
            <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-12">
              <div className="animate-slide-in-up max-w-xl lg:max-w-none">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#fce300] ring-1 ring-white/15">
                  <span aria-hidden>✶</span>
                  Zvakare nezvino
                  <span className="text-white/50 normal-case font-medium">· Rooted and modern</span>
                </p>
                <h1 className="font-black leading-[1.05] tracking-tight text-[clamp(2rem,5vw,3.35rem)]">
                  Learn Shona the way{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-[#fce300] via-white to-[#fce300] bg-clip-text text-transparent">
                      your people
                    </span>
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-[#009739] via-[#fce300] to-[#ef3340] opacity-90"
                      aria-hidden
                    />
                  </span>{' '}
                  actually speak it.
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-white/85 sm:text-xl">
                  For diaspora kids who grew up hearing Shona in the kitchen. For partners learning for in-laws.
                  For anyone who wants more than tourist phrases —{' '}
                  <span className="font-semibold text-white">real sound, real culture, real belonging.</span>
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Link
                    href="/learn"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#fce300] px-8 py-4 text-base font-bold text-[#001f0d] shadow-xl shadow-black/25 transition hover:-translate-y-0.5 hover:bg-[#fff48a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Start learning — free
                  </Link>
                </div>

                <p className="mt-6 text-sm text-white/55">
                  <span className="font-medium text-white/75">Unoyeuka here?</span>{' '}
                  <span className="italic text-white/60">Do you remember?</span> — That is where we meet you.
                </p>
              </div>

              {/* Preview card stack */}
              <div className="relative mx-auto w-full max-w-md lg:mr-0 lg:ml-auto lg:max-w-lg animate-slide-in-right">
                <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-[#fce300]/20 via-transparent to-[#ef3340]/15 blur-2xl" aria-hidden />
                <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-[#fce300]/90">Today&apos;s beat</p>
                      <p className="mt-1 font-serif text-3xl font-bold text-white sm:text-4xl">Mhoro</p>
                      <p className="text-sm text-white/65">Hello · respect · how we begin</p>
                    </div>
                    <span className="rounded-2xl bg-black/25 px-3 py-1.5 text-xs font-semibold text-white/90 ring-1 ring-white/15">
                      Lesson 1
                    </span>
                  </div>
                  <div className="mt-6 space-y-3">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/30">
                      <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-[#009739] to-[#fce300]" />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Listen', 'Repeat', 'Meaning', 'Culture note'].map((label) => (
                        <span
                          key={label}
                          className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85 ring-1 ring-white/10"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 rounded-2xl border border-white/15 bg-black/20 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-white/45">Try saying</p>
                    <p className="mt-2 font-serif text-xl text-white">Mhoro, makadii?</p>
                    <p className="mt-1 text-sm text-white/60">Hello, how are you? (pl./respectful)</p>
                  </div>
                  <div className="mt-5 flex items-center gap-3 text-xs text-white/50">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" aria-hidden />
                    Built for short daily practice — not guilt trips.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pill strip */}
        <section className="border-y border-white/10 bg-black/20 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-center text-sm text-white/70 sm:text-base">
            <span className="font-semibold text-white">Diaspora</span>
            <span className="hidden sm:inline text-white/30" aria-hidden>
              ·
            </span>
            <span>Family tables</span>
            <span className="hidden sm:inline text-white/30" aria-hidden>
              ·
            </span>
            <span>Pronunciation</span>
            <span className="hidden sm:inline text-white/30" aria-hidden>
              ·
            </span>
            <span>Culture in the grammar</span>
          </div>
        </section>

        {/* Bento features */}
        <section className="bg-[#faf7f2] px-4 py-20 text-[#1c1917] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Made for your story — not a generic app</h2>
              <p className="mt-4 text-lg text-[#57534e]">
                Zimbabwean warmth in every screen: clear structure, honest encouragement, and language that carries home with you.
              </p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <article
                  key={f.title}
                  className={`group relative overflow-hidden rounded-3xl border border-[#e7e5e4] bg-white p-6 shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl md:p-8 ${f.span}`}
                >
                  <div
                    className={`pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-gradient-to-br ${f.accent} blur-2xl transition duration-500 group-hover:opacity-100`}
                    aria-hidden
                  />
                  <div className="relative flex items-start gap-4">
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[#f5f5f4] text-2xl ring-1 ring-[#e7e5e4]">
                      {f.icon}
                    </span>
                    <div>
                      <h3 className="text-xl font-bold text-[#1c1917]">{f.title}</h3>
                      <p className="mt-1 font-serif text-sm italic text-[#a16207]">{f.shona}</p>
                      <p className="mt-3 leading-relaxed text-[#57534e]">{f.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-gradient-to-b from-[#faf7f2] to-white px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-black tracking-tight text-[#1c1917] sm:text-4xl">From first tap to first sentence</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-[#57534e]">
              No overwhelm — just a path that respects how busy life already is.
            </p>
            <ol className="mt-14 grid gap-8 md:grid-cols-3">
              {STEPS.map((s) => (
                <li
                  key={s.step}
                  className="relative rounded-3xl border border-[#e7e5e4] bg-white p-8 shadow-md"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#001f0d] text-lg font-black text-[#fce300]">
                    {s.step}
                  </span>
                  <h3 className="mt-5 text-xl font-bold text-[#1c1917]">{s.title}</h3>
                  <p className="mt-2 leading-relaxed text-[#57534e]">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Quote */}
        <section className="border-t border-[#e7e5e4] bg-[#1c1917] px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <blockquote className="font-serif text-2xl font-medium leading-snug sm:text-3xl">
              Mutauro unobatanidza mhuri —{' '}
              <span className="text-[#fce300]">language is what draws a family together.</span>
            </blockquote>
            <p className="mt-6 text-[#a8a29e]">
              That is the point of Shona Learn: not perfection on day one —{' '}
              <span className="text-white/90">presence, pride, and being understood.</span>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative overflow-hidden bg-[#009739] px-4 py-20 text-white sm:px-6 lg:px-8">
          <div className="absolute inset-0 opacity-20 flag-stripes" aria-hidden />
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ready to come home to the language?</h2>
            <p className="mt-4 text-lg text-white/90">
              Start with one greeting. Let the sound of Shona feel familiar again — or for the first time, on purpose.
            </p>
            <div className="mt-10">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center rounded-2xl bg-[#fce300] px-10 py-4 text-base font-bold text-[#001f0d] shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#fff48a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Jump in and start learning
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-[#001509] px-4 py-10 text-sm text-white/55 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <p className="text-center sm:text-left">
            <span className="font-semibold text-white">Shona Learn</span>
            <span className="text-white/35"> · </span>
            ChiShona chinoshamisa — beautiful Shona.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/learn" className="font-medium text-white/80 hover:text-[#fce300]">
              Learn
            </Link>
            <Link href="/flashcards" className="font-medium text-white/80 hover:text-[#fce300]">
              Flashcards
            </Link>
            <Link href="/games" className="font-medium text-white/80 hover:text-[#fce300]">
              Games
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
