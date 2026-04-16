import Link from 'next/link'

const HERO_WORDS = [
  { shona: 'Mhoro', english: 'Hello', color: 'from-[#009739] to-[#fce300]' },
  { shona: 'Masikati', english: 'Good day', color: 'from-[#fce300] to-[#ef3340]' },
  { shona: 'Makorokoto', english: 'Congratulations', color: 'from-[#0d8aed] to-[#009739]' },
] as const

const VALUE_PILLARS = [
  {
    title: 'Language with lineage',
    shona: 'Mutauro une midzi',
    description:
      'Every phrase is taught with history, social context, and the respect patterns that make Shona feel truly alive.',
    span: 'md:col-span-2',
    accent: 'from-[#fce300]/25 via-transparent to-transparent',
    icon: '🪘',
  },
  {
    title: 'Diaspora confidence',
    shona: 'Kumba kuri mumoyo',
    description:
      'Built for people who heard Shona growing up and now want to speak with confidence at home, weddings, and family calls.',
    span: 'md:col-span-1',
    accent: 'from-[#ef3340]/20 via-transparent to-transparent',
    icon: '🌍',
  },
  {
    title: 'Pronunciation studio',
    shona: 'Kudzidzira matauriro',
    description:
      'Train rhythm, tone, and articulation with guided audio loops designed around real Zimbabwean speaking patterns.',
    span: 'md:col-span-1',
    accent: 'from-[#0d8aed]/20 via-transparent to-transparent',
    icon: '🎙️',
  },
  {
    title: 'Progress you can feel',
    shona: 'Kufambira mberi',
    description:
      'Micro-lessons, quests, and memory games stack into speaking ability even when you only have ten minutes.',
    span: 'md:col-span-2',
    accent: 'from-emerald-400/20 via-transparent to-transparent',
    icon: '⚡',
  },
] as const

const EXPERIENCE_STEPS = [
  {
    step: '01',
    title: 'Enter the courtyard',
    body: 'Start with everyday greetings and confidence-building listening drills that feel welcoming from the first tap.',
  },
  {
    step: '02',
    title: 'Build your voice',
    body: 'Combine pronunciation studio, guided conversation practice, and culturally grounded vocabulary to sound natural.',
  },
  {
    step: '03',
    title: 'Speak with pride',
    body: 'Unlock story games and real-life phrase missions designed for family moments, travel, and community spaces.',
  },
] as const

const IMPACT_METRICS = [
  { value: '5-10 min', label: 'daily sessions', tone: 'text-[#fce300]' },
  { value: 'Audio-first', label: 'speaking flow', tone: 'text-[#7dd3fc]' },
  { value: 'Culture-led', label: 'lesson design', tone: 'text-[#86efac]' },
] as const

