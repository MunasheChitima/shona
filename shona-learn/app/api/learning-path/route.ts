import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { getCompletedUnitIdsForPath } from '@/lib/learning-path/completed-units'
import { evaluateUnitPrerequisites, promoteFirstUnitWhenNoEnrollment, resolveUnitStatuses } from '@/lib/learning-path/prerequisites'
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
          include: {
            units: {
              orderBy: { orderIndex: 'asc' },
              include: {
                prerequisites: true,
                checkpoint: true
              }
            }
          }
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

    const completedUnitIds = await getCompletedUnitIdsForPath(prisma, userId, learningPath.id)

    const orderedUnits = learningPath.stages.flatMap((stage) => stage.units).map((unit) => ({ id: unit.id }))
    const prerequisites = learningPath.stages.flatMap((stage) =>
      stage.units.flatMap((unit) =>
        unit.prerequisites.map((edge) => ({
          unitId: edge.unitId,
          requiresUnitId: edge.requiresUnitId
        }))
      )
    )

    const statuses = resolveUnitStatuses(
      orderedUnits,
      completedUnitIds,
      enrollment?.currentUnitId ?? null,
      prerequisites
    )

    promoteFirstUnitWhenNoEnrollment(
      statuses,
      orderedUnits.map((u) => u.id),
      Boolean(enrollment),
      completedUnitIds
    )

    const unitTitleById = new Map<string, string>()
    for (const stage of learningPath.stages) {
      for (const unit of stage.units) {
        unitTitleById.set(unit.id, unit.title)
      }
    }

    const stages = learningPath.stages.map((stage) => ({
      id: stage.id,
      title: stage.title,
      description: stage.description,
      orderIndex: stage.orderIndex,
      units: stage.units.map((unit) => {
        const { missingUnitIds } = evaluateUnitPrerequisites(unit.id, prerequisites, completedUnitIds)
        const missingPrerequisites = missingUnitIds.map((id) => unitTitleById.get(id) || 'Previous step')
        return {
          id: unit.id,
          lessonId: unit.lessonId,
          title: unit.title,
          description: unit.description,
          unitType: unit.unitType,
          orderIndex: unit.orderIndex,
          prerequisiteUnitIds: unit.prerequisites.map((p) => p.requiresUnitId),
          status: statuses[unit.id],
          completed: completedUnitIds.has(unit.id),
          missingPrerequisites,
          checkpointId: unit.checkpoint?.id ?? null
        }
      })
    }))

    return NextResponse.json({
      path: {
        id: learningPath.id,
        slug: learningPath.slug,
        title: learningPath.title,
        pathType: learningPath.pathType,
        isActive: learningPath.isActive
      },
      enrollment: enrollment
        ? {
            id: enrollment.id,
            currentUnitId: enrollment.currentUnitId,
            pathVariant: enrollment.pathVariant,
            startedAt: enrollment.startedAt
          }
        : null,
      stages
    })
  } catch (error) {
    console.error('Learning path fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch learning path' }, { status: 500 })
  }
}
