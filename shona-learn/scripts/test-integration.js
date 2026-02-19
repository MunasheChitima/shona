const fs = require('fs');
const path = require('path');

// Comprehensive Integration Test Script
// This script tests that all new modules are working across platforms

class IntegrationTester {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.testResults = {
      timestamp: new Date().toISOString(),
      tests: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  // Run all integration tests
  async runAllTests() {
    console.log('🧪 Starting comprehensive integration tests...\n');
    
    try {
      // Test 1: Vocabulary Module Integration
      await this.testVocabularyIntegration();
      
      // Test 2: Lesson Plan Integration
      await this.testLessonPlanIntegration();
      
      // Test 3: Assessment Integration
      await this.testAssessmentIntegration();
      
      // Test 4: Cross-Platform Content Generation
      await this.testCrossPlatformContent();
      
      // Test 5: iOS App Integration
      await this.testIOSIntegration();
      
      // Test 6: Web App Integration
      await this.testWebAppIntegration();
      
      // Test 7: Content Validation
      await this.testContentValidation();
      
      // Generate test report
      await this.generateTestReport();
      
      console.log('\n🎉 All integration tests completed!');
      this.printSummary();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      this.testResults.summary.failed++;
      await this.generateTestReport();
      throw error;
    }
  }

  // Test vocabulary module integration
  async testVocabularyIntegration() {
    console.log('📚 Testing vocabulary module integration...');
    
    const testName = 'vocabulary_integration';
    this.testResults.tests[testName] = { passed: 0, failed: 0, warnings: 0, details: [] };
    
    try {
      // Check if vocabulary modules exist
      const vocabularyModules = [
        'content/vocabulary/fundamental-basic-vocabulary.js',
        'content/vocabulary/traditional-cultural-vocabulary.js',
        'content/vocabulary/essential-verbs-actions.js',
        'content/vocabulary/essential-phrases-expressions.js'
      ];
      
      for (const modulePath of vocabularyModules) {
        const fullPath = path.join(this.basePath, modulePath);
        if (fs.existsSync(fullPath)) {
          this.testResults.tests[testName].passed++;
          this.testResults.tests[testName].details.push(`✅ ${modulePath} exists`);
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ ${modulePath} missing`);
        }
      }
      
      // Check unified vocabulary file
      const unifiedPath = path.join(this.basePath, 'content/unified/vocabulary_unified.json');
      if (fs.existsSync(unifiedPath)) {
        const data = JSON.parse(fs.readFileSync(unifiedPath, 'utf8'));
        if (data.vocabulary && data.vocabulary.length > 0) {
          this.testResults.tests[testName].passed++;
          this.testResults.tests[testName].details.push(`✅ Unified vocabulary: ${data.vocabulary.length} words`);
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ Unified vocabulary is empty`);
        }
      } else {
        this.testResults.tests[testName].failed++;
        this.testResults.tests[testName].details.push(`❌ Unified vocabulary file missing`);
      }
      
      this.testResults.summary.total += this.testResults.tests[testName].passed + this.testResults.tests[testName].failed;
      this.testResults.summary.passed += this.testResults.tests[testName].passed;
      this.testResults.summary.failed += this.testResults.tests[testName].failed;
      
    } catch (error) {
      this.testResults.tests[testName].failed++;
      this.testResults.tests[testName].details.push(`❌ Test error: ${error.message}`);
      this.testResults.summary.failed++;
    }
  }

