export interface Quest {
  id: string
  title: string
  description: string
  storyNarrative: string
  category: string
  orderIndex: number
  requiredLevel: number
  level: string
  emoji: string
  learningObjectives: string[]
  lessons: string[]
}

export const quests: Quest[] = [
  // ============ BEGINNER — Units 1-6 ============
  {
    id: "quest-first-words",
    title: "Unit 1: First Words",
    description: "Learn essential greetings, introductions, and basic responses",
    storyNarrative: "You've just arrived in Zimbabwe. Start with the words you'll use every single day — hello, thank you, yes, no, and how to ask questions.",
    category: "First Words",
    orderIndex: 1,
    requiredLevel: 1,
    level: "beginner",
    emoji: "👋",
    learningObjectives: [
      "Greet people formally and informally",
      "Introduce yourself and ask names",
      "Say yes, no, please, and thank you",
      "Ask basic questions with what, how, who, where, when"
    ],
    lessons: ["lesson-1", "lesson-2", "lesson-3", "lesson-4", "lesson-g1"]
  },
  {
    id: "quest-people",
    title: "Unit 2: People Around You",
    description: "Learn family words, social vocabulary, and pronouns",
    storyNarrative: "A Shona family invites you into their home. You'll learn who everyone is — from baba (father) to ambuya (grandmother) — and how to talk about yourself and others.",
    category: "People Around You",
    orderIndex: 2,
    requiredLevel: 2,
    level: "beginner",
    emoji: "👨‍👩‍👧‍👦",
    learningObjectives: [
      "Name core family members",
      "Talk about extended family and elders",
      "Use words for friends and neighbors",
      "Master Shona pronouns (I, you, we, they)"
    ],
    lessons: ["lesson-5", "lesson-6", "lesson-7", "lesson-8", "lesson-g2"]
  },
  {
    id: "quest-numbers-time",
    title: "Unit 3: Numbers & Time",
    description: "Count from 1-1000, tell time, and learn the calendar",
    storyNarrative: "At the market you need numbers. Meeting someone? You need time words. This unit gives you the numbers and time vocabulary that unlock daily life.",
    category: "Numbers & Time",
    orderIndex: 3,
    requiredLevel: 3,
    level: "beginner",
    emoji: "🔢",
    learningObjectives: [
      "Count from 1 to 10 confidently",
      "Use big numbers for money and age",
      "Talk about morning, afternoon, evening, today, tomorrow",
      "Name all days of the week"
    ],
    lessons: ["lesson-9", "lesson-10", "lesson-11", "lesson-12"]
  },
  {
    id: "quest-daily-life",
    title: "Unit 4: Daily Life",
    description: "Learn food, home, body, and color vocabulary",
    storyNarrative: "Now you can navigate daily life — order sadza at a restaurant, describe your house, visit a doctor, and describe the colorful world around you.",
    category: "Daily Life",
    orderIndex: 4,
    requiredLevel: 4,
    level: "beginner",
    emoji: "🏠",
    learningObjectives: [
      "Name common Zimbabwean foods and drinks",
      "Describe your home and furniture",
      "Know body part names for health situations",
      "Use color words to describe things"
    ],
    lessons: ["lesson-13", "lesson-14", "lesson-15", "lesson-16", "lesson-g7"]
  },
  {
    id: "quest-getting-around",
    title: "Unit 5: Getting Around",
    description: "Shop at markets, use transport, talk about work, and order food",
    storyNarrative: "Time to explore! Navigate the market, take a bus, learn about jobs, and order food with confidence. These are the survival skills for getting around Zimbabwe.",
    category: "Getting Around",
    orderIndex: 5,
    requiredLevel: 5,
    level: "beginner",
    emoji: "🚌",
    learningObjectives: [
      "Ask prices and shop at markets",
      "Talk about transport and directions",
      "Name common occupations",
      "Order food and drinks"
    ],
    lessons: ["lesson-17", "lesson-18", "lesson-19", "lesson-20"]
  },
  {
    id: "quest-actions",
    title: "Unit 6: Doing Things",
    description: "Learn action verbs for daily activities, housework, school, and communication",
    storyNarrative: "You can name things — now learn to DO things. Go, eat, sleep, cook, read, write. These verbs bring your Shona to life.",
    category: "Doing Things",
    orderIndex: 6,
    requiredLevel: 6,
    level: "beginner",
    emoji: "🏃",
    learningObjectives: [
      "Use common daily verbs (go, eat, drink, sleep)",
      "Describe housework and chores",
      "Talk about school and learning",
      "Use communication verbs (speak, hear, read, write)"
    ],
    lessons: ["lesson-21", "lesson-22", "lesson-23", "lesson-g3", "lesson-24", "lesson-g4"]
  },
  // ============ INTERMEDIATE — Units 7-10 ============
  {
    id: "quest-expression",
    title: "Unit 7: Expressing Yourself",
    description: "Express feelings, opinions, apologies, and everyday expressions",
    storyNarrative: "Move beyond basic vocabulary into real self-expression. Share how you feel, what you think, and navigate social situations with grace.",
    category: "Expressing Yourself",
    orderIndex: 7,
    requiredLevel: 7,
    level: "intermediate",
    emoji: "💭",
    learningObjectives: [
      "Express emotions like happiness, sadness, anger",
      "Share opinions and agree or disagree politely",
      "Apologize and express deep gratitude",
      "Use natural everyday expressions"
    ],
    lessons: [
      "lesson-25",
      "lesson-26",
      "lesson-27",
      "lesson-28",
      "lesson-g5",
      "lesson-g6",
      "lesson-g8",
    ]
  },
  {
    id: "quest-culture",
    title: "Unit 8: Culture & Traditions",
    description: "Explore Shona traditions, proverbs, music, and spirituality",
    storyNarrative: "Dive into the heart of Shona culture. Learn about sacred ceremonies, ancient proverbs, the beloved mbira instrument, and the spiritual beliefs that shape daily life.",
    category: "Culture & Traditions",
    orderIndex: 8,
    requiredLevel: 8,
    level: "intermediate",
    emoji: "🌍",
    learningObjectives: [
      "Discuss cultural traditions and customs",
      "Understand and use Shona proverbs",
      "Talk about music and artistic traditions",
      "Learn spiritual and religious vocabulary"
    ],
    lessons: ["lesson-29", "lesson-30", "lesson-31", "lesson-32"]
  },
  {
    id: "quest-nature",
    title: "Unit 9: Nature & Environment",
    description: "Learn about animals, nature, health, and weather",
    storyNarrative: "Zimbabwe's natural world is breathtaking. Name the animals, describe the landscape, talk about health, and discuss the weather like a local.",
    category: "Nature & Environment",
    orderIndex: 9,
    requiredLevel: 9,
    level: "intermediate",
    emoji: "🌿",
    learningObjectives: [
      "Name common animals and their cultural significance",
      "Describe the natural world (sun, moon, mountains, rivers)",
      "Discuss health, illness, and medicine",
      "Talk about weather and seasons"
    ],
    lessons: ["lesson-33", "lesson-34", "lesson-35", "lesson-36"]
  },
  {
    id: "quest-modern-life",
    title: "Unit 10: Modern Life",
    description: "Navigate cities, technology, social media, and entertainment",
    storyNarrative: "Modern Zimbabwe blends tradition with technology. Navigate Harare's streets, talk about your phone, share on social media, and discuss entertainment.",
    category: "Modern Life",
    orderIndex: 10,
    requiredLevel: 10,
    level: "intermediate",
    emoji: "🏙️",
    learningObjectives: [
      "Navigate urban environments",
      "Talk about technology and phones",
      "Use social media vocabulary",
      "Discuss sports, music, and entertainment"
    ],
    lessons: ["lesson-37", "lesson-38", "lesson-39", "lesson-40"]
  },
  // ============ ADVANCED — Units 11-13 ============
  {
    id: "quest-society",
    title: "Unit 11: Society & Governance",
    description: "Discuss Zimbabwe as a nation — government, rights, history, and business",
    storyNarrative: "Engage with deeper topics. Discuss Zimbabwe's government, citizens' rights, the liberation struggle, and the bustling business world.",
    category: "Society & Governance",
    orderIndex: 11,
    requiredLevel: 11,
    level: "advanced",
    emoji: "🏛️",
    learningObjectives: [
      "Talk about your country and government",
      "Discuss rights, voting, and civic participation",
      "Learn historical vocabulary about Zimbabwe's past",
      "Use business and economic vocabulary"
    ],
    lessons: ["lesson-41", "lesson-42", "lesson-43", "lesson-44"]
  },
  {
    id: "quest-complex",
    title: "Unit 12: Complex Communication",
    description: "Connect ideas, use conditionals, express preferences, and discuss abstract concepts",
    storyNarrative: "Take your Shona to a sophisticated level. Link ideas fluently, express hypotheticals, share preferences, and discuss peace and conflict.",
    category: "Complex Communication",
    orderIndex: 12,
    requiredLevel: 12,
    level: "advanced",
    emoji: "🧠",
    learningObjectives: [
      "Use discourse markers to connect ideas",
      "Express hypothetical situations with 'if'",
      "Talk about likes, dislikes, and interests",
      "Discuss abstract concepts like peace and unity"
    ],
    lessons: ["lesson-45", "lesson-46", "lesson-47", "lesson-48"]
  },
  {
    id: "quest-deep-culture",
    title: "Unit 13: Deeper Culture",
    description: "Explore Great Zimbabwe, celebrations, wellbeing, and travel",
    storyNarrative: "Complete your journey with Zimbabwe's deepest cultural treasures. Visit Great Zimbabwe, celebrate at festivals, care for your wellbeing, and plan your travels.",
    category: "Deeper Culture",
    orderIndex: 13,
    requiredLevel: 13,
    level: "advanced",
    emoji: "🏛️",
    learningObjectives: [
      "Learn about Great Zimbabwe's heritage",
      "Talk about celebrations and festivals",
      "Discuss mental health and wellbeing",
      "Use travel vocabulary"
    ],
    lessons: ["lesson-49", "lesson-50", "lesson-51", "lesson-52"]
  }
]

export const getQuestById = (id: string): Quest | undefined => {
  return quests.find(quest => quest.id === id)
}

export const getQuestsByLevel = (level: number): Quest[] => {
  return quests.filter(quest => quest.requiredLevel <= level)
}

export const getNextQuest = (completedQuests: string[]): Quest | undefined => {
  return quests.find(quest => !completedQuests.includes(quest.id))
}
