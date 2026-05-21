'use client'
import React, { useState, useEffect, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useSWR from 'swr'
import FlashcardDeck from '../../components/FlashcardDeck'
import ErrorBoundary from '../../components/ErrorBoundary'
import { FaArrowLeft, FaLock } from 'react-icons/fa'
import LoadingSpinner from '../../components/LoadingSpinner'
import { BETA_OPEN_ACCESS } from '@/lib/beta-access'

// SWR keys — kept identical to /learn /quests /profile so cross-page
// navigation reuses the in-memory cache.
const PROGRESS_KEY = '/api/progress'
const LESSONS_KEY = '/api/lessons'
const FLASHCARDS_META_KEY = '/flashcards.json'

const flashcardsFetcher = async (url: string) => {
  const r = await fetch(url)
  if (!r.ok) throw new Error('failed')
  return r.json()
}

const FLASHCARD_PRACTICE_KEY = 'flashcard_practice_v1'

const categories = [
  { id: 'Unit 1: First Words', name: 'first words', level: 'beginner', color: 'from-green-400 to-green-600' },
  { id: 'Unit 2: People Around You', name: 'people', level: 'beginner', color: 'from-pink-400 to-pink-600' },
  { id: 'Unit 3: Numbers & Time', name: 'numbers & time', level: 'beginner', color: 'from-purple-400 to-purple-600' },
  { id: 'Unit 4: Daily Life', name: 'daily life', level: 'beginner', color: 'from-yellow-400 to-yellow-600' },
  { id: 'Unit 5: Getting Around', name: 'getting around', level: 'beginner', color: 'from-cyan-400 to-cyan-600' },
  { id: 'Unit 6: Doing Things', name: 'doing things', level: 'beginner', color: 'from-red-400 to-red-600' },
  { id: 'Unit 7: Expressing Yourself', name: 'expressing yourself', level: 'intermediate', color: 'from-indigo-400 to-indigo-600' },
  { id: 'Unit 8: Culture & Traditions', name: 'culture', level: 'intermediate', color: 'from-emerald-400 to-emerald-600' },
  { id: 'Unit 9: Nature & Environment', name: 'nature', level: 'intermediate', color: 'from-teal-400 to-teal-600' },
  { id: 'Unit 10: Modern Life', name: 'modern life', level: 'intermediate', color: 'from-sky-400 to-sky-600' },
  { id: 'Unit 11: Society & Governance', name: 'society', level: 'advanced', color: 'from-red-500 to-red-700' },
  { id: 'Unit 12: Complex Communication', name: 'complex shona', level: 'advanced', color: 'from-violet-500 to-violet-700' },
  { id: 'Unit 13: Deeper Culture', name: 'deep culture', level: 'advanced', color: 'from-amber-500 to-amber-700' },
]

function readPracticeIds(categoryId: string): number {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(FLASHCARD_PRACTICE_KEY)
    const map = raw ? JSON.parse(raw) : {}
    const arr = map[categoryId]
    return Array.isArray(arr) ? arr.length : 0
  } catch {
    return 0
  }
}

function FlashcardsInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [practiceRev, setPracticeRev] = useState(0)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) {
      setSelectedCategory(cat)
    }
  }, [searchParams])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const userData = localStorage.getItem('user')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch {
        setUser({ name: 'Beta tester', xp: 0 })
      }
    } else {
      setUser({ name: 'Beta tester', xp: 0 })
    }
  }, [])

  // /flashcards.json is a static asset, so it deserves its own fetcher
  // (the default SWR fetcher adds `credentials: 'include'` which is
  // unnecessary for public assets).
  const { data: flashMeta } = useSWR<{ flashcards?: Array<{ category?: string }> }>(
    FLASHCARDS_META_KEY,
    flashcardsFetcher
  )

  // These two share SWR keys with /learn, /profile, /quests so the data
  // is already in cache by the time the user clicks here.
  const hasToken = typeof window !== 'undefined' && !!localStorage.getItem('token')
  const shouldGate = hasToken || !BETA_OPEN_ACCESS
  const { data: progressData, error: progressErr, isLoading: progressLoading } = useSWR<Array<{ lessonId?: string; completed?: boolean }>>(
    shouldGate ? PROGRESS_KEY : null
  )
  const { data: lessonsResp, error: lessonsErr, isLoading: lessonsLoading } = useSWR<{ lessons?: Array<{ id?: string; category?: string }> }>(
    shouldGate ? LESSONS_KEY : null
  )

  const cardTotals = useMemo<Record<string, number>>(() => {
    const totals: Record<string, number> = {}
    for (const c of flashMeta?.flashcards || []) {
      if (!c?.category) continue
      totals[c.category] = (totals[c.category] || 0) + 1
    }
    return totals
  }, [flashMeta])

  const gatingReady = !shouldGate || (!progressLoading && !lessonsLoading)
  // If either gating fetch failed, fall back to unlock-all so the page
  // is still usable (matches the previous try/catch behavior).
  const unlockAll = !shouldGate || !!progressErr || !!lessonsErr
  const unlockedByLesson = useMemo<Set<string>>(() => {
    const s = new Set<string>()
    if (unlockAll) return s
    const completedIds = new Set((progressData || []).filter((p) => p?.completed).map((p) => p.lessonId))
    for (const lesson of lessonsResp?.lessons || []) {
      if (lesson?.category && lesson?.id && completedIds.has(lesson.id)) {
        s.add(lesson.category)
      }
    }
    return s
  }, [unlockAll, progressData, lessonsResp])

  useEffect(() => {
    if (!gatingReady || unlockAll) return
    const cat = searchParams.get('category')
    if (cat && !unlockedByLesson.has(cat)) {
      setSelectedCategory(null)
      router.replace('/flashcards', { scroll: false })
    }
  }, [gatingReady, unlockAll, unlockedByLesson, searchParams, router])

  useEffect(() => {
    const fn = () => setPracticeRev((x) => x + 1)
    window.addEventListener('flashcard-practice', fn)
    return () => window.removeEventListener('flashcard-practice', fn)
  }, [])

  const isCategoryUnlocked = useMemo(() => {
    return (categoryId: string) => unlockAll || unlockedByLesson.has(categoryId)
  }, [unlockAll, unlockedByLesson])

  void practiceRev

  if (user === null) {
    return <LoadingSpinner fullScreen message="loading flashcards..." />
  }

  const renderCategoryCard = (category: (typeof categories)[0]) => {
    const unlocked = isCategoryUnlocked(category.id)
    const total = cardTotals[category.id] ?? 0
    const practicedIds = readPracticeIds(category.id)
    const practicedDisplay = total > 0 ? Math.min(practicedIds, total) : practicedIds
    const pct = total > 0 ? Math.round((practicedDisplay / total) * 100) : 0
    const isNew = practicedDisplay === 0

    return (
      <button
        key={category.id}
        type="button"
        disabled={!unlocked}
        onClick={() => unlocked && setSelectedCategory(category.id)}
        className={`rounded-2xl p-6 border text-left transition-colors relative
          ${unlocked ? 'bg-white/80 backdrop-blur border-stone-200 hover:border-stone-300' : 'bg-stone-50 border-stone-200 opacity-60 cursor-not-allowed'}
        `}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-medium tracking-tight text-stone-900 lowercase">{category.name}</h3>
          {!unlocked ? <FaLock className="text-stone-400 mt-1 flex-shrink-0 w-3 h-3" aria-hidden /> : null}
          {unlocked && isNew ? (
            <span className="text-xs font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full lowercase">new</span>
          ) : null}
        </div>
        <p className="text-sm font-medium mt-1 text-stone-500 lowercase">
          {category.level}
        </p>
        {total > 0 ? (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-stone-500 mb-1.5">
              <span className="lowercase">
                {practicedDisplay}/{total} cards practiced
              </span>
              <span className="tabular-nums">{pct}%</span>
            </div>
            <div className="w-full bg-stone-100 rounded-full h-1">
              <div
                className="h-1 rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-xs text-stone-400 lowercase">loading deck size…</p>
        )}
      </button>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#fffdf7]">
        <div className="container mx-auto px-6 py-12 max-w-5xl">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-stone-900 lowercase">flashcards</h1>
            <p className="mt-2 text-stone-500 text-sm">tap to flip. tap a deck to start.</p>
          </div>

          {!selectedCategory ? (
            <div className="space-y-12">
              <section>
                <h2 className="text-xl md:text-2xl font-medium tracking-tight text-stone-900 mb-5 lowercase">beginner</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.filter((c) => c.level === 'beginner').map(renderCategoryCard)}
                </div>
              </section>
              <section>
                <h2 className="text-xl md:text-2xl font-medium tracking-tight text-stone-900 mb-5 lowercase">intermediate</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.filter((c) => c.level === 'intermediate').map(renderCategoryCard)}
                </div>
              </section>
              <section>
                <h2 className="text-xl md:text-2xl font-medium tracking-tight text-stone-900 mb-5 lowercase">advanced</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.filter((c) => c.level === 'advanced').map(renderCategoryCard)}
                </div>
              </section>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-8">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null)
                    router.push('/flashcards', { scroll: false })
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-stone-700 hover:text-stone-900 transition-colors lowercase"
                >
                  <FaArrowLeft className="w-3 h-3" />
                  <span>back to categories</span>
                </button>

                <h2 className="text-xl md:text-2xl font-medium tracking-tight text-stone-900 lowercase">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </h2>
              </div>

              <FlashcardDeck category={selectedCategory} limit={20} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default function Flashcards() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="loading flashcards..." />}>
      <FlashcardsInner />
    </Suspense>
  )
}
