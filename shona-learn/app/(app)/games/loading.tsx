export default function GamesLoading() {
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="h-10 w-56 bg-gray-200 rounded mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-80 max-w-full bg-gray-100 rounded mx-auto animate-pulse" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/90 rounded-2xl p-6 shadow-soft border animate-pulse">
              <div className="w-14 h-14 bg-gray-200 rounded-2xl mb-4" />
              <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-full bg-gray-100 rounded mb-1" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
