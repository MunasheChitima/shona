'use client'
import { useEffect, useMemo, useState, useCallback } from 'react'
import { FaTimes, FaCheck } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import LessonShell from './lesson/LessonShell'
import ShonaTerm from './lesson/ShonaTerm'
import EmphasisText from './lesson/EmphasisText'
import { displayLessonTitle } from './learning-path/LessonRow'

// ── public api ──────────────────────────────────────────────────
// Shares the same prop shape as ExerciseModal so the parent can drop
// it in interchangeably for heritage learners on review-mode units.
interface ReviewLessonModalProps {
  lesson: any
  onClose: () => void
  onComplete: (score: number) => void
}

// ── exercise shape we render inline ─────────────────────────────
type RecallItem = {
  id: string
  question: string
  shonaPhrase?: string
  englishPhrase?: string
  options: string[]
  correctAnswer: string
  points: number
}

// ── helpers ─────────────────────────────────────────────────────
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function parseOptions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map((o) => String(o))
  if (typeof raw !== 'string') return []
  const trimmed = raw.trim()
  if (!trimmed) return []
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) return parsed.map((o) => String(o))
    } catch {
      /* ignore */
    }
  }
  if (trimmed.includes(',')) return trimmed.split(',').map((o) => o.trim())
  return [trimmed]
}

/**
 * Pick the recall-friendly exercises from a lesson and reshape them into a
 * uniform MC item we can render with one code path. Prefers `multiple_choice`,
 * falls back to converting `matching` pairs into a single-pick MC.
 */
function buildRecallItems(lesson: any): RecallItem[] {
  const exercises: any[] = Array.isArray(lesson?.exercises) ? lesson.exercises : []
  const items: RecallItem[] = []

  // 1) Native multiple_choice — easiest to render.
  for (const ex of exercises) {
    if (ex?.type !== 'multiple_choice') continue
    const options = parseOptions(ex.options)
    if (options.length < 2 || !ex.correctAnswer) continue
    items.push({
      id: String(ex.id ?? `${lesson.id}-mc-${items.length}`),
      question: String(ex.question ?? 'pick the meaning'),
      shonaPhrase: ex.shonaPhrase,
      englishPhrase: ex.englishPhrase,
      options,
      correctAnswer: String(ex.correctAnswer),
      points: typeof ex.points === 'number' ? ex.points : 10,
    })
  }

  // 2) If still short, synthesize MC-style questions from `matching` pairs.
  if (items.length < 2) {
    for (const ex of exercises) {
      if (ex?.type !== 'matching') continue
      const pairs: Array<{ shona?: string; english?: string }> = Array.isArray(ex.pairs) ? ex.pairs : []
      if (pairs.length < 2) continue
      const englishes = pairs
        .map((p) => (typeof p?.english === 'string' ? p.english.trim() : ''))
        .filter(Boolean)
      const targets = pairs.filter(
        (p) => typeof p?.shona === 'string' && p.shona.trim() && typeof p?.english === 'string' && p.english.trim()
      )
      if (targets.length === 0 || englishes.length < 2) continue
      const pick = targets[Math.floor(Math.random() * targets.length)]
      const correct = String(pick.english).trim()
      const distractors = shuffle(englishes.filter((e) => e !== correct)).slice(0, 3)
      const options = shuffle([correct, ...distractors])
      items.push({
        id: String(ex.id ?? `${lesson.id}-match-${items.length}`),
        question: `what does "${pick.shona}" mean?`,
        options,
        correctAnswer: correct,
        points: typeof ex.points === 'number' ? ex.points : 10,
      })
      if (items.length >= 4) break
    }
  }

  return shuffle(items).slice(0, 2)
}

export function canRenderReview(lesson: any): boolean {
  return buildRecallItems(lesson).length >= 2
}

