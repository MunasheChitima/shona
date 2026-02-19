// Diverse Exercise Types for Enhanced Learning Assessment
// Addresses the limited assessment variety identified in the review

export interface BaseExercise {
  id: string
  type: string
  question: string
  correctAnswer: string
  points: number
  explanation?: string
  culturalContext?: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export interface MultipleChoiceExercise extends BaseExercise {
  type: 'multiple_choice'
  options: string[]
  correctAnswer: string
}

export interface FillInTheBlankExercise extends BaseExercise {
  type: 'fill_in_blank'
  sentence: string
  blanks: Array<{
    position: number
    correctAnswer: string
    hints?: string[]
  }>
  correctAnswer: string // Full sentence with blanks filled
}

export interface MatchingExercise extends BaseExercise {
  type: 'matching'
  pairs: Array<{
    left: string
    right: string
    category?: string
  }>
  correctAnswer: string // JSON string of matched pairs
}

export interface SpeakingExercise extends BaseExercise {
  type: 'speaking'
  targetPhrase: string
  pronunciation: string
  audioFile?: string
  tolerance: number // Percentage tolerance for pronunciation
  correctAnswer: string // Expected pronunciation
}

export interface WritingExercise extends BaseExercise {
  type: 'writing'
  prompt: string
  wordLimit?: number
  requiredElements?: string[]
  correctAnswer: string // Sample correct response
}

export interface CulturalScenarioExercise extends BaseExercise {
  type: 'cultural_scenario'
  scenario: string
  question: string
  options: string[]
  culturalExplanation: string
  correctAnswer: string
}

export interface ListeningExercise extends BaseExercise {
  type: 'listening'
  audioFile: string
  transcript?: string
  question: string
  options?: string[]
  correctAnswer: string
}

export interface GrammarExercise extends BaseExercise {
  type: 'grammar'
  sentence: string
  targetGrammar: string
  options: string[]
  grammarRule: string
  correctAnswer: string
}

export interface TranslationExercise extends BaseExercise {
  type: 'translation'
  sourceText: string
  sourceLanguage: 'shona' | 'english'
  targetLanguage: 'shona' | 'english'
  hints?: string[]
  correctAnswer: string
}

export interface ConversationExercise extends BaseExercise {
  type: 'conversation'
  dialogue: Array<{
    speaker: string
    text: string
    translation?: string
  }>
  question: string
  options: string[]
  culturalContext: string
  correctAnswer: string
}

export type Exercise = 
  | MultipleChoiceExercise
  | FillInTheBlankExercise
  | MatchingExercise
  | SpeakingExercise
  | WritingExercise
  | CulturalScenarioExercise
  | ListeningExercise
  | GrammarExercise
  | TranslationExercise
  | ConversationExercise

// Exercise Factory for creating different exercise types
export class ExerciseFactory {
  static createMultipleChoice(
    id: string,
    question: string,
    options: string[],
    correctAnswer: string,
    points: number = 5,
    category: string = 'general'
  ): MultipleChoiceExercise {
    return {
      id,
      type: 'multiple_choice',
      question,
      options,
      correctAnswer,
      points,
      difficulty: 'easy',
      category
    }
  }

  static createFillInTheBlank(
    id: string,
    sentence: string,
    blanks: Array<{ position: number; correctAnswer: string; hints?: string[] }>,
    points: number = 10,
    category: string = 'vocabulary'
  ): FillInTheBlankExercise {
    return {
      id,
      type: 'fill_in_blank',
      question: 'Complete the sentence with the correct Shona words',
      sentence,
      blanks,
      correctAnswer: sentence, // Will be replaced with filled version
      points,
      difficulty: 'medium',
      category
    }
  }

  static createMatching(
    id: string,
    pairs: Array<{ left: string; right: string; category?: string }>,
    points: number = 15,
    category: string = 'vocabulary'
  ): MatchingExercise {
    return {
      id,
      type: 'matching',
      question: 'Match the Shona words with their English translations',
      pairs,
      correctAnswer: JSON.stringify(pairs),
      points,
      difficulty: 'medium',
      category
    }
  }

