const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const contentDir = path.join(__dirname, 'content');

console.log('=== EXTRACTING AND SEEDING CONTENT FOR WEB APP ===\n');

// Vocabulary extraction (same as before)
function extractVocabularyFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const items = [];
  const vocabPattern = /\{[^{}]*(?:\{[^{}]*\}[^{}]*)*id:\s*["']([^"']+)["'][^{}]*(?:\{[^{}]*\}[^{}]*)*shona:\s*["']([^"']+)["'][^{}]*(?:\{[^{}]*\}[^{}]*)*english:\s*["']([^"']+)["'][^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gs;
  
  let match;
  while ((match = vocabPattern.exec(content)) !== null) {
    const objStr = match[0];
    const id = match[1];
    const shona = match[2];
    const english = match[3];
    
    const categoryMatch = objStr.match(/category:\s*["']([^"']+)["']/);
    const levelMatch = objStr.match(/level:\s*["']([^"']+)["']/);
    const tonesMatch = objStr.match(/tones:\s*["']([^"']+)["']/);
    const ipaMatch = objStr.match(/ipa:\s*["']([^"']+)["']/);
    const culturalNotesMatch = objStr.match(/cultural_notes:\s*["']([^"']+)["']/);
    const usageNotesMatch = objStr.match(/usage_notes:\s*["']([^"']+)["']/);
    
    items.push({
      id: id,
      shona: shona,
      english: english,
      category: categoryMatch ? categoryMatch[1] : null,
      level: levelMatch ? levelMatch[1] : null,
      tones: tonesMatch ? tonesMatch[1] : null,
      ipa: ipaMatch ? ipaMatch[1] : null,
      culturalNotes: culturalNotesMatch ? culturalNotesMatch[1] : null,
      usageNotes: usageNotesMatch ? usageNotesMatch[1] : null
    });
  }
  
  return items;
}

// Lesson extraction with brace-depth tracking
function extractLessonsFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lessons = [];
  
  // Brace-depth tracking for nested structures
  let depth = 0;
  let currentObj = '';
  let inString = false;
  let stringChar = '';
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const prevChar = i > 0 ? content[i-1] : '';
    
    if (!inString && char === '{') {
      depth++;
      if (depth === 1) currentObj = '';
      currentObj += char;
    } else if (!inString && char === '}') {
      currentObj += char;
      depth--;
      
      if (depth === 0 && currentObj.includes('title:') && currentObj.includes('orderIndex:')) {
        const titleMatch = currentObj.match(/title:\s*["']([^"']+)["']/);
        const descMatch = currentObj.match(/description:\s*["']([^"']+)["']/);
        const catMatch = currentObj.match(/category:\s*["']([^"']+)["']/);
        const orderMatch = currentObj.match(/orderIndex:\s*(\d+)/);
        const idMatch = currentObj.match(/id:\s*["']([^"']+)["']/);
        const levelMatch = currentObj.match(/level:\s*["']([^"']+)["']/);
        
        // Extract exercises
        let exercises = [];
        const exercisesMatch = currentObj.match(/exercises:\s*\[([^\]]+)\]/);
        if (exercisesMatch) {
          // Try to extract exercise objects
          const exPattern = /\{[^{}]*type:\s*["']([^"']+)["'][^{}]*question:\s*["']([^"']+)["'][^{}]*\}/g;
          let exMatch;
          while ((exMatch = exPattern.exec(exercisesMatch[1])) !== null) {
            const correctAnswerMatch = exMatch[0].match(/correctAnswer:\s*["']([^"']+)["']/);
            const optionsMatch = exMatch[0].match(/options:\s*JSON\.stringify\(\[([^\]]+)\]\)/);
            
            exercises.push({
              type: exMatch[1],
              question: exMatch[2],
              correctAnswer: correctAnswerMatch ? correctAnswerMatch[1] : '',
              options: optionsMatch ? JSON.stringify(optionsMatch[1].split(',').map(s => s.trim().replace(/["']/g, ''))) : JSON.stringify([])
            });
          }
        }
        
        if (titleMatch && orderMatch) {
          lessons.push({
            id: idMatch ? idMatch[1] : `lesson-${orderMatch[1]}`,
            title: titleMatch[1],
            description: descMatch ? descMatch[1] : null,
            category: catMatch ? catMatch[1] : 'general',
            level: levelMatch ? levelMatch[1].toLowerCase() : (parseInt(orderMatch[1]) <= 20 ? 'beginner' : parseInt(orderMatch[1]) <= 40 ? 'intermediate' : 'advanced'),
            orderIndex: parseInt(orderMatch[1]),
            xpReward: 50 + (parseInt(orderMatch[1]) * 5),
            estimatedDuration: 20,
            exercises: exercises
          });
        }
        currentObj = '';
      } else if (depth < 0) {
        currentObj = '';
        depth = 0;
      }
    } else {
      if ((char === '"' || char === "'") && prevChar !== '\\') {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = '';
        }
      }
      if (depth > 0) {
        currentObj += char;
      }
    }
  }
  
  // Also handle object structure (lesson_1, lesson_2, etc.)
  const objectPattern = /lesson_\d+:\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/gs;
  let match;
  while ((match = objectPattern.exec(content)) !== null) {
    const objStr = match[1];
    const lessonNumMatch = match[0].match(/lesson_(\d+):/);
    const orderIndex = lessonNumMatch ? parseInt(lessonNumMatch[1]) : null;
    
    const idMatch = objStr.match(/id:\s*["']([^"']+)["']/);
    const titleMatch = objStr.match(/title:\s*["']([^"']+)["']/);
    const descMatch = objStr.match(/description:\s*["']([^"']+)["']/);
    const levelMatch = objStr.match(/level:\s*["']([^"']+)["']/);
    
    if (titleMatch && !lessons.some(l => l.orderIndex === orderIndex)) {
      lessons.push({
        id: idMatch ? idMatch[1] : `lesson-${orderIndex || 'unknown'}`,
        title: titleMatch[1],
        description: descMatch ? descMatch[1] : null,
        category: 'general',
        level: levelMatch ? levelMatch[1].toLowerCase() : (orderIndex && orderIndex <= 20 ? 'beginner' : 'intermediate'),
        orderIndex: orderIndex || 999,
        xpReward: orderIndex ? 50 + (orderIndex * 5) : 50,
        estimatedDuration: 20,
        exercises: []
      });
    }
  }
  
  return lessons;
}

