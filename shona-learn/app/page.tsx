'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    setIsLoaded(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut" as const
      }
    }
  }

  const floatingElements = [
    { emoji: "🌟", delay: 0, position: "top-20 left-10" },
    { emoji: "🎯", delay: 0.5, position: "top-32 right-20" },
    { emoji: "🔊", delay: 1, position: "bottom-32 left-20" },
    { emoji: "🏆", delay: 1.5, position: "bottom-20 right-10" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 overflow-hidden relative">
      {/* Floating background elements */}
      {floatingElements.map((element, index) => (
        <motion.div
          key={index}
          className={`absolute text-4xl animate-float ${element.position} opacity-20`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ delay: element.delay, duration: 1 }}
        >
          {element.emoji}
        </motion.div>
      ))}

      <motion.div
        className="flex flex-col items-center justify-center min-h-screen p-4 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-12"
          variants={itemVariants}
        >
          <motion.div
            className="mb-6"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <h1 className="text-responsive-xl font-black bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Learn Shona
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-responsive-lg text-gray-700 mb-8 font-medium"
            variants={itemVariants}
          >
            🌍 Master the beautiful language of Zimbabwe with fun, interactive lessons!
          </motion.p>
        </motion.div>

        {/* Welcome Card */}
        <motion.div 
          className="w-full max-w-3xl mb-12"
          variants={itemVariants}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-large p-8 border border-white/20 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-6xl animate-sparkle">🇿🇼</div>
            <div className="absolute bottom-4 left-4 text-4xl animate-bounce-gentle">✨</div>
            
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Mauya! (Welcome!) 🎉
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Join thousands of learners discovering Shona through <span className="font-semibold text-green-600">fun games</span>, 
                <span className="font-semibold text-blue-600"> interactive exercises</span>, and 
                <span className="font-semibold text-purple-600"> voice practice</span>! 
                Perfect for everyone from curious kids to language enthusiasts.
              </p>
              
              {user ? (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-4 border border-green-200">
                    <p className="text-xl font-semibold text-gray-800">
                      Welcome back, <span className="text-green-600">{user.name}</span>! 🎊
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Ready to continue your Shona adventure?
                    </p>
                  </div>
                  <Link href="/learn">
                    <motion.button 
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-xl font-bold py-4 px-8 rounded-2xl interactive-button shadow-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🚀 Continue Learning
                    </motion.button>
                  </Link>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/register" className="flex-1">
                      <motion.button 
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white text-xl font-bold py-4 px-8 rounded-2xl interactive-button shadow-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        🎯 Get Started Free
                      </motion.button>
                    </Link>
                    <Link href="/login" className="flex-1">
                      <motion.button 
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xl font-bold py-4 px-8 rounded-2xl interactive-button shadow-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        🔑 Login
                      </motion.button>
                    </Link>
                  </div>
                  <p className="text-center text-sm text-gray-500">
                    ✨ No credit card required • Start learning in seconds
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="w-full max-w-6xl"
          variants={itemVariants}
        >
          <motion.h3 
            className="text-2xl font-bold text-center mb-8 text-gray-800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Why Learn with Us? 🌟
          </motion.h3>
          
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
                emoji: "🎨",
                title: "Beautiful Design",
                description: "Enjoy a colorful, engaging interface designed for learners of all ages and skill levels.",
                color: "from-pink-400 to-pink-600"
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
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 interactive-card border border-white/20 shadow-soft"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.6 }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.2 }
                }}
              >
                <div className={`text-5xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}>
                  {feature.emoji}
                </div>
                <h4 className="text-xl font-bold mb-3 text-gray-800">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="mt-16 text-center"
          variants={itemVariants}
        >
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-8 text-white shadow-large">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Your Shona Journey? 🚀</h3>
            <p className="text-lg mb-6 opacity-90">
              Join our community of learners and discover the beauty of Zimbabwe's language!
            </p>
            {!user && (
              <Link href="/register">
                <motion.button 
                  className="bg-white text-green-600 font-bold py-4 px-8 rounded-2xl interactive-button shadow-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Learning Now - It's Free! 🎉
                </motion.button>
              </Link>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
