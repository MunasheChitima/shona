import { PrismaClient } from '@prisma/client'
import { applySM2, SM2Output } from './spaced-repetition/sm2'

const prisma = new PrismaClient()

export interface FlashcardCreateData {
  shonaText: string
  englishText: string
  audioText?: string
  pronunciation?: string
  difficulty?: number
  tags?: string[]
  context?: string
  lessonId?: string
}

export interface FlashcardReviewData {
  flashcardId: string
  quality: number
  // Kept for back-compat with callers/route; the vanilla SM-2 path does not
  // use response time or wasCorrect (quality alone drives the schedule).
  responseTime?: number
  wasCorrect?: boolean
}

export interface StudySessionResult {
  totalCards: number
  correctCards: number
  averageTime: number
  xpGained: number
  newMasteredCards: number
  streakBonus: number
}

export interface FlashcardStats {
  totalCards: number
  dueCards: number
  newCards: number
  reviewedToday: number
  accuracy: number
  averageTime: number
  streakDays: number
  masteredCards: number
}

export class FlashcardService {
  /**
   * Create a new flashcard for a user
   */
  static async createFlashcard(userId: string, data: FlashcardCreateData) {
    const flashcard = await prisma.flashcard.create({
      data: {
        userId,
        shonaText: data.shonaText,
        englishText: data.englishText,
        audioText: data.audioText,
        pronunciation: data.pronunciation,
        difficulty: data.difficulty ?? 0.5,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        context: data.context,
        lessonId: data.lessonId,
      },
    })

    // Initialize SRS progress (vanilla SM-2 state)
    await prisma.sRSProgress.create({
      data: {
        userId,
        flashcardId: flashcard.id,
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        lastReview: new Date(),
        nextReview: new Date(), // Due immediately for new cards
        totalReviews: 0,
      },
    })

    return flashcard
  }

  /**
   * Get cards due for review (vanilla SM-2: simple time-based query)
   */
  static async getDueCards(userId: string, limit: number = 20) {
    const now = new Date()

    const dueProgress = await prisma.sRSProgress.findMany({
      where: {
        userId,
        nextReview: { lte: now },
      },
      orderBy: { nextReview: 'asc' },
      take: limit,
      include: {
        flashcard: {
          include: {
            lesson: {
              select: { title: true, category: true },
            },
          },
        },
      },
    })

    // Return the flashcards (with embedded srsProgress preserved via mapping)
    return dueProgress
      .filter((p) => p.flashcard)
      .map((p) => ({ ...p.flashcard, srsProgress: [p] }))
  }

  /**
   * Process a flashcard review using vanilla SM-2
   */
  static async reviewFlashcard(
    userId: string,
    reviewData: FlashcardReviewData
  ): Promise<SM2Output> {
    const { flashcardId, quality } = reviewData

    const progress = await prisma.sRSProgress.findUnique({
      where: {
        userId_flashcardId: { userId, flashcardId },
      },
    })

    if (!progress) {
      throw new Error('Flashcard progress not found')
    }

    const next = applySM2({
      easeFactor: progress.easeFactor,
      intervalDays: progress.interval,
      repetitions: progress.repetitions,
      quality,
    })

    await prisma.sRSProgress.update({
      where: {
        userId_flashcardId: { userId, flashcardId },
      },
      data: {
        easeFactor: next.easeFactor,
        interval: next.intervalDays,
        repetitions: next.repetitions,
        nextReview: next.nextReviewAt,
        totalReviews: { increment: 1 },
        lastReview: new Date(),
      },
    })

    await prisma.flashcard.update({
      where: { id: flashcardId },
      data: { lastReviewed: new Date() },
    })

    return next
  }

  /**
   * Get flashcard statistics for a user
   */
  static async getFlashcardStats(userId: string): Promise<FlashcardStats> {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [totalCards, dueCards, newCards, reviewedToday, allProgress] =
      await Promise.all([
        prisma.flashcard.count({ where: { userId } }),
        prisma.sRSProgress.count({
          where: { userId, nextReview: { lte: now } },
        }),
        prisma.sRSProgress.count({
          where: { userId, totalReviews: 0 },
        }),
        prisma.sRSProgress.count({
          where: { userId, lastReview: { gte: todayStart } },
        }),
        prisma.sRSProgress.findMany({
          where: { userId },
          select: {
            totalReviews: true,
            interval: true,
            repetitions: true,
          },
        }),
      ])

    const totalReviews = allProgress.reduce((sum, p) => sum + p.totalReviews, 0)
    // Approximate accuracy: proportion of progress rows that look "learned"
    // (have at least one successful repetition). This drops the per-card
    // quality bookkeeping the adaptive variant used.
    const learnedRows = allProgress.filter((p) => p.repetitions > 0).length
    const accuracy = allProgress.length > 0
      ? Math.round((learnedRows / allProgress.length) * 100)
      : 0

    const masteredCards = allProgress.filter((p) => p.interval >= 30).length

    return {
      totalCards,
      dueCards,
      newCards,
      reviewedToday,
      accuracy,
      averageTime: 0,
      streakDays: 0,
      masteredCards,
    }
  }

