const fs = require('fs');
const path = require('path');
const vm = require('vm');

const contentDir = '/workspace/shona-learn/content';
const outputDir = '/workspace/Ios/Shona App/Shona App/Content';

console.log('=== COMPREHENSIVE SHONA CONTENT EXTRACTION ===\n');

// 1. Extract ALL vocabulary from JS files
console.log('1. Extracting vocabulary...');
const vocabFiles = [
  'vocabulary/fundamental-basic-vocabulary.js',
  'vocabulary/essential-phrases-expressions.js',
  'vocabulary/essential-verbs-actions.js',
  'vocabulary/traditional-cultural-vocabulary.js',
  'vocabulary/advanced-conversational-vocabulary.js',
  'vocabulary/contemporary-modern-vocabulary.js',
  'vocabulary/professional-technical-vocabulary.js'
];

function extractAllVocabulary() {
  let allVocab = [];
  
  vocabFiles.forEach(file => {
    const filePath = path.join(contentDir, file);
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract all objects with id, shona, and english fields
    const vocabPattern = /\{\s*id:\s*["']([^"']+)["'][\s\S]*?shona:\s*["']([^"']+)["'][\s\S]*?english:\s*["']([^"']+)["'][\s\S]*?\}/g;
    
    let match;
    while ((match = vocabPattern.exec(content)) !== null) {
      const objStr = match[0];
      
      // Extract key fields
      const id = match[1];
      const shona = match[2];
      const english = match[3];
      
      // Extract additional fields
      const categoryMatch = objStr.match(/category:\s*["']([^"']+)["']/);
      const levelMatch = objStr.match(/level:\s*["']([^"']+)["']/);
      const tonesMatch = objStr.match(/tones:\s*["']([^"']+)["']/);
      const ipaMatch = objStr.match(/ipa:\s*["']([^"']+)["']/);
      
      const item = {
        id: id,
        shona: shona,
        english: english,
        category: categoryMatch ? categoryMatch[1] : null,
        level: levelMatch ? levelMatch[1] : null,
        tones: tonesMatch ? tonesMatch[1] : null,
        ipa: ipaMatch ? ipaMatch[1] : null
      };
      
      allVocab.push(item);
    }
  });
  
  return allVocab;
}

const allVocabulary = extractAllVocabulary();
console.log(`   Extracted ${allVocabulary.length} vocabulary items`);

// 2. Extract ALL lessons from lesson plan files
console.log('\n2. Extracting lessons...');
const lessonFiles = [
  'lesson-plans/foundation-level-lessons.js',
  'lesson-plans/intermediate-level-lessons.js',
  'lesson-plans/advanced-level-lessons.js',
  'lesson-plans/fundamental-basic-lessons.js',
  'lesson-plans/essential-phrases-lessons.js',
  'lesson-plans/essential-verbs-lessons.js',
  'lesson-plans/traditional-cultural-lessons.js',
  'lesson-plans/fluent-conversational-lessons.js'
];

function extractAllLessons() {
  let allLessons = [];
  let lessonId = 1;
  
  lessonFiles.forEach(file => {
    const filePath = path.join(contentDir, file);
    if (!fs.existsSync(filePath)) return;
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract lesson objects (they have title, description, category, orderIndex)
    const lessonPattern = /\{\s*title:\s*["']([^"']+)["'][\s\S]*?description:\s*["']([^"']+)["'][\s\S]*?category:\s*["']([^"']+)["'][\s\S]*?orderIndex:\s*(\d+)[\s\S]*?\}/g;
    
    let match;
    while ((match = lessonPattern.exec(content)) !== null) {
      const objStr = match[0];
      
      const title = match[1];
      const description = match[2];
      const category = match[3];
      const orderIndex = parseInt(match[4]);
      
      // Extract exercises if present
      const exercisesMatch = objStr.match(/exercises:\s*\[([\s\S]*?)\]/);
      let exercises = [];
      if (exercisesMatch) {
        // Count exercises
        const exerciseMatches = exercisesMatch[1].match(/\{[\s\S]*?type:[\s\S]*?\}/g);
        if (exerciseMatches) {
          exercises = exerciseMatches.map((ex, idx) => ({
            id: `ex-${lessonId}-${idx + 1}`,
            type: ex.match(/type:\s*["']([^"']+)["']/)?.[1] || 'multiple_choice',
            question: ex.match(/question:\s*["']([^"']+)["']/)?.[1] || ''
          }));
        }
      }
      
      const lesson = {
        id: `lesson-${lessonId++}`,
        title: title,
        description: description,
        category: category,
        orderIndex: orderIndex,
        level: orderIndex <= 20 ? 'beginner' : orderIndex <= 40 ? 'intermediate' : 'advanced',
        xpReward: 50 + (orderIndex * 5),
        estimatedDuration: 20,
        exercises: exercises
      };
      
      allLessons.push(lesson);
    }
  });
  
  return allLessons;
}

const allLessons = extractAllLessons();
console.log(`   Extracted ${allLessons.length} lessons`);

// 3. Save everything
console.log('\n3. Saving extracted content...');

// Update vocabulary.json
const vocabPath = path.join(outputDir, 'vocabulary.json');
const existingVocab = fs.existsSync(vocabPath) ? JSON.parse(fs.readFileSync(vocabPath, 'utf8')) : [];
const vocabMap = new Map();
existingVocab.forEach(item => { if (item.id) vocabMap.set(item.id, item); });
allVocabulary.forEach(item => { if (item.id) vocabMap.set(item.id, item); });
const mergedVocab = Array.from(vocabMap.values());
fs.writeFileSync(vocabPath, JSON.stringify(mergedVocab, null, 2));
console.log(`   Updated vocabulary.json: ${mergedVocab.length} items`);

// Update lessons.json - merge with existing
const lessonsPath = path.join(outputDir, 'lessons.json');
let existingLessons = { lessons: [] };
if (fs.existsSync(lessonsPath)) {
  const existing = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
  existingLessons = existing.lessons ? existing : { lessons: existing };
}

// Merge lessons
const lessonMap = new Map();
existingLessons.lessons.forEach(lesson => { if (lesson.id) lessonMap.set(lesson.id, lesson); });
allLessons.forEach(lesson => { lessonMap.set(lesson.id, lesson); });

const mergedLessons = { lessons: Array.from(lessonMap.values()).sort((a, b) => a.orderIndex - b.orderIndex) };
fs.writeFileSync(lessonsPath, JSON.stringify(mergedLessons, null, 2));
console.log(`   Updated lessons.json: ${mergedLessons.lessons.length} lessons`);

// Update content manifest
const manifestPath = path.join(outputDir, 'content-manifest.json');
const manifest = {
  version: "3.0.0",
  lastUpdated: new Date().toISOString(),
  contentStats: {
    lessons: mergedLessons.lessons.length,
    vocabulary: mergedVocab.length,
    pronunciationExercises: 15,
    quests: 12,
    flashcards: mergedVocab.length,
    exercises: 15,
    culturalNotes: 9
  },
  migration: {
    source: "shona-learn folder - comprehensive extraction",
    date: new Date().toISOString().split('T')[0],
    notes: `Extracted ${allLessons.length} lessons and ${allVocabulary.length} vocabulary items from JS files`
  }
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`   Updated content-manifest.json`);

console.log('\n=== EXTRACTION COMPLETE ===');
console.log(`Total Lessons: ${mergedLessons.lessons.length}`);
console.log(`Total Vocabulary: ${mergedVocab.length}`);
