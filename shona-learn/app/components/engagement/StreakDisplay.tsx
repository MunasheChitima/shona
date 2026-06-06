'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { FaFire } from 'react-icons/fa'
import { useCountUp } from './useCountUp'

interface StreakDisplayProps {
  streak: number
  longestStreak?: number
}

function encouragement(streak: number): string {
  if (streak <= 0) return 'start a streak today — even five minutes counts'
  if (streak === 1) return 'day one — the hardest one is behind you'
  if (streak < 7) return `${streak} days — keep the fire going`
  if (streak < 30) return `${streak} days strong — this is becoming a habit`
  return `${streak} days — you are unstoppable`
}

export default function StreakDisplay({ streak, longestStreak }: StreakDisplayProps) {
  const reduceMotion = useReducedMotion()
  const animated = useCountUp(Math.max(0, streak))
  const active = streak > 0

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-stone-200 p-5 h-full">
      <div className="flex items-center gap-4">
        <motion.div
          aria-hidden
          className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full ${
            active ? 'bg-emerald-50 text-emerald-600' : 'bg-stone-100 text-stone-400'
          }`}
          animate={
            reduceMotion || !active
              ? undefined
              : { scale: [1, 1.08, 1] }
          }
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FaFire className="text-2xl" />
        </motion.div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-medium tracking-tight text-stone-900 tabular-nums">
              {animated}
            </span>
            <span className="text-sm text-stone-500">
              {streak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-stone-600 lowercase">{encouragement(streak)}</p>
        </div>
      </div>
      {typeof longestStreak === 'number' && longestStreak > streak ? (
        <p className="mt-3 text-xs text-stone-500 lowercase">
          longest streak: {longestStreak} days
        </p>
      ) : null}
    </div>
  )
}
