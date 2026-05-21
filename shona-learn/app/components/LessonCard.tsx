'use client'
import { FaLock, FaCheck, FaPlay } from 'react-icons/fa'
// The card only used framer-motion for a single mount fade-in. We replace
// it with Tailwind's `animate-slide-in-up` keyframes (configured in
// tailwind.config.js) so the lesson grid renders without paying the
// framer-motion runtime cost on every card.

interface LessonCardProps {
  lesson: any
  progress: any
  onClick: () => void
  locked: boolean
}

export default function LessonCard({ lesson, progress, onClick, locked }: LessonCardProps) {
  const isCompleted = progress?.completed
  const score = progress?.score || 0

  const unitConfig: Record<string, { emoji: string }> = {
    'Unit 1': { emoji: '👋' },
    'Unit 2': { emoji: '👨‍👩‍👧‍👦' },
    'Unit 3': { emoji: '🔢' },
    'Unit 4': { emoji: '🏠' },
    'Unit 5': { emoji: '🚌' },
    'Unit 6': { emoji: '🏃' },
    'Unit 7': { emoji: '💭' },
    'Unit 8': { emoji: '🌍' },
    'Unit 9': { emoji: '🌿' },
    'Unit 10': { emoji: '🏙️' },
    'Unit 11': { emoji: '🏛️' },
    'Unit 12': { emoji: '🧠' },
    'Unit 13': { emoji: '🏛️' },
  }

  const getUnitKey = (category: string) => {
    const match = category?.match(/^Unit \d+/)
    return match ? match[0] : ''
  }

  const getCategoryEmoji = (category: string) => {
    return unitConfig[getUnitKey(category)]?.emoji || lesson.emoji || '📚'
  }

  return (
    <div
      onClick={!locked ? onClick : undefined}
      className={`
        relative rounded-2xl p-6 cursor-pointer transition-colors animate-slide-in-up
        border bg-white/80 backdrop-blur
        ${locked
          ? 'border-stone-200 opacity-60 cursor-not-allowed'
          : isCompleted
            ? 'border-emerald-600 hover:border-emerald-700'
            : 'border-stone-200 hover:border-stone-300'}
      `}
      data-testid="lesson-card"
    >
      {/* Lock overlay */}
      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900/10 backdrop-blur-[2px] rounded-2xl z-10">
          <div className="text-center">
            <FaLock className="text-2xl text-stone-500 mb-2 mx-auto" />
            <p className="text-stone-700 font-medium text-sm lowercase">complete previous lesson</p>
          </div>
        </div>
      )}

      {/* Completion badge */}
      {isCompleted && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-emerald-600 text-white rounded-full p-1.5">
            <FaCheck className="text-xs" />
          </div>
        </div>
      )}

      {/* Category emoji */}
      <div className="text-4xl mb-4">{getCategoryEmoji(lesson.category)}</div>

      {/* Lesson title */}
      <h3 className="text-lg font-medium tracking-tight mb-2 text-stone-900 lowercase">
        {lesson.title}
      </h3>

      {/* Lesson description */}
      <p className="text-stone-600 text-sm mb-4 leading-relaxed">
        {lesson.description}
      </p>

      {/* Bottom section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-stone-500">
          <FaPlay className="text-stone-400 text-xs" />
          <span className="lowercase">{lesson.exercises?.length || 5} exercises</span>
        </div>

        {isCompleted && (
          <span className="text-sm text-emerald-700 font-medium tabular-nums">{score}%</span>
        )}
      </div>

      {/* Progress bar for completed lessons */}
      {isCompleted && (
        <div className="mt-4">
          <div className="bg-stone-100 rounded-full h-1 overflow-hidden">
            <div
              className="bg-emerald-600 h-full transition-all duration-700"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
