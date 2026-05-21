/**
 * Adaptive Spaced Repetition System (SRS) Algorithm
 * Based on SuperMemo with adaptive features for language learning
 */

export interface SRSCard {
  id: string
  easeFactor: number
  interval: number
  repetitions: number
  lastReview: Date
  nextReview: Date
  quality: number
  totalReviews: number
  correctStreak: number
  wrongStreak: number
  averageTime: number
  difficulty: number
}

export interface ReviewResult {
  quality: number // 0-5 scale (0=complete blackout, 5=perfect)
  responseTime: number // in seconds
  wasCorrect: boolean
}

export interface SRSUpdateResult {
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: Date
  shouldAdvance: boolean
  confidenceScore: number
}

export class AdaptiveSRSAlgorithm {
  private static readonly MIN_EASE_FACTOR = 1.3
  private static readonly MAX_EASE_FACTOR = 4.0
  private static readonly DEFAULT_EASE_FACTOR = 2.5
  private static readonly DIFFICULTY_ADJUSTMENT_FACTOR = 0.1
  private static readonly TIME_PENALTY_THRESHOLD = 10.0 // seconds

  /**
   * Calculate next review parameters based on user performance
   */
  static calculateNextReview(card: SRSCard, result: ReviewResult): SRSUpdateResult {
    const { quality, responseTime, wasCorrect } = result
    
    // Update streaks
    const correctStreak = wasCorrect ? card.correctStreak + 1 : 0
    const wrongStreak = wasCorrect ? 0 : card.wrongStreak + 1
    
    // Calculate new ease factor with adaptive adjustments
    let newEaseFactor = this.calculateEaseFactor(card, quality, responseTime)
    
    // Apply difficulty-based adjustments
    newEaseFactor = this.applyDifficultyAdjustment(newEaseFactor, card.difficulty)
    
    // Apply streak bonuses/penalties
    newEaseFactor = this.applyStreakAdjustments(newEaseFactor, correctStreak, wrongStreak)
    
    // Clamp ease factor
    newEaseFactor = Math.max(this.MIN_EASE_FACTOR, 
                           Math.min(this.MAX_EASE_FACTOR, newEaseFactor))
    
    // Calculate new interval
    const { interval, repetitions } = this.calculateInterval(card, quality, newEaseFactor)
    
    // Apply time-based adjustments
    const adjustedInterval = this.applyTimeAdjustments(interval, responseTime, card.averageTime)
    
    // Calculate next review date
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + adjustedInterval)
    
    // Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(card, result, correctStreak)
    
