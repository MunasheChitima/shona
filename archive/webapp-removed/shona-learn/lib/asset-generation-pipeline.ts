/**
 * Asset Generation Pipeline
 * Handles TTS and Video Synthesis AI model interactions
 * Implements Stage 4 of the Mudzidzisi AI workflow
 */

import { AssetPrompt, PhoneticProfile } from './mudzidzisi-ai'
import { promises as fs } from 'fs'
import path from 'path'

// Configuration interfaces
interface TTSConfig {
  apiKey: string
  endpoint: string
  model: string
  voiceId?: string
}

interface VideoSynthesisConfig {
  apiKey: string
  endpoint: string
  model: string
}

interface AssetGenerationResult {
  success: boolean
  fileName: string
  filePath: string
  size: number
  processingTime: number
  metadata: {
    word: string
    complexity: number
    timestamp: Date
    version: string
  }
}

interface GenerationLog {
  word: string
  profile: PhoneticProfile
  audioResult?: AssetGenerationResult
  videoResult?: AssetGenerationResult
  frontVideoResult?: AssetGenerationResult
  profileVideoResult?: AssetGenerationResult
  errors: string[]
  processingTime: number
}

/**
 * Asset Generation Pipeline Class
 * Manages the complete asset generation workflow
 */
export class AssetGenerationPipeline {
  private static instance: AssetGenerationPipeline
  private ttsConfig: TTSConfig
  private videoConfig: VideoSynthesisConfig
  private outputDir: string
  private logs: GenerationLog[] = []

  private constructor() {
    // Initialize with default configurations
    this.ttsConfig = {
      apiKey: process.env.GOOGLE_TTS_API_KEY || '',
      endpoint: 'https://texttospeech.googleapis.com/v1/text:synthesize',
      model: 'standard',
      voiceId: 'en-US-Standard-A' // Will be overridden for Shona
    }
    
    this.videoConfig = {
      apiKey: process.env.VIDEO_SYNTHESIS_API_KEY || '',
      endpoint: 'https://api.heygen.com/v2/video/generate',
      model: 'default'
    }
    
    this.outputDir = path.join(process.cwd(), 'public', 'audio', 'generated')
    this.ensureOutputDirectories()
  }

  public static getInstance(): AssetGenerationPipeline {
    if (!AssetGenerationPipeline.instance) {
      AssetGenerationPipeline.instance = new AssetGenerationPipeline()
    }
    return AssetGenerationPipeline.instance
  }

  /**
   * Ensure output directories exist
   */
  private async ensureOutputDirectories(): Promise<void> {
    const dirs = [
      path.join(this.outputDir, 'audio'),
      path.join(this.outputDir, 'video')
    ]
    
    for (const dir of dirs) {
      try {
        await fs.access(dir)
      } catch {
        await fs.mkdir(dir, { recursive: true })
      }
    }
  }

  /**
   * Generate audio asset using TTS AI
   */
  public async generateAudioAsset(
    word: string,
    audioPrompt: AssetPrompt,
    complexity: number
  ): Promise<AssetGenerationResult> {
    const startTime = Date.now()
    
    try {
      // For now, we'll use Google TTS with specialized configuration for Shona
      const audioData = await this.callTTSAPI(word, audioPrompt)
      
      const fileName = `${word}.wav`
      const filePath = path.join(this.outputDir, 'audio', fileName)
      
      // Save audio file
      await fs.writeFile(filePath, audioData)
      
      const stats = await fs.stat(filePath)
      const processingTime = Date.now() - startTime
      
      return {
        success: true,
        fileName,
        filePath,
        size: stats.size,
        processingTime,
        metadata: {
          word,
          complexity,
          timestamp: new Date(),
          version: '2.0'
        }
      }
    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error(`Audio generation failed for word "${word}":`, error)
      
      return {
        success: false,
        fileName: `${word}.wav`,
        filePath: '',
        size: 0,
        processingTime,
        metadata: {
          word,
          complexity,
          timestamp: new Date(),
          version: '2.0'
        }
      }
    }
  }

  /**
   * Generate video assets using Video Synthesis AI
   */
  public async generateVideoAssets(
    word: string,
    videoPrompt: AssetPrompt,
    complexity: number
  ): Promise<{
    frontVideo: AssetGenerationResult
    profileVideo?: AssetGenerationResult
  }> {
    const results: {
      frontVideo: AssetGenerationResult
      profileVideo?: AssetGenerationResult
    } = {
      frontVideo: {
        success: false,
        fileName: `${word}_front.mp4`,
        filePath: '',
        size: 0,
        processingTime: 0,
        metadata: {
          word,
          complexity,
          timestamp: new Date(),
          version: '2.0'
        }
      }
    }

    try {
      // Generate front-facing video
      results.frontVideo = await this.generateSingleVideo(
        word,
        videoPrompt,
        'front',
        complexity
      )

      // Generate profile video for whistled sounds
      if (this.requiresProfileVideo(videoPrompt)) {
        results.profileVideo = await this.generateSingleVideo(
          word,
          videoPrompt,
          'profile',
          complexity
        )
      }
    } catch (error) {
      console.error(`Video generation failed for word "${word}":`, error)
    }

    return results
  }

