#!/usr/bin/env node
/**
 * Fixes "undefined" in lessons_enhanced.json explanation strings.
 * Uses correctAnswer when available, or extracts from question for pronunciation exercises.
 */

const fs = require('fs');
const path = require('path');

const lessonsPath = path.join(__dirname, '../content/lessons_enhanced.json');

function getMeaning(exercise) {
  if (exercise.correctAnswer) return exercise.correctAnswer;
  // Pronunciation: "Practice saying 'maziso' (eyes)" -> extract "eyes"
  const match = exercise.question && exercise.question.match(/\(([^)]+)\)\s*$/);
  return match ? match[1].trim() : 'the word';
}

function fixExercise(exercise) {
  let modified = false;
  const meaning = getMeaning(exercise);

  if (exercise.explanation) {
    if (exercise.explanation.correct && exercise.explanation.correct.includes('"undefined"')) {
      exercise.explanation.correct = exercise.explanation.correct.replace(
        /"undefined"/g,
        `"${meaning}"`
      );
      modified = true;
    }
    if (exercise.explanation.incorrect && exercise.explanation.incorrect.includes('"undefined"')) {
      exercise.explanation.incorrect = exercise.explanation.incorrect.replace(
        /"undefined"/g,
        `"${meaning}"`
      );
      modified = true;
    }
  }
  return modified;
}

function run() {
  const data = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
  const lessons = data.lessons || [];
  let fixCount = 0;

  for (const lesson of lessons) {
    const exercises = lesson.exercises || [];
    for (const ex of exercises) {
      if (fixExercise(ex)) fixCount++;
    }
  }

  fs.writeFileSync(lessonsPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Fixed ${fixCount} exercises in lessons_enhanced.json`);
}

run();
