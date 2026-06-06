'use client'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import Link from 'next/link'
import { FaTimes, FaArrowRight, FaCheck, FaBolt } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { apiAuthHeaders } from '@/lib/api-auth-headers'
import LessonShell from './lesson/LessonShell'
import ShonaTerm from './lesson/ShonaTerm'
import EmphasisText from './lesson/EmphasisText'
import { displayLessonTitle } from './learning-path/LessonRow'
import {
  correctMicrocopy,
  wrongMicrocopy,
  comboLabel,
  seedFrom,
  isAnswerAccepted,
  teachingExplanation,
} from './lesson/feedback'

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

// stable shuffle keyed off an integer seed so re-renders don't reshuffle
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr]
  let s = seed || 1
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280
    const j = Math.floor((s / 233280) * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function ExerciseModal({ lesson, onClose, onComplete }: ExerciseModalProps) {
  const [exercises, setExercises] = useState<any[]>([])
  const [loadingExercises, setLoadingExercises] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [typed, setTyped] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  // xp running total (shown in the top bar) — separate from the stored score
  const [xp, setXp] = useState(0)
  // how many questions were answered correctly — drives the honest accuracy %
  const [correctCount, setCorrectCount] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [combo, setCombo] = useState(0)
  // bumps on every wrong answer to retrigger the gentle shake animation
  const [shakeKey, setShakeKey] = useState(0)
  // direction the question slides in (forward on advance)
  const [direction, setDirection] = useState(1)
  const indexHydratedRef = useRef(false)
  const continueBtnRef = useRef<HTMLButtonElement | null>(null)
  const feedbackRef = useRef<HTMLDivElement | null>(null)

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
          // accept every authored exercise type — no filtering
          setExercises(Array.isArray(data) ? data : [])
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

  // The stored score is the lesson's accuracy percent (correct / total * 100),
  // NOT an xp tally. XP is derived elsewhere from this.
  const finish = (finalCorrect: number) => {
    setShowResults(true)
    clearLessonProgress(lesson.id)
    const total = exercises.length || 1
    const accuracy = Math.round((finalCorrect / total) * 100)
    onComplete(Math.max(0, Math.min(100, accuracy)))
  }

  const advance = (nextIndex: number) => {
    setDirection(1)
    setCurrentIndex(nextIndex)
    setSelectedAnswer('')
    setTyped('')
    setShowFeedback(false)
    writeSavedIndex(lesson.id, nextIndex)
  }

  const currentExercise = exercises[currentIndex]

  // award points & flip into the feedback panel — no auto-advance
  const settleAnswer = (correct: boolean, awardOverride?: number) => {
    setIsCorrect(correct)
    setShowFeedback(true)
    if (correct) {
      const award =
        typeof awardOverride === 'number'
          ? awardOverride
          : currentExercise?.points || 10
      setXp((prev) => prev + award)
      setCorrectCount((prev) => prev + 1)
      setCombo((prev) => prev + 1)
    } else {
      setCombo(0)
      setShakeKey((k) => k + 1)
    }
  }

  const handleAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    // Lenient matching: ignores case, punctuation, accents, articles, and
    // optional "(...)" parentheticals, and honours acceptableAnswers/synonyms
    // so a clearly-correct type-in answer is never falsely rejected (bug #3).
    const correct = isAnswerAccepted(answer, currentExercise)
    settleAnswer(correct)
  }

  // once feedback appears, scroll it into view and focus the continue button so
  // it is always reachable and Enter advances — even on short viewports where
  // the panel would otherwise sit below the fold.
  useEffect(() => {
    if (!showFeedback) return
    const t = window.setTimeout(() => {
      feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      continueBtnRef.current?.focus({ preventScroll: true })
    }, 60)
    return () => window.clearTimeout(t)
  }, [showFeedback])

  // ── shared shell ──────────────────────────────────────────────
  // IMPORTANT: this is a plain render *function*, NOT a component defined in
  // render. Defining a component inside the body gives it a new type on every
  // render, which remounts the whole subtree and wipes child state (this was
  // resetting the matching exercise mid-answer — bug #6). Returning the element
  // from a function keeps LessonShell's type stable across renders.
  const shell = (children: React.ReactNode) => (
    <LessonShell
      onRequestClose={requestClose}
      maxWidth="2xl"
      testId="exercise-modal"
      contentTestId="exercise-content"
    >
      {children}
    </LessonShell>
  )

  // ── loading ───────────────────────────────────────────────────
  if (loadingExercises && phase === 'quiz') {
    return shell(
      <div className="p-10 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-stone-200 border-t-stone-900" />
        <p className="lowercase text-stone-500">loading lesson…</p>
      </div>
    )
  }

  // ── intro: "here's what you'll learn" ─────────────────────────
  if (phase === 'intro') {
    return shell(
        <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-8 pb-4">
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

          {/* Eyebrow: never leak a raw "lesson 49" for a heritage learner who
              skipped ahead. Prefer the unit/category name (already human and
              meaningful); otherwise fall back to a neutral label. The raw
              orderIndex is intentionally not rendered. */}
          <p className="mb-1 lowercase text-sm text-stone-400">
            {(typeof lesson.category === 'string' && lesson.category.trim()
              ? lesson.category.replace(/^unit\s*\d+:\s*/i, '').trim()
              : 'lesson') || 'lesson'}
          </p>
          <h2 className="text-2xl font-medium tracking-tight lowercase text-stone-900">
            {displayLessonTitle(lesson)}
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
        </div>

        {/* sticky footer: the "start lesson" CTA stays in view at short
            viewports, matching the question screens (bug #4). */}
        <div className="sticky bottom-0 z-10 border-t border-stone-200 bg-[#fffdf7]/95 px-8 py-4 backdrop-blur">
          <button
            type="button"
            onClick={() => setPhase('quiz')}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-8 py-4 lowercase font-medium text-white transition-colors hover:bg-stone-800"
          >
            start lesson <FaArrowRight className="text-sm" />
          </button>
        </div>
        </div>
    )
  }

  // ── empty exercise set ────────────────────────────────────────
  if (exercises.length === 0) {
    return shell(
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
    )
  }

  const isLast = currentIndex === exercises.length - 1

  const handleContinue = () => {
    if (isLast) {
      finish(correctCount)
    } else {
      advance(currentIndex + 1)
    }
  }

  // ── quiz: derive options once for option-based exercises ──────
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
  const isMatching = currentExercise.type === 'matching'
  const isOrdering = currentExercise.type === 'order_sentence'
  // Any free-text exercise (explicit translation, fill-in-the-blank, or an
  // option-less question with a known answer) gets the type-in input + a clear
  // instruction so a learner is never shown a bare word and an empty box.
  const isTranslation =
    currentExercise.type === 'translation' ||
    currentExercise.type === 'fill_blank' ||
    (options.length === 0 && !isMatching && !isOrdering && !!currentExercise.correctAnswer)

  // A focused instruction for the free-text prompt, based on the data shape.
  const typeInPrompt: string =
    currentExercise.prompt ||
    (currentExercise.type === 'fill_blank'
      ? 'type the missing shona word'
      : currentExercise.direction === 'english_to_shona'
        ? 'type the shona translation'
        : 'type the english meaning')

  return shell(
      <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-6 pb-4 sm:p-8 sm:pb-4">
        {/* top bar: close · progress · xp */}
        <div className="mb-5 flex items-center gap-4">
          <button
            type="button"
            onClick={requestClose}
            aria-label="close lesson"
            data-testid="close-modal"
            className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
          >
            <FaTimes />
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-200">
            <motion.div
              className="h-full rounded-full bg-emerald-500"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 200, damping: 30 }}
            />
          </div>
          <span className="shrink-0 lowercase text-sm tabular-nums text-stone-400">{xp} xp</span>
        </div>

        {/* combo / streak — subtle, only once a run is building */}
        <div className="mb-5 h-6">
          <AnimatePresence>
            {comboLabel(combo) && (
              <motion.div
                key={combo}
                initial={{ opacity: 0, y: -6, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium lowercase text-emerald-700 ring-1 ring-emerald-200"
                aria-live="polite"
              >
                <FaBolt className="text-[10px] text-emerald-500" />
                {comboLabel(combo)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* question */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -28 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-2 lowercase text-sm text-stone-400">
              question {currentIndex + 1} of {exercises.length}
            </p>
            <h2 className="text-xl font-medium leading-snug tracking-tight text-stone-900">
              {currentExercise.question}
            </h2>

            {currentExercise.shonaPhrase && (
              <div className="mt-5 rounded-2xl border border-stone-200 bg-white px-5 py-4">
                <ShonaTerm
                  shona={currentExercise.shonaPhrase}
                  pronunciation={currentExercise.pronunciation}
                  size="lg"
                />
              </div>
            )}

            {currentExercise.englishPhrase && !isTranslation && (
              <div className="mt-5 rounded-2xl border border-stone-200 bg-white px-5 py-4">
                <p className="text-xl font-medium text-stone-900">{currentExercise.englishPhrase}</p>
              </div>
            )}

            {isOrdering && currentExercise.englishGloss && (
              <p className="mt-3 lowercase text-sm text-stone-500">
                meaning: <span className="italic">{currentExercise.englishGloss}</span>
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* answers */}
        <div className="mt-7 space-y-3">
          {isMatching ? (
            <MatchingExercise
              key={`match-${currentIndex}`}
              exercise={currentExercise}
              disabled={showFeedback}
              onSettle={settleAnswer}
            />
          ) : isOrdering ? (
            <OrderSentenceExercise
              key={`order-${currentIndex}`}
              exercise={currentExercise}
              disabled={showFeedback}
              onSettle={settleAnswer}
            />
          ) : isTranslation ? (
            <>
              <p className="-mt-1 mb-1 lowercase text-sm text-stone-500">
                {typeInPrompt}
              </p>
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
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => !showFeedback && handleAnswer(option)}
                  disabled={showFeedback}
                  data-testid="answer-option"
                  animate={
                    correctOpt
                      ? { scale: [1, 1.03, 1] }
                      : wrongOpt
                        ? { x: [0, -7, 7, -5, 5, 0] }
                        : { scale: 1, x: 0 }
                  }
                  transition={{ duration: correctOpt ? 0.35 : 0.4 }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-5 py-4 text-left text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
                    ${correctOpt
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 focus:ring-emerald-400'
                      : wrongOpt
                        ? 'border-rose-500 bg-rose-50 text-rose-700 focus:ring-rose-300'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300 focus:ring-stone-300 disabled:opacity-60'}`}
                >
                  <span>{option}</span>
                  {correctOpt && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
                    >
                      <FaCheck className="text-xs" />
                    </motion.span>
                  )}
                </motion.button>
              )
            })
          )}
        </div>

        {/* feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              ref={feedbackRef}
              key={`feedback-${shakeKey}`}
              initial={{ opacity: 0, y: 12 }}
              animate={
                isCorrect
                  ? { opacity: 1, y: 0 }
                  : { opacity: 1, y: 0, x: [0, -8, 8, -6, 6, 0] }
              }
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className={`mt-6 rounded-2xl border px-5 py-4 ${
                isCorrect ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50/70'
              }`}
              data-testid={isCorrect ? 'success-message' : 'error-message'}
            >
              <div className="flex items-center gap-2">
                {isCorrect && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                    <FaCheck className="text-[10px]" />
                  </span>
                )}
                <p className={`lowercase font-medium ${isCorrect ? 'text-emerald-800' : 'text-rose-700'}`}>
                  {isCorrect
                    ? correctMicrocopy(seedFrom(currentExercise.id) + currentIndex)
                    : wrongMicrocopy(seedFrom(currentExercise.id) + currentIndex)}
                </p>
              </div>

              {(() => {
                // Teach on BOTH right and wrong answers (bug #1). The authored
                // `explanation.correct` is usually a bare echo, so on a correct
                // answer we surface the richer teaching note (reframed as
                // reinforcement) instead of parroting the answer back. Emphasis
                // markdown is rendered, never shown raw (bug #2).
                const reinforce =
                  teachingExplanation(currentExercise, isCorrect) ||
                  (isCorrect && currentExercise.correctAnswer
                    ? `that's right — ${currentExercise.correctAnswer}`
                    : null)
                return reinforce ? (
                  <p className={`mt-1 text-sm leading-relaxed ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                    <EmphasisText text={reinforce} />
                  </p>
                ) : null
              })()}

              {!isCorrect && currentExercise.correctAnswer && (
                <p className="mt-2 text-sm text-stone-600">
                  answer: <span className="font-medium text-stone-900">{currentExercise.correctAnswer}</span>
                </p>
              )}

              {!isCorrect && isOrdering && Array.isArray(currentExercise.correctOrder) && (
                <p className="mt-2 text-sm text-stone-600">
                  order:{' '}
                  <span className="font-medium text-stone-900">
                    {currentExercise.correctOrder.join(' ')}
                  </span>
                </p>
              )}

              {currentExercise.culturalNote && (
                <p className="mt-3 border-t border-black/5 pt-3 text-sm leading-relaxed text-stone-600">
                  <EmphasisText text={currentExercise.culturalNote} />
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
          press esc or tap the × to leave — your spot is saved
        </p>
      </div>

      {/* sticky footer: the primary CTA is always reachable on any viewport so a
          new learner is never stranded below the modal fold (bug #1). */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 360, damping: 30 }}
            className="sticky bottom-0 z-10 border-t border-stone-200 bg-[#fffdf7]/95 px-6 py-4 backdrop-blur sm:px-8"
          >
            <button
              ref={continueBtnRef}
              type="button"
              onClick={handleContinue}
              data-testid="continue-button"
              className={`flex w-full items-center justify-center gap-2 rounded-full px-8 py-3.5 lowercase font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isCorrect
                  ? 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500'
                  : 'bg-stone-900 hover:bg-stone-800 focus:ring-stone-700'
              }`}
            >
              {isLast ? 'see results' : 'continue'} <FaArrowRight className="text-sm" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
  )
}

