interface ConflictData {
  contentType: string
  contentId: string
  localVersion: number
  remoteVersion: number
  localData: any
  remoteData: any
  localHash: string
  remoteHash: string
  timestamp: number
  platform: string
}

interface ConflictResolution {
  strategy: ConflictStrategy
  resolvedData: any
  metadata: {
    originalLocal: any
    originalRemote: any
    conflictReason: string
    resolutionReason: string
    timestamp: number
    autoResolved: boolean
  }
}

interface MergeResult {
  success: boolean
  data: any
  conflicts: string[]
  warnings: string[]
  metadata: {
    mergeStrategy: string
    fieldsMerged: string[]
    fieldsSkipped: string[]
    customMergeApplied: boolean
  }
}

type ConflictStrategy = 
  | 'remote_wins'           // Always use remote version
  | 'local_wins'            // Always use local version  
  | 'latest_timestamp'      // Use version with latest timestamp
  | 'highest_version'       // Use version with highest version number
  | 'intelligent_merge'     // Smart field-by-field merge
  | 'user_choice'          // Require manual user resolution
  | 'content_aware'        // Use content-specific merge rules

class ConflictResolutionService {
  private resolutionHistory: ConflictResolution[] = []
  private customMergeRules: Map<string, (local: any, remote: any) => MergeResult> = new Map()
  private conflictQueue: ConflictData[] = []
  private eventListeners: Map<string, Function[]> = new Map()
  
  private defaultStrategy: ConflictStrategy = 'intelligent_merge'
  private maxHistorySize = 1000
  private autoResolveThreshold = 0.95 // Confidence threshold for auto-resolution

  constructor() {
    this.setupDefaultMergeRules()
  }

  async resolveConflict(conflict: ConflictData, strategy?: ConflictStrategy): Promise<ConflictResolution> {
    const selectedStrategy = strategy || this.getStrategyForContent(conflict.contentType)
    
    console.log(`Resolving conflict for ${conflict.contentType}:${conflict.contentId} using ${selectedStrategy}`)
    
    let resolvedData: any
    let autoResolved = true
    let resolutionReason = ''

    try {
      switch (selectedStrategy) {
        case 'remote_wins':
          resolvedData = conflict.remoteData
          resolutionReason = 'Remote version selected by strategy'
          break

        case 'local_wins':
          resolvedData = conflict.localData
          resolutionReason = 'Local version selected by strategy'
          break

        case 'latest_timestamp':
          resolvedData = await this.resolveByTimestamp(conflict)
          resolutionReason = 'Version with latest timestamp selected'
          break

        case 'highest_version':
          resolvedData = await this.resolveByVersion(conflict)
          resolutionReason = 'Version with highest version number selected'
          break

        case 'intelligent_merge':
          const mergeResult = await this.performIntelligentMerge(conflict)
          resolvedData = mergeResult.data
          resolutionReason = `Intelligent merge: ${mergeResult.metadata.mergeStrategy}`
          autoResolved = mergeResult.success && mergeResult.conflicts.length === 0
          break

        case 'content_aware':
          const contentResult = await this.performContentAwareMerge(conflict)
          resolvedData = contentResult.data
          resolutionReason = `Content-aware merge for ${conflict.contentType}`
          autoResolved = contentResult.success
          break

        case 'user_choice':
          // Queue for manual resolution
          this.queueForManualResolution(conflict)
          throw new Error('Manual resolution required')

        default:
          throw new Error(`Unknown conflict strategy: ${selectedStrategy}`)
      }

      const resolution: ConflictResolution = {
        strategy: selectedStrategy,
        resolvedData,
        metadata: {
          originalLocal: conflict.localData,
          originalRemote: conflict.remoteData,
          conflictReason: this.analyzeConflictReason(conflict),
          resolutionReason,
          timestamp: Date.now(),
          autoResolved
        }
      }

      // Store in history
      this.addToHistory(resolution)

      // Emit resolution event
      this.emit('conflictResolved', {
        conflict,
        resolution,
        strategy: selectedStrategy
      })

      return resolution

    } catch (error) {
      console.error('Failed to resolve conflict:', error)
      
      // Fallback to remote_wins if all else fails
      if (selectedStrategy !== 'remote_wins') {
        return this.resolveConflict(conflict, 'remote_wins')
      }
      
      throw error
    }
  }

