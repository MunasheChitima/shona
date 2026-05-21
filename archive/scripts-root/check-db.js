const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking database contents...\n')
    
    // Get counts
    const vocabCount = await prisma.vocabularyItem.count()
    const lessonCount = await prisma.lesson.count()
    const exerciseCount = await prisma.exercise.count()
    
    console.log('📊 Database Statistics:')
    console.log(`  📚 Total Lessons: ${lessonCount}`)
    console.log(`  📖 Total Vocabulary Items: ${vocabCount}`)
    console.log(`  📝 Total Exercises: ${exerciseCount}`)
    
    // Get vocabulary by source
    const vocabBySource = await prisma.vocabularyItem.groupBy({
      by: ['source'],
      _count: {
        source: true
      }
    })
    
    console.log('\n📖 Vocabulary by Source:')
    vocabBySource.forEach(group => {
      console.log(`  ${group.source}: ${group._count.source} words`)
    })
    
    // Get lessons by category
    const lessonsByCategory = await prisma.lesson.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    })
    
    console.log('\n📚 Lessons by Category:')
    lessonsByCategory.forEach(group => {
      console.log(`  ${group.category}: ${group._count.category} lessons`)
    })
    
    // Check for recent lessons (51+)
    const recentLessons = await prisma.lesson.findMany({
      where: {
        orderIndex: {
          gte: 51
        }
      },
      select: {
        id: true,
        title: true,
        orderIndex: true,
        category: true
      },
      orderBy: {
        orderIndex: 'asc'
      }
    })
    
    console.log('\n🎓 Recent Lessons (51+):')
    recentLessons.forEach(lesson => {
      console.log(`  Lesson ${lesson.orderIndex}: ${lesson.title} (${lesson.category})`)
    })
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase() 