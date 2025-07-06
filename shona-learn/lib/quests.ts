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
  estimatedDuration: number // in minutes
  culturalTheme: string
  interactiveElements: string[]
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
    lessons: ["lesson-1", "lesson-2"],
    estimatedDuration: 15,
    culturalTheme: "Traditional Hospitality",
    interactiveElements: [
      "Role-play village encounters",
      "Audio pronunciation practice",
      "Cultural context videos"
    ]
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
    lessons: ["lesson-3", "lesson-4"],
    estimatedDuration: 20,
    culturalTheme: "Ubuntu Philosophy",
    interactiveElements: [
      "Interactive family tree builder",
      "Story matching games",
      "Cultural comparison activities"
    ]
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
    lessons: ["lesson-2", "lesson-5"],
    estimatedDuration: 25,
    culturalTheme: "Traditional Commerce",
    interactiveElements: [
      "Virtual market simulation",
      "Bargaining mini-games",
      "Cultural artifact identification"
    ]
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
    lessons: ["lesson-6", "lesson-7", "lesson-8"],
    estimatedDuration: 30,
    culturalTheme: "Oral Tradition",
    interactiveElements: [
      "Waveform analysis feedback",
      "Tone pattern games",
      "Elder storytelling sessions"
    ]
  },
  {
    id: "quest-5",
    title: "Songs of the Ancestors",
    description: "Learn Shona through traditional hymns and spiritual songs",
    storyNarrative: "The village choir is preparing for a celebration and invites you to join. Through traditional hymns and spiritual songs, you'll discover the soul of Shona culture while learning the language in its most beautiful form.",
    category: "Music & Spirituality",
    orderIndex: 5,
    requiredLevel: 5,
    learningObjectives: [
      "Learn vocabulary through traditional songs",
      "Understand spiritual and cultural contexts",
      "Practice rhythm and intonation"
    ],
    discoveryElements: [
      "Explore the role of music in Shona culture",
      "Discover traditional instruments and their significance",
      "Learn about spiritual beliefs and practices"
    ],
    collaborativeElements: [
      "Join a virtual choir with other learners",
      "Share musical traditions from your culture",
      "Collaborate on rhythm and harmony"
    ],
    intrinsicRewards: [
      "Experience the spiritual beauty of Shona music",
      "Feel connected to ancestral traditions",
      "Build confidence through musical expression"
    ],
    lessons: ["lesson-9", "lesson-10", "lesson-11"],
    estimatedDuration: 35,
    culturalTheme: "Spiritual Heritage",
    interactiveElements: [
      "Interactive music notation",
      "Rhythm matching games",
      "Virtual choir participation"
    ]
  },
  {
    id: "quest-6",
    title: "Wisdom of the Elders",
    description: "Explore Shona proverbs and traditional wisdom",
    storyNarrative: "The village elder, Sekuru Mukoma, sits under the ancient baobab tree sharing traditional proverbs. Each proverb contains centuries of wisdom and teaches important life lessons while expanding your Shona vocabulary.",
    category: "Traditional Wisdom",
    orderIndex: 6,
    requiredLevel: 6,
    learningObjectives: [
      "Learn vocabulary through proverbs",
      "Understand metaphorical language",
      "Grasp cultural values and wisdom"
    ],
    discoveryElements: [
      "Explore the deeper meanings behind proverbs",
      "Discover how proverbs guide daily life",
      "Learn about traditional decision-making"
    ],
    collaborativeElements: [
      "Share proverbs from your own culture",
      "Discuss life lessons with fellow learners",
      "Create modern applications of ancient wisdom"
    ],
    intrinsicRewards: [
      "Gain cultural wisdom and insights",
      "Feel connected to generations of knowledge",
      "Develop philosophical thinking in Shona"
    ],
    lessons: ["lesson-12", "lesson-13", "lesson-14"],
    estimatedDuration: 40,
    culturalTheme: "Ancestral Knowledge",
    interactiveElements: [
      "Proverb matching games",
      "Story completion activities",
      "Elder wisdom videos"
    ]
  },
  {
    id: "quest-7",
    title: "Guardians of the Ruins",
    description: "Discover Zimbabwe's ancient history while learning Shona",
    storyNarrative: "You're visiting the Great Zimbabwe ruins with a local guide who shares the ancient history of the Shona people. As you explore these magnificent stone structures, you'll learn about the great civilization that built them.",
    category: "Historical Heritage",
    orderIndex: 7,
    requiredLevel: 7,
    learningObjectives: [
      "Learn historical vocabulary",
      "Understand architectural terms",
      "Explore ancient Shona civilization"
    ],
    discoveryElements: [
      "Explore the mystery of Great Zimbabwe",
      "Discover ancient trade routes and culture",
      "Learn about traditional building techniques"
    ],
    collaborativeElements: [
      "Share archaeological discoveries with others",
      "Collaborate on historical research",
      "Build virtual models together"
    ],
    intrinsicRewards: [
      "Feel pride in Shona heritage",
      "Connect with ancient wisdom",
      "Experience archaeological wonder"
    ],
    lessons: ["lesson-15", "lesson-16", "lesson-17"],
    estimatedDuration: 45,
    culturalTheme: "Archaeological Heritage",
    interactiveElements: [
      "Virtual ruins exploration",
      "Historical timeline games",
      "Archaeological discovery activities"
    ]
  },
  {
    id: "quest-8",
    title: "The Harvest Festival",
    description: "Celebrate the harvest season with traditional dances and foods",
    storyNarrative: "It's harvest time in the village! You're invited to participate in the traditional harvest festival where you'll learn about farming, food preparation, and the joyful dances that celebrate the bounty of the land.",
    category: "Seasonal Celebrations",
    orderIndex: 8,
    requiredLevel: 8,
    learningObjectives: [
      "Learn agricultural vocabulary",
      "Understand seasonal celebrations",
      "Practice food and cooking terms"
    ],
    discoveryElements: [
      "Explore traditional farming methods",
      "Discover seasonal foods and their preparation",
      "Learn about harvest rituals and dances"
    ],
    collaborativeElements: [
      "Dance with other learners virtually",
      "Share harvest traditions from your culture",
      "Cook traditional recipes together"
    ],
    intrinsicRewards: [
      "Experience the joy of community celebration",
      "Feel connected to agricultural traditions",
      "Build cultural appreciation through food"
    ],
    lessons: ["lesson-18", "lesson-19", "lesson-20"],
    estimatedDuration: 50,
    culturalTheme: "Agricultural Traditions",
    interactiveElements: [
      "Virtual dance tutorials",
      "Recipe following games",
      "Seasonal calendar activities"
    ]
  },
  {
    id: "quest-9",
    title: "Stories Around the Fire",
    description: "Learn through traditional folktales and storytelling",
    storyNarrative: "As the sun sets, the village gathers around the fire for storytelling time. You'll hear ancient folktales about clever hares, wise tortoises, and brave heroes while learning narrative structures and cultural values.",
    category: "Oral Literature",
    orderIndex: 9,
    requiredLevel: 9,
    learningObjectives: [
      "Learn narrative vocabulary",
      "Understand storytelling techniques",
      "Practice descriptive language"
    ],
    discoveryElements: [
      "Explore the moral lessons in folktales",
      "Discover traditional character archetypes",
      "Learn about oral tradition preservation"
    ],
    collaborativeElements: [
      "Share folktales from your culture",
      "Create collaborative stories",
      "Practice storytelling with others"
    ],
    intrinsicRewards: [
      "Experience the magic of oral tradition",
      "Feel connected to storytelling heritage",
      "Develop creative expression in Shona"
    ],
    lessons: ["lesson-21", "lesson-22", "lesson-23"],
    estimatedDuration: 40,
    culturalTheme: "Oral Literature",
    interactiveElements: [
      "Interactive story choices",
      "Character animation games",
      "Storytelling practice sessions"
    ]
  },
  {
    id: "quest-10",
    title: "The Healing Garden",
    description: "Explore traditional medicine and herbal knowledge",
    storyNarrative: "The village healer, Gogo Nehanda, tends to her medicinal garden and shares the ancient knowledge of healing plants. You'll learn about traditional medicine while expanding your vocabulary related to health and nature.",
    category: "Traditional Medicine",
    orderIndex: 10,
    requiredLevel: 10,
    learningObjectives: [
      "Learn plant and herb vocabulary",
      "Understand traditional healing practices",
      "Practice health-related conversations"
    ],
    discoveryElements: [
      "Explore the connection between plants and healing",
      "Discover traditional diagnostic methods",
      "Learn about holistic health approaches"
    ],
    collaborativeElements: [
      "Share healing traditions from your culture",
      "Create a virtual herb garden together",
      "Discuss modern and traditional medicine"
    ],
    intrinsicRewards: [
      "Gain respect for traditional knowledge",
      "Feel connected to natural healing",
      "Build cultural understanding of health"
    ],
    lessons: ["lesson-24", "lesson-25", "lesson-26"],
    estimatedDuration: 45,
    culturalTheme: "Traditional Medicine",
    interactiveElements: [
      "Plant identification games",
      "Remedy preparation simulations",
      "Health conversation practice"
    ]
  },
  {
    id: "quest-11",
    title: "The Trading Journey",
    description: "Follow ancient trade routes and learn business vocabulary",
    storyNarrative: "You're joining a trading caravan that follows the ancient routes between Zimbabwe and the coast. Learn about historical trade relationships while mastering business vocabulary and negotiation skills.",
    category: "Historical Commerce",
    orderIndex: 11,
    requiredLevel: 11,
    learningObjectives: [
      "Learn business and trade vocabulary",
      "Understand historical trade networks",
      "Practice negotiation and diplomacy"
    ],
    discoveryElements: [
      "Explore ancient trade routes and partnerships",
      "Discover traditional goods and their values",
      "Learn about cultural exchange through trade"
    ],
    collaborativeElements: [
      "Form trading partnerships with other learners",
      "Negotiate deals in virtual markets",
      "Share trade knowledge across cultures"
    ],
    intrinsicRewards: [
      "Experience the adventure of ancient trade",
      "Feel connected to historical commerce",
      "Build diplomatic and business skills"
    ],
    lessons: ["lesson-27", "lesson-28", "lesson-29"],
    estimatedDuration: 50,
    culturalTheme: "Historical Trade",
    interactiveElements: [
      "Trade route mapping games",
      "Virtual negotiation scenarios",
      "Historical commerce simulations"
    ]
  },
  {
    id: "quest-12",
    title: "The Master Craftsman",
    description: "Learn through traditional arts and crafts",
    storyNarrative: "The village's master craftsman is creating beautiful pottery, baskets, and carvings. You'll learn the vocabulary of traditional crafts while discovering the artistic heritage of the Shona people.",
    category: "Traditional Arts",
    orderIndex: 12,
    requiredLevel: 12,
    learningObjectives: [
      "Learn craft and art vocabulary",
      "Understand artistic techniques and tools",
      "Practice descriptive language for art"
    ],
    discoveryElements: [
      "Explore the spiritual significance of art",
      "Discover traditional patterns and their meanings",
      "Learn about artistic apprenticeship traditions"
    ],
    collaborativeElements: [
      "Create virtual art projects together",
      "Share artistic traditions from your culture",
      "Collaborate on pattern designs"
    ],
    intrinsicRewards: [
      "Experience the beauty of traditional crafts",
      "Feel connected to artistic heritage",
      "Build appreciation for cultural artistry"
    ],
    lessons: ["lesson-30", "lesson-31", "lesson-32"],
    estimatedDuration: 55,
    culturalTheme: "Traditional Arts",
    interactiveElements: [
      "Virtual craft workshops",
      "Pattern creation games",
      "Art appreciation activities"
    ]
  }
]

