'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import { quests, getQuestsByLevel, Quest } from '../../../lib/quests'

// IMPORTANT: this key is intentionally identical to the one the /learn
// page uses so SWR de-dupes the network call across pages. The first page
// to mount fetches; subsequent pages hit the cache and render instantly.
const LESSONS_MANIFEST_KEY = '/api/lessons/public?manifest=1&limit=100'
const PROGRESS_KEY = '/api/progress'

export default function Quests() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userLevel, setUserLevel] = useState(1)
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      const userObj = userData ? safeJson(userData) || { name: 'Beta tester', xp: 0 } : { name: 'Beta tester', xp: 0 }
      setUser(userObj)
      const xp = Number(userObj?.xp) || 0
      const level = Math.floor(xp / 100) + 1
      setUserLevel(level)
    }
  }, [])

  // Lessons manifest (just id/title/etc) — shared with /learn page.
  const { data: lessonsData } = useSWR<{ lessons?: Array<{ id?: string; title?: string }>; totalLessons?: number }>(
    LESSONS_MANIFEST_KEY
  )
  // Progress list — shared with /learn and /profile.
  const { data: progressData } = useSWR<Array<{ lessonId?: string; completed?: boolean }>>(PROGRESS_KEY)

  const lessonTitleMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const l of lessonsData?.lessons || []) {
      if (l?.id && l?.title) map[l.id] = l.title
    }
    return map
  }, [lessonsData])

  const totalLessons = useMemo(() => {
    if (typeof lessonsData?.totalLessons === 'number') return lessonsData.totalLessons
    if (Array.isArray(lessonsData?.lessons)) return lessonsData!.lessons!.length
    return null
  }, [lessonsData])

  const progressLessons = useMemo(() => {
    const s = new Set<string>()
    for (const p of progressData || []) {
      if (p?.completed && p?.lessonId) s.add(p.lessonId)
    }
    return s
  }, [progressData])

  const completedQuestIds = useMemo(() => {
    const result: string[] = []
    for (const q of quests) {
      if (q.lessons.length === 0) continue
      const allDone = q.lessons.every((lid) => progressLessons.has(lid))
      if (allDone) result.push(q.id)
    }
    return result
  }, [progressLessons])

  const availableQuests = getQuestsByLevel(userLevel)

  const handleStartQuest = (quest: Quest) => {
    router.push(`/learn?quest=${quest.id}`)
  }

  if (!user) return null

  const beginnerQuests = availableQuests.filter(q => q.level === 'beginner')
  const intermediateQuests = availableQuests.filter(q => q.level === 'intermediate')
  const advancedQuests = availableQuests.filter(q => q.level === 'advanced')

  const renderQuestGroup = (title: string, groupQuests: Quest[], level: string) => {
    if (groupQuests.length === 0) return null
    return (
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl md:text-2xl font-medium tracking-tight text-stone-900 lowercase">{title}</h2>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 lowercase">
            {level}
          </span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groupQuests.map((quest) => {
            const isCompleted = completedQuestIds.includes(quest.id)
            const isAvailable = quest.requiredLevel <= userLevel

            return (
              <div
                key={quest.id}
                className={`relative cursor-pointer rounded-2xl border bg-white/80 backdrop-blur p-6 transition-colors ${
                  isCompleted
                    ? 'border-emerald-600 opacity-90'
                    : isAvailable
                      ? 'border-stone-200 hover:border-stone-300'
                      : 'border-stone-200 opacity-60'
                }`}
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl">{quest.emoji}</span>
                  {isCompleted ? (
                    <span className="text-xs font-medium text-emerald-700 lowercase">completed</span>
                  ) : isAvailable ? (
                    <span className="text-xs font-medium text-stone-500 lowercase">available</span>
                  ) : (
                    <span className="text-xs font-medium text-stone-400 lowercase">level {quest.requiredLevel}</span>
                  )}
                </div>

                <h3 className="text-lg font-medium tracking-tight text-stone-900 mb-2 lowercase">{quest.title}</h3>
                <p className="text-stone-700 mb-4 text-sm leading-relaxed">{quest.description}</p>

                <div className="text-xs text-stone-500 mb-4 lowercase">
                  {quest.lessons.length} lessons
                </div>

                {isAvailable && !isCompleted && (
                  <button
                    type="button"
                    className="w-full bg-stone-900 text-white font-medium py-2.5 px-4 rounded-full hover:bg-stone-800 transition-colors lowercase"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation()
                      handleStartQuest(quest)
                    }}
                  >
                    begin quest
                  </button>
                )}

                {isCompleted && (
                  <div className="w-full bg-emerald-50 text-emerald-700 font-medium py-2.5 px-4 rounded-full text-center lowercase">
                    completed
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffdf7]">
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-stone-900 lowercase">your journey</h1>
          <p className="mt-2 text-stone-500 text-sm lowercase">{quests.length} units across beginner, intermediate, and advanced levels</p>

          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-white/80 backdrop-blur p-6">
              <p className="text-3xl font-medium tracking-tight text-stone-900 tabular-nums">{userLevel}</p>
              <p className="mt-1 text-sm text-stone-500 lowercase">current level</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white/80 backdrop-blur p-6">
              <p className="text-3xl font-medium tracking-tight text-stone-900 tabular-nums">
                {completedQuestIds.length}<span className="text-stone-400">/{quests.length}</span>
              </p>
              <p className="mt-1 text-sm text-stone-500 lowercase">units completed</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white/80 backdrop-blur p-6">
              <p className="text-3xl font-medium tracking-tight text-stone-900 tabular-nums">
                {totalLessons === null ? <span className="inline-block w-8 h-7 bg-stone-100 rounded animate-pulse" /> : totalLessons}
              </p>
              <p className="mt-1 text-sm text-stone-500 lowercase">total lessons</p>
            </div>
          </div>
        </div>

        {renderQuestGroup('beginner', beginnerQuests, 'beginner')}
        {renderQuestGroup('intermediate', intermediateQuests, 'intermediate')}
        {renderQuestGroup('advanced', advancedQuests, 'advanced')}

        {selectedQuest && (
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedQuest(null)}
          >
            <div
              className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-stone-200"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedQuest.emoji}</span>
                  <div>
                    <h2 className="text-xl md:text-2xl font-medium tracking-tight text-stone-900 lowercase">{selectedQuest.title}</h2>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 lowercase">
                      {selectedQuest.level}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedQuest(null)}
                  className="text-stone-400 hover:text-stone-700 text-2xl"
                  aria-label="close quest details"
                >
                  &times;
                </button>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-[#fffdf7] p-6 mb-6">
                <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">the story</h3>
                <p className="text-stone-700 leading-relaxed">{selectedQuest.storyNarrative}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">what you&apos;ll learn</h3>
                <ul className="space-y-2">
                  {selectedQuest.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start text-stone-700">
                      <span className="text-emerald-600 mt-1 mr-3 flex-shrink-0">·</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">
                  {selectedQuest.lessons.length} lessons
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedQuest.lessons.map((lessonId) => {
                    const title = lessonTitleMap[lessonId]
                    const label = title || 'lesson'
                    return (
                      <span key={lessonId} className="px-3 py-1 bg-stone-100 text-stone-700 rounded-full text-sm lowercase">
                        {label}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="flex gap-3">
                {selectedQuest.requiredLevel <= userLevel && !completedQuestIds.includes(selectedQuest.id) && (
                  <button
                    type="button"
                    className="flex-1 bg-stone-900 text-white font-medium py-3 px-6 rounded-full hover:bg-stone-800 transition-colors lowercase"
                    onClick={() => handleStartQuest(selectedQuest)}
                  >
                    begin quest
                  </button>
                )}
                <button
                  type="button"
                  className="px-6 py-3 text-stone-700 hover:text-stone-900 rounded-full transition-colors lowercase"
                  onClick={() => setSelectedQuest(null)}
                >
                  close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function safeJson(s: string): any {
  try {
    return JSON.parse(s)
  } catch {
    return null
  }
}
