// Learning Paths for Shona Language Learning
// 5 structured paths with adaptive progression and cultural focus

export interface LearningPath {
  id: string
  name: string
  description: string
  targetAudience: string
  estimatedDuration: string // e.g., "3-6 months"
  culturalFocus: string
  
  // Path configuration
  phases: LearningPhase[]
  prerequisites: string[]
  goals: string[]
  
  // Adaptive features
  difficultyProgression: 'linear' | 'adaptive' | 'user_paced'
  culturalWeighting: number // 0-1, how much cultural content to include
  practicalWeighting: number // 0-1, how much practical content to include
  
  // Personalization
  recommendedForProfiles: UserProfileType[]
  adaptiveElements: AdaptiveElement[]
  
  metadata: {
    createdBy: string
    lastUpdated: Date
    version: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    completionRate: number // historical data
  }
}

export interface LearningPhase {
  id: string
  name: string
  description: string
  orderIndex: number
  estimatedWeeks: number
  
  // Content organization
  modules: LearningModule[]
  milestones: Milestone[]
  
  // Prerequisites and outcomes
  entryRequirements: string[]
  learningOutcomes: string[]
  
  // Assessment
  assessmentCriteria: AssessmentCriterion[]
  masteryThreshold: number // 0-1
  
  // Adaptive elements
  adaptiveContent: boolean
  difficultyAdjustment: boolean
  culturalDepth: number // 1-5
}

export interface LearningModule {
  id: string
  name: string
  description: string
  orderIndex: number
  estimatedHours: number
  
  // Content
  lessons: string[] // lesson IDs
  vocabulary: string[] // vocabulary IDs  
  exercises: string[] // exercise IDs
  culturalNotes: string[] // cultural note IDs
  
  // Skills focus
  skillsFocus: Skill[]
  culturalThemes: string[]
  practicalApplications: string[]
  
  // Adaptive features
  alternativePaths: AlternativePath[]
  difficultyVariants: DifficultyVariant[]
}

export interface Milestone {
  id: string
  name: string
  description: string
  type: 'skill' | 'cultural' | 'practical' | 'comprehensive'
  
  // Requirements
  requiredMastery: { [skillId: string]: number }
  requiredContent: string[]
  
  // Celebration
  badgeUnlocked?: string
  culturalStory?: string
  practicalScenario?: string
  
  // Progression
  unlocksContent: string[]
  unlocksFeatures: string[]
}

export interface Skill {
  id: string
  name: string
  category: 'pronunciation' | 'vocabulary' | 'grammar' | 'cultural' | 'conversation'
  weight: number // importance in this module
  targetLevel: number // 1-10
}

export interface AdaptiveElement {
  type: 'difficulty' | 'content_selection' | 'pacing' | 'cultural_depth' | 'practice_type'
  description: string
  triggers: string[] // conditions that activate this element
  adjustments: { [key: string]: any }
}

export interface AlternativePath {
  id: string
  name: string
  description: string
  condition: string // when to use this path
  content: string[] // alternative content IDs
}

export interface DifficultyVariant {
  level: 'easier' | 'standard' | 'harder'
  modifications: {
    vocabularyDensity?: number
    culturalComplexity?: number
    exerciseTypes?: string[]
    supportLevel?: 'high' | 'medium' | 'low'
  }
}

export type UserProfileType = 
  | 'heritage_seeker' 
  | 'business_professional' 
  | 'family_connector' 
  | 'academic_scholar' 
  | 'tourist_traveler'

export interface AssessmentCriterion {
  skill: string
  weight: number
  minimumScore: number
  assessmentType: 'automatic' | 'self_assessment' | 'community_validation'
}

export class LearningPathEngine {
  private paths: LearningPath[]

  constructor() {
    this.paths = this.initializePaths()
  }

  /**
   * Get recommended learning path based on user profile
   */
  getRecommendedPath(userProfile: {
    culturalBackground: string
    goals: string[]
    availableTime: number
    interests: string[]
    currentLevel: number
    learningStyle: string
    preferredPace: string
  }): LearningPath {
    
    // Score each path based on user profile
    const scoredPaths = this.paths.map(path => ({
      path,
      score: this.calculatePathScore(path, userProfile)
    }))

    // Sort by score and return the best match
    scoredPaths.sort((a, b) => b.score - a.score)
    
    // Adapt the path to user's specific needs
    return this.adaptPathToUser(scoredPaths[0].path, userProfile)
  }

