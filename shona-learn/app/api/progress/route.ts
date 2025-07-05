import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '@/lib/auth'

const prisma = new PrismaClient()

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
    
    const { lessonId, score } = await request.json()
    
    // Update or create progress
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
    
    // Update user XP
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId }
    })
    
    if (lesson) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: lesson.xpReward }
        }
      })
    }
    
    return NextResponse.json(progress)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
} 