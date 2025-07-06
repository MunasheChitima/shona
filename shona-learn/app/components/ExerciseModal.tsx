'use client'
import { useState, useEffect } from 'react'
import { FaTimes, FaVolumeUp, FaHeart, FaStar, FaTrophy, FaArrowRight, FaGlobeAfrica } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceExercise from './voice/VoiceExercise'
import PronunciationText from './shared/PronunciationText'
import CulturalContext from './shared/CulturalContext'
import { exerciseGeneratorService, type Exercise } from '@/lib/services/ExerciseGeneratorService'
import { audioService } from '@/lib/services/AudioService'

interface ExerciseModalProps {
  lesson: any
  onClose: () => void
  onComplete: (score: number) => void
}

export default function ExerciseModal({ lesson, onClose, onComplete }: ExerciseModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [hearts, setHearts] = useState(3)
  const [showCulturalContext, setShowCulturalContext] = useState(false)

  useEffect(() => {
    generateExercises()
  }, [lesson])

  const generateExercises = () => {
    try {
      const generatedExercises = exerciseGeneratorService.generateExercisesForLesson(lesson)
      setExercises(generatedExercises)
    } catch (error) {
      console.warn('Failed to generate exercises, using fallback:', error)
      // Fallback to API or manual exercises
      fetchExercises()
    }
  }

  const fetchExercises = async () => {
    try {
      const res = await fetch(`/api/exercises/${lesson.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setExercises(data)
      }
    } catch (error) {
      console.warn('Failed to fetch exercises:', error)
      setExercises([])
    }
  }

  const playAudio = async (audioFile?: string, fallbackText?: string) => {
    try {
      if (audioFile) {
        await audioService.playWord(audioFile, fallbackText)
      } else if (fallbackText) {
        await audioService.playPhrase(fallbackText, { rate: 0.8 })
      }
    } catch (error) {
      console.warn('Audio playback failed:', error)
    }
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

  if (exercises.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-3xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Generating exercises...</p>
        </div>
      </div>
    )
  }
  
  const currentExercise = exercises[currentIndex]
  const progress = ((currentIndex + 1) / exercises.length) * 100

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" data-testid="exercise-modal">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
        data-testid="exercise-content"
      >
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <motion.button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FaTimes className="text-gray-600" />
              </motion.button>
              
              <h1 className="text-2xl font-bold text-gray-800">{lesson.title}</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Hearts */}
              <div className="flex items-center space-x-1">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: hearts > i ? 1 : 0.5,
                      opacity: hearts > i ? 1 : 0.3 
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaHeart 
                      className={`text-xl ${hearts > i ? 'text-red-500' : 'text-gray-300'}`}
                    />
                  </motion.div>
                ))}
              </div>
              
              {/* Score */}
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-full px-4 py-2">
                <div className="flex items-center space-x-2">
                  <FaStar className="text-yellow-500" />
                  <span className="font-bold text-gray-700">{score} pts</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Progress</span>
              <span className="text-sm font-medium text-gray-600">
                {currentIndex + 1} of {exercises.length}
              </span>
            </div>
            <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
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
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
              <h2 className="text-2xl font-bold mb-4 text-gray-800">{currentExercise.question}</h2>
              
              {/* Audio and Pronunciation Section */}
              {(currentExercise.audioFile || currentExercise.audioText) && (
                <div className="mb-6">
                  {currentExercise.type === 'pronunciation' ? (
                    <PronunciationText
                      word={currentExercise.audioText || currentExercise.correctAnswer}
                      pronunciation={currentExercise.pronunciation || ''}
                      phonetic={currentExercise.phonetic}
                      audioFile={currentExercise.audioFile}
                      size="large"
                      showDetails={true}
                    />
                  ) : (
                    <div className="flex items-center space-x-4">
                      <motion.button
                        onClick={() => playAudio(currentExercise.audioFile, currentExercise.audioText)}
                        className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl shadow-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaVolumeUp />
                        <span>Listen</span>
                      </motion.button>
                      
                      {currentExercise.pronunciation && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                          <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
                            Pronunciation
                          </div>
                          <div className="text-blue-800 font-medium">
                            {currentExercise.pronunciation}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Cultural Context Hint */}
              {currentExercise.type === 'cultural_context' && currentExercise.culturalExplanation && (
                <div className="mb-4">
                  <button
                    onClick={() => setShowCulturalContext(!showCulturalContext)}
                    className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 transition-colors"
                  >
                    <FaGlobeAfrica />
                    <span className="text-sm font-medium">
                      {showCulturalContext ? 'Hide' : 'Show'} Cultural Context
                    </span>
                  </button>
                  
                  <AnimatePresence>
                    {showCulturalContext && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3"
                      >
                        <CulturalContext
                          culturalNotes={[currentExercise.culturalExplanation]}
                          variant="compact"
                          expanded={true}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Hint */}
              {currentExercise.hint && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-600">💡</span>
                    <span className="text-sm font-medium text-yellow-800">Hint</span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">{currentExercise.hint}</p>
                </div>
              )}
            </div>
          </motion.div>
          
                     {/* Exercise Content */}
           {currentExercise.type === 'pronunciation' ? (
             <VoiceExercise
               exercise={{
                 id: currentExercise.id,
                 type: 'pronunciation',
                 content: {
                   words: [{
                     shona: currentExercise.correctAnswer,
                     english: currentExercise.audioText || 'Practice this word',
                     phonetic: currentExercise.phonetic || '',
                     tonePattern: currentExercise.pronunciation || ''
                   }]
                 }
               }}
               onComplete={(score) => handleAnswer(score)}
             />
           ) : (
            /* Answer Options */
            <div className="grid gap-4 mb-8">
              {currentExercise.options?.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => !showFeedback && handleAnswer(option)}
                  disabled={showFeedback}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  data-testid="answer-option"
                  className={`
                    relative p-4 text-left rounded-xl border-2 transition-all duration-300
                    ${showFeedback 
                      ? option === currentExercise.correctAnswer
                        ? 'bg-green-100 border-green-500 text-green-800'
                        : option === selectedAnswer && !isCorrect
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                      : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-800'
                    }
                  `}
                >
                  <span className="text-lg font-medium">{option}</span>
                  
                  {/* Answer indicators */}
                  <div className="absolute top-4 right-4">
                    {showFeedback && option === currentExercise.correctAnswer && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-green-500"
                      >
                        ✅
                      </motion.div>
                    )}
                    {showFeedback && option === selectedAnswer && !isCorrect && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="text-red-500"
                      >
                        ❌
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
          
          {/* Feedback */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className={`mt-6 p-6 rounded-2xl ${isCorrect ? 'bg-gradient-to-r from-green-100 to-green-200 border border-green-300' : 'bg-gradient-to-r from-red-100 to-red-200 border border-red-300'}`}
                data-testid={isCorrect ? "success-message" : "error-message"}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-3xl ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? '🎉' : '💪'}
                  </div>
                  <div>
                    <p className={`font-bold text-lg ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {isCorrect ? 'Excellent! You got it right!' : 'Keep trying! You\'re learning!'}
                    </p>
                    {!isCorrect && (
                      <p className="text-red-600 mt-1">
                        Correct answer: <span className="font-bold">{currentExercise.correctAnswer}</span>
                      </p>
                    )}
                    
                    {/* Cultural explanation for cultural context exercises */}
                    {currentExercise.type === 'cultural_context' && currentExercise.culturalExplanation && isCorrect && (
                      <div className="mt-3 p-3 bg-white bg-opacity-60 rounded-lg">
                        <p className="text-sm text-green-700">{currentExercise.culturalExplanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
} 