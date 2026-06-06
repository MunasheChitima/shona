/**
 * Dev content model: JSON + Prisma together.
 * - Lessons + quests are seeded from content/lessons_consolidated.json
 *   (single source of truth shared with /api/lessons).
 * - Vocabulary is mirrored from content/flashcards.json into VocabularyItem.
 * - Exercises stay in the JSON; runtime reads them from there (we do NOT
 *   seed exercises into Prisma to avoid drift).
 *
 * Env: FLASHCARDS_SEED_PATH — optional path to flashcards JSON (relative to repo root or absolute).
 * Loads .env.local then .env so `prisma db seed` matches Next.js dev.
 */
import { config as loadEnv } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { buildStageCheckpointData } from '../lib/checkpoints/stage-questions'
import { quests as questDefs } from '../lib/quests'

const repoRoot = path.join(__dirname, '..')
loadEnv({ path: path.join(repoRoot, '.env.local') })
loadEnv({ path: path.join(repoRoot, '.env') })

const prisma = new PrismaClient()

function flashcardsJsonPath(): string {
  const override = process.env.FLASHCARDS_SEED_PATH
  if (override) return path.isAbsolute(override) ? override : path.join(repoRoot, override)
  return path.join(repoRoot, 'content', 'flashcards.json')
}

type ConsolidatedLesson = {
  id: string
  title: string
  description?: string
  questId?: string
  category?: string
  orderIndex?: number
  xpReward?: number
  learningObjectives?: string[]
  discoveryElements?: string[]
}

type ConsolidatedFile = {
  metadata?: unknown
  lessons: ConsolidatedLesson[]
}

function loadConsolidated(): ConsolidatedFile {
  const p = path.join(repoRoot, 'content', 'lessons_consolidated.json')
  if (!fs.existsSync(p)) {
    throw new Error(`Consolidated lessons JSON not found: ${p}`)
  }
  const raw = fs.readFileSync(p, 'utf-8')
  const parsed = JSON.parse(raw) as ConsolidatedFile
  if (!Array.isArray(parsed.lessons)) {
    throw new Error('Expected { lessons: [...] } in lessons_consolidated.json')
  }
  return parsed
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
  const parsedFlashcards = JSON.parse(flashcardsRaw)
  const flashcardsData = parsedFlashcards.flashcards ?? parsedFlashcards
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
  console.log(`Seeded ${flashcardsData.length} vocabulary items from ${path.relative(repoRoot, flashcardsPath)}`)

  // Create quests from lib/quests.ts (slug IDs — matches lessons_consolidated.json)
  for (const q of questDefs) {
    await prisma.quest.upsert({
      where: { id: q.id },
      create: {
        id: q.id,
        title: q.title,
        description: q.description,
        storyNarrative: q.storyNarrative,
        category: q.category,
        orderIndex: q.orderIndex,
        requiredLevel: q.requiredLevel,
        collaborativeElements: null,
        intrinsicRewards: JSON.stringify(q.learningObjectives ?? []),
      },
      update: {
        title: q.title,
        description: q.description,
        storyNarrative: q.storyNarrative,
        category: q.category,
        orderIndex: q.orderIndex,
        requiredLevel: q.requiredLevel,
      },
    })
  }
  console.log(`Seeded ${questDefs.length} quests (slug IDs)`)

  // Upsert lessons from consolidated JSON (60 lessons, single source of truth)
  const consolidated = loadConsolidated()
  for (const l of consolidated.lessons) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      create: {
        id: l.id,
        title: l.title,
        description: l.description ?? '',
        category: l.category ?? 'General',
        orderIndex: l.orderIndex ?? 0,
        xpReward: l.xpReward ?? 10,
        questId: l.questId ?? null,
        learningObjectives: JSON.stringify(l.learningObjectives ?? []),
        discoveryElements: JSON.stringify(l.discoveryElements ?? []),
      },
      update: {
        title: l.title,
        description: l.description ?? '',
        category: l.category ?? 'General',
        orderIndex: l.orderIndex ?? 0,
        xpReward: l.xpReward ?? 10,
        questId: l.questId ?? null,
        learningObjectives: JSON.stringify(l.learningObjectives ?? []),
        discoveryElements: JSON.stringify(l.discoveryElements ?? []),
      },
    })
  }
  console.log(`Seeded ${consolidated.lessons.length} lessons from lessons_consolidated.json`)

  // Build learning path: stages map to unit categories from JSON.
  type PathUnit = {
    stageOrder: number
    unitOrder: number
    category: string // unit category (also the lesson id used as the "unit lesson")
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

  // Create a single "unit-anchor" lesson per path-unit category so that Unit
  // rows have a stable lesson FK. (Real per-unit lessons live in the JSON
  // and are seeded above with their own ids like "lesson-1".)
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
    { title: 'Foundation', description: 'Sounds, greetings, first words, numbers', orderIndex: 1 },
    { title: 'Connection', description: 'Family, describing things, time and environment', orderIndex: 2 },
    { title: 'Expression', description: 'Daily situations, markets, health-related language', orderIndex: 3 },
    { title: 'Conversation', description: 'Questions, past/future, full sentences', orderIndex: 4 },
    { title: 'Culture', description: 'Traditions, proverbs, heritage', orderIndex: 5 },
    { title: 'Mastery', description: 'Stories, formal speech, dialect exposure (Stage 6)', orderIndex: 6 }
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
      { code: 'milestone-foundation', title: 'Greeter', description: 'Complete the Foundation stage' },
      { code: 'milestone-connection', title: 'Family Member', description: 'Complete the Connection stage' },
      { code: 'milestone-expression', title: 'Market Goer', description: 'Complete the Expression stage' },
      { code: 'milestone-conversation', title: 'Conversationalist', description: 'Complete the Conversation stage' },
      { code: 'milestone-culture', title: 'Cultural Ambassador', description: 'Complete the Culture stage' },
      { code: 'milestone-mastery', title: 'Shona Speaker', description: 'Complete the Mastery stage' },
      { code: 'checkpoint-perfect', title: 'Perfect Score', description: 'Score 100% on any checkpoint' },
      { code: 'flashcard-50', title: 'Vocabulary Builder', description: 'Practice 50 flashcards' },
      { code: 'week-streak', title: 'Dedicated Learner', description: '7-day learning streak' }
    ]
  })

  console.log('Database seeded successfully!')
  console.log(`Seeded ${consolidated.lessons.length} lessons + ${pathUnits.length} unit-anchor lessons`)
  console.log(`Seeded ${questDefs.length} quests`)
  console.log('Learning path: 6 stages, 13 lesson units, 6 checkpoints, linear prerequisites, milestone achievements')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
