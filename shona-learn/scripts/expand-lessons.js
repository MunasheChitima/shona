const fs = require('fs');
const path = require('path');

class LessonExpander {
  constructor() {
    this.basePath = __dirname;
    this.contentPath = path.join(this.basePath, '..', 'content');
    this.outputPath = path.join(this.basePath, '..', 'content');
  }

  async run() {
    console.log('🚀 Expanding lessons with comprehensive vocabulary coverage...\n');
    
    try {
      // Read existing data
      const flashcards = this.readFlashcards();
      const existingLessons = this.readExistingLessons();
      
      console.log(`📚 Found ${flashcards.length} flashcards`);
      console.log(`📖 Found ${existingLessons.length} existing lessons`);
      
      // Group flashcards by category
      const flashcardsByCategory = this.groupFlashcardsByCategory(flashcards);
      
      // Create comprehensive lessons
      const comprehensiveLessons = this.createComprehensiveLessons(flashcardsByCategory, existingLessons);
      
      // Save enhanced lessons
      this.saveEnhancedLessons(comprehensiveLessons);
      
      // Update the main lessons file
      this.updateMainLessonsFile(comprehensiveLessons);
      
      console.log('\n✅ Lesson expansion complete!');
      console.log(`📊 Total lessons created: ${comprehensiveLessons.length}`);
      console.log(`📚 Vocabulary coverage: ${this.calculateCoverage(flashcards, comprehensiveLessons)}%`);
      
    } catch (error) {
      console.error('❌ Expansion failed:', error);
    }
  }

  readFlashcards() {
    const flashcardsPath = path.join(this.contentPath, 'flashcards.json');
    const data = JSON.parse(fs.readFileSync(flashcardsPath, 'utf8'));
    return data.flashcards || [];
  }

  readExistingLessons() {
    const lessonsPath = path.join(this.contentPath, 'lessons_enhanced.json');
    const data = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
    return data.lessons || [];
  }

  groupFlashcardsByCategory(flashcards) {
    const grouped = {};
    
    flashcards.forEach(card => {
      const category = card.category || 'basic';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(card);
    });
    
    return grouped;
  }

  createComprehensiveLessons(flashcardsByCategory, existingLessons) {
    const comprehensiveLessons = [...existingLessons];
    let lessonCounter = existingLessons.length + 1;

    // Create lessons for each category
    for (const [category, cards] of Object.entries(flashcardsByCategory)) {
      // Skip categories that are already covered in existing lessons
      const existingCategoryCards = this.getCardsInExistingLessons(cards, existingLessons);
      const remainingCards = cards.filter(card => 
        !existingCategoryCards.some(existing => existing.shona === card.shona)
      );

      if (remainingCards.length === 0) {
        console.log(`✅ Category '${category}' already fully covered in existing lessons`);
        continue;
      }

      // Split large categories into multiple lessons
      const wordsPerLesson = 8;
      const lessonCount = Math.ceil(remainingCards.length / wordsPerLesson);

      for (let i = 0; i < lessonCount; i++) {
        const lessonCards = remainingCards.slice(i * wordsPerLesson, (i + 1) * wordsPerLesson);
        
        const lesson = this.createLessonFromCards(lessonCards, category, lessonCounter, i + 1, lessonCount);
        comprehensiveLessons.push(lesson);
        lessonCounter++;
      }
    }

    return comprehensiveLessons;
  }

  getCardsInExistingLessons(cards, existingLessons) {
    const existingCards = [];
    existingLessons.forEach(lesson => {
      if (lesson.vocabulary) {
        lesson.vocabulary.forEach(vocab => {
          const matchingCard = cards.find(card => card.shona === vocab.shona);
          if (matchingCard) {
            existingCards.push(matchingCard);
          }
        });
      }
    });
    return existingCards;
  }

