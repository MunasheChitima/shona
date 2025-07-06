// Comprehensive Lesson Integration Script
// Combines all lesson plans into a complete 60-lesson curriculum

const { PrismaClient } = require('@prisma/client')
const { comprehensiveLessons, learningQuests } = require('./comprehensive-lesson-plans')
const { extendedLessons } = require('./extended-lesson-plans')

const prisma = new PrismaClient()

// Combine all lesson plans
const allLessons = [
  ...comprehensiveLessons,
  ...extendedLessons,
  // Add remaining lessons to fill gaps
  ...generateRemainingLessons()
]

function generateRemainingLessons() {
  // Fill any gaps in the lesson sequence
  const remainingLessons = [
    // Beginner Level Completion (Lessons 11-20)
    {
      title: "Home & Living Spaces",
      description: "Vocabulary for household items and living spaces",
      category: "Beginner",
      orderIndex: 11,
      xpReward: 15,
      learningObjectives: [
        "Name rooms and household items",
        "Describe living spaces",
        "Express preferences about homes",
        "Understand traditional vs. modern housing"
      ],
      discoveryElements: [
        "Explore traditional Shona homesteads",
        "Discover the significance of different spaces",
        "Learn about hospitality customs"
      ],
      exercises: [
        {
          type: "multiple_choice",
          question: "What is 'kitchen' in Shona?",
          correctAnswer: "Kicheni",
          options: ["Kicheni", "Imba", "Ruum", "Bhafuroom"],
          shonaPhrase: "Kicheni",
          audioText: "Kee-cheh-nee",
          points: 5
        },
        {
          type: "exploration",
          question: "How does the layout of a traditional homestead reflect family values?",
          correctAnswer: "Spaces are organized around family hierarchy and social functions",
          options: [],
          points: 15,
          discoveryHint: "Consider how different spaces serve different family members"
        }
      ]
    },

    {
      title: "Shopping & Commerce",
      description: "Learn vocabulary for shopping and commercial interactions",
      category: "Beginner",
      orderIndex: 12,
      xpReward: 15,
      learningObjectives: [
        "Use shopping vocabulary effectively",
        "Negotiate prices and quantities",
        "Express needs and preferences",
        "Understand commercial customs"
      ],
      discoveryElements: [
        "Explore traditional and modern markets",
        "Discover bargaining customs",
        "Learn about commercial relationships"
      ],
      exercises: [
        {
          type: "translation",
          question: "How do you ask 'How much does this cost?'",
          correctAnswer: "Izvi zvinodhura marii?",
          options: [],
          englishPhrase: "How much does this cost?",
          shonaPhrase: "Izvi zvinodhura marii?",
          audioText: "Ee-zvee zvee-noh-dhoo-rah mah-ree-ee",
          points: 10
        }
      ]
    },

    {
      title: "Education & Learning",
      description: "Vocabulary for educational contexts and learning",
      category: "Beginner",
      orderIndex: 13,
      xpReward: 15,
      learningObjectives: [
        "Use educational vocabulary",
        "Discuss learning and teaching",
        "Express academic interests",
        "Understand educational systems"
      ],
      discoveryElements: [
        "Explore traditional and modern education",
        "Discover learning methods in Shona culture",
        "Learn about educational values"
      ],
      exercises: [
        {
          type: "matching",
          question: "Match educational terms",
          correctAnswer: "Chikoro-School",
          options: ["Chikoro-School", "Mukoti-Student", "Mudzidzisi-Teacher", "Bhuku-Book"],
          points: 8
        }
      ]
    },

    // Intermediate Level Completion (Lessons 29-40)
    {
      title: "Communication & Media",
      description: "Modern communication methods and media literacy",
      category: "Intermediate",
      orderIndex: 29,
      xpReward: 20,
      learningObjectives: [
        "Use communication technology vocabulary",
        "Understand media formats",
        "Express ideas through different media",
        "Navigate digital communication"
      ],
      discoveryElements: [
        "Explore how communication has evolved",
        "Discover the role of media in society",
        "Learn about responsible communication"
      ],
      exercises: [
        {
          type: "exploration",
          question: "How has mobile technology changed communication in Zimbabwe?",
          correctAnswer: "Increased connectivity and access to information",
          options: [],
          points: 20,
          discoveryHint: "Consider both positive and negative impacts"
        }
      ]
    },

    {
      title: "Sports & Recreation",
      description: "Vocabulary for sports, games, and recreational activities",
      category: "Intermediate",
      orderIndex: 30,
      xpReward: 20,
      learningObjectives: [
        "Name sports and recreational activities",
        "Discuss participation and preferences",
        "Understand cultural attitudes toward sports",
        "Express enthusiasm and competition"
      ],
      discoveryElements: [
        "Explore traditional games and sports",
        "Discover the role of sports in community",
        "Learn about modern sports culture"
      ],
      exercises: [
        {
          type: "multiple_choice",
          question: "What is 'football' (soccer) in Shona?",
          correctAnswer: "Nhabvu",
          options: ["Nhabvu", "Netibhori", "Rugbhi", "Tenisi"],
          shonaPhrase: "Nhabvu",
          audioText: "N-hah-bvoo",
          points: 6
        }
      ]
    },

    // Advanced Level Completion (Lessons 56-59)
    {
      title: "Philosophy & Worldview",
      description: "Exploring Shona philosophy and worldview concepts",
      category: "Advanced",
      orderIndex: 56,
      xpReward: 35,
      learningObjectives: [
        "Understand philosophical concepts in Shona",
        "Express complex worldview ideas",
        "Appreciate intellectual traditions",
        "Engage in philosophical discussions"
      ],
      discoveryElements: [
        "Explore Shona philosophical traditions",
        "Discover intellectual heritage",
        "Learn about contemporary philosophical thought"
      ],
      exercises: [
        {
          type: "exploration",
          question: "How does the concept of 'ubuntu' relate to individual and community?",
          correctAnswer: "Emphasizes interconnectedness and shared humanity",
          options: [],
          points: 25,
          discoveryHint: "Consider the balance between individual and collective identity"
        }
      ]
    },

    {
      title: "Arts & Creative Expression",
      description: "Advanced exploration of artistic and creative vocabulary",
      category: "Advanced",
      orderIndex: 57,
      xpReward: 35,
      learningObjectives: [
        "Use artistic vocabulary effectively",
        "Discuss creative processes",
        "Appreciate aesthetic concepts",
        "Express artistic judgment"
      ],
      discoveryElements: [
        "Explore traditional and contemporary arts",
        "Discover artistic movements and styles",
        "Learn about creative expression in Shona culture"
      ],
      exercises: [
        {
          type: "collaboration",
          question: "Create and present an artistic work that expresses Shona cultural values",
          correctAnswer: "Completed creative project",
          options: [],
          points: 30,
          intrinsicFeedback: "Creative expression deepens cultural understanding!"
        }
      ]
    },

    {
      title: "Leadership & Governance",
      description: "Understanding leadership concepts and governance vocabulary",
      category: "Advanced",
      orderIndex: 58,
      xpReward: 35,
      learningObjectives: [
        "Use leadership and governance vocabulary",
        "Understand traditional and modern governance",
        "Express civic responsibility",
        "Navigate political discussions"
      ],
      discoveryElements: [
        "Explore traditional leadership structures",
        "Discover modern governance systems",
        "Learn about civic participation"
      ],
      exercises: [
        {
          type: "exploration",
          question: "How do traditional leadership principles apply to modern governance?",
          correctAnswer: "Wisdom, consultation, and service to community",
          options: [],
          points: 25,
          discoveryHint: "Consider values that transcend time periods"
        }
      ]
    },

    {
      title: "Global Connections & Cultural Exchange",
      description: "Connecting Shona culture with global perspectives",
      category: "Advanced",
      orderIndex: 59,
      xpReward: 35,
      learningObjectives: [
        "Express cultural identity in global contexts",
        "Understand cross-cultural communication",
        "Appreciate cultural diversity",
        "Serve as cultural ambassadors"
      ],
      discoveryElements: [
        "Explore Shona culture's global connections",
        "Discover cultural exchange opportunities",
        "Learn about cultural diplomacy"
      ],
      exercises: [
        {
          type: "collaboration",
          question: "Organize a cultural exchange presentation with learners from other cultures",
          correctAnswer: "Completed cultural exchange project",
          options: [],
          points: 35,
          intrinsicFeedback: "You are now a bridge between cultures!"
        }
      ]
    }
  ]

  return remainingLessons
}

