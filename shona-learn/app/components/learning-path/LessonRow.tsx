'use client'
import { useEffect, useState } from 'react'
import { FaLock, FaCheck } from 'react-icons/fa'

export type LessonRowLesson = {
  id: string
  title: string
  category?: string
}

type LessonRowProps = {
  lesson: LessonRowLesson
  completed: boolean
  score?: number
  isLocked: boolean
  isNext: boolean
  onClick: () => void
}

function hasSavedProgress(lessonId: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem(`lesson_${lessonId}_progress`)
    if (!raw) return false
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n > 0
  } catch {
    return false
  }
}

export default function LessonRow({
  lesson,
  completed,
  score = 0,
  isLocked,
  isNext,
  onClick,
}: LessonRowProps) {
  const [resumable, setResumable] = useState(false)
  useEffect(() => {
    if (!completed) setResumable(hasSavedProgress(lesson.id))
  }, [lesson.id, completed])
  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={() => !isLocked && onClick()}
      className={`w-full min-h-[44px] flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors border
        ${isLocked ? 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed' : ''}
        ${!isLocked && completed ? 'bg-green-50 border-green-100 text-gray-700' : ''}
        ${!isLocked && !completed && isNext ? 'bg-white border-green-400 ring-2 ring-green-200 shadow-sm' : ''}
        ${!isLocked && !completed && !isNext ? 'bg-white border-gray-200 hover:bg-gray-50' : ''}
      `}
    >
      <span className="flex-shrink-0 w-8 flex justify-center">
        {isLocked ? <FaLock className="text-gray-400" /> : null}
        {!isLocked && completed ? <FaCheck className="text-green-600" /> : null}
        {!isLocked && !completed && !isNext ? <span className="text-gray-400 text-sm">○</span> : null}
        {!isLocked && !completed && isNext ? <span className="text-green-600 font-bold">▶</span> : null}
      </span>
      <span className={`flex-1 font-medium ${completed ? 'text-gray-500' : 'text-gray-800'}`}>{lesson.title}</span>
      {completed && !isLocked ? (
        <span className="text-sm text-green-700 font-semibold tabular-nums">{score}%</span>
      ) : null}
      {!completed && isNext && !isLocked ? (
        <span className="text-sm font-bold text-white bg-gradient-to-r from-green-500 to-green-600 px-3 py-1.5 rounded-xl">
          {resumable ? 'Continue' : 'Start'}
        </span>
      ) : null}
    </button>
  )
}
