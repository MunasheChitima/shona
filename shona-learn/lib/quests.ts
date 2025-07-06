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
    title: "Cooking With Flavor",
    description: "Learn food-related vocabulary and cooking verbs while preparing a traditional Shona meal",
    storyNarrative: "The villagers are preparing for a harvest festival and invite you to help cook sadza and delicious relishes. As you follow each recipe step, you unlock new words and cultural insights about Zimbabwean cuisine.",
    category: "Culinary Adventures",
    orderIndex: 5,
    requiredLevel: 5,
    learningObjectives: [
      "Learn common Shona food and ingredient vocabulary",
      "Use verbs for cooking actions and measurements",
      "Apply numbers and quantities in a real-world context"
    ],
    discoveryElements: [
      "Explore traditional dishes like sadza, muriwo, and nyama",
      "Discover local spices and cooking utensils",
      "Learn dining etiquette and communal eating customs"
    ],
    collaborativeElements: [
      "Co-create a recipe with fellow learners",
      "Share photos or drawings of your cooked dishes",
      "Give peer feedback on ingredient lists in Shona"
    ],
    intrinsicRewards: [
      "Experience the joy of cooking and sharing food",
      "Feel connected to Zimbabwean culinary culture",
      "Gain confidence using everyday vocabulary"
    ],
    lessons: ["lesson-4", "lesson-5"]
  },
  {
    id: "quest-6",
    title: "Journey to Great Zimbabwe",
    description: "Travel back in time to explore the ancient city of Great Zimbabwe and learn history-focused vocabulary",
    storyNarrative: "A wise elder offers to guide you through the towering stone ruins of Great Zimbabwe. Each landmark reveals stories of the past, new words, and cultural legends that shaped the Shona people.",
    category: "Cultural Heritage",
    orderIndex: 6,
    requiredLevel: 6,
    learningObjectives: [
      "Acquire historical and location vocabulary",
      "Practice descriptive adjectives and prepositions",
      "Understand cultural significance of Great Zimbabwe"
    ],
    discoveryElements: [
      "Uncover legends surrounding the soapstone birds",
      "Discover trade routes and artifacts",
      "Learn about architectural terms in Shona"
    ],
    collaborativeElements: [
      "Create a virtual tour with classmates",
      "Share interesting historical facts you discover",
      "Discuss similarities with monuments from your culture"
    ],
    intrinsicRewards: [
      "Feel awe for Zimbabwe's rich history",
      "Experience curiosity-driven exploration",
      "Strengthen descriptive language skills"
    ],
    lessons: ["lesson-1", "lesson-7"]
  },
  {
    id: "quest-7",
    title: "Rhythm & Song",
    description: "Dive into traditional Shona music to master rhythm, pronunciation, and cultural expressions",
    storyNarrative: "The village mbira ensemble invites you to join their rehearsal. Through song lyrics and rhythmic patterns, you'll refine pronunciation and learn expressive vocabulary tied to music and emotions.",
    category: "Music & Culture",
    orderIndex: 7,
    requiredLevel: 7,
    learningObjectives: [
      "Practice pronunciation through song lyrics",
      "Learn vocabulary related to emotions and music",
      "Develop listening skills with authentic audio"
    ],
    discoveryElements: [
      "Explore the mbira's role in Shona spirituality",
      "Discover call-and-response singing patterns",
      "Learn how rhythm influences language intonation"
    ],
    collaborativeElements: [
      "Record and share a short song verse in Shona",
      "Provide constructive feedback on classmates' pronunciation",
      "Create a shared playlist of Shona music inspirations"
    ],
    intrinsicRewards: [
      "Feel the joy of making music",
      "Connect emotionally through song",
      "Strengthen memory with melodic repetition"
    ],
    lessons: ["lesson-8"]
  },
  {
    id: "quest-8",
    title: "Healthy Living Helper",
    description: "Use medical and wellbeing vocabulary to assist a community health worker on clinic day",
    storyNarrative: "A traveling nurse asks for your help translating basic symptoms and advice for villagers visiting the pop-up clinic. You'll learn useful phrases for health, body parts, and wellbeing.",
    category: "Daily Life",
    orderIndex: 8,
    requiredLevel: 8,
    learningObjectives: [
      "Learn body parts and common symptoms in Shona",
      "Practice giving simple health advice respectfully",
      "Use question forms to gather information"
    ],
    discoveryElements: [
      "Explore traditional remedies and modern healthcare approaches",
      "Discover respectful ways to address elders and children",
      "Learn cultural beliefs around wellness"
    ],
    collaborativeElements: [
      "Role-play patient-nurse dialogues in groups",
      "Share wellness tips from different cultures",
      "Support peers in mastering health terminology"
    ],
    intrinsicRewards: [
      "Feel satisfaction in helping others",
      "Build practical vocabulary for real-life scenarios",
      "Strengthen empathy and cultural awareness"
    ],
    lessons: ["lesson-5", "lesson-7"]
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