import { NextResponse } from 'next/server'
import { exerciseGeneratorService } from '@/lib/services/ExerciseGeneratorService'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lessonId = params.id
    
    // Load lessons from the enhanced lessons file first, then fallback to original
    let lessons: any[] = []
    
    try {
      const enhancedLessonsPath = path.join(process.cwd(), 'content', 'lessons_enhanced.json')
      if (fs.existsSync(enhancedLessonsPath)) {
        const enhancedData = JSON.parse(fs.readFileSync(enhancedLessonsPath, 'utf-8'))
        lessons = enhancedData.lessons || []
      }
    } catch (error) {
      console.warn('Enhanced lessons file not found, falling back to original')
    }
    
    // Fallback to original lessons file
    if (lessons.length === 0) {
      try {
        const originalLessonsPath = path.join(process.cwd(), 'content', 'lessons.json')
        const originalData = JSON.parse(fs.readFileSync(originalLessonsPath, 'utf-8'))
        lessons = originalData.lessons || []
      } catch (error) {
        console.error('Failed to load lessons:', error)
        return NextResponse.json(
          { error: 'Failed to load lessons' },
          { status: 500 }
        )
      }
    }
    
    const lesson = lessons.find(l => l.id === lessonId)
    
    if (!lesson) {
      return NextResponse.json(
        { error: 'Lesson not found' },
        { status: 404 }
      )
    }
    
    // Check if lesson already has exercises
    if (lesson.exercises && lesson.exercises.length > 0) {
      return NextResponse.json(lesson.exercises)
    }
    
    // Generate exercises using the unified service
    try {
      const generatedExercises = exerciseGeneratorService.generateExercisesForLesson(lesson)
      
      if (generatedExercises.length === 0) {
        // Fallback to manual exercise generation if the service fails
        const fallbackExercises = generateFallbackExercises(lesson)
        return NextResponse.json(fallbackExercises)
      }
      
      return NextResponse.json(generatedExercises)
    } catch (error) {
      console.warn('Exercise generator failed, using fallback:', error)
      
      // Fallback to manual exercise generation
      const fallbackExercises = generateFallbackExercises(lesson)
      return NextResponse.json(fallbackExercises)
    }
    
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Fallback exercise generation for backward compatibility
function generateFallbackExercises(lesson: any) {
  const exercises = []
  const vocabulary = lesson.vocabulary || []
  
  if (vocabulary.length === 0) {
    return []
  }
  
  // Generate multiple choice exercises
  for (let i = 0; i < Math.min(2, vocabulary.length); i++) {
    const word = vocabulary[i]
    const otherWords = vocabulary.filter((w: any) => w.shona !== word.shona).slice(0, 3)
    
    exercises.push({
      id: `${lesson.id}-mc-${i}`,
      type: 'multiple_choice',
      question: `What does '${word.shona}' mean?`,
      correctAnswer: word.english,
      options: [word.english, ...otherWords.map((w: any) => w.english)].sort(() => Math.random() - 0.5),
      points: 10,
      audioFile: word.audioFile,
      audioText: word.shona,
      pronunciation: word.pronunciation,
      difficulty: 'easy'
    })
  }
  
  // Generate pronunciation exercises
  for (let i = 0; i < Math.min(2, vocabulary.length); i++) {
    const word = vocabulary[i]
    
    exercises.push({
      id: `${lesson.id}-pron-${i}`,
      type: 'pronunciation',
      question: `Practice saying '${word.shona}' (${word.english})`,
      correctAnswer: word.shona,
      points: 15,
      audioFile: word.audioFile,
      audioText: word.shona,
      pronunciation: word.pronunciation,
      phonetic: word.phonetic,
      difficulty: 'medium'
    })
  }
  
  // Generate cultural context exercise if available
  if (lesson.culturalNotes && lesson.culturalNotes.length > 0) {
    exercises.push({
      id: `${lesson.id}-cultural`,
      type: 'cultural_context',
      question: 'Which statement best reflects Shona culture?',
      correctAnswer: lesson.culturalNotes[0],
      options: [
        lesson.culturalNotes[0],
        'Individual achievement is more important than community',
        'Modern technology should replace all traditional practices',
        'Formal education is the only way to gain knowledge'
      ].sort(() => Math.random() - 0.5),
      points: 12,
      culturalExplanation: lesson.culturalNotes[0],
      difficulty: 'medium'
    })
  }
  
  return exercises.sort(() => Math.random() - 0.5)
} 