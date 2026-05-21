'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { FaTimes, FaTrophy } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import ErrorBoundary from './ErrorBoundary'
import { apiAuthHeaders } from '@/lib/api-auth-headers'

interface ExerciseModalProps {
  lesson: any
  onClose: () => void
  onComplete: (score: number) => void
}

function progressKey(lessonId: string) {
  return `lesson_${lessonId}_progress`
}

function clearLessonProgress(lessonId: string) {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(progressKey(lessonId))
  } catch {
    /* ignore */
  }
}

function readSavedIndex(lessonId: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(progressKey(lessonId))
    if (!raw) return 0
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n > 0 ? n : 0
  } catch {
    return 0
  }
}

function writeSavedIndex(lessonId: string, index: number) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(progressKey(lessonId), String(index))
  } catch {
    /* ignore */
  }
}

export default function ExerciseModal({ lesson, onClose, onComplete }: ExerciseModalProps) {
  const [exercises, setExercises] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const indexHydratedRef = useRef(false)

  // Confirm-before-close: only ask if there's session progress.
  const requestClose = useCallback(() => {
    if (currentIndex > 0 && !showResults) {
      const ok = typeof window === 'undefined'
        ? true
        : window.confirm('Leave this lesson? Your spot will be saved so you can resume later.')
      if (!ok) return
    }
    onClose()
  }, [currentIndex, showResults, onClose])

  // ESC closes (with confirm)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') requestClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [requestClose])

  useEffect(() => {
    const fetchExercises = async () => {
      if (typeof window === 'undefined') return
      const res = await fetch(`/api/exercises/${lesson.id}`, {
        headers: { ...apiAuthHeaders() },
      })
      if (res.ok) {
        const data = await res.json()
        const renderable = data.filter((ex: any) =>
          ex.type === 'multiple_choice' ||
          ex.type === 'translation' ||
          ex.type === 'fill_blank'
        )
        setExercises(renderable)
      }
    }
    fetchExercises()
  }, [lesson.id])

  // Restore saved index once exercises are loaded.
  useEffect(() => {
    if (indexHydratedRef.current) return
    if (exercises.length === 0) return
    const saved = readSavedIndex(lesson.id)
    if (saved > 0 && saved < exercises.length) {
      setCurrentIndex(saved)
    }
    indexHydratedRef.current = true
  }, [exercises.length, lesson.id])

  const finish = (finalScore: number) => {
    setShowResults(true)
    clearLessonProgress(lesson.id)
    onComplete(finalScore)
  }

  const advance = (nextIndex: number) => {
    setCurrentIndex(nextIndex)
    setSelectedAnswer('')
    setShowFeedback(false)
    writeSavedIndex(lesson.id, nextIndex)
  }

  const handleAnswer = (answer: string | number) => {
    if (typeof answer === 'number') {
      const newScore = score + answer
      setScore(newScore)
      setIsCorrect(answer >= 80)
      setShowFeedback(true)
      setTimeout(() => {
        if (currentIndex < exercises.length - 1) {
          advance(currentIndex + 1)
        } else {
          finish(newScore)
        }
      }, 1500)
      return
    }

    setSelectedAnswer(answer)
    const correct = answer === currentExercise.correctAnswer
    setIsCorrect(correct)
    setShowFeedback(true)
    const newScore = correct ? score + (currentExercise.points || 0) : score
    if (correct) setScore(newScore)

    setTimeout(() => {
      if (currentIndex < exercises.length - 1) {
        advance(currentIndex + 1)
      } else {
        finish(newScore)
      }
    }, 1500)
  }

  if (exercises.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm shadow-2xl">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-700 font-medium mb-4">Loading exercises…</p>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  const currentExercise = exercises[currentIndex]

  let options: string[] = []
  try {
    const optionsData = currentExercise.options || '[]'
    if (typeof optionsData === 'string') {
      if (optionsData.startsWith('[') || optionsData.startsWith('{')) {
        options = JSON.parse(optionsData)
      } else {
        options = optionsData.includes(',')
          ? optionsData.split(',').map((o: string) => o.trim())
          : [optionsData]
      }
    } else if (Array.isArray(optionsData)) {
      options = optionsData
    } else {
      options = []
    }
  } catch (error) {
    console.warn('Error parsing exercise options:', error)
    const fallbackOptions = currentExercise.options || ''
    options = fallbackOptions.includes(',')
      ? fallbackOptions.split(',').map((o: string) => o.trim())
      : [fallbackOptions]
  }

  const progress = ((currentIndex + 1) / exercises.length) * 100

  return (
    <ErrorBoundary>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 modal-backdrop"
        data-testid="exercise-modal"
        onClick={(e) => {
          if ((e.target as HTMLElement).classList.contains('modal-backdrop')) {
            requestClose()
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
          data-testid="exercise-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <motion.button
                type="button"
                onClick={requestClose}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                data-testid="close-modal"
                aria-label="Close lesson"
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
              transition={{ duration: 0.4 }}
            >
              <div className="bg-gradient-to-r from-accent-green-50 to-accent-blue-50 rounded-2xl p-6 border border-accent-green-100">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">{currentExercise.question}</h2>

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

                {currentExercise.shonaPhrase && (
                  <div className="bg-white rounded-xl p-4 mb-4 border border-blue-200">
                    <p className="text-sm text-gray-500 mb-1">Shona</p>
                    <p className="text-xl font-bold text-gray-800">{currentExercise.shonaPhrase}</p>
                    {currentExercise.pronunciation && (
                      <p className="text-sm text-gray-500 mt-1">[{currentExercise.pronunciation}]</p>
                    )}
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
              {currentExercise.type === 'translation' ? (
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
              ) : options.length === 0 ? (
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
                  data-testid={isCorrect ? 'success-message' : 'error-message'}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`text-3xl ${isCorrect ? 'text-green-600' : 'text-red-600'} mt-1`}>
                      {isCorrect ? '🎉' : '💪'}
                    </div>
                    <div className="flex-1">
                      <p className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {isCorrect ? 'Excellent! You got it right!' : "Keep trying! You're learning!"}
                      </p>

                      {currentExercise.explanation && (
                        <div className="mt-3 p-4 bg-white/80 rounded-xl border border-gray-200">
                          <p className={`text-sm ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                            {isCorrect ? currentExercise.explanation.correct : currentExercise.explanation.incorrect}
                          </p>
                        </div>
                      )}

                      {currentExercise.culturalNote && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <h4 className="text-sm font-semibold text-blue-700 mb-1">🌍 Cultural Insight</h4>
                          <p className="text-sm text-blue-600">{currentExercise.culturalNote}</p>
                        </div>
                      )}

                      {!isCorrect && currentExercise.retryHint && (
                        <div className="mt-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                          <h4 className="text-sm font-semibold text-yellow-700 mb-1">💡 Learning Tip</h4>
                          <p className="text-sm text-yellow-600">{currentExercise.retryHint}</p>
                        </div>
                      )}

                      {!isCorrect && currentExercise.correctAnswer && (
                        <p className="text-red-600 mt-2">
                          Correct answer: <span className="font-bold">{currentExercise.correctAnswer}</span>
                        </p>
                      )}

                      {currentIndex === exercises.length - 1 && lesson?.category ? (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <Link
                            href={`/flashcards?category=${encodeURIComponent(lesson.category)}`}
                            className="inline-flex items-center gap-2 font-semibold text-green-700 hover:text-green-800 underline underline-offset-2"
                          >
                            Practice these words with flashcards →
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Press ESC or tap outside to leave (your spot is saved)</p>
            </div>
          </div>
        </motion.div>
      </div>
    </ErrorBoundary>
  )
}
