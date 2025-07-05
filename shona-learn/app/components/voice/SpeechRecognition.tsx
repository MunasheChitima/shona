'use client'
import { useEffect, useState, useCallback } from 'react'
import { FaMicrophone, FaMicrophoneSlash, FaSpinner } from 'react-icons/fa'

interface SpeechRecognitionProps {
  targetPhrase: string
  onResult: (transcript: string, score: number) => void
  language?: string
}

export default function SpeechRecognition({ 
  targetPhrase, 
  onResult, 
  language = 'en-US' 
}: SpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser')
    }
  }, [])

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = language
    recognition.maxAlternatives = 3

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setTranscript('')
    }

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const result = event.results[current]
      const primaryTranscript = result[0].transcript
      const primaryConfidence = result[0].confidence || 0.9

      setTranscript(primaryTranscript)
      setConfidence(primaryConfidence)

      if (result.isFinal) {
        // Calculate pronunciation score
        const score = calculatePronunciationScore(primaryTranscript, targetPhrase, primaryConfidence)
        onResult(primaryTranscript, score)
      }
    }

    recognition.onerror = (event) => {
      setError(`Error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }, [language, targetPhrase, onResult])

  const calculatePronunciationScore = (
    spoken: string, 
    target: string, 
    confidence: number
  ): number => {
    // Normalize strings
    const spokenNorm = spoken.toLowerCase().trim()
    const targetNorm = target.toLowerCase().trim()

    // Exact match
    if (spokenNorm === targetNorm) {
      return Math.round(confidence * 100)
    }

    // Calculate Levenshtein distance
    const distance = levenshteinDistance(spokenNorm, targetNorm)
    const maxLen = Math.max(spokenNorm.length, targetNorm.length)
    const similarity = 1 - (distance / maxLen)

    // Factor in confidence and similarity
    const score = similarity * confidence * 100

    return Math.round(Math.max(0, Math.min(100, score)))
  }

  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = []

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[b.length][a.length]
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={startListening}
        disabled={isListening || !!error}
        className={`
          p-6 rounded-full transition-all transform
          ${isListening 
            ? 'bg-red-500 scale-110 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
          }
          ${error ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isListening ? (
          <FaMicrophone className="text-white text-3xl" />
        ) : (
          <FaMicrophoneSlash className="text-white text-3xl" />
        )}
      </button>

      {isListening && (
        <div className="flex items-center space-x-2">
          <FaSpinner className="animate-spin text-blue-500" />
          <span className="text-gray-600">Listening...</span>
        </div>
      )}

      {transcript && (
        <div className="bg-gray-100 rounded-lg p-4 max-w-md">
          <p className="text-center text-lg">{transcript}</p>
          <div className="mt-2 flex justify-center">
            <div className="text-sm text-gray-500">
              Confidence: {Math.round(confidence * 100)}%
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
} 