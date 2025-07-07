// Adaptive Learning System for Shona App
// Implements personalized learning paths with 480+ vocabulary items and 38 lessons

export interface UserProfile {
  id: string
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  interests: string[]
  pace: 'slow' | 'moderate' | 'fast'
  culturalBackground: 'diaspora' | 'zimbabwe' | 'heritage_seeker' | 'other'
  challenges: ('tones' | 'pronunciation' | 'memory' | 'grammar' | 'speaking')[]
  preferredDifficulty: number
  availableTime: number // minutes per session
  goals: ('communication' | 'culture' | 'business' | 'family' | 'academic')[]
  currentLevel: number
  xp: number
  streak: number
}

export interface LearningItem {
  id: string
  type: 'vocabulary' | 'lesson' | 'exercise' | 'review'
  content: any
  difficulty: number
  category: string
  estimatedTime: number
  prerequisites: string[]
  culturalContext: string
  tonePattern?: string
  audioAvailable: boolean
}

export interface Performance {
  itemId: string
  userId: string
  attempts: number
  correctAnswers: number
  averageTime: number
  lastAttempted: Date
  masteryLevel: number // 0-1
  difficultyAdjustment: number
}

export interface AdaptiveRecommendation {
  item: LearningItem
  reason: string
  urgency: 'low' | 'medium' | 'high'
  expectedDuration: number
  culturalRelevance: number
}

export class AdaptiveLearningEngine {
  private userProfile: UserProfile
  private performanceHistory: Performance[]

  constructor(userProfile: UserProfile, performanceHistory: Performance[]) {
    this.userProfile = userProfile
    this.performanceHistory = performanceHistory
  }

  /**
   * Main algorithm to calculate next learning items
   * Considers: success rate, spaced repetition, user preferences, cultural interests
   */
  calculateNextItems(availableItems: LearningItem[], sessionLength: number = 20): AdaptiveRecommendation[] {
    const recommendations: AdaptiveRecommendation[] = []
    let totalTime = 0

    // 1. Priority items (urgent reviews, struggling areas)
    const priorityItems = this.getPriorityItems(availableItems)
    
    // 2. New content based on readiness and interests
    const newContentItems = this.getNewContentItems(availableItems)
    
    // 3. Reinforcement items (recently learned but need practice)
    const reinforcementItems = this.getReinforcementItems(availableItems)

    // Blend items based on learning science principles
    const blendedItems = this.blendLearningItems(priorityItems, newContentItems, reinforcementItems)

    for (const item of blendedItems) {
      if (totalTime + item.estimatedTime <= sessionLength) {
        const recommendation = this.createRecommendation(item)
        recommendations.push(recommendation)
        totalTime += item.estimatedTime
      } else {
        break
      }
    }

    return this.personalizeRecommendations(recommendations)
  }

  /**
   * Adjust difficulty based on performance patterns
   */
  adjustDifficulty(itemId: string, performance: Performance): number {
    const item = this.performanceHistory.find(p => p.itemId === itemId)
    if (!item) return 0

    const successRate = item.correctAnswers / item.attempts
    const timeEfficiency = this.calculateTimeEfficiency(item)
    
    let adjustment = 0

    // Success-based adjustment
    if (successRate >= 0.9 && timeEfficiency > 0.8) {
      adjustment = 1 // Increase difficulty
    } else if (successRate <= 0.6 || timeEfficiency < 0.4) {
      adjustment = -1 // Decrease difficulty
    }

    // User preference consideration
    if (this.userProfile.preferredDifficulty > 7 && adjustment > 0) {
      adjustment += 0.5 // More aggressive for challenge seekers
    }

    return adjustment
  }

  private getPriorityItems(availableItems: LearningItem[]): LearningItem[] {
    return availableItems.filter(item => {
      const performance = this.performanceHistory.find(p => p.itemId === item.id)
      if (!performance) return false

      // Items due for spaced repetition
      const isDueForReview = this.isItemDueForReview(item.id)
      
      // Items with low mastery that user has attempted
      const needsWork = performance.masteryLevel < 0.7 && performance.attempts > 0
      
      // Items matching user's challenge areas
      const addressesChallenges = this.addressesUserChallenges(item)

      return isDueForReview || needsWork || addressesChallenges
    }).sort((a, b) => this.calculatePriority(b) - this.calculatePriority(a))
  }

  private getNewContentItems(availableItems: LearningItem[]): LearningItem[] {
    return availableItems.filter(item => {
      // Not yet attempted
      const notAttempted = !this.performanceHistory.find(p => p.itemId === item.id)
      
      // Prerequisites met
      const prerequisitesMet = this.checkPrerequisites(item)
      
      // Appropriate difficulty
      const appropriateDifficulty = this.isAppropriateDifficulty(item)
      
      // Matches interests
      const matchesInterests = this.matchesUserInterests(item)

      return notAttempted && prerequisitesMet && appropriateDifficulty && matchesInterests
    }).sort((a, b) => this.calculateInterestScore(b) - this.calculateInterestScore(a))
  }

