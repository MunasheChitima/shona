'use client'
import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FaMemory, FaClock, FaBolt, FaLayerGroup } from 'react-icons/fa'
import GameChrome from '../../../components/games/GameChrome'
import StartScreen from '../../../components/games/StartScreen'
import ResultsScreen from '../../../components/games/ResultsScreen'
import StatPill from '../../../components/games/StatPill'
import ShonaTerm from '../../../components/games/ShonaTerm'
import { shuffle, submitGameResult } from '../../../components/games/gameProgress'

interface VocabPair {
  shona: string
  english: string
}

interface Card {
  id: string
  pairId: number
  type: 'shona' | 'english'
  word: string
  matched: boolean
}

const VOCAB: VocabPair[] = [
  { shona: 'mangwanani', english: 'good morning' },
  { shona: 'masikati', english: 'good afternoon' },
  { shona: 'manheru', english: 'good evening' },
  { shona: 'ndatenda', english: 'thank you' },
  { shona: 'zvakanaka', english: 'fine / good' },
  { shona: 'mvura', english: 'water' },
  { shona: 'sadza', english: 'maize meal' },
  { shona: 'mbira', english: 'thumb piano' },
  { shona: 'ngoma', english: 'drum' },
  { shona: 'amai', english: 'mother' },
  { shona: 'baba', english: 'father' },
  { shona: 'shamwari', english: 'friend' },
]

const PAIRS_PER_ROUND = 6
const ROUND_SECONDS = 90

type Phase = 'start' | 'playing' | 'finished'

function buildDeck(): Card[] {
  const chosen = shuffle(VOCAB).slice(0, PAIRS_PER_ROUND)
  const cards: Card[] = []
  chosen.forEach((pair, pairId) => {
    cards.push({ id: `p${pairId}-s`, pairId, type: 'shona', word: pair.shona, matched: false })
    cards.push({ id: `p${pairId}-e`, pairId, type: 'english', word: pair.english, matched: false })
  })
  return shuffle(cards)
}

