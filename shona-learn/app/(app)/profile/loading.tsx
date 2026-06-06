export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Greeting */}
        <div className="mb-6 flex items-center gap-4 animate-pulse">
          <div className="h-14 w-14 flex-shrink-0 rounded-full bg-stone-200" />
          <div className="min-w-0 flex-1">
            <div className="mb-2 h-6 w-40 rounded bg-stone-200" />
            <div className="h-4 w-56 rounded bg-stone-100" />
          </div>
        </div>

        {/* Continue learning */}
        <div className="mb-6 h-24 rounded-2xl bg-stone-100 animate-pulse" />

        {/* Streak + daily goal */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="h-32 rounded-2xl border border-stone-200 bg-white/80 animate-pulse" />
          <div className="h-56 rounded-2xl border border-stone-200 bg-white/80 animate-pulse" />
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl border border-stone-200 bg-white/80 animate-pulse" />
          ))}
        </div>

        {/* Milestones */}
        <div className="mb-6 h-48 rounded-2xl border border-stone-200 bg-white/80 animate-pulse" />

        {/* Learning path + level */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 rounded-2xl border border-stone-200 bg-white/80 animate-pulse" />
          <div className="h-40 rounded-2xl border border-stone-200 bg-white/80 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
