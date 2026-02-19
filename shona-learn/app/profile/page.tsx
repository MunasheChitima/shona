'use client'
import { useState, useEffect } from 'react'
import { ProtectedRoute } from '../../lib/auth'
import { FaTrophy, FaFire, FaStar, FaCalendar, FaChartBar, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import { motion } from 'framer-motion'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

interface UserStats {
  totalLessons: number
  completedLessons: number
  totalXP: number
  currentStreak: number
  longestStreak: number
  averageScore: number
  perfectScores: number
  totalTimeSpent: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

export default function Profile() {
  const [user, setUser] = useState<{ name?: string; email?: string; xp?: number; streak?: number; longestStreak?: number; createdAt?: string } | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      // Get user from localStorage for now
      let userData: { name?: string; email?: string; xp?: number; streak?: number; longestStreak?: number; createdAt?: string } = {}
      if (typeof window !== 'undefined') {
        userData = JSON.parse(localStorage.getItem('user') || '{}')
      }
      setUser(userData)
      setEditedName(userData.name || '')
      // Fetch user stats
      const progressRes = await fetch('/api/progress', {
        headers: { 'Authorization': typeof window !== 'undefined' ? `Bearer ${localStorage.getItem('token')}` : '' }
      })
      if (progressRes.ok) {
        const progressData = await progressRes.json()
        calculateStats(progressData)
      }
      // Generate achievements based on stats
      generateAchievements(userData)
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (progressData: any[]) => {
    const completed = progressData.filter(p => p.completed)
    const scores = completed.map(p => p.score)
    
    setStats({
      totalLessons: 79, // From your content
      completedLessons: completed.length,
      totalXP: user?.xp || 0,
      currentStreak: user?.streak || 0,
      longestStreak: user?.longestStreak || user?.streak || 0,
      averageScore: scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      perfectScores: scores.filter(s => s >= 90).length,
      totalTimeSpent: Math.round(completed.length * 15) // Estimate 15 min per lesson
    })
  }

  const generateAchievements = (userData: any) => {
    const userLevel = Math.floor((userData.xp || 0) / 100) + 1
    const userXP = userData.xp || 0

    setAchievements([
      {
        id: 'first-lesson',
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        unlocked: userXP > 0,
        unlockedAt: userData.createdAt
      },
      {
        id: 'level-5',
        title: 'Rising Star',
        description: 'Reach level 5',
        icon: '⭐',
        unlocked: userLevel >= 5,
        progress: userLevel,
        maxProgress: 5
      },
      {
        id: 'level-10',
        title: 'Dedicated Learner',
        description: 'Reach level 10',
        icon: '🌟',
        unlocked: userLevel >= 10,
        progress: userLevel,
        maxProgress: 10
      },
      {
        id: 'streak-7',
        title: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        icon: '🔥',
        unlocked: (userData.streak || 0) >= 7,
        progress: userData.streak || 0,
        maxProgress: 7
      },
      {
        id: 'streak-30',
        title: 'Consistency Champion',
        description: 'Maintain a 30-day streak',
        icon: '💪',
        unlocked: (userData.streak || 0) >= 30,
        progress: userData.streak || 0,
        maxProgress: 30
      },
      {
        id: 'perfect-10',
        title: 'Perfectionist',
        description: 'Get 10 perfect scores',
        icon: '💯',
        unlocked: (stats?.perfectScores || 0) >= 10,
        progress: stats?.perfectScores || 0,
        maxProgress: 10
      },
      {
        id: 'vocabulary-master',
        title: 'Vocabulary Master',
        description: 'Complete all vocabulary lessons',
        icon: '📚',
        unlocked: false,
        progress: 0,
        maxProgress: 20
      },
      {
        id: 'culture-expert',
        title: 'Culture Expert',
        description: 'Complete all cultural lessons',
        icon: '🌍',
        unlocked: false,
        progress: 0,
        maxProgress: 15
      }
    ])
  }

  const handleSaveName = async () => {
    const updatedUser = { ...user, name: editedName }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setIsEditing(false)
  }

  const getLevel = () => Math.floor((user?.xp || 0) / 100) + 1
  const getProgressToNextLevel = () => (user?.xp || 0) % 100

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />
  }
  if (!user || typeof user !== 'object' || !user?.name) {
    return <div className="text-center text-red-600 py-8">Failed to load user profile. Please try again.</div>
  }
  if (!stats || typeof stats !== 'object') {
    return <div className="text-center text-yellow-600 py-8">Failed to load progress data. Please check back later or contact support if this issue persists.</div>
  }

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            {/* Profile Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8 mb-8"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-5xl font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2">
                    <span className="text-xl">🇿🇼</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="text-3xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none"
                        />
                        <button onClick={handleSaveName} className="text-green-600 hover:text-green-700">
                          <FaSave />
                        </button>
                        <button onClick={() => { setIsEditing(false); setEditedName(user?.name || '') }} className="text-red-600 hover:text-red-700">
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-gray-800">{user?.name || 'Learner'}</h1>
                        <button onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-gray-700">
                          <FaEdit />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{user?.email}</p>
                  
                  {/* Level Progress */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-xl font-semibold text-gray-700">Level {getLevel()}</span>
                      <span className="text-sm text-gray-500">{getProgressToNextLevel()}/100 XP to next level</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgressToNextLevel()}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full"
                      />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <div className="flex items-center space-x-2">
                      <FaFire className="text-orange-500" />
                      <span className="font-semibold">{user?.streak || 0} day streak</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaStar className="text-yellow-500" />
                      <span className="font-semibold">{user?.xp || 0} total XP</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FaTrophy className="text-purple-500" />
                      <span className="font-semibold">{achievements.filter(a => a.unlocked).length} achievements</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid md:grid-cols-4 gap-4 mb-8"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-2">📚</div>
                <div className="text-2xl font-bold text-gray-800">{stats?.completedLessons || 0}/{stats?.totalLessons || 0}</div>
                <div className="text-sm text-gray-600">Lessons Completed</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-2">🎯</div>
                <div className="text-2xl font-bold text-gray-800">{stats?.averageScore || 0}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-2">💯</div>
                <div className="text-2xl font-bold text-gray-800">{stats?.perfectScores || 0}</div>
                <div className="text-sm text-gray-600">Perfect Scores</div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="text-3xl mb-2">⏱️</div>
                <div className="text-2xl font-bold text-gray-800">{stats?.totalTimeSpent || 0}m</div>
                <div className="text-sm text-gray-600">Time Spent</div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaTrophy className="text-yellow-500 mr-3" />
                Achievements
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className={`border-2 rounded-2xl p-4 ${
                      achievement.unlocked 
                        ? 'border-green-300 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`text-4xl ${achievement.unlocked ? '' : 'opacity-30 grayscale'}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${achievement.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                          {achievement.title}
                        </h3>
                        <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                          {achievement.description}
                        </p>
                        {achievement.progress !== undefined && !achievement.unlocked && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Progress</span>
                              <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full"
                                style={{ width: `${(achievement.progress / achievement.maxProgress!) * 100}%` }}
                              />
                            </div>
                          </div>
                        )}
                        {achievement.unlocked && achievement.unlockedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  )
} 