import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { learningPathStartSchema, validate } from '@/lib/validation'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = validate(learningPathStartSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { learningPathSlug, pathVariant } = parsed.data!
    const variant = pathVariant ?? 'default'
    const learningPath = await prisma.learningPath.findUnique({
      where: { slug: learningPathSlug },
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
          include: { units: { orderBy: { orderIndex: 'asc' } } }
        }
      }
    })

    if (!learningPath) {
      return NextResponse.json({ error: 'Learning path not found' }, { status: 404 })
    }

    const firstUnit = learningPath.stages.flatMap((s) => s.units)[0]
    if (!firstUnit) {
      return NextResponse.json({ error: 'Learning path has no units' }, { status: 400 })
    }

    const existing = await prisma.userLearningPath.findUnique({
      where: {
        userId_learningPathId: {
          userId,
          learningPathId: learningPath.id
        }
      }
    })

    const enrollment = existing
      ? await prisma.userLearningPath.update({
          where: { id: existing.id },
          data: {
            pathVariant: variant,
            ...(existing.currentUnitId ? {} : { currentUnitId: firstUnit.id })
          }
        })
      : await prisma.userLearningPath.create({
          data: {
            userId,
            learningPathId: learningPath.id,
            currentUnitId: firstUnit.id,
            pathVariant: variant
          }
        })

    return NextResponse.json({
      id: enrollment.id,
      learningPathId: learningPath.id,
      currentUnitId: enrollment.currentUnitId,
      pathVariant: enrollment.pathVariant,
      startedAt: enrollment.startedAt
    })
  } catch (error) {
    console.error('Learning path start error:', error)
    return NextResponse.json({ error: 'Failed to start learning path' }, { status: 500 })
  }
}
