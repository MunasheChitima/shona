import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAuth } from '@/lib/auth-server'

const ALLOWED_GAME_TYPES = new Set(['memory-match', 'cultural-quiz', 'story-complete'])
const ALLOWED_DIFFICULTIES = new Set(['easy', 'medium', 'hard'])

// Per-user daily XP cap (anti-abuse). 500 XP/day.
// TODO: persist on the User model / move to Redis — this Map resets on every
// server restart and is per-instance only, so it's a soft cap at best.
const DAILY_XP_CAP = 500
const dailyXp = new Map<string, { date: string; xp: number }>()

function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

function remainingDailyXp(userId: string): number {
  const today = todayKey()
  const entry = dailyXp.get(userId)
  if (!entry || entry.date !== today) return DAILY_XP_CAP
  return Math.max(0, DAILY_XP_CAP - entry.xp)
}

function recordDailyXp(userId: string, amount: number): void {
  const today = todayKey()
  const entry = dailyXp.get(userId)
  if (!entry || entry.date !== today) {
    dailyXp.set(userId, { date: today, xp: amount })
  } else {
    entry.xp += amount
  }
}

export async function POST(request: NextRequest) {
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

    const { gameId, gameType, difficulty } = body || {}
    const rawScore = Number(body?.score)
    const safeScore = Math.max(0, Math.min(100, Number.isFinite(rawScore) ? rawScore : 0))

    const normalizedType = typeof gameType === 'string' ? gameType : typeof gameId === 'string' ? gameId : ''
    if (!ALLOWED_GAME_TYPES.has(normalizedType)) {
      return NextResponse.json({ error: 'Invalid gameType' }, { status: 400 })
    }

    const normalizedDifficulty = typeof difficulty === 'string' ? difficulty.toLowerCase() : 'easy'
    if (!ALLOWED_DIFFICULTIES.has(normalizedDifficulty)) {
      return NextResponse.json({ error: 'Invalid difficulty' }, { status: 400 })
    }

    const gameXPMap: Record<string, number> = {
      'memory-match': 20,
      'story-complete': 25,
      'cultural-quiz': 35,
    }
    const baseXP = gameXPMap[normalizedType] || 20

    const difficultyMap: Record<string, number> = {
      easy: 1.0,
      medium: 1.2,
      hard: 1.5,
    }
    const difficultyMultiplier = difficultyMap[normalizedDifficulty] || 1.0
    const scoreMultiplier = safeScore / 100

    let xpGained = Math.round(baseXP * difficultyMultiplier * scoreMultiplier)
    const remaining = remainingDailyXp(userId)
    if (xpGained > remaining) xpGained = remaining

    if (xpGained > 0) {
      await prisma.user.update({
        where: { id: userId },
        data: { xp: { increment: xpGained } },
      })
      recordDailyXp(userId, xpGained)
    }

    const updated = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } })

    return NextResponse.json({
      success: true,
      xpGained,
      totalXP: updated?.xp || 0,
      score: safeScore,
      gameId: normalizedType,
      dailyXpRemaining: remainingDailyXp(userId),
    })
  } catch (error) {
    console.error('games POST error:', (error as Error)?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })

    return NextResponse.json({
      totalXP: user?.xp || 0,
      level: Math.floor((user?.xp || 0) / 100) + 1,
      hearts: user?.hearts || 5,
    })
  } catch (error) {
    console.error('games GET error:', (error as Error)?.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
