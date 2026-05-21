const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

// Import the expanded content - using dynamic imports for ES6 modules
async function integrateExpandedContent() {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      vocabulary: { processed: 0, skipped: 0, errors: 0 },
      lessons: { created: 0, skipped: 0, errors: 0 },
      exercises: { added: 0, errors: 0 }
    },
    details: {
      vocabulary: {
        advanced_conversational: { processed: [], skipped: [], errors: [] },
        professional_technical: { processed: [], skipped: [], errors: [] },
        contemporary_modern: { processed: [], skipped: [], errors: [] }
      },
      lessons: { created: [], skipped: [], errors: [] },
      exercises: { added: [], errors: [] }
    },
    statistics: {
      totalVocabulary: 0,
      totalLessons: 0,
      totalExercises: 0
    }
  }

  try {
    console.log('🚀 Integrating expanded Shona content...\n')
    
    // Import the vocabulary modules
    const { advancedConversationalVocabulary } = await import('./content/vocabulary/advanced-conversational-vocabulary.js')
    const { professionalTechnicalVocabulary } = await import('./content/vocabulary/professional-technical-vocabulary.js')
    const { contemporaryModernVocabulary } = await import('./content/vocabulary/contemporary-modern-vocabulary.js')
    const { allFluentConversationalLessons } = await import('./content/lesson-plans/fluent-conversational-lessons.js')
    
    // Helper function to process vocabulary from complex structure
    async function processVocabulary(vocabularyObject, sourceName, reportKey) {
      let processedCount = 0
      let skippedCount = 0
      let errorCount = 0
      
      for (const category in vocabularyObject) {
        for (const subcategory in vocabularyObject[category]) {
          const vocabList = vocabularyObject[category][subcategory]
          if (Array.isArray(vocabList)) {
            for (const vocab of vocabList) {
              try {
                await prisma.vocabularyItem.create({
                  data: {
                    shona: vocab.shona,
                    english: vocab.english,
                    category: vocab.category || category,
                    tones: vocab.tones || null,
                    cultural: vocab.cultural_notes || null,
                    modern: vocab.modern || true,
                    source: vocab.source || sourceName,
                    difficulty: vocab.difficulty || 1,
                    pronunciation: vocab.ipa || null,
                    examples: JSON.stringify(vocab.examples || [])
                  }
                })
                processedCount++
                report.details.vocabulary[reportKey].processed.push({
                  shona: vocab.shona,
                  english: vocab.english,
                  category: vocab.category || category
                })
              } catch (error) {
                if (error.code !== 'P2002') { // Skip if already exists
                  console.log(`  ⚠️  Skipped: ${vocab.shona} - ${error.message}`)
                  skippedCount++
                  report.details.vocabulary[reportKey].skipped.push({
                    shona: vocab.shona,
                    english: vocab.english,
                    error: error.message
                  })
                } else {
                  errorCount++
                  report.details.vocabulary[reportKey].errors.push({
                    shona: vocab.shona,
                    english: vocab.english,
                    error: error.message
                  })
                }
              }
            }
          }
        }
      }
      
      return { processedCount, skippedCount, errorCount }
    }
    
    // 1. Add advanced conversational vocabulary
    console.log('📝 Adding advanced conversational vocabulary...')
    const advancedResults = await processVocabulary(advancedConversationalVocabulary, 'Advanced Conversational', 'advanced_conversational')
    console.log(`  ✅ Processed: ${advancedResults.processedCount}, Skipped: ${advancedResults.skippedCount}`)
    report.summary.vocabulary.processed += advancedResults.processedCount
    report.summary.vocabulary.skipped += advancedResults.skippedCount
    report.summary.vocabulary.errors += advancedResults.errorCount
    
    // 2. Add professional & technical vocabulary
    console.log('💼 Adding professional & technical vocabulary...')
    const professionalResults = await processVocabulary(professionalTechnicalVocabulary, 'Professional Technical', 'professional_technical')
    console.log(`  ✅ Processed: ${professionalResults.processedCount}, Skipped: ${professionalResults.skippedCount}`)
    report.summary.vocabulary.processed += professionalResults.processedCount
    report.summary.vocabulary.skipped += professionalResults.skippedCount
    report.summary.vocabulary.errors += professionalResults.errorCount
    
    // 3. Add contemporary modern vocabulary
    console.log('📱 Adding contemporary modern vocabulary...')
    const contemporaryResults = await processVocabulary(contemporaryModernVocabulary, 'Contemporary Modern', 'contemporary_modern')
    console.log(`  ✅ Processed: ${contemporaryResults.processedCount}, Skipped: ${contemporaryResults.skippedCount}`)
    report.summary.vocabulary.processed += contemporaryResults.processedCount
    report.summary.vocabulary.skipped += contemporaryResults.skippedCount
    report.summary.vocabulary.errors += contemporaryResults.errorCount
    
    // 4. Add fluent conversational lessons (starting from lesson 51)
    console.log('🎓 Adding fluent conversational lessons...')
    let lessonIndex = 51
    let lessonsCreated = 0
    let lessonsSkipped = 0
    let lessonsErrors = 0
    
    for (const lessonData of allFluentConversationalLessons) {
      try {
        // Check if lesson already exists
        const existingLesson = await prisma.lesson.findFirst({
          where: {
            title: lessonData.title,
            orderIndex: lessonIndex
          }
        })
        
        if (existingLesson) {
          console.log(`  ⚠️  Lesson ${lessonIndex} already exists: ${lessonData.title}`)
          lessonsSkipped++
          report.details.lessons.skipped.push({
            title: lessonData.title,
            orderIndex: lessonIndex,
            reason: 'Already exists'
          })
          lessonIndex++
          continue
        }
        
        const lesson = await prisma.lesson.create({
          data: {
            title: lessonData.title,
            description: lessonData.description,
            category: lessonData.category,
            orderIndex: lessonIndex,
            xpReward: lessonData.xpReward || 15,
            learningObjectives: JSON.stringify(lessonData.learningObjectives || []),
            discoveryElements: JSON.stringify(lessonData.discoveryElements || [])
          }
        })
        
        console.log(`  ✅ Created lesson ${lessonIndex}: ${lesson.title}`)
        lessonsCreated++
        report.details.lessons.created.push({
          id: lesson.id,
          title: lesson.title,
          orderIndex: lessonIndex,
          category: lesson.category
        })
        
        // Add exercises for this lesson
        if (lessonData.exercises && lessonData.exercises.length > 0) {
          for (let i = 0; i < Math.min(lessonData.exercises.length, 5); i++) {
            const exercise = lessonData.exercises[i]
            try {
              await prisma.exercise.create({
                data: {
                  lessonId: lesson.id,
                  type: exercise.type || 'multiple_choice',
                  question: exercise.question,
                  correctAnswer: exercise.correctAnswer,
                  options: JSON.stringify(exercise.options || []),
                  shonaPhrase: exercise.shonaPhrase || '',
                  englishPhrase: exercise.englishPhrase || '',
                  audioText: exercise.audioText || '',
                  points: exercise.points || 10,
                  intrinsicFeedback: JSON.stringify(exercise.intrinsicFeedback || {}),
                  discoveryHint: exercise.discoveryHint || ''
                }
              })
              report.summary.exercises.added++
              report.details.exercises.added.push({
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                type: exercise.type || 'multiple_choice',
                question: exercise.question.substring(0, 50) + '...'
              })
            } catch (error) {
              console.log(`    ⚠️  Exercise error: ${error.message}`)
              report.summary.exercises.errors++
              report.details.exercises.errors.push({
                lessonId: lesson.id,
                lessonTitle: lesson.title,
                error: error.message
              })
            }
          }
        }
        
        lessonIndex++
      } catch (error) {
        console.log(`  ❌ Lesson error: ${error.message}`)
        lessonsErrors++
        report.details.lessons.errors.push({
          title: lessonData.title,
          orderIndex: lessonIndex,
          error: error.message
        })
        lessonIndex++
      }
    }
    
    console.log(`  📊 Lessons: ${lessonsCreated} created, ${lessonsSkipped} skipped`)
    report.summary.lessons.created += lessonsCreated
    report.summary.lessons.skipped += lessonsSkipped
    report.summary.lessons.errors += lessonsErrors
    
    // 5. Add exercises to existing lessons that don't have them
    console.log('🔧 Adding exercises to existing lessons...')
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
    
    let exercisesAdded = 0
    for (const lesson of lessonsWithoutExercises) {
      // Create basic exercises for each lesson
      const basicExercises = [
        {
          type: 'multiple_choice',
          question: `What does "${lesson.title}" mean in Shona?`,
          correctAnswer: 'Practice this lesson to learn',
          options: JSON.stringify(['Practice this lesson to learn', 'Option 2', 'Option 3', 'Option 4']),
          points: 10
        },
        {
          type: 'translation',
          question: 'Translate this Shona phrase to English',
          correctAnswer: 'Practice pronunciation',
          points: 15
        }
      ]
      
      for (const exerciseData of basicExercises) {
        try {
          await prisma.exercise.create({
            data: {
              lessonId: lesson.id,
              ...exerciseData,
              options: exerciseData.options ? exerciseData.options : JSON.stringify([])
            }
          })
          exercisesAdded++
          report.summary.exercises.added++
          report.details.exercises.added.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            type: exerciseData.type,
            question: exerciseData.question.substring(0, 50) + '...'
          })
        } catch (error) {
          console.log(`    ⚠️  Exercise error for ${lesson.title}: ${error.message}`)
          report.summary.exercises.errors++
          report.details.exercises.errors.push({
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            error: error.message
          })
        }
      }
      
      console.log(`  ✅ Added exercises to: ${lesson.title}`)
    }
    
    console.log('\n🎉 Expanded content integration completed!')
    
    // Final statistics
    const totalLessons = await prisma.lesson.count()
    const totalVocabulary = await prisma.vocabularyItem.count()
    const totalExercises = await prisma.exercise.count()
    
    report.statistics = {
      totalLessons,
      totalVocabulary,
      totalExercises
    }
    
    console.log(`\n📊 Final Statistics:`)
    console.log(`  📚 Total Lessons: ${totalLessons}`)
    console.log(`  📖 Total Vocabulary: ${totalVocabulary}`)
    console.log(`  📝 Total Exercises: ${totalExercises}`)
    
    // Validation summary
    console.log(`\n✅ Integration Summary:`)
    console.log(`  📝 Vocabulary processed: ${report.summary.vocabulary.processed}`)
    console.log(`  🎓 New lessons created: ${report.summary.lessons.created}`)
    console.log(`  📝 Exercises added: ${report.summary.exercises.added}`)
    
    // Save detailed report
    const reportPath = path.join(__dirname, 'integration-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 Detailed report saved to: ${reportPath}`)
    
    // Generate CSV report
    const csvReport = generateCSVReport(report)
    const csvPath = path.join(__dirname, 'integration-report.csv')
    fs.writeFileSync(csvPath, csvReport)
    console.log(`📊 CSV report saved to: ${csvPath}`)
    
  } catch (error) {
    console.error('❌ Integration error:', error)
    report.error = error.message
  } finally {
    await prisma.$disconnect()
  }
}

