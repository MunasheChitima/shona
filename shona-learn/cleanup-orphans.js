const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function cleanupOrphans() {
  console.log('🧹 Starting orphaned data cleanup...\n')
  
  const cleanupReport = {
    timestamp: new Date().toISOString(),
    summary: {
      orphanedVocabulary: 0,
      orphanedExercises: 0,
      lessonsWithoutExercises: 0,
      vocabularyWithoutRequiredFields: 0,
      lessonsWithoutRequiredFields: 0,
      exercisesWithoutRequiredFields: 0
    },
    details: {
      removedVocabulary: [],
      removedExercises: [],
      removedLessons: [],
      fixedVocabulary: [],
      fixedLessons: [],
      fixedExercises: []
    }
  }
  
  try {
    // 1. Find and remove orphaned exercises (exercises without lessons)
    console.log('🔍 Checking for orphaned exercises...')
    const allExercises = await prisma.exercise.findMany({
      include: {
        lesson: true
      }
    })
    
    const orphanedExercises = allExercises.filter(exercise => !exercise.lesson)
    
    if (orphanedExercises.length > 0) {
      console.log(`  Found ${orphanedExercises.length} orphaned exercises`)
      
      for (const exercise of orphanedExercises) {
        try {
          await prisma.exercise.delete({
            where: { id: exercise.id }
          })
          cleanupReport.summary.orphanedExercises++
          cleanupReport.details.removedExercises.push({
            id: exercise.id,
            question: exercise.question.substring(0, 50) + '...',
            type: exercise.type
          })
        } catch (error) {
          console.log(`    ⚠️  Could not remove exercise ${exercise.id}: ${error.message}`)
        }
      }
      console.log(`  ✅ Removed ${orphanedExercises.length} orphaned exercises`)
    } else {
      console.log('  ✅ No orphaned exercises found')
    }
    
    // 2. Find and remove vocabulary without required fields
    console.log('\n🔍 Checking for vocabulary without required fields...')
    const allVocabulary = await prisma.vocabularyItem.findMany()
    const invalidVocabulary = allVocabulary.filter(vocab => 
      !vocab.shona || vocab.shona === '' || !vocab.english || vocab.english === ''
    )
    
    if (invalidVocabulary.length > 0) {
      console.log(`  Found ${invalidVocabulary.length} vocabulary items without required fields`)
      
      for (const vocab of invalidVocabulary) {
        try {
          await prisma.vocabularyItem.delete({
            where: { id: vocab.id }
          })
          cleanupReport.summary.vocabularyWithoutRequiredFields++
          cleanupReport.details.removedVocabulary.push({
            id: vocab.id,
            shona: vocab.shona || 'null',
            english: vocab.english || 'null',
            source: vocab.source
          })
        } catch (error) {
          console.log(`    ⚠️  Could not remove vocabulary ${vocab.id}: ${error.message}`)
        }
      }
      console.log(`  ✅ Removed ${invalidVocabulary.length} invalid vocabulary items`)
    } else {
      console.log('  ✅ No invalid vocabulary found')
    }
    
    // 3. Find and remove lessons without required fields
    console.log('\n🔍 Checking for lessons without required fields...')
    const allLessons = await prisma.lesson.findMany()
    const invalidLessons = allLessons.filter(lesson => 
      !lesson.title || lesson.title === '' || !lesson.description || lesson.description === ''
    )
    
    if (invalidLessons.length > 0) {
      console.log(`  Found ${invalidLessons.length} lessons without required fields`)
      
      for (const lesson of invalidLessons) {
        try {
          // First remove associated exercises
          await prisma.exercise.deleteMany({
            where: { lessonId: lesson.id }
          })
          
          await prisma.lesson.delete({
            where: { id: lesson.id }
          })
          cleanupReport.summary.lessonsWithoutRequiredFields++
          cleanupReport.details.removedLessons.push({
            id: lesson.id,
            title: lesson.title || 'null',
            orderIndex: lesson.orderIndex
          })
        } catch (error) {
          console.log(`    ⚠️  Could not remove lesson ${lesson.id}: ${error.message}`)
        }
      }
      console.log(`  ✅ Removed ${invalidLessons.length} invalid lessons`)
    } else {
      console.log('  ✅ No invalid lessons found')
    }
    
    // 4. Find and remove exercises without required fields
    console.log('\n🔍 Checking for exercises without required fields...')
    const invalidExercises = allExercises.filter(exercise => 
      !exercise.question || exercise.question === '' || !exercise.correctAnswer || exercise.correctAnswer === ''
    )
    
    if (invalidExercises.length > 0) {
      console.log(`  Found ${invalidExercises.length} exercises without required fields`)
      
      for (const exercise of invalidExercises) {
        try {
          await prisma.exercise.delete({
            where: { id: exercise.id }
          })
          cleanupReport.summary.exercisesWithoutRequiredFields++
          cleanupReport.details.removedExercises.push({
            id: exercise.id,
            question: exercise.question || 'null',
            type: exercise.type
          })
        } catch (error) {
          console.log(`    ⚠️  Could not remove exercise ${exercise.id}: ${error.message}`)
        }
      }
      console.log(`  ✅ Removed ${invalidExercises.length} invalid exercises`)
    } else {
      console.log('  ✅ No invalid exercises found')
    }
    
    // 5. Find lessons without exercises (optional - you might want to keep these)
    console.log('\n🔍 Checking for lessons without exercises...')
    const lessonsWithoutExercises = await prisma.lesson.findMany({
      include: {
        exercises: true
      },
      where: {
        exercises: {
          none: {}
        }
      }
    })
    
    if (lessonsWithoutExercises.length > 0) {
      console.log(`  Found ${lessonsWithoutExercises.length} lessons without exercises`)
      console.log('  Lessons without exercises:')
      lessonsWithoutExercises.forEach(lesson => {
        console.log(`    - ${lesson.title} (ID: ${lesson.id})`)
      })
      
      // Ask user if they want to remove these (for now, just report them)
      console.log('  ℹ️  These lessons are kept as they might be intentionally empty')
      cleanupReport.summary.lessonsWithoutExercises = lessonsWithoutExercises.length
    } else {
      console.log('  ✅ All lessons have exercises')
    }
    
    // 6. Find duplicate vocabulary (keep the first one, remove others)
    console.log('\n🔍 Checking for duplicate vocabulary...')
    const duplicateVocab = await prisma.$queryRaw`
      SELECT shona, COUNT(*) as count, GROUP_CONCAT(id) as ids
      FROM VocabularyItem 
      GROUP BY shona 
      HAVING COUNT(*) > 1
    `
    
    if (duplicateVocab.length > 0) {
      console.log(`  Found ${duplicateVocab.length} duplicate vocabulary items`)
      
      for (const duplicate of duplicateVocab) {
        const ids = duplicate.ids.split(',')
        // Keep the first one, remove the rest
        for (let i = 1; i < ids.length; i++) {
          try {
            await prisma.vocabularyItem.delete({
              where: { id: ids[i] }
            })
            cleanupReport.summary.orphanedVocabulary++
            cleanupReport.details.removedVocabulary.push({
              id: ids[i],
              shona: duplicate.shona,
              reason: 'Duplicate'
            })
          } catch (error) {
            console.log(`    ⚠️  Could not remove duplicate vocabulary ${ids[i]}: ${error.message}`)
          }
        }
      }
      console.log(`  ✅ Removed ${duplicateVocab.length} duplicate vocabulary items`)
    } else {
      console.log('  ✅ No duplicate vocabulary found')
    }
    
    // Final statistics
    const totalLessons = await prisma.lesson.count()
    const totalVocabulary = await prisma.vocabularyItem.count()
    const totalExercises = await prisma.exercise.count()
    
    console.log('\n📊 Cleanup Summary:')
    console.log(`  🗑️  Removed orphaned exercises: ${cleanupReport.summary.orphanedExercises}`)
    console.log(`  🗑️  Removed invalid vocabulary: ${cleanupReport.summary.vocabularyWithoutRequiredFields}`)
    console.log(`  🗑️  Removed invalid lessons: ${cleanupReport.summary.lessonsWithoutRequiredFields}`)
    console.log(`  🗑️  Removed invalid exercises: ${cleanupReport.summary.exercisesWithoutRequiredFields}`)
    console.log(`  🗑️  Removed duplicate vocabulary: ${cleanupReport.summary.orphanedVocabulary}`)
    console.log(`  ⚠️  Lessons without exercises: ${cleanupReport.summary.lessonsWithoutExercises}`)
    
    console.log('\n📊 Final Database State:')
    console.log(`  📚 Total Lessons: ${totalLessons}`)
    console.log(`  📖 Total Vocabulary: ${totalVocabulary}`)
    console.log(`  📝 Total Exercises: ${totalExercises}`)
    
    // Save cleanup report
    const reportPath = path.join(__dirname, 'cleanup-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(cleanupReport, null, 2))
    console.log(`\n📄 Cleanup report saved to: ${reportPath}`)
    
    const totalRemoved = cleanupReport.summary.orphanedExercises + 
                        cleanupReport.summary.vocabularyWithoutRequiredFields + 
                        cleanupReport.summary.lessonsWithoutRequiredFields + 
                        cleanupReport.summary.exercisesWithoutRequiredFields + 
                        cleanupReport.summary.orphanedVocabulary
    
    if (totalRemoved === 0) {
      console.log('\n🎉 No orphaned data found! Database is clean.')
    } else {
      console.log(`\n✅ Cleanup completed! Removed ${totalRemoved} items.`)
    }
    
  } catch (error) {
    console.error('❌ Cleanup error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run cleanup if this file is executed directly
if (require.main === module) {
  cleanupOrphans()
}

module.exports = { cleanupOrphans } 