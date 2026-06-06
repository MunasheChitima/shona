'use client'
import { motion } from 'framer-motion'

/**
 * Compact live stat readout used in the game HUD (score, streak, lives, etc.).
 * Subtle scale pop when the value changes via the `pulseKey`.
 */
export default function StatPill({
  label,
  value,
  pulseKey,
  accent = false,
}: {
  label: string
  value: React.ReactNode
  /** change this to trigger a small pop animation (e.g. the numeric value). */
  pulseKey?: string | number
  accent?: boolean
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-stone-200 bg-white/80 px-2 py-1.5 backdrop-blur">
      <span className="text-[0.6rem] lowercase tracking-wide text-stone-400">{label}</span>
      <motion.span
        key={pulseKey}
        initial={pulseKey !== undefined ? { scale: 1.3 } : false}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 22 }}
        className={`text-base font-semibold tabular-nums ${accent ? 'text-emerald-600' : 'text-stone-900'}`}
      >
        {value}
      </motion.span>
    </div>
  )
}
