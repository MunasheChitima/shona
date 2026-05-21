import { NextResponse } from 'next/server'
import { promises as fsp } from 'fs'
import path from 'path'

// Hard caps so an unauthenticated visitor can't ask for a 10M-row page
// or paginate forever.
const MAX_LIMIT = 100
const DEFAULT_LIMIT = 50
const MAX_PAGE = 1000

function clampInt(raw: string | null, def: number, min: number, max: number): number {
  const n = parseInt(raw || String(def), 10)
  if (!Number.isFinite(n) || Number.isNaN(n)) return def
  return Math.max(min, Math.min(max, n))
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = clampInt(searchParams.get('limit'), DEFAULT_LIMIT, 1, MAX_LIMIT)
    const page = clampInt(searchParams.get('page'), 1, 1, MAX_PAGE)
    // manifest=1 returns ONLY enough metadata to render the lesson list
    // (id, title, unit, level, xp, etc.). This shrinks the payload by ~10x
    // because we strip vocabulary/exercises which are only needed when
    // the user actually opens a lesson.
    const manifest = searchParams.get('manifest') === '1'

    // Read comprehensive lessons from JSON file
    const lessonsPath = path.join(process.cwd(), 'content', 'lessons_consolidated.json')

    let raw: string
    try {
      raw = await fsp.readFile(lessonsPath, 'utf8')
    } catch {
      return NextResponse.json({ error: 'Lessons file not found' }, { status: 404 })
    }

    const lessonsData = JSON.parse(raw)
    const lessons = lessonsData.lessons || []

    const start = (page - 1) * limit
    const end = start + limit
    const slice = lessons.slice(start, end)

    const previewLessons = manifest
      ? slice.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          category: lesson.category,
          unit: lesson.unit,
          level: lesson.level,
          difficulty: lesson.difficulty,
          xpReward: lesson.xpReward,
          estimatedDuration: lesson.estimatedDuration,
          emoji: lesson.emoji,
          requiredLessonId: lesson.requiredLessonId ?? null,
          orderIndex: lesson.orderIndex,
        }))
      : slice.map((lesson: any) => ({
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          category: lesson.category,
          level: lesson.level,
          difficulty: lesson.difficulty,
          xpReward: lesson.xpReward,
          estimatedDuration: lesson.estimatedDuration,
          emoji: lesson.emoji,
          vocabulary: lesson.vocabulary?.slice(0, 5) || [], // Limit vocabulary preview
          exercises: lesson.exercises || [],
        }))

    return NextResponse.json({
      lessons: previewLessons,
      totalLessons: lessons.length,
      previewCount: previewLessons.length,
      page,
      limit,
      manifest,
      message: manifest ? undefined : 'This is a preview. Sign up to access all lessons!',
    })
  } catch (error) {
    console.error('lessons public GET error:', (error as Error)?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
