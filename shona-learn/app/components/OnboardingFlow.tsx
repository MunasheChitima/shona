'use client'
import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { mutate } from 'swr'
import { useAuth } from '@/lib/auth'

interface OnboardingFlowProps {
  onComplete: () => void
}

// SWR keys that drive the personalized surfaces (heritage banner on /learn,
// the profile cards, the lesson list). Revalidating these after the variant
// POST makes the payoff appear WITHOUT a manual reload.
const LEARNING_PATH_KEY = '/api/learning-path?slug=core'
const PATH_PROGRESS_KEY = '/api/learning-path/progress?slug=core'

// Reason options map onto the existing learning-path variants
// ('default' | 'heritage' | 'new_learner' | 'partner').
type Variant = 'heritage' | 'new_learner' | 'partner'
const REASONS: { value: Variant; label: string; sub: string; icon: string }[] = [
  { value: 'heritage', label: 'reconnecting with heritage', sub: 'i grew up around shona and want to read & write it', icon: '🌳' },
  { value: 'new_learner', label: 'learning from scratch', sub: 'shona is new to me and i want a solid start', icon: '🌱' },
  { value: 'partner', label: 'learning with family', sub: 'i want to use shona at home with people i love', icon: '🌍' },
]

type Pace = 'casual' | 'regular' | 'serious'
const PACES: { value: Pace; label: string; sub: string }[] = [
  { value: 'casual', label: 'casual', sub: '1 lesson a day' },
  { value: 'regular', label: 'regular', sub: '3 lessons a day' },
  { value: 'serious', label: 'serious', sub: '5 lessons a day' },
]

const ONBOARDED_KEY = 'shona_onboarded'
const DAILY_GOAL_KEY = 'shona_daily_goal'