  private getReinforcementItems(availableItems: LearningItem[]): LearningItem[] {
    return availableItems.filter(item => {
      const performance = this.performanceHistory.find(p => p.itemId === item.id)
      if (!performance) return false

      // Recently learned (within last week) with good but not perfect mastery
      const recentlyLearned = this.isRecentlyLearned(performance)
      const goodMastery = performance.masteryLevel >= 0.7 && performance.masteryLevel < 0.95

      return recentlyLearned && goodMastery
    })
  }

  private blendLearningItems(priority: LearningItem[], newContent: LearningItem[], reinforcement: LearningItem[]): LearningItem[] {
    const blended: LearningItem[] = []
    
    // Interleaving pattern for optimal learning
    // 40% priority, 40% new content, 20% reinforcement
    const maxItems = 10
    const priorityCount = Math.min(Math.ceil(maxItems * 0.4), priority.length)
    const newContentCount = Math.min(Math.ceil(maxItems * 0.4), newContent.length)
    const reinforcementCount = Math.min(Math.ceil(maxItems * 0.2), reinforcement.length)

    // Interleave items for better retention
    for (let i = 0; i < Math.max(priorityCount, newContentCount, reinforcementCount); i++) {
      if (i < priorityCount) blended.push(priority[i])
      if (i < newContentCount) blended.push(newContent[i])
      if (i < reinforcementCount) blended.push(reinforcement[i])
    }

    return blended.slice(0, maxItems)
  }

  private createRecommendation(item: LearningItem): AdaptiveRecommendation {
    const performance = this.performanceHistory.find(p => p.itemId === item.id)
    let reason = ''
    let urgency: 'low' | 'medium' | 'high' = 'medium'

    if (performance) {
      if (performance.masteryLevel < 0.5) {
        reason = 'Needs more practice to build confidence'
        urgency = 'high'
      } else if (this.isItemDueForReview(item.id)) {
        reason = 'Due for spaced repetition review'
        urgency = 'medium'
      } else {
        reason = 'Reinforcement practice recommended'
        urgency = 'low'
      }
    } else {
      reason = this.getNewContentReason(item)
      urgency = 'medium'
    }

    return {
      item,
      reason,
      urgency,
      expectedDuration: this.estimateSessionDuration(item),
      culturalRelevance: this.calculateCulturalRelevance(item)
    }
  }

  private personalizeRecommendations(recommendations: AdaptiveRecommendation[]): AdaptiveRecommendation[] {
    return recommendations.map(rec => {
      // Adjust based on learning style
      if (this.userProfile.learningStyle === 'auditory' && !rec.item.audioAvailable) {
        rec.reason += ' (Audio will be emphasized)'
      }

      // Adjust based on cultural background
      if (this.userProfile.culturalBackground === 'heritage_seeker' && rec.culturalRelevance > 0.7) {
        rec.reason += ' (High cultural relevance for heritage connection)'
      }

      return rec
    })
  }

  // Helper methods
  private isItemDueForReview(itemId: string): boolean {
    const performance = this.performanceHistory.find(p => p.itemId === itemId)
    if (!performance) return false

    const daysSinceLastAttempt = (Date.now() - performance.lastAttempted.getTime()) / (1000 * 60 * 60 * 24)
    const intervalDays = this.calculateSpacedRepetitionInterval(performance)
    
    return daysSinceLastAttempt >= intervalDays
  }

  private calculateSpacedRepetitionInterval(performance: Performance): number {
    // Enhanced SM-2 algorithm for Shona-specific challenges
    const baseDays = [1, 3, 7, 14, 30, 90]
    const attemptIndex = Math.min(performance.attempts - 1, baseDays.length - 1)
    let interval = baseDays[attemptIndex]

    // Adjust for performance
    const successRate = performance.correctAnswers / performance.attempts
    if (successRate >= 0.9) {
      interval *= 1.3 // Increase interval for well-known items
    } else if (successRate <= 0.6) {
      interval *= 0.6 // Decrease interval for struggling items
    }

    // Shona-specific adjustments
    if (this.userProfile.challenges.includes('tones')) {
      interval *= 0.8 // More frequent review for tone challenges
    }

    return Math.ceil(interval)
  }

  private checkPrerequisites(item: LearningItem): boolean {
    if (!item.prerequisites || item.prerequisites.length === 0) return true

    return item.prerequisites.every(prereqId => {
      const prereqPerformance = this.performanceHistory.find(p => p.itemId === prereqId)
      return prereqPerformance && prereqPerformance.masteryLevel >= 0.7
    })
  }

  private isAppropriateDifficulty(item: LearningItem): boolean {
    const userLevel = this.calculateUserLevel()
    const difficultyRange = this.getDifficultyRange()
    
    return item.difficulty >= difficultyRange.min && item.difficulty <= difficultyRange.max
  }

  private matchesUserInterests(item: LearningItem): boolean {
    return this.userProfile.interests.some(interest => 
      item.category.toLowerCase().includes(interest.toLowerCase()) ||
      item.culturalContext.toLowerCase().includes(interest.toLowerCase())
    )
  }