  /**
   * Get all available paths
   */
  getAllPaths(): LearningPath[] {
    return [...this.paths]
  }

  /**
   * Get path by ID
   */
  getPathById(pathId: string): LearningPath | undefined {
    return this.paths.find(path => path.id === pathId)
  }

  /**
   * Calculate user's progress through a path
   */
  calculateProgress(pathId: string, completedContent: string[]): {
    overallProgress: number
    currentPhase: number
    currentModule: number
    nextMilestone: Milestone | null
    estimatedTimeRemaining: number
  } {
    const path = this.getPathById(pathId)
    if (!path) {
      throw new Error(`Path ${pathId} not found`)
    }

    let totalContent = 0
    let completedCount = 0
    let currentPhase = 0
    let currentModule = 0
    let nextMilestone: Milestone | null = null

    for (let phaseIndex = 0; phaseIndex < path.phases.length; phaseIndex++) {
      const phase = path.phases[phaseIndex]
      let phaseCompleted = true

      for (let moduleIndex = 0; moduleIndex < phase.modules.length; moduleIndex++) {
        const module = phase.modules[moduleIndex]
        const moduleContent = [
          ...module.lessons,
          ...module.vocabulary,
          ...module.exercises
        ]
        
        totalContent += moduleContent.length
        const moduleCompletedCount = moduleContent.filter(id => completedContent.includes(id)).length
        completedCount += moduleCompletedCount

        if (moduleCompletedCount < moduleContent.length && phaseCompleted) {
          currentPhase = phaseIndex
          currentModule = moduleIndex
          phaseCompleted = false
        }
      }

      // Check for next milestone
      if (!nextMilestone) {
        for (const milestone of phase.milestones) {
          const milestoneComplete = milestone.requiredContent.every(id => completedContent.includes(id))
          if (!milestoneComplete) {
            nextMilestone = milestone
            break
          }
        }
      }
    }

    const overallProgress = totalContent > 0 ? completedCount / totalContent : 0
    
    // Estimate remaining time based on remaining content and average completion time
    const remainingContent = totalContent - completedCount
    const avgTimePerItem = 15 // minutes, could be made more sophisticated
    const estimatedTimeRemaining = remainingContent * avgTimePerItem

    return {
      overallProgress,
      currentPhase,
      currentModule,
      nextMilestone,
      estimatedTimeRemaining
    }
  }

  private calculatePathScore(path: LearningPath, userProfile: any): number {
    let score = 0

    // Profile type matching
    if (path.recommendedForProfiles.includes(userProfile.culturalBackground as UserProfileType)) {
      score += 30
    }

    // Goal alignment
    const goalAlignment = userProfile.goals.filter((goal: string) => 
      path.goals.includes(goal)
    ).length / Math.max(userProfile.goals.length, 1)
    score += goalAlignment * 25

    // Cultural focus alignment
    if (userProfile.culturalBackground === 'heritage_seeker' && path.culturalWeighting > 0.7) {
      score += 20
    }
    if (userProfile.goals.includes('business') && path.practicalWeighting > 0.7) {
      score += 20
    }

    // Difficulty appropriateness
    const difficultyScore = this.calculateDifficultyScore(path, userProfile.currentLevel)
    score += difficultyScore * 15

    // Time availability
    const timeScore = this.calculateTimeScore(path, userProfile.availableTime)
    score += timeScore * 10

    return score
  }

  private calculateDifficultyScore(path: LearningPath, userLevel: number): number {
    const pathDifficultyMap = {
      'beginner': 2,
      'intermediate': 5,
      'advanced': 8
    }
    
    const pathLevel = pathDifficultyMap[path.metadata.difficulty]
    const difference = Math.abs(pathLevel - userLevel)
    
    // Prefer slightly challenging but not overwhelming
    if (difference <= 1) return 1.0
    if (difference <= 2) return 0.7
    if (difference <= 3) return 0.4
    return 0.1
  }

