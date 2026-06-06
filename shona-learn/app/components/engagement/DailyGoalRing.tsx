'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import Confetti from 'react-confetti'
import {
  GoalSize,
  GOAL_TARGETS,
  GOAL_LABELS,
  readDailyGoal,
  writeDailyGoal,
  todayStamp,
  hasCelebratedToday,
  markCelebratedToday,
} from './dailyGoal'

interface DailyGoalRingProps {
  /**
   * Honest count of lessons the user completed today, derived from server
   * progress `completedAt` timestamps on the profile page. We take the max of
   * this and any locally-tracked progress.
   */
  lessonsCompletedToday?: number
}

const SIZES: GoalSize[] = ['casual', 'regular', 'serious']

export default function DailyGoalRing({ lessonsCompletedToday = 0 }: DailyGoalRingProps) {
  const reduceMotion = useReducedMotion()
  const [size, setSize] = useState<GoalSize>('regular')
  const [storedProgress, setStoredProgress] = useState(0)
  const [hydrated, setHydrated] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const celebratedRef = useRef(false)

  // Hydrate from localStorage on mount (date-stamped reset handled inside).
  useEffect(() => {
    const state = readDailyGoal()
    setSize(state.size)
    setStoredProgress(state.progress)
    setHydrated(true)
  }, [])

  // Honest progress = max of locally-tracked and server-derived today count.
  const progress = Math.max(storedProgress, Math.max(0, lessonsCompletedToday))
  const target = GOAL_TARGETS[size]
  const percent = target > 0 ? Math.min(100, Math.round((progress / target) * 100)) : 0
  const reached = progress >= target && target > 0

  // Persist whenever the honest progress or size changes (post-hydration).
  useEffect(() => {
    if (!hydrated) return
    writeDailyGoal({ size, date: todayStamp(), progress })
  }, [hydrated, size, progress])

  // Confetti once per achievement-day. The in-mount ref alone wasn't enough:
  // it resets on every page load, so reloading the profile with the goal
  // already met re-fired the celebration. We additionally persist a per-day
  // stamp so it only fires when the goal is *freshly* reached that day.
  useEffect(() => {
    if (!hydrated || reduceMotion) return
    if (reached && !celebratedRef.current) {
      celebratedRef.current = true
      // Already celebrated earlier today (e.g. before this reload) — stay quiet.
      if (hasCelebratedToday()) return
      markCelebratedToday()
      setShowConfetti(true)
      const t = setTimeout(() => setShowConfetti(false), 4000)
      return () => clearTimeout(t)
    }
    if (!reached) celebratedRef.current = false
  }, [reached, hydrated, reduceMotion])

  useEffect(() => {
    if (!showConfetti) return
    const update = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [showConfetti])

  const ringStyles = useMemo(
    () =>
      buildStyles({
        pathColor: reached ? '#059669' : '#10b981',
        trailColor: '#f1ede3',
        pathTransitionDuration: reduceMotion ? 0 : 0.9,
        strokeLinecap: 'round',
      }),
    [reached, reduceMotion]
  )

  return (
    <div className="relative bg-white/80 backdrop-blur rounded-2xl border border-stone-200 p-5 h-full">
      {showConfetti ? (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={160}
          recycle={false}
          gravity={0.25}
          colors={['#059669', '#10b981', '#a7f3d0', '#fcd34d', '#78716c']}
          className="pointer-events-none fixed inset-0 z-50"
        />
      ) : null}

      <div className="flex items-center gap-5">
        <div className="h-24 w-24 flex-shrink-0">
          <CircularProgressbar
            value={percent}
            text={`${progress}/${target}`}
            styles={ringStyles}
            // Slightly smaller text so n/n fits cleanly inside the ring.
            strokeWidth={9}
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-medium tracking-tight text-stone-900 lowercase">
            daily goal
          </h3>
          <p className="mt-0.5 text-sm text-stone-600 lowercase">
            {reached
              ? 'goal reached — beautiful work today'
              : progress > 0
                ? `${target - progress} more ${target - progress === 1 ? 'lesson' : 'lessons'} to go`
                : `${target} ${target === 1 ? 'lesson' : 'lessons'} today`}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs text-stone-500 lowercase">choose your pace</p>
        <div className="grid grid-cols-3 gap-2">
          {SIZES.map((s) => {
            const isActive = s === size
            return (
              <motion.button
                key={s}
                type="button"
                whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                onClick={() => setSize(s)}
                aria-pressed={isActive}
                className={`rounded-xl border px-2 py-2 text-center transition ${
                  isActive
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-emerald-200 hover:bg-emerald-50/40'
                }`}
              >
                <span className="block text-sm font-medium lowercase">{GOAL_LABELS[s]}</span>
                <span className="block text-[11px] text-stone-500">
                  {GOAL_TARGETS[s]} {GOAL_TARGETS[s] === 1 ? 'lesson' : 'lessons'}
                </span>
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
