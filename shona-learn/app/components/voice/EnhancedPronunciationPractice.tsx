'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

import EnhancedSpeechRecognition from './EnhancedSpeechRecognition'
import TonePatternVisualizer from './TonePatternVisualizer'
import SpecialSoundsTracker from './SpecialSoundsTracker'
import AdaptiveDifficultySystem from './AdaptiveDifficultySystem'
import PronunciationDiagnostics from './PronunciationDiagnostics'
import TextToSpeech from './TextToSpeech'

interface Word {
  shona: string
  english: string
  ipa?: string
  tones?: string
  phonetic?: string
  culturalContext?: 'respectful' | 'casual' | 'ceremonial'
  specialSounds?: string[]
}

interface PronunciationResult {
  transcript: string
  overallScore: number
  breakdownScores: {
    pronunciation: number
    toneAccuracy: number
    specialSounds: number
    culturalAppropriateness: number
  }
  detectedTones?: string
  specialSoundsDetected: string[]
  feedback: string[]
  audioAnalysis?: any
}

interface UserProgress {
  currentLevel: number
  totalAttempts: number
  successfulAttempts: number
  weakSounds: string[]
  strongSounds: string[]
  averageScore: number
  recentScores: number[]
}

interface EnhancedPronunciationPracticeProps {
  word: Word
  userProgress: UserProgress
  onComplete: (result: PronunciationResult) => void
  onProgressUpdate: (progress: UserProgress) => void
}