  private calculateTimeScore(path: LearningPath, availableMinutes: number): number {
    // Estimate path requirements
    const totalWeeks = path.phases.reduce((sum, phase) => sum + phase.estimatedWeeks, 0)
    const estimatedMinutesPerWeek = 150 // 3 sessions of 50 minutes
    const pathTimeRequirement = totalWeeks * estimatedMinutesPerWeek / 7 // per day
    
    const timeRatio = availableMinutes / pathTimeRequirement
    
    if (timeRatio >= 0.8 && timeRatio <= 1.5) return 1.0
    if (timeRatio >= 0.6 && timeRatio <= 2.0) return 0.7
    if (timeRatio >= 0.4 && timeRatio <= 3.0) return 0.4
    return 0.1
  }

  private adaptPathToUser(path: LearningPath, userProfile: any): LearningPath {
    const adaptedPath = JSON.parse(JSON.stringify(path)) // deep copy

    // Adjust cultural weighting based on user background
    if (userProfile.culturalBackground === 'heritage_seeker') {
      adaptedPath.culturalWeighting = Math.min(1.0, adaptedPath.culturalWeighting + 0.2)
    }

    // Adjust difficulty progression based on user pace preference
    if (userProfile.preferredPace === 'fast') {
      adaptedPath.difficultyProgression = 'adaptive'
      // Reduce estimated weeks by 20%
      adaptedPath.phases.forEach((phase: LearningPhase) => {
        phase.estimatedWeeks = Math.ceil(phase.estimatedWeeks * 0.8)
      })
    } else if (userProfile.preferredPace === 'slow') {
      adaptedPath.difficultyProgression = 'user_paced'
      // Increase estimated weeks by 30%
      adaptedPath.phases.forEach((phase: LearningPhase) => {
        phase.estimatedWeeks = Math.ceil(phase.estimatedWeeks * 1.3)
      })
    }

    return adaptedPath
  }

  private initializePaths(): LearningPath[] {
    return [
      this.createTouristTrackPath(),
      this.createHeritageSeekerPath(),
      this.createBusinessProfessionalPath(),
      this.createFamilyConnectorPath(),
      this.createAcademicScholarPath()
    ]
  }

