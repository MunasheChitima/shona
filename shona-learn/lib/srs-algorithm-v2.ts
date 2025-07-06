/**
 * Advanced Adaptive Spaced Repetition System (A-SRS) v2.0
 * Enhanced with machine learning, contextual awareness, and predictive analytics
 */

import { Matrix, Vector } from './math-utils'

export interface EnhancedSRSCard {
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
  contextVector: number[] // ML feature vector
  personalizedFactors: PersonalizedFactors
  performanceHistory: PerformanceMetric[]
}

export interface PersonalizedFactors {
  timeOfDayPreference: number[]
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  memoryStrength: number
  attentionSpan: number
  stressLevel: number
  motivationLevel: number
  cognitiveLoad: number
}

export interface PerformanceMetric {
  timestamp: Date
  quality: number
  responseTime: number
  contextualFactors: {
    timeOfDay: number
    dayOfWeek: number
    sessionLength: number
    cardsReviewedInSession: number
    ambientConditions?: {
      noise?: number
      interruptions?: number
    }
  }
}

export interface PredictiveInsights {
  optimalReviewTime: Date
  predictedRetention: number
  forgettingCurveData: { time: number, retention: number }[]
  difficultyTrend: 'improving' | 'stable' | 'declining'
  masteryProbability: number
  suggestedInterventions: string[]
}

export class AdvancedAdaptiveSRS {
  private static readonly FORGETTING_CURVE_K = 1.48
  private static readonly MEMORY_DECAY_RATE = 0.5
  private static readonly COGNITIVE_LOAD_THRESHOLD = 0.8
  private static readonly PATTERN_RECOGNITION_WINDOW = 30 // days
  
  // Neural network weights for personalization
  private static neuralWeights: Matrix = new Matrix([
    [0.8, 0.3, 0.5, 0.2], // Time of day impact
    [0.6, 0.7, 0.4, 0.3], // Learning style impact
    [0.9, 0.2, 0.6, 0.4], // Memory strength impact
    [0.5, 0.8, 0.3, 0.7]  // Motivation impact
  ])

  /**
   * Enhanced algorithm with ML-based optimization
   */
  static calculateNextReview(
    card: EnhancedSRSCard, 
    result: ReviewResult,
    userContext: UserContext
  ): EnhancedSRSUpdateResult {
    // Capture performance metric
    const performanceMetric = this.createPerformanceMetric(result, userContext)
    
    // Update performance history
    card.performanceHistory = [...card.performanceHistory, performanceMetric].slice(-100)
    
    // Calculate base parameters using enhanced algorithm
    const baseResult = this.calculateBaseParameters(card, result)
    
    // Apply machine learning optimizations
    const mlOptimizations = this.applyMLOptimizations(card, baseResult, userContext)
    
    // Predict optimal review timing
    const optimalTiming = this.predictOptimalReviewTiming(card, mlOptimizations, userContext)
    
    // Generate predictive insights
    const insights = this.generatePredictiveInsights(card, mlOptimizations)
    
    // Apply cognitive load balancing
    const finalInterval = this.applyCognitiveLoadBalancing(
      optimalTiming.interval,
      userContext.dailyReviewLoad,
      userContext.targetDailyReviews
    )
    
    return {
      ...mlOptimizations,
      interval: finalInterval,
      nextReview: optimalTiming.nextReview,
      optimalReviewTime: optimalTiming.nextReview,
      insights,
      recommendedActions: this.generateRecommendations(card, insights)
    }
  }

  /**
   * Machine Learning optimization layer
   */
  private static applyMLOptimizations(
    card: EnhancedSRSCard,
    baseResult: SRSUpdateResult,
    userContext: UserContext
  ): SRSUpdateResult {
    // Extract features from card history
    const features = this.extractFeatures(card, userContext)
    
    // Apply neural network for personalization
    const personalizedAdjustment = this.neuralNetworkPredict(features, card.personalizedFactors)
    
    // Pattern recognition for similar cards
    const patternAdjustment = this.recognizePatterns(card, userContext.userHistory)
    
    // Time-series analysis for performance trends
    const trendAdjustment = this.analyzePerformanceTrends(card.performanceHistory)
    
    // Combine adjustments
    const totalAdjustment = personalizedAdjustment * 0.4 + 
                           patternAdjustment * 0.3 + 
                           trendAdjustment * 0.3
    
    return {
      ...baseResult,
      easeFactor: baseResult.easeFactor * (1 + totalAdjustment),
      interval: Math.round(baseResult.interval * (1 + totalAdjustment))
    }
  }

