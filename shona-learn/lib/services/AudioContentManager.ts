// Audio Content Management System
// Addresses missing audio files and provides audio content management

export interface AudioItem {
  id: string
  word: string
  pronunciation: string
  audioFile?: string
  status: 'available' | 'missing' | 'generating' | 'failed'
  category: string
  priority: 'high' | 'medium' | 'low'
  lastUpdated?: Date
}

export interface AudioGenerationRequest {
  word: string
  pronunciation: string
  category: string
  priority: 'high' | 'medium' | 'low'
  voiceId?: string
}

export interface AudioGenerationResult {
  success: boolean
  audioFile?: string
  error?: string
  duration?: number
}

export class AudioContentManager {
  private static instance: AudioContentManager
  private audioInventory: Map<string, AudioItem> = new Map()
  private generationQueue: AudioGenerationRequest[] = []
  private isGenerating = false

  constructor() {
    this.initializeAudioInventory()
  }

  static getInstance(): AudioContentManager {
    if (!AudioContentManager.instance) {
      AudioContentManager.instance = new AudioContentManager()
    }
    return AudioContentManager.instance
  }

  // Initialize audio inventory from existing content
  private async initializeAudioInventory() {
    try {
      // Load vocabulary data
      const response = await fetch('/api/vocabulary')
      if (response.ok) {
        const vocabulary = await response.json()
        
        vocabulary.forEach((item: any) => {
          const audioItem: AudioItem = {
            id: item.id || item.shona,
            word: item.shona,
            pronunciation: item.pronunciation || item.shona,
            audioFile: item.audioFile,
            status: item.audioFile ? 'available' : 'missing',
            category: item.category || 'general',
            priority: this.calculatePriority(item.category, item.difficulty),
            lastUpdated: new Date()
          }
          
          this.audioInventory.set(audioItem.id, audioItem)
        })
      }
    } catch (error) {
      console.error('Failed to initialize audio inventory:', error)
    }
  }

  // Calculate priority based on category and difficulty
  private calculatePriority(category: string, difficulty: number): 'high' | 'medium' | 'low' {
    const highPriorityCategories = ['basic', 'greetings', 'numbers', 'family']
    const mediumPriorityCategories = ['colors', 'animals', 'food', 'body']
    
    if (highPriorityCategories.includes(category.toLowerCase())) {
      return 'high'
    } else if (mediumPriorityCategories.includes(category.toLowerCase())) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  // Get audio item by word
  getAudioItem(word: string): AudioItem | undefined {
    return this.audioInventory.get(word)
  }

  // Get all audio items
  getAllAudioItems(): AudioItem[] {
    return Array.from(this.audioInventory.values())
  }

  // Get missing audio items
  getMissingAudioItems(): AudioItem[] {
    return Array.from(this.audioInventory.values()).filter(item => item.status === 'missing')
  }

  // Get audio items by priority
  getAudioItemsByPriority(priority: 'high' | 'medium' | 'low'): AudioItem[] {
    return Array.from(this.audioInventory.values()).filter(item => item.priority === priority)
  }

  // Get audio items by category
  getAudioItemsByCategory(category: string): AudioItem[] {
    return Array.from(this.audioInventory.values()).filter(item => 
      item.category.toLowerCase() === category.toLowerCase()
    )
  }

  // Add audio generation request to queue
  async queueAudioGeneration(request: AudioGenerationRequest): Promise<void> {
    this.generationQueue.push(request)
    
    // Start generation if not already running
    if (!this.isGenerating) {
      this.processGenerationQueue()
    }
  }

  // Process the generation queue
  private async processGenerationQueue(): Promise<void> {
    if (this.isGenerating || this.generationQueue.length === 0) {
      return
    }

    this.isGenerating = true

    try {
      // Sort queue by priority
      this.generationQueue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })

      while (this.generationQueue.length > 0) {
        const request = this.generationQueue.shift()!
        await this.generateAudio(request)
        
        // Add delay between generations to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('Error processing audio generation queue:', error)
    } finally {
      this.isGenerating = false
    }
  }

