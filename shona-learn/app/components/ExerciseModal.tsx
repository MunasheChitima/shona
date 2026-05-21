'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { FaTimes, FaArrowRight } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorBoundary from './ErrorBoundary'
import { apiAuthHeaders } from '@/lib/api-auth-headers'

interface ExerciseModalProps {
  lesson: any
  onClose: () => void
  onComplete: (score: number) => void
}

function progressKey(lessonId: string) {
  return `lesson_${lessonId}_progress`
}

function clearLessonProgress(lessonId: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(progressKey(lessonId))
  } catch {
    /* ignore */
  }
}

function readSavedIndex(lessonId: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(progressKey(lessonId))
    if (!raw) return 0
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch {
    return 0
  }
}

function writeSavedIndex(lessonId: string, index: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(progressKey(lessonId), String(index))
  } catch {
    /* ignore */
  }
}

export default function ExerciseModal({ lesson, onClose, onComplete }: ExerciseModalProps) {
  const [exercises, setExercises] = useState<any[]>([])
  const [loadingExercises, setLoadingExercises] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [typed, setTyped] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const indexHydratedRef = useRef(false)

  // Resuming a lesson skips straight to the quiz; a fresh open shows the
  // "what you'll learn" intro first.
  const [phase, setPhase] = useState<'intro' | 'quiz'>(() =>
    readSavedIndex(lesson.id) > 0 ? 'quiz' : 'intro'
  )

  const vocab: any[] = Array.isArray(lesson.vocabulary) ? lesson.vocabulary : []
  const culturalNote: string | undefined = Array.isArray(lesson.culturalNotes)
    ? lesson.culturalNotes[0]
    : undefined

  const requestClose = useCallback(() => {
    if (phase === 'quiz' && currentIndex > 0 && !showResults) {
      const ok =
        typeof window === 'undefined'
          ? true
          : window.confirm('leave this lesson? your spot is saved so you can pick up where you left off.')
      if (!ok) return
    }
    onClose()
  }, [phase, currentIndex, showResults, onClose])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [requestClose])

  useEffect(() => {
    const fetchExercises = async () => {
      if (typeof window === 'undefined') return
      try {
        const res = await fetch(`/api/exercises/${lesson.id}`, { headers: { ...apiAuthHeaders() } })
        if (res.ok) {
          const data = await res.json()
          const renderable = data.filter(
            (ex: any) =>
              ex.type === 'multiple_choice' || ex.type === 'translation' || ex.type === 'fill_blank'
          )
          setExercises(renderable)
        }
      } finally {
        setLoadingExercises(false)
      }
    }
    fetchExercises()
  }, [lesson.id])

  useEffect(() => {
    if (indexHydratedRef.current) return
    if (exercises.length === 0) return
    const saved = readSavedIndex(lesson.id)
    if (saved > 0 && saved < exercises.length) setCurrentIndex(saved)
    indexHydratedRef.current = true
  }, [exercises.length, lesson.id])

  const finish = (finalScore: number) => {
    setShowResults(true)
    clearLessonProgress(lesson.id)
    onComplete(finalScore)
  }

  const advance = (nextIndex: number) => {
    setCurrentIndex(nextIndex)
    setSelectedAnswer('')
    setTyped('')
    setShowFeedback(false)
    writeSavedIndex(lesson.id, nextIndex)
  }

  const currentExercise = exercises[currentIndex]

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    const correct =
      answer.trim().toLowerCase() === String(currentExercise.correctAnswer).trim().toLowerCase()
    setIsCorrect(correct)
    setShowFeedback(true)
    const newScore = correct ? score + (currentExercise.points || 10) : score
    if (correct) setScore(newScore)

    setTimeout(() => {
      if (currentIndex < exercises.length - 1) advance(currentIndex + 1)
      else finish(newScore)
    }, 1600)
  }

  // ── shared shell ──────────────────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <ErrorBoundary>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm modal-backdrop"
        data-testid="exercise-modal"
        onClick={(e) => {
          if ((e.target as HTMLElement).classList.contains('modal-backdrop')) requestClose()
        }}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 24 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-stone-200 bg-[#fffdf7] shadow-xl"
          data-testid="exercise-content"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </div>
    </ErrorBoundary>
  )

  // ── loading ───────────────────────────────────────────────────
  if (loadingExercises && phase === 'quiz') {
    return (
      <Shell>
        <div className="p-10 text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />
          <p className="lowercase text-stone-500">loading lesson…</p>
        </div>
      </Shell>
    )
  }

  // ── intro: "here's what you'll learn" ─────────────────────────
  if (phase === 'intro') {
    return (
      <Shell>
        <div className="p-8">
          <div className="mb-6 flex items-start justify-between">
            <button
              type="button"
              onClick={requestClose}
              aria-label="close lesson"
              className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
            >
              <FaTimes />
            </button>
            {typeof lesson.xpReward === 'number' && (
              <span className="lowercase text-sm text-stone-400">{lesson.xpReward} xp</span>
            )}
          </div>

          {typeof lesson.orderIndex === 'number' && (
            <p className="mb-1 lowercase text-sm text-stone-400">lesson {lesson.orderIndex}</p>
          )}
          <h2 className="text-2xl font-medium tracking-tight lowercase text-stone-900">
            {lesson.title}
          </h2>
          {lesson.description && (
            <p className="mt-2 leading-relaxed text-stone-500">{lesson.description}</p>
          )}

          {vocab.length > 0 && (
            <div className="mt-8">
              <p className="mb-3 lowercase text-sm font-medium text-stone-400">words you'll learn</p>
              <div className="divide-y divide-stone-100 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                {vocab.map((v: any, i: number) => (
                  <div key={i} className="flex items-baseline justify-between gap-4 px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-lg font-medium text-stone-900">{v.shona}</p>
                      <p className="truncate text-sm text-stone-500">{v.english}</p>
                    </div>
                    {v.pronunciation && (
                      <span className="shrink-0 font-mono text-sm text-emerald-700">{v.pronunciation}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {culturalNote && (
            <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50/60 px-5 py-4">
              <p className="text-sm leading-relaxed text-amber-900">{culturalNote}</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setPhase('quiz')}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-8 py-4 lowercase font-medium text-white transition-colors hover:bg-stone-800"
          >
            start lesson <FaArrowRight className="text-sm" />
          </button>
        </div>
      </Shell>
    )
  }

  // ── empty exercise set ────────────────────────────────────────
  if (exercises.length === 0) {
    return (
      <Shell>
        <div className="p-10 text-center">
          <p className="mb-4 lowercase text-stone-600">no exercises are available for this lesson yet.</p>
          <button
            type="button"
            onClick={onClose}
            className="lowercase text-sm text-stone-500 underline underline-offset-4 hover:text-stone-700"
          >
            close
          </button>
        </div>
      </Shell>
    )
  }

  // ── quiz ──────────────────────────────────────────────────────
  let options: string[] = []
  try {
    const optionsData = currentExercise.options || '[]'
    if (typeof optionsData === 'string') {
      options =
        optionsData.startsWith('[') || optionsData.startsWith('{')
          ? JSON.parse(optionsData)
          : optionsData.includes(',')
            ? optionsData.split(',').map((o: string) => o.trim())
            : [optionsData]
    } else if (Array.isArray(optionsData)) {
      options = optionsData
    }
  } catch {
    options = []
  }

  const progress = ((currentIndex + 1) / exercises.length) * 100
  const isLast = currentIndex === exercises.length - 1
  const isTranslation = currentExercise.type === 'translation'

  return (
    <Shell>
      <div className="p-8">
        {/* top bar: close · progress · xp */}
        <div className="mb-7 flex items-center gap-4">
          <button
            type="button"
            onClick={requestClose}
            aria-label="close lesson"
            data-testid="close-modal"
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
          >
            <FaTimes />
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <span className="shrink-0 lowercase text-sm tabular-nums text-stone-400">{score} xp</span>
        </div>

        {/* question */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          <p className="mb-2 lowercase text-sm text-stone-400">
            question {currentIndex + 1} of {exercises.length}
          </p>
          <h2 className="text-xl font-medium leading-snug tracking-tight text-stone-900">
            {currentExercise.question}
          </h2>

          {currentExercise.shonaPhrase && (
            <div className="mt-5 rounded-2xl border border-stone-200 bg-white px-5 py-4">
              <p className="text-2xl font-medium text-stone-900">{currentExercise.shonaPhrase}</p>
              {currentExercise.pronunciation && (
                <p className="mt-1 font-mono text-sm text-emerald-700">{currentExercise.pronunciation}</p>
              )}
            </div>
          )}

          {currentExercise.englishPhrase && !isTranslation && (
            <div className="mt-5 rounded-2xl border border-stone-200 bg-white px-5 py-4">
              <p className="text-xl font-medium text-stone-900">{currentExercise.englishPhrase}</p>
            </div>
          )}
        </motion.div>

        {/* answers */}
        <div className="mt-7 space-y-3">
          {isTranslation ? (
            <>
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={showFeedback}
                placeholder="type your answer"
                className="w-full rounded-xl border border-stone-200 bg-white px-4 py-4 text-lg lowercase outline-none transition-colors placeholder:text-stone-300 focus:border-emerald-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && typed.trim() && !showFeedback) handleAnswer(typed)
                }}
              />
              <button
                type="button"
                onClick={() => typed.trim() && !showFeedback && handleAnswer(typed)}
                disabled={showFeedback || !typed.trim()}
                className="w-full rounded-full bg-stone-900 px-8 py-4 lowercase font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-40"
              >
                check
              </button>
            </>
          ) : options.length === 0 ? (
            <button
              type="button"
              onClick={() => handleAnswer('skip')}
              className="w-full rounded-full bg-stone-200 px-8 py-4 lowercase font-medium text-stone-700 transition-colors hover:bg-stone-300"
            >
              skip this question
            </button>
          ) : (
            options.map((option: string, index: number) => {
              const correctOpt = showFeedback && option === currentExercise.correctAnswer
              const wrongOpt = showFeedback && option === selectedAnswer && !isCorrect
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => !showFeedback && handleAnswer(option)}
                  disabled={showFeedback}
                  data-testid="answer-option"
                  className={`w-full rounded-xl border px-5 py-4 text-left text-lg transition-all
                    ${correctOpt
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : wrongOpt
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300 disabled:opacity-60'}`}
                >
                  {option}
                </button>
              )
            })
          )}
        </div>

        {/* feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`mt-6 rounded-2xl border px-5 py-4 ${
                isCorrect ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50/70'
              }`}
              data-testid={isCorrect ? 'success-message' : 'error-message'}
            >
              <p className={`lowercase font-medium ${isCorrect ? 'text-emerald-800' : 'text-rose-700'}`}>
                {isCorrect ? 'correct' : 'not quite'}
              </p>

              {currentExercise.explanation && (
                <p className={`mt-1 text-sm leading-relaxed ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {isCorrect ? currentExercise.explanation.correct : currentExercise.explanation.incorrect}
                </p>
              )}

              {!isCorrect && currentExercise.correctAnswer && (
                <p className="mt-2 text-sm text-stone-600">
                  answer: <span className="font-medium text-stone-900">{currentExercise.correctAnswer}</span>
                </p>
              )}

              {currentExercise.culturalNote && (
                <p className="mt-3 border-t border-black/5 pt-3 text-sm leading-relaxed text-stone-600">
                  {currentExercise.culturalNote}
                </p>
              )}

              {isLast && lesson?.category && (
                <Link
                  href={`/flashcards?category=${encodeURIComponent(lesson.category)}`}
                  className="mt-3 inline-flex items-center gap-1.5 lowercase text-sm font-medium text-emerald-700 underline underline-offset-4 hover:text-emerald-800"
                >
                  practice these words with flashcards <FaArrowRight className="text-xs" />
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center lowercase text-xs text-stone-400">
          press esc or tap outside to leave — your spot is saved
        </p>
      </div>
    </Shell>
  )
}
