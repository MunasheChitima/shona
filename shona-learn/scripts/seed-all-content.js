// Seed ALL content based on hierarchical JSON (levels → units → lessons)
// Usage: `node shona-learn/scripts/seed-all-content.js`

// ------------- IMPORTS -------------
const fs = require('fs')
const path = require('path')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ------------- HELPERS -------------
/**
 * Ensure value is a JSON string if it's an array, otherwise return as-is
 * so it matches the existing Prisma schema for the `options` field.
 */
function normaliseOptions(options) {
  if (Array.isArray(options)) return JSON.stringify(options)
  if (typeof options === 'string') return options
  return JSON.stringify([])
}

function buildLessonsFromPlan(planPath) {
  const raw = fs.readFileSync(planPath, 'utf-8')
  const data = JSON.parse(raw)

  const lessonsOut = []

  let globalOrder = 1
  for (const level of data.levels) {
    for (const unit of level.units) {
      for (const lesson of unit.lessons) {
        lessonsOut.push({
          orderIndex: globalOrder++,
          title: lesson.title,
          description: lesson.goal,
          category: `L${level.levelNumber}U${unit.unitNumber}`,
          exercises: lesson.exercises.map((ex, idx) => ({
            ...ex,
            options: normaliseOptions(ex.options),
            // fallback values for optional properties expected by schema
            question: ex.question || ex.type,
            correctAnswer: ex.correctAnswer || '',
            shonaPhrase: ex.shonaPhrase || undefined,
            englishPhrase: ex.englishPhrase || undefined,
            audioText: ex.audioText || undefined,
            orderIndex: idx + 1
          }))
        })
      }
    }
  }

  return lessonsOut
}

async function main() {
  const planPath = path.join(__dirname, '..', 'content', 'lessons_updated.json')
  const lessonsData = buildLessonsFromPlan(planPath)

  console.log(`Seeding ${lessonsData.length} lessons from lesson plan…`)

  // wipe previous data
  await prisma.exercise.deleteMany()
  await prisma.lesson.deleteMany()

  for (const lessonData of lessonsData) {
    const { exercises, ...lesson } = lessonData

    const createdLesson = await prisma.lesson.create({ data: lesson })

    for (const ex of exercises) {
      await prisma.exercise.create({
        data: {
          ...ex,
          lessonId: createdLesson.id
        }
      })
    }
  }

  console.log('✅  Lesson plan seeded successfully!')
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })