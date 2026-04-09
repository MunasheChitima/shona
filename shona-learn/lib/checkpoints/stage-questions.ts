import type { CheckpointQuestionData } from './score'

const BASE = [
  {
    listening: [
      {
        prompt: 'Which English meaning matches the Shona greeting "Mhoro"?',
        options: ['Goodbye', 'Hello', 'Thank you', 'Excuse me'],
        correctIndex: 1
      }
    ],
    speaking: [
      {
        prompt: 'How do you politely say "How are you?" in Shona (common form)?',
        options: ['Wakadii?', 'Mhoro', 'Maswerasei?', 'Ndapota'],
        correctIndex: 2
      }
    ],
    reading: [
      {
        prompt: '"Ndiripo" as a reply to "Makadii?" most often means:',
        options: ['I am fine / here', 'Goodbye', 'Please repeat', 'Wait'],
        correctIndex: 0
      }
    ],
    cultural: [
      {
        prompt: 'Greeting elders first in Shona communities is mainly about:',
        options: ['Showing respect (hunhu)', 'Saving time', 'Avoiding language practice', 'Showing wealth'],
        correctIndex: 0
      }
    ]
  },
  {
    listening: [
      {
        prompt: '"Mai" in most Shona family speech refers to:',
        options: ['Father', 'Mother', 'Child', 'Uncle'],
        correctIndex: 1
      }
    ],
    speaking: [
      {
        prompt: '"Sekuru" commonly refers to:',
        options: ['Grandmother', 'Grandfather / elder uncle', 'Sister', 'Cousin'],
        correctIndex: 1
      }
    ],
    reading: [
      {
        prompt: '"Baba" means:',
        options: ['Mother', 'Father', 'Aunt', 'Teacher'],
        correctIndex: 1
      }
    ],
    cultural: [
      {
        prompt: 'Respect forms (e.g. referring to someone\'s mother as "mai veJohn") help with:',
        options: ['Politeness and family hierarchy', 'Talking only to children', 'Avoiding numbers', 'Writing only'],
        correctIndex: 0
      }
    ]
  },
  {
    listening: [
      {
        prompt: '"Piri" as in counting usually means:',
        options: ['One', 'Two', 'Three', 'Ten'],
        correctIndex: 1
      }
    ],
    speaking: [
      {
        prompt: '"Zviripi" is often used when asking:',
        options: ['How many / how much?', 'Who?', 'Where?', 'Why?'],
        correctIndex: 0
      }
    ],
    reading: [
      {
        prompt: '"Mangwanani" / morning context is often tied to:',
        options: ['Evening meals', 'Morning greetings', 'Market closing', 'Rain season only'],
        correctIndex: 1
      }
    ],
    cultural: [
      {
        prompt: 'Counting and greetings in markets show:',
        options: ['Practical daily communication', 'Only formal church speech', 'Avoiding money topics', 'Writing grammar only'],
        correctIndex: 0
      }
    ]
  },
  {
    listening: [
      {
        prompt: 'A phrase about "going" often includes:',
        options: ['Kuenda (to go)', 'Kudya (to eat)', 'Kuroora (to marry)', 'Kutamba (to play)'],
        correctIndex: 0
      }
    ],
    speaking: [
      {
        prompt: '"Ndapota" commonly expresses:',
        options: ['Please / I beg', 'I refuse', 'I forgot', 'I am angry'],
        correctIndex: 0
      }
    ],
    reading: [
      {
        prompt: '"Kumba" often maps to:',
        options: ['Mountain', 'Home', 'River', 'City hall'],
        correctIndex: 1
      }
    ],
    cultural: [
      {
        prompt: 'Household routines in Shona families often center on:',
        options: ['Shared duties and respect', 'Avoiding relatives', 'Only written contracts', 'Silence at meals'],
        correctIndex: 0
      }
    ]
  },
  {
    listening: [
      {
        prompt: 'A weather word for rain might be linked to:',
        options: ['Mvura', 'Doro', 'Hari', 'Huku'],
        correctIndex: 0
      }
    ],
    speaking: [
      {
        prompt: 'Colors and sizes can describe:',
        options: ['Objects before buying/selling', 'Only animals', 'Only months', 'Only songs'],
        correctIndex: 0
      }
    ],
    reading: [
      {
        prompt: '"Gara pasi" as an imperative can mean:',
        options: ['Stand up', 'Sit down', 'Run away', 'Sing loudly'],
        correctIndex: 1
      }
    ],
    cultural: [
      {
        prompt: 'Markets and bargaining blend language with:',
        options: ['Patience and relationship', 'Only fixed prices/no talk', 'Avoiding Shona', 'Only online chat'],
        correctIndex: 0
      }
    ]
  },
  {
    listening: [
      {
        prompt: '"Chii" often introduces questions about:',
        options: ['Things / what', 'People only', 'Time only', 'Colors only'],
        correctIndex: 0
      }
    ],
    speaking: [
      {
        prompt: 'Talking about "yesterday" often uses time words similar to:',
        options: ['Negation only', 'Past-day references (e.g. zuro)', 'Only future tense', 'Only numbers'],
        correctIndex: 1
      }
    ],
    reading: [
      {
        prompt: 'A basic subject-verb-object pattern helps you:',
        options: ['Build clear sentences', 'Skip verbs', 'Avoid listening', 'Remove tones'],
        correctIndex: 0
      }
    ],
    cultural: [
      {
        prompt: 'Story and opinion sharing often respects:',
        options: ['Age and context', 'Speaking as fast as possible', 'Avoiding eye contact always', 'English-only endings'],
        correctIndex: 0
      }
    ]
  }
] as const

/** stageOrder 1-6 (Foundation … Mastery) */
export function buildStageCheckpointData(stageOrder: number): CheckpointQuestionData {
  const idx = Math.min(Math.max(stageOrder, 1), 6) - 1
  const pack = BASE[idx]

  const sections = [
    {
      id: 'listening',
      title: 'Listening',
      weight: 25,
      questions: [...pack.listening].map((q, i) => ({
        id: `s${stageOrder}-l-${i}`,
        prompt: q.prompt,
        options: [...q.options],
        correctIndex: q.correctIndex,
        audioText: q.prompt.slice(0, 40)
      }))
    },
    {
      id: 'speaking',
      title: 'Speaking / phrases',
      weight: 25,
      questions: [...pack.speaking].map((q, i) => ({
        id: `s${stageOrder}-sp-${i}`,
        prompt: q.prompt,
        options: [...q.options],
        correctIndex: q.correctIndex
      }))
    },
    {
      id: 'reading',
      title: 'Reading / vocabulary',
      weight: 25,
      questions: [...pack.reading].map((q, i) => ({
        id: `s${stageOrder}-r-${i}`,
        prompt: q.prompt,
        options: [...q.options],
        correctIndex: q.correctIndex
      }))
    },
    {
      id: 'cultural',
      title: 'Culture',
      weight: 25,
      questions: [...pack.cultural].map((q, i) => ({
        id: `s${stageOrder}-c-${i}`,
        prompt: q.prompt,
        options: [...q.options],
        correctIndex: q.correctIndex
      }))
    }
  ]

  return {
    version: 1,
    sections,
    overallPassPercent: 70,
    sectionPassPercent: 60
  }
}
