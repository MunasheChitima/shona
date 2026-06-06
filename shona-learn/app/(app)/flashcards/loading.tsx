export default function FlashcardsLoading() {
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-12">
          <div className="h-9 w-56 bg-stone-100 rounded-2xl mb-3 animate-pulse" />
          <div className="h-4 w-72 max-w-full bg-stone-100 rounded-2xl animate-pulse" />
        </div>
        <div className="space-y-12">
          {Array.from({ length: 2 }).map((_, s) => (
            <section key={s}>
              <div className="h-7 w-40 bg-stone-100 rounded-2xl mb-5 animate-pulse" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/80 backdrop-blur rounded-2xl p-6 border border-stone-200 animate-pulse"
                  >
                    <div className="h-5 w-2/3 bg-stone-100 rounded-2xl mb-2" />
                    <div className="h-4 w-1/3 bg-stone-100 rounded-2xl mb-4" />
                    <div className="h-1 w-full bg-stone-100 rounded-full" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
