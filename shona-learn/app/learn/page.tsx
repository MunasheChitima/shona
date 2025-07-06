'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import LessonCard from '../components/LessonCard'
import ExerciseModal from '../components/ExerciseModal'
import CelebrationModal from '../components/CelebrationModal'
import { CulturalContextHighlight } from '../components/shared/CulturalContext'
import VocabularyDisplay from '../components/shared/VocabularyDisplay'
import { FaGraduationCap, FaFire, FaStar, FaGlobeAfrica, FaBookOpen } from 'react-icons/fa'

export default function Learn() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [progress, setProgress] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [showExercise, setShowExercise] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [completionScore, setCompletionScore] = useState(0)
  const [userStats, setUserStats] = useState({
    totalXP: 0,
    streak: 7,
    level: 1,
    completedLessons: 0
  })

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    loadLessons()
    loadProgress()
    loadUserStats()
  }, [])

  const loadLessons = async () => {
    try {
      setIsLoading(true)
      
      // Try to load enhanced lessons first
      let lessonsData: any[] = []
      
      try {
        const enhancedResponse = await fetch('/content/lessons_enhanced.json')
        if (enhancedResponse.ok) {
          const enhancedData = await enhancedResponse.json()
          lessonsData = enhancedData.lessons || []
        }
      } catch (error) {
        console.warn('Enhanced lessons not found, loading original lessons')
      }
      
      // Fallback to original lessons
      if (lessonsData.length === 0) {
        const originalResponse = await fetch('/content/lessons.json')
        if (originalResponse.ok) {
          const originalData = await originalResponse.json()
          lessonsData = originalData.lessons || []
        }
      }
      
      // Sort lessons by order
      const sortedLessons = lessonsData.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
      setLessons(sortedLessons)
      
    } catch (error) {
      console.error('Failed to load lessons:', error)
      setLessons([])
    } finally {
      setIsLoading(false)
    }
  }

  const loadProgress = () => {
    const savedProgress = localStorage.getItem('lessonProgress')
    if (savedProgress) {
      setProgress(JSON.parse(savedProgress))
    }
  }

  const loadUserStats = () => {
    const savedStats = localStorage.getItem('userStats')
    if (savedStats) {
      setUserStats(JSON.parse(savedStats))
    }
  }

  const saveProgress = (newProgress: any) => {
    setProgress(newProgress)
    localStorage.setItem('lessonProgress', JSON.stringify(newProgress))
  }

  const saveUserStats = (newStats: any) => {
    setUserStats(newStats)
    localStorage.setItem('userStats', JSON.stringify(newStats))
  }

  const getCompletedLessons = () => {
    return Object.values(progress).filter((p: any) => p?.completed).length
  }

  const getTotalXP = () => {
    return Object.values(progress).reduce((total: number, p: any) => {
      return total + (p?.score || 0)
    }, 0)
  }

  const handleLessonSelect = (lesson: any) => {
    setSelectedLesson(lesson)
    setShowExercise(true)
  }

  const handleExerciseComplete = (score: number) => {
    setCompletionScore(score)
    
    // Update progress
    const newProgress = {
      ...progress,
      [selectedLesson.id]: {
        completed: true,
        score: score,
        completedAt: new Date().toISOString()
      }
    }
    saveProgress(newProgress)
    
    // Update user stats
    const newStats = {
      ...userStats,
      totalXP: getTotalXP() + score,
      completedLessons: getCompletedLessons() + 1,
      level: Math.floor((getTotalXP() + score) / 100) + 1
    }
    saveUserStats(newStats)
    
    setShowExercise(false)
    setShowCelebration(true)
  }

  const handleCelebrationClose = () => {
    setShowCelebration(false)
    setSelectedLesson(null)
  }

  const completedCount = getCompletedLessons()
  const totalXP = getTotalXP()

  // Get a featured cultural lesson
  const featuredCulturalLesson = lessons.find(lesson => 
    lesson.category === 'Cultural Immersion' && lesson.culturalNotes?.length > 0
  )

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
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
                      <div className="text-2xl font-bold text-blue-600">Level {Math.floor((user.xp || 0) / 100) + 1}</div>
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
                      <span>Level {Math.floor((user.xp || 0) / 100) + 1}</span>
                      <span>Level {Math.floor((user.xp || 0) / 100) + 2}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-full transition-all duration-1000"
                        style={{ width: `${(user.xp || 0) % 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Featured Cultural Context */}
        {featuredCulturalLesson && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <CulturalContextHighlight 
              culturalNotes={featuredCulturalLesson.culturalNotes}
              className="cursor-pointer"
            />
          </motion.div>
        )}

        {/* Vocabulary Preview */}
        {lessons.length > 0 && lessons[0].vocabulary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-soft p-6 border border-white/20">
              <div className="flex items-center space-x-3 mb-4">
                <FaBookOpen className="text-purple-500 text-xl" />
                <h2 className="text-xl font-bold text-gray-800">Featured Vocabulary</h2>
              </div>
              <VocabularyDisplay
                vocabulary={lessons[0].vocabulary.slice(0, 3)}
                variant="compact"
                showPronunciation={true}
                showCultural={false}
                showUsage={true}
                showExamples={false}
              />
            </div>
          </motion.div>
        )}

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
                <motion.div 
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <LessonCard
                    lesson={lesson}
                    progress={progress[lesson.id]}
                    onClick={() => handleLessonSelect(lesson)}
                    locked={lesson.orderIndex > 1 && !progress[lessons[lesson.orderIndex - 2]?.id]?.completed}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Motivation Section */}
        {completedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-8 border border-green-200">
              <div className="text-6xl mb-4">�</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Zvakanaka! (Well done!)
              </h3>
              <p className="text-green-700 mb-4">
                You've completed {completedCount} lesson{completedCount !== 1 ? 's' : ''}! 
                Your dedication to learning Shona is inspiring.
              </p>
              <div className="flex justify-center items-center space-x-4 text-sm text-green-600">
                <div className="flex items-center space-x-1">
                  <FaGlobeAfrica />
                  <span>Cultural Understanding</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaStar />
                  <span>{totalXP} XP Earned</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaFire />
                  <span>{userStats.streak} Day Streak</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Exercise Modal */}
      <AnimatePresence>
        {showExercise && selectedLesson && (
          <ExerciseModal
            lesson={selectedLesson}
            onClose={() => setShowExercise(false)}
            onComplete={handleExerciseComplete}
          />
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <AnimatePresence>
        {showCelebration && selectedLesson && (
          <CelebrationModal
            isOpen={showCelebration}
            score={completionScore}
            lessonTitle={selectedLesson.title}
            onClose={handleCelebrationClose}
          />
        )}
      </AnimatePresence>
    </div>
  )
} 