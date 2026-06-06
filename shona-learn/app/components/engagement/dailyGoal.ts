'use client'

/**
 * Daily-goal persistence helpers. All client-side, stored in localStorage
 * under a single key and date-stamped so progress resets each calendar day.
 *
 * We measure the goal in completed lessons. Today's progress is derived from
 * a counter we bump elsewhere when a lesson is completed, but to stay honest
 * we also accept an externally-supplied "lessons completed today" count when
 * available and take the max of the two.
 */

export const DAILY_GOAL_KEY = 'shona_daily_goal'

export type GoalSize = 'casual' | 'regular' | 'serious'

export const GOAL_TARGETS: Record<GoalSize, number> = {
  casual: 1,
  regular: 3,
  serious: 5,
}

export const GOAL_LABELS: Record<GoalSize, string> = {
  casual: 'casual',
  regular: 'regular',
  serious: 'serious',
}

export interface DailyGoalState {
  size: GoalSize
  date: string // YYYY-MM-DD (local)
  progress: number // lessons completed today (locally tracked)
}

export function todayStamp(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const DEFAULT_STATE: DailyGoalState = {
  size: 'regular',
  date: '',
  progress: 0,
}

/**
 * Read the stored goal, rolling progress back to 0 when the date has changed.
 * The chosen goal size persists across days; only progress resets.
 */
export function readDailyGoal(): DailyGoalState {
  if (typeof window === 'undefined') return { ...DEFAULT_STATE, date: todayStamp() }
  const today = todayStamp()
  try {
    const raw = localStorage.getItem(DAILY_GOAL_KEY)
    if (!raw) return { ...DEFAULT_STATE, date: today }
    const parsed = JSON.parse(raw) as Partial<DailyGoalState>
    const size: GoalSize =
      parsed.size === 'casual' || parsed.size === 'regular' || parsed.size === 'serious'
        ? parsed.size
        : 'regular'
    if (parsed.date !== today) {
      // New day — keep the chosen size, reset progress.
      return { size, date: today, progress: 0 }
    }
    return {
      size,
      date: today,
      progress: Math.max(0, Number(parsed.progress) || 0),
    }
  } catch {
    return { ...DEFAULT_STATE, date: today }
  }
}

export function writeDailyGoal(state: DailyGoalState): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DAILY_GOAL_KEY, JSON.stringify(state))
  } catch {
    /* storage unavailable — ignore */
  }
}
