import { describe, it, expect, beforeEach, jest } from '@jest/globals'
import { AdvancedAdaptiveSRS, EnhancedSRSCard, ReviewResult, UserContext, PersonalizedFactors } from '../lib/srs-algorithm-v2'
import { AdaptiveSRSAlgorithm, SRSCard } from '../lib/srs-algorithm'

describe('Advanced Adaptive SRS Algorithm', () => {
  let mockCard: EnhancedSRSCard
  let mockUserContext: UserContext
  
  beforeEach(() => {
    mockCard = {
      id: 'test-card-1',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      lastReview: new Date(),
      nextReview: new Date(),
      quality: 0,
      totalReviews: 0,
      correctStreak: 0,
      wrongStreak: 0,
      averageTime: 0,
      difficulty: 0.5,
      contextVector: [0.5, 0.5, 0.5, 0.5],
      personalizedFactors: {
        timeOfDayPreference: [9, 10, 14, 15],
        learningStyle: 'visual',
        memoryStrength: 0.7,
        attentionSpan: 0.8,
        stressLevel: 0.3,
        motivationLevel: 0.8,
        cognitiveLoad: 0.4
      },
      performanceHistory: []
    }
    
    mockUserContext = {
      userId: 'test-user',
      timezone: 'UTC',
      timeOfDay: 10,
      sessionLength: 30,
      cardsReviewedToday: 5,
      dailyReviewLoad: 20,
      targetDailyReviews: 30,
      availability: [9, 10, 11, 14, 15, 16, 19, 20],
      userHistory: []
    }
  })

  describe('Machine Learning Optimization', () => {
    it('should apply ML optimizations based on user patterns', () => {
      const result: ReviewResult = {
        quality: 4,
        responseTime: 3.5,
        wasCorrect: true,
        confidence: 0.9,
        hintsUsed: 0
      }
      
      const update = AdvancedAdaptiveSRS.calculateNextReview(mockCard, result, mockUserContext)
      
      expect(update.easeFactor).toBeGreaterThan(mockCard.easeFactor)
      expect(update.insights).toBeDefined()
      expect(update.recommendedActions).toBeInstanceOf(Array)
    })

    it('should predict optimal review timing based on circadian rhythm', () => {
      const result: ReviewResult = {
        quality: 3,
        responseTime: 5,
        wasCorrect: true,
        confidence: 0.7,
        hintsUsed: 1
      }
      
      const update = AdvancedAdaptiveSRS.calculateNextReview(mockCard, result, mockUserContext)
      const reviewHour = update.optimalReviewTime.getHours()
      
      expect([9, 10, 11, 14, 15, 16]).toContain(reviewHour)
    })

    it('should adjust for cognitive load balancing', () => {
      const highLoadContext = {
        ...mockUserContext,
        dailyReviewLoad: 40,
        targetDailyReviews: 30
      }
      
      const result: ReviewResult = {
        quality: 4,
        responseTime: 2,
        wasCorrect: true,
        confidence: 0.95,
        hintsUsed: 0
      }
      
      const normalUpdate = AdvancedAdaptiveSRS.calculateNextReview(mockCard, result, mockUserContext)
      const highLoadUpdate = AdvancedAdaptiveSRS.calculateNextReview(mockCard, result, highLoadContext)
      
      expect(highLoadUpdate.interval).toBeGreaterThan(normalUpdate.interval)
    })
  })

  describe('Predictive Analytics', () => {
    it('should generate forgetting curve predictions', () => {
      const result: ReviewResult = {
        quality: 4,
        responseTime: 3,
        wasCorrect: true,
        confidence: 0.85,
        hintsUsed: 0
      }
      
      const update = AdvancedAdaptiveSRS.calculateNextReview(mockCard, result, mockUserContext)
      const forgettingCurve = update.insights.forgettingCurveData
      
      expect(forgettingCurve.length).toBeGreaterThan(0)
      expect(forgettingCurve[0].retention).toBe(100)
      expect(forgettingCurve[forgettingCurve.length - 1].retention).toBeLessThan(100)
    })

    it('should analyze difficulty trends', () => {
      // Add performance history
      mockCard.performanceHistory = [
        { timestamp: new Date(), quality: 2, responseTime: 8, contextualFactors: { timeOfDay: 10, dayOfWeek: 1, sessionLength: 30, cardsReviewedInSession: 5 } },
        { timestamp: new Date(), quality: 2, responseTime: 9, contextualFactors: { timeOfDay: 10, dayOfWeek: 2, sessionLength: 30, cardsReviewedInSession: 6 } },
        { timestamp: new Date(), quality: 3, responseTime: 7, contextualFactors: { timeOfDay: 10, dayOfWeek: 3, sessionLength: 30, cardsReviewedInSession: 7 } },
        { timestamp: new Date(), quality: 3, responseTime: 6, contextualFactors: { timeOfDay: 10, dayOfWeek: 4, sessionLength: 30, cardsReviewedInSession: 8 } },
        { timestamp: new Date(), quality: 4, responseTime: 5, contextualFactors: { timeOfDay: 10, dayOfWeek: 5, sessionLength: 30, cardsReviewedInSession: 9 } }
      ]
      
      const result: ReviewResult = {
        quality: 4,
        responseTime: 4,
        wasCorrect: true,
        confidence: 0.9,
        hintsUsed: 0
      }
      
      const update = AdvancedAdaptiveSRS.calculateNextReview(mockCard, result, mockUserContext)
      
      expect(update.insights.difficultyTrend).toBe('improving')
    })

    it('should calculate mastery probability', () => {
      mockCard.correctStreak = 8
      mockCard.easeFactor = 3.5
      mockCard.totalReviews = 15
      mockCard.interval = 25
      
      const result: ReviewResult = {
        quality: 5,
        responseTime: 2,
        wasCorrect: true,
        confidence: 0.98,
        hintsUsed: 0
      }
      
      const update = AdvancedAdaptiveSRS.calculateNextReview(mockCard, result, mockUserContext)
      
      expect(update.insights.masteryProbability).toBeGreaterThan(0.7)
    })
  })

  describe('Personalized Recommendations', () => {
    it('should generate interventions for struggling cards', () => {
      const result: ReviewResult = {
        quality: 1,
        responseTime: 15,
        wasCorrect: false,
        confidence: 0.2,
        hintsUsed: 3
      }
      
      const update = AdvancedAdaptiveSRS.calculateNextReview(mockCard, result, mockUserContext)
      
      expect(update.insights.suggestedInterventions.length).toBeGreaterThan(0)
      expect(update.recommendedActions.length).toBeGreaterThan(0)
    })

    it('should recognize high-performing cards', () => {
      mockCard.correctStreak = 10
      mockCard.interval = 35
      mockCard.averageTime = 2
      
      const result: ReviewResult = {
        quality: 5,
        responseTime: 1.5,
        wasCorrect: true,
        confidence: 1.0,
        hintsUsed: 0
      }
      
      const update = AdvancedAdaptiveSRS.calculateNextReview(mockCard, result, mockUserContext)
      const recommendations = update.recommendedActions
      
      expect(recommendations.some(r => r.includes('advancing'))).toBe(true)
    })
  })

  describe('Pattern Recognition', () => {
    it('should identify similar cards and apply learned patterns', () => {
      mockUserContext.userHistory = [
        {
          cardId: 'similar-1',
          contextVector: [0.48, 0.52, 0.49, 0.51],
          averageQuality: 4.2,
          totalReviews: 20
        },
        {
          cardId: 'similar-2',
          contextVector: [0.51, 0.49, 0.52, 0.48],
          averageQuality: 4.5,
          totalReviews: 25
        }
      ]
      
      const result: ReviewResult = {
        quality: 3,
        responseTime: 4,
        wasCorrect: true,
        confidence: 0.75,
        hintsUsed: 0
      }
      
      const update = AdvancedAdaptiveSRS.calculateNextReview(mockCard, result, mockUserContext)
      
      // Should get positive adjustment from similar high-performing cards
      expect(update.easeFactor).toBeGreaterThan(2.5)
    })
  })
})

