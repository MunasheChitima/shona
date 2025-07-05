'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import { FaTrophy, FaStar, FaCalendar, FaFire, FaMedal, FaCrown, FaCheck } from 'react-icons/fa'
import SocialLearning from '../components/SocialLearning'
import IntrinsicMotivationTracker from '../components/IntrinsicMotivationTracker'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [progress, setProgress] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchProgress()
  }, [])

  const fetchProgress = async () => {
    const res = await fetch('/api/progress', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (res.ok) {
      const data = await res.json()
      setProgress(data)
    }
    setIsLoading(false)
  }

  const getLevel = (xp: number) => Math.floor(xp / 100) + 1
  const getProgressToNextLevel = (xp: number) => xp % 100
  const getCompletedLessons = () => progress.filter(p => p.completed).length
  const getAverageScore = () => {
    const completed = progress.filter(p => p.completed)
    if (completed.length === 0) return 0
    return Math.round(completed.reduce((sum, p) => sum + p.score, 0) / completed.length)
  }
  const getStreak = () => {
    // Mock streak calculation - in real app this would be based on daily activity
    return Math.min(getCompletedLessons(), 7)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
            <div className="flex flex-col lg:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2">
                  <FaCrown className="text-white text-sm" />
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {user.name || 'Shona Learner'}
                </h1>
                <p className="text-gray-600 mb-4">
                  Level {getLevel(user.xp || 0)} • {getCompletedLessons()} lessons completed
                </p>
                
                {/* Level Progress */}
                <div className="max-w-md">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Level {getLevel(user.xp || 0)}</span>
                    <span>Level {getLevel(user.xp || 0) + 1}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-1000"
                      style={{ width: `${getProgressToNextLevel(user.xp || 0)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {getProgressToNextLevel(user.xp || 0)}% to next level
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total XP</p>
                <p className="text-3xl font-bold text-green-600">{user.xp || 0}</p>
              </div>
              <FaTrophy className="text-3xl text-yellow-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Lessons Done</p>
                <p className="text-3xl font-bold text-blue-600">{getCompletedLessons()}</p>
              </div>
              <FaStar className="text-3xl text-blue-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Average Score</p>
                <p className="text-3xl font-bold text-purple-600">{getAverageScore()}%</p>
              </div>
              <FaMedal className="text-3xl text-purple-500" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Current Streak</p>
                <p className="text-3xl font-bold text-red-600">{getStreak()} days</p>
              </div>
              <FaFire className="text-3xl text-red-500" />
            </div>
          </div>
        </div>

        {/* Intrinsic Motivation Tracker */}
        <IntrinsicMotivationTracker />

        {/* Social Learning */}
        <SocialLearning />

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 animate-pulse">
                  <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : progress.length > 0 ? (
            <div className="space-y-4">
              {progress
                .filter(p => p.completed)
                .slice(0, 5)
                .map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <FaCheck className="text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">Lesson {item.lessonId}</p>
                      <p className="text-sm text-gray-600">Completed with {item.score}% score</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">+{item.score} XP</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No activity yet. Start learning to see your progress!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 