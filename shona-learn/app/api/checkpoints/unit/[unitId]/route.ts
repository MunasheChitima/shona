import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { parseCheckpointQuestionData, toPublicQuestionData } from '@/lib/checkpoints/score'
import { getCompletedUnitIdsForPath } from '@/lib/learning-path/completed-units'
import { evaluateUnitPrerequisites } from '@/lib/learning-path/prerequisites'
import { prisma } from '@/lib/prisma'

export async function GET(_request: Request, context: { params: Promise<{ unitId: string }> }) {
  try {
    const userId = await verifyAuth(_request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { unitId } = await context.params

    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      include: {
        checkpoint: true,
        stage: true,
        prerequisites: true
      }
    })

    if (!unit || unit.unitType !== 'checkpoint' || !unit.checkpoint) {
      return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 })
    }

    const learningPath = await prisma.learningPath.findUnique({
      where: { id: unit.stage.learningPathId },
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
          include: {
            units: {
              orderBy: { orderIndex: 'asc' },
              include: { prerequisites: true }
            }
          }
        }
      }
    })

    if (!learningPath) {
      return NextResponse.json({ error: 'Learning path missing' }, { status: 404 })
    }

    const completedUnitIds = await getCompletedUnitIdsForPath(prisma, userId, learningPath.id)
    const prerequisites = learningPath.stages.flatMap((stage) =>
      stage.units.flatMap((u) =>
        u.prerequisites.map((e) => ({
          unitId: e.unitId,
          requiresUnitId: e.requiresUnitId
        }))
      )
    )

    const { satisfied } = evaluateUnitPrerequisites(unit.id, prerequisites, completedUnitIds)
    if (!satisfied) {
      return NextResponse.json({ error: 'Complete previous units first' }, { status: 403 })
    }

    const data = parseCheckpointQuestionData(unit.checkpoint.questionData)
    const publicData = toPublicQuestionData(data)

    return NextResponse.json({
      checkpointId: unit.checkpoint.id,
      unitId: unit.id,
      stageTitle: unit.stage.title,
      title: unit.checkpoint.title,
      passingScore: unit.checkpoint.passingScore,
      ...publicData
    })
  } catch (error) {
    console.error('Checkpoint load error:', error)
    return NextResponse.json({ error: 'Failed to load checkpoint' }, { status: 500 })
  }
}
