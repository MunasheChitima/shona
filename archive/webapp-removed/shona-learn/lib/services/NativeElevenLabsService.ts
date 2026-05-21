/**
 * Authentic Shona ElevenLabs Service
 * Based on native speaker analysis and pronunciation documentation
 * Replaces artificial pronunciation modifications with natural, authentic speech
 */

interface ElevenLabsConfig {
  apiKey: string
  voiceId?: string
  modelId?: string
}

interface AuthenticVoiceSettings {
  stability: number
  similarity_boost: number
  style: number
  use_speaker_boost: boolean
}

interface AuthenticSSMLSettings {
  rate: string
  pitch: string
  volume: string
  emphasis: string
}

class AuthenticShonaElevenLabsService {
  private static instance: AuthenticShonaElevenLabsService
  private apiKey: string
  private voiceId: string
  private modelId: string
  private baseUrl = 'https://api.elevenlabs.io/v1'

  // Authentic pronunciation settings based on native speaker analysis
  private authenticSettings = {
    voiceSettings: {
      stability: 0.75,        // Balanced for natural flow
      similarity_boost: 0.85, // Clear articulation without over-emphasis
      style: 0.4,            // Natural style based on native speakers
      use_speaker_boost: true // Enhanced clarity
    } as AuthenticVoiceSettings,
    ssmlSettings: {
      rate: '85%',           // Slower rate based on native speaker analysis
      pitch: '0%',           // Natural pitch
      volume: 'medium',      // Balanced volume
      emphasis: 'moderate'   // Authentic emphasis level
    } as AuthenticSSMLSettings,
    textProcessing: {
      useNaturalFlow: true,           // Natural speech flow
      avoidArtificialPauses: true,    // No artificial breaks
      maintainWordIntegrity: true,    // Complete word pronunciation
      removeArtificialModifications: true // Clean up existing artificial mods
    }
  }

  // Recommended voices for authentic Shona pronunciation
  private readonly recommendedVoices = [
    'EXAVITQu4vr4xnSDxMaL', // Sarah - clear, neutral voice (best for Shona)
    'ErXwobaYiN019PkySvjV', // Antoni - deep, clear voice
    'MF3mGyEYCl7XYWbV9V6O', // Elli - young, clear voice
  ]

