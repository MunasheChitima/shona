'use client'
import { useState, useEffect, useCallback } from 'react'
import { ProtectedRoute } from '../../../lib/auth'
import { FaTrophy, FaFire, FaStar, FaBook, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import { motion } from 'framer-motion'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBoundary from '../../components/ErrorBoundary'
import { BETA_OPEN_ACCESS } from '@/lib/beta-access'
import { apiAuthHeaders } from '@/lib/api-auth-headers'

const FLASHCARD_PRACTICE_KEY = 'flashcard_practice_v1'

type PathProgressApi = {
  enrollment: { id: string; currentUnitId: string | null } | null
  totals: { totalUnits: number; completedUnits: number; completionPercent: number }
  stages: Array<{
    stageId: string
    title: string
    totalUnits: number
    completedUnits: number
    completionPercent: number
  }>
}

type AchievementRow = {
  code: string
  title: string
  description: string
  icon: string
  unlocked: boolean
}

function countFlashcardPractice(): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(FLASHCARD_PRACTICE_KEY)
    const map = raw ? JSON.parse(raw) : {}
    if (!map || typeof map !== 'object') return 0
    let n = 0
    for (const k of Object.keys(map)) {
      const arr = map[k]
      if (Array.isArray(arr)) n += arr.length
    }
    return n
  } catch {
    return 0
  }
}

