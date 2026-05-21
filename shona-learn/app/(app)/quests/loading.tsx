export default function QuestsLoading() {
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-white/90 rounded-3xl p-6 shadow-soft border border-amber-100/40 animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 w-14 h-14 bg-gray-200 rounded-2xl" />
              <div className="flex-1">
                <div className="h-7 w-56 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-72 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="h-16 bg-gray-100 rounded-xl" />
              <div className="h-16 bg-gray-100 rounded-xl" />
              <div className="h-16 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
        {Array.from({ length: 2 }).map((_, g) => (
          <div key={g} className="mb-10">
            <div className="h-7 w-32 bg-gray-200 rounded mb-4 animate-pulse" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white/90 rounded-3xl p-6 shadow-soft border animate-pulse">
                  <div className="w-14 h-14 bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-5 w-2/3 bg-gray-200 rounded mb-2" />
                  <div className="h-4 w-full bg-gray-100 rounded mb-1" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded mb-4" />
                  <div className="h-10 w-full bg-gray-200 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