  /**
   * Predict optimal review timing using circadian rhythms and user patterns
   */
  private static predictOptimalReviewTiming(
    card: EnhancedSRSCard,
    baseResult: SRSUpdateResult,
    userContext: UserContext
  ): { interval: number, nextReview: Date } {
    const baseInterval = baseResult.interval
    
    // Analyze user's peak performance times
    const peakHours = this.analyzePeakPerformanceHours(card.performanceHistory)
    
    // Consider circadian rhythm
    const circadianOptimal = this.getCircadianOptimalTime(userContext.timezone)
    
    // Find intersection of availability and peak performance
    const optimalHour = this.findOptimalReviewHour(
      peakHours,
      circadianOptimal,
      userContext.availability
    )
    
    // Calculate exact review date/time
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + baseInterval)
    nextReview.setHours(optimalHour, 0, 0, 0)
    
    // Adjust for weekends/holidays if needed
    if (this.isSuboptimalDay(nextReview, userContext)) {
      const adjustment = this.getDateAdjustment(nextReview, userContext)
      nextReview.setDate(nextReview.getDate() + adjustment)
    }
    
    return {
      interval: Math.round((nextReview.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      nextReview
    }
  }

  /**
   * Generate predictive insights using statistical models
   */
  private static generatePredictiveInsights(
    card: EnhancedSRSCard,
    optimization: SRSUpdateResult
  ): PredictiveInsights {
    // Calculate forgetting curve
    const forgettingCurveData = this.calculateForgettingCurve(
      card.easeFactor,
      optimization.interval
    )
    
    // Predict retention probability
    const predictedRetention = this.predictRetention(
      card,
      optimization.interval,
      forgettingCurveData
    )
    
    // Analyze difficulty trend
    const difficultyTrend = this.analyzeDifficultyTrend(card.performanceHistory)
    
    // Calculate mastery probability
    const masteryProbability = this.calculateMasteryProbability(card, optimization)
    
    // Generate intervention suggestions
    const suggestedInterventions = this.generateInterventions(
      card,
      predictedRetention,
      difficultyTrend
    )
    
    return {
      optimalReviewTime: optimization.nextReview,
      predictedRetention,
      forgettingCurveData,
      difficultyTrend,
      masteryProbability,
      suggestedInterventions
    }
  }

  /**
   * Advanced forgetting curve calculation
   */
  private static calculateForgettingCurve(
    easeFactor: number,
    interval: number
  ): { time: number, retention: number }[] {
    const points: { time: number, retention: number }[] = []
    const stability = interval * easeFactor
    
    for (let day = 0; day <= interval * 2; day++) {
      const retention = Math.exp(-day / stability) * 100
      points.push({ time: day, retention })
    }
    
    return points
  }

  /**
   * Cognitive load balancing to prevent overwhelming
   */
  private static applyCognitiveLoadBalancing(
    interval: number,
    currentDailyLoad: number,
    targetDailyReviews: number
  ): number {
    const loadRatio = currentDailyLoad / targetDailyReviews
    
    if (loadRatio > this.COGNITIVE_LOAD_THRESHOLD) {
      // Spread reviews more evenly
      const adjustment = 1 + (loadRatio - this.COGNITIVE_LOAD_THRESHOLD)
      return Math.round(interval * adjustment)
    }
    
    return interval
  }

  /**
   * Pattern recognition using clustering algorithm
   */
  private static recognizePatterns(
    card: EnhancedSRSCard,
    userHistory: CardHistory[]
  ): number {
    // Find similar cards using cosine similarity
    const similarCards = userHistory
      .filter(h => this.cosineSimilarity(card.contextVector, h.contextVector) > 0.7)
      .slice(0, 10)
    
    if (similarCards.length === 0) return 0
    
    // Analyze performance patterns
    const avgPerformance = similarCards.reduce((sum, c) => 
      sum + c.averageQuality, 0
    ) / similarCards.length
    
    // Return adjustment factor
    return (avgPerformance - 3) * 0.1 // -0.2 to +0.2 adjustment
  }

  /**
   * Time series analysis for performance trends
   */
  private static analyzePerformanceTrends(
    history: PerformanceMetric[]
  ): number {
    if (history.length < 5) return 0
    
    // Calculate moving averages
    const recentAvg = this.movingAverage(history.slice(-5), 'quality')
    const olderAvg = this.movingAverage(history.slice(-10, -5), 'quality')
    
    // Calculate trend
    const trend = (recentAvg - olderAvg) / olderAvg
    
    // Return adjustment based on trend
    return Math.max(-0.3, Math.min(0.3, trend))
  }

  /**
   * Neural network prediction for personalization
   */
  private static neuralNetworkPredict(
    features: number[],
    personalizedFactors: PersonalizedFactors
  ): number {
    // Convert personalized factors to vector
    const factorVector = new Vector([
      personalizedFactors.memoryStrength,
      personalizedFactors.attentionSpan,
      personalizedFactors.motivationLevel,
      personalizedFactors.cognitiveLoad
    ])
    
    // Apply neural network
    const featureVector = new Vector(features)
    const output = this.neuralWeights.multiply(featureVector).add(factorVector)
    
    // Activation function (tanh)
    const activated = output.map((x: number) => Math.tanh(x))
    
    // Return normalized adjustment
    return activated.mean() * 0.2
  }

  /**
   * Analyze peak performance hours from history
   */
  private static analyzePeakPerformanceHours(
    history: PerformanceMetric[]
  ): number[] {
    const hourlyPerformance: { [hour: number]: { total: number, count: number } } = {}
    
    // Aggregate performance by hour
    history.forEach(metric => {
      const hour = new Date(metric.timestamp).getHours()
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { total: 0, count: 0 }
      }
      hourlyPerformance[hour].total += metric.quality
      hourlyPerformance[hour].count++
    })
    
    // Calculate averages and sort
    const hourlyAvg = Object.entries(hourlyPerformance)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        avg: data.total / data.count
      }))
      .sort((a, b) => b.avg - a.avg)
    
    // Return top 3 hours
    return hourlyAvg.slice(0, 3).map(h => h.hour)
  }

  /**
   * Generate personalized recommendations
   */
  private static generateRecommendations(
    card: EnhancedSRSCard,
    insights: PredictiveInsights
  ): string[] {
    const recommendations: string[] = []
    
    // Based on retention prediction
    if (insights.predictedRetention < 60) {
      recommendations.push('Consider reviewing this card more frequently')
      recommendations.push('Try creating mnemonics or associations')
    }
    
    // Based on difficulty trend
    if (insights.difficultyTrend === 'declining') {
      recommendations.push('Break down this concept into smaller parts')
      recommendations.push('Practice with similar, easier examples first')
    }
    
    // Based on mastery probability
    if (insights.masteryProbability > 0.8) {
      recommendations.push('Great progress! Consider advancing to related concepts')
    }
    
    // Based on performance patterns
    if (card.averageTime > 10) {
      recommendations.push('This card takes longer to recall - consider simplifying')
    }
    
    return recommendations
  }

  /**
   * Helper functions
   */
  private static cosineSimilarity(vec1: number[], vec2: number[]): number {
    const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0)
    const mag1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0))
    const mag2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0))
    return dotProduct / (mag1 * mag2)
  }

  private static movingAverage(data: PerformanceMetric[], field: keyof PerformanceMetric): number {
    return data.reduce((sum, item) => sum + (item[field] as number), 0) / data.length
  }

  private static extractFeatures(card: EnhancedSRSCard, context: UserContext): number[] {
    return [
      card.difficulty,
      card.easeFactor / 4.0, // Normalized
      card.correctStreak / 10, // Normalized
      card.averageTime / 30, // Normalized
      context.timeOfDay / 24, // Normalized hour
      context.sessionLength / 60, // Normalized minutes
      context.cardsReviewedToday / 50, // Normalized
      card.totalReviews / 100 // Normalized
    ]
  }

  /**
   * Create performance metric from review result
   */
  private static createPerformanceMetric(result: ReviewResult, context: UserContext): PerformanceMetric {
    return {
      timestamp: new Date(),
      quality: result.quality,
      responseTime: result.responseTime,
      contextualFactors: {
        timeOfDay: context.timeOfDay,
        dayOfWeek: new Date().getDay(),
        sessionLength: context.sessionLength,
        cardsReviewedInSession: context.cardsReviewedToday
      }
    }
  }

  /**
   * Calculate base parameters using standard algorithm
   */
  private static calculateBaseParameters(card: EnhancedSRSCard, result: ReviewResult): SRSUpdateResult {
    const { quality, responseTime, wasCorrect } = result
    
    // Update streaks
    const correctStreak = wasCorrect ? card.correctStreak + 1 : 0
    const wrongStreak = wasCorrect ? 0 : card.wrongStreak + 1
    
    // Calculate new ease factor
    let newEaseFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    newEaseFactor = Math.max(1.3, Math.min(4.0, newEaseFactor))
    
    // Calculate interval
    let interval: number
    let repetitions: number
    
    if (quality < 3) {
      interval = 1
      repetitions = 0
    } else {
      repetitions = card.repetitions + 1
      if (repetitions === 1) {
        interval = 1
      } else if (repetitions === 2) {
        interval = 6
      } else {
        interval = Math.round(card.interval * newEaseFactor)
      }
    }
    
    const nextReview = new Date()
    nextReview.setDate(nextReview.getDate() + interval)
    
    return {
      easeFactor: newEaseFactor,
      interval,
      repetitions,
      nextReview,
      shouldAdvance: quality >= 3,
      confidenceScore: quality / 5
    }
  }

  /**
   * Get optimal time based on circadian rhythm
   */
  private static getCircadianOptimalTime(timezone: string): number[] {
    // Peak cognitive times based on circadian rhythm research
    // Morning: 9-11 AM, Afternoon: 2-4 PM
    return [9, 10, 11, 14, 15, 16]
  }

  /**
   * Find optimal review hour based on multiple factors
   */
  private static findOptimalReviewHour(
    peakHours: number[],
    circadianOptimal: number[],
    availability: number[]
  ): number {
    // Find intersection of all optimal times
    const optimal = peakHours.filter(hour => 
      circadianOptimal.includes(hour) && availability.includes(hour)
    )
    
    // Fallback to best available
    return optimal.length > 0 ? optimal[0] : availability[0] || 10
  }

  /**
   * Check if review date is suboptimal (weekends, holidays)
   */
  private static isSuboptimalDay(date: Date, context: UserContext): boolean {
    const dayOfWeek = date.getDay()
    // Check if weekend (0 = Sunday, 6 = Saturday)
    return dayOfWeek === 0 || dayOfWeek === 6
  }

  /**
   * Get date adjustment for suboptimal days
   */
  private static getDateAdjustment(date: Date, context: UserContext): number {
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 6) return 2 // Saturday -> Monday
    if (dayOfWeek === 0) return 1 // Sunday -> Monday
    return 0
  }

  /**
   * Predict retention based on forgetting curve
   */
  private static predictRetention(
    card: EnhancedSRSCard,
    interval: number,
    forgettingCurve: { time: number, retention: number }[]
  ): number {
    // Find retention at interval
    const point = forgettingCurve.find(p => p.time === interval)
    return point ? point.retention : 50
  }

  /**
   * Analyze difficulty trend from performance history
   */
  private static analyzeDifficultyTrend(history: PerformanceMetric[]): 'improving' | 'stable' | 'declining' {
    if (history.length < 5) return 'stable'
    
    const recentQuality = history.slice(-5).reduce((sum, m) => sum + m.quality, 0) / 5
    const olderQuality = history.slice(-10, -5).reduce((sum, m) => sum + m.quality, 0) / 5
    
    const trend = recentQuality - olderQuality
    
    if (trend > 0.5) return 'improving'
    if (trend < -0.5) return 'declining'
    return 'stable'
  }

  /**
   * Calculate mastery probability
   */
  private static calculateMasteryProbability(card: EnhancedSRSCard, optimization: SRSUpdateResult): number {
    const factors = [
      card.correctStreak / 10, // Streak factor
      optimization.easeFactor / 4.0, // Ease factor
      Math.min(card.totalReviews / 20, 1), // Review count factor
      optimization.interval >= 30 ? 1 : optimization.interval / 30 // Interval factor
    ]
    
    return factors.reduce((sum, f) => sum + f, 0) / factors.length
  }

  /**
   * Generate intervention suggestions
   */
  private static generateInterventions(
    card: EnhancedSRSCard,
    predictedRetention: number,
    difficultyTrend: 'improving' | 'stable' | 'declining'
  ): string[] {
    const interventions: string[] = []
    
    if (predictedRetention < 50) {
      interventions.push('Add visual mnemonics or memory palace associations')
      interventions.push('Practice with spaced micro-reviews throughout the day')
    }
    
    if (difficultyTrend === 'declining') {
      interventions.push('Review prerequisite concepts')
      interventions.push('Use the Feynman technique - explain to someone else')
    }
    
    if (card.averageTime > 15) {
      interventions.push('Break down into smaller sub-concepts')
      interventions.push('Create quick recall triggers')
    }
    
    return interventions
  }
}

// Supporting interfaces
export interface ReviewResult {
  quality: number
  responseTime: number
  wasCorrect: boolean
  confidence: number
  hintsUsed: number
}

export interface UserContext {
  userId: string
  timezone: string
  timeOfDay: number
  sessionLength: number
  cardsReviewedToday: number
  dailyReviewLoad: number
  targetDailyReviews: number
  availability: number[]
  userHistory: CardHistory[]
}

export interface CardHistory {
  cardId: string
  contextVector: number[]
  averageQuality: number
  totalReviews: number
}

export interface EnhancedSRSUpdateResult extends SRSUpdateResult {
  insights: PredictiveInsights
  recommendedActions: string[]
  optimalReviewTime: Date
}

export interface SRSUpdateResult {
  easeFactor: number
  interval: number
  repetitions: number
  nextReview: Date
  shouldAdvance: boolean
  confidenceScore: number
}