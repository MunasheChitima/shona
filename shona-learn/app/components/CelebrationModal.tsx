'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowRight, FaCheck } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'
import { useCountUp } from './lesson/useCountUp'
import { celebrationPhrase } from './lesson/feedback'
import { displayLessonTitle } from './learning-path/LessonRow'

interface CelebrationModalProps {
  isOpen: boolean
  /** Honest accuracy percent for the lesson, 0..100 (per the scoring contract). */
  score: number
  /** XP the lesson awards on completion — shown as "+N xp earned". */
  xpEarned?: number
  lessonTitle: string
  /**
   * Lessons completed in the learner's ACTIVE path AFTER this lesson, and the
   * total lessons in that path. Both come from the learn page's single
   * source-of-truth count (the exact set the stages render), so the number
   * shown here always matches the header and the stage rollups. Passing
   * undefined hides the progress line (e.g. quest-filtered views).
   */
  completedCount?: number
  lessonTotal?: number
  onClose: () => void
  onNextLesson?: () => void
  nextLessonTitle?: string
}

/**
 * `score` is the lesson's accuracy percent (0..100). We map it onto the existing
 * tier thresholds for confetti/copy and present it clearly as an accuracy %.
 */
function tierFor(score: number): {
  phrase: { shona: string; english: string }
  celebratory: boolean
  perfect: boolean
} {
  const accuracy = Math.max(0, Math.min(1, score / 100))
  return {
    phrase: celebrationPhrase(accuracy),
    celebratory: score >= 70,
    perfect: score >= 100,
  }
}

export default function CelebrationModal({
  isOpen,
  score,
  xpEarned,
  lessonTitle,
  completedCount,
  lessonTotal,
  onClose,
  onNextLesson,
  nextLessonTitle,
}: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  const { phrase, celebratory, perfect } = tierFor(score)
  const counted = useCountUp(score, isOpen, 1200)

  useEffect(() => {
    if (isOpen && celebratory) {
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 4500)
      return () => clearTimeout(t)
    }
    setShowConfetti(false)
  }, [isOpen, celebratory])

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Escape closes — keeps parity with the other lesson modals.
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showConfetti && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              numberOfPieces={perfect ? 320 : 180}
              recycle={false}
              gravity={0.18}
              colors={['#10b981', '#059669', '#a7f3d0', '#fcd34d', '#fffdf7']}
            />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-stretch justify-center bg-stone-900/40 backdrop-blur-sm sm:items-center sm:p-4"
            onClick={onClose}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="flex max-h-screen w-full max-w-md flex-col overflow-y-auto border-stone-200 bg-[#fffdf7] shadow-xl sm:max-h-[92vh] sm:rounded-3xl sm:border"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-7 pb-8 pt-10 text-center">
                {/* earned check mark */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 16 }}
                  className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                >
                  <FaCheck className="text-2xl" />
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lowercase text-sm text-stone-400"
                >
                  lesson complete
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mt-1 text-2xl font-medium tracking-tight lowercase text-stone-900"
                >
                  {displayLessonTitle({ title: lessonTitle })}
                </motion.h2>

                {/* count-up accuracy + xp earned */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, type: 'spring', stiffness: 200, damping: 18 }}
                  className="mt-8"
                >
                  <div className="flex items-baseline justify-center text-6xl font-semibold tabular-nums tracking-tight text-emerald-600">
                    {counted}
                    <span className="text-3xl">%</span>
                  </div>
                  <p className="mt-1 lowercase text-sm text-stone-500">
                    {perfect ? 'perfect! no mistakes' : 'accuracy'}
                  </p>
                  {typeof xpEarned === 'number' && xpEarned > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.55 }}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium lowercase text-emerald-700 ring-1 ring-emerald-200"
                    >
                      +{xpEarned} xp earned
                    </motion.p>
                  )}
                </motion.div>

                {/* encouraging Shona phrase */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-7 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-5 py-4"
                >
                  <p className="text-lg font-medium lowercase text-emerald-800">{phrase.shona}</p>
                  <p className="mt-0.5 lowercase text-sm text-emerald-700">{phrase.english}</p>
                </motion.div>

                {/* path progress — uses the SAME single source-of-truth N as the
                    learn-page header and stage rollups, so the learner never sees
                    a conflicting total here. */}
                {typeof completedCount === 'number' && typeof lessonTotal === 'number' && lessonTotal > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.65 }}
                    className="mt-5"
                  >
                    <p className="lowercase text-sm font-medium text-stone-600">
                      {completedCount} of {lessonTotal} lessons completed
                    </p>
                    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-stone-200">
                      <motion.div
                        className="h-full rounded-full bg-emerald-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (completedCount / lessonTotal) * 100)}%` }}
                        transition={{ delay: 0.7, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* actions */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.75 }}
                  className="mt-8 space-y-3"
                >
                  {onNextLesson ? (
                    <>
                      <button
                        type="button"
                        onClick={onNextLesson}
                        className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-8 py-4 lowercase font-medium text-white transition-colors hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:ring-offset-2"
                      >
                        {nextLessonTitle ? `next: ${displayLessonTitle({ title: nextLessonTitle })}` : 'next lesson'}
                        <FaArrowRight className="text-sm" />
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full rounded-full px-8 py-3 lowercase font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-300"
                      >
                        back to lessons
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-8 py-4 lowercase font-medium text-white transition-colors hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-700 focus:ring-offset-2"
                    >
                      back to lessons <FaArrowRight className="text-sm" />
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