function generateCSVReport(report) {
  const lines = []
  
  // Summary section
  lines.push('Section,Type,Count')
  lines.push('Vocabulary,Processed,' + report.summary.vocabulary.processed)
  lines.push('Vocabulary,Skipped,' + report.summary.vocabulary.skipped)
  lines.push('Vocabulary,Errors,' + report.summary.vocabulary.errors)
  lines.push('Lessons,Created,' + report.summary.lessons.created)
  lines.push('Lessons,Skipped,' + report.summary.lessons.skipped)
  lines.push('Lessons,Errors,' + report.summary.lessons.errors)
  lines.push('Exercises,Added,' + report.summary.exercises.added)
  lines.push('Exercises,Errors,' + report.summary.exercises.errors)
  lines.push('')
  
  // Vocabulary details
  lines.push('Vocabulary Details')
  lines.push('Source,Shona,English,Category,Status')
  
  Object.entries(report.details.vocabulary).forEach(([source, data]) => {
    data.processed.forEach(item => {
      lines.push(`${source},${item.shona},${item.english},${item.category},Processed`)
    })
    data.skipped.forEach(item => {
      lines.push(`${source},${item.shona},${item.english},,Skipped`)
    })
    data.errors.forEach(item => {
      lines.push(`${source},${item.shona},${item.english},,Error`)
    })
  })
  
  lines.push('')
  
  // Lesson details
  lines.push('Lesson Details')
  lines.push('Title,OrderIndex,Category,Status')
  
  report.details.lessons.created.forEach(lesson => {
    lines.push(`${lesson.title},${lesson.orderIndex},${lesson.category},Created`)
  })
  report.details.lessons.skipped.forEach(lesson => {
    lines.push(`${lesson.title},${lesson.orderIndex},,Skipped`)
  })
  report.details.lessons.errors.forEach(lesson => {
    lines.push(`${lesson.title},${lesson.orderIndex},,Error`)
  })
  
  return lines.join('\n')
}

integrateExpandedContent() 