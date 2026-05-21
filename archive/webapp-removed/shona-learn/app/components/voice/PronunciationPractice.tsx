'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import SpeechRecognition from './SpeechRecognition'
import ToneMeter from './ToneMeter'
import { audioService } from '../../../lib/services/AudioService'
import LoadingSpinner from '../LoadingSpinner'

function soundGuideHash(token: string) {
  return `sound-${encodeURIComponent(token.replace(/[^a-z0-9]/gi, '-'))}`
}

interface PronunciationPracticeProps {
  word: string
  translation: string
  phonetic: string
  tonePattern?: string
  toneHint?: string
  englishAnchor?: string
  soundGuideLinks?: string[]
  commonMistakeWarning?: string
  pronounceDifficulty?: string
  audioFile?: string
  /** When true, show a button to advance with current best score if 80+ is hard to reach */
  allowContinueAnyway?: boolean
  onComplete: (score: number) => void
}

export default function PronunciationPractice({
  word,
  translation,
  phonetic,
  tonePattern,
  toneHint,
  englishAnchor,
  soundGuideLinks = [],
  commonMistakeWarning,
  pronounceDifficulty,
  audioFile,
  allowContinueAnyway = true,
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

  const difficultyLabel =
    pronounceDifficulty === 'easy'
      ? 'Familiar sounds'
      : pronounceDifficulty === 'medium'
        ? 'New sound combos'
        : pronounceDifficulty === 'hard'
          ? 'Uniquely Shona sounds'
          : null

  return (
    <div className="max-w-2xl mx-auto p-6" data-testid="pronunciation-practice">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2" data-testid="pronunciation-word-display">{word}</h2>
        <p className="text-xl text-gray-600 text-center mb-2">{translation}</p>
        {phonetic && (
          <p className="text-lg text-gray-500 text-center mb-2">[{phonetic}]</p>
        )}
        {difficultyLabel && (
          <p className="text-center text-sm font-medium text-amber-900 mb-4">
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1">{difficultyLabel}</span>
          </p>
        )}

        {(englishAnchor || soundGuideLinks.length > 0 || commonMistakeWarning) && (
          <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-left">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Before you record</h3>
            {englishAnchor && (
              <p className="text-sm text-blue-950 leading-relaxed mb-3 whitespace-pre-wrap">{englishAnchor}</p>
            )}
            {soundGuideLinks.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-blue-900 mb-1">Sounds in this word (Sound Guide)</p>
                <div className="flex flex-wrap gap-2">
                  {soundGuideLinks.map((s) => (
                    <Link
                      key={s}
                      href={`/sound-guide#${soundGuideHash(s)}`}
                      className="text-xs rounded-full bg-white px-2 py-1 font-medium text-blue-800 ring-1 ring-blue-200 hover:bg-blue-100"
                    >
                      {s}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {commonMistakeWarning && (
              <div className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-950 ring-1 ring-amber-200">
                <span className="font-semibold">Common mistake: </span>
                {commonMistakeWarning}
              </div>
            )}
            <p className="mt-3 text-xs text-blue-800">
              <Link href="/sound-guide" className="underline font-medium">
                Full Sound Guide
              </Link>
              {' · '}
              Shona uses pure vowels, syllable-timed rhythm, and tone — see the guide intro.
            </p>
          </div>
        )}

        {tonePattern && toneHint && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800">
            <span className="font-semibold">Tone ({tonePattern}): </span>
            {toneHint}
          </div>
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
                  <span data-testid="pronunciation-score" className="sr-only">
                    {attempts[attempts.length - 1].score}
                  </span>
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
            <li>• Read the English anchor breakdown above out loud once before imitating audio</li>
            <li>• Keep syllable rhythm even — avoid English-style stress smashing weak syllables</li>
            <li>• If this word links to the Sound Guide, open those sounds for mouth-position detail</li>
            <li>• Try several times; small adjustments to lip rounding and nasals matter</li>
          </ul>
        </div>

        {allowContinueAnyway && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => onComplete(Math.max(bestScore, 65))}
              className="text-sm font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900"
            >
              Continue lesson with current best ({bestScore}%)
            </button>
            <p className="text-xs text-gray-500 mt-1">Use this if you are stuck — you can always replay the lesson later.</p>
          </div>
        )}
      </div>
    </div>
  )
} 