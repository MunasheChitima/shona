'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import LessonCard from '../components/LessonCard'
import ExerciseModal from '../components/ExerciseModal'
import HeartDisplay from '../components/HeartDisplay'

export default function Learn() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [progress, setProgress] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    fetchLessons()
    fetchProgress()
  }, [])

  const fetchLessons = async () => {
    const res = await fetch('/api/lessons', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (res.ok) {
      const data = await res.json()
      setLessons(data)
    }
  }

  const fetchProgress = async () => {
    const res = await fetch('/api/progress', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (res.ok) {
      const data = await res.json()
      const progressMap = data.reduce((acc: any, p: any) => {
        acc[p.lessonId] = p
        return acc
      }, {})
      setProgress(progressMap)
    }
    setIsLoading(false)
  }

  const handleLessonComplete = async (lessonId: string, score: number) => {
    await fetch('/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ lessonId, score })
    })
    
    // Update user data
    const userData = JSON.parse(localStorage.getItem('user') || '{}')
    userData.xp += score
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    
    // Refresh progress
    fetchProgress()
    setSelectedLesson(null)
  }

  const getLevel = (xp: number) => Math.floor(xp / 100) + 1
  const getProgressToNextLevel = (xp: number) => xp % 100
  const getCompletedLessons = () => Object.values(progress).filter((p: any) => p.completed).length

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-white/20">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Your Learning Journey 🚀
                </h1>
                <p className="text-gray-600">
                  Keep going! You're doing amazing in your Shona adventure.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Progress Display */}
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-4 border border-green-200">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{user.xp || 0}</div>
                      <div className="text-xs text-gray-600">Total XP</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">Level {getLevel(user.xp || 0)}</div>
                      <div className="text-xs text-gray-600">Current Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{getCompletedLessons()}</div>
                      <div className="text-xs text-gray-600">Lessons Done</div>
                    </div>
                  </div>
                  
                  {/* Level Progress Bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Level {getLevel(user.xp || 0)}</span>
                      <span>Level {getLevel(user.xp || 0) + 1}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-1000"
                        style={{ width: `${getProgressToNextLevel(user.xp || 0)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Hearts Display */}
                <HeartDisplay hearts={user.hearts || 5} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Lessons Grid */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Available Lessons 📚
            </h2>
            <div className="text-sm text-gray-600">
              {getCompletedLessons()} of {lessons.length} completed
            </div>
          </div>
          
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white/80 rounded-2xl p-6 shadow-soft animate-pulse">
                  <div className="h-12 w-12 bg-gray-300 rounded-full mb-4"></div>
                  <div className="h-6 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson: any, index: number) => (
                <div key={lesson.id}>
                  <LessonCard
                    lesson={lesson}
                    progress={progress[lesson.id]}
                    onClick={() => setSelectedLesson(lesson)}
                    locked={lesson.orderIndex > 1 && !progress[lessons[lesson.orderIndex - 2]?.id]?.completed}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Motivation Section */}
        {getCompletedLessons() > 0 && (
          <div className="text-center">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-3xl p-8 text-white shadow-large">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold mb-2">
                Amazing Progress!
              </h3>
              <p className="text-lg opacity-90 mb-4">
                You've completed {getCompletedLessons()} lessons! Keep up the great work!
              </p>
              <div className="flex justify-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="text-2xl">
                    ⭐
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {selectedLesson && (
        <ExerciseModal
          lesson={selectedLesson}
          onClose={() => setSelectedLesson(null)}
          onComplete={(score) => handleLessonComplete(selectedLesson.id, score)}
        />
      )}
    </div>
  )
} 