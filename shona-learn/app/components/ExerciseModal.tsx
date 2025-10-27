'use client'
import { useState, useEffect } from 'react'
import { FaTimes, FaVolumeUp, FaHeart, FaStar, FaTrophy, FaArrowRight } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceExercise from './voice/VoiceExercise'

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

  useEffect(() => {
    fetchExercises()
  }, [])

  const fetchExercises = async () => {
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

  const playAudio = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.8
    speechSynthesis.speak(utterance)
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
  const options = JSON.parse(currentExercise.options || '[]')
  const progress = ((currentIndex + 1) / exercises.length) * 100

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" data-testid="exercise-modal">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20"
        data-testid="exercise-content"
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
              {/* Hearts */}
              <div className="flex items-center space-x-1 bg-red-50 rounded-full px-3 py-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <FaHeart
                      className={`text-xl ${i < hearts ? 'text-red-500' : 'text-gray-300'}`}
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
              
              {currentExercise.audioText && (
                <motion.button
                  onClick={() => playAudio(currentExercise.shonaPhrase || currentExercise.audioText)}
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-6 py-3 rounded-xl mb-4 shadow-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <FaVolumeUp className="text-xl" />
                  <span className="font-semibold">🔊 Listen to Pronunciation</span>
                </motion.button>
              )}
              
              {currentExercise.shonaPhrase && (
                <div className="bg-white rounded-xl p-4 mb-4 border border-blue-200">
                  <p className="text-sm text-gray-500 mb-1">Shona</p>
                  <p className="text-xl font-bold text-gray-800 mb-2">{currentExercise.shonaPhrase}</p>
                  {currentExercise.audioText && currentExercise.audioText !== 'null' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Pronunciation</p>
                        <p className="text-lg font-mono text-blue-600">{currentExercise.audioText}</p>
                      </div>
                      <button
                        onClick={() => playAudio(currentExercise.shonaPhrase)}
                        className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors"
                        title="Listen to pronunciation"
                      >
                        <FaVolumeUp className="text-sm" />
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {currentExercise.englishPhrase && currentExercise.type !== 'translation' && (
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-500 mb-1">English</p>
                  <p className="text-xl font-bold text-gray-800">{currentExercise.englishPhrase}</p>
                  {currentExercise.shonaPhrase && currentExercise.audioText && currentExercise.audioText !== 'null' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Shona Pronunciation</p>
                      <p className="text-lg font-mono text-blue-600">{currentExercise.audioText}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
          
          {/* Answer Options */}
          <div className="space-y-4">
            {currentExercise.type === 'voice' ? (
              <VoiceExercise
                exercise={{
                  id: currentExercise.id,
                  type: currentExercise.voiceType || 'pronunciation',
                  content: JSON.parse(currentExercise.voiceContent || '{}')
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
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
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
              ))
            )}
          </div>
          
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