export default function Profile() {
  const [user, setUser] = useState<{
    name?: string
    email?: string
    xp?: number
    streak?: number
    longestStreak?: number
    createdAt?: string
  } | null>(null)
  const [pathProgress, setPathProgress] = useState<PathProgressApi | null>(null)
  const [completedLessons, setCompletedLessons] = useState(0)
  const [totalLessons, setTotalLessons] = useState(60)
  const [achievements, setAchievements] = useState<AchievementRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')

  const computeAchievements = useCallback(
    (completedLessonCount: number, firstUnitDone: boolean, firstStageDone: boolean, flashN: number, streak: number) => {
      setAchievements([
        {
          code: 'first-lesson',
          title: 'First Steps',
          description: 'Complete your first lesson',
          icon: '👣',
          unlocked: completedLessonCount >= 1,
        },
        {
          code: 'first-unit',
          title: 'Unit Master',
          description: 'Complete all lessons in a unit',
          icon: '🎓',
          unlocked: firstUnitDone,
        },
        {
          code: 'first-stage',
          title: 'Stage Champion',
          description: 'Complete an entire stage',
          icon: '🏆',
          unlocked: firstStageDone,
        },
        {
          code: 'flashcard-50',
          title: 'Vocabulary Builder',
          description: 'Practice 50 flashcards',
          icon: '🃏',
          unlocked: flashN >= 50,
        },
        {
          code: 'week-streak',
          title: 'Dedicated Learner',
          description: '7-day learning streak',
          icon: '🔥',
          unlocked: streak >= 7,
        },
      ])
    },
    []
  )

  const fetchUserData = async () => {
    setIsLoading(true)
    try {
      let userData: NonNullable<typeof user> = {}
      if (typeof window !== 'undefined') {
        userData = JSON.parse(localStorage.getItem('user') || '{}')
      }
      setUser(userData)
      setEditedName(userData.name ?? '')

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : ''
      if (!token && !BETA_OPEN_ACCESS) {
        setIsLoading(false)
        return
      }

      const headers = { ...apiAuthHeaders() }
      const [progressRes, pathRes, lessonsRes] = await Promise.all([
        fetch('/api/progress', { headers }),
        fetch('/api/learning-path/progress?slug=core', { headers }),
        fetch('/api/lessons', { headers }),
      ])

      let progressData: { completed?: boolean; lessonId: string }[] = []
      if (progressRes.ok) {
        progressData = await progressRes.json()
      }
      const done = progressData.filter((p) => p.completed).length

      let lessons: { id?: string; category?: string }[] = []
      if (lessonsRes.ok) {
        const ld = await lessonsRes.json()
        lessons = ld.lessons || []
      }
      const total = lessons.length || 60
      setCompletedLessons(done)
      setTotalLessons(total)

      if (pathRes.ok) {
        const pp = await pathRes.json()
        setPathProgress(pp)
        const stage1 = pp.stages?.[0]
        const firstStageDone =
          !!stage1 && stage1.totalUnits > 0 && stage1.completedUnits >= stage1.totalUnits

        const completedIds = new Set(
          progressData.filter((p) => p.completed).map((p) => p.lessonId)
        )
        const byCat: Record<string, string[]> = {}
        for (const l of lessons) {
          if (!l?.category || !l?.id) continue
          if (!byCat[l.category]) byCat[l.category] = []
          byCat[l.category].push(l.id)
        }
        let firstUnitDone = false
        for (const ids of Object.values(byCat)) {
          if (ids.length > 0 && ids.every((id) => completedIds.has(id))) {
            firstUnitDone = true
            break
          }
        }

        computeAchievements(done, firstUnitDone, firstStageDone, countFlashcardPractice(), userData?.streak || 0)
      } else {
        computeAchievements(done, false, false, countFlashcardPractice(), userData?.streak || 0)
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSaveName = async () => {
    const updatedUser = { ...user, name: editedName }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setIsEditing(false)
  }

  const getLevel = () => Math.floor((user?.xp || 0) / 100) + 1
  const getProgressToNextLevel = () => (user?.xp || 0) % 100

  const currentStageLabel = (() => {
    if (!pathProgress?.stages?.length) return 'Not started'
    const totals = pathProgress.totals
    if (totals.completedUnits >= totals.totalUnits && totals.totalUnits > 0) {
      return 'Path complete'
    }
    if (totals.completedUnits === 0) {
      return `Stage 1: ${pathProgress.stages[0]?.title || 'Foundation'}`
    }
    const next = pathProgress.stages.find((s) => s.completedUnits < s.totalUnits)
    if (next) return `${next.title}`
    return 'Not started'
  })()

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading profile..." />
  }
  if (!user || typeof user !== 'object' || !user?.name) {
    return <div className="text-center text-red-600 py-8">Failed to load user profile. Please try again.</div>
  }

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-app-surface">
          <div className="container mx-auto px-4 py-8 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8 mb-8"
            >
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className="relative flex-shrink-0">
                  <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-yellow-400 rounded-full p-2">
                    <span className="text-lg">🇿🇼</span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left w-full">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-2 flex-wrap">
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editedName}
                          onChange={(e) => setEditedName(e.target.value)}
                          className="text-2xl md:text-3xl font-bold text-gray-800 border-b-2 border-blue-500 focus:outline-none max-w-full"
                        />
                        <button type="button" onClick={handleSaveName} className="text-green-600 hover:text-green-700 p-2" aria-label="Save name">
                          <FaSave />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false)
                            setEditedName(user?.name || '')
                          }}
                          className="text-red-600 hover:text-red-700 p-2"
                          aria-label="Cancel edit"
                        >
                          <FaTimes />
                        </button>
                      </>
                    ) : (
                      <>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{user?.name || 'Learner'}</h1>
                        <button type="button" onClick={() => setIsEditing(true)} className="text-gray-500 hover:text-gray-700 p-2" aria-label="Edit name">
                          <FaEdit />
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{user?.email}</p>

                  <div className="mb-4">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-lg font-semibold text-gray-700">Level {getLevel()}</span>
                      <span className="text-sm text-gray-500">
                        {getProgressToNextLevel()}/100 XP to next level
                      </span>
                    </div>
                    <div className="w-full max-w-md mx-auto md:mx-0 bg-gray-200 rounded-full h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${getProgressToNextLevel()}%` }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                    <div className="flex items-center gap-2">
                      <FaFire className="text-orange-500" />
                      <span className="font-semibold">{user?.streak || 0} day streak</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-500" />
                      <span className="font-semibold">{user?.xp || 0} XP</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-3xl shadow-lg p-6"
                >
                  <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <FaBook className="text-green-600" />
                    Learning path
                  </h2>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold text-gray-800">Current stage:</span> {currentStageLabel}
                  </p>
                  {pathProgress ? (
                    <p className="text-sm text-gray-500">
                      Units completed: {pathProgress.totals.completedUnits} / {pathProgress.totals.totalUnits} (
                      {pathProgress.totals.completionPercent}%)
                    </p>
                  ) : null}
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${pathProgress?.totals.completionPercent ?? 0}%`,
                      }}
                    />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white rounded-3xl shadow-lg p-6"
                >
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Lessons</h2>
                  <p className="text-2xl font-bold text-gray-800 mb-2">
                    {completedLessons} / {totalLessons}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">Lessons completed</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                      style={{
                        width: `${totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0}%`,
                      }}
                    />
                  </div>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-3xl shadow-lg p-6"
              >
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FaTrophy className="text-yellow-500" />
                  Achievements
                </h2>
                <ul className="space-y-3">
                  {achievements.map((a) => (
                    <li
                      key={a.code}
                      className={`flex gap-4 rounded-2xl border-2 p-4 ${
                        a.unlocked ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <span className={`text-3xl flex-shrink-0 ${a.unlocked ? '' : 'grayscale opacity-40'}`}>{a.icon}</span>
                      <div>
                        <h3 className={`font-semibold ${a.unlocked ? 'text-gray-800' : 'text-gray-400'}`}>{a.title}</h3>
                        <p className={`text-sm ${a.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>{a.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  )
}
