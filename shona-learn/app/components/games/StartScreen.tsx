'use client'
import { motion } from 'framer-motion'
import type { IconType } from 'react-icons'

export interface StartHighlight {
  icon: IconType
  label: string
}

/** Per-game accent so each start screen keeps the identity from the games index. */
export interface StartAccent {
  /** hero icon tile, e.g. 'bg-emerald-50 text-emerald-600' */
  tile: string
  /** highlight chip icon color, e.g. 'text-emerald-500' */
  chipIcon: string
}

const DEFAULT_ACCENT: StartAccent = {
  tile: 'bg-emerald-50 text-emerald-600',
  chipIcon: 'text-emerald-500',
}

/**
 * Shared "ready to play" screen. Calm hero card with an icon, a one-line pitch,
 * a few highlight chips and the primary start action.
 */
export default function StartScreen({
  icon: Icon,
  title,
  blurb,
  highlights = [],
  meta,
  bestScore,
  onStart,
  startLabel = 'start',
  accent = DEFAULT_ACCENT,
}: {
  icon: IconType
  title: string
  blurb: string
  highlights?: StartHighlight[]
  meta?: string
  bestScore?: number
  onStart: () => void
  startLabel?: string
  accent?: StartAccent
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 p-8 text-center backdrop-blur sm:p-10">
      <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${accent.tile}`}>
        <Icon className="text-2xl" aria-hidden />
      </div>
      <h2 className="mb-2 lowercase text-2xl font-medium tracking-tight text-stone-900">{title}</h2>
      <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-stone-500">{blurb}</p>

      {highlights.length > 0 && (
        <div className="mx-auto mb-7 flex max-w-md flex-wrap justify-center gap-2">
          {highlights.map((h) => (
            <span
              key={h.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs text-stone-600"
            >
              <h.icon className={accent.chipIcon} aria-hidden />
              {h.label}
            </span>
          ))}
        </div>
      )}

      <motion.button
        type="button"
        onClick={onStart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="inline-flex items-center justify-center rounded-full bg-stone-900 px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
      >
        {startLabel}
      </motion.button>

      {(meta || (bestScore != null && bestScore > 0)) && (
        <p className="mt-5 text-xs lowercase text-stone-400">
          {meta}
          {meta && bestScore != null && bestScore > 0 && <span className="px-1.5">·</span>}
          {bestScore != null && bestScore > 0 && <span>best {bestScore}%</span>}
        </p>
      )}
    </div>
  )
}