  /**
   * Generate a single video asset
   */
  private async generateSingleVideo(
    word: string,
    videoPrompt: AssetPrompt,
    viewType: 'front' | 'profile',
    complexity: number
  ): Promise<AssetGenerationResult> {
    const startTime = Date.now()
    
    try {
      // Modify prompt for specific view type
      const modifiedPrompt = this.modifyPromptForView(videoPrompt.prompt, viewType)
      
      const videoData = await this.callVideoSynthesisAPI(word, modifiedPrompt)
      
      const fileName = `${word}_${viewType}.mp4`
      const filePath = path.join(this.outputDir, 'video', fileName)
      
      // Save video file
      await fs.writeFile(filePath, videoData)
      
      const stats = await fs.stat(filePath)
      const processingTime = Date.now() - startTime
      
      return {
        success: true,
        fileName,
        filePath,
        size: stats.size,
        processingTime,
        metadata: {
          word,
          complexity,
          timestamp: new Date(),
          version: '2.0'
        }
      }
    } catch (error) {
      const processingTime = Date.now() - startTime
      console.error(`Video generation failed for word "${word}" (${viewType}):`, error)
      
      return {
        success: false,
        fileName: `${word}_${viewType}.mp4`,
        filePath: '',
        size: 0,
        processingTime,
        metadata: {
          word,
          complexity,
          timestamp: new Date(),
          version: '2.0'
        }
      }
    }
  }

  /**
   * Check if profile video is required (for whistled sounds)
   */
  private requiresProfileVideo(videoPrompt: AssetPrompt): boolean {
    return videoPrompt.prompt.includes('whistled') || 
           videoPrompt.prompt.includes('WHISTLED')
  }

  /**
   * Modify prompt for specific view type
   */
  private modifyPromptForView(originalPrompt: string, viewType: 'front' | 'profile'): string {
    if (viewType === 'profile') {
      return originalPrompt.replace(
        'front-facing human head',
        'profile (side-view) human head'
      ) + '\n\nIMPORTANT: This is a profile/side view to clearly show lip positioning and tongue movements.'
    }
    return originalPrompt
  }

