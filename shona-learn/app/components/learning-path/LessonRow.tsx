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
        ${isLocked ? 'bg-stone-50 border-stone-200 text-stone-400 cursor-not-allowed' : ''}
        ${!isLocked && completed ? 'bg-white border-stone-200 text-stone-600' : ''}
        ${!isLocked && !completed && isNext ? 'bg-white border-emerald-600' : ''}
        ${!isLocked && !completed && !isNext ? 'bg-white border-stone-200 hover:border-stone-300' : ''}
      `}
    >
      <span className="flex-shrink-0 w-6 flex justify-center">
        {isLocked ? <FaLock className="text-stone-400 w-3 h-3" /> : null}
        {!isLocked && completed ? <FaCheck className="text-emerald-600 w-3 h-3" /> : null}
        {!isLocked && !completed && !isNext ? <span className="text-stone-300 text-sm">○</span> : null}
        {!isLocked && !completed && isNext ? <span className="text-emerald-600">●</span> : null}
      </span>
      <span className={`flex-1 font-medium lowercase ${completed ? 'text-stone-500' : 'text-stone-900'}`}>
        {lesson.title}
      </span>
      {completed && !isLocked ? (
        <span className="text-sm text-emerald-700 font-medium tabular-nums">{score}%</span>
      ) : null}
      {!completed && isNext && !isLocked ? (
        <span className="text-xs font-medium text-white bg-stone-900 px-3 py-1.5 rounded-full lowercase">
          {resumable ? 'continue' : 'start'}
        </span>
      ) : null}
    </button>
  )
}
