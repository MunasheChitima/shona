import { apiAuthHeaders } from '@/lib/api-auth-headers'

export type GameId = 'memory-match' | 'story-complete' | 'cultural-quiz'
export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export interface GameProgressEntry {
  highScore: number
  plays: number
  totalXP: number
}

export type GameProgressMap = Record<string, GameProgressEntry>

/** Read the locally-cached per-game progress (high score, plays, xp). */
export function readGameProgress(): GameProgressMap {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem('gameProgress') || '{}') as GameProgressMap
  } catch {
    return {}
  }
}

/**
 * Submit a finished round to the server (awards XP, anti-abuse capped server
 * side) and update the local progress cache. `accuracy` is a 0-100 percentage —
 * the server uses it as a score multiplier. Returns the XP gained, or 0 if the
 * request failed (the local cache is still updated so the UI stays responsive).
 */
export async function submitGameResult(opts: {
  gameId: GameId
  /** 0-100 accuracy/score percentage sent to the server. */
  accuracy: number
  difficulty: Difficulty
}): Promise<{ xpGained: number; totalXP: number | null }> {
  const accuracy = Math.max(0, Math.min(100, Math.round(opts.accuracy)))
  let xpGained = 0
  let totalXP: number | null = null

  try {
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...apiAuthHeaders() },
      body: JSON.stringify({
        gameId: opts.gameId,
        score: accuracy,
        gameType: opts.gameId,
        difficulty: opts.difficulty,
      }),
    })
    if (res.ok) {
      const result = await res.json()
      xpGained = result.xpGained || 0
      totalXP = result.totalXP ?? null
    }
  } catch {
    /* offline / network — fall through and still cache locally */
  }

  if (typeof window !== 'undefined') {
    try {
      const progress = readGameProgress()
      const prev = progress[opts.gameId]
      progress[opts.gameId] = {
        highScore: Math.max(prev?.highScore || 0, accuracy),
        plays: (prev?.plays || 0) + 1,
        totalXP: (prev?.totalXP || 0) + xpGained,
      }
      localStorage.setItem('gameProgress', JSON.stringify(progress))
      if (totalXP != null) {
        const userRaw = localStorage.getItem('user')
        if (userRaw) {
          const user = JSON.parse(userRaw)
          localStorage.setItem('user', JSON.stringify({ ...user, xp: totalXP }))
        }
      }
    } catch {
      /* ignore cache write failures */
    }
  }

  return { xpGained, totalXP }
}

/** Shuffle a copy of an array (Fisher-Yates). */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
