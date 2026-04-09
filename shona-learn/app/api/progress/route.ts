import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { awardAchievementIfNew } from '@/lib/achievements/award'
import { prisma } from '@/lib/prisma'
import { validate, progressSchema } from '@/lib/validation'

async function ensureLessonExists(lessonId: string) {
  const existing = await prisma.lesson.findUnique({ where: { id: lessonId } })
  if (existing) return existing

  return prisma.lesson.create({
    data: {
      id: lessonId,
      title: `Lesson ${lessonId}`,
      description: 'Auto-created placeholder lesson for progress tracking',
      category: 'Uncategorized',
      orderIndex: 999999,
      xpReward: 10,
      learningObjectives: JSON.stringify(['Auto-generated lesson placeholder']),
      discoveryElements: JSON.stringify(['Auto-generated lesson placeholder'])
    }
  })
}

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const progress = await prisma.userProgress.findMany({
      where: { userId }
    })
    return NextResponse.json(progress)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let payload: unknown
    try {
      payload = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = validate(progressSchema, payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { lessonId, score } = parsed.data!

    const prior = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      }
    })
    const newlyCompleted = !prior?.completed

    await ensureLessonExists(lessonId)

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        completed: true,
        score: Math.max(score, 0),
        completedAt: new Date()
      },
      create: {
        userId,
        lessonId,
        completed: true,
        score
      }
    })

    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (lesson) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: lesson.xpReward } }
      })
    }

    if (newlyCompleted) {
      const totalDone = await prisma.userProgress.count({
        where: { userId, completed: true }
      })
      if (totalDone === 1) {
        await awardAchievementIfNew(userId, 'first-lesson')
      }

      const nextReview = new Date()
      nextReview.setDate(nextReview.getDate() + 1)
      await prisma.reviewSchedule.upsert({
        where: {
          userId_subjectType_subjectId: {
            userId,
            subjectType: 'lesson',
            subjectId: lessonId
          }
        },
        update: {
          intervalDays: 1,
          nextReviewAt: nextReview,
          lastReviewedAt: new Date()
        },
        create: {
          userId,
          subjectType: 'lesson',
          subjectId: lessonId,
          easeFactor: 2.5,
          intervalDays: 1,
          repetitions: 0,
          nextReviewAt: nextReview,
          lastReviewedAt: new Date()
        }
      })
    }

    return NextResponse.json(progress)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
