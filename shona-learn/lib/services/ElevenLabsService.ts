// ElevenLabs Text-to-Speech Service for Shona
// Integrates with ShonaPronunciationService for authentic pronunciation

import ShonaPronunciationService from './ShonaPronunciationService'

interface ElevenLabsConfig {
  apiKey: string
  voiceId?: string
  modelId?: string
}

interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: string
  labels: Record<string, string>
}

interface TextToSpeechRequest {
  text: string
  voice_settings?: {
    stability: number
    similarity_boost: number
    style?: number
    use_speaker_boost?: boolean
  }
  pronunciation_dictionary_locators?: Array<{
    pronunciation_dictionary_id: string
    version_id: string
  }>
}

export class ElevenLabsService {
  private static instance: ElevenLabsService
  private apiKey: string
  private voiceId: string
  private modelId: string
  private pronunciationService: ShonaPronunciationService
  private baseUrl = 'https://api.elevenlabs.io/v1'

  // Native-inspired voice settings for authentic Shona pronunciation
  private defaultVoiceSettings = {
    stability: 0.75, // Balanced for natural flow
    similarity_boost: 0.85, // Clear articulation without over-emphasis
    style: 0.4, // Natural style based on native speaker analysis
    use_speaker_boost: true
  }

  // Recommended voices for African languages
  private readonly recommendedVoices = [
    'EXAVITQu4vr4xnSDxMaL', // Sarah - clear, neutral voice
    'ErXwobaYiN019PkySvjV', // Antoni - deep, clear voice
    'MF3mGyEYCl7XYWbV9V6O', // Elli - young, clear voice
  ]

