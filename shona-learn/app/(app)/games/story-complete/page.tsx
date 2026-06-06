'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBook, FaLightbulb, FaCheck, FaTimes, FaArrowRight, FaListOl } from 'react-icons/fa'
import GameChrome from '../../../components/games/GameChrome'
import StartScreen from '../../../components/games/StartScreen'
import ResultsScreen from '../../../components/games/ResultsScreen'
import StatPill from '../../../components/games/StatPill'
import ShonaTerm from '../../../components/games/ShonaTerm'
import { shuffle, submitGameResult, type Difficulty } from '../../../components/games/gameProgress'

interface Blank {
  answer: string
  options: string[]
  hint: string
}

interface Story {
  id: string
  title: string
  /** Shona text with `{n}` placeholders (1-indexed) for each blank. */
  template: string
  translation: string
  blanks: Blank[]
  difficulty: Difficulty
}

// Each blank's answer genuinely fits its slot; distractors are plausible.
const STORIES: Story[] = [
  {
    id: 'greeting',
    title: 'a morning greeting',
    template: '{1} amai. Makadii {2}? Ndiri {3}, ndatenda. {4} henyu.',
    translation: 'Good morning mother. How are you today? I am well, thank you. Have a good day.',
    difficulty: 'Easy',
    blanks: [
      { answer: 'Mangwanani', options: ['Mangwanani', 'Manheru', 'Masikati', 'Usiku'], hint: 'A morning greeting' },
      { answer: 'nhasi', options: ['nhasi', 'mangwana', 'nezuro', 'gore'], hint: 'It means "today"' },
      { answer: 'zvakanaka', options: ['zvakanaka', 'akashata', 'kure', 'huru'], hint: 'It means "well / good"' },
      { answer: 'Sarai', options: ['Sarai', 'Mhanya', 'Tamba', 'Imba'], hint: 'A way to say goodbye to someone staying' },
    ],
  },
  {
    id: 'market',
    title: 'at the market',
    template: 'Ndinoda kutenga {1}. Imarii {2}? Ndinokupai {3}. {4}!',
    translation: 'I want to buy tomatoes. How much is the price? I will give you money. Thank you!',
    difficulty: 'Medium',
    blanks: [
      { answer: 'madomasi', options: ['madomasi', 'mvura', 'imba', 'ngoma'], hint: 'A red vegetable / fruit you cook with' },
      { answer: 'mutengo', options: ['mutengo', 'zuva', 'shamwari', 'mota'], hint: 'It means "price"' },
      { answer: 'mari', options: ['mari', 'mvura', 'sadza', 'bhuku'], hint: 'You pay with this' },
      { answer: 'Ndatenda', options: ['Ndatenda', 'Mangwanani', 'Sarai', 'Kwete'], hint: 'It means "thank you"' },
    ],
  },
  {
    id: 'family',
    title: 'my family',
    template: '{1} vangu vanonzi Rudo. {2} vangu vanoshanda kumunda. Tinogara {3} mumba. Ndinoda {4} yangu.',
    translation: 'My mother is called Rudo. My father works in the field. We live together in the house. I love my family.',
    difficulty: 'Medium',
    blanks: [
      { answer: 'Amai', options: ['Amai', 'Baba', 'Sekuru', 'Mukoma'], hint: 'It means "mother"' },
      { answer: 'Baba', options: ['Baba', 'Amai', 'Tete', 'Mbuya'], hint: 'It means "father"' },
      { answer: 'pamwe chete', options: ['pamwe chete', 'kure', 'oga', 'manheru'], hint: 'It means "together"' },
      { answer: 'mhuri', options: ['mhuri', 'mota', 'imba', 'mvura'], hint: 'It means "family"' },
    ],
  },
]

type Phase = 'start' | 'playing' | 'finished'

