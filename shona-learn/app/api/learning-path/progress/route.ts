import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { getCompletedUnitIdsForPath } from '@/lib/learning-path/completed-units'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'core'

    const learningPath = await prisma.learningPath.findUnique({
      where: { slug },
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

    const enrollment = await prisma.userLearningPath.findUnique({
      where: {
        userId_learningPathId: {
          userId,
          learningPathId: learningPath.id
        }
      }
    })

    const completedIds = await getCompletedUnitIdsForPath(prisma, userId, learningPath.id)

    const stageProgress = learningPath.stages.map((stage) => {
      const total = stage.units.length
      const completed = stage.units.filter((unit) => completedIds.has(unit.id)).length
      return {
        stageId: stage.id,
        title: stage.title,
        totalUnits: total,
        completedUnits: completed,
        completionPercent: total === 0 ? 0 : Math.round((completed / total) * 100)
      }
    })

    const totalUnits = stageProgress.reduce((sum, s) => sum + s.totalUnits, 0)
    const completedUnits = stageProgress.reduce((sum, s) => sum + s.completedUnits, 0)

    return NextResponse.json({
      enrollment: enrollment
        ? {
            id: enrollment.id,
            currentUnitId: enrollment.currentUnitId,
            pathVariant: enrollment.pathVariant,
            startedAt: enrollment.startedAt,
            updatedAt: enrollment.updatedAt
          }
        : null,
      totals: {
        totalUnits,
        completedUnits,
        completionPercent: totalUnits === 0 ? 0 : Math.round((completedUnits / totalUnits) * 100)
      },
      stages: stageProgress
    })
  } catch (error) {
    console.error('Learning path progress error:', error)
    return NextResponse.json({ error: 'Failed to fetch learning path progress' }, { status: 500 })
  }
}
