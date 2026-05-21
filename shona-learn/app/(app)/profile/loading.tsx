export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 animate-pulse">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-28 h-28 bg-gray-200 rounded-full" />
            <div className="flex-1 w-full">
              <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
              <div className="h-4 w-64 bg-gray-100 rounded mb-4" />
              <div className="h-3 w-full max-w-md bg-gray-200 rounded-full mb-3" />
              <div className="flex gap-4">
                <div className="h-5 w-24 bg-gray-100 rounded" />
                <div className="h-5 w-24 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg p-6 animate-pulse">
              <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
              <div className="h-4 w-60 bg-gray-100 rounded mb-2" />
              <div className="h-2 w-full bg-gray-200 rounded-full mt-4" />
            </div>
            <div className="bg-white rounded-3xl shadow-lg p-6 animate-pulse">
              <div className="h-5 w-24 bg-gray-200 rounded mb-4" />
              <div className="h-8 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-2 w-full bg-gray-200 rounded-full mt-3" />
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-6 animate-pulse">
            <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