  private createTouristTrackPath(): LearningPath {
    return {
      id: 'tourist-track',
      name: 'Tourist Track: Essential Communication',
      description: 'Learn essential Shona for travel and basic communication in Zimbabwe',
      targetAudience: 'Tourists and short-term visitors to Zimbabwe',
      estimatedDuration: '2-3 months',
      culturalFocus: 'Basic cultural etiquette and travel scenarios',
      
      phases: [
        {
          id: 'tourist-basics',
          name: 'Survival Basics',
          description: 'Essential greetings, numbers, and emergency phrases',
          orderIndex: 1,
          estimatedWeeks: 2,
          modules: [
            {
              id: 'tourist-greetings',
              name: 'Greetings & Politeness',
              description: 'Master respectful greetings and basic politeness',
              orderIndex: 1,
              estimatedHours: 4,
              lessons: ['lesson-1', 'lesson-2'],
              vocabulary: ['vocab-greetings', 'vocab-politeness'],
              exercises: ['ex-greetings-practice', 'ex-tone-recognition'],
              culturalNotes: ['cultural-respect', 'cultural-greetings'],
              skillsFocus: [
                { id: 'pronunciation', name: 'Basic Pronunciation', category: 'pronunciation', weight: 0.4, targetLevel: 4 },
                { id: 'greetings', name: 'Greetings', category: 'vocabulary', weight: 0.6, targetLevel: 6 }
              ],
              culturalThemes: ['respect', 'social hierarchy'],
              practicalApplications: ['airport arrival', 'hotel check-in'],
              alternativePaths: [],
              difficultyVariants: [
                {
                  level: 'easier',
                  modifications: {
                    vocabularyDensity: 0.7,
                    supportLevel: 'high'
                  }
                }
              ]
            }
          ],
          milestones: [
            {
              id: 'first-conversation',
              name: 'First Conversation',
              description: 'Successfully complete a basic greeting exchange',
              type: 'practical',
              requiredMastery: { 'greetings': 0.7 },
              requiredContent: ['lesson-1', 'lesson-2'],
              badgeUnlocked: 'First Words',
              unlocksContent: ['tourist-numbers'],
              unlocksFeatures: ['pronunciation-practice']
            }
          ],
          entryRequirements: [],
          learningOutcomes: ['Basic greetings', 'Cultural awareness of respect'],
          assessmentCriteria: [
            { skill: 'greetings', weight: 0.6, minimumScore: 0.7, assessmentType: 'automatic' },
            { skill: 'pronunciation', weight: 0.4, minimumScore: 0.6, assessmentType: 'automatic' }
          ],
          masteryThreshold: 0.7,
          adaptiveContent: true,
          difficultyAdjustment: true,
          culturalDepth: 3
        },
        {
          id: 'tourist-practical',
          name: 'Practical Communication',
          description: 'Numbers, directions, shopping, and dining',
          orderIndex: 2,
          estimatedWeeks: 4,
          modules: [
            {
              id: 'tourist-numbers',
              name: 'Numbers & Money',
              description: 'Essential numbers for shopping and transactions',
              orderIndex: 1,
              estimatedHours: 3,
              lessons: ['lesson-5'],
              vocabulary: ['vocab-numbers', 'vocab-money'],
              exercises: ['ex-number-practice', 'ex-market-simulation'],
              culturalNotes: ['cultural-bargaining'],
              skillsFocus: [
                { id: 'numbers', name: 'Numbers', category: 'vocabulary', weight: 0.7, targetLevel: 7 },
                { id: 'practical', name: 'Practical Use', category: 'conversation', weight: 0.3, targetLevel: 5 }
              ],
              culturalThemes: ['market culture', 'economic interaction'],
              practicalApplications: ['shopping', 'restaurant ordering', 'transportation'],
              alternativePaths: [],
              difficultyVariants: []
            }
          ],
          milestones: [],
          entryRequirements: ['first-conversation'],
          learningOutcomes: ['Market transactions', 'Basic navigation'],
          assessmentCriteria: [],
          masteryThreshold: 0.7,
          adaptiveContent: true,
          difficultyAdjustment: true,
          culturalDepth: 2
        }
      ],
      
      prerequisites: [],
      goals: ['communication', 'travel', 'practical'],
      difficultyProgression: 'linear',
      culturalWeighting: 0.3,
      practicalWeighting: 0.8,
      recommendedForProfiles: ['tourist_traveler'],
      adaptiveElements: [
        {
          type: 'pacing',
          description: 'Accelerate for confident learners',
          triggers: ['high_accuracy', 'fast_completion'],
          adjustments: { weekReduction: 0.2 }
        }
      ],
      
      metadata: {
        createdBy: 'Language Learning Team',
        lastUpdated: new Date(),
        version: '1.0',
        difficulty: 'beginner',
        completionRate: 0.85
      }
    }
  }

  private createHeritageSeekerPath(): LearningPath {
    return {
      id: 'heritage-seeker',
      name: 'Heritage Seeker: Cultural Connection',
      description: 'Deep dive into Shona culture, traditions, and language for diaspora connection',
      targetAudience: 'Diaspora members reconnecting with Shona heritage',
      estimatedDuration: '6-12 months',
      culturalFocus: 'Deep cultural understanding, traditions, and family connections',
      
      phases: [
        {
          id: 'heritage-foundations',
          name: 'Cultural Foundations',
          description: 'Understanding Shona worldview and cultural principles',
          orderIndex: 1,
          estimatedWeeks: 4,
          modules: [
            {
              id: 'heritage-identity',
              name: 'Identity & Belonging',
              description: 'Names, clans, and cultural identity in Shona society',
              orderIndex: 1,
              estimatedHours: 8,
              lessons: ['lesson-2', 'lesson-3', 'lesson-4'],
              vocabulary: ['vocab-family-extended', 'vocab-clans', 'vocab-identity'],
              exercises: ['ex-family-tree', 'ex-cultural-scenarios'],
              culturalNotes: ['cultural-names', 'cultural-clans', 'cultural-respect'],
              skillsFocus: [
                { id: 'cultural', name: 'Cultural Understanding', category: 'cultural', weight: 0.6, targetLevel: 8 },
                { id: 'family', name: 'Family Vocabulary', category: 'vocabulary', weight: 0.4, targetLevel: 7 }
              ],
              culturalThemes: ['ubuntu philosophy', 'ancestral connection', 'community'],
              practicalApplications: ['family gatherings', 'cultural ceremonies'],
              alternativePaths: [],
              difficultyVariants: []
            }
          ],
          milestones: [
            {
              id: 'cultural-awakening',
              name: 'Cultural Awakening',
              description: 'Deep understanding of Shona cultural principles',
              type: 'cultural',
              requiredMastery: { 'cultural': 0.8 },
              requiredContent: ['lesson-2', 'lesson-3'],
              culturalStory: 'The story of Chaminuka and cultural wisdom',
              unlocksContent: ['heritage-traditions'],
              unlocksFeatures: ['cultural-scenarios']
            }
          ],
          entryRequirements: [],
          learningOutcomes: ['Cultural identity understanding', 'Extended family terminology'],
          assessmentCriteria: [],
          masteryThreshold: 0.8,
          adaptiveContent: true,
          difficultyAdjustment: false,
          culturalDepth: 5
        }
      ],
      
      prerequisites: [],
      goals: ['culture', 'family', 'heritage'],
      difficultyProgression: 'adaptive',
      culturalWeighting: 0.9,
      practicalWeighting: 0.4,
      recommendedForProfiles: ['heritage_seeker'],
      adaptiveElements: [
        {
          type: 'cultural_depth',
          description: 'Increase cultural content for engaged learners',
          triggers: ['high_cultural_engagement'],
          adjustments: { culturalWeighting: 1.0 }
        }
      ],
      
      metadata: {
        createdBy: 'Cultural Heritage Team',
        lastUpdated: new Date(),
        version: '1.0',
        difficulty: 'intermediate',
        completionRate: 0.78
      }
    }
  }

