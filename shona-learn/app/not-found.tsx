import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fffdf7] px-6 text-center text-stone-900">
      <div className="flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg ring-1 ring-stone-200">
          🇿🇼
        </span>
        <span className="text-base font-medium tracking-tight">shona learn</span>
      </div>

      <p className="mt-10 text-6xl font-medium tracking-tight text-stone-300">404</p>
      <h1 className="mt-4 text-2xl font-medium tracking-tight sm:text-3xl">
        this page wandered off.
      </h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-stone-600">
        we couldn&apos;t find what you were looking for. let&apos;s get you back to learning shona.
      </p>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/learn"
          className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
        >
          back to lessons
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center text-sm font-medium text-stone-700 underline-offset-4 transition hover:text-stone-900 hover:underline"
        >
          go home
        </Link>
      </div>
    </div>
  )
}