  private constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey
    this.voiceId = config.voiceId || this.recommendedVoices[0]
    this.modelId = config.modelId || 'eleven_multilingual_v2'
  }

  static getInstance(config?: ElevenLabsConfig): AuthenticShonaElevenLabsService {
    if (!AuthenticShonaElevenLabsService.instance) {
      if (!config) {
        throw new Error('AuthenticShonaElevenLabsService requires config on first initialization')
      }
      AuthenticShonaElevenLabsService.instance = new AuthenticShonaElevenLabsService(config)
    }
    return AuthenticShonaElevenLabsService.instance
  }

  /**
   * Generate authentic Shona speech
   * Uses natural pronunciation without artificial modifications
   */
  async generateAuthenticSpeech(text: string, options: any = {}): Promise<ArrayBuffer> {
    const processedText = this.processTextForAuthenticPronunciation(text)
    
    const voiceSettings = {
      ...this.authenticSettings.voiceSettings,
      ...options.voiceSettings
    }

    const ssmlText = this.createAuthenticSSML(processedText)

    return this.callElevenLabsAPI(ssmlText, voiceSettings, options)
  }

  /**
   * Process text for authentic Shona pronunciation
   * Removes artificial modifications and maintains natural word integrity
   */
  private processTextForAuthenticPronunciation(text: string): string {
    let processed = text

    // Remove all artificial pronunciation modifications
    if (this.authenticSettings.textProcessing.removeArtificialModifications) {
      processed = processed
        // Remove whistled sibilant artificial modifications
        .replace(/svee/gi, 'sv')     // svika should sound like "shika", not "sveeika"
        .replace(/zvee/gi, 'zv')     // zvino should sound natural, not "zveeino"
        .replace(/tsvee/gi, 'tsv')
        .replace(/dzv...?/gi, 'dzv')
        
        // Remove prenasalized consonant artificial modifications
        .replace(/m-b/gi, 'mb')      // mbira should sound natural, not "m-bira"
        .replace(/n-d/gi, 'nd')      // ndatenda should flow naturally
        .replace(/n-g/gi, 'ng')
        .replace(/n-j/gi, 'nj')
        .replace(/n-z/gi, 'nz')
        .replace(/m-v/gi, 'mv')
        
        // Remove breathy consonant artificial modifications
        .replace(/b-ha/gi, 'bh')     // bhazi should sound natural, not "b-haazi"
        .replace(/d-ha/gi, 'dh')
        .replace(/v-ha/gi, 'vh')
        .replace(/mha/gi, 'mh')
        
        // Remove artificial pauses and breaks
        .replace(/\s*\.\.\.\s*/g, ' ')  // Remove ... pauses
        .replace(/\s*-\s*/g, '')        // Remove - pauses
        .replace(/\s+/g, ' ')           // Normalize spacing
        .trim()
    }

    return processed
  }

  /**
   * Create authentic SSML based on native speaker patterns
   * Uses natural speech patterns observed in native speakers
   */
  private createAuthenticSSML(text: string): string {
    const { rate, pitch, volume, emphasis } = this.authenticSettings.ssmlSettings

    return `<speak>
      <prosody rate="${rate}" pitch="${pitch}" volume="${volume}">
        <emphasis level="${emphasis}">
          ${text}
        </emphasis>
      </prosody>
    </speak>`
  }

  /**
   * Call ElevenLabs API with authentic settings
   */
  private async callElevenLabsAPI(
    text: string, 
    voiceSettings: AuthenticVoiceSettings, 
    options: any = {}
  ): Promise<ArrayBuffer> {
    const voiceId = options.voiceId || this.voiceId
    const outputFormat = options.outputFormat || 'mp3_44100'

    const requestBody = {
      text: text,
      model_id: this.modelId,
      voice_settings: voiceSettings
    }

    const params = new URLSearchParams({
      optimize_streaming_latency: (options.optimizeStreamingLatency || 0).toString(),
      output_format: outputFormat
    })

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}?${params}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`ElevenLabs API error: ${response.status} - ${error}`)
      }

      return await response.arrayBuffer()
    } catch (error) {
      console.error('Error generating authentic Shona speech:', error)
      throw error
    }
  }

  /**
   * Stream authentic speech generation
   */
  async *streamAuthenticSpeech(text: string, options: any = {}): AsyncGenerator<Uint8Array, void, unknown> {
    const processedText = this.processTextForAuthenticPronunciation(text)
    const ssmlText = this.createAuthenticSSML(processedText)
    
    const voiceSettings = {
      ...this.authenticSettings.voiceSettings,
      ...options.voiceSettings
    }

    const voiceId = options.voiceId || this.voiceId

    const requestBody = {
      text: ssmlText,
      model_id: this.modelId,
      voice_settings: voiceSettings
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': this.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify(requestBody)
        }
      )

      if (!response.ok || !response.body) {
        throw new Error(`Stream error: ${response.statusText}`)
      }

      const reader = response.body.getReader()
      
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        yield value
      }
    } catch (error) {
      console.error('Error streaming authentic speech:', error)
      throw error
    }
  }

  /**
   * Get authentic pronunciation guidance for a word
   */
  getAuthenticPronunciationGuidance(word: string): {
    word: string
    authenticApproach: string
    naturalSound: string
    avoidArtificial: string[]
    nativeSpeekerInsight: string
  } {
    const guidance: string[] = []
    const avoidArtificial: string[] = []
    let nativeSpeekerInsight = ''

    // Analyze word for special Shona sounds
    if (/sv/.test(word.toLowerCase())) {
      guidance.push('sv should sound like "sh" with slight whistle - natural flow like in "shika"')
      avoidArtificial.push('svee', 's-v', 's...v', 'artificial emphasis')
      nativeSpeekerInsight = 'Native speakers pronounce "svika" flowing naturally like "shika" with a subtle whistled quality'
    }

    if (/zv/.test(word.toLowerCase())) {
      guidance.push('zv should flow naturally with voiced whistled quality')
      avoidArtificial.push('zvee', 'z-v', 'z...v', 'artificial breaks')
      nativeSpeekerInsight = 'Native speakers maintain natural word flow without artificial pauses'
    }

    if (/mb|nd|ng|nj|nz|mv/.test(word.toLowerCase())) {
      guidance.push('Prenasalized consonants should flow naturally with brief nasal onset')
      avoidArtificial.push('artificial hyphens', 'artificial pauses', 'broken syllables')
      nativeSpeekerInsight = 'Native speakers maintain smooth nasal-to-consonant transitions'
    }

    if (/bh|dh|vh|mh/.test(word.toLowerCase())) {
      guidance.push('Breathy consonants need subtle breath emphasis, not exaggerated')
      avoidArtificial.push('b-ha', 'd-ha', 'artificial breath sounds')
      nativeSpeekerInsight = 'Native speakers use subtle breath emphasis without breaking word flow'
    }

    return {
      word,
      authenticApproach: guidance.join('; ') || 'Use natural pronunciation with authentic voice settings',
      naturalSound: 'Let ElevenLabs handle pronunciation naturally with slower rate and moderate emphasis',
      avoidArtificial,
      nativeSpeekerInsight: nativeSpeekerInsight || 'Based on analysis of native Shona speakers using natural, flowing speech patterns'
    }
  }

  /**
   * Get usage information
   */
  async getUsage(): Promise<{
    character_count: number
    character_limit: number
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/user`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch usage: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        character_count: data.subscription.character_count,
        character_limit: data.subscription.character_limit
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
      throw error
    }
  }

  /**
   * Test authentic pronunciation with key Shona words
   */
  async testAuthenticPronunciation(): Promise<{
    testResults: Array<{
      word: string
      guidance: any
      audioGenerated: boolean
    }>
  }> {
    const testWords = ['svika', 'zvino', 'mbira', 'bhazi', 'ndatenda']
    const results = []

    for (const word of testWords) {
      const guidance = this.getAuthenticPronunciationGuidance(word)
      
      try {
        await this.generateAuthenticSpeech(word)
        results.push({
          word,
          guidance,
          audioGenerated: true
        })
      } catch (error) {
        results.push({
          word,
          guidance,
          audioGenerated: false
        })
      }
    }

    return { testResults: results }
  }
}

export default AuthenticShonaElevenLabsService 