'use client'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa'

interface ContinueLearningProps {
  /** Human-readable label for where the learner left off, e.g. a stage name. */
  contextLabel?: string
  /** Whether the learner has started yet (changes the copy). */
  started?: boolean
}

export default function ContinueLearning({ contextLabel, started = true }: ContinueLearningProps) {
  const reduceMotion = useReducedMotion()
  return (
    <motion.div
      whileHover={reduceMotion ? undefined : { y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        href="/learn"
        className="group flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition hover:bg-emerald-100/70"
      >
        <div className="min-w-0">
          <p className="text-sm text-emerald-700 lowercase">
            {started ? 'pick up where you left off' : 'ready to begin'}
          </p>
          <p className="mt-0.5 truncate text-lg font-medium tracking-tight text-stone-900 lowercase">
            {started ? (contextLabel || 'continue learning') : 'start your first lesson'}
          </p>
        </div>
        <span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-stone-900 text-white transition group-hover:bg-stone-800"
          aria-hidden
        >
          <FaArrowRight />
        </span>
      </Link>
    </motion.div>
  )
}
