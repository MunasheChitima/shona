'use client'
import { useState, useEffect, useCallback, Suspense, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import useSWR, { mutate as swrMutate } from 'swr'
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
import { fetcher } from '@/lib/swr'

// SWR keys — these MUST match the keys used by /flashcards /profile
// /quests so navigating between pages reuses the cache and the data
// renders before the network even runs.
const LESSONS_KEY = '/api/lessons'
const PROGRESS_KEY = '/api/progress'
const PATH_KEY = '/api/learning-path?slug=core'
const REVIEWS_DUE_KEY = '/api/reviews/due'

// Prefetch a single lesson's full payload so the "Next lesson →" tap in
// the celebration modal feels instant. Best-effort.
function prefetchLesson(id: string) {
  if (!id) return
  const key = `/api/lessons/${id}`
  swrMutate(key, fetcher(key).catch(() => undefined), { revalidate: false })
}

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
  const [user, setUser] = useState<any>({})
  const [questFilter, setQuestFilter] = useState<string | null>(null)
  const [checkpointUnitId, setCheckpointUnitId] = useState<string | null>(null)
  const [celebrate, setCelebrate] = useState<{
    score: number
    lessonTitle: string
    completedLessonId: string
  } | null>(null)
  const searchParams = useSearchParams()
  const { handleError } = useErrorHandler()

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  // All four network requests are now driven by SWR. The cache is shared
  // with /flashcards /profile /quests, so coming from any of those pages
  // means the data is already in-memory and renders without a spinner.
  const { data: lessonsResp, error: lessonsError, isLoading: lessonsLoading } = useSWR<{
    lessons?: LearnLesson[]
  }>(LESSONS_KEY)
  const { data: progressList } = useSWR<Array<{ lessonId: string; completed?: boolean; score?: number }>>(PROGRESS_KEY)
  const { data: pathData } = useSWR<PathApiResponse>(PATH_KEY, {
    // A missing/404 learning path should not throw — we degrade gracefully.
    shouldRetryOnError: false,
  })
  const { data: dueData } = useSWR<{ due?: unknown[] }>(REVIEWS_DUE_KEY, {
    shouldRetryOnError: false,
  })

  const progress = useMemo<Record<string, { completed?: boolean; score?: number }>>(() => {
    const m: Record<string, { completed?: boolean; score?: number }> = {}
    for (const p of progressList || []) {
      if (p?.lessonId) m[p.lessonId] = { completed: p.completed, score: p.score }
    }
    return m
  }, [progressList])

  const pathStages = pathData?.stages ?? null
  const pathEnrollment = pathData?.enrollment ?? null
  const progressionMode = !!pathStages && pathStages.length > 0
  const dueReviewCount = Array.isArray(dueData?.due) ? dueData!.due!.length : 0

  // Load locally-cached user once. (XP comes from API later; this is
  // just for the welcome name string.)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const ud = localStorage.getItem('user')
    if (ud) {
      try {
        setUser(JSON.parse(ud))
      } catch {
        /* ignore */
      }
    }
  }, [])

  useEffect(() => {
    const questParam = searchParams.get('quest')
    setQuestFilter(questParam || null)
  }, [searchParams])

  const refetchAll = useCallback(() => {
    void swrMutate(LESSONS_KEY)
    void swrMutate(PROGRESS_KEY)
    void swrMutate(PATH_KEY)
    void swrMutate(REVIEWS_DUE_KEY)
  }, [])

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
        // Invalidate the related SWR caches so the new progress/path
        // numbers flow into the rest of the app immediately.
        void swrMutate(PROGRESS_KEY)
        void swrMutate(PATH_KEY)
        void swrMutate(REVIEWS_DUE_KEY)
        setSelectedLesson(null)
        setCelebrate({ score, lessonTitle, completedLessonId: lessonId })
      } else {
        console.warn('Progress POST failed:', res.status)
        setSelectedLesson(null)
        setCelebrate({ score, lessonTitle, completedLessonId: lessonId })
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error)
      handleError(error)
      setSelectedLesson(null)
      setCelebrate({ score, lessonTitle, completedLessonId: lessonId })
    }
  }

  const lessons = (lessonsResp?.lessons || []) as LearnLesson[]

  // Open a lesson AND warm the cache for whatever comes next. The user
  // hitting "next" mid-celebration should not see a spinner.
  const openLesson = useCallback(
    (l: LearnLesson) => {
      setSelectedLesson(l)
      // Best-effort prefetch: find a not-yet-completed lesson after `l`
      // and warm its detail payload.
      const validForPrefetch = (lessons || []).filter(
        (x) => x && x.id && x.title && x.exercises && (x.exercises as unknown[]).length > 0
      )
      const lbc = groupLessonsByCategory(validForPrefetch)
      const nextId = findNextLessonId(pathStages ?? null, lbc, validForPrefetch, progress, l.id)
      if (nextId) prefetchLesson(nextId)
    },
    [lessons, pathStages, progress]
  )

  if (lessonsLoading) {
    return <LoadingSpinner fullScreen message="loading lessons..." />
  }

  if (lessonsError) {
    return (
      <div className="min-h-screen bg-[#fffdf7] flex items-center justify-center px-6">
        <div className="max-w-md text-center bg-white/80 backdrop-blur rounded-2xl p-8 border border-stone-200">
          <h2 className="text-xl font-medium tracking-tight text-stone-900 mb-2 lowercase">loading your lessons</h2>
          <p className="text-stone-600 mb-6">
            we couldn&apos;t reach the lesson server. try again in a moment.
          </p>
          <button
            type="button"
            onClick={refetchAll}
            className="bg-stone-900 text-white font-medium px-6 py-3 rounded-full hover:bg-stone-800 transition-colors"
          >
            retry
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
          <div className="container mx-auto px-6 py-12 max-w-5xl">
            <div className="mb-12">
              <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-stone-900 lowercase">
                {questFilter ? `quest: ${questFilter}` : 'learn shona'}
              </h1>
              <p className="mt-2 text-stone-500 text-sm">step by step. at your pace.</p>
            </div>

            {!questFilter && progressionMode && pathStages && !pathEnrollment && !selectedLesson ? (
              <div className="mb-8 rounded-2xl border border-stone-200 bg-white/80 backdrop-blur px-5 py-4 text-sm text-stone-700 flex flex-wrap items-center gap-3">
                <span>
                  <span className="font-medium text-stone-900">tip:</span> pick a learning style (heritage, new learner, partner) anytime from your profile.
                </span>
                <Link
                  href="/profile"
                  className="text-emerald-700 font-medium underline-offset-4 hover:underline whitespace-nowrap"
                >
                  choose your learning style →
                </Link>
              </div>
            ) : null}

            {dueReviewCount > 0 && !questFilter ? (
              <div className="mb-8 rounded-2xl border border-stone-200 bg-white/80 backdrop-blur px-5 py-4 text-sm text-stone-700">
                <span className="font-medium text-stone-900">{dueReviewCount} review due</span>
                <span className="text-stone-600">
                  {' '}
                  — spaced reviews lock in vocabulary. visit flashcards or redo a recent lesson while it&apos;s fresh.
                </span>
              </div>
            ) : null}

            {isFirstTimeUser && firstLessonForWelcome && (
              <div className="mb-12 rounded-2xl border border-stone-200 bg-white/80 backdrop-blur p-8">
                <div className="max-w-2xl">
                  <h2 className="text-xl md:text-2xl font-medium tracking-tight text-stone-900 mb-3 lowercase">
                    mhoro, {user?.name?.split(' ')[0] || 'shamwari'}. your shona journey starts here.
                  </h2>
                  {variantLearningTip(pathEnrollment?.pathVariant) ? (
                    <p className="text-stone-600 text-sm md:text-base mb-5 max-w-xl">
                      {variantLearningTip(pathEnrollment?.pathVariant)}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => openLesson(firstLessonForWelcome)}
                    className="bg-stone-900 text-white font-medium py-3 px-6 rounded-full hover:bg-stone-800 transition-colors lowercase"
                  >
                    start first lesson →
                  </button>
                </div>
              </div>
            )}

            {!isFirstTimeUser && completedCount > 0 && !questFilter && (
              <div className="mb-8 bg-white/80 backdrop-blur rounded-2xl px-6 py-5 border border-stone-200">
                <div className="flex justify-between text-sm text-stone-600 mb-2">
                  <span className="font-medium text-stone-900 lowercase">
                    {completedCount} of {validLessons.length} lessons completed
                  </span>
                  <span className="tabular-nums">
                    {validLessons.length ? Math.round((completedCount / validLessons.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-1.5">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${validLessons.length ? (completedCount / validLessons.length) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {validLessons.length === 0 ? (
              <div className="text-center bg-white/80 backdrop-blur rounded-2xl p-8 border border-stone-200 max-w-md mx-auto">
                <h3 className="font-medium tracking-tight text-stone-900 mb-2 lowercase">loading your lessons</h3>
                <p className="text-stone-600 mb-4">try refreshing in a moment.</p>
                <button
                  type="button"
                  onClick={refetchAll}
                  className="bg-stone-900 text-white font-medium px-6 py-3 rounded-full hover:bg-stone-800 transition-colors lowercase"
                >
                  retry
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
                      onLessonClick={(l) => openLesson(l as LearnLesson)}
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
                    onClick={() => openLesson(lesson)}
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
                    openLesson(nextAfterCompletedLesson)
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
              void swrMutate(PATH_KEY)
              void swrMutate(REVIEWS_DUE_KEY)
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
