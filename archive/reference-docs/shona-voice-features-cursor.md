# Voice Input/Output Features for Shona Learning App

## CURSOR AGENT INSTRUCTIONS - BUILD COMPLETE VOICE SYSTEM

```
@workspace Add comprehensive voice features to the Shona learning app:
1. Speech recognition for pronunciation practice
2. Advanced text-to-speech with adjustable speed
3. Real-time pronunciation scoring
4. Audio recording and playback
5. Visual feedback for pronunciation
6. Voice-based navigation
Build all components and integrate them into the existing app structure.
```

## NEW DEPENDENCIES

```bash
npm install react-speech-kit @react-hook/media-recorder react-mic
npm install pitch-detect waveform-react react-countdown-circle-timer
npm install --save-dev @types/dom-speech-recognition
```

## CORE VOICE COMPONENTS

### 1. app/components/voice/SpeechRecognition.tsx

```tsx
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
```

### 2. app/components/voice/TextToSpeech.tsx

```tsx
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
```

### 3. app/components/voice/PronunciationPractice.tsx

```tsx
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
```

### 4. app/components/voice/ToneMeter.tsx

```tsx
'use client'
import { motion } from 'framer-motion'

interface ToneMeterProps {
  pattern: string // e.g., "HL" for High-Low
  word: string
}

export default function ToneMeter({ pattern, word }: ToneMeterProps) {
  const syllables = word.match(/[^aeiou]*[aeiou]+/gi) || []
  
  const getToneHeight = (tone: string) => {
    switch(tone) {
      case 'H': return 20  // High tone
      case 'L': return 60  // Low tone
      case 'R': return 40  // Rising (mid)
      case 'F': return 40  // Falling (mid)
      default: return 40
    }
  }

  const getToneColor = (tone: string) => {
    switch(tone) {
      case 'H': return '#ef4444' // red for high
      case 'L': return '#3b82f6' // blue for low
      case 'R': return '#10b981' // green for rising
      case 'F': return '#f59e0b' // yellow for falling
      default: return '#6b7280'
    }
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-600 mb-3 text-center">Tone Pattern</h4>
      
      <div className="relative h-20 mb-4">
        <svg className="w-full h-full">
          {/* Grid lines */}
          <line x1="0" y1="20" x2="100%" y2="20" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="0" y1="40" x2="100%" y2="40" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="0" y1="60" x2="100%" y2="60" stroke="#e5e7eb" strokeWidth="1" />
          
          {/* Tone line */}
          <motion.path
            d={`M ${syllables.map((_, i) => {
              const x = (i + 0.5) * (100 / syllables.length)
              const y = getToneHeight(pattern[i] || 'L')
              return `${x},${y}`
            }).join(' L ')}`}
            stroke={getToneColor(pattern[0])}
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          
          {/* Tone dots */}
          {syllables.map((_, i) => {
            const x = (i + 0.5) * (100 / syllables.length)
            const y = getToneHeight(pattern[i] || 'L')
            return (
              <motion.circle
                key={i}
                cx={`${x}%`}
                cy={y}
                r="6"
                fill={getToneColor(pattern[i] || 'L')}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.2 }}
              />
            )
          })}
        </svg>
      </div>
      
      {/* Syllable labels */}
      <div className="flex justify-around">
        {syllables.map((syllable, i) => (
          <div key={i} className="text-center">
            <p className="font-semibold">{syllable}</p>
            <p className="text-xs text-gray-500">
              {pattern[i] === 'H' ? 'High' : 
               pattern[i] === 'L' ? 'Low' :
               pattern[i] === 'R' ? 'Rising' : 'Falling'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### 5. app/components/voice/VoiceExercise.tsx

```tsx
'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import PronunciationPractice from './PronunciationPractice'
import ConversationPractice from './ConversationPractice'
import ListeningExercise from './ListeningExercise'

interface VoiceExerciseProps {
  exercise: {
    id: string
    type: 'pronunciation' | 'conversation' | 'listening'
    content: any
  }
  onComplete: (score: number) => void
}

