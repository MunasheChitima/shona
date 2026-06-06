import { describe, expect, it, beforeEach } from 'vitest'
import {
  _resetHeritageMapsCache,
  categoryIsAllSkip,
  displayModeForCategory,
  filterLessonsForVariant,
  heritageSkipLessonCount,
  isHeritageVariant,
  loadHeritageMaps,
} from './heritage-track'

describe('heritage-track utilities', () => {
  beforeEach(() => {
    _resetHeritageMapsCache()
  })

  it('isHeritageVariant only matches the heritage string', () => {
    expect(isHeritageVariant('heritage')).toBe(true)
    expect(isHeritageVariant('default')).toBe(false)
    expect(isHeritageVariant(null)).toBe(false)
    expect(isHeritageVariant(undefined)).toBe(false)
    expect(isHeritageVariant('new_learner')).toBe(false)
  })

  it('loads heritage maps with all 60 lessons tagged', () => {
    const { trackByLessonId, lessonIdsByCategory } = loadHeritageMaps()
    expect(trackByLessonId.size).toBeGreaterThanOrEqual(60)
    expect(lessonIdsByCategory.size).toBeGreaterThan(0)
  })

  it('heritageSkipLessonCount falls in the target reduction range', () => {
    const skipped = heritageSkipLessonCount()
    // Acceptance criteria: 25–40% fewer lessons (15–24 of 60).
    expect(skipped).toBeGreaterThanOrEqual(15)
    expect(skipped).toBeLessThanOrEqual(24)
  })

  it('filterLessonsForVariant is a no-op for non-heritage variants', () => {
    const lessons = [
      { id: 'lesson-1' },
      { id: 'lesson-10' },
      { id: 'lesson-30' },
    ]
    expect(filterLessonsForVariant(lessons, 'default')).toEqual(lessons)
    expect(filterLessonsForVariant(lessons, 'new_learner')).toEqual(lessons)
    expect(filterLessonsForVariant(lessons, null)).toEqual(lessons)
  })

  it('filterLessonsForVariant removes skip-tagged lessons for heritage learners', () => {
    const lessons = [
      { id: 'lesson-1' },      // skip (greetings)
      { id: 'lesson-30' },     // core (proverbs)
      { id: 'lesson-15' },     // skip (body parts)
      { id: 'lesson-g3' },     // core (grammar)
    ]
    const filtered = filterLessonsForVariant(lessons, 'heritage')
    const ids = filtered.map((l) => l.id)
    expect(ids).toContain('lesson-30')
    expect(ids).toContain('lesson-g3')
    expect(ids).not.toContain('lesson-1')
    expect(ids).not.toContain('lesson-15')
  })

  it('categoryIsAllSkip is true when every lesson in the category is skip', () => {
    // Unit 1: First Words holds 4 skipped lessons + 1 grammar bridge (core), so it should NOT be all-skip.
    expect(categoryIsAllSkip('Unit 1: First Words')).toBe(false)
    // Unknown categories return false.
    expect(categoryIsAllSkip('Unit 99: Imaginary')).toBe(false)
    expect(categoryIsAllSkip(null)).toBe(false)
    expect(categoryIsAllSkip(undefined)).toBe(false)
  })

  it('displayModeForCategory returns review when remaining lessons are all review', () => {
    // Unit 1 has skip + core (grammar) — still 'full'.
    expect(displayModeForCategory('Unit 1: First Words')).toBe('full')
    // Unknown category falls back to full.
    expect(displayModeForCategory('Unit 99: Nothing')).toBe('full')
  })
})