  private async resolveByTimestamp(conflict: ConflictData): Promise<any> {
    // Compare timestamps from metadata
    const localTimestamp = this.extractTimestamp(conflict.localData)
    const remoteTimestamp = this.extractTimestamp(conflict.remoteData)
    
    if (remoteTimestamp > localTimestamp) {
      return conflict.remoteData
    } else if (localTimestamp > remoteTimestamp) {
      return conflict.localData
    } else {
      // If timestamps are equal, fall back to version number
      return conflict.remoteVersion >= conflict.localVersion ? conflict.remoteData : conflict.localData
    }
  }

  private async resolveByVersion(conflict: ConflictData): Promise<any> {
    return conflict.remoteVersion >= conflict.localVersion ? conflict.remoteData : conflict.localData
  }

  private async performIntelligentMerge(conflict: ConflictData): Promise<MergeResult> {
    const local = conflict.localData
    const remote = conflict.remoteData
    
    // Start with the base (newer version as base)
    const base = conflict.remoteVersion >= conflict.localVersion ? remote : local
    const overlay = conflict.remoteVersion >= conflict.localVersion ? local : remote
    
    const result: MergeResult = {
      success: true,
      data: JSON.parse(JSON.stringify(base)), // Deep clone
      conflicts: [],
      warnings: [],
      metadata: {
        mergeStrategy: 'intelligent_merge',
        fieldsMerged: [],
        fieldsSkipped: [],
        customMergeApplied: false
      }
    }

    try {
      await this.mergeObjects(result.data, overlay, base, '', result)
      return result
    } catch (error) {
      console.error('Intelligent merge failed:', error)
      result.success = false
      result.conflicts.push(`Merge failed: ${error}`)
      return result
    }
  }

