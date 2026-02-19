// Audio service for handling TTS and audio playback

export interface AudioServiceConfig {
  elevenLabsApiKey?: string
  voiceId?: string
  fallbackToBrowserTTS?: boolean
}

export class AudioService {
  private audio: HTMLAudioElement | null = null
  private isPlaying = false
  private config: AudioServiceConfig

  constructor(config: AudioServiceConfig = {}) {
    this.config = {
      elevenLabsApiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
      voiceId: 'EXAVITQu4vr4xnSDxMaL',
      fallbackToBrowserTTS: true,
      ...config
    }
  }

  async playAudio(audioFile?: string, text?: string): Promise<{ success: boolean; error?: string }> {
    if (typeof window === 'undefined') {
      return { success: false, error: 'Audio not available on server side' }
    }

    // Stop any currently playing audio
    await this.stopAudio()

    // Try ElevenLabs first if we have an API key and text
    if (this.config.elevenLabsApiKey && text) {
      const result = await this.playWithElevenLabs(text)
      if (result.success) return result
    }

    // Try audio file if provided
    if (audioFile) {
      const result = await this.playAudioFile(audioFile)
      if (result.success) return result
    }

    // Fallback to browser TTS
    if (this.config.fallbackToBrowserTTS && text) {
      return this.playWithBrowserTTS(text)
    }

    return { success: false, error: 'No audio source available' }
  }

  private async playWithElevenLabs(text: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.isPlaying = true
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.config.voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.config.elevenLabsApiKey!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
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
      
      this.audio = new Audio(audioUrl)
      this.audio.addEventListener('ended', () => {
        this.isPlaying = false
        URL.revokeObjectURL(audioUrl)
      })
      
      await this.audio.play()
      return { success: true }
    } catch (error) {
      this.isPlaying = false
      console.error('ElevenLabs audio error:', error)
      return { success: false, error: 'Failed to play with ElevenLabs' }
    }
  }

  private async playAudioFile(audioFile: string): Promise<{ success: boolean; error?: string }> {
    try {
      this.isPlaying = true
      this.audio = new Audio(audioFile)
      this.audio.addEventListener('ended', () => {
        this.isPlaying = false
      })
      
      await this.audio.play()
      return { success: true }
    } catch (error) {
      this.isPlaying = false
      console.error('Audio file error:', error)
      return { success: false, error: 'Failed to play audio file' }
    }
  }

  private playWithBrowserTTS(text: string): { success: boolean; error?: string } {
    try {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'en-US' // Default to English for Shona pronunciation
        utterance.rate = 0.8
        utterance.pitch = 1.0
        
        utterance.onend = () => {
          this.isPlaying = false
        }
        
        utterance.onerror = () => {
          this.isPlaying = false
        }
        
        this.isPlaying = true
        window.speechSynthesis.speak(utterance)
        return { success: true }
      } else {
        return { success: false, error: 'Speech synthesis not supported' }
      }
    } catch (error) {
      console.error('Browser TTS error:', error)
      return { success: false, error: 'Failed to use browser TTS' }
    }
  }

  async stopAudio(): Promise<void> {
    if (this.audio) {
      this.audio.pause()
      this.audio = null
    }
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    
    this.isPlaying = false
  }

  getIsPlaying(): boolean {
    return this.isPlaying
  }

  cleanup(): void {
    this.stopAudio()
  }
}

// Singleton instance
export const audioService = new AudioService()

// Default export for compatibility
export default audioService