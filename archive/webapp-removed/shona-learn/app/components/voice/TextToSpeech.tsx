'use client'
import { useState, useEffect, useRef } from 'react'
import { FaVolumeUp, FaStop, FaPlay, FaPause } from 'react-icons/fa'
import AuthenticShonaElevenLabsService from '@/lib/services/NativeElevenLabsService'
import LoadingSpinner from '../LoadingSpinner'

interface TextToSpeechProps {
  text: string
  phonetic?: string
  rate?: number
  pitch?: number
  voice?: string
  autoPlay?: boolean
  onEnd?: () => void
  useElevenLabs?: boolean
}

export default function TextToSpeech({
  text,
  phonetic,
  rate = 0.8,
  pitch = 1,
  voice = 'default',
  autoPlay = false,
  onEnd,
  useElevenLabs = false
}: TextToSpeechProps) {
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [elevenLabsAvailable, setElevenLabsAvailable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pronunciationGuidance, setPronunciationGuidance] = useState<any>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const authenticShonaService = useRef<AuthenticShonaElevenLabsService | null>(null)

  useEffect(() => {
    // Initialize Authentic Shona ElevenLabs service
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
    if (apiKey && useElevenLabs) {
      try {
        authenticShonaService.current = AuthenticShonaElevenLabsService.getInstance({
          apiKey,
          voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID
        })
        setElevenLabsAvailable(true)
        
        // Get pronunciation guidance for this text
        const guidance = authenticShonaService.current.getAuthenticPronunciationGuidance(text)
        setPronunciationGuidance(guidance)
      } catch (error) {
        console.error('Failed to initialize Authentic Shona ElevenLabs:', error)
        setElevenLabsAvailable(false)
      }
    }

    // Load browser voices as fallback
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)
      
      // Try to find an African or British English voice
      const preferredVoice = availableVoices.find(v => 
        v.lang.includes('en-ZA') || // South African English
        v.lang.includes('en-GB') || // British English
        v.lang.includes('en-KE')    // Kenyan English
      ) || availableVoices[0]
      
      setSelectedVoice(preferredVoice)
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices

    if (autoPlay) {
      speak()
    }

    return () => {
      speechSynthesis.cancel()
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ''
      }
    }
  }, [text, useElevenLabs])

  const speakWithAuthenticShona = async (textOverride?: string) => {
    if (!authenticShonaService.current) return

    setLoading(true)
    setSpeaking(true)
    setPaused(false)

    try {
      const textToSpeak = textOverride || text
      
      console.log(`🎯 Generating authentic Shona pronunciation for: "${textToSpeak}"`)
      
      // Generate audio with authentic pronunciation (no artificial modifications)
      const audioBuffer = await authenticShonaService.current.generateAuthenticSpeech(textToSpeak, {
        voiceSettings: {
          // Using authentic voice settings based on native speaker analysis
          stability: 0.75,        // Balanced for natural flow
          similarity_boost: 0.85, // Clear articulation without over-emphasis
          style: 0.4,            // Natural style based on native speakers
          use_speaker_boost: true // Enhanced clarity
        }
      })

      // Create blob and play audio
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      
      if (audioRef.current) {
        audioRef.current.src = url
        audioRef.current.playbackRate = rate
        
        audioRef.current.onended = () => {
          setSpeaking(false)
          setPaused(false)
          onEnd?.()
          URL.revokeObjectURL(url)
          console.log(`✅ Finished playing authentic pronunciation of: "${textToSpeak}"`)
        }
        
        audioRef.current.onerror = (error) => {
          console.error('Audio playback error:', error)
          setSpeaking(false)
          setPaused(false)
          setLoading(false)
          // Fallback to browser TTS
          speakWithBrowser(textOverride)
        }
        
        await audioRef.current.play()
        console.log(`🔊 Playing authentic Shona pronunciation...`)
      }
    } catch (error) {
      console.error('Authentic Shona TTS error:', error)
      // Fallback to browser TTS
      speakWithBrowser(textOverride)
    } finally {
      setLoading(false)
    }
  }

  const speakWithBrowser = (textOverride?: string) => {
    speechSynthesis.cancel()
    
    const textToSpeak = textOverride || text
    
    // Use original text or phonetic guide for browser TTS
    const speechText = phonetic || textToSpeak
    
    const utterance = new SpeechSynthesisUtterance(speechText)
    utterance.rate = rate
    utterance.pitch = pitch
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.onstart = () => {
      setSpeaking(true)
      setPaused(false)
    }

    utterance.onend = () => {
      setSpeaking(false)
      setPaused(false)
      onEnd?.()
    }

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event)
      setSpeaking(false)
      setPaused(false)
    }

    speechSynthesis.speak(utterance)
  }

  const speak = (textOverride?: string) => {
    if (useElevenLabs && elevenLabsAvailable) {
      speakWithAuthenticShona(textOverride)
    } else {
      speakWithBrowser(textOverride)
    }
  }

  const pause = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
      setPaused(true)
    } else if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      setPaused(true)
    }
  }

  const resume = () => {
    if (audioRef.current && audioRef.current.paused && speaking) {
      audioRef.current.play()
      setPaused(false)
    } else if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setPaused(false)
    }
  }

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }

  const playAtSpeed = (speed: number) => {
    if (audioRef.current && speaking) {
      audioRef.current.playbackRate = speed
    } else {
      const tempRate = rate * speed
      const utterance = new SpeechSynthesisUtterance(phonetic || text)
      utterance.rate = tempRate
      utterance.pitch = pitch
      
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }

      speechSynthesis.cancel()
      speechSynthesis.speak(utterance)
    }
  }

  // Show authentic pronunciation guidance
  const getAuthenticPronunciationInfo = () => {
    if (!pronunciationGuidance) return null

    return (
      <div className="mt-2 p-3 bg-green-50 rounded-lg text-sm">
        <p className="font-semibold text-green-900 mb-2">✨ Authentic Pronunciation:</p>
        
        {pronunciationGuidance.authenticApproach && (
          <div className="mb-2">
            <span className="font-semibold text-green-800">Natural approach:</span>
            <p className="text-green-700">{pronunciationGuidance.authenticApproach}</p>
          </div>
        )}

        {pronunciationGuidance.nativeSpeekerInsight && (
          <div className="mb-2">
            <span className="font-semibold text-green-800">Native speaker insight:</span>
            <p className="text-green-700 italic">{pronunciationGuidance.nativeSpeekerInsight}</p>
          </div>
        )}

        {pronunciationGuidance.avoidArtificial && pronunciationGuidance.avoidArtificial.length > 0 && (
          <div>
            <span className="font-semibold text-red-800">Avoiding artificial:</span>
            <p className="text-red-700">{pronunciationGuidance.avoidArtificial.join(', ')}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Hidden audio element for ElevenLabs */}
      <audio ref={audioRef} className="hidden" />
      
      <div className="flex items-center space-x-3">
        {!speaking ? (
          <button
            onClick={() => speak()}
            disabled={loading}
            className={`p-3 ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white rounded-full transition-all hover:scale-105 ${loading ? 'cursor-not-allowed' : ''}`}
            title={useElevenLabs && elevenLabsAvailable ? 'Play with authentic Shona pronunciation' : 'Play with browser TTS'}
          >
            {loading ? (
              <LoadingSpinner size="small" message="Preparing audio..." />
            ) : (
              <FaPlay className="text-xl" />
            )}
          </button>
        ) : (
          <>
            {!paused ? (
              <button
                onClick={pause}
                className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-all"
              >
                <FaPause className="text-xl" />
              </button>
            ) : (
              <button
                onClick={resume}
                className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-full transition-all"
              >
                <FaPlay className="text-xl" />
              </button>
            )}
            <button
              onClick={stop}
              className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all"
            >
              <FaStop className="text-xl" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={() => playAtSpeed(0.5)}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition"
        >
          0.5x
        </button>
        <button
          onClick={() => playAtSpeed(0.75)}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition"
        >
          0.75x
        </button>
        <button
          onClick={() => playAtSpeed(1)}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition"
        >
          1x
        </button>
      </div>

      {phonetic && (
        <div className="text-center">
          <p className="text-sm text-gray-600">Pronunciation guide:</p>
          <p className="text-lg font-mono">{phonetic}</p>
        </div>
      )}

      {/* Show authentic pronunciation guidance */}
      {getAuthenticPronunciationInfo()}

      {/* Show which TTS engine is being used */}
      <div className="text-xs text-gray-500">
        {useElevenLabs && elevenLabsAvailable ? (
          <span className="text-green-600 font-semibold">✨ Using Authentic Shona ElevenLabs</span>
        ) : (
          'Using browser TTS'
        )}
      </div>
    </div>
  )
} 