  createLessonFromCards(cards, category, lessonNumber, partNumber, totalParts) {
    const categoryNames = {
      'basic': 'Basic Vocabulary',
      'body': 'Body Parts',
      'colors': 'Colors',
      'communication': 'Communication',
      'community': 'Community',
      'education': 'Education',
      'family': 'Family',
      'greetings': 'Greetings',
      'life_events': 'Life Events',
      'numbers': 'Numbers',
      'questions': 'Questions',
      'time': 'Time',
      'verbs': 'Verbs',
      'work': 'Work',
      'animals': 'Animals',
      'commerce': 'Commerce',
      'culture': 'Culture',
      'expressions': 'Expressions',
      'food': 'Food',
      'health': 'Health',
      'nature': 'Nature',
      'pronouns': 'Pronouns',
      'religion': 'Religion',
      'transport': 'Transport',
      'ceremony': 'Ceremony',
      'history': 'History',
      'liberation': 'Liberation',
      'proverbs': 'Proverbs',
      'values': 'Values',
      'wisdom': 'Wisdom',
      'archaeology': 'Archaeology',
      'architecture': 'Architecture',
      'trade': 'Trade',
      'celebration': 'Celebration',
      'advanced': 'Advanced'
    };

    const categoryName = categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    const title = totalParts > 1 ? `${categoryName} - Part ${partNumber}` : categoryName;

    return {
      id: `lesson-${lessonNumber}`,
      title: title,
      description: `Learn essential ${category} vocabulary in Shona${totalParts > 1 ? ` (Part ${partNumber} of ${totalParts})` : ''}`,
      questId: `quest-${category}`,
      category: categoryName,
      orderIndex: lessonNumber,
      level: 'beginner',
      difficulty: 'easy',
      xpReward: 50,
      estimatedDuration: 15,
      emoji: this.getCategoryEmoji(category),
      colorScheme: this.getCategoryColor(category),
      learningObjectives: [
        `Master ${cards.length} ${category} words in Shona`,
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
      vocabulary: cards.map(card => ({
        shona: card.shona,
        english: card.english,
        pronunciation: card.pronunciation || '',
        phonetic: card.ipa || '',
        syllables: '',
        tonePattern: card.tones || '',
        audioFile: card.audioFile || `${card.shona}.mp3`,
        usage: '',
        example: card.example || '',
        culturalContext: ''
      })),
      exercises: this.generateExercises(cards),
      source: 'expanded',
      integrated: true
    };
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
      'expressions': '💭',
      'education': '📚',
      'community': '🏘️',
      'life_events': '🎉',
      'questions': '❓',
      'commerce': '💰',
      'health': '🏥',
      'pronouns': '👤',
      'religion': '⛪',
      'transport': '🚗',
      'ceremony': '🎭',
      'history': '📜',
      'liberation': '🕊️',
      'proverbs': '💡',
      'values': '❤️',
      'wisdom': '🧠',
      'archaeology': '🏺',
      'architecture': '🏗️',
      'trade': '🤝',
      'celebration': '🎊',
      'advanced': '⭐'
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
      'expressions': { primary: '#7c3aed', secondary: '#c4b5fd', gradient: 'from-violet-400 to-violet-600' },
      'education': { primary: '#059669', secondary: '#6ee7b7', gradient: 'from-emerald-400 to-emerald-600' },
      'community': { primary: '#7c2d12', secondary: '#fbbf24', gradient: 'from-amber-400 to-amber-600' },
      'life_events': { primary: '#be185d', secondary: '#f9a8d4', gradient: 'from-pink-400 to-pink-600' },
      'questions': { primary: '#1e40af', secondary: '#93c5fd', gradient: 'from-blue-400 to-blue-600' },
      'commerce': { primary: '#166534', secondary: '#86efac', gradient: 'from-green-400 to-green-600' },
      'health': { primary: '#dc2626', secondary: '#fca5a5', gradient: 'from-red-400 to-red-600' },
      'pronouns': { primary: '#7c3aed', secondary: '#c4b5fd', gradient: 'from-violet-400 to-violet-600' },
      'religion': { primary: '#92400e', secondary: '#fbbf24', gradient: 'from-amber-400 to-amber-600' },
      'transport': { primary: '#1e293b', secondary: '#94a3b8', gradient: 'from-slate-400 to-slate-600' },
      'ceremony': { primary: '#be185d', secondary: '#f9a8d4', gradient: 'from-pink-400 to-pink-600' },
      'history': { primary: '#92400e', secondary: '#fbbf24', gradient: 'from-amber-400 to-amber-600' },
      'liberation': { primary: '#059669', secondary: '#6ee7b7', gradient: 'from-emerald-400 to-emerald-600' },
      'proverbs': { primary: '#7c2d12', secondary: '#fbbf24', gradient: 'from-amber-400 to-amber-600' },
      'values': { primary: '#dc2626', secondary: '#fca5a5', gradient: 'from-red-400 to-red-600' },
      'wisdom': { primary: '#1e40af', secondary: '#93c5fd', gradient: 'from-blue-400 to-blue-600' },
      'archaeology': { primary: '#92400e', secondary: '#fbbf24', gradient: 'from-amber-400 to-amber-600' },
      'architecture': { primary: '#1e293b', secondary: '#94a3b8', gradient: 'from-slate-400 to-slate-600' },
      'trade': { primary: '#166534', secondary: '#86efac', gradient: 'from-green-400 to-green-600' },
      'celebration': { primary: '#be185d', secondary: '#f9a8d4', gradient: 'from-pink-400 to-pink-600' },
      'advanced': { primary: '#7c3aed', secondary: '#c4b5fd', gradient: 'from-violet-400 to-violet-600' }
    };
    return colorMap[category] || { primary: '#6b7280', secondary: '#d1d5db', gradient: 'from-gray-400 to-gray-600' };
  }

