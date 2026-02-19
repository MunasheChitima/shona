interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class CacheManager {
  private cache: Map<string, CacheItem<any>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Clean up expired items every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60000)
  }

  set<T>(key: string, data: T, ttl: number = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    const now = Date.now()
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.cache.clear()
  }
}

// Singleton instance
let cacheInstance: CacheManager | null = null

export function getCache(): CacheManager {
  if (!cacheInstance) {
    cacheInstance = new CacheManager()
  }
  return cacheInstance
}

// Helper function for creating cache keys
export function createCacheKey(...parts: (string | number | boolean)[]): string {
  return parts.join(':')
}

// React hook for cached data
export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): { data: T | null; isLoading: boolean; error: Error | null; refresh: () => Promise<void> } {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const cache = getCache()

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check cache first
        const cachedData = cache.get<T>(key)
        if (cachedData !== null) {
          setData(cachedData)
          setIsLoading(false)
          return
        }

        // Fetch fresh data
        setIsLoading(true)
        const freshData = await fetcher()
        cache.set(key, freshData, ttl)
        setData(freshData)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [key])

  const refresh = async () => {
    cache.delete(key)
    setIsLoading(true)
    try {
      const freshData = await fetcher()
      cache.set(key, freshData, ttl)
      setData(freshData)
      setError(null)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return { data, isLoading, error, refresh }
}

// Import React only if needed
import { useState, useEffect } from 'react' 