  private constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey
    this.voiceId = config.voiceId || this.recommendedVoices[0]
    this.modelId = config.modelId || 'eleven_multilingual_v2'
    this.pronunciationService = ShonaPronunciationService.getInstance()
  }

  static getInstance(config?: ElevenLabsConfig): ElevenLabsService {
    if (!ElevenLabsService.instance && config) {
      ElevenLabsService.instance = new ElevenLabsService(config)
    }
    if (!ElevenLabsService.instance) {
      throw new Error('ElevenLabsService must be initialized with config first')
    }
    return ElevenLabsService.instance
  }

  // Get available voices
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.statusText}`)
      }

      const data = await response.json()
      return data.voices
    } catch (error) {
      console.error('Error fetching voices:', error)
      throw error
    }
  }

  // Generate speech from text with authentic Shona pronunciation
  async generateSpeech(
    text: string,
    options?: {
      voiceId?: string
      outputFormat?: 'mp3_44100' | 'mp3_22050' | 'pcm_16000' | 'pcm_22050' | 'pcm_44100'
      optimizeStreamingLatency?: number
      voiceSettings?: Partial<{
        stability: number
        similarity_boost: number
        style: number
        use_speaker_boost: boolean
      }>
    }
  ): Promise<ArrayBuffer> {
    const voiceId = options?.voiceId || this.voiceId
    const outputFormat = options?.outputFormat || 'mp3_44100'
    
    // Process text for authentic Shona pronunciation (natural approach)
    const processedText = this.processTextForNaturalPronunciation(text)
    
    // Build request body
    const requestBody: TextToSpeechRequest = {
      text: processedText.ssml || processedText.text,
      voice_settings: {
        ...this.defaultVoiceSettings,
        ...options?.voiceSettings
      }
    }

    // Add model ID to URL params
    const params = new URLSearchParams({
      optimize_streaming_latency: (options?.optimizeStreamingLatency || 0).toString(),
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
          body: JSON.stringify({
            ...requestBody,
            model_id: this.modelId
          })
        }
      )

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`ElevenLabs API error: ${response.status} - ${error}`)
      }

      return await response.arrayBuffer()
    } catch (error) {
      console.error('Error generating speech:', error)
      throw error
    }
  }

  // Process Shona text for natural pronunciation (based on native speaker analysis)
  private processTextForNaturalPronunciation(text: string): {
    text: string
    ssml?: string
    notes?: string[]
  } {
    // Use natural text without artificial modifications
    // Based on native speaker analysis: maintain word integrity and natural flow
    
    // Clean up any existing artificial modifications
    let naturalText = text
      .replace(/svee/g, 'sv')  // Remove artificial svee -> sv
      .replace(/zvee/g, 'zv')  // Remove artificial zvee -> zv
      .replace(/m-b/g, 'mb')   // Remove artificial m-b -> mb
      .replace(/n-d/g, 'nd')   // Remove artificial n-d -> nd
      .replace(/b-ha/g, 'bh')  // Remove artificial b-ha -> bh
      .replace(/d-ha/g, 'dh')  // Remove artificial d-ha -> dh
      .replace(/v-ha/g, 'vh')  // Remove artificial v-ha -> vh
      .replace(/mha/g, 'mh')   // Remove artificial mha -> mh
      .replace(/\s*-\s*/g, '') // Remove artificial pauses
      .replace(/\s*\.\s*/g, ' ') // Remove artificial breaks

    // Apply natural SSML for better pronunciation
    const ssml = this.buildNaturalSSML(naturalText)
    
    return {
      text: naturalText,
      ssml,
      notes: ['Using natural pronunciation based on native speaker analysis']
    }
  }

  // Build natural SSML based on native speaker patterns
  private buildNaturalSSML(text: string): string {
    // Based on native speaker analysis: slower rate, natural emphasis, clear articulation
    return `<speak>
      <prosody rate="85%" pitch="0%" volume="medium">
        <emphasis level="moderate">
          ${text}
        </emphasis>
      </prosody>
    </speak>`
  }

  // Generate and save audio file
  async generateAndSaveAudio(
    text: string,
    filename: string,
    options?: Parameters<typeof this.generateSpeech>[1]
  ): Promise<Blob> {
    const audioBuffer = await this.generateSpeech(text, options)
    const blob = new Blob([audioBuffer], { type: 'audio/mpeg' })
    
    // If in browser environment, trigger download
    if (typeof window !== 'undefined' && window.document) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
    
    return blob
  }

  // Stream audio generation for real-time playback
  async *streamSpeech(
    text: string,
    options?: Parameters<typeof this.generateSpeech>[1]
  ): AsyncGenerator<Uint8Array, void, unknown> {
    const voiceId = options?.voiceId || this.voiceId
    const processedText = this.processTextForNaturalPronunciation(text)
    
    const requestBody = {
      text: processedText.ssml || processedText.text,
      model_id: this.modelId,
      voice_settings: {
        ...this.defaultVoiceSettings,
        ...options?.voiceSettings
      }
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
      console.error('Error streaming speech:', error)
      throw error
    }
  }

  // Create a pronunciation dictionary entry for consistent pronunciation
  async createPronunciationEntry(word: string, phonetic: string): Promise<void> {
    // This would integrate with ElevenLabs pronunciation dictionary API
    // when it becomes available for custom languages
    console.log(`Would create pronunciation entry: ${word} -> ${phonetic}`)
  }

  // Get usage information
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

  // Get authentic pronunciation recommendations
  getAuthenticPronunciationGuidance(word: string): {
    word: string
    guidance: string
    naturalSound: string
    avoidArtificial: string[]
  } {
    const specialSounds = this.pronunciationService.getSpecialSounds(word)
    const guidance: string[] = []
    const avoidArtificial: string[] = []

    specialSounds.forEach((sound: {token: string, type: string, description: string}) => {
      switch (sound.type) {
        case 'whistled':
          if (sound.token === 'sv') {
            guidance.push('sv in "svika" should sound like "shika" - natural whistled sibilant')
            avoidArtificial.push('svee, s-v, s...v')
          } else if (sound.token === 'zv') {
            guidance.push('zv in "zvino" should flow naturally - voiced whistled sibilant')
            avoidArtificial.push('zvee, z-v, z...v')
          }
          break
        case 'prenasalized':
          guidance.push(`${sound.token} should flow naturally with brief nasal onset`)
          avoidArtificial.push(`${sound.token.charAt(0)}-${sound.token.charAt(1)}, ${sound.token.charAt(0)}...${sound.token.charAt(1)}`)
          break
        case 'breathy':
          guidance.push(`${sound.token} should have subtle breath emphasis, not exaggerated`)
          avoidArtificial.push(`${sound.token.charAt(0)}-ha, ${sound.token.charAt(0)}...h`)
          break
      }
    })

    return {
      word,
      guidance: guidance.join('; '),
      naturalSound: 'Let ElevenLabs handle pronunciation naturally with proper voice settings',
      avoidArtificial
    }
  }
}

export default ElevenLabsService