  private async mergeObjects(
    target: any, 
    source: any, 
    base: any, 
    path: string, 
    result: MergeResult
  ): Promise<void> {
    for (const [key, sourceValue] of Object.entries(source)) {
      const currentPath = path ? `${path}.${key}` : key
      const targetValue = target[key]
      const baseValue = base[key]

      if (this.isEqual(sourceValue, targetValue)) {
        // Values are identical, no merge needed
        continue
      }

      if (this.isEqual(sourceValue, baseValue)) {
        // Source hasn't changed from base, keep target value
        continue
      }

      if (this.isEqual(targetValue, baseValue)) {
        // Target hasn't changed from base, use source value
        target[key] = sourceValue
        result.metadata.fieldsMerged.push(currentPath)
        continue
      }

      // Both values have changed - need conflict resolution
      if (this.isObject(sourceValue) && this.isObject(targetValue)) {
        // Recursively merge objects
        await this.mergeObjects(targetValue, sourceValue, baseValue || {}, currentPath, result)
      } else if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        // Merge arrays intelligently
        target[key] = await this.mergeArrays(targetValue, sourceValue, baseValue || [], currentPath, result)
      } else {
                 // Primitive conflict - apply resolution strategy
         const resolved = await this.resolvePrimitiveConflict(
           targetValue, 
           sourceValue, 
           currentPath, 
           'unknown' // TODO: Pass actual content type through the method chain
         )
        
        if (resolved.success) {
          target[key] = resolved.value
          result.metadata.fieldsMerged.push(currentPath)
        } else {
          result.conflicts.push(`Conflict at ${currentPath}: ${resolved.reason}`)
          // Keep target value as fallback
        }
      }
    }
  }

  private async mergeArrays(
    target: any[], 
    source: any[], 
    base: any[], 
    path: string, 
    result: MergeResult
  ): Promise<any[]> {
    // For arrays, we'll use a union approach with intelligent deduplication
    const merged = [...target]
    
    for (const sourceItem of source) {
      const existingIndex = this.findArrayItemIndex(merged, sourceItem)
      
      if (existingIndex === -1) {
        // Item doesn't exist in target, add it
        merged.push(sourceItem)
        result.metadata.fieldsMerged.push(`${path}[+${merged.length - 1}]`)
      } else {
        // Item exists, merge if both are objects
        if (this.isObject(sourceItem) && this.isObject(merged[existingIndex])) {
          const baseItem = this.findArrayItem(base, sourceItem) || {}
          await this.mergeObjects(merged[existingIndex], sourceItem, baseItem, `${path}[${existingIndex}]`, result)
        }
      }
    }
    
    return merged
  }

  private async resolvePrimitiveConflict(
    localValue: any, 
    remoteValue: any, 
    path: string, 
    contentType: string
  ): Promise<{ success: boolean; value: any; reason: string }> {
    // Content-specific resolution rules
    switch (contentType) {
      case 'lessons':
        return this.resolveLessonFieldConflict(localValue, remoteValue, path)
      case 'vocabulary':
        return this.resolveVocabularyFieldConflict(localValue, remoteValue, path)
      case 'exercises':
        return this.resolveExerciseFieldConflict(localValue, remoteValue, path)
      default:
        return this.resolveGenericFieldConflict(localValue, remoteValue, path)
    }
  }

  private resolveLessonFieldConflict(
    local: any, 
    remote: any, 
    path: string
  ): { success: boolean; value: any; reason: string } {
    // Lesson-specific conflict resolution
    if (path.includes('title') || path.includes('description')) {
      // For titles and descriptions, prefer longer, more descriptive versions
      const localLength = String(local).length
      const remoteLength = String(remote).length
      
      if (remoteLength > localLength * 1.2) {
        return { success: true, value: remote, reason: 'Remote has more descriptive content' }
      } else if (localLength > remoteLength * 1.2) {
        return { success: true, value: local, reason: 'Local has more descriptive content' }
      }
    }
    
    if (path.includes('difficulty') || path.includes('level')) {
      // For difficulty, prefer higher values (more detailed assessment)
      const remoteNum = Number(remote)
      const localNum = Number(local)
      if (!isNaN(remoteNum) && !isNaN(localNum)) {
        return { 
          success: true, 
          value: Math.max(remoteNum, localNum), 
          reason: 'Higher difficulty value selected' 
        }
      }
    }
    
    return this.resolveGenericFieldConflict(local, remote, path)
  }

  private resolveVocabularyFieldConflict(
    local: any, 
    remote: any, 
    path: string
  ): { success: boolean; value: any; reason: string } {
    // Vocabulary-specific conflict resolution
         if (path.includes('pronunciation')) {
       // For pronunciation, prefer more detailed phonetic notation
       const localDetail = (String(local).includes('/') ? 1 : 0) + (String(local).includes('-') ? 1 : 0)
       const remoteDetail = (String(remote).includes('/') ? 1 : 0) + (String(remote).includes('-') ? 1 : 0)
      
      if (remoteDetail > localDetail) {
        return { success: true, value: remote, reason: 'Remote has more detailed pronunciation' }
      } else if (localDetail > remoteDetail) {
        return { success: true, value: local, reason: 'Local has more detailed pronunciation' }
      }
    }
    
    if (path.includes('culturalContext')) {
      // For cultural context, prefer longer explanations
      if (String(remote).length > String(local).length) {
        return { success: true, value: remote, reason: 'Remote has richer cultural context' }
      }
    }
    
    return this.resolveGenericFieldConflict(local, remote, path)
  }

  private resolveExerciseFieldConflict(
    local: any, 
    remote: any, 
    path: string
  ): { success: boolean; value: any; reason: string } {
    // Exercise-specific conflict resolution
    if (path.includes('points') || path.includes('score')) {
      // For scoring, prefer higher values (more generous scoring)
      const remoteNum = Number(remote)
      const localNum = Number(local)
      if (!isNaN(remoteNum) && !isNaN(localNum)) {
        return { 
          success: true, 
          value: Math.max(remoteNum, localNum), 
          reason: 'Higher score value selected' 
        }
      }
    }
    
    return this.resolveGenericFieldConflict(local, remote, path)
  }

  private resolveGenericFieldConflict(
    local: any, 
    remote: any, 
    path: string
  ): { success: boolean; value: any; reason: string } {
    // Generic conflict resolution strategies
    
    // If one value is null/undefined, use the other
    if (local == null && remote != null) {
      return { success: true, value: remote, reason: 'Local value is null' }
    }
    if (remote == null && local != null) {
      return { success: true, value: local, reason: 'Remote value is null' }
    }
    
    // For numbers, use the larger value
    if (typeof local === 'number' && typeof remote === 'number') {
      return { 
        success: true, 
        value: Math.max(local, remote), 
        reason: 'Larger numeric value selected' 
      }
    }
    
    // For strings, prefer non-empty and longer values
    if (typeof local === 'string' && typeof remote === 'string') {
      if (local.length === 0 && remote.length > 0) {
        return { success: true, value: remote, reason: 'Remote string is non-empty' }
      }
      if (remote.length === 0 && local.length > 0) {
        return { success: true, value: local, reason: 'Local string is non-empty' }
      }
      if (remote.length > local.length * 1.5) {
        return { success: true, value: remote, reason: 'Remote string is significantly longer' }
      }
      if (local.length > remote.length * 1.5) {
        return { success: true, value: local, reason: 'Local string is significantly longer' }
      }
    }
    
    // For boolean values, prefer true over false (more permissive)
    if (typeof local === 'boolean' && typeof remote === 'boolean') {
      return { 
        success: true, 
        value: local || remote, 
        reason: 'More permissive boolean value selected' 
      }
    }
    
    // Default to remote value
    return { 
      success: true, 
      value: remote, 
      reason: 'Default to remote value' 
    }
  }

  private async performContentAwareMerge(conflict: ConflictData): Promise<MergeResult> {
    // Check for custom merge rules
    const customRule = this.customMergeRules.get(conflict.contentType)
    
    if (customRule) {
      const result = customRule(conflict.localData, conflict.remoteData)
      result.metadata.customMergeApplied = true
      return result
    }
    
    // Fall back to intelligent merge
    return this.performIntelligentMerge(conflict)
  }

  private getStrategyForContent(contentType: string): ConflictStrategy {
    // Content-specific default strategies
    switch (contentType) {
      case 'lessons':
        return 'intelligent_merge'
      case 'vocabulary':
        return 'content_aware'
      case 'exercises':
        return 'highest_version'
      case 'cultural_notes':
        return 'intelligent_merge'
      case 'audio':
        return 'latest_timestamp'
      default:
        return this.defaultStrategy
    }
  }

  private analyzeConflictReason(conflict: ConflictData): string {
    if (conflict.localVersion !== conflict.remoteVersion) {
      return `Version mismatch: local v${conflict.localVersion} vs remote v${conflict.remoteVersion}`
    }
    
    if (conflict.localHash !== conflict.remoteHash) {
      return 'Content hash mismatch - data has diverged'
    }
    
    return 'Unknown conflict reason'
  }

  private extractTimestamp(data: any): number {
    // Try to extract timestamp from various possible locations
    if (data.metadata?.lastUpdated) {
      return new Date(data.metadata.lastUpdated).getTime()
    }
    if (data.lastModified) {
      return new Date(data.lastModified).getTime()
    }
    if (data.timestamp) {
      return new Date(data.timestamp).getTime()
    }
    if (data.updatedAt) {
      return new Date(data.updatedAt).getTime()
    }
    
    return 0 // Default to epoch if no timestamp found
  }

  private isEqual(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b)
  }

  private isObject(value: any): boolean {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }

  private findArrayItemIndex(array: any[], item: any): number {
    // Try to find by ID first
    if (item.id) {
      return array.findIndex(arr => arr.id === item.id)
    }
    
    // Fall back to deep equality
    return array.findIndex(arr => this.isEqual(arr, item))
  }

  private findArrayItem(array: any[], item: any): any {
    const index = this.findArrayItemIndex(array, item)
    return index !== -1 ? array[index] : null
  }

  private setupDefaultMergeRules(): void {
    // Set up default merge rules for different content types
    this.customMergeRules.set('vocabulary', (local: any, remote: any) => {
      // Vocabulary-specific merge logic
      const merged = { ...remote } // Start with remote as base
      
      // Merge arrays intelligently
      if (local.examples && remote.examples) {
        merged.examples = [...new Set([...local.examples, ...remote.examples])]
      }
      
      // Keep the most detailed pronunciation
      if (local.pronunciation && remote.pronunciation) {
        if (local.pronunciation.length > remote.pronunciation.length) {
          merged.pronunciation = local.pronunciation
        }
      }
      
      // Merge cultural context
      if (local.culturalContext && remote.culturalContext) {
        merged.culturalContext = local.culturalContext.length > remote.culturalContext.length 
          ? local.culturalContext 
          : remote.culturalContext
      }
      
      return {
        success: true,
        data: merged,
        conflicts: [],
        warnings: [],
        metadata: {
          mergeStrategy: 'vocabulary_custom',
          fieldsMerged: ['examples', 'pronunciation', 'culturalContext'],
          fieldsSkipped: [],
          customMergeApplied: true
        }
      }
    })
  }

  private queueForManualResolution(conflict: ConflictData): void {
    this.conflictQueue.push(conflict)
    this.emit('manualResolutionRequired', conflict)
  }

  private addToHistory(resolution: ConflictResolution): void {
    this.resolutionHistory.push(resolution)
    
    // Limit history size
    if (this.resolutionHistory.length > this.maxHistorySize) {
      this.resolutionHistory = this.resolutionHistory.slice(-this.maxHistorySize)
    }
  }

  // Public API methods
  public addCustomMergeRule(
    contentType: string, 
    mergeFunction: (local: any, remote: any) => MergeResult
  ): void {
    this.customMergeRules.set(contentType, mergeFunction)
  }

  public setDefaultStrategy(strategy: ConflictStrategy): void {
    this.defaultStrategy = strategy
  }

  public getConflictHistory(): ConflictResolution[] {
    return [...this.resolutionHistory]
  }

  public getQueuedConflicts(): ConflictData[] {
    return [...this.conflictQueue]
  }

  public async resolveQueuedConflict(conflictId: string, resolution: any): Promise<void> {
    const index = this.conflictQueue.findIndex(c => 
      `${c.contentType}:${c.contentId}` === conflictId
    )
    
    if (index !== -1) {
      const conflict = this.conflictQueue.splice(index, 1)[0]
      
      const resolvedConflict: ConflictResolution = {
        strategy: 'user_choice',
        resolvedData: resolution,
        metadata: {
          originalLocal: conflict.localData,
          originalRemote: conflict.remoteData,
          conflictReason: this.analyzeConflictReason(conflict),
          resolutionReason: 'Manual user resolution',
          timestamp: Date.now(),
          autoResolved: false
        }
      }
      
      this.addToHistory(resolvedConflict)
      this.emit('manualConflictResolved', { conflict, resolution: resolvedConflict })
    }
  }

  public getConflictStatistics(): any {
    const stats = {
      totalConflicts: this.resolutionHistory.length,
      autoResolved: 0,
      manualResolved: 0,
      strategiesUsed: {} as Record<string, number>,
      contentTypesAffected: {} as Record<string, number>,
      averageResolutionTime: 0,
      successRate: 0
    }
    
    this.resolutionHistory.forEach(resolution => {
      if (resolution.metadata.autoResolved) {
        stats.autoResolved++
      } else {
        stats.manualResolved++
      }
      
      stats.strategiesUsed[resolution.strategy] = (stats.strategiesUsed[resolution.strategy] || 0) + 1
    })
    
    stats.successRate = stats.totalConflicts > 0 ? stats.autoResolved / stats.totalConflicts : 0
    
    return stats
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(data))
    }
  }
}

// Create singleton instance
const conflictResolutionService = new ConflictResolutionService()

export { conflictResolutionService, ConflictResolutionService }
export type { ConflictData, ConflictResolution, MergeResult, ConflictStrategy }