const CULTURE_NOTES = [
  'Respect forms that shift how greetings work across generations.',
  'Food, family, and ceremony vocabulary used in real Zimbabwean life.',
  'Story-driven memory games that make language emotionally memorable.',
] as const

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-clip bg-[#041006] text-white">
      <div className="pointer-events-none fixed inset-0 landing-hero-mesh -z-30" aria-hidden />
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] flag-stripes -z-20" aria-hidden />
      <div
        className="pointer-events-none fixed -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-[#fce300]/10 blur-[120px] -z-10"
        aria-hidden
      />

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
        <section className="relative overflow-hidden px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-28">
          <div className="relative mx-auto max-w-7xl">
            <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#fce300]/10 blur-3xl" aria-hidden />
            <div className="grid items-center gap-14 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12">
              <div className="animate-slide-in-up max-w-2xl lg:max-w-none">
                <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#fce300] ring-1 ring-white/15">
                  <span aria-hidden>✶</span>
                  Zimbabwean soul, global polish
                  <span className="text-white/50 normal-case font-medium">· ChiShona chinodada</span>
                </p>
                <h1 className="font-black leading-[1.05] tracking-tight text-[clamp(2rem,5vw,3.35rem)]">
                  The most immersive way to{' '}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-[#fce300] via-white to-[#fce300] bg-clip-text text-transparent">
                      live the Shona language
                    </span>
                    <span
                      className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-[#009739] via-[#fce300] to-[#ef3340] opacity-90"
                      aria-hidden
                    />
                  </span>{' '}
                  from anywhere in the world.
                </h1>
                <p className="mt-6 text-lg leading-relaxed text-white/85 sm:text-xl">
                  Designed for diaspora families, curious learners, and culture lovers who want more than phrases:
                  sound, identity, and belonging built into every lesson.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href="/learn"
                    className="inline-flex items-center justify-center rounded-2xl bg-[#fce300] px-8 py-4 text-base font-bold text-[#001f0d] shadow-xl shadow-black/25 transition hover:-translate-y-0.5 hover:bg-[#fff48a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Begin your Shona journey
                  </Link>
                  <Link
                    href="/games"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Explore cultural games
                  </Link>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {IMPACT_METRICS.map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-white/15 bg-black/20 px-4 py-3">
                      <p className={`text-xl font-black ${metric.tone}`}>{metric.value}</p>
                      <p className="text-sm text-white/70">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate-slide-in-right relative mx-auto w-full max-w-md lg:mr-0 lg:ml-auto lg:max-w-lg">
                <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-[#fce300]/20 via-transparent to-[#ef3340]/15 blur-2xl" aria-hidden />
                <div className="relative space-y-4 rounded-3xl border border-white/20 bg-white/10 p-5 shadow-2xl shadow-black/40 backdrop-blur-md sm:p-6">
                  <div className="rounded-2xl border border-white/15 bg-[#00190d]/80 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#fce300]/90">Live phrase stream</p>
                    <div className="mt-3 space-y-2">
                      {HERO_WORDS.map((word) => (
                        <div key={word.shona} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2">
                          <div>
                            <p className="font-serif text-xl font-semibold text-white">{word.shona}</p>
                            <p className="text-xs text-white/60">{word.english}</p>
                          </div>
                          <span
                            className={`h-2.5 w-16 rounded-full bg-gradient-to-r ${word.color}`}
                            aria-hidden
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-black/25 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-white">Rhythm and tone tracker</p>
                      <span className="rounded-full bg-emerald-300/20 px-2 py-0.5 text-xs font-semibold text-emerald-200">
                        Active
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#009739] via-[#fce300] to-[#ef3340]" />
                    </div>
                    <p className="mt-2 text-xs text-white/65">You are sounding more natural every session.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      href="/practice/sounds"
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      Sound drills
                    </Link>
                    <Link
                      href="/flashcards"
                      className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      Flashcards
                    </Link>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-white/50">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#22c55e]" aria-hidden />
                    Crafted for momentum, not pressure.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-black/20 py-4 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 text-center text-sm text-white/70 sm:text-base">
            <span className="font-semibold text-white">Zimbabwean identity</span>
            <span className="hidden sm:inline text-white/30" aria-hidden>
              ·
            </span>
            <span>Family-centered vocabulary</span>
            <span className="hidden sm:inline text-white/30" aria-hidden>
              ·
            </span>
            <span>Voice rhythm coaching</span>
            <span className="hidden sm:inline text-white/30" aria-hidden>
              ·
            </span>
            <span>Culture woven into every lesson</span>
          </div>
        </section>

        <section className="bg-[#faf7f2] px-4 py-24 text-[#1c1917] sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Not just a language app, a cultural homecoming</h2>
              <p className="mt-4 text-lg text-[#57534e]">
                We blend modern learning design with Zimbabwean warmth so every lesson helps you sound natural and feel connected.
              </p>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {VALUE_PILLARS.map((f) => (
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

        <section className="bg-gradient-to-b from-[#faf7f2] to-white px-4 py-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-3xl font-black tracking-tight text-[#1c1917] sm:text-4xl">A journey built like a story</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-lg text-[#57534e]">
              Every stage is designed to move you from listening to fluent expression without losing joy.
            </p>
            <ol className="mt-14 grid gap-8 md:grid-cols-3">
              {EXPERIENCE_STEPS.map((s) => (
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

            <div className="mt-12 rounded-3xl border border-[#e7e5e4] bg-[#fffdfa] p-8 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-widest text-[#a16207]">Culture notes inside the curriculum</p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {CULTURE_NOTES.map((note) => (
                  <p key={note} className="rounded-2xl bg-[#f5f5f4] p-4 text-sm leading-relaxed text-[#57534e]">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[#e7e5e4] bg-[#1c1917] px-4 py-16 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <blockquote className="font-serif text-2xl font-medium leading-snug sm:text-3xl">
              Mutauro unobatanidza mwoyo —{' '}
              <span className="text-[#fce300]">language is where hearts meet and recognize each other.</span>
            </blockquote>
            <p className="mt-6 text-[#a8a29e]">
              Shona Learn is built for presence, pride, and true connection, not empty streaks or shallow memorization.
            </p>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#009739] px-4 py-20 text-white sm:px-6 lg:px-8">
          <div className="absolute inset-0 opacity-20 flag-stripes" aria-hidden />
          <div className="relative mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Ready for a bold new way to learn Shona?</h2>
            <p className="mt-4 text-lg text-white/90">
              Step into a premium Zimbabwean learning experience and make your next conversation the one you are proud of.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/learn"
                className="inline-flex items-center justify-center rounded-2xl bg-[#fce300] px-10 py-4 text-base font-bold text-[#001f0d] shadow-xl shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#fff48a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start learning now
              </Link>
              <Link
                href="/pronunciation"
                className="inline-flex items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-10 py-4 text-base font-bold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Train pronunciation
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