  // Generate audio for a word
  private async generateAudio(request: AudioGenerationRequest): Promise<AudioGenerationResult> {
    const audioItem = this.audioInventory.get(request.word)
    if (!audioItem) {
      return { success: false, error: 'Audio item not found' }
    }

    // Update status to generating
    audioItem.status = 'generating'
    this.audioInventory.set(request.word, audioItem)

    try {
      // Use ElevenLabs API for audio generation
      const result = await this.generateWithElevenLabs(request)
      
      if (result.success && result.audioFile) {
        // Update audio item with generated file
        audioItem.audioFile = result.audioFile
        audioItem.status = 'available'
        audioItem.lastUpdated = new Date()
        this.audioInventory.set(request.word, audioItem)
        
        // Save to database or file system
        await this.saveAudioItem(audioItem)
        
        return result
      } else {
        // Update status to failed
        audioItem.status = 'failed'
        this.audioInventory.set(request.word, audioItem)
        
        return result
      }
    } catch (error) {
      // Update status to failed
      audioItem.status = 'failed'
      this.audioInventory.set(request.word, audioItem)
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  // Generate audio using ElevenLabs API
  private async generateWithElevenLabs(request: AudioGenerationRequest): Promise<AudioGenerationResult> {
    try {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
      if (!apiKey) {
        throw new Error('ElevenLabs API key not configured')
      }

      const voiceId = request.voiceId || 'EXAVITQu4vr4xnSDxMaL' // Default Shona voice
      
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: request.word,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      // Generate filename
      const filename = `${request.word.toLowerCase().replace(/\s+/g, '_')}.mp3`
      
      return {
        success: true,
        audioFile: filename,
        duration: audioBlob.size // Approximate duration
      }
    } catch (error) {
      console.error('ElevenLabs generation error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Generation failed'
      }
    }
  }

  // Save audio item to database or file system
  private async saveAudioItem(audioItem: AudioItem): Promise<void> {
    try {
      // Save to database
      const response = await fetch('/api/audio-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(audioItem)
      })

      if (!response.ok) {
        throw new Error('Failed to save audio item')
      }
    } catch (error) {
      console.error('Failed to save audio item:', error)
    }
  }

  // Get audio statistics
  getAudioStatistics(): {
    total: number
    available: number
    missing: number
    generating: number
    failed: number
    byPriority: Record<string, number>
    byCategory: Record<string, number>
  } {
    const items = Array.from(this.audioInventory.values())
    
    const byPriority = items.reduce((acc, item) => {
      acc[item.priority] = (acc[item.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const byCategory = items.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: items.length,
      available: items.filter(item => item.status === 'available').length,
      missing: items.filter(item => item.status === 'missing').length,
      generating: items.filter(item => item.status === 'generating').length,
      failed: items.filter(item => item.status === 'failed').length,
      byPriority,
      byCategory
    }
  }

  // Generate missing audio for high priority items
  async generateHighPriorityAudio(): Promise<void> {
    const highPriorityMissing = this.getAudioItemsByPriority('high').filter(item => item.status === 'missing')
    
    for (const item of highPriorityMissing) {
      await this.queueAudioGeneration({
        word: item.word,
        pronunciation: item.pronunciation,
        category: item.category,
        priority: 'high'
      })
    }
  }

  // Retry failed audio generations
  async retryFailedAudio(): Promise<void> {
    const failedItems = Array.from(this.audioInventory.values()).filter(item => item.status === 'failed')
    
    for (const item of failedItems) {
      await this.queueAudioGeneration({
        word: item.word,
        pronunciation: item.pronunciation,
        category: item.category,
        priority: item.priority
      })
    }
  }

  // Export audio inventory
  exportAudioInventory(): AudioItem[] {
    return Array.from(this.audioInventory.values())
  }

  // Import audio inventory
  importAudioInventory(items: AudioItem[]): void {
    items.forEach(item => {
      this.audioInventory.set(item.id, item)
    })
  }
}

// Export singleton instance
export const audioContentManager = AudioContentManager.getInstance() 