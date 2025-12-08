const fs = require('fs');
const path = require('path');

const contentDir = '/workspace/shona-learn/content';
const outputDir = '/workspace/Ios/Shona App/Shona App/Content';

console.log('=== FINAL COMPREHENSIVE EXTRACTION ===\n');

// Extract ALL lessons from comprehensive-seed.js
console.log('Extracting lessons from comprehensive-seed.js...');
const seedPath = path.join(contentDir, 'lesson-plans/comprehensive-seed.js');
if (fs.existsSync(seedPath)) {
  const seedContent = fs.readFileSync(seedPath, 'utf8');
  
  // Extract all lesson objects from existingBasicLessons array
  const basicLessonsPattern = /title:\s*["']([^"']+)["'][\s\S]*?description:\s*["']([^"']+)["'][\s\S]*?category:\s*["']([^"']+)["'][\s\S]*?orderIndex:\s*(\d+)/g;
  
  let match;
  let seedLessons = [];
  while ((match = basicLessonsPattern.exec(seedContent)) !== null) {
    seedLessons.push({
      id: `lesson-seed-${match[4]}`,
      title: match[1],
      description: match[2],
      category: match[3],
      orderIndex: parseInt(match[4]),
      level: 'beginner',
      xpReward: 50,
      estimatedDuration: 20,
      exercises: []
    });
  }
  console.log(`  Found ${seedLessons.length} lessons in comprehensive-seed.js`);
  
  // Merge with existing lessons
  const lessonsPath = path.join(outputDir, 'lessons.json');
  let existingLessons = { lessons: [] };
  if (fs.existsSync(lessonsPath)) {
    existingLessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
    if (!existingLessons.lessons) {
      existingLessons = { lessons: existingLessons };
    }
  }
  
  // Merge lessons, avoiding duplicates
  const lessonMap = new Map();
  existingLessons.lessons.forEach(lesson => {
    lessonMap.set(lesson.id, lesson);
  });
  seedLessons.forEach(lesson => {
    // Check if lesson with same orderIndex exists
    const existing = Array.from(lessonMap.values()).find(l => l.orderIndex === lesson.orderIndex);
    if (!existing) {
      lessonMap.set(lesson.id, lesson);
    }
  });
  
  const allLessons = { lessons: Array.from(lessonMap.values()).sort((a, b) => a.orderIndex - b.orderIndex) };
  fs.writeFileSync(lessonsPath, JSON.stringify(allLessons, null, 2));
  console.log(`  Total lessons now: ${allLessons.lessons.length}`);
}

// Update manifest
const manifestPath = path.join(outputDir, 'content-manifest.json');
const lessonsPath = path.join(outputDir, 'lessons.json');
const vocabPath = path.join(outputDir, 'vocabulary.json');

const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
const vocabulary = JSON.parse(fs.readFileSync(vocabPath, 'utf8'));

const manifest = {
  version: "3.1.0",
  lastUpdated: new Date().toISOString(),
  contentStats: {
    lessons: lessons.lessons ? lessons.lessons.length : lessons.length,
    vocabulary: Array.isArray(vocabulary) ? vocabulary.length : (vocabulary.vocabulary ? vocabulary.vocabulary.length : 0),
    pronunciationExercises: 15,
    quests: 12,
    flashcards: Array.isArray(vocabulary) ? vocabulary.length : (vocabulary.vocabulary ? vocabulary.vocabulary.length : 0),
    exercises: 15,
    culturalNotes: 9
  },
  migration: {
    source: "shona-learn folder - FINAL comprehensive extraction",
    date: new Date().toISOString().split('T')[0],
    notes: `Complete migration of all content from shona-learn folder including ${lessons.lessons ? lessons.lessons.length : lessons.length} lessons and ${Array.isArray(vocabulary) ? vocabulary.length : 0} vocabulary items`
  }
};

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log('\n=== EXTRACTION COMPLETE ===');
console.log(`Total Lessons: ${manifest.contentStats.lessons}`);
console.log(`Total Vocabulary: ${manifest.contentStats.vocabulary}`);
