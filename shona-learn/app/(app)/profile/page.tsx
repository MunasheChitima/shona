'use client'
import { useState, useEffect, useMemo } from 'react'
import useSWR from 'swr'
import { motion } from 'framer-motion'
import { ProtectedRoute, useAuth } from '../../../lib/auth'
import { FaBook, FaEdit, FaSave, FaTimes } from 'react-icons/fa'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBoundary from '../../components/ErrorBoundary'
import StreakDisplay from '../../components/engagement/StreakDisplay'
import DailyGoalRing from '../../components/engagement/DailyGoalRing'
import StatsOverview from '../../components/engagement/StatsOverview'
import Milestones from '../../components/engagement/Milestones'
import ContinueLearning from '../../components/engagement/ContinueLearning'
import { todayStamp } from '../../components/engagement/dailyGoal'
import { deriveStats, XP_PER_LESSON } from '../../components/engagement/deriveStats'

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

type LearningPathApi = {
  enrollment: { id: string; currentUnitId: string | null; pathVariant: string; startedAt: string } | null
}

type PathVariant = 'heritage' | 'new_learner' | 'partner' | 'default'

type ProgressRow = { completed?: boolean; lessonId: string; completedAt?: string | null }

const PATH_VARIANT_OPTIONS: { id: Exclude<PathVariant, 'default'>; label: string; description: string }[] = [
  {
    id: 'heritage',
    label: 'Heritage learner',
    description: 'Grew up around Shona — skip foundational greetings and family vocab.',
  },
  {
    id: 'new_learner',
    label: 'New learner',
    description: 'Starting from scratch — extra repetition for sounds and basics.',
  },
  {
    id: 'partner',
    label: 'Learning with partner / family',
    description: 'Prioritize practical phrases for daily life with relatives.',
  },
]

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

// Shared SWR keys — these MUST match the keys used by sibling pages
// (/learn, /quests) so navigating between pages reuses the cached data
// instead of re-fetching. That's the bulk of the perceived speedup.
const PROGRESS_KEY = '/api/progress'
const LESSONS_KEY = '/api/lessons'
const PUBLIC_LESSONS_KEY = '/api/lessons/public?manifest=1&limit=100'
const PATH_PROGRESS_KEY = '/api/learning-path/progress?slug=core'
const LEARNING_PATH_KEY = '/api/learning-path?slug=core'

