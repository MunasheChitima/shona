// Prerequisite System for Shona Language Learning
// Ensures logical progression through vocabulary, grammar, and cultural concepts

export interface PrerequisiteRule {
  id: string
  contentId: string
  contentType: 'vocabulary' | 'lesson' | 'grammar' | 'cultural_concept' | 'pronunciation'
  
  // Dependencies
  hardPrerequisites: string[] // Must be mastered before unlocking
  softPrerequisites: string[] // Recommended but not required
  culturalPrerequisites: string[] // Cultural understanding needed
  phoneticPrerequisites: string[] // Pronunciation skills needed
  
  // Mastery requirements
  masteryLevel: number // 0-1, how well prerequisites must be known
  
  // Reasoning
  reason: string
  category: string
  
  // Adaptive adjustments
  canBypass: boolean // Can be bypassed under certain conditions
  bypassConditions: string[]
  
  // Learning science rationale
  cognitiveLoad: number // 1-5, how much mental effort this adds
  buildingBlock: boolean // Is this foundational for many other concepts?
  
  metadata: {
    createdBy: string
    lastUpdated: Date
    validated: boolean
  }
}

export interface DependencyGraph {
  nodes: ContentNode[]
  edges: DependencyEdge[]
  clusters: ContentCluster[]
}

export interface ContentNode {
  id: string
  type: 'vocabulary' | 'lesson' | 'grammar' | 'cultural_concept' | 'pronunciation'
  difficulty: number
  category: string
  culturalComplexity: number
  phoneticComplexity: number
  
  // Learning characteristics
  cognitiveLoad: number
  masteryTime: number // estimated minutes to master
  retentionDifficulty: number // how hard to remember
  buildingBlock: boolean // Is this foundational for many other concepts?
  
  // Cultural and linguistic properties
  tonePattern?: string
  culturalContext: string
  frequencyOfUse: 'high' | 'medium' | 'low'
  registerLevel: 'formal' | 'informal' | 'neutral'
}

export interface DependencyEdge {
  fromId: string
  toId: string
  type: 'hard' | 'soft' | 'cultural' | 'phonetic'
  strength: number // 0-1, how important this dependency is
  reason: string
}

export interface ContentCluster {
  id: string
  name: string
  description: string
  theme: string
  contentIds: string[]
  optimalOrder: string[] // suggested order within cluster
}

export class PrerequisiteSystem {
  private rules: Map<string, PrerequisiteRule>
  private dependencyGraph: DependencyGraph
  private shonaSpecificRules: ShonaLanguageRules

  constructor() {
    this.rules = new Map()
    this.shonaSpecificRules = new ShonaLanguageRules()
    this.dependencyGraph = this.buildDependencyGraph()
    this.initializeRules()
  }

  /**
   * Check if content is ready to be unlocked for a user
   */
  isContentReady(
    contentId: string, 
    userMastery: Map<string, number>,
    userProfile: { culturalBackground: string, currentLevel: number }
  ): {
    ready: boolean
    missingPrerequisites: string[]
    recommendations: string[]
    canBypass: boolean
    bypassReason?: string
  } {
    const rule = this.rules.get(contentId)
    if (!rule) {
      return { ready: true, missingPrerequisites: [], recommendations: [], canBypass: false }
    }

    const missing: string[] = []
    const recommendations: string[] = []

    // Check hard prerequisites
    for (const prereqId of rule.hardPrerequisites) {
      const mastery = userMastery.get(prereqId) || 0
      if (mastery < rule.masteryLevel) {
        missing.push(prereqId)
      }
    }

    // Check soft prerequisites for recommendations
    for (const prereqId of rule.softPrerequisites) {
      const mastery = userMastery.get(prereqId) || 0
      if (mastery < rule.masteryLevel * 0.7) {
        recommendations.push(`Consider strengthening ${prereqId} first`)
      }
    }

    // Check Shona-specific prerequisites
    const shonaCheck = this.shonaSpecificRules.checkShonaPrerequisites(
      contentId, 
      userMastery, 
      userProfile
    )
    missing.push(...shonaCheck.missing)
    recommendations.push(...shonaCheck.recommendations)

    // Check bypass conditions
    const canBypass = rule.canBypass && this.evaluateBypassConditions(rule, userProfile)
    const bypassReason = canBypass ? this.getBypassReason(rule, userProfile) : undefined

    return {
      ready: missing.length === 0,
      missingPrerequisites: missing,
      recommendations,
      canBypass,
      bypassReason
    }
  }

