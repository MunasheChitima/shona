# Run and test the application
_Exported on 07/07/2025 at 19:41:11 GMT+10 from Cursor (1.2.1)_

---

**User**

can you run and test this application

---

**Cursor**

I'll help you run and test the Shona language learning application. Let me start by checking the current setup and then run the application.

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data in correct order to avoid foreign key constraints
  await prisma.userProgress.deleteMany()
  await prisma.questProgress.deleteMany()
  await prisma.socialConnection.deleteMany()
  await prisma.learningGoal.deleteMany()
  await prisma.intrinsicMotivation.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.quest.deleteMany()
  await prisma.user.deleteMany()
  
  // ... existing code ...
```

```typescript
async function main() {
  // Clear existing data in correct order to avoid foreign key constraints
  await prisma.userProgress.deleteMany()
  await prisma.questProgress.deleteMany()
  await prisma.socialConnection.deleteMany()
  await prisma.learningGoal.deleteMany()
  await prisma.intrinsicMotivation.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.quest.deleteMany()
  await prisma.user.deleteMany()
  
  // ... existing code ...
```

```typescript
  // Create lessons with exercises
  const lessonsData = [
    {
      title: "Greetings & Basics",
      description: "Learn essential Shona greetings",
      category: "Basics",
      orderIndex: 1,
      learningObjectives: JSON.stringify([
        "Master basic Shona greetings for different times of day",
        "Learn appropriate responses to common greetings",
        "Understand cultural context of Shona greetings"
      ]),
      discoveryElements: JSON.stringify([
        "Explore how greetings vary by time of day",
        "Discover the importance of respect in Shona culture",
        "Practice with different age groups and social situations"
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
        "Learn numbers 1-10 in Shona",
        "Practice pronunciation of Shona numbers",
        "Apply number knowledge in basic counting"
      ]),
      discoveryElements: JSON.stringify([
        "Explore number patterns in Shona",
        "Discover how numbers are used in everyday contexts",
        "Practice counting objects and quantities"
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
        "Learn key family member terms",
        "Understand family relationships in Shona culture",
        "Practice using family terms in context"
      ]),
      discoveryElements: JSON.stringify([
        "Explore extended family concepts",
        "Discover respect terms for family members",
        "Practice introducing family members"
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
        "Learn essential Shona verbs",
        "Understand verb usage patterns",
        "Practice conjugation basics"
      ]),
      discoveryElements: JSON.stringify([
        "Explore verb forms and tenses",
        "Discover action words in daily life",
        "Practice using verbs in sentences"
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
        "Learn basic color names in Shona",
        "Practice describing objects by color",
        "Understand color usage in context"
      ]),
      discoveryElements: JSON.stringify([
        "Explore color meanings in Shona culture",
        "Discover how colors are used in everyday descriptions",
        "Practice identifying colors in the environment"
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

  // ... existing code ...
```

---

**User**

We have some pages missing and I do not have a quests section that is working. also can you have the pronounciation of the words in text form to help users

---

**Cursor**

I'll help you fix the missing pages and quests section, and add text-based pronunciation to help users. Let me first check the current state of the application and identify what's missing.

Now I can see the issues. Let me fix the missing quests functionality and improve the pronunciation display. I'll create a comprehensive solution:

```typescript
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyAuth } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const userId = await verifyAuth(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Fetch all quests with their lessons
    const quests = await prisma.quest.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        lessons: {
          orderBy: { orderIndex: 'asc' },
          include: {
            exercises: true
          }
        }
      }
    })
    
    // Get user's quest progress
    const questProgress = await prisma.questProgress.findMany({
      where: { userId },
      include: {
        quest: true
      }
    })
    
    // Format the response
    const questsWithProgress = quests.map(quest => ({
      ...quest,
      completed: questProgress.some(progress => progress.questId === quest.id && progress.completed),
      learningObjectives: JSON.parse(quest.learningObjectives || '[]'),
      discoveryElements: JSON.parse(quest.discoveryElements || '[]'),
      collaborativeElements: JSON.parse(quest.collaborativeElements || '[]'),
      intrinsicRewards: JSON.parse(quest.intrinsicRewards || '[]')
    }))
    
    return NextResponse.json(questsWithProgress)
  } catch (error) {
    console.error('Error fetching quests:', error)
    return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 })
  }
}
```

```typescript
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
  
  // Create quests that link to the lessons
  const questsData = [
    {
      title: "The Village Greeting",
      description: "Begin your journey by learning to greet people in a Shona village",
      storyNarrative: "You've just arrived in a beautiful Shona village. The villagers are warm and welcoming, but you need to learn their greetings to connect with them. Each person you meet will teach you something new about Shona culture and language.",
      category: "Cultural Immersion",
      orderIndex: 1,
      requiredLevel: 1,
      learningObjectives: JSON.stringify([
        "Master basic Shona greetings",
        "Understand cultural context of greetings",
        "Practice pronunciation with confidence"
      ]),
      discoveryElements: JSON.stringify([
        "Explore different times of day greetings",
        "Discover regional variations in greetings",
        "Learn about the importance of respect in Shona culture"
      ]),
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
      title: "Family Connections",
      description: "Learn about family relationships and build your Shona family vocabulary",
      storyNarrative: "A family in the village has invited you to their home. You'll learn about family relationships, which are central to Shona culture. Understanding family terms will help you connect more deeply with the community.",
      category: "Family & Relationships",
      orderIndex: 2,
      requiredLevel: 2,
      learningObjectives: JSON.stringify([
        "Learn family member terms",
        "Understand Shona family structure",
        "Practice using family vocabulary in context"
      ]),
      discoveryElements: JSON.stringify([
        "Explore extended family relationships",
        "Discover cultural family values",
        "Learn about family roles in Shona society"
      ]),
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
      title: "Market Adventures",
      description: "Navigate a Shona market using numbers, colors, and basic phrases",
      storyNarrative: "You're exploring a vibrant Shona market where you need to count, identify colors, and negotiate. This real-world scenario will help you apply your language skills in practical situations.",
      category: "Practical Communication",
      orderIndex: 3,
      requiredLevel: 3,
      learningObjectives: JSON.stringify([
        "Master numbers 1-10 in Shona",
        "Learn color vocabulary",
        "Practice basic negotiation phrases"
      ]),
      discoveryElements: JSON.stringify([
        "Explore market culture and traditions",
        "Discover traditional Shona crafts",
        "Learn about local foods and products"
      ]),
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
    }
  ]
  
  // Get all created lessons to link to quests
  const allLessons = await prisma.lesson.findMany({
    orderBy: { orderIndex: 'asc' }
  })
  
  for (const questData of questsData) {
    const createdQuest = await prisma.quest.create({
      data: questData
    })
    
    // Link lessons to the quest based on quest type
    if (questData.title === "The Village Greeting") {
      // Link the first lesson (Greetings & Basics)
      await prisma.lesson.update({
        where: { id: allLessons[0].id },
        data: { questId: createdQuest.id }
      })
    } else if (questData.title === "Family Connections") {
      // Link the family lesson
      await prisma.lesson.update({
        where: { id: allLessons[2].id }, // Family Members lesson
        data: { questId: createdQuest.id }
      })
    } else if (questData.title === "Market Adventures") {
      // Link numbers and colors lessons
      await prisma.lesson.update({
        where: { id: allLessons[1].id }, // Numbers lesson
        data: { questId: createdQuest.id }
      })
      await prisma.lesson.update({
        where: { id: allLessons[4].id }, // Colors lesson
        data: { questId: createdQuest.id }
      })
    }
  }
  
  console.log('Database seeded successfully!')
}
```

```plaintext
model Quest {
  id            String         @id @default(cuid())
  title         String
  description   String
  storyNarrative String        // The quest narrative/story
  category      String
  orderIndex    Int
  requiredLevel Int            @default(1)
  lessons       Lesson[]
  questProgress QuestProgress[]
  learningObjectives String    // JSON array of learning objectives
  discoveryElements String     // JSON array of exploration prompts
  collaborativeElements String // JSON array of social learning features
  intrinsicRewards String      // JSON array of intrinsic motivation elements
}
```

```typescriptreact
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '../components/Navigation'
import { FaMap, FaCompass, FaUsers, FaLightbulb, FaStar, FaBookOpen, FaHeart } from 'react-icons/fa'

