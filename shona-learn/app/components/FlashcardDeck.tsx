'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { FaArrowLeft, FaRandom, FaCheck } from 'react-icons/fa'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { BETA_OPEN_ACCESS } from '@/lib/beta-access'
import { apiAuthHeaders } from '@/lib/api-auth-headers'
import FlashcardCard, { StudyCard } from './flashcards/FlashcardCard'

interface Flashcard extends StudyCard {
  category?: string
  level?: string
}

interface FlashcardDeckProps {
  category?: string
  /** Optional hard cap on deck size. When omitted the whole category is served
   * so the picker's denominator (full category count) always matches. */
  limit?: number
}

const FLASHCARD_PRACTICE_KEY = 'flashcard_practice_v1'

type RatingLabel = 'again' | 'hard' | 'good' | 'easy'
type Tone = 'rose' | 'amber' | 'emerald' | 'teal'

interface Rating {
  label: RatingLabel
  quality: number // SM-2 quality (0-5) for /api/reviews/complete
  tone: Tone
  // How many cards later a missed card reappears IN THIS session.
  // 0 = retire (remove from the queue). >0 = requeue that far ahead.
  requeueGap: number
  mastered: boolean // easy marks the card mastered
}

// Calm recall ratings. "again"/"hard" requeue inside the session so the card
// returns before the session ends. "good" retires it; "easy" retires + masters.
const RATINGS: Rating[] = [
  { label: 'again', quality: 1, tone: 'rose', requeueGap: 3, mastered: false },
  { label: 'hard', quality: 3, tone: 'amber', requeueGap: 6, mastered: false },
  { label: 'good', quality: 4, tone: 'emerald', requeueGap: 0, mastered: false },
  { label: 'easy', quality: 5, tone: 'teal', requeueGap: 0, mastered: true },
]

// Solid, confident, accessible fills (white text on saturated colour).
const ratingFill: Record<Tone, string> = {
  rose: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white',
  amber: 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white',
  teal: 'bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white',
}

// Tinted chip used in the end-of-session breakdown.
const ratingChip: Record<Tone, string> = {
  rose: 'border-rose-200 bg-rose-50 text-rose-700',
  amber: 'border-amber-200 bg-amber-50 text-amber-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  teal: 'border-teal-200 bg-teal-50 text-teal-700',
}

// A live entry in the session queue. `key` is unique per occurrence so a
// requeued card animates as a fresh entry rather than snapping in place.
interface QueueItem {
  card: Flashcard
  key: string
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function toQueue(cards: Flashcard[]): QueueItem[] {
  return cards.map((card, i) => ({ card, key: `${card.id}__${i}` }))
}

function recordFlashcardPractice(category: string | undefined, cardId: string) {
  if (typeof window === 'undefined' || !category || !cardId) return
  try {
    const raw = localStorage.getItem(FLASHCARD_PRACTICE_KEY)
    const map: Record<string, string[]> = raw ? JSON.parse(raw) : {}
    if (!Array.isArray(map[category])) map[category] = []
    if (!map[category].includes(cardId)) {
      map[category].push(cardId)
      localStorage.setItem(FLASHCARD_PRACTICE_KEY, JSON.stringify(map))
      window.dispatchEvent(new Event('flashcard-practice'))
    }
  } catch {
    /* ignore */
  }
}

/** Best-effort SRS write for cross-session scheduling. Never throws — studying
 * must keep working offline / for beta users with no auth (the route 401s). */
async function postRecall(subjectId: string, quality: number) {
  try {
    await fetch('/api/reviews/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...apiAuthHeaders() },
      credentials: 'include',
      body: JSON.stringify({ subjectType: 'flashcard', subjectId, quality }),
    })
  } catch {
    /* graceful fallback — local progress still recorded */
  }
}

function DeckSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="h-4 w-20 bg-stone-100 rounded" />
        <div className="h-4 w-10 bg-stone-100 rounded" />
      </div>
      <div className="h-2 w-full bg-stone-100 rounded-full mb-8" />
      <div className="bg-stone-100 rounded-2xl min-h-[20rem] sm:min-h-[24rem] mb-8" />
      <div className="grid grid-cols-4 gap-3">
        <div className="h-12 bg-stone-100 rounded-full" />
        <div className="h-12 bg-stone-100 rounded-full" />
        <div className="h-12 bg-stone-100 rounded-full" />
        <div className="h-12 bg-stone-100 rounded-full" />
      </div>
    </div>
  )
}

