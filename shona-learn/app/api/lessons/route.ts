import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { promises as fsp } from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    // Read comprehensive lessons from JSON file (async to avoid blocking
    // the event loop on serverless invocations).
    const lessonsPath = path.join(process.cwd(), 'content', 'lessons_consolidated.json')

    let raw: string
    try {
      raw = await fsp.readFile(lessonsPath, 'utf8')
    } catch {
      return NextResponse.json({ error: 'Lessons file not found' }, { status: 404 })
    }

    const lessonsData = JSON.parse(raw)
    let lessons = lessonsData.lessons || []

    // Apply filters
    if (category) {
      lessons = lessons.filter((lesson: any) => lesson.category === category)
    }

    if (search) {
      const searchLower = search.toLowerCase()
      lessons = lessons.filter((lesson: any) =>
        lesson.title.toLowerCase().includes(searchLower) ||
        lesson.description.toLowerCase().includes(searchLower)
      )
    }

    // Sort lessons by orderIndex
    lessons.sort((a: any, b: any) => a.orderIndex - b.orderIndex)

    // Paginate results
    const start = (page - 1) * limit
    const end = start + limit
    const paginatedLessons = lessons.slice(start, end)

    // Return paginated response
    return NextResponse.json({
      lessons: paginatedLessons,
      pagination: {
        page,
        limit,
        total: lessons.length,
        totalPages: Math.ceil(lessons.length / limit),
        hasNextPage: end < lessons.length,
        hasPrevPage: page > 1
      },
      metadata: {
        categories: lessonsData.metadata?.topicCategories || {},
        totalLessons: lessons.length
      }
    })
  } catch (error) {
    console.error('lessons GET error:', (error as Error)?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
