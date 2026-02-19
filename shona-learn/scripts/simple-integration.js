const fs = require('fs');
const path = require('path');

// Simple Integration Script for Shona Learning Content
// This script integrates existing content files for cross-platform compatibility

class SimpleContentIntegrator {
  constructor() {
    this.basePath = path.join(__dirname, '..');
    this.contentPath = path.join(this.basePath, 'content');
    this.outputPath = path.join(this.basePath, 'content', 'unified');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
    
    this.integrationReport = {
      timestamp: new Date().toISOString(),
      files: {},
      statistics: {},
      errors: [],
      warnings: []
    };
  }

  // Main integration function
  async integrateContent() {
    console.log('🚀 Starting simple content integration...\n');
    
    try {
      // Step 1: Integrate vocabulary files
      await this.integrateVocabularyFiles();
      
      // Step 2: Integrate lesson files
      await this.integrateLessonFiles();
      
      // Step 3: Integrate assessment files
      await this.integrateAssessmentFiles();
      
      // Step 4: Create platform-specific content
      await this.createPlatformContent();
      
      // Step 5: Generate integration report
      await this.generateIntegrationReport();
      
      console.log('✅ Content integration complete!');
      
    } catch (error) {
      console.error('❌ Integration failed:', error);
      this.integrationReport.errors.push(error.message);
      await this.generateIntegrationReport();
      throw error;
    }
  }

