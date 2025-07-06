export interface User {
  id: string;
  name: string;
  email: string;
  level: number;
  xp: number;
  hearts: number;
  streak: number;
  lastActive: Date;
  createdAt: Date;
  profileImage?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  questId: string;
  category: string;
  orderIndex: number;
  level: string;
  xpReward: number;
  estimatedDuration: number;
  learningObjectives: string[];
  discoveryElements: string[];
  culturalNotes: string[];
  vocabulary: VocabularyItem[];
  exercises?: Exercise[];
}

export interface VocabularyItem {
  shona: string;
  english: string;
  phonetic?: string;
  audioFile?: string;
  usage?: string;
  example?: string;
  tonePattern?: string;
  category?: string;
}

export interface Exercise {
  id: string;
  type: 'pronunciation' | 'translation' | 'multiple_choice' | 'matching' | 'listening';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  audioFile?: string;
  vocabulary?: VocabularyItem[];
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  orderIndex: number;
  requiredLevel: number;
  xpReward: number;
  completed: boolean;
  lessons: string[];
  unlockConditions?: string[];
}

export interface Progress {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  timeSpent: number;
  completedAt?: Date;
  lastAttempt?: Date;
}

export interface Flashcard {
  id: string;
  userId: string;
  shona: string;
  english: string;
  phonetic?: string;
  audioFile?: string;
  category: string;
  difficulty: number;
  nextReview: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
  correctStreak: number;
  lastReviewed?: Date;
}

export interface PronunciationScore {
  id: string;
  userId: string;
  word: string;
  score: number;
  accuracy: number;
  timestamp: Date;
  audioFile?: string;
}

export interface UserSettings {
  userId: string;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  pronunciationFeedback: boolean;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  dailyGoal: number;
  reminderTime?: string;
}

export interface SessionStats {
  totalPracticed: number;
  averageAccuracy: number;
  masteredWords: number;
  timeSpent: number;
  xpEarned: number;
  streakDays: number;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface AudioPlayerProps {
  audioFile: string;
  onPlay?: () => void;
  onStop?: () => void;
}

export interface PronunciationResult {
  word: string;
  score: number;
  accuracy: number;
  feedback: string;
  confidence: number;
}