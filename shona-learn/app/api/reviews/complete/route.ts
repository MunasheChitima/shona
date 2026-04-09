import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { applySM2 } from '@/lib/spaced-repetition/sm2'
import { reviewCompleteSchema, validate } from '@/lib/validation'
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

    const parsed = validate(reviewCompleteSchema, body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { subjectType, subjectId, quality } = parsed.data!
    const current = await prisma.reviewSchedule.findUnique({
      where: {
        userId_subjectType_subjectId: {
          userId,
          subjectType,
          subjectId
        }
      }
    })

    const next = applySM2({
      easeFactor: current?.easeFactor ?? 2.5,
      intervalDays: current?.intervalDays ?? 1,
      repetitions: current?.repetitions ?? 0,
      quality
    })

    const review = await prisma.reviewSchedule.upsert({
      where: {
        userId_subjectType_subjectId: {
          userId,
          subjectType,
          subjectId
        }
      },
      update: {
        easeFactor: next.easeFactor,
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        reviewCount: { increment: 1 },
        lastQuality: quality,
        lastReviewedAt: new Date(),
        nextReviewAt: next.nextReviewAt
      },
      create: {
        userId,
        subjectType,
        subjectId,
        easeFactor: next.easeFactor,
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        reviewCount: 1,
        lastQuality: quality,
        lastReviewedAt: new Date(),
        nextReviewAt: next.nextReviewAt
      }
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Complete review error:', error)
    return NextResponse.json({ error: 'Failed to complete review' }, { status: 500 })
  }
}