function todayStamp(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const reduceMotion = useReducedMotion()
  const { updateUser } = useAuth()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [variant, setVariant] = useState<Variant | null>(null)
  const [pace, setPace] = useState<Pace | null>(null)
  const [finishing, setFinishing] = useState(false)

  const totalSteps = 3

  const persist = async () => {
    // Always mark onboarded so it only shows once, even on skip.
    try {
      localStorage.setItem(ONBOARDED_KEY, '1')
    } catch {
      /* storage unavailable */
    }

    // Name -> push through the auth context so the greeting + avatar update
    // LIVE everywhere (Navigation, /profile, /learn welcome) without a reload.
    // updateUser also persists to the `user` localStorage key the auth layer
    // hydrates from, so it survives refreshes too.
    const trimmed = name.trim()
    if (trimmed) {
      updateUser({ name: trimmed })
    }

    // Pace -> daily goal. Don't clobber an existing chosen goal.
    if (pace) {
      try {
        if (!localStorage.getItem(DAILY_GOAL_KEY)) {
          localStorage.setItem(
            DAILY_GOAL_KEY,
            JSON.stringify({ size: pace, date: todayStamp(), progress: 0 }),
          )
        }
      } catch {
        /* ignore */
      }
    }

    // Variant -> enrollment. Await the POST, then revalidate the SWR caches
    // that feed the personalized surfaces (heritage banner / variant copy)
    // so the payoff is visible immediately, no reload required.
    if (variant) {
      try {
        await fetch('/api/learning-path/start', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ learningPathSlug: 'core', pathVariant: variant }),
        })
      } catch {
        /* enrollment is best-effort; still revalidate below */
      }
      try {
        await Promise.all([
          mutate(LEARNING_PATH_KEY),
          mutate(PATH_PROGRESS_KEY),
          // The lessons list is requested with different limits across pages
          // (/learn uses ?limit=200). Match every '/api/lessons' key so the
          // variant-filtered list refreshes wherever it's mounted.
          mutate(
            (key) => typeof key === 'string' && key.startsWith('/api/lessons'),
            undefined,
            { revalidate: true },
          ),
        ])
      } catch {
        /* best-effort cache refresh */
      }
    }
  }

  const finish = () => {
    if (finishing) return
    setFinishing(true)
    // Kick off persistence (incl. enrollment POST + SWR revalidation) but don't
    // block the dismiss animation on the network. The name updates synchronously
    // via updateUser; the heritage banner appears as soon as the POST resolves.
    void persist()
    setTimeout(onComplete, 180)
  }

  const next = () => {
    if (step < totalSteps - 1) setStep(step + 1)
    else finish()
  }

  const canAdvance = step === 0 ? true : step === 1 ? variant !== null : pace !== null

  const transition = reduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.4, 0, 0.2, 1] as const }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/30 p-4 backdrop-blur-sm">
      <motion.div
        initial={reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={transition}
        className="w-full max-w-md overflow-hidden rounded-2xl border border-stone-200 bg-white/90 shadow-xl backdrop-blur"
        role="dialog"
        aria-modal="true"
        aria-label="welcome to shona learn"
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-stone-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-base" aria-hidden>🇿🇼</span>
            <span className="text-sm font-medium tracking-tight text-stone-900">shona learn</span>
          </div>
          <button
            onClick={finish}
            disabled={finishing}
            className="text-xs font-medium text-stone-400 transition-colors hover:text-stone-700"
          >
            skip
          </button>
        </div>

        {/* progress */}
        <div className="h-1 bg-stone-100">
          <motion.div
            className="h-full bg-emerald-600"
            initial={false}
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            transition={transition}
          />
        </div>

        <div className="px-6 py-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -16 }}
              transition={transition}
            >
              {step === 0 && (
                <div>
                  <h2 className="text-xl font-medium tracking-tight text-stone-900">mhoro 👋</h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    welcome to shona learn. let&apos;s set things up in a few seconds. what should we call you?
                  </p>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && canAdvance) next() }}
                    placeholder="your name"
                    autoFocus
                    className="mt-5 w-full rounded-xl border border-stone-200 bg-[#fffdf7] px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none"
                    aria-label="your name"
                  />
                  <p className="mt-2 text-xs text-stone-400">optional — you can change this later in your profile.</p>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="text-xl font-medium tracking-tight text-stone-900">why shona?</h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    we&apos;ll tune your path to fit. pick what feels closest.
                  </p>
                  <div className="mt-5 space-y-2">
                    {REASONS.map((r) => {
                      const active = variant === r.value
                      return (
                        <button
                          key={r.value}
                          onClick={() => setVariant(r.value)}
                          className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                            active
                              ? 'border-emerald-600 bg-emerald-50/60'
                              : 'border-stone-200 bg-[#fffdf7] hover:border-stone-300'
                          }`}
                          aria-pressed={active}
                        >
                          <span className="text-xl" aria-hidden>{r.icon}</span>
                          <span>
                            <span className="block text-sm font-medium text-stone-900">{r.label}</span>
                            <span className="mt-0.5 block text-xs text-stone-500">{r.sub}</span>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-xl font-medium tracking-tight text-stone-900">your daily pace</h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">
                    no pressure, no scary timers. you can change this anytime.
                  </p>
                  <div className="mt-5 grid grid-cols-3 gap-2">
                    {PACES.map((p) => {
                      const active = pace === p.value
                      return (
                        <button
                          key={p.value}
                          onClick={() => setPace(p.value)}
                          className={`rounded-xl border px-3 py-4 text-center transition-colors ${
                            active
                              ? 'border-emerald-600 bg-emerald-50/60'
                              : 'border-stone-200 bg-[#fffdf7] hover:border-stone-300'
                          }`}
                          aria-pressed={active}
                        >
                          <span className="block text-sm font-medium text-stone-900">{p.label}</span>
                          <span className="mt-1 block text-xs text-stone-500">{p.sub}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* actions */}
          <div className="mt-7 flex items-center justify-between">
            <span className="text-xs text-stone-400">{step + 1} of {totalSteps}</span>
            <button
              onClick={next}
              disabled={!canAdvance || finishing}
              className="inline-flex items-center justify-center rounded-full bg-stone-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {step === totalSteps - 1 ? 'start learning' : 'next'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
