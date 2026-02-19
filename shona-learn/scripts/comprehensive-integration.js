const fs = require('fs');
const path = require('path');

class ComprehensiveIntegrator {
  constructor() {
    this.basePath = __dirname;
    this.contentPath = path.join(this.basePath, '..', 'content');
    this.outputPath = path.join(this.basePath, '..', 'content', 'unified');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputPath)) {
      fs.mkdirSync(this.outputPath, { recursive: true });
    }
    
    this.integrationReport = {
      timestamp: new Date().toISOString(),
      vocabulary: { total: 0, modules: [] },
      lessons: { total: 0, modules: [] },
      errors: [],
      warnings: []
    };
  }

  async run() {
    console.log('🚀 Starting comprehensive Shona content integration...\n');
    
    try {
      await this.integrateVocabulary();
      await this.integrateLessons();
      await this.createEnhancedLessons();
      await this.generateReport();
      
      console.log('\n✅ Comprehensive integration complete!');
      console.log(`📊 Vocabulary: ${this.integrationReport.vocabulary.total} words`);
      console.log(`📚 Lessons: ${this.integrationReport.lessons.total} lessons`);
    } catch (error) {
      console.error('❌ Integration failed:', error);
      this.integrationReport.errors.push(error.message);
    }
  }

  async integrateVocabulary() {
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

    const allVocabulary = [];
    
    for (const moduleFile of vocabularyModules) {
      try {
        const modulePath = path.join(this.contentPath, 'vocabulary', moduleFile);
        
        if (!fs.existsSync(modulePath)) {
          console.warn(`⚠️  Vocabulary module not found: ${moduleFile}`);
          this.integrationReport.warnings.push(`Vocabulary module not found: ${moduleFile}`);
          continue;
        }

        // Read and parse the module
        const moduleContent = fs.readFileSync(modulePath, 'utf8');
        const extractedVocabulary = this.extractVocabularyFromModule(moduleContent, moduleFile);
        
        if (extractedVocabulary.length > 0) {
          allVocabulary.push(...extractedVocabulary);
          console.log(`✅ ${moduleFile}: ${extractedVocabulary.length} words`);
          this.integrationReport.vocabulary.modules.push({
            name: moduleFile,
            count: extractedVocabulary.length
          });
        } else {
          console.warn(`⚠️  No vocabulary found in ${moduleFile}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${moduleFile}:`, error.message);
        this.integrationReport.errors.push(`Error processing ${moduleFile}: ${error.message}`);
      }
    }

    // Remove duplicates and create unified vocabulary
    const uniqueVocabulary = this.removeDuplicateVocabulary(allVocabulary);
    this.integrationReport.vocabulary.total = uniqueVocabulary.length;

    // Save unified vocabulary
    const unifiedVocabulary = {
      metadata: {
        version: '3.0.0',
        integratedAt: new Date().toISOString(),
        totalWords: uniqueVocabulary.length,
        sources: vocabularyModules,
        categories: [...new Set(uniqueVocabulary.map(v => v.category))],
        difficultyLevels: [...new Set(uniqueVocabulary.map(v => v.difficulty).filter(Boolean))]
      },
      vocabulary: uniqueVocabulary
    };

    fs.writeFileSync(
      path.join(this.outputPath, 'vocabulary_unified.json'),
      JSON.stringify(unifiedVocabulary, null, 2)
    );

    console.log(`📊 Total vocabulary integrated: ${uniqueVocabulary.length} words\n`);
  }

  extractVocabularyFromModule(moduleContent, moduleName) {
    const vocabulary = [];
    
    // Extract vocabulary from different module structures
    const patterns = [
      // Pattern for fundamental-basic-vocabulary.js
      /(\w+):\s*\[([\s\S]*?)\]/g,
      // Pattern for other modules
      /(\w+):\s*\{([\s\S]*?)\}/g
    ];

    for (const pattern of patterns) {
      const matches = moduleContent.matchAll(pattern);
      
      for (const match of matches) {
        const category = match[1];
        const content = match[2];
        
        // Extract individual vocabulary items
        const itemMatches = content.matchAll(/\{[^}]*"shona"[^}]*\}/g);
        
        for (const itemMatch of itemMatches) {
          try {
            // Clean up the JSON-like structure
            let itemText = itemMatch[0];
            itemText = itemText.replace(/(\w+):/g, '"$1":');
            itemText = itemText.replace(/'/g, '"');
            
            const item = JSON.parse(itemText);
            
            if (item.shona && item.english) {
              vocabulary.push({
                id: `${moduleName}_${item.shona}_${Date.now()}`,
                shona: item.shona,
                english: item.english,
                category: item.category || category,
                difficulty: item.difficulty || 1,
                tones: item.tones || '',
                ipa: item.ipa || '',
                pronunciation: item.pronunciation || '',
                source: moduleName,
                integrated: true,
                ...item
              });
            }
          } catch (error) {
            // Skip malformed items
            continue;
          }
        }
      }
    }

    return vocabulary;
  }

  removeDuplicateVocabulary(vocabulary) {
    const seen = new Set();
    return vocabulary.filter(item => {
      const key = item.shona.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async integrateLessons() {
    console.log('📖 Integrating lesson plans...');
    
    const lessonModules = [
      'fundamental-basic-lessons.js',
      'traditional-cultural-lessons.js',
      'essential-verbs-lessons.js',
      'essential-phrases-lessons.js'
    ];

    const allLessons = [];
    
    for (const moduleFile of lessonModules) {
      try {
        const modulePath = path.join(this.contentPath, 'lesson-plans', moduleFile);
        
        if (!fs.existsSync(modulePath)) {
          console.warn(`⚠️  Lesson module not found: ${moduleFile}`);
          this.integrationReport.warnings.push(`Lesson module not found: ${moduleFile}`);
          continue;
        }

        const moduleContent = fs.readFileSync(modulePath, 'utf8');
        const extractedLessons = this.extractLessonsFromModule(moduleContent, moduleFile);
        
        if (extractedLessons.length > 0) {
          allLessons.push(...extractedLessons);
          console.log(`✅ ${moduleFile}: ${extractedLessons.length} lessons`);
          this.integrationReport.lessons.modules.push({
            name: moduleFile,
            count: extractedLessons.length
          });
        } else {
          console.warn(`⚠️  No lessons found in ${moduleFile}`);
        }
      } catch (error) {
        console.error(`❌ Error processing ${moduleFile}:`, error.message);
        this.integrationReport.errors.push(`Error processing ${moduleFile}: ${error.message}`);
      }
    }

    this.integrationReport.lessons.total = allLessons.length;

    // Save unified lessons
    const unifiedLessons = {
      metadata: {
        version: '3.0.0',
        integratedAt: new Date().toISOString(),
        totalLessons: allLessons.length,
        sources: lessonModules,
        categories: [...new Set(allLessons.map(l => l.category))],
        levels: [...new Set(allLessons.map(l => l.level))]
      },
      lessons: allLessons
    };

    fs.writeFileSync(
      path.join(this.outputPath, 'lessons_unified.json'),
      JSON.stringify(unifiedLessons, null, 2)
    );

    console.log(`📊 Total lessons integrated: ${allLessons.length} lessons\n`);
  }

  extractLessonsFromModule(moduleContent, moduleName) {
    const lessons = [];
    
    // Extract lesson objects
    const lessonMatches = moduleContent.matchAll(/lesson_\d+:\s*\{([\s\S]*?)\}/g);
    
    for (const match of lessonMatches) {
      try {
        const lessonContent = match[0];
        
        // Extract lesson ID
        const idMatch = lessonContent.match(/lesson_(\d+):/);
        const lessonNumber = idMatch ? idMatch[1] : 'unknown';
        
        // Extract basic lesson info
        const titleMatch = lessonContent.match(/"title":\s*"([^"]+)"/);
        const levelMatch = lessonContent.match(/"level":\s*"([^"]+)"/);
        const durationMatch = lessonContent.match(/"duration":\s*"([^"]+)"/);
        
        // Extract vocabulary focus
        const vocabMatches = lessonContent.match(/"vocabulary_focus":\s*\[([\s\S]*?)\]/);
        let vocabulary = [];
        
        if (vocabMatches) {
          const vocabContent = vocabMatches[1];
          const vocabItems = vocabContent.match(/"([^"]+)\s*\([^)]+\)"/g);
          
          if (vocabItems) {
            vocabulary = vocabItems.map(item => {
              const wordMatch = item.match(/"([^"]+)\s*\([^)]+\)"/);
              const englishMatch = item.match(/\(([^)]+)\)/);
              
              return {
                shona: wordMatch ? wordMatch[1].trim() : '',
                english: englishMatch ? englishMatch[1].trim() : '',
                pronunciation: '',
                phonetic: '',
                syllables: '',
                tonePattern: '',
                audioFile: '',
                usage: '',
                example: '',
                culturalContext: ''
              };
            }).filter(v => v.shona && v.english);
          }
        }

        if (titleMatch) {
          lessons.push({
            id: `${moduleName}_lesson_${lessonNumber}`,
            title: titleMatch[1],
            description: `Lesson from ${moduleName}`,
            category: 'Integrated',
            level: levelMatch ? levelMatch[1] : 'beginner',
            difficulty: 'easy',
            xpReward: 50,
            estimatedDuration: durationMatch ? parseInt(durationMatch[1]) : 15,
            vocabulary: vocabulary,
            source: moduleName,
            integrated: true
          });
        }
      } catch (error) {
        console.warn(`⚠️  Error extracting lesson from ${moduleName}:`, error.message);
        continue;
      }
    }

    return lessons;
  }

  async createEnhancedLessons() {
    console.log('🎯 Creating enhanced lessons with comprehensive vocabulary...');
    
    // Read the unified vocabulary
    const vocabularyPath = path.join(this.outputPath, 'vocabulary_unified.json');
    if (!fs.existsSync(vocabularyPath)) {
      console.warn('⚠️  No unified vocabulary found, skipping enhanced lessons');
      return;
    }

    const vocabularyData = JSON.parse(fs.readFileSync(vocabularyPath, 'utf8'));
    const allVocabulary = vocabularyData.vocabulary;

    // Group vocabulary by category
    const vocabularyByCategory = {};
    allVocabulary.forEach(item => {
      if (!vocabularyByCategory[item.category]) {
        vocabularyByCategory[item.category] = [];
      }
      vocabularyByCategory[item.category].push(item);
    });

    // Create enhanced lessons for each category
    const enhancedLessons = [];
    let lessonCounter = 1;

    for (const [category, words] of Object.entries(vocabularyByCategory)) {
      // Split large categories into multiple lessons
      const wordsPerLesson = 10;
      const lessonCount = Math.ceil(words.length / wordsPerLesson);

      for (let i = 0; i < lessonCount; i++) {
        const lessonWords = words.slice(i * wordsPerLesson, (i + 1) * wordsPerLesson);
        
        const lesson = {
          id: `enhanced_lesson_${lessonCounter}`,
          title: `${category.charAt(0).toUpperCase() + category.slice(1)} - Part ${i + 1}`,
          description: `Learn essential ${category} vocabulary in Shona`,
          questId: `quest-${category}`,
          category: category,
          orderIndex: lessonCounter,
          level: 'beginner',
          difficulty: 'easy',
          xpReward: 50,
          estimatedDuration: 15,
          emoji: this.getCategoryEmoji(category),
          colorScheme: this.getCategoryColor(category),
          learningObjectives: [
            `Master ${lessonWords.length} ${category} words in Shona`,
            'Practice proper pronunciation with audio feedback',
            'Use vocabulary in contextual sentences',
            'Understand cultural context where applicable'
          ],
          discoveryElements: [
            `Explore ${category} vocabulary in daily contexts`,
            'Discover pronunciation patterns and tone variations',
            'Learn cultural significance of vocabulary items'
          ],
          culturalNotes: [
            'Shona language reflects cultural values and traditions',
            'Proper pronunciation shows respect for the language',
            'Vocabulary connects to traditional and modern life'
          ],
          vocabulary: lessonWords.map(word => ({
            shona: word.shona,
            english: word.english,
            pronunciation: word.pronunciation || word.simplified || '',
            phonetic: word.ipa || '',
            syllables: '',
            tonePattern: word.tones || '',
            audioFile: word.audioFile || `${word.shona}.mp3`,
            usage: word.usage_notes || '',
            example: word.examples ? word.examples[0]?.shona : '',
            culturalContext: word.cultural_notes || ''
          })),
          exercises: this.generateExercises(lessonWords),
          source: 'enhanced',
          integrated: true
        };

        enhancedLessons.push(lesson);
        lessonCounter++;
      }
    }

    // Save enhanced lessons
    const enhancedLessonsData = {
      metadata: {
        version: '3.0.0',
        created: new Date().toISOString(),
        totalLessons: enhancedLessons.length,
        source: 'vocabulary_integration',
        description: 'Enhanced lessons created from comprehensive vocabulary'
      },
      lessons: enhancedLessons
    };

    fs.writeFileSync(
      path.join(this.outputPath, 'lessons_enhanced_comprehensive.json'),
      JSON.stringify(enhancedLessonsData, null, 2)
    );

    console.log(`✅ Created ${enhancedLessons.length} enhanced lessons\n`);
  }

  getCategoryEmoji(category) {
    const emojiMap = {
      'basic': '🔤',
      'greetings': '👋',
      'family': '👨‍👩‍👧‍👦',
      'food': '🍽️',
      'colors': '🎨',
      'numbers': '🔢',
      'time': '⏰',
      'body': '👤',
      'animals': '🐾',
      'nature': '🌿',
      'work': '💼',
      'communication': '💬',
      'culture': '🏛️',
      'verbs': '🏃',
      'expressions': '💭'
    };
    return emojiMap[category] || '📚';
  }

  getCategoryColor(category) {
    const colorMap = {
      'basic': { primary: '#10b981', secondary: '#6ee7b7', gradient: 'from-green-400 to-green-600' },
      'greetings': { primary: '#3b82f6', secondary: '#93c5fd', gradient: 'from-blue-400 to-blue-600' },
      'family': { primary: '#8b5cf6', secondary: '#c4b5fd', gradient: 'from-purple-400 to-purple-600' },
      'food': { primary: '#f59e0b', secondary: '#fcd34d', gradient: 'from-yellow-400 to-yellow-600' },
      'colors': { primary: '#ec4899', secondary: '#f9a8d4', gradient: 'from-pink-400 to-pink-600' },
      'numbers': { primary: '#06b6d4', secondary: '#67e8f9', gradient: 'from-cyan-400 to-cyan-600' },
      'time': { primary: '#84cc16', secondary: '#bef264', gradient: 'from-lime-400 to-lime-600' },
      'body': { primary: '#ef4444', secondary: '#fca5a5', gradient: 'from-red-400 to-red-600' },
      'animals': { primary: '#a855f7', secondary: '#d8b4fe', gradient: 'from-violet-400 to-violet-600' },
      'nature': { primary: '#22c55e', secondary: '#86efac', gradient: 'from-green-400 to-green-600' },
      'work': { primary: '#f97316', secondary: '#fdba74', gradient: 'from-orange-400 to-orange-600' },
      'communication': { primary: '#6366f1', secondary: '#a5b4fc', gradient: 'from-indigo-400 to-indigo-600' },
      'culture': { primary: '#dc2626', secondary: '#fca5a5', gradient: 'from-red-400 to-red-600' },
      'verbs': { primary: '#0891b2', secondary: '#67e8f9', gradient: 'from-sky-400 to-sky-600' },
      'expressions': { primary: '#7c3aed', secondary: '#c4b5fd', gradient: 'from-violet-400 to-violet-600' }
    };
    return colorMap[category] || { primary: '#6b7280', secondary: '#d1d5db', gradient: 'from-gray-400 to-gray-600' };
  }

  generateExercises(vocabulary) {
    const exercises = [];
    
    vocabulary.forEach((word, index) => {
      // Multiple choice exercise
      exercises.push({
        id: `ex-${index + 1}-1`,
        type: 'multiple_choice',
        question: `What does '${word.shona}' mean?`,
        correctAnswer: word.english,
        options: [word.english, 'Incorrect option 1', 'Incorrect option 2', 'Incorrect option 3'],
        points: 10,
        audioText: word.shona,
        pronunciation: word.pronunciation
      });

      // Pronunciation exercise
      if (word.pronunciation) {
        exercises.push({
          id: `ex-${index + 1}-2`,
          type: 'pronunciation',
          question: `Practice saying '${word.shona}' (${word.english})`,
          targetWord: word.shona,
          pronunciation: word.pronunciation,
          phonetic: word.phonetic,
          points: 15,
          audioFile: word.audioFile
        });
      }
    });

    return exercises;
  }

  async generateReport() {
    console.log('📋 Generating integration report...');
    
    const reportPath = path.join(this.outputPath, 'integration_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.integrationReport, null, 2));
    
    console.log('✅ Integration report generated');
  }
}

// Run the integration
const integrator = new ComprehensiveIntegrator();
integrator.run().catch(console.error); 