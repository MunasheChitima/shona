// Comprehensive Shona Language Learning Lesson Plans
// Building on existing foundation with structured progression from beginner to advanced

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Lesson Plan Structure:
// Beginner Level (Lessons 1-20): Basic communication, pronunciation, core vocabulary
// Intermediate Level (Lessons 21-40): Grammar, conversation, cultural context
// Advanced Level (Lessons 41-60): Literature, complex grammar, cultural immersion

const comprehensiveLessons = [
  // === BEGINNER LEVEL (Lessons 1-20) ===
  
  // Week 1: Foundation & Greetings
  {
    title: "Greetings & Basic Interactions",
    description: "Master essential Shona greetings and social interactions",
    category: "Beginner",
    orderIndex: 1,
    xpReward: 15,
    learningObjectives: [
      "Use appropriate greetings for different times of day",
      "Respond to 'How are you?' questions",
      "Express basic politeness and thanks",
      "Understand cultural context of greetings"
    ],
    discoveryElements: [
      "Explore how greetings vary by region in Zimbabwe",
      "Discover the cultural significance of respectful greetings",
      "Learn about handshake customs in Shona culture"
    ],
    exercises: [
      {
        type: "multiple_choice",
        question: "What is the most appropriate greeting for morning?",
        correctAnswer: "Mangwanani",
        options: ["Mangwanani", "Masikati", "Manheru", "Mhoro"],
        shonaPhrase: "Mangwanani",
        audioText: "Mah-ngwah-nah-nee",
        points: 5,
        intrinsicFeedback: "Great! You're building foundational communication skills",
        discoveryHint: "Notice how the tone rises at the end - this shows respect"
      },
      {
        type: "exploration",
        question: "Explore: How would you greet an elder vs. a peer?",
        correctAnswer: "Use formal language with elders, casual with peers",
        options: [],
        points: 10,
        intrinsicFeedback: "Excellent cultural awareness!",
        discoveryHint: "Think about respect levels in different relationships"
      },
      {
        type: "collaboration",
        question: "Practice greeting exchanges with a study partner",
        correctAnswer: "Completed interaction",
        options: [],
        points: 15,
        intrinsicFeedback: "Social learning enhances retention!"
      }
    ]
  },

  {
    title: "Numbers & Time",
    description: "Learn to count and express time in Shona",
    category: "Beginner",
    orderIndex: 2,
    xpReward: 15,
    learningObjectives: [
      "Count from 1-100 in Shona",
      "Express time and dates",
      "Use numbers in practical contexts",
      "Understand Shona number system patterns"
    ],
    discoveryElements: [
      "Explore traditional Shona counting methods",
      "Discover how numbers are used in proverbs",
      "Learn about market bargaining with numbers"
    ],
    exercises: [
      {
        type: "multiple_choice",
        question: "What is twenty in Shona?",
        correctAnswer: "Makumi maviri",
        options: ["Gumi", "Makumi maviri", "Makumi matatu", "Zana"],
        shonaPhrase: "Makumi maviri",
        audioText: "Mah-koo-mee mah-vee-ree",
        points: 5
      },
      {
        type: "exploration",
        question: "How do you think large numbers are formed in Shona?",
        correctAnswer: "Following patterns of tens and hundreds",
        options: [],
        points: 10,
        discoveryHint: "Look for patterns in how 'makumi' (tens) combines with other numbers"
      }
    ]
  },

  {
    title: "Family & Relationships",
    description: "Vocabulary for family members and social relationships",
    category: "Beginner",
    orderIndex: 3,
    xpReward: 15,
    learningObjectives: [
      "Name immediate and extended family members",
      "Understand respectful terms for relationships",
      "Use appropriate titles for different ages",
      "Express family relationships in sentences"
    ],
    discoveryElements: [
      "Explore extended family structures in Shona culture",
      "Discover respectful ways to address family members",
      "Learn about traditional family roles"
    ],
    exercises: [
      {
        type: "matching",
        question: "Match family members with their English equivalents",
        correctAnswer: "Amai-Mother",
        options: ["Amai-Mother", "Baba-Father", "Mwana-Child", "Gogo-Grandmother"],
        points: 8
      },
      {
        type: "translation",
        question: "How do you say 'My grandmother is kind'?",
        correctAnswer: "Gogo wangu akanaka",
        options: [],
        shonaPhrase: "Gogo wangu akanaka",
        englishPhrase: "My grandmother is kind",
        audioText: "Goh-goh wah-ngoo ah-kah-nah-kah",
        points: 10
      }
    ]
  },

  {
    title: "Food & Meals",
    description: "Essential vocabulary for food and dining",
    category: "Beginner",
    orderIndex: 4,
    xpReward: 15,
    learningObjectives: [
      "Name common Shona foods and dishes",
      "Express hunger, thirst, and food preferences",
      "Use polite expressions when eating",
      "Understand meal customs and etiquette"
    ],
    discoveryElements: [
      "Explore traditional Shona cooking methods",
      "Discover the cultural significance of sharing meals",
      "Learn about seasonal foods and their preparation"
    ],
    exercises: [
      {
        type: "multiple_choice",
        question: "What is the staple food of Zimbabwe?",
        correctAnswer: "Sadza",
        options: ["Rice", "Sadza", "Bread", "Pasta"],
        shonaPhrase: "Sadza",
        audioText: "Sah-dzah",
        points: 5
      },
      {
        type: "exploration",
        question: "What role does sadza play in Shona culture beyond nutrition?",
        correctAnswer: "It's a symbol of unity and sharing",
        options: [],
        points: 12,
        discoveryHint: "Think about how meals bring people together"
      }
    ]
  },

  {
    title: "Basic Verbs & Actions",
    description: "Essential action words for daily communication",
    category: "Beginner",
    orderIndex: 5,
    xpReward: 15,
    learningObjectives: [
      "Use common verbs in present tense",
      "Express daily activities and routines",
      "Form simple sentences with verbs",
      "Understand verb conjugation basics"
    ],
    discoveryElements: [
      "Explore how verbs change with different subjects",
      "Discover the rhythm of Shona verb patterns",
      "Learn about action words in traditional activities"
    ],
    exercises: [
      {
        type: "translation",
        question: "Translate: 'I want to eat'",
        correctAnswer: "Ndino da kudya",
        options: [],
        englishPhrase: "I want to eat",
        shonaPhrase: "Ndino da kudya",
        audioText: "Ndee-noh-dah koo-dyah",
        points: 8
      },
      {
        type: "multiple_choice",
        question: "What does 'Ndino enda' mean?",
        correctAnswer: "I am going",
        options: ["I am eating", "I am going", "I am sleeping", "I am working"],
        shonaPhrase: "Ndino enda",
        audioText: "Ndee-noh en-dah",
        points: 6
      }
    ]
  },

  // === INTERMEDIATE LEVEL (Lessons 21-40) ===
  
  {
    title: "Grammar Fundamentals: Sentence Structure",
    description: "Understanding basic Shona sentence patterns",
    category: "Intermediate",
    orderIndex: 21,
    xpReward: 20,
    learningObjectives: [
      "Construct subject-verb-object sentences",
      "Use proper word order in questions",
      "Apply basic grammar rules consistently",
      "Understand sentence rhythm and flow"
    ],
    discoveryElements: [
      "Explore how Shona sentence structure differs from English",
      "Discover the musicality of proper Shona sentences",
      "Learn about emphasis through word placement"
    ],
    exercises: [
      {
        type: "exploration",
        question: "Rearrange these words into a proper Shona sentence: 'sadza / ndino / kudya'",
        correctAnswer: "Ndino kudya sadza",
        options: [],
        points: 12,
        discoveryHint: "Remember: subject comes first, then verb, then object"
      },
      {
        type: "multiple_choice",
        question: "Which sentence is correctly structured?",
        correctAnswer: "Mwana ano gula mukaka",
        options: ["Mwana ano gula mukaka", "Ano mwana mukaka gula", "Mukaka mwana ano gula"],
        points: 10
      }
    ]
  },

  {
    title: "Conversational Patterns",
    description: "Common conversation structures and responses",
    category: "Intermediate",
    orderIndex: 22,
    xpReward: 20,
    learningObjectives: [
      "Engage in basic conversations",
      "Ask and answer personal questions",
      "Use appropriate conversation fillers",
      "Maintain natural conversation flow"
    ],
    discoveryElements: [
      "Explore cultural norms in conversation",
      "Discover polite ways to disagree or ask for clarification",
      "Learn about conversation topics that are culturally appropriate"
    ],
    exercises: [
      {
        type: "collaboration",
        question: "Practice a conversation about your daily routine with a study partner",
        correctAnswer: "Completed conversation exercise",
        options: [],
        points: 20,
        intrinsicFeedback: "Real conversation practice builds confidence!"
      }
    ]
  },

  {
    title: "Cultural Context: Respect & Hierarchy",
    description: "Understanding social dynamics in Shona culture",
    category: "Intermediate",
    orderIndex: 23,
    xpReward: 20,
    learningObjectives: [
      "Use appropriate language for different social levels",
      "Understand when to use formal vs. informal speech",
      "Express respect through language choices",
      "Navigate social situations appropriately"
    ],
    discoveryElements: [
      "Explore the concept of 'rukudzo' (respect) in language",
      "Discover how age and status affect language use",
      "Learn about traditional greetings for different occasions"
    ],
    exercises: [
      {
        type: "exploration",
        question: "How would you address a traditional leader versus a peer?",
        correctAnswer: "Use formal titles and respectful language for leaders",
        options: [],
        points: 15,
        discoveryHint: "Consider the social hierarchy and appropriate titles"
      }
    ]
  },

  {
    title: "Complex Grammar: Tenses & Aspects",
    description: "Past, present, and future tenses in Shona",
    category: "Intermediate",
    orderIndex: 24,
    xpReward: 25,
    learningObjectives: [
      "Form past tense constructions",
      "Use future tense appropriately",
      "Understand continuous vs. completed actions",
      "Express time relationships between events"
    ],
    discoveryElements: [
      "Explore how Shona handles time differently than English",
      "Discover the subtleties of aspect in Shona verbs",
      "Learn about traditional ways of expressing time"
    ],
    exercises: [
      {
        type: "translation",
        question: "Translate: 'I was eating yesterday'",
        correctAnswer: "Ndai kudya nezuro",
        options: [],
        englishPhrase: "I was eating yesterday",
        shonaPhrase: "Ndai kudya nezuro",
        audioText: "Ndah-ee koo-dyah neh-zoo-roh",
        points: 12
      }
    ]
  },

  // === ADVANCED LEVEL (Lessons 41-60) ===
  
  {
    title: "Traditional Stories & Literature",
    description: "Exploring Shona oral tradition and literature",
    category: "Advanced",
    orderIndex: 41,
    xpReward: 30,
    learningObjectives: [
      "Understand traditional folktales",
      "Analyze literary devices in Shona",
      "Appreciate cultural wisdom in stories",
      "Use advanced vocabulary from literature"
    ],
    discoveryElements: [
      "Explore the role of storytelling in Shona culture",
      "Discover moral lessons in traditional tales",
      "Learn about famous Shona authors and their works"
    ],
    exercises: [
      {
        type: "exploration",
        question: "Read this proverb: 'Chakafukidza dzimba matenga.' What does it teach?",
        correctAnswer: "Every family has its own way of doing things",
        options: [],
        points: 20,
        discoveryHint: "Think about what roofs do for houses and apply metaphorically"
      }
    ]
  },

  {
    title: "Business & Professional Communication",
    description: "Formal Shona for professional settings",
    category: "Advanced",
    orderIndex: 42,
    xpReward: 30,
    learningObjectives: [
      "Use formal business language",
      "Write professional communications",
      "Understand workplace etiquette",
      "Navigate professional relationships"
    ],
    discoveryElements: [
      "Explore modern Shona business vocabulary",
      "Discover how traditional respect translates to modern workplaces",
      "Learn about code-switching between formal and informal contexts"
    ],
    exercises: [
      {
        type: "translation",
        question: "Write a formal greeting for a business letter",
        correctAnswer: "Ndinotenda kwazvo nekuteerera kwenyu",
        options: [],
        points: 15
      }
    ]
  },

  {
    title: "Regional Variations & Dialects",
    description: "Understanding different Shona dialects",
    category: "Advanced",
    orderIndex: 43,
    xpReward: 30,
    learningObjectives: [
      "Recognize major Shona dialects",
      "Understand regional vocabulary differences",
      "Appreciate linguistic diversity within Shona",
      "Adapt communication to different regions"
    ],
    discoveryElements: [
      "Explore how geography affects language",
      "Discover the historical reasons for dialectal differences",
      "Learn about the standardization of Shona"
    ],
    exercises: [
      {
        type: "exploration",
        question: "Compare how 'water' is said in different regions",
        correctAnswer: "Mvura (standard), but pronunciation varies",
        options: [],
        points: 18,
        discoveryHint: "Listen for tonal and pronunciation differences"
      }
    ]
  },

  // === SPECIALIZED LESSONS ===
  
  {
    title: "Music & Poetry in Shona",
    description: "Exploring artistic expression in Shona",
    category: "Cultural",
    orderIndex: 50,
    xpReward: 25,
    learningObjectives: [
      "Understand song lyrics and their meanings",
      "Appreciate poetic devices in Shona",
      "Learn about traditional and modern music",
      "Express creativity through language"
    ],
    discoveryElements: [
      "Explore the role of music in Shona culture",
      "Discover how rhythm affects meaning",
      "Learn about praise poetry and its traditions"
    ],
    exercises: [
      {
        type: "exploration",
        question: "Listen to a traditional Shona song. What story does it tell?",
        correctAnswer: "Varies by song - focus on cultural themes",
        options: [],
        points: 20
      }
    ]
  },

  {
    title: "Contemporary Issues & Modern Vocabulary",
    description: "Shona for discussing current events and modern life",
    category: "Modern",
    orderIndex: 51,
    xpReward: 25,
    learningObjectives: [
      "Use modern technological vocabulary",
      "Discuss contemporary social issues",
      "Understand media language",
      "Express opinions on current events"
    ],
    discoveryElements: [
      "Explore how Shona adapts to modern concepts",
      "Discover new words entering the language",
      "Learn about language policy and planning"
    ],
    exercises: [
      {
        type: "translation",
        question: "How would you say 'social media' in Shona?",
        correctAnswer: "Vatindi venhau (news networks) or borrowed term",
        options: [],
        points: 15
      }
    ]
  }
]

