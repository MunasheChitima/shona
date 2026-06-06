import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { awardAchievementIfNew } from '@/lib/achievements/award'
import { prisma } from '@/lib/prisma'
import { validate, progressSchema } from '@/lib/validation'

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
    console.error('progress GET error:', (error as Error)?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
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
    // Clamp score to [0, 100] defensively — schema also validates but a single
    // source of truth here keeps create/update paths consistent.
    const safeScore = Math.max(0, Math.min(100, Number(score) || 0))

    // Refuse to operate on a lessonId that doesn't already exist. The previous
    // implementation auto-created Lesson rows from arbitrary client input,
    // which let anyone pollute the lesson catalog and farm XP.
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const prior = await prisma.userProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      }
    })
    const newlyCompleted = !prior?.completed

    const progress = await prisma.userProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        completed: true,
        score: safeScore,
        completedAt: new Date()
      },
      create: {
        userId,
        lessonId,
        completed: true,
        score: safeScore
      }
    })

    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: lesson.xpReward } }
    })

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
    console.error('progress POST error:', (error as Error)?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Reset the current user's progress on this device/account. Uses the SAME
// auth/user resolution as GET/POST (verifyAuth, which hydrates the cookie-only
// beta visitor). This wipes the rows that drive the profile's derived stats
// (lessons / xp / streak / milestones) so the page truthfully drops to zero.
// We keep the User row itself (name, email, beta identity) intact.
export async function DELETE(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Lesson progress is the source of truth for the profile's derived stats.
    // Achievements and review schedules are reset alongside so the learner is
    // left fully coherent (no stale "first lesson" badge with zero lessons).
    const [deletedProgress] = await prisma.$transaction([
      prisma.userProgress.deleteMany({ where: { userId } }),
      prisma.userAchievement.deleteMany({ where: { userId } }),
      prisma.reviewSchedule.deleteMany({ where: { userId } }),
      // The User row also caches xp/streak/level for non-derived consumers;
      // zero them so cross-page reads stay consistent with the reset profile.
      prisma.user.update({
        where: { id: userId },
        data: { xp: 0, streak: 0, level: 1 },
      }),
    ])

    return NextResponse.json({ reset: true, deletedProgress: deletedProgress.count })
  } catch (error) {
    console.error('progress DELETE error:', (error as Error)?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