  generateExercises(cards) {
    const exercises = [];
    
    cards.forEach((card, index) => {
      // Multiple choice exercise
      exercises.push({
        id: `ex-${index + 1}-1`,
        type: 'multiple_choice',
        question: `What does '${card.shona}' mean?`,
        correctAnswer: card.english,
        options: [card.english, 'Incorrect option 1', 'Incorrect option 2', 'Incorrect option 3'],
        points: 10,
        audioText: card.shona,
        pronunciation: card.pronunciation
      });

      // Pronunciation exercise
      if (card.pronunciation) {
        exercises.push({
          id: `ex-${index + 1}-2`,
          type: 'pronunciation',
          question: `Practice saying '${card.shona}' (${card.english})`,
          targetWord: card.shona,
          pronunciation: card.pronunciation,
          phonetic: card.ipa,
          points: 15,
          audioFile: card.audioFile
        });
      }
    });

    return exercises;
  }

  saveEnhancedLessons(lessons) {
    const enhancedData = {
      metadata: {
        version: '3.0.0',
        created: new Date().toISOString(),
        totalLessons: lessons.length,
        source: 'flashcard_expansion',
        description: 'Comprehensive lessons created from flashcard vocabulary'
      },
      lessons: lessons
    };

    const outputPath = path.join(this.outputPath, 'lessons_comprehensive.json');
    fs.writeFileSync(outputPath, JSON.stringify(enhancedData, null, 2));
    console.log(`✅ Saved comprehensive lessons to lessons_comprehensive.json`);
  }

  updateMainLessonsFile(lessons) {
    const mainLessonsPath = path.join(this.contentPath, 'lessons_enhanced.json');
    const existingData = JSON.parse(fs.readFileSync(mainLessonsPath, 'utf8'));
    
    existingData.lessons = lessons;
    existingData.metadata = {
      ...existingData.metadata,
      version: '3.0.0',
      lastUpdated: new Date().toISOString(),
      totalLessons: lessons.length,
      description: 'Comprehensive lessons with full vocabulary coverage'
    };

    fs.writeFileSync(mainLessonsPath, JSON.stringify(existingData, null, 2));
    console.log(`✅ Updated main lessons file with ${lessons.length} lessons`);
  }

  calculateCoverage(flashcards, lessons) {
    const lessonWords = new Set();
    lessons.forEach(lesson => {
      if (lesson.vocabulary) {
        lesson.vocabulary.forEach(vocab => {
          lessonWords.add(vocab.shona.toLowerCase().trim());
        });
      }
    });

    const flashcardWords = new Set(flashcards.map(card => card.shona.toLowerCase().trim()));
    const coveredWords = new Set([...lessonWords].filter(word => flashcardWords.has(word)));
    
    return Math.round((coveredWords.size / flashcardWords.size) * 100);
  }
}

// Run the expansion
const expander = new LessonExpander();
expander.run().catch(console.error); 