import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import fs from 'fs'
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
    
    // Read comprehensive lessons from JSON file
    const lessonsPath = path.join(process.cwd(), 'content', 'lessons_consolidated.json')
    
    if (!fs.existsSync(lessonsPath)) {
      return NextResponse.json({ error: 'Lessons file not found' }, { status: 404 })
    }
    
    const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'))
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
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
} 