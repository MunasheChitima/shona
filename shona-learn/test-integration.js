const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testIntegration() {
  console.log('🧪 Running integration tests...\n')
  
  const testResults = {
    passed: 0,
    failed: 0,
    tests: []
  }
  
  function addTest(name, passed, details = '') {
    testResults.tests.push({ name, passed, details })
    if (passed) {
      testResults.passed++
      console.log(`✅ ${name}`)
    } else {
      testResults.failed++
      console.log(`❌ ${name}: ${details}`)
    }
  }
  
  try {
    // Test 1: Check vocabulary counts by source
    console.log('📖 Testing vocabulary imports...')
    const vocabBySource = await prisma.vocabularyItem.groupBy({
      by: ['source'],
      _count: {
        source: true
      }
    })
    
    const expectedSources = ['Advanced Conversational', 'Professional Technical', 'Contemporary Modern']
    const foundSources = vocabBySource.map(group => group.source)
    
    addTest(
      'All expected vocabulary sources are present',
      expectedSources.every(source => foundSources.includes(source)),
      `Expected: ${expectedSources.join(', ')}, Found: ${foundSources.join(', ')}`
    )
    
    // Test 2: Check for duplicate vocabulary
    const duplicateVocab = await prisma.$queryRaw`
      SELECT shona, COUNT(*) as count 
      FROM VocabularyItem 
      GROUP BY shona 
      HAVING COUNT(*) > 1
    `
    
    addTest(
      'No duplicate vocabulary items',
      duplicateVocab.length === 0,
      `Found ${duplicateVocab.length} duplicates: ${duplicateVocab.map(d => d.shona).join(', ')}`
    )
    
    // Test 3: Check lesson counts
    console.log('\n📚 Testing lesson imports...')
    const totalLessons = await prisma.lesson.count()
    const lessons51Plus = await prisma.lesson.count({
      where: {
        orderIndex: {
          gte: 51
        }
      }
    })
    
    addTest(
      'Total lessons count is reasonable',
      totalLessons >= 20 && totalLessons <= 30,
      `Found ${totalLessons} total lessons`
    )
    
    addTest(
      'New lessons (51+) are present',
      lessons51Plus === 5,
      `Expected 5 lessons, found ${lessons51Plus}`
    )
    
    // Test 4: Check for duplicate lessons
    const duplicateLessons = await prisma.$queryRaw`
      SELECT title, orderIndex, COUNT(*) as count 
      FROM Lesson 
      GROUP BY title, orderIndex 
      HAVING COUNT(*) > 1
    `
    
    addTest(
      'No duplicate lessons',
      duplicateLessons.length === 0,
      `Found ${duplicateLessons.length} duplicates`
    )
    
    // Test 5: Check lesson categories
    const lessonCategories = await prisma.lesson.groupBy({
      by: ['category'],
      _count: {
        category: true
      }
    })
    
    const expectedCategories = ['advanced_conversation', 'family_advanced', 'professional', 'cultural_traditions', 'storytelling']
    const foundCategories = lessonCategories.map(group => group.category)
    
    addTest(
      'New lesson categories are present',
      expectedCategories.every(category => foundCategories.includes(category)),
      `Expected: ${expectedCategories.join(', ')}, Found: ${foundCategories.join(', ')}`
    )
    
    // Test 6: Check exercise counts
    console.log('\n📝 Testing exercise imports...')
    const totalExercises = await prisma.exercise.count()
    const lessonsWithExercises = await prisma.lesson.findMany({
      include: {
        exercises: true
      }
    })
    
    const lessonsWithoutExercises = lessonsWithExercises.filter(lesson => lesson.exercises.length === 0)
    
    addTest(
      'All lessons have exercises',
      lessonsWithoutExercises.length === 0,
      `Found ${lessonsWithoutExercises.length} lessons without exercises: ${lessonsWithoutExercises.map(l => l.title).join(', ')}`
    )
    
    addTest(
      'Total exercises count is reasonable',
      totalExercises >= 20 && totalExercises <= 50,
      `Found ${totalExercises} total exercises`
    )
    
    // Test 7: Check vocabulary quality
    console.log('\n🔍 Testing vocabulary quality...')
    const allVocabulary = await prisma.vocabularyItem.findMany()
    const vocabWithoutRequiredFields = allVocabulary.filter(vocab => 
      !vocab.shona || vocab.shona === '' || !vocab.english || vocab.english === ''
    )
    
    addTest(
      'All vocabulary has required fields',
      vocabWithoutRequiredFields.length === 0,
      `Found ${vocabWithoutRequiredFields.length} vocabulary items missing required fields`
    )
    
    // Test 8: Check lesson quality
    const allLessons = await prisma.lesson.findMany()
    const lessonsWithoutRequiredFields = allLessons.filter(lesson => 
      !lesson.title || lesson.title === '' || !lesson.description || lesson.description === ''
    )
    
    addTest(
      'All lessons have required fields',
      lessonsWithoutRequiredFields.length === 0,
      `Found ${lessonsWithoutRequiredFields.length} lessons missing required fields`
    )
    
    // Test 9: Check exercise quality
    const allExercises = await prisma.exercise.findMany()
    const exercisesWithoutRequiredFields = allExercises.filter(exercise => 
      !exercise.question || exercise.question === '' || !exercise.correctAnswer || exercise.correctAnswer === ''
    )
    
    addTest(
      'All exercises have required fields',
      exercisesWithoutRequiredFields.length === 0,
      `Found ${exercisesWithoutRequiredFields.length} exercises missing required fields`
    )
    
    // Test 10: Check data consistency
    console.log('\n🔗 Testing data consistency...')
    const allExercisesWithLessons = await prisma.exercise.findMany({
      include: {
        lesson: true
      }
    })
    
    const orphanedExercises = allExercisesWithLessons.filter(exercise => !exercise.lesson)
    
    addTest(
      'No orphaned exercises',
      orphanedExercises.length === 0,
      `Found ${orphanedExercises.length} orphaned exercises`
    )
    
    // Summary
    console.log('\n📊 Test Summary:')
    console.log(`  ✅ Passed: ${testResults.passed}`)
    console.log(`  ❌ Failed: ${testResults.failed}`)
    console.log(`  📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`)
    
    if (testResults.failed === 0) {
      console.log('\n🎉 All tests passed! Integration is successful.')
    } else {
      console.log('\n⚠️  Some tests failed. Please review the issues above.')
    }
    
    return testResults
    
  } catch (error) {
    console.error('❌ Test error:', error)
    return { passed: 0, failed: 1, tests: [{ name: 'Test execution', passed: false, details: error.message }] }
  } finally {
    await prisma.$disconnect()
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testIntegration()
}

module.exports = { testIntegration } 