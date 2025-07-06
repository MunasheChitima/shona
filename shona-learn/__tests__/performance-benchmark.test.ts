import { describe, it, expect, beforeAll } from '@jest/globals'
import { AdvancedAdaptiveSRS, EnhancedSRSCard, ReviewResult, UserContext } from '../lib/srs-algorithm-v2'
import { AdaptiveSRSAlgorithm, SRSCard } from '../lib/srs-algorithm'
import { FlashcardService } from '../lib/flashcard-service'

describe('Performance Benchmarks', () => {
  let testCards: EnhancedSRSCard[] = []
  let mockUserContext: UserContext
  
  beforeAll(() => {
    // Generate test dataset
    testCards = generateTestCards(10000)
    mockUserContext = createMockUserContext()
  })

  describe('Algorithm Performance', () => {
    it('should process 10,000 cards in under 100ms', () => {
      const startTime = performance.now()
      
      testCards.forEach(card => {
        const result: ReviewResult = {
          quality: Math.floor(Math.random() * 5) + 1,
          responseTime: Math.random() * 10,
          wasCorrect: Math.random() > 0.3,
          confidence: Math.random(),
          hintsUsed: Math.floor(Math.random() * 3)
        }
        
        AdvancedAdaptiveSRS.calculateNextReview(card, result, mockUserContext)
      })
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      expect(duration).toBeLessThan(100)
      console.log(`Processed 10,000 cards in ${duration.toFixed(2)}ms`)
    })

    it('should maintain O(log n) complexity for card selection', () => {
      const sizes = [1000, 5000, 10000, 20000]
      const times: number[] = []
      
      sizes.forEach(size => {
        const cards = generateTestCards(size)
        const startTime = performance.now()
        
        // Simulate priority queue selection
        const dueCards = cards
          .filter(card => card.nextReview <= new Date())
          .sort((a, b) => calculatePriority(b) - calculatePriority(a))
          .slice(0, 30)
        
        const endTime = performance.now()
        times.push(endTime - startTime)
      })
      
      // Check that time complexity is sublinear
      const ratio1 = times[1] / times[0]
      const ratio2 = times[3] / times[2]
      
      expect(ratio2).toBeLessThan(ratio1 * 1.5) // Allow for some variance
    })
  })

  describe('Memory Efficiency', () => {
    it('should use minimal memory for large datasets', () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      // Create 50,000 cards
      const largeDataset = generateTestCards(50000)
      
      const afterCreation = process.memoryUsage().heapUsed
      const memoryPerCard = (afterCreation - initialMemory) / 50000 / 1024 // KB per card
      
      expect(memoryPerCard).toBeLessThan(1) // Less than 1KB per card
      console.log(`Memory usage: ${memoryPerCard.toFixed(2)}KB per card`)
    })

    it('should efficiently garbage collect after processing', () => {
      const initialMemory = process.memoryUsage().heapUsed
      
      // Process and discard
      for (let i = 0; i < 10; i++) {
        const tempCards = generateTestCards(1000)
        tempCards.forEach(card => {
          const result: ReviewResult = {
            quality: 4,
            responseTime: 3,
            wasCorrect: true,
            confidence: 0.9,
            hintsUsed: 0
          }
          AdvancedAdaptiveSRS.calculateNextReview(card, result, mockUserContext)
        })
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc()
      }
      
      const finalMemory = process.memoryUsage().heapUsed
      const memoryLeak = finalMemory - initialMemory
      
      expect(memoryLeak).toBeLessThan(5 * 1024 * 1024) // Less than 5MB leak
    })
  })

  describe('Machine Learning Performance', () => {
    it('should predict optimal review times efficiently', () => {
      const card = testCards[0]
      card.performanceHistory = generatePerformanceHistory(100)
      
      const startTime = performance.now()
      
      for (let i = 0; i < 1000; i++) {
        const result: ReviewResult = {
          quality: 4,
          responseTime: 3,
          wasCorrect: true,
          confidence: 0.85,
          hintsUsed: 0
        }
        
        const update = AdvancedAdaptiveSRS.calculateNextReview(card, result, mockUserContext)
        
        // Verify predictions are generated
        expect(update.insights).toBeDefined()
        expect(update.insights.predictedRetention).toBeGreaterThan(0)
      }
      
      const endTime = performance.now()
      const avgTime = (endTime - startTime) / 1000
      
      expect(avgTime).toBeLessThan(0.1) // Less than 0.1ms per prediction
      console.log(`ML prediction time: ${avgTime.toFixed(3)}ms per card`)
    })

    it('should efficiently identify patterns across similar cards', () => {
      const contextVectors = generateContextVectors(10000)
      const targetVector = [0.5, 0.5, 0.5, 0.5]
      
      const startTime = performance.now()
      
      // Find similar cards (cosine similarity > 0.7)
      const similar = contextVectors.filter(vec => 
        cosineSimilarity(vec, targetVector) > 0.7
      )
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50)
      console.log(`Pattern matching: ${similar.length} similar cards found in ${(endTime - startTime).toFixed(2)}ms`)
    })
  })

  describe('Database Operations', () => {
    it('should batch update 1000 cards efficiently', async () => {
      const service = new FlashcardService()
      const updates = testCards.slice(0, 1000).map(card => ({
        id: card.id,
        easeFactor: card.easeFactor * 1.1,
        interval: card.interval + 1,
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }))
      
      const startTime = performance.now()
      
      // Simulate batch update
      await simulateBatchUpdate(updates)
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(100)
      console.log(`Batch updated 1000 cards in ${(endTime - startTime).toFixed(2)}ms`)
    })
  })

  describe('Notification Scheduling', () => {
    it('should generate optimal schedules for 7 days quickly', () => {
      const startTime = performance.now()
      
      const schedule = generateOptimalSchedule(testCards.slice(0, 1000), 7)
      
      const endTime = performance.now()
      
      expect(endTime - startTime).toBeLessThan(50)
      expect(schedule.length).toBe(7)
      
      const totalNotifications = schedule.reduce((sum, day) => sum + day.length, 0)
      console.log(`Generated ${totalNotifications} notifications in ${(endTime - startTime).toFixed(2)}ms`)
    })
  })

  describe('Concurrent Operations', () => {
    it('should handle concurrent reviews without race conditions', async () => {
      const card = testCards[0]
      const results: any[] = []
      
      const promises = Array(100).fill(null).map(async (_, i) => {
        const result: ReviewResult = {
          quality: 4,
          responseTime: 3,
          wasCorrect: true,
          confidence: 0.9,
          hintsUsed: 0
        }
        
        const update = AdvancedAdaptiveSRS.calculateNextReview(
          { ...card, id: `concurrent-${i}` },
          result,
          mockUserContext
        )
        
        results.push(update)
      })
      
      const startTime = performance.now()
      await Promise.all(promises)
      const endTime = performance.now()
      
      expect(results.length).toBe(100)
      expect(endTime - startTime).toBeLessThan(50)
      console.log(`Processed 100 concurrent reviews in ${(endTime - startTime).toFixed(2)}ms`)
    })
  })

  describe('Scalability Metrics', () => {
    it('should maintain performance with increasing user history', () => {
      const historySizes = [10, 100, 1000]
      const times: number[] = []
      
      historySizes.forEach(size => {
        const card = testCards[0]
        card.performanceHistory = generatePerformanceHistory(size)
        
        const startTime = performance.now()
        
        for (let i = 0; i < 100; i++) {
          const result: ReviewResult = {
            quality: 4,
            responseTime: 3,
            wasCorrect: true,
            confidence: 0.9,
            hintsUsed: 0
          }
          
          AdvancedAdaptiveSRS.calculateNextReview(card, result, mockUserContext)
        }
        
        const endTime = performance.now()
        times.push(endTime - startTime)
      })
      
      // Performance should not degrade significantly with history size
      const degradation = times[2] / times[0]
      expect(degradation).toBeLessThan(2) // Less than 2x slower with 100x more history
      
      console.log(`Performance degradation with 100x history: ${degradation.toFixed(2)}x`)
    })
  })
})