export default function EnhancedPronunciationPractice({
  word,
  userProgress,
  onComplete,
  onProgressUpdate
}: EnhancedPronunciationPracticeProps) {
  const [currentResult, setCurrentResult] = useState<PronunciationResult | null>(null)
  const [attempts, setAttempts] = useState<PronunciationResult[]>([])
  const [showingDiagnostics, setShowingDiagnostics] = useState(false)
  const [realTimePitch, setRealTimePitch] = useState<number[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  // Generate pronunciation history from attempts for diagnostics
  const pronunciationHistory = attempts.map((attempt, index) => ({
    date: new Date(Date.now() - (attempts.length - index) * 60000).toISOString(),
    word: word.shona,
    overallScore: attempt.overallScore,
    toneAccuracy: attempt.breakdownScores.toneAccuracy,
    specialSounds: attempt.breakdownScores.specialSounds,
    culturalAppropriateness: attempt.breakdownScores.culturalAppropriateness,
    detectedIssues: attempt.feedback.filter(f => f.includes('Practice')).map(f => 
      f.split(' ').find(w => ['sv', 'zv', 'mb', 'nd', 'ng', 'pf', 'bv'].includes(w)) || 'pronunciation'
    )
  }))

  const handleSpeechResult = (result: PronunciationResult) => {
    setCurrentResult(result)
    setAttempts(prev => [...prev, result])
    setShowFeedback(true)
    setIsRecording(false)

    // Update user progress
    const newProgress: UserProgress = {
      ...userProgress,
      totalAttempts: userProgress.totalAttempts + 1,
      successfulAttempts: result.overallScore >= 80 ? userProgress.successfulAttempts + 1 : userProgress.successfulAttempts,
      recentScores: [...userProgress.recentScores, result.overallScore].slice(-10),
      averageScore: (userProgress.averageScore * userProgress.totalAttempts + result.overallScore) / (userProgress.totalAttempts + 1)
    }

    // Update weak/strong sounds based on result
    if (result.breakdownScores.specialSounds < 70) {
      const missedSounds = (word.specialSounds || []).filter(s => !result.specialSoundsDetected.includes(s))
      newProgress.weakSounds = [...new Set([...userProgress.weakSounds, ...missedSounds])]
    } else {
      newProgress.strongSounds = [...new Set([...userProgress.strongSounds, ...(word.specialSounds || [])])]
      newProgress.weakSounds = userProgress.weakSounds.filter(s => !(word.specialSounds || []).includes(s))
    }

    onProgressUpdate(newProgress)

    // Auto-hide feedback after 5 seconds
    setTimeout(() => setShowFeedback(false), 5000)

    // Complete if score is excellent
    if (result.overallScore >= 90) {
      setTimeout(() => onComplete(result), 2000)
    }
  }

  const handleLevelChange = (newLevel: number, reason: string) => {
    console.log(`Level changed to ${newLevel}: ${reason}`)
    // You could show a notification here
  }

  const handleExerciseRecommendation = (exercises: any[]) => {
    console.log('Recommended exercises:', exercises)
    // You could update the practice queue here
  }

  const handleRecommendedPractice = (sound: string) => {
    console.log(`Starting practice for sound: ${sound}`)
    // You could navigate to specific sound practice here
  }

  const handlePracticeSound = (sound: string) => {
    console.log(`Practicing sound: ${sound}`)
    // Could trigger audio examples or targeted exercises
  }

  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#10b981' // green
    if (score >= 80) return '#3b82f6' // blue  
    if (score >= 70) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const getScoreFeedback = (score: number): string => {
    if (score >= 95) return 'Outstanding! 🌟'
    if (score >= 90) return 'Excellent! 🎉'
    if (score >= 80) return 'Great job! 👏'
    if (score >= 70) return 'Good effort! 👍'
    if (score >= 60) return 'Getting there! 💪'
    return 'Keep practicing! 🎯'
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Main Practice Card */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold mb-2">{word.shona}</h2>
          <p className="text-xl text-gray-600 mb-2">{word.english}</p>
          {word.phonetic && (
            <p className="text-lg text-gray-500 italic">/{word.phonetic}/</p>
          )}
          {word.culturalContext && word.culturalContext !== 'casual' && (
            <div className="mt-2 inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              {word.culturalContext} context
            </div>
          )}
        </div>

        {/* Audio playback section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-center">Listen and Learn</h3>
          <TextToSpeech 
            text={word.shona}
            phonetic={word.phonetic || ''}
            rate={0.8}
          />
        </div>

        {/* Enhanced Speech Recognition */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 text-center">Your Turn!</h3>
          <EnhancedSpeechRecognition
            targetPhrase={word.shona}
            targetIPA={word.ipa}
            tonePattern={word.tones}
            culturalContext={word.culturalContext}
            onResult={handleSpeechResult}
          />
        </div>

        {/* Results Display */}
        <AnimatePresence>
          {showFeedback && currentResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Overall Score */}
                <div className="text-center">
                  <h4 className="text-lg font-semibold mb-4">Overall Score</h4>
                  <div className="w-32 h-32 mx-auto">
                    <CircularProgressbar
                      value={currentResult.overallScore}
                      text={`${currentResult.overallScore}%`}
                      styles={buildStyles({
                        pathColor: getScoreColor(currentResult.overallScore),
                        textColor: getScoreColor(currentResult.overallScore),
                        trailColor: '#e5e7eb'
                      })}
                    />
                  </div>
                  <p className="text-xl font-bold mt-4" style={{ color: getScoreColor(currentResult.overallScore) }}>
                    {getScoreFeedback(currentResult.overallScore)}
                  </p>
                  <p className="text-gray-600 mt-2">
                    You said: "{currentResult.transcript}"
                  </p>
                </div>

                {/* Breakdown Scores */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Detailed Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries(currentResult.breakdownScores).map(([category, score]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">
                          {category.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ 
                                width: `${score}%`,
                                backgroundColor: getScoreColor(score)
                              }}
                            />
                          </div>
                          <span className="text-sm font-bold w-8">{score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback Messages */}
              {currentResult.feedback.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-semibold text-blue-900 mb-2">Feedback:</h5>
                  <ul className="space-y-1">
                    {currentResult.feedback.map((feedback, index) => (
                      <li key={index} className="text-sm text-blue-800">• {feedback}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Secondary Components Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tone Pattern Visualizer */}
        {word.tones && (
          <TonePatternVisualizer
            expectedPattern={word.tones}
            detectedPattern={currentResult?.detectedTones}
            word={word.shona}
            isRecording={isRecording}
            realTimePitch={realTimePitch}
            onPatternMatch={(accuracy) => console.log(`Tone accuracy: ${accuracy}%`)}
          />
        )}

        {/* Special Sounds Tracker */}
        {word.specialSounds && word.specialSounds.length > 0 && (
          <SpecialSoundsTracker
            detectedSounds={currentResult?.specialSoundsDetected || []}
            targetSounds={word.specialSounds}
            word={word.shona}
            onPracticeSound={handlePracticeSound}
          />
        )}
      </div>

      {/* Bottom Section - Adaptive System and Diagnostics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Adaptive Difficulty System */}
        <AdaptiveDifficultySystem
          userProgress={userProgress}
          onLevelChange={handleLevelChange}
          onExerciseRecommendation={handleExerciseRecommendation}
        />

        {/* Pronunciation Diagnostics Toggle */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Progress Insights</h3>
            <button
              onClick={() => setShowingDiagnostics(!showingDiagnostics)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {showingDiagnostics ? 'Hide Details' : 'View Diagnostics'}
            </button>
          </div>
          
          {attempts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Start practicing to see your progress insights!</p>
              <p className="text-sm mt-1">Try pronouncing the word above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{attempts.length}</div>
                <div className="text-sm text-blue-700">Attempts</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(attempts.reduce((sum, a) => sum + a.overallScore, 0) / attempts.length)}%
                </div>
                <div className="text-sm text-green-700">Average</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Diagnostics Panel */}
      <AnimatePresence>
        {showingDiagnostics && pronunciationHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PronunciationDiagnostics
              userId="user1" // In real app, this would come from auth
              history={pronunciationHistory}
              onRecommendedPractice={handleRecommendedPractice}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attempts History */}
      {attempts.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">Practice History</h3>
          <div className="space-y-3">
            {attempts.slice(-5).reverse().map((attempt, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div>
                  <span className="font-medium">"{attempt.transcript}"</span>
                  <div className="text-sm text-gray-500 mt-1">
                    Pronunciation: {attempt.breakdownScores.pronunciation}% | 
                    Tones: {attempt.breakdownScores.toneAccuracy}% | 
                    Special Sounds: {attempt.breakdownScores.specialSounds}%
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xl font-bold`} style={{ color: getScoreColor(attempt.overallScore) }}>
                    {attempt.overallScore}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Attempt {attempts.length - index}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h4 className="font-bold text-gray-800 mb-3">🎯 Pronunciation Tips for "{word.shona}":</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-semibold text-blue-900 mb-2">🔊 Audio Focus:</h5>
            <ul className="space-y-1 text-blue-800">
              <li>• Listen to the audio example multiple times</li>
              <li>• Pay attention to tone patterns {word.tones && `(${word.tones})`}</li>
              <li>• Notice the rhythm and stress patterns</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-purple-900 mb-2">🎵 Practice Strategy:</h5>
            <ul className="space-y-1 text-purple-800">
              <li>• Start slowly, then increase speed</li>
              <li>• Break the word into syllables</li>
              <li>• Practice special sounds individually</li>
              {word.culturalContext !== 'casual' && (
                <li>• Remember the {word.culturalContext} context</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}