  /**
   * Get optimal learning sequence for a set of content
   */
  getOptimalSequence(contentIds: string[], userMastery: Map<string, number>): {
    sequence: string[]
    parallelGroups: string[][]
    reasoning: string[]
  } {
    // Build subgraph for the requested content
    const subgraph = this.buildSubgraph(contentIds)
    
    // Topological sort with additional constraints
    const sequence = this.topologicalSort(subgraph, userMastery)
    
    // Identify content that can be learned in parallel
    const parallelGroups = this.identifyParallelGroups(sequence, subgraph)
    
    // Generate reasoning for the sequence
    const reasoning = this.generateSequenceReasoning(sequence, subgraph)

    return { sequence, parallelGroups, reasoning }
  }

  /**
   * Suggest next best content based on user's current mastery
   */
  getNextRecommendations(
    userMastery: Map<string, number>,
    userProfile: any,
    count: number = 5
  ): Array<{
    contentId: string
    priority: number
    reason: string
    type: 'foundational' | 'progressive' | 'reinforcement' | 'cultural'
  }> {
    const recommendations: Array<{
      contentId: string
      priority: number
      reason: string
      type: 'foundational' | 'progressive' | 'reinforcement' | 'cultural'
    }> = []

    // Find all content that's ready to unlock
    const readyContent = Array.from(this.rules.keys()).filter(contentId => {
      const check = this.isContentReady(contentId, userMastery, userProfile)
      return check.ready || check.canBypass
    })

    // Score each piece of ready content
    for (const contentId of readyContent) {
      const node = this.dependencyGraph.nodes.find(n => n.id === contentId)
      if (!node) continue

      const score = this.calculateContentScore(contentId, node, userMastery, userProfile)
      const type = this.determineContentType(contentId, userMastery)
      const reason = this.generateRecommendationReason(contentId, type, userProfile)

      recommendations.push({
        contentId,
        priority: score,
        reason,
        type
      })
    }

    // Sort by priority and return top recommendations
    return recommendations
      .sort((a, b) => b.priority - a.priority)
      .slice(0, count)
  }

  /**
   * Validate the prerequisite rules for consistency
   */
  validateRules(): {
    valid: boolean
    circularDependencies: string[][]
    unreachableContent: string[]
    issues: string[]
  } {
    const issues: string[] = []
    const circularDependencies: string[][] = []
    const unreachableContent: string[] = []

    // Check for circular dependencies
    const cycles = this.detectCycles()
    circularDependencies.push(...cycles)

    // Check for unreachable content
    const unreachable = this.findUnreachableContent()
    unreachableContent.push(...unreachable)

    // Check for missing prerequisites
    for (const [contentId, rule] of this.rules) {
      for (const prereqId of rule.hardPrerequisites) {
        if (!this.rules.has(prereqId) && !this.isBasicContent(prereqId)) {
          issues.push(`${contentId} has unknown prerequisite: ${prereqId}`)
        }
      }
    }

    return {
      valid: circularDependencies.length === 0 && unreachableContent.length === 0 && issues.length === 0,
      circularDependencies,
      unreachableContent,
      issues
    }
  }

  /**
   * Add or update a prerequisite rule
   */
  addRule(rule: PrerequisiteRule): void {
    this.rules.set(rule.contentId, rule)
    // Rebuild dependency graph
    this.dependencyGraph = this.buildDependencyGraph()
  }

  /**
   * Get statistics about the prerequisite system
   */
  getStatistics(): {
    totalRules: number
    averagePrerequisites: number
    maxDepth: number
    foundationalContent: string[]
    terminalContent: string[]
    mostConnected: string[]
  } {
    const totalRules = this.rules.size
    const totalPrereqs = Array.from(this.rules.values())
      .reduce((sum, rule) => sum + rule.hardPrerequisites.length, 0)
    const averagePrerequisites = totalPrereqs / totalRules

    const maxDepth = this.calculateMaxDepth()
    const foundationalContent = this.findFoundationalContent()
    const terminalContent = this.findTerminalContent()
    const mostConnected = this.findMostConnectedContent()

    return {
      totalRules,
      averagePrerequisites,
      maxDepth,
      foundationalContent,
      terminalContent,
      mostConnected
    }
  }

