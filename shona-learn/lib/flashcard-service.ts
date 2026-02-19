import { PrismaClient } from '@prisma/client'
import { AdaptiveSRSAlgorithm, SRSCard, ReviewResult, SRSUpdateResult } from './srs-algorithm'

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
  responseTime: number
  wasCorrect: boolean
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
        difficulty: data.difficulty || 0.5,
        tags: data.tags ? JSON.stringify(data.tags) : null,
        context: data.context,
        lessonId: data.lessonId,
      },
    })

    // Initialize SRS progress
    await prisma.sRSProgress.create({
      data: {
        userId,
        flashcardId: flashcard.id,
        easeFactor: 2.5,
        interval: 1,
        repetitions: 0,
        lastReview: new Date(),
        nextReview: new Date(), // Due immediately for new cards
        quality: 0,
        totalReviews: 0,
        correctStreak: 0,
        wrongStreak: 0,
        averageTime: 0,
      },
    })

    return flashcard
  }

  /**
   * Get cards due for review
   */
  static async getDueCards(userId: string, limit: number = 20) {
    const now = new Date()
    
    const cards = await prisma.flashcard.findMany({
      where: {
        userId,
        srsProgress: {
          some: {
            nextReview: {
              lte: now
            }
          }
        }
      },
      include: {
        srsProgress: true,
        lesson: {
          select: {
            title: true,
            category: true
          }
        }
      },
      take: limit,
    })

    // Convert to SRSCard format and sort by priority
    const srsCards: SRSCard[] = cards.map(card => ({
      id: card.id,
      easeFactor: card.srsProgress[0]?.easeFactor || 2.5,
      interval: card.srsProgress[0]?.interval || 1,
      repetitions: card.srsProgress[0]?.repetitions || 0,
      lastReview: card.srsProgress[0]?.lastReview || new Date(),
      nextReview: card.srsProgress[0]?.nextReview || new Date(),
      quality: card.srsProgress[0]?.quality || 0,
      totalReviews: card.srsProgress[0]?.totalReviews || 0,
      correctStreak: card.srsProgress[0]?.correctStreak || 0,
      wrongStreak: card.srsProgress[0]?.wrongStreak || 0,
      averageTime: card.srsProgress[0]?.averageTime || 0,
      difficulty: card.difficulty,
    }))

    const prioritizedCards = AdaptiveSRSAlgorithm.getDueCards(srsCards, limit)
    
    return cards.filter(card => 
      prioritizedCards.some(srsCard => srsCard.id === card.id)
    )
  }

  /**
   * Process a flashcard review
   */
  static async reviewFlashcard(userId: string, reviewData: FlashcardReviewData): Promise<SRSUpdateResult> {
    const { flashcardId, quality, responseTime, wasCorrect } = reviewData

    // Get current progress
    const progress = await prisma.sRSProgress.findUnique({
      where: {
        userId_flashcardId: {
          userId,
          flashcardId
        }
      },
      include: {
        flashcard: true
      }
    })

    if (!progress) {
      throw new Error('Flashcard progress not found')
    }

    // Create SRS card object
    const srsCard: SRSCard = {
      id: flashcardId,
      easeFactor: progress.easeFactor,
      interval: progress.interval,
      repetitions: progress.repetitions,
      lastReview: progress.lastReview,
      nextReview: progress.nextReview,
      quality: progress.quality,
      totalReviews: progress.totalReviews,
      correctStreak: progress.correctStreak,
      wrongStreak: progress.wrongStreak,
      averageTime: progress.averageTime,
      difficulty: progress.flashcard.difficulty,
    }

    // Calculate next review parameters
    const reviewResult: ReviewResult = { quality, responseTime, wasCorrect }
    const updateResult = AdaptiveSRSAlgorithm.calculateNextReview(srsCard, reviewResult)
    const cardStats = AdaptiveSRSAlgorithm.updateCardStats(srsCard, reviewResult)

    // Update progress in database
    await prisma.sRSProgress.update({
      where: {
        userId_flashcardId: {
          userId,
          flashcardId
        }
      },
      data: {
        easeFactor: updateResult.easeFactor,
        interval: updateResult.interval,
        repetitions: updateResult.repetitions,
        nextReview: updateResult.nextReview,
        quality: quality,
        totalReviews: cardStats.totalReviews,
        correctStreak: wasCorrect ? progress.correctStreak + 1 : 0,
        wrongStreak: wasCorrect ? 0 : progress.wrongStreak + 1,
        averageTime: cardStats.averageTime,
        lastReview: new Date(),
      }
    })

    // Update flashcard last reviewed
    await prisma.flashcard.update({
      where: { id: flashcardId },
      data: { lastReviewed: new Date() }
    })

    return updateResult
  }

  /**
   * Get flashcard statistics for a user
   */
  static async getFlashcardStats(userId: string): Promise<FlashcardStats> {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
      totalCards,
      dueCards,
      newCards,
      reviewedToday,
      allProgress
    ] = await Promise.all([
      prisma.flashcard.count({ where: { userId } }),
      prisma.sRSProgress.count({
        where: {
          userId,
          nextReview: { lte: now }
        }
      }),
      prisma.sRSProgress.count({
        where: {
          userId,
          totalReviews: 0
        }
      }),
      prisma.sRSProgress.count({
        where: {
          userId,
          lastReview: { gte: todayStart }
        }
      }),
      prisma.sRSProgress.findMany({
        where: { userId },
        select: {
          correctStreak: true,
          totalReviews: true,
          averageTime: true,
          quality: true,
          interval: true
        }
      })
    ])

    const totalReviews = allProgress.reduce((sum, p) => sum + p.totalReviews, 0)
    const correctReviews = allProgress.reduce((sum, p) => sum + (p.quality >= 3 ? p.totalReviews : 0), 0)
    const accuracy = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0

    const averageTime = allProgress.length > 0 
      ? allProgress.reduce((sum, p) => sum + p.averageTime, 0) / allProgress.length
      : 0

    const streakDays = Math.max(...allProgress.map(p => p.correctStreak), 0)
    const masteredCards = allProgress.filter(p => p.interval >= 30).length

    return {
      totalCards,
      dueCards,
      newCards,
      reviewedToday,
      accuracy: Math.round(accuracy),
      averageTime: Math.round(averageTime * 100) / 100,
      streakDays,
      masteredCards
    }
  }

  /**
   * Complete a study session
   */
  static async completeStudySession(userId: string, sessionData: {
    reviewedCards: FlashcardReviewData[]
    sessionStartTime: Date
    sessionEndTime: Date
  }): Promise<StudySessionResult> {
    const { reviewedCards, sessionStartTime, sessionEndTime } = sessionData
    
    let totalCards = reviewedCards.length
    let correctCards = reviewedCards.filter(r => r.wasCorrect).length
    let totalTime = sessionEndTime.getTime() - sessionStartTime.getTime()
    let averageTime = totalTime / totalCards / 1000 // seconds per card
    
    // Calculate XP gained
    let xpGained = 0
    let newMasteredCards = 0
    
    for (const review of reviewedCards) {
      const result = await this.reviewFlashcard(userId, review)
      
      // XP calculation
      xpGained += review.quality * 2 // Base XP
      if (review.wasCorrect) xpGained += 5 // Correct answer bonus
      if (review.responseTime < 5) xpGained += 2 // Quick response bonus
      
      // Check if card became mastered (interval >= 30 days)
      if (result.interval >= 30) {
        newMasteredCards++
        xpGained += 20 // Mastery bonus
      }
    }
    
    // Calculate streak bonus
    const streakBonus = Math.min(correctCards * 2, 50)
    xpGained += streakBonus
    
    // Update user XP
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpGained },
        lastActive: new Date()
      }
    })
    
    return {
      totalCards,
      correctCards,
      averageTime,
      xpGained,
      newMasteredCards,
      streakBonus
    }
  }

  /**
   * Get study schedule for upcoming days
   */
  static async getStudySchedule(userId: string, days: number = 7) {
    const cards = await prisma.flashcard.findMany({
      where: { userId },
      include: { srsProgress: true }
    })

    const srsCards: SRSCard[] = cards.map(card => ({
      id: card.id,
      easeFactor: card.srsProgress[0]?.easeFactor || 2.5,
      interval: card.srsProgress[0]?.interval || 1,
      repetitions: card.srsProgress[0]?.repetitions || 0,
      lastReview: card.srsProgress[0]?.lastReview || new Date(),
      nextReview: card.srsProgress[0]?.nextReview || new Date(),
      quality: card.srsProgress[0]?.quality || 0,
      totalReviews: card.srsProgress[0]?.totalReviews || 0,
      correctStreak: card.srsProgress[0]?.correctStreak || 0,
      wrongStreak: card.srsProgress[0]?.wrongStreak || 0,
      averageTime: card.srsProgress[0]?.averageTime || 0,
      difficulty: card.difficulty,
    }))

    return AdaptiveSRSAlgorithm.predictReviewLoad(srsCards, days)
  }

  /**
   * Import flashcards from lesson content
   */
  static async importFromLesson(userId: string, lessonId: string) {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { exercises: true }
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
  static async searchFlashcards(userId: string, query: string, filters?: {
    tags?: string[]
    difficulty?: { min?: number, max?: number }
    lessonId?: string
  }) {
    const where: any = {
      userId,
      OR: [
        { shonaText: { contains: query, mode: 'insensitive' } },
        { englishText: { contains: query, mode: 'insensitive' } },
        { context: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (filters?.tags?.length) {
      where.tags = { 
        contains: filters.tags.join('|') // Simple contains search for tags
      }
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
        lesson: {
          select: {
            title: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  }
}

export default FlashcardService