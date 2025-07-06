export interface Quest {
  id: string
  title: string
  description: string
  storyNarrative: string
  category: string
  orderIndex: number
  requiredLevel: number
  learningObjectives: string[]
  discoveryElements: string[]
  collaborativeElements: string[]
  intrinsicRewards: string[]
  lessons: string[] // lesson IDs
}

export const quests: Quest[] = [
  {
    id: "quest-1",
    title: "The Village Greeting",
    description: "Begin your journey by learning to greet people in a Shona village",
    storyNarrative: "You've just arrived in a beautiful Shona village. The villagers are warm and welcoming, but you need to learn their greetings to connect with them. Each person you meet will teach you something new about Shona culture and language.",
    category: "Cultural Immersion",
    orderIndex: 1,
    requiredLevel: 1,
    learningObjectives: [
      "Master basic Shona greetings",
      "Understand cultural context of greetings",
      "Practice pronunciation with confidence"
    ],
    discoveryElements: [
      "Explore different times of day greetings",
      "Discover regional variations in greetings",
      "Learn about the importance of respect in Shona culture"
    ],
    collaborativeElements: [
      "Practice greetings with other learners",
      "Share cultural insights from your background",
      "Help others with pronunciation"
    ],
    intrinsicRewards: [
      "Feel the joy of connecting with Shona speakers",
      "Experience cultural understanding",
      "Build confidence in language learning"
    ],
    lessons: ["lesson-1", "lesson-2"]
  },
  {
    id: "quest-2",
    title: "Family Connections",
    description: "Learn about family relationships and build your Shona family vocabulary",
    storyNarrative: "A family in the village has invited you to their home. You'll learn about family relationships, which are central to Shona culture. Understanding family terms will help you connect more deeply with the community.",
    category: "Family & Relationships",
    orderIndex: 2,
    requiredLevel: 2,
    learningObjectives: [
      "Learn family member terms",
      "Understand Shona family structure",
      "Practice using family vocabulary in context"
    ],
    discoveryElements: [
      "Explore extended family relationships",
      "Discover cultural family values",
      "Learn about family roles in Shona society"
    ],
    collaborativeElements: [
      "Share your family structure with others",
      "Practice family conversations together",
      "Create family trees using Shona terms"
    ],
    intrinsicRewards: [
      "Deepen understanding of Shona culture",
      "Feel connected to family values",
      "Build meaningful relationships"
    ],
    lessons: ["lesson-3", "lesson-4"]
  },
  {
    id: "quest-3",
    title: "Market Adventures",
    description: "Navigate a Shona market using numbers, colors, and basic phrases",
    storyNarrative: "You're exploring a vibrant Shona market where you need to count, identify colors, and negotiate. This real-world scenario will help you apply your language skills in practical situations.",
    category: "Practical Communication",
    orderIndex: 3,
    requiredLevel: 3,
    learningObjectives: [
      "Master numbers 1-10 in Shona",
      "Learn color vocabulary",
      "Practice basic negotiation phrases"
    ],
    discoveryElements: [
      "Explore market culture and traditions",
      "Discover traditional Shona crafts",
      "Learn about local foods and products"
    ],
    collaborativeElements: [
      "Role-play market scenarios together",
      "Share market experiences from your culture",
      "Practice bargaining as a group"
    ],
    intrinsicRewards: [
      "Experience practical language application",
      "Feel confident in real-world situations",
      "Connect with local culture and commerce"
    ],
    lessons: ["lesson-2", "lesson-5"]
  },
  {
    id: "quest-4",
    title: "Voice of the Village",
    description: "Master Shona pronunciation and tones through voice practice",
    storyNarrative: "The village elders want to teach you the proper way to speak Shona. You'll learn the musical tones and sounds that make Shona unique, connecting you more deeply to the language's soul.",
    category: "Pronunciation Mastery",
    orderIndex: 4,
    requiredLevel: 4,
    learningObjectives: [
      "Master Shona tone patterns",
      "Practice prenasalized consonants",
      "Develop authentic pronunciation"
    ],
    discoveryElements: [
      "Explore the musical nature of Shona",
      "Discover how tones change meaning",
      "Learn about regional pronunciation differences"
    ],
    collaborativeElements: [
      "Practice pronunciation with native speakers",
      "Record and share pronunciation attempts",
      "Give and receive constructive feedback"
    ],
    intrinsicRewards: [
      "Feel the rhythm and beauty of Shona",
      "Build authentic speaking confidence",
      "Connect with the language's musical heritage"
    ],
    lessons: ["lesson-6", "lesson-7", "lesson-8"]
  },
  {
    id: "quest-5",
    title: "The Storyteller's Circle",
    description: "Learn to tell stories and share wisdom through Shona folklore",
    storyNarrative: "An elderly storyteller invites you to join the evening storytelling circle. You'll learn traditional Shona stories, pick up narrative vocabulary, and discover the power of oral tradition in preserving culture and wisdom.",
    category: "Cultural Immersion",
    orderIndex: 5,
    requiredLevel: 5,
    learningObjectives: [
      "Learn storytelling vocabulary and phrases",
      "Understand traditional Shona folklore",
      "Practice narrative past tense constructions"
    ],
    discoveryElements: [
      "Explore different types of Shona stories",
      "Discover moral lessons in traditional tales",
      "Learn about oral tradition in Shona culture"
    ],
    collaborativeElements: [
      "Share stories from your own culture",
      "Create collaborative storytelling sessions",
      "Help others with story comprehension"
    ],
    intrinsicRewards: [
      "Connect with timeless wisdom",
      "Feel the power of storytelling",
      "Preserve cultural knowledge through sharing"
    ],
    lessons: ["lesson-9", "lesson-10", "lesson-11"]
  },
  {
    id: "quest-6",
    title: "Harvest Festival Helper",
    description: "Participate in traditional celebrations and learn festive vocabulary",
    storyNarrative: "The village is preparing for harvest festival! You'll help with preparations, learn about traditional foods, songs, and dances. This immersive experience will teach you celebration vocabulary while connecting you to Shona traditions.",
    category: "Cultural Immersion",
    orderIndex: 6,
    requiredLevel: 6,
    learningObjectives: [
      "Learn festival and celebration vocabulary",
      "Understand traditional food names",
      "Practice expressing joy and gratitude"
    ],
    discoveryElements: [
      "Explore traditional Shona celebrations",
      "Discover seasonal agricultural practices",
      "Learn about community cooperation"
    ],
    collaborativeElements: [
      "Plan a virtual harvest celebration",
      "Share traditional foods from your culture",
      "Create festive vocabulary games together"
    ],
    intrinsicRewards: [
      "Experience community celebration",
      "Feel the joy of cultural participation",
      "Connect with agricultural traditions"
    ],
    lessons: ["lesson-12", "lesson-13", "lesson-14"]
  },
  {
    id: "quest-7",
    title: "Weather Wisdom",
    description: "Learn to discuss weather, seasons, and natural phenomena",
    storyNarrative: "The village depends on understanding weather patterns for farming. An experienced farmer teaches you to read the sky, understand seasonal changes, and communicate about weather conditions - essential knowledge for rural life.",
    category: "Practical Communication",
    orderIndex: 7,
    requiredLevel: 7,
    learningObjectives: [
      "Master weather vocabulary",
      "Learn seasonal expressions",
      "Practice future tense for weather predictions"
    ],
    discoveryElements: [
      "Explore traditional weather prediction methods",
      "Discover how weather affects daily life",
      "Learn about climate patterns in Zimbabwe"
    ],
    collaborativeElements: [
      "Share weather patterns from your region",
      "Practice weather conversations together",
      "Create weather prediction games"
    ],
    intrinsicRewards: [
      "Connect with natural rhythms",
      "Feel prepared for real conversations",
      "Understand agricultural wisdom"
    ],
    lessons: ["lesson-15", "lesson-16", "lesson-17"]
  },
  {
    id: "quest-8",
    title: "The Healer's Apprentice",
    description: "Learn about traditional medicine and body vocabulary",
    storyNarrative: "A traditional healer takes you as an apprentice to learn about medicinal plants and healing practices. You'll discover body vocabulary, health expressions, and the deep connection between nature and wellness in Shona culture.",
    category: "Cultural Immersion",
    orderIndex: 8,
    requiredLevel: 8,
    learningObjectives: [
      "Learn body parts vocabulary",
      "Understand health and wellness expressions",
      "Practice giving and receiving medical advice"
    ],
    discoveryElements: [
      "Explore traditional healing practices",
      "Discover medicinal plant knowledge",
      "Learn about holistic health concepts"
    ],
    collaborativeElements: [
      "Share healing traditions from your culture",
      "Practice health conversations together",
      "Create wellness vocabulary exercises"
    ],
    intrinsicRewards: [
      "Connect with traditional wisdom",
      "Feel the power of cultural healing",
      "Understand holistic wellness approaches"
    ],
    lessons: ["lesson-18", "lesson-19", "lesson-20"]
  },
  {
    id: "quest-9",
    title: "Music and Movement",
    description: "Learn through traditional Shona music, dance, and instruments",
    storyNarrative: "The village musicians invite you to learn traditional songs and dances. Through music, you'll discover the rhythm of Shona language, learn cultural expressions, and experience how music preserves history and identity.",
    category: "Cultural Immersion",
    orderIndex: 9,
    requiredLevel: 9,
    learningObjectives: [
      "Learn music and dance vocabulary",
      "Understand rhythm in Shona language",
      "Practice cultural expressions through song"
    ],
    discoveryElements: [
      "Explore traditional Shona instruments",
      "Discover how music preserves history",
      "Learn about dance as cultural expression"
    ],
    collaborativeElements: [
      "Create music sessions with other learners",
      "Share musical traditions from your culture",
      "Practice rhythmic language patterns together"
    ],
    intrinsicRewards: [
      "Feel the rhythm of Shona language",
      "Connect with cultural expressions",
      "Experience music as universal language"
    ],
    lessons: ["lesson-21", "lesson-22", "lesson-23"]
  },
  {
    id: "quest-10",
    title: "Journey to the City",
    description: "Navigate urban environments and modern Shona expressions",
    storyNarrative: "You're traveling to Harare for the first time! Learn modern urban vocabulary, navigate city transportation, and discover how Shona adapts to contemporary life while maintaining its cultural roots.",
    category: "Practical Communication",
    orderIndex: 10,
    requiredLevel: 10,
    learningObjectives: [
      "Learn urban and modern vocabulary",
      "Master transportation expressions",
      "Practice asking for directions"
    ],
    discoveryElements: [
      "Explore modern Shona expressions",
      "Discover urban vs. rural language differences",
      "Learn about contemporary Zimbabwean life"
    ],
    collaborativeElements: [
      "Share urban experiences from your background",
      "Practice city navigation scenarios",
      "Create modern vocabulary challenges"
    ],
    intrinsicRewards: [
      "Feel confident in urban settings",
      "Bridge traditional and modern language",
      "Connect with contemporary culture"
    ],
    lessons: ["lesson-24", "lesson-25", "lesson-26"]
  },
  {
    id: "quest-11",
    title: "The Craft Master's Workshop",
    description: "Learn traditional crafts and specialized vocabulary",
    storyNarrative: "A master craftsperson teaches you traditional pottery, weaving, or carving. Through hands-on learning, you'll discover specialized vocabulary, understand the patience required for mastery, and connect with Zimbabwe's rich artistic heritage.",
    category: "Cultural Immersion",
    orderIndex: 11,
    requiredLevel: 11,
    learningObjectives: [
      "Learn craft and art vocabulary",
      "Understand tool and material names",
      "Practice describing processes and techniques"
    ],
    discoveryElements: [
      "Explore traditional Shona crafts",
      "Discover artistic techniques and patterns",
      "Learn about cultural symbolism in art"
    ],
    collaborativeElements: [
      "Share artistic traditions from your culture",
      "Create collaborative craft projects",
      "Practice describing artistic processes"
    ],
    intrinsicRewards: [
      "Connect with artistic heritage",
      "Feel the satisfaction of creation",
      "Understand cultural symbolism"
    ],
    lessons: ["lesson-27", "lesson-28", "lesson-29"]
  },
  {
    id: "quest-12",
    title: "The Bridge Builder",
    description: "Advanced communication skills for complex conversations",
    storyNarrative: "You've become a bridge between cultures! Use your advanced Shona skills to facilitate understanding, resolve conflicts, and build connections. This quest challenges you to use sophisticated language structures while serving your community.",
    category: "Practical Communication",
    orderIndex: 12,
    requiredLevel: 12,
    learningObjectives: [
      "Master complex sentence structures",
      "Practice diplomatic language",
      "Learn advanced conversational skills"
    ],
    discoveryElements: [
      "Explore advanced grammar patterns",
      "Discover nuanced communication styles",
      "Learn about conflict resolution in Shona culture"
    ],
    collaborativeElements: [
      "Facilitate discussions between learners",
      "Practice complex conversation scenarios",
      "Help newer learners with advanced concepts"
    ],
    intrinsicRewards: [
      "Feel the power of advanced communication",
      "Experience cultural bridge-building",
      "Connect communities through language"
    ],
    lessons: ["lesson-30", "lesson-31", "lesson-32"]
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