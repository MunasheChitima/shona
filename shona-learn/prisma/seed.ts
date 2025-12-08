import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

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
  
  // Load lessons from JSON file
  const lessonsPath = path.join(__dirname, '..', 'content', 'lessons.json')
  let lessonsData = []
  
  if (fs.existsSync(lessonsPath)) {
    const lessonsFile = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'))
    lessonsData = lessonsFile.lessons || lessonsFile
    console.log(`Loaded ${lessonsData.length} lessons from JSON file`)
    
    // Remove duplicates based on orderIndex (keep first occurrence)
    const seenOrderIndexes = new Set()
    lessonsData = lessonsData.filter((lesson: any) => {
      const orderIndex = lesson.orderIndex
      if (seenOrderIndexes.has(orderIndex)) {
        console.log(`Skipping duplicate lesson with orderIndex ${orderIndex}: ${lesson.title}`)
        return false
      }
      seenOrderIndexes.add(orderIndex)
      return true
    })
    console.log(`After deduplication: ${lessonsData.length} unique lessons`)
  } else {
    console.log('Lessons JSON file not found, using default lessons')
    // Fallback to default lessons if JSON doesn't exist
    lessonsData = [
      {
        title: "Greetings & Basics",
        description: "Learn essential Shona greetings",
        category: "Basics",
        orderIndex: 1,
        xpReward: 50,
        exercises: [
          {
            type: "multiple_choice",
            question: "What does 'Mangwanani' mean?",
            correctAnswer: "Good morning",
            options: JSON.stringify(["Good morning", "Good evening", "Thank you", "Hello"]),
            shonaPhrase: "Mangwanani",
            audioText: "Mah-ngwah-nah-nee"
          }
        ]
      }
    ]
  }

  for (const lessonData of lessonsData) {
    const { exercises, learningObjectives, discoveryElements, ...lesson } = lessonData
    
    // Check if lesson with same orderIndex already exists (extra safety check)
    const existing = await prisma.lesson.findFirst({
      where: { orderIndex: lesson.orderIndex || 999 }
    })
    
    if (existing) {
      console.log(`Skipping lesson with orderIndex ${lesson.orderIndex} - already exists: ${existing.title}`)
      continue
    }
    
    const createdLesson = await prisma.lesson.create({
      data: {
        title: lesson.title,
        description: lesson.description || '',
        category: lesson.category || 'general',
        orderIndex: lesson.orderIndex || 999,
        xpReward: lesson.xpReward || 50,
        learningObjectives: learningObjectives ? (Array.isArray(learningObjectives) ? JSON.stringify(learningObjectives) : learningObjectives) : null,
        discoveryElements: discoveryElements ? (Array.isArray(discoveryElements) ? JSON.stringify(discoveryElements) : discoveryElements) : null
      }
    })
    
    // Create exercises
    if (exercises && Array.isArray(exercises) && exercises.length > 0) {
      for (const exercise of exercises) {
        await prisma.exercise.create({
          data: {
            type: exercise.type || 'multiple_choice',
            question: exercise.question || '',
            correctAnswer: exercise.correctAnswer || '',
            options: typeof exercise.options === 'string' ? exercise.options : JSON.stringify(exercise.options || []),
            shonaPhrase: exercise.shonaPhrase || null,
            englishPhrase: exercise.englishPhrase || null,
            audioText: exercise.audioText || null,
            points: exercise.points || 5,
            lessonId: createdLesson.id
          }
        })
      }
    }
  }
  
  console.log(`Database seeded successfully with ${lessonsData.length} lessons!`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
