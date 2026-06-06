'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaPhone,
  FaShareAlt,
  FaTrophy,
} from 'react-icons/fa'
import { ProtectedRoute } from '../../../../lib/auth'
import LoadingSpinner from '../../../components/LoadingSpinner'
import ErrorBoundary from '../../../components/ErrorBoundary'
import AuthError from '../../../components/AuthError'
import { apiAuthHeaders } from '@/lib/api-auth-headers'

type ScenarioPhrase = {
  shona: string
  english: string
  pronunciation?: string
  audioUrl?: string | null
  usageNote?: string
  needs_verification?: boolean
}

type ScenarioDialogueTurn = {
  speaker: 'gogo' | 'learner'
  shona: string
  english: string
  expected?: boolean
  audioUrl?: string | null
}

type ScenarioExercise = {
  id: string
  type: 'multiple_choice' | 'translation' | 'fill_blank'
  question: string
  correctAnswer: string
  options?: string[]
  points?: number
}

type ScenarioPack = {
  id: string
  title: string
  subtitle: string
  emoji: string
  whenToUse: string
  estimatedMinutes: number
  difficulty: string
  phrases: ScenarioPhrase[]
  dialogue: { context: string; turns: ScenarioDialogueTurn[] }
  exercises: ScenarioExercise[]
  culturalNote?: string
  needs_verification?: boolean
}

type Phase = 'phrases' | 'dialogue' | 'exercises' | 'milestone'

