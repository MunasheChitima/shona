'use client'
import { useState } from 'react'
import { FaChevronDown, FaChevronRight, FaLock } from 'react-icons/fa'
import UnitSection, { type PathUnit } from './UnitSection'
import type { LessonRowLesson } from './LessonRow'

export type PathStage = {
  id: string
  title: string
  description: string | null
  orderIndex: number
  units: PathUnit[]
}

type ProgressMap = Record<string, { completed?: boolean; score?: number }>

type LessonsByCategory = Record<string, LessonRowLesson[]>

type StageSectionProps = {
  stage: PathStage
  lessonsByCategory: LessonsByCategory
  progress: ProgressMap
  defaultOpen: boolean
  nextLessonId: string | null
  onLessonClick: (lesson: LessonRowLesson) => void
  onCheckpointOpen?: (unit: PathUnit) => void
}

export default function StageSection({
  stage,
  lessonsByCategory,
  progress,
  defaultOpen,
  nextLessonId,
  onLessonClick,
  onCheckpointOpen,
}: StageSectionProps) {
  const stageLocked = stage.units.length > 0 && stage.units.every((u) => u.status === 'locked')
  const [open, setOpen] = useState(defaultOpen && !stageLocked)

  const unitsComplete = stage.units.filter((u) => u.completed).length
  const unitsTotal = stage.units.length

  // Lesson-level rollup so the header advances the moment a single lesson is
  // completed, instead of sitting at "0/4 units" until an entire unit is done
  // (bug #6). Falls back to the live progress map when the API count is absent.
  const lessonUnits = stage.units.filter((u) => u.unitType !== 'checkpoint')
  const lessonsTotal = lessonUnits.reduce((sum, u) => {
    if (typeof u.lessonsTotal === 'number') return sum + u.lessonsTotal
    return sum + (u.lessonId ? (lessonsByCategory[u.lessonId]?.length ?? 0) : 0)
  }, 0)
  const lessonsComplete = lessonUnits.reduce((sum, u) => {
    if (typeof u.lessonsCompleted === 'number') return sum + u.lessonsCompleted
    const list = u.lessonId ? lessonsByCategory[u.lessonId] ?? [] : []
    return sum + list.filter((l) => progress[l.id]?.completed).length
  }, 0)

  return (
    <div
      className={`rounded-2xl border-2 overflow-hidden mb-4 ${stageLocked ? 'border-gray-200 bg-gray-50/80' : 'border-gray-200 bg-white shadow-sm'}`}
    >
      <button
        type="button"
        disabled={stageLocked}
        onClick={() => !stageLocked && setOpen((o) => !o)}
        className={`w-full min-h-[48px] flex items-center gap-3 px-4 py-3 text-left
          ${stageLocked ? 'cursor-default' : 'hover:bg-gray-50'}
        `}
      >
        {stageLocked ? (
          <FaLock className="text-gray-400 flex-shrink-0" />
        ) : open ? (
          <FaChevronDown className="text-gray-600" />
        ) : (
          <FaChevronRight className="text-gray-600" />
        )}
        <div className="flex-1">
          <div className={`font-bold ${stageLocked ? 'text-gray-500' : 'text-gray-900'}`}>
            Stage {stage.orderIndex}: {stage.title}
          </div>
          {stage.description ? <div className="text-sm text-gray-500 mt-0.5">{stage.description}</div> : null}
        </div>
        <div className="text-sm text-gray-600 whitespace-nowrap">
          {lessonsTotal > 0 ? (
            <span>
              {lessonsComplete}/{lessonsTotal} lessons
              {unitsTotal > 0 && unitsComplete >= unitsTotal ? ' ✅' : ''}
            </span>
          ) : unitsTotal > 0 ? (
            <span>
              {unitsComplete}/{unitsTotal} units
              {unitsComplete >= unitsTotal ? ' ✅' : ''}
            </span>
          ) : null}
        </div>
      </button>
      {open && !stageLocked ? (
        <div className="px-3 pb-4 flex flex-col gap-3 border-t border-gray-100 pt-3">
          {stage.units.map((unit) => {
            const cat = unit.lessonId || ''
            const ul = cat ? lessonsByCategory[cat] || [] : []
            const defaultUnitOpen =
              unit.status === 'current' ||
              (unit.status === 'available' && ul.some((l) => !progress[l.id]?.completed))
            return (
              <UnitSection
                key={unit.id}
                unit={unit}
                lessons={ul}
                progress={progress}
                defaultOpen={defaultUnitOpen}
                nextLessonId={nextLessonId}
                onLessonClick={onLessonClick}
                onCheckpointOpen={onCheckpointOpen}
              />
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