// ──────────────────────────────────────────────────────────────
// matching renderer
// ──────────────────────────────────────────────────────────────
interface MatchingPair {
  shona: string
  english: string
}

function MatchingExercise({
  exercise,
  disabled,
  onSettle,
}: {
  exercise: any
  disabled: boolean
  onSettle: (correct: boolean, awardOverride?: number) => void
}) {
  const pairs: MatchingPair[] = useMemo(
    () => (Array.isArray(exercise.pairs) ? exercise.pairs : []),
    [exercise]
  )

  // stable shuffle seed derived from the exercise id so each render is consistent
  const seed = useMemo(() => {
    const s = String(exercise.id || exercise.question || '')
    let n = 0
    for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 233280
    return n || 1
  }, [exercise.id, exercise.question])

  const shonaItems = useMemo(
    () => seededShuffle(pairs.map((_, i) => i), seed),
    [pairs, seed]
  )
  const englishItems = useMemo(
    () => seededShuffle(pairs.map((_, i) => i), seed + 17),
    [pairs, seed]
  )

  const [selectedShona, setSelectedShona] = useState<number | null>(null)
  const [bonded, setBonded] = useState<number[]>([])
  const [flash, setFlash] = useState<{ shona: number | null; english: number | null }>({
    shona: null,
    english: null,
  })
  const [firstTryMistakes, setFirstTryMistakes] = useState<Set<number>>(new Set())
  const settledRef = useRef(false)

  const allBonded = bonded.length === pairs.length && pairs.length > 0

  useEffect(() => {
    if (allBonded && !settledRef.current) {
      settledRef.current = true
      // award full points if every pair matched on first try, else half (rounded)
      const points = exercise.points || 15
      const cleanRun = firstTryMistakes.size === 0
      const award = cleanRun ? points : Math.max(1, Math.round(points / 2))
      // small delay so the user sees the final pair bond before feedback appears
      const t = setTimeout(() => onSettle(true, award), 280)
      return () => clearTimeout(t)
    }
  }, [allBonded, exercise.points, firstTryMistakes, onSettle])

  const tryMatch = (englishIdx: number) => {
    if (disabled || selectedShona === null) return
    if (selectedShona === englishIdx) {
      // correct pair
      setBonded((b) => [...b, englishIdx])
      setSelectedShona(null)
    } else {
      // wrong — flash rose and remember the mis-attempt
      setFlash({ shona: selectedShona, english: englishIdx })
      setFirstTryMistakes((s) => {
        const next = new Set(s)
        next.add(selectedShona)
        next.add(englishIdx)
        return next
      })
      setTimeout(() => setFlash({ shona: null, english: null }), 420)
      setSelectedShona(null)
    }
  }

  if (pairs.length === 0) {
    return (
      <button
        type="button"
        onClick={() => onSettle(true)}
        className="w-full rounded-full bg-stone-200 px-8 py-4 lowercase font-medium text-stone-700 transition-colors hover:bg-stone-300"
      >
        skip this question
      </button>
    )
  }

  return (
    <div>
      {/* bonded-pair area */}
      <AnimatePresence>
        {bonded.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 overflow-hidden"
          >
            <p className="mb-2 lowercase text-xs text-stone-400">matched</p>
            <div className="flex flex-wrap gap-2">
              {bonded.map((i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ scale: 0.85, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800"
                >
                  <span className="font-medium">{pairs[i].shona}</span>
                  <span className="text-emerald-500">·</span>
                  <span>{pairs[i].english}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* once every pair is bonded the picker collapses to a clear solved
          state so it never looks like the exercise reset (bug #6). */}
      {allBonded ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-sm font-medium lowercase text-emerald-800"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
            <FaCheck className="text-[10px]" />
          </span>
          all pairs matched
        </motion.div>
      ) : (
      <>
      {/* two-column chip area */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <p className="lowercase text-xs text-stone-400">shona</p>
          {shonaItems.map((i) =>
            bonded.includes(i) ? null : (
              <motion.button
                key={`s-${i}`}
                layout
                type="button"
                disabled={disabled}
                onClick={() => setSelectedShona(i)}
                className={`block w-full rounded-xl border px-4 py-3 text-left text-lg transition-all
                  ${selectedShona === i
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : flash.shona === i
                      ? 'border-rose-300 bg-rose-100 text-rose-800'
                      : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300'}`}
              >
                {pairs[i].shona}
              </motion.button>
            )
          )}
        </div>
        <div className="space-y-2">
          <p className="lowercase text-xs text-stone-400">english</p>
          {englishItems.map((i) =>
            bonded.includes(i) ? null : (
              <motion.button
                key={`e-${i}`}
                layout
                type="button"
                disabled={disabled || selectedShona === null}
                onClick={() => tryMatch(i)}
                className={`block w-full rounded-xl border px-4 py-3 text-left transition-all
                  ${flash.english === i
                    ? 'border-rose-300 bg-rose-100 text-rose-800'
                    : selectedShona !== null
                      ? 'border-stone-300 bg-white text-stone-800 hover:border-emerald-400 hover:bg-emerald-50'
                      : 'border-stone-200 bg-white text-stone-500'}
                  disabled:cursor-not-allowed disabled:opacity-60`}
              >
                {pairs[i].english}
              </motion.button>
            )
          )}
        </div>
      </div>

      <p className="mt-4 lowercase text-xs text-stone-400">
        tap a shona word, then tap its english meaning. full points if every pair is right the first time.
      </p>
      </>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────────────────────
// order-sentence renderer
// ──────────────────────────────────────────────────────────────
function OrderSentenceExercise({
  exercise,
  disabled,
  onSettle,
}: {
  exercise: any
  disabled: boolean
  onSettle: (correct: boolean, awardOverride?: number) => void
}) {
  const tokens: string[] = useMemo(
    () => (Array.isArray(exercise.tokens) ? exercise.tokens : []),
    [exercise]
  )
  const correctOrder: string[] = useMemo(
    () => (Array.isArray(exercise.correctOrder) ? exercise.correctOrder : []),
    [exercise]
  )

  // stable shuffled pool, indexed by position in original tokens array
  const seed = useMemo(() => {
    const s = String(exercise.id || exercise.question || '')
    let n = 0
    for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 233280
    return n || 1
  }, [exercise.id, exercise.question])

  const initialPool = useMemo(
    () => seededShuffle(tokens.map((_, i) => i), seed),
    [tokens, seed]
  )

  const [pool, setPool] = useState<number[]>(initialPool)
  const [picked, setPicked] = useState<number[]>([])

  const moveToBuilder = (i: number) => {
    if (disabled) return
    setPool((p) => p.filter((x) => x !== i))
    setPicked((p) => [...p, i])
  }

  const returnToPool = (i: number) => {
    if (disabled) return
    setPicked((p) => p.filter((x) => x !== i))
    setPool((p) => [...p, i])
  }

  const ready = picked.length === tokens.length && tokens.length > 0

  const check = () => {
    if (!ready) return
    const built = picked.map((idx) => tokens[idx])
    const correct =
      built.length === correctOrder.length &&
      built.every((tok, i) => tok === correctOrder[i])
    onSettle(correct)
  }

  if (tokens.length === 0) {
    return (
      <button
        type="button"
        onClick={() => onSettle(true)}
        className="w-full rounded-full bg-stone-200 px-8 py-4 lowercase font-medium text-stone-700 transition-colors hover:bg-stone-300"
      >
        skip this question
      </button>
    )
  }

  return (
    <div>
      {/* sentence-builder strip */}
      <div className="mb-4 min-h-[64px] rounded-2xl border border-dashed border-stone-300 bg-white/60 p-3">
        {picked.length === 0 ? (
          <p className="lowercase text-sm text-stone-400">tap words below to build the sentence</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {picked.map((i, slot) => (
                <motion.button
                  key={`p-${i}`}
                  layout
                  initial={{ opacity: 0, y: -8, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.9 }}
                  transition={{ duration: 0.18 }}
                  type="button"
                  disabled={disabled}
                  onClick={() => returnToPool(i)}
                  className="rounded-xl border border-stone-900 bg-stone-900 px-4 py-2 text-lg text-white hover:bg-stone-800"
                >
                  <span className="mr-2 text-xs text-stone-400">{slot + 1}.</span>
                  {tokens[i]}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* pool */}
      <div className="flex flex-wrap gap-2">
        <AnimatePresence>
          {pool.map((i) => (
            <motion.button
              key={`pool-${i}`}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              type="button"
              disabled={disabled}
              onClick={() => moveToBuilder(i)}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2 text-lg text-stone-800 transition-colors hover:border-stone-300 disabled:opacity-60"
            >
              {tokens[i]}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      <button
        type="button"
        onClick={check}
        disabled={disabled || !ready}
        className="mt-5 w-full rounded-full bg-stone-900 px-8 py-4 lowercase font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-40"
      >
        check
      </button>

      <p className="mt-2 lowercase text-xs text-stone-400">
        tap a word to add it. tap a placed word to send it back.
      </p>
    </div>
  )
}