  // Test lesson plan integration
  async testLessonPlanIntegration() {
    console.log('📖 Testing lesson plan integration...');
    
    const testName = 'lesson_plan_integration';
    this.testResults.tests[testName] = { passed: 0, failed: 0, warnings: 0, details: [] };
    
    try {
      // Check if lesson plan modules exist
      const lessonModules = [
        'content/lesson-plans/fundamental-basic-lessons.js',
        'content/lesson-plans/traditional-cultural-lessons.js',
        'content/lesson-plans/essential-verbs-lessons.js',
        'content/lesson-plans/essential-phrases-lessons.js'
      ];
      
      for (const modulePath of lessonModules) {
        const fullPath = path.join(this.basePath, modulePath);
        if (fs.existsSync(fullPath)) {
          this.testResults.tests[testName].passed++;
          this.testResults.tests[testName].details.push(`✅ ${modulePath} exists`);
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ ${modulePath} missing`);
        }
      }
      
      // Check unified lessons file
      const unifiedPath = path.join(this.basePath, 'content/unified/lessons_unified.json');
      if (fs.existsSync(unifiedPath)) {
        const data = JSON.parse(fs.readFileSync(unifiedPath, 'utf8'));
        if (data.lessons && data.lessons.length > 0) {
          this.testResults.tests[testName].passed++;
          this.testResults.tests[testName].details.push(`✅ Unified lessons: ${data.lessons.length} lessons`);
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ Unified lessons is empty`);
        }
      } else {
        this.testResults.tests[testName].failed++;
        this.testResults.tests[testName].details.push(`❌ Unified lessons file missing`);
      }
      
      this.testResults.summary.total += this.testResults.tests[testName].passed + this.testResults.tests[testName].failed;
      this.testResults.summary.passed += this.testResults.tests[testName].passed;
      this.testResults.summary.failed += this.testResults.tests[testName].failed;
      
    } catch (error) {
      this.testResults.tests[testName].failed++;
      this.testResults.tests[testName].details.push(`❌ Test error: ${error.message}`);
      this.testResults.summary.failed++;
    }
  }

  // Test assessment integration
  async testAssessmentIntegration() {
    console.log('📝 Testing assessment integration...');
    
    const testName = 'assessment_integration';
    this.testResults.tests[testName] = { passed: 0, failed: 0, warnings: 0, details: [] };
    
    try {
      // Check if assessment modules exist
      const assessmentModules = [
        'content/assessments/comprehensive-assessments.js'
      ];
      
      for (const modulePath of assessmentModules) {
        const fullPath = path.join(this.basePath, modulePath);
        if (fs.existsSync(fullPath)) {
          this.testResults.tests[testName].passed++;
          this.testResults.tests[testName].details.push(`✅ ${modulePath} exists`);
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ ${modulePath} missing`);
        }
      }
      
      // Check unified assessments file
      const unifiedPath = path.join(this.basePath, 'content/unified/assessments_unified.json');
      if (fs.existsSync(unifiedPath)) {
        const data = JSON.parse(fs.readFileSync(unifiedPath, 'utf8'));
        if (data.assessments && data.assessments.length > 0) {
          this.testResults.tests[testName].passed++;
          this.testResults.tests[testName].details.push(`✅ Unified assessments: ${data.assessments.length} assessments`);
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ Unified assessments is empty`);
        }
      } else {
        this.testResults.tests[testName].failed++;
        this.testResults.tests[testName].details.push(`❌ Unified assessments file missing`);
      }
      
      this.testResults.summary.total += this.testResults.tests[testName].passed + this.testResults.tests[testName].failed;
      this.testResults.summary.passed += this.testResults.tests[testName].passed;
      this.testResults.summary.failed += this.testResults.tests[testName].failed;
      
    } catch (error) {
      this.testResults.tests[testName].failed++;
      this.testResults.tests[testName].details.push(`❌ Test error: ${error.message}`);
      this.testResults.summary.failed++;
    }
  }

  // Test cross-platform content generation
  async testCrossPlatformContent() {
    console.log('🌐 Testing cross-platform content generation...');
    
    const testName = 'cross_platform_content';
    this.testResults.tests[testName] = { passed: 0, failed: 0, warnings: 0, details: [] };
    
    try {
      const platformFiles = [
        'content/unified/web_content.json',
        'content/unified/ios_content.json',
        'content/unified/android_content.json'
      ];
      
      for (const filePath of platformFiles) {
        const fullPath = path.join(this.basePath, filePath);
        if (fs.existsSync(fullPath)) {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          if (data.platform && data.vocabulary && data.lessons && data.assessments) {
            this.testResults.tests[testName].passed++;
            this.testResults.tests[testName].details.push(`✅ ${data.platform} content generated`);
          } else {
            this.testResults.tests[testName].failed++;
            this.testResults.tests[testName].details.push(`❌ ${filePath} has invalid structure`);
          }
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ ${filePath} missing`);
        }
      }
      
      this.testResults.summary.total += this.testResults.tests[testName].passed + this.testResults.tests[testName].failed;
      this.testResults.summary.passed += this.testResults.tests[testName].passed;
      this.testResults.summary.failed += this.testResults.tests[testName].failed;
      
    } catch (error) {
      this.testResults.tests[testName].failed++;
      this.testResults.tests[testName].details.push(`❌ Test error: ${error.message}`);
      this.testResults.summary.failed++;
    }
  }

  // Test iOS app integration
  async testIOSIntegration() {
    console.log('📱 Testing iOS app integration...');
    
    const testName = 'ios_integration';
    this.testResults.tests[testName] = { passed: 0, failed: 0, warnings: 0, details: [] };
    
    try {
      const iosFiles = [
        '../Ios/Shona App/Shona App/Content/vocabulary_unified.json',
        '../Ios/Shona App/Shona App/Content/lessons_unified.json',
        '../Ios/Shona App/Shona App/Content/assessments_unified.json'
      ];
      
      for (const filePath of iosFiles) {
        const fullPath = path.join(this.basePath, filePath);
        if (fs.existsSync(fullPath)) {
          this.testResults.tests[testName].passed++;
          this.testResults.tests[testName].details.push(`✅ ${path.basename(filePath)} copied to iOS`);
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ ${path.basename(filePath)} not found in iOS`);
        }
      }
      
      // Check ContentManager.swift
      const contentManagerPath = path.join(this.basePath, '../Ios/Shona App/Shona App/Services/ContentManager.swift');
      if (fs.existsSync(contentManagerPath)) {
        const content = fs.readFileSync(contentManagerPath, 'utf8');
        if (content.includes('vocabulary_unified') && content.includes('lessons_unified') && content.includes('assessments_unified')) {
          this.testResults.tests[testName].passed++;
          this.testResults.tests[testName].details.push(`✅ ContentManager.swift updated for unified content`);
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ ContentManager.swift not updated for unified content`);
        }
      } else {
        this.testResults.tests[testName].failed++;
        this.testResults.tests[testName].details.push(`❌ ContentManager.swift not found`);
      }
      
      this.testResults.summary.total += this.testResults.tests[testName].passed + this.testResults.tests[testName].failed;
      this.testResults.summary.passed += this.testResults.tests[testName].passed;
      this.testResults.summary.failed += this.testResults.tests[testName].failed;
      
    } catch (error) {
      this.testResults.tests[testName].failed++;
      this.testResults.tests[testName].details.push(`❌ Test error: ${error.message}`);
      this.testResults.summary.failed++;
    }
  }

  // Test web app integration
  async testWebAppIntegration() {
    console.log('🌍 Testing web app integration...');
    
    const testName = 'web_app_integration';
    this.testResults.tests[testName] = { passed: 0, failed: 0, warnings: 0, details: [] };
    
    try {
      // Check IntegratedContentService
      const servicePath = path.join(this.basePath, 'lib/services/IntegratedContentService.ts');
      if (fs.existsSync(servicePath)) {
        this.testResults.tests[testName].passed++;
        this.testResults.tests[testName].details.push(`✅ IntegratedContentService.ts exists`);
      } else {
        this.testResults.tests[testName].failed++;
        this.testResults.tests[testName].details.push(`❌ IntegratedContentService.ts missing`);
      }
      
      // Check IntegratedVocabularyView component
      const componentPath = path.join(this.basePath, 'app/components/IntegratedVocabularyView.tsx');
      if (fs.existsSync(componentPath)) {
        this.testResults.tests[testName].passed++;
        this.testResults.tests[testName].details.push(`✅ IntegratedVocabularyView.tsx exists`);
      } else {
        this.testResults.tests[testName].failed++;
        this.testResults.tests[testName].details.push(`❌ IntegratedVocabularyView.tsx missing`);
      }
      
      // Check integrated vocabulary page
      const pagePath = path.join(this.basePath, 'app/integrated-vocabulary/page.tsx');
      if (fs.existsSync(pagePath)) {
        this.testResults.tests[testName].passed++;
        this.testResults.tests[testName].details.push(`✅ Integrated vocabulary page exists`);
      } else {
        this.testResults.tests[testName].failed++;
        this.testResults.tests[testName].details.push(`❌ Integrated vocabulary page missing`);
      }
      
      this.testResults.summary.total += this.testResults.tests[testName].passed + this.testResults.tests[testName].failed;
      this.testResults.summary.passed += this.testResults.tests[testName].passed;
      this.testResults.summary.failed += this.testResults.tests[testName].failed;
      
    } catch (error) {
      this.testResults.tests[testName].failed++;
      this.testResults.tests[testName].details.push(`❌ Test error: ${error.message}`);
      this.testResults.summary.failed++;
    }
  }

  // Test content validation
  async testContentValidation() {
    console.log('✅ Testing content validation...');
    
    const testName = 'content_validation';
    this.testResults.tests[testName] = { passed: 0, failed: 0, warnings: 0, details: [] };
    
    try {
      // Validate vocabulary structure
      const vocabPath = path.join(this.basePath, 'content/unified/vocabulary_unified.json');
      if (fs.existsSync(vocabPath)) {
        const vocabData = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
        
        if (this.validateVocabularyStructure(vocabData)) {
          this.testResults.tests[testName].passed++;
          this.testResults.tests[testName].details.push(`✅ Vocabulary structure valid`);
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ Vocabulary structure invalid`);
        }
      }
      
      // Validate lessons structure
      const lessonsPath = path.join(this.basePath, 'content/unified/lessons_unified.json');
      if (fs.existsSync(lessonsPath)) {
        const lessonsData = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
        
        if (this.validateLessonsStructure(lessonsData)) {
          this.testResults.tests[testName].passed++;
          this.testResults.tests[testName].details.push(`✅ Lessons structure valid`);
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ Lessons structure invalid`);
        }
      }
      
      // Validate assessments structure
      const assessmentsPath = path.join(this.basePath, 'content/unified/assessments_unified.json');
      if (fs.existsSync(assessmentsPath)) {
        const assessmentsData = JSON.parse(fs.readFileSync(assessmentsPath, 'utf8'));
        
        if (this.validateAssessmentsStructure(assessmentsData)) {
          this.testResults.tests[testName].passed++;
          this.testResults.tests[testName].details.push(`✅ Assessments structure valid`);
        } else {
          this.testResults.tests[testName].failed++;
          this.testResults.tests[testName].details.push(`❌ Assessments structure invalid`);
        }
      }
      
      this.testResults.summary.total += this.testResults.tests[testName].passed + this.testResults.tests[testName].failed;
      this.testResults.summary.passed += this.testResults.tests[testName].passed;
      this.testResults.summary.failed += this.testResults.tests[testName].failed;
      
    } catch (error) {
      this.testResults.tests[testName].failed++;
      this.testResults.tests[testName].details.push(`❌ Test error: ${error.message}`);
      this.testResults.summary.failed++;
    }
  }

  // Validate vocabulary structure
  validateVocabularyStructure(data) {
    return data.metadata && 
           data.vocabulary && 
           Array.isArray(data.vocabulary) &&
           data.vocabulary.length > 0 &&
           data.vocabulary.every(item => item.shona && item.english && item.category);
  }

  // Validate lessons structure
  validateLessonsStructure(data) {
    return data.metadata && 
           data.lessons && 
           Array.isArray(data.lessons) &&
           data.lessons.length > 0 &&
           data.lessons.every(lesson => lesson.id && lesson.title);
  }

  // Validate assessments structure
  validateAssessmentsStructure(data) {
    return data.metadata && 
           data.assessments && 
           Array.isArray(data.assessments) &&
           data.assessments.length > 0 &&
           data.assessments.every(assessment => assessment.id && assessment.title && assessment.type);
  }

  // Generate test report
  async generateTestReport() {
    const reportPath = path.join(this.basePath, 'content/unified/test_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    
    const humanReadableReport = this.createHumanReadableReport();
    const humanReportPath = path.join(this.basePath, 'content/unified/test_report.md');
    fs.writeFileSync(humanReportPath, humanReadableReport);
  }

  // Create human-readable report
  createHumanReadableReport() {
    const report = this.testResults;
    
    let markdown = `# Shona Learning Integration Test Report

## Overview
- **Test Date**: ${new Date(report.timestamp).toLocaleString()}
- **Total Tests**: ${report.summary.total}
- **Passed**: ${report.summary.passed}
- **Failed**: ${report.summary.failed}
- **Success Rate**: ${((report.summary.passed / report.summary.total) * 100).toFixed(1)}%

## Test Results

`;

    Object.entries(report.tests).forEach(([testName, testResult]) => {
      const successRate = ((testResult.passed / (testResult.passed + testResult.failed)) * 100).toFixed(1);
      
      markdown += `### ${testName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
- **Status**: ${testResult.failed === 0 ? '✅ PASSED' : '❌ FAILED'}
- **Success Rate**: ${successRate}%
- **Details**:
${testResult.details.map(detail => `  - ${detail}`).join('\n')}

`;
    });

    markdown += `## Summary
- **All tests passed**: ${report.summary.failed === 0 ? '✅ YES' : '❌ NO'}
- **Integration ready**: ${report.summary.failed === 0 ? '✅ YES' : '❌ NO'}

## Next Steps
${report.summary.failed === 0 ? 
  '1. All modules are successfully integrated across platforms\n2. Content is ready for production use\n3. Apps can be deployed with new vocabulary, lessons, and assessments' :
  '1. Fix failed tests before proceeding\n2. Review error details in the test report\n3. Re-run tests after fixes'
}
`;

    return markdown;
  }

  // Print test summary
  printSummary() {
    const { summary } = this.testResults;
    const successRate = ((summary.passed / summary.total) * 100).toFixed(1);
    
    console.log('\n📊 Test Summary:');
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Success Rate: ${successRate}%`);
    
    if (summary.failed === 0) {
      console.log('\n🎉 All tests passed! Integration is complete and ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the test report for details.');
    }
  }
}

// Main execution
if (require.main === module) {
  const tester = new IntegrationTester();
  tester.runAllTests()
    .then(() => console.log('✅ Test suite completed'))
    .catch(console.error);
}

module.exports = IntegrationTester; 