// ElevenLabs Text-to-Speech Service for Shona
// Integrates with ShonaPronunciationService for accurate pronunciation

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

  // Default voice settings optimized for Shona
  private defaultVoiceSettings = {
    stability: 0.75, // Higher stability for consistent pronunciation
    similarity_boost: 0.85, // Balance between clarity and naturalness
    style: 0.3, // Lower style for clearer pronunciation
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

  // Generate speech from text with Shona pronunciation
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
    
    // Process text for better Shona pronunciation
    const processedText = this.processTextForPronunciation(text)
    
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

  // Process Shona text for better pronunciation
  private processTextForPronunciation(text: string): {
    text: string
    ssml?: string
    notes?: string[]
  } {
    // Split text into words and process each
    const words = text.split(/\s+/)
    const processedWords: string[] = []
    const allNotes: string[] = []
    let useSSML = false

    words.forEach(word => {
      // Remove punctuation for processing
      const cleanWord = word.replace(/[.,!?;:'"]/g, '')
      const punctuation = word.replace(cleanWord, '')
      
      if (cleanWord) {
        const hints = this.pronunciationService.getElevenLabsHints(cleanWord)
        
        // Check if this word needs special handling
        const specialSounds = this.pronunciationService.getSpecialSounds(cleanWord)
        
        if (specialSounds.length > 0) {
          useSSML = true
          // Apply pronunciation replacements for better ElevenLabs handling
          let processedWord = this.applyPronunciationReplacements(cleanWord, specialSounds)
          processedWords.push(processedWord + punctuation)
          
          if (hints.notes) {
            allNotes.push(...hints.notes)
          }
        } else {
          processedWords.push(word)
        }
      } else {
        processedWords.push(word)
      }
    })

    const processedText = processedWords.join(' ')
    
    // If we need SSML, wrap the entire text
    if (useSSML) {
      const ssml = this.buildSSML(processedText, text)
      return {
        text: processedText,
        ssml,
        notes: allNotes.length > 0 ? allNotes : undefined
      }
    }

    return { text: processedText }
  }

  // Apply specific pronunciation replacements for ElevenLabs
  private applyPronunciationReplacements(word: string, specialSounds: Array<{token: string, type: string}>): string {
    let processed = word

    specialSounds.forEach(sound => {
      switch (sound.token) {
        // Whistled sibilants - use phonetic spelling
        case 'sv':
          processed = processed.replace(/sv/g, 'svee')
          break
        case 'zv':
          processed = processed.replace(/zv/g, 'zvee')
          break
        case 'tsv':
          processed = processed.replace(/tsv/g, 'tsvee')
          break
        
        // Prenasalized consonants - add slight pause
        case 'mb':
          processed = processed.replace(/mb/g, 'm-b')
          break
        case 'nd':
          processed = processed.replace(/nd/g, 'n-d')
          break
        case 'ng':
          processed = processed.replace(/ng/g, 'n-g')
          break
        case 'nj':
          processed = processed.replace(/nj/g, 'n-j')
          break
        case 'nz':
          processed = processed.replace(/nz/g, 'n-z')
          break
        
        // Breathy consonants - add 'h' sound hint
        case 'bh':
          processed = processed.replace(/bh/g, 'b-ha')
          break
        case 'dh':
          processed = processed.replace(/dh/g, 'd-ha')
          break
        case 'vh':
          processed = processed.replace(/vh/g, 'v-ha')
          break
        case 'mh':
          processed = processed.replace(/mh/g, 'mha')
          break
      }
    })

    return processed
  }

  // Build SSML for complex pronunciations
  private buildSSML(processedText: string, originalText: string): string {
    return `<speak>
      <lang xml:lang="en-ZA">
        <prosody rate="90%" pitch="+0st">
          ${processedText}
        </prosody>
      </lang>
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
    const processedText = this.processTextForPronunciation(text)
    
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
}

export default ElevenLabsService