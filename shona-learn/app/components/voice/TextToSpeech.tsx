'use client'
import { useState, useEffect } from 'react'
import { FaVolumeUp, FaStop, FaPlay, FaPause } from 'react-icons/fa'

interface TextToSpeechProps {
  text: string
  phonetic?: string
  rate?: number
  pitch?: number
  voice?: string
  autoPlay?: boolean
  onEnd?: () => void
}

export default function TextToSpeech({
  text,
  phonetic,
  rate = 0.8,
  pitch = 1,
  voice = 'default',
  autoPlay = false,
  onEnd
}: TextToSpeechProps) {
  const [speaking, setSpeaking] = useState(false)
  const [paused, setPaused] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

  useEffect(() => {
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
    }
  }, [])

  const speak = (textOverride?: string) => {
    speechSynthesis.cancel()
    
    const utterance = new SpeechSynthesisUtterance(textOverride || phonetic || text)
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

  const pause = () => {
    if (speechSynthesis.speaking && !speechSynthesis.paused) {
      speechSynthesis.pause()
      setPaused(true)
    }
  }

  const resume = () => {
    if (speechSynthesis.paused) {
      speechSynthesis.resume()
      setPaused(false)
    }
  }

  const stop = () => {
    speechSynthesis.cancel()
    setSpeaking(false)
    setPaused(false)
  }

  const playAtSpeed = (speed: number) => {
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

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="flex items-center space-x-3">
        {!speaking ? (
          <button
            onClick={() => speak()}
            className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-all hover:scale-105"
          >
            <FaPlay className="text-xl" />
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
    </div>
  )
} 