  private calculateUserLevel(): number {
    // Calculate based on XP, completed items, and average performance
    const baseLevel = Math.floor(this.userProfile.xp / 100) + 1
    const averageMastery = this.getAverageMastery()
    
    return Math.min(10, Math.max(1, baseLevel + Math.floor((averageMastery - 0.5) * 4)))
  }

  private getDifficultyRange(): { min: number, max: number } {
    const userLevel = this.calculateUserLevel()
    const paceMultiplier = this.userProfile.pace === 'fast' ? 1.2 : this.userProfile.pace === 'slow' ? 0.8 : 1

    return {
      min: Math.max(1, Math.floor((userLevel - 1) * paceMultiplier)),
      max: Math.min(10, Math.ceil((userLevel + 1) * paceMultiplier))
    }
  }

  private getAverageMastery(): number {
    if (this.performanceHistory.length === 0) return 0.5
    
    const totalMastery = this.performanceHistory.reduce((sum, p) => sum + p.masteryLevel, 0)
    return totalMastery / this.performanceHistory.length
  }

  private calculatePriority(item: LearningItem): number {
    const performance = this.performanceHistory.find(p => p.itemId === item.id)
    if (!performance) return 0

    let priority = 0

    // Urgency based on spaced repetition
    if (this.isItemDueForReview(item.id)) priority += 10

    // Performance-based priority
    if (performance.masteryLevel < 0.5) priority += 8
    else if (performance.masteryLevel < 0.7) priority += 5

    // Challenge area priority
    if (this.addressesUserChallenges(item)) priority += 6

    return priority
  }

  private addressesUserChallenges(item: LearningItem): boolean {
    return this.userProfile.challenges.some(challenge => {
      switch (challenge) {
        case 'tones':
          return item.tonePattern !== undefined
        case 'pronunciation':
          return item.audioAvailable && item.type === 'vocabulary'
        case 'memory':
          return item.type === 'review'
        case 'grammar':
          return item.category.includes('grammar') || item.type === 'lesson'
        case 'speaking':
          return item.audioAvailable && item.type === 'exercise'
        default:
          return false
      }
    })
  }

  private calculateInterestScore(item: LearningItem): number {
    let score = 0

    // Interest matching
    if (this.matchesUserInterests(item)) score += 5

    // Cultural relevance for heritage seekers
    if (this.userProfile.culturalBackground === 'heritage_seeker') {
      score += this.calculateCulturalRelevance(item) * 3
    }

    // Goal alignment
    this.userProfile.goals.forEach(goal => {
      if (this.itemAlignWithGoal(item, goal)) score += 2
    })

    return score
  }

  private itemAlignWithGoal(item: LearningItem, goal: string): boolean {
    const goalMappings: { [key: string]: string[] } = {
      communication: ['greetings', 'conversation', 'practical'],
      culture: ['cultural', 'traditional', 'proverbs'],
      business: ['professional', 'formal', 'business'],
      family: ['family', 'relationships', 'kinship'],
      academic: ['grammar', 'advanced', 'literature']
    }

    const keywords = goalMappings[goal] || []
    return keywords.some((keyword: string) => 
      item.category.toLowerCase().includes(keyword) ||
      item.culturalContext.toLowerCase().includes(keyword)
    )
  }

  private calculateCulturalRelevance(item: LearningItem): number {
    // Score 0-1 based on cultural content richness
    let relevance = 0

    if (item.culturalContext && item.culturalContext.length > 0) relevance += 0.3
    if (item.category.includes('cultural') || item.category.includes('traditional')) relevance += 0.4
    if (item.type === 'lesson' && item.content?.culturalNotes) relevance += 0.3

    return Math.min(1, relevance)
  }

  private calculateTimeEfficiency(performance: Performance): number {
    // Compare user's time to expected time
    const expectedTime = 30 // seconds, baseline
    return Math.min(1, expectedTime / performance.averageTime)
  }

  private isRecentlyLearned(performance: Performance): boolean {
    const daysSinceFirst = (Date.now() - performance.lastAttempted.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceFirst <= 7
  }

  private getNewContentReason(item: LearningItem): string {
    if (this.matchesUserInterests(item)) {
      return `Matches your interest in ${item.category}`
    }
    if (this.calculateCulturalRelevance(item) > 0.7) {
      return 'High cultural relevance for your learning goals'
    }
    return 'Next logical step in your learning progression'
  }

  private estimateSessionDuration(item: LearningItem): number {
    let baseDuration = item.estimatedTime

    // Adjust for user's learning style and pace
    if (this.userProfile.pace === 'slow') baseDuration *= 1.3
    else if (this.userProfile.pace === 'fast') baseDuration *= 0.8

    // Adjust for difficulty relative to user level
    const userLevel = this.calculateUserLevel()
    if (item.difficulty > userLevel + 1) baseDuration *= 1.2
    else if (item.difficulty < userLevel - 1) baseDuration *= 0.9

    return Math.ceil(baseDuration)
  }
}

export default AdaptiveLearningEngine