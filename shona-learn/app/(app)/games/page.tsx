'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { IconType } from 'react-icons'
import { FaBook, FaGlobeAfrica, FaArrowRight, FaRegStar, FaRegClock, FaLayerGroup } from 'react-icons/fa'
import { readGameProgress, type GameProgressMap } from '../../components/games/gameProgress'

interface GameDef {
  id: 'memory-match' | 'story-complete' | 'cultural-quiz'
  title: string
  tagline: string
  icon: IconType
  difficulty: string
  length: string
  route: string
  /** Per-game accent so each card reads distinct, not like a settings row. */
  accent: { tile: string; icon: string; ring: string; best: string }
}

const GAMES: GameDef[] = [
  {
    id: 'memory-match',
    title: 'memory match',
    tagline: 'Flip and pair Shona words with their meaning. Beat the clock.',
    icon: FaLayerGroup,
    difficulty: 'easy',
    length: '~2 min',
    route: '/games/memory-match',
    accent: {
      tile: 'bg-emerald-50 group-hover:bg-emerald-100/70',
      icon: 'text-emerald-600',
      ring: 'hover:border-emerald-200',
      best: 'text-emerald-600',
    },
  },
  {
    id: 'story-complete',
    title: 'story complete',
    tagline: 'Fill the blanks in a short Shona story using context clues.',
    icon: FaBook,
    difficulty: 'medium',
    length: '~4 min',
    route: '/games/story-complete',
    accent: {
      tile: 'bg-amber-50 group-hover:bg-amber-100/70',
      icon: 'text-amber-600',
      ring: 'hover:border-amber-200',
      best: 'text-amber-600',
    },
  },
  {
    id: 'cultural-quiz',
    title: 'cultural quiz',
    tagline: 'Test your knowledge of Shona heritage, history and values.',
    icon: FaGlobeAfrica,
    difficulty: 'hard',
    length: '~3 min',
    route: '/games/cultural-quiz',
    accent: {
      tile: 'bg-rose-50 group-hover:bg-rose-100/70',
      icon: 'text-rose-500',
      ring: 'hover:border-rose-200',
      best: 'text-rose-500',
    },
  },
]

export default function GamesPage() {
  const router = useRouter()
  const [progress, setProgress] = useState<GameProgressMap>({})

  useEffect(() => {
    setProgress(readGameProgress())
  }, [])

  const totalPlays = Object.values(progress).reduce((sum, g) => sum + (g.plays || 0), 0)
  const totalXP = Object.values(progress).reduce((sum, g) => sum + (g.totalXP || 0), 0)

  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="lowercase text-3xl font-medium tracking-tight text-stone-900">games</h1>
          <p className="mt-1 max-w-lg text-sm leading-relaxed text-stone-500">
            Short, gentle rounds to reinforce what you are learning. Play a little between lessons —
            no pressure, just practice that helps the words settle.
          </p>

          {totalPlays > 0 && (
            <div className="mt-4 flex gap-2 text-xs lowercase text-stone-500">
              <span className="rounded-full border border-stone-200 bg-white/70 px-3 py-1 backdrop-blur">
                {totalPlays} {totalPlays === 1 ? 'round' : 'rounds'} played
              </span>
              {totalXP > 0 && (
                <span className="rounded-full border border-stone-200 bg-white/70 px-3 py-1 backdrop-blur">
                  {totalXP} xp from games
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Game cards */}
        <div className="flex flex-col gap-4">
          {GAMES.map((game, i) => {
            const best = progress[game.id]?.highScore || 0
            const plays = progress[game.id]?.plays || 0
            const Icon = game.icon
            return (
              <motion.button
                key={game.id}
                type="button"
                onClick={() => router.push(game.route)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -2 }}
                className={`group flex w-full items-center gap-4 rounded-2xl border border-stone-200 bg-white/80 p-5 text-left backdrop-blur transition-all ${game.accent.ring} hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40`}
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-all group-hover:scale-105 ${game.accent.tile} ${game.accent.icon}`}>
                  <Icon className="text-xl" aria-hidden />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="lowercase text-lg font-medium tracking-tight text-stone-900">
                      {game.title}
                    </h2>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-stone-500">
                    {game.tagline}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs lowercase text-stone-400">
                    <span className="inline-flex items-center gap-1">
                      <FaRegStar className="text-stone-300" aria-hidden /> {game.difficulty}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <FaRegClock className="text-stone-300" aria-hidden /> {game.length}
                    </span>
                    {best > 0 && <span className={game.accent.best}>best {best}%</span>}
                    {plays > 0 && <span>{plays} {plays === 1 ? 'play' : 'plays'}</span>}
                  </div>
                </div>

                <FaArrowRight
                  className="shrink-0 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-stone-500"
                  aria-hidden
                />
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
