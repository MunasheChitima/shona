'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { FaRedo, FaArrowRight, FaTrophy, FaPlus } from 'react-icons/fa'

// Confetti renders to the full window; load it client-only so SSR stays clean.
const Confetti = dynamic(() => import('react-confetti'), { ssr: false })

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const update = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return size
}

export interface ResultStat {
  label: string
  value: React.ReactNode
}

/**
 * Polished end-of-round screen: an animated accuracy ring, supporting stats,
 * encouraging copy that scales with performance, tasteful confetti on great
 * runs, and clear next actions (play again / back to learning).
 */
export default function ResultsScreen({
  accuracy,
  xpGained,
  stats = [],
  onPlayAgain,
  headline: headlineOverride,
  subcopy: subcopyOverride,
  celebrate,
}: {
  /** 0-100 accuracy used for the ring, copy tier and confetti gate. */
  accuracy: number
  xpGained: number
  stats?: ResultStat[]
  onPlayAgain: () => void
  /** Override the auto headline (e.g. honest "time's up" copy). */
  headline?: string
  /** Override the auto subcopy. */
  subcopy?: string
  /**
   * Gate the "flawless/perfect" celebration (confetti + perfect copy) on a real
   * achievement rather than raw accuracy. Defaults to `accuracy === 100` for
   * games that don't pass it. A game can pass `false` to forbid celebrating an
   * unfinished/imperfect round even at 100% accuracy.
   */
  celebrate?: boolean
}) {
  const router = useRouter()
  const { width, height } = useWindowSize()
  const pct = Math.max(0, Math.min(100, Math.round(accuracy)))
  const canCelebrate = celebrate ?? pct === 100
  const perfect = canCelebrate && pct === 100
  const great = canCelebrate && pct >= 80
  const good = pct >= 50
  const fair = pct >= 25

  const [ringValue, setRingValue] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setRingValue(pct), 150)
    return () => clearTimeout(t)
  }, [pct])

  // Performance-aware copy — celebratory at the top, encouraging (never
  // defeatist) at the bottom.
  const autoHeadline = perfect
    ? 'kwayedza! flawless.'
    : great
      ? 'mhanya! brilliant.'
      : good
        ? 'zvakanaka — nicely done.'
        : fair
          ? 'getting there.'
          : 'nice start.'
  const autoSubcopy = perfect
    ? 'A perfect round — you have these down cold.'
    : great
      ? 'You really know these. Keep that streak alive.'
      : good
        ? 'Solid round. A couple more plays and these will stick.'
        : fair
          ? 'You are building a feel for it — go again and beat that score.'
          : 'These are fresh for you. Play again and watch it climb.'
  const headline = headlineOverride ?? autoHeadline
  const subcopy = subcopyOverride ?? autoSubcopy

  return (
    <div className="relative">
      {great && width > 0 && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={180}
          recycle={false}
          gravity={0.25}
          colors={['#059669', '#10b981', '#34d399', '#a7f3d0', '#fbbf24']}
          className="pointer-events-none fixed inset-0 z-50"
        />
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className="rounded-2xl border border-stone-200 bg-white/80 p-8 text-center backdrop-blur sm:p-10"
      >
        <div className="mx-auto mb-6 h-32 w-32">
          <CircularProgressbar
            value={ringValue}
            text={`${pct}%`}
            styles={buildStyles({
              pathColor: great ? '#059669' : good ? '#10b981' : '#a8a29e',
              textColor: '#1c1917',
              trailColor: '#f5f5f4',
              pathTransitionDuration: 1,
              textSize: '1.25rem',
            })}
          />
        </div>

        <h2 className="mb-1 lowercase text-2xl font-medium tracking-tight text-stone-900">{headline}</h2>
        <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-stone-500">{subcopy}</p>

        {xpGained > 0 && (
          <div className="mx-auto mb-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <FaPlus className="text-xs" aria-hidden />
            {xpGained} XP earned
          </div>
        )}

        {stats.length > 0 && (
          <div className="mx-auto mb-8 grid max-w-md grid-cols-3 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-stone-200 bg-stone-50 px-2 py-3">
                <div className="text-lg font-semibold tabular-nums text-stone-900">{s.value}</div>
                <div className="text-[0.65rem] uppercase tracking-wide text-stone-400">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <motion.button
            type="button"
            onClick={onPlayAgain}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 sm:w-auto"
          >
            <FaRedo className="text-xs" aria-hidden />
            play again
          </motion.button>
          <button
            type="button"
            onClick={() => router.push('/learn')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-6 py-3 text-sm font-medium text-stone-700 transition-colors hover:border-stone-300 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 sm:w-auto"
          >
            back to learning
            <FaArrowRight className="text-xs" aria-hidden />
          </button>
        </div>

        {great && (
          <div className="mt-6 inline-flex items-center gap-1.5 text-xs lowercase text-amber-600">
            <FaTrophy aria-hidden /> new personal best within reach
          </div>
        )}
      </motion.div>
    </div>
  )
}