  static createSpeaking(
    id: string,
    targetPhrase: string,
    pronunciation: string,
    audioFile?: string,
    points: number = 20,
    category: string = 'pronunciation'
  ): SpeakingExercise {
    return {
      id,
      type: 'speaking',
      question: 'Practice pronouncing this Shona phrase',
      targetPhrase,
      pronunciation,
      audioFile,
      tolerance: 80, // 80% accuracy tolerance
      correctAnswer: pronunciation,
      points,
      difficulty: 'hard',
      category
    }
  }

  static createCulturalScenario(
    id: string,
    scenario: string,
    question: string,
    options: string[],
    culturalExplanation: string,
    correctAnswer: string,
    points: number = 15,
    category: string = 'cultural'
  ): CulturalScenarioExercise {
    return {
      id,
      type: 'cultural_scenario',
      scenario,
      question,
      options,
      culturalExplanation,
      correctAnswer,
      points,
      difficulty: 'medium',
      category
    }
  }

  static createListening(
    id: string,
    audioFile: string,
    question: string,
    options: string[],
    correctAnswer: string,
    transcript?: string,
    points: number = 15,
    category: string = 'listening'
  ): ListeningExercise {
    return {
      id,
      type: 'listening',
      audioFile,
      transcript,
      question,
      options,
      correctAnswer,
      points,
      difficulty: 'medium',
      category
    }
  }

  static createGrammar(
    id: string,
    sentence: string,
    targetGrammar: string,
    options: string[],
    grammarRule: string,
    correctAnswer: string,
    points: number = 10,
    category: string = 'grammar'
  ): GrammarExercise {
    return {
      id,
      type: 'grammar',
      question: 'Choose the correct grammatical form',
      sentence,
      targetGrammar,
      options,
      grammarRule,
      correctAnswer,
      points,
      difficulty: 'hard',
      category
    }
  }

  static createTranslation(
    id: string,
    sourceText: string,
    sourceLanguage: 'shona' | 'english',
    targetLanguage: 'shona' | 'english',
    correctAnswer: string,
    hints?: string[],
    points: number = 20,
    category: string = 'translation'
  ): TranslationExercise {
    return {
      id,
      type: 'translation',
      question: `Translate from ${sourceLanguage} to ${targetLanguage}`,
      sourceText,
      sourceLanguage,
      targetLanguage,
      hints,
      correctAnswer,
      points,
      difficulty: 'hard',
      category
    }
  }

  static createConversation(
    id: string,
    dialogue: Array<{ speaker: string; text: string; translation?: string }>,
    question: string,
    options: string[],
    culturalContext: string,
    correctAnswer: string,
    points: number = 15,
    category: string = 'conversation'
  ): ConversationExercise {
    return {
      id,
      type: 'conversation',
      question,
      dialogue,
      options,
      culturalContext,
      correctAnswer,
      points,
      difficulty: 'medium',
      category
    }
  }
}

// Exercise validation utilities
export class ExerciseValidator {
  static validateExercise(exercise: Exercise): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Common validation
    if (!exercise.id) errors.push('Exercise must have an ID')
    if (!exercise.question) errors.push('Exercise must have a question')
    if (!exercise.correctAnswer) errors.push('Exercise must have a correct answer')
    if (exercise.points <= 0) errors.push('Exercise must have positive points')

