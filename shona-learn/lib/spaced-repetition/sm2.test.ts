import { describe, expect, it } from 'vitest'
import { applySM2 } from './sm2'

describe('applySM2', () => {
  it('increases interval for successful review', () => {
    const out = applySM2({
      easeFactor: 2.5,
      intervalDays: 6,
      repetitions: 2,
      quality: 4,
      now: new Date('2026-01-01T00:00:00.000Z')
    })

    expect(out.repetitions).toBe(3)
    expect(out.intervalDays).toBeGreaterThan(6)
    expect(out.nextReviewAt.toISOString()).toContain('2026-01-')
  })

  it('resets repetition on failed review', () => {
    const out = applySM2({
      easeFactor: 2.5,
      intervalDays: 14,
      repetitions: 4,
      quality: 0,
      now: new Date('2026-01-01T00:00:00.000Z')
    })

    expect(out.repetitions).toBe(0)
    expect(out.intervalDays).toBe(1)
    expect(out.easeFactor).toBeGreaterThanOrEqual(1.3)
  })
})
