'use client'
import { useState } from 'react'
import { FaChevronDown, FaChevronRight, FaLock } from 'react-icons/fa'
import LessonRow, { type LessonRowLesson } from './LessonRow'

export type PathUnit = {
  id: string
  lessonId: string | null
  title: string
  description: string | null
  unitType: string
  orderIndex: number
  status: string
  completed?: boolean
  /** Lesson-level rollup from the API for partial-progress display. */
  lessonsTotal?: number
  lessonsCompleted?: number
  missingPrerequisites?: string[]
  checkpointId?: string | null
  /**
   * `full` (default) renders the standard lesson sequence.
   * `review` is sent by the API for heritage learners on units whose lessons
   * they likely know passively; the UI will eventually render a shorter recall
   * here. Threaded through but not yet consumed for rendering.
   */
  displayMode?: 'full' | 'review'
}

type ProgressMap = Record<string, { completed?: boolean; score?: number }>

type UnitSectionProps = {
  unit: PathUnit
  lessons: LessonRowLesson[]
  progress: ProgressMap
  defaultOpen: boolean
  nextLessonId: string | null
  onLessonClick: (lesson: LessonRowLesson) => void
  onCheckpointOpen?: (unit: PathUnit) => void
}

function unitLessonsComplete(lessons: LessonRowLesson[], progress: ProgressMap) {
  if (lessons.length === 0) return false
  return lessons.every((l) => progress[l.id]?.completed)
}

export default function UnitSection({
  unit,
  lessons,
  progress,
  defaultOpen,
  nextLessonId,
  onLessonClick,
  onCheckpointOpen,
}: UnitSectionProps) {
  const locked = unit.status === 'locked'
  const [open, setOpen] = useState(defaultOpen && !locked)
  const complete =
    unit.unitType === 'checkpoint'
      ? !!unit.completed
      : unitLessonsComplete(lessons, progress) || !!unit.completed

  // Lesson-level progress for a small "N/M" count beside the unit (bug #6).
  const lessonsTotal =
    typeof unit.lessonsTotal === 'number' && unit.lessonsTotal > 0 ? unit.lessonsTotal : lessons.length
  const lessonsDone =
    typeof unit.lessonsCompleted === 'number'
      ? unit.lessonsCompleted
      : lessons.filter((l) => progress[l.id]?.completed).length

  if (unit.unitType === 'checkpoint') {
    return (
      <div
        className={`rounded-xl border overflow-hidden ${locked ? 'opacity-70 bg-gray-50 border-gray-200' : 'bg-white border-amber-200 border-2'}`}
      >
        <div className="px-4 py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            {locked ? <FaLock className="text-gray-400 mt-1 flex-shrink-0" /> : null}
            <div>
              <div className="font-semibold text-gray-900">{unit.title}</div>
              {unit.description ? <p className="text-sm text-gray-600 mt-0.5">{unit.description}</p> : null}
              {locked && unit.missingPrerequisites && unit.missingPrerequisites.length > 0 ? (
                <p className="text-xs text-amber-800 mt-2">
                  Complete first: {unit.missingPrerequisites.join(', ')}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {complete ? <span className="text-green-600 text-sm font-medium">Passed ✅</span> : null}
            {!locked && !complete && onCheckpointOpen ? (
              <button
                type="button"
                onClick={() => onCheckpointOpen(unit)}
                className="rounded-xl bg-amber-600 text-white text-sm font-bold px-4 py-2 hover:bg-amber-700"
              >
                Take checkpoint
              </button>
            ) : null}
            {locked ? <span className="text-xs text-gray-400">Locked</span> : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border overflow-hidden ${locked ? 'opacity-70 bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
      <button
        type="button"
        disabled={locked}
        onClick={() => !locked && setOpen((o) => !o)}
        className={`w-full min-h-[44px] flex items-center gap-2 px-4 py-3 text-left font-semibold
          ${locked ? 'cursor-default text-gray-500' : 'hover:bg-gray-50 text-gray-800'}
        `}
      >
        {locked ? <FaLock className="text-gray-400 flex-shrink-0" /> : open ? <FaChevronDown /> : <FaChevronRight />}
        <span className="flex-1">{unit.title}</span>
        {!locked && !complete && lessonsTotal > 0 ? (
          <span className="text-xs text-gray-500 tabular-nums">{lessonsDone}/{lessonsTotal}</span>
        ) : null}
        {complete ? <span className="text-green-600 text-sm">✅</span> : null}
        {!locked && unit.status === 'current' ? <span className="text-xs font-bold text-blue-600">Current</span> : null}
        {locked ? <span className="text-xs text-gray-400">Locked</span> : null}
      </button>
      {locked && unit.missingPrerequisites && unit.missingPrerequisites.length > 0 ? (
        <div className="px-4 pb-2 text-xs text-amber-800">
          Complete first: {unit.missingPrerequisites.join(', ')}
        </div>
      ) : null}
      {open && !locked && lessons.length > 0 ? (
        <div className="px-3 pb-3 flex flex-col gap-2">
          {lessons.map((lesson, idx) => {
            const p = progress[lesson.id]
            const prevDone = idx === 0 || progress[lessons[idx - 1].id]?.completed
            const lessonLocked = !prevDone
            const isNext = lesson.id === nextLessonId
            return (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                completed={!!p?.completed}
                score={p?.score}
                isLocked={lessonLocked}
                isNext={isNext}
                displayMode={unit.displayMode}
                onClick={() => onLessonClick(lesson)}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