  private initializeRules(): void {
    // Initialize with Shona-specific prerequisite rules
    this.addShonaVocabularyRules()
    this.addShonaGrammarRules()
    this.addShonaCulturalRules()
    this.addShonaPronunciationRules()
  }

  private addShonaVocabularyRules(): void {
    // Basic greetings → Advanced greetings
    this.addRule({
      id: 'greeting-progression-1',
      contentId: 'mhoroi',
      contentType: 'vocabulary',
      hardPrerequisites: ['mhoro'],
      softPrerequisites: [],
      culturalPrerequisites: [],
      phoneticPrerequisites: [],
      masteryLevel: 0.7,
      reason: 'Formal greetings build on informal ones',
      category: 'greetings',
      canBypass: false,
      bypassConditions: [],
      cognitiveLoad: 2,
      buildingBlock: true,
      metadata: {
        createdBy: 'Linguistic Team',
        lastUpdated: new Date(),
        validated: true
      }
    })

    // Numbers → Time expressions
    this.addRule({
      id: 'time-requires-numbers',
      contentId: 'nguva',
      contentType: 'vocabulary',
      hardPrerequisites: ['motsi', 'piri', 'tatu'],
      softPrerequisites: [],
      culturalPrerequisites: [],
      phoneticPrerequisites: [],
      masteryLevel: 0.8,
      reason: 'Time expressions require number understanding',
      category: 'time',
      canBypass: false,
      bypassConditions: [],
      cognitiveLoad: 3,
      buildingBlock: true,
      metadata: {
        createdBy: 'Linguistic Team',
        lastUpdated: new Date(),
        validated: true
      }
    })

    // Family terms progression
    this.addRule({
      id: 'extended-family-requires-core',
      contentId: 'sekuru',
      contentType: 'vocabulary',
      hardPrerequisites: ['baba', 'amai'],
      softPrerequisites: ['mhuri'],
      culturalPrerequisites: ['family-structure'],
      phoneticPrerequisites: [],
      masteryLevel: 0.7,
      reason: 'Extended family terms build on core family vocabulary',
      category: 'family',
      canBypass: false,
      bypassConditions: [],
      cognitiveLoad: 2,
      buildingBlock: true,
      metadata: {
        createdBy: 'Cultural Team',
        lastUpdated: new Date(),
        validated: true
      }
    })
  }

  private addShonaGrammarRules(): void {
    // Noun classes
    this.addRule({
      id: 'noun-class-concordance',
      contentId: 'noun-class-advanced',
      contentType: 'grammar',
      hardPrerequisites: ['noun-class-basic', 'singular-plural'],
      softPrerequisites: [],
      culturalPrerequisites: [],
      phoneticPrerequisites: [],
      masteryLevel: 0.8,
      reason: 'Advanced noun class usage requires basic understanding',
      category: 'grammar',
      canBypass: false,
      bypassConditions: [],
      cognitiveLoad: 4,
      buildingBlock: true,
      metadata: {
        createdBy: 'Grammar Team',
        lastUpdated: new Date(),
        validated: true
      }
    })

    // Verb tenses
    this.addRule({
      id: 'complex-tenses-require-simple',
      contentId: 'past-perfect-tense',
      contentType: 'grammar',
      hardPrerequisites: ['present-tense', 'past-tense'],
      softPrerequisites: ['future-tense'],
      culturalPrerequisites: [],
      phoneticPrerequisites: [],
      masteryLevel: 0.8,
      reason: 'Complex tenses build on simple tense understanding',
      category: 'grammar',
      canBypass: false,
      bypassConditions: [],
      cognitiveLoad: 4,
      buildingBlock: false,
      metadata: {
        createdBy: 'Grammar Team',
        lastUpdated: new Date(),
        validated: true
      }
    })
  }

