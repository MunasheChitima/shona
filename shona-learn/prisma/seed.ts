import { PrismaClient } from '@prisma/client'
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient()

// Load age-appropriate content
const ageAppropriateContent = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../content/age-appropriate-lessons-complete.json'), 'utf8')
);

const kidsExercises = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../content/kids-activities-exercises.json'), 'utf8')
);

const kidsQuest = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../content/kids-cultural-quest.json'), 'utf8')
);

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

  // Create Cultural Heritage Quest
  const cultureQuest = await prisma.quest.create({
    data: {
      title: "Roots & Identity - Connecting with Your Heritage",
      description: "A journey of cultural discovery for Zimbabweans in the diaspora",
      storyNarrative: "Discover your totem identity, understand family structures, and reconnect with traditions.",
      category: "Cultural Heritage",
      orderIndex: 6,
      requiredLevel: 2,
      collaborativeElements: JSON.stringify([
        "Interview family elders about your totem",
        "Create a family tree with Shona terms",
        "Share cultural experiences with other learners",
        "Practice traditional customs together"
      ]),
      intrinsicRewards: JSON.stringify([
        "Deep connection to ancestral identity",
        "Confidence in cultural settings",
        "Ability to pass on traditions",
        "Pride in cultural heritage"
      ])
    }
  })

  // Add Cultural Heritage lessons
  const cultureLessons = [
    {
      title: "Mitupo - Your Totem Identity",
      description: "Discover your clan identity through Zimbabwe's totem system",
      category: "Cultural Heritage",
      orderIndex: 30,
      xpReward: 100,
      questId: cultureQuest.id,
      learningObjectives: JSON.stringify([
        "Understand what totems are and why they matter",
        "Learn major Shona totems and their meanings",
        "Discover how totems regulate marriages"
      ]),
      discoveryElements: JSON.stringify([
        "Explore the connection between totems and nature",
        "Learn how totems create extended family networks"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "If your father's totem is Shumba, what is your totem?",
          correctAnswer: "Shumba - totems are inherited from father",
          options: JSON.stringify(["Shumba - totems are inherited from father", "You choose your own", "Your mother's totem", "Elders assign it"]),
          shonaPhrase: "Mutupo",
          audioText: "Mu-tu-po"
        },
        {
          type: "vocabulary",
          question: "What does 'mutupo' mean?",
          correctAnswer: "Totem/clan name",
          options: JSON.stringify(["Totem/clan name", "Family", "Animal", "Name"]),
          shonaPhrase: "Mutupo",
          audioText: "Mu-tu-po"
        }
      ]
    },
    {
      title: "Common Totems and Their Stories",
      description: "Learn about major Zimbabwean totems and their significance",
      category: "Cultural Heritage",
      orderIndex: 31,
      xpReward: 100,
      questId: cultureQuest.id,
      learningObjectives: JSON.stringify([
        "Master vocabulary for common animal totems",
        "Understand the stories behind major totems",
        "Learn totem praise names and greetings"
      ]),
      discoveryElements: JSON.stringify([
        "Explore why certain animals were chosen as totems",
        "Discover regional variations in totem names"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "Which totem represents bravery and leadership?",
          correctAnswer: "Shumba (Lion)",
          options: JSON.stringify(["Shumba (Lion)", "Moyo (Heart)", "Nzou (Elephant)", "Shava (Eland)"]),
          shonaPhrase: "Shumba",
          audioText: "Shum-ba"
        }
      ]
    },
    {
      title: "Mhuri - Family Structure and Hierarchy",
      description: "Understanding the extended family system",
      category: "Cultural Heritage",
      orderIndex: 32,
      xpReward: 100,
      questId: cultureQuest.id,
      learningObjectives: JSON.stringify([
        "Map out extended family relationships",
        "Understand the hierarchy of respect",
        "Learn proper titles and forms of address"
      ]),
      discoveryElements: JSON.stringify([
        "Explore why aunts are called mothers",
        "Discover the special role of maternal uncles"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "Who is 'babamukuru'?",
          correctAnswer: "Father's older brother / family head",
          options: JSON.stringify(["Father's older brother / family head", "Your father", "Grandfather", "Uncle"]),
          shonaPhrase: "Babamukuru",
          audioText: "Ba-ba-mu-ku-ru"
        }
      ]
    },
    {
      title: "Tsika dzeChivanhu - Cultural Values",
      description: "Core values that define Zimbabwean culture",
      category: "Cultural Heritage",
      orderIndex: 33,
      xpReward: 100,
      questId: cultureQuest.id,
      learningObjectives: JSON.stringify([
        "Understand hunhu/ubuntu philosophy",
        "Learn vocabulary for expressing values",
        "Master phrases for showing respect"
      ]),
      discoveryElements: JSON.stringify([
        "Explore how ubuntu shapes daily life",
        "Discover the importance of community"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'hunhu' mean?",
          correctAnswer: "Ubuntu/humanness",
          options: JSON.stringify(["Ubuntu/humanness", "Respect", "Culture", "Tradition"]),
          shonaPhrase: "Hunhu",
          audioText: "Hu-nhu"
        }
      ]
    },
    {
      title: "Mitambo neMhemberero - Ceremonies",
      description: "Life ceremonies and cultural celebrations",
      category: "Cultural Heritage",
      orderIndex: 34,
      xpReward: 120,
      questId: cultureQuest.id,
      learningObjectives: JSON.stringify([
        "Learn about major life ceremonies",
        "Understand wedding customs and lobola",
        "Know proper ceremony etiquette"
      ]),
      discoveryElements: JSON.stringify([
        "Explore the meaning behind rituals",
        "Discover regional variations"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "What is 'roora/lobola'?",
          correctAnswer: "Bride price/appreciation",
          options: JSON.stringify(["Bride price/appreciation", "Wedding gift", "Dowry", "Payment"]),
          shonaPhrase: "Roora",
          audioText: "Roo-ra"
        }
      ]
    },
    {
      title: "Chikafu neTsika - Food Culture",
      description: "Traditional foods and hospitality customs",
      category: "Cultural Heritage",
      orderIndex: 35,
      xpReward: 120,
      questId: cultureQuest.id,
      learningObjectives: JSON.stringify([
        "Learn traditional food vocabulary",
        "Understand meal customs and etiquette",
        "Master hospitality phrases"
      ]),
      discoveryElements: JSON.stringify([
        "Explore the significance of sadza",
        "Discover ceremonial foods"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "What should you do when offered food?",
          correctAnswer: "Accept graciously even if not hungry",
          options: JSON.stringify(["Accept graciously even if not hungry", "Politely refuse", "Ask what it is", "Only if hungry"]),
          englishPhrase: "Food hospitality",
          audioText: "Ku-dya"
        }
      ]
    },
    {
      title: "Kutaura Kwekare - Proverbs and Wisdom",
      description: "Traditional proverbs that guide behavior",
      category: "Cultural Heritage",
      orderIndex: 36,
      xpReward: 120,
      questId: cultureQuest.id,
      learningObjectives: JSON.stringify([
        "Learn common Shona proverbs",
        "Understand how proverbs teach values",
        "Master using proverbs in conversation"
      ]),
      discoveryElements: JSON.stringify([
        "Explore deeper meanings of proverbs",
        "Discover how elders use proverbs"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "What is a 'tsumo'?",
          correctAnswer: "Proverb",
          options: JSON.stringify(["Proverb", "Story", "Song", "Riddle"]),
          shonaPhrase: "Tsumo",
          audioText: "Tsu-mo"
        }
      ]
    },
    {
      title: "Kuroorana - Marriage Customs",
      description: "Understanding traditional marriage customs",
      category: "Cultural Heritage",
      orderIndex: 37,
      xpReward: 120,
      questId: cultureQuest.id,
      learningObjectives: JSON.stringify([
        "Understand the marriage process",
        "Learn about lobola negotiations",
        "Know marriage roles and responsibilities"
      ]),
      discoveryElements: JSON.stringify([
        "Explore how marriages unite families",
        "Discover modern adaptations"
      ]),
      exercises: [
        {
          type: "multiple_choice",
          question: "Who is 'tete' in marriage customs?",
          correctAnswer: "Paternal aunt/marriage counselor",
          options: JSON.stringify(["Paternal aunt/marriage counselor", "Mother", "Sister", "Friend"]),
          shonaPhrase: "Tete",
          audioText: "Te-te"
        }
      ]
    }
  ]

  // Create culture lessons with their exercises
  for (const lessonData of cultureLessons) {
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
  
  // Add age-appropriate kids' lessons
  console.log('Creating age-appropriate kids lessons...');
  for (const lesson of ageAppropriateContent.childrenLessons) {
    await prisma.lesson.create({
      data: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        category: lesson.category,
        orderIndex: lesson.orderIndex,
        level: lesson.level,
        ageRange: lesson.ageRange,
        ageRestriction: lesson.ageRestriction,
        kidfriendly: lesson.kidfriendly,
        visualAids: lesson.visualAids,
        interactiveElements: lesson.interactiveElements,
        xpReward: lesson.xpReward,
        estimatedDuration: lesson.estimatedDuration,
        content: JSON.stringify({
          learningObjectives: lesson.learningObjectives,
          discoveryElements: lesson.discoveryElements,
          culturalNotes: lesson.culturalNotes
        }),
        vocabulary: JSON.stringify(lesson.vocabulary),
        questId: lesson.questId,
      },
    });
  }

  // Add kids' quest
  console.log('Creating kids quest...');
  await prisma.quest.create({
    data: {
      id: kidsQuest.kidsQuest.id,
      title: kidsQuest.kidsQuest.title,
      description: kidsQuest.kidsQuest.description,
      category: kidsQuest.kidsQuest.category,
      ageRange: kidsQuest.kidsQuest.ageRange,
      mascot: JSON.stringify(kidsQuest.kidsQuest.mascot),
      difficulty: kidsQuest.kidsQuest.difficulty,
      estimatedDuration: kidsQuest.kidsQuest.estimatedDuration,
      totalXP: kidsQuest.kidsQuest.totalXP,
      milestones: JSON.stringify(kidsQuest.kidsQuest.milestones),
      rewards: JSON.stringify(kidsQuest.kidsQuest.rewards),
      orderIndex: 1,
      requiredLevel: 1,
      storyNarrative: kidsQuest.kidsQuest.questNarrative.introduction,
      collaborativeElements: JSON.stringify(kidsQuest.kidsQuest.specialActivities),
      intrinsicRewards: JSON.stringify(kidsQuest.kidsQuest.parentGuidance),
    },
  });

  // Add kids' exercises
  console.log('Creating kids exercises...');
  for (const exercise of kidsExercises.kidsExercises) {
    await prisma.exercise.create({
      data: {
        id: exercise.id,
        lessonId: exercise.lessonId,
        type: exercise.type,
        title: exercise.title,
        question: exercise.question,
        ageRange: exercise.ageRange,
        kidfriendly: true,
        gameType: exercise.gameType,
        difficulty: exercise.difficulty,
        points: exercise.points,
        correctAnswer: exercise.correctAnswer,
        options: JSON.stringify(exercise.options || exercise.scenarios || exercise.songs || exercise.ingredients || exercise.familyMembers),
        intrinsicFeedback: JSON.stringify(exercise.intrinsicFeedback),
        activities: JSON.stringify(exercise.activities),
        audioText: exercise.audioFile || null,
        discoveryHint: exercise.description,
      },
    });
  }

  // Update existing lessons with age restrictions
  console.log('Updating existing lessons with age restrictions...');
  
  // Mark historical lessons as adults-only
  const adultOnlyLessons = [
    'history-chimurenga-1',
    'history-chimurenga-2', 
    'history-colonial-resistance',
    'history-liberation-war'
  ];
  
  for (const lessonId of adultOnlyLessons) {
    await prisma.lesson.updateMany({
      where: { id: lessonId },
      data: {
        ageRestriction: 'adultsOnly',
        ageRange: '18+',
        kidfriendly: false,
      },
    });
  }

  // Mark some lessons as teens and adults
  const teensAndAdultsLessons = [
    'history-great-zimbabwe',
    'history-pre-colonial-kingdoms',
    'history-independence',
    'culture-traditional-ceremonies',
    'culture-marriage-customs'
  ];
  
  for (const lessonId of teensAndAdultsLessons) {
    await prisma.lesson.updateMany({
      where: { id: lessonId },
      data: {
        ageRestriction: 'teensAndAdults',
        ageRange: '13+',
        kidfriendly: false,
      },
    });
  }

  // Mark basic lessons as all ages
  const allAgesLessons = [
    'lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5'
  ];
  
  for (const lessonId of allAgesLessons) {
    await prisma.lesson.updateMany({
      where: { id: lessonId },
      data: {
        ageRestriction: null,
        ageRange: 'all',
        kidfriendly: true,
      },
    });
  }

  // Create sample age-appropriate users
  console.log('Creating sample age-appropriate users...');
  
  // Child user account
  await prisma.user.create({
    data: {
      email: 'child@example.com',
      password: '$2b$12$8PvL/y8pRxOCvNHzYQ6OiuJHWKjRKqmOsNMKpLbCEhWjNfIxSdmPO', // password123
      name: 'Little Explorer',
      age: 8,
      ageGroup: 'children',
      parentEmail: 'parent@example.com',
      parentConsent: true,
    },
  });

  // Teen user account
  await prisma.user.create({
    data: {
      email: 'teen@example.com',
      password: '$2b$12$8PvL/y8pRxOCvNHzYQ6OiuJHWKjRKqmOsNMKpLbCEhWjNfIxSdmPO', // password123
      name: 'Teen Learner',
      age: 15,
      ageGroup: 'teens',
      parentConsent: true,
    },
  });

  // Adult user account
  await prisma.user.create({
    data: {
      email: 'adult@example.com',
      password: '$2b$12$8PvL/y8pRxOCvNHzYQ6OiuJHWKjRKqmOsNMKpLbCEhWjNfIxSdmPO', // password123
      name: 'Adult Learner',
      age: 30,
      ageGroup: 'adults',
      parentConsent: false,
    },
  });

  console.log('Age-appropriate content seeded successfully!');
  
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