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
    id: "quest-history",
    title: "Journey Through Zimbabwe's Past",
    description: "Explore the rich history of Zimbabwe from ancient kingdoms to modern independence",
    storyNarrative: "Travel through time to discover the great civilizations that shaped Zimbabwe, meet legendary heroes who fought for freedom, and understand how the past influences the present. Your journey will take you from the stone walls of Great Zimbabwe to the celebration of independence.",
    category: "Zimbabwean History",
    orderIndex: 5,
    requiredLevel: 2,
    learningObjectives: [
      "Understand the significance of Great Zimbabwe",
      "Learn about pre-colonial kingdoms and rulers",
      "Explore the liberation struggle and independence",
      "Discover Zimbabwe's cultural heritage"
    ],
    discoveryElements: [
      "Explore archaeological findings at Great Zimbabwe",
      "Discover untold stories of liberation heroes",
      "Learn about Zimbabwe's contributions to African civilization",
      "Understand the continuity between ancient and modern Zimbabwe"
    ],
    collaborativeElements: [
      "Share family stories about Zimbabwe's history",
      "Interview elders about their memories of independence",
      "Create a timeline of Zimbabwe's history with classmates",
      "Visit historical sites virtually or in person with others"
    ],
    intrinsicRewards: [
      "Deep connection to Zimbabwean identity and heritage",
      "Understanding of how history shapes the present",
      "Pride in Zimbabwe's resistance and achievements",
      "Knowledge to share Zimbabwe's story with the world"
    ],
    lessons: ["history-lesson-1", "history-lesson-2", "history-lesson-3", "history-lesson-4", "history-lesson-5", "history-lesson-6"]
  },
  {
    id: "quest-cultural-heritage",
    title: "Roots & Identity - Connecting with Your Heritage",
    description: "A journey of cultural discovery for Zimbabweans in the diaspora to reconnect with their roots",
    storyNarrative: "You're a second or third generation Zimbabwean living abroad, yearning to understand your cultural heritage. This journey will help you discover your totem identity, understand family structures, learn cultural values, and reconnect with the traditions that define who you are. From understanding why you can't marry certain people to knowing how to properly greet elders, you'll gain the knowledge to confidently navigate Zimbabwean cultural spaces.",
    category: "Cultural Heritage",
    orderIndex: 6,
    requiredLevel: 2,
    learningObjectives: [
      "Discover your totem identity and its significance",
      "Understand extended family structures and hierarchy",
      "Learn cultural values and ubuntu philosophy",
      "Master traditional customs and etiquette",
      "Connect ancient wisdom to modern life"
    ],
    discoveryElements: [
      "Find out your totem and what it means for your identity",
      "Discover why certain customs exist and their wisdom",
      "Learn the deeper meanings behind proverbs and sayings",
      "Explore how traditional values apply to modern life",
      "Understand the 'why' behind cultural practices"
    ],
    collaborativeElements: [
      "Interview family elders about your totem and its history",
      "Create a family tree with proper Shona relationship terms",
      "Share cultural experiences with other diaspora learners",
      "Practice traditional greetings and customs together",
      "Cook traditional meals and share recipes"
    ],
    intrinsicRewards: [
      "Deep connection to your ancestral identity",
      "Confidence in cultural settings and family gatherings",
      "Ability to pass on traditions to the next generation",
      "Understanding of your place in the larger Zimbabwean family",
      "Pride in your cultural heritage and values"
    ],
    lessons: ["culture-lesson-1", "culture-lesson-2", "culture-lesson-3", "culture-lesson-4", "culture-lesson-5", "culture-lesson-6", "culture-lesson-7", "culture-lesson-8"]
  },
  {
    id: "quest-5",
    title: "The Great Baobab Tree",
    description: "Discover ancient Shona stories and legends while learning storytelling vocabulary",
    storyNarrative: "Under the ancient baobab tree, the village storyteller shares traditional tales. You'll learn the art of Shona storytelling while building your vocabulary through captivating legends of ancestors, spirits, and wisdom.",
    category: "Storytelling",
    orderIndex: 7,
    requiredLevel: 5,
    learningObjectives: [
      "Learn storytelling vocabulary and phrases",
      "Understand traditional Shona narratives",
      "Practice past tense and narrative structures"
    ],
    discoveryElements: [
      "Explore ancient Shona legends and folktales",
      "Discover the role of storytelling in Shona culture",
      "Learn about ancestral wisdom and values"
    ],
    collaborativeElements: [
      "Share stories from your own culture",
      "Create group storytelling sessions",
      "Practice retelling traditional tales together"
    ],
    intrinsicRewards: [
      "Connect with ancestral wisdom",
      "Experience the power of oral tradition",
      "Feel part of a storytelling community"
    ],
    lessons: ["lesson-9", "lesson-10"]
  },
  {
    id: "quest-6",
    title: "Harvest Festival Celebration",
    description: "Join the village harvest festival and learn about food, celebrations, and community",
    storyNarrative: "The harvest season has arrived! The village is preparing for a grand celebration. You'll help organize the festival, learning about traditional foods, celebrations, and the importance of community in Shona culture.",
    category: "Cultural Celebrations",
    orderIndex: 6,
    requiredLevel: 6,
    learningObjectives: [
      "Learn food and cooking vocabulary",
      "Understand festival and celebration terms",
      "Practice expressing gratitude and joy"
    ],
    discoveryElements: [
      "Explore traditional Shona foods and recipes",
      "Discover the significance of harvest celebrations",
      "Learn about seasonal cycles and agriculture"
    ],
    collaborativeElements: [
      "Plan virtual harvest celebrations together",
      "Share traditional foods from your culture",
      "Create collaborative recipe collections"
    ],
    intrinsicRewards: [
      "Feel the joy of community celebration",
      "Appreciate the connection to nature",
      "Experience gratitude and abundance"
    ],
    lessons: ["lesson-11", "lesson-12", "lesson-13"]
  },
  {
    id: "quest-7",
    title: "The Musical Journey",
    description: "Learn Shona through traditional songs, instruments, and musical expressions",
    storyNarrative: "The village musicians invite you to join their musical circle. Through traditional Shona songs and instruments like the mbira, you'll discover how music and language intertwine in Shona culture.",
    category: "Musical Culture",
    orderIndex: 7,
    requiredLevel: 7,
    learningObjectives: [
      "Learn musical vocabulary and instruments",
      "Understand rhythm and melody in Shona",
      "Practice singing traditional songs"
    ],
    discoveryElements: [
      "Explore the sacred mbira and other instruments",
      "Discover the role of music in Shona ceremonies",
      "Learn about musical storytelling traditions"
    ],
    collaborativeElements: [
      "Create virtual music circles",
      "Share musical traditions from your culture",
      "Practice songs together online"
    ],
    intrinsicRewards: [
      "Experience the spiritual power of music",
      "Feel connected to cultural rhythms",
      "Express creativity through song"
    ],
    lessons: ["lesson-14", "lesson-15"]
  },
  {
    id: "quest-8",
    title: "The Wisdom Keeper's Challenge",
    description: "Solve riddles and puzzles using Shona proverbs and traditional wisdom",
    storyNarrative: "The village's oldest and wisest elder has a challenge for you. Through riddles, proverbs, and word puzzles, you'll unlock the deep wisdom of Shona culture while strengthening your language skills.",
    category: "Wisdom & Puzzles",
    orderIndex: 8,
    requiredLevel: 8,
    learningObjectives: [
      "Learn traditional Shona proverbs",
      "Understand metaphorical language",
      "Practice problem-solving in Shona"
    ],
    discoveryElements: [
      "Explore the meaning behind proverbs",
      "Discover cultural values through sayings",
      "Learn about traditional wisdom teachings"
    ],
    collaborativeElements: [
      "Solve puzzles together in teams",
      "Share wisdom from your culture",
      "Create new riddles for other learners"
    ],
    intrinsicRewards: [
      "Feel the satisfaction of solving puzzles",
      "Gain wisdom from cultural teachings",
      "Experience intellectual growth"
    ],
    lessons: ["lesson-16", "lesson-17", "lesson-18"]
  },
  {
    id: "quest-9",
    title: "The Healing Garden",
    description: "Learn about traditional medicine and nature vocabulary through herbal wisdom",
    storyNarrative: "The village healer takes you to their sacred garden where traditional medicines grow. You'll learn about plants, healing practices, and the connection between language and nature in Shona culture.",
    category: "Nature & Healing",
    orderIndex: 9,
    requiredLevel: 9,
    learningObjectives: [
      "Learn plant and nature vocabulary",
      "Understand traditional healing concepts",
      "Practice describing natural phenomena"
    ],
    discoveryElements: [
      "Explore traditional medicinal plants",
      "Discover the role of nature in healing",
      "Learn about seasonal changes and cycles"
    ],
    collaborativeElements: [
      "Create virtual herb gardens together",
      "Share healing traditions from your culture",
      "Discuss environmental conservation"
    ],
    intrinsicRewards: [
      "Connect with nature's healing power",
      "Feel respect for traditional knowledge",
      "Experience holistic understanding"
    ],
    lessons: ["lesson-19", "lesson-20"]
  },
  {
    id: "quest-10",
    title: "The Master Craftsperson",
    description: "Learn about traditional crafts and skilled trades while building specialized vocabulary",
    storyNarrative: "The village's master craftspeople invite you to learn their trades. From pottery to weaving, metalwork to woodcarving, you'll discover the vocabulary of skilled craftsmanship and the pride of traditional arts.",
    category: "Traditional Crafts",
    orderIndex: 10,
    requiredLevel: 10,
    learningObjectives: [
      "Learn craft and tool vocabulary",
      "Understand processes and techniques",
      "Practice describing skilled work"
    ],
    discoveryElements: [
      "Explore traditional Shona crafts and arts",
      "Discover the cultural significance of craftsmanship",
      "Learn about trade and apprenticeship systems"
    ],
    collaborativeElements: [
      "Share craft projects and techniques",
      "Create virtual craft workshops",
      "Teach others traditional skills"
    ],
    intrinsicRewards: [
      "Feel the pride of creating something beautiful",
      "Experience mastery through practice",
      "Connect with generations of craftspeople"
    ],
    lessons: ["lesson-21", "lesson-22", "lesson-23"]
  },
  {
    id: "quest-11",
    title: "The Dream Interpreter",
    description: "Explore the spiritual world and learn about dreams, spirits, and ceremonies",
    storyNarrative: "The village's spiritual leader shares the mysteries of dreams and the spirit world. You'll learn about Shona spiritual beliefs, ceremonies, and the language used to discuss the unseen world.",
    category: "Spiritual Culture",
    orderIndex: 11,
    requiredLevel: 11,
    learningObjectives: [
      "Learn spiritual and ceremonial vocabulary",
      "Understand cultural beliefs and practices",
      "Practice discussing abstract concepts"
    ],
    discoveryElements: [
      "Explore Shona spiritual beliefs and practices",
      "Discover the role of dreams in culture",
      "Learn about ancestral connections"
    ],
    collaborativeElements: [
      "Share spiritual traditions respectfully",
      "Discuss cultural beliefs and values",
      "Create respectful dialogue about faith"
    ],
    intrinsicRewards: [
      "Feel connected to something greater",
      "Experience spiritual reflection",
      "Gain respect for diverse beliefs"
    ],
    lessons: ["lesson-24", "lesson-25"]
  },
  {
    id: "quest-12",
    title: "The Modern Village",
    description: "Bridge traditional and modern life while learning contemporary Shona vocabulary",
    storyNarrative: "The village is changing with the times. You'll explore how traditional Shona culture adapts to modern life, learning contemporary vocabulary while maintaining cultural roots.",
    category: "Modern Life",
    orderIndex: 12,
    requiredLevel: 12,
    learningObjectives: [
      "Learn modern technology and life vocabulary",
      "Understand cultural adaptation and change",
      "Practice discussing contemporary issues"
    ],
    discoveryElements: [
      "Explore how culture evolves with time",
      "Discover modern expressions in Shona",
      "Learn about urban vs. rural life"
    ],
    collaborativeElements: [
      "Discuss cultural changes in your communities",
      "Share modern adaptations of traditions",
      "Create dialogue about preserving culture"
    ],
    intrinsicRewards: [
      "Feel connected to contemporary life",
      "Experience cultural continuity",
      "Appreciate adaptation and resilience"
    ],
    lessons: ["lesson-26", "lesson-27", "lesson-28"]
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