describe('Original Adaptive SRS Algorithm', () => {
  let mockCard: SRSCard
  
  beforeEach(() => {
    mockCard = {
      id: 'test-card',
      easeFactor: 2.5,
      interval: 1,
      repetitions: 0,
      lastReview: new Date(),
      nextReview: new Date(),
      quality: 0,
      totalReviews: 0,
      correctStreak: 0,
      wrongStreak: 0,
      averageTime: 0,
      difficulty: 0.5
    }
  })

  describe('Core Algorithm', () => {
    it('should reset interval on failure', () => {
      const result = {
        quality: 2,
        responseTime: 10,
        wasCorrect: false
      }
      
      const update = AdaptiveSRSAlgorithm.calculateNextReview(mockCard, result)
      
      expect(update.interval).toBe(1)
      expect(update.repetitions).toBe(0)
      expect(update.shouldAdvance).toBe(false)
    })

    it('should increase interval on success', () => {
      mockCard.repetitions = 2
      mockCard.interval = 6
      
      const result = {
        quality: 4,
        responseTime: 3,
        wasCorrect: true
      }
      
      const update = AdaptiveSRSAlgorithm.calculateNextReview(mockCard, result)
      
      expect(update.interval).toBeGreaterThan(6)
      expect(update.repetitions).toBe(3)
      expect(update.shouldAdvance).toBe(true)
    })

    it('should apply difficulty adjustments', () => {
      const easyCard = { ...mockCard, difficulty: 0.2 }
      const hardCard = { ...mockCard, difficulty: 0.8 }
      
      const result = {
        quality: 3,
        responseTime: 5,
        wasCorrect: true
      }
      
      const easyUpdate = AdaptiveSRSAlgorithm.calculateNextReview(easyCard, result)
      const hardUpdate = AdaptiveSRSAlgorithm.calculateNextReview(hardCard, result)
      
      expect(easyUpdate.easeFactor).toBeGreaterThan(hardUpdate.easeFactor)
    })
  })

  describe('Time-based Adjustments', () => {
    it('should penalize slow responses', () => {
      mockCard.averageTime = 5
      
      const fastResult = {
        quality: 3,
        responseTime: 2,
        wasCorrect: true
      }
      
      const slowResult = {
        quality: 3,
        responseTime: 12,
        wasCorrect: true
      }
      
      const fastUpdate = AdaptiveSRSAlgorithm.calculateNextReview(mockCard, fastResult)
      const slowUpdate = AdaptiveSRSAlgorithm.calculateNextReview(mockCard, slowResult)
      
      expect(fastUpdate.interval).toBeGreaterThan(slowUpdate.interval)
    })
  })

  describe('Streak Adjustments', () => {
    it('should reward correct streaks', () => {
      const noStreak = { ...mockCard, correctStreak: 0 }
      const highStreak = { ...mockCard, correctStreak: 10 }
      
      const result = {
        quality: 4,
        responseTime: 3,
        wasCorrect: true
      }
      
      const noStreakUpdate = AdaptiveSRSAlgorithm.calculateNextReview(noStreak, result)
      const highStreakUpdate = AdaptiveSRSAlgorithm.calculateNextReview(highStreak, result)
      
      expect(highStreakUpdate.easeFactor).toBeGreaterThan(noStreakUpdate.easeFactor)
    })

    it('should penalize wrong streaks', () => {
      const noStreak = { ...mockCard, wrongStreak: 0 }
      const highStreak = { ...mockCard, wrongStreak: 5 }
      
      const result = {
        quality: 3,
        responseTime: 5,
        wasCorrect: true
      }
      
      const noStreakUpdate = AdaptiveSRSAlgorithm.calculateNextReview(noStreak, result)
      const highStreakUpdate = AdaptiveSRSAlgorithm.calculateNextReview(highStreak, result)
      
      expect(highStreakUpdate.easeFactor).toBeLessThan(noStreakUpdate.easeFactor)
    })
  })

  describe('Utility Functions', () => {
    it('should correctly identify due cards', () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      
      const cards: SRSCard[] = [
        { ...mockCard, id: '1', nextReview: yesterday },
        { ...mockCard, id: '2', nextReview: now },
        { ...mockCard, id: '3', nextReview: tomorrow }
      ]
      
      const dueCards = AdaptiveSRSAlgorithm.getDueCards(cards)
      
      expect(dueCards.length).toBe(2)
      expect(dueCards.map(c => c.id)).toContain('1')
      expect(dueCards.map(c => c.id)).toContain('2')
    })

    it('should predict review load correctly', () => {
      const now = new Date()
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
      const in5Days = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)
      
      const cards: SRSCard[] = [
        { ...mockCard, nextReview: now },
        { ...mockCard, nextReview: in3Days },
        { ...mockCard, nextReview: in5Days }
      ]
      
      const loads = AdaptiveSRSAlgorithm.predictReviewLoad(cards, 7)
      
      expect(loads[0]).toBe(1) // Today
      expect(loads[3]).toBe(1) // In 3 days
      expect(loads[5]).toBe(1) // In 5 days
    })
  })
})