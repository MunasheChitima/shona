import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '@/lib/auth-server'
import { validate, progressSchema } from '@/lib/validation'

const prisma = new PrismaClient()

async function ensureLessonExists(lessonId: string) {
  const existing = await prisma.lesson.findUnique({ where: { id: lessonId } })
  if (existing) return existing

  // Create a placeholder lesson so user progress can be tracked for ad-hoc IDs
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

    // Ensure lesson exists (or create placeholder)
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

    // Update user XP based on lesson reward
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (lesson) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: lesson.xpReward } }
      })
    }

    return NextResponse.json(progress)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
} 