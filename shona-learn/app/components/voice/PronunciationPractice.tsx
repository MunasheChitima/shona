'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import SpeechRecognition from './SpeechRecognition'
import TextToSpeech from './TextToSpeech'
import ToneMeter from './ToneMeter'

interface PronunciationPracticeProps {
  word: string
  translation: string
  phonetic: string
  tonePattern?: string
  onComplete: (score: number) => void
}

export default function PronunciationPractice({
  word,
  translation,
  phonetic,
  tonePattern,
  onComplete
}: PronunciationPracticeProps) {
  const [attempts, setAttempts] = useState<Array<{
    transcript: string
    score: number
    timestamp: Date
  }>>([])
  const [bestScore, setBestScore] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)

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

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2">{word}</h2>
        <p className="text-xl text-gray-600 text-center mb-6">{translation}</p>

        {/* Audio playback section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-center">Listen and Learn</h3>
          <TextToSpeech 
            text={word}
            phonetic={phonetic}
            rate={0.8}
          />
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