// ── component ───────────────────────────────────────────────────
export default function ReviewLessonModal({ lesson, onClose, onComplete }: ReviewLessonModalProps) {
  // Build once per lesson so the random sample is stable while the modal is open.
  const items = useMemo<RecallItem[]>(() => buildRecallItems(lesson), [lesson])

  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string>('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  // count of correct answers — converted to an accuracy % on completion so the
  // stored score honours the shared scoring contract (0..100 accuracy).
  const [correctCount, setCorrectCount] = useState(0)
  const [done, setDone] = useState(false)

  const requestClose = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [requestClose])

  const current = items[index]

  const advance = (finalCorrect: number) => {
    if (index < items.length - 1) {
      setIndex(index + 1)
      setSelected('')
      setShowFeedback(false)
    } else {
      setDone(true)
      const total = items.length || 1
      const accuracy = Math.max(0, Math.min(100, Math.round((finalCorrect / total) * 100)))
      // Brief beat so the user sees the "you're sharp" confirmation before
      // the celebration modal fires on the parent.
      setTimeout(() => onComplete(accuracy), 900)
    }
  }

  const handleAnswer = (answer: string) => {
    if (showFeedback || !current) return
    setSelected(answer)
    const correct =
      answer.trim().toLowerCase() === String(current.correctAnswer).trim().toLowerCase()
    setIsCorrect(correct)
    setShowFeedback(true)
    const nextCorrect = correct ? correctCount + 1 : correctCount
    if (correct) setCorrectCount(nextCorrect)
    setTimeout(() => advance(nextCorrect), 1100)
  }

  // ── shared shell ──
  // A render function, not an in-render component, so LessonShell keeps a stable
  // type across renders and never remounts (and wipes) the question subtree.
  const shell = (children: React.ReactNode) => (
    <LessonShell
      onRequestClose={requestClose}
      maxWidth="xl"
      testId="review-lesson-modal"
      contentTestId="review-content"
    >
      {children}
    </LessonShell>
  )

  // Should never render with <2 items — parent gates on canRenderReview —
  // but guard anyway so we never crash.
  if (items.length < 2) {
    return shell(
        <div className="p-10 text-center">
          <p className="mb-4 lowercase text-stone-600">no quick review available for this lesson.</p>
          <button
            type="button"
            onClick={requestClose}
            className="lowercase text-sm text-stone-500 underline underline-offset-4 hover:text-stone-700"
          >
            close
          </button>
        </div>
    )
  }

  // ── header ──
  const Header = (
    <div className="flex items-start justify-between gap-3 border-b border-stone-100 px-7 pt-6 pb-5">
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 lowercase text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
            quick review
          </span>
          {typeof lesson?.orderIndex === 'number' && (
            <span className="lowercase text-xs text-stone-400">lesson {lesson.orderIndex}</span>
          )}
        </div>
        <h2 className="truncate text-lg font-medium tracking-tight lowercase text-stone-900">
          {displayLessonTitle(lesson ?? {})}
        </h2>
      </div>
      <button
        type="button"
        onClick={requestClose}
        aria-label="close review"
        className="rounded-full p-2 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
      >
        <FaTimes />
      </button>
    </div>
  )

  // ── body: confirmation when done ──
  if (done) {
    return shell(
      <>
        {Header}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-7 py-10 text-center"
        >
          <p className="text-2xl">✨</p>
          <p className="mt-3 lowercase text-lg font-medium text-stone-900">you&apos;re sharp — moving on</p>
          <p className="mt-1 lowercase text-sm text-stone-500">
            {correctCount} of {items.length} correct
          </p>
        </motion.div>
      </>
    )
  }

  // ── body: the recall question ──
  return shell(
    <>
      {Header}
      <div className="px-6 pb-6 pt-5 sm:px-7">
        <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="mb-2 lowercase text-xs text-stone-400">
            question {index + 1} of {items.length}
          </p>
          <h3 className="text-lg font-medium leading-snug tracking-tight text-stone-900">
            {current.question}
          </h3>

          {current.shonaPhrase && (
            <div className="mt-4 rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <ShonaTerm shona={current.shonaPhrase} size="md" />
            </div>
          )}
          {current.englishPhrase && !current.shonaPhrase && (
            <div className="mt-4 rounded-2xl border border-stone-200 bg-white px-4 py-3">
              <p className="text-lg font-medium text-stone-900">{current.englishPhrase}</p>
            </div>
          )}

          <div className="mt-5 space-y-2.5">
            {current.options.map((option, i) => {
              const correctOpt = showFeedback && option === current.correctAnswer
              const wrongOpt = showFeedback && option === selected && !isCorrect
              return (
                <motion.button
                  key={`${current.id}-${i}`}
                  type="button"
                  onClick={() => handleAnswer(option)}
                  disabled={showFeedback}
                  data-testid="review-answer-option"
                  animate={
                    correctOpt
                      ? { scale: [1, 1.03, 1] }
                      : wrongOpt
                        ? { x: [0, -6, 6, -4, 4, 0] }
                        : { scale: 1, x: 0 }
                  }
                  transition={{ duration: correctOpt ? 0.3 : 0.35 }}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-base transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1
                    ${correctOpt
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 focus:ring-emerald-400'
                      : wrongOpt
                        ? 'border-rose-500 bg-rose-50 text-rose-700 focus:ring-rose-300'
                        : 'border-stone-200 bg-white text-stone-800 hover:border-stone-300 focus:ring-stone-300 disabled:opacity-60'}`}
                >
                  <span>{option}</span>
                  {correctOpt && (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <FaCheck className="text-[10px]" />
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>
        </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mt-5 rounded-2xl border px-4 py-3 ${
                isCorrect ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50/70'
              }`}
            >
              <p className={`lowercase text-sm font-medium ${isCorrect ? 'text-emerald-800' : 'text-rose-700'}`}>
                {isCorrect ? 'still got it' : <>answer: <EmphasisText text={current.correctAnswer} /></>}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* footer: progress dots + skip review */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5" aria-label={`progress ${index + (showFeedback ? 1 : 0)} of ${items.length}`}>
            {items.map((_, i) => {
              const filled = i < index || (i === index && showFeedback)
              return (
                <span
                  key={i}
                  className={`inline-block h-2 w-2 rounded-full ${filled ? 'bg-emerald-600' : 'bg-stone-200'}`}
                />
              )
            })}
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="lowercase text-sm text-stone-500 underline underline-offset-4 hover:text-stone-700"
          >
            skip review
          </button>
        </div>
      </div>
    </>
  )
}
