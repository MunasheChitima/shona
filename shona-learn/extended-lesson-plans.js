// Extended Lesson Plans to Complete the 60-Lesson Curriculum
// Specialized lessons covering cultural practices, advanced grammar, and modern usage

const extendedLessons = [
  // === BEGINNER LEVEL CONTINUED (Lessons 6-20) ===
  
  {
    title: "Body Parts & Health",
    description: "Learn vocabulary for body parts and basic health expressions",
    category: "Beginner",
    orderIndex: 6,
    xpReward: 15,
    learningObjectives: [
      "Name basic body parts in Shona",
      "Express pain or discomfort",
      "Ask about health and wellbeing",
      "Understand basic medical vocabulary"
    ],
    discoveryElements: [
      "Explore traditional healing practices",
      "Discover cultural attitudes toward health",
      "Learn about medicinal plants in Shona culture"
    ],
    exercises: [
      {
        type: "multiple_choice",
        question: "What is 'head' in Shona?",
        correctAnswer: "Musoro",
        options: ["Musoro", "Ruoko", "Gumbo", "Meso"],
        shonaPhrase: "Musoro",
        audioText: "Moo-soh-roh",
        points: 5
      },
      {
        type: "translation",
        question: "How do you say 'My stomach hurts'?",
        correctAnswer: "Dumbu rangu rinorwadza",
        options: [],
        englishPhrase: "My stomach hurts",
        shonaPhrase: "Dumbu rangu rinorwadza",
        audioText: "Doom-boo rah-ngoo ree-noh-rwah-dzah",
        points: 10
      },
      {
        type: "exploration",
        question: "What traditional remedies might be used for headaches?",
        correctAnswer: "Herbal medicines and traditional practices",
        options: [],
        points: 12,
        discoveryHint: "Consider natural remedies and traditional knowledge"
      }
    ]
  },

  {
    title: "Clothing & Appearance",
    description: "Vocabulary for clothing, colors, and describing appearance",
    category: "Beginner",
    orderIndex: 7,
    xpReward: 15,
    learningObjectives: [
      "Name common clothing items",
      "Describe colors and patterns",
      "Express preferences about appearance",
      "Understand traditional vs. modern clothing"
    ],
    discoveryElements: [
      "Explore traditional Shona clothing",
      "Discover the significance of colors in culture",
      "Learn about ceremonial dress"
    ],
    exercises: [
      {
        type: "matching",
        question: "Match clothing items with their English names",
        correctAnswer: "Dhirezi-Dress",
        options: ["Dhirezi-Dress", "Bhurugwa-Trousers", "Shangu-Shoes", "Ngowani-Shirt"],
        points: 8
      },
      {
        type: "exploration",
        question: "What do different colors symbolize in Shona culture?",
        correctAnswer: "Various meanings - white for purity, black for mourning, etc.",
        options: [],
        points: 15,
        discoveryHint: "Think about ceremonial and cultural meanings"
      }
    ]
  },

  {
    title: "Weather & Seasons",
    description: "Learn to describe weather and seasonal changes",
    category: "Beginner",
    orderIndex: 8,
    xpReward: 15,
    learningObjectives: [
      "Describe current weather conditions",
      "Name seasons and their characteristics",
      "Express weather preferences",
      "Understand agricultural connections to seasons"
    ],
    discoveryElements: [
      "Explore how seasons affect daily life",
      "Discover traditional agricultural practices",
      "Learn about weather prediction methods"
    ],
    exercises: [
      {
        type: "multiple_choice",
        question: "What is the rainy season called?",
        correctAnswer: "Mwaka wemvura",
        options: ["Mwaka wemvura", "Mwaka wechando", "Mwaka wezuva", "Mwaka wemhepo"],
        shonaPhrase: "Mwaka wemvura",
        audioText: "Mwah-kah weh-mvoo-rah",
        points: 6
      },
      {
        type: "translation",
        question: "Translate: 'It is very hot today'",
        correctAnswer: "Zvinopisa zvikuru nhasi",
        options: [],
        englishPhrase: "It is very hot today",
        shonaPhrase: "Zvinopisa zvikuru nhasi",
        audioText: "Zvee-noh-pee-sah zvee-koo-roo n-hah-see",
        points: 10
      }
    ]
  },

  {
    title: "Transportation & Directions",
    description: "Learn about transportation methods and giving directions",
    category: "Beginner",
    orderIndex: 9,
    xpReward: 15,
    learningObjectives: [
      "Name different modes of transportation",
      "Ask for and give directions",
      "Express travel preferences",
      "Understand urban vs. rural transportation"
    ],
    discoveryElements: [
      "Explore traditional and modern transportation",
      "Discover how geography affects travel",
      "Learn about communal transportation systems"
    ],
    exercises: [
      {
        type: "multiple_choice",
        question: "What is a 'kombi' in Zimbabwean transport?",
        correctAnswer: "Minibus taxi",
        options: ["Bicycle", "Minibus taxi", "Train", "Airplane"],
        shonaPhrase: "Kombi",
        audioText: "Kom-bee",
        points: 5
      },
      {
        type: "translation",
        question: "How do you ask 'Where is the bus stop?'",
        correctAnswer: "Chitori chibhazi chiri kupi?",
        options: [],
        englishPhrase: "Where is the bus stop?",
        shonaPhrase: "Chitori chibhazi chiri kupi?",
        audioText: "Chee-toh-ree chee-bah-zee chee-ree koo-pee",
        points: 12
      }
    ]
  },

  {
    title: "Work & Professions",
    description: "Learn about different jobs and work-related vocabulary",
    category: "Beginner",
    orderIndex: 10,
    xpReward: 15,
    learningObjectives: [
      "Name common professions",
      "Describe work activities",
      "Express career interests",
      "Understand traditional vs. modern work"
    ],
    discoveryElements: [
      "Explore traditional occupations",
      "Discover how work culture varies",
      "Learn about entrepreneurship in Zimbabwe"
    ],
    exercises: [
      {
        type: "matching",
        question: "Match professions with their Shona names",
        correctAnswer: "Chiremba-Doctor",
        options: ["Chiremba-Doctor", "Mudzidzisi-Teacher", "Mufuriri-Farmer", "Muvaki-Builder"],
        points: 8
      },
      {
        type: "exploration",
        question: "What traditional occupations are still important today?",
        correctAnswer: "Farming, traditional healing, crafts, etc.",
        options: [],
        points: 15,
        discoveryHint: "Consider occupations that preserve cultural knowledge"
      }
    ]
  },

  // === INTERMEDIATE LEVEL EXTENDED (Lessons 25-40) ===

  {
    title: "Traditional Ceremonies & Rituals",
    description: "Understanding important Shona ceremonies and their language",
    category: "Intermediate",
    orderIndex: 25,
    xpReward: 20,
    learningObjectives: [
      "Understand ceremony-specific vocabulary",
      "Learn appropriate language for religious/spiritual contexts",
      "Appreciate the role of language in tradition",
      "Express respect during ceremonies"
    ],
    discoveryElements: [
      "Explore different types of ceremonies",
      "Discover the spiritual significance of language",
      "Learn about ancestral communication"
    ],
    exercises: [
      {
        type: "exploration",
        question: "What role does language play in traditional ceremonies?",
        correctAnswer: "Sacred communication, respect, spiritual connection",
        options: [],
        points: 18,
        discoveryHint: "Think about how formal language shows respect to ancestors"
      },
      {
        type: "multiple_choice",
        question: "What is a 'kurova guva' ceremony?",
        correctAnswer: "Bringing the spirit home",
        options: ["Wedding ceremony", "Bringing the spirit home", "Harvest festival", "Naming ceremony"],
        points: 12
      }
    ]
  },

  {
    title: "Agriculture & Rural Life",
    description: "Learn vocabulary related to farming and rural living",
    category: "Intermediate",
    orderIndex: 26,
    xpReward: 20,
    learningObjectives: [
      "Use agricultural vocabulary accurately",
      "Understand seasonal farming practices",
      "Express knowledge about crops and livestock",
      "Appreciate the connection between language and land"
    ],
    discoveryElements: [
      "Explore traditional farming methods",
      "Discover the importance of agriculture in Shona culture",
      "Learn about sustainable farming practices"
    ],
    exercises: [
      {
        type: "translation",
        question: "Translate: 'The maize is ready for harvest'",
        correctAnswer: "Chibage chava chokukohwa",
        options: [],
        englishPhrase: "The maize is ready for harvest",
        shonaPhrase: "Chibage chava chokukohwa",
        audioText: "Chee-bah-geh chah-vah choh-koo-koh-wah",
        points: 12
      },
      {
        type: "exploration",
        question: "How do traditional farming practices connect to environmental conservation?",
        correctAnswer: "Sustainable methods that preserve soil and water",
        options: [],
        points: 20,
        discoveryHint: "Consider traditional knowledge about natural cycles"
      }
    ]
  },

  {
    title: "Music & Dance Traditions",
    description: "Explore musical and dance vocabulary and cultural significance",
    category: "Intermediate",
    orderIndex: 27,
    xpReward: 20,
    learningObjectives: [
      "Name traditional instruments and dances",
      "Understand music's role in communication",
      "Express appreciation for artistic expression",
      "Learn about different musical styles"
    ],
    discoveryElements: [
      "Explore how music tells stories",
      "Discover the spiritual aspects of music",
      "Learn about regional musical variations"
    ],
    exercises: [
      {
        type: "multiple_choice",
        question: "What is a 'mbira' used for?",
        correctAnswer: "Spiritual communication and music",
        options: ["Cooking", "Spiritual communication and music", "Farming", "Transportation"],
        shonaPhrase: "Mbira",
        audioText: "Mbee-rah",
        points: 8
      },
      {
        type: "collaboration",
        question: "Learn a traditional song with a study partner",
        correctAnswer: "Completed song learning exercise",
        options: [],
        points: 25,
        intrinsicFeedback: "Music brings people together across cultures!"
      }
    ]
  },

  {
    title: "Storytelling & Oral Literature",
    description: "Master the art of traditional storytelling",
    category: "Intermediate",
    orderIndex: 28,
    xpReward: 25,
    learningObjectives: [
      "Understand narrative structures in Shona",
      "Use storytelling vocabulary effectively",
      "Appreciate moral lessons in stories",
      "Develop oral presentation skills"
    ],
    discoveryElements: [
      "Explore different types of traditional stories",
      "Discover how stories preserve history",
      "Learn about the role of the storyteller"
    ],
    exercises: [
      {
        type: "exploration",
        question: "Retell a traditional story and explain its moral lesson",
        correctAnswer: "Varies by story chosen",
        options: [],
        points: 25,
        discoveryHint: "Focus on the wisdom and values the story teaches"
      },
      {
        type: "translation",
        question: "Translate the story opening: 'Paivapo nezuva...'",
        correctAnswer: "Once upon a time...",
        options: [],
        shonaPhrase: "Paivapo nezuva...",
        englishPhrase: "Once upon a time...",
        audioText: "Pah-ee-vah-poh neh-zoo-vah",
        points: 10
      }
    ]
  },

  // === ADVANCED LEVEL EXTENDED (Lessons 44-60) ===

  {
    title: "Legal & Administrative Language",
    description: "Formal language for legal and administrative contexts",
    category: "Advanced",
    orderIndex: 44,
    xpReward: 30,
    learningObjectives: [
      "Use formal administrative vocabulary",
      "Understand legal terminology",
      "Navigate bureaucratic language",
      "Express rights and responsibilities"
    ],
    discoveryElements: [
      "Explore how traditional law influences modern systems",
      "Discover the importance of proper formal language",
      "Learn about language rights in Zimbabwe"
    ],
    exercises: [
      {
        type: "translation",
        question: "Translate: 'I need to register for identification'",
        correctAnswer: "Ndinoda kunyoresa kuti ndiwane chitupa",
        options: [],
        englishPhrase: "I need to register for identification",
        shonaPhrase: "Ndinoda kunyoresa kuti ndiwane chitupa",
        audioText: "Ndee-noh-dah koo-nyoh-reh-sah koo-tee ndee-wah-neh chee-too-pah",
        points: 15
      }
    ]
  },

  {
    title: "Healthcare & Medical Communication",
    description: "Advanced medical vocabulary and health system navigation",
    category: "Advanced",
    orderIndex: 45,
    xpReward: 30,
    learningObjectives: [
      "Use complex medical terminology",
      "Discuss symptoms and treatments",
      "Understand health system vocabulary",
      "Bridge traditional and modern medicine"
    ],
    discoveryElements: [
      "Explore integration of traditional and modern medicine",
      "Discover health communication strategies",
      "Learn about medical terminology development"
    ],
    exercises: [
      {
        type: "exploration",
        question: "How do traditional healers and modern doctors communicate?",
        correctAnswer: "Through respectful collaboration and shared terminology",
        options: [],
        points: 20,
        discoveryHint: "Consider how both systems can work together"
      }
    ]
  },

  {
    title: "Technology & Digital Communication",
    description: "Modern vocabulary for technology and digital life",
    category: "Advanced",
    orderIndex: 46,
    xpReward: 30,
    learningObjectives: [
      "Use technology-related vocabulary",
      "Understand digital communication norms",
      "Express technical concepts in Shona",
      "Navigate modern communication platforms"
    ],
    discoveryElements: [
      "Explore how Shona adapts to new technologies",
      "Discover digital communication patterns",
      "Learn about technology access in Zimbabwe"
    ],
    exercises: [
      {
        type: "translation",
        question: "How would you say 'Please send me a WhatsApp message'?",
        correctAnswer: "Ndapota nditumire meseji pa WhatsApp",
        options: [],
        englishPhrase: "Please send me a WhatsApp message",
        shonaPhrase: "Ndapota nditumire meseji pa WhatsApp",
        audioText: "Ndah-poh-tah ndee-too-mee-reh meh-seh-jee pah WhatsApp",
        points: 15
      }
    ]
  },

  {
    title: "Environmental & Conservation Language",
    description: "Vocabulary for environmental issues and conservation",
    category: "Advanced",
    orderIndex: 47,
    xpReward: 30,
    learningObjectives: [
      "Discuss environmental issues in Shona",
      "Use conservation terminology",
      "Express environmental concerns",
      "Understand traditional conservation practices"
    ],
    discoveryElements: [
      "Explore traditional environmental knowledge",
      "Discover modern conservation efforts",
      "Learn about climate change impacts"
    ],
    exercises: [
      {
        type: "exploration",
        question: "What traditional practices help protect the environment?",
        correctAnswer: "Sacred forests, seasonal restrictions, traditional farming",
        options: [],
        points: 25,
        discoveryHint: "Consider how traditional rules protected natural resources"
      }
    ]
  },

  {
    title: "Educational & Academic Language",
    description: "Formal academic vocabulary and educational contexts",
    category: "Advanced",
    orderIndex: 48,
    xpReward: 30,
    learningObjectives: [
      "Use academic vocabulary effectively",
      "Understand educational terminology",
      "Express complex ideas clearly",
      "Navigate formal educational settings"
    ],
    discoveryElements: [
      "Explore the history of Shona education",
      "Discover academic writing conventions",
      "Learn about educational policy in Zimbabwe"
    ],
    exercises: [
      {
        type: "translation",
        question: "Translate: 'I am studying for my degree'",
        correctAnswer: "Ndiri kudzidza kuti ndiwane dhigirii yangu",
        options: [],
        englishPhrase: "I am studying for my degree",
        shonaPhrase: "Ndiri kudzidza kuti ndiwane dhigirii yangu",
        audioText: "Ndee-ree koo-dzee-dzah koo-tee ndee-wah-neh dhee-gee-ree yah-ngoo",
        points: 12
      }
    ]
  },

  {
    title: "Media & Journalism Language",
    description: "Understanding media language and news communication",
    category: "Advanced",
    orderIndex: 49,
    xpReward: 30,
    learningObjectives: [
      "Understand news and media language",
      "Use journalistic vocabulary",
      "Express opinions on current events",
      "Navigate media literacy concepts"
    ],
    discoveryElements: [
      "Explore different media formats in Shona",
      "Discover how news is communicated culturally",
      "Learn about media responsibility"
    ],
    exercises: [
      {
        type: "exploration",
        question: "How do traditional news-sharing methods compare to modern media?",
        correctAnswer: "Community-based vs. technology-based communication",
        options: [],
        points: 20,
        discoveryHint: "Consider how information traveled in traditional communities"
      }
    ]
  },

  // === CULTURAL MASTERY LESSONS (Lessons 52-60) ===

  {
    title: "Cultural Leadership & Mentorship",
    description: "Advanced cultural knowledge for community leadership",
    category: "Cultural Mastery",
    orderIndex: 52,
    xpReward: 35,
    learningObjectives: [
      "Use language appropriate for cultural leadership",
      "Understand mentorship communication",
      "Express cultural knowledge authoritatively",
      "Guide others in cultural learning"
    ],
    discoveryElements: [
      "Explore the role of cultural leaders",
      "Discover mentorship traditions",
      "Learn about cultural preservation"
    ],
    exercises: [
      {
        type: "collaboration",
        question: "Lead a cultural learning session with peers",
        correctAnswer: "Completed leadership exercise",
        options: [],
        points: 30,
        intrinsicFeedback: "Teaching others deepens your own understanding!"
      }
    ]
  },

  {
    title: "Cultural Translation & Interpretation",
    description: "Advanced skills in cultural and linguistic translation",
    category: "Cultural Mastery",
    orderIndex: 53,
    xpReward: 35,
    learningObjectives: [
      "Translate complex cultural concepts",
      "Bridge cultural understanding",
      "Interpret cultural practices for others",
      "Navigate cultural sensitivity"
    ],
    discoveryElements: [
      "Explore the art of cultural translation",
      "Discover untranslatable concepts",
      "Learn about cultural interpretation ethics"
    ],
    exercises: [
      {
        type: "exploration",
        question: "How would you explain 'ubuntu' to someone from another culture?",
        correctAnswer: "Focus on interconnectedness and shared humanity",
        options: [],
        points: 25,
        discoveryHint: "Consider the deep philosophical meaning beyond simple translation"
      }
    ]
  },

  {
    title: "Advanced Dialectical Awareness",
    description: "Mastery of regional variations and dialectical nuances",
    category: "Cultural Mastery",
    orderIndex: 54,
    xpReward: 35,
    learningObjectives: [
      "Navigate different Shona dialects confidently",
      "Understand historical dialectical development",
      "Appreciate linguistic diversity",
      "Communicate effectively across regions"
    ],
    discoveryElements: [
      "Explore historical reasons for dialectical differences",
      "Discover the beauty of linguistic variation",
      "Learn about dialect preservation efforts"
    ],
    exercises: [
      {
        type: "exploration",
        question: "Compare how the same greeting is expressed in different Shona dialects",
        correctAnswer: "Variations in pronunciation and vocabulary",
        options: [],
        points: 20,
        discoveryHint: "Listen for tonal and lexical differences"
      }
    ]
  },

  {
    title: "Cultural Innovation & Adaptation",
    description: "How Shona culture and language evolve and adapt",
    category: "Cultural Mastery",
    orderIndex: 55,
    xpReward: 35,
    learningObjectives: [
      "Understand cultural adaptation processes",
      "Express innovation within tradition",
      "Navigate cultural change sensitively",
      "Contribute to cultural evolution"
    ],
    discoveryElements: [
      "Explore how cultures adapt while preserving core values",
      "Discover examples of successful cultural innovation",
      "Learn about your role in cultural evolution"
    ],
    exercises: [
      {
        type: "exploration",
        question: "How can traditional values be maintained while embracing modern changes?",
        correctAnswer: "Balance innovation with respect for core cultural principles",
        options: [],
        points: 25,
        discoveryHint: "Consider examples of successful cultural adaptation"
      }
    ]
  },

  {
    title: "Master Synthesis: Cultural Fluency",
    description: "Demonstrating complete cultural and linguistic mastery",
    category: "Cultural Mastery",
    orderIndex: 60,
    xpReward: 50,
    learningObjectives: [
      "Demonstrate comprehensive cultural knowledge",
      "Use language with native-like fluency",
      "Navigate all social contexts appropriately",
      "Serve as a cultural bridge for others"
    ],
    discoveryElements: [
      "Reflect on your learning journey",
      "Discover your role as a cultural ambassador",
      "Plan for continued cultural growth"
    ],
    exercises: [
      {
        type: "collaboration",
        question: "Conduct a comprehensive cultural presentation combining all learned elements",
        correctAnswer: "Completed mastery demonstration",
        options: [],
        points: 50,
        intrinsicFeedback: "You have achieved true cultural fluency! You can now serve as a bridge between cultures."
      }
    ]
  }
]

module.exports = {
  extendedLessons
}