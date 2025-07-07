// Progress Analytics Dashboard for Shona Adaptive Learning System
// Comprehensive insights combining all learning components

import AdaptiveLearningEngine, { UserProfile, LearningItem, Performance } from './adaptive-learning'
import ShonaSpacedRepetition, { SRSCard } from './spaced-repetition-enhanced'
import LearningPathEngine, { LearningPath } from './learning-paths'
import PrerequisiteSystem from './prerequisite-system'
import EnhancedMotivationEngine, { UserMotivationState, BaobabTreeProgress } from './enhanced-motivation-system'

export interface ProgressAnalytics {
  userId: string
  generatedAt: Date
  
  // Overview metrics
  overallProgress: number // 0-100
  currentLevel: number // 1-10
  xpTotal: number
  daysSinceStart: number
  
  // Learning efficiency
  averageSessionLength: number
  learningVelocity: number // items mastered per hour
  retentionRate: number // how well user remembers
  difficultyAdaptation: number // how well system adapts to user
  
  // Skill breakdown
  skillAreas: SkillAreaProgress[]
  strongestSkills: string[]
  improvementAreas: string[]
  
  // Adaptive system effectiveness
  adaptiveRecommendationAccuracy: number
  userSatisfactionWithRecommendations: number
  systemPersonalizationLevel: number
  
  // Cultural and motivation aspects
  culturalEngagement: number
  motivationHealthScore: number
  socialLearningParticipation: number
  
  // Predictive insights
  projectedCompletionDate: Date
  riskFactors: string[]
  optimizationOpportunities: string[]
  
  // Detailed breakdowns
  vocabularyAnalytics: VocabularyAnalytics
  pronunciationAnalytics: PronunciationAnalytics
  culturalAnalytics: CulturalAnalytics
  socialAnalytics: SocialAnalytics
  pathAnalytics: PathAnalytics
}

export interface SkillAreaProgress {
  skill: string
  currentLevel: number // 1-10
  progress: number // 0-100 within current level
  masteredItems: number
  totalItems: number
  recentTrend: 'improving' | 'stable' | 'declining'
  estimatedTimeToNextLevel: number // hours
  culturalRelevance: number // 1-10
}

export interface VocabularyAnalytics {
  totalWords: number
  masteredWords: number
  wordsInReview: number
  newWordsThisWeek: number
  
  // Difficulty distribution
  difficultyDistribution: { [level: number]: number }
  averageMasteryTime: number // minutes per word
  
  // Categories
  categoryProgress: Array<{
    category: string
    mastered: number
    total: number
    culturalSignificance: number
  }>
  
  // Retention patterns
  forgettingCurve: Array<{ days: number, retentionRate: number }>
  optimalReviewInterval: number
  
  // Shona-specific metrics
  toneAccuracy: number
  phoneticProgress: number
  whistledSoundsProgress: number
}

export interface PronunciationAnalytics {
  overallAccuracy: number
  toneAccuracy: number
  consonantAccuracy: number
  vowelAccuracy: number
  
  // Specific challenges
  challengingSounds: string[]
  masteredSounds: string[]
  
  // Progress tracking
  weeklyProgress: Array<{ week: Date, accuracy: number }>
  practiceMinutesThisWeek: number
  
  // Cultural pronunciation
  culturalContextAccuracy: number
  respectMarkerUsage: number
}

export interface CulturalAnalytics {
  culturalUnderstanding: number // 1-10
  traditionalConcepts: number
  modernConcepts: number
  
  // Engagement metrics
  culturalLessonsCompleted: number
  culturalStoriesRead: number
  proverbsLearned: number
  
  // Heritage connection (for diaspora learners)
  heritageConnectionStrength: number
  ancestralWisdomEngagement: number
  
  // Community cultural participation
  culturalDiscussions: number
  culturalEventParticipation: number
}

export interface SocialAnalytics {
  communityRank: number
  helpGiven: number
  helpReceived: number
  studyGroupParticipation: number
  
  // Network effects
  learningNetworkSize: number
  averageNetworkProgress: number
  socialMotivationBoost: number
  
  // Cultural community
  culturalMentorshipGiven: number
  culturalMentorshipReceived: number
}

export interface PathAnalytics {
  currentPath: string
  pathProgress: number // 0-100
  pathOptimality: number // how well path fits user
  
  // Milestones
  milestonesReached: number
  totalMilestones: number
  nextMilestone: string
  
  // Adaptive adjustments
  pathAdjustmentsMade: number
  userSatisfactionWithPath: number
  
  // Completion estimates
  estimatedCompletionWeeks: number
  confidenceInterval: number
}

