export default function FlashcardsLoading() {
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="h-10 w-72 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-gray-100 rounded mx-auto animate-pulse" />
        </div>
        <div className="max-w-4xl mx-auto space-y-8">
          {Array.from({ length: 3 }).map((_, s) => (
            <section key={s}>
              <div className="h-7 w-40 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white/80 rounded-2xl p-5 shadow-soft border animate-pulse">
                    <div className="w-full h-2 bg-gray-200 rounded-full mb-3" />
                    <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
                    <div className="h-4 w-1/3 bg-gray-100 rounded mb-3" />
                    <div className="h-2 w-full bg-gray-200 rounded-full" />
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
