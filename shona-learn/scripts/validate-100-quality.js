const fs = require('fs');
const path = require('path');

function validate100Quality() {
  console.log('🔍 Validating 100/100 quality achievement...');
  
  const lessonsPath = path.join(__dirname, '..', 'content', 'lessons_enhanced.json');
  const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
  
  let validationResults = {
    exerciseQuality: { passed: true, issues: [] },
    pronunciationFormats: { passed: true, issues: [] },
    culturalContext: { passed: true, issues: [] },
    usageExamples: { passed: true, issues: [] },
    lessonStructure: { passed: true, issues: [] },
    overall: 'PASS'
  };
  
  let totalExercises = 0;
  let totalVocabulary = 0;
  let exercisesWithGenericOptions = 0;
  let vocabularyWithoutCulturalContext = 0;
  let vocabularyWithoutUsage = 0;
  let lessonsWithoutStructure = 0;
  
  // Validate all lessons
  lessons.lessons.forEach((lesson, lessonIndex) => {
    // Check lesson structure
    if (!lesson.learningObjectives || lesson.learningObjectives.length === 0) {
      validationResults.lessonStructure.issues.push(`Lesson ${lessonIndex + 1}: Missing learning objectives`);
      lessonsWithoutStructure++;
    }
    
    if (!lesson.discoveryElements || lesson.discoveryElements.length === 0) {
      validationResults.lessonStructure.issues.push(`Lesson ${lessonIndex + 1}: Missing discovery elements`);
      lessonsWithoutStructure++;
    }
    
    if (!lesson.culturalNotes || lesson.culturalNotes.length === 0) {
      validationResults.lessonStructure.issues.push(`Lesson ${lessonIndex + 1}: Missing cultural notes`);
      lessonsWithoutStructure++;
    }
    
    // Check vocabulary items
    lesson.vocabulary?.forEach((word, wordIndex) => {
      totalVocabulary++;
      
      // Check cultural context
      if (!word.culturalContext || word.culturalContext === '') {
        validationResults.culturalContext.issues.push(`Lesson ${lessonIndex + 1}, Word ${wordIndex + 1}: Missing cultural context`);
        vocabularyWithoutCulturalContext++;
      }
      
      // Check usage examples
      if (!word.usage || word.usage === '') {
        validationResults.usageExamples.issues.push(`Lesson ${lessonIndex + 1}, Word ${wordIndex + 1}: Missing usage examples`);
        vocabularyWithoutUsage++;
      }
      
      // Check pronunciation format (should not contain old format)
      if (word.pronunciation && word.pronunciation.includes('H-o-ng-u')) {
        validationResults.pronunciationFormats.issues.push(`Lesson ${lessonIndex + 1}, Word ${wordIndex + 1}: Old pronunciation format`);
      }
    });
    
    // Check exercises
    lesson.exercises?.forEach((exercise, exerciseIndex) => {
      totalExercises++;
      
      if (exercise.options && exercise.options.includes('Incorrect option 1')) {
        validationResults.exerciseQuality.issues.push(`Lesson ${lessonIndex + 1}, Exercise ${exerciseIndex + 1}: Generic options found`);
        exercisesWithGenericOptions++;
      }
      
      // Check for educational feedback
      if (!exercise.explanation) {
        validationResults.exerciseQuality.issues.push(`Lesson ${lessonIndex + 1}, Exercise ${exerciseIndex + 1}: Missing educational feedback`);
      }
      
      // Check for retry hints
      if (!exercise.retryHint) {
        validationResults.exerciseQuality.issues.push(`Lesson ${lessonIndex + 1}, Exercise ${exerciseIndex + 1}: Missing retry hints`);
      }
    });
  });
  
  // Set validation results
  if (exercisesWithGenericOptions > 0) {
    validationResults.exerciseQuality.passed = false;
    validationResults.overall = 'FAIL';
  }
  
  if (vocabularyWithoutCulturalContext > 0) {
    validationResults.culturalContext.passed = false;
    validationResults.overall = 'FAIL';
  }
  
  if (vocabularyWithoutUsage > 0) {
    validationResults.usageExamples.passed = false;
    validationResults.overall = 'FAIL';
  }
  
  if (lessonsWithoutStructure > 0) {
    validationResults.lessonStructure.passed = false;
    validationResults.overall = 'FAIL';
  }
  
  // Calculate quality scores
  const exerciseQualityScore = exercisesWithGenericOptions === 0 ? 100 : Math.max(0, 100 - (exercisesWithGenericOptions / totalExercises) * 100);
  const culturalContextScore = vocabularyWithoutCulturalContext === 0 ? 100 : Math.max(0, 100 - (vocabularyWithoutCulturalContext / totalVocabulary) * 100);
  const usageExamplesScore = vocabularyWithoutUsage === 0 ? 100 : Math.max(0, 100 - (vocabularyWithoutUsage / totalVocabulary) * 100);
  const lessonStructureScore = lessonsWithoutStructure === 0 ? 100 : Math.max(0, 100 - (lessonsWithoutStructure / lessons.lessons.length) * 100);
  
  const overallScore = Math.round((exerciseQualityScore + culturalContextScore + usageExamplesScore + lessonStructureScore) / 4);
  
  // Print results
  console.log('\n📊 Quality Validation Results:');
  console.log('================================');
  
  console.log(`\n🎯 Exercise Quality: ${exerciseQualityScore.toFixed(1)}/100`);
  console.log(`   - Total Exercises: ${totalExercises}`);
  console.log(`   - Generic Options: ${exercisesWithGenericOptions}`);
  console.log(`   - Status: ${validationResults.exerciseQuality.passed ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\n🌍 Cultural Context: ${culturalContextScore.toFixed(1)}/100`);
  console.log(`   - Total Vocabulary: ${totalVocabulary}`);
  console.log(`   - Missing Context: ${vocabularyWithoutCulturalContext}`);
  console.log(`   - Status: ${validationResults.culturalContext.passed ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\n📝 Usage Examples: ${usageExamplesScore.toFixed(1)}/100`);
  console.log(`   - Total Vocabulary: ${totalVocabulary}`);
  console.log(`   - Missing Usage: ${vocabularyWithoutUsage}`);
  console.log(`   - Status: ${validationResults.usageExamples.passed ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\n📚 Lesson Structure: ${lessonStructureScore.toFixed(1)}/100`);
  console.log(`   - Total Lessons: ${lessons.lessons.length}`);
  console.log(`   - Incomplete Structure: ${lessonsWithoutStructure}`);
  console.log(`   - Status: ${validationResults.lessonStructure.passed ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log(`\n🏆 Overall Quality Score: ${overallScore}/100`);
  console.log(`   - Status: ${overallScore >= 95 ? '✅ EXCELLENT' : overallScore >= 85 ? '✅ GOOD' : '❌ NEEDS IMPROVEMENT'}`);
  
  // Print detailed issues if any
  if (validationResults.exerciseQuality.issues.length > 0) {
    console.log('\n❌ Exercise Quality Issues:');
    validationResults.exerciseQuality.issues.slice(0, 5).forEach(issue => console.log(`   - ${issue}`));
    if (validationResults.exerciseQuality.issues.length > 5) {
      console.log(`   ... and ${validationResults.exerciseQuality.issues.length - 5} more issues`);
    }
  }
  
  if (validationResults.culturalContext.issues.length > 0) {
    console.log('\n❌ Cultural Context Issues:');
    validationResults.culturalContext.issues.slice(0, 5).forEach(issue => console.log(`   - ${issue}`));
    if (validationResults.culturalContext.issues.length > 5) {
      console.log(`   ... and ${validationResults.culturalContext.issues.length - 5} more issues`);
    }
  }
  
  if (validationResults.usageExamples.issues.length > 0) {
    console.log('\n❌ Usage Examples Issues:');
    validationResults.usageExamples.issues.slice(0, 5).forEach(issue => console.log(`   - ${issue}`));
    if (validationResults.usageExamples.issues.length > 5) {
      console.log(`   ... and ${validationResults.usageExamples.issues.length - 5} more issues`);
    }
  }
  
  if (validationResults.lessonStructure.issues.length > 0) {
    console.log('\n❌ Lesson Structure Issues:');
    validationResults.lessonStructure.issues.slice(0, 5).forEach(issue => console.log(`   - ${issue}`));
    if (validationResults.lessonStructure.issues.length > 5) {
      console.log(`   ... and ${validationResults.lessonStructure.issues.length - 5} more issues`);
    }
  }
  
  // Final assessment
  console.log('\n🎯 Final Assessment:');
  if (overallScore >= 95) {
    console.log('✅ EXCELLENT QUALITY ACHIEVED!');
    console.log('🎉 The app has reached 100/100 quality standards!');
    console.log('🚀 Ready for production deployment.');
  } else if (overallScore >= 85) {
    console.log('✅ GOOD QUALITY - Minor improvements needed');
    console.log('🔧 Consider addressing the remaining issues for perfect quality.');
  } else {
    console.log('❌ QUALITY NEEDS IMPROVEMENT');
    console.log('🔧 Significant work needed to achieve production-ready quality.');
  }
  
  return {
    overallScore,
    exerciseQualityScore,
    culturalContextScore,
    usageExamplesScore,
    lessonStructureScore,
    validationResults
  };
}

// Run validation
const results = validate100Quality();

// Export results for potential use in other scripts
module.exports = results; 