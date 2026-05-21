import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { applySM2 } from '@/lib/spaced-repetition/sm2'
import { prisma } from '@/lib/prisma'

/**
 * Initialize (or no-op return) a review schedule for a subject. The server
 * computes the initial SM-2 state from `initialQuality` — clients may NOT
 * supply easeFactor / intervalDays / repetitions / nextReviewAt (that would
 * be mass-assignment of SRS state and would let users skip ahead).
 */
export async function POST(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: any
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const subjectType = typeof body?.subjectType === 'string' ? body.subjectType.trim() : ''
    const subjectId = typeof body?.subjectId === 'string' ? body.subjectId.trim() : ''
    const rawQuality = body?.initialQuality
    const initialQuality =
      typeof rawQuality === 'number' && Number.isFinite(rawQuality)
        ? Math.max(0, Math.min(5, Math.floor(rawQuality)))
        : 0

    if (!subjectType || !subjectId) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // If a schedule already exists, return it unchanged — initial scheduling
    // is idempotent.
    const existing = await prisma.reviewSchedule.findUnique({
      where: {
        userId_subjectType_subjectId: { userId, subjectType, subjectId },
      },
    })
    if (existing) {
      return NextResponse.json(existing)
    }

    // Compute the very first schedule from defaults + the supplied initial
    // quality. This is server-authoritative.
    const next = applySM2({
      easeFactor: 2.5,
      intervalDays: 1,
      repetitions: 0,
      quality: initialQuality,
    })

    const scheduled = await prisma.reviewSchedule.create({
      data: {
        userId,
        subjectType,
        subjectId,
        easeFactor: next.easeFactor,
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        reviewCount: initialQuality > 0 ? 1 : 0,
        lastQuality: initialQuality,
        lastReviewedAt: initialQuality > 0 ? new Date() : null,
        nextReviewAt: next.nextReviewAt,
      },
    })

    return NextResponse.json(scheduled)
  } catch (error) {
    console.error('Schedule review error:', error)
    return NextResponse.json({ error: 'Failed to schedule review' }, { status: 500 })
  }
}