// Quest-based learning paths
const learningQuests = [
  {
    title: "The Village Journey",
    description: "Follow Chipo as she returns to her grandmother's village",
    storyNarrative: "Chipo, a young woman from the city, travels to her grandmother's rural village. Through her journey, learn about traditional Shona life, customs, and language.",
    category: "Cultural Immersion",
    orderIndex: 1,
    requiredLevel: 1,
    collaborativeElements: [
      "Share family stories with other learners",
      "Compare urban vs. rural vocabulary",
      "Discuss cultural practices together"
    ],
    intrinsicRewards: [
      "Discover your own cultural connections",
      "Build confidence in cultural understanding",
      "Experience the joy of storytelling"
    ]
  },
  {
    title: "The Market Day Adventure",
    description: "Navigate a traditional Zimbabwean market",
    storyNarrative: "Learn to bargain, buy food, and interact with vendors at a bustling traditional market. Master practical vocabulary while experiencing Shona commercial culture.",
    category: "Practical Skills",
    orderIndex: 2,
    requiredLevel: 5,
    collaborativeElements: [
      "Practice bargaining scenarios with partners",
      "Share favorite market foods",
      "Learn regional price differences"
    ],
    intrinsicRewards: [
      "Gain confidence in real-world interactions",
      "Develop practical communication skills",
      "Feel prepared for authentic experiences"
    ]
  },
  {
    title: "The Wisdom Keeper",
    description: "Learn from traditional stories and proverbs",
    storyNarrative: "Meet Sekuru Mukoma, a village elder who shares traditional wisdom through stories and proverbs. Unlock the deeper meanings of Shona culture.",
    category: "Cultural Wisdom",
    orderIndex: 3,
    requiredLevel: 10,
    collaborativeElements: [
      "Share proverbs from your own culture",
      "Interpret story meanings together",
      "Create modern applications of traditional wisdom"
    ],
    intrinsicRewards: [
      "Connect with timeless wisdom",
      "Understand cultural depth",
      "Appreciate the power of oral tradition"
    ]
  }
]

async function seedComprehensiveLessons() {
  console.log('Seeding comprehensive lesson plans...')
  
  // Create quests first
  for (const questData of learningQuests) {
    await prisma.quest.create({
      data: questData
    })
  }
  
  // Create lessons with exercises
  for (const lessonData of comprehensiveLessons) {
    const { exercises, ...lesson } = lessonData
    
    const createdLesson = await prisma.lesson.create({
      data: lesson
    })
    
    if (exercises) {
      for (const exercise of exercises) {
        await prisma.exercise.create({
          data: {
            ...exercise,
            lessonId: createdLesson.id
          }
        })
      }
    }
  }
  
  console.log('Comprehensive lesson plans seeded successfully!')
}

module.exports = {
  comprehensiveLessons,
  learningQuests,
  seedComprehensiveLessons
}