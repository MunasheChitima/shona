'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProtectedRoute } from '../../lib/auth'
import LessonCard from '../components/LessonCard'
import ExerciseModal from '../components/ExerciseModal'
import HeartDisplay from '../components/HeartDisplay'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'
import AuthError from '../components/AuthError'
import { useContentChunking } from '@/hooks/useContentChunking'
import { useErrorHandler } from '@/lib/error-handling'

function LearnContent() {
  const [selectedLesson, setSelectedLesson] = useState<any>(null)
  const [progress, setProgress] = useState<any>({})
  const [user, setUser] = useState<any>({})
  const [questFilter, setQuestFilter] = useState<string | null>(null)
  const [chunks, setChunks] = useState<any[]>([])
  const searchParams = useSearchParams()
  const { handleError } = useErrorHandler()

  const {
    chunks: lessonChunks,
    isLoading: lessonsLoading,
    error: lessonsError,
    loadChunks: loadLessons
  } = useContentChunking({
    type: 'lesson',
    autoLoad: false
  })

  const finalChunks = chunks.length > 0 ? chunks : lessonChunks

  useEffect(() => {
    const init = async () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user')
        if (userData) {
          setUser(JSON.parse(userData))
        }
      }

      const questParam = searchParams.get('quest')
      if (questParam) {
        setQuestFilter(questParam)
      }

      await fetchProgress()

      try {
        await loadLessons()
      } catch (error) {
        console.error('Content chunking failed, falling back to original method:', error)
        await fetchLessons()
      }
    }

    init()
    // Only re-run when searchParams string changes (to avoid rerender loops)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()])

  const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  const fetchLessons = async () => {
    try {
      const token = getToken()
      if (!token) return

      const res = await fetch('/api/lessons', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        const data = await res.json()
        const lessons = data.lessons || []
        const localChunks = [
          {
            id: 'fallback_chunk',
            type: 'lesson' as const,
            data: lessons,
            metadata: { totalChunks: 1, chunkIndex: 0, hasNext: false, hasPrevious: false },
          },
        ]
        setChunks(localChunks)
      }
    } catch (error) {
      console.error('Failed to fetch lessons:', error)
      handleError(error)
    }
  }

  const fetchProgress = async () => {
    try {
      const token = getToken()
      if (!token) return

      const res = await fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } })

      if (res.ok) {
        const data = await res.json()
        const progressMap = data.reduce((acc: any, p: any) => {
          acc[p.lessonId] = p
          return acc
        }, {})
        setProgress(progressMap)
      } else if (res.status === 401) {
        handleError(new Error('Authentication expired'))
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    } catch (error) {
      console.error('Failed to fetch progress:', error)
      handleError(error)
    }
  }

  const handleLessonComplete = async (lessonId: string, score: number) => {
    try {
      const token = getToken()
      if (!token) {
        handleError(new Error('Authentication required'))
        return
      }

      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lessonId, score }),
      })

      if (res.ok) {
        if (typeof window !== 'undefined') {
          const userData = JSON.parse(localStorage.getItem('user') || '{}')
          userData.xp += score
          localStorage.setItem('user', JSON.stringify(userData))
          setUser(userData)
        }
        fetchProgress()
        setSelectedLesson(null)
      } else {
        handleError(new Error('Failed to save progress'))
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error)
      handleError(error)
    }
  }

  const getLevel = (xp: number) => Math.floor(xp / 100) + 1

  const lessons = finalChunks.flatMap((chunk) => chunk.data || [])

  if (lessonsLoading) {
    return <LoadingSpinner fullScreen message="Loading lessons..." />
  }

  if (lessonsError) {
    return <AuthError error={lessonsError} onRetry={() => { loadLessons(); fetchProgress(); }} />
  }

  let validLessons = lessons.filter(
    (lesson) => lesson && lesson.id && lesson.title && lesson.exercises && lesson.exercises.length > 0
  )

  if (questFilter) {
    validLessons = validLessons.filter((lesson) => lesson.questId === questFilter)
  }

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-gray-800">
                  {questFilter ? `Quest: ${questFilter}` : 'Learn Shona'}
                </h1>
              </div>
              <HeartDisplay hearts={user?.hearts || 0} />
            </div>
            {validLessons.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            ) : (
              <div className="text-center text-yellow-600 py-8">
                No valid lessons available. Please check back later or contact support if this issue persists.
              </div>
            )}
          </div>
        </div>

        {selectedLesson && (
          <ExerciseModal
            lesson={selectedLesson}
            onClose={() => setSelectedLesson(null)}
            onComplete={(score) => handleLessonComplete(selectedLesson.id, score)}
          />
        )}
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