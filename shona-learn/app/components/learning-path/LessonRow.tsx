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
  /**
   * Heritage learners get a condensed "quick review" version of certain units.
   * When set to `'review'` we surface a small badge next to the title so the
   * shorter interaction is anticipated.
   */
  displayMode?: 'full' | 'review'
  onClick: () => void
}

// Never surface a raw lesson id (e.g. "lesson-49") as a title. If a title is
// missing/looks like an id we humanise it as a last resort (bug #5).
export function displayLessonTitle(lesson: { id?: string; title?: string }): string {
  const title = (lesson?.title ?? '').trim()
  const looksLikeId = /^lesson[\s-]*\d+$/i.test(title)
  if (title && !looksLikeId) return title
  return 'untitled lesson'
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
  displayMode = 'full',
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
        {displayLessonTitle(lesson)}
        {displayMode === 'review' ? (
          <span className="ml-2 align-middle rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200 lowercase">
            quick review
          </span>
        ) : null}
      </span>
      {completed && !isLocked ? (
        <span className="flex items-center gap-1.5 text-sm text-emerald-700 font-medium lowercase">
          completed
          {score > 0 ? <span className="text-stone-400 tabular-nums">· {score}%</span> : null}
        </span>
      ) : null}
      {!completed && isNext && !isLocked ? (
        <span className="text-xs font-medium text-white bg-stone-900 px-3 py-1.5 rounded-full lowercase">
          {resumable ? 'continue' : 'start'}
        </span>
      ) : null}
    </button>
  )
}
