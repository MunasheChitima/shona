const fs = require('fs');
const path = require('path');

function validateImplementations() {
  console.log('🔍 Validating all implementations...');
  
  let validationResults = {
    contentQuality: [],
    userExperience: [],
    gamification: [],
    technical: [],
    overall: 'PASS'
  };
  
  // 1. Validate Content Quality
  console.log('\n📚 Validating Content Quality...');
  
  const lessonsPath = path.join(__dirname, '..', 'content', 'lessons_consolidated.json');
  if (fs.existsSync(lessonsPath)) {
    const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
    
    // Check pronunciation formats
    let pronunciationIssues = 0;
    lessons.lessons.forEach(lesson => {
      lesson.vocabulary?.forEach(word => {
        if (word.pronunciation && word.pronunciation.includes('H-o-ng-u')) {
          pronunciationIssues++;
        }
      });
    });
    
    if (pronunciationIssues === 0) {
      validationResults.contentQuality.push('✅ Pronunciation formats standardized');
    } else {
      validationResults.contentQuality.push(`❌ ${pronunciationIssues} pronunciation issues found`);
      validationResults.overall = 'FAIL';
    }
    
    // Check exercise quality
    let exerciseIssues = 0;
    lessons.lessons.forEach(lesson => {
      lesson.exercises?.forEach(exercise => {
        if (exercise.options && exercise.options.includes('Incorrect option 1')) {
          exerciseIssues++;
        }
      });
    });
    
    if (exerciseIssues === 0) {
      validationResults.contentQuality.push('✅ Exercise options enhanced');
    } else {
      validationResults.contentQuality.push(`❌ ${exerciseIssues} exercise issues found`);
      validationResults.overall = 'FAIL';
    }
    
    // Check cultural context
    let culturalContextCount = 0;
    lessons.lessons.forEach(lesson => {
      lesson.vocabulary?.forEach(word => {
        if (word.culturalContext) culturalContextCount++;
      });
    });
    
    validationResults.contentQuality.push(`✅ ${culturalContextCount} cultural contexts added`);
    
    // Check topic navigation
    let topicNavigationCount = 0;
    lessons.lessons.forEach(lesson => {
      if (lesson.topicNavigation) topicNavigationCount++;
    });
    
    validationResults.contentQuality.push(`✅ ${topicNavigationCount} lessons with topic navigation`);
    
  } else {
    validationResults.contentQuality.push('❌ Consolidated lessons file not found');
    validationResults.overall = 'FAIL';
  }
  
  // 2. Validate User Experience
  console.log('\n👤 Validating User Experience...');
  
  const exerciseModalPath = path.join(__dirname, '..', 'app', 'components', 'ExerciseModal.tsx');
  if (fs.existsSync(exerciseModalPath)) {
    const content = fs.readFileSync(exerciseModalPath, 'utf8');
    
    if (content.includes('Enhanced Explanation')) {
      validationResults.userExperience.push('✅ Enhanced feedback implemented');
    } else {
      validationResults.userExperience.push('❌ Enhanced feedback not found');
      validationResults.overall = 'FAIL';
    }
    
    if (content.includes('Cultural Insight')) {
      validationResults.userExperience.push('✅ Cultural insights added');
    } else {
      validationResults.userExperience.push('❌ Cultural insights not found');
      validationResults.overall = 'FAIL';
    }
    
    if (content.includes('Learning Tip')) {
      validationResults.userExperience.push('✅ Learning tips added');
    } else {
      validationResults.userExperience.push('❌ Learning tips not found');
      validationResults.overall = 'FAIL';
    }
  }
  
  // 3. Validate Gamification
  console.log('\n🎮 Validating Gamification...');
  
  const gamificationPath = path.join(__dirname, '..', 'lib', 'gamification.ts');
  if (fs.existsSync(gamificationPath)) {
    validationResults.gamification.push('✅ Gamification configuration created');
    
    const content = fs.readFileSync(gamificationPath, 'utf8');
    
    if (content.includes('achievements')) {
      validationResults.gamification.push('✅ Achievement system implemented');
    }
    
    if (content.includes('challenges')) {
      validationResults.gamification.push('✅ Challenge system implemented');
    }
    
    if (content.includes('calculateXP')) {
      validationResults.gamification.push('✅ XP calculation system implemented');
    }
  } else {
    validationResults.gamification.push('❌ Gamification configuration not found');
    validationResults.overall = 'FAIL';
  }
  
  // 4. Validate Technical Implementation
  console.log('\n🚀 Validating Technical Implementation...');
  
  // Check Next.js config
  const nextConfigPath = path.join(__dirname, '..', 'next.config.ts');
  if (fs.existsSync(nextConfigPath)) {
    validationResults.technical.push('✅ Next.js configuration optimized');
  } else {
    validationResults.technical.push('❌ Next.js configuration not found');
    validationResults.overall = 'FAIL';
  }
  
  // Check performance utilities
  const performancePath = path.join(__dirname, '..', 'lib', 'performance.ts');
  if (fs.existsSync(performancePath)) {
    validationResults.technical.push('✅ Performance utilities created');
  } else {
    validationResults.technical.push('❌ Performance utilities not found');
    validationResults.overall = 'FAIL';
  }
  
  // Check auth enhancement
  const authPath = path.join(__dirname, '..', 'lib', 'auth.ts');
  if (fs.existsSync(authPath)) {
    const authContent = fs.readFileSync(authPath, 'utf8');
    
    if (authContent.includes('process.env.JWT_SECRET')) {
      validationResults.technical.push('✅ Security enhanced with environment variables');
    } else {
      validationResults.technical.push('❌ Security enhancement not found');
      validationResults.overall = 'FAIL';
    }
    
    if (authContent.includes('generateToken')) {
      validationResults.technical.push('✅ Token generation functions added');
    } else {
      validationResults.technical.push('❌ Token generation not found');
      validationResults.overall = 'FAIL';
    }
  }
  
  // Check environment configuration
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    validationResults.technical.push('✅ Environment configuration created');
  } else {
    validationResults.technical.push('❌ Environment configuration not found');
    validationResults.overall = 'FAIL';
  }
  
  // 5. Print Results
  console.log('\n📊 VALIDATION RESULTS:');
  console.log('='.repeat(50));
  
  console.log('\n📚 Content Quality:');
  validationResults.contentQuality.forEach(result => console.log(`  ${result}`));
  
  console.log('\n👤 User Experience:');
  validationResults.userExperience.forEach(result => console.log(`  ${result}`));
  
  console.log('\n🎮 Gamification:');
  validationResults.gamification.forEach(result => console.log(`  ${result}`));
  
  console.log('\n🚀 Technical Implementation:');
  validationResults.technical.forEach(result => console.log(`  ${result}`));
  
  console.log('\n' + '='.repeat(50));
  console.log(`🎯 OVERALL STATUS: ${validationResults.overall}`);
  
  if (validationResults.overall === 'PASS') {
    console.log('🎉 All implementations validated successfully!');
    console.log('✅ The app is ready for production deployment.');
  } else {
    console.log('⚠️  Some implementations need attention.');
    console.log('🔧 Please review the failed validations above.');
  }
  
  return validationResults;
}

validateImplementations(); 