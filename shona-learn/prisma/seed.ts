/**
 * Dev content model: JSON + Prisma together.
 * - Lessons for the web app come from content/lessons_consolidated.json (see app/api/lessons).
 * - Vocabulary for /api/vocabulary is mirrored from JSON into Prisma (VocabularyItem) on each seed.
 * - Quests, seeded lessons, exercises, users, and progress live in Prisma for auth/gamification flows.
 *
 * Env: FLASHCARDS_SEED_PATH — optional path to flashcards JSON (relative to repo root or absolute).
 * Loads .env.local then .env so `prisma db seed` matches Next.js dev.
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { buildStageCheckpointData } from '../lib/checkpoints/stage-questions'

const repoRoot = path.join(__dirname, '..')
loadEnv({ path: path.join(repoRoot, '.env.local') })
loadEnv({ path: path.join(repoRoot, '.env') })

const prisma = new PrismaClient()

function flashcardsJsonPath(): string {
  const override = process.env.FLASHCARDS_SEED_PATH
  if (override) return path.isAbsolute(override) ? override : path.join(repoRoot, override)
  return path.join(repoRoot, 'content', 'flashcards.json')
}

async function main() {
  // Clear existing data in correct order to avoid foreign key constraints
  await prisma.userAchievement.deleteMany()
  await prisma.achievement.deleteMany()
  await prisma.userCheckpointAttempt.deleteMany()
  await prisma.reviewSchedule.deleteMany()
  await prisma.userUnitProgress.deleteMany()
  await prisma.userLearningPath.deleteMany()
  await prisma.unitPrerequisite.deleteMany()
  await prisma.checkpoint.deleteMany()
  await prisma.unit.deleteMany()
  await prisma.stage.deleteMany()
  await prisma.learningPath.deleteMany()
  await prisma.sRSProgress.deleteMany()
  await prisma.flashcard.deleteMany()
  await prisma.notificationPreference.deleteMany()
  await prisma.notificationLog.deleteMany()
  await prisma.userProgress.deleteMany()
  await prisma.questProgress.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.quest.deleteMany()
  await prisma.socialConnection.deleteMany()
  await prisma.learningGoal.deleteMany()
  await prisma.intrinsicMotivation.deleteMany()
  await prisma.user.deleteMany()
  await prisma.vocabularyItem.deleteMany({ where: { source: 'flashcards.json' } })

  // Seeded credentials for local dev + Playwright (`npm run test:e2e`).
  // API integration tests also use apitest@example.com via register (idempotent).
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
  
  // Mirror flashcards JSON into Prisma for /api/vocabulary (dev + prod seed)
  const flashcardsPath = flashcardsJsonPath()
  if (!fs.existsSync(flashcardsPath)) {
    throw new Error(`Flashcards JSON not found: ${flashcardsPath}`)
  }
  const flashcardsRaw = fs.readFileSync(flashcardsPath, 'utf-8')
  const parsed = JSON.parse(flashcardsRaw)
  const flashcardsData = parsed.flashcards ?? parsed
  if (!Array.isArray(flashcardsData)) {
    throw new Error(`Expected flashcards array or { flashcards: [] } in ${flashcardsPath}`)
  }
  for (const card of flashcardsData) {
    const id = `vocab_${String(card.shona).toLowerCase().replace(/\s+/g, '_')}`
    await prisma.vocabularyItem.create({
      data: {
        id,
        shona: card.shona,
        english: card.english,
        category: card.category,
        tones: card.tones || null,
        audioFile: card.audioFile || null,
        pronunciation: card.pronunciation || null,
        examples: JSON.stringify([card.example, card.translation]),
        source: 'flashcards.json',
        modern: true,
        difficulty: 1,
        cultural: null
      }
    })
  }
  console.log(`✅ Seeded ${flashcardsData.length} vocabulary items from ${path.relative(repoRoot, flashcardsPath)}`)

  // Create quests first
  const questsData = [
    {
      id: "quest-1",
      title: "The Village Greeting",
      description: "Begin your journey by learning to greet people in a Shona village",
      storyNarrative: "You've just arrived in a beautiful Shona village. The villagers are warm and welcoming, but you need to learn their greetings to connect with them. Each person you meet will teach you something new about Shona culture and language.",
      category: "Cultural Immersion",
      orderIndex: 1,
      requiredLevel: 1,
      collaborativeElements: JSON.stringify([
        "Practice greetings with other learners",
        "Share cultural insights from your background",
        "Help others with pronunciation"
      ]),
      intrinsicRewards: JSON.stringify([
        "Feel the joy of connecting with Shona speakers",
        "Experience cultural understanding",
        "Build confidence in language learning"
      ])
    },
    {
      id: "quest-2",
      title: "Family Connections",
      description: "Learn about family relationships and build your Shona family vocabulary",
      storyNarrative: "A family in the village has invited you to their home. You'll learn about family relationships, which are central to Shona culture. Understanding family terms will help you connect more deeply with the community.",
      category: "Family & Relationships",
      orderIndex: 2,
      requiredLevel: 2,
      collaborativeElements: JSON.stringify([
        "Share your family structure with others",
        "Practice family conversations together",
        "Create family trees using Shona terms"
      ]),
      intrinsicRewards: JSON.stringify([
        "Deepen understanding of Shona culture",
        "Feel connected to family values",
        "Build meaningful relationships"
      ])
    },
    {
      id: "quest-3",
      title: "Market Adventures",
      description: "Navigate a Shona market using numbers, colors, and basic phrases",
      storyNarrative: "You're exploring a vibrant Shona market where you need to count, identify colors, and negotiate. This real-world scenario will help you apply your language skills in practical situations.",
      category: "Practical Communication",
      orderIndex: 3,
      requiredLevel: 3,
      collaborativeElements: JSON.stringify([
        "Role-play market scenarios together",
        "Share market experiences from your culture",
        "Practice bargaining as a group"
      ]),
      intrinsicRewards: JSON.stringify([
        "Experience practical language application",
        "Feel confident in real-world situations",
        "Connect with local culture and commerce"
      ])
    },
    {
      id: "quest-4",
      title: "Voice of the Village",
      description: "Master Shona pronunciation and tones through voice practice",
      storyNarrative: "The village elders want to teach you the proper way to speak Shona. You'll learn the musical tones and sounds that make Shona unique, connecting you more deeply to the language's soul.",
      category: "Pronunciation Mastery",
      orderIndex: 4,
      requiredLevel: 4,
      collaborativeElements: JSON.stringify([
        "Practice pronunciation with native speakers",
        "Record and share pronunciation attempts",
        "Give and receive constructive feedback"
      ]),
      intrinsicRewards: JSON.stringify([
        "Feel the rhythm and beauty of Shona",
        "Build authentic speaking confidence",
        "Connect with the language's musical heritage"
      ])
    },
    {
      id: "quest-5",
      title: "Meeting the Family",
      description: "Visit a Shona family and learn to address each member with proper respect",
      storyNarrative: "You've been invited to visit the Moyo family. This is your chance to learn how to properly greet and address family members in Shona culture. Each family member will teach you their title and the cultural significance behind it.",
      category: "Family & Relationships",
      orderIndex: 5,
      requiredLevel: 2,
      collaborativeElements: JSON.stringify([
        "Role-play family introductions",
        "Share your family structure",
        "Practice family conversations together"
      ]),
      intrinsicRewards: JSON.stringify([
        "Build deeper family connections",
        "Understand cultural respect",
        "Feel part of the family"
      ])
    },
    {
      id: "quest-6",
      title: "Family Dinner",
      description: "Join the family for a traditional Shona meal and learn food vocabulary",
      storyNarrative: "The family has prepared a traditional Shona meal for you. Learn the names of different foods, how to express gratitude, and participate in the cultural experience of sharing a meal together.",
      category: "Family & Relationships",
      orderIndex: 6,
      requiredLevel: 3,
      collaborativeElements: JSON.stringify([
        "Share food preferences",
        "Practice meal-time conversations",
        "Learn cooking vocabulary together"
      ]),
      intrinsicRewards: JSON.stringify([
        "Experience cultural dining",
        "Build community through food",
        "Feel welcomed and nourished"
      ])
    },
    {
      id: "quest-7",
      title: "Family Stories",
      description: "Listen to family stories and learn to share your own experiences",
      storyNarrative: "After dinner, the family gathers to share stories. Learn how to listen, ask questions, and share your own experiences in Shona. This is where you'll truly connect with the family's history and culture.",
      category: "Family & Relationships",
      orderIndex: 7,
      requiredLevel: 4,
      collaborativeElements: JSON.stringify([
        "Share your own family stories",
        "Practice storytelling together",
        "Build deeper relationships"
      ]),
      intrinsicRewards: JSON.stringify([
        "Connect through shared stories",
        "Build lasting friendships",
        "Feel part of the family legacy"
      ])
    }
  ]

  // Create quests
  const questMap = new Map()
  for (const questData of questsData) {
    const createdQuest = await prisma.quest.create({
      data: questData
    })
    questMap.set(questData.id, createdQuest.id)
    console.log(`✅ Created quest: ${questData.title}`)
  }

  // Create lessons with exercises
  const lessonsData = [
    {
      id: "lesson-1",
      title: "Mhoro, Shamwari! - Hello, Friend!",
      description: "Learn basic greetings and how to introduce yourself in Shona culture",
      category: "Cultural Immersion",
      orderIndex: 1,
      questId: questMap.get("quest-1"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'mhoro' mean?",
          correctAnswer: "hello (informal)",
          options: JSON.stringify(["hello (informal)", "goodbye", "thank you", "how are you"]),
          shonaPhrase: "mhoro",
          audioText: "mm-HO-ro",
          points: 10
        },
        {
          type: "multiple_choice",
          question: "How do you say 'how are you' formally in Shona?",
          correctAnswer: "makadii",
          options: JSON.stringify(["wakadii", "makadii", "mhoro", "ndatenda"]),
          shonaPhrase: "makadii",
          audioText: "mah-kah-DEE",
          points: 10
        },
        {
          type: "translation",
          question: "Translate to English: shamwari",
          correctAnswer: "friend",
          options: JSON.stringify([]),
          shonaPhrase: "shamwari",
          englishPhrase: "friend",
          audioText: "sham-WAH-ree",
          points: 15
        }
      ]
    },
    {
      id: "lesson-2",
      title: "Ini Ndinonzi - My Name Is",
      description: "Learn to introduce yourself and exchange names in Shona",
      category: "Cultural Immersion",
      orderIndex: 2,
      questId: questMap.get("quest-1"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'zita' mean?",
          correctAnswer: "name",
          options: JSON.stringify(["name", "friend", "hello", "thank you"]),
          shonaPhrase: "zita",
          audioText: "ZEE-tah",
          points: 10
        },
        {
          type: "translation",
          question: "How do you say 'My name is' in Shona?",
          correctAnswer: "Ini ndinonzi",
          options: JSON.stringify([]),
          shonaPhrase: "Ini ndinonzi",
          englishPhrase: "My name is",
          audioText: "EE-nee n-dee-NOH-nzee",
          points: 15
        },
        {
          type: "multiple_choice",
          question: "What is 'one' in Shona?",
          correctAnswer: "potsi",
          options: JSON.stringify(["potsi", "piri", "tatu", "ina"]),
          englishPhrase: "one",
          audioText: "POH-tsee",
          points: 10
        }
      ]
    },
    {
      id: "lesson-3",
      title: "Family Members",
      description: "Learn words for family members",
      category: "Family & Relationships",
      orderIndex: 3,
      questId: questMap.get("quest-2"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'Amai' mean?",
          correctAnswer: "Mother",
          options: JSON.stringify(["Mother", "Father", "Sister", "Brother"]),
          shonaPhrase: "Amai",
          audioText: "Ah-my",
          points: 10
        },
        {
          type: "multiple_choice",
          question: "How do you say 'Father' in Shona?",
          correctAnswer: "Baba",
          options: JSON.stringify(["Amai", "Baba", "Mwana", "Mukoma"]),
          englishPhrase: "Father",
          audioText: "Bah-bah",
          points: 10
        },
        {
          type: "translation",
          question: "Translate to English: Mwana",
          correctAnswer: "Child",
          options: JSON.stringify([]),
          shonaPhrase: "Mwana",
          englishPhrase: "Child",
          audioText: "Mwah-nah",
          points: 15
        }
      ]
    },
    {
      id: "lesson-4",
      title: "Extended Family",
      description: "Learn about extended family relationships",
      category: "Family & Relationships",
      orderIndex: 4,
      questId: questMap.get("quest-2"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What is 'Sister' in Shona?",
          correctAnswer: "Hanzvadzi",
          options: JSON.stringify(["Mukoma", "Hanzvadzi", "Mwana", "Amai"]),
          englishPhrase: "Sister",
          audioText: "Hahn-zvah-dzee",
          points: 10
        },
        {
          type: "translation",
          question: "Translate to Shona: Brother",
          correctAnswer: "Mukoma",
          options: JSON.stringify([]),
          englishPhrase: "Brother",
          shonaPhrase: "Mukoma",
          audioText: "Moo-koh-mah",
          points: 15
        },
        {
          type: "multiple_choice",
          question: "What does 'Sekuru' mean?",
          correctAnswer: "Grandfather",
          options: JSON.stringify(["Grandfather", "Grandmother", "Uncle", "Aunt"]),
          shonaPhrase: "Sekuru",
          audioText: "Seh-koo-roo",
          points: 10
        }
      ]
    },
    {
      id: "lesson-5",
      title: "Colors",
      description: "Learn basic colors in Shona",
      category: "Vocabulary",
      orderIndex: 5,
      questId: questMap.get("quest-3"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What color is 'Chena'?",
          correctAnswer: "White",
          options: JSON.stringify(["White", "Black", "Red", "Blue"]),
          shonaPhrase: "Chena",
          audioText: "Cheh-nah",
          points: 10
        },
        {
          type: "translation",
          question: "Translate to English: Dema",
          correctAnswer: "Black",
          options: JSON.stringify([]),
          shonaPhrase: "Dema",
          englishPhrase: "Black",
          audioText: "Deh-mah",
          points: 15
        },
        {
          type: "multiple_choice",
          question: "How do you say 'Red' in Shona?",
          correctAnswer: "Tsvuku",
          options: JSON.stringify(["Tsvuku", "Chena", "Dema", "Girinhi"]),
          englishPhrase: "Red",
          audioText: "Tsvoo-koo",
          points: 10
        }
      ]
    },
    {
      id: "lesson-6",
      title: "Pronunciation Basics",
      description: "Master Shona sounds",
      category: "Pronunciation",
      orderIndex: 6,
      questId: questMap.get("quest-4"),
      exercises: [
        {
          type: "multiple_choice",
          question: "Practice pronouncing these greetings: Mangwanani, Masikati, Manheru",
          correctAnswer: "Practice completed",
          options: JSON.stringify(["Practice completed", "Skip practice", "Try later", "Need help"]),
          shonaPhrase: "Mangwanani",
          audioText: "mah-ngwah-NAH-nee",
          points: 10
        }
      ]
    },
    {
      id: "lesson-7",
      title: "Tone Practice",
      description: "Master Shona tones",
      category: "Pronunciation",
      orderIndex: 7,
      questId: questMap.get("quest-4"),
      exercises: [
        {
          type: "multiple_choice",
          question: "Practice these tone pairs: sara (remain) vs sára (be satisfied)",
          correctAnswer: "Practice completed",
          options: JSON.stringify(["Practice completed", "Skip practice", "Try later", "Need help"]),
          shonaPhrase: "sara",
          audioText: "SAH-rah",
          points: 15
        }
      ]
    },
    {
      id: "lesson-8",
      title: "Prenasalized Consonants",
      description: "Learn mb, nd, ng sounds",
      category: "Pronunciation",
      orderIndex: 8,
      questId: questMap.get("quest-4"),
      exercises: [
        {
          type: "multiple_choice",
          question: "Practice prenasalized consonants: mbira, ndimi, ngoma",
          correctAnswer: "Practice completed",
          options: JSON.stringify(["Practice completed", "Skip practice", "Try later", "Need help"]),
          shonaPhrase: "mbira",
          audioText: "MBEE-rah",
          points: 12
        }
      ]
    },
    {
      id: "lesson-9",
      title: "Family Greetings",
      description: "Learn to greet family members properly",
      category: "Family & Relationships",
      orderIndex: 9,
      questId: questMap.get("quest-5"),
      exercises: [
        {
          type: "multiple_choice",
          question: "How do you greet your grandfather?",
          correctAnswer: "Mangwanani, Sekuru",
          options: JSON.stringify(["Mangwanani, Sekuru", "Mhoro, Baba", "Masikati, Amai", "Manheru, Mukoma"]),
          shonaPhrase: "Mangwanani, Sekuru",
          audioText: "Mah-ngwah-nah-nee, Seh-koo-roo",
          points: 15
        },
        {
          type: "translation",
          question: "Translate: Good morning, Grandmother",
          correctAnswer: "Mangwanani, Ambuya",
          options: JSON.stringify([]),
          englishPhrase: "Good morning, Grandmother",
          shonaPhrase: "Mangwanani, Ambuya",
          audioText: "Mah-ngwah-nah-nee, Ahm-boo-yah",
          points: 15
        }
      ]
    },
    {
      id: "lesson-10",
      title: "Family Hierarchy",
      description: "Understand Shona family structure and respect",
      category: "Family & Relationships",
      orderIndex: 10,
      questId: questMap.get("quest-5"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What is the most respectful way to address an elder?",
          correctAnswer: "Use their title with proper greeting",
          options: JSON.stringify(["Use their title with proper greeting", "Use their first name", "Just say hello", "Wave and smile"]),
          points: 15
        },
        {
          type: "cultural_context",
          question: "Why is respect important in Shona family culture?",
          correctAnswer: "It shows good upbringing and maintains harmony",
          options: JSON.stringify(["It shows good upbringing and maintains harmony", "It's just tradition", "It's required by law", "It makes you look good"]),
          points: 12
        }
      ]
    },
    {
      id: "lesson-11",
      title: "Food Vocabulary",
      description: "Learn names of traditional Shona foods",
      category: "Family & Relationships",
      orderIndex: 11,
      questId: questMap.get("quest-6"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What is 'sadza'?",
          correctAnswer: "Traditional maize porridge",
          options: JSON.stringify(["Traditional maize porridge", "Meat stew", "Vegetable soup", "Rice dish"]),
          shonaPhrase: "sadza",
          audioText: "SAH-dzah",
          points: 10
        },
        {
          type: "translation",
          question: "Translate: Thank you for the food",
          correctAnswer: "Ndatenda nekudya",
          options: JSON.stringify([]),
          englishPhrase: "Thank you for the food",
          shonaPhrase: "Ndatenda nekudya",
          audioText: "N-dah-ten-dah neh-koo-dyah",
          points: 15
        }
      ]
    },
    {
      id: "lesson-12",
      title: "Meal Customs",
      description: "Learn about Shona dining customs and etiquette",
      category: "Family & Relationships",
      orderIndex: 12,
      questId: questMap.get("quest-6"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What should you do before eating in a Shona home?",
          correctAnswer: "Wash your hands and say grace",
          options: JSON.stringify(["Wash your hands and say grace", "Start eating immediately", "Wait for everyone to sit", "Ask for a fork"]),
          points: 10
        },
        {
          type: "cultural_context",
          question: "Why is sharing food important in Shona culture?",
          correctAnswer: "It builds community and shows hospitality",
          options: JSON.stringify(["It builds community and shows hospitality", "It saves money", "It's required by tradition", "It makes food taste better"]),
          points: 12
        }
      ]
    },
    {
      id: "lesson-13",
      title: "Storytelling Vocabulary",
      description: "Learn words for sharing stories and experiences",
      category: "Family & Relationships",
      orderIndex: 13,
      questId: questMap.get("quest-7"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What does 'nyaya' mean?",
          correctAnswer: "Story",
          options: JSON.stringify(["Story", "Question", "Answer", "Word"]),
          shonaPhrase: "nyaya",
          audioText: "NYAH-yah",
          points: 10
        },
        {
          type: "translation",
          question: "Translate: Tell me a story",
          correctAnswer: "Ndiudze nyaya",
          options: JSON.stringify([]),
          englishPhrase: "Tell me a story",
          shonaPhrase: "Ndiudze nyaya",
          audioText: "N-dee-OO-dzeh NYAH-yah",
          points: 15
        }
      ]
    },
    {
      id: "lesson-14",
      title: "Sharing Experiences",
      description: "Learn to share your own experiences in Shona",
      category: "Family & Relationships",
      orderIndex: 14,
      questId: questMap.get("quest-7"),
      exercises: [
        {
          type: "multiple_choice",
          question: "How do you say 'I want to share' in Shona?",
          correctAnswer: "Ndinoda kugovera",
          options: JSON.stringify(["Ndinoda kugovera", "Ndinoda kutaura", "Ndinoda kuona", "Ndinoda kunzwa"]),
          shonaPhrase: "Ndinoda kugovera",
          audioText: "N-dee-NOH-dah koo-goh-VEH-rah",
          points: 15
        },
        {
          type: "cultural_context",
          question: "Why is storytelling important in Shona culture?",
          correctAnswer: "It preserves history and builds connections",
          options: JSON.stringify(["It preserves history and builds connections", "It's just entertainment", "It passes time", "It's required by elders"]),
          points: 12
        }
      ]
    },
    {
      id: "lesson-numbers-1-10",
      title: "Numbers 1-10",
      description: "Count from one to ten in Shona",
      category: "Foundation",
      orderIndex: 15,
      questId: questMap.get("quest-1"),
      exercises: [
        {
          type: "multiple_choice",
          question: "What is 'two' in Shona?",
          correctAnswer: "piri",
          options: JSON.stringify(["potsi", "piri", "tatu", "ina"]),
          englishPhrase: "two",
          audioText: "PEE-ree",
          points: 10
        },
        {
          type: "multiple_choice",
          question: "What is 'five' in Shona?",
          correctAnswer: "shanu",
          options: JSON.stringify(["shanu", "tanhatu", "nomwe", "serebun"]),
          englishPhrase: "five",
          audioText: "SHAH-noo",
          points: 10
        },
        {
          type: "multiple_choice",
          question: "What is 'ten' in Shona?",
          correctAnswer: "gumi",
          options: JSON.stringify(["gumi", "naira", "pfumbamwe", "umi"]),
          englishPhrase: "ten",
          audioText: "GOO-mee",
          points: 10
        }
      ]
    }
  ]

  for (const lessonData of lessonsData) {
    const { exercises, ...lesson } = lessonData
    
    const createdLesson = await prisma.lesson.create({
      data: {
        ...lesson,
        learningObjectives: JSON.stringify(["Master basic vocabulary", "Practice pronunciation", "Build confidence"]),
        discoveryElements: JSON.stringify(["Explore cultural context", "Connect with native speakers", "Practice in real situations"])
      }
    })
    
    for (const exercise of exercises) {
      await prisma.exercise.create({
        data: {
          ...exercise,
          lessonId: createdLesson.id
        }
      })
    }
    
    console.log(`✅ Created lesson: ${lesson.title} with ${exercises.length} exercises`)
  }

  type PathUnit = {
    stageOrder: number
    unitOrder: number
    category: string
    title: string
    description: string
  }

  const pathUnits: PathUnit[] = [
    { stageOrder: 1, unitOrder: 1, category: 'Unit 1: First Words', title: 'First Words', description: 'Greetings and first phrases' },
    { stageOrder: 1, unitOrder: 2, category: 'Unit 2: People Around You', title: 'People Around You', description: 'Family and people' },
    { stageOrder: 1, unitOrder: 3, category: 'Unit 3: Numbers & Time', title: 'Numbers & Time', description: 'Counting and time' },
    { stageOrder: 2, unitOrder: 1, category: 'Unit 4: Daily Life', title: 'Daily Life', description: 'Home and routine' },
    { stageOrder: 2, unitOrder: 2, category: 'Unit 5: Getting Around', title: 'Getting Around', description: 'Travel and directions' },
    { stageOrder: 3, unitOrder: 1, category: 'Unit 6: Doing Things', title: 'Doing Things', description: 'Actions and activities' },
    { stageOrder: 3, unitOrder: 2, category: 'Unit 7: Expressing Yourself', title: 'Expressing Yourself', description: 'Feelings and opinions' },
    { stageOrder: 4, unitOrder: 1, category: 'Unit 8: Culture & Traditions', title: 'Culture & Traditions', description: 'Heritage and customs' },
    { stageOrder: 4, unitOrder: 2, category: 'Unit 9: Nature & Environment', title: 'Nature & Environment', description: 'World around you' },
    { stageOrder: 5, unitOrder: 1, category: 'Unit 10: Modern Life', title: 'Modern Life', description: 'Contemporary topics' },
    { stageOrder: 5, unitOrder: 2, category: 'Unit 11: Society & Governance', title: 'Society & Governance', description: 'Community and civics' },
    { stageOrder: 6, unitOrder: 1, category: 'Unit 12: Complex Communication', title: 'Complex Communication', description: 'Advanced interaction' },
    { stageOrder: 6, unitOrder: 2, category: 'Unit 13: Deeper Culture', title: 'Deeper Culture', description: 'Deeper cultural nuance' },
  ]

  for (const u of pathUnits) {
    await prisma.lesson.upsert({
      where: { id: u.category },
      create: {
        id: u.category,
        title: u.title,
        description: u.description,
        category: u.category,
        orderIndex: u.unitOrder + (u.stageOrder - 1) * 10,
        learningObjectives: JSON.stringify(['Aligns with consolidated lesson content']),
        discoveryElements: JSON.stringify([]),
      },
      update: {
        title: u.title,
        description: u.description,
        category: u.category,
      },
    })
  }

  const learningPath = await prisma.learningPath.create({
    data: {
      slug: 'core',
      title: 'Core Shona Learning Path',
      pathType: 'default',
      isActive: true,
    },
  })

  const stageDefs = [
    {
      title: 'Foundation',
      description: 'Sounds, greetings, first words, numbers (aligns with Stage 1 in learning architecture)',
      orderIndex: 1
    },
    {
      title: 'Connection',
      description: 'Family, describing things, time and environment (Stage 2)',
      orderIndex: 2
    },
    {
      title: 'Expression',
      description: 'Daily situations, markets, health-related language (Stage 3)',
      orderIndex: 3
    },
    {
      title: 'Conversation',
      description: 'Questions, past/future, full sentences (Stage 4)',
      orderIndex: 4
    },
    {
      title: 'Culture',
      description: 'Traditions, proverbs, heritage (Stage 5)',
      orderIndex: 5
    },
    {
      title: 'Mastery',
      description: 'Stories, formal speech, dialect exposure (Stage 6)',
      orderIndex: 6
    }
  ]

  const stageByOrder = new Map<number, { id: string }>()
  for (const s of stageDefs) {
    const created = await prisma.stage.create({
      data: {
        learningPathId: learningPath.id,
        title: s.title,
        description: s.description,
        orderIndex: s.orderIndex
      }
    })
    stageByOrder.set(s.orderIndex, created)
  }

  const orderedUnits: { id: string }[] = []

  for (const s of stageDefs) {
    const stage = stageByOrder.get(s.orderIndex)
    if (!stage) throw new Error(`Missing stage ${s.orderIndex}`)
    const unitsInStage = pathUnits
      .filter((u) => u.stageOrder === s.orderIndex)
      .sort((a, b) => a.unitOrder - b.unitOrder)

    let orderIdx = 0
    for (const u of unitsInStage) {
      orderIdx += 1
      const unit = await prisma.unit.create({
        data: {
          stageId: stage.id,
          lessonId: u.category,
          title: u.title,
          description: u.description,
          unitType: 'lesson',
          orderIndex: orderIdx
        }
      })
      orderedUnits.push(unit)
    }

    orderIdx += 1
    const checkpointUnit = await prisma.unit.create({
      data: {
        stageId: stage.id,
        lessonId: null,
        title: `Checkpoint — ${s.title}`,
        description: `Pass this assessment to unlock the next stage (${s.title}).`,
        unitType: 'checkpoint',
        orderIndex: orderIdx
      }
    })
    orderedUnits.push(checkpointUnit)

    const qData = buildStageCheckpointData(s.orderIndex)
    await prisma.checkpoint.create({
      data: {
        unitId: checkpointUnit.id,
        title: `Checkpoint ${s.orderIndex}`,
        passingScore: qData.overallPassPercent,
        questionData: JSON.stringify(qData)
      }
    })
  }

  const prereqRows: { unitId: string; requiresUnitId: string }[] = []
  for (let i = 1; i < orderedUnits.length; i++) {
    prereqRows.push({ unitId: orderedUnits[i].id, requiresUnitId: orderedUnits[i - 1].id })
  }
  await prisma.unitPrerequisite.createMany({ data: prereqRows })

  await prisma.achievement.createMany({
    data: [
      { code: 'first-lesson', title: 'First Steps', description: 'Complete your first lesson' },
      { code: 'first-unit', title: 'Unit Master', description: 'Complete all lessons in a unit' },
      { code: 'first-stage', title: 'Stage Champion', description: 'Complete your first stage checkpoint' },
      {
        code: 'milestone-foundation',
        title: 'Greeter',
        description: 'Complete the Foundation stage'
      },
      {
        code: 'milestone-connection',
        title: 'Family Member',
        description: 'Complete the Connection stage'
      },
      {
        code: 'milestone-expression',
        title: 'Market Goer',
        description: 'Complete the Expression stage'
      },
      {
        code: 'milestone-conversation',
        title: 'Conversationalist',
        description: 'Complete the Conversation stage'
      },
      {
        code: 'milestone-culture',
        title: 'Cultural Ambassador',
        description: 'Complete the Culture stage'
      },
      {
        code: 'milestone-mastery',
        title: 'Shona Speaker',
        description: 'Complete the Mastery stage'
      },
      {
        code: 'checkpoint-perfect',
        title: 'Perfect Score',
        description: 'Score 100% on any checkpoint'
      },
      { code: 'flashcard-50', title: 'Vocabulary Builder', description: 'Practice 50 flashcards' },
      { code: 'week-streak', title: 'Dedicated Learner', description: '7-day learning streak' }
    ]
  })

  console.log('🎉 Database seeded successfully!')
  console.log(`📚 Created ${lessonsData.length} lessons (includes foundation numbers)`)
  console.log(`🗺️  Created ${questsData.length} quests`)
  console.log(
    '🛤️  Created learning path: 6 stages, 13 lesson units, 6 checkpoints, linear prerequisites, milestone achievements'
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 