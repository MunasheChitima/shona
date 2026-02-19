const fs = require('fs');
const path = require('path');

// Topic categories for better navigation
const topicCategories = {
  'Cultural Immersion': {
    description: 'Learn about Shona culture and traditions',
    icon: '🌍',
    color: 'from-green-400 to-green-600',
    lessons: ['lesson-1', 'lesson-2']
  },
  'Basic Vocabulary': {
    description: 'Essential words for everyday communication',
    icon: '🔤',
    color: 'from-blue-400 to-blue-600',
    lessons: ['lesson-3']
  },
  'Body Parts': {
    description: 'Learn body vocabulary for health and description',
    icon: '👤',
    color: 'from-red-400 to-red-600',
    lessons: ['lesson-4', 'lesson-5']
  },
  'Colors': {
    description: 'Color vocabulary for describing the world',
    icon: '🎨',
    color: 'from-purple-400 to-purple-600',
    lessons: ['lesson-6', 'lesson-7']
  },
  'Communication': {
    description: 'Words for expressing thoughts and feelings',
    icon: '💬',
    color: 'from-indigo-400 to-indigo-600',
    lessons: ['lesson-8', 'lesson-9']
  },
  'Family': {
    description: 'Family relationships and kinship terms',
    icon: '👨‍👩‍👧‍👦',
    color: 'from-pink-400 to-pink-600',
    lessons: ['lesson-10', 'lesson-11']
  },
  'Food': {
    description: 'Food and cooking vocabulary',
    icon: '🍽️',
    color: 'from-orange-400 to-orange-600',
    lessons: ['lesson-12', 'lesson-13']
  },
  'Home': {
    description: 'Household and home-related vocabulary',
    icon: '🏠',
    color: 'from-yellow-400 to-yellow-600',
    lessons: ['lesson-14', 'lesson-15']
  },
  'Nature': {
    description: 'Natural world and environment vocabulary',
    icon: '🌿',
    color: 'from-teal-400 to-teal-600',
    lessons: ['lesson-16', 'lesson-17']
  },
  'Numbers': {
    description: 'Counting and numerical vocabulary',
    icon: '🔢',
    color: 'from-cyan-400 to-cyan-600',
    lessons: ['lesson-18', 'lesson-19']
  },
  'Time': {
    description: 'Time expressions and scheduling vocabulary',
    icon: '⏰',
    color: 'from-gray-400 to-gray-600',
    lessons: ['lesson-20', 'lesson-21']
  },
  'Travel': {
    description: 'Transportation and travel vocabulary',
    icon: '✈️',
    color: 'from-emerald-400 to-emerald-600',
    lessons: ['lesson-22', 'lesson-23']
  },
  'Work': {
    description: 'Professional and work-related vocabulary',
    icon: '💼',
    color: 'from-slate-400 to-slate-600',
    lessons: ['lesson-24', 'lesson-25']
  },
  'Advanced': {
    description: 'Advanced vocabulary for fluent speakers',
    icon: '⭐',
    color: 'from-violet-400 to-violet-600',
    lessons: []
  }
};

function enhanceNavigation() {
  console.log('🔄 Enhancing navigation and learning flow...');
  
  const lessonsPath = path.join(__dirname, '..', 'content', 'lessons_consolidated.json');
  const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
  
  let enhancements = 0;
  
  // Add topic-based navigation to lessons
  lessons.lessons.forEach(lesson => {
    // Determine topic category based on lesson content
    let topicCategory = 'Basic Vocabulary';
    
    if (lesson.title.includes('Mhoro') || lesson.title.includes('Name')) {
      topicCategory = 'Cultural Immersion';
    } else if (lesson.title.includes('Body')) {
      topicCategory = 'Body Parts';
    } else if (lesson.title.includes('Color')) {
      topicCategory = 'Colors';
    } else if (lesson.title.includes('Communication')) {
      topicCategory = 'Communication';
    } else if (lesson.title.includes('Family')) {
      topicCategory = 'Family';
    } else if (lesson.title.includes('Food')) {
      topicCategory = 'Food';
    } else if (lesson.title.includes('Home')) {
      topicCategory = 'Home';
    } else if (lesson.title.includes('Nature')) {
      topicCategory = 'Nature';
    } else if (lesson.title.includes('Number')) {
      topicCategory = 'Numbers';
    } else if (lesson.title.includes('Time')) {
      topicCategory = 'Time';
    } else if (lesson.title.includes('Travel')) {
      topicCategory = 'Travel';
    } else if (lesson.title.includes('Work')) {
      topicCategory = 'Work';
    } else if (lesson.title.includes('Advanced')) {
      topicCategory = 'Advanced';
    }
    
    // Add topic navigation metadata
    lesson.topicNavigation = {
      category: topicCategory,
      description: topicCategories[topicCategory]?.description || 'Learn essential Shona vocabulary',
      icon: topicCategories[topicCategory]?.icon || '📚',
      color: topicCategories[topicCategory]?.color || 'from-gray-400 to-gray-600',
      difficulty: lesson.difficulty || 'easy',
      prerequisites: lesson.orderIndex > 1 ? [`lesson-${lesson.orderIndex - 1}`] : [],
      nextLessons: lesson.orderIndex < lessons.lessons.length ? [`lesson-${lesson.orderIndex + 1}`] : []
    };
    
    // Add adaptive learning hints
    lesson.adaptiveLearning = {
      estimatedTime: lesson.estimatedDuration || 15,
      difficulty: lesson.difficulty || 'easy',
      vocabularyCount: lesson.vocabulary?.length || 0,
      exerciseCount: lesson.exercises?.length || 0,
      culturalFocus: lesson.culturalNotes?.length > 0,
      pronunciationFocus: lesson.vocabulary?.some(v => v.pronunciation) || false
    };
    
    enhancements++;
  });
  
  // Add topic categories to metadata
  lessons.metadata.topicCategories = topicCategories;
  lessons.metadata.navigationFeatures = [
    'topic_based_navigation',
    'adaptive_learning_hints',
    'prerequisite_tracking',
    'difficulty_progression',
    'cultural_focus_indicators'
  ];
  
  // Save enhanced lessons
  fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2));
  
  console.log(`✅ Enhanced ${enhancements} lessons with topic navigation`);
  console.log('🧭 Added topic-based navigation system');
  console.log('🎯 Enhanced learning flow completed!');
}

enhanceNavigation(); 