    // Type-specific validation
    switch (exercise.type) {
      case 'multiple_choice':
        const mc = exercise as MultipleChoiceExercise
        if (!mc.options || mc.options.length < 2) {
          errors.push('Multiple choice must have at least 2 options')
        }
        if (!mc.options.includes(mc.correctAnswer)) {
          errors.push('Correct answer must be one of the options')
        }
        break

      case 'fill_in_blank':
        const fib = exercise as FillInTheBlankExercise
        if (!fib.blanks || fib.blanks.length === 0) {
          errors.push('Fill in blank must have at least one blank')
        }
        break

      case 'matching':
        const match = exercise as MatchingExercise
        if (!match.pairs || match.pairs.length < 2) {
          errors.push('Matching must have at least 2 pairs')
        }
        break

      case 'speaking':
        const speak = exercise as SpeakingExercise
        if (!speak.targetPhrase) {
          errors.push('Speaking exercise must have a target phrase')
        }
        break

      case 'cultural_scenario':
        const cultural = exercise as CulturalScenarioExercise
        if (!cultural.scenario) {
          errors.push('Cultural scenario must have a scenario description')
        }
        if (!cultural.culturalExplanation) {
          errors.push('Cultural scenario must have a cultural explanation')
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Exercise scoring utilities
export class ExerciseScorer {
  static calculateScore(exercise: Exercise, userAnswer: any): {
    score: number
    isCorrect: boolean
    feedback: string
  } {
    let score = 0
    let isCorrect = false
    let feedback = ''

    switch (exercise.type) {
      case 'multiple_choice':
        isCorrect = userAnswer === exercise.correctAnswer
        score = isCorrect ? exercise.points : 0
        feedback = isCorrect ? 'Correct!' : `The correct answer is: ${exercise.correctAnswer}`
        break

      case 'fill_in_blank':
        // For fill in blank, we need to check each blank
        const fib = exercise as FillInTheBlankExercise
        const userAnswers = Array.isArray(userAnswer) ? userAnswer : [userAnswer]
        const correctAnswers = fib.blanks.map(b => b.correctAnswer)
        
        const correctBlanks = userAnswers.filter((answer, index) => 
          answer.toLowerCase().trim() === correctAnswers[index].toLowerCase().trim()
        ).length
        
        score = Math.round((correctBlanks / correctAnswers.length) * exercise.points)
        isCorrect = correctBlanks === correctAnswers.length
        feedback = isCorrect ? 'Perfect!' : `You got ${correctBlanks} out of ${correctAnswers.length} correct`
        break

      case 'matching':
        // For matching, check if all pairs are correctly matched
        const match = exercise as MatchingExercise
        const userPairs = Array.isArray(userAnswer) ? userAnswer : []
        const correctPairs = match.pairs
        
        const correctMatches = userPairs.filter(userPair => 
          correctPairs.some(correctPair => 
            userPair.left === correctPair.left && userPair.right === correctPair.right
          )
        ).length
        
        score = Math.round((correctMatches / correctPairs.length) * exercise.points)
        isCorrect = correctMatches === correctPairs.length
        feedback = isCorrect ? 'Excellent matching!' : `You matched ${correctMatches} out of ${correctPairs.length} correctly`
        break

      case 'speaking':
        // For speaking, we'd need speech recognition API integration
        // This is a simplified version
        const speak = exercise as SpeakingExercise
        const similarity = this.calculateSimilarity(userAnswer, speak.correctAnswer)
        score = Math.round((similarity / 100) * exercise.points)
        isCorrect = similarity >= speak.tolerance
        feedback = isCorrect ? 'Great pronunciation!' : 'Try again, focusing on the pronunciation'
        break

      default:
        // Default scoring for other exercise types
        isCorrect = userAnswer === exercise.correctAnswer
        score = isCorrect ? exercise.points : 0
        feedback = isCorrect ? 'Correct!' : 'Try again'
    }

    return { score, isCorrect, feedback }
  }

  private static calculateSimilarity(answer1: string, answer2: string): number {
    // Simple similarity calculation - in practice, you'd use more sophisticated algorithms
    const a1 = answer1.toLowerCase().trim()
    const a2 = answer2.toLowerCase().trim()
    
    if (a1 === a2) return 100
    
    const words1 = a1.split(' ')
    const words2 = a2.split(' ')
    const commonWords = words1.filter(word => words2.includes(word))
    
    return Math.round((commonWords.length / Math.max(words1.length, words2.length)) * 100)
  }
} 