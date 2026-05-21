// Route-segment skeleton — streams instantly while learn/page.tsx loads
// (including the SWR-bound data fetch). Keeps the perceived "tap → see
// something" latency under one frame.
export default function LearnLoading() {
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="h-10 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="mb-6 h-16 bg-white rounded-2xl shadow-soft animate-pulse" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/90 rounded-2xl shadow-soft p-6 border border-white/20 animate-pulse"
            >
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4" />
              <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-full bg-gray-100 rounded mb-1" />
              <div className="h-4 w-2/3 bg-gray-100 rounded mb-4" />
              <div className="h-3 w-20 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
