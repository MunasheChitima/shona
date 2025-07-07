// Enhanced Spaced Repetition System for Shona Language Learning
// Implements modified SM-2 algorithm with Shona-specific optimizations

export interface SRSCard {
  id: string
  userId: string
  contentId: string
  contentType: 'vocabulary' | 'lesson' | 'cultural_note' | 'grammar'
  
  // Core SRS data
  interval: number // days until next review
  repetition: number // number of successful reviews
  easeFactor: number // how easy the item is (1.3-2.5)
  
  // Shona-specific data
  tonePattern?: string
  pronunciationDifficulty: number // 1-10
  culturalComplexity: number // 1-10
  
  // Performance tracking
  totalReviews: number
  correctReviews: number
  averageResponseTime: number
  lastReviewed: Date
  nextReview: Date
  
  // Difficulty factors
  toneChallengeLevel: number // 1-5 (how challenging the tones are)
  phoneticComplexity: number // 1-5 (whistled sounds, clusters)
  culturalNuance: number // 1-5 (cultural understanding required)
  
  // User-specific adjustments
  personalDifficultyAdjustment: number // -2 to +2
  priorityBoost: boolean // user marked as important
  
  created: Date
  modified: Date
}

export interface ReviewResult {
  cardId: string
  quality: number // 0-5 (0=total blackout, 5=perfect response)
  responseTime: number // seconds
  wasCorrect: boolean
  reviewDate: Date
  
  // Shona-specific feedback
  toneAccuracy?: number // 0-1 for pronunciation exercises
  culturalUnderstanding?: number // 0-1 for cultural context
  pronunciationScore?: number // 0-1 for speech recognition
}

export interface SRSSettings {
  // Base intervals (in days)
  learningSteps: number[] // [1, 10] for new cards
  graduatingInterval: number // first interval after graduation
  easyInterval: number // interval for "easy" button
  
  // Multipliers
  intervalModifier: number // multiplies intervals (default 1.0)
  hardMultiplier: number // multiplies interval for "hard" (default 0.8)
  easyMultiplier: number // multiplies interval for "easy" (default 1.3)
  
  // Shona-specific settings
  toneBonus: number // bonus interval for mastered tones
  tonePenalty: number // penalty for tone struggles
  culturalBonus: number // bonus for cultural understanding
  pronunciationPenalty: number // penalty for pronunciation issues
  
  // Advanced settings
  maxInterval: number // maximum interval in days
  minInterval: number // minimum interval in days
  fuzzFactor: number // randomization to prevent review clustering
}

export class ShonaSpacedRepetition {
  private settings: SRSSettings

  constructor(settings?: Partial<SRSSettings>) {
    this.settings = {
      learningSteps: [1, 10],
      graduatingInterval: 15,
      easyInterval: 30,
      intervalModifier: 1.0,
      hardMultiplier: 0.8,
      easyMultiplier: 1.3,
      toneBonus: 1.2,
      tonePenalty: 0.7,
      culturalBonus: 1.1,
      pronunciationPenalty: 0.8,
      maxInterval: 365,
      minInterval: 1,
      fuzzFactor: 0.1,
      ...settings
    }
  }

  /**
   * Calculate next review schedule based on performance
   */
  calculateNextReview(card: SRSCard, result: ReviewResult): SRSCard {
    const updatedCard = { ...card }
    
    // Update basic stats
    updatedCard.totalReviews++
    updatedCard.lastReviewed = result.reviewDate
    updatedCard.averageResponseTime = this.updateAverageResponseTime(card, result)
    
    if (result.wasCorrect) {
      updatedCard.correctReviews++
    }

    // Calculate base interval using modified SM-2
    const baseInterval = this.calculateBaseInterval(card, result)
    
    // Apply Shona-specific adjustments
    const adjustedInterval = this.applyShonaAdjustments(card, result, baseInterval)
    
    // Apply fuzz factor to prevent clustering
    const finalInterval = this.applyFuzzFactor(adjustedInterval)
    
    // Update card properties
    updatedCard.interval = Math.max(this.settings.minInterval, Math.min(this.settings.maxInterval, finalInterval))
    updatedCard.nextReview = new Date(result.reviewDate.getTime() + updatedCard.interval * 24 * 60 * 60 * 1000)
    updatedCard.easeFactor = this.updateEaseFactor(card.easeFactor, result.quality)
    updatedCard.repetition = result.wasCorrect ? card.repetition + 1 : 0
    updatedCard.modified = new Date()

    return updatedCard
  }

  /**
   * Get cards due for review
   */
  getDueCards(cards: SRSCard[], currentDate: Date = new Date()): SRSCard[] {
    return cards
      .filter(card => card.nextReview <= currentDate)
      .sort((a, b) => {
        // Priority order: overdue, high priority, then by due date
        const aDaysOverdue = Math.max(0, (currentDate.getTime() - a.nextReview.getTime()) / (24 * 60 * 60 * 1000))
        const bDaysOverdue = Math.max(0, (currentDate.getTime() - b.nextReview.getTime()) / (24 * 60 * 60 * 1000))
        
        if (a.priorityBoost !== b.priorityBoost) {
          return b.priorityBoost ? 1 : -1
        }
        
        return bDaysOverdue - aDaysOverdue
      })
  }