  private addShonaCulturalRules(): void {
    // Cultural respect concepts
    this.addRule({
      id: 'totems-require-family-understanding',
      contentId: 'totems-clans',
      contentType: 'cultural_concept',
      hardPrerequisites: ['family-structure', 'extended-family'],
      softPrerequisites: ['ubuntu-philosophy'],
      culturalPrerequisites: [],
      phoneticPrerequisites: [],
      masteryLevel: 0.7,
      reason: 'Totem system requires understanding of family structures',
      category: 'cultural',
      canBypass: true,
      bypassConditions: ['heritage_seeker', 'cultural_focus'],
      cognitiveLoad: 3,
      buildingBlock: true,
      metadata: {
        createdBy: 'Cultural Team',
        lastUpdated: new Date(),
        validated: true
      }
    })

    // Traditional ceremonies
    this.addRule({
      id: 'ceremonies-require-cultural-base',
      contentId: 'traditional-ceremonies',
      contentType: 'cultural_concept',
      hardPrerequisites: ['ancestors-respect', 'community-values'],
      softPrerequisites: ['totems-clans'],
      culturalPrerequisites: [],
      phoneticPrerequisites: [],
      masteryLevel: 0.8,
      reason: 'Ceremony understanding requires spiritual and social context',
      category: 'cultural',
      canBypass: false,
      bypassConditions: [],
      cognitiveLoad: 4,
      buildingBlock: false,
      metadata: {
        createdBy: 'Cultural Team',
        lastUpdated: new Date(),
        validated: true
      }
    })
  }

  private addShonaPronunciationRules(): void {
    // Tone patterns
    this.addRule({
      id: 'complex-tones-require-basic',
      contentId: 'complex-tone-patterns',
      contentType: 'pronunciation',
      hardPrerequisites: ['high-low-tones', 'tone-recognition'],
      softPrerequisites: [],
      culturalPrerequisites: [],
      phoneticPrerequisites: [],
      masteryLevel: 0.8,
      reason: 'Complex tone patterns require mastery of basic tones',
      category: 'pronunciation',
      canBypass: false,
      bypassConditions: [],
      cognitiveLoad: 4,
      buildingBlock: true,
      metadata: {
        createdBy: 'Pronunciation Team',
        lastUpdated: new Date(),
        validated: true
      }
    })

    // Whistled consonants
    this.addRule({
      id: 'whistled-consonants-progression',
      contentId: 'dzv-sounds',
      contentType: 'pronunciation',
      hardPrerequisites: ['sv-sounds', 'zv-sounds'],
      softPrerequisites: ['tsv-sounds'],
      culturalPrerequisites: [],
      phoneticPrerequisites: [],
      masteryLevel: 0.7,
      reason: 'Complex whistled sounds build on simpler ones',
      category: 'pronunciation',
      canBypass: false,
      bypassConditions: [],
      cognitiveLoad: 3,
      buildingBlock: false,
      metadata: {
        createdBy: 'Pronunciation Team',
        lastUpdated: new Date(),
        validated: true
      }
    })
  }

  private buildDependencyGraph(): DependencyGraph {
    const nodes: ContentNode[] = []
    const edges: DependencyEdge[] = []
    const clusters: ContentCluster[] = []

    // Build nodes from rules
    for (const [contentId, rule] of this.rules) {
      nodes.push({
        id: contentId,
        type: rule.contentType,
        difficulty: this.estimateDifficulty(rule),
        category: rule.category,
        culturalComplexity: rule.cognitiveLoad,
        phoneticComplexity: this.estimatePhoneticComplexity(contentId),
        cognitiveLoad: rule.cognitiveLoad,
        masteryTime: this.estimateMasteryTime(rule),
        retentionDifficulty: this.estimateRetentionDifficulty(rule),
        buildingBlock: rule.buildingBlock,
        culturalContext: rule.category,
        frequencyOfUse: this.estimateFrequency(contentId),
        registerLevel: this.estimateRegister(contentId)
      })

      // Build edges from prerequisites
      for (const prereqId of rule.hardPrerequisites) {
        edges.push({
          fromId: prereqId,
          toId: contentId,
          type: 'hard',
          strength: 1.0,
          reason: `Required for ${rule.reason}`
        })
      }

      for (const prereqId of rule.softPrerequisites) {
        edges.push({
          fromId: prereqId,
          toId: contentId,
          type: 'soft',
          strength: 0.7,
          reason: `Helpful for ${rule.reason}`
        })
      }
    }

    // Build clusters by category
    const categoryGroups = new Map<string, string[]>()
    for (const node of nodes) {
      if (!categoryGroups.has(node.category)) {
        categoryGroups.set(node.category, [])
      }
      categoryGroups.get(node.category)!.push(node.id)
    }

    for (const [category, contentIds] of categoryGroups) {
      clusters.push({
        id: `cluster-${category}`,
        name: category.charAt(0).toUpperCase() + category.slice(1),
        description: `${category} related content`,
        theme: category,
        contentIds,
        optimalOrder: this.calculateOptimalOrderForCluster(contentIds)
      })
    }

    return { nodes, edges, clusters }
  }