export default function FlashcardDeck({ category, limit }: FlashcardDeckProps) {
  const router = useRouter()

  // The stable, full set of cards for this category (review order). Only
  // mutated on an explicit shuffle.
  const [deck, setDeck] = useState<Flashcard[]>([])
  // The live session queue. We always study queue[pos]; ratings either drop
  // the entry (good/easy) or re-insert it further back (again/hard).
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [pos, setPos] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [finished, setFinished] = useState(false)

  // Distinct cards retired (good/easy) — drives the picker % and "done" count.
  const [retired, setRetired] = useState<Set<string>>(new Set())
  // Distinct cards mastered (easy).
  const [mastered, setMastered] = useState<Set<string>>(new Set())
  // Total ratings issued this session (each advance). Drives the counter.
  const [reviewedCount, setReviewedCount] = useState(0)
  // Per-rating tally for the summary breakdown.
  const [ratingCounts, setRatingCounts] = useState<Record<RatingLabel, number>>({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  })
  // Slide direction (1 = forward to next card, -1 = back to review previous).
  const [direction, setDirection] = useState(1)

  const dragX = useMotionValue(0)
  const cardOpacity = useTransform(dragX, [-220, 0, 220], [0.4, 1, 0.4])
  const cardRotate = useTransform(dragX, [-220, 0, 220], [-6, 0, 6])

  const startedAt = useRef<number>(Date.now())

  const resetSession = useCallback((cards: Flashcard[]) => {
    setQueue(toQueue(cards))
    setPos(0)
    setIsFlipped(false)
    setRetired(new Set())
    setMastered(new Set())
    setReviewedCount(0)
    setRatingCounts({ again: 0, hard: 0, good: 0, easy: 0 })
    setFinished(false)
    setDirection(1)
    dragX.set(0)
    startedAt.current = Date.now()
  }, [dragX])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      let data: Flashcard[] = []
      try {
        const res = await fetch('/flashcards.json')
        const json = await res.json()
        data = json.flashcards || []
      } catch {
        /* fall through to API */
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (data.length === 0 && (token || BETA_OPEN_ACCESS)) {
        try {
          const res = await fetch('/api/vocabulary', { headers: { ...apiAuthHeaders() } })
          if (res.ok) data = await res.json()
        } catch {
          /* ignore */
        }
      }

      let filtered = data
      if (category) {
        filtered = data.filter((c) => c.category === category || c.level === category)
      }

      let enhanced: Flashcard[] = filtered.map((c, idx) => ({
        ...c,
        id: c.id || `${c.shona || 'card'}_${idx}`,
        shona: c.shona ? c.shona.charAt(0).toUpperCase() + c.shona.slice(1) : c.shona,
      }))

      // Stable order: keep source order (only shuffle on explicit request).
      if (limit && limit > 0) enhanced = enhanced.slice(0, limit)

      if (!cancelled) {
        setDeck(enhanced)
        resetSession(enhanced)
        setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [category, limit, resetSession])

  // Record that the current card was seen (local progress for the deck %).
  const currentItem = queue[pos]
  useEffect(() => {
    if (currentItem?.card?.id && category) {
      recordFlashcardPractice(category, currentItem.card.id)
    }
  }, [currentItem, category])

  // Review a previous card without grading it (front-of-card affordance).
  const reviewPrevious = useCallback(() => {
    if (pos === 0) return
    dragX.set(0)
    setDirection(-1)
    setIsFlipped(false)
    setPos((p) => Math.max(0, p - 1))
  }, [pos, dragX])

  const handleRate = useCallback(
    (rating: Rating) => {
      const item = queue[pos]
      if (!item?.card?.id) return

      const card = item.card
      void postRecall(card.id, rating.quality)
      setReviewedCount((n) => n + 1)
      setRatingCounts((c) => ({ ...c, [rating.label]: c[rating.label] + 1 }))
      dragX.set(0)
      setDirection(1)
      setIsFlipped(false)

      if (rating.requeueGap > 0) {
        // Requeue: re-insert this card further back as a fresh occurrence and
        // step forward. There is always something ahead, so we never finish
        // on a requeue.
        setQueue((q) => {
          const next = [...q]
          const insertAt = Math.min(pos + 1 + rating.requeueGap, next.length)
          next.splice(insertAt, 0, { card, key: `${card.id}__rq_${Date.now()}` })
          return next
        })
        setPos((p) => p + 1)
        return
      }

      // Retire (good/easy): record distinct mastery/done, then advance. If this
      // was the last live card AND nothing trails it, the session is complete.
      setRetired((r) => {
        if (r.has(card.id)) return r
        const n = new Set(r)
        n.add(card.id)
        return n
      })
      if (rating.mastered) {
        setMastered((m) => {
          if (m.has(card.id)) return m
          const n = new Set(m)
          n.add(card.id)
          return n
        })
      }

      if (pos + 1 >= queue.length) {
        setFinished(true)
      } else {
        setPos((p) => p + 1)
      }
    },
    [queue, pos, dragX]
  )

  const restart = useCallback(() => resetSession(deck), [deck, resetSession])

  const shuffleCards = useCallback(() => {
    setDeck((d) => {
      const s = shuffle(d)
      resetSession(s)
      return s
    })
  }, [resetSession])

  // Keyboard: Space/Enter flips; ArrowLeft reviews the previous card. There is
  // deliberately NO key that advances/grades — grading is the rating buttons
  // only, which keeps a single coherent control model and removes the entire
  // "advance past the last card" navigation hazard.
  useEffect(() => {
    if (isLoading || finished) return
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setIsFlipped((f) => !f)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        reviewPrevious()
      } else if (e.key === 'ArrowRight') {
        // Hard guard: never advances or navigates. Flip if face-down so the
        // arrow still feels responsive without grading the card.
        e.preventDefault()
        setIsFlipped((f) => (f ? f : true))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isLoading, finished, reviewPrevious])

  // Crash hard-guard: suppress native HTML5 drag-and-drop for the whole study
  // session. A native drag of the card/text whose drop lands on the page can
  // navigate the document to about:blank — this kills that vector at the source
  // without affecting framer-motion's pointer-based swipe.
  useEffect(() => {
    const prevent = (e: DragEvent) => e.preventDefault()
    window.addEventListener('dragstart', prevent)
    window.addEventListener('drop', prevent)
    window.addEventListener('dragover', prevent)
    return () => {
      window.removeEventListener('dragstart', prevent)
      window.removeEventListener('drop', prevent)
      window.removeEventListener('dragover', prevent)
    }
  }, [])

  if (isLoading) return <DeckSkeleton />

  if (deck.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-stone-200 p-10">
          <h3 className="text-xl font-medium tracking-tight text-stone-900 lowercase mb-2">
            no cards here yet
          </h3>
          <p className="text-stone-500 text-sm lowercase">
            try a different deck, or come back once more lessons unlock.
          </p>
        </div>
      </div>
    )
  }

  if (finished) {
    const seconds = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000))
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
    const masteredCount = mastered.size
    const doneCount = retired.size // good + easy, distinct

    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-stone-200 p-8 sm:p-10 text-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-auto mb-6 w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center"
          >
            <FaCheck className="text-emerald-600 w-6 h-6" />
          </motion.div>
          <h3 className="text-2xl font-medium tracking-tight text-stone-900 lowercase">well done</h3>
          <p className="mt-2 text-stone-500 lowercase">
            {reviewedCount} {reviewedCount === 1 ? 'review' : 'reviews'} in {timeStr}
          </p>

          {/* Headline tallies: distinct cards finished / mastered. */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-stone-200 bg-white/80 backdrop-blur py-4">
              <div className="text-2xl font-medium tracking-tight text-stone-900 tabular-nums">
                {doneCount}/{deck.length}
              </div>
              <div className="text-xs text-stone-500 lowercase mt-0.5">cards finished</div>
            </div>
            <div className="rounded-2xl border border-teal-200 bg-teal-50 py-4">
              <div className="text-2xl font-medium tracking-tight text-teal-700 tabular-nums">
                {masteredCount}
              </div>
              <div className="text-xs text-teal-700 lowercase mt-0.5">mastered</div>
            </div>
          </div>

          {/* Honest per-rating breakdown of every tap this session. */}
          <p className="mt-6 text-xs text-stone-400 lowercase">how you rated</p>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:gap-3">
            {RATINGS.map((r) => (
              <div key={r.label} className={`rounded-2xl border py-3 ${ratingChip[r.tone]}`}>
                <div className="text-xl font-medium tracking-tight tabular-nums">
                  {ratingCounts[r.label]}
                </div>
                <div className="text-xs lowercase">{r.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={restart}
              className="px-6 py-3 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors lowercase"
            >
              study again
            </button>
            <button
              type="button"
              onClick={() => router.push('/learn')}
              className="px-6 py-3 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors lowercase"
            >
              back to learn
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  // Clamp the index so nothing can ever render an undefined card.
  const safePos = Math.min(Math.max(pos, 0), queue.length - 1)
  const item = queue[safePos]
  if (!item) return <DeckSkeleton />
  const currentCard = item.card

  // Counter: which review we're on out of the planned total. The planned total
  // grows as cards are requeued, so it honestly reflects remaining work.
  const cardNumber = reviewedCount + 1
  const plannedTotal = reviewedCount + (queue.length - safePos)
  // Progress = distinct cards finished out of the deck.
  const progress = deck.length > 0 ? Math.round((retired.size / deck.length) * 100) : 0
  // "Still learning": cards ahead in the queue that aren't yet finished —
  // i.e. requeued misses plus the current card and any not-yet-seen ones.
  const learningAhead = queue
    .slice(safePos + 1)
    .filter((q) => !retired.has(q.card.id)).length

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-baseline gap-3">
          <span className="text-sm text-stone-600 lowercase tabular-nums">
            card {cardNumber} of {plannedTotal}
          </span>
          {learningAhead > 0 ? (
            <span className="text-xs text-amber-600 lowercase tabular-nums">
              still learning: {learningAhead}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={shuffleCards}
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 transition-colors lowercase"
          title="shuffle deck"
        >
          <FaRandom className="w-3 h-3" />
          shuffle
        </button>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-1.5 mb-2" aria-hidden>
        <motion.div
          className="h-1.5 rounded-full bg-emerald-600"
          animate={{ width: `${progress}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>
      <div className="flex justify-between text-xs text-stone-400 mb-6 lowercase tabular-nums">
        <span>{retired.size} finished</span>
        <span>{deck.length} in deck</span>
      </div>

      {/* Swipeable, flippable card. Swiping is review-only (back to previous);
          grading happens via the ratings below. */}
      <div className="mb-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={item.key}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.6}
              style={{ x: dragX, opacity: cardOpacity, rotate: cardRotate }}
              onDragEnd={(_, info) => {
                // Swipe right reviews the previous card. Swipe left does NOT
                // grade/advance (that's the ratings' job) — it just snaps back.
                if (info.offset.x > 110) reviewPrevious()
                else dragX.set(0)
              }}
            >
              <FlashcardCard
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped((f) => !f)}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Single coherent control model:
          - face down: a flip hint + an optional "prev" for reviewing.
          - face up: the four rating buttons ARE the advance mechanism. */}
      {!isFlipped ? (
        <div className="flex items-center justify-between gap-3 min-h-[3.25rem]">
          <button
            type="button"
            onClick={reviewPrevious}
            disabled={pos === 0}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors lowercase disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FaArrowLeft className="w-3 h-3" />
            prev
          </button>
          <button
            type="button"
            onClick={() => setIsFlipped(true)}
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-stone-900 text-white hover:bg-stone-800 transition-colors lowercase"
          >
            flip to reveal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 sm:gap-3 min-h-[3.25rem]">
          {RATINGS.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => handleRate(r)}
              className={`py-3 rounded-full text-sm font-medium lowercase transition-colors shadow-sm ${ratingFill[r.tone]}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
