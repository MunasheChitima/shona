'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const [user, setUser] = useState<{ name: string } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-hero overflow-hidden relative">
      {/* Zimbabwean Flag Pattern Overlay */}
      <div className="absolute inset-0 opacity-10 flag-stripes"></div>
      
      <div className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="mb-6">
            <div className="mb-4">
              <span className="text-6xl animate-bounce-gentle">🇿🇼</span>
            </div>
            <h1 className="text-responsive-xl font-black text-white mb-4 drop-shadow-lg">
              The language of home
            </h1>
            <div className="w-24 h-1 bg-flag-yellow mx-auto rounded-full mb-4 animate-pulse-glow"></div>
          </div>

          <p className="text-responsive-lg text-white mb-8 font-medium drop-shadow-md">
            Learn Shona — whether you're reconnecting with your roots, or learning it for the people you love.
          </p>
        </div>

        {/* Welcome Card */}
        <div className="w-full max-w-3xl mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-large p-8 border border-white/20 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-6xl opacity-30">🇿🇼</div>

            <div className="relative z-10">
              {user ? (
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-3 text-gray-800">
                    Mhoro, {user.name?.split(' ')[0]}! 👋
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Pick up where you left off.
                  </p>
                  <Link href="/learn">
                    <button className="bg-gradient-green hover:bg-gradient-sky text-white font-bold py-4 px-8 rounded-2xl shadow-medium transition-all duration-200 hover:scale-105">
                      Continue Learning →
                    </button>
                  </Link>
                </div>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-4 text-gray-800">
                    Unoyeuka here?
                  </h2>
                  <p className="text-base text-gray-500 italic mb-4">Do you remember?</p>

                  <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                    For Zimbabweans in the diaspora who grew up hearing Shona but never quite learned to speak it back. For partners who want to truly belong at family gatherings. For kids growing up between two worlds. <span className="font-semibold text-gray-800">Shona, taught the way it's meant to be felt.</span>
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/register">
                      <button className="bg-gradient-zimbabwe text-white font-bold py-4 px-8 rounded-2xl shadow-medium transition-all duration-200 hover:scale-105">
                        Start Learning — It's Free
                      </button>
                    </Link>
                    <Link href="/login">
                      <button className="bg-white text-gray-700 font-bold py-4 px-8 rounded-2xl shadow-medium border border-gray-200 hover:bg-gray-50 transition-colors">
                        Sign In
                      </button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-6xl">
          <h3 className="text-2xl font-bold text-center mb-2 text-gray-800">
            Built for how you actually live
          </h3>
          <p className="text-center text-gray-600 mb-8">Not a generic language app. Something made for your story.</p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: "👋",
                title: "Start with mhoro",
                description: "Every Shona conversation begins with a greeting. We start there too — with the words your family already says.",
                color: "from-green-400 to-green-600"
              },
              {
                emoji: "🏡",
                title: "Built for the diaspora",
                description: "You grew up hearing it at home, at braais, in your gogo's prayers. Now learn to say it back — properly.",
                color: "from-amber-400 to-orange-500"
              },
              {
                emoji: "👨‍👩‍👧",
                title: "Learn together",
                description: "Your partner can learn alongside you. Your kids can grow up knowing Shona. Share the language that connects your family to Zimbabwe.",
                color: "from-pink-400 to-rose-500"
              },
              {
                emoji: "🇿🇼",
                title: "Real Zimbabwean culture",
                description: "Not just vocabulary — the meaning behind the words. The customs, the context, the warmth of Zimbabwean life.",
                color: "from-flag-green to-emerald-600"
              },
              {
                emoji: "⏱️",
                title: "5 minutes a day",
                description: "Short lessons that fit into real life. On your commute, at lunch, after the kids are in bed. Progress adds up.",
                color: "from-blue-400 to-blue-600"
              },
              {
                emoji: "📈",
                title: "From mhoro to mahwehwe",
                description: "60 lessons across 13 units — with dedicated grammar bridges and richer practice — from first words toward real conversations, step by step.",
                color: "from-purple-400 to-purple-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 interactive-card border border-white/20 shadow-soft hover:-translate-y-2 transition-transform duration-200"
              >
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h4 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center w-full max-w-3xl">
          <div className="bg-gradient-zimbabwe rounded-3xl p-10 text-white shadow-large relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 flag-stripes"></div>

            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">Ready to come home to Shona?</h3>
              <p className="text-lg mb-8 opacity-90 max-w-lg mx-auto">
                Join learners reconnecting with the language their families carry. Start with a single greeting — today.
              </p>
              {!user && (
                <Link href="/register">
                  <button className="bg-white text-green-700 font-bold py-4 px-10 rounded-2xl interactive-button shadow-medium hover:scale-105 transition-transform duration-200 text-lg">
                    Start Learning — It's Free
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