  /**
   * Call TTS API (Google Cloud Text-to-Speech)
   */
  private async callTTSAPI(word: string, audioPrompt: AssetPrompt): Promise<Buffer> {
    if (!this.ttsConfig.apiKey) {
      throw new Error('TTS API key not configured')
    }

    // For demonstration, we'll simulate TTS generation
    // In production, this would make actual API calls
    const response = await fetch(this.ttsConfig.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.ttsConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: { text: word },
        voice: {
          languageCode: 'en-US', // Will be enhanced for Shona
          name: 'en-US-Standard-A',
          ssmlGender: 'NEUTRAL'
        },
        audioConfig: {
          audioEncoding: 'LINEAR16',
          sampleRateHertz: audioPrompt.specifications.audioSpecs?.sampleRate || 44100
        },
        // Custom instructions based on phonetic prompt
        customInstructions: audioPrompt.prompt
      })
    })

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    return Buffer.from(result.audioContent, 'base64')
  }

  /**
   * Call Video Synthesis API
   */
  private async callVideoSynthesisAPI(word: string, prompt: string): Promise<Buffer> {
    if (!this.videoConfig.apiKey) {
      throw new Error('Video Synthesis API key not configured')
    }

    // For demonstration, we'll simulate video generation
    // In production, this would make actual API calls to services like HeyGen, Synthesia, etc.
    const response = await fetch(this.videoConfig.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.videoConfig.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        script: word,
        customPrompt: prompt,
        avatar: 'default',
        voice: 'neutral',
        background: 'neutral',
        resolution: '1080p',
        fps: 30
      })
    })

    if (!response.ok) {
      throw new Error(`Video Synthesis API error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    // Download the generated video
    const videoResponse = await fetch(result.videoUrl)
    if (!videoResponse.ok) {
      throw new Error('Failed to download generated video')
    }

    return Buffer.from(await videoResponse.arrayBuffer())
  }

  /**
   * Process complete word with all assets
   */
  public async processCompleteWord(
    word: string,
    profile: PhoneticProfile,
    audioPrompt: AssetPrompt,
    videoPrompt: AssetPrompt,
    complexity: number
  ): Promise<GenerationLog> {
    const startTime = Date.now()
    const log: GenerationLog = {
      word,
      profile,
      errors: [],
      processingTime: 0
    }

    try {
      // Generate audio asset
      console.log(`Generating audio for word: ${word}`)
      log.audioResult = await this.generateAudioAsset(word, audioPrompt, complexity)
      
      if (!log.audioResult.success) {
        log.errors.push(`Audio generation failed for ${word}`)
      }

      // Generate video assets
      console.log(`Generating video for word: ${word}`)
      const videoResults = await this.generateVideoAssets(word, videoPrompt, complexity)
      
      log.videoResult = videoResults.frontVideo
      if (videoResults.profileVideo) {
        log.profileVideoResult = videoResults.profileVideo
      }

      if (!log.videoResult.success) {
        log.errors.push(`Video generation failed for ${word}`)
      }

      if (log.profileVideoResult && !log.profileVideoResult.success) {
        log.errors.push(`Profile video generation failed for ${word}`)
      }

    } catch (error) {
      log.errors.push(`Complete processing failed for ${word}: ${error}`)
      console.error(`Complete processing failed for ${word}:`, error)
    }

    log.processingTime = Date.now() - startTime
    this.logs.push(log)
    
    return log
  }

  /**
   * Batch process multiple words
   */
  public async processBatchWords(
    wordData: Array<{
      word: string
      profile: PhoneticProfile
      audioPrompt: AssetPrompt
      videoPrompt: AssetPrompt
      complexity: number
    }>
  ): Promise<GenerationLog[]> {
    const results: GenerationLog[] = []
    
    console.log(`Starting batch processing of ${wordData.length} words`)
    
    for (const data of wordData) {
      console.log(`Processing word ${results.length + 1}/${wordData.length}: ${data.word}`)
      
      const result = await this.processCompleteWord(
        data.word,
        data.profile,
        data.audioPrompt,
        data.videoPrompt,
        data.complexity
      )
      
      results.push(result)
      
      // Brief pause between requests to avoid rate limiting
      if (results.length < wordData.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    console.log(`Batch processing completed. ${results.length} words processed.`)
    return results
  }

  /**
   * Get generation statistics
   */
  public getGenerationStats(): {
    totalWords: number
    successfulAudio: number
    successfulVideo: number
    totalErrors: number
    averageProcessingTime: number
    complexityDistribution: Record<string, number>
  } {
    const stats = {
      totalWords: this.logs.length,
      successfulAudio: this.logs.filter(log => log.audioResult?.success).length,
      successfulVideo: this.logs.filter(log => log.videoResult?.success).length,
      totalErrors: this.logs.reduce((sum, log) => sum + log.errors.length, 0),
      averageProcessingTime: this.logs.reduce((sum, log) => sum + log.processingTime, 0) / this.logs.length,
      complexityDistribution: {} as Record<string, number>
    }

    // Calculate complexity distribution
    this.logs.forEach(log => {
      const complexity = log.audioResult?.metadata.complexity || 0
      const range = this.getComplexityRange(complexity)
      stats.complexityDistribution[range] = (stats.complexityDistribution[range] || 0) + 1
    })

    return stats
  }

  /**
   * Get complexity range for statistics
   */
  private getComplexityRange(complexity: number): string {
    if (complexity <= 5) return 'Low (1-5)'
    if (complexity <= 10) return 'Medium (6-10)'
    if (complexity <= 15) return 'High (11-15)'
    return 'Very High (16+)'
  }

  /**
   * Export generation log as JSON
   */
  public async exportGenerationLog(): Promise<string> {
    const exportData = {
      timestamp: new Date().toISOString(),
      version: '2.0',
      totalWords: this.logs.length,
      logs: this.logs,
      statistics: this.getGenerationStats()
    }

    const exportPath = path.join(this.outputDir, 'generation-log.json')
    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2))
    
    return exportPath
  }

  /**
   * Clear logs and reset pipeline
   */
  public reset(): void {
    this.logs = []
  }

  /**
   * Update API configurations
   */
  public updateConfigurations(
    ttsConfig?: Partial<TTSConfig>,
    videoConfig?: Partial<VideoSynthesisConfig>
  ): void {
    if (ttsConfig) {
      this.ttsConfig = { ...this.ttsConfig, ...ttsConfig }
    }
    
    if (videoConfig) {
      this.videoConfig = { ...this.videoConfig, ...videoConfig }
    }
  }
}

// Export singleton instance
export const assetGenerationPipeline = AssetGenerationPipeline.getInstance()

// Export utility functions
export const processWordAssets = (
  word: string,
  profile: PhoneticProfile,
  audioPrompt: AssetPrompt,
  videoPrompt: AssetPrompt,
  complexity: number
) => assetGenerationPipeline.processCompleteWord(word, profile, audioPrompt, videoPrompt, complexity)

export const processBatchAssets = (wordData: Array<{
  word: string
  profile: PhoneticProfile
  audioPrompt: AssetPrompt
  videoPrompt: AssetPrompt
  complexity: number
}>) => assetGenerationPipeline.processBatchWords(wordData)