/**
 * Smart Audio Cache Manager for Shona Learning App
 * Handles 1000+ audio files with intelligent caching and offline capability
 */

interface AudioFile {
  id: string
  filename: string
  transcript: string
  translation: string
  category: string
  level: number
  priority: 'immediate' | 'prefetch' | 'onDemand'
  size: number
  duration: number
  url: string
  localPath?: string
  lastAccessed?: Date
  downloadedAt?: Date
  quality: 'high' | 'medium' | 'low'
  compressionFormats: {
    mp3_128: string
    opus_64: string
    opus_32: string
  }
}

interface CacheStrategy {
  immediate: string[]
  prefetch: string[]
  onDemand: string[]
  cleanup: {
    unusedDays: number
    maxStorageGB: number
  }
}

interface StorageQuota {
  used: number
  available: number
  total: number
}

export class AudioCacheManager {
  private db: IDBDatabase | null = null
  private cacheStrategy: CacheStrategy
  private storageQuota: StorageQuota = { used: 0, available: 0, total: 0 }
  private downloadQueue: Set<string> = new Set()
  private analytics: Map<string, any> = new Map()

  constructor() {
    this.cacheStrategy = {
      immediate: ['current_lesson', 'review_items', 'weak_words'],
      prefetch: ['next_lesson', 'related_words', 'cultural_context'],
      onDemand: ['advanced_content', 'cultural_stories', 'songs'],
      cleanup: {
        unusedDays: 30,
        maxStorageGB: 2
      }
    }
  }

  async initialize(): Promise<void> {
    await this.initIndexedDB()
    await this.updateStorageQuota()
    await this.cleanupOldCache()
    this.startBackgroundSync()
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ShonaAudioCache', 2)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Audio files store
        if (!db.objectStoreNames.contains('audioFiles')) {
          const audioStore = db.createObjectStore('audioFiles', { keyPath: 'id' })
          audioStore.createIndex('category', 'category', { unique: false })
          audioStore.createIndex('level', 'level', { unique: false })
          audioStore.createIndex('priority', 'priority', { unique: false })
          audioStore.createIndex('lastAccessed', 'lastAccessed', { unique: false })
        }
        
        // Analytics store
        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' })
          analyticsStore.createIndex('date', 'date', { unique: false })
        }
        