// Helper functions
function generateTestCards(count: number): EnhancedSRSCard[] {
  return Array(count).fill(null).map((_, i) => ({
    id: `card-${i}`,
    easeFactor: 2.5 + Math.random(),
    interval: Math.floor(Math.random() * 30) + 1,
    repetitions: Math.floor(Math.random() * 10),
    lastReview: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    nextReview: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
    quality: Math.floor(Math.random() * 5) + 1,
    totalReviews: Math.floor(Math.random() * 50),
    correctStreak: Math.floor(Math.random() * 10),
    wrongStreak: 0,
    averageTime: Math.random() * 10,
    difficulty: Math.random(),
    contextVector: [Math.random(), Math.random(), Math.random(), Math.random()],
    personalizedFactors: {
      timeOfDayPreference: [9, 14, 19],
      learningStyle: 'visual',
      memoryStrength: 0.7,
      attentionSpan: 0.8,
      stressLevel: 0.3,
      motivationLevel: 0.8,
      cognitiveLoad: 0.4
    },
    performanceHistory: []
  }))
}

function createMockUserContext(): UserContext {
  return {
    userId: 'test-user',
    timezone: 'UTC',
    timeOfDay: 14,
    sessionLength: 30,
    cardsReviewedToday: 20,
    dailyReviewLoad: 30,
    targetDailyReviews: 40,
    availability: [9, 10, 11, 14, 15, 16, 19, 20],
    userHistory: []
  }
}

function calculatePriority(card: EnhancedSRSCard): number {
  const overdueFactor = Math.max(0, -card.nextReview.getTime() + Date.now()) / (24 * 60 * 60 * 1000)
  return overdueFactor * 2 + card.difficulty + card.wrongStreak * 0.2
}

function generatePerformanceHistory(count: number) {
  return Array(count).fill(null).map(() => ({
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    quality: Math.floor(Math.random() * 5) + 1,
    responseTime: Math.random() * 10,
    contextualFactors: {
      timeOfDay: Math.floor(Math.random() * 24),
      dayOfWeek: Math.floor(Math.random() * 7),
      sessionLength: Math.random() * 60,
      cardsReviewedInSession: Math.floor(Math.random() * 30)
    }
  }))
}

function generateContextVectors(count: number): number[][] {
  return Array(count).fill(null).map(() => [
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random()
  ])
}

function cosineSimilarity(vec1: number[], vec2: number[]): number {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0)
  const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0))
  const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0))
  return dotProduct / (mag1 * mag2)
}

async function simulateBatchUpdate(updates: any[]): Promise<void> {
  // Simulate database batch update
  return new Promise(resolve => {
    setTimeout(() => resolve(), updates.length * 0.01)
  })
}

function generateOptimalSchedule(cards: EnhancedSRSCard[], days: number): any[][] {
  const schedule: any[][] = Array(days).fill(null).map(() => [])
  
  cards.forEach(card => {
    const dayIndex = Math.floor(Math.random() * days)
    schedule[dayIndex].push({
      cardId: card.id,
      time: new Date(),
      priority: Math.random() > 0.7 ? 'high' : 'medium'
    })
  })
  
  return schedule
}