export interface InsightCard {
  id: string
  type: 'celebration' | 'improvement' | 'recommendation' | 'prediction' | 'cultural'
  title: string
  description: string
  actionable: boolean
  actionText?: string
  importance: 'low' | 'medium' | 'high'
  culturalWisdom?: string
  
  // Visual elements
  icon: string
  color: string
  animation?: string
  
  // Data backing
  dataPoints: Array<{ label: string, value: number | string }>
  trend?: 'up' | 'down' | 'stable'
}

export class ProgressAnalyticsDashboard {
  private adaptiveEngine: AdaptiveLearningEngine
  private srsSystem: ShonaSpacedRepetition
  private pathEngine: LearningPathEngine
  private prerequisiteSystem: PrerequisiteSystem
  private motivationEngine: EnhancedMotivationEngine

  constructor(
    adaptiveEngine: AdaptiveLearningEngine,
    srsSystem: ShonaSpacedRepetition,
    pathEngine: LearningPathEngine,
    prerequisiteSystem: PrerequisiteSystem,
    motivationEngine: EnhancedMotivationEngine
  ) {
    this.adaptiveEngine = adaptiveEngine
    this.srsSystem = srsSystem
    this.pathEngine = pathEngine
    this.prerequisiteSystem = prerequisiteSystem
    this.motivationEngine = motivationEngine
  }

  /**
   * Generate comprehensive progress analytics for a user
   */
  generateAnalytics(
    userId: string,
    userProfile: UserProfile,
    learningHistory: Performance[],
    srsCards: SRSCard[],
    currentPath: LearningPath
  ): ProgressAnalytics {
    
    const startTime = Date.now()
    
    // Calculate overview metrics
    const overallProgress = this.calculateOverallProgress(learningHistory, userProfile)
    const currentLevel = this.calculateCurrentLevel(userProfile, learningHistory)
    const daysSinceStart = this.calculateDaysSinceStart(learningHistory)
    
    // Learning efficiency metrics
    const learningEfficiency = this.calculateLearningEfficiency(learningHistory)
    
    // Skill area analysis
    const skillAreas = this.analyzeSkillAreas(learningHistory, srsCards)
    
    // Detailed analytics
    const vocabularyAnalytics = this.generateVocabularyAnalytics(learningHistory, srsCards)
    const pronunciationAnalytics = this.generatePronunciationAnalytics(learningHistory)
    const culturalAnalytics = this.generateCulturalAnalytics(userId, learningHistory)
    const socialAnalytics = this.generateSocialAnalytics(userId)
    const pathAnalytics = this.generatePathAnalytics(userId, currentPath)
    
    // Motivation and cultural aspects
    const motivationState = this.motivationEngine.getMotivationAnalytics(userId)
    
    // Predictive insights
    const predictions = this.generatePredictiveInsights(
      learningHistory, 
      userProfile, 
      motivationState
    )
    
    const analytics: ProgressAnalytics = {
      userId,
      generatedAt: new Date(),
      
      // Overview
      overallProgress,
      currentLevel,
      xpTotal: userProfile.xp,
      daysSinceStart,
      
      // Efficiency
      averageSessionLength: learningEfficiency.averageSessionLength,
      learningVelocity: learningEfficiency.velocity,
      retentionRate: learningEfficiency.retentionRate,
      difficultyAdaptation: learningEfficiency.adaptationScore,
      
      // Skills
      skillAreas,
      strongestSkills: skillAreas
        .sort((a, b) => b.currentLevel - a.currentLevel)
        .slice(0, 3)
        .map(s => s.skill),
      improvementAreas: skillAreas
        .filter(s => s.recentTrend === 'declining' || s.currentLevel < 5)
        .map(s => s.skill),
      
      // Adaptive system
      adaptiveRecommendationAccuracy: this.calculateRecommendationAccuracy(learningHistory),
      userSatisfactionWithRecommendations: 0.8, // Would come from user feedback
      systemPersonalizationLevel: this.calculatePersonalizationLevel(userProfile),
      
      // Cultural and motivation
      culturalEngagement: culturalAnalytics.culturalUnderstanding,
      motivationHealthScore: motivationState.overallMotivation,
      socialLearningParticipation: socialAnalytics.studyGroupParticipation,
      
      // Predictions
      projectedCompletionDate: predictions.completionDate,
      riskFactors: predictions.riskFactors,
      optimizationOpportunities: predictions.opportunities,
      
      // Detailed breakdowns
      vocabularyAnalytics,
      pronunciationAnalytics,
      culturalAnalytics,
      socialAnalytics,
      pathAnalytics
    }
    
    console.log(`Analytics generated in ${Date.now() - startTime}ms`)
    return analytics
  }

