'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import SpeechRecognition from './SpeechRecognition'
import TextToSpeech from './TextToSpeech'
import ToneMeter from './ToneMeter'
import { audioService } from '../../../lib/services/AudioService'
import LoadingSpinner from '../LoadingSpinner'

interface PronunciationPracticeProps {
  word: string
  translation: string
  phonetic: string
  tonePattern?: string
  audioFile?: string
  onComplete: (score: number) => void
}

export default function PronunciationPractice({
  word,
  translation,
  phonetic,
  tonePattern,
  audioFile,
  onComplete
}: PronunciationPracticeProps) {
  const [attempts, setAttempts] = useState<Array<{
    transcript: string
    score: number
    timestamp: Date
  }>>([])
  const [bestScore, setBestScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isAudioReady, setIsAudioReady] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize audio service
    const initAudio = async () => {
      try {
        setIsAudioReady(true)
      } catch (error) {
        console.error('Failed to initialize audio:', error)
        setAudioError('Audio not available')
      }
    }

    initAudio()

    // Cleanup on unmount
    return () => {
      audioService.cleanup()
      // Cancel any ongoing speech synthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [audioFile])

  const handleSpeechResult = (transcript: string, score: number) => {
    const newAttempt = {
      transcript,
      score,
      timestamp: new Date()
    }

    setAttempts([...attempts, newAttempt])
    
    if (score > bestScore) {
      setBestScore(score)
    }

    setShowFeedback(true)
    
    // Auto-hide feedback after 3 seconds
    setTimeout(() => setShowFeedback(false), 3000)

    // Complete if score is good enough
    if (score >= 80) {
      setTimeout(() => onComplete(score), 1500)
    }
  }

  const handlePlayAudio = async () => {
    setAudioError(null)
    if (!audioFile) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setAudioError('Audio not available, using text-to-speech.')
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = 'sn-ZW'
        speechSynthesis.speak(utterance)
      } else {
        setAudioError('Audio not available and text-to-speech is not supported on this device.')
      }
      return
    }
    try {
      if (typeof window !== 'undefined') {
        const audio = new window.Audio(`/content/audio/${audioFile}`)
        await audio.play()
      }
    } catch (error) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setAudioError('Audio not available, using text-to-speech.')
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = 'sn-ZW'
        speechSynthesis.speak(utterance)
      } else {
        setAudioError('Audio not available and text-to-speech is not supported on this device.')
      }
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981' // green
    if (score >= 60) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const getScoreFeedback = (score: number) => {
    if (score >= 90) return 'Excellent! 🎉'
    if (score >= 80) return 'Great job! 👏'
    if (score >= 70) return 'Good effort! 👍'
    if (score >= 60) return 'Getting there! 💪'
    return 'Keep practicing! 🎯'
  }

  if (audioError) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">🔇</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Audio Not Available</h2>
          <p className="text-gray-600 mb-4">{audioError}</p>
          <p className="text-sm text-gray-500">
            You can still practice pronunciation using the speech recognition feature.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2">{word}</h2>
        <p className="text-xl text-gray-600 text-center mb-2">{translation}</p>
        {phonetic && (
          <p className="text-lg text-gray-500 text-center mb-6">[{phonetic}]</p>
        )}

        {/* Audio playback section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-center">Listen and Learn</h3>
          <div className="flex justify-center">
            <button
              onClick={handlePlayAudio}
              disabled={!isAudioReady}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center space-x-2"
            >
              <span>🔊</span>
              <span>{isAudioReady ? 'Play Audio' : <LoadingSpinner size="small" message="Loading audio..." />}</span>
            </button>
          </div>
          {audioFile && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Audio file: {audioFile}
            </p>
          )}
        </div>

        {/* Tone pattern visualization */}
        {tonePattern && (
          <div className="mb-8">
            <ToneMeter pattern={tonePattern} word={word} />
          </div>
        )}

        {/* Speech recognition section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-center">Your Turn!</h3>
          <SpeechRecognition
            targetPhrase={word}
            onResult={handleSpeechResult}
          />
        </div>

        {/* Score display */}
        <AnimatePresence>
          {showFeedback && attempts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="flex items-center justify-center space-x-6">
                <div className="w-32 h-32">
                  <CircularProgressbar
                    value={attempts[attempts.length - 1].score}
                    text={`${attempts[attempts.length - 1].score}%`}
                    styles={buildStyles({
                      pathColor: getScoreColor(attempts[attempts.length - 1].score),
                      textColor: getScoreColor(attempts[attempts.length - 1].score),
                      trailColor: '#e5e7eb'
                    })}
                  />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold" style={{ color: getScoreColor(attempts[attempts.length - 1].score) }}>
                    {getScoreFeedback(attempts[attempts.length - 1].score)}
                  </p>
                  <p className="text-gray-600 mt-2">
                    You said: "{attempts[attempts.length - 1].transcript}"
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Attempts history */}
        {attempts.length > 0 && (
          <div className="border-t pt-6">
            <h4 className="text-sm font-semibold text-gray-600 mb-3">Practice History</h4>
            <div className="space-y-2">
              {attempts.slice(-5).reverse().map((attempt, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 rounded p-2">
                  <span className="text-sm text-gray-600">"{attempt.transcript}"</span>
                  <span className={`font-semibold text-sm`} style={{ color: getScoreColor(attempt.score) }}>
                    {attempt.score}%
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center">
              <p className="text-sm text-gray-600">
                Best score: <span className="font-bold" style={{ color: getScoreColor(bestScore) }}>{bestScore}%</span>
              </p>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Pronunciation Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Listen carefully to the audio before trying</li>
            <li>• Pay attention to tone patterns</li>
            <li>• Speak clearly and at a steady pace</li>
            <li>• Try multiple times - practice makes perfect!</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 