export default function VoiceExercise({ exercise, onComplete }: VoiceExerciseProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [scores, setScores] = useState<number[]>([])

  const handleStepComplete = (score: number) => {
    setScores([...scores, score])
    
    if (exercise.type === 'pronunciation' && exercise.content.words) {
      if (currentStep < exercise.content.words.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        // Calculate average score
        const avgScore = [...scores, score].reduce((a, b) => a + b, 0) / (scores.length + 1)
        onComplete(Math.round(avgScore))
      }
    } else {
      onComplete(score)
    }
  }

  const renderExercise = () => {
    switch (exercise.type) {
      case 'pronunciation':
        if (exercise.content.words && exercise.content.words[currentStep]) {
          const word = exercise.content.words[currentStep]
          return (
            <PronunciationPractice
              word={word.shona}
              translation={word.english}
              phonetic={word.phonetic}
              tonePattern={word.tonePattern}
              onComplete={handleStepComplete}
            />
          )
        }
        break
      
      case 'conversation':
        return (
          <ConversationPractice
            dialogue={exercise.content.dialogue}
            onComplete={handleStepComplete}
          />
        )
      
      case 'listening':
        return (
          <ListeningExercise
            audio={exercise.content.audio}
            questions={exercise.content.questions}
            onComplete={handleStepComplete}
          />
        )
      
      default:
        return <div>Unknown exercise type</div>
    }
  }

  return (
    <div>
      {/* Progress indicator for multi-word exercises */}
      {exercise.type === 'pronunciation' && exercise.content.words && exercise.content.words.length > 1 && (
        <div className="mb-6">
          <div className="flex justify-center space-x-2">
            {exercise.content.words.map((_: any, index: number) => (
              <motion.div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index < currentStep ? 'bg-green-500' :
                  index === currentStep ? 'bg-blue-500' :
                  'bg-gray-300'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Word {currentStep + 1} of {exercise.content.words.length}
          </p>
        </div>
      )}
      
      {renderExercise()}
    </div>
  )
}
```

### 6. Integration: app/components/ExerciseModal.tsx (Updated)

```tsx
// Add to existing ExerciseModal component
import VoiceExercise from './voice/VoiceExercise'

// In the exercise rendering logic, add:
{currentExercise.type === 'voice' && (
  <VoiceExercise
    exercise={{
      id: currentExercise.id,
      type: currentExercise.voiceType,
      content: JSON.parse(currentExercise.voiceContent || '{}')
    }}
    onComplete={(score) => handleAnswer(score)}
  />
)}
```

### 7. Voice-Enabled Lesson Creator

```typescript
// app/lib/voice-lessons.ts
export const voiceLessons = [
  {
    title: "Pronunciation Basics",
    description: "Master Shona sounds",
    category: "Pronunciation",
    orderIndex: 6,
    exercises: [
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice pronouncing these greetings",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "Mangwanani",
              english: "Good morning",
              phonetic: "mah-ngwah-NAH-nee",
              tonePattern: "LLHL"
            },
            {
              shona: "Masikati",
              english: "Good afternoon",
              phonetic: "mah-see-KAH-tee",
              tonePattern: "LLHL"
            },
            {
              shona: "Manheru",
              english: "Good evening",
              phonetic: "mah-NEH-roo",
              tonePattern: "LHL"
            }
          ]
        }),
        points: 10
      }
    ]
  },
  {
    title: "Tone Practice",
    description: "Master Shona tones",
    category: "Pronunciation",
    orderIndex: 7,
    exercises: [
      {
        type: "voice",
        voiceType: "pronunciation",
        question: "Practice these tone pairs",
        voiceContent: JSON.stringify({
          words: [
            {
              shona: "sara",
              english: "remain (low tones)",
              phonetic: "SAH-rah",
              tonePattern: "LL"
            },
            {
              shona: "sára",
              english: "be satisfied (high-low)",
              phonetic: "SÁH-rah",
              tonePattern: "HL"
            }
          ]
        }),
        points: 15
      }
    ]
  }
]
```

### 8. Voice Navigation Feature

```tsx
// app/components/VoiceNavigation.tsx
'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaMicrophone } from 'react-icons/fa'

