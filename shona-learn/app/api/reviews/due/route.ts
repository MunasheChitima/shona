import { NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const due = await prisma.reviewSchedule.findMany({
      where: {
        userId,
        nextReviewAt: { lte: new Date() }
      },
      orderBy: { nextReviewAt: 'asc' }
    })

    return NextResponse.json({ due })
  } catch (error) {
    console.error('Due reviews fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch due reviews' }, { status: 500 })
  }
}
