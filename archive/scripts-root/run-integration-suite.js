const { testIntegration } = require('./test-integration')
const { cleanupOrphans } = require('./cleanup-orphans')
const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

async function runIntegrationSuite() {
  console.log('🚀 Starting Comprehensive Integration Suite...\n')
  
  const suiteReport = {
    timestamp: new Date().toISOString(),
    steps: [],
    summary: {
      integration: { success: false, details: '' },
      tests: { passed: 0, failed: 0, success: false },
      cleanup: { success: false, itemsRemoved: 0 }
    },
    finalState: {
      totalLessons: 0,
      totalVocabulary: 0,
      totalExercises: 0
    }
  }
  
  try {
    // Step 1: Run Integration
    console.log('📦 Step 1: Running Content Integration...')
    suiteReport.steps.push({
      step: 'Integration',
      startTime: new Date().toISOString(),
      status: 'running'
    })
    
    try {
      execSync('node integrate-expanded-content.js', { stdio: 'inherit' })
      suiteReport.summary.integration.success = true
      suiteReport.summary.integration.details = 'Integration completed successfully'
      suiteReport.steps[0].status = 'completed'
      suiteReport.steps[0].endTime = new Date().toISOString()
      console.log('✅ Integration completed successfully\n')
    } catch (error) {
      suiteReport.summary.integration.success = false
      suiteReport.summary.integration.details = error.message
      suiteReport.steps[0].status = 'failed'
      suiteReport.steps[0].endTime = new Date().toISOString()
      suiteReport.steps[0].error = error.message
      console.log('❌ Integration failed\n')
    }
    
    // Step 2: Run Tests
    console.log('🧪 Step 2: Running Integration Tests...')
    suiteReport.steps.push({
      step: 'Tests',
      startTime: new Date().toISOString(),
      status: 'running'
    })
    
    try {
      const testResults = await testIntegration()
      suiteReport.summary.tests.passed = testResults.passed
      suiteReport.summary.tests.failed = testResults.failed
      suiteReport.summary.tests.success = testResults.failed === 0
      suiteReport.steps[1].status = testResults.failed === 0 ? 'completed' : 'failed'
      suiteReport.steps[1].endTime = new Date().toISOString()
      suiteReport.steps[1].details = testResults
      console.log('✅ Tests completed\n')
    } catch (error) {
      suiteReport.summary.tests.success = false
      suiteReport.steps[1].status = 'failed'
      suiteReport.steps[1].endTime = new Date().toISOString()
      suiteReport.steps[1].error = error.message
      console.log('❌ Tests failed\n')
    }
    
    // Step 3: Run Cleanup
    console.log('🧹 Step 3: Running Data Cleanup...')
    suiteReport.steps.push({
      step: 'Cleanup',
      startTime: new Date().toISOString(),
      status: 'running'
    })
    
    try {
      await cleanupOrphans()
      suiteReport.summary.cleanup.success = true
      suiteReport.steps[2].status = 'completed'
      suiteReport.steps[2].endTime = new Date().toISOString()
      console.log('✅ Cleanup completed\n')
    } catch (error) {
      suiteReport.summary.cleanup.success = false
      suiteReport.steps[2].status = 'failed'
      suiteReport.steps[2].endTime = new Date().toISOString()
      suiteReport.steps[2].error = error.message
      console.log('❌ Cleanup failed\n')
    }
    
    // Step 4: Final Verification
    console.log('🔍 Step 4: Final Verification...')
    suiteReport.steps.push({
      step: 'Verification',
      startTime: new Date().toISOString(),
      status: 'running'
    })
    
    try {
      const { PrismaClient } = require('@prisma/client')
      const prisma = new PrismaClient()
      
      const totalLessons = await prisma.lesson.count()
      const totalVocabulary = await prisma.vocabularyItem.count()
      const totalExercises = await prisma.exercise.count()
      
      suiteReport.finalState = {
        totalLessons,
        totalVocabulary,
        totalExercises
      }
      
      await prisma.$disconnect()
      
      suiteReport.steps[3].status = 'completed'
      suiteReport.steps[3].endTime = new Date().toISOString()
      console.log('✅ Final verification completed\n')
    } catch (error) {
      suiteReport.steps[3].status = 'failed'
      suiteReport.steps[3].endTime = new Date().toISOString()
      suiteReport.steps[3].error = error.message
      console.log('❌ Final verification failed\n')
    }
    
    // Generate Summary
    console.log('📊 Integration Suite Summary:')
    console.log('=' * 50)
    
    const successfulSteps = suiteReport.steps.filter(step => step.status === 'completed').length
    const totalSteps = suiteReport.steps.length
    
    console.log(`Steps Completed: ${successfulSteps}/${totalSteps}`)
    console.log(`Integration: ${suiteReport.summary.integration.success ? '✅' : '❌'}`)
    console.log(`Tests: ${suiteReport.summary.tests.success ? '✅' : '❌'} (${suiteReport.summary.tests.passed} passed, ${suiteReport.summary.tests.failed} failed)`)
    console.log(`Cleanup: ${suiteReport.summary.cleanup.success ? '✅' : '❌'}`)
    console.log(`Verification: ${suiteReport.steps[3].status === 'completed' ? '✅' : '❌'}`)
    
    if (suiteReport.finalState.totalLessons > 0) {
      console.log('\n📊 Final Database State:')
      console.log(`  📚 Total Lessons: ${suiteReport.finalState.totalLessons}`)
      console.log(`  📖 Total Vocabulary: ${suiteReport.finalState.totalVocabulary}`)
      console.log(`  📝 Total Exercises: ${suiteReport.finalState.totalExercises}`)
    }
    
    // Save comprehensive report
    const reportPath = path.join(__dirname, 'integration-suite-report.json')
    fs.writeFileSync(reportPath, JSON.stringify(suiteReport, null, 2))
    console.log(`\n📄 Comprehensive report saved to: ${reportPath}`)
    
    // Check if all steps were successful
    const allSuccessful = suiteReport.steps.every(step => step.status === 'completed')
    
    if (allSuccessful) {
      console.log('\n🎉 All steps completed successfully! Integration suite is ready.')
    } else {
      console.log('\n⚠️  Some steps failed. Please review the report for details.')
    }
    
    return suiteReport
    
  } catch (error) {
    console.error('❌ Integration suite error:', error)
    suiteReport.error = error.message
    return suiteReport
  }
}

// Run suite if this file is executed directly
if (require.main === module) {
  runIntegrationSuite()
}

module.exports = { runIntegrationSuite } 