'use client'
import { FaLock, FaCheck, FaStar, FaPlay, FaGlobeAfrica, FaVolumeUp } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { CulturalContextHighlight } from './shared/CulturalContext'

interface LessonCardProps {
  lesson: any
  progress: any
  onClick: () => void
  locked: boolean
}

// Enhanced category mapping with more categories and consistent styling
const getCategoryConfig = (category: string) => {
  const configs = {
    'Cultural Immersion': { emoji: '👋', gradient: 'from-green-400 to-green-600', color: '#10b981' },
    'Basics': { emoji: '👋', gradient: 'from-green-400 to-green-600', color: '#10b981' },
    'Numbers': { emoji: '🔢', gradient: 'from-blue-400 to-blue-600', color: '#3b82f6' },
    'Family & Relationships': { emoji: '👨‍👩‍👧‍👦', gradient: 'from-purple-400 to-purple-600', color: '#8b5cf6' },
    'Family': { emoji: '👨‍👩‍👧‍👦', gradient: 'from-purple-400 to-purple-600', color: '#8b5cf6' },
    'Verbs': { emoji: '🏃', gradient: 'from-orange-400 to-orange-600', color: '#f59e0b' },
    'Colors': { emoji: '🎨', gradient: 'from-pink-400 to-pink-600', color: '#ec4899' },
    'Animals': { emoji: '🐾', gradient: 'from-yellow-400 to-yellow-600', color: '#f59e0b' },
    'Food & Dining': { emoji: '🍽️', gradient: 'from-red-400 to-red-600', color: '#ef4444' },
    'Food': { emoji: '🍽️', gradient: 'from-red-400 to-red-600', color: '#ef4444' },
    'Weather': { emoji: '🌤️', gradient: 'from-cyan-400 to-cyan-600', color: '#06b6d4' },
    'Time & Calendar': { emoji: '⏰', gradient: 'from-indigo-400 to-indigo-600', color: '#6366f1' },
    'Time': { emoji: '⏰', gradient: 'from-indigo-400 to-indigo-600', color: '#6366f1' },
    'Travel & Transportation': { emoji: '✈️', gradient: 'from-teal-400 to-teal-600', color: '#14b8a6' },
    'Travel': { emoji: '✈️', gradient: 'from-teal-400 to-teal-600', color: '#14b8a6' },
    'Practical Communication': { emoji: '💬', gradient: 'from-amber-400 to-amber-600', color: '#f59e0b' },
    'Pronunciation Mastery': { emoji: '🎤', gradient: 'from-rose-400 to-rose-600', color: '#f43f5e' },
    'Grammar Essentials': { emoji: '📝', gradient: 'from-slate-400 to-slate-600', color: '#64748b' },
    'Business & Work': { emoji: '💼', gradient: 'from-emerald-400 to-emerald-600', color: '#10b981' },
    'Education': { emoji: '🎓', gradient: 'from-violet-400 to-violet-600', color: '#8b5cf6' },
    'Health & Body': { emoji: '🏥', gradient: 'from-red-400 to-red-600', color: '#ef4444' },
    'Technology': { emoji: '💻', gradient: 'from-blue-400 to-blue-600', color: '#3b82f6' },
    'Nature & Environment': { emoji: '🌿', gradient: 'from-green-400 to-green-600', color: '#22c55e' },
    'Celebrations & Festivals': { emoji: '🎉', gradient: 'from-rainbow-400 to-rainbow-600', color: '#f59e0b' },
    'Sports & Recreation': { emoji: '⚽', gradient: 'from-orange-400 to-orange-600', color: '#f97316' }
  }
  
  return configs[category as keyof typeof configs] || {
    emoji: '📚',
    gradient: 'from-gray-400 to-gray-600',
    color: '#6b7280'
  }
}

// Enhanced difficulty styling
const getDifficultyConfig = (difficulty: string) => {
  const configs = {
    'easy': { 
      bg: 'bg-green-100', 
      text: 'text-green-700', 
      border: 'border-green-200',
      label: 'Beginner'
    },
    'beginner': { 
      bg: 'bg-green-100', 
      text: 'text-green-700', 
      border: 'border-green-200',
      label: 'Beginner'
    },
    'medium': { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-700', 
      border: 'border-yellow-200',
      label: 'Intermediate'
    },
    'intermediate': { 
      bg: 'bg-yellow-100', 
      text: 'text-yellow-700', 
      border: 'border-yellow-200',
      label: 'Intermediate'
    },
    'hard': { 
      bg: 'bg-red-100', 
      text: 'text-red-700', 
      border: 'border-red-200',
      label: 'Advanced'
    },
    'advanced': { 
      bg: 'bg-red-100', 
      text: 'text-red-700', 
      border: 'border-red-200',
      label: 'Advanced'
    }
  }
  
  return configs[difficulty?.toLowerCase() as keyof typeof configs] || {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-200',
    label: 'Intermediate'
  }
}

