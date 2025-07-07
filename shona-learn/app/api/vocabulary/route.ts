import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '@/lib/auth'

const prisma = new PrismaClient()

// Cache for vocabulary items (in production, use Redis)
const vocabularyCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 items
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const lessonId = searchParams.get('lessonId')
    const includeAudio = searchParams.get('includeAudio') === 'true'

    // Create cache key
    const cacheKey = `vocab:${userId}:${page}:${limit}:${category}:${search}:${lessonId}:${includeAudio}`
    
    // Check cache first
    const cached = vocabularyCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
          'X-Cache': 'HIT'
        }
      })
    }

    // Build optimized query with selective fields
    const baseSelect = {
      id: true,
      shonaText: true,
      englishText: true,
      pronunciation: true,
      difficulty: true,
      tags: true,
      context: true,
      createdAt: true,
    }

    const selectFields = includeAudio 
      ? { ...baseSelect, audioText: true }
      : baseSelect

    const whereClause: any = { userId }
    
    if (category) {
      whereClause.tags = { contains: category }
    }
    
    if (search) {
      whereClause.OR = [
        { shonaText: { contains: search, mode: 'insensitive' } },
        { englishText: { contains: search, mode: 'insensitive' } },
        { context: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (lessonId) {
      whereClause.lessonId = lessonId
    }

    // Parallel queries for better performance
    const [vocabularyItems, totalCount] = await Promise.all([
      prisma.flashcard.findMany({
        where: whereClause,
        select: selectFields,
        orderBy: [
          { difficulty: 'asc' }, // Easier words first
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: page * limit,
      }),
      prisma.flashcard.count({ where: whereClause })
    ])

    const response = {
      items: vocabularyItems,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasMore: (page + 1) * limit < totalCount
      },
      metadata: {
        categories: category ? [category] : await getAvailableCategories(userId),
        cached: false
      }
    }

    // Cache the response
    vocabularyCache.set(cacheKey, {
      data: response,
      timestamp: Date.now()
    })

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=86400',
        'X-Cache': 'MISS'
      }
    })

  } catch (error) {
    console.error('Vocabulary API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { shonaText, englishText, pronunciation, tags, context, lessonId } = body

    if (!shonaText || !englishText) {
      return NextResponse.json(
        { error: 'Shona and English text are required' },
        { status: 400 }
      )
    }

    const vocabularyItem = await prisma.flashcard.create({
      data: {
        userId,
        lessonId,
        shonaText,
        englishText,
        pronunciation,
        tags: JSON.stringify(tags || []),
        context,
        audioText: pronunciation || shonaText,
      },
      select: {
        id: true,
        shonaText: true,
        englishText: true,
        pronunciation: true,
        tags: true,
        context: true,
        createdAt: true,
      }
    })

    // Clear relevant cache entries
    clearVocabularyCache(userId)

    return NextResponse.json(vocabularyItem, { status: 201 })

  } catch (error) {
    console.error('Create vocabulary error:', error)
    return NextResponse.json(
      { error: 'Failed to create vocabulary item' },
      { status: 500 }
    )
  }
}

// Helper function to get available categories
async function getAvailableCategories(userId: string): Promise<string[]> {
  const cacheKey = `categories:${userId}`
  const cached = vocabularyCache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  const items = await prisma.flashcard.findMany({
    where: { userId },
    select: { tags: true },
    distinct: ['tags']
  })

  const categories = new Set<string>()
  items.forEach(item => {
    if (item.tags) {
      try {
        const tags = JSON.parse(item.tags)
        tags.forEach((tag: string) => categories.add(tag))
      } catch {
        // Handle non-JSON tags
        categories.add(item.tags)
      }
    }
  })

  const result = Array.from(categories)
  vocabularyCache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  })

  return result
}

// Helper function to clear cache
function clearVocabularyCache(userId: string) {
  const keysToDelete: string[] = []
  vocabularyCache.forEach((_, key) => {
    if (key.includes(`${userId}:`)) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach(key => vocabularyCache.delete(key))
}