  /**
   * Complete a study session
   */
  static async completeStudySession(
    userId: string,
    sessionData: {
      reviewedCards: FlashcardReviewData[]
      sessionStartTime: Date
      sessionEndTime: Date
    }
  ): Promise<StudySessionResult> {
    const { reviewedCards, sessionStartTime, sessionEndTime } = sessionData

    const totalCards = reviewedCards.length
    const correctCards = reviewedCards.filter((r) => (r.quality ?? 0) >= 3).length
    const totalTime = sessionEndTime.getTime() - sessionStartTime.getTime()
    const averageTime = totalCards > 0 ? totalTime / totalCards / 1000 : 0

    let xpGained = 0
    let newMasteredCards = 0

    for (const review of reviewedCards) {
      const result = await this.reviewFlashcard(userId, review)
      xpGained += (review.quality ?? 0) * 2
      if ((review.quality ?? 0) >= 3) xpGained += 5
      if (result.intervalDays >= 30) {
        newMasteredCards++
        xpGained += 20
      }
    }

    const streakBonus = Math.min(correctCards * 2, 50)
    xpGained += streakBonus

    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpGained },
        lastActive: new Date(),
      },
    })

    return {
      totalCards,
      correctCards,
      averageTime,
      xpGained,
      newMasteredCards,
      streakBonus,
    }
  }

  /**
   * Get study schedule for upcoming days.
   * Returns an array of length `days` with counts of cards due each day.
   */
  static async getStudySchedule(userId: string, days: number = 7): Promise<number[]> {
    const progress = await prisma.sRSProgress.findMany({
      where: { userId },
      select: { nextReview: true },
    })

    const loads = Array(days).fill(0)
    const now = Date.now()
    for (const p of progress) {
      const daysUntilReview = Math.ceil(
        (p.nextReview.getTime() - now) / (1000 * 60 * 60 * 24)
      )
      const idx = Math.max(0, daysUntilReview)
      if (idx < days) loads[idx]++
    }
    return loads
  }

  /**
   * Import flashcards from lesson content
   */
  static async importFromLesson(userId: string, lessonId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { exercises: true },
    })

    if (!lesson) {
      throw new Error('Lesson not found')
    }

    const flashcards = []

    for (const exercise of lesson.exercises) {
      if (exercise.shonaPhrase && exercise.englishPhrase) {
        try {
          const flashcard = await this.createFlashcard(userId, {
            shonaText: exercise.shonaPhrase,
            englishText: exercise.englishPhrase,
            audioText: exercise.audioText || undefined,
            context: exercise.question,
            lessonId: lessonId,
            tags: [lesson.category.toLowerCase()],
          })
          flashcards.push(flashcard)
        } catch (error) {
          // Skip duplicates
          continue
        }
      }
    }

    return flashcards
  }

  /**
   * Search flashcards
   */
  static async searchFlashcards(
    userId: string,
    query: string,
    filters?: {
      tags?: string[]
      difficulty?: { min?: number; max?: number }
      lessonId?: string
    }
  ) {
    const where: any = {
      userId,
      OR: [
        { shonaText: { contains: query, mode: 'insensitive' } },
        { englishText: { contains: query, mode: 'insensitive' } },
        { context: { contains: query, mode: 'insensitive' } },
      ],
    }

    if (filters?.tags?.length) {
      where.tags = { contains: filters.tags.join('|') }
    }

    if (filters?.difficulty) {
      where.difficulty = {}
      if (filters.difficulty.min !== undefined) {
        where.difficulty.gte = filters.difficulty.min
      }
      if (filters.difficulty.max !== undefined) {
        where.difficulty.lte = filters.difficulty.max
      }
    }

    if (filters?.lessonId) {
      where.lessonId = filters.lessonId
    }

    return prisma.flashcard.findMany({
      where,
      include: {
        srsProgress: true,
        lesson: { select: { title: true, category: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}

export default FlashcardService
