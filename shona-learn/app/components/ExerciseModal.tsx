'use client'
import { useState, useEffect, useCallback } from 'react'
import { FaTimes, FaHeart, FaStar, FaTrophy, FaArrowRight } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceExercise from './voice/VoiceExercise'
import PronunciationText from './shared/PronunciationText'
import ErrorBoundary from './ErrorBoundary'
import { AUDIO_ENABLED } from '@/lib/featureFlags'

interface ExerciseModalProps {
  lesson: any
  onClose: () => void
  onComplete: (score: number) => void
}

export default function ExerciseModal({ lesson, onClose, onComplete }: ExerciseModalProps) {
  const [exercises, setExercises] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [hearts, setHearts] = useState(5)

  // Handle ESC key to close modal
  const handleEscKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }, [onClose])

  // Handle click outside to close modal
  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (target.classList.contains('modal-backdrop')) {
      onClose()
    }
  }, [onClose])

  useEffect(() => {
    fetchExercises()
    
    // Add event listeners for ESC key and click outside
    document.addEventListener('keydown', handleEscKey)
    document.addEventListener('click', handleClickOutside)
    
    // Cleanup event listeners on unmount
    return () => {
      document.removeEventListener('keydown', handleEscKey)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [handleEscKey, handleClickOutside])

  const fetchExercises = async () => {
    if (typeof window === 'undefined') return
    const res = await fetch(`/api/exercises/${lesson.id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (res.ok) {
      const data = await res.json()
      setExercises(data)
    }
  }

  const playAudio = (_text: string) => {
    // Audio disabled via feature flag
    if (!AUDIO_ENABLED) return
  }

  const handleAnswer = (answer: string | number) => {
    if (typeof answer === 'number') {
      // Voice exercise result
      setScore(score + answer)
      setIsCorrect(answer >= 80)
      setShowFeedback(true)
      
      setTimeout(() => {
        if (currentIndex < exercises.length - 1) {
          setCurrentIndex(currentIndex + 1)
          setSelectedAnswer('')
          setShowFeedback(false)
        } else {
          onComplete(score + answer)
        }
      }, 2000)
    } else {
      // Regular exercise result
      setSelectedAnswer(answer)
      const correct = answer === currentExercise.correctAnswer
      setIsCorrect(correct)
      setShowFeedback(true)
      
      if (correct) {
        setScore(score + currentExercise.points)
      } else {
        setHearts(hearts - 1)
      }
      
      setTimeout(() => {
        if (currentIndex < exercises.length - 1) {
          setCurrentIndex(currentIndex + 1)
          setSelectedAnswer('')
          setShowFeedback(false)
        } else {
          onComplete(score + (correct ? currentExercise.points : 0))
        }
      }, 2000)
    }
  }

  if (exercises.length === 0) return null
  
  const currentExercise = exercises[currentIndex]
  
  // Safely parse options with error handling
  let options: string[] = []
  try {
    const optionsData = currentExercise.options || '[]'
    if (typeof optionsData === 'string') {
      // Check if it's already a JSON string
      if (optionsData.startsWith('[') || optionsData.startsWith('{')) {
        options = JSON.parse(optionsData)
      } else {
        // If it's a simple string, split by commas or treat as single option
        options = optionsData.includes(',') ? optionsData.split(',').map((o: string) => o.trim()) : [optionsData]
      }
    } else if (Array.isArray(optionsData)) {
      options = optionsData
    } else {
      options = []
    }
  } catch (error) {
    console.warn('Error parsing exercise options:', error)
    // Fallback: treat as comma-separated string or single option
    const fallbackOptions = currentExercise.options || ''
    options = fallbackOptions.includes(',') ? fallbackOptions.split(',').map((o: string) => o.trim()) : [fallbackOptions]
  }
  
  const progress = ((currentIndex + 1) / exercises.length) * 100

  return (
    <ErrorBoundary>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-backdrop" 
        data-testid="exercise-modal"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
          data-testid="exercise-content"
          onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to backdrop
        >
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <motion.button 
                onClick={onClose} 
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors" 
                data-testid="close-modal"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes className="text-2xl" />
              </motion.button>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FaTrophy className="text-yellow-500 text-xl" />
                  <span className="text-xl font-bold text-gray-800">{score}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <FaHeart
                      key={i}
                      className={`text-xl ${
                        i < hearts ? 'text-red-500' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Question {currentIndex + 1} of {exercises.length}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            
            {/* Question Section */}
            <motion.div 
              className="mb-8"
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-accent-green-50 to-accent-blue-50 rounded-2xl p-6 border border-accent-green-100">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">{currentExercise.question}</h2>
                
                {/* Educational Content */}
                {currentExercise.grammarNotes && (
                  <div className="bg-white rounded-xl p-4 mb-4 border border-accent-gold-200">
                    <h3 className="text-lg font-semibold text-accent-gold-700 mb-2 flex items-center">
                      📚 Grammar Notes
                    </h3>
                    <p className="text-gray-700">{currentExercise.grammarNotes}</p>
                  </div>
                )}
                
                {currentExercise.culturalContext && (
                  <div className="bg-white rounded-xl p-4 mb-4 border border-accent-green-200">
                    <h3 className="text-lg font-semibold text-accent-green-700 mb-2 flex items-center">
                      🌍 Cultural Context
                    </h3>
                    <p className="text-gray-700">{currentExercise.culturalContext}</p>
                  </div>
                )}
                
                {AUDIO_ENABLED && currentExercise.audioText && null}
                
                {currentExercise.shonaPhrase && (
                  <div className="bg-white rounded-xl p-4 mb-4 border border-blue-200">
                    <p className="text-sm text-gray-500 mb-1">Shona</p>
                    <PronunciationText
                      word={currentExercise.shonaPhrase}
                      pronunciation={currentExercise.pronunciation || currentExercise.shonaPhrase.replace(/[aeiou]/g, (match: string) => match + '-')}
                      phonetic={currentExercise.phonetic}
                      size="medium"
                      showDetails={false}
                      className="mb-2"
                    />
                  </div>
                )}
                
                {currentExercise.englishPhrase && currentExercise.type !== 'translation' && (
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-gray-500 mb-1">English</p>
                    <p className="text-xl font-bold text-gray-800">{currentExercise.englishPhrase}</p>
                  </div>
                )}
              </div>
            </motion.div>
            
            {/* Answer Options */}
            <div className="space-y-4">
              {AUDIO_ENABLED && currentExercise.type === 'voice' ? (
                <VoiceExercise
                  exercise={{
                    id: currentExercise.id,
                    type: currentExercise.voiceType || 'pronunciation',
                    content: (() => {
                      try {
                        return JSON.parse(currentExercise.voiceContent || '{}')
                      } catch (error) {
                        console.warn('Error parsing voice content:', error)
                        return {}
                      }
                    })()
                  }}
                  onComplete={(score) => handleAnswer(score)}
                />
              ) : currentExercise.type === 'translation' ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full p-4 border-2 border-gray-200 rounded-xl text-lg focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all"
                    placeholder="Type your answer here..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        handleAnswer(e.currentTarget.value)
                      }
                    }}
                    disabled={showFeedback}
                  />
                  <motion.button
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const input = document.querySelector('input') as HTMLInputElement
                      if (input?.value) {
                        handleAnswer(input.value)
                      }
                    }}
                    disabled={showFeedback}
                  >
                    Submit Answer
                  </motion.button>
                </div>
              ) : (
                // Show message if no options available
                options.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No answer options available for this exercise.</p>
                    <motion.button
                      onClick={() => handleAnswer('skip')}
                      className="px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Skip This Question
                    </motion.button>
                  </div>
                ) : (
                  options.map((option: string, index: number) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(option)}
                      disabled={showFeedback}
                      data-testid="answer-option"
                      className={`
                        w-full p-6 rounded-xl text-left text-lg font-medium transition-all shadow-soft
                        ${showFeedback && option === currentExercise.correctAnswer
                          ? 'bg-gradient-to-r from-green-100 to-green-200 border-2 border-green-500 text-green-700 shadow-medium'
                          : showFeedback && option === selectedAnswer && !isCorrect
                          ? 'bg-gradient-to-r from-red-100 to-red-200 border-2 border-red-500 text-red-700 shadow-medium'
                          : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-medium'
                        }
                      `}
                    >
                      {option}
                    </motion.button>
                  ))
                )
              )}
            </div>
            
            {/* Feedback Section */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  className={`mt-6 p-6 rounded-2xl ${isCorrect ? 'bg-gradient-to-r from-green-100 to-green-200 border border-green-300' : 'bg-gradient-to-r from-red-100 to-red-200 border border-red-300'}`}
                  data-testid={isCorrect ? "success-message" : "error-message"}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-3xl ${isCorrect ? 'text-green-600' : 'text-red-600'} mt-1`}>
                      {isCorrect ? '🎉' : '💪'}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {isCorrect ? 'Excellent! You got it right!' : 'Keep trying! You\'re learning!'}
                      </p>
                      
                      {/* Enhanced Explanation */}
                      {currentExercise.explanation && (
                        <div className="mt-3 p-4 bg-white/80 rounded-xl border border-gray-200">
                          <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {isCorrect ? currentExercise.explanation.correct : currentExercise.explanation.incorrect}
                          </p>
                        </div>
                      )}
                      
                      {/* Cultural Context */}
                      {currentExercise.culturalNote && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <h4 className="text-sm font-semibold text-blue-700 mb-1">🌍 Cultural Insight</h4>
                          <p className="text-sm text-blue-600">{currentExercise.culturalNote}</p>
                        </div>
                      )}
                      
                      {/* Retry Hint */}
                      {!isCorrect && currentExercise.retryHint && (
                        <div className="mt-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                          <h4 className="text-sm font-semibold text-yellow-700 mb-1">💡 Learning Tip</h4>
                          <p className="text-sm text-yellow-600">{currentExercise.retryHint}</p>
                        </div>
                      )}
                      
                      {!isCorrect && (
                        <p className="text-red-600 mt-2">
                          Correct answer: <span className="font-bold">{currentExercise.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Help Text */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Press ESC to close or click outside the modal</p>
            </div>
          </div>
        </motion.div>
      </div>
    </ErrorBoundary>
  )
} 