  /**
   * Generate actionable insight cards for the user
   */
  generateInsightCards(analytics: ProgressAnalytics, userProfile: UserProfile): InsightCard[] {
    const insights: InsightCard[] = []
    
    // Celebration insights
    if (analytics.overallProgress > 0) {
      insights.push(this.createCelebrationInsight(analytics))
    }
    
    // Improvement opportunities
    if (analytics.improvementAreas.length > 0) {
      insights.push(this.createImprovementInsight(analytics))
    }
    
    // Cultural connection insights
    if (userProfile.culturalBackground === 'heritage_seeker') {
      insights.push(this.createCulturalInsight(analytics))
    }
    
    // Learning efficiency insights
    if (analytics.learningVelocity < 0.5) {
      insights.push(this.createEfficiencyInsight(analytics))
    }
    
    // Social learning insights
    if (analytics.socialLearningParticipation < 3) {
      insights.push(this.createSocialInsight(analytics))
    }
    
    // Predictive insights
    if (analytics.riskFactors.length > 0) {
      insights.push(this.createRiskMitigationInsight(analytics))
    }
    
    // Achievement insights
    insights.push(this.createAchievementInsight(analytics))
    
    return insights.slice(0, 6) // Limit to most relevant insights
  }

  /**
   * Generate weekly progress report
   */
  generateWeeklyReport(userId: string, weekData: any): {
    summary: string
    achievements: string[]
    focusAreas: string[]
    culturalHighlights: string[]
    nextWeekGoals: string[]
    motivationalMessage: string
  } {
    return {
      summary: `This week you mastered ${weekData.newWords} new words and maintained a ${weekData.streak}-day learning streak.`,
      achievements: [
        'Completed 5 pronunciation exercises',
        'Learned 8 family relationship terms',
        'Achieved 85% accuracy in tone recognition'
      ],
      focusAreas: [
        'Practice whistled consonants (sv, zv sounds)',
        'Review cultural context for respect markers',
        'Strengthen number vocabulary for market scenarios'
      ],
      culturalHighlights: [
        'Discovered the meaning of Ubuntu philosophy',
        'Learned traditional greeting variations',
        'Explored the significance of totems in Shona culture'
      ],
      nextWeekGoals: [
        'Master 10 new vocabulary words',
        'Complete cultural lesson on traditional ceremonies',
        'Practice conversational scenarios'
      ],
      motivationalMessage: 'Kurima kwese kune mabvumira - every cultivation has its seasons. Your dedication is like preparing fertile ground for the rich harvest of fluency ahead.'
    }
  }

  /**
   * Generate comparative analytics (user vs. similar learners)
   */
  generateComparativeAnalytics(analytics: ProgressAnalytics, userProfile: UserProfile): {
    progressVsAverage: number // ratio to average progress
    strengthsVsPeers: string[]
    areasForImprovement: string[]
    rankInCohort: number
    cohortSize: number
  } {
    // This would use actual cohort data in practice
    return {
      progressVsAverage: 1.2, // 20% above average
      strengthsVsPeers: ['Cultural understanding', 'Pronunciation accuracy'],
      areasForImprovement: ['Social engagement', 'Conversation practice'],
      rankInCohort: 15,
      cohortSize: 100
    }
  }

  // Private helper methods for calculations

  private calculateOverallProgress(history: Performance[], profile: UserProfile): number {
    if (history.length === 0) return 0
    
    const totalAttempts = history.reduce((sum, p) => sum + p.attempts, 0)
    const totalCorrect = history.reduce((sum, p) => sum + p.correctAnswers, 0)
    const averageMastery = history.reduce((sum, p) => sum + p.masteryLevel, 0) / history.length
    
    // Combine accuracy and mastery for overall progress
    const accuracy = totalCorrect / totalAttempts
    return Math.min(100, (accuracy * 40) + (averageMastery * 60))
  }

  private calculateCurrentLevel(profile: UserProfile, history: Performance[]): number {
    // Calculate level based on XP, mastery, and content difficulty
    const baseLevel = Math.floor(profile.xp / 100) + 1
    const masteryBonus = this.getAverageMastery(history) * 2
    return Math.min(10, Math.max(1, baseLevel + Math.floor(masteryBonus)))
  }

  private calculateDaysSinceStart(history: Performance[]): number {
    if (history.length === 0) return 0
    
    const earliestAttempt = Math.min(...history.map(p => p.lastAttempted.getTime()))
    return Math.floor((Date.now() - earliestAttempt) / (1000 * 60 * 60 * 24))
  }

