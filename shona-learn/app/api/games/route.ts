import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const verifyAuth = async (request: NextRequest) => {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  
  try {
    // In a real app, you'd verify the JWT token here
    // For now, we'll use a simple approach
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' } // This would be extracted from token
    })
    return user?.id
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { gameId, score, difficulty } = await request.json()
    
    // Calculate XP based on game type and difficulty
    const gameXPMap: Record<string, number> = {
      'memory-match': 20,
      'rhythm-tones': 30,
      'story-complete': 25,
      'cultural-quiz': 35,
      'word-builder': 40
    }
    const baseXP = gameXPMap[gameId] || 20
    
    const difficultyMap: Record<string, number> = {
      'Easy': 1.0,
      'Medium': 1.2,
      'Hard': 1.5
    }
    const difficultyMultiplier = difficultyMap[difficulty] || 1.0
    
    const scoreMultiplier = score / 100 // Convert percentage to multiplier
    
    const xpGained = Math.round(baseXP * difficultyMultiplier * scoreMultiplier)
    
    // Update user XP
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpGained }
      }
    })
    
    // Create a record for this game session (you could create a GameSession model)
    // For now, we'll just return the results
    
    return NextResponse.json({
      success: true,
      xpGained,
      totalXP: (await prisma.user.findUnique({ where: { id: userId } }))?.xp || 0,
      score,
      gameId
    })
    
  } catch (error) {
    console.error('Game scoring error:', error)
    return NextResponse.json({ error: 'Failed to process game score' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Return game statistics (you could expand this with actual game session data)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    
    return NextResponse.json({
      totalXP: user?.xp || 0,
      level: Math.floor((user?.xp || 0) / 100) + 1,
      hearts: user?.hearts || 5
    })
    
  } catch (error) {
    console.error('Game stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch game stats' }, { status: 500 })
  }
}
