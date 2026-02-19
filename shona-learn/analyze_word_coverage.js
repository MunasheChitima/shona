const fs = require('fs');
const path = require('path');

// Read the vocabulary data
const vocabularyData = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', 'vocabulary_master_improved.json'), 'utf8'));
const flashcardsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', 'flashcards.json'), 'utf8'));
const lessonsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'content', 'lessons_enhanced.json'), 'utf8'));

// Extract all vocabulary words
const allVocabularyWords = vocabularyData.vocabulary.map(item => item.shona.toLowerCase().trim());

// Extract flashcard words
const flashcardWords = flashcardsData.flashcards.map(item => item.shona.toLowerCase().trim());

// Extract lesson words
const lessonWords = [];
lessonsData.lessons.forEach(lesson => {
  lesson.vocabulary.forEach(item => {
    lessonWords.push(item.shona.toLowerCase().trim());
  });
});

// Find words that are in vocabulary but not in flashcards
const missingFromFlashcards = allVocabularyWords.filter(word => !flashcardWords.includes(word));

// Find words that are in vocabulary but not in lessons
const missingFromLessons = allVocabularyWords.filter(word => !lessonWords.includes(word));

// Find words that are in both flashcards and lessons
const inBoth = flashcardWords.filter(word => lessonWords.includes(word));

// Find words that are only in flashcards
const onlyInFlashcards = flashcardWords.filter(word => !lessonWords.includes(word));

// Find words that are only in lessons
const onlyInLessons = lessonWords.filter(word => !flashcardWords.includes(word));

console.log('=== WORD COVERAGE ANALYSIS ===\n');

console.log(`Total vocabulary words: ${allVocabularyWords.length}`);
console.log(`Total flashcard words: ${flashcardWords.length}`);
console.log(`Total lesson words: ${lessonWords.length}\n`);

console.log(`Words missing from flashcards: ${missingFromFlashcards.length}`);
console.log(`Words missing from lessons: ${missingFromLessons.length}\n`);

console.log(`Words in both flashcards and lessons: ${inBoth.length}`);
console.log(`Words only in flashcards: ${onlyInFlashcards.length}`);
console.log(`Words only in lessons: ${onlyInLessons.length}\n`);

console.log('=== DETAILED BREAKDOWN ===\n');

console.log('Words missing from flashcards:');
missingFromFlashcards.slice(0, 20).forEach(word => console.log(`  - ${word}`));
if (missingFromFlashcards.length > 20) {
  console.log(`  ... and ${missingFromFlashcards.length - 20} more`);
}

console.log('\nWords missing from lessons:');
missingFromLessons.slice(0, 20).forEach(word => console.log(`  - ${word}`));
if (missingFromLessons.length > 20) {
  console.log(`  ... and ${missingFromLessons.length - 20} more`);
}

console.log('\nWords in both flashcards and lessons:');
inBoth.forEach(word => console.log(`  - ${word}`));

console.log('\n=== COVERAGE SUMMARY ===');
console.log(`Flashcard coverage: ${((flashcardWords.length / allVocabularyWords.length) * 100).toFixed(1)}%`);
console.log(`Lesson coverage: ${((lessonWords.length / allVocabularyWords.length) * 100).toFixed(1)}%`);
console.log(`Combined coverage: ${(((flashcardWords.length + lessonWords.length - inBoth.length) / allVocabularyWords.length) * 100).toFixed(1)}%`); 