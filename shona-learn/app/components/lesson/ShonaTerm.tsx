'use client'
/**
 * Presentational display for a Shona word or phrase shown inside an exercise.
 *
 * This is the single seam where audio will later attach. The user is wiring
 * audio in separately — when that lands, drop a small play button next to the
 * term here (see the `audio hook` comment) and every exercise that renders a
 * Shona term through this component gets audio for free. Do NOT implement
 * audio here yet.
 */
import { motion } from 'framer-motion'

type ShonaTermProps = {
  /** The Shona word or phrase to display. */
  shona: string
  /** Optional pronunciation guide, shown beneath the term in mono/emerald. */
  pronunciation?: string
  /** Visual scale — `lg` for hero phrases, `md` for inline/answer terms. */
  size?: 'md' | 'lg'
  /** Optional className to extend the wrapper. */
  className?: string
}

export default function ShonaTerm({
  shona,
  pronunciation,
  size = 'lg',
  className = '',
}: ShonaTermProps) {
  const termSize = size === 'lg' ? 'text-2xl' : 'text-lg'
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {/* audio hook: play `shona` — a small button goes here once audio lands */}
        <p className={`${termSize} font-medium leading-snug text-stone-900`}>{shona}</p>
      </div>
      {pronunciation && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="mt-1 font-mono text-sm text-emerald-700"
        >
          {pronunciation}
        </motion.p>
      )}
    </div>
  )
}
