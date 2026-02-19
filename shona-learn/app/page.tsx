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
    <div className="min-h-screen bg-gradient-zimbabwe overflow-hidden relative">
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
              Learn Shona
            </h1>
            <div className="w-24 h-1 bg-flag-yellow mx-auto rounded-full mb-4 animate-pulse-glow"></div>
          </div>
          
          <p className="text-responsive-lg text-white mb-8 font-medium drop-shadow-md">
            🌍 Master the beautiful language of Zimbabwe with fun, interactive lessons!
          </p>
        </div>

        {/* Welcome Card */}
        <div className="w-full max-w-3xl mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-large p-8 border border-white/20 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-6xl">🇿🇼</div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">
                Welcome to Your Shona Learning Journey!
              </h2>
              
              <p className="text-lg text-gray-600 mb-6">
                Learn Shona, the beautiful language of Zimbabwe, through interactive lessons, pronunciation practice, and cultural immersion.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <div className="text-center">
                    <p className="text-gray-700 mb-4">Welcome back, {user.name}! 👋</p>
                    <Link href="/learn">
                      <button className="bg-gradient-green hover:bg-gradient-sky text-white font-bold py-4 px-8 rounded-2xl shadow-medium transition-all duration-200 hover:scale-105">
                        Continue Learning 🚀
                      </button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/lessons-preview">
                      <button className="bg-gradient-zimbabwe hover:bg-gradient-sky text-white font-bold py-4 px-8 rounded-2xl shadow-medium transition-all duration-200 hover:scale-105">
                        Explore Lessons 🔍
                      </button>
                    </Link>
                    <Link href="/register">
                      <button className="bg-white text-gray-800 font-bold py-4 px-8 rounded-2xl shadow-medium hover:bg-gray-50 transition-colors">
                        Start Learning 🎓
                      </button>
                    </Link>
                    <Link href="/login">
                      <button className="bg-white text-gray-800 font-bold py-4 px-8 rounded-2xl shadow-medium hover:bg-gray-50 transition-colors">
                        Sign In 👋
                      </button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-6xl">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
            Why Learn with Us? 🌟
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                emoji: "🎮",
                title: "Fun Games & Quizzes",
                description: "Learn through interactive multiple choice, matching, and puzzle games that make learning feel like play!",
                color: "from-green-400 to-green-600"
              },
              {
                emoji: "🔊",
                title: "Voice Practice",
                description: "Perfect your pronunciation with our advanced speech recognition and audio feedback system.",
                color: "from-blue-400 to-blue-600"
              },
              {
                emoji: "🏆",
                title: "Progress Tracking",
                description: "Earn XP, maintain streaks, unlock achievements, and watch your Shona skills grow!",
                color: "from-purple-400 to-purple-600"
              },
              {
                emoji: "🇿🇼",
                title: "Zimbabwean Culture",
                description: "Learn language through authentic cultural context, traditional stories, and Zimbabwean heritage.",
                color: "from-flag-green to-flag-yellow"
              },
              {
                emoji: "📱",
                title: "Works Everywhere",
                description: "Learn on your phone, tablet, or computer - your progress syncs across all devices.",
                color: "from-orange-400 to-orange-600"
              },
              {
                emoji: "🌟",
                title: "Age-Appropriate",
                description: "Content and design carefully crafted to engage everyone from 5-year-olds to adults.",
                color: "from-indigo-400 to-indigo-600"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 interactive-card border border-white/20 shadow-soft hover:-translate-y-2 transition-transform duration-200"
              >
                <div className={`text-5xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                  {feature.emoji}
                </div>
                <h4 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-zimbabwe rounded-3xl p-8 text-white shadow-large relative overflow-hidden">
            {/* Subtle flag pattern overlay */}
            <div className="absolute inset-0 opacity-5 flag-stripes"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Ready to Start Your Shona Journey? 🚀</h3>
              <p className="text-lg mb-6 opacity-90">
                Join our community of learners and discover the beauty of Zimbabwe's language!
              </p>
              {!user && (
                <Link href="/register">
                  <button className="bg-white text-flag-red font-bold py-4 px-8 rounded-2xl interactive-button shadow-medium hover:scale-105 transition-transform duration-200">
                    Start Learning Now - It's Free! 🎉
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
