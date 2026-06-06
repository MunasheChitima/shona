'use client'

/**
 * Client-side derivation of the engagement loop (XP, level, streak) from the
 * server `/api/progress` rows.
 *
 * WHY this exists: in open beta a visitor is cookie-only, so the auth context
 * `user` is null and `authUser.xp/.streak/.level` are permanently 0/null. The
 * profile previously read those frozen fields, so the entire engagement loop
 * was dead for exactly the users this beta serves. We instead derive everything
 * from real server progress, with NO backend/schema changes.
 *
 * XP model: 50 xp per completed lesson — matches the lesson CelebrationModal,
 * which awards "+50 xp" on completion. Keeping a single flat rate makes the
 * numbers consistent app-wide.
 */

import { todayStamp } from './dailyGoal'

export interface ProgressRow {
  lessonId?: string
  completed?: boolean
  score?: number | null
  completedAt?: string | null
}

export interface DerivedStats {
  lessonsCompleted: number
  totalXp: number
  level: number
  /** xp accrued toward the next level, 0..99 */
  xpIntoLevel: number
  /** xp still needed to reach the next level (always 100 - xpIntoLevel, 1..100) */
  xpToNextLevel: number
  currentStreak: number
  longestStreak: number
}

export const XP_PER_LESSON = 50
export const XP_PER_LEVEL = 100

/**
 * Distinct local-calendar-day strings (YYYY-MM-DD) on which at least one lesson
 * was completed, sorted ascending. Rows without a valid `completedAt` are
 * ignored.
 */
export function completionDays(rows: ProgressRow[] | null | undefined): string[] {
  const set = new Set<string>()
  for (const r of rows || []) {
    if (!r?.completed || !r.completedAt) continue
    const d = new Date(r.completedAt)
    if (Number.isNaN(d.getTime())) continue
    set.add(todayStamp(d))
  }
  return Array.from(set).sort()
}

function dateFromStamp(stamp: string): Date {
  const [y, m, d] = stamp.split('-').map((n) => parseInt(n, 10))
  return new Date(y, (m || 1) - 1, d || 1)
}

function dayDiff(a: string, b: string): number {
  const ms = dateFromStamp(a).getTime() - dateFromStamp(b).getTime()
  return Math.round(ms / 86_400_000)
}

/**
 * Current streak = consecutive calendar days, counting back from today (or
 * yesterday if nothing has been completed today yet), with >=1 completion.
 */
export function currentStreakFromDays(days: string[], today = todayStamp()): number {
  if (days.length === 0) return 0
  const present = new Set(days)
  // Anchor at today if there's a completion today, otherwise yesterday so an
  // existing streak isn't broken just because today's lesson isn't done yet.
  let anchor: string
  if (present.has(today)) {
    anchor = today
  } else {
    const yesterday = dateFromStamp(today)
    yesterday.setDate(yesterday.getDate() - 1)
    anchor = todayStamp(yesterday)
    if (!present.has(anchor)) return 0
  }
  let streak = 0
  const cursor = dateFromStamp(anchor)
  while (present.has(todayStamp(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Longest run of consecutive calendar days anywhere in the history. */
export function longestStreakFromDays(days: string[]): number {
  if (days.length === 0) return 0
  let longest = 1
  let run = 1
  for (let i = 1; i < days.length; i++) {
    if (dayDiff(days[i], days[i - 1]) === 1) {
      run += 1
    } else {
      run = 1
    }
    if (run > longest) longest = run
  }
  return longest
}

export function deriveStats(
  rows: ProgressRow[] | null | undefined,
  today = todayStamp()
): DerivedStats {
  const lessonsCompleted = (rows || []).filter((r) => r?.completed).length
  const totalXp = lessonsCompleted * XP_PER_LESSON
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const xpIntoLevel = totalXp % XP_PER_LEVEL
  const xpToNextLevel = XP_PER_LEVEL - xpIntoLevel

  const days = completionDays(rows)
  const currentStreak = currentStreakFromDays(days, today)
  const longestStreak = Math.max(longestStreakFromDays(days), currentStreak)

  return {
    lessonsCompleted,
    totalXp,
    level,
    xpIntoLevel,
    xpToNextLevel,
    currentStreak,
    longestStreak,
  }
}
