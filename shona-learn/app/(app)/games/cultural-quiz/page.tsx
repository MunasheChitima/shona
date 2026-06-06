'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import { FaCheck, FaTimes, FaGlobeAfrica, FaQuestionCircle, FaLightbulb, FaFire, FaArrowRight } from 'react-icons/fa'
import GameChrome from '../../../components/games/GameChrome'
import StartScreen from '../../../components/games/StartScreen'
import ResultsScreen from '../../../components/games/ResultsScreen'
import StatPill from '../../../components/games/StatPill'
import { shuffle, submitGameResult } from '../../../components/games/gameProgress'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  category: string
  culturalContext: string
}

const QUESTIONS: Question[] = [
  { id: 'q1', question: 'What is the traditional Shona thumb piano called?', options: ['Mbira', 'Marimba', 'Hosho', 'Ngoma'], correctAnswer: 'Mbira', explanation: 'The mbira is a wooden board fitted with metal tines, played with the thumbs and fingers.', category: 'Music & Arts', culturalContext: 'The mbira is central to Shona spiritual life, often played in ceremonies to commune with ancestors.' },
  { id: 'q2', question: 'What does "Mwari" refer to in Shona belief?', options: ['Ancestor spirit', 'Supreme God', 'Traditional healer', 'Tribal chief'], correctAnswer: 'Supreme God', explanation: 'Mwari is the Shona name for the Supreme Being, creator of all things.', category: 'Spirituality', culturalContext: 'Mwari is approached through ancestral spirits and is central to traditional Shona religion.' },
  { id: 'q3', question: 'What is a "dare" in traditional Shona society?', options: ['A cooking pot', 'A meeting place for men', 'A type of dance', 'A farming tool'], correctAnswer: 'A meeting place for men', explanation: 'A dare is where Shona men gather to discuss community matters and make decisions.', category: 'Social Structure', culturalContext: 'The dare reflects the consultative nature of traditional Shona governance.' },
  { id: 'q4', question: 'Which ancient city is the heart of Shona civilization?', options: ['Great Zimbabwe', 'Mapungubwe', 'Thulamela', 'Khami'], correctAnswer: 'Great Zimbabwe', explanation: 'Great Zimbabwe was the capital of the Kingdom of Zimbabwe and the largest ancient structure south of the Sahara.', category: 'History', culturalContext: 'It gave the modern country its name and showcases Shona stone-building mastery.' },
  { id: 'q5', question: 'What is "kurova guva" in Shona tradition?', options: ['A wedding', 'A harvest festival', 'A burial', 'An ancestral ceremony'], correctAnswer: 'An ancestral ceremony', explanation: 'Kurova guva brings a deceased person’s spirit home to become a protective ancestor.', category: 'Spirituality', culturalContext: 'It keeps the bond between the living and the ancestors intact.' },
  { id: 'q6', question: 'What does "ukama" mean in Shona culture?', options: ['Friendship', 'Kinship', 'Respect', 'Hospitality'], correctAnswer: 'Kinship', explanation: 'Ukama is the web of kinship relationships at the foundation of Shona society.', category: 'Social Structure', culturalContext: 'Ukama reaches beyond blood to spiritual and social bonds.' },
  { id: 'q7', question: 'What is the traditional Shona shaker called?', options: ['Mbira', 'Hosho', 'Ngoma', 'Mukwa'], correctAnswer: 'Hosho', explanation: 'Hosho are gourd rattles filled with seeds, used to keep rhythm alongside the mbira.', category: 'Music & Arts', culturalContext: 'Hosho lay the rhythmic foundation of ceremonial Shona music.' },
  { id: 'q8', question: 'What is "chimurenga" in Shona history?', options: ['A dance', 'A liberation struggle', 'A pottery style', 'A farming method'], correctAnswer: 'A liberation struggle', explanation: 'Chimurenga refers to the Shona uprisings against colonial rule.', category: 'History', culturalContext: 'The chimurenga wars were inspired by spirit mediums resisting foreign domination.' },
  { id: 'q9', question: 'What is the Shona term for a traditional healer?', options: ["N'anga", 'Mukoma', 'Sabhuku', 'Mambo'], correctAnswer: "N'anga", explanation: "An n'anga uses herbal medicine and spiritual practice to heal and guide.", category: 'Spirituality', culturalContext: "N'anga mediate between the physical and spiritual worlds." },
  { id: 'q10', question: 'What is "roora" in Shona culture?', options: ['Bride price', 'A rain ceremony', 'A hunting ritual', 'A coming-of-age rite'], correctAnswer: 'Bride price', explanation: 'Roora is given by the groom’s family to the bride’s family in marriage.', category: 'Social Structure', culturalContext: 'Roora formally unites two families and affirms the wife’s status.' },
  { id: 'q11', question: 'Which sacred bird appears on Zimbabwe’s flag?', options: ['Eagle', 'Fish Eagle', 'Falcon', 'Zimbabwe Bird (Hungwe)'], correctAnswer: 'Zimbabwe Bird (Hungwe)', explanation: 'The Zimbabwe Bird, carved at Great Zimbabwe, is a national and spiritual symbol.', category: 'Symbols', culturalContext: 'It is seen as a messenger between the ancestors and the living.' },
  { id: 'q12', question: 'What is "hunhu" in Shona philosophy?', options: ['Traditional medicine', 'Moral philosophy (Ubuntu)', 'A farming practice', 'A musical rhythm'], correctAnswer: 'Moral philosophy (Ubuntu)', explanation: 'Hunhu is the Shona idea of humanness — compassion, respect and communal duty.', category: 'Values', culturalContext: 'Hunhu guides ethical behaviour and harmony, akin to Ubuntu elsewhere in Africa.' },
]

