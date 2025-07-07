/**
 * Advanced Audio Service for Shona Learning App
 * Integrates with AudioCacheManager for seamless audio experience
 */

import { AudioCacheManager } from './AudioCacheManager'

interface AudioPlaybackOptions {
  speed?: number
  volume?: number
  loop?: boolean
  startTime?: number
  endTime?: number
  fadeIn?: boolean
  fadeOut?: boolean
}

interface AudioMetrics {
  playCount: number
  totalPlayTime: number
  skipRate: number
  completionRate: number
  preferredSpeed: number
}

export class AdvancedAudioService {
  private cacheManager: AudioCacheManager
  private audioContext: AudioContext | null = null
  private currentlyPlaying: Map<string, AudioBufferSourceNode> = new Map()
  private audioMetrics: Map<string, AudioMetrics> = new Map()
  private compressionSupport: Map<string, boolean> = new Map()

  constructor() {
    this.cacheManager = new AudioCacheManager()
    this.initAudioContext()
    this.detectCompressionSupport()
  }

  async initialize(): Promise<void> {
    await this.cacheManager.initialize()
    await this.loadAudioManifest()
  }

  private async initAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      // Handle browser autoplay policies
      if (this.audioContext.state === 'suspended') {
        document.addEventListener('click', () => {
          if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume()
          }
        }, { once: true })
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error)
    }
  }

  private detectCompressionSupport(): void {
    const audio = new Audio()
    
    // Test MP3 support
    this.compressionSupport.set('mp3', audio.canPlayType('audio/mpeg') !== '')
    
    // Test Opus support
    this.compressionSupport.set('opus', audio.canPlayType('audio/ogg; codecs="opus"') !== '')
    
    // Test AAC support
    this.compressionSupport.set('aac', audio.canPlayType('audio/mp4; codecs="mp4a.40.2"') !== '')
  }

  private async loadAudioManifest(): Promise<void> {
    try {
      const response = await fetch('/content/audio-manifest.json')
      if (response.ok) {
        const manifest = await response.json()
        this.processManifest(manifest)
      }
    } catch (error) {
      console.error('Failed to load audio manifest:', error)
    }
  }

  private processManifest(manifest: any): void {
    // Process the existing manifest and enhance it with new structure
    for (const category in manifest.audioManifest.categories) {
      const files = manifest.audioManifest.categories[category].files
      
      files.forEach((file: any, index: number) => {
        const enhancedFile = {
          id: `${category}_${index}`,
          filename: file.filename,
          transcript: file.transcript,
          translation: file.translation,
          category,
          level: this.determineLevelFromCategory(category),
          priority: this.determinePriority(category, file),
          size: 0, // Will be populated when downloaded
          duration: file.duration || 0,
          url: `/content/audio/${file.filename}`,
          quality: 'high' as const,
          compressionFormats: {
            mp3_128: `/content/audio/compressed/mp3_128/${file.filename}`,
            opus_64: `/content/audio/compressed/opus_64/${file.filename.replace('.mp3', '.opus')}`,
            opus_32: `/content/audio/compressed/opus_32/${file.filename.replace('.mp3', '.opus')}`
          }
        }
        
        // Initialize metrics
        this.audioMetrics.set(enhancedFile.id, {
          playCount: 0,
          totalPlayTime: 0,
          skipRate: 0,
          completionRate: 0,
          preferredSpeed: 1.0
        })
      })
    }
  }

  private determineLevelFromCategory(category: string): number {
    const levelMap: { [key: string]: number } = {
      'greetings': 1,
      'introductions': 1,
      'numbers': 2,
      'family': 3,
      'market': 4,
      'pronunciation': 5
    }
    return levelMap[category] || 5
  }

  private determinePriority(category: string, file: any): 'immediate' | 'prefetch' | 'onDemand' {
    const immediatePriorities = ['greetings', 'numbers']
    const prefetchPriorities = ['family', 'introductions']
    
    if (immediatePriorities.includes(category)) return 'immediate'
    if (prefetchPriorities.includes(category)) return 'prefetch'
    return 'onDemand'
  }

  async playAudio(
    audioId: string, 
    options: AudioPlaybackOptions = {}
  ): Promise<{ success: boolean; duration?: number }> {
    try {
      if (!this.audioContext) {
        throw new Error('AudioContext not available')
      }

      const audioBuffer = await this.cacheManager.playAudio(audioId)
      if (!audioBuffer) {
        throw new Error(`Audio file ${audioId} not available`)
      }

      // Stop any currently playing audio for this ID
      this.stopAudio(audioId)

      // Create audio source
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer

      // Create gain node for volume control
      const gainNode = this.audioContext.createGain()
      gainNode.gain.value = options.volume || 1.0

      // Apply playback rate
      source.playbackRate.value = options.speed || 1.0

      // Connect nodes
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      // Handle fade effects
      if (options.fadeIn) {
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
        gainNode.gain.linearRampToValueAtTime(
          options.volume || 1.0,
          this.audioContext.currentTime + 0.1
        )
      }

      // Store reference
      this.currentlyPlaying.set(audioId, source)

      // Track metrics
      const startTime = Date.now()
      const metrics = this.audioMetrics.get(audioId)
      if (metrics) {
        metrics.playCount++
        metrics.preferredSpeed = options.speed || 1.0
      }

      // Set up completion tracking
      source.onended = () => {
        const endTime = Date.now()
        const playDuration = endTime - startTime
        
        if (metrics) {
          metrics.totalPlayTime += playDuration
          metrics.completionRate = (metrics.completionRate + 1) / metrics.playCount
        }
        
        this.currentlyPlaying.delete(audioId)
      }

      // Start playback
      const startOffset = options.startTime || 0
      const duration = options.endTime 
        ? options.endTime - startOffset 
        : audioBuffer.duration - startOffset

      source.start(0, startOffset, duration)

      // Handle fade out
      if (options.fadeOut && options.endTime) {
        const fadeStartTime = this.audioContext.currentTime + duration - 0.1
        gainNode.gain.setValueAtTime(options.volume || 1.0, fadeStartTime)
        gainNode.gain.linearRampToValueAtTime(0, fadeStartTime + 0.1)
      }

      // Handle looping
      if (options.loop) {
        source.loop = true
        source.loopStart = startOffset
        source.loopEnd = options.endTime || audioBuffer.duration
      }

      return { success: true, duration: audioBuffer.duration }
    } catch (error) {
      console.error(`Failed to play audio ${audioId}:`, error)
      return { success: false }
    }
  }

  stopAudio(audioId: string): void {
    const source = this.currentlyPlaying.get(audioId)
    if (source) {
      try {
        source.stop()
      } catch (error) {
        // Source might already be stopped
      }
      this.currentlyPlaying.delete(audioId)
    }
  }

  stopAllAudio(): void {
    this.currentlyPlaying.forEach((source, audioId) => {
      this.stopAudio(audioId)
    })
  }

  async preloadForLesson(lessonId: string, userLevel: number): Promise<void> {
    await this.cacheManager.preloadByStrategy(userLevel, lessonId)
  }

  async generateAudioVariations(audioId: string): Promise<string[]> {
    // Generate different speed variations for practice
    const variations = []
    const speeds = [0.5, 0.75, 1.0, 1.25]
    
    for (const speed of speeds) {
      const variationId = `${audioId}_${speed}x`
      variations.push(variationId)
      
      // This would trigger generation of speed-adjusted versions
      // Implementation depends on your audio processing pipeline
    }
    
    return variations
  }

  async getAudioMetrics(audioId?: string): Promise<AudioMetrics | Map<string, AudioMetrics>> {
    if (audioId) {
      return this.audioMetrics.get(audioId) || {
        playCount: 0,
        totalPlayTime: 0,
        skipRate: 0,
        completionRate: 0,
        preferredSpeed: 1.0
      }
    }
    
    return new Map(this.audioMetrics)
  }

  async getRecommendedAudio(userLevel: number, weakAreas: string[]): Promise<string[]> {
    const recommendations = []
    
    // Get audio files for weak areas
    for (const area of weakAreas) {
      const response = await fetch(`/api/audio/category/${area}?level=${userLevel}`)
      if (response.ok) {
        const files = await response.json()
        recommendations.push(...files.map((f: any) => f.id))
      }
    }
    
    // Add high-impact vocabulary based on frequency
    const frequentWords = await this.getHighFrequencyWords(userLevel)
    recommendations.push(...frequentWords)
    
    return recommendations.slice(0, 20) // Limit to top 20
  }

  private async getHighFrequencyWords(userLevel: number): Promise<string[]> {
    const response = await fetch(`/api/vocabulary/frequent?level=${userLevel}`)
    if (response.ok) {
      const words = await response.json()
      return words.map((w: any) => w.audioId)
    }
    return []
  }

  async validateAudioQuality(audioId: string): Promise<{
    valid: boolean
    issues: string[]
    score: number
  }> {
    try {
      const audioBuffer = await this.cacheManager.playAudio(audioId)
      if (!audioBuffer) {
        return { valid: false, issues: ['Audio file not found'], score: 0 }
      }

      const issues = []
      let score = 100

      // Check duration (too short or too long)
      if (audioBuffer.duration < 0.5) {
        issues.push('Audio too short (< 0.5s)')
        score -= 20
      } else if (audioBuffer.duration > 10) {
        issues.push('Audio too long (> 10s)')
        score -= 10
      }

      // Check for silence at beginning/end
      const channelData = audioBuffer.getChannelData(0)
      const silenceThreshold = 0.01
      
      let silentStart = 0
      for (let i = 0; i < Math.min(1000, channelData.length); i++) {
        if (Math.abs(channelData[i]) > silenceThreshold) break
        silentStart++
      }
      
      if (silentStart > 500) { // More than ~10ms of silence
        issues.push('Excessive silence at start')
        score -= 15
      }

      // Check for clipping
      let clippingCount = 0
      for (let i = 0; i < channelData.length; i++) {
        if (Math.abs(channelData[i]) > 0.98) {
          clippingCount++
        }
      }
      
      if (clippingCount > channelData.length * 0.001) { // More than 0.1% clipping
        issues.push('Audio clipping detected')
        score -= 25
      }

      // Check average volume
      const rms = Math.sqrt(
        channelData.reduce((sum, sample) => sum + sample * sample, 0) / channelData.length
      )
      
      if (rms < 0.05) {
        issues.push('Audio level too low')
        score -= 20
      } else if (rms > 0.3) {
        issues.push('Audio level too high')
        score -= 10
      }

      return {
        valid: score >= 70,
        issues,
        score
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return {
        valid: false,
        issues: [`Validation error: ${errorMessage}`],
        score: 0
      }
    }
  }

  // Pronunciation comparison utilities
  async compareUserPronunciation(
    targetAudioId: string, 
    userAudioBlob: Blob
  ): Promise<{
    similarity: number
    feedback: string[]
    recommendations: string[]
  }> {
    // This would integrate with speech recognition/analysis
    // For now, returning a simplified structure
    
    return {
      similarity: 85, // Percentage
      feedback: [
        'Good pronunciation of vowels',
        'Work on consonant clarity'
      ],
      recommendations: [
        'Practice with slower playback',
        'Focus on tongue position for "r" sounds'
      ]
    }
  }

  // Cultural context audio
  async getCulturalContextAudio(wordId: string): Promise<{
    audioId?: string
    culturalNote: string
    usage: string[]
  }> {
    const response = await fetch(`/api/cultural-context/${wordId}`)
    if (response.ok) {
      return response.json()
    }
    
    return {
      culturalNote: 'No cultural context available',
      usage: []
    }
  }

  // Cleanup and maintenance
  async performMaintenance(): Promise<void> {
    // Validate all cached audio files
    const cacheAnalytics = await this.cacheManager.getAnalytics()
    console.log('Cache analytics:', cacheAnalytics)
    
    // Clean up unused audio
    // This would run periodically
  }

  // Get service status
  getServiceStatus(): {
    cacheManager: boolean
    audioContext: boolean
    compressionSupport: Map<string, boolean>
    currentlyPlaying: number
  } {
    return {
      cacheManager: !!this.cacheManager,
      audioContext: !!this.audioContext && this.audioContext.state !== 'closed',
      compressionSupport: this.compressionSupport,
      currentlyPlaying: this.currentlyPlaying.size
    }
  }
}