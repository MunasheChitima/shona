/**
 * Curriculum expansion from plans/CURRICULUM_GAP_ANALYSIS.md:
 * - Inserts 8 grammar lessons (ids lesson-g1 … lesson-g8) preserving lesson-1…52 IDs.
 * - Adds 2 sentence-level multiple-choice exercises per existing lesson.
 * - Updates metadata (60 lessons, unit lesson lists, difficulty blurbs).
 *
 * Run from shona-learn: node scripts/apply-curriculum-grammar-expansion.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

function loadJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function saveJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function shuffleOptions(correct, distractors) {
  const opts = [correct, ...distractors].filter(Boolean)
  const seen = new Set()
  const out = []
  for (const o of opts) {
    if (seen.has(o)) continue
    seen.add(o)
    out.push(o)
  }
  while (out.length < 4) out.push(`(option ${out.length})`)
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out.slice(0, 4)
}

function mcExercise({
  id,
  question,
  correctAnswer,
  options,
  points = 12,
  difficulty = 'medium',
  culturalNote = '',
  audioText,
  pronunciation,
}) {
  return {
    id,
    type: 'multiple_choice',
    question,
    correctAnswer,
    options,
    points,
    explanation: {
      correct: 'Well done — this is natural Shona in context.',
      incorrect: 'Listen for how people actually reply in conversation and try again.',
    },
    retryHint: 'Think about the situation, not just isolated words.',
    difficulty,
    culturalNote: culturalNote || undefined,
    audioText,
    pronunciation,
  }
}

function pronExercise({
  id,
  question,
  targetWord,
  pronunciation,
  points = 14,
  audioFile = '',
  englishPhrase,
  englishAnchor,
}) {
  return {
    id,
    type: 'pronunciation',
    question,
    targetWord,
    pronunciation,
    phonetic: '',
    points,
    audioFile,
    explanation: {
      correct: `Good work on "${targetWord}".`,
      incorrect: `Keep practising "${targetWord}".`,
    },
    retryHint: 'Say it in one smooth phrase.',
    difficulty: 'medium',
    englishPhrase: englishPhrase || undefined,
    englishAnchor: englishAnchor || undefined,
  }
}

/** @param {any} lesson */
function supplementExercisesForLesson(lesson) {
  const m = /^lesson-(\d+)$/.exec(lesson.id || '')
  if (!m) return
  if ((lesson.exercises || []).some((e) => String(e.id || '').includes('-sup-'))) return
  const num = parseInt(m[1], 10)
  const cat = lesson.category || ''
  const um = /Unit (\d+):/.exec(cat)
  const unit = um ? parseInt(um[1], 10) : 1
  const vocab = lesson.vocabulary || []
  const first = vocab[0] || { shona: 'mhoro', english: 'hello' }
  const second = vocab[1] || first
  const third = vocab[2] || first

  const extra = []

  if (unit <= 2) {
    const dialogues = [
      {
        question: 'Complete the exchange. A: "Mhoro! Makadii?" B:',
        correct: 'Ndiripo, makadiiwo?',
        wrong: ['Kwete, hapana chimwe', 'Hongu, ndakatsanya', 'Handizivi zvakawanda'],
      },
      {
        question: 'Someone greets you with "Mhoroi, mai." What fits best?',
        correct: 'Mhoroi, makadii?',
        wrong: ['Kwete', 'Regai ndiende', 'Hapana zvokudya'],
      },
      {
        question: 'A friend says "Wakadii?" You answer:',
        correct: 'Ndiripo, iwewe?',
        wrong: ['Potsi', 'Muvhuro', 'Gumi'],
      },
    ]
    const d = dialogues[num % dialogues.length]
    extra.push(
      mcExercise({
        id: `ex-${num}-sup-a`,
        question: d.question,
        correctAnswer: d.correct,
        options: shuffleOptions(d.correct, d.wrong),
        difficulty: 'easy',
        culturalNote: 'Greetings open almost every interaction in Shona.',
      })
    )

    extra.push(
      mcExercise({
        id: `ex-${num}-sup-b`,
        question: `You want to connect what you learned. Which phrase links "${first.shona}" to a full reply?`,
        correctAnswer: first.example || `${first.shona}, ndiripo.`,
        options: shuffleOptions(first.example || `${first.shona}, ndiripo.`, [
          `${second.shona} chete`,
          `${third.shona} ndakapera`,
          'Kwete zvose',
        ]),
        difficulty: 'easy',
      })
    )
  } else if (unit <= 5) {
    extra.push(
      mcExercise({
        id: `ex-${num}-sup-a`,
        question: `You are at the market. Which sentence uses "${first.shona}" the way a learner would say "I want ${first.english}"?`,
        correctAnswer: `Ndinoda ${first.shona}.`,
        options: shuffleOptions(`Ndinoda ${first.shona}.`, [
          `Ndiri ${first.shona}.`,
          `Ndaka${first.shona}.`,
          `Munoda ${first.shona}?`,
        ]),
        difficulty: 'medium',
      })
    )
    extra.push(
      mcExercise({
        id: `ex-${num}-sup-b`,
        question: 'Put the idea together: "I am going" + something you learned. Which sounds most natural?',
        correctAnswer: `Ndiri kuenda ku${first.shona}.`,
        options: shuffleOptions(`Ndiri kuenda ku${first.shona}.`, [
          `Ndinoda kuenda ${first.shona}.`,
          `Handidi kuenda ${first.shona}.`,
          `Ndakaenda ${first.shona}.`,
        ]),
        difficulty: 'medium',
      })
    )
  } else if (unit <= 7) {
    const sv = second.shona || 'kubika'
    const progressive =
      String(sv).startsWith('ku') ? `Ndiri ${sv}` : `Ndiri ku${sv.replace(/^ku/, '')}`
    extra.push(
      mcExercise({
        id: `ex-${num}-sup-a`,
        question: `Which phrase means **I am …-ing** with "${sv}" (${second.english || 'action'})?`,
        correctAnswer: progressive,
        options: shuffleOptions(progressive, [
          `Ndinoda ${sv}.`,
          'Ndiri kuenda zvino.',
          `Handidi ${sv}.`,
        ]),
        difficulty: 'medium',
      })
    )
    extra.push(
      mcExercise({
        id: `ex-${num}-sup-b`,
        question: 'Choose the best translation for: "I was cooking (completed action)."',
        correctAnswer: 'Ndakabika.',
        options: shuffleOptions('Ndakabika.', ['Ndiri kubika.', 'Ndichabika.', 'Handidi kubika.']),
        difficulty: 'medium',
      })
    )
  } else {
    extra.push(
      mcExercise({
        id: `ex-${num}-sup-a`,
        question: `You are sharing culture. Someone mentions "${first.shona}". What is a respectful follow-up?`,
        correctAnswer: `Ko ${first.shona} zvinorevei?`,
        options: shuffleOptions(`Ko ${first.shona} zvinorevei?`, [
          'Hameno chete',
          'Kwete, regai',
          'Ndapedza',
        ]),
        difficulty: 'medium',
        culturalNote: 'Showing curiosity about cultural words builds trust.',
      })
    )
    extra.push(
      mcExercise({
        id: `ex-${num}-sup-b`,
        question: `In context, "${second.english}" (${second.shona}) is best used when:`,
        correctAnswer: 'You are honouring the setting and people present.',
        options: shuffleOptions('You are honouring the setting and people present.', [
          'You want to end the conversation immediately.',
          'You only write it, never say it aloud.',
          'It replaces every greeting.',
        ]),
        difficulty: 'easy',
      })
    )
  }

  lesson.exercises = [...(lesson.exercises || []), ...extra]
}