export default function LessonCard({ lesson, progress, onClick, locked }: LessonCardProps) {
  const isCompleted = progress?.completed
  const score = progress?.score || 0
  const categoryConfig = getCategoryConfig(lesson.category)
  const difficultyConfig = getDifficultyConfig(lesson.difficulty || lesson.level)

  return (
    <motion.div
      onClick={!locked ? onClick : undefined}
      className={`
        relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft p-6 cursor-pointer
        border border-white/20 overflow-hidden transition-all duration-300
        ${locked ? 'opacity-60 cursor-not-allowed' : 'interactive-card hover:shadow-lg hover:-translate-y-1'}
        ${isCompleted ? 'ring-2 ring-green-500 ring-opacity-50' : ''}
      `}
      data-testid="lesson-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={!locked ? { 
        y: -4,
        transition: { duration: 0.2 }
      } : {}}
    >
      {/* Background gradient overlay */}
      <div 
        className={`absolute inset-0 bg-gradient-to-br ${categoryConfig.gradient} opacity-5`} 
      />
      
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
      
      {/* Header with category emoji and metadata */}
      <div className="flex items-start justify-between mb-4">
        <div className="text-5xl mb-4 relative z-10">
          {categoryConfig.emoji}
        </div>
        
        <div className="flex flex-col items-end space-y-2">
          {/* Difficulty badge */}
          <div 
            className={`
              inline-block px-3 py-1 rounded-full text-xs font-semibold border
              ${difficultyConfig.bg} ${difficultyConfig.text} ${difficultyConfig.border}
            `}
          >
            {difficultyConfig.label}
          </div>
          
          {/* Duration */}
          {lesson.estimatedDuration && (
            <div className="text-xs text-gray-500 flex items-center space-x-1">
              <span>⏱️</span>
              <span>{lesson.estimatedDuration} min</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Lesson title and description */}
      <h3 className="text-xl font-bold mb-2 text-gray-800 relative z-10 leading-tight">
        {lesson.title}
      </h3>
      
      <p className="text-gray-600 mb-4 leading-relaxed relative z-10 line-clamp-2">
        {lesson.description}
      </p>

      {/* Cultural context preview */}
      {lesson.culturalNotes && lesson.culturalNotes.length > 0 && !locked && (
        <div className="mb-4 relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <FaGlobeAfrica className="text-orange-500 text-sm" />
            <span className="text-xs font-medium text-orange-700">Cultural Insight</span>
          </div>
          <p className="text-xs text-orange-600 leading-relaxed line-clamp-2">
            {lesson.culturalNotes[0]}
          </p>
        </div>
      )}
      
      {/* Learning objectives preview */}
      {lesson.learningObjectives && lesson.learningObjectives.length > 0 && !locked && (
        <div className="mb-4 relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-blue-500 text-sm">🎯</span>
            <span className="text-xs font-medium text-blue-700">You'll Learn</span>
          </div>
          <ul className="text-xs text-blue-600 space-y-1">
            {lesson.learningObjectives.slice(0, 2).map((objective: string, index: number) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span className="line-clamp-1">{objective}</span>
              </li>
            ))}
            {lesson.learningObjectives.length > 2 && (
              <li className="text-blue-500 italic">
                +{lesson.learningObjectives.length - 2} more objectives
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Vocabulary preview */}
      {lesson.vocabulary && lesson.vocabulary.length > 0 && !locked && (
        <div className="mb-4 relative z-10">
          <div className="flex items-center space-x-2 mb-2">
            <FaVolumeUp className="text-purple-500 text-sm" />
            <span className="text-xs font-medium text-purple-700">Key Words</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lesson.vocabulary.slice(0, 3).map((word: any, index: number) => (
              <div key={index} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs">
                {word.shona}
              </div>
            ))}
            {lesson.vocabulary.length > 3 && (
              <div className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-xs">
                +{lesson.vocabulary.length - 3} more
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Bottom section */}
      <div className="flex justify-between items-center relative z-10 mt-auto pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <FaPlay className="text-green-500 text-sm" />
            <span className="text-sm text-gray-500 font-medium">
              {lesson.exercises?.length || lesson.vocabulary?.length || 5} exercises
            </span>
          </div>
          
          {lesson.xpReward && (
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-500 text-sm" />
              <span className="text-xs text-gray-500">
                {lesson.xpReward} XP
              </span>
            </div>
          )}
        </div>
        
        {/* Completion status and score */}
        {isCompleted ? (
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-1">
              {[...Array(3)].map((_, i) => (
                <FaStar
                  key={i}
                  className={`text-sm ${
                    i < Math.floor(score / 33) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500 font-semibold">
              {score}%
            </span>
          </motion.div>
        ) : !locked ? (
          <div className="text-sm text-gray-400 font-medium">
            Start Lesson
          </div>
        ) : null}
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
            <motion.div
              className={`bg-gradient-to-r ${categoryConfig.gradient} h-full transition-all duration-1000`}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ delay: 0.5, duration: 1 }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Hover effect for non-locked cards */}
      {!locked && (
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${categoryConfig.gradient} rounded-2xl opacity-0`}
          whileHover={{ opacity: 0.1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  )
} 