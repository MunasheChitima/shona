import { motion, AnimatePresence } from 'framer-motion'
import { FaStar, FaFire, FaRocket } from 'react-icons/fa'

interface CelebrationModalProps {
  isOpen: boolean
  score: number
  lessonTitle: string
  onClose: () => void
}

export default function CelebrationModal({ isOpen, score, lessonTitle, onClose }: CelebrationModalProps) {
  const getScoreMessage = (score: number) => {
    if (score >= 90) return { message: "Outstanding! You're a Shona master!", emoji: "🏆", color: "from-yellow-400 to-yellow-600" }
    if (score >= 80) return { message: "Excellent work! You're doing amazing!", emoji: "⭐", color: "from-blue-400 to-blue-600" }
    if (score >= 70) return { message: "Great job! Keep up the good work!", emoji: "🎉", color: "from-green-400 to-green-600" }
    if (score >= 60) return { message: "Good effort! You're making progress!", emoji: "👍", color: "from-purple-400 to-purple-600" }
    return { message: "Keep practicing! You'll get better!", emoji: "💪", color: "from-orange-400 to-orange-600" }
  }

  const scoreInfo = getScoreMessage(score)
  const stars = Math.floor(score / 20)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-md w-full p-8 shadow-2xl border border-white/20"
          >
            {/* Confetti effect */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-pink-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                initial={{ y: -100, opacity: 0, scale: 0 }}
                animate={{ 
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  rotate: [0, 360]
                }}
                transition={{ 
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              />
            ))}

            <div className="text-center relative z-10">
              {/* Trophy/Emoji */}
              <motion.div
                className="text-6xl mb-4"
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {scoreInfo.emoji}
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-2xl font-bold text-gray-800 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Lesson Complete!
              </motion.h2>

              {/* Lesson name */}
              <motion.p
                className="text-lg text-gray-600 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                {lessonTitle}
              </motion.p>

              {/* Score display */}
              <motion.div
                className={`bg-gradient-to-r ${scoreInfo.color} rounded-2xl p-6 text-white mb-6`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <div className="text-3xl font-bold mb-2">{score}%</div>
                <div className="text-lg opacity-90">{scoreInfo.message}</div>
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
                      className={`text-2xl ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* XP gained */}
              <motion.div
                className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 mb-6 border border-green-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FaFire className="text-orange-500" />
                  <span className="font-bold text-gray-700">+{score} XP gained!</span>
                </div>
              </motion.div>

              {/* Continue button */}
              <motion.button
                onClick={onClose}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-2xl shadow-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <FaRocket />
                  <span>Continue Learning</span>
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