  // Integrate vocabulary files
  async integrateVocabularyFiles() {
    console.log('📚 Integrating vocabulary files...');
    
    const vocabularyFiles = [
      'vocabulary_merged.json',
      'vocabulary_enhanced.json',
      'vocabulary.json',
      'vocabulary_master_improved.json'
    ];
    
    let totalWords = 0;
    const allVocabulary = [];
    
    for (const filename of vocabularyFiles) {
      const filePath = path.join(this.contentPath, filename);
      
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const vocabulary = data.vocabulary || data.words || [];
          
          // Add source information to each vocabulary item
          const enrichedVocabulary = vocabulary.map(word => ({
            ...word,
            source: filename.replace('.json', ''),
            integrated: true
          }));
          
          allVocabulary.push(...enrichedVocabulary);
          totalWords += vocabulary.length;
          
          console.log(`✅ Loaded ${filename}: ${vocabulary.length} words`);
          
        } catch (error) {
          console.warn(`⚠️  Failed to load ${filename}: ${error.message}`);
          this.integrationReport.warnings.push(`Failed to load ${filename}: ${error.message}`);
        }
      } else {
        console.warn(`⚠️  File not found: ${filename}`);
        this.integrationReport.warnings.push(`File not found: ${filename}`);
      }
    }
    
    // Remove duplicates based on shona word
    const uniqueVocabulary = this.removeDuplicateVocabulary(allVocabulary);
    
    // Create unified vocabulary file
    const unifiedVocabulary = {
      metadata: {
        version: '3.0.0',
        integratedAt: new Date().toISOString(),
        totalWords: uniqueVocabulary.length,
        sources: vocabularyFiles.filter(f => fs.existsSync(path.join(this.contentPath, f))),
        categories: Array.from(new Set(uniqueVocabulary.map(v => v.category))),
        difficultyLevels: Array.from(new Set(uniqueVocabulary.map(v => v.difficulty).filter(Boolean)))
      },
      vocabulary: uniqueVocabulary
    };
    
    const vocabOutputPath = path.join(this.outputPath, 'vocabulary_unified.json');
    fs.writeFileSync(vocabOutputPath, JSON.stringify(unifiedVocabulary, null, 2));
    
    this.integrationReport.files.vocabulary = {
      totalWords: uniqueVocabulary.length,
      sources: vocabularyFiles.filter(f => fs.existsSync(path.join(this.contentPath, f))),
      outputFile: 'vocabulary_unified.json'
    };
    
    console.log(`📊 Total vocabulary integrated: ${uniqueVocabulary.length} words\n`);
  }

  // Remove duplicate vocabulary items
  removeDuplicateVocabulary(vocabulary) {
    const seen = new Set();
    const unique = [];
    
    vocabulary.forEach(item => {
      const key = item.shona ? item.shona.toLowerCase() : item.english.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });
    
    return unique;
  }

  // Integrate lesson files
  async integrateLessonFiles() {
    console.log('📖 Integrating lesson files...');
    
    const lessonFiles = [
      'lessons_enhanced.json',
      'lessons.json',
      'lessons_enhanced_harmonized.json'
    ];
    
    let totalLessons = 0;
    const allLessons = [];
    
    for (const filename of lessonFiles) {
      const filePath = path.join(this.contentPath, filename);
      
      if (fs.existsSync(filePath)) {
        try {
          const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
          const lessons = data.lessons || [];
          
          // Add source information to each lesson
          const enrichedLessons = lessons.map(lesson => ({
            ...lesson,
            source: filename.replace('.json', ''),
            integrated: true
          }));
          
          allLessons.push(...enrichedLessons);
          totalLessons += lessons.length;
          
          console.log(`✅ Loaded ${filename}: ${lessons.length} lessons`);
          
        } catch (error) {
          console.warn(`⚠️  Failed to load ${filename}: ${error.message}`);
          this.integrationReport.warnings.push(`Failed to load ${filename}: ${error.message}`);
        }
      } else {
        console.warn(`⚠️  File not found: ${filename}`);
        this.integrationReport.warnings.push(`File not found: ${filename}`);
      }
    }
    
    // Remove duplicates based on lesson id
    const uniqueLessons = this.removeDuplicateLessons(allLessons);
    
    // Create unified lessons file
    const unifiedLessons = {
      metadata: {
        version: '3.0.0',
        integratedAt: new Date().toISOString(),
        totalLessons: uniqueLessons.length,
        sources: lessonFiles.filter(f => fs.existsSync(path.join(this.contentPath, f))),
        categories: Array.from(new Set(uniqueLessons.map(l => l.category).filter(Boolean))),
        levels: Array.from(new Set(uniqueLessons.map(l => l.level).filter(Boolean)))
      },
      lessons: uniqueLessons
    };
    
    const lessonsOutputPath = path.join(this.outputPath, 'lessons_unified.json');
    fs.writeFileSync(lessonsOutputPath, JSON.stringify(unifiedLessons, null, 2));
    
    this.integrationReport.files.lessons = {
      totalLessons: uniqueLessons.length,
      sources: lessonFiles.filter(f => fs.existsSync(path.join(this.contentPath, f))),
      outputFile: 'lessons_unified.json'
    };
    
    console.log(`📊 Total lessons integrated: ${uniqueLessons.length} lessons\n`);
  }

  // Remove duplicate lesson items
  removeDuplicateLessons(lessons) {
    const seen = new Set();
    const unique = [];
    
    lessons.forEach(lesson => {
      const key = lesson.id || lesson.title;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(lesson);
      }
    });
    
    return unique;
  }

  // Integrate assessment files
  async integrateAssessmentFiles() {
    console.log('📝 Integrating assessment files...');
    
    // For now, create a basic assessment structure since we don't have assessment files yet
    const basicAssessments = this.createBasicAssessments();
    
    const unifiedAssessments = {
      metadata: {
        version: '3.0.0',
        integratedAt: new Date().toISOString(),
        totalAssessments: basicAssessments.length,
        sources: ['generated'],
        types: Array.from(new Set(basicAssessments.map(a => a.type))),
        levels: Array.from(new Set(basicAssessments.map(a => a.level).filter(Boolean)))
      },
      assessments: basicAssessments
    };
    
    const assessmentsOutputPath = path.join(this.outputPath, 'assessments_unified.json');
    fs.writeFileSync(assessmentsOutputPath, JSON.stringify(unifiedAssessments, null, 2));
    
    this.integrationReport.files.assessments = {
      totalAssessments: basicAssessments.length,
      sources: ['generated'],
      outputFile: 'assessments_unified.json'
    };
    
    console.log(`📊 Total assessments integrated: ${basicAssessments.length} assessments\n`);
  }

  // Create basic assessments
  createBasicAssessments() {
    return [
      {
        id: 'vocab_basic_001',
        title: 'Basic Vocabulary Assessment',
        type: 'vocabulary',
        category: 'basic',
        level: 'A1',
        difficulty: 1,
        description: 'Test your knowledge of basic Shona vocabulary',
        instructions: [
          'Read each question carefully',
          'Choose the best answer',
          'You have 15 minutes to complete this assessment'
        ],
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            question: 'What does "mangwanani" mean?',
            options: ['Good morning', 'Good afternoon', 'Good evening', 'Goodbye'],
            correct_answer: 'Good morning',
            points: 10,
            explanation: 'Mangwanani is the traditional Shona greeting for morning.'
          },
          {
            id: 'q2',
            type: 'multiple_choice',
            question: 'What is the Shona word for "water"?',
            options: ['mvura', 'moto', 'muti', 'gomo'],
            correct_answer: 'mvura',
            points: 10,
            explanation: 'Mvura means water in Shona.'
          }
        ],
        time_limit: '15 minutes',
        passing_score: 70,
        source: 'generated',
        integrated: true
      },
      {
        id: 'grammar_basic_001',
        title: 'Basic Grammar Assessment',
        type: 'grammar',
        category: 'basic',
        level: 'A1',
        difficulty: 2,
        description: 'Test your understanding of basic Shona grammar',
        instructions: [
          'Complete each sentence with the correct word',
          'Pay attention to grammar rules',
          'You have 20 minutes to complete this assessment'
        ],
        questions: [
          {
            id: 'q1',
            type: 'fill_blank',
            question: 'Complete: "Ndiri kuenda ___ Harare" (I am going to Harare)',
            options: ['ku', 'kuna', 'kuti', 'kuti'],
            correct_answer: 'kuna',
            points: 10,
            explanation: 'Kuna is used to indicate direction or destination.'
          }
        ],
        time_limit: '20 minutes',
        passing_score: 75,
        source: 'generated',
        integrated: true
      }
    ];
  }

  // Create platform-specific content
  async createPlatformContent() {
    console.log('🌐 Creating platform-specific content...');
    
    // Load unified content
    const vocabPath = path.join(this.outputPath, 'vocabulary_unified.json');
    const lessonsPath = path.join(this.outputPath, 'lessons_unified.json');
    const assessmentsPath = path.join(this.outputPath, 'assessments_unified.json');
    
    if (!fs.existsSync(vocabPath) || !fs.existsSync(lessonsPath) || !fs.existsSync(assessmentsPath)) {
      throw new Error('Unified content files not found');
    }
    
    const vocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));
    const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
    const assessments = JSON.parse(fs.readFileSync(assessmentsPath, 'utf8'));
    
    // Create web content
    await this.createWebContent(vocabulary, lessons, assessments);
    
    // Create iOS content
    await this.createIOSContent(vocabulary, lessons, assessments);
    
    // Create Android content
    await this.createAndroidContent(vocabulary, lessons, assessments);
    
    console.log('✅ Platform-specific content created\n');
  }

  // Create web-specific content
  async createWebContent(vocabulary, lessons, assessments) {
    const webContent = {
      platform: 'web',
      version: '3.0.0',
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
      platform: 'ios',
      version: '3.0.0',
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
      platform: 'android',
      version: '3.0.0',
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
      optimized: true,
      features: ['search', 'filter', 'audio', 'pronunciation']
    };
  }

  // Adapt content for iOS platform
  adaptForIOS(content) {
    return {
      ...content,
      platform: 'ios',
      format: 'json',
      optimized: true,
      swiftCompatible: true,
      features: ['offline', 'audio', 'pronunciation', 'progress_tracking']
    };
  }

  // Adapt content for Android platform
  adaptForAndroid(content) {
    return {
      ...content,
      platform: 'android',
      format: 'json',
      optimized: true,
      kotlinCompatible: true,
      features: ['offline', 'audio', 'pronunciation', 'progress_tracking']
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
    
    let markdown = `# Shona Learning Content Integration Report

## Overview
- **Integration Date**: ${new Date(report.timestamp).toLocaleString()}
- **Total Files Processed**: ${Object.keys(report.files).length}
- **Errors**: ${report.errors.length}
- **Warnings**: ${report.warnings.length}

## File Statistics

### Vocabulary
- **Total Words**: ${report.files.vocabulary?.totalWords || 0}
- **Sources**: ${report.files.vocabulary?.sources?.join(', ') || 'None'}

### Lessons
- **Total Lessons**: ${report.files.lessons?.totalLessons || 0}
- **Sources**: ${report.files.lessons?.sources?.join(', ') || 'None'}

### Assessments
- **Total Assessments**: ${report.files.assessments?.totalAssessments || 0}
- **Sources**: ${report.files.assessments?.sources?.join(', ') || 'None'}

## Errors
${report.errors.length > 0 ? report.errors.map(error => `- ${error}`).join('\n') : 'None'}

## Warnings
${report.warnings.length > 0 ? report.warnings.map(warning => `- ${warning}`).join('\n') : 'None'}

## Output Files
- \`vocabulary_unified.json\` - Unified vocabulary for all platforms
- \`lessons_unified.json\` - Unified lessons for all platforms
- \`assessments_unified.json\` - Unified assessments for all platforms
- \`web_content.json\` - Web-optimized content
- \`ios_content.json\` - iOS-optimized content
- \`android_content.json\` - Android-optimized content

## Next Steps
1. Copy platform-specific content files to respective app directories
2. Update app import statements to use new unified content
3. Test content loading on all platforms
4. Verify all vocabulary, lessons, and assessments are accessible

## Platform Features
- **Web**: Search, filter, audio, pronunciation
- **iOS**: Offline, audio, pronunciation, progress tracking
- **Android**: Offline, audio, pronunciation, progress tracking
`;

    return markdown;
  }
}

// Main execution
if (require.main === module) {
  const integrator = new SimpleContentIntegrator();
  integrator.integrateContent()
    .then(() => console.log('🎉 Integration complete!'))
    .catch(console.error);
}

module.exports = SimpleContentIntegrator; 