  private calculateLearningEfficiency(history: Performance[]): {
    averageSessionLength: number
    velocity: number
    retentionRate: number
    adaptationScore: number
  } {
    if (history.length === 0) {
      return { averageSessionLength: 0, velocity: 0, retentionRate: 0, adaptationScore: 0 }
    }
    
    const averageTime = history.reduce((sum, p) => sum + p.averageTime, 0) / history.length
    const averageMastery = this.getAverageMastery(history)
    const velocity = averageMastery / (averageTime / 60) // mastery per minute
    
    // Retention rate based on how well items are remembered over time
    const retentionRate = this.calculateRetentionRate(history)
    
    // Adaptation score based on difficulty adjustments
    const adaptationScore = this.calculateAdaptationScore(history)
    
    return {
      averageSessionLength: averageTime,
      velocity: velocity * 60, // per hour
      retentionRate,
      adaptationScore
    }
  }

  private analyzeSkillAreas(history: Performance[], srsCards: SRSCard[]): SkillAreaProgress[] {
    const skillAreas = ['vocabulary', 'pronunciation', 'grammar', 'culture', 'conversation']
    
    return skillAreas.map(skill => {
      const skillHistory = history.filter(h => this.isSkillItem(h, skill))
      const skillCards = srsCards.filter(c => this.isSkillCard(c, skill))
      
      const currentLevel = this.calculateSkillLevel(skillHistory)
      const progress = this.calculateSkillProgress(skillHistory, skillCards)
      const trend = this.calculateSkillTrend(skillHistory)
      
      return {
        skill,
        currentLevel,
        progress,
        masteredItems: skillHistory.filter(h => h.masteryLevel >= 0.8).length,
        totalItems: skillHistory.length + skillCards.length,
        recentTrend: trend,
        estimatedTimeToNextLevel: this.estimateTimeToNextLevel(skillHistory),
        culturalRelevance: this.getSkillCulturalRelevance(skill)
      }
    })
  }

  private generateVocabularyAnalytics(history: Performance[], srsCards: SRSCard[]): VocabularyAnalytics {
    const vocabHistory = history.filter(h => this.isVocabularyItem(h))
    const vocabCards = srsCards.filter(c => c.contentType === 'vocabulary')
    
    const totalWords = vocabHistory.length + vocabCards.length
    const masteredWords = vocabHistory.filter(h => h.masteryLevel >= 0.8).length
    const wordsInReview = vocabCards.filter(c => c.repetition > 0 && c.repetition < 3).length
    
    return {
      totalWords,
      masteredWords,
      wordsInReview,
      newWordsThisWeek: this.countNewWordsThisWeek(vocabHistory),
      difficultyDistribution: this.calculateDifficultyDistribution(vocabHistory),
      averageMasteryTime: this.calculateAverageMasteryTime(vocabHistory),
      categoryProgress: this.calculateCategoryProgress(vocabHistory),
      forgettingCurve: this.calculateForgettingCurve(vocabCards),
      optimalReviewInterval: this.calculateOptimalReviewInterval(vocabCards),
      toneAccuracy: this.calculateToneAccuracy(vocabHistory),
      phoneticProgress: this.calculatePhoneticProgress(vocabHistory),
      whistledSoundsProgress: this.calculateWhistledSoundsProgress(vocabHistory)
    }
  }

  private generatePronunciationAnalytics(history: Performance[]): PronunciationAnalytics {
    const pronunciationHistory = history.filter(h => this.isPronunciationItem(h))
    
    return {
      overallAccuracy: this.calculateOverallPronunciationAccuracy(pronunciationHistory),
      toneAccuracy: this.calculateToneAccuracy(pronunciationHistory),
      consonantAccuracy: this.calculateConsonantAccuracy(pronunciationHistory),
      vowelAccuracy: this.calculateVowelAccuracy(pronunciationHistory),
      challengingSounds: this.identifyChallengingSounds(pronunciationHistory),
      masteredSounds: this.identifyMasteredSounds(pronunciationHistory),
      weeklyProgress: this.calculateWeeklyPronunciationProgress(pronunciationHistory),
      practiceMinutesThisWeek: this.calculatePracticeMinutes(pronunciationHistory),
      culturalContextAccuracy: this.calculateCulturalContextAccuracy(pronunciationHistory),
      respectMarkerUsage: this.calculateRespectMarkerUsage(pronunciationHistory)
    }
  }