// Enhanced quest system with more detailed narratives
const enhancedQuests = [
  ...learningQuests,
  {
    title: "The Urban Return",
    description: "A young professional returns to Zimbabwe and navigates modern urban life",
    storyNarrative: "Tawanda returns to Harare after studying abroad. Help him navigate modern urban Zimbabwe while maintaining his cultural identity. Learn contemporary vocabulary and urban culture.",
    category: "Modern Life",
    orderIndex: 4,
    requiredLevel: 15,
    collaborativeElements: [
      "Discuss modern career challenges",
      "Share urban vs. rural experiences",
      "Practice professional networking language"
    ],
    intrinsicRewards: [
      "Develop confidence in professional contexts",
      "Balance tradition with modernity",
      "Build contemporary communication skills"
    ]
  },
  {
    title: "The Cultural Bridge",
    description: "Become a cultural interpreter and bridge builder",
    storyNarrative: "As a cultural interpreter, help visitors understand Shona culture while sharing your own cultural insights. Master the art of cultural translation and bridge-building.",
    category: "Cultural Leadership",
    orderIndex: 5,
    requiredLevel: 25,
    collaborativeElements: [
      "Lead cultural exchange sessions",
      "Mentor new learners",
      "Create cultural learning materials"
    ],
    intrinsicRewards: [
      "Develop leadership skills",
      "Experience the joy of teaching",
      "Build cultural confidence"
    ]
  }
]