  /**
   * Get learning cards (new or failed cards in learning phase)
   */
  getLearningCards(cards: SRSCard[]): SRSCard[] {
    return cards.filter(card => card.repetition === 0 && card.interval < this.settings.graduatingInterval)
  }

  /**
   * Create a new SRS card
   */
  createNewCard(
    userId: string, 
    contentId: string, 
    contentType: SRSCard['contentType'],
    shonaSpecific: {
      tonePattern?: string
      pronunciationDifficulty: number
      culturalComplexity: number
      toneChallengeLevel?: number
      phoneticComplexity?: number
      culturalNuance?: number
    }
  ): SRSCard {
    const now = new Date()
    
    return {
      id: `srs_${contentId}_${userId}_${Date.now()}`,
      userId,
      contentId,
      contentType,
      interval: this.settings.learningSteps[0],
      repetition: 0,
      easeFactor: 2.5,
      tonePattern: shonaSpecific.tonePattern,
      pronunciationDifficulty: shonaSpecific.pronunciationDifficulty,
      culturalComplexity: shonaSpecific.culturalComplexity,
      totalReviews: 0,
      correctReviews: 0,
      averageResponseTime: 0,
      lastReviewed: now,
      nextReview: new Date(now.getTime() + this.settings.learningSteps[0] * 24 * 60 * 60 * 1000),
      toneChallengeLevel: shonaSpecific.toneChallengeLevel || this.calculateToneChallengeLevel(shonaSpecific.tonePattern),
      phoneticComplexity: shonaSpecific.phoneticComplexity || this.calculatePhoneticComplexity(contentId),
      culturalNuance: shonaSpecific.culturalNuance || Math.min(5, Math.ceil(shonaSpecific.culturalComplexity / 2)),
      personalDifficultyAdjustment: 0,
      priorityBoost: false,
      created: now,
      modified: now
    }
  }

  /**
   * Analyze user's learning patterns for optimization
   */
  analyzeUserPerformance(cards: SRSCard[]): {
    overallAccuracy: number
    averageInterval: number
    toneStruggles: boolean
    pronunciationStruggles: boolean
    culturalStruggles: boolean
    strongAreas: string[]
    improvementAreas: string[]
    recommendations: string[]
  } {
    if (cards.length === 0) {
      return {
        overallAccuracy: 0,
        averageInterval: 0,
        toneStruggles: false,
        pronunciationStruggles: false,
        culturalStruggles: false,
        strongAreas: [],
        improvementAreas: [],
        recommendations: []
      }
    }

    const reviewedCards = cards.filter(card => card.totalReviews > 0)
    const overallAccuracy = reviewedCards.reduce((sum, card) => sum + (card.correctReviews / card.totalReviews), 0) / reviewedCards.length
    const averageInterval = cards.reduce((sum, card) => sum + card.interval, 0) / cards.length

    // Identify struggle areas
    const toneCards = cards.filter(card => card.tonePattern && card.toneChallengeLevel >= 3)
    const toneStruggles = toneCards.length > 0 && 
      toneCards.reduce((sum, card) => sum + (card.correctReviews / Math.max(1, card.totalReviews)), 0) / toneCards.length < 0.7

    const pronunciationCards = cards.filter(card => card.pronunciationDifficulty >= 6)
    const pronunciationStruggles = pronunciationCards.length > 0 &&
      pronunciationCards.reduce((sum, card) => sum + (card.correctReviews / Math.max(1, card.totalReviews)), 0) / pronunciationCards.length < 0.7

    const culturalCards = cards.filter(card => card.culturalComplexity >= 6)
    const culturalStruggles = culturalCards.length > 0 &&
      culturalCards.reduce((sum, card) => sum + (card.correctReviews / Math.max(1, card.totalReviews)), 0) / culturalCards.length < 0.7

    // Identify strong areas
    const strongAreas: string[] = []
    const improvementAreas: string[] = []
    const recommendations: string[] = []

    if (!toneStruggles && toneCards.length > 5) strongAreas.push('Tone recognition')
    if (!pronunciationStruggles && pronunciationCards.length > 5) strongAreas.push('Pronunciation')
    if (!culturalStruggles && culturalCards.length > 5) strongAreas.push('Cultural understanding')

    if (toneStruggles) {
      improvementAreas.push('Tone patterns')
      recommendations.push('Practice with audio shadowing and tone visualization')
    }
    if (pronunciationStruggles) {
      improvementAreas.push('Pronunciation')
      recommendations.push('Use speech recognition exercises more frequently')
    }
    if (culturalStruggles) {
      improvementAreas.push('Cultural context')
      recommendations.push('Study cultural notes and context before vocabulary')
    }

    if (overallAccuracy > 0.9) {
      recommendations.push('Consider increasing your challenge level')
    } else if (overallAccuracy < 0.6) {
      recommendations.push('Focus on review before learning new content')
    }

    return {
      overallAccuracy,
      averageInterval,
      toneStruggles,
      pronunciationStruggles,
      culturalStruggles,
      strongAreas,
      improvementAreas,
      recommendations
    }
  }