  private evaluateBypassConditions(rule: PrerequisiteRule, userProfile: any): boolean {
    return rule.bypassConditions.some(condition => {
      switch (condition) {
        case 'heritage_seeker':
          return userProfile.culturalBackground === 'heritage_seeker'
        case 'cultural_focus':
          return userProfile.goals?.includes('culture')
        case 'advanced_learner':
          return userProfile.currentLevel >= 7
        default:
          return false
      }
    })
  }

  private getBypassReason(rule: PrerequisiteRule, userProfile: any): string {
    if (userProfile.culturalBackground === 'heritage_seeker') {
      return 'Heritage seekers can explore cultural content with foundational understanding'
    }
    if (userProfile.currentLevel >= 7) {
      return 'Advanced learners can handle increased cognitive load'
    }
    return 'Special conditions allow bypassing normal prerequisites'
  }

  // Utility methods for calculations
  private estimateDifficulty(rule: PrerequisiteRule): number {
    return Math.min(10, rule.cognitiveLoad + rule.hardPrerequisites.length)
  }

  private estimatePhoneticComplexity(contentId: string): number {
    // This would analyze the actual phonetic content
    // For now, return a default value
    return 3
  }

  private estimateMasteryTime(rule: PrerequisiteRule): number {
    return rule.cognitiveLoad * 15 + rule.hardPrerequisites.length * 5
  }

  private estimateRetentionDifficulty(rule: PrerequisiteRule): number {
    return rule.cognitiveLoad
  }

  private estimateFrequency(contentId: string): 'high' | 'medium' | 'low' {
    // This would use frequency data
    return 'medium'
  }

  private estimateRegister(contentId: string): 'formal' | 'informal' | 'neutral' {
    return 'neutral'
  }

  private calculateOptimalOrderForCluster(contentIds: string[]): string[] {
    // Simplified ordering - in practice this would be more sophisticated
    return contentIds.sort()
  }

  private buildSubgraph(contentIds: string[]): DependencyGraph {
    // Build a subgraph containing only the specified content and their dependencies
    const relevantNodes = this.dependencyGraph.nodes.filter(n => contentIds.includes(n.id))
    const relevantEdges = this.dependencyGraph.edges.filter(e => 
      contentIds.includes(e.fromId) || contentIds.includes(e.toId)
    )
    
    return {
      nodes: relevantNodes,
      edges: relevantEdges,
      clusters: []
    }
  }

  private topologicalSort(graph: DependencyGraph, userMastery: Map<string, number>): string[] {
    // Implement topological sort with consideration for user mastery
    const visited = new Set<string>()
    const result: string[] = []
    
    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return
      visited.add(nodeId)
      
      // Visit dependencies first
      const dependencies = graph.edges
        .filter(e => e.toId === nodeId && e.type === 'hard')
        .map(e => e.fromId)
      
      for (const depId of dependencies) {
        visit(depId)
      }
      
      result.push(nodeId)
    }
    
    for (const node of graph.nodes) {
      visit(node.id)
    }
    