export default function StoryCompleteGame() {
  const [phase, setPhase] = useState<Phase>('start')
  const [story, setStory] = useState<Story | null>(null)
  const [shuffledOptions, setShuffledOptions] = useState<string[][]>([])
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<(string | null)[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [locked, setLocked] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [xpGained, setXpGained] = useState(0)
  const [bestScore, setBestScore] = useState(0)

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('gameProgress') || '{}')
      setBestScore(p['story-complete']?.highScore || 0)
    } catch {
      /* ignore */
    }
  }, [])

  const total = story?.blanks.length ?? 0
  const current = story?.blanks[index]
  const accuracy = useMemo(() => (total ? Math.round((correctCount / total) * 100) : 0), [correctCount, total])

  const start = useCallback(() => {
    const next = STORIES[Math.floor(Math.random() * STORIES.length)]
    setStory(next)
    setShuffledOptions(next.blanks.map((b) => shuffle(b.options)))
    setIndex(0)
    setPicked(new Array(next.blanks.length).fill(null))
    setSelected(null)
    setLocked(false)
    setShowHint(false)
    setCorrectCount(0)
    setStreak(0)
    setBestStreak(0)
    setXpGained(0)
    setPhase('playing')
  }, [])

  const finish = useCallback(
    async (correct: number, st: Story) => {
      setPhase('finished')
      const acc = st.blanks.length ? Math.round((correct / st.blanks.length) * 100) : 0
      const { xpGained } = await submitGameResult({ gameId: 'story-complete', accuracy: acc, difficulty: st.difficulty })
      setXpGained(xpGained)
    },
    [],
  )

  const answer = useCallback(
    (option: string) => {
      if (locked || !current || !story) return
      const isCorrect = option === current.answer
      setSelected(option)
      setLocked(true)
      // fill the blank with the correct word once revealed, so the story reads correctly
      setPicked((prev) => {
        const copy = [...prev]
        copy[index] = current.answer
        return copy
      })
      if (isCorrect) {
        setCorrectCount((c) => c + 1)
        setStreak((s) => {
          const ns = s + 1
          setBestStreak((b) => Math.max(b, ns))
          return ns
        })
      } else {
        setStreak(0)
      }
    },
    [locked, current, story, index],
  )

  const next = useCallback(() => {
    if (!story) return
    if (index < story.blanks.length - 1) {
      setIndex((i) => i + 1)
      setSelected(null)
      setLocked(false)
      setShowHint(false)
    } else {
      const finalCorrect = correctCount
      void finish(finalCorrect, story)
    }
  }, [story, index, correctCount, finish])

  // Render the story template, swapping {n} placeholders for blank chips.
  const renderStory = () => {
    if (!story) return null
    const segments = story.template.split(/(\{\d+\})/g)
    return (
      <p className="text-lg leading-loose text-stone-800">
        {segments.map((seg, i) => {
          const m = seg.match(/^\{(\d+)\}$/)
          if (!m) {
            return (
              <span key={i}>
                {/* audio hook: full Shona story text is available via the template */}
                {seg}
              </span>
            )
          }
          const blankIdx = Number(m[1]) - 1
          const filled = picked[blankIdx]
          const isCurrent = blankIdx === index
          const blankCorrect = filled === story.blanks[blankIdx].answer
          return (
            <span
              key={i}
              className={`mx-0.5 inline-flex min-w-[3.5rem] items-center justify-center rounded-lg border-2 px-2.5 py-0.5 text-base font-semibold align-middle transition-colors ${
                filled
                  ? blankCorrect
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                    : 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : isCurrent
                    ? 'border-emerald-400 bg-emerald-50/60 text-emerald-700'
                    : 'border-dashed border-stone-300 bg-stone-50 text-stone-400'
              }`}
            >
              {filled ? (
                <ShonaTerm term={filled} showAudio={false} />
              ) : (
                <span className="tabular-nums">{blankIdx + 1}</span>
              )}
            </span>
          )
        })}
      </p>
    )
  }

  return (
    <GameChrome title="story complete">
      {phase === 'start' && (
        <StartScreen
          icon={FaBook}
          title="story complete"
          blurb="Read a short Shona story and fill each blank with the right word. Lean on the English translation and the hints if you get stuck — it’s all about context."
          highlights={[
            { icon: FaListOl, label: 'fill the blanks' },
            { icon: FaLightbulb, label: 'hints available' },
            { icon: FaBook, label: 'real sentences' },
          ]}
          bestScore={bestScore}
          onStart={start}
          accent={{ tile: 'bg-amber-50 text-amber-600', chipIcon: 'text-amber-500' }}
        />
      )}

      {phase === 'playing' && story && current && (
        <div className="space-y-5">
          <div className="grid grid-cols-3 gap-2">
            <StatPill label="blank" value={`${index + 1}/${total}`} pulseKey={index} />
            <StatPill label="correct" value={correctCount} pulseKey={correctCount} accent />
            <StatPill label="streak" value={streak} pulseKey={streak} />
          </div>

          {/* Story card */}
          <div className="rounded-2xl border border-stone-200 bg-white/80 p-6 backdrop-blur">
            <h2 className="mb-4 lowercase text-base font-medium tracking-tight text-stone-900">{story.title}</h2>
            {renderStory()}
            <div className="mt-5 border-t border-stone-100 pt-4">
              <p className="text-sm italic leading-relaxed text-stone-500">{story.translation}</p>
            </div>
          </div>

          {/* Answer card */}
          <div className="rounded-2xl border border-stone-200 bg-white/80 p-6 backdrop-blur">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-sm font-medium text-stone-900">
                choose the word for blank {index + 1}
              </h3>
              <button
                type="button"
                onClick={() => setShowHint((h) => !h)}
                disabled={locked}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 px-3 py-1 text-xs text-stone-600 transition-colors hover:border-amber-300 hover:text-amber-700 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40"
              >
                <FaLightbulb className="text-amber-500" aria-hidden /> hint
              </button>
            </div>

            <AnimatePresence>
              {showHint && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 overflow-hidden rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-800"
                >
                  {current.hint}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="grid gap-2.5 sm:grid-cols-2">
              {shuffledOptions[index]?.map((option) => {
                const isCorrect = option === current.answer
                const isPicked = option === selected
                let state = 'idle'
                if (locked) {
                  if (isCorrect) state = 'correct'
                  else if (isPicked) state = 'wrong'
                  else state = 'muted'
                }
                return (
                  <motion.button
                    key={option}
                    type="button"
                    onClick={() => answer(option)}
                    disabled={locked}
                    animate={state === 'wrong' ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    whileTap={!locked ? { scale: 0.98 } : undefined}
                    className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 ${
                      state === 'correct'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                        : state === 'wrong'
                          ? 'border-rose-300 bg-rose-50 text-rose-700'
                          : state === 'muted'
                            ? 'border-stone-200 bg-stone-50 text-stone-400'
                            : 'border-stone-200 bg-white text-stone-800 hover:border-emerald-300 hover:bg-emerald-50/40'
                    }`}
                  >
                    <ShonaTerm term={option} showAudio={false} />
                    {state === 'correct' && <FaCheck className="shrink-0 text-emerald-600" aria-hidden />}
                    {state === 'wrong' && <FaTimes className="shrink-0 text-rose-500" aria-hidden />}
                  </motion.button>
                )
              })}
            </div>

            <AnimatePresence>
              {locked && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="sticky bottom-3 z-10 mt-4 flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white/95 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm text-stone-600">
                    {selected === current.answer ? 'Correct.' : (
                      <>
                        The word is <span className="font-semibold text-stone-900">{current.answer}</span>.
                      </>
                    )}
                  </p>
                  <motion.button
                    type="button"
                    onClick={next}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  >
                    {index < total - 1 ? 'next blank' : 'see results'}
                    <FaArrowRight className="text-xs" aria-hidden />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {phase === 'finished' && (
        <ResultsScreen
          accuracy={accuracy}
          xpGained={xpGained}
          stats={[
            { label: 'correct', value: `${correctCount}/${total}` },
            { label: 'best streak', value: bestStreak },
            { label: 'accuracy', value: `${accuracy}%` },
          ]}
          onPlayAgain={start}
        />
      )}
    </GameChrome>
  )
}
