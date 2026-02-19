interface Exercise {
  id: string
  type: 'multiple_choice' | 'translation' | 'pronunciation' | 'cultural_context' | 'matching' | 'fill_blank'
  question: string
  correctAnswer: string
  options?: string[]
  points: number
  audioFile?: string
  audioText?: string
  pronunciation?: string
  phonetic?: string
  culturalExplanation?: string
  hint?: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface VocabularyItem {
  shona: string
  english: string
  pronunciation: string
  phonetic: string
  syllables: string
  tonePattern: string
  audioFile: string
  usage: string
  example: string
  culturalContext: string
}

interface Lesson {
  id: string
  title: string
  vocabulary: VocabularyItem[]
  culturalNotes: string[]
  category: string
  difficulty: string
}

interface ExerciseTemplate {
  type: Exercise['type']
  difficulty: Exercise['difficulty']
  generateExercise(vocabulary: VocabularyItem[], lesson: Lesson): Exercise
}

class MultipleChoiceTemplate implements ExerciseTemplate {
  type: Exercise['type'] = 'multiple_choice'
  difficulty: Exercise['difficulty']

  constructor(difficulty: Exercise['difficulty'] = 'easy') {
    this.difficulty = difficulty
  }

  generateExercise(vocabulary: VocabularyItem[], lesson: Lesson): Exercise {
    const targetWord = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    const distractors = vocabulary
      .filter(word => word.shona !== targetWord.shona)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(word => word.english)

    const options = [targetWord.english, ...distractors].sort(() => Math.random() - 0.5)

    return {
      id: `ex-${lesson.id}-mc-${Date.now()}`,
      type: 'multiple_choice',
      question: `What does '${targetWord.shona}' mean?`,
      correctAnswer: targetWord.english,
      options,
      points: this.getPoints(),
      audioFile: targetWord.audioFile,
      audioText: targetWord.shona,
      pronunciation: targetWord.pronunciation,
      difficulty: this.difficulty,
      hint: `Usage: ${targetWord.usage}`
    }
  }

  private getPoints(): number {
    switch (this.difficulty) {
      case 'easy': return 10
      case 'medium': return 15
      case 'hard': return 20
      default: return 10
    }
  }
}

class TranslationTemplate implements ExerciseTemplate {
  type: Exercise['type'] = 'translation'
  difficulty: Exercise['difficulty']

  constructor(difficulty: Exercise['difficulty'] = 'medium') {
    this.difficulty = difficulty
  }

  generateExercise(vocabulary: VocabularyItem[], lesson: Lesson): Exercise {
    const targetWord = vocabulary[Math.floor(Math.random() * vocabulary.length)]
    const isEnglishToShona = Math.random() > 0.5

    if (isEnglishToShona) {
      return {
        id: `ex-${lesson.id}-trans-${Date.now()}`,
        type: 'translation',
        question: `Translate: '${targetWord.english}'`,
        correctAnswer: targetWord.shona,
        options: this.generateTranslationOptions(vocabulary, targetWord.shona),
        points: this.getPoints(),
        audioText: targetWord.shona,
        pronunciation: targetWord.pronunciation,
        difficulty: this.difficulty,
        hint: `Example: ${targetWord.example}`
      }
    } else {
      return {
        id: `ex-${lesson.id}-trans-${Date.now()}`,
        type: 'translation',
        question: `Translate: '${targetWord.shona}'`,
        correctAnswer: targetWord.english,
        options: this.generateTranslationOptions(vocabulary, targetWord.english),
        points: this.getPoints(),
        audioFile: targetWord.audioFile,
        audioText: targetWord.shona,
        pronunciation: targetWord.pronunciation,
        difficulty: this.difficulty,
        hint: `Usage: ${targetWord.usage}`
      }
    }
  }

  private generateTranslationOptions(vocabulary: VocabularyItem[], correct: string): string[] {
    const distractors = vocabulary
      .map(word => Math.random() > 0.5 ? word.english : word.shona)
      .filter(word => word !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    return [correct, ...distractors].sort(() => Math.random() - 0.5)
  }

  private getPoints(): number {
    switch (this.difficulty) {
      case 'easy': return 12
      case 'medium': return 18
      case 'hard': return 25
      default: return 12
    }
  }
}

class PronunciationTemplate implements ExerciseTemplate {
  type: Exercise['type'] = 'pronunciation'
  difficulty: Exercise['difficulty']

  constructor(difficulty: Exercise['difficulty'] = 'medium') {
    this.difficulty = difficulty
  }

  generateExercise(vocabulary: VocabularyItem[], lesson: Lesson): Exercise {
    const targetWord = vocabulary[Math.floor(Math.random() * vocabulary.length)]

    return {
      id: `ex-${lesson.id}-pron-${Date.now()}`,
      type: 'pronunciation',
      question: `Practice saying '${targetWord.shona}' (${targetWord.english})`,
      correctAnswer: targetWord.shona,
      points: this.getPoints(),
      audioFile: targetWord.audioFile,
      audioText: targetWord.shona,
      pronunciation: targetWord.pronunciation,
      phonetic: targetWord.phonetic,
      difficulty: this.difficulty,
      hint: `Tone pattern: ${targetWord.tonePattern}`
    }
  }

  private getPoints(): number {
    switch (this.difficulty) {
      case 'easy': return 15
      case 'medium': return 20
      case 'hard': return 30
      default: return 15
    }
  }
}

class CulturalContextTemplate implements ExerciseTemplate {
  type: Exercise['type'] = 'cultural_context'
  difficulty: Exercise['difficulty']

  constructor(difficulty: Exercise['difficulty'] = 'medium') {
    this.difficulty = difficulty
  }

  generateExercise(vocabulary: VocabularyItem[], lesson: Lesson): Exercise {
    const targetWord = vocabulary.find(word => word.culturalContext && word.culturalContext.length > 10)
    
    if (!targetWord) {
      // Fallback to a general cultural question
      return this.generateGeneralCulturalExercise(lesson)
    }

    return {
      id: `ex-${lesson.id}-cult-${Date.now()}`,
      type: 'cultural_context',
      question: `When would you use '${targetWord.shona}' in Shona culture?`,
      correctAnswer: targetWord.culturalContext,
      options: this.generateCulturalOptions(vocabulary, targetWord.culturalContext),
      points: this.getPoints(),
      audioFile: targetWord.audioFile,
      culturalExplanation: targetWord.culturalContext,
      difficulty: this.difficulty
    }
  }

  private generateGeneralCulturalExercise(lesson: Lesson): Exercise {
    const culturalNote = lesson.culturalNotes[Math.floor(Math.random() * lesson.culturalNotes.length)]
    
    return {
      id: `ex-${lesson.id}-cult-general-${Date.now()}`,
      type: 'cultural_context',
      question: `Which statement best reflects Shona culture?`,
      correctAnswer: culturalNote,
      options: this.generateGeneralCulturalOptions(lesson.culturalNotes, culturalNote),
      points: this.getPoints(),
      culturalExplanation: culturalNote,
      difficulty: this.difficulty
    }
  }

  private generateCulturalOptions(vocabulary: VocabularyItem[], correct: string): string[] {
    const distractors = vocabulary
      .filter(word => word.culturalContext && word.culturalContext !== correct)
      .map(word => word.culturalContext)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    return [correct, ...distractors].sort(() => Math.random() - 0.5)
  }

  private generateGeneralCulturalOptions(culturalNotes: string[], correct: string): string[] {
    const distractors = culturalNotes
      .filter(note => note !== correct)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)

    // Add a generic wrong answer if we don't have enough distractors
    const genericDistractors = [
      "Individual achievement is more important than community",
      "Formal education is the only way to gain knowledge",
      "Modern technology should replace all traditional practices"
    ]

    const allDistractors = [...distractors, ...genericDistractors]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)

    return [correct, ...allDistractors].sort(() => Math.random() - 0.5)
  }

  private getPoints(): number {
    switch (this.difficulty) {
      case 'easy': return 12
      case 'medium': return 18
      case 'hard': return 25
      default: return 12
    }
  }
}

