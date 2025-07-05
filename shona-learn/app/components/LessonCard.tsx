'use client'
import { FaLock, FaCheck, FaStar, FaPlay } from 'react-icons/fa'
import { motion } from 'framer-motion'

interface LessonCardProps {
  lesson: any
  progress: any
  onClick: () => void
  locked: boolean
}

export default function LessonCard({ lesson, progress, onClick, locked }: LessonCardProps) {
  const isCompleted = progress?.completed
  const score = progress?.score || 0
  
  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'Basics': return '👋'
      case 'Numbers': return '🔢'
      case 'Family': return '👨‍👩‍👧‍👦'
      case 'Verbs': return '🏃'
      case 'Colors': return '🎨'
      case 'Animals': return '🐾'
      case 'Food': return '🍽️'
      case 'Weather': return '🌤️'
      case 'Time': return '⏰'
      case 'Travel': return '✈️'
      default: return '📚'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Basics': return 'from-green-400 to-green-600'
      case 'Numbers': return 'from-blue-400 to-blue-600'
      case 'Family': return 'from-purple-400 to-purple-600'
      case 'Verbs': return 'from-orange-400 to-orange-600'
      case 'Colors': return 'from-pink-400 to-pink-600'
      case 'Animals': return 'from-yellow-400 to-yellow-600'
      case 'Food': return 'from-red-400 to-red-600'
      case 'Weather': return 'from-cyan-400 to-cyan-600'
      case 'Time': return 'from-indigo-400 to-indigo-600'
      case 'Travel': return 'from-teal-400 to-teal-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'hard': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200'
    }
  }

  return (
    <motion.div
      onClick={!locked ? onClick : undefined}
      className={`
        relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-6 cursor-pointer
        border border-white/20 overflow-hidden
        ${locked ? 'opacity-60 cursor-not-allowed' : 'interactive-card'}
        ${isCompleted ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
      `}
      data-testid="lesson-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={!locked ? { 
        y: -2,
        transition: { duration: 0.2 }
      } : {}}
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(lesson.category)} opacity-5`} />
      
      {/* Lock overlay */}
      {locked && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-2xl z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-center">
            <FaLock className="text-4xl text-white mb-2" />
            <p className="text-white font-semibold">Complete previous lesson</p>
          </div>
        </motion.div>
      )}
      
      {/* Completion badge */}
      {isCompleted && (
        <motion.div 
          className="absolute top-3 right-3 z-10"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="bg-green-500 text-white rounded-full p-2 shadow-medium">
            <FaCheck className="text-sm" />
          </div>
        </motion.div>
      )}
      
      {/* Category emoji */}
      <div className="text-5xl mb-4 relative z-10">
        {getCategoryEmoji(lesson.category)}
      </div>
      
      {/* Lesson title */}
      <h3 className="text-xl font-bold mb-2 text-gray-800 relative z-10">
        {lesson.title}
      </h3>
      
      {/* Lesson description */}
      <p className="text-gray-600 mb-4 leading-relaxed relative z-10">
        {lesson.description}
      </p>
      
      {/* Difficulty badge */}
      {lesson.difficulty && (
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${getDifficultyColor(lesson.difficulty)}`}>
          {lesson.difficulty}
        </div>
      )}
      
      {/* Bottom section */}
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center space-x-2">
          <FaPlay className="text-green-500 text-sm" />
          <span className="text-sm text-gray-500 font-medium">
            {lesson.exercises?.length || 5} exercises
          </span>
        </div>
        
        {/* Stars for completed lessons */}
        {isCompleted && (
          <motion.div 
            className="flex items-center space-x-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {[...Array(3)].map((_, i) => (
              <FaStar
                key={i}
                className={`text-sm ${i < Math.floor(score / 33) ? 'text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-xs text-gray-500 ml-1">
              {score}%
            </span>
          </motion.div>
        )}
      </div>
      
      {/* Progress bar for completed lessons */}
      {isCompleted && (
        <motion.div 
          className="mt-3 relative z-10"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-full transition-all duration-1000"
              style={{ width: `${score}%` }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Hover effect for non-locked cards */}
      {!locked && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-2xl opacity-0"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  )
} 