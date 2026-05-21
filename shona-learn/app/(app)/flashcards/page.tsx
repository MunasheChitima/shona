'use client'
import React, { useState, useEffect, Suspense, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import FlashcardDeck from '../../components/FlashcardDeck'
import ErrorBoundary from '../../components/ErrorBoundary'
import { FaArrowLeft, FaLock } from 'react-icons/fa'
import LoadingSpinner from '../../components/LoadingSpinner'
import { BETA_OPEN_ACCESS } from '@/lib/beta-access'
import { apiAuthHeaders } from '@/lib/api-auth-headers'

const FLASHCARD_PRACTICE_KEY = 'flashcard_practice_v1'

const categories = [
  { id: 'Unit 1: First Words', name: 'First Words', level: 'beginner', color: 'from-green-400 to-green-600' },
  { id: 'Unit 2: People Around You', name: 'People', level: 'beginner', color: 'from-pink-400 to-pink-600' },
  { id: 'Unit 3: Numbers & Time', name: 'Numbers & Time', level: 'beginner', color: 'from-purple-400 to-purple-600' },
  { id: 'Unit 4: Daily Life', name: 'Daily Life', level: 'beginner', color: 'from-yellow-400 to-yellow-600' },
  { id: 'Unit 5: Getting Around', name: 'Getting Around', level: 'beginner', color: 'from-cyan-400 to-cyan-600' },
  { id: 'Unit 6: Doing Things', name: 'Doing Things', level: 'beginner', color: 'from-red-400 to-red-600' },
  { id: 'Unit 7: Expressing Yourself', name: 'Expressing Yourself', level: 'intermediate', color: 'from-indigo-400 to-indigo-600' },
  { id: 'Unit 8: Culture & Traditions', name: 'Culture', level: 'intermediate', color: 'from-emerald-400 to-emerald-600' },
  { id: 'Unit 9: Nature & Environment', name: 'Nature', level: 'intermediate', color: 'from-teal-400 to-teal-600' },
  { id: 'Unit 10: Modern Life', name: 'Modern Life', level: 'intermediate', color: 'from-sky-400 to-sky-600' },
  { id: 'Unit 11: Society & Governance', name: 'Society', level: 'advanced', color: 'from-red-500 to-red-700' },
  { id: 'Unit 12: Complex Communication', name: 'Complex Shona', level: 'advanced', color: 'from-violet-500 to-violet-700' },
  { id: 'Unit 13: Deeper Culture', name: 'Deep Culture', level: 'advanced', color: 'from-amber-500 to-amber-700' },
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
  const [isLoading, setIsLoading] = useState(true)
  const [unlockAll, setUnlockAll] = useState(false)
  const [unlockedByLesson, setUnlockedByLesson] = useState<Set<string>>(() => new Set())
  const [cardTotals, setCardTotals] = useState<Record<string, number>>({})
  const [practiceRev, setPracticeRev] = useState(0)
  const [gatingReady, setGatingReady] = useState(false)

  useEffect(() => {
    const cat = searchParams.get('category')
    if (cat) {
      setSelectedCategory(cat)
    }
  }, [searchParams])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (error) {
          console.error('Error parsing user data:', error)
          setUser({ name: 'Beta tester', xp: 0 })
        }
      } else {
        setUser({ name: 'Beta tester', xp: 0 })
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const res = await fetch('/flashcards.json')
        if (!res.ok) return
        const data = await res.json()
        const cards = data.flashcards || []
        const totals: Record<string, number> = {}
        for (const c of cards) {
          const cat = c.category
          if (!cat) continue
          totals[cat] = (totals[cat] || 0) + 1
        }
        setCardTotals(totals)
      } catch {
        /* ignore */
      }
    }
    loadMeta()
  }, [])

  useEffect(() => {
    const loadGating = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        if (!token && !BETA_OPEN_ACCESS) {
          setUnlockAll(true)
          return
        }
        const headers = { ...apiAuthHeaders() }
        const [progRes, lessRes] = await Promise.all([
          fetch('/api/progress', { headers }),
          fetch('/api/lessons', { headers }),
        ])
        if (!progRes.ok || !lessRes.ok) {
          setUnlockAll(true)
          return
        }
        const progress = await progRes.json()
        const completedLessonIds = new Set(
          progress.filter((p: { completed?: boolean; lessonId?: string }) => p.completed).map((p: { lessonId: string }) => p.lessonId)
        )
        const lessData = await lessRes.json()
        const lessons = lessData.lessons || []
        const unlocked = new Set<string>()
        for (const lesson of lessons) {
          if (lesson?.category && completedLessonIds.has(lesson.id)) {
            unlocked.add(lesson.category)
          }
        }
        setUnlockedByLesson(unlocked)
        setUnlockAll(false)
      } catch {
        setUnlockAll(true)
      } finally {
        setGatingReady(true)
      }
    }
    loadGating()
  }, [])

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

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading flashcards..." />
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
        className={`rounded-2xl p-5 shadow-soft border text-left transition-all duration-300 relative
          ${unlocked ? 'bg-white/80 backdrop-blur-sm border-white/20 hover:shadow-large hover:-translate-y-1' : 'bg-gray-100/90 border-gray-200 opacity-75 cursor-not-allowed'}
        `}
      >
        <div className={`w-full h-2 rounded-full bg-gradient-to-r ${category.color} mb-3 ${!unlocked ? 'opacity-40' : ''}`} />
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
          {!unlocked ? <FaLock className="text-gray-400 mt-1 flex-shrink-0" aria-hidden /> : null}
          {unlocked && isNew ? (
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">New!</span>
          ) : null}
        </div>
        <p
          className={`text-sm font-medium mt-1 ${
            category.level === 'beginner'
              ? 'text-green-600'
              : category.level === 'intermediate'
                ? 'text-blue-600'
                : 'text-red-600'
          }`}
        >
          {category.level.charAt(0).toUpperCase() + category.level.slice(1)}
        </p>
        {total > 0 ? (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>
                {practicedDisplay}/{total} cards practiced
              </span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full bg-gradient-to-r ${category.color} transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-gray-500">Loading deck size…</p>
        )}
      </button>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#fffdf7]">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Shona Flashcards</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Practice Shona vocabulary with interactive flashcards. Tap to flip, listen to pronunciation, and master the language!
            </p>
          </div>

          {!selectedCategory ? (
            <div className="max-w-4xl mx-auto space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Beginner</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.filter((c) => c.level === 'beginner').map(renderCategoryCard)}
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Intermediate</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.filter((c) => c.level === 'intermediate').map(renderCategoryCard)}
                </div>
              </section>
              <section>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Advanced</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.filter((c) => c.level === 'advanced').map(renderCategoryCard)}
                </div>
              </section>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(null)
                    router.push('/flashcards', { scroll: false })
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  <FaArrowLeft />
                  <span>Back to Categories</span>
                </button>

                <h2 className="text-2xl font-bold text-gray-800">
                  {categories.find((c) => c.id === selectedCategory)?.name} Flashcards
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
    <Suspense fallback={<LoadingSpinner fullScreen message="Loading flashcards..." />}>
      <FlashcardsInner />
    </Suspense>
  )
}