export default function Profile() {
  // Auth context is the source of truth for user data (xp, streak, etc.).
  const { user: authUser, updateUser, isLoading: authLoading } = useAuth()

  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [pathVariant, setPathVariant] = useState<PathVariant>('default')
  const [variantSaving, setVariantSaving] = useState<PathVariant | null>(null)
  const [variantError, setVariantError] = useState<string | null>(null)
  const [flashcardWords, setFlashcardWords] = useState(0)

  useEffect(() => {
    setEditedName(authUser?.name ?? '')
  }, [authUser?.name])

  useEffect(() => {
    setFlashcardWords(countFlashcardPractice())
  }, [])

  const { data: progressData, isLoading: progressLoading } = useSWR<ProgressRow[]>(PROGRESS_KEY)
  const { data: lessonsResp, isLoading: lessonsLoading } = useSWR<{ lessons?: Array<{ id?: string; category?: string }> }>(LESSONS_KEY)
  const { data: publicLessonsResp, isLoading: publicLessonsLoading } = useSWR<{ lessons?: any[]; totalLessons?: number }>(PUBLIC_LESSONS_KEY)
  const { data: pathProgress } = useSWR<PathProgressApi>(PATH_PROGRESS_KEY)
  const { data: learningPath } = useSWR<LearningPathApi>(LEARNING_PATH_KEY, {
    shouldRetryOnError: false,
  })

  // Keep local pathVariant state in sync with whatever the server reports.
  useEffect(() => {
    const variant = learningPath?.enrollment?.pathVariant
    if (variant === 'heritage' || variant === 'new_learner' || variant === 'partner' || variant === 'default') {
      setPathVariant(variant)
    }
  }, [learningPath])

  // Derive the entire engagement loop (XP, level, streak) from server progress
  // rows. In open beta `authUser` is null, so authUser.xp/.streak/.level are
  // frozen at 0/null — reading those left streak/XP/level/badges permanently
  // dead. Deriving from `completedAt` makes them all move. See deriveStats.ts.
  const stats = useMemo(() => deriveStats(progressData), [progressData])
  const completedLessons = stats.lessonsCompleted

  // Honest "lessons completed today" derived from server `completedAt`
  // timestamps, matched against the local calendar day.
  const lessonsCompletedToday = useMemo(() => {
    const today = todayStamp()
    return (progressData || []).filter((p) => {
      if (!p?.completed || !p.completedAt) return false
      const d = new Date(p.completedAt)
      if (Number.isNaN(d.getTime())) return false
      return todayStamp(d) === today
    }).length
  }, [progressData])

  const totalLessons = useMemo<number | null>(() => {
    if (typeof publicLessonsResp?.totalLessons === 'number') return publicLessonsResp.totalLessons
    if (Array.isArray(publicLessonsResp?.lessons)) return publicLessonsResp!.lessons!.length
    const lessons = lessonsResp?.lessons || []
    return lessons.length || null
  }, [publicLessonsResp, lessonsResp])

  // We only block on the first fetch. SWR keeps the data fresh silently after
  // that, so back-navigations are instant. NOTE: do NOT gate on `authUser ===
  // null` — in open-beta the visitor is cookie-only and never gets a cached
  // user object, so that would hang the page forever. Gate on the auth
  // context's own loading flag instead; the page has `Beta Learner` fallbacks.
  const isLoading = authLoading || progressLoading || lessonsLoading || publicLessonsLoading

  const handleSaveName = () => {
    const trimmed = editedName.trim()
    if (trimmed) updateUser({ name: trimmed })
    setIsEditing(false)
  }

  const handleSwitchVariant = async (variant: PathVariant) => {
    if (variant === pathVariant || variantSaving) return
    setVariantSaving(variant)
    setVariantError(null)
    try {
      const res = await fetch('/api/learning-path/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ learningPathSlug: 'core', pathVariant: variant }),
      })
      if (!res.ok) {
        setVariantError('Could not update learning style. Try again.')
        return
      }
      setPathVariant(variant)
      // Revalidate SWR caches so /learn reflects the new variant on next visit.
      try {
        const { mutate } = await import('swr')
        await Promise.all([
          mutate(LEARNING_PATH_KEY),
          mutate(LESSONS_KEY),
          mutate(PATH_PROGRESS_KEY),
        ])
      } catch {
        // best-effort cache refresh
      }
    } catch (e) {
      console.error('Failed to switch path variant:', e)
      setVariantError('Could not update learning style. Try again.')
    } finally {
      setVariantSaving(null)
    }
  }

  const level = stats.level
  const progressToNextLevel = stats.xpIntoLevel

  // Lesson-based completion drives the learning-path card. The unit rollup
  // (pathProgress.completionPercent) lags behind real lesson completions and
  // produced the contradictory "0% next to 3 of 78 lessons complete" bug, so
  // we present a single, lesson-based number consistent with the derived stats.
  const lessonCompletionPercent =
    totalLessons && totalLessons > 0
      ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
      : 0

  // "Started" must track REAL progress (server-recorded completed lessons),
  // not the lagging unit rollup — a learner with completed lessons should be
  // told to "continue", never to "begin". See deriveStats / completedLessons.
  const hasStarted = completedLessons > 0
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

  const displayName = authUser?.name || 'Beta Learner'
  const firstName = displayName.split(' ')[0] || displayName
  const displayInitial = displayName[0]?.toUpperCase() || 'U'

  const resetProgress = () => {
    if (typeof window === 'undefined') return
    const ok = window.confirm(
      'Reset local progress? This clears your onboarding state and any in-progress lesson saves on this device. Server progress is not affected yet.'
    )
    if (!ok) return
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (!k) continue
        if (
          k === 'shona_onboarded' ||
          k === FLASHCARD_PRACTICE_KEY ||
          k === 'gameProgress' ||
          k === 'shona_daily_goal' ||
          k.startsWith('lesson_')
        ) {
          keys.push(k)
        }
      }
      keys.forEach((k) => localStorage.removeItem(k))
    } catch {
      /* ignore */
    }
    window.location.reload()
  }

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-[#fffdf7]">
          <div className="container mx-auto max-w-4xl px-4 py-8">
            {/* Greeting + identity */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mb-6 flex items-center gap-4"
            >
              <div
                aria-hidden
                className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xl font-medium text-white"
              >
                {displayInitial}
              </div>
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="your name"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveName()
                        if (e.key === 'Escape') {
                          setIsEditing(false)
                          setEditedName(authUser?.name || '')
                        }
                      }}
                      aria-label="Your name"
                      className="min-w-0 flex-1 border-b border-stone-300 bg-transparent text-xl font-medium tracking-tight text-stone-900 focus:border-emerald-500 focus:outline-none"
                    />
                    <button type="button" onClick={handleSaveName} className="p-2 text-emerald-600 hover:text-emerald-700" aria-label="Save name">
                      <FaSave />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false)
                        setEditedName(authUser?.name || '')
                      }}
                      className="p-2 text-stone-400 hover:text-stone-600"
                      aria-label="Cancel edit"
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <h1 className="truncate text-xl font-medium lowercase tracking-tight text-stone-900">
                      mhoro, {firstName}
                    </h1>
                    <button
                      type="button"
                      onClick={() => {
                        setEditedName(authUser?.name || '')
                        setIsEditing(true)
                      }}
                      className="p-1.5 text-stone-400 hover:text-stone-600"
                      aria-label="Edit name"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                  </div>
                )}
                <p className="truncate text-sm text-stone-500">{authUser?.email}</p>
              </div>
            </motion.div>

            {/* Continue learning */}
            <div className="mb-6">
              <ContinueLearning contextLabel={currentStageLabel} started={hasStarted} />
            </div>

            {/* Streak + daily goal */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <StreakDisplay streak={stats.currentStreak} longestStreak={stats.longestStreak} />
              <DailyGoalRing lessonsCompletedToday={lessonsCompletedToday} />
            </div>

            {/* Stats */}
            <div className="mb-6">
              <StatsOverview
                lessonsCompleted={completedLessons}
                totalXp={stats.totalXp}
                level={level}
                wordsLearned={flashcardWords}
              />
              {completedLessons === 0 ? (
                <p className="mt-3 text-center text-xs text-stone-500 lowercase">
                  your first lesson is worth {XP_PER_LESSON} xp — and unlocks your first badge
                </p>
              ) : null}
            </div>

            {/* Milestones */}
            <div className="mb-6">
              <Milestones
                input={{
                  lessonsCompleted: completedLessons,
                  totalXp: stats.totalXp,
                  streak: stats.currentStreak,
                  wordsLearned: flashcardWords,
                }}
              />
            </div>

            {/* Learning path + level progress */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-white/80 p-5 backdrop-blur">
                <h2 className="mb-3 flex items-center gap-2 text-base font-medium lowercase tracking-tight text-stone-900">
                  <FaBook className="text-emerald-600" />
                  learning path
                </h2>
                <p className="mb-1 text-sm text-stone-600">
                  <span className="font-medium text-stone-900">Current stage:</span> {currentStageLabel}
                </p>
                {totalLessons !== null ? (
                  <p className="text-sm text-stone-500">
                    {completedLessons} / {totalLessons} lessons ({lessonCompletionPercent}%)
                  </p>
                ) : null}
                <div className="mt-4 h-2 w-full rounded-full bg-stone-100">
                  <div
                    className="h-2 rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${lessonCompletionPercent}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white/80 p-5 backdrop-blur">
                <h2 className="mb-3 text-base font-medium lowercase tracking-tight text-stone-900">
                  level {level}
                </h2>
                <p className="mb-4 text-sm text-stone-500">
                  {stats.totalXp === 0
                    ? `complete a lesson to earn your first ${XP_PER_LESSON} xp`
                    : `${progressToNextLevel}/100 xp to level ${level + 1}`}
                </p>
                <div className="h-2 w-full rounded-full bg-stone-100">
                  <div
                    className="h-2 rounded-full bg-emerald-600 transition-[width] duration-1000"
                    style={{ width: `${progressToNextLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Learning style (preserved) */}
            <div className="mb-6 rounded-2xl border border-stone-200 bg-white/80 p-5 backdrop-blur">
              <h2 className="mb-1 text-base font-medium lowercase tracking-tight text-stone-900">
                learning style
              </h2>
              <p className="mb-4 text-sm text-stone-600">
                Tailors which lessons appear on your path. You can switch any time.
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                {PATH_VARIANT_OPTIONS.map((option) => {
                  const isActive = pathVariant === option.id
                  const isSaving = variantSaving === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleSwitchVariant(option.id)}
                      disabled={!!variantSaving || isActive}
                      aria-pressed={isActive}
                      className={`rounded-xl border-2 p-3 text-left transition disabled:cursor-not-allowed ${
                        isActive
                          ? 'border-emerald-400 bg-emerald-50'
                          : 'border-stone-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/40'
                      } ${variantSaving && !isActive ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-stone-900">{option.label}</span>
                        {isActive ? (
                          <span className="text-xs font-semibold text-emerald-700">Active</span>
                        ) : isSaving ? (
                          <span className="text-xs text-stone-500">Saving…</span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-xs leading-snug text-stone-600">{option.description}</p>
                    </button>
                  )
                })}
              </div>
              {variantError ? <p className="mt-3 text-xs text-red-600">{variantError}</p> : null}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={resetProgress}
                className="text-xs text-stone-500 underline hover:text-stone-700"
              >
                Reset progress on this device
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </ErrorBoundary>
  )
}
