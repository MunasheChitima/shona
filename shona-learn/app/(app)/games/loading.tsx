export default function GamesLoading() {
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
        <div className="mb-8">
          <div className="h-9 w-32 animate-pulse rounded bg-stone-200" />
          <div className="mt-3 h-4 w-80 max-w-full animate-pulse rounded bg-stone-100" />
        </div>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white/80 p-5"
            >
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-2xl bg-stone-200" />
              <div className="min-w-0 flex-1">
                <div className="h-5 w-1/3 animate-pulse rounded bg-stone-200" />
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-stone-100" />
                <div className="mt-2 h-3 w-1/4 animate-pulse rounded bg-stone-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