        // Download queue store
        if (!db.objectStoreNames.contains('downloadQueue')) {
          db.createObjectStore('downloadQueue', { keyPath: 'id' })
        }
      }
    })
  }

  async cacheAudioFile(audioFile: AudioFile, data: ArrayBuffer): Promise<void> {
    if (!this.db) throw new Error('Database not initialized')

    const transaction = this.db.transaction(['audioFiles'], 'readwrite')
    const store = transaction.objectStore('audioFiles')
    
    const cacheEntry = {
      ...audioFile,
      data,
      downloadedAt: new Date(),
      lastAccessed: new Date()
    }
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(cacheEntry)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    this.updateStorageQuota()
    this.trackAnalytics('cache_store', audioFile.id)
  }

  async getAudioFile(id: string): Promise<{ audioFile: AudioFile; data: ArrayBuffer } | null> {
    if (!this.db) return null

    const transaction = this.db.transaction(['audioFiles'], 'readwrite')
    const store = transaction.objectStore('audioFiles')
    
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => {
        const result = request.result
        if (result) {
          // Update last accessed time
          result.lastAccessed = new Date()
          store.put(result)
          
          this.trackAnalytics('cache_hit', id)
          resolve({ audioFile: result, data: result.data })
        } else {
          this.trackAnalytics('cache_miss', id)
          resolve(null)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async preloadByStrategy(userLevel: number, currentLesson: string): Promise<void> {
    const immediatePriority = await this.getFilesByPriority('immediate', userLevel, currentLesson)
    const prefetchPriority = await this.getFilesByPriority('prefetch', userLevel, currentLesson)

    // Download immediate priority files first
    for (const file of immediatePriority) {
      if (!await this.isFileCached(file.id)) {
        await this.downloadAndCache(file)
      }
    }

    // Queue prefetch files for background download
    for (const file of prefetchPriority) {
      if (!await this.isFileCached(file.id)) {
        this.queueForDownload(file)
      }
    }

    this.processDownloadQueue()
  }

  private async getFilesByPriority(priority: string, userLevel: number, currentLesson: string): Promise<AudioFile[]> {
    // This would typically fetch from your API based on priority rules
    const response = await fetch(`/api/audio/priority/${priority}?level=${userLevel}&lesson=${currentLesson}`)
    if (!response.ok) throw new Error('Failed to fetch priority files')
    
    return response.json()
  }

  private async isFileCached(id: string): Promise<boolean> {
    const cached = await this.getAudioFile(id)
    return cached !== null
  }

  private async downloadAndCache(audioFile: AudioFile): Promise<void> {
    try {
      // Determine best quality based on connection and storage
      const quality = await this.determineBestQuality()
      const url = audioFile.compressionFormats[quality] || audioFile.url
      
      const response = await fetch(url)
      if (!response.ok) throw new Error(`Failed to download ${audioFile.filename}`)
      
      const data = await response.arrayBuffer()
      await this.cacheAudioFile(audioFile, data)
      
      this.downloadQueue.delete(audioFile.id)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`Failed to download audio file ${audioFile.id}:`, error)
      this.trackAnalytics('download_error', audioFile.id, { error: errorMessage })
    }
  }

  private queueForDownload(audioFile: AudioFile): void {
    this.downloadQueue.add(audioFile.id)
  }

  private async processDownloadQueue(): Promise<void> {
    const maxConcurrent = 3
    const downloading = Array.from(this.downloadQueue).slice(0, maxConcurrent)
    
    for (const id of downloading) {
      // Fetch file details and download
      const response = await fetch(`/api/audio/${id}`)
      if (response.ok) {
        const audioFile = await response.json()
        this.downloadAndCache(audioFile)
      }
    }
  }

  private async determineBestQuality(): Promise<keyof AudioFile['compressionFormats']> {
    const connection = (navigator as any).connection
    const storageQuota = await this.updateStorageQuota()
    
    if (storageQuota.available < 100 * 1024 * 1024) { // Less than 100MB
      return 'opus_32'
    } else if (connection && connection.effectiveType === '4g') {
      return 'mp3_128'
    } else {
      return 'opus_64'
    }
  }

  private async updateStorageQuota(): Promise<StorageQuota> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      this.storageQuota = {
        used: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0),
        total: estimate.quota || 0
      }
    }
    return this.storageQuota
  }

  private async cleanupOldCache(): Promise<void> {
    if (!this.db) return

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.cacheStrategy.cleanup.unusedDays)
    
    const transaction = this.db.transaction(['audioFiles'], 'readwrite')
    const store = transaction.objectStore('audioFiles')
    const index = store.index('lastAccessed')
    
    const request = index.openCursor(IDBKeyRange.upperBound(cutoffDate))
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result
      if (cursor) {
        store.delete(cursor.primaryKey)
        cursor.continue()
      }
    }
  }

  private trackAnalytics(event: string, audioId: string, metadata?: any): void {
    const analyticsEntry = {
      id: `${event}_${audioId}_${Date.now()}`,
      event,
      audioId,
      timestamp: new Date(),
      metadata
    }
    
    this.analytics.set(analyticsEntry.id, analyticsEntry)
    
    // Store in IndexedDB
    if (this.db) {
      const transaction = this.db.transaction(['analytics'], 'readwrite')
      const store = transaction.objectStore('analytics')
      store.add(analyticsEntry)
    }
  }

  private startBackgroundSync(): void {
    // Register service worker for background sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        // Check if background sync is supported
        if ('sync' in registration) {
          return (registration as any).sync.register('audio-sync')
        }
      }).catch(error => {
        console.log('Background sync not supported:', error)
      })
    }
    
    // Fallback: periodic sync when online
    setInterval(() => {
      if (navigator.onLine && this.downloadQueue.size > 0) {
        this.processDownloadQueue()
      }
    }, 30000) // Check every 30 seconds
  }

  async getAnalytics(): Promise<any> {
    const analytics = Array.from(this.analytics.values())
    
    return {
      totalCacheHits: analytics.filter(a => a.event === 'cache_hit').length,
      totalCacheMisses: analytics.filter(a => a.event === 'cache_miss').length,
      downloadErrors: analytics.filter(a => a.event === 'download_error').length,
      storageUsage: this.storageQuota,
      mostPlayedFiles: this.getMostPlayedFiles(analytics),
      downloadStats: this.getDownloadStats(analytics)
    }
  }

  private getMostPlayedFiles(analytics: any[]): any[] {
    const playCount = new Map()
    
    analytics.filter(a => a.event === 'cache_hit').forEach(a => {
      const count = playCount.get(a.audioId) || 0
      playCount.set(a.audioId, count + 1)
    })
    
    return Array.from(playCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([id, count]) => ({ audioId: id, playCount: count }))
  }

  private getDownloadStats(analytics: any[]): any {
    const downloads = analytics.filter(a => a.event === 'cache_store')
    const errors = analytics.filter(a => a.event === 'download_error')
    
    return {
      totalDownloads: downloads.length,
      totalErrors: errors.length,
      successRate: downloads.length / (downloads.length + errors.length) * 100,
      avgDownloadTime: this.calculateAvgDownloadTime(downloads)
    }
  }

  private calculateAvgDownloadTime(downloads: any[]): number {
    // This would calculate based on download start/end times if tracked
    return 0 // Placeholder
  }

  // Public API methods
  async playAudio(id: string): Promise<AudioBuffer | null> {
    const cached = await this.getAudioFile(id)
    
    if (cached) {
      const audioContext = new AudioContext()
      return audioContext.decodeAudioData(cached.data.slice(0))
    }
    
    // If not cached, try to download on demand
    const response = await fetch(`/api/audio/${id}`)
    if (response.ok) {
      const audioFile = await response.json()
      await this.downloadAndCache(audioFile)
      return this.playAudio(id) // Recursive call after caching
    }
    
    return null
  }

  async prefetchLessonAudio(lessonId: string): Promise<void> {
    const response = await fetch(`/api/lessons/${lessonId}/audio`)
    if (response.ok) {
      const audioFiles = await response.json()
      
      for (const file of audioFiles) {
        if (!await this.isFileCached(file.id)) {
          this.queueForDownload(file)
        }
      }
      
      this.processDownloadQueue()
    }
  }

  async clearCache(): Promise<void> {
    if (!this.db) return
    
    const transaction = this.db.transaction(['audioFiles'], 'readwrite')
    const store = transaction.objectStore('audioFiles')
    await new Promise<void>((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
    
    this.updateStorageQuota()
  }

  getStorageInfo(): StorageQuota {
    return this.storageQuota
  }
}