'use client'
import { useState, useEffect, useRef } from 'react'
import { FaVolumeUp, FaStop, FaPlay, FaPause } from 'react-icons/fa'
import ShonaPronunciationService from '@/lib/services/ShonaPronunciationService'
import ElevenLabsService from '@/lib/services/ElevenLabsService'

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
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pronunciationService = useRef(ShonaPronunciationService.getInstance())
  const elevenLabsService = useRef<ElevenLabsService | null>(null)

  useEffect(() => {
    // Initialize ElevenLabs if API key is available
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
    if (apiKey && useElevenLabs) {
      try {
        elevenLabsService.current = ElevenLabsService.getInstance({
          apiKey,
          voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID
        })
        setElevenLabsAvailable(true)
      } catch (error) {
        console.error('Failed to initialize ElevenLabs:', error)
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
  }, [])

  const speakWithElevenLabs = async (textOverride?: string) => {
    if (!elevenLabsService.current) return

    setLoading(true)
    setSpeaking(true)
    setPaused(false)

    try {
      const textToSpeak = textOverride || text
      
      // Get pronunciation hints
      const hints = pronunciationService.current.getElevenLabsHints(textToSpeak)
      
      // Generate audio with ElevenLabs
      const audioBuffer = await elevenLabsService.current.generateSpeech(textToSpeak, {
        voiceSettings: {
          stability: 0.8,
          similarity_boost: 0.9,
          style: 0.2
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
      }
    } catch (error) {
      console.error('ElevenLabs TTS error:', error)
      // Fallback to browser TTS
      speakWithBrowser(textOverride)
    } finally {
      setLoading(false)
    }
  }

  const speakWithBrowser = (textOverride?: string) => {
    speechSynthesis.cancel()
    
    const textToSpeak = textOverride || text
    
    // Get phonetic representation if not provided
    const phoneticText = phonetic || pronunciationService.current.getPhonetic(textToSpeak)
    
    // Use phonetic text for better pronunciation
    const utterance = new SpeechSynthesisUtterance(phoneticText)
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
      speakWithElevenLabs(textOverride)
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

  // Get pronunciation information
  const getPronunciationInfo = () => {
    const specialSounds = pronunciationService.current.getSpecialSounds(text)
    if (specialSounds.length > 0) {
      return (
        <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
          <p className="font-semibold text-blue-900 mb-1">Pronunciation tips:</p>
          <ul className="space-y-1">
            {specialSounds.map((sound, index) => (
              <li key={index} className="text-blue-800">
                <span className="font-mono font-bold">{sound.token}</span>: {sound.description}
              </li>
            ))}
          </ul>
        </div>
      )
    }
    return null
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
          >
            {loading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
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

      {/* Show pronunciation tips for special sounds */}
      {getPronunciationInfo()}

      {/* Show which TTS engine is being used */}
      <div className="text-xs text-gray-500">
        {useElevenLabs && elevenLabsAvailable ? 'Using ElevenLabs' : 'Using browser TTS'}
      </div>
    </div>
  )
} 