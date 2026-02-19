const fs = require('fs');
const path = require('path');

// Comprehensive Integration Script for All Shona Learning Modules
// This script integrates all new modules across iOS, Web, and Android platforms

class ShonaModuleIntegrator {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.contentPath = path.join(this.basePath, 'content');
    this.outputPath = path.join(this.basePath, 'content', 'integrated');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
    
    this.integrationReport = {
      timestamp: new Date().toISOString(),
      modules: {},
      statistics: {},
      errors: [],
      warnings: []
    };
  }

  // Main integration function
  async integrateAllModules() {
    console.log('🚀 Starting comprehensive Shona module integration...\n');
    
    try {
      // Step 1: Integrate all vocabulary modules
      await this.integrateVocabularyModules();
      
      // Step 2: Integrate lesson plans
      await this.integrateLessonPlans();
      
      // Step 3: Integrate assessments
      await this.integrateAssessments();
      
      // Step 4: Create cross-platform content files
      await this.createCrossPlatformContent();
      
      // Step 5: Generate integration report
      await this.generateIntegrationReport();
      
      console.log('✅ All modules integrated successfully!');
      
    } catch (error) {
      console.error('❌ Integration failed:', error);
      this.integrationReport.errors.push(error.message);
      await this.generateIntegrationReport();
      throw error;
    }
  }

  // Integrate all vocabulary modules
  async integrateVocabularyModules() {
    console.log('📚 Integrating vocabulary modules...');
    
    const vocabularyModules = [
      'fundamental-basic-vocabulary.js',
      'traditional-cultural-vocabulary.js',
      'essential-verbs-actions.js',
      'essential-phrases-expressions.js',
      'advanced-conversational-vocabulary.js',
      'contemporary-modern-vocabulary.js',
      'professional-technical-vocabulary.js'
    ];
    
    const integratedVocabulary = {
      metadata: {
        version: '3.0.0',
        integratedAt: new Date().toISOString(),
        totalModules: vocabularyModules.length,
        totalWords: 0,
        categories: new Set(),
        difficultyLevels: new Set(),
        sources: []
      },
      vocabulary: [],
      modules: {}
    };
    
    for (const moduleFile of vocabularyModules) {
      try {
        const modulePath = path.join(this.contentPath, 'vocabulary', moduleFile);
        
        if (!fs.existsSync(modulePath)) {
          console.warn(`⚠️  Module not found: ${moduleFile}`);
          this.integrationReport.warnings.push(`Module not found: ${moduleFile}`);
          continue;
        }
        
        // Import the module
        const moduleName = path.basename(moduleFile, '.js');
        const moduleContent = await this.importVocabularyModule(modulePath, moduleName);
        
        if (moduleContent) {
          integratedVocabulary.modules[moduleName] = {
            wordCount: moduleContent.wordCount,
            categories: moduleContent.categories,
            difficultyLevels: moduleContent.difficultyLevels
          };
          
          integratedVocabulary.vocabulary.push(...moduleContent.vocabulary);
          
          // Update metadata
          integratedVocabulary.metadata.totalWords += moduleContent.wordCount;
          moduleContent.categories.forEach(cat => integratedVocabulary.metadata.categories.add(cat));
          moduleContent.difficultyLevels.forEach(level => integratedVocabulary.metadata.difficultyLevels.add(level));
          integratedVocabulary.metadata.sources.push(moduleName);
          
          console.log(`✅ Integrated ${moduleName}: ${moduleContent.wordCount} words`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to integrate ${moduleFile}:`, error);
        this.integrationReport.errors.push(`Failed to integrate ${moduleFile}: ${error.message}`);
      }
    }
    
    // Convert Sets to Arrays for JSON serialization
    integratedVocabulary.metadata.categories = Array.from(integratedVocabulary.metadata.categories);
    integratedVocabulary.metadata.difficultyLevels = Array.from(integratedVocabulary.metadata.difficultyLevels);
    
    // Save integrated vocabulary
    const vocabOutputPath = path.join(this.outputPath, 'vocabulary_integrated.json');
    fs.writeFileSync(vocabOutputPath, JSON.stringify(integratedVocabulary, null, 2));
    
    this.integrationReport.modules.vocabulary = {
      totalWords: integratedVocabulary.metadata.totalWords,
      modules: Object.keys(integratedVocabulary.modules),
      outputFile: 'vocabulary_integrated.json'
    };
    
    console.log(`📊 Total vocabulary integrated: ${integratedVocabulary.metadata.totalWords} words\n`);
  }

  // Import and process vocabulary module
  async importVocabularyModule(modulePath, moduleName) {
    try {
      // Read the module file
      const moduleContent = fs.readFileSync(modulePath, 'utf8');
      
      // Extract vocabulary using regex patterns
      const vocabulary = this.extractVocabularyFromModule(moduleContent, moduleName);
      
      if (vocabulary.length === 0) {
        console.warn(`⚠️  No vocabulary found in ${moduleName}`);
        return null;
      }
      
      // Analyze the vocabulary
      const categories = new Set();
      const difficultyLevels = new Set();
      
      vocabulary.forEach(word => {
        if (word.category) categories.add(word.category);
        if (word.difficulty) difficultyLevels.add(word.difficulty);
        if (word.level) difficultyLevels.add(word.level);
      });
      
      return {
        wordCount: vocabulary.length,
        vocabulary: vocabulary,
        categories: Array.from(categories),
        difficultyLevels: Array.from(difficultyLevels)
      };
      
    } catch (error) {
      throw new Error(`Failed to import ${moduleName}: ${error.message}`);
    }
  }

  // Extract vocabulary from module content
  extractVocabularyFromModule(moduleContent, moduleName) {
    const vocabulary = [];
    
    // Pattern to match vocabulary objects
    const vocabPattern = /\{[^}]*"id"[^}]*"shona"[^}]*\}/g;
    const matches = moduleContent.match(vocabPattern);
    
    if (matches) {
      matches.forEach(match => {
        try {
          // Clean up the match to make it valid JSON
          let cleaned = match
            .replace(/(\w+):/g, '"$1":') // Add quotes to keys
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
          
          const vocab = JSON.parse(cleaned);
          
          if (vocab.shona && vocab.english) {
            // Standardize the vocabulary entry
            const standardized = {
              ...vocab,
              source: moduleName,
              integrated: true
            };
            
            vocabulary.push(standardized);
          }
        } catch (parseError) {
          // Skip invalid entries
        }
      });
    }
    
    return vocabulary;
  }

  // Integrate lesson plans
  async integrateLessonPlans() {
    console.log('📖 Integrating lesson plans...');
    
    const lessonModules = [
      'fundamental-basic-lessons.js',
      'traditional-cultural-lessons.js',
      'essential-verbs-lessons.js',
      'essential-phrases-lessons.js',
      'fluent-conversational-lessons.js'
    ];
    
    const integratedLessons = {
      metadata: {
        version: '3.0.0',
        integratedAt: new Date().toISOString(),
        totalModules: lessonModules.length,
        totalLessons: 0,
        categories: new Set(),
        difficultyLevels: new Set()
      },
      lessons: [],
      modules: {}
    };
    
    for (const moduleFile of lessonModules) {
      try {
        const modulePath = path.join(this.contentPath, 'lesson-plans', moduleFile);
        
        if (!fs.existsSync(modulePath)) {
          console.warn(`⚠️  Lesson module not found: ${moduleFile}`);
          this.integrationReport.warnings.push(`Lesson module not found: ${moduleFile}`);
          continue;
        }
        
        // Import the lesson module
        const moduleName = path.basename(moduleFile, '.js');
        const moduleContent = await this.importLessonModule(modulePath, moduleName);
        
        if (moduleContent) {
          integratedLessons.modules[moduleName] = {
            lessonCount: moduleContent.lessonCount,
            categories: moduleContent.categories,
            difficultyLevels: moduleContent.difficultyLevels
          };
          
          integratedLessons.lessons.push(...moduleContent.lessons);
          
          // Update metadata
          integratedLessons.metadata.totalLessons += moduleContent.lessonCount;
          moduleContent.categories.forEach(cat => integratedLessons.metadata.categories.add(cat));
          moduleContent.difficultyLevels.forEach(level => integratedLessons.metadata.difficultyLevels.add(level));
          
          console.log(`✅ Integrated ${moduleName}: ${moduleContent.lessonCount} lessons`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to integrate lesson module ${moduleFile}:`, error);
        this.integrationReport.errors.push(`Failed to integrate lesson module ${moduleFile}: ${error.message}`);
      }
    }
    
    // Convert Sets to Arrays for JSON serialization
    integratedLessons.metadata.categories = Array.from(integratedLessons.metadata.categories);
    integratedLessons.metadata.difficultyLevels = Array.from(integratedLessons.metadata.difficultyLevels);
    
    // Save integrated lessons
    const lessonsOutputPath = path.join(this.outputPath, 'lessons_integrated.json');
    fs.writeFileSync(lessonsOutputPath, JSON.stringify(integratedLessons, null, 2));
    
    this.integrationReport.modules.lessons = {
      totalLessons: integratedLessons.metadata.totalLessons,
      modules: Object.keys(integratedLessons.modules),
      outputFile: 'lessons_integrated.json'
    };
    
    console.log(`📊 Total lessons integrated: ${integratedLessons.metadata.totalLessons} lessons\n`);
  }

  // Import and process lesson module
  async importLessonModule(modulePath, moduleName) {
    try {
      // Read the module file
      const moduleContent = fs.readFileSync(modulePath, 'utf8');
      
      // Extract lessons using regex patterns
      const lessons = this.extractLessonsFromModule(moduleContent, moduleName);
      
      if (lessons.length === 0) {
        console.warn(`⚠️  No lessons found in ${moduleName}`);
        return null;
      }
      
      // Analyze the lessons
      const categories = new Set();
      const difficultyLevels = new Set();
      
      lessons.forEach(lesson => {
        if (lesson.category) categories.add(lesson.category);
        if (lesson.difficulty) difficultyLevels.add(lesson.difficulty);
        if (lesson.level) difficultyLevels.add(lesson.level);
      });
      
      return {
        lessonCount: lessons.length,
        lessons: lessons,
        categories: Array.from(categories),
        difficultyLevels: Array.from(difficultyLevels)
      };
      
    } catch (error) {
      throw new Error(`Failed to import lesson module ${moduleName}: ${error.message}`);
    }
  }

  // Extract lessons from module content
  extractLessonsFromModule(moduleContent, moduleName) {
    const lessons = [];
    
    // Pattern to match lesson objects
    const lessonPattern = /lesson_\d+:\s*\{[^}]*"id"[^}]*"title"[^}]*\}/g;
    const matches = moduleContent.match(lessonPattern);
    
    if (matches) {
      matches.forEach(match => {
        try {
          // Clean up the match to make it valid JSON
          let cleaned = match
            .replace(/lesson_\d+:\s*/, '') // Remove lesson prefix
            .replace(/(\w+):/g, '"$1":') // Add quotes to keys
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
          
          const lesson = JSON.parse(cleaned);
          
          if (lesson.title && lesson.id) {
            // Standardize the lesson entry
            const standardized = {
              ...lesson,
              source: moduleName,
              integrated: true
            };
            
            lessons.push(standardized);
          }
        } catch (parseError) {
          // Skip invalid entries
        }
      });
    }
    
    return lessons;
  }

  // Integrate assessments
  async integrateAssessments() {
    console.log('📝 Integrating assessments...');
    
    const assessmentModules = [
      'comprehensive-assessments.js'
    ];
    
    const integratedAssessments = {
      metadata: {
        version: '3.0.0',
        integratedAt: new Date().toISOString(),
        totalModules: assessmentModules.length,
        totalAssessments: 0,
        assessmentTypes: new Set(),
        difficultyLevels: new Set()
      },
      assessments: [],
      modules: {}
    };
    
    for (const moduleFile of assessmentModules) {
      try {
        const modulePath = path.join(this.contentPath, 'assessments', moduleFile);
        
        if (!fs.existsSync(modulePath)) {
          console.warn(`⚠️  Assessment module not found: ${moduleFile}`);
          this.integrationReport.warnings.push(`Assessment module not found: ${moduleFile}`);
          continue;
        }
        
        // Import the assessment module
        const moduleName = path.basename(moduleFile, '.js');
        const moduleContent = await this.importAssessmentModule(modulePath, moduleName);
        
        if (moduleContent) {
          integratedAssessments.modules[moduleName] = {
            assessmentCount: moduleContent.assessmentCount,
            assessmentTypes: moduleContent.assessmentTypes,
            difficultyLevels: moduleContent.difficultyLevels
          };
          
          integratedAssessments.assessments.push(...moduleContent.assessments);
          
          // Update metadata
          integratedAssessments.metadata.totalAssessments += moduleContent.assessmentCount;
          moduleContent.assessmentTypes.forEach(type => integratedAssessments.metadata.assessmentTypes.add(type));
          moduleContent.difficultyLevels.forEach(level => integratedAssessments.metadata.difficultyLevels.add(level));
          
          console.log(`✅ Integrated ${moduleName}: ${moduleContent.assessmentCount} assessments`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to integrate assessment module ${moduleFile}:`, error);
        this.integrationReport.errors.push(`Failed to integrate assessment module ${moduleFile}: ${error.message}`);
      }
    }
    
    // Convert Sets to Arrays for JSON serialization
    integratedAssessments.metadata.assessmentTypes = Array.from(integratedAssessments.metadata.assessmentTypes);
    integratedAssessments.metadata.difficultyLevels = Array.from(integratedAssessments.metadata.difficultyLevels);
    
    // Save integrated assessments
    const assessmentsOutputPath = path.join(this.outputPath, 'assessments_integrated.json');
    fs.writeFileSync(assessmentsOutputPath, JSON.stringify(integratedAssessments, null, 2));
    
    this.integrationReport.modules.assessments = {
      totalAssessments: integratedAssessments.metadata.totalAssessments,
      modules: Object.keys(integratedAssessments.modules),
      outputFile: 'assessments_integrated.json'
    };
    
    console.log(`📊 Total assessments integrated: ${integratedAssessments.metadata.totalAssessments} assessments\n`);
  }

  // Import and process assessment module
  async importAssessmentModule(modulePath, moduleName) {
    try {
      // Read the module file
      const moduleContent = fs.readFileSync(modulePath, 'utf8');
      
      // Extract assessments using regex patterns
      const assessments = this.extractAssessmentsFromModule(moduleContent, moduleName);
      
      if (assessments.length === 0) {
        console.warn(`⚠️  No assessments found in ${moduleName}`);
        return null;
      }
      
      // Analyze the assessments
      const assessmentTypes = new Set();
      const difficultyLevels = new Set();
      
      assessments.forEach(assessment => {
        if (assessment.type) assessmentTypes.add(assessment.type);
        if (assessment.difficulty) difficultyLevels.add(assessment.difficulty);
        if (assessment.level) difficultyLevels.add(assessment.level);
      });
      
      return {
        assessmentCount: assessments.length,
        assessments: assessments,
        assessmentTypes: Array.from(assessmentTypes),
        difficultyLevels: Array.from(difficultyLevels)
      };
      
    } catch (error) {
      throw new Error(`Failed to import assessment module ${moduleName}: ${error.message}`);
    }
  }

  // Extract assessments from module content
  extractAssessmentsFromModule(moduleContent, moduleName) {
    const assessments = [];
    
    // Pattern to match assessment objects
    const assessmentPattern = /\{[^}]*"id"[^}]*"type"[^}]*\}/g;
    const matches = moduleContent.match(assessmentPattern);
    
    if (matches) {
      matches.forEach(match => {
        try {
          // Clean up the match to make it valid JSON
          let cleaned = match
            .replace(/(\w+):/g, '"$1":') // Add quotes to keys
            .replace(/'/g, '"') // Replace single quotes with double quotes
            .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
          
          const assessment = JSON.parse(cleaned);
          
          if (assessment.type && assessment.id) {
            // Standardize the assessment entry
            const standardized = {
              ...assessment,
              source: moduleName,
              integrated: true
            };
            
            assessments.push(standardized);
          }
        } catch (parseError) {
          // Skip invalid entries
        }
      });
    }
    
    return assessments;
  }

  // Create cross-platform content files
  async createCrossPlatformContent() {
    console.log('🌐 Creating cross-platform content files...');
    
    // Load integrated content
    const vocabPath = path.join(this.outputPath, 'vocabulary_integrated.json');
    const lessonsPath = path.join(this.outputPath, 'lessons_integrated.json');
    const assessmentsPath = path.join(this.outputPath, 'assessments_integrated.json');
    
    if (!fs.existsSync(vocabPath) || !fs.existsSync(lessonsPath) || !fs.existsSync(assessmentsPath)) {
      throw new Error('Integrated content files not found');
    }
    
    const vocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
    const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
    const assessments = JSON.parse(fs.readFileSync(assessmentsPath, 'utf8'));
    
    // Create platform-specific content
    await this.createWebContent(vocabulary, lessons, assessments);
    await this.createIOSContent(vocabulary, lessons, assessments);
    await this.createAndroidContent(vocabulary, lessons, assessments);
    
    console.log('✅ Cross-platform content created\n');
  }

  // Create web-specific content
  async createWebContent(vocabulary, lessons, assessments) {
    const webContent = {
      vocabulary: this.adaptForWeb(vocabulary),
      lessons: this.adaptForWeb(lessons),
      assessments: this.adaptForWeb(assessments)
    };
    
    const webOutputPath = path.join(this.outputPath, 'web_content.json');
    fs.writeFileSync(webOutputPath, JSON.stringify(webContent, null, 2));
    
    console.log('✅ Web content created');
  }

  // Create iOS-specific content
  async createIOSContent(vocabulary, lessons, assessments) {
    const iosContent = {
      vocabulary: this.adaptForIOS(vocabulary),
      lessons: this.adaptForIOS(lessons),
      assessments: this.adaptForIOS(assessments)
    };
    
    const iosOutputPath = path.join(this.outputPath, 'ios_content.json');
    fs.writeFileSync(iosOutputPath, JSON.stringify(iosContent, null, 2));
    
    console.log('✅ iOS content created');
  }

  // Create Android-specific content
  async createAndroidContent(vocabulary, lessons, assessments) {
    const androidContent = {
      vocabulary: this.adaptForAndroid(vocabulary),
      lessons: this.adaptForAndroid(lessons),
      assessments: this.adaptForAndroid(assessments)
    };
    
    const androidOutputPath = path.join(this.outputPath, 'android_content.json');
    fs.writeFileSync(androidOutputPath, JSON.stringify(androidContent, null, 2));
    
    console.log('✅ Android content created');
  }

  // Adapt content for web platform
  adaptForWeb(content) {
    return {
      ...content,
      platform: 'web',
      format: 'json',
      optimized: true
    };
  }

  // Adapt content for iOS platform
  adaptForIOS(content) {
    return {
      ...content,
      platform: 'ios',
      format: 'json',
      optimized: true,
      swiftCompatible: true
    };
  }

  // Adapt content for Android platform
  adaptForAndroid(content) {
    return {
      ...content,
      platform: 'android',
      format: 'json',
      optimized: true,
      kotlinCompatible: true
    };
  }

  // Generate integration report
  async generateIntegrationReport() {
    console.log('📋 Generating integration report...');
    
    const reportPath = path.join(this.outputPath, 'integration_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.integrationReport, null, 2));
    
    // Also create a human-readable report
    const humanReadableReport = this.createHumanReadableReport();
    const humanReportPath = path.join(this.outputPath, 'integration_report.md');
    fs.writeFileSync(humanReportPath, humanReadableReport);
    
    console.log('✅ Integration report generated');
  }

  // Create human-readable report
  createHumanReadableReport() {
    const report = this.integrationReport;
    
    let markdown = `# Shona Learning Module Integration Report

## Overview
- **Integration Date**: ${new Date(report.timestamp).toLocaleString()}
- **Total Modules Processed**: ${Object.keys(report.modules).length}
- **Errors**: ${report.errors.length}
- **Warnings**: ${report.warnings.length}

## Module Statistics

### Vocabulary
- **Total Words**: ${report.modules.vocabulary?.totalWords || 0}
- **Modules**: ${report.modules.vocabulary?.modules?.join(', ') || 'None'}

### Lessons
- **Total Lessons**: ${report.modules.lessons?.totalLessons || 0}
- **Modules**: ${report.modules.lessons?.modules?.join(', ') || 'None'}

### Assessments
- **Total Assessments**: ${report.modules.assessments?.totalAssessments || 0}
- **Modules**: ${report.modules.assessments?.modules?.join(', ') || 'None'}

## Errors
${report.errors.length > 0 ? report.errors.map(error => `- ${error}`).join('\n') : 'None'}

## Warnings
${report.warnings.length > 0 ? report.warnings.map(warning => `- ${warning}`).join('\n') : 'None'}

## Output Files
- \`vocabulary_integrated.json\` - Integrated vocabulary for all platforms
- \`lessons_integrated.json\` - Integrated lessons for all platforms
- \`assessments_integrated.json\` - Integrated assessments for all platforms
- \`web_content.json\` - Web-optimized content
- \`ios_content.json\` - iOS-optimized content
- \`android_content.json\` - Android-optimized content

## Next Steps
1. Copy platform-specific content files to respective app directories
2. Update app import statements to use new integrated content
3. Test content loading on all platforms
4. Verify all vocabulary, lessons, and assessments are accessible
`;

    return markdown;
  }
}

// Main execution
if (require.main === module) {
  const integrator = new ShonaModuleIntegrator();
  integrator.integrateAllModules()
    .then(() => console.log('🎉 Integration complete!'))
    .catch(console.error);
}

module.exports = ShonaModuleIntegrator; 