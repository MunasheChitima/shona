import { describe, it, expect } from 'vitest'
import {
  deriveStats,
  completionDays,
  currentStreakFromDays,
  longestStreakFromDays,
  XP_PER_LESSON,
} from './deriveStats'

function row(lessonId: string, day: string | null, completed = true) {
  return {
    lessonId,
    completed,
    completedAt: day ? `${day}T12:00:00.000Z` : null,
  }
}

describe('deriveStats', () => {
  it('returns a clean zero-state for no progress', () => {
    const s = deriveStats([], '2026-06-05')
    expect(s).toMatchObject({
      lessonsCompleted: 0,
      totalXp: 0,
      level: 1,
      xpIntoLevel: 0,
      xpToNextLevel: 100,
      currentStreak: 0,
      longestStreak: 0,
    })
  })

  it('awards 50 xp per completed lesson and advances level past 100 xp', () => {
    const rows = [
      row('a', '2026-06-05'),
      row('b', '2026-06-05'),
      row('c', '2026-06-05'),
    ]
    const s = deriveStats(rows, '2026-06-05')
    expect(s.lessonsCompleted).toBe(3)
    expect(s.totalXp).toBe(150)
    expect(s.totalXp).toBe(3 * XP_PER_LESSON)
    expect(s.level).toBe(2) // floor(150/100)+1
    expect(s.xpIntoLevel).toBe(50)
    expect(s.xpToNextLevel).toBe(50)
  })

  it('ignores incomplete rows for xp', () => {
    const rows = [row('a', '2026-06-05'), row('b', null, false)]
    expect(deriveStats(rows, '2026-06-05').totalXp).toBe(50)
  })

  it('streak is 1 when a lesson is completed today', () => {
    const rows = [row('a', '2026-06-05')]
    expect(deriveStats(rows, '2026-06-05').currentStreak).toBe(1)
  })
})

describe('streak math', () => {
  it('counts consecutive days back from today', () => {
    const days = ['2026-06-03', '2026-06-04', '2026-06-05']
    expect(currentStreakFromDays(days, '2026-06-05')).toBe(3)
  })

  it('uses yesterday as anchor when nothing done today yet', () => {
    const days = ['2026-06-03', '2026-06-04']
    expect(currentStreakFromDays(days, '2026-06-05')).toBe(2)
  })

  it('breaks when neither today nor yesterday has a completion', () => {
    const days = ['2026-06-01', '2026-06-02']
    expect(currentStreakFromDays(days, '2026-06-05')).toBe(0)
  })

  it('breaks the streak on a gap', () => {
    const days = ['2026-06-01', '2026-06-04', '2026-06-05']
    expect(currentStreakFromDays(days, '2026-06-05')).toBe(2)
  })

  it('computes longest streak across history', () => {
    const days = ['2026-05-01', '2026-05-02', '2026-05-03', '2026-06-04', '2026-06-05']
    expect(longestStreakFromDays(days)).toBe(3)
  })

  it('dedupes multiple completions on the same day', () => {
    const rows = [row('a', '2026-06-05'), row('b', '2026-06-05')]
    expect(completionDays(rows)).toEqual(['2026-06-05'])
  })
})
