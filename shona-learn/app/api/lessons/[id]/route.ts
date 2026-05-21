import { NextResponse } from 'next/server'
import { promises as fsp } from 'fs'
import path from 'path'

// GET /api/lessons/[id]
//
// Returns ONE lesson (vocabulary + exercises included) by id. This pairs
// with /api/lessons/public?manifest=1 so the learn page can fetch a tiny
// list payload first, then load the full lesson only when the user opens
// one. We also use this route to prefetch the next lesson while the user
// is mid-lesson — makes the "Next lesson →" tap feel instant.
//
// Public on purpose: same data as /api/lessons/public, just shaped for a
// single record. Add auth here if/when lessons become gated.
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = String(params?.id || '').trim()
    if (!id) {
      return NextResponse.json({ error: 'Missing lesson id' }, { status: 400 })
    }

    const lessonsPath = path.join(process.cwd(), 'content', 'lessons_consolidated.json')
    let raw: string
    try {
      raw = await fsp.readFile(lessonsPath, 'utf8')
    } catch {
      return NextResponse.json({ error: 'Lessons file not found' }, { status: 404 })
    }
    const lessonsData = JSON.parse(raw)
    const lessons = lessonsData.lessons || []
    const lesson = lessons.find((l: any) => l?.id === id)
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error('lesson by id GET error:', (error as Error)?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
