class AudioService {
  private audioCache = new Map<string, HTMLAudioElement>()
  private preloadQueue: string[] = []
  private isPreloading = false
  private maxCacheSize = 50 // Limit cache size
  private preloadLimit = 5 // Preload next 5 audio files

  constructor() {
    this.initializeWorker()
  }

  /**
   * Initialize service worker for audio caching
   */
  private initializeWorker() {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-audio.js')
        .catch(err => console.log('Service Worker registration failed:', err))
    }
  }

  /**
   * Lazy load audio with caching
   */
  async loadAudio(src: string, priority: 'high' | 'medium' | 'low' = 'medium'): Promise<HTMLAudioElement> {
    // Check cache first
    if (this.audioCache.has(src)) {
      return this.audioCache.get(src)!
    }

    // Create new audio element
    const audio = new Audio()
    audio.preload = priority === 'high' ? 'auto' : 'metadata'
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Audio load timeout: ${src}`))
      }, 10000) // 10 second timeout

      audio.oncanplaythrough = () => {
        clearTimeout(timeout)
        this.addToCache(src, audio)
        resolve(audio)
      }

      audio.onerror = () => {
        clearTimeout(timeout)
        reject(new Error(`Failed to load audio: ${src}`))
      }

      audio.src = src
      audio.load()
    })
  }

  /**
   * Preload audio files for current lesson
   */
  async preloadLessonAudio(audioUrls: string[]) {
    // Add to preload queue
    this.preloadQueue.push(...audioUrls.slice(0, this.preloadLimit))
    
    if (!this.isPreloading) {
      this.processPreloadQueue()
    }
  }

  /**
   * Process preload queue with rate limiting
   */
  private async processPreloadQueue() {
    if (this.preloadQueue.length === 0) {
      this.isPreloading = false
      return
    }

    this.isPreloading = true
    const url = this.preloadQueue.shift()!

    try {
      // Use low priority for preloading
      await this.loadAudio(url, 'low')
      
      // Small delay to prevent overwhelming the browser
      setTimeout(() => this.processPreloadQueue(), 100)
    } catch (error) {
      console.warn('Preload failed for:', url, error)
      this.processPreloadQueue()
    }
  }

  /**
   * Play audio with optimizations
   */
  async playAudio(src: string, options: {
    volume?: number
    rate?: number
    onEnd?: () => void
    fade?: boolean
  } = {}): Promise<void> {
    try {
      const audio = await this.loadAudio(src, 'high')
      
      // Reset audio to beginning
      audio.currentTime = 0
      
      // Apply options
      if (options.volume !== undefined) audio.volume = options.volume
      if (options.rate !== undefined) audio.playbackRate = options.rate
      
      // Handle fade in
      if (options.fade) {
        audio.volume = 0
        this.fadeIn(audio, options.volume || 1)
      }

      // Set up end handler
      if (options.onEnd) {
        audio.onended = options.onEnd
      }

      await audio.play()
    } catch (error) {
      console.error('Audio play error:', error)
      throw error
    }
  }

  /**
   * Create audio sprite for short sounds
   */
  createAudioSprite(src: string, segments: Record<string, { start: number; duration: number }>) {
    const self = this
    return {
      async play(segmentName: string): Promise<void> {
        const audio = await self.loadAudio(src, 'high')
        const segment = segments[segmentName]
        
        if (!segment) {
          throw new Error(`Audio segment not found: ${segmentName}`)
        }

        audio.currentTime = segment.start
        await audio.play()
        
        // Stop at segment end
        setTimeout(() => {
          audio.pause()
        }, segment.duration * 1000)
      }
    }
  }

  /**
   * Stream audio for long content
   */
  async streamAudio(src: string): Promise<HTMLAudioElement> {
    const audio = new Audio()
    audio.preload = 'none' // Don't preload for streaming
    audio.src = src
    
    return audio
  }

  /**
   * Fade in audio
   */
  private fadeIn(audio: HTMLAudioElement, targetVolume: number, duration = 500) {
    const steps = 20
    const stepTime = duration / steps
    const stepVolume = targetVolume / steps
    let currentStep = 0

    const fadeInterval = setInterval(() => {
      currentStep++
      audio.volume = Math.min(stepVolume * currentStep, targetVolume)
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval)
      }
    }, stepTime)
  }

  /**
   * Add audio to cache with size management
   */
  private addToCache(src: string, audio: HTMLAudioElement) {
    // Remove oldest if cache is full
    if (this.audioCache.size >= this.maxCacheSize) {
      const firstKey = this.audioCache.keys().next().value
      if (firstKey) {
        this.audioCache.delete(firstKey)
      }
    }

    this.audioCache.set(src, audio)
  }

  /**
   * Clear cache to free memory
   */
  clearCache() {
    this.audioCache.forEach(audio => {
      audio.pause()
      audio.src = ''
    })
    this.audioCache.clear()
    this.preloadQueue = []
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      cachedItems: this.audioCache.size,
      maxCacheSize: this.maxCacheSize,
      preloadQueueLength: this.preloadQueue.length,
      isPreloading: this.isPreloading
    }
  }
}

// Singleton instance
export const audioService = new AudioService()

// Hook for React components
export function useAudioService() {
  return audioService
}