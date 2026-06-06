'use client'
import { motion, useReducedMotion } from 'framer-motion'
import { IconType } from 'react-icons'
import {
  FaShoePrints,
  FaBook,
  FaStar,
  FaFire,
  FaSeedling,
  FaCrown,
  FaLock,
} from 'react-icons/fa'

export interface MilestoneInput {
  lessonsCompleted: number
  totalXp: number
  streak: number
  wordsLearned: number
}

interface Milestone {
  code: string
  title: string
  description: string
  icon: IconType
  unlocked: boolean
}

export function buildMilestones(input: MilestoneInput): Milestone[] {
  const { lessonsCompleted, totalXp, streak, wordsLearned } = input
  return [
    {
      code: 'first-lesson',
      title: 'first lesson',
      description: 'complete your very first lesson',
      icon: FaShoePrints,
      unlocked: lessonsCompleted >= 1,
    },
    {
      code: 'ten-lessons',
      title: '10 lessons',
      description: 'finish ten lessons',
      icon: FaBook,
      unlocked: lessonsCompleted >= 10,
    },
    {
      code: 'hundred-xp',
      title: '100 xp',
      description: 'earn your first hundred xp',
      icon: FaStar,
      unlocked: totalXp >= 100,
    },
    {
      code: 'week-streak',
      title: '7-day streak',
      description: 'practice seven days in a row',
      icon: FaFire,
      unlocked: streak >= 7,
    },
    {
      code: 'fifty-words',
      title: '50 words',
      description: 'learn fifty Shona words',
      icon: FaSeedling,
      unlocked: wordsLearned >= 50,
    },
    {
      code: 'thirty-streak',
      title: '30-day streak',
      description: 'a full month of daily practice',
      icon: FaCrown,
      unlocked: streak >= 30,
    },
  ]
}

/**
 * Encouraging hint pointing at the nearest locked milestone, so the locked
 * badges read as "next up" rather than a wall of locks.
 */
function nextBadgeHint(input: MilestoneInput, nextTitle: string | null): string | null {
  if (!nextTitle) return null
  const { lessonsCompleted, totalXp, streak } = input
  if (nextTitle === 'first lesson') {
    return "you're one lesson away from your first badge"
  }
  if (nextTitle === '10 lessons') {
    const left = 10 - lessonsCompleted
    return `${left} more ${left === 1 ? 'lesson' : 'lessons'} to unlock "10 lessons"`
  }
  if (nextTitle === '100 xp') {
    const left = 100 - totalXp
    return `${left} xp to go for your "100 xp" badge`
  }
  if (nextTitle === '7-day streak') {
    const left = 7 - streak
    return `${left} more ${left === 1 ? 'day' : 'days'} for a 7-day streak`
  }
  if (nextTitle === '30-day streak') {
    const left = 30 - streak
    return `${left} more days for a full month`
  }
  return `next up: "${nextTitle}"`
}

export default function Milestones({ input }: { input: MilestoneInput }) {
  const reduceMotion = useReducedMotion()
  const milestones = buildMilestones(input)
  const unlockedCount = milestones.filter((m) => m.unlocked).length
  const nextLocked = milestones.find((m) => !m.unlocked)
  const hint = nextBadgeHint(input, nextLocked?.title ?? null)

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl border border-stone-200 p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-base font-medium tracking-tight text-stone-900 lowercase">
          milestones
        </h2>
        <span className="text-xs text-stone-500 lowercase tabular-nums">
          {unlockedCount} of {milestones.length}
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {milestones.map((m, i) => {
          const Icon = m.icon
          return (
            <motion.li
              key={m.code}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04, ease: 'easeOut' }}
              className={`rounded-xl border p-3 text-center ${
                m.unlocked
                  ? 'border-emerald-200 bg-emerald-50'
                  : 'border-stone-200 bg-stone-50'
              }`}
            >
              <div
                className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full ${
                  m.unlocked ? 'bg-white text-emerald-600' : 'bg-stone-100 text-stone-400'
                }`}
                aria-hidden
              >
                {m.unlocked ? <Icon className="text-lg" /> : <FaLock className="text-sm" />}
              </div>
              <p
                className={`text-sm font-medium lowercase ${
                  m.unlocked ? 'text-stone-900' : 'text-stone-400'
                }`}
              >
                {m.title}
              </p>
              <p
                className={`mt-0.5 text-[11px] leading-snug lowercase ${
                  m.unlocked ? 'text-stone-600' : 'text-stone-400'
                }`}
              >
                {m.description}
              </p>
            </motion.li>
          )
        })}
      </ul>
      {hint ? (
        <p className="mt-4 text-center text-xs text-emerald-700 lowercase">{hint}</p>
      ) : null}
    </div>
  )
}