export default function MemoryMatchGame() {
  const [phase, setPhase] = useState<Phase>('start')
  const [cards, setCards] = useState<Card[]>([])
  const [flipped, setFlipped] = useState<string[]>([]) // ids of currently face-up unmatched cards
  const [busy, setBusy] = useState(false) // brief lock while a non-match is shown
  const [matches, setMatches] = useState(0)
  const [mismatches, setMismatches] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [xpGained, setXpGained] = useState(0)
  const [bestScore, setBestScore] = useState(0)
  // Snapshot of how the round actually ended, set once at finish so the results
  // screen reflects reality (completion, not raw match/move ratio).
  const [outcome, setOutcome] = useState<{
    matched: number
    mismatches: number
    completed: boolean
  } | null>(null)

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('gameProgress') || '{}')
      setBestScore(p['memory-match']?.highScore || 0)
    } catch {
      /* ignore */
    }
  }, [])

  const start = useCallback(() => {
    setCards(buildDeck())
    setFlipped([])
    setBusy(false)
    setMatches(0)
    setMismatches(0)
    setCombo(0)
    setBestCombo(0)
    setTimeLeft(ROUND_SECONDS)
    setXpGained(0)
    setOutcome(null)
    setPhase('playing')
  }, [])

  const finish = useCallback(
    async (finalMatches: number, finalMismatches: number) => {
      const completed = finalMatches === PAIRS_PER_ROUND
      setOutcome({ matched: finalMatches, mismatches: finalMismatches, completed })
      setPhase('finished')
      // Submit completion rate (matched / total), never the match/move ratio,
      // so the recorded score can't read 100% for an unfinished board.
      const acc = Math.round((finalMatches / PAIRS_PER_ROUND) * 100)
      const { xpGained } = await submitGameResult({ gameId: 'memory-match', accuracy: acc, difficulty: 'Easy' })
      setXpGained(xpGained)
    },
    [],
  )

  // Countdown timer
  useEffect(() => {
    if (phase !== 'playing') return
    if (timeLeft <= 0) {
      void finish(matches, mismatches)
      return
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, timeLeft, matches, mismatches, finish])

  const onFlip = useCallback(
    (card: Card) => {
      // Guard rapid double-taps and resolving pairs by reading the latest flipped
      // state inside the updater, so two quick flips both register reliably.
      if (busy || card.matched) return
      setFlipped((prev) => {
        if (prev.length === 2 || prev.includes(card.id)) return prev
        const nextFlipped = [...prev, card.id]
        if (nextFlipped.length < 2) return nextFlipped

        // second card chosen — resolve this pair
        const [aId, bId] = nextFlipped
        const a = cards.find((c) => c.id === aId)!
        const b = cards.find((c) => c.id === bId)!
        setBusy(true)

        if (a.pairId === b.pairId) {
          // match
          setTimeout(() => {
            setCards((cur) => cur.map((c) => (c.pairId === a.pairId ? { ...c, matched: true } : c)))
            setFlipped([])
            setBusy(false)
            setCombo((c) => {
              const nc = c + 1
              setBestCombo((bc) => Math.max(bc, nc))
              return nc
            })
            setMatches((prevM) => {
              const nm = prevM + 1
              if (nm === PAIRS_PER_ROUND) {
                // Board cleared — finish with the running mismatch count.
                setMismatches((mm) => {
                  void finish(nm, mm)
                  return mm
                })
              }
              return nm
            })
          }, 450)
        } else {
          // mismatch — show briefly then flip back
          setCombo(0)
          setMismatches((mm) => mm + 1)
          setTimeout(() => {
            setFlipped([])
            setBusy(false)
          }, 850)
        }
        return nextFlipped
      })
    },
    [busy, cards, finish],
  )

  const mins = Math.floor(timeLeft / 60)
  const secs = (timeLeft % 60).toString().padStart(2, '0')

  return (
    <GameChrome title="memory match">
      {phase === 'start' && (
        <StartScreen
          icon={FaMemory}
          title="memory match"
          blurb="Flip the tiles and pair each Shona word with its English meaning. Chain matches without a miss to build a combo before the timer runs out."
          highlights={[
            { icon: FaLayerGroup, label: `${PAIRS_PER_ROUND} pairs` },
            { icon: FaClock, label: '90 seconds' },
            { icon: FaBolt, label: 'combo bonus' },
          ]}
          bestScore={bestScore}
          onStart={start}
          accent={{ tile: 'bg-emerald-50 text-emerald-600', chipIcon: 'text-emerald-500' }}
        />
      )}

      {phase === 'playing' && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <StatPill label="time" value={`${mins}:${secs}`} accent={timeLeft <= 15} pulseKey={timeLeft} />
            <StatPill label="pairs" value={`${matches} / ${PAIRS_PER_ROUND}`} pulseKey={matches} />
            <StatPill
              label="combo"
              value={
                <span className="inline-flex items-center gap-1">
                  {combo > 1 && <FaBolt className="text-amber-500 text-sm" aria-hidden />}
                  {combo}
                </span>
              }
              pulseKey={combo}
            />
          </div>

          {/* Cap the board width so a 6-pair (12-card, 3-row) grid of square
              tiles fits within ~700px tall without scrolling past the fold. */}
          <div className="mx-auto grid max-w-[30rem] grid-cols-4 gap-2 sm:gap-2.5">
            {cards.map((card) => {
              const isUp = card.matched || flipped.includes(card.id)
              return (
                <div key={card.id} className="aspect-square" style={{ perspective: 900 }}>
                  <motion.button
                    type="button"
                    onClick={() => onFlip(card)}
                    disabled={card.matched}
                    aria-label={isUp ? card.word : 'hidden card'}
                    className="relative h-full w-full rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                    style={{ transformStyle: 'preserve-3d' }}
                    animate={{ rotateY: isUp ? 180 : 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    whileTap={!isUp ? { scale: 0.96 } : undefined}
                  >
                    {/* back — on-brand emerald monogram (Shona "S") */}
                    <span
                      className="absolute inset-0 flex items-center justify-center rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/60 backdrop-blur"
                      style={{ backfaceVisibility: 'hidden' }}
                    >
                      <span className="select-none font-serif text-xl font-semibold text-emerald-500/80">s</span>
                    </span>
                    {/* front */}
                    <span
                      className={`absolute inset-0 flex flex-col items-center justify-center gap-0.5 rounded-xl border-2 p-1.5 text-center transition-colors ${
                        card.matched
                          ? 'border-emerald-300 bg-emerald-50'
                          : 'border-stone-300 bg-white'
                      }`}
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                      {card.type === 'shona' ? (
                        <span className="text-xs font-semibold leading-tight text-stone-900 sm:text-sm">
                          {/* audio hook: Shona term exposed for a future audio button */}
                          <ShonaTerm term={card.word} showAudio={false} />
                        </span>
                      ) : (
                        <span className="text-xs font-medium leading-tight text-stone-600 sm:text-sm">{card.word}</span>
                      )}
                      <span className="text-[0.55rem] uppercase tracking-wide text-stone-400">
                        {card.type === 'shona' ? 'shona' : 'english'}
                      </span>
                    </span>
                  </motion.button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {phase === 'finished' && (() => {
        const matched = outcome?.matched ?? matches
        const completed = outcome?.completed ?? matched === PAIRS_PER_ROUND
        const flawless = completed && (outcome?.mismatches ?? mismatches) === 0
        const finalAccuracy = Math.round((matched / PAIRS_PER_ROUND) * 100)

        // Honest headline. Only a fully cleared, zero-mismatch board is flawless.
        const headline = flawless
          ? 'kwayedza! flawless.'
          : completed
            ? 'board cleared!'
            : "time's up."
        const subcopy = flawless
          ? 'Every pair, no misses — you have these down cold.'
          : completed
            ? `You cleared all ${PAIRS_PER_ROUND} pairs. Go again for a clean, miss-free run.`
            : `You matched ${matched} of ${PAIRS_PER_ROUND} pairs before the clock ran out. Play again and beat it.`

        return (
          <ResultsScreen
            accuracy={finalAccuracy}
            xpGained={xpGained}
            headline={headline}
            subcopy={subcopy}
            // Celebrate (confetti + "perfect" tier) only on a flawless clear.
            celebrate={flawless}
            stats={[
              { label: 'pairs', value: `${matched} / ${PAIRS_PER_ROUND}` },
              { label: 'misses', value: outcome?.mismatches ?? mismatches },
              { label: 'best combo', value: bestCombo },
            ]}
            onPlayAgain={start}
          />
        )
      })()}
    </GameChrome>
  )
}