  private createBusinessProfessionalPath(): LearningPath {
    return {
      id: 'business-professional',
      name: 'Business Professional: Formal Communication',
      description: 'Professional Shona for business, meetings, and formal interactions',
      targetAudience: 'Business professionals working in Zimbabwe or with Zimbabwean partners',
      estimatedDuration: '4-6 months',
      culturalFocus: 'Business etiquette and professional cultural norms',
      
      phases: [],
      prerequisites: ['basic-communication-skills'],
      goals: ['business', 'professional', 'formal'],
      difficultyProgression: 'adaptive',
      culturalWeighting: 0.5,
      practicalWeighting: 0.9,
      recommendedForProfiles: ['business_professional'],
      adaptiveElements: [],
      
      metadata: {
        createdBy: 'Business Language Team',
        lastUpdated: new Date(),
        version: '1.0',
        difficulty: 'intermediate',
        completionRate: 0.72
      }
    }
  }

  private createFamilyConnectorPath(): LearningPath {
    return {
      id: 'family-connector',
      name: 'Family Connector: Kinship Focus',
      description: 'Connect with Shona-speaking family members through language and culture',
      targetAudience: 'People with Shona-speaking family members',
      estimatedDuration: '4-8 months',
      culturalFocus: 'Family relationships, generational communication, and kinship systems',
      
      phases: [],
      prerequisites: [],
      goals: ['family', 'communication', 'culture'],
      difficultyProgression: 'user_paced',
      culturalWeighting: 0.7,
      practicalWeighting: 0.6,
      recommendedForProfiles: ['family_connector'],
      adaptiveElements: [],
      
      metadata: {
        createdBy: 'Family Learning Team',
        lastUpdated: new Date(),
        version: '1.0',
        difficulty: 'beginner',
        completionRate: 0.82
      }
    }
  }

  private createAcademicScholarPath(): LearningPath {
    return {
      id: 'academic-scholar',
      name: 'Academic Scholar: Complete Mastery',
      description: 'Comprehensive Shona language mastery for academic or research purposes',
      targetAudience: 'Researchers, academics, and serious language learners',
      estimatedDuration: '12-18 months',
      culturalFocus: 'Comprehensive cultural and linguistic understanding',
      
      phases: [],
      prerequisites: ['intermediate-proficiency'],
      goals: ['academic', 'research', 'mastery'],
      difficultyProgression: 'adaptive',
      culturalWeighting: 0.8,
      practicalWeighting: 0.7,
      recommendedForProfiles: ['academic_scholar'],
      adaptiveElements: [],
      
      metadata: {
        createdBy: 'Academic Team',
        lastUpdated: new Date(),
        version: '1.0',
        difficulty: 'advanced',
        completionRate: 0.65
      }
    }
  }
}

export default LearningPathEngine