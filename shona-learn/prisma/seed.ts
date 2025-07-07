import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.exercise.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.user.deleteMany()
  
  // Create test user for e2e tests
  const bcrypt = require('bcryptjs')
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
      xp: 0,
      streak: 0,
      level: 1,
      hearts: 5
    }
  })
  
  // Create lessons with exercises
  const lessonsData = [
    {
      title: "Greetings & Basics",
      description: "Learn essential Shona greetings",
      category: "Basics",
      orderIndex: 1,
      learningObjectives: JSON.stringify([
        "Master basic Shona greetings",
        "Understand cultural context of greetings",
        "Practice pronunciation with confidence"
      ]),
      discoveryElements: JSON.stringify([
        "Explore different times of day greetings",
        "Discover regional variations"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'Mangwanani' mean?",
          correctAnswer: "Good morning",
          options: JSON.stringify(["Good morning", "Good evening", "Thank you", "Hello"]),
          shonaPhrase: "Mangwanani",
          audioText: "Mah-ngwah-nah-nee"
        },
        {
          type: "multiple_choice",
          question: "How do you say 'Good afternoon' in Shona?",
          correctAnswer: "Masikati",
          options: JSON.stringify(["Manheru", "Masikati", "Mangwanani", "Ndatenda"]),
          englishPhrase: "Good afternoon",
          audioText: "Mah-see-kah-tee"
        },
        {
          type: "translation",
          question: "Translate to English: Manheru",
          correctAnswer: "Good evening",
          options: JSON.stringify([]),
          shonaPhrase: "Manheru",
          englishPhrase: "Good evening",
          audioText: "Mah-neh-roo"
        },
        {
          type: "multiple_choice",
          question: "What is the correct response to 'Makadii?' (How are you?)",
          correctAnswer: "Ndiripo",
          options: JSON.stringify(["Ndiripo", "Mangwanani", "Ndatenda", "Masikati"]),
          shonaPhrase: "Makadii?",
          audioText: "Mah-kah-dee"
        },
        {
          type: "translation",
          question: "Translate to Shona: Thank you",
          correctAnswer: "Ndatenda",
          options: JSON.stringify([]),
          englishPhrase: "Thank you",
          shonaPhrase: "Ndatenda",
          audioText: "N-dah-ten-dah"
        }
      ]
    },
    {
      title: "Numbers 1-10",
      description: "Count from 1 to 10 in Shona",
      category: "Numbers",
      orderIndex: 2,
      learningObjectives: JSON.stringify([
        "Master numbers 1-10 in Shona",
        "Practice counting in real contexts",
        "Use numbers for basic transactions"
      ]),
      discoveryElements: JSON.stringify([
        "Explore number patterns",
        "Discover counting traditions"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "What is 'one' in Shona?",
          correctAnswer: "Potsi",
          options: JSON.stringify(["Potsi", "Piri", "Tatu", "Ina"]),
          englishPhrase: "One",
          audioText: "Poh-tsee"
        },
        {
          type: "matching",
          question: "Match the numbers",
          correctAnswer: "2-Piri",
          options: JSON.stringify(["1-Potsi", "2-Piri", "3-Tatu", "4-Ina"]),
          shonaPhrase: "Piri",
          audioText: "Pee-ree"
        },
        {
          type: "multiple_choice",
          question: "What number is 'Tatu'?",
          correctAnswer: "Three",
          options: JSON.stringify(["One", "Two", "Three", "Four"]),
          shonaPhrase: "Tatu",
          audioText: "Tah-too"
        },
        {
          type: "translation",
          question: "Translate to Shona: Five",
          correctAnswer: "Shanu",
          options: JSON.stringify([]),
          englishPhrase: "Five",
          shonaPhrase: "Shanu",
          audioText: "Shah-noo"
        },
        {
          type: "multiple_choice",
          question: "What is 'Gumi' in English?",
          correctAnswer: "Ten",
          options: JSON.stringify(["Eight", "Nine", "Ten", "Seven"]),
          shonaPhrase: "Gumi",
          audioText: "Goo-mee"
        }
      ]
    },
    {
      title: "Family Members",
      description: "Learn words for family members",
      category: "Family",
      orderIndex: 3,
      learningObjectives: JSON.stringify([
        "Learn family member vocabulary",
        "Understand family relationships",
        "Practice using family terms"
      ]),
      discoveryElements: JSON.stringify([
        "Explore extended family",
        "Discover family traditions"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'Amai' mean?",
          correctAnswer: "Mother",
          options: JSON.stringify(["Mother", "Father", "Sister", "Brother"]),
          shonaPhrase: "Amai",
          audioText: "Ah-my"
        },
        {
          type: "multiple_choice",
          question: "How do you say 'Father' in Shona?",
          correctAnswer: "Baba",
          options: JSON.stringify(["Amai", "Baba", "Mwana", "Mukoma"]),
          englishPhrase: "Father",
          audioText: "Bah-bah"
        },
        {
          type: "translation",
          question: "Translate to English: Mwana",
          correctAnswer: "Child",
          options: JSON.stringify([]),
          shonaPhrase: "Mwana",
          englishPhrase: "Child",
          audioText: "Mwah-nah"
        },
        {
          type: "multiple_choice",
          question: "What is 'Sister' in Shona?",
          correctAnswer: "Hanzvadzi",
          options: JSON.stringify(["Mukoma", "Hanzvadzi", "Mwana", "Amai"]),
          englishPhrase: "Sister",
          audioText: "Hahn-zvah-dzee"
        },
        {
          type: "translation",
          question: "Translate to Shona: Brother",
          correctAnswer: "Mukoma",
          options: JSON.stringify([]),
          englishPhrase: "Brother",
          shonaPhrase: "Mukoma",
          audioText: "Moo-koh-mah"
        }
      ]
    },
    {
      title: "Common Verbs",
      description: "Essential action words",
      category: "Verbs",
      orderIndex: 4,
      learningObjectives: JSON.stringify([
        "Learn essential action verbs",
        "Practice verb conjugation",
        "Use verbs in sentences"
      ]),
      discoveryElements: JSON.stringify([
        "Explore verb patterns",
        "Discover action expressions"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'Kuda' mean?",
          correctAnswer: "To want/like",
          options: JSON.stringify(["To want/like", "To go", "To eat", "To sleep"]),
          shonaPhrase: "Kuda",
          audioText: "Koo-dah"
        },
        {
          type: "translation",
          question: "Translate to English: Kuenda",
          correctAnswer: "To go",
          options: JSON.stringify([]),
          shonaPhrase: "Kuenda",
          englishPhrase: "To go",
          audioText: "Koo-en-dah"
        },
        {
          type: "multiple_choice",
          question: "How do you say 'To eat' in Shona?",
          correctAnswer: "Kudya",
          options: JSON.stringify(["Kurara", "Kudya", "Kumira", "Kutaura"]),
          englishPhrase: "To eat",
          audioText: "Koo-dyah"
        },
        {
          type: "translation",
          question: "Translate: Kurara",
          correctAnswer: "To sleep",
          options: JSON.stringify([]),
          shonaPhrase: "Kurara",
          englishPhrase: "To sleep",
          audioText: "Koo-rah-rah"
        },
        {
          type: "multiple_choice",
          question: "What is 'To speak' in Shona?",
          correctAnswer: "Kutaura",
          options: JSON.stringify(["Kutaura", "Kuona", "Kunzwa", "Kubata"]),
          englishPhrase: "To speak",
          audioText: "Koo-tow-rah"
        }
      ]
    },
    {
      title: "Colors",
      description: "Learn basic colors in Shona",
      category: "Vocabulary",
      orderIndex: 5,
      learningObjectives: JSON.stringify([
        "Master color vocabulary",
        "Describe objects using colors",
        "Practice color combinations"
      ]),
      discoveryElements: JSON.stringify([
        "Explore color symbolism",
        "Discover cultural color meanings"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "What color is 'Chena'?",
          correctAnswer: "White",
          options: JSON.stringify(["White", "Black", "Red", "Blue"]),
          shonaPhrase: "Chena",
          audioText: "Cheh-nah"
        },
        {
          type: "translation",
          question: "Translate to English: Dema",
          correctAnswer: "Black",
          options: JSON.stringify([]),
          shonaPhrase: "Dema",
          englishPhrase: "Black",
          audioText: "Deh-mah"
        },
        {
          type: "multiple_choice",
          question: "How do you say 'Red' in Shona?",
          correctAnswer: "Tsvuku",
          options: JSON.stringify(["Tsvuku", "Chena", "Dema", "Girinhi"]),
          englishPhrase: "Red",
          audioText: "Tsvoo-koo"
        },
        {
          type: "translation",
          question: "Translate: Bhuruu",
          correctAnswer: "Blue",
          options: JSON.stringify([]),
          shonaPhrase: "Bhuruu",
          englishPhrase: "Blue",
          audioText: "Bhoo-roo"
        },
        {
          type: "multiple_choice",
          question: "What is 'Green' in Shona?",
          correctAnswer: "Girinhi",
          options: JSON.stringify(["Yero", "Girinhi", "Tsvuku", "Bhuruu"]),
          englishPhrase: "Green",
          audioText: "Gee-reen-hee"
        }
      ]
    }
  ]

  // Create History Quest
  const historyQuest = await prisma.quest.create({
    data: {
      title: "Journey Through Zimbabwe's Past",
      description: "Explore the rich history of Zimbabwe from ancient kingdoms to modern independence",
      storyNarrative: "Travel through time to discover the great civilizations that shaped Zimbabwe, meet legendary heroes who fought for freedom, and understand how the past influences the present.",
      category: "Zimbabwean History",
      orderIndex: 4,
      requiredLevel: 2,
      collaborativeElements: JSON.stringify([
        "Share family stories about Zimbabwe's history",
        "Interview elders about their memories of independence",
        "Create a timeline of Zimbabwe's history with classmates",
        "Visit historical sites virtually or in person with others"
      ]),
      intrinsicRewards: JSON.stringify([
        "Deep connection to Zimbabwean identity and heritage",
        "Understanding of how history shapes the present",
        "Pride in Zimbabwe's resistance and achievements",
        "Knowledge to share Zimbabwe's story with the world"
      ])
    }
  })

  // Add Zimbabwean History lessons
  const historyLessons = [
    {
      title: "Dzimbahwe - Great Zimbabwe",
      description: "Learn about the magnificent stone city that gave Zimbabwe its name",
      category: "Zimbabwean History",
      orderIndex: 20,
      xpReward: 100,
      questId: historyQuest.id,
      learningObjectives: JSON.stringify([
        "Understand the significance of Great Zimbabwe in African history",
        "Learn vocabulary related to ancient architecture and civilization",
        "Explore the Shona Kingdom's golden age (1100-1450 CE)",
        "Discover how Great Zimbabwe influenced modern Zimbabwe's identity"
      ]),
      discoveryElements: JSON.stringify([
        "Explore the meaning of 'dzimba dza mabwe' (houses of stone)",
        "Discover the Zimbabwe Bird symbol and its cultural significance",
        "Learn about ancient trade routes with China, Persia, and Arabia"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'Dzimbahwe' mean in Shona?",
          correctAnswer: "House of stone",
          options: JSON.stringify(["House of stone", "Great kingdom", "Ancient city", "Sacred place"]),
          shonaPhrase: "Dzimbahwe",
          audioText: "Dzim-bah-hwe"
        },
        {
          type: "cultural_scenario",
          question: "What symbol from Great Zimbabwe appears on the national flag?",
          correctAnswer: "The Zimbabwe Bird",
          options: JSON.stringify(["The Zimbabwe Bird", "A lion", "A stone tower", "An eagle"]),
          englishPhrase: "Zimbabwe Bird",
          audioText: "Hungwe"
        },
        {
          type: "vocabulary_matching",
          question: "Match: What is a 'mambo'?",
          correctAnswer: "King/Chief",
          options: JSON.stringify(["King/Chief", "Warrior", "Farmer", "Trader"]),
          shonaPhrase: "Mambo",
          audioText: "Mam-bo"
        }
      ]
    },
    {
      title: "Madzishe neVaMambo - Chiefs and Kings",
      description: "Learn about the great rulers of pre-colonial Zimbabwe",
      category: "Zimbabwean History",
      orderIndex: 21,
      xpReward: 100,
      questId: historyQuest.id,
      learningObjectives: JSON.stringify([
        "Learn about the Mutapa Empire and its influence",
        "Understand the Rozvi Empire under Changamire Dombo",
        "Discover the role of spirit mediums in governance"
      ]),
      discoveryElements: JSON.stringify([
        "Explore the gold trade that made these kingdoms wealthy",
        "Learn about diplomatic relations with Portugal"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "Which empire defeated the Portuguese in 1684?",
          correctAnswer: "Rozvi Empire",
          options: JSON.stringify(["Rozvi Empire", "Mutapa Empire", "Zulu Kingdom", "Ndebele Kingdom"]),
          shonaPhrase: "Changamire",
          audioText: "Chan-ga-mi-re"
        },
        {
          type: "translation",
          question: "What is a 'svikiro'?",
          correctAnswer: "Spirit medium",
          options: JSON.stringify([]),
          shonaPhrase: "Svikiro",
          englishPhrase: "Spirit medium",
          audioText: "Svi-ki-ro"
        }
      ]
    },
    {
      title: "Mbuya Nehanda naKaguvi - Heroes of Resistance",
      description: "Learn about the First Chimurenga and Zimbabwe's resistance heroes",
      category: "Zimbabwean History",
      orderIndex: 22,
      xpReward: 100,
      questId: historyQuest.id,
      learningObjectives: JSON.stringify([
        "Understand the First Chimurenga (1896-1897) resistance war",
        "Learn about Mbuya Nehanda and Sekuru Kaguvi's leadership",
        "Explore the spiritual dimension of the liberation struggle"
      ]),
      discoveryElements: JSON.stringify([
        "Discover Mbuya Nehanda's prophetic words",
        "Learn how spirit mediums united different groups"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "What prophetic words did Mbuya Nehanda speak?",
          correctAnswer: "My bones will rise again",
          options: JSON.stringify(["My bones will rise again", "Zimbabwe will be free", "The ancestors will return", "Victory is certain"]),
          shonaPhrase: "Chimurenga",
          audioText: "Chi-mu-ren-ga"
        },
        {
          type: "vocabulary",
          question: "What does 'rusununguko' mean?",
          correctAnswer: "Liberation/Freedom",
          options: JSON.stringify(["Liberation/Freedom", "War", "Peace", "Victory"]),
          shonaPhrase: "Rusununguko",
          audioText: "Ru-su-nun-gu-ko"
        }
      ]
    },
    {
      title: "Hondo Yechipiri - The Second Chimurenga",
      description: "Learn about Zimbabwe's war of liberation (1966-1979)",
      category: "Zimbabwean History",
      orderIndex: 23,
      xpReward: 120,
      questId: historyQuest.id,
      learningObjectives: JSON.stringify([
        "Understand the Second Chimurenga liberation war",
        "Learn about ZANU and ZAPU liberation movements",
        "Explore the role of women in the liberation struggle"
      ]),
      discoveryElements: JSON.stringify([
        "Discover how the war began in Chinhoyi",
        "Learn about liberation war camps"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "When did the Second Chimurenga begin?",
          correctAnswer: "1966 in Chinhoyi",
          options: JSON.stringify(["1966 in Chinhoyi", "1970 in Harare", "1975 in Bulawayo", "1960 in Mutare"]),
          englishPhrase: "Liberation war",
          audioText: "Chi-mu-ren-ga"
        },
        {
          type: "vocabulary",
          question: "What were 'vanamukoma'?",
          correctAnswer: "Freedom fighters",
          options: JSON.stringify(["Freedom fighters", "Colonial soldiers", "Farmers", "Teachers"]),
          shonaPhrase: "Vanamukoma",
          audioText: "Va-na-mu-ko-ma"
        }
      ]
    },
    {
      title: "Zimbabwe Yatsva - Independent Zimbabwe",
      description: "Learn about Zimbabwe's independence and modern history",
      category: "Zimbabwean History",
      orderIndex: 24,
      xpReward: 120,
      questId: historyQuest.id,
      learningObjectives: JSON.stringify([
        "Understand Zimbabwe's independence celebrations in 1980",
        "Learn about nation-building efforts",
        "Explore Zimbabwe's role in Southern African development"
      ]),
      discoveryElements: JSON.stringify([
        "Discover the significance of April 18, 1980",
        "Learn about the new flag and national symbols"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "When did Zimbabwe gain independence?",
          correctAnswer: "April 18, 1980",
          options: JSON.stringify(["April 18, 1980", "March 6, 1980", "May 25, 1980", "December 12, 1979"]),
          englishPhrase: "Independence Day",
          audioText: "U-hu-ru"
        },
        {
          type: "translation",
          question: "What does 'mureza' mean?",
          correctAnswer: "Flag",
          options: JSON.stringify([]),
          shonaPhrase: "Mureza",
          englishPhrase: "Flag",
          audioText: "Mu-re-za"
        }
      ]
    },
    {
      title: "Tsika Nemagariro - Culture and Heritage",
      description: "Explore Zimbabwe's rich cultural heritage and traditions",
      category: "Zimbabwean History",
      orderIndex: 25,
      xpReward: 120,
      questId: historyQuest.id,
      learningObjectives: JSON.stringify([
        "Learn about Zimbabwe's diverse ethnic groups",
        "Understand traditional music, dance, and art forms",
        "Master vocabulary related to cultural heritage"
      ]),
      discoveryElements: JSON.stringify([
        "Discover the mbira music tradition",
        "Learn about stone sculpture and basket weaving"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "Which traditional instrument has been played for over 1000 years?",
          correctAnswer: "Mbira",
          options: JSON.stringify(["Mbira", "Guitar", "Drums only", "Flute"]),
          shonaPhrase: "Mbira",
          audioText: "Mbi-ra"
        },
        {
          type: "cultural_knowledge",
          question: "What is the purpose of 'mitupo' (totems)?",
          correctAnswer: "To identify clans and regulate marriages",
          options: JSON.stringify(["To identify clans and regulate marriages", "Only for ceremonies", "For leadership", "For art"]),
          shonaPhrase: "Mitupo",
          audioText: "Mi-tu-po"
        }
      ]
    }
  ]

  // Create lessons with their exercises
  for (const lessonData of lessonsData) {
    const { exercises, ...lesson } = lessonData
    
    const createdLesson = await prisma.lesson.create({
      data: lesson
    })
    
    for (const exercise of exercises) {
      await prisma.exercise.create({
        data: {
          ...exercise,
          lessonId: createdLesson.id
        }
      })
    }
  }

  // Create history lessons with their exercises
  for (const lessonData of historyLessons) {
    const { exercises, ...lesson } = lessonData
    
    const createdLesson = await prisma.lesson.create({
      data: lesson
    })
    
    for (const exercise of exercises) {
      await prisma.exercise.create({
        data: {
          ...exercise,
          lessonId: createdLesson.id
        }
      })
    }
  }
  
  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 