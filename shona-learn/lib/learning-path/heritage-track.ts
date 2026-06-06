import fs from 'fs'
import path from 'path'

export type HeritageTrack = 'skip' | 'review' | 'core'
export type PathVariant = 'default' | 'heritage' | 'new_learner' | 'partner'

type LessonHeritageRecord = {
  id: string
  category: string
  heritageTrack?: string
}

type HeritageMaps = {
  /** lessonId -> 'skip' | 'review' | 'core'. Defaults to 'core' when unset. */
  trackByLessonId: Map<string, HeritageTrack>
  /** category -> array of lesson ids in that category. */
  lessonIdsByCategory: Map<string, string[]>
}

let cached: HeritageMaps | null = null

function normalize(track: unknown): HeritageTrack {
  if (track === 'skip' || track === 'review' || track === 'core') return track
  return 'core'
}

export function loadHeritageMaps(): HeritageMaps {
  if (cached) return cached

  const lessonsPath = path.join(process.cwd(), 'content', 'lessons_consolidated.json')
  const trackByLessonId = new Map<string, HeritageTrack>()
  const lessonIdsByCategory = new Map<string, string[]>()

  if (!fs.existsSync(lessonsPath)) {
    cached = { trackByLessonId, lessonIdsByCategory }
    return cached
  }

  const data = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'))
  const lessons: LessonHeritageRecord[] = data.lessons || []
  for (const lesson of lessons) {
    if (!lesson?.id) continue
    trackByLessonId.set(lesson.id, normalize(lesson.heritageTrack))
    if (lesson.category) {
      const list = lessonIdsByCategory.get(lesson.category) || []
      list.push(lesson.id)
      lessonIdsByCategory.set(lesson.category, list)
    }
  }

  cached = { trackByLessonId, lessonIdsByCategory }
  return cached
}

export function isHeritageVariant(variant: string | null | undefined): variant is 'heritage' {
  return variant === 'heritage'
}

/**
 * Returns true when every lesson in the category is tagged `skip`. This is the
 * signal that a unit (which maps to a category) should be filtered out entirely
 * for heritage learners. Units with at least one non-skip lesson stay in the path.
 */
export function categoryIsAllSkip(category: string | null | undefined): boolean {
  if (!category) return false
  const { trackByLessonId, lessonIdsByCategory } = loadHeritageMaps()
  const ids = lessonIdsByCategory.get(category) || []
  if (ids.length === 0) return false
  return ids.every((id) => trackByLessonId.get(id) === 'skip')
}

/**
 * Display mode for a unit on the heritage track. `review` means render a short
 * recall instead of the full lesson sequence. `full` is the default.
 */
export function displayModeForCategory(category: string | null | undefined): 'full' | 'review' {
  if (!category) return 'full'
  const { trackByLessonId, lessonIdsByCategory } = loadHeritageMaps()
  const ids = lessonIdsByCategory.get(category) || []
  if (ids.length === 0) return 'full'
  const tracks = ids.map((id) => trackByLessonId.get(id) || 'core')
  // If every non-skip lesson in the unit is tagged `review`, render the unit as a review.
  const nonSkip = tracks.filter((t) => t !== 'skip')
  if (nonSkip.length === 0) return 'full'
  return nonSkip.every((t) => t === 'review') ? 'review' : 'full'
}

/** Number of lessons that would be hidden for heritage learners. */
export function heritageSkipLessonCount(): number {
  const { trackByLessonId } = loadHeritageMaps()
  let n = 0
  for (const track of trackByLessonId.values()) {
    if (track === 'skip') n += 1
  }
  return n
}

/** Filter a flat lesson list for the given path variant. */
export function filterLessonsForVariant<T extends { id?: string }>(
  lessons: T[],
  variant: string | null | undefined
): T[] {
  if (!isHeritageVariant(variant)) return lessons
  const { trackByLessonId } = loadHeritageMaps()
  return lessons.filter((lesson) => {
    if (!lesson?.id) return true
    return trackByLessonId.get(lesson.id) !== 'skip'
  })
}

/** Test seam — reset the cached file load. */
export function _resetHeritageMapsCache() {
  cached = null
}