    return {
      easeFactor: newEaseFactor,
      interval: adjustedInterval,
      repetitions,
      nextReview,
      shouldAdvance: quality >= 3,
      confidenceScore
    }
  }

  /**
   * Calculate ease factor using SuperMemo algorithm with adaptive features
   */
  private static calculateEaseFactor(card: SRSCard, quality: number, responseTime: number): number {
    const q = quality
    let easeFactor = card.easeFactor
    
    // Standard SuperMemo calculation
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    
    // Adaptive adjustments based on response time
    const timeAdjustment = this.calculateTimeAdjustment(responseTime, card.averageTime)
    easeFactor += timeAdjustment
    
    return easeFactor
  }

  /**
   * Calculate interval using modified SuperMemo algorithm
   */
  private static calculateInterval(card: SRSCard, quality: number, easeFactor: number): { interval: number, repetitions: number } {
    if (quality < 3) {
      // Reset on poor performance
      return { interval: 1, repetitions: 0 }
    }
    
    let interval: number
    let repetitions = card.repetitions + 1
    
    if (repetitions === 1) {
      interval = 1
    } else if (repetitions === 2) {
      interval = 6
    } else {
      interval = Math.round(card.interval * easeFactor)
    }
    
    return { interval, repetitions }
  }

  /**
   * Apply difficulty-based adjustments to ease factor
   */
  private static applyDifficultyAdjustment(easeFactor: number, difficulty: number): number {
    // Adjust ease factor based on card difficulty (0.0 to 1.0)
    const difficultyAdjustment = (0.5 - difficulty) * this.DIFFICULTY_ADJUSTMENT_FACTOR
    return easeFactor + difficultyAdjustment
  }

  /**
   * Apply streak-based adjustments
   */
  private static applyStreakAdjustments(easeFactor: number, correctStreak: number, wrongStreak: number): number {
    // Bonus for correct streaks
    const streakBonus = Math.min(correctStreak * 0.05, 0.3)
    
    // Penalty for wrong streaks
    const streakPenalty = Math.min(wrongStreak * 0.1, 0.5)
    
    return easeFactor + streakBonus - streakPenalty
  }

  /**
   * Calculate time-based adjustment for response time
   */
  private static calculateTimeAdjustment(responseTime: number, averageTime: number): number {
    if (averageTime === 0) return 0
    
    const timeRatio = responseTime / averageTime
    
    if (timeRatio > 2.0) {
      // Very slow response - decrease ease factor
      return -0.1
    } else if (timeRatio < 0.5) {
      // Very fast response - increase ease factor
      return 0.05
    }
    
    return 0
  }

  /**
   * Apply time-based adjustments to interval
   */
  private static applyTimeAdjustments(interval: number, responseTime: number, averageTime: number): number {
    if (responseTime > this.TIME_PENALTY_THRESHOLD) {
      // Reduce interval for slow responses
      return Math.max(1, Math.floor(interval * 0.8))
    }
    
    return interval
  }

  /**
   * Calculate confidence score based on performance
   */
  private static calculateConfidenceScore(card: SRSCard, result: ReviewResult, correctStreak: number): number {
    const { quality, responseTime } = result
    
    // Base confidence from quality
    let confidence = quality / 5.0
    
    // Adjust for response time
    if (responseTime < 3.0) {
      confidence += 0.1 // Quick response bonus
    } else if (responseTime > 10.0) {
      confidence -= 0.1 // Slow response penalty
    }
    
    // Adjust for streak
    const streakBonus = Math.min(correctStreak * 0.05, 0.2)
    confidence += streakBonus
    
    return Math.max(0, Math.min(1, confidence))
  }

  /**
   * Get cards due for review
   */
  static getDueCards(cards: SRSCard[], limit: number = 20): SRSCard[] {
    const now = new Date()
    const dueCards = cards.filter(card => card.nextReview <= now)
    
    // Sort by priority: overdue cards first, then by difficulty
    return dueCards
      .sort((a, b) => {
        const aOverdue = (now.getTime() - a.nextReview.getTime()) / (1000 * 60 * 60 * 24)
        const bOverdue = (now.getTime() - b.nextReview.getTime()) / (1000 * 60 * 60 * 24)
        
        if (aOverdue !== bOverdue) {
          return bOverdue - aOverdue // More overdue first
        }
        
        return b.difficulty - a.difficulty // Higher difficulty first
      })
      .slice(0, limit)
  }

  /**
   * Update card statistics
   */
  static updateCardStats(card: SRSCard, result: ReviewResult): Partial<SRSCard> {
    const totalReviews = card.totalReviews + 1
    const averageTime = ((card.averageTime * card.totalReviews) + result.responseTime) / totalReviews
    
    return {
      totalReviews,
      averageTime,
      lastReview: new Date(),
      quality: result.quality
    }
  }

  /**
   * Calculate optimal review schedule for the day
   */
  static calculateDailySchedule(cards: SRSCard[], availableHours: number = 8): SRSCard[] {
    const dueCards = this.getDueCards(cards)
    const avgTimePerCard = 30 // seconds
    const maxCards = Math.floor((availableHours * 3600) / avgTimePerCard)
    
    return dueCards.slice(0, maxCards)
  }

  /**
   * Predict next review load
   */
  static predictReviewLoad(cards: SRSCard[], days: number = 7): number[] {
    const loads = Array(days).fill(0)
    
    cards.forEach(card => {
      const daysUntilReview = Math.ceil((card.nextReview.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      if (daysUntilReview >= 0 && daysUntilReview < days) {
        loads[daysUntilReview]++
      }
    })
    
    return loads
  }
}

export default AdaptiveSRSAlgorithm