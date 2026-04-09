import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import {
  awardAchievementIfNew,
  awardStageCheckpointMilestone
} from '@/lib/achievements/award'
import { parseCheckpointQuestionData, scoreCheckpoint } from '@/lib/checkpoints/score'
import { getCompletedUnitIdsForPath } from '@/lib/learning-path/completed-units'
import { evaluateUnitPrerequisites } from '@/lib/learning-path/prerequisites'
import { checkpointAttemptSchema, validate } from '@/lib/validation'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request, context: { params: Promise<{ checkpointId: string }> }) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { checkpointId } = await context.params

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = validate(checkpointAttemptSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const answers = parsed.data!.answers

    const checkpoint = await prisma.checkpoint.findUnique({
      where: { id: checkpointId },
      include: {
        unit: {
          include: {
            stage: true,
            prerequisites: true
          }
        }
      }
    })

    if (!checkpoint || checkpoint.unit.unitType !== 'checkpoint') {
      return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 })
    }

    const learningPath = await prisma.learningPath.findUnique({
      where: { id: checkpoint.unit.stage.learningPathId },
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

    const { satisfied } = evaluateUnitPrerequisites(checkpoint.unitId, prerequisites, completedUnitIds)
    if (!satisfied) {
      return NextResponse.json({ error: 'Complete previous units first' }, { status: 403 })
    }

    const data = parseCheckpointQuestionData(checkpoint.questionData)
    const { sectionScores, overallPercent, passed } = scoreCheckpoint(data, answers)

    await prisma.userCheckpointAttempt.create({
      data: {
        userId,
        checkpointId: checkpoint.id,
        scorePercent: overallPercent,
        passed,
        answersJson: JSON.stringify({ answers, sectionScores })
      }
    })

    const newAchievements: { code: string; title: string }[] = []

    if (passed) {
      await prisma.userUnitProgress.upsert({
        where: {
          userId_unitId: {
            userId,
            unitId: checkpoint.unitId
          }
        },
        update: {
          completed: true,
          score: overallPercent,
          completedAt: new Date()
        },
        create: {
          userId,
          unitId: checkpoint.unitId,
          completed: true,
          score: overallPercent,
          completedAt: new Date()
        }
      })

      const stageOrder = checkpoint.unit.stage.orderIndex
      const m = await awardStageCheckpointMilestone(userId, stageOrder)
      if (m && m.awarded) newAchievements.push(m.achievement)

      if (stageOrder === 1) {
        const fs = await awardAchievementIfNew(userId, 'first-stage')
        if (fs.awarded) newAchievements.push(fs.achievement)
      }

      if (overallPercent === 100) {
        const perf = await awardAchievementIfNew(userId, 'checkpoint-perfect')
        if (perf.awarded) newAchievements.push(perf.achievement)
      }
    }

    return NextResponse.json({
      passed,
      overallPercent,
      sectionScores,
      newAchievements
    })
  } catch (error) {
    console.error('Checkpoint attempt error:', error)
    return NextResponse.json({ error: 'Failed to submit checkpoint' }, { status: 500 })
  }
}
