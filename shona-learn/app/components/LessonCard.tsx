'use client'
import { useEffect, useState } from 'react'
import { FaLock, FaCheck } from 'react-icons/fa'

interface LessonCardProps {
  lesson: any
  progress: any
  onClick: () => void
  locked: boolean
}

export default function LessonCard({ lesson, progress, onClick, locked }: LessonCardProps) {
  const isCompleted = progress?.completed
  const score = progress?.score || 0

  // Reading localStorage during render would mismatch SSR; resolve after mount.
  const [inProgress, setInProgress] = useState(false)
  useEffect(() => {
    if (isCompleted) return
    try {
      setInProgress(!!localStorage.getItem(`lesson_${lesson.id}_progress`))
    } catch {
      /* ignore */
    }
  }, [lesson.id, isCompleted])

  const num = typeof lesson.orderIndex === 'number' ? lesson.orderIndex : null
  const vocab = Array.isArray(lesson.vocabulary) ? lesson.vocabulary : []
  const previewWords = vocab.slice(0, 3)
  const moreCount = Math.max(0, vocab.length - previewWords.length)
  const exerciseCount = lesson.exercises?.length ?? null
  const xp = lesson.xpReward ?? null

  return (
    <button
      type="button"
      onClick={!locked ? onClick : undefined}
      disabled={locked}
      data-testid="lesson-card"
      className={`group relative flex w-full flex-col text-left rounded-2xl p-6 border transition-all duration-200 animate-slide-in-up
        ${locked
          ? 'border-stone-200 bg-stone-50/60 cursor-not-allowed'
          : isCompleted
            ? 'border-emerald-200 bg-white hover:border-emerald-300 hover:shadow-sm cursor-pointer'
            : 'border-stone-200 bg-white hover:border-stone-300 hover:shadow-[0_2px_16px_rgba(0,0,0,0.04)] hover:-translate-y-0.5 cursor-pointer'}`}
    >
      {/* top row: sequence badge + status */}
      <div className="flex items-start justify-between mb-4">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium tabular-nums
            ${locked
              ? 'bg-stone-100 text-stone-400'
              : isCompleted
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-900 text-white'}`}
        >
          {isCompleted ? <FaCheck className="text-xs" /> : num ?? '·'}
        </span>

        {locked ? (
          <FaLock className="mt-1.5 text-stone-300" />
        ) : isCompleted ? (
          <span className="mt-1 text-sm font-medium tabular-nums text-emerald-700">{score}%</span>
        ) : inProgress ? (
          <span className="mt-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium lowercase text-amber-700">
            in progress
          </span>
        ) : null}
      </div>

      {/* title */}
      <h3 className="mb-1.5 text-lg font-medium tracking-tight lowercase text-stone-900">
        {lesson.title}
      </h3>

      {/* skill outcome */}
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-stone-500">
        {lesson.description}
      </p>

      {/* vocabulary preview — the words you'll actually learn */}
      {previewWords.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          {previewWords.map((v: any, i: number) => (
            <span
              key={i}
              className="inline-flex items-center rounded-lg bg-stone-100 px-2.5 py-1 text-sm text-stone-700 group-hover:bg-stone-50"
            >
              {v.shona}
            </span>
          ))}
          {moreCount > 0 && (
            <span className="inline-flex items-center px-1.5 py-1 text-sm text-stone-400">
              +{moreCount} more
            </span>
          )}
        </div>
      )}

      {/* footer meta — pinned to the bottom for an even grid */}
      <div className="mt-auto flex items-center gap-2 text-xs lowercase text-stone-400">
        {exerciseCount != null && <span>{exerciseCount} exercises</span>}
        {exerciseCount != null && xp != null && <span className="text-stone-300">·</span>}
        {xp != null && <span>{xp} xp</span>}
      </div>

      {/* completion progress */}
      {isCompleted && (
        <div className="mt-4 h-1 overflow-hidden rounded-full bg-stone-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-700"
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </button>
  )
}
