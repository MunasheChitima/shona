'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
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
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setError('Speech recognition not available in server-side rendering')
      return
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser')
      return
    }

    // Cleanup on unmount
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (error) {
          console.error('Error stopping speech recognition:', error)
        }
        recognitionRef.current = null
      }
    }
  }, [])

  const startListening = useCallback(() => {
    try {
      if (typeof window === 'undefined') {
        setError('Speech recognition not available in server-side rendering')
        return
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (!SpeechRecognition) {
        setError('Speech recognition not supported in this browser')
        return
      }

      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      recognition.continuous = false
      recognition.interimResults = true
      recognition.lang = language
      recognition.maxAlternatives = 3

      recognition.onstart = () => {
        setIsListening(true)
        setError(null)
        setTranscript('')
      }

      recognition.onresult = (event: any) => {
        try {
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
        } catch (error) {
          console.error('Error processing speech result:', error)
          setError('Error processing speech result')
        }
      }

      recognition.onerror = (event: any) => {
        setError(`Error: ${event.error}`)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      setError('Failed to start speech recognition')
    }
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