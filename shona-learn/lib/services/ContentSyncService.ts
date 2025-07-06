interface ContentVersion {
  id: string
  version: number
  contentType: 'lessons' | 'vocabulary' | 'audio' | 'exercises' | 'cultural_notes'
  hash: string
  timestamp: string
  size: number
  dependencies?: string[]
}

interface ContentManifest {
  version: string
  lastUpdated: string
  platform: string
  content: {
    lessons: ContentVersion
    vocabulary: ContentVersion
    audio: ContentVersion
    exercises: ContentVersion
    cultural_notes: ContentVersion
  }
  metadata: {
    totalSize: number
    requiredVersion: string
    compatibilityVersion: string
  }
}

interface SyncResult {
  success: boolean
  updatedContent: string[]
  errors: string[]
  totalUpdates: number
  syncDuration: number
}

interface SyncOptions {
  forceSync?: boolean
  contentTypes?: string[]
  priority?: 'high' | 'normal' | 'low'
  backgroundSync?: boolean
  retryCount?: number
}

class ContentSyncService {
  private apiBaseUrl: string
  private platform: string
  private localManifest: ContentManifest | null = null
  private syncInProgress: boolean = false
  private syncQueue: Array<{ contentType: string; priority: number }> = []
  private eventListeners: Map<string, Function[]> = new Map()
  private retryAttempts: Map<string, number> = new Map()
  private maxRetries: number = 3
  
  // WebSocket properties
  private websocket: WebSocket | null = null
  private websocketConnected: boolean = false
  private websocketReconnectAttempts: number = 0
  private maxWebSocketReconnectAttempts: number = 10
  private websocketHeartbeatInterval: NodeJS.Timeout | null = null

  constructor(apiBaseUrl: string, platform: string) {
    this.apiBaseUrl = apiBaseUrl
    this.platform = platform
    this.initializeSync()
  }

  private async initializeSync(): Promise<void> {
    // Load local manifest
    await this.loadLocalManifest()
    
    // Set up periodic sync check
    this.setupPeriodicSync()
    
    // Set up real-time updates if supported
    this.setupRealTimeUpdates()
    
    // Perform initial sync check
    this.checkForUpdates()
  }