class ExerciseGeneratorService {
  private templates: Map<string, ExerciseTemplate> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  private initializeTemplates(): void {
    // Multiple choice templates
    this.templates.set('mc-easy', new MultipleChoiceTemplate('easy'))
    this.templates.set('mc-medium', new MultipleChoiceTemplate('medium'))
    this.templates.set('mc-hard', new MultipleChoiceTemplate('hard'))

    // Translation templates
    this.templates.set('trans-easy', new TranslationTemplate('easy'))
    this.templates.set('trans-medium', new TranslationTemplate('medium'))
    this.templates.set('trans-hard', new TranslationTemplate('hard'))

    // Pronunciation templates
    this.templates.set('pron-easy', new PronunciationTemplate('easy'))
    this.templates.set('pron-medium', new PronunciationTemplate('medium'))
    this.templates.set('pron-hard', new PronunciationTemplate('hard'))

    // Cultural context templates
    this.templates.set('cult-easy', new CulturalContextTemplate('easy'))
    this.templates.set('cult-medium', new CulturalContextTemplate('medium'))
    this.templates.set('cult-hard', new CulturalContextTemplate('hard'))
  }

  generateExercisesForLesson(lesson: Lesson): Exercise[] {
    const exercises: Exercise[] = []
    const vocabulary = lesson.vocabulary

    if (vocabulary.length === 0) {
      return exercises
    }

    // Determine difficulty based on lesson difficulty
    const difficultyLevel = lesson.difficulty || 'easy'
    
    // Generate a balanced mix of exercises
    const exerciseTypes = this.getExerciseTypesForDifficulty(difficultyLevel)
    
    exerciseTypes.forEach(type => {
      const template = this.templates.get(type)
      if (template) {
        try {
          const exercise = template.generateExercise(vocabulary, lesson)
          exercises.push(exercise)
        } catch (error) {
          console.warn(`Failed to generate exercise of type ${type}:`, error)
        }
      }
    })

    // Shuffle exercises for variety
    return exercises.sort(() => Math.random() - 0.5)
  }

