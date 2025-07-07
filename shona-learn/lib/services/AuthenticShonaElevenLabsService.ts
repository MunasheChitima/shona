/**
 * Authentic Shona ElevenLabs Service
 * Specialized ElevenLabs integration for authentic Shona pronunciation
 * Using native speaker settings and cultural context
 */

import { ShonaPronunciationService, PronunciationGuidance } from './ShonaPronunciationService'

export interface VoiceSettings {
  stability: number
  similarity_boost: number
  style: number
  use_speaker_boost: boolean
}

export interface AudioGenerationOptions {
  voiceSettings?: VoiceSettings
  tonePattern?: string
  culturalContext?: string
  isReligious?: boolean
  isTraditional?: boolean
  isFamilial?: boolean
}

export interface GeneratedAudio {
  audioBuffer: Buffer
  metadata: {
    word: string
    ipa: string
    tonePattern: string
    voiceSettings: VoiceSettings
    specialInstructions: string[]
    culturalHandling: string
    generatedAt: string
  }
}

export class AuthenticShonaElevenLabsService {
  
  private static readonly ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY
  private static readonly VOICE_ID = process.env.SHONA_VOICE_ID || 'ErXwobaYiN019PkySvjV' // Adam voice as fallback
  
  // Native speaker settings discovered through analysis
  private static readonly AUTHENTIC_VOICE_SETTINGS: VoiceSettings = {
    stability: 0.75,        // Balanced for natural flow
    similarity_boost: 0.85, // Clear articulation without over-emphasis
    style: 0.4,            // Natural style based on native speakers
    use_speaker_boost: true // Enhanced clarity
  }

  // Cultural context voice adjustments
  private static readonly CULTURAL_VOICE_ADJUSTMENTS = {
    religious: {
      stability: 0.8,        // More stable for reverent tone
      similarity_boost: 0.9, // Clearer for important concepts
      style: 0.3            // More formal style
    },
    traditional: {
      stability: 0.85,       // Very stable for ceremony words
      similarity_boost: 0.85, // Respectful clarity
      style: 0.2            // Traditional/formal style
    },
    familial: {
      stability: 0.7,        // Warmer, more natural
      similarity_boost: 0.8, // Warm but clear
      style: 0.5            // More personal style
    }
  }

  /**
   * Generate authentic Shona speech using ElevenLabs
   */
  static async generateAuthenticSpeech(
    text: string, 
    options: AudioGenerationOptions = {}
  ): Promise<GeneratedAudio> {
    
    if (!this.ELEVEN_LABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured')
    }

    // Get pronunciation guidance
    const guidance = ShonaPronunciationService.getPronunciationGuidance(text)
    
    // Determine voice settings based on cultural context
    const voiceSettings = this.determineVoiceSettings(options)
    
    // Create SSML with pronunciation guidance
    const ssml = this.createAuthenticSSML(text, guidance, options)
    
    // Generate audio
    const audioBuffer = await this.callElevenLabsAPI(ssml, voiceSettings)
    
    // Prepare metadata
    const metadata = {
      word: text,
      ipa: guidance.ipa,
      tonePattern: guidance.tonePattern,
      voiceSettings,
      specialInstructions: guidance.elevenLabsHints,
      culturalHandling: this.getCulturalHandling(options),
      generatedAt: new Date().toISOString()
    }

    return {
      audioBuffer,
      metadata
    }
  }

  /**
   * Determine voice settings based on cultural context
   */
  private static determineVoiceSettings(options: AudioGenerationOptions): VoiceSettings {
    let settings = { ...this.AUTHENTIC_VOICE_SETTINGS }
    
    // Apply cultural adjustments
    if (options.isReligious) {
      settings = { ...settings, ...this.CULTURAL_VOICE_ADJUSTMENTS.religious }
    } else if (options.isTraditional) {
      settings = { ...settings, ...this.CULTURAL_VOICE_ADJUSTMENTS.traditional }
    } else if (options.isFamilial) {
      settings = { ...settings, ...this.CULTURAL_VOICE_ADJUSTMENTS.familial }
    }
    
    // Override with any provided settings
    if (options.voiceSettings) {
      settings = { ...settings, ...options.voiceSettings }
    }
    
    return settings
  }