  private async loadLocalManifest(): Promise<void> {
    try {
      const stored = localStorage.getItem('content-manifest')
      if (stored) {
        this.localManifest = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Failed to load local manifest:', error)
      this.localManifest = null
    }
  }

  private async saveLocalManifest(manifest: ContentManifest): Promise<void> {
    try {
      localStorage.setItem('content-manifest', JSON.stringify(manifest))
      this.localManifest = manifest
    } catch (error) {
      console.error('Failed to save local manifest:', error)
    }
  }

  private setupPeriodicSync(): void {
    // Check for updates every 30 minutes when app is active
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdates({ backgroundSync: true })
      }
    }, 30 * 60 * 1000)

    // Check immediately when app becomes visible
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdates({ backgroundSync: true })
      }
    })
  }

  private setupRealTimeUpdates(): void {
    // Enhanced WebSocket connection with sophisticated reconnection
    this.connectWebSocket()
  }

  private connectWebSocket(): void {
    try {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsHost = window.location.host
      const wsUrl = `${wsProtocol}//${wsHost}:8080?platform=${this.platform}&version=${this.localManifest?.version || '0.0.0'}`
      
      this.websocket = new WebSocket(wsUrl)
      this.websocketReconnectAttempts = 0
      
      this.websocket.onopen = () => {
        console.log('WebSocket connected')
        this.websocketConnected = true
        this.websocketReconnectAttempts = 0
        
        // Subscribe to all content types
        this.subscribeToContentUpdates(['lessons', 'vocabulary', 'exercises', 'cultural_notes', 'audio'])
        
        // Start heartbeat
        this.startWebSocketHeartbeat()
        
        this.emit('websocketConnected', { timestamp: Date.now() })
      }
      
      this.websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          this.handleWebSocketMessage(message)
        } catch (error) {
          console.warn('Invalid WebSocket message:', error)
        }
      }
      
             this.websocket.onclose = (event: CloseEvent) => {
         console.log('WebSocket disconnected:', event.code, event.reason)
         this.websocketConnected = false
         this.stopWebSocketHeartbeat()
         
         // Attempt exponential backoff reconnection
         if (this.websocketReconnectAttempts < this.maxWebSocketReconnectAttempts) {
           const delay = Math.min(1000 * Math.pow(2, this.websocketReconnectAttempts), 30000)
           this.websocketReconnectAttempts++
           
           setTimeout(() => {
             if (!this.websocketConnected) {
               this.connectWebSocket()
             }
           }, delay)
         }
         
         this.emit('websocketDisconnected', { 
           code: event.code, 
           reason: event.reason,
           willReconnect: this.websocketReconnectAttempts < this.maxWebSocketReconnectAttempts
         })
       }
       
       this.websocket.onerror = (error: Event) => {
         console.error('WebSocket error:', error)
         this.emit('websocketError', { error })
       }
      
    } catch (error) {
      console.warn('Real-time updates not available:', error)
      // Fallback to polling if WebSocket fails
      this.setupPollingFallback()
    }
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'content_update':
        this.handleContentUpdate(message.payload)
        break
        
      case 'sync_status':
        this.handleSyncStatusUpdate(message.payload)
        break
        
      case 'heartbeat':
        // Acknowledge heartbeat
        break
        
      case 'error':
        console.error('WebSocket server error:', message.payload.error)
        this.emit('websocketError', message.payload)
        break
        
      default:
        console.warn('Unknown WebSocket message type:', message.type)
    }
  }

  private subscribeToContentUpdates(contentTypes: string[]): void {
    if (!this.websocketConnected || !this.websocket) return
    
    contentTypes.forEach(contentType => {
      this.websocket!.send(JSON.stringify({
        type: 'subscribe',
        contentType,
        timestamp: Date.now()
      }))
    })
  }

  private startWebSocketHeartbeat(): void {
    this.websocketHeartbeatInterval = setInterval(() => {
      if (this.websocketConnected && this.websocket) {
        this.websocket.send(JSON.stringify({
          type: 'heartbeat',
          timestamp: Date.now()
        }))
      }
    }, 15000) // Send heartbeat every 15 seconds
  }

  private stopWebSocketHeartbeat(): void {
    if (this.websocketHeartbeatInterval) {
      clearInterval(this.websocketHeartbeatInterval)
      this.websocketHeartbeatInterval = null
    }
  }

  private setupPollingFallback(): void {
    // Fallback to polling every 2 minutes if WebSocket is unavailable
    setInterval(() => {
      if (!this.websocketConnected) {
        this.checkForUpdates({ backgroundSync: true })
      }
    }, 2 * 60 * 1000)
  }

  private handleContentUpdate(payload: any): void {
    console.log('Received content update:', payload)
    
    // Trigger immediate sync for high priority updates
    if (payload.priority === 'high') {
      this.checkForUpdates({ 
        contentTypes: [payload.contentType],
        priority: 'high' 
      })
    } else {
      // Queue normal/low priority updates
      this.queueUpdates([payload.contentType], payload.priority || 'normal')
    }
    
    this.emit('contentUpdated', {
      contentType: payload.contentType,
      version: payload.version,
      priority: payload.priority
    })
  }

  private handleSyncStatusUpdate(payload: any): void {
    console.log('Received sync status update:', payload)
    this.emit('syncStatusUpdate', payload)
  }

  private async handleRealTimeUpdate(update: any): Promise<void> {
    if (update.type === 'content_updated') {
      await this.checkForUpdates({ 
        contentTypes: [update.contentType],
        priority: 'high' 
      })
      
      this.emit('contentUpdated', {
        contentType: update.contentType,
        version: update.version
      })
    }
  }

  async checkForUpdates(options: SyncOptions = {}): Promise<boolean> {
    try {
      const remoteManifest = await this.fetchRemoteManifest()
      const updatesNeeded = this.compareManifests(this.localManifest, remoteManifest)
      
      if (updatesNeeded.length > 0) {
        if (options.backgroundSync && updatesNeeded.length > 2) {
          // Queue updates for later if too many in background
          this.queueUpdates(updatesNeeded, options.priority || 'normal')
          return false
        }
        
        await this.syncContent(updatesNeeded, options)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to check for updates:', error)
      return false
    }
  }

  private async fetchRemoteManifest(): Promise<ContentManifest> {
    const response = await fetch(`${this.apiBaseUrl}/sync/manifest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Platform': this.platform,
        'Client-Version': this.localManifest?.version || '0.0.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch manifest: ${response.statusText}`)
    }
    
    return response.json()
  }

  private compareManifests(local: ContentManifest | null, remote: ContentManifest): string[] {
    if (!local) {
      return Object.keys(remote.content)
    }
    
    const updatesNeeded: string[] = []
    
    for (const [contentType, remoteVersion] of Object.entries(remote.content)) {
      const localVersion = local.content[contentType as keyof typeof local.content]
      
      if (!localVersion || localVersion.version < remoteVersion.version || 
          localVersion.hash !== remoteVersion.hash) {
        updatesNeeded.push(contentType)
      }
    }
    
    return updatesNeeded
  }

  private queueUpdates(contentTypes: string[], priority: string): void {
    const priorityNum = priority === 'high' ? 1 : priority === 'normal' ? 2 : 3
    
    contentTypes.forEach(contentType => {
      this.syncQueue.push({ contentType, priority: priorityNum })
    })
    
    // Sort queue by priority
    this.syncQueue.sort((a, b) => a.priority - b.priority)
  }

  async syncContent(contentTypes: string[], options: SyncOptions = {}): Promise<SyncResult> {
    if (this.syncInProgress && !options.forceSync) {
      throw new Error('Sync already in progress')
    }

    this.syncInProgress = true
    const startTime = Date.now()
    const result: SyncResult = {
      success: true,
      updatedContent: [],
      errors: [],
      totalUpdates: 0,
      syncDuration: 0
    }

    try {
      this.emit('syncStarted', { contentTypes, options })
      
      for (const contentType of contentTypes) {
        try {
          await this.syncContentType(contentType, options)
          result.updatedContent.push(contentType)
          result.totalUpdates++
          
          this.emit('contentSynced', { contentType })
        } catch (error) {
          const errorMsg = `Failed to sync ${contentType}: ${error}`
          result.errors.push(errorMsg)
          console.error(errorMsg)
          
          // Handle retry logic
          await this.handleSyncError(contentType, error as Error, options)
        }
      }
      
      // Update local manifest if any content was synced
      if (result.updatedContent.length > 0) {
        const newManifest = await this.fetchRemoteManifest()
        await this.saveLocalManifest(newManifest)
      }
      
      result.success = result.errors.length === 0
      
    } catch (error) {
      result.success = false
      result.errors.push(`Sync failed: ${error}`)
    } finally {
      this.syncInProgress = false
      result.syncDuration = Date.now() - startTime
      
      this.emit('syncCompleted', result)
    }

    return result
  }

  private async syncContentType(contentType: string, options: SyncOptions): Promise<void> {
    // Download content with retry logic
    const content = await this.downloadContent(contentType, options.retryCount || 0)
    
    // Validate content integrity
    await this.validateContent(contentType, content)
    
    // Store content locally
    await this.storeContent(contentType, content)
    
    // Update cache
    await this.updateContentCache(contentType, content)
    
    // Trigger platform-specific processing
    await this.processContentForPlatform(contentType, content)
  }

  private async downloadContent(contentType: string, retryCount: number): Promise<any> {
    const maxRetries = 3
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(`${this.apiBaseUrl}/sync/content/${contentType}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Platform': this.platform,
            'Accept-Encoding': 'gzip'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const content = await response.json()
        
        // Reset retry count on success
        this.retryAttempts.delete(contentType)
        
        return content
        
      } catch (error) {
        lastError = error as Error
        
        if (attempt < maxRetries) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError
  }

  private async validateContent(contentType: string, content: any): Promise<void> {
    // Validate content structure based on type
    switch (contentType) {
      case 'lessons':
        this.validateLessonsContent(content)
        break
      case 'vocabulary':
        this.validateVocabularyContent(content)
        break
      case 'exercises':
        this.validateExercisesContent(content)
        break
      default:
        this.validateGenericContent(content)
    }
    
    // Validate content hash if available
    if (this.localManifest?.content[contentType as keyof typeof this.localManifest.content]) {
      const expectedHash = this.localManifest.content[contentType as keyof typeof this.localManifest.content].hash
      const actualHash = await this.calculateContentHash(content)
      
      if (expectedHash && actualHash !== expectedHash) {
        throw new Error(`Content hash mismatch for ${contentType}`)
      }
    }
  }

  private validateLessonsContent(content: any): void {
    if (!content.lessons || !Array.isArray(content.lessons)) {
      throw new Error('Invalid lessons content structure')
    }
    
    content.lessons.forEach((lesson: any, index: number) => {
      if (!lesson.id || !lesson.title || !lesson.vocabulary) {
        throw new Error(`Invalid lesson structure at index ${index}`)
      }
    })
  }

  private validateVocabularyContent(content: any): void {
    if (!content.vocabulary || !Array.isArray(content.vocabulary)) {
      throw new Error('Invalid vocabulary content structure')
    }
    
    content.vocabulary.forEach((word: any, index: number) => {
      if (!word.shona || !word.english || !word.pronunciation) {
        throw new Error(`Invalid vocabulary item at index ${index}`)
      }
    })
  }

  private validateExercisesContent(content: any): void {
    if (!content.exercises || !Array.isArray(content.exercises)) {
      throw new Error('Invalid exercises content structure')
    }
    
    content.exercises.forEach((exercise: any, index: number) => {
      if (!exercise.id || !exercise.type || !exercise.question) {
        throw new Error(`Invalid exercise structure at index ${index}`)
      }
    })
  }

  private validateGenericContent(content: any): void {
    if (!content || typeof content !== 'object') {
      throw new Error('Invalid content format')
    }
  }

  private async calculateContentHash(content: any): Promise<string> {
    const jsonString = JSON.stringify(content, Object.keys(content).sort())
    const encoder = new TextEncoder()
    const data = encoder.encode(jsonString)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async storeContent(contentType: string, content: any): Promise<void> {
    try {
      const key = `content-${contentType}`
      const compressed = this.compressContent(content)
      localStorage.setItem(key, compressed)
    } catch (error) {
      console.error(`Failed to store ${contentType}:`, error)
      throw error
    }
  }

  private compressContent(content: any): string {
    // Simple compression using JSON stringification with minimal whitespace
    return JSON.stringify(content)
  }

  private async updateContentCache(contentType: string, content: any): Promise<void> {
    // Update in-memory cache
    if ('caches' in window) {
      try {
        const cache = await caches.open('shona-content-v1')
        const response = new Response(JSON.stringify(content), {
          headers: { 'Content-Type': 'application/json' }
        })
        await cache.put(`/content/${contentType}`, response)
      } catch (error) {
        console.warn('Cache update failed:', error)
      }
    }
  }

  private async processContentForPlatform(contentType: string, content: any): Promise<void> {
    // Platform-specific content processing
    switch (this.platform) {
      case 'web':
        await this.processWebContent(contentType, content)
        break
      case 'ios':
        await this.processIOSContent(contentType, content)
        break
      case 'android':
        await this.processAndroidContent(contentType, content)
        break
    }
  }

  private async processWebContent(contentType: string, content: any): Promise<void> {
    // Web-specific processing (e.g., preload audio files)
    if (contentType === 'lessons' && content.lessons) {
      for (const lesson of content.lessons) {
        if (lesson.vocabulary) {
          for (const word of lesson.vocabulary) {
            if (word.audioFile) {
              this.preloadAudioFile(word.audioFile)
            }
          }
        }
      }
    }
  }

  private async processIOSContent(contentType: string, content: any): Promise<void> {
    // iOS-specific processing
    // This would be handled by the iOS app through a bridge
    if ((window as any).webkit?.messageHandlers?.contentSync) {
      (window as any).webkit.messageHandlers.contentSync.postMessage({
        type: 'contentUpdated',
        contentType,
        content
      })
    }
  }

  private async processAndroidContent(contentType: string, content: any): Promise<void> {
    // Android-specific processing
    // This would be handled by the Android app through a bridge
    if ((window as any).Android?.contentSync) {
      (window as any).Android.contentSync.onContentUpdated(
        contentType, 
        JSON.stringify(content)
      )
    }
  }

  private async preloadAudioFile(audioFile: string): Promise<void> {
    try {
      const audio = new Audio(`/audio/${audioFile}`)
      audio.preload = 'metadata'
    } catch (error) {
      console.warn(`Failed to preload audio ${audioFile}:`, error)
    }
  }

  private async handleSyncError(contentType: string, error: Error, options: SyncOptions): Promise<void> {
    const retryCount = this.retryAttempts.get(contentType) || 0
    
    if (retryCount < this.maxRetries) {
      this.retryAttempts.set(contentType, retryCount + 1)
      
      // Exponential backoff retry
      const delay = Math.pow(2, retryCount) * 1000
      setTimeout(() => {
        this.syncContentType(contentType, options)
      }, delay)
    } else {
      // Max retries reached, remove from retry tracking
      this.retryAttempts.delete(contentType)
      this.emit('syncError', { contentType, error: error.message })
    }
  }

  async forceSyncAll(): Promise<SyncResult> {
    const contentTypes = ['lessons', 'vocabulary', 'exercises', 'cultural_notes', 'audio']
    return this.syncContent(contentTypes, { forceSync: true, priority: 'high' })
  }

  async getLocalContent(contentType: string): Promise<any> {
    try {
      const key = `content-${contentType}`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error(`Failed to get local content ${contentType}:`, error)
      return null
    }
  }

  async clearLocalContent(): Promise<void> {
    const contentTypes = ['lessons', 'vocabulary', 'exercises', 'cultural_notes', 'audio']
    
    contentTypes.forEach(contentType => {
      localStorage.removeItem(`content-${contentType}`)
    })
    
    localStorage.removeItem('content-manifest')
    this.localManifest = null
    
    // Clear cache
    if ('caches' in window) {
      await caches.delete('shona-content-v1')
    }
  }

  getLocalManifest(): ContentManifest | null {
    return this.localManifest
  }

  getSyncStatus(): { inProgress: boolean; queueLength: number; lastSync?: string } {
    return {
      inProgress: this.syncInProgress,
      queueLength: this.syncQueue.length,
      lastSync: this.localManifest?.lastUpdated
    }
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

// Singleton instance
const contentSyncService = new ContentSyncService(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  'web'
)

export { contentSyncService, ContentSyncService }
export type { ContentVersion, ContentManifest, SyncResult, SyncOptions }