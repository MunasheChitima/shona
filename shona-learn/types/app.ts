export interface AppUser {
  id: string
  name: string
  email?: string
  xp: number
  level?: number
  hearts?: number
  streak?: number
}

export interface Exercise {
  id: string
  type: string
  question: string
  correctAnswer: string
  options?: string
  shonaPhrase?: string
  englishPhrase?: string
  audioText?: string
  points?: number
}

export interface Lesson {
  id: string
  title: string
  description: string
  category: string
  orderIndex: number
  xpReward: number
  difficulty?: string
  exercises?: Exercise[]
}

export interface LessonProgress {
  lessonId: string
  completed: boolean
  score: number
}
