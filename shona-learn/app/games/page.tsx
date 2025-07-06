'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import { FaGamepad, FaMemory, FaMusic, FaBook, FaQuestion, FaPuzzlePiece, FaFire, FaStar, FaCrown } from 'react-icons/fa'

export default function GamesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [gameProgress, setGameProgress] = useState<any>({})

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    
    // Load game progress from localStorage
    const savedProgress = localStorage.getItem('gameProgress')
    if (savedProgress) {
      setGameProgress(JSON.parse(savedProgress))
    }
  }, [])

  const games = [
    {
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Match Shona words with their English translations',
      icon: FaMemory,
      color: 'from-purple-400 to-pink-500',
      difficulty: 'Easy',
      xpReward: 20,
      route: '/games/memory-match',
      category: 'Vocabulary'
    },
    {
      id: 'rhythm-tones',
      title: 'Rhythm Tones',
      description: 'Master Shona pronunciation with rhythm gameplay',
      icon: FaMusic,
      color: 'from-blue-400 to-cyan-500',
      difficulty: 'Medium',
      xpReward: 30,
      route: '/games/rhythm-tones',
      category: 'Pronunciation'
    },
    {
      id: 'story-complete',
      title: 'Story Complete',
      description: 'Complete stories using vocabulary from lessons',
      icon: FaBook,
      color: 'from-green-400 to-emerald-500',
      difficulty: 'Medium',
      xpReward: 25,
      route: '/games/story-complete',
      category: 'Comprehension'
    },
    {
      id: 'cultural-quiz',
      title: 'Cultural Quiz',
      description: 'Test your knowledge of Shona culture',
      icon: FaQuestion,
      color: 'from-yellow-400 to-orange-500',
      difficulty: 'Hard',
      xpReward: 35,
      route: '/games/cultural-quiz',
      category: 'Culture'
    },
    {
      id: 'word-builder',
      title: 'Word Builder',
      description: 'Build Shona words using morphology',
      icon: FaPuzzlePiece,
      color: 'from-red-400 to-pink-500',
      difficulty: 'Hard',
      xpReward: 40,
      route: '/games/word-builder',
      category: 'Grammar'
    }
  ]

  const getGameScore = (gameId: string) => {
    return gameProgress[gameId]?.highScore || 0
  }

  const getGamePlays = (gameId: string) => {
    return gameProgress[gameId]?.plays || 0
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'Hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-white/20 mb-6"
          >
            <FaGamepad className="text-3xl text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Shona Learning Games
            </h1>
          </motion.div>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn Shona through fun and engaging mini-games. Earn XP, unlock achievements, and master the language!
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <FaFire className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Games XP</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Object.values(gameProgress).reduce((sum: number, game: any) => sum + (game.totalXP || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                <FaStar className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Games Played</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Object.values(gameProgress).reduce((sum: number, game: any) => sum + (game.plays || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <FaCrown className="text-white text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Best Score</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.max(...Object.values(gameProgress).map((game: any) => game.highScore || 0), 0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer group"
              onClick={() => router.push(game.route)}
            >
              {/* Game Icon */}
              <div className="relative mb-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <game.icon className="text-white text-2xl" />
                </div>
                
                {/* Difficulty Badge */}
                <div className={`absolute top-0 right-0 px-2 py-1 rounded-full text-xs font-bold ${getDifficultyColor(game.difficulty)}`}>
                  {game.difficulty}
                </div>
              </div>
              
              {/* Game Info */}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{game.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{game.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="bg-gradient-to-r from-green-100 to-blue-100 text-green-700 px-2 py-1 rounded-full">
                    {game.category}
                  </span>
                  <span className="text-purple-600 font-semibold">
                    +{game.xpReward} XP
                  </span>
                </div>
              </div>
              
              {/* Game Stats */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-gray-500">High Score</p>
                    <p className="font-bold text-gray-800">{getGameScore(game.id)}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500">Plays</p>
                    <p className="font-bold text-gray-800">{getGamePlays(game.id)}</p>
                  </div>
                </div>
              </div>
              
              {/* Play Button */}
              <motion.button
                className={`w-full mt-4 py-3 bg-gradient-to-r ${game.color} text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Play Now
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}