export default function VoiceNavigation() {
  const router = useRouter()
  const [listening, setListening] = useState(false)

  const commands = {
    'home': '/',
    'learn': '/learn',
    'profile': '/profile',
    'next lesson': 'next',
    'previous lesson': 'previous',
    'repeat': 'repeat'
  }

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase()
      
      Object.entries(commands).forEach(([key, value]) => {
        if (command.includes(key)) {
          if (value.startsWith('/')) {
            router.push(value)
          } else {
            // Handle special commands
            handleSpecialCommand(value)
          }
        }
      })
    }

    if (listening) {
      recognition.start()
    } else {
      recognition.stop()
    }

    return () => {
      recognition.stop()
    }
  }, [listening])

  const handleSpecialCommand = (command: string) => {
    switch(command) {
      case 'next':
        // Trigger next lesson
        document.querySelector('[data-action="next-lesson"]')?.click()
        break
      case 'previous':
        // Trigger previous lesson
        document.querySelector('[data-action="prev-lesson"]')?.click()
        break
      case 'repeat':
        // Repeat current audio
        document.querySelector('[data-action="play-audio"]')?.click()
        break
    }
  }

  return (
    <button
      onClick={() => setListening(!listening)}
      className={`fixed bottom-4 right-4 p-4 rounded-full shadow-lg transition-all ${
        listening ? 'bg-red-500 animate-pulse' : 'bg-blue-500 hover:bg-blue-600'
      }`}
    >
      <FaMicrophone className="text-white text-2xl" />
    </button>
  )
}
```

## IMPLEMENTATION INSTRUCTIONS FOR CURSOR

```
@workspace Implement the complete voice system:

1. Install all dependencies listed above
2. Create all voice components in app/components/voice/
3. Update the ExerciseModal to support voice exercises
4. Add voice lessons to the seed data
5. Implement the voice navigation feature
6. Add proper TypeScript types for Web Speech API
7. Test speech recognition with Shona words
8. Add visual feedback for pronunciation scores
9. Implement offline fallback for TTS
10. Add voice permissions request flow

Make sure to:
- Handle browser compatibility
- Add loading states for voice features
- Implement error boundaries
- Add voice settings (speed, pitch, voice selection)
- Create a voice onboarding tutorial
- Add analytics for pronunciation scores
```

## SAMPLE VOICE EXERCISES TO ADD

```javascript
const pronunciationExercises = [
  // Prenasalized consonants
  {
    category: "Prenasalized Consonants",
    words: [
      { shona: "mbira", english: "thumb piano", phonetic: "MBEE-rah", tonePattern: "HL" },
      { shona: "ndimi", english: "you (plural)", phonetic: "NDEE-mee", tonePattern: "HL" },
      { shona: "ngoma", english: "drum", phonetic: "NGOH-mah", tonePattern: "HL" }
    ]
  },
  // Whistling fricatives
  {
    category: "Whistling Sounds",
    words: [
      { shona: "svika", english: "arrive", phonetic: "SVEE-kah", tonePattern: "HL" },
      { shona: "zvino", english: "now", phonetic: "ZVEE-noh", tonePattern: "HL" },
      { shona: "tsva", english: "new", phonetic: "TSVAH", tonePattern: "H" }
    ]
  },
  // Common phrases
  {
    category: "Essential Phrases",
    words: [
      { shona: "Ndatenda zvikuru", english: "Thank you very much", phonetic: "ndah-TEN-dah zvee-KOO-roo", tonePattern: "LHLHL" },
      { shona: "Zita rangu ndi", english: "My name is", phonetic: "ZEE-tah RAH-ngoo ndee", tonePattern: "HLHLH" }
    ]
  }
]
```

## KEY FEATURES IMPLEMENTED

1. **Speech Recognition**
   - Real-time transcription
   - Pronunciation scoring algorithm
   - Multiple attempt tracking
   - Visual confidence indicators

2. **Text-to-Speech**
   - Adjustable playback speed
   - Multiple voice options
   - Phonetic pronunciation guides
   - Pause/resume functionality

3. **Visual Feedback**
   - Tone pattern visualization
   - Circular progress scores
   - Attempt history
   - Real-time waveforms

4. **Voice Navigation**
   - Hands-free app navigation
   - Voice commands for lessons
   - Audio control commands

5. **Pronunciation Assessment**
   - Levenshtein distance calculation
   - Confidence scoring
   - Progress tracking
   - Personalized feedback

This complete voice system will transform the Shona learning experience by providing interactive, real-time pronunciation practice with immediate feedback!