  private getExerciseTypesForDifficulty(difficulty: string): string[] {
    switch (difficulty) {
      case 'easy':
        return ['mc-easy', 'mc-easy', 'pron-easy', 'cult-easy']
      case 'medium':
        return ['mc-medium', 'trans-medium', 'pron-medium', 'cult-medium', 'mc-easy']
      case 'hard':
        return ['trans-hard', 'pron-hard', 'cult-hard', 'mc-hard', 'trans-medium']
      default:
        return ['mc-easy', 'pron-easy', 'cult-easy']
    }
  }

  generateCustomExercise(
    type: Exercise['type'],
    difficulty: Exercise['difficulty'],
    lesson: Lesson
  ): Exercise | null {
    const templateKey = `${type.split('_')[0]}-${difficulty}`
    const template = this.templates.get(templateKey)
    
    if (!template) {
      console.warn(`No template found for ${templateKey}`)
      return null
    }

    try {
      return template.generateExercise(lesson.vocabulary, lesson)
    } catch (error) {
      console.warn(`Failed to generate custom exercise:`, error)
      return null
    }
  }

  getAvailableExerciseTypes(): string[] {
    return Array.from(this.templates.keys())
  }
}

// Singleton instance
const exerciseGeneratorService = new ExerciseGeneratorService()

export { exerciseGeneratorService, ExerciseGeneratorService }
export type { Exercise, VocabularyItem, Lesson, ExerciseTemplate }