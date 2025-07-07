import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)
    const includeExercises = searchParams.get('includeExercises') === 'true'
    const category = searchParams.get('category')
    const questId = searchParams.get('questId')

    // Build optimized query
    const whereClause: any = {}
    if (category) whereClause.category = category
    if (questId) whereClause.questId = questId

    // Selective field loading based on requirements
    const selectFields: any = {
      id: true,
      title: true,
      description: true,
      category: true,
      orderIndex: true,
      xpReward: true,
      questId: true,
    }

    if (includeExercises) {
      selectFields.exercises = {
        select: {
          id: true,
          type: true,
          question: true,
          points: true,
          // Don't load heavy fields like correctAnswer, options initially
        }
      }
    }

    // Use parallel queries for better performance
    const [lessons, totalCount] = await Promise.all([
      prisma.lesson.findMany({
        where: whereClause,
        select: selectFields,
        orderBy: { orderIndex: 'asc' },
        take: limit,
        skip: page * limit,
      }),
      prisma.lesson.count({ where: whereClause })
    ])

    const response = {
      lessons,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasMore: (page + 1) * limit < totalCount
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
        'ETag': `"lessons-${userId}-${page}-${Date.now()}"`
      }
    })

  } catch (error) {
    console.error('Lessons API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' }, 
      { status: 500 }
    )
  }
} 