import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { reviewScheduleSchema, validate } from '@/lib/validation'
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

    const parsed = validate(reviewScheduleSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const {
      subjectType,
      subjectId,
      easeFactor,
      intervalDays,
      repetitions,
      nextReviewAt
    } = parsed.data!

    const scheduled = await prisma.reviewSchedule.upsert({
      where: {
        userId_subjectType_subjectId: {
          userId,
          subjectType,
          subjectId
        }
      },
      update: {
        easeFactor: easeFactor ?? undefined,
        intervalDays: intervalDays ?? undefined,
        repetitions: repetitions ?? undefined,
        nextReviewAt: nextReviewAt ? new Date(nextReviewAt) : undefined
      },
      create: {
        userId,
        subjectType,
        subjectId,
        easeFactor: easeFactor ?? 2.5,
        intervalDays: intervalDays ?? 1,
        repetitions: repetitions ?? 0,
        nextReviewAt: nextReviewAt ? new Date(nextReviewAt) : new Date()
      }
    })

    return NextResponse.json(scheduled)
  } catch (error) {
    console.error('Schedule review error:', error)
    return NextResponse.json({ error: 'Failed to schedule review' }, { status: 500 })
  }
}
