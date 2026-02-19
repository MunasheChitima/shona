const fs = require('fs');
const path = require('path');

// Exercise explanations for incorrect answers
const exerciseExplanations = {
  'hongu': {
    correct: 'Excellent! "Hongu" means "yes" in Shona. It\'s used to agree or confirm something politely.',
    incorrect: 'Remember: "Hongu" means "yes". It\'s a polite way to agree in Shona culture.'
  },
  'kwete': {
    correct: 'Perfect! "Kwete" means "no" in Shona. It\'s used respectfully to disagree or decline.',
    incorrect: 'Think again: "Kwete" means "no". It\'s a polite way to disagree in Shona culture.'
  },
  'mhoro': {
    correct: 'Great! "Mhoro" is a casual greeting meaning "hello" in Shona.',
    incorrect: 'Remember: "Mhoro" is a greeting meaning "hello". Use it with friends and family.'
  },
  'shamwari': {
    correct: 'Excellent! "Shamwari" means "friend" and represents deep friendship in Shona culture.',
    incorrect: 'Think about it: "Shamwari" means "friend" - someone you trust and care about.'
  },
  'zita': {
    correct: 'Perfect! "Zita" means "name" and is essential for introductions in Shona.',
    incorrect: 'Remember: "Zita" means "name". It\'s important for getting to know someone.'
  },
  'baba': {
    correct: 'Excellent! "Baba" means "father" and shows respect for male elders.',
    incorrect: 'Think again: "Baba" means "father" - a term of respect for male elders.'
  },
  'amai': {
    correct: 'Great! "Amai" means "mother" and shows respect for female elders.',
    incorrect: 'Remember: "Amai" means "mother" - a term of respect for female elders.'
  },
  'sekuru': {
    correct: 'Perfect! "Sekuru" means "grandfather" and shows respect for elder wisdom.',
    incorrect: 'Think about it: "Sekuru" means "grandfather" - a respected elder in the family.'
  },
  'ambuya': {
    correct: 'Excellent! "Ambuya" means "grandmother" and honors elder wisdom.',
    incorrect: 'Remember: "Ambuya" means "grandmother" - a treasured elder in the family.'
  },
  'dumbu': {
    correct: 'Great! "Dumbu" means "stomach" and is important for health discussions.',
    incorrect: 'Think again: "Dumbu" means "stomach" - important for describing health.'
  },
  'manzino': {
    correct: 'Perfect! "Manzino" means "teeth" and is important for dental health.',
    incorrect: 'Remember: "Manzino" means "teeth" - important for dental care discussions.'
  },
  'maoko': {
    correct: 'Excellent! "Maoko" means "hands" and are important for work and greetings.',
    incorrect: 'Think about it: "Maoko" means "hands" - used for work, greetings, and cultural activities.'
  }
};

// Enhanced exercise types
const enhancedExerciseTypes = {
  'multiple_choice': 'multiple_choice',
  'pronunciation': 'pronunciation',
  'translation': 'translation',
  'cultural_context': 'cultural_context',
  'fill_in_blank': 'fill_in_blank',
  'matching': 'matching',
  'listening': 'listening'
};

// Add explanations and improve exercises
function enhanceExercises() {
  const lessonsPath = path.join(__dirname, '..', 'content', 'lessons_enhanced.json');
  const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
  
  let enhancements = 0;
  
  lessons.lessons.forEach(lesson => {
    lesson.exercises?.forEach(exercise => {
      // Add explanations for correct/incorrect answers
      const wordKey = exercise.audioText || exercise.targetWord || exercise.correctAnswer?.toLowerCase();
      if (exerciseExplanations[wordKey]) {
        exercise.explanation = exerciseExplanations[wordKey];
        enhancements++;
      }
      
      // Add retry mechanism hint
      if (!exercise.retryHint) {
        exercise.retryHint = 'Don\'t worry! Learning takes practice. Try again and remember the cultural context.';
        enhancements++;
      }
      
      // Add difficulty indicator
      if (!exercise.difficulty) {
        exercise.difficulty = lesson.difficulty || 'easy';
        enhancements++;
      }
      
      // Add cultural context for exercises
      if (!exercise.culturalNote && lesson.culturalNotes?.length > 0) {
        exercise.culturalNote = lesson.culturalNotes[0];
        enhancements++;
      }
    });
  });
  
  // Save enhanced content
  fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2));
  
  console.log(`✅ Enhanced ${enhancements} exercise items`);
  console.log('🎯 User experience enhancements completed!');
}

enhanceExercises(); 