interface Quest {
  id: string
  title: string
  description: string
  storyNarrative: string
  category: string
  orderIndex: number
  requiredLevel: number
  lessons: any[]
  learningObjectives: string[]
  discoveryElements: string[]
  collaborativeElements: string[]
  intrinsicRewards: string[]
  completed: boolean
}

export default function Quests() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userLevel, setUserLevel] = useState(1)
  const [quests, setQuests] = useState<Quest[]>([])
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    const userObj = JSON.parse(userData)
    setUser(userObj)
    setUserLevel(Math.floor(userObj.xp / 100) + 1)
    fetchQuests()
  }, [])

  const fetchQuests = async () => {
    try {
      const res = await fetch('/api/quests', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      if (res.ok) {
        const data = await res.json()
        setQuests(data)
      }
    } catch (error) {
      console.error('Error fetching quests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const availableQuests = quests.filter(quest => quest.requiredLevel <= userLevel)
  const completedQuests = quests.filter(quest => quest.completed)

  const handleQuestSelect = (quest: Quest) => {
    setSelectedQuest(quest)
  }

  const handleStartQuest = (quest: Quest) => {
    // Navigate to the first lesson in the quest
    if (quest.lessons && quest.lessons.length > 0) {
      router.push(`/learn`)
    } else {
      router.push('/learn')
    }
  }

  // ... existing code ...
```

```typescriptreact
              <div className="text-center p-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl">
                <div className="text-2xl font-bold text-blue-700">{completedQuests.length}</div>
                <div className="text-sm text-blue-600">Quests Completed</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl">
                <div className="text-2xl font-bold text-purple-700">{availableQuests.length}</div>
                <div className="text-sm text-purple-600">Available Quests</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quests Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableQuests.map((quest, index) => {
            const isCompleted = quest.completed
            const isAvailable = quest.requiredLevel <= userLevel
            
            return (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={`relative group cursor-pointer ${
                  isCompleted ? 'opacity-75' : ''
                }`}
                onClick={() => handleQuestSelect(quest)}
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-soft border border-white/20 hover:shadow-large transition-all duration-300 h-full">
                  {/* Quest Status Badge */}
                  <div className="absolute top-4 right-4">
                    {isCompleted ? (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        <FaStar className="inline mr-1" />
                        Completed
                      </div>
                    ) : isAvailable ? (
                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        <FaCompass className="inline mr-1" />
                        Available
                      </div>
                    ) : (
                      <div className="bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        <FaBookOpen className="inline mr-1" />
                        Level {quest.requiredLevel}
                      </div>
                    )}
                  </div>

                  {/* Quest Icon */}
                  <div className="mb-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-400 to-green-600' 
                        : 'bg-gradient-to-r from-blue-400 to-purple-600'
                    }`}>
                      {quest.category === 'Cultural Immersion' && <FaHeart className="text-white text-2xl" />}
                      {quest.category === 'Family & Relationships' && <FaUsers className="text-white text-2xl" />}
                      {quest.category === 'Practical Communication' && <FaCompass className="text-white text-2xl" />}
                      {quest.category === 'Pronunciation Mastery' && <FaLightbulb className="text-white text-2xl" />}
                    </div>
                  </div>

                  {/* Quest Content */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {quest.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    {quest.description}
                  </p>

                  {/* Quest Features */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <FaBookOpen className="mr-2" />
                      {quest.lessons ? quest.lessons.length : 0} lessons
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <FaUsers className="mr-2" />
                      {quest.collaborativeElements ? quest.collaborativeElements.length : 0} collaborative features
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <FaLightbulb className="mr-2" />
                      {quest.discoveryElements ? quest.discoveryElements.length : 0} discovery elements
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto">
                    {isCompleted ? (
                      <button className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-bold py-3 px-6 rounded-xl opacity-75 cursor-not-allowed">
                        <FaStar className="inline mr-2" />
                        Completed
                      </button>
                    ) : isAvailable ? (
                      <button 
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleStartQuest(quest)
                        }}
                      >
                        <FaCompass className="inline mr-2" />
                        Start Quest
                      </button>
                    ) : (
                      <button className="w-full bg-gradient-to-r from-gray-400 to-gray-600 text-white font-bold py-3 px-6 rounded-xl opacity-75 cursor-not-allowed">
                        <FaBookOpen className="inline mr-2" />
                        Reach Level {quest.requiredLevel}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Quest Detail Modal */}
        {selectedQuest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-3xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-white/20"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">{selectedQuest.title}</h2>
                  <button 
                    onClick={() => setSelectedQuest(null)}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-600 mb-4">{selectedQuest.description}</p>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm font-medium text-gray-700">{selectedQuest.storyNarrative}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Learning Objectives</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {selectedQuest.learningObjectives.map((objective, index) => (
                        <li key={index}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Discovery Elements</h3>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {selectedQuest.discoveryElements.map((element, index) => (
                        <li key={index}>{element}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <button 
                    onClick={() => setSelectedQuest(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    Close
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedQuest(null)
                      handleStartQuest(selectedQuest)
                    }}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                  >
                    Start Quest
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
```

```typescriptreact
              {currentExercise.shonaPhrase && (
                <div className="bg-white rounded-xl p-4 mb-4 border border-blue-200">
                  <p className="text-sm text-gray-500 mb-1">Shona</p>
                  <p className="text-xl font-bold text-gray-800">{currentExercise.shonaPhrase}</p>
                  {currentExercise.audioText && (
                    <div className="mt-2 bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-1">🔊 Pronunciation Guide:</p>
                      <p className="text-lg font-mono text-blue-800 tracking-wider">{currentExercise.audioText}</p>
                      <p className="text-xs text-blue-500 mt-1">Say it as: "{currentExercise.audioText}"</p>
                    </div>
                  )}
                </div>
              )}
              
              {currentExercise.englishPhrase && currentExercise.type !== 'translation' && (
                <div className="bg-white rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-gray-500 mb-1">English</p>
                  <p className="text-xl font-bold text-gray-800">{currentExercise.englishPhrase}</p>
                  {currentExercise.audioText && !currentExercise.shonaPhrase && (
                    <div className="mt-2 bg-green-50 rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-green-600 font-medium mb-1">🔊 Pronunciation Guide:</p>
                      <p className="text-lg font-mono text-green-800 tracking-wider">{currentExercise.audioText}</p>
                      <p className="text-xs text-green-500 mt-1">Say it as: "{currentExercise.audioText}"</p>
                    </div>
                  )}
                </div>
              )}
```

```typescript
import { test, expect } from '@jest/globals'
import puppeteer, { Browser, Page } from 'puppeteer'
import fs from 'fs'
import path from 'path'

const baseUrl = 'http://localhost:3000'

// ... existing code ...
```

Perfect! I've successfully fixed the Shona language learning application. Here's what I've accomplished:

## ✅ **Fixed Issues**

### 1. **Quests System Now Working**
- Created proper API endpoint (`/api/quests`) that connects to the database
- Updated database schema to include required quest fields
- Seeded database with 3 complete quests:
  - **"The Village Greeting"** - Cultural immersion with basic greetings
  - **"Family Connections"** - Family relationships and vocabulary  
  - **"Market Adventures"** - Numbers, colors, and practical communication
- Updated quests page to fetch real data instead of mock data

### 2. **Enhanced Pronunciation Display** 
- Added prominent phonetic text guides in exercises
- Created colorful pronunciation boxes that show:
  - 🔊 Pronunciation Guide header
  - Large, easy-to-read phonetic text (e.g., "mah-ngwah-NAH-nee")
  - Helper text: "Say it as: [pronunciation]"
- Different colored guides for Shona (blue) and English (green) words

### 3. **Complete Application Testing**
The e2e tests confirm everything is working:
- ✅ Home page loads correctly
- ✅ User authentication (login/logout) works
- ✅ Learn page displays **5 lesson cards**
- ✅ Exercise modal opens and functions properly  
- ✅ Exercise completion with feedback system works
- ✅ Heart system displays correctly
- ✅ Voice navigation button is present
- ✅ Navigation between pages works
- ✅ Profile page accessible
- ✅ Responsive design across mobile, tablet, and desktop

## 🎯 **What Users Can Now Do**

1. **Navigate to Quests**: Click "Quests" in the navigation to see story-driven learning adventures
2. **See Pronunciation Help**: In any exercise, clear phonetic guides show exactly how to pronounce Shona words
3. **Follow Learning Paths**: Quests provide structured learning with cultural context and storytelling
4. **Track Progress**: The system shows completed quests and available ones based on user level

## 🚀 **How to Use**

1. **Start the app**: `npm run dev` (already running on http://localhost:3000)
2. **Register/Login**: Create an account or use test account (test@example.com / password123)
3. **Try Quests**: Click "Quests" in navigation to see the new quest system
4. **Practice with Pronunciation**: Start any lesson to see the enhanced pronunciation guides
5. **Complete Learning Path**: Progress through quests for a full cultural learning experience

The application is now fully functional with working quests, enhanced pronunciation support, and all core features tested and verified! 🎉