export const getQuestById = (id: string): Quest | undefined => {
  return quests.find(quest => quest.id === id)
}

export const getQuestsByLevel = (level: number): Quest[] => {
  return quests.filter(quest => quest.requiredLevel <= level)
}

export const getQuestsByCategory = (category: string): Quest[] => {
  return quests.filter(quest => quest.category === category)
}

export const getNextQuest = (completedQuests: string[]): Quest | undefined => {
  return quests.find(quest => !completedQuests.includes(quest.id))
}

export const getQuestsByTheme = (theme: string): Quest[] => {
  return quests.filter(quest => quest.culturalTheme === theme)
}

export const getQuestProgress = (questId: string, completedLessons: string[]): number => {
  const quest = getQuestById(questId)
  if (!quest) return 0
  
  const completedQuestLessons = quest.lessons.filter(lesson => completedLessons.includes(lesson))
  return Math.round((completedQuestLessons.length / quest.lessons.length) * 100)
}

export const getRecommendedQuests = (userLevel: number, completedQuests: string[], interests: string[] = []): Quest[] => {
  const availableQuests = getQuestsByLevel(userLevel).filter(quest => !completedQuests.includes(quest.id))
  
  // If user has interests, prioritize quests that match their interests
  if (interests.length > 0) {
    const matchingQuests = availableQuests.filter(quest => 
      interests.some(interest => 
        quest.culturalTheme.toLowerCase().includes(interest.toLowerCase()) ||
        quest.category.toLowerCase().includes(interest.toLowerCase())
      )
    )
    return matchingQuests.length > 0 ? matchingQuests : availableQuests
  }
  
  return availableQuests
}

export const questCategories = [
  "Cultural Immersion",
  "Family & Relationships", 
  "Practical Communication",
  "Pronunciation Mastery",
  "Music & Spirituality",
  "Traditional Wisdom",
  "Historical Heritage",
  "Seasonal Celebrations",
  "Oral Literature",
  "Traditional Medicine",
  "Historical Commerce",
  "Traditional Arts"
]

export const culturalThemes = [
  "Traditional Hospitality",
  "Ubuntu Philosophy",
  "Traditional Commerce",
  "Oral Tradition",
  "Spiritual Heritage",
  "Ancestral Knowledge",
  "Archaeological Heritage",
  "Agricultural Traditions",
  "Oral Literature",
  "Traditional Medicine",
  "Historical Trade",
  "Traditional Arts"
] 