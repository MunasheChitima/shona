import { describe, expect, it } from 'vitest'
import { evaluateUnitPrerequisites, promoteFirstUnitWhenNoEnrollment, resolveUnitStatuses } from './prerequisites'

describe('evaluateUnitPrerequisites', () => {
  it('returns missing prerequisite ids when unmet', () => {
    const result = evaluateUnitPrerequisites(
      'u2',
      [{ unitId: 'u2', requiresUnitId: 'u1' }],
      new Set<string>()
    )

    expect(result.satisfied).toBe(false)
    expect(result.missingUnitIds).toEqual(['u1'])
  })

  it('returns satisfied when all prerequisites are completed', () => {
    const result = evaluateUnitPrerequisites(
      'u2',
      [{ unitId: 'u2', requiresUnitId: 'u1' }],
      new Set<string>(['u1'])
    )

    expect(result.satisfied).toBe(true)
    expect(result.missingUnitIds).toEqual([])
  })
})

describe('resolveUnitStatuses', () => {
  it('marks completed, current, available and locked states', () => {
    const statuses = resolveUnitStatuses(
      [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }, { id: 'u4' }],
      new Set<string>(['u1']),
      'u3',
      [
        { unitId: 'u2', requiresUnitId: 'u1' },
        { unitId: 'u4', requiresUnitId: 'u3' }
      ]
    )

    expect(statuses.u1).toBe('completed')
    expect(statuses.u2).toBe('available')
    expect(statuses.u3).toBe('current')
    expect(statuses.u4).toBe('locked')
  })
})

describe('promoteFirstUnitWhenNoEnrollment', () => {
  it('forces first unit to available when not enrolled', () => {
    const statuses: Record<string, 'locked' | 'available' | 'completed' | 'current'> = {
      a: 'locked',
      b: 'locked'
    }
    promoteFirstUnitWhenNoEnrollment(statuses, ['a', 'b'], false, new Set())
    expect(statuses.a).toBe('available')
    expect(statuses.b).toBe('locked')
  })

  it('does nothing when enrolled', () => {
    const statuses = { a: 'locked' as const }
    promoteFirstUnitWhenNoEnrollment(statuses, ['a'], true, new Set())
    expect(statuses.a).toBe('locked')
  })
})