    return result
  }

  private identifyParallelGroups(sequence: string[], graph: DependencyGraph): string[][] {
    // Identify content that can be learned in parallel
    const groups: string[][] = []
    const processed = new Set<string>()
    
    for (const contentId of sequence) {
      if (processed.has(contentId)) continue
      
      const group = [contentId]
      processed.add(contentId)
      
      // Find other content at the same level
      for (const otherId of sequence) {
        if (processed.has(otherId)) continue
        
        const hasDirectDependency = graph.edges.some(e => 
          (e.fromId === contentId && e.toId === otherId) ||
          (e.fromId === otherId && e.toId === contentId)
        )
        
        if (!hasDirectDependency) {
          group.push(otherId)
          processed.add(otherId)
        }
      }
      
      if (group.length > 1) {
        groups.push(group)
      }
    }
    
    return groups
  }

  private generateSequenceReasoning(sequence: string[], graph: DependencyGraph): string[] {
    return sequence.map(contentId => {
      const dependencies = graph.edges
        .filter(e => e.toId === contentId)
        .map(e => e.fromId)
      
      if (dependencies.length === 0) {
        return `${contentId}: Foundational content with no dependencies`
      } else {
        return `${contentId}: Builds on ${dependencies.join(', ')}`
      }
    })
  }

  private calculateContentScore(
    contentId: string, 
    node: ContentNode, 
    userMastery: Map<string, number>, 
    userProfile: any
  ): number {
    let score = 0
    
    // Foundational content gets higher priority
    if (node.buildingBlock) score += 20
    
    // Appropriate difficulty level
    const difficultyGap = Math.abs(node.difficulty - userProfile.currentLevel)
    if (difficultyGap <= 1) score += 15
    else if (difficultyGap <= 2) score += 10
    else score -= 5
    
    // Cultural relevance
    if (userProfile.culturalBackground === 'heritage_seeker' && node.culturalComplexity > 3) {
      score += 10
    }
    
    // Frequency of use
    if (node.frequencyOfUse === 'high') score += 10
    else if (node.frequencyOfUse === 'medium') score += 5
    
    return score
  }

  private determineContentType(
    contentId: string, 
    userMastery: Map<string, number>
  ): 'foundational' | 'progressive' | 'reinforcement' | 'cultural' {
    const node = this.dependencyGraph.nodes.find(n => n.id === contentId)
    if (!node) return 'progressive'
    
    if (node.buildingBlock) return 'foundational'
    if (node.category === 'cultural') return 'cultural'
    
    const mastery = userMastery.get(contentId) || 0
    if (mastery > 0 && mastery < 0.8) return 'reinforcement'
    
    return 'progressive'
  }

  private generateRecommendationReason(
    contentId: string, 
    type: string, 
    userProfile: any
  ): string {
    switch (type) {
      case 'foundational':
        return `Essential building block for future learning`
      case 'cultural':
        return `Important cultural concept for deeper understanding`
      case 'reinforcement':
        return `Review to strengthen existing knowledge`
      default:
        return `Next logical step in your learning progression`
    }
  }

  private detectCycles(): string[][] {
    // Simplified cycle detection - would implement proper algorithm
    return []
  }

  private findUnreachableContent(): string[] {
    // Find content with no path from foundational content
    return []
  }

  private isBasicContent(contentId: string): boolean {
    // Check if this is basic content that doesn't need rules
    const basicContent = ['mhoro', 'motsi', 'piri', 'tatu']
    return basicContent.includes(contentId)
  }

  private calculateMaxDepth(): number {
    // Calculate the maximum depth of the dependency tree
    return 5 // placeholder
  }

  private findFoundationalContent(): string[] {
    return Array.from(this.rules.values())
      .filter(rule => rule.buildingBlock && rule.hardPrerequisites.length === 0)
      .map(rule => rule.contentId)
  }

  private findTerminalContent(): string[] {
    const allPrereqs = new Set<string>()
    for (const rule of this.rules.values()) {
      rule.hardPrerequisites.forEach(p => allPrereqs.add(p))
    }
    
    return Array.from(this.rules.keys()).filter(id => !allPrereqs.has(id))
  }

  private findMostConnectedContent(): string[] {
    const connectionCounts = new Map<string, number>()
    
    for (const rule of this.rules.values()) {
      connectionCounts.set(rule.contentId, rule.hardPrerequisites.length)
    }
    
    return Array.from(connectionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id)
  }
}

class ShonaLanguageRules {
  checkShonaPrerequisites(
    contentId: string,
    userMastery: Map<string, number>,
    userProfile: any
  ): { missing: string[], recommendations: string[] } {
    const missing: string[] = []
    const recommendations: string[] = []

    // Tone-specific rules
    if (this.requiresToneUnderstanding(contentId)) {
      if (!userMastery.has('basic-tones') || userMastery.get('basic-tones')! < 0.6) {
        missing.push('basic-tones')
        recommendations.push('Practice basic tone recognition before complex vocabulary')
      }
    }

    // Cultural context rules
    if (this.requiresCulturalContext(contentId)) {
      if (userProfile.culturalBackground !== 'heritage_seeker' && 
          (!userMastery.has('basic-culture') || userMastery.get('basic-culture')! < 0.5)) {
        recommendations.push('Review cultural context for better understanding')
      }
    }

    return { missing, recommendations }
  }

  private requiresToneUnderstanding(contentId: string): boolean {
    const toneHeavyContent = ['complex-verbs', 'advanced-vocabulary', 'tone-pairs']
    return toneHeavyContent.includes(contentId)
  }

  private requiresCulturalContext(contentId: string): boolean {
    const culturalContent = ['respect-terms', 'family-hierarchy', 'traditional-concepts']
    return culturalContent.includes(contentId)
  }
}

export default PrerequisiteSystem