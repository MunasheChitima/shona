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
    title: "The Kitchen Chronicles",
    description: "Discover Shona cuisine and cooking vocabulary through a culinary adventure",
    storyNarrative: "A renowned village cook has invited you to help prepare a traditional feast. You'll learn about Shona ingredients, cooking methods, and food culture while expanding your vocabulary. From sadza to matemba, every dish tells a story of Zimbabwean heritage.",
    category: "Food & Culture",
    orderIndex: 5,
    requiredLevel: 5,
    learningObjectives: [
      "Learn food and cooking vocabulary",
      "Understand traditional Shona meals",
      "Practice giving and following cooking instructions"
    ],
    discoveryElements: [
      "Explore traditional Shona ingredients",
      "Discover the cultural significance of different foods",
      "Learn about seasonal eating patterns",
      "Understand the social aspects of communal meals"
    ],
    collaborativeElements: [
      "Share recipes from your own culture",
      "Cook virtual meals together with other learners",
      "Create a collaborative Shona cookbook",
      "Practice food-related conversations"
    ],
    intrinsicRewards: [
      "Connect with Shona culture through food",
      "Feel the warmth of sharing meals",
      "Experience culinary traditions firsthand",
      "Build confidence in practical conversations"
    ],
    lessons: ["lesson-9", "lesson-10", "lesson-11"]
  },
  {
    id: "quest-6",
    title: "Rhythms of the Ancestors",
    description: "Learn Shona through traditional music, dance, and oral storytelling",
    storyNarrative: "The village musicians are preparing for a celebration, and they need your help! You'll learn traditional Shona songs, understand the meanings behind the lyrics, and discover how music preserves cultural memory. The mbira's notes will guide your language learning journey.",
    category: "Music & Arts",
    orderIndex: 6,
    requiredLevel: 6,
    learningObjectives: [
      "Learn music and dance vocabulary",
      "Understand traditional Shona songs",
      "Practice rhythm and intonation through music"
    ],
    discoveryElements: [
      "Explore traditional Shona instruments",
      "Discover the role of music in ceremonies",
      "Learn about praise singers and their art",
      "Understand how music preserves history"
    ],
    collaborativeElements: [
      "Sing traditional songs together",
      "Share musical traditions from your culture",
      "Create modern versions of traditional songs",
      "Practice musical storytelling"
    ],
    intrinsicRewards: [
      "Feel the power of musical expression",
      "Connect with ancestral wisdom",
      "Experience the joy of communal singing",
      "Discover your own musical voice in Shona"
    ],
    lessons: ["lesson-12", "lesson-13", "lesson-14"]
  },
  {
    id: "quest-7",
    title: "Safari Stories",
    description: "Explore Zimbabwe's wildlife and nature through Shona vocabulary and legends",
    storyNarrative: "You're accompanying a village elder on a journey through the bush. As you encounter different animals and landscapes, you'll learn their Shona names and hear ancient stories about each creature. From the mighty elephant to the clever hare, every animal has lessons to teach.",
    category: "Nature & Wildlife",
    orderIndex: 7,
    requiredLevel: 7,
    learningObjectives: [
      "Learn animal and nature vocabulary",
      "Understand traditional animal stories",
      "Practice descriptive language about landscapes"
    ],
    discoveryElements: [
      "Explore Zimbabwe's diverse ecosystems",
      "Discover traditional animal folklore",
      "Learn about conservation in Shona culture",
      "Understand the spiritual significance of animals"
    ],
    collaborativeElements: [
      "Share animal stories from your culture",
      "Create nature photo descriptions in Shona",
      "Practice wildlife guiding scenarios",
      "Build a collaborative nature dictionary"
    ],
    intrinsicRewards: [
      "Connect with Zimbabwe's natural beauty",
      "Feel the wisdom of traditional stories",
      "Experience the wonder of wildlife",
      "Develop environmental awareness"
    ],
    lessons: ["lesson-15", "lesson-16", "lesson-17"]
  },
  {
    id: "quest-8",
    title: "Hands of Creation",
    description: "Learn traditional Shona crafts and the vocabulary of skilled artisans",
    storyNarrative: "Master craftspeople have opened their workshops to you. You'll learn about pottery, basket weaving, wood carving, and stone sculpture while discovering the vocabulary of creation. Each craft carries generations of knowledge and cultural meaning.",
    category: "Traditional Crafts",
    orderIndex: 8,
    requiredLevel: 8,
    learningObjectives: [
      "Learn craft and tool vocabulary",
      "Understand traditional art forms",
      "Practice giving and receiving instructions"
    ],
    discoveryElements: [
      "Explore different traditional crafts",
      "Discover the cultural meanings of patterns",
      "Learn about the history of Shona sculpture",
      "Understand the role of crafts in daily life"
    ],
    collaborativeElements: [
      "Share craft traditions from your culture",
      "Describe artistic processes together",
      "Create virtual craft workshops",
      "Practice art critique vocabulary"
    ],
    intrinsicRewards: [
      "Appreciate the beauty of handmade items",
      "Feel connected to artistic traditions",
      "Experience the satisfaction of creation",
      "Develop aesthetic vocabulary"
    ],
    lessons: ["lesson-18", "lesson-19", "lesson-20"]
  },
  {
    id: "quest-9",
    title: "Modern Conversations",
    description: "Navigate contemporary Shona life through technology, business, and urban experiences",
    storyNarrative: "You're visiting Harare, Zimbabwe's capital, where traditional and modern life blend seamlessly. You'll learn to navigate city life, use technology, and engage in business conversations while discovering how Shona adapts to the modern world.",
    category: "Modern Life",
    orderIndex: 9,
    requiredLevel: 9,
    learningObjectives: [
      "Learn modern and technology vocabulary",
      "Understand urban vs. rural language differences",
      "Practice professional and business conversations"
    ],
    discoveryElements: [
      "Explore how languages evolve with technology",
      "Discover Shona in digital spaces",
      "Learn about contemporary Zimbabwean culture",
      "Understand generational language differences"
    ],
    collaborativeElements: [
      "Practice phone and video conversations",
      "Share modern technology experiences",
      "Create business scenario role-plays",
      "Build professional networking skills"
    ],
    intrinsicRewards: [
      "Feel confident in modern contexts",
      "Bridge traditional and contemporary culture",
      "Connect with younger generations",
      "Develop professional language skills"
    ],
    lessons: ["lesson-21", "lesson-22", "lesson-23"]
  },
  {
    id: "quest-10",
    title: "Celebration Ceremonies",
    description: "Participate in traditional Shona ceremonies and celebrations",
    storyNarrative: "The village is preparing for a major celebration - a wedding, harvest festival, or coming-of-age ceremony. You'll learn the special vocabulary, customs, and phrases associated with these important life events while understanding their deep cultural significance.",
    category: "Ceremonies & Celebrations",
    orderIndex: 10,
    requiredLevel: 10,
    learningObjectives: [
      "Learn ceremony and celebration vocabulary",
      "Understand cultural customs and traditions",
      "Practice formal and respectful language"
    ],
    discoveryElements: [
      "Explore different types of ceremonies",
      "Discover the spiritual aspects of celebrations",
      "Learn about traditional costumes and decorations",
      "Understand the role of community in ceremonies"
    ],
    collaborativeElements: [
      "Share celebration traditions from your culture",
      "Practice ceremonial speeches and toasts",
      "Create virtual celebration experiences",
      "Learn traditional games and activities"
    ],
    intrinsicRewards: [
      "Feel part of the community celebration",
      "Experience the joy of shared traditions",
      "Understand deeper cultural values",
      "Build meaningful cultural connections"
    ],
    lessons: ["lesson-24", "lesson-25", "lesson-26"]
  },
  {
    id: "quest-11",
    title: "Legends of the Land",
    description: "Discover Shona history and mythology through ancient stories and legends",
    storyNarrative: "An elderly storyteller by the fire begins to share the great legends of the Shona people. You'll learn about ancient kingdoms, heroic figures, and mythical creatures while developing advanced language skills through narrative and complex vocabulary.",
    category: "History & Legends",
    orderIndex: 11,
    requiredLevel: 11,
    learningObjectives: [
      "Learn historical and mythological vocabulary",
      "Understand complex narrative structures",
      "Practice storytelling techniques"
    ],
    discoveryElements: [
      "Explore Great Zimbabwe and other historical sites",
      "Discover traditional Shona spiritual beliefs",
      "Learn about ancestral reverence",
      "Understand the role of oral tradition"
    ],
    collaborativeElements: [
      "Share legends from your own culture",
      "Practice retelling stories in Shona",
      "Create modern versions of ancient tales",
      "Build collaborative story collections"
    ],
    intrinsicRewards: [
      "Connect with ancient wisdom",
      "Feel the power of storytelling",
      "Experience cultural continuity",
      "Develop narrative skills"
    ],
    lessons: ["lesson-27", "lesson-28", "lesson-29"]
  },
  {
    id: "quest-12",
    title: "Master Conversationalist",
    description: "Achieve fluency through complex discussions and debates on various topics",
    storyNarrative: "You've been invited to join the village council discussions where important matters are debated. This is your chance to demonstrate mastery of Shona by engaging in complex conversations about politics, philosophy, social issues, and community planning.",
    category: "Advanced Fluency",
    orderIndex: 12,
    requiredLevel: 12,
    learningObjectives: [
      "Master complex grammatical structures",
      "Engage in sophisticated discussions",
      "Express abstract concepts and opinions"
    ],
    discoveryElements: [
      "Explore advanced rhetoric and persuasion",
      "Discover philosophical concepts in Shona",
      "Learn about traditional governance systems",
      "Understand contemporary social issues"
    ],
    collaborativeElements: [
      "Participate in structured debates",
      "Lead group discussions on various topics",
      "Mentor newer learners",
      "Contribute to community decision-making"
    ],
    intrinsicRewards: [
      "Feel the confidence of true fluency",
      "Experience intellectual engagement",
      "Contribute meaningfully to discussions",
      "Achieve mastery of the language"
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