// Comprehensive seeding function
async function seedAllLessons() {
  console.log('🌱 Starting comprehensive lesson seeding...')
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.exercise.deleteMany()
    await prisma.lesson.deleteMany()
    await prisma.questProgress.deleteMany()
    await prisma.quest.deleteMany()
    
    // Create enhanced quests
    console.log('🗺️  Creating enhanced quests...')
    for (const questData of enhancedQuests) {
      // Convert arrays to JSON strings for Prisma
      const questDataFormatted = {
        ...questData,
        collaborativeElements: JSON.stringify(questData.collaborativeElements),
        intrinsicRewards: JSON.stringify(questData.intrinsicRewards)
      }
      await prisma.quest.create({
        data: questDataFormatted
      })
    }
    
    // Sort lessons by order index
    const sortedLessons = allLessons.sort((a, b) => a.orderIndex - b.orderIndex)
    
    // Create lessons with exercises
    console.log('📚 Creating comprehensive lessons...')
    for (const lessonData of sortedLessons) {
      const { exercises, ...lesson } = lessonData
      
      console.log(`   Creating lesson ${lesson.orderIndex}: ${lesson.title}`)
      
      // Convert arrays to JSON strings for Prisma
      const lessonDataFormatted = {
        ...lesson,
        learningObjectives: JSON.stringify(lesson.learningObjectives || []),
        discoveryElements: JSON.stringify(lesson.discoveryElements || [])
      }
      
      const createdLesson = await prisma.lesson.create({
        data: lessonDataFormatted
      })
      
      if (exercises && exercises.length > 0) {
        for (const exercise of exercises) {
          // Convert arrays to JSON strings for Prisma
          const exerciseDataFormatted = {
            ...exercise,
            options: JSON.stringify(exercise.options || []),
            lessonId: createdLesson.id
          }
          await prisma.exercise.create({
            data: exerciseDataFormatted
          })
        }
      }
    }
    
    console.log('✅ Comprehensive lesson seeding completed successfully!')
    console.log(`📊 Created ${sortedLessons.length} lessons across ${enhancedQuests.length} quests`)
    
    // Generate summary report
    const summary = generateSummaryReport(sortedLessons, enhancedQuests)
    console.log('\n' + summary)
    
  } catch (error) {
    console.error('❌ Error seeding lessons:', error)
    throw error
  }
}

function generateSummaryReport(lessons, quests) {
  const categories = {}
  lessons.forEach(lesson => {
    if (!categories[lesson.category]) {
      categories[lesson.category] = []
    }
    categories[lesson.category].push(lesson)
  })
  
  let report = '📋 LESSON PLAN SUMMARY REPORT\n'
  report += '='.repeat(50) + '\n\n'
  
  // Quest summary
  report += '🗺️  QUEST SYSTEM:\n'
  quests.forEach(quest => {
    report += `   • ${quest.title} (Level ${quest.requiredLevel}+): ${quest.description}\n`
  })
  report += '\n'
  
  // Category breakdown
  report += '📚 LESSON CATEGORIES:\n'
  Object.entries(categories).forEach(([category, categoryLessons]) => {
    report += `   • ${category}: ${categoryLessons.length} lessons\n`
  })
  report += '\n'
  
  // Learning progression
  report += '🎯 LEARNING PROGRESSION:\n'
  report += '   • Beginner (1-20): Foundation vocabulary, basic communication\n'
  report += '   • Intermediate (21-40): Grammar, conversation, cultural context\n'
  report += '   • Advanced (41-60): Literature, professional use, cultural mastery\n'
  report += '\n'
  
  // Feature highlights
  report += '⭐ KEY FEATURES:\n'
  report += '   • Cultural integration throughout all lessons\n'
  report += '   • Intrinsic motivation design\n'
  report += '   • Discovery-based learning\n'
  report += '   • Social collaboration exercises\n'
  report += '   • Voice and pronunciation focus\n'
  report += '   • Quest-based narrative learning\n'
  report += '   • Regional dialect awareness\n'
  report += '   • Modern and traditional vocabulary\n'
  report += '\n'
  
  report += '🚀 Ready to launch comprehensive Shona language learning!'
  
  return report
}

// Export for use
module.exports = {
  seedAllLessons,
  allLessons,
  enhancedQuests,
  generateSummaryReport
}

// Run if called directly
if (require.main === module) {
  seedAllLessons()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
}