function normalize(s: string): string {
  return s.toLowerCase().replace(/[\s.,!?¿¡;:"'()\-]/g, '').trim()
}

function isCorrectAnswer(input: string, expected: string): boolean {
  return normalize(input) === normalize(expected)
}

function ScenarioContent({ pack }: { pack: ScenarioPack }) {
  const [phase, setPhase] = useState<Phase>('phrases')

  // Dialogue state
  const [revealedTurns, setRevealedTurns] = useState(0)

  // Exercise state
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [textAnswer, setTextAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)

  // Share state
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle')

  const dialogueTurns = pack.dialogue?.turns || []
  const exercises = pack.exercises || []

  // Initialise the first speaker's bubble (gogo opens the call).
  useEffect(() => {
    if (phase === 'dialogue' && revealedTurns === 0 && dialogueTurns.length > 0) {
      setRevealedTurns(1)
    }
  }, [phase, revealedTurns, dialogueTurns.length])

  const handleRevealNextLearnerTurn = () => {
    // reveal the next learner bubble plus the following gogo response if any
    const nextLearnerIndex = dialogueTurns.findIndex(
      (turn, idx) => idx >= revealedTurns && turn.speaker === 'learner'
    )
    if (nextLearnerIndex === -1) return
    // reveal up to and including the gogo turn that comes after this learner turn
    let revealTo = nextLearnerIndex + 1
    if (dialogueTurns[nextLearnerIndex + 1]?.speaker === 'gogo') {
      revealTo = nextLearnerIndex + 2
    }
    setRevealedTurns(Math.min(revealTo, dialogueTurns.length))
  }

  const allLearnerTurnsRevealed = useMemo(() => {
    const lastLearner = [...dialogueTurns].map((t, i) => ({ t, i })).reverse().find(({ t }) => t.speaker === 'learner')
    if (!lastLearner) return true
    return revealedTurns > lastLearner.i
  }, [dialogueTurns, revealedTurns])

  const currentExercise = exercises[exerciseIndex]

  const handleExerciseAnswer = useCallback(
    (answer: string) => {
      if (!currentExercise || showFeedback) return
      const correct = isCorrectAnswer(answer, currentExercise.correctAnswer)
      setIsCorrect(correct)
      setSelectedAnswer(answer)
      setShowFeedback(true)
      if (correct) setScore((s) => s + (currentExercise.points || 10))

      setTimeout(() => {
        if (exerciseIndex < exercises.length - 1) {
          setExerciseIndex((i) => i + 1)
          setSelectedAnswer('')
          setTextAnswer('')
          setShowFeedback(false)
        } else {
          setPhase('milestone')
          setShowFeedback(false)
        }
      }, 1600)
    },
    [currentExercise, exerciseIndex, exercises.length, showFeedback]
  )

  const milestoneMessage = useMemo(() => {
    switch (pack.id) {
      case 'call-gogo':
        return 'you can now call your gogo'
      case 'recipe-from-auntie':
        return 'you can now ask your auntie for a recipe'
      case 'condolence-call':
        return 'you can now make a condolence call'
      case 'baby-or-wedding-congrats':
        return 'you can now congratulate the family'
      default:
        return `you can now use the "${pack.title}" phrases`
    }
  }, [pack.id, pack.title])

  const shareText = useMemo(() => {
    return `i just learned how to ${milestoneMessage.replace('you can now ', '')} in shona. join me on shona learn.`
  }, [milestoneMessage])

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({ title: pack.title, text: shareText })
        setShareStatus('shared')
        return
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText)
        setShareStatus('copied')
        return
      }
    } catch {
      // user dismissed share — silent
    }
  }

  return (
    <div className="min-h-screen bg-app-surface">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link
          href="/scenarios"
          className="inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
        >
          <FaArrowLeft /> back to scenarios
        </Link>

        <div className="mt-4 flex items-start gap-4">
          <div className="text-5xl" aria-hidden>
            {pack.emoji}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-stone-900 lowercase">{pack.title}</h1>
            <p className="mt-1 text-stone-600 lowercase">{pack.subtitle}</p>
          </div>
        </div>

        {/* Phase tabs / progress */}
        <div className="mt-6 flex items-center gap-2 text-xs">
          {(['phrases', 'dialogue', 'exercises'] as Phase[]).map((p, idx) => {
            const order = { phrases: 0, dialogue: 1, exercises: 2, milestone: 3 } as const
            const active = phase === p
            const done = order[phase] > order[p]
            return (
              <span
                key={p}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${
                  active
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : done
                    ? 'border-stone-300 bg-stone-100 text-stone-700'
                    : 'border-stone-200 bg-white text-stone-500'
                }`}
              >
                <span className="font-semibold">{idx + 1}.</span> {p}
                {done ? <FaCheck className="ml-1 text-emerald-600" /> : null}
              </span>
            )
          })}
        </div>

        {/* Phrases phase */}
        <AnimatePresence mode="wait">
          {phase === 'phrases' && (
            <motion.div
              key="phrases"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <h2 className="text-xl font-semibold text-stone-900 lowercase mb-3">
                phrases you'll need
              </h2>
              <p className="text-sm text-stone-600 mb-6">
                read each phrase out loud. when you're ready, continue to the dialogue.
              </p>

              <div className="space-y-3">
                {pack.phrases.map((phrase, i) => (
                  <motion.div
                    key={`${phrase.shona}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    className="rounded-2xl border border-stone-200 bg-white p-5"
                  >
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <p className="text-lg font-semibold text-stone-900">{phrase.shona}</p>
                      {phrase.needs_verification ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-200">
                          pending verification
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-stone-600">{phrase.english}</p>
                    {phrase.pronunciation ? (
                      <p className="mt-1 text-xs text-stone-500 italic">
                        say it: {phrase.pronunciation}
                      </p>
                    ) : null}
                    {phrase.usageNote ? (
                      <p className="mt-3 text-xs text-stone-600 leading-relaxed">
                        {phrase.usageNote}
                      </p>
                    ) : null}
                    <span className="mt-2 inline-block text-stone-400 text-xs">audio coming soon</span>
                  </motion.div>
                ))}
              </div>

              {pack.culturalNote ? (
                <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-950">
                  <p className="font-semibold mb-1 lowercase">cultural note</p>
                  <p className="leading-relaxed">{pack.culturalNote}</p>
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => setPhase('dialogue')}
                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                continue to dialogue <FaArrowRight />
              </button>
            </motion.div>
          )}

          {phase === 'dialogue' && (
            <motion.div
              key="dialogue"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <h2 className="text-xl font-semibold text-stone-900 lowercase mb-1">
                rehearse the dialogue
              </h2>
              <p className="text-sm text-stone-600 mb-4">{pack.dialogue.context}</p>

              <div className="rounded-3xl border border-stone-200 bg-white p-5">
                <div className="space-y-3">
                  {dialogueTurns.slice(0, revealedTurns).map((turn, idx) => {
                    const isGogo = turn.speaker === 'gogo'
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${isGogo ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                            isGogo
                              ? 'bg-stone-50 border border-stone-200 text-stone-900'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          <p
                            className={`text-[10px] uppercase tracking-wide font-semibold mb-1 ${
                              isGogo ? 'text-stone-500' : 'text-emerald-50/80'
                            }`}
                          >
                            {isGogo ? 'them' : 'you'}
                          </p>
                          <p className="font-medium">{turn.shona}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isGogo ? 'text-stone-500' : 'text-emerald-50/90'
                            }`}
                          >
                            {turn.english}
                          </p>
                        </div>
                      </motion.div>
                    )
                  })}

                  {!allLearnerTurnsRevealed ? (
                    <motion.button
                      type="button"
                      onClick={handleRevealNextLearnerTurn}
                      whileHover={{ y: -1 }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                    >
                      tap to reveal your next line
                    </motion.button>
                  ) : null}
                </div>
              </div>

              {allLearnerTurnsRevealed ? (
                <button
                  type="button"
                  onClick={() => {
                    setPhase('exercises')
                    setExerciseIndex(0)
                    setShowFeedback(false)
                  }}
                  className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  now try the exercises <FaArrowRight />
                </button>
              ) : null}
            </motion.div>
          )}

          {phase === 'exercises' && currentExercise && (
            <motion.div
              key="exercises"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="mt-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-stone-900 lowercase">exercises</h2>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <FaTrophy className="text-amber-500" />
                  <span className="font-semibold text-stone-900">{score}</span>
                </div>
              </div>

              <div className="mb-3 flex justify-between text-xs text-stone-500">
                <span>
                  question {exerciseIndex + 1} of {exercises.length}
                </span>
                <span>
                  {Math.round(((exerciseIndex + 1) / exercises.length) * 100)}% complete
                </span>
              </div>
              <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-stone-200">
                <motion.div
                  className="h-full bg-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((exerciseIndex + 1) / exercises.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>

              <motion.div
                key={currentExercise.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-stone-200 bg-white p-6"
              >
                <h3 className="text-lg font-semibold text-stone-900">
                  {currentExercise.question}
                </h3>

                <div className="mt-5 space-y-3">
                  {currentExercise.type === 'multiple_choice' && currentExercise.options ? (
                    currentExercise.options.map((option) => {
                      const showIsCorrect =
                        showFeedback && isCorrectAnswer(option, currentExercise.correctAnswer)
                      const showIsWrong =
                        showFeedback && option === selectedAnswer && !isCorrect
                      return (
                        <motion.button
                          key={option}
                          whileHover={!showFeedback ? { y: -1 } : undefined}
                          whileTap={!showFeedback ? { scale: 0.99 } : undefined}
                          disabled={showFeedback}
                          onClick={() => handleExerciseAnswer(option)}
                          className={`w-full rounded-2xl border px-5 py-4 text-left text-base transition-colors ${
                            showIsCorrect
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                              : showIsWrong
                              ? 'border-rose-300 bg-rose-50 text-rose-800'
                              : 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50'
                          }`}
                        >
                          {option}
                        </motion.button>
                      )
                    })
                  ) : null}

                  {(currentExercise.type === 'translation' ||
                    currentExercise.type === 'fill_blank') && (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && textAnswer.trim()) {
                            handleExerciseAnswer(textAnswer)
                          }
                        }}
                        disabled={showFeedback}
                        placeholder="type your answer..."
                        className="w-full rounded-2xl border-2 border-stone-200 px-4 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                      />
                      <button
                        type="button"
                        disabled={showFeedback || !textAnswer.trim()}
                        onClick={() => handleExerciseAnswer(textAnswer)}
                        className="w-full rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                      >
                        submit
                      </button>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {showFeedback ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-5 rounded-2xl border p-4 text-sm ${
                        isCorrect
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-rose-200 bg-rose-50 text-rose-800'
                      }`}
                    >
                      {isCorrect ? (
                        <p className="font-semibold">nice — you got it.</p>
                      ) : (
                        <>
                          <p className="font-semibold">not quite.</p>
                          <p className="mt-1">
                            correct answer:{' '}
                            <span className="font-semibold">{currentExercise.correctAnswer}</span>
                          </p>
                        </>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}

          {phase === 'milestone' && (
            <motion.div
              key="milestone"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="mt-8 rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-8 text-center"
            >
              <div className="text-6xl mb-4">{pack.emoji}</div>
              <h2 className="text-2xl font-bold text-stone-900 lowercase">
                {milestoneMessage}
              </h2>
              <p className="mt-2 text-sm text-stone-600">
                you scored {score} of{' '}
                {exercises.reduce((acc, ex) => acc + (ex.points || 0), 0)} on the exercises.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  <FaShareAlt /> share this with family
                </button>
                <Link
                  href="/scenarios"
                  className="inline-flex items-center gap-2 rounded-2xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  more scenarios
                </Link>
              </div>

              {shareStatus === 'copied' ? (
                <p className="mt-4 text-xs text-stone-500">copied to clipboard.</p>
              ) : null}
              {shareStatus === 'shared' ? (
                <p className="mt-4 text-xs text-stone-500">shared — siyabonga.</p>
              ) : null}

              <p className="mt-8 text-xs text-stone-500 inline-flex items-center gap-2 justify-center">
                <FaPhone /> next step: make the actual call this week.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function ScenarioDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params?.id

  const [pack, setPack] = useState<ScenarioPack | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const fetchPack = useCallback(async () => {
    if (!id) return
    try {
      setError(null)
      const res = await fetch(`/api/scenarios/${encodeURIComponent(id)}`, {
        headers: { ...apiAuthHeaders() },
      })
      if (!res.ok) {
        throw new Error(`Failed to load scenario (${res.status})`)
      }
      const data = await res.json()
      setPack(data.pack as ScenarioPack)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error loading scenario'))
    }
  }, [id])

  useEffect(() => {
    fetchPack()
  }, [fetchPack])

  if (error) {
    return <AuthError error={error.message} onRetry={() => void fetchPack()} />
  }

  if (!pack) {
    return <LoadingSpinner fullScreen message="loading scenario..." />
  }

  return (
    <ErrorBoundary>
      <ProtectedRoute>
        <ScenarioContent pack={pack} />
      </ProtectedRoute>
    </ErrorBoundary>
  )
}