const ORDER_INDEX_BY_ID = (() => {
  const map = {}
  let o = 1
  for (let i = 1; i <= 4; i++) map[`lesson-${i}`] = o++
  map['lesson-g1'] = o++
  for (let i = 5; i <= 8; i++) map[`lesson-${i}`] = o++
  map['lesson-g2'] = o++
  for (let i = 9; i <= 16; i++) map[`lesson-${i}`] = o++
  map['lesson-g7'] = o++
  for (let i = 17; i <= 23; i++) map[`lesson-${i}`] = o++
  map['lesson-g3'] = o++
  map[`lesson-24`] = o++
  map['lesson-g4'] = o++
  for (let i = 25; i <= 28; i++) map[`lesson-${i}`] = o++
  map['lesson-g5'] = o++
  map['lesson-g6'] = o++
  map['lesson-g8'] = o++
  for (let i = 29; i <= 52; i++) map[`lesson-${i}`] = o++
  return map
})()

function grammarLessonDefs() {
  const base = (unitCat, questId, emoji, gradient) => ({
    category: unitCat,
    questId,
    emoji,
    level: unitCat.includes('Unit 7') ? 'intermediate' : 'beginner',
    difficulty: 'medium',
    xpReward: 65,
    estimatedDuration: 15,
    colorScheme: {
      primary: '#0d9488',
      secondary: '#5eead4',
      gradient,
    },
  })

  return [
    {
      id: 'lesson-g1',
      title: 'Ndinoda... — I Want...',
      description:
        'The breakthrough pattern: subject prefix + verb stem for "want". Turns vocabulary into real sentences.',
      learningObjectives: [
        'Use ndi-, u-, a-, ti-, mu-, va- with -noda (want)',
        'Say what you, family, or friends want in short sentences',
        'Hear how one pattern unlocks hundreds of future sentences',
      ],
      discoveryElements: ['Subject prefixes are the skeleton of Shona sentences'],
      culturalNotes: [
        'Asking what someone wants politely opens market and home conversations',
        'Children learn these patterns early through family routines',
      ],
      ...base('Unit 1: First Words', 'quest-first-words', '🧱', 'from-teal-400 to-teal-600'),
      vocabulary: [
        {
          shona: 'Ndinoda',
          english: 'I want',
          pronunciation: 'n-dee-NOH-dah',
          phonetic: '',
          syllables: '',
          tonePattern: '',
          audioFile: '',
          usage: 'Prefix ndi- (I) + -noda',
          example: 'Ndinoda mvura.',
          culturalContext: '',
          englishAnchor: 'Say "ndee" — like "indeed" without the second syllable — then "NO" + "dah".',
          pronounceDifficulty: 'medium',
          soundGuideLinks: ['nd'],
        },
        {
          shona: 'Unoda',
          english: 'You want (singular)',
          pronunciation: 'oo-NOH-dah',
          phonetic: '',
          syllables: '',
          tonePattern: '',
          audioFile: '',
          usage: 'Prefix u- (you sg.) + -noda',
          example: 'Unoda sadza here?',
          culturalContext: '',
          englishAnchor: '"oo" as in h**oo**k; even rhythm on syllables.',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'Anoda',
          english: 'He / she wants',
          pronunciation: 'ah-NOH-dah',
          phonetic: '',
          syllables: '',
          tonePattern: '',
          audioFile: '',
          usage: 'Prefix a- (class 1 he/she) + -noda',
          example: 'Anoda kubasa.',
          culturalContext: '',
          englishAnchor: 'Start on open "ah", keep vowels clear.',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'Tinoda',
          english: 'We want',
          pronunciation: 'tee-NOH-dah',
          phonetic: '',
          syllables: '',
          tonePattern: '',
          audioFile: '',
          usage: 'Prefix ti- (we) + -noda',
          example: 'Tinoda kudya.',
          culturalContext: '',
          englishAnchor: '"tee" as in s**ee** with t at front.',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'Munoda',
          english: 'You want (plural / polite)',
          pronunciation: 'moo-NOH-dah',
          phonetic: '',
          syllables: '',
          tonePattern: '',
          audioFile: '',
          usage: 'Prefix mu- (you pl.) + -noda',
          example: 'Munoda mvura here?',
          culturalContext: '',
          englishAnchor: '"moo" rounded vowel, then NO-dah.',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'Vanoda',
          english: 'They want',
          pronunciation: 'vah-NOH-dah',
          phonetic: '',
          syllables: '',
          tonePattern: '',
          audioFile: '',
          usage: 'Prefix va- (they) + -noda',
          example: 'Vanoda kusvika nhasi.',
          culturalContext: '',
          englishAnchor: '"vah" — light v, clear vowels.',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
      ],
      exercises: [
        mcExercise({
          id: 'ex-g1-1',
          question: 'Which form means **I want**?',
          correctAnswer: 'Ndinoda',
          options: shuffleOptions('Ndinoda', ['Unoda', 'Tinoda', 'Vanoda']),
        }),
        mcExercise({
          id: 'ex-g1-2',
          question: 'Your friend (one person) wants something. Which verb fits **you want**?',
          correctAnswer: 'Unoda',
          options: shuffleOptions('Unoda', ['Munoda', 'Ndinoda', 'Vanoda']),
        }),
        mcExercise({
          id: 'ex-g1-3',
          question: 'Complete: **We** want water →',
          correctAnswer: 'Tinoda mvura.',
          options: shuffleOptions('Tinoda mvura.', ['Vanoda mvura.', 'Munoda mvura.', 'Anoda mvura.']),
        }),
        pronExercise({
          id: 'ex-g1-4',
          question: "Practice saying 'Ndinoda' (I want)",
          targetWord: 'Ndinoda',
          pronunciation: 'n-dee-NOH-dah',
          englishPhrase: 'I want',
          englishAnchor: 'Prenasal "nd" at the start — no extra vowel before it.',
        }),
        mcExercise({
          id: 'ex-g1-5',
          question: 'Which sentence uses the pattern correctly for **they want** sadza?',
          correctAnswer: 'Vanoda sadza.',
          options: shuffleOptions('Vanoda sadza.', ['Anoda sadza.', 'Tinoda sadza here?', 'Unoda sadza ko?']),
        }),
        mcExercise({
          id: 'ex-g1-6',
          question: 'Translate to Shona (pick the closest): **Does he want to work?**',
          correctAnswer: 'Anoda kubasa here?',
          options: shuffleOptions('Anoda kubasa here?', [
            'Unoda kubasa here?',
            'Ndinoda kubasa?',
            'Vanoda musika here?',
          ]),
        }),
      ],
    },
    {
      id: 'lesson-g2',
      title: 'Yangu, Yako, Yake — Mine, Yours, Theirs',
      description: 'Possessives after the words you already know: my family, your house, their children.',
      learningObjectives: [
        'Use -angu, -ako, -ake, -edu, -enyu, -avo with people and things',
        'Match **y-** and **r-** agreement in simple phrases',
        'Talk about what belongs to whom in one short phrase',
      ],
      discoveryElements: ['Possessive endings glue people and things together'],
      culturalNotes: ['Family and home words sound warmer with possessives — mhuri yangu feels like home'],
      ...base('Unit 2: People Around You', 'quest-people', '🤲', 'from-pink-400 to-rose-600'),
      vocabulary: [
        {
          shona: 'mhuri yangu',
          english: 'my family',
          pronunciation: 'MHOO-ree YAH-ngoo',
          audioFile: '',
          usage: 'Class 9 agreement (yi- → y-)',
          example: 'Mhuri yangu yakakura.',
          englishAnchor: 'Two words: family + MY — link with "y" not "r".',
          pronounceDifficulty: 'hard',
          soundGuideLinks: ['mh'],
        },
        {
          shona: 'imba yako',
          english: 'your house',
          pronunciation: 'EEM-bah YAH-koh',
          audioFile: '',
          usage: 'Class 9',
          example: 'Imba yako yakachena.',
          englishAnchor: 'Yako = yours (singular you).',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'zita rangu',
          english: 'my name',
          pronunciation: 'ZEE-tah RAH-ngoo',
          audioFile: '',
          usage: 'Class 5 uses **r-**',
          example: 'Zita rangu ndinonzi Tariro.',
          englishAnchor: '"Rangu" with tapped /r/.',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'baba vangu',
          english: 'my father',
          pronunciation: 'BAH-bah VAH-ngoo',
          audioFile: '',
          usage: 'Class 1a plural agreement **v-**',
          example: 'Baba vangu vari kumba.',
          englishAnchor: '"Vangu" — lips for v, then vowels.',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'vana venyu',
          english: 'your (pl.) children',
          pronunciation: 'VAH-nah VEH-nyoo',
          audioFile: '',
          usage: 'Respectful plural',
          example: 'Vana venyu vakasimba.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'motokari yavo',
          english: 'their car',
          pronunciation: 'moh-toh-KAH-ree YAH-voh',
          audioFile: '',
          usage: 'Class 9 + plural possessor',
          example: 'Motokari yavo iri ipi?',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
      ],
      exercises: [
        mcExercise({
          id: 'ex-g2-1',
          question: 'How do you say **my family**?',
          correctAnswer: 'mhuri yangu',
          options: shuffleOptions('mhuri yangu', ['mhuri yako', 'mhuri yake', 'mhuri yedu']),
        }),
        mcExercise({
          id: 'ex-g2-2',
          question: 'Which phrase means **your house** (talking to one friend)?',
          correctAnswer: 'imba yako',
          options: shuffleOptions('imba yako', ['imba yangu', 'imba yake', 'imba yavo']),
        }),
        mcExercise({
          id: 'ex-g2-3',
          question: '**My name** uses class 5 agreement. Pick the correct form:',
          correctAnswer: 'zita rangu',
          options: shuffleOptions('zita rangu', ['zita yangu', 'zita vangu', 'zita rwangu']),
        }),
        pronExercise({
          id: 'ex-g2-4',
          question: "Practice 'mhuri yangu' (my family)",
          targetWord: 'mhuri yangu',
          pronunciation: 'MHOO-ree YAH-ngoo',
          englishPhrase: 'my family',
          englishAnchor: 'Breathy "mh" then clear vowels.',
        }),
        mcExercise({
          id: 'ex-g2-5',
          question: '**Their car** (agreement with motokari)?',
          correctAnswer: 'motokari yavo',
          options: shuffleOptions('motokari yavo', ['motokari yake', 'motokari yedu', 'motokari yako']),
        }),
        mcExercise({
          id: 'ex-g2-6',
          question: 'Translate: **your (pl.) children**',
          correctAnswer: 'vana venyu',
          options: shuffleOptions('vana venyu', ['vana vangu', 'vana vake', 'vana vavo']),
        }),
      ],
    },
    {
      id: 'lesson-g7',
      title: 'Zvakanaka neZvakaipa — Good and Bad',
      description: 'Essential adjectives and short descriptions so you can react, praise, and warn.',
      learningObjectives: [
        'Describe things as good, bad, big, small, new',
        'Use zvakanaka / zvakaipa in everyday reactions',
        'Pair adjectives with nouns you already studied',
      ],
      discoveryElements: ['Description turns word lists into opinions'],
      culturalNotes: ['Zvakanaka is a universal “alright / good” in daily talk'],
      ...base('Unit 4: Daily Life', 'quest-daily-life', '✨', 'from-yellow-400 to-amber-600'),
      vocabulary: [
        {
          shona: '-kuru',
          english: 'big / important',
          pronunciation: 'KOO-roo',
          audioFile: '',
          usage: 'Adjective stem',
          example: 'Imba hombe / chinhu chikuru.',
          englishAnchor: '',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: '-diki',
          english: 'small',
          pronunciation: 'DEE-kee',
          audioFile: '',
          usage: 'Opposite of -kuru in size',
          example: 'Dende radiki.',
          englishAnchor: '',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: '-naka',
          english: 'good / beautiful',
          pronunciation: 'NAH-kah',
          audioFile: '',
          usage: 'Very common stem',
          example: 'Sadza rinaka.',
          englishAnchor: '',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: '-ipa',
          english: 'bad / ugly',
          pronunciation: 'EE-pah',
          audioFile: '',
          usage: '',
          example: 'Zvinhu zvakaipa.',
          englishAnchor: '',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'zvakanaka',
          english: 'good / alright / fine',
          pronunciation: 'zvah-kah-NAH-kah',
          audioFile: '',
          usage: 'Phrase / adverbial',
          example: 'Zvakanaka, tatenda.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: ['zv'],
        },
        {
          shona: '-tsva',
          english: 'new',
          pronunciation: 'TSvah',
          audioFile: '',
          usage: '',
          example: 'Bhuku ritsva.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: ['ts'],
        },
      ],
      exercises: [
        mcExercise({
          id: 'ex-g7-1',
          question: 'Which describes **good sadza**?',
          correctAnswer: 'Sadza rinaka.',
          options: shuffleOptions('Sadza rinaka.', ['Sadza riipa.', 'Sadza ridiki.', 'Sadza richinyoro']),
        }),
        mcExercise({
          id: 'ex-g7-2',
          question: 'Someone asks **Makadii?** You feel fine. A natural reply:',
          correctAnswer: 'Zvakanaka.',
          options: shuffleOptions('Zvakanaka.', ['Zvakaipa.', 'Hapana.', 'Kwete zvose']),
        }),
        pronExercise({
          id: 'ex-g7-3',
          question: "Say 'zvakanaka' (good / alright)",
          targetWord: 'zvakanaka',
          pronunciation: 'zvah-kah-NAH-kah',
          englishPhrase: 'alright / good',
          englishAnchor: 'Whistled zv cluster — see Sound Guide.',
        }),
        mcExercise({
          id: 'ex-g7-4',
          question: '**Small plate** — pick the best short phrase:',
          correctAnswer: 'Dende radiki.',
          options: shuffleOptions('Dende radiki.', ['Dende rakuru.', 'Dende rinaka.', 'Dende ratsva.']),
        }),
        mcExercise({
          id: 'ex-g7-5',
          question: 'Which expresses something **bad** about things (zv- class)?',
          correctAnswer: 'Zvinhu zvakaipa.',
          options: shuffleOptions('Zvinhu zvakaipa.', [
            'Zvinhu zvakanaka.',
            'Zvinhu zvikuru.',
            'Zvinhu zvitsva.',
          ]),
        }),
        mcExercise({
          id: 'ex-g7-6',
          question: '**New book** (bhuku, class 5 pattern learners often hear):',
          correctAnswer: 'Bhuku ritsva.',
          options: shuffleOptions('Bhuku ritsva.', ['Bhuku rikuru.', 'Bhuku rinopa.', 'Bhuku rose']),
        }),
      ],
    },
    {
      id: 'lesson-g3',
      title: 'Ndiri Ku... — I Am Doing...',
      description: 'Present progressive: **ndiri ku-** + verb — what is happening right now.',
      learningObjectives: [
        'Say ndiri kuenda, ndiri kudya, ndiri kutaura',
        'Contrast with simple "I want" vs "I am currently doing"',
        'Ask what someone is doing now',
      ],
      discoveryElements: ['**ri ku** sits between person and action'],
      culturalNotes: ['Describing what you are busy with is polite small talk'],
      ...base('Unit 6: Doing Things', 'quest-actions', '⏳', 'from-red-400 to-orange-500'),
      vocabulary: [
        {
          shona: 'Ndiri kuenda',
          english: 'I am going',
          pronunciation: 'n-DEE-ree koo-EN-dah',
          audioFile: '',
          usage: 'Progressive',
          example: 'Ndiri kuenda kumusika.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: ['nd'],
        },
        {
          shona: 'Uri kudya',
          english: 'You are eating',
          pronunciation: 'OO-ree koo-DYAH',
          audioFile: '',
          usage: '',
          example: 'Uri kudya sadza?',
          englishAnchor: '',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'Ndiri kubika',
          english: 'I am cooking',
          pronunciation: 'n-DEE-ree koo-BEE-kah',
          audioFile: '',
          usage: '',
          example: 'Ndiri kubika manheru.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'Ndiri kutaura',
          english: 'I am speaking',
          pronunciation: 'n-DEE-ree koo-TAH-oo-rah',
          audioFile: '',
          usage: '',
          example: 'Ndiri kutaura nemhamha.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'Muri kuitei?',
          english: 'What are you (pl.) doing?',
          pronunciation: 'MOO-ree koo-ee-TEH-ee',
          audioFile: '',
          usage: 'Common question',
          example: 'Muri kuitei ikoko?',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'Ndiri kudzidza',
          english: 'I am learning / studying',
          pronunciation: 'n-DEE-ree koo-JEED-zah',
          audioFile: '',
          usage: '',
          example: 'Ndiri kudzidza chiShona.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: ['dz'],
        },
      ],
      exercises: [
        mcExercise({
          id: 'ex-g3-1',
          question: '**I am going** — pick the Shona:',
          correctAnswer: 'Ndiri kuenda',
          options: shuffleOptions('Ndiri kuenda', ['Ndinoda kuenda', 'Ndakaenda', 'Ndichaenda']),
        }),
        mcExercise({
          id: 'ex-g3-2',
          question: '**You are eating** (one person)?',
          correctAnswer: 'Uri kudya',
          options: shuffleOptions('Uri kudya', ['Uri kuenda', 'Wakadya', 'Unodya']),
        }),
        pronExercise({
          id: 'ex-g3-3',
          question: "Practice 'Ndiri kubika' (I am cooking)",
          targetWord: 'Ndiri kubika',
          pronunciation: 'n-DEE-ree koo-BEE-kah',
          englishPhrase: 'I am cooking',
        }),
        mcExercise({
          id: 'ex-g3-4',
          question: 'Translate: **I am speaking now**',
          correctAnswer: 'Ndiri kutaura zvino.',
          options: shuffleOptions('Ndiri kutaura zvino.', [
            'Ndino kutaura zvino.',
            'Ndinoda kutaura zvino.',
            'Ndakataura zvino.',
          ]),
        }),
        mcExercise({
          id: 'ex-g3-5',
          question: 'Which asks **What are you doing?** (plural / group)?',
          correctAnswer: 'Muri kuitei?',
          options: shuffleOptions('Muri kuitei?', ['Uri kuitei?', 'Ndiri kuitei?', 'Vanokuitei?']),
        }),
        mcExercise({
          id: 'ex-g3-6',
          question: '**I am learning Shona** — closest match:',
          correctAnswer: 'Ndiri kudzidza chiShona.',
          options: shuffleOptions('Ndiri kudzidza chiShona.', [
            'Ndinoda chiShona.',
            'Ndicha dzidza chiShona.',
            'Handidi chiShona.',
          ]),
        }),
      ],
    },
    {
      id: 'lesson-g4',
      title: 'Handidi — I Don\'t Want',
      description: 'Negation with **ha-** + adjusted prefix: say what you do not want or do.',
      learningObjectives: [
        'Form handidi, haudi, hatidi with known verbs',
        'Recognise the h- pattern for “not” with people you talk about',
        'Use handizive naturally as “I don’t know”',
      ],
      discoveryElements: ['Negation remakes the subject marker — not just “kwete”'],
      culturalNotes: ['Softening refusals with please/thank-you still matters culturally'],
      ...base('Unit 6: Doing Things', 'quest-actions', '🚫', 'from-red-500 to-rose-600'),
      vocabulary: [
        {
          shona: 'Handidi',
          english: "I don't want",
          pronunciation: 'hahn-DEE-dee',
          audioFile: '',
          usage: '',
          example: 'Handidi mvura yemvura.',
          englishAnchor: '',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'Haudi',
          english: "You don't want",
          pronunciation: 'how-DEE-dee',
          audioFile: '',
          usage: 'Negation with u- (you)',
          example: 'Haudichada izvi.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'Hatidi',
          english: "We don't want",
          pronunciation: 'hah-TEE-dee',
          audioFile: '',
          usage: '',
          example: 'Hatidi kurwadzisana.',
          englishAnchor: '',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'Handinoenda',
          english: "I don't go / I'm not going (habitual pattern)",
          pronunciation: 'hahn-dee-NOH-en-dah',
          audioFile: '',
          usage: 'Shows ha- + negative verb shape',
          example: 'Handinoenda kuHarare.',
          englishAnchor: '',
          pronounceDifficulty: 'hard',
          soundGuideLinks: ['nd'],
        },
        {
          shona: 'Handizive',
          english: "I don't know",
          pronunciation: 'hahn-dee-ZEE-veh',
          audioFile: '',
          usage: '',
          example: 'Handizive nzira.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: ['dz'],
        },
        {
          shona: 'Haagoni',
          english: "He / she can't",
          pronunciation: 'hah-ah-GOH-nee',
          audioFile: '',
          usage: '',
          example: 'Haagoni kuimba.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
      ],
      exercises: [
        mcExercise({
          id: 'ex-g4-1',
          question: "**I don't want** — which form?",
          correctAnswer: 'Handidi',
          options: shuffleOptions('Handidi', ['Ndinoda', 'Hatidi', 'Handizive']),
        }),
        mcExercise({
          id: 'ex-g4-2',
          question: "**We don't want** trouble — pick Shona:",
          correctAnswer: 'Hatidi dambudziko.',
          options: shuffleOptions('Hatidi dambudziko.', [
            'Handidi dambudziko.',
            'Vanoda dambudziko.',
            'Tinoda dambudziko.',
          ]),
        }),
        pronExercise({
          id: 'ex-g4-3',
          question: "Practice 'Handizive' (I don't know)",
          targetWord: 'Handizive',
          pronunciation: 'hahn-dee-ZEE-veh',
          englishPhrase: "I don't know",
        }),
        mcExercise({
          id: 'ex-g4-4',
          question: '**You (sg.) don’t want** — learner form:',
          correctAnswer: 'Haudi',
          options: shuffleOptions('Haudi', ['Handidi', 'Hatidi', 'Hamudi']),
        }),
        mcExercise({
          id: 'ex-g4-5',
          question: '**He can’t sing** — pick closest:',
          correctAnswer: 'Haagoni kuimba.',
          options: shuffleOptions('Haagoni kuimba.', [
            'Anogona kuimba.',
            'Handidi kuimba.',
            'Ndiri kuimba.',
          ]),
        }),
        mcExercise({
          id: 'ex-g4-6',
          question: 'When lost, a humble phrase:**I don’t know the way**',
          correctAnswer: 'Handizive nzira.',
          options: shuffleOptions('Handizive nzira.', [
            'Ndinonzvino nzira.',
            'Nzira iripi?',
            'Regai ndiende.',
          ]),
        }),
      ],
    },
    {
      id: 'lesson-g5',
      title: 'Ndaka... — I Did...',
      description: 'Past tense with **-ka-**: completed actions you can finally narrate.',
      learningObjectives: [
        'Use ndaka-, waka-, vaka- with verbs you already studied',
        'Tell short stories: I went, I ate, I saw',
        'Distinguish “did” from “am doing”',
      ],
      discoveryElements: ['The -ka- slot sits after the subject marker'],
      culturalNotes: ['Sharing what you did today is everyday politeness'],
      ...base('Unit 7: Expressing Yourself', 'quest-expression', '📜', 'from-indigo-400 to-violet-600'),
      vocabulary: [
        {
          shona: 'Ndakaenda',
          english: 'I went',
          pronunciation: 'n-DAH-kah-EN-dah',
          audioFile: '',
          usage: '',
          example: 'Ndakaenda kuchikoro.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: ['nd'],
        },
        {
          shona: 'Wakadya',
          english: 'You ate',
          pronunciation: 'WAH-kah-JAH',
          audioFile: '',
          usage: '',
          example: 'Wakadya sadza?',
          englishAnchor: '',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'Ndakaona',
          english: 'I saw',
          pronunciation: 'n-DAH-kah-OH-nah',
          audioFile: '',
          usage: '',
          example: 'Ndakaona shamwari.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'Ndakarara',
          english: 'I slept',
          pronunciation: 'n-DAH-kah-RAH-rah',
          audioFile: '',
          usage: '',
          example: 'Ndakarara musi wenyoro.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: ['rr'],
        },
        {
          shona: 'Takaita sei?',
          english: 'How did we do?',
          pronunciation: 'tah-KAH-ee-tah SAY',
          audioFile: '',
          usage: '',
          example: 'Takaita sei nhasi?',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'Vakabva',
          english: 'They came / left (arrived-from / departed)',
          pronunciation: 'vah-kah-BVAH',
          audioFile: '',
          usage: '',
          example: 'Vakabva kuUK.',
          englishAnchor: '',
          pronounceDifficulty: 'hard',
          soundGuideLinks: ['bv'],
        },
      ],
      exercises: [
        mcExercise({
          id: 'ex-g5-1',
          question: '**I went** to school:',
          correctAnswer: 'Ndakaenda kuchikoro.',
          options: shuffleOptions('Ndakaenda kuchikoro.', [
            'Ndiri kuenda kuchikoro.',
            'Ndichaenda kuchikoro.',
            'Ndinoda kuchikoro.',
          ]),
        }),
        mcExercise({
          id: 'ex-g5-2',
          question: '**You ate** sadza?',
          correctAnswer: 'Wakadya sadza?',
          options: shuffleOptions('Wakadya sadza?', ['Uri kudya sadza?', 'Unodyi sadza?', 'Ndakadya sadza?']),
        }),
        pronExercise({
          id: 'ex-g5-3',
          question: "Practice 'Ndakaona' (I saw)",
          targetWord: 'Ndakaona',
          pronunciation: 'n-DAH-kah-OH-nah',
          englishPhrase: 'I saw',
        }),
        mcExercise({
          id: 'ex-g5-4',
          question: '**I slept** — pick the verb:',
          correctAnswer: 'Ndakarara',
          options: shuffleOptions('Ndakarara', ['Ndirara', 'Ndicharara', 'Ndakarwara']),
        }),
        mcExercise({
          id: 'ex-g5-5',
          question: 'They **left from** the UK — common learner form:',
          correctAnswer: 'Vakabva kuUK.',
          options: shuffleOptions('Vakabva kuUK.', ['Vabva kuUK.', 'Vachabva kuUK.', 'Vari kuUK.']),
        }),
        mcExercise({
          id: 'ex-g5-6',
          question: 'Not progressive — which is **past completed**?',
          correctAnswer: 'Ndakabika.',
          options: shuffleOptions('Ndakabika.', ['Ndiri kubika.', 'Ndichabika.', 'Ndinoda kubika.']),
        }),
      ],
    },
    {
      id: 'lesson-g6',
      title: 'Ndicha... — I Will...',
      description: 'Future with **-cha-**: plans, promises, and what happens next.',
      learningObjectives: [
        'Say ndichaenda, ndichadya, ndichaita',
        'Contrast future with present and past you now know',
        'Make simple travel and food plans',
      ],
      discoveryElements: ['Future slot mirrors past but with -cha-'],
      culturalNotes: ['Saying what you will bring to a gathering is appreciated'],
      ...base('Unit 7: Expressing Yourself', 'quest-expression', '🔮', 'from-indigo-500 to-purple-700'),
      vocabulary: [
        {
          shona: 'Ndichaenda',
          english: 'I will go',
          pronunciation: 'n-DEE-chah-EN-dah',
          audioFile: '',
          usage: '',
          example: 'Ndichaenda mangwana.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: ['nd'],
        },
        {
          shona: 'Ndichadya',
          english: 'I will eat',
          pronunciation: 'n-DEE-chah-JAH',
          audioFile: '',
          usage: '',
          example: 'Ndichadya manheru.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'Ndichaita',
          english: 'I will do',
          pronunciation: 'n-DEE-CHAH-ee-tah',
          audioFile: '',
          usage: '',
          example: 'Ndichaita basa.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'Tichaonana',
          english: 'We will see each other',
          pronunciation: 'tee-chah-oh-NAH-nah',
          audioFile: '',
          usage: '',
          example: 'Tichaonana gare gazvikomo.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'Ndichauya',
          english: 'I will come',
          pronunciation: 'n-DEE-chah-OO-yah',
          audioFile: '',
          usage: '',
          example: 'Ndichauya nemusika.',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'Muchaona',
          english: 'You will see',
          pronunciation: 'moo-CHAH-oh-nah',
          audioFile: '',
          usage: '',
          example: 'Muchaona zvino.',
          englishAnchor: '',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
      ],
      exercises: [
        mcExercise({
          id: 'ex-g6-1',
          question: '**I will go** tomorrow:',
          correctAnswer: 'Ndichaenda mangwana.',
          options: shuffleOptions('Ndichaenda mangwana.', [
            'Ndakaenda mangwana.',
            'Ndiri kuenda mangwana.',
            'Ndinoda mangwana.',
          ]),
        }),
        mcExercise({
          id: 'ex-g6-2',
          question: '**I will eat** in the evening:',
          correctAnswer: 'Ndichadya manheru.',
          options: shuffleOptions('Ndichadya manheru.', [
            'Ndakadya manheru.',
            'Uri kudya manheru.',
            'Handidi manheru.',
          ]),
        }),
        pronExercise({
          id: 'ex-g6-3',
          question: "Practice 'Ndichaita' (I will do)",
          targetWord: 'Ndichaita',
          pronunciation: 'n-DEE-CHAH-ee-tah',
          englishPhrase: 'I will do',
        }),
        mcExercise({
          id: 'ex-g6-4',
          question: 'Friendly **we’ll see each other**:',
          correctAnswer: 'Tichaonana.',
          options: shuffleOptions('Tichaonana.', ['Tinoonana.', 'Takaonana.', 'Tiri kuonana.']),
        }),
        mcExercise({
          id: 'ex-g6-5',
          question: '**I will come** with bread:',
          correctAnswer: 'Ndichauya nechingwa.',
          options: shuffleOptions('Ndichauya nechingwa.', [
            'Ndakauya nechingwa.',
            'Ndiri kuuya nechingwa.',
            'Unouya nechingwa.',
          ]),
        }),
        mcExercise({
          id: 'ex-g6-6',
          question: 'Pick the **future** sentence:',
          correctAnswer: 'Muchaona mushure.',
          options: shuffleOptions('Muchaona mushure.', ['Makaona mushure.', 'Muri kuona mushure.', 'Hamuoni mushure.']),
        }),
      ],
    },
    {
      id: 'lesson-g8',
      title: 'Mibvunzo — Asking Questions',
      description: 'Move from isolated question words to real questions with verbs and people.',
      learningObjectives: [
        'Ask Uri kuenda kupi? Unoda chii? Unonzi ani?',
        'Keep Ko iwe? and Zviri sei? in your pocket',
        'Choose between chii, ani, kupi, riinhi in context',
      ],
      discoveryElements: ['Question words + verb + place/word for “what/where/who”'],
      culturalNotes: ['A soft tone when asking personal questions matters'],
      ...base('Unit 7: Expressing Yourself', 'quest-expression', '❓', 'from-indigo-400 to-blue-600'),
      vocabulary: [
        {
          shona: 'Uri kuenda kupi?',
          english: 'Where are you going?',
          pronunciation: 'OO-ree koo-EN-dah koo-PEE',
          audioFile: '',
          usage: '',
          example: 'Uri kuenda kupi ikozvino?',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: [],
        },
        {
          shona: 'Unoda chii?',
          english: 'What do you want?',
          pronunciation: 'oo-NOH-dah CHEE',
          audioFile: '',
          usage: '',
          example: 'Unoda chii kutenga?',
          englishAnchor: '',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'Unonzi ani?',
          english: 'What is your name? (lit. you are called who)',
          pronunciation: 'oo-NOH-nzee AH-nee',
          audioFile: '',
          usage: '',
          example: 'Unonzi ani, shamwari?',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: ['nz'],
        },
        {
          shona: 'Ko iwe?',
          english: 'And you? / What about you?',
          pronunciation: 'koh EE-weh',
          audioFile: '',
          usage: '',
          example: 'Ndiripo. Ko iwe?',
          englishAnchor: '',
          pronounceDifficulty: 'easy',
          soundGuideLinks: [],
        },
        {
          shona: 'Zviri sei?',
          english: "How's it going?",
          pronunciation: 'ZVEE-ree SAY',
          audioFile: '',
          usage: '',
          example: 'Shamwari, zviri sei?',
          englishAnchor: '',
          pronounceDifficulty: 'medium',
          soundGuideLinks: ['zv'],
        },
        {
          shona: 'Zvinhu zviri kuti ani?',
          english: 'Things are at whose place? (idiomatic stretch — who matters here)',
          pronunciation: 'zVEE-nhoo zvee-ree koo-tee AH-nee',
          audioFile: '',
          usage: 'Illustrates ani with zvinhu',
          example: 'Learn shorter first: Unonzi ani?',
          englishAnchor: '',
          pronounceDifficulty: 'hard',
          soundGuideLinks: ['nh', 'zv'],
        },
      ],
      exercises: [
        mcExercise({
          id: 'ex-g8-1',
          question: '**Where are you going?**',
          correctAnswer: 'Uri kuenda kupi?',
          options: shuffleOptions('Uri kuenda kupi?', ['Unoda kupi?', 'Uri ani?', 'Wakanga kuenda kupi?']),
        }),
        mcExercise({
          id: 'ex-g8-2',
          question: '**What do you want?**',
          correctAnswer: 'Unoda chii?',
          options: shuffleOptions('Unoda chii?', ['Unoda ani?', 'Uri kudya chii?', 'Unonzi chii?']),
        }),
        pronExercise({
          id: 'ex-g8-3',
          question: "Practice 'Ko iwe?' (And you?)",
          targetWord: 'Ko iwe?',
          pronunciation: 'koh EE-weh',
          englishPhrase: 'And you?',
        }),
        mcExercise({
          id: 'ex-g8-4',
          question: 'Casual **How’s it going?**',
          correctAnswer: 'Zviri sei?',
          options: shuffleOptions('Zviri sei?', ['Makadii?', 'Wakadii?', 'Uri kuenda sei?']),
        }),
        mcExercise({
          id: 'ex-g8-5',
          question: '**What is your name?** — common spoken form:',
          correctAnswer: 'Unonzi ani?',
          options: shuffleOptions('Unonzi ani?', ['Zita chii?', 'Unonzi kupi?', 'Iwe ndiani?']),
        }),
        mcExercise({
          id: 'ex-g8-6',
          question: 'You answer "Ndiripo" then bounce the greeting back:',
          correctAnswer: 'Ko iwe?',
          options: shuffleOptions('Ko iwe?', ['Kwete.', 'Hapana.', 'Ndapedza.']),
        }),
      ],
    },
  ]
}

function patchMetadata(data) {
  const m = data.metadata || {}
  m.version = '6.0.0'
  m.lastUpdated = new Date().toISOString()
  m.totalLessons = 60
  m.totalUnits = 13
  m.source = 'restructured_curriculum_v6_grammar'
  m.description =
    '60-lesson curriculum: 52 thematic lessons plus 8 grammar bridges (want, possessives, adjectives, aspect, negation, past, future, questions) with deeper exercises.'
  m.features = Array.from(
    new Set([
      ...(m.features || []),
      'grammar_bridge_lessons',
      'sentence_level_exercises',
    ])
  )

  const tc = m.topicCategories || {}
  tc['Unit 1: First Words'].lessons = ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-g1']
  tc['Unit 2: People Around You'].lessons = ['lesson-5', 'lesson-6', 'lesson-7', 'lesson-8', 'lesson-g2']
  tc['Unit 3: Numbers & Time'].lessons = ['lesson-9', 'lesson-10', 'lesson-11', 'lesson-12']
  tc['Unit 4: Daily Life'].lessons = ['lesson-13', 'lesson-14', 'lesson-15', 'lesson-16', 'lesson-g7']
  tc['Unit 5: Getting Around'].lessons = ['lesson-17', 'lesson-18', 'lesson-19', 'lesson-20']
  tc['Unit 6: Doing Things'].lessons = [
    'lesson-21',
    'lesson-22',
    'lesson-23',
    'lesson-g3',
    'lesson-24',
    'lesson-g4',
  ]
  tc['Unit 7: Expressing Yourself'].lessons = [
    'lesson-25',
    'lesson-26',
    'lesson-27',
    'lesson-28',
    'lesson-g5',
    'lesson-g6',
    'lesson-g8',
  ]
  tc['Unit 8: Culture & Traditions'].lessons = ['lesson-29', 'lesson-30', 'lesson-31', 'lesson-32']
  tc['Unit 9: Nature & Environment'].lessons = ['lesson-33', 'lesson-34', 'lesson-35', 'lesson-36']
  tc['Unit 10: Modern Life'].lessons = ['lesson-37', 'lesson-38', 'lesson-39', 'lesson-40']
  tc['Unit 11: Society & Governance'].lessons = ['lesson-41', 'lesson-42', 'lesson-43', 'lesson-44']
  tc['Unit 12: Complex Communication'].lessons = ['lesson-45', 'lesson-46', 'lesson-47', 'lesson-48']
  tc['Unit 13: Deeper Culture'].lessons = ['lesson-49', 'lesson-50', 'lesson-51', 'lesson-52']

  m.topicCategories = tc
  m.difficultyLevels = {
    beginner: {
      units: '1-6',
      lessons: 'orderIndex 1-29 (through Doing Things)',
    },
    intermediate: {
      units: '7-10',
      lessons: 'orderIndex 30-48',
    },
    advanced: {
      units: '11-13',
      lessons: 'orderIndex 49-60',
    },
  }
  data.metadata = m
}

function main() {
  const consolidatedPath = path.join(ROOT, 'content', 'lessons_consolidated.json')
  const lessonsJsonPath = path.join(ROOT, 'content', 'lessons.json')

  const data = loadJson(consolidatedPath)
  const grammar = grammarLessonDefs()
  const grammarIds = new Set(grammar.map((g) => g.id))

  const origLessons = (data.lessons || []).filter((l) => !grammarIds.has(l.id))

  for (const lesson of origLessons) {
    supplementExercisesForLesson(lesson)
  }

  const merged = [...origLessons, ...grammar]
  for (const lesson of merged) {
    const idx = ORDER_INDEX_BY_ID[lesson.id]
    if (idx !== undefined) lesson.orderIndex = idx
  }

  merged.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
  data.lessons = merged
  patchMetadata(data)

  saveJson(consolidatedPath, data)
  saveJson(lessonsJsonPath, data)
  console.log('Grammar expansion: 60 lessons written to lessons_consolidated.json and lessons.json')
}

main()