interface AudioService {
  playWord(audioFile: string, fallbackText?: string): Promise<void>
  playPhrase(text: string, options?: SpeechOptions): Promise<void>
  isSupported(): boolean
  prefetchAudio(audioFiles: string[]): Promise<void>
  setVolume(volume: number): void
  pause(): void
  resume(): void
}

interface SpeechOptions {
  rate?: number
  pitch?: number
  voice?: string
  lang?: string
}

class WebAudioService implements AudioService {
  private audioCache: Map<string, HTMLAudioElement> = new Map()
  private currentAudio: HTMLAudioElement | null = null
  private volume: number = 1.0
  private isPlaying: boolean = false

  constructor() {
    this.setupAudioContext()
  }

  private setupAudioContext(): void {
    // Preload common audio files
    this.prefetchCommonAudio()
  }

  private async prefetchCommonAudio(): Promise<void> {
    const commonFiles = [
      'mhoro.mp3', 'mhoroi.mp3', 'shamwari.mp3', 'makadii.mp3', 'wakadii.mp3',
      'zita.mp3', 'ini_ndinonzi.mp3', 'munonzi_ani.mp3', 'motsi.mp3', 'piri.mp3'
    ]
    
    await this.prefetchAudio(commonFiles)
  }

  async playWord(audioFile: string, fallbackText?: string): Promise<void> {
    try {
      // Try to play audio file first
      let audio = this.audioCache.get(audioFile)
      
      if (!audio) {
        audio = new Audio(`/audio/${audioFile}`)
        audio.volume = this.volume
        
        // Add error handling for audio file loading
        audio.onerror = () => {
          console.warn(`Audio file ${audioFile} failed to load`)
          if (fallbackText) {
            this.playPhrase(fallbackText, { rate: 0.7, lang: 'en' })
          }
        }
        
        this.audioCache.set(audioFile, audio)
      }
      
      // Stop any currently playing audio
      if (this.currentAudio && !this.currentAudio.paused) {
        this.currentAudio.pause()
      }
      
      this.currentAudio = audio
      this.isPlaying = true
      
      await audio.play()
      
      // Set up ended event listener
      audio.addEventListener('ended', () => {
        this.isPlaying = false
      })
      
    } catch (error) {
      console.warn(`Failed to play audio file ${audioFile}:`, error)
      
      // Fallback to text-to-speech
      if (fallbackText && 'speechSynthesis' in window) {
        await this.playPhrase(fallbackText, { rate: 0.7, lang: 'en' })
      }
    }
  }

  async playPhrase(text: string, options: SpeechOptions = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Set speech options
      utterance.rate = options.rate || 0.8
      utterance.pitch = options.pitch || 1.0
      utterance.volume = this.volume
      utterance.lang = options.lang || 'en-US'
      
      // Try to find a specific voice if requested
      if (options.voice) {
        const voices = speechSynthesis.getVoices()
        const selectedVoice = voices.find(voice => 
          voice.name.toLowerCase().includes(options.voice!.toLowerCase())
        )
        if (selectedVoice) {
          utterance.voice = selectedVoice
        }
      }

      utterance.onend = () => {
        this.isPlaying = false
        resolve()
      }
      
      utterance.onerror = (event) => {
        this.isPlaying = false
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      this.isPlaying = true
      speechSynthesis.speak(utterance)
    })
  }

  isSupported(): boolean {
    return 'Audio' in window || 'speechSynthesis' in window
  }

  async prefetchAudio(audioFiles: string[]): Promise<void> {
    const promises = audioFiles.map(async (file) => {
      if (!this.audioCache.has(file)) {
        try {
          const audio = new Audio(`/audio/${file}`)
          audio.volume = this.volume
          
          // Preload the audio
          audio.preload = 'auto'
          
          // Wait for audio to be ready
          await new Promise((resolve, reject) => {
            audio.addEventListener('canplaythrough', resolve)
            audio.addEventListener('error', reject)
            
            // Timeout after 5 seconds
            setTimeout(() => reject(new Error('Audio preload timeout')), 5000)
          })
          
          this.audioCache.set(file, audio)
        } catch (error) {
          console.warn(`Failed to preload audio file ${file}:`, error)
        }
      }
    })
    
    await Promise.allSettled(promises)
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
    
    // Update volume for all cached audio
    this.audioCache.forEach(audio => {
      audio.volume = this.volume
    })
  }

  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause()
    }
    
    if ('speechSynthesis' in window && speechSynthesis.speaking) {
      speechSynthesis.pause()
    }
    
    this.isPlaying = false
  }

  resume(): void {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play()
      this.isPlaying = true
    }
    
    if ('speechSynthesis' in window && speechSynthesis.paused) {
      speechSynthesis.resume()
      this.isPlaying = true
    }
  }

  getPlaybackState(): { isPlaying: boolean; currentFile?: string } {
    return {
      isPlaying: this.isPlaying,
      currentFile: this.currentAudio?.src
    }
  }
}

// Singleton instance
const audioService = new WebAudioService()

export { audioService, WebAudioService }
export type { AudioService, SpeechOptions }