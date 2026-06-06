import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { getCompletedUnitIdsForPath } from '@/lib/learning-path/completed-units'
import {
  categoryIsAllSkip,
  displayModeForCategory,
  heritageSkipLessonCount,
  isHeritageVariant,
} from '@/lib/learning-path/heritage-track'
import { evaluateUnitPrerequisites, promoteFirstUnitWhenNoEnrollment, resolveUnitStatuses } from '@/lib/learning-path/prerequisites'
import { prisma } from '@/lib/prisma'
import { loadLessonIdsByCategory } from '@/lib/learning-path/completed-units'

// Strip dev/spec leakage that crept into seeded stage descriptions, e.g.
// "(aligns with Stage 1 in learning architecture)" or a trailing "(Stage 2)".
// Done defensively here so it is fixed for users without a DB reseed.
function cleanStageDescription(description: string | null): string | null {
  if (!description) return description
  return description
    .replace(/\s*\((?:aligns with )?stage\s*\d*[^)]*\)/gi, '')
    .replace(/\s*\([^)]*learning architecture[^)]*\)/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

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

    // Per-unit lesson-completion counts so the UI can show progress the moment a
    // single lesson is done — not only once an entire unit's lessons are finished
    // (bug #6: stage showed "0/4 units" after a lesson was completed).
    const lessonIdsByCategory = loadLessonIdsByCategory()
    const completedLessonRows = await prisma.userProgress.findMany({
      where: { userId, completed: true },
      select: { lessonId: true },
    })
    const completedLessonIdSet = new Set(completedLessonRows.map((r) => r.lessonId))
    const unitLessonCounts = (categoryKey: string | null) => {
      const ids = categoryKey ? lessonIdsByCategory[categoryKey] ?? [] : []
      const total = ids.length
      const completed = ids.filter((id) => completedLessonIdSet.has(id)).length
      return { total, completed }
    }

    const heritage = isHeritageVariant(enrollment?.pathVariant)
    // For heritage learners, units whose lessons are all tagged `skip` count as
    // implicitly completed so downstream prerequisites still resolve.
    const skipUnitIds = new Set<string>()
    if (heritage) {
      for (const stage of learningPath.stages) {
        for (const unit of stage.units) {
          if (unit.unitType !== 'lesson') continue
          if (categoryIsAllSkip(unit.lessonId)) {
            skipUnitIds.add(unit.id)
            completedUnitIds.add(unit.id)
          }
        }
      }
    }

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
      description: cleanStageDescription(stage.description),
      orderIndex: stage.orderIndex,
      units: stage.units
        .filter((unit) => !heritage || !skipUnitIds.has(unit.id))
        .map((unit) => {
          const { missingUnitIds } = evaluateUnitPrerequisites(unit.id, prerequisites, completedUnitIds)
          const missingPrerequisites = missingUnitIds.map((id) => unitTitleById.get(id) || 'Previous step')
          const displayMode: 'full' | 'review' =
            heritage && unit.unitType === 'lesson' ? displayModeForCategory(unit.lessonId) : 'full'
          const { total: lessonsTotal, completed: lessonsCompleted } =
            unit.unitType === 'lesson' ? unitLessonCounts(unit.lessonId) : { total: 0, completed: 0 }
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
            // lesson-level rollup for partial-progress display
            lessonsTotal,
            lessonsCompleted,
            missingPrerequisites,
            checkpointId: unit.checkpoint?.id ?? null,
            displayMode
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
      stages,
      heritage: heritage
        ? {
            skippedLessonCount: heritageSkipLessonCount(),
            skippedUnitCount: skipUnitIds.size
          }
        : null
    })
  } catch (error) {
    // Degrade gracefully: the lessons themselves load from a separate endpoint,
    // so a transient Prisma failure here should NOT take down the whole learn
    // page. Return 200 with empty path data + a `degraded` flag; the client
    // falls back to a flat lesson grid instead of an error wall.
    console.error('Learning path fetch error:', error)
    return NextResponse.json(
      {
        degraded: true,
        path: null,
        enrollment: null,
        stages: [],
        heritage: null,
      },
      { status: 200 }
    )
  }
}