const ROUND_SIZE = 8
const SECONDS_PER_Q = 25

type Phase = 'start' | 'playing' | 'finished'

export default function CulturalQuizGame() {
  const [phase, setPhase] = useState<Phase>('start')
  const [questions, setQuestions] = useState<Question[]>([])
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [locked, setLocked] = useState(false) // answer revealed
  const [timedOut, setTimedOut] = useState(false) // answer revealed by the timer, not a pick
  const [correctCount, setCorrectCount] = useState(0)
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [score, setScore] = useState(0)
  const [timerKey, setTimerKey] = useState(0)
  const [xpGained, setXpGained] = useState(0)
  const [bestScore, setBestScore] = useState(0)

  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem('gameProgress') || '{}')
      setBestScore(p['cultural-quiz']?.highScore || 0)
    } catch {
      /* ignore */
    }
  }, [])

  const current = questions[index]
  const accuracy = useMemo(
    () => (questions.length ? Math.round((correctCount / questions.length) * 100) : 0),
    [correctCount, questions.length],
  )

  const start = useCallback(() => {
    setQuestions(shuffle(QUESTIONS).slice(0, ROUND_SIZE))
    setIndex(0)
    setSelected(null)
    setLocked(false)
    setTimedOut(false)
    setCorrectCount(0)
    setStreak(0)
    setBestStreak(0)
    setScore(0)
    setXpGained(0)
    setTimerKey((k) => k + 1)
    setPhase('playing')
  }, [])

  const reveal = useCallback(
    (answer: string | null, timeLeft: number) => {
      if (locked || !current) return
      const isCorrect = answer === current.correctAnswer
      setSelected(answer)
      setTimedOut(answer === null)
      setLocked(true)
      if (isCorrect) {
        // forgiving: small time bonus, generous combo bonus
        const gained = 100 + streak * 20 + Math.round(timeLeft * 3)
        setScore((s) => s + gained)
        setCorrectCount((c) => c + 1)
        setStreak((st) => {
          const next = st + 1
          setBestStreak((b) => Math.max(b, next))
          return next
        })
      } else {
        setStreak(0)
      }
    },
    [locked, current, streak],
  )

  const finish = useCallback(async () => {
    setPhase('finished')
    const acc = questions.length ? Math.round((correctCount / questions.length) * 100) : 0
    const { xpGained } = await submitGameResult({ gameId: 'cultural-quiz', accuracy: acc, difficulty: 'Hard' })
    setXpGained(xpGained)
  }, [questions.length, correctCount])

  const next = useCallback(() => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1)
      setSelected(null)
      setLocked(false)
      setTimedOut(false)
      setTimerKey((k) => k + 1)
    } else {
      void finish()
    }
  }, [index, questions.length, finish])

  return (
    <GameChrome title="cultural quiz">
      {phase === 'start' && (
        <StartScreen
          icon={FaGlobeAfrica}
          title="cultural quiz"
          blurb="Eight questions on Shona heritage, history and values. Answer quickly for combo bonuses — but it’s learning, not a race. A short explanation follows every question."
          highlights={[
            { icon: FaQuestionCircle, label: `${ROUND_SIZE} questions` },
            { icon: FaFire, label: 'combo bonuses' },
            { icon: FaLightbulb, label: 'learn as you go' },
          ]}
          bestScore={bestScore}
          onStart={start}
          accent={{ tile: 'bg-rose-50 text-rose-500', chipIcon: 'text-rose-500' }}
        />
      )}

      {phase === 'playing' && current && (
        <div className="space-y-5">
          {/* HUD */}
          <div className="flex items-center justify-between gap-3">
            <div className="grid flex-1 grid-cols-3 gap-2">
              <StatPill label="question" value={`${index + 1}/${questions.length}`} pulseKey={index} />
              <StatPill label="score" value={score} pulseKey={score} accent />
              <StatPill
                label="streak"
                value={
                  <span className="inline-flex items-center gap-1">
                    {streak > 1 && <FaFire className="text-amber-500 text-sm" aria-hidden />}
                    {streak}
                  </span>
                }
                pulseKey={streak}
              />
            </div>
            <div className="shrink-0">
              <CountdownCircleTimer
                key={timerKey}
                isPlaying={!locked}
                duration={SECONDS_PER_Q}
                size={44}
                strokeWidth={4}
                trailColor="#f5f5f4"
                colors={['#10b981', '#f59e0b', '#ef4444']}
                colorsTime={[SECONDS_PER_Q, SECONDS_PER_Q / 2, 0]}
                onComplete={() => {
                  if (!locked) reveal(null, 0)
                  return { shouldRepeat: false }
                }}
              >
                {({ remainingTime }) => (
                  <span className="text-sm font-semibold tabular-nums text-stone-600">{remainingTime}</span>
                )}
              </CountdownCircleTimer>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 overflow-hidden rounded-full bg-stone-100">
            <motion.div
              className="h-full bg-emerald-500"
              initial={false}
              animate={{ width: `${((index + (locked ? 1 : 0)) / questions.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-stone-200 bg-white/80 p-6 backdrop-blur"
            >
              <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs lowercase text-emerald-700">
                {current.category}
              </span>
              <h2 className="mb-5 mt-3 text-lg font-medium leading-snug text-stone-900">{current.question}</h2>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {current.options.map((option) => {
                  const isCorrect = option === current.correctAnswer
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
                      onClick={() => reveal(option, 0)}
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
                      <span>{option}</span>
                      {state === 'correct' && <FaCheck className="shrink-0 text-emerald-600" aria-hidden />}
                      {state === 'wrong' && <FaTimes className="shrink-0 text-rose-500" aria-hidden />}
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {locked && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="sticky bottom-3 z-10 rounded-2xl border border-stone-200 bg-white/95 p-5 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] backdrop-blur"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p
                      className={`mb-1 text-sm font-medium ${
                        timedOut
                          ? 'text-amber-700'
                          : selected === current.correctAnswer
                            ? 'text-emerald-700'
                            : 'text-rose-700'
                      }`}
                    >
                      {timedOut
                        ? `Time's up — the answer is ${current.correctAnswer}.`
                        : selected === current.correctAnswer
                          ? 'Correct.'
                          : `Not quite — the answer is ${current.correctAnswer}.`}
                    </p>
                    <p className="text-sm leading-relaxed text-stone-600">{current.explanation}</p>
                    <p className="mt-2 text-sm leading-relaxed text-stone-500">{current.culturalContext}</p>
                  </div>
                  <motion.button
                    type="button"
                    onClick={next}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
                  >
                    {index < questions.length - 1 ? 'next question' : 'see results'}
                    <FaArrowRight className="text-xs" aria-hidden />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {phase === 'finished' && (
        <ResultsScreen
          accuracy={accuracy}
          xpGained={xpGained}
          stats={[
            { label: 'correct', value: `${correctCount}/${questions.length}` },
            { label: 'best streak', value: bestStreak },
            { label: 'points', value: score },
          ]}
          onPlayAgain={start}
        />
      )}
    </GameChrome>
  )
}
