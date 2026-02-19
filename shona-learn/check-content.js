const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkContent() {
  try {
    console.log('📊 Checking database content...\n')
    
    // Check lessons
    const lessons = await prisma.lesson.findMany({
      orderBy: { orderIndex: 'asc' },
      include: {
        exercises: true,
        quest: true
      }
    })
    
    console.log(`📚 Lessons (${lessons.length}):`)
    lessons.forEach((lesson, index) => {
      console.log(`  ${index + 1}. ${lesson.title} (${lesson.category}) - ${lesson.exercises.length} exercises`)
      if (lesson.quest) {
        console.log(`     🗺️  Linked to quest: ${lesson.quest.title}`)
      }
    })
    
    console.log('\n')
    
    // Check quests
    const quests = await prisma.quest.findMany({
      orderBy: { orderIndex: 'asc' }
    })
    
    console.log(`🗺️  Quests (${quests.length}):`)
    quests.forEach((quest, index) => {
      console.log(`  ${index + 1}. ${quest.title} (${quest.category}) - Level ${quest.requiredLevel}`)
    })
    
    console.log('\n')
    
    // Check vocabulary
    const vocabularyCount = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Vocabulary"`
    console.log(`📖 Vocabulary entries: ${vocabularyCount[0].count}`)
    
  } catch (error) {
    console.error('Error checking content:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkContent() 