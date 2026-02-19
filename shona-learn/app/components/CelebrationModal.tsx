import { motion, AnimatePresence } from 'framer-motion'
import { FaTrophy, FaStar, FaFire, FaGem } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import Confetti from 'react-confetti'

interface CelebrationModalProps {
  isOpen: boolean
  score: number
  lessonTitle: string
  onClose: () => void
}

export default function CelebrationModal({ isOpen, score, lessonTitle, onClose }: CelebrationModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    }
  }, [isOpen])

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getScoreMessage = (score: number) => {
    if (score >= 90) return { message: "Outstanding! You're a Shona master!", emoji: "🏆", color: "from-yellow-400 to-yellow-600" }
    if (score >= 80) return { message: "Excellent work! You're doing amazing!", emoji: "⭐", color: "from-blue-400 to-blue-600" }
    if (score >= 70) return { message: "Great job! Keep up the good work!", emoji: "🎉", color: "from-green-400 to-green-600" }
    if (score >= 60) return { message: "Good effort! You're making progress!", emoji: "👍", color: "from-purple-400 to-purple-600" }
    return { message: "Keep practicing! You'll get better!", emoji: "💪", color: "from-orange-400 to-orange-600" }
  }

  const scoreInfo = getScoreMessage(score)
  const stars = Math.floor(score / 20)
  const xpEarned = score

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {showConfetti && score >= 70 && (
            <Confetti
              width={windowSize.width}
              height={windowSize.height}
              numberOfPieces={200}
              recycle={false}
              colors={['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6']}
            />
          )}
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header gradient */}
              <div className={`bg-gradient-to-r ${scoreInfo.color} p-8 text-white text-center relative overflow-hidden`}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-6xl mb-4"
                >
                  {scoreInfo.emoji}
                </motion.div>
                
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold mb-2"
                >
                  {scoreInfo.message}
                </motion.h2>
                
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/90"
                >
                  You completed: {lessonTitle}
                </motion.p>

                {/* Animated background elements */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"
                />
              </div>

              <div className="p-8">
                {/* Score display */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                  className="text-center mb-6"
                >
                  <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {score}%
                  </div>
                  <p className="text-gray-600 mt-1">Score</p>
                </motion.div>

                {/* Stars */}
                <motion.div
                  className="flex justify-center space-x-2 mb-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: 0.7 + i * 0.1,
                        type: "spring",
                        stiffness: 200
                      }}
                    >
                      <FaStar
                        className={`text-3xl ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
                      />
                    </motion.div>
                  ))}
                </motion.div>

                {/* Rewards */}
                <motion.div
                  className="space-y-3 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                          <FaFire className="text-white text-lg" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">XP Earned</p>
                          <p className="text-sm text-gray-600">Keep learning!</p>
                        </div>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, type: "spring", stiffness: 200 }}
                        className="text-2xl font-bold text-green-600"
                      >
                        +{xpEarned}
                      </motion.div>
                    </div>
                  </div>

                  {score >= 90 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200"
                    >
                      <div className="flex items-center space-x-3">
                        <FaGem className="text-purple-600 text-xl" />
                        <p className="text-sm">
                          <span className="font-semibold">Perfect Score Bonus!</span> +10 XP
                        </p>
                      </div>
                    </motion.div>
                  )}
                </motion.div>

                {/* Continue button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Continue Learning
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 