  /**
   * Create SSML with authentic Shona pronunciation guidance
   */
  private static createAuthenticSSML(
    text: string, 
    guidance: PronunciationGuidance, 
    options: AudioGenerationOptions
  ): string {
    
    let ssml = '<speak>'
    
    // Add rate control for clarity
    ssml += '<prosody rate="85%" pitch="medium">'
    
    // Add cultural context if needed
    if (options.culturalContext) {
      ssml += `<emphasis level="moderate">`
    }
    
    // Handle special sounds with phoneme tags
    let processedText = text
    guidance.specialSounds.forEach(sound => {
      const regex = new RegExp(sound.token, 'g')
      processedText = processedText.replace(regex, 
        `<phoneme alphabet="ipa" ph="${sound.ipa}">${sound.token}</phoneme>`
      )
    })
    
    ssml += processedText
    
    // Close tags
    if (options.culturalContext) {
      ssml += '</emphasis>'
    }
    ssml += '</prosody>'
    ssml += '</speak>'
    
    return ssml
  }

  /**
   * Call ElevenLabs API
   */
  private static async callElevenLabsAPI(ssml: string, voiceSettings: VoiceSettings): Promise<Buffer> {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${this.VOICE_ID}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.ELEVEN_LABS_API_KEY!
      },
      body: JSON.stringify({
        text: ssml,
        model_id: 'eleven_multilingual_v2',
        voice_settings: voiceSettings
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    return Buffer.from(arrayBuffer)
  }

  /**
   * Get cultural handling description
   */
  private static getCulturalHandling(options: AudioGenerationOptions): string {
    if (options.isReligious) {
      return 'Religious/spiritual context - respectful tone with enhanced stability'
    }
    if (options.isTraditional) {
      return 'Traditional ceremony context - formal delivery with reverent tone'
    }
    if (options.isFamilial) {
      return 'Family/kinship context - warm, personal delivery'
    }
    return 'Standard pronunciation with native speaker settings'
  }

  /**
   * Generate pronunciation guidance for ElevenLabs
   */
  static getAuthenticPronunciationGuidance(word: string): {
    ssmlHints: string[]
    voiceAdjustments: Partial<VoiceSettings>
    specialInstructions: string[]
  } {
    const guidance = ShonaPronunciationService.getPronunciationGuidance(word)
    
    const ssmlHints = [
      `Use IPA transcription: ${guidance.ipa}`,
      `Tone pattern: ${guidance.tonePattern}`,
      'Apply 85% speech rate for learning clarity'
    ]

    const voiceAdjustments: Partial<VoiceSettings> = {}
    
    // Adjust for complexity
    if (guidance.complexity > 10) {
      voiceAdjustments.stability = 0.8  // More stable for complex words
      voiceAdjustments.similarity_boost = 0.9  // Clearer for difficult pronunciation
    }

    // Adjust for special sounds
    if (guidance.specialSounds.length > 2) {
      voiceAdjustments.style = 0.3  // More controlled for multiple special sounds
    }

    return {
      ssmlHints,
      voiceAdjustments,
      specialInstructions: guidance.elevenLabsHints
    }
  }

  /**
   * Batch generate audio for multiple words
   */
  static async generateBatchAudio(
    words: Array<{ word: string; options?: AudioGenerationOptions }>,
    onProgress?: (current: number, total: number, word: string) => void
  ): Promise<Array<{ word: string; result: GeneratedAudio | null; error?: string }>> {
    
    const results = []
    
    for (let i = 0; i < words.length; i++) {
      const { word, options } = words[i]
      
      if (onProgress) {
        onProgress(i + 1, words.length, word)
      }
      
      try {
        const result = await this.generateAuthenticSpeech(word, options)
        results.push({ word, result })
        
        // Rate limiting - pause between requests
        if (i < words.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
      } catch (error) {
        console.error(`Failed to generate audio for "${word}":`, error)
        results.push({ 
          word, 
          result: null, 
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    
    return results
  }

  /**
   * Get native speaker settings
   */
  static getAuthenticSettings(): VoiceSettings {
    return { ...this.AUTHENTIC_VOICE_SETTINGS }
  }
}