  private generateCulturalAnalytics(userId: string, history: Performance[]): CulturalAnalytics {
    const culturalHistory = history.filter(h => this.isCulturalItem(h))
    
    return {
      culturalUnderstanding: this.calculateCulturalUnderstanding(culturalHistory),
      traditionalConcepts: this.countTraditionalConcepts(culturalHistory),
      modernConcepts: this.countModernConcepts(culturalHistory),
      culturalLessonsCompleted: this.countCulturalLessons(culturalHistory),
      culturalStoriesRead: this.countCulturalStories(userId),
      proverbsLearned: this.countProverbsLearned(culturalHistory),
      heritageConnectionStrength: this.calculateHeritageConnection(userId),
      ancestralWisdomEngagement: this.calculateAncestralWisdomEngagement(culturalHistory),
      culturalDiscussions: this.countCulturalDiscussions(userId),
      culturalEventParticipation: this.countCulturalEventParticipation(userId)
    }
  }

  private generateSocialAnalytics(userId: string): SocialAnalytics {
    // This would use actual social data in practice
    return {
      communityRank: 45,
      helpGiven: 3,
      helpReceived: 7,
      studyGroupParticipation: 2,
      learningNetworkSize: 12,
      averageNetworkProgress: 67,
      socialMotivationBoost: 15,
      culturalMentorshipGiven: 1,
      culturalMentorshipReceived: 2
    }
  }

  private generatePathAnalytics(userId: string, currentPath: LearningPath): PathAnalytics {
    const progress = this.pathEngine.calculateProgress(currentPath.id, []) // Would pass actual completed content
    
    return {
      currentPath: currentPath.name,
      pathProgress: progress.overallProgress * 100,
      pathOptimality: this.calculatePathOptimality(currentPath, userId),
      milestonesReached: 3, // Would calculate from actual data
      totalMilestones: 8,
      nextMilestone: progress.nextMilestone?.name || 'None',
      pathAdjustmentsMade: 2,
      userSatisfactionWithPath: 8.5,
      estimatedCompletionWeeks: Math.ceil(progress.estimatedTimeRemaining / (60 * 7)), // Convert minutes to weeks
      confidenceInterval: 0.85
    }
  }

  private generatePredictiveInsights(
    history: Performance[], 
    profile: UserProfile, 
    motivation: any
  ): {
    completionDate: Date
    riskFactors: string[]
    opportunities: string[]
  } {
    const learningRate = this.calculateLearningRate(history)
    const currentLevel = this.calculateCurrentLevel(profile, history)
    const targetLevel = 8 // Advanced level
    
    const remainingProgress = (targetLevel - currentLevel) / targetLevel
    const estimatedDays = remainingProgress * 365 / learningRate // Very simplified
    
    const completionDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000)
    
    const riskFactors: string[] = []
    const opportunities: string[] = []
    
    // Identify risk factors
    if (motivation.dropoutRisk > 0.5) {
      riskFactors.push('High dropout risk detected')
    }
    if (this.getAverageMastery(history) < 0.6) {
      riskFactors.push('Low retention rates may slow progress')
    }
    if (profile.streak < 3) {
      riskFactors.push('Inconsistent learning schedule')
    }
    
    // Identify opportunities
    if (motivation.culturalEngagementTrend > 7) {
      opportunities.push('High cultural engagement - leverage for motivation')
    }
    if (this.calculateLearningEfficiency(history).velocity > 1.0) {
      opportunities.push('High learning velocity - consider accelerated path')
    }
    
