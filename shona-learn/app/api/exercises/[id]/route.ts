import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { id } = await params
    const exercises = await prisma.exercise.findMany({
      where: { lessonId: id }
    })
    
    return NextResponse.json(exercises)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}