// Extract all content
console.log('1. Extracting vocabulary...\n');
const vocabFiles = [
  'vocabulary/fundamental-basic-vocabulary.js',
  'vocabulary/essential-phrases-expressions.js',
  'vocabulary/essential-verbs-actions.js',
  'vocabulary/traditional-cultural-vocabulary.js',
  'vocabulary/advanced-conversational-vocabulary.js',
  'vocabulary/contemporary-modern-vocabulary.js',
  'vocabulary/professional-technical-vocabulary.js'
];

let allVocabulary = [];
vocabFiles.forEach(file => {
  const filePath = path.join(contentDir, file);
  if (fs.existsSync(filePath)) {
    const items = extractVocabularyFromFile(filePath);
    allVocabulary = allVocabulary.concat(items);
    console.log(`  ✓ ${file}: ${items.length} items`);
  }
});
console.log(`\n   Total: ${allVocabulary.length} vocabulary items\n`);

console.log('2. Extracting lessons...\n');
const lessonFiles = [
  'lesson-plans/foundation-level-lessons.js',
  'lesson-plans/intermediate-level-lessons.js',
  'lesson-plans/advanced-level-lessons.js',
  'lesson-plans/fundamental-basic-lessons.js',
  'lesson-plans/essential-phrases-lessons.js',
  'lesson-plans/essential-verbs-lessons.js',
  'lesson-plans/traditional-cultural-lessons.js',
  'lesson-plans/fluent-conversational-lessons.js',
  'lesson-plans/comprehensive-seed.js',
  'lesson-plans/expanded-comprehensive-seed.js'
];

let allLessons = [];
lessonFiles.forEach(file => {
  const filePath = path.join(contentDir, file);
  if (fs.existsSync(filePath)) {
    const lessons = extractLessonsFromFile(filePath);
    allLessons = allLessons.concat(lessons);
    console.log(`  ✓ ${file}: ${lessons.length} lessons`);
  }
});

// Remove duplicates
const lessonMap = new Map();
allLessons.forEach(lesson => {
  const key = lesson.orderIndex || lesson.id;
  if (!lessonMap.has(key) || !lessonMap.get(key).title) {
    lessonMap.set(key, lesson);
  }
});
allLessons = Array.from(lessonMap.values()).sort((a, b) => 
  (a.orderIndex || 999) - (b.orderIndex || 999)
);
console.log(`\n   Total: ${allLessons.length} unique lessons\n`);

// Save to JSON files
console.log('3. Saving to JSON files...\n');
const vocabPath = path.join(contentDir, 'vocabulary.json');
fs.writeFileSync(vocabPath, JSON.stringify(allVocabulary, null, 2));
console.log(`   ✓ vocabulary.json: ${allVocabulary.length} items`);

const lessonsPath = path.join(contentDir, 'lessons.json');
fs.writeFileSync(lessonsPath, JSON.stringify({ lessons: allLessons }, null, 2));
console.log(`   ✓ lessons.json: ${allLessons.length} lessons\n`);

// Seed database
console.log('4. Seeding database...\n');
async function seedDatabase() {
  try {
    // Clear existing data
    await prisma.exercise.deleteMany();
    await prisma.lesson.deleteMany();
    
    console.log('   Cleared existing lessons and exercises');
    
    // Create lessons
    for (const lessonData of allLessons) {
      const { exercises, ...lesson } = lessonData;
      
      const createdLesson = await prisma.lesson.create({
        data: {
          title: lesson.title,
          description: lesson.description || '',
          category: lesson.category,
          orderIndex: lesson.orderIndex,
          xpReward: lesson.xpReward || 50,
          learningObjectives: lesson.learningObjectives ? JSON.stringify(lesson.learningObjectives) : null,
          discoveryElements: lesson.discoveryElements ? JSON.stringify(lesson.discoveryElements) : null
        }
      });
      
      // Create exercises
      if (exercises && exercises.length > 0) {
        for (const exercise of exercises) {
          await prisma.exercise.create({
            data: {
              type: exercise.type,
              question: exercise.question,
              correctAnswer: exercise.correctAnswer || '',
              options: exercise.options || JSON.stringify([]),
              shonaPhrase: exercise.shonaPhrase || null,
              englishPhrase: exercise.englishPhrase || null,
              audioText: exercise.audioText || null,
              points: exercise.points || 5,
              lessonId: createdLesson.id
            }
          });
        }
      }
    }
    
    console.log(`   ✓ Seeded ${allLessons.length} lessons with exercises\n`);
    console.log('=== SEEDING COMPLETE ===');
    console.log(`Lessons: ${allLessons.length}`);
    console.log(`Vocabulary: ${allVocabulary.length} (saved to JSON)`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