  private calculateBaseInterval(card: SRSCard, result: ReviewResult): number {
    // Modified SM-2 algorithm
    if (result.quality < 3) {
      // Failed - restart learning
      return this.settings.learningSteps[0]
    }

    if (card.repetition === 0) {
      // First successful review
      return this.settings.learningSteps[1] || this.settings.graduatingInterval
    }

    if (card.repetition === 1) {
      // Second successful review - graduate
      return this.settings.graduatingInterval
    }

    // Calculate interval for mature cards
    let newInterval = card.interval * card.easeFactor

    // Adjust based on review quality
    if (result.quality === 3) {
      newInterval *= this.settings.hardMultiplier
    } else if (result.quality === 5) {
      newInterval *= this.settings.easyMultiplier
    }

    return newInterval * this.settings.intervalModifier
  }

  private applyShonaAdjustments(card: SRSCard, result: ReviewResult, baseInterval: number): number {
    let adjustedInterval = baseInterval

    // Tone-based adjustments
    if (card.tonePattern && result.toneAccuracy !== undefined) {
      if (result.toneAccuracy >= 0.9) {
        adjustedInterval *= this.settings.toneBonus
      } else if (result.toneAccuracy < 0.6) {
        adjustedInterval *= this.settings.tonePenalty
      }
    }

    // Cultural understanding adjustments
    if (result.culturalUnderstanding !== undefined) {
      if (result.culturalUnderstanding >= 0.8) {
        adjustedInterval *= this.settings.culturalBonus
      }
    }

    // Pronunciation adjustments
    if (result.pronunciationScore !== undefined && result.pronunciationScore < 0.7) {
      adjustedInterval *= this.settings.pronunciationPenalty
    }

    // Response time adjustments (faster response = slightly longer interval)
    const expectedTime = 10 + card.pronunciationDifficulty * 2 // expected response time in seconds
    if (result.responseTime < expectedTime * 0.7) {
      adjustedInterval *= 1.1 // 10% bonus for quick recall
    } else if (result.responseTime > expectedTime * 2) {
      adjustedInterval *= 0.9 // 10% penalty for slow recall
    }

    // Personal difficulty adjustment
    adjustedInterval *= Math.pow(1.1, card.personalDifficultyAdjustment)

    return adjustedInterval
  }

  private updateEaseFactor(currentEF: number, quality: number): number {
    const newEF = currentEF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    return Math.max(1.3, Math.min(2.5, newEF))
  }

  private updateAverageResponseTime(card: SRSCard, result: ReviewResult): number {
    if (card.totalReviews === 0) {
      return result.responseTime
    }
    
    // Weighted average favoring recent performance
    const weight = 0.3
    return card.averageResponseTime * (1 - weight) + result.responseTime * weight
  }

  private applyFuzzFactor(interval: number): number {
    const fuzz = interval * this.settings.fuzzFactor
    const randomAdjustment = (Math.random() - 0.5) * 2 * fuzz
    return interval + randomAdjustment
  }

  private calculateToneChallengeLevel(tonePattern?: string): number {
    if (!tonePattern) return 1
    
    // Count tone changes as complexity indicator
    let changes = 0
    for (let i = 1; i < tonePattern.length; i++) {
      if (tonePattern[i] !== tonePattern[i - 1]) changes++
    }
    
    return Math.min(5, Math.max(1, Math.ceil(changes / 2) + 1))
  }

  private calculatePhoneticComplexity(contentId: string): number {
    // This would analyze the phonetic content
    // For now, return a default value
    return 3
  }

  /**
   * Get statistics for the SRS system
   */
  getStatistics(cards: SRSCard[]): {
    totalCards: number
    dueToday: number
    learning: number
    mature: number
    averageAccuracy: number
    estimatedReviewTime: number
  } {
    const now = new Date()
    const dueCards = this.getDueCards(cards, now)
    const learningCards = this.getLearningCards(cards)
    const matureCards = cards.filter(card => card.repetition >= 2)
    
    const reviewedCards = cards.filter(card => card.totalReviews > 0)
    const averageAccuracy = reviewedCards.length > 0 
      ? reviewedCards.reduce((sum, card) => sum + (card.correctReviews / card.totalReviews), 0) / reviewedCards.length 
      : 0

    // Estimate review time based on average response time and number of due cards
    const avgResponseTime = reviewedCards.length > 0
      ? reviewedCards.reduce((sum, card) => sum + card.averageResponseTime, 0) / reviewedCards.length
      : 30 // default 30 seconds per card

    return {
      totalCards: cards.length,
      dueToday: dueCards.length,
      learning: learningCards.length,
      mature: matureCards.length,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      estimatedReviewTime: Math.ceil(dueCards.length * avgResponseTime / 60) // in minutes
    }
  }
}

export default ShonaSpacedRepetition