    return { completionDate, riskFactors, opportunities }
  }

  private createCelebrationInsight(analytics: ProgressAnalytics): InsightCard {
    return {
      id: 'celebration-progress',
      type: 'celebration',
      title: 'Makore Makuru! Excellent Progress!',
      description: `You've mastered ${analytics.vocabularyAnalytics.masteredWords} words and achieved ${Math.round(analytics.overallProgress)}% overall progress. Your dedication shows the spirit of perseverance!`,
      actionable: false,
      importance: 'medium',
      culturalWisdom: 'Kurima kwese kune mabvumira - every cultivation has its seasons',
      icon: 'celebration',
      color: 'gold',
      animation: 'gentle-sparkle',
      dataPoints: [
        { label: 'Words Mastered', value: analytics.vocabularyAnalytics.masteredWords },
        { label: 'Overall Progress', value: `${Math.round(analytics.overallProgress)}%` },
        { label: 'Current Level', value: analytics.currentLevel }
      ],
      trend: 'up'
    }
  }

  private createImprovementInsight(analytics: ProgressAnalytics): InsightCard {
    const primaryArea = analytics.improvementAreas[0]
    
    return {
      id: 'improvement-opportunity',
      type: 'improvement',
      title: `Strengthen Your ${primaryArea}`,
      description: `Your ${primaryArea} skills show potential for growth. Focused practice in this area will accelerate your overall progress.`,
      actionable: true,
      actionText: `Practice ${primaryArea}`,
      importance: 'high',
      icon: 'growth',
      color: 'blue',
      dataPoints: [
        { label: 'Current Level', value: this.getSkillLevel(analytics.skillAreas, primaryArea) },
        { label: 'Target Level', value: 7 },
        { label: 'Estimated Time', value: '2 weeks' }
      ]
    }
  }

  private createCulturalInsight(analytics: ProgressAnalytics): InsightCard {
    return {
      id: 'cultural-connection',
      type: 'cultural',
      title: 'Deepen Your Cultural Roots',
      description: `Your cultural understanding is at ${Math.round(analytics.culturalEngagement)}/10. Exploring more traditional concepts will strengthen your connection to your heritage.`,
      actionable: true,
      actionText: 'Explore Cultural Lessons',
      importance: 'high',
      culturalWisdom: 'Musha mukadzi - a home is built through cultural understanding',
      icon: 'cultural-tree',
      color: 'green',
      dataPoints: [
        { label: 'Cultural Understanding', value: `${Math.round(analytics.culturalEngagement)}/10` },
        { label: 'Traditional Concepts', value: analytics.culturalAnalytics.traditionalConcepts },
        { label: 'Proverbs Learned', value: analytics.culturalAnalytics.proverbsLearned }
      ]
    }
  }

  private createEfficiencyInsight(analytics: ProgressAnalytics): InsightCard {
    return {
      id: 'learning-efficiency',
      type: 'recommendation',
      title: 'Optimize Your Learning',
      description: `Your learning velocity is ${analytics.learningVelocity.toFixed(1)} items/hour. Try shorter, more frequent sessions to improve retention.`,
      actionable: true,
      actionText: 'Adjust Study Schedule',
      importance: 'medium',
      icon: 'efficiency',
      color: 'orange',
      dataPoints: [
        { label: 'Learning Velocity', value: `${analytics.learningVelocity.toFixed(1)}/hr` },
        { label: 'Retention Rate', value: `${Math.round(analytics.retentionRate * 100)}%` },
        { label: 'Session Length', value: `${Math.round(analytics.averageSessionLength)} min` }
      ]
    }
  }

  private createSocialInsight(analytics: ProgressAnalytics): InsightCard {
    return {
      id: 'social-learning',
      type: 'recommendation',
      title: 'Join the Learning Community',
      description: 'Learning with others increases motivation and provides cultural context. Connect with fellow learners in study groups.',
      actionable: true,
      actionText: 'Find Study Partners',
      importance: 'medium',
      culturalWisdom: 'Rume rimwe harikombi inda - one person cannot surround an anthill alone',
      icon: 'community',
      color: 'purple',
      dataPoints: [
        { label: 'Study Groups', value: analytics.socialAnalytics.studyGroupParticipation },
        { label: 'Help Given', value: analytics.socialAnalytics.helpGiven },
        { label: 'Community Rank', value: analytics.socialAnalytics.communityRank }
      ]
    }
  }

  private createRiskMitigationInsight(analytics: ProgressAnalytics): InsightCard {
    return {
      id: 'risk-mitigation',
      type: 'recommendation',
      title: 'Stay on Track',
      description: 'Some patterns suggest potential challenges ahead. Adjusting your approach now will help maintain momentum.',
      actionable: true,
      actionText: 'Review Learning Plan',
      importance: 'high',
      icon: 'warning',
      color: 'red',
      dataPoints: [
        { label: 'Risk Factors', value: analytics.riskFactors.length },
        { label: 'Motivation Score', value: Math.round(analytics.motivationHealthScore) },
        { label: 'Recent Trend', value: 'Stable' }
      ]
    }
  }

  private createAchievementInsight(analytics: ProgressAnalytics): InsightCard {
    return {
      id: 'next-achievement',
      type: 'prediction',
      title: 'Next Achievement Within Reach',
      description: `You're close to earning the "${analytics.pathAnalytics.nextMilestone}" achievement. Keep practicing to unlock new features and cultural insights.`,
      actionable: true,
      actionText: 'View Achievement Details',
      importance: 'medium',
      icon: 'achievement',
      color: 'gold',
      dataPoints: [
        { label: 'Progress to Next', value: '78%' },
        { label: 'Estimated Days', value: 5 },
        { label: 'XP Reward', value: 200 }
      ]
    }
  }

  // Utility methods for calculations
  private getAverageMastery(history: Performance[]): number {
    if (history.length === 0) return 0
    return history.reduce((sum, p) => sum + p.masteryLevel, 0) / history.length
  }

  private isSkillItem(performance: Performance, skill: string): boolean {
    // This would check the actual item type and categorize it
    return performance.itemId.includes(skill)
  }

  private isSkillCard(card: SRSCard, skill: string): boolean {
    return card.contentType === skill || card.contentId.includes(skill)
  }

  private calculateSkillLevel(skillHistory: Performance[]): number {
    const averageMastery = this.getAverageMastery(skillHistory)
    return Math.min(10, Math.max(1, Math.floor(averageMastery * 10)))
  }

  private calculateSkillProgress(skillHistory: Performance[], skillCards: SRSCard[]): number {
    const mastered = skillHistory.filter(h => h.masteryLevel >= 0.8).length
    const total = skillHistory.length + skillCards.length
    return total > 0 ? (mastered / total) * 100 : 0
  }

  private calculateSkillTrend(skillHistory: Performance[]): 'improving' | 'stable' | 'declining' {
    if (skillHistory.length < 3) return 'stable'
    
    const recent = skillHistory.slice(-3)
    const earlier = skillHistory.slice(-6, -3)
    
    if (recent.length === 0 || earlier.length === 0) return 'stable'
    
    const recentAvg = this.getAverageMastery(recent)
    const earlierAvg = this.getAverageMastery(earlier)
    
    const difference = recentAvg - earlierAvg
    
    if (difference > 0.1) return 'improving'
    if (difference < -0.1) return 'declining'
    return 'stable'
  }

  private estimateTimeToNextLevel(skillHistory: Performance[]): number {
    // Simplified estimation based on current learning rate
    const currentLevel = this.calculateSkillLevel(skillHistory)
    const progressNeeded = (currentLevel + 1 - currentLevel) * 10 // items needed
    const learningRate = 0.5 // items per hour, simplified
    
    return progressNeeded / learningRate
  }

  private getSkillCulturalRelevance(skill: string): number {
    const relevanceMap: { [key: string]: number } = {
      'vocabulary': 8,
      'pronunciation': 9,
      'grammar': 6,
      'culture': 10,
      'conversation': 9
    }
    return relevanceMap[skill] || 5
  }

  // Additional helper methods would continue here...
  private isVocabularyItem(performance: Performance): boolean {
    return performance.itemId.includes('vocab') || performance.itemId.includes('word')
  }

  private isPronunciationItem(performance: Performance): boolean {
    return performance.itemId.includes('pronunciation') || performance.itemId.includes('audio')
  }

  private isCulturalItem(performance: Performance): boolean {
    return performance.itemId.includes('cultural') || performance.itemId.includes('tradition')
  }

  private calculateRecommendationAccuracy(history: Performance[]): number {
    // Simplified calculation - would track actual recommendation effectiveness
    return 0.75
  }

  private calculatePersonalizationLevel(profile: UserProfile): number {
    // Calculate how well the system has adapted to this user
    let score = 0
    
    if (profile.interests.length > 2) score += 0.3
    if (profile.challenges.length > 0) score += 0.2
    if (profile.learningStyle !== 'visual') score += 0.2 // Default is visual
    if (profile.culturalBackground !== 'other') score += 0.3
    
    return score
  }

  private calculateRetentionRate(history: Performance[]): number {
    // Simplified retention calculation
    const totalAttempts = history.reduce((sum, p) => sum + p.attempts, 0)
    const totalCorrect = history.reduce((sum, p) => sum + p.correctAnswers, 0)
    return totalAttempts > 0 ? totalCorrect / totalAttempts : 0
  }

  private calculateAdaptationScore(history: Performance[]): number {
    // How well the system has adapted difficulty to user performance
    const adaptations = history.filter(h => h.difficultyAdjustment !== 0).length
    return Math.min(1, adaptations / history.length)
  }

  private calculateLearningRate(history: Performance[]): number {
    // Items mastered per day
    const masteredItems = history.filter(h => h.masteryLevel >= 0.8).length
    const daysSinceStart = this.calculateDaysSinceStart(history)
    return daysSinceStart > 0 ? masteredItems / daysSinceStart : 0
  }

  private getSkillLevel(skillAreas: SkillAreaProgress[], skill: string): number {
    const skillArea = skillAreas.find(s => s.skill === skill)
    return skillArea ? skillArea.currentLevel : 0
  }

  private calculatePathOptimality(path: LearningPath, userId: string): number {
    // How well the current path fits the user (simplified)
    return 0.85
  }

  // Placeholder methods for vocabulary analytics
  private countNewWordsThisWeek(vocabHistory: Performance[]): number {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return vocabHistory.filter(h => h.lastAttempted >= oneWeekAgo).length
  }

  private calculateDifficultyDistribution(vocabHistory: Performance[]): { [level: number]: number } {
    // Simplified distribution
    return { 1: 10, 2: 15, 3: 20, 4: 18, 5: 12, 6: 8, 7: 5, 8: 3, 9: 2, 10: 1 }
  }

  private calculateAverageMasteryTime(vocabHistory: Performance[]): number {
    if (vocabHistory.length === 0) return 0
    return vocabHistory.reduce((sum, h) => sum + h.averageTime, 0) / vocabHistory.length
  }

  private calculateCategoryProgress(vocabHistory: Performance[]): Array<{
    category: string
    mastered: number
    total: number
    culturalSignificance: number
  }> {
    // Simplified category progress
    return [
      { category: 'Family', mastered: 8, total: 15, culturalSignificance: 9 },
      { category: 'Greetings', mastered: 5, total: 8, culturalSignificance: 10 },
      { category: 'Numbers', mastered: 10, total: 10, culturalSignificance: 6 }
    ]
  }

  private calculateForgettingCurve(vocabCards: SRSCard[]): Array<{ days: number, retentionRate: number }> {
    // Simplified forgetting curve
    return [
      { days: 1, retentionRate: 0.9 },
      { days: 3, retentionRate: 0.8 },
      { days: 7, retentionRate: 0.7 },
      { days: 14, retentionRate: 0.6 },
      { days: 30, retentionRate: 0.5 }
    ]
  }

  private calculateOptimalReviewInterval(vocabCards: SRSCard[]): number {
    // Average optimal interval based on cards
    if (vocabCards.length === 0) return 7
    return vocabCards.reduce((sum, c) => sum + c.interval, 0) / vocabCards.length
  }

  private calculateToneAccuracy(history: Performance[]): number {
    // Simplified tone accuracy
    return 0.75
  }

  private calculatePhoneticProgress(history: Performance[]): number {
    return 0.65
  }

  private calculateWhistledSoundsProgress(history: Performance[]): number {
    return 0.45
  }

  // Additional placeholder methods for pronunciation, cultural, and social analytics would continue here...
  private calculateOverallPronunciationAccuracy(pronunciationHistory: Performance[]): number {
    return this.getAverageMastery(pronunciationHistory)
  }

  private calculateConsonantAccuracy(pronunciationHistory: Performance[]): number {
    return 0.8
  }

  private calculateVowelAccuracy(pronunciationHistory: Performance[]): number {
    return 0.9
  }

  private identifyChallengingSounds(pronunciationHistory: Performance[]): string[] {
    return ['sv', 'zv', 'dzv', 'tone changes']
  }

  private identifyMasteredSounds(pronunciationHistory: Performance[]): string[] {
    return ['a', 'e', 'i', 'basic consonants']
  }

  private calculateWeeklyPronunciationProgress(pronunciationHistory: Performance[]): Array<{ week: Date, accuracy: number }> {
    return [
      { week: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), accuracy: 0.75 },
      { week: new Date(), accuracy: 0.8 }
    ]
  }

  private calculatePracticeMinutes(pronunciationHistory: Performance[]): number {
    return 45
  }

  private calculateCulturalContextAccuracy(pronunciationHistory: Performance[]): number {
    return 0.7
  }

  private calculateRespectMarkerUsage(pronunciationHistory: Performance[]): number {
    return 0.6
  }

  private calculateCulturalUnderstanding(culturalHistory: Performance[]): number {
    return this.getAverageMastery(culturalHistory) * 10
  }

  private countTraditionalConcepts(culturalHistory: Performance[]): number {
    return 5
  }

  private countModernConcepts(culturalHistory: Performance[]): number {
    return 3
  }

  private countCulturalLessons(culturalHistory: Performance[]): number {
    return 4
  }

  private countCulturalStories(userId: string): number {
    return 2
  }

  private countProverbsLearned(culturalHistory: Performance[]): number {
    return 3
  }

  private calculateHeritageConnection(userId: string): number {
    return 7
  }

  private calculateAncestralWisdomEngagement(culturalHistory: Performance[]): number {
    return 6
  }

  private countCulturalDiscussions(userId: string): number {
    return 2
  }

  private countCulturalEventParticipation(userId: string): number {
    return 1
  }
}

export default ProgressAnalyticsDashboard