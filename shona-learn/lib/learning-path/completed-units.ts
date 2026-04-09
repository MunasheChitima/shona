import fs from 'fs'
import path from 'path'
import type { PrismaClient } from '@prisma/client'

export function loadLessonIdsByCategory(): Record<string, string[]> {
  const lessonsPath = path.join(process.cwd(), 'content', 'lessons_consolidated.json')
  if (!fs.existsSync(lessonsPath)) return {}
  const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'))
  const lessons = lessonsData.lessons || []
  const byCat: Record<string, string[]> = {}
  for (const lesson of lessons) {
    if (!lesson?.category || !lesson?.id) continue
    if (!byCat[lesson.category]) byCat[lesson.category] = []
    byCat[lesson.category].push(lesson.id)
  }
  return byCat
}

/** Lesson-complete units and explicitly completed units (e.g. checkpoints). */
export async function getCompletedUnitIdsForPath(prisma: PrismaClient, userId: string, pathId: string) {
  const learningPath = await prisma.learningPath.findUnique({
    where: { id: pathId },
    include: {
      stages: {
        orderBy: { orderIndex: 'asc' },
        include: {
          units: { orderBy: { orderIndex: 'asc' } }
        }
      }
    }
  })

  if (!learningPath) return new Set<string>()

  const completedProgress = await prisma.userUnitProgress.findMany({
    where: { userId, completed: true },
    select: { unitId: true }
  })
  const completedUnitIds = new Set(completedProgress.map((row) => row.unitId))

  const lessonIdsByCategory = loadLessonIdsByCategory()
  const completedLessonRows = await prisma.userProgress.findMany({
    where: { userId, completed: true },
    select: { lessonId: true }
  })
  const completedLessonIds = new Set(completedLessonRows.map((r) => r.lessonId))

  for (const stage of learningPath.stages) {
    for (const unit of stage.units) {
      if (unit.unitType !== 'lesson' || !unit.lessonId) continue
      const ids = lessonIdsByCategory[unit.lessonId]
      if (!ids || ids.length === 0) continue
      const allDone = ids.every((id) => completedLessonIds.has(id))
      if (allDone) completedUnitIds.add(unit.id)
    }
  }

  return completedUnitIds
}
