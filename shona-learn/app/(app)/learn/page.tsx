'use client'
import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ProtectedRoute } from '../../../lib/auth'
import LessonCard from '../../components/LessonCard'
import ExerciseModal from '../../components/ExerciseModal'
import CelebrationModal from '../../components/CelebrationModal'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBoundary from '../../components/ErrorBoundary'
import StageSection, { type PathStage } from '../../components/learning-path/StageSection'
import CheckpointModal from '../../components/learning-path/CheckpointModal'
import type { LessonRowLesson } from '../../components/learning-path/LessonRow'
import { useErrorHandler } from '@/lib/error-handling'
import { apiAuthHeaders } from '@/lib/api-auth-headers'

type LearnLesson = LessonRowLesson & {
  category: string
  exercises?: unknown[]
  questId?: string
}

type PathEnrollment = {
  id: string
  currentUnitId: string | null
  pathVariant: string
  startedAt: string
}

type PathApiResponse = {
  stages: PathStage[]
  enrollment: PathEnrollment | null
}

function variantLearningTip(pathVariant: string | undefined | null): string {
  switch (pathVariant) {
    case 'heritage':
      return 'You can move quickly through familiar greetings—double-down on sounds that still feel tricky.'
    case 'new_learner':
      return 'Say new phrases out loud; Shona uses several sounds English rarely does.'
    case 'partner':
      return 'Prioritize phrases you will use with family—they stick fastest when they are immediately useful.'
    default:
      return ''
  }
}

function groupLessonsByCategory(lessons: LearnLesson[]): Record<string, LearnLesson[]> {
  const m: Record<string, LearnLesson[]> = {}
  for (const l of lessons) {
    const c = l.category || 'Uncategorized'
    if (!m[c]) m[c] = []
    m[c].push(l)
  }
  return m
}

function findNextLessonId(
  stages: PathStage[] | null,
  lessonsByCategory: Record<string, LearnLesson[]>,
  validLessons: LearnLesson[],
  progress: Record<string, { completed?: boolean; score?: number }>,
  excludeLessonId?: string
): string | null {
  if (stages && stages.length > 0) {
    for (const stage of stages) {
      for (const unit of stage.units) {
        if (unit.status === 'locked') continue
        const cat = unit.lessonId
        if (!cat) continue
        const list = lessonsByCategory[cat] || []
        for (const lesson of list) {
          if (lesson.id === excludeLessonId) continue
          if (!progress[lesson.id]?.completed) return lesson.id
        }
      }
    }
    return null
  }
  // Fallback: flat order
  for (const lesson of validLessons) {
    if (lesson.id === excludeLessonId) continue
    if (!progress[lesson.id]?.completed) return lesson.id
  }
  return null
}

function LearnContent() {
  const [selectedLesson, setSelectedLesson] = useState<LearnLesson | null>(null)
  const [progress, setProgress] = useState<Record<string, { completed?: boolean; score?: number }>>({})
  const [user, setUser] = useState<any>({})
  const [questFilter, setQuestFilter] = useState<string | null>(null)
  const [chunks, setChunks] = useState<any[]>([])
  const [lessonsLoading, setLessonsLoading] = useState(true)
  const [lessonsError, setLessonsError] = useState<unknown>(null)
  const [pathStages, setPathStages] = useState<PathStage[] | null>(null)
  const [pathEnrollment, setPathEnrollment] = useState<PathEnrollment | null>(null)
  const [dueReviewCount, setDueReviewCount] = useState(0)
  const [checkpointUnitId, setCheckpointUnitId] = useState<string | null>(null)
  const [progressionMode, setProgressionMode] = useState(true)
  const [celebrate, setCelebrate] = useState<{
    score: number
    lessonTitle: string
    completedLessonId: string
  } | null>(null)
  const searchParams = useSearchParams()
  const { handleError } = useErrorHandler()

  const finalChunks = chunks

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch('/api/progress', { headers: { ...apiAuthHeaders() } })

      if (res.ok) {
        const data = await res.json()
        const progressMap = data.reduce((acc: any, p: any) => {
          acc[p.lessonId] = p
          return acc
        }, {})
        setProgress(progressMap)
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
    }
  }, [])

  const fetchDueReviews = useCallback(async () => {
    try {
      const res = await fetch('/api/reviews/due', {
        headers: { ...apiAuthHeaders() },
      })
      if (!res.ok) return
      const data = await res.json()
      const due = Array.isArray(data.due) ? data.due : []
      setDueReviewCount(due.length)
    } catch {
      // non-blocking
    }
  }, [])

  const fetchLearningPath = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/learning-path?slug=core', {
        headers: { ...apiAuthHeaders() },
      })
      if (res.status === 404 || !res.ok) {
        setPathStages(null)
        setPathEnrollment(null)
        setProgressionMode(false)
        return false
      }
      const data: PathApiResponse = await res.json()
      setPathStages(data.stages || [])
      setPathEnrollment(data.enrollment ?? null)
      setProgressionMode(true)
      return true
    } catch (e) {
      console.error('Learning path fetch failed:', e)
      setPathStages(null)
      setPathEnrollment(null)
      setProgressionMode(false)
      return false
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user')
        if (userData) {
          try {
            setUser(JSON.parse(userData))
          } catch {
            /* ignore */
          }
        }
      }

      const questParam = searchParams.get('quest')
      if (questParam) {
        setQuestFilter(questParam)
      }

      await fetchProgress()
      await fetchLearningPath()
      await fetchDueReviews()
      await fetchLessons()
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()])

  const fetchLessons = async () => {
    try {
      setLessonsLoading(true)
      setLessonsError(null)

      const res = await fetch('/api/lessons', {
        headers: { ...apiAuthHeaders() },
      })

      if (res.ok) {
        const data = await res.json()
        const lessons = data.lessons || []
        setChunks([
          {
            id: 'lessons_chunk',
            type: 'lesson' as const,
            data: lessons,
            metadata: { totalChunks: 1, chunkIndex: 0, hasNext: false, hasPrevious: false },
          },
        ])
      } else {
        setLessonsError(new Error(`Failed to fetch lessons (${res.status})`))
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
      setLessonsError(error)
      handleError(error)
    } finally {
      setLessonsLoading(false)
    }
  }

  const handleLessonComplete = async (lessonId: string, lessonTitle: string, score: number) => {
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...apiAuthHeaders() },
        body: JSON.stringify({ lessonId, score }),
      })

      if (res.ok) {
        if (typeof window !== 'undefined') {
          const userData = JSON.parse(localStorage.getItem('user') || '{}')
          userData.xp = (userData.xp || 0) + score
          localStorage.setItem('user', JSON.stringify(userData))
          setUser(userData)
        }
        await fetchProgress()
        await fetchLearningPath()
        await fetchDueReviews()
        setSelectedLesson(null)
        setCelebrate({ score, lessonTitle, completedLessonId: lessonId })
      } else {
        // Even on failure, still show celebration so progress feels real;
        // surface the error via toast/log but don't block the UX.
        console.warn('Progress POST failed:', res.status)
        setSelectedLesson(null)
        setCelebrate({ score, lessonTitle, completedLessonId: lessonId })
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error)
      setSelectedLesson(null)
      setCelebrate({ score, lessonTitle, completedLessonId: lessonId })
    }
  }

  const lessons = finalChunks.flatMap((chunk: any) => chunk.data || []) as LearnLesson[]

  if (lessonsLoading) {
    return <LoadingSpinner fullScreen message="Loading lessons..." />
  }

  if (lessonsError) {
    return (
      <div className="min-h-screen bg-[#fffdf7] flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white rounded-3xl p-8 shadow-soft border border-amber-100">
          <div className="text-5xl mb-4">📡</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">We&apos;re loading your lessons</h2>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t reach the lesson server. Try again in a moment.
          </p>
          <button
            type="button"
            onClick={() => { fetchLessons(); fetchProgress(); }}
            className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  let validLessons = lessons.filter(
    (lesson) => lesson && lesson.id && lesson.title && lesson.exercises && lesson.exercises.length > 0
  )

  if (questFilter) {
    validLessons = validLessons.filter((lesson) => lesson.questId === questFilter)
  }

  const lessonsByCategory = groupLessonsByCategory(validLessons)
  const completedCount = Object.values(progress).filter((p: any) => p?.completed).length
  const isFirstTimeUser =
    progressionMode && pathStages && !lessonsLoading && validLessons.length > 0 && completedCount === 0 && !questFilter

  const nextLessonId = findNextLessonId(pathStages, lessonsByCategory, validLessons, progress)

  const firstLessonForWelcome = (() => {
    if (!pathStages) return validLessons[0] || null
    for (const st of pathStages) {
      for (const u of st.units) {
        if (u.status === 'locked' || !u.lessonId) continue
        const list = lessonsByCategory[u.lessonId] || []
        if (list[0]) return list[0]
      }
    }
    return validLessons[0] || null
  })()

  // For celebration "next lesson" calculation, exclude the lesson just completed.
  const nextAfterCompletedId = celebrate
    ? findNextLessonId(pathStages, lessonsByCategory, validLessons, progress, celebrate.completedLessonId)
    : null
  const nextAfterCompletedLesson = nextAfterCompletedId
    ? validLessons.find((l) => l.id === nextAfterCompletedId) || null
    : null

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-[#fffdf7]">
          <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  {questFilter ? `Quest: ${questFilter}` : 'Learn Shona'}
                </h1>
              </div>
            </div>

            {!questFilter && progressionMode && pathStages && !pathEnrollment && !selectedLesson ? (
              <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 flex flex-wrap items-center gap-3">
                <span>
                  <span className="font-semibold">Tip:</span> You can pick a learning style (heritage, new learner,
                  partner) anytime from your profile.
                </span>
                <Link
                  href="/profile"
                  className="text-emerald-800 underline font-semibold whitespace-nowrap"
                >
                  Choose your learning style →
                </Link>
              </div>
            ) : null}

            {dueReviewCount > 0 && !questFilter ? (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                <span className="font-semibold">{dueReviewCount} review due</span>
                <span className="text-amber-900">
                  {' '}
                  — spaced reviews lock in vocabulary. Visit flashcards or redo a recent lesson while it is fresh.
                </span>
              </div>
            ) : null}

            {isFirstTimeUser && firstLessonForWelcome && (
              <div className="mb-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-4 right-6 text-6xl opacity-20">🇿🇼</div>
                <div className="relative z-10 max-w-2xl">
                  <h2 className="text-2xl md:text-3xl font-bold mb-3">
                    Mhoro, {user?.name?.split(' ')[0] || 'shamwari'}! 👋 Your Shona learning journey starts here.
                  </h2>
                  {variantLearningTip(pathEnrollment?.pathVariant) ? (
                    <p className="text-white/90 text-sm md:text-base mb-3 max-w-xl">
                      {variantLearningTip(pathEnrollment?.pathVariant)}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setSelectedLesson(firstLessonForWelcome)}
                    className="mt-4 bg-white text-green-700 font-bold py-3 px-8 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    Start First Lesson →
                  </button>
                </div>
              </div>
            )}

            {!isFirstTimeUser && completedCount > 0 && !questFilter && (
              <div className="mb-6 bg-white rounded-2xl px-6 py-4 shadow-soft flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="font-medium">
                      {completedCount} of {validLessons.length} lessons completed
                    </span>
                    <span>
                      {validLessons.length ? Math.round((completedCount / validLessons.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${validLessons.length ? (completedCount / validLessons.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {validLessons.length === 0 ? (
              <div className="text-center bg-white rounded-3xl p-8 shadow-soft border border-amber-100 max-w-md mx-auto">
                <div className="text-5xl mb-4">📚</div>
                <h3 className="font-bold text-gray-800 mb-2">We&apos;re loading your lessons</h3>
                <p className="text-gray-600 mb-4">Try refreshing in a moment.</p>
                <button
                  type="button"
                  onClick={() => { fetchLessons(); fetchProgress(); }}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90"
                >
                  Retry
                </button>
              </div>
            ) : progressionMode && pathStages && !questFilter ? (
              <div className="flex flex-col">
                {pathStages.map((stage) => {
                  const stageLocked = stage.units.length > 0 && stage.units.every((u) => u.status === 'locked')
                  const defaultStageOpen =
                    !stageLocked &&
                    stage.units.some(
                      (u) => u.status === 'completed' || u.status === 'current' || u.status === 'available'
                    )
                  return (
                    <StageSection
                      key={stage.id}
                      stage={stage}
                      lessonsByCategory={lessonsByCategory}
                      progress={progress}
                      defaultOpen={defaultStageOpen}
                      nextLessonId={nextLessonId}
                      onLessonClick={(l) => setSelectedLesson(l as LearnLesson)}
                      onCheckpointOpen={(u) => setCheckpointUnitId(u.id)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {validLessons.map((lesson, index) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    progress={progress[lesson.id]}
                    onClick={() => setSelectedLesson(lesson)}
                    locked={index > 0 && !progress[validLessons[index - 1].id]?.completed}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedLesson && (
          <ExerciseModal
            lesson={selectedLesson}
            onClose={() => setSelectedLesson(null)}
            onComplete={(score) =>
              handleLessonComplete(selectedLesson.id, selectedLesson.title, score)
            }
          />
        )}

        {celebrate ? (
          <CelebrationModal
            isOpen={!!celebrate}
            score={celebrate.score}
            lessonTitle={celebrate.lessonTitle}
            onClose={() => setCelebrate(null)}
            onNextLesson={
              nextAfterCompletedLesson
                ? () => {
                    setCelebrate(null)
                    setSelectedLesson(nextAfterCompletedLesson)
                  }
                : undefined
            }
            nextLessonTitle={nextAfterCompletedLesson?.title}
          />
        ) : null}

        {checkpointUnitId ? (
          <CheckpointModal
            unitId={checkpointUnitId}
            getToken={getToken}
            onClose={() => setCheckpointUnitId(null)}
            onPassed={() => {
              void fetchLearningPath()
              void fetchDueReviews()
            }}
          />
        ) : null}
      </ProtectedRoute>
    </ErrorBoundary>
  )
}

export default function Learn() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading..." />}>
      <LearnContent />
    </Suspense>
  )
}
