interface CacheEntry {
  data: any
  timestamp: number
  expiresAt: number
  accessCount: number
  lastAccessed: number
  compressed: boolean
  hash: string
  size: number
  priority: 'high' | 'normal' | 'low'
  metadata: {
    contentType: string
    version: number
    dependencies: string[]
  }
}

interface CacheStats {
  totalEntries: number
  totalSize: number
  hitRate: number
  missRate: number
  evictions: number
  compressionRatio: number
  averageAccessTime: number
}

interface CacheConfig {
  maxSize: number           // Maximum cache size in bytes
  maxEntries: number        // Maximum number of entries
  defaultTTL: number        // Default time-to-live in milliseconds
  compressionThreshold: number  // Compress entries larger than this
  enableCompression: boolean
  enablePrefetching: boolean
  enableStatistics: boolean
  evictionPolicy: 'lru' | 'lfu' | 'ttl' | 'priority'
}

class AdvancedCacheService {
  private cache: Map<string, CacheEntry> = new Map()
  private accessOrder: string[] = []
  private stats: CacheStats = {
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0,
    evictions: 0,
    compressionRatio: 0,
    averageAccessTime: 0
  }
  
  private config: CacheConfig
  private hitCount = 0
  private missCount = 0
  private totalAccessTime = 0
  private accessTimes: number[] = []
  
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB default
      maxEntries: 1000,
      defaultTTL: 24 * 60 * 60 * 1000, // 24 hours
      compressionThreshold: 10 * 1024, // 10KB
      enableCompression: true,
      enablePrefetching: true,
      enableStatistics: true,
      evictionPolicy: 'lru',
      ...config
    }
    
    // Start periodic cleanup
    this.startPeriodicCleanup()
    
    // Start statistics collection
    if (this.config.enableStatistics) {
      this.startStatisticsCollection()
    }
  }

  async set(
    key: string, 
    data: any, 
    options: {
      ttl?: number
      priority?: 'high' | 'normal' | 'low'
      contentType?: string
      version?: number
      dependencies?: string[]
      compress?: boolean
    } = {}
  ): Promise<void> {
    const startTime = performance.now()
    
    try {
      const ttl = options.ttl || this.config.defaultTTL
      const priority = options.priority || 'normal'
      const shouldCompress = options.compress !== false && 
                           this.config.enableCompression && 
                           this.estimateSize(data) > this.config.compressionThreshold
      
      let processedData = data
      let compressed = false
      
      if (shouldCompress) {
        processedData = await this.compressData(data)
        compressed = true
      }
      
      const hash = await this.generateHash(data)
      const size = this.estimateSize(processedData)
      
      const entry: CacheEntry = {
        data: processedData,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttl,
        accessCount: 0,
        lastAccessed: Date.now(),
        compressed,
        hash,
        size,
        priority,
        metadata: {
          contentType: options.contentType || 'unknown',
          version: options.version || 1,
          dependencies: options.dependencies || []
        }
      }
      
      // Check if we need to make space
      await this.ensureSpace(size)
      
      // Remove existing entry if it exists
      if (this.cache.has(key)) {
        this.removeFromAccessOrder(key)
        this.stats.totalSize -= this.cache.get(key)!.size
      }
      
      // Add new entry
      this.cache.set(key, entry)
      this.addToAccessOrder(key)
      this.stats.totalSize += size
      this.stats.totalEntries = this.cache.size
      
      // Update compression ratio
      if (compressed) {
        this.updateCompressionRatio()
      }
      
      // Prefetch dependencies if enabled
      if (this.config.enablePrefetching && options.dependencies) {
        this.schedulePrefetch(options.dependencies)
      }
      
    } finally {
      if (this.config.enableStatistics) {
        this.recordAccessTime(performance.now() - startTime)
      }
    }
  }

  async get(key: string): Promise<any | null> {
    const startTime = performance.now()
    
    try {
      const entry = this.cache.get(key)
      
      if (!entry) {
        this.missCount++
        return null
      }
      
      // Check if expired
      if (Date.now() > entry.expiresAt) {
        this.delete(key)
        this.missCount++
        return null
      }
      
      // Update access statistics
      entry.accessCount++
      entry.lastAccessed = Date.now()
      this.updateAccessOrder(key)
      
      this.hitCount++
      
      // Decompress if needed
      let data = entry.data
      if (entry.compressed) {
        data = await this.decompressData(entry.data)
      }
      
      return data
      
    } finally {
      if (this.config.enableStatistics) {
        this.recordAccessTime(performance.now() - startTime)
        this.updateHitRates()
      }
    }
  }

  async getMultiple(keys: string[]): Promise<Map<string, any>> {
    const results = new Map<string, any>()
    
    // Batch get operations for better performance
    const promises = keys.map(async key => {
      const value = await this.get(key)
      if (value !== null) {
        results.set(key, value)
      }
    })
    
    await Promise.all(promises)
    return results
  }

  delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    this.cache.delete(key)
    this.removeFromAccessOrder(key)
    this.stats.totalSize -= entry.size
    this.stats.totalEntries = this.cache.size
    
    return true
  }

  clear(): void {
    this.cache.clear()
    this.accessOrder = []
    this.stats.totalSize = 0
    this.stats.totalEntries = 0
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.delete(key)
      return false
    }
    
    return true
  }

  async getOrSet(
    key: string, 
    factory: () => Promise<any>, 
    options: Parameters<typeof this.set>[2] = {}
  ): Promise<any> {
    const cached = await this.get(key)
    if (cached !== null) {
      return cached
    }
    
    const data = await factory()
    await this.set(key, data, options)
    return data
  }

  invalidateByPattern(pattern: RegExp): number {
    let count = 0
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.delete(key)
        count++
      }
    }
    return count
  }

  invalidateByContentType(contentType: string): number {
    let count = 0
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.contentType === contentType) {
        this.delete(key)
        count++
      }
    }
    return count
  }

  invalidateByDependency(dependency: string): number {
    let count = 0
    for (const [key, entry] of this.cache.entries()) {
      if (entry.metadata.dependencies.includes(dependency)) {
        this.delete(key)
        count++
      }
    }
    return count
  }

  getStats(): CacheStats {
    return { ...this.stats }
  }

  getDetailedStats(): any {
    const entries = Array.from(this.cache.entries())
    
    return {
      ...this.stats,
      entries: entries.length,
      sizeDistribution: this.calculateSizeDistribution(entries),
      accessDistribution: this.calculateAccessDistribution(entries),
      contentTypeDistribution: this.calculateContentTypeDistribution(entries),
      priorityDistribution: this.calculatePriorityDistribution(entries),
      compressionStats: this.calculateCompressionStats(entries),
      oldestEntry: this.findOldestEntry(entries),
      newestEntry: this.findNewestEntry(entries),
      mostAccessed: this.findMostAccessedEntry(entries),
      leastAccessed: this.findLeastAccessedEntry(entries)
    }
  }

  // Performance optimization methods
  async preload(keys: string[], factory: (key: string) => Promise<any>): Promise<void> {
    const missingKeys = keys.filter(key => !this.has(key))
    
    if (missingKeys.length === 0) return
    
    // Batch load missing entries
    const promises = missingKeys.map(async key => {
      try {
        const data = await factory(key)
        await this.set(key, data, { priority: 'normal' })
      } catch (error) {
        console.warn(`Failed to preload cache entry ${key}:`, error)
      }
    })
    
    await Promise.all(promises)
  }

  async warmup(contentTypes: string[], factory: (contentType: string) => Promise<any[]>): Promise<void> {
    const promises = contentTypes.map(async contentType => {
      try {
        const items = await factory(contentType)
        const itemPromises = items.map((item, index) => 
          this.set(`${contentType}:${index}`, item, { 
            contentType, 
            priority: 'high',
            ttl: this.config.defaultTTL * 2 // Longer TTL for warmup data
          })
        )
        await Promise.all(itemPromises)
      } catch (error) {
        console.warn(`Failed to warmup cache for ${contentType}:`, error)
      }
    })
    
    await Promise.all(promises)
  }

  // Private helper methods
  private async ensureSpace(requiredSize: number): Promise<void> {
    while (
      (this.stats.totalSize + requiredSize > this.config.maxSize) ||
      (this.stats.totalEntries >= this.config.maxEntries)
    ) {
      const evicted = this.evictEntry()
      if (!evicted) break // No more entries to evict
      this.stats.evictions++
    }
  }

  private evictEntry(): boolean {
    if (this.cache.size === 0) return false
    
    let keyToEvict: string | null = null
    
    switch (this.config.evictionPolicy) {
      case 'lru':
        keyToEvict = this.findLRUEntry()
        break
      case 'lfu':
        keyToEvict = this.findLFUEntry()
        break
      case 'ttl':
        keyToEvict = this.findExpiringSoonEntry()
        break
      case 'priority':
        keyToEvict = this.findLowestPriorityEntry()
        break
    }
    
    if (keyToEvict) {
      this.delete(keyToEvict)
      return true
    }
    
    return false
  }

  private findLRUEntry(): string | null {
    return this.accessOrder.length > 0 ? this.accessOrder[0] : null
  }

  private findLFUEntry(): string | null {
    let minAccess = Infinity
    let keyToEvict: string | null = null
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < minAccess) {
        minAccess = entry.accessCount
        keyToEvict = key
      }
    }
    
    return keyToEvict
  }

  private findExpiringSoonEntry(): string | null {
    let minExpiry = Infinity
    let keyToEvict: string | null = null
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiresAt < minExpiry) {
        minExpiry = entry.expiresAt
        keyToEvict = key
      }
    }
    
    return keyToEvict
  }

  private findLowestPriorityEntry(): string | null {
    const priorityOrder = { low: 0, normal: 1, high: 2 }
    let minPriority = Infinity
    let keyToEvict: string | null = null
    
    for (const [key, entry] of this.cache.entries()) {
      const priorityValue = priorityOrder[entry.priority]
      if (priorityValue < minPriority) {
        minPriority = priorityValue
        keyToEvict = key
      }
    }
    
    return keyToEvict
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key)
    this.addToAccessOrder(key)
  }

  private addToAccessOrder(key: string): void {
    this.accessOrder.push(key)
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key)
    if (index > -1) {
      this.accessOrder.splice(index, 1)
    }
  }

  private async compressData(data: any): Promise<string> {
    const jsonString = JSON.stringify(data)
    
    if (typeof CompressionStream !== 'undefined') {
      // Use native compression if available
      const stream = new CompressionStream('gzip')
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()
      
      writer.write(new TextEncoder().encode(jsonString))
      writer.close()
      
      const chunks: Uint8Array[] = []
      let done = false
      
      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) chunks.push(value)
      }
      
      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      let offset = 0
      for (const chunk of chunks) {
        compressed.set(chunk, offset)
        offset += chunk.length
      }
      
      return btoa(String.fromCharCode(...compressed))
    } else {
      // Fallback to simple compression
      return this.simpleCompress(jsonString)
    }
  }

  private async decompressData(compressedData: string): Promise<any> {
    if (typeof DecompressionStream !== 'undefined') {
      // Use native decompression if available
      const compressed = Uint8Array.from(atob(compressedData), c => c.charCodeAt(0))
      
      const stream = new DecompressionStream('gzip')
      const writer = stream.writable.getWriter()
      const reader = stream.readable.getReader()
      
      writer.write(compressed)
      writer.close()
      
      const chunks: Uint8Array[] = []
      let done = false
      
      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone
        if (value) chunks.push(value)
      }
      
      const decompressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      let offset = 0
      for (const chunk of chunks) {
        decompressed.set(chunk, offset)
        offset += chunk.length
      }
      
      const jsonString = new TextDecoder().decode(decompressed)
      return JSON.parse(jsonString)
    } else {
      // Fallback to simple decompression
      const jsonString = this.simpleDecompress(compressedData)
      return JSON.parse(jsonString)
    }
  }

  private simpleCompress(data: string): string {
    // Simple run-length encoding for demonstration
    return data.replace(/(.)\1+/g, (match, char) => `${char}${match.length}`)
  }

  private simpleDecompress(data: string): string {
    // Simple run-length decoding
    return data.replace(/(.)\d+/g, (match, char) => {
      const count = parseInt(match.slice(1))
      return char.repeat(count)
    })
  }

  private async generateHash(data: any): Promise<string> {
    const jsonString = JSON.stringify(data, Object.keys(data).sort())
    
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      const encoder = new TextEncoder()
      const dataBuffer = encoder.encode(jsonString)
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } else {
      // Fallback to simple hash
      let hash = 0
      for (let i = 0; i < jsonString.length; i++) {
        const char = jsonString.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return hash.toString(16)
    }
  }

  private estimateSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size
  }

  private updateHitRates(): void {
    const total = this.hitCount + this.missCount
    this.stats.hitRate = total > 0 ? this.hitCount / total : 0
    this.stats.missRate = total > 0 ? this.missCount / total : 0
  }

  private updateCompressionRatio(): void {
    let originalSize = 0
    let compressedSize = 0
    
    for (const entry of this.cache.values()) {
      if (entry.compressed) {
        compressedSize += entry.size
        // Estimate original size (this is approximate)
        originalSize += entry.size * 2.5 // Assuming ~60% compression ratio
      } else {
        originalSize += entry.size
        compressedSize += entry.size
      }
    }
    
    this.stats.compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1
  }

  private recordAccessTime(time: number): void {
    this.totalAccessTime += time
    this.accessTimes.push(time)
    
    // Keep only last 1000 access times for average calculation
    if (this.accessTimes.length > 1000) {
      this.accessTimes = this.accessTimes.slice(-1000)
    }
    
    this.stats.averageAccessTime = this.accessTimes.reduce((a, b) => a + b, 0) / this.accessTimes.length
  }

  private schedulePrefetch(dependencies: string[]): void {
    // Schedule prefetching of dependencies in the next tick
    setTimeout(() => {
      dependencies.forEach(dep => {
        if (!this.has(dep)) {
          // Emit prefetch request
          this.emit('prefetchRequest', { dependency: dep })
        }
      })
    }, 0)
  }

  private startPeriodicCleanup(): void {
    setInterval(() => {
      this.cleanupExpiredEntries()
    }, 60000) // Clean up every minute
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now()
    const expiredKeys: string[] = []
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key)
      }
    }
    
    expiredKeys.forEach(key => this.delete(key))
  }

  private startStatisticsCollection(): void {
    setInterval(() => {
      this.updateHitRates()
      this.updateCompressionRatio()
    }, 30000) // Update stats every 30 seconds
  }

  // Statistics calculation methods
  private calculateSizeDistribution(entries: [string, CacheEntry][]): any {
    const buckets = { small: 0, medium: 0, large: 0, huge: 0 }
    
    entries.forEach(([, entry]) => {
      if (entry.size < 1024) buckets.small++
      else if (entry.size < 10240) buckets.medium++
      else if (entry.size < 102400) buckets.large++
      else buckets.huge++
    })
    
    return buckets
  }

  private calculateAccessDistribution(entries: [string, CacheEntry][]): any {
    const buckets = { low: 0, medium: 0, high: 0, veryHigh: 0 }
    
    entries.forEach(([, entry]) => {
      if (entry.accessCount < 5) buckets.low++
      else if (entry.accessCount < 20) buckets.medium++
      else if (entry.accessCount < 100) buckets.high++
      else buckets.veryHigh++
    })
    
    return buckets
  }

  private calculateContentTypeDistribution(entries: [string, CacheEntry][]): Record<string, number> {
    const distribution: Record<string, number> = {}
    
    entries.forEach(([, entry]) => {
      const contentType = entry.metadata.contentType
      distribution[contentType] = (distribution[contentType] || 0) + 1
    })
    
    return distribution
  }

  private calculatePriorityDistribution(entries: [string, CacheEntry][]): Record<string, number> {
    const distribution = { high: 0, normal: 0, low: 0 }
    
    entries.forEach(([, entry]) => {
      distribution[entry.priority]++
    })
    
    return distribution
  }

  private calculateCompressionStats(entries: [string, CacheEntry][]): any {
    let compressedEntries = 0
    let totalOriginalSize = 0
    let totalCompressedSize = 0
    
    entries.forEach(([, entry]) => {
      if (entry.compressed) {
        compressedEntries++
        totalCompressedSize += entry.size
        totalOriginalSize += entry.size * 2.5 // Estimated
      } else {
        totalOriginalSize += entry.size
        totalCompressedSize += entry.size
      }
    })
    
    return {
      compressedEntries,
      compressionRatio: totalOriginalSize > 0 ? totalCompressedSize / totalOriginalSize : 1,
      spacesSaved: totalOriginalSize - totalCompressedSize
    }
  }

  private findOldestEntry(entries: [string, CacheEntry][]): any {
    let oldest: [string, CacheEntry] | null = null
    
    entries.forEach((entry: [string, CacheEntry]) => {
      if (!oldest || entry[1].timestamp < oldest[1].timestamp) {
        oldest = entry
      }
    })
    
    return oldest ? { key: oldest[0], timestamp: oldest[1].timestamp } : null
  }

  private findNewestEntry(entries: [string, CacheEntry][]): any {
    let newest: [string, CacheEntry] | null = null
    
    entries.forEach((entry: [string, CacheEntry]) => {
      if (!newest || entry[1].timestamp > newest[1].timestamp) {
        newest = entry
      }
    })
    
    return newest ? { key: newest[0], timestamp: newest[1].timestamp } : null
  }

  private findMostAccessedEntry(entries: [string, CacheEntry][]): any {
    let mostAccessed: [string, CacheEntry] | null = null
    
    entries.forEach((entry: [string, CacheEntry]) => {
      if (!mostAccessed || entry[1].accessCount > mostAccessed[1].accessCount) {
        mostAccessed = entry
      }
    })
    
    return mostAccessed ? { 
      key: mostAccessed[0], 
      accessCount: mostAccessed[1].accessCount 
    } : null
  }

  private findLeastAccessedEntry(entries: [string, CacheEntry][]): any {
    let leastAccessed: [string, CacheEntry] | null = null
    
    entries.forEach((entry: [string, CacheEntry]) => {
      if (!leastAccessed || entry[1].accessCount < leastAccessed[1].accessCount) {
        leastAccessed = entry
      }
    })
    
    return leastAccessed ? { 
      key: leastAccessed[0], 
      accessCount: leastAccessed[1].accessCount 
    } : null
  }

  // Event emitter functionality
  private eventListeners: Map<string, Function[]> = new Map()

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

// Create singleton instance with optimized settings
const advancedCacheService = new AdvancedCacheService({
  maxSize: 100 * 1024 * 1024, // 100MB
  maxEntries: 5000,
  defaultTTL: 12 * 60 * 60 * 1000, // 12 hours
  compressionThreshold: 5 * 1024, // 5KB
  enableCompression: true,
  enablePrefetching: true,
  enableStatistics: true,
  evictionPolicy: 'lru'
})

export { advancedCacheService, AdvancedCacheService }
export type { CacheEntry, CacheStats, CacheConfig }