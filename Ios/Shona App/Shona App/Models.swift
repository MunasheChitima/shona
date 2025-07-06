//
//  Models.swift
//  Shona App
//
//  Created by Munashe T Chitima on 6/7/2025.
//

import Foundation
import SwiftData

@Model
final class User {
    var id: String
    var name: String
    var email: String
    var xp: Int
    var hearts: Int
    var level: Int
    var streak: Int
    var lastActive: Date
    var createdAt: Date
    
    init(id: String = UUID().uuidString, name: String, email: String, xp: Int = 0, hearts: Int = 5) {
        self.id = id
        self.name = name
        self.email = email
        self.xp = xp
        self.hearts = hearts
        self.level = max(1, xp / 100 + 1)
        self.streak = 0
        self.lastActive = Date()
        self.createdAt = Date()
    }
}

@Model
final class Lesson {
    var id: String
    var title: String
    var lessonDescription: String
    var category: String
    var orderIndex: Int
    var difficulty: String
    var xpReward: Int
    var isCompleted: Bool
    var culturalContext: String?
    var learningObjectives: String? // JSON string
    var discoveryElements: String? // JSON string
    var exercises: [Exercise]
    
    init(id: String = UUID().uuidString, title: String, description: String, category: String, orderIndex: Int, difficulty: String = "Easy", xpReward: Int = 10) {
        self.id = id
        self.title = title
        self.lessonDescription = description
        self.category = category
        self.orderIndex = orderIndex
        self.difficulty = difficulty
        self.xpReward = xpReward
        self.isCompleted = false
        self.exercises = []
    }
}

@Model
final class Exercise {
    var id: String
    var type: String
    var question: String
    var correctAnswer: String
    var options: [String]
    var shonaPhrase: String?
    var englishPhrase: String?
    var audioText: String?
    var voiceContent: String? // JSON string for voice exercises
    var voiceType: String? // pronunciation, conversation, etc.
    var culturalNote: String?
    var points: Int
    var difficulty: String
    var tags: [String]
    var category: String
    var isCompleted: Bool
    
    init(id: String = UUID().uuidString, type: String, question: String, correctAnswer: String, options: [String] = [], points: Int = 10) {
        self.id = id
        self.type = type
        self.question = question
        self.correctAnswer = correctAnswer
        self.options = options
        self.points = points
        self.difficulty = "beginner"
        self.tags = []
        self.category = "General"
        self.isCompleted = false
    }
}

@Model
final class Progress {
    var id: String
    var userId: String
    var lessonId: String
    var score: Int
    var completed: Bool
    var completedAt: Date?
    var intrinsicSatisfaction: Int? // 1-10 scale
    
    init(id: String = UUID().uuidString, userId: String, lessonId: String, score: Int = 0, completed: Bool = false) {
        self.id = id
        self.userId = userId
        self.lessonId = lessonId
        self.score = score
        self.completed = completed
        self.completedAt = completed ? Date() : nil
    }
}

@Model
final class Vocabulary {
    var id: String
    var shona: String
    var english: String
    var category: String
    var subcategories: [String]
    var level: String // A1, A2, B1, B2, C1, C2
    var difficulty: Int // 1-10
    var frequency: String // high, medium, low
    var register: String // formal, informal, neutral
    var dialect: String // standard, regional
    var tones: String? // tone pattern
    var ipa: String? // IPA pronunciation
    var pronunciation: String? // simplified pronunciation
    var morphology: String? // JSON string
    var culturalNotes: String?
    var usageNotes: String?
    var collocations: [String]
    var synonyms: [String]
    var antonyms: [String]
    var examples: String? // JSON string of examples
    var audioFile: String?
    var complexity: Int?
    var specialSounds: String? // JSON string
    var pronunciationTips: [String]
    var learningLevel: String
    var createdAt: Date
    
    init(id: String = UUID().uuidString, shona: String, english: String, category: String = "General", level: String = "A1") {
        self.id = id
        self.shona = shona
        self.english = english
        self.category = category
        self.subcategories = []
        self.level = level
        self.difficulty = 1
        self.frequency = "medium"
        self.register = "neutral"
        self.dialect = "standard"
        self.collocations = []
        self.synonyms = []
        self.antonyms = []
        self.pronunciationTips = []
        self.learningLevel = "Beginner"
        self.createdAt = Date()
    }
}

@Model
final class Flashcard {
    var id: String
    var userId: String
    var lessonId: String?
    var vocabularyId: String?
    var shonaText: String
    var englishText: String
    var audioText: String?
    var pronunciation: String?
    var phonetic: String?
    var syllables: String?
    var tonePattern: String?
    var difficulty: Double
    var tags: [String]
    var context: String?
    var culturalNote: String?
    var complexity: Int?
    var specialSounds: String? // JSON string
    var pronunciationTips: [String]
    var category: String
    var createdAt: Date
    var lastReviewed: Date?
    var srsProgress: SRSProgress?
    
    init(id: String = UUID().uuidString, userId: String, shonaText: String, englishText: String, difficulty: Double = 0.5, lessonId: String? = nil) {
        self.id = id
        self.userId = userId
        self.lessonId = lessonId
        self.shonaText = shonaText
        self.englishText = englishText
        self.difficulty = difficulty
        self.tags = []
        self.pronunciationTips = []
        self.category = "General"
        self.createdAt = Date()
        self.srsProgress = SRSProgress(flashcardId: id, userId: userId)
    }
}

@Model
final class SRSProgress {
    var id: String
    var userId: String
    var flashcardId: String
    var easeFactor: Double
    var interval: Int
    var repetitions: Int
    var lastReview: Date
    var nextReview: Date
    var quality: Int
    var totalReviews: Int
    var correctStreak: Int
    var wrongStreak: Int
    var averageTime: Double
    
    init(id: String = UUID().uuidString, flashcardId: String, userId: String) {
        self.id = id
        self.userId = userId
        self.flashcardId = flashcardId
        self.easeFactor = 2.5
        self.interval = 1
        self.repetitions = 0
        self.lastReview = Date()
        self.nextReview = Date()
        self.quality = 0
        self.totalReviews = 0
        self.correctStreak = 0
        self.wrongStreak = 0
        self.averageTime = 0.0
    }
}

@Model
final class Quest {
    var id: String
    var title: String
    var description: String
    var storyNarrative: String
    var category: String
    var orderIndex: Int
    var requiredLevel: Int
    var collaborativeElements: String? // JSON string
    var intrinsicRewards: String? // JSON string
    var isCompleted: Bool
    var createdAt: Date
    
    init(id: String = UUID().uuidString, title: String, description: String, storyNarrative: String, category: String, orderIndex: Int, requiredLevel: Int = 1) {
        self.id = id
        self.title = title
        self.description = description
        self.storyNarrative = storyNarrative
        self.category = category
        self.orderIndex = orderIndex
        self.requiredLevel = requiredLevel
        self.isCompleted = false
        self.createdAt = Date()
    }
}

@Model
final class QuestProgress {
    var id: String
    var userId: String
    var questId: String
    var completed: Bool
    var completedAt: Date?
    var createdAt: Date
    
    init(id: String = UUID().uuidString, userId: String, questId: String, completed: Bool = false) {
        self.id = id
        self.userId = userId
        self.questId = questId
        self.completed = completed
        self.completedAt = completed ? Date() : nil
        self.createdAt = Date()
    }
}

@Model
final class LearningGoal {
    var id: String
    var userId: String
    var title: String
    var description: String
    var targetDate: Date?
    var completed: Bool
    var createdAt: Date
    
    init(id: String = UUID().uuidString, userId: String, title: String, description: String, targetDate: Date? = nil) {
        self.id = id
        self.userId = userId
        self.title = title
        self.description = description
        self.targetDate = targetDate
        self.completed = false
        self.createdAt = Date()
    }
}

@Model
final class IntrinsicMotivation {
    var id: String
    var userId: String
    var autonomy: Int // 1-10 scale
    var competence: Int // 1-10 scale
    var relatedness: Int // 1-10 scale
    var lastUpdated: Date
    
    init(id: String = UUID().uuidString, userId: String, autonomy: Int = 5, competence: Int = 5, relatedness: Int = 5) {
        self.id = id
        self.userId = userId
        self.autonomy = autonomy
        self.competence = competence
        self.relatedness = relatedness
        self.lastUpdated = Date()
    }
}

@Model
final class NotificationPreference {
    var id: String
    var userId: String
    var enabledDays: [String]
    var startTime: String
    var endTime: String
    var maxDailyNotifications: Int
    var intervalMinutes: Int
    var enabledTypes: [String]
    var timezone: String
    var deviceToken: String?
    var createdAt: Date
    
    init(id: String = UUID().uuidString, userId: String) {
        self.id = id
        self.userId = userId
        self.enabledDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        self.startTime = "09:00"
        self.endTime = "21:00"
        self.maxDailyNotifications = 5
        self.intervalMinutes = 240
        self.enabledTypes = ["review_due", "streak_reminder", "achievement"]
        self.timezone = "UTC"
        self.createdAt = Date()
    }
}

@Model
final class PronunciationExercise {
    var id: String
    var word: String
    var phonetic: String
    var syllables: String
    var tonePattern: String
    var audioFile: String?
    var complexity: Int
    var specialSounds: String? // JSON string
    var pronunciationTips: [String]
    var learningLevel: String
    var category: String
    var translation: String
    var createdAt: Date
    
    init(id: String = UUID().uuidString, word: String, phonetic: String, syllables: String, tonePattern: String, complexity: Int, learningLevel: String, category: String, translation: String) {
        self.id = id
        self.word = word
        self.phonetic = phonetic
        self.syllables = syllables
        self.tonePattern = tonePattern
        self.complexity = complexity
        self.pronunciationTips = []
        self.learningLevel = learningLevel
        self.category = category
        self.translation = translation
        self.createdAt = Date()
    }
}

// MARK: - Content Data Structures

struct VocabularyWord {
    let id: String
    let shona: String
    let english: String
    let category: String
    let subcategories: [String]
    let level: String
    let difficulty: Int
    let frequency: String
    let register: String
    let dialect: String
    let tones: String?
    let ipa: String?
    let pronunciation: String?
    let morphology: [String: Any]?
    let culturalNotes: String?
    let usageNotes: String?
    let collocations: [String]
    let synonyms: [String]
    let antonyms: [String]
    let examples: [VocabularyExample]
    let audioFile: String?
}

struct VocabularyExample {
    let shona: String
    let english: String
    let context: String
    let register: String
}

struct VoiceExercise {
    let words: [VoiceWord]
    let dialogue: [DialogueLine]?
}

struct VoiceWord {
    let shona: String
    let english: String
    let phonetic: String
    let syllables: String?
    let tonePattern: String?
    let audioFile: String?
    let complexity: Int?
    let specialSounds: [SpecialSound]?
    let pronunciationTips: [String]?
    let learningLevel: String?
}

struct DialogueLine {
    let speaker: String
    let shona: String
    let english: String
    let phonetic: String
}

struct SpecialSound {
    let token: String
    let type: String
    let ipa: String
    let description: String?
}

// MARK: - Statistics and Analytics

struct LearningStats {
    let totalLessons: Int
    let completedLessons: Int
    let totalXP: Int
    let currentLevel: Int
    let streak: Int
    let averageScore: Double
    let totalTime: TimeInterval
    let vocabularyLearned: Int
    let pronunciationAccuracy: Double
}

struct FlashcardStats {
    let totalCards: Int
    let dueCards: Int
    let newCards: Int
    let reviewedToday: Int
    let accuracy: Int
    let streakDays: Int
    let masteredCards: Int
}

struct SessionStats {
    var totalReviewed: Int = 0
    var correct: Int = 0
    var incorrect: Int = 0
    var timeSpent: TimeInterval = 0
    var startTime: Date = Date()
}

// MARK: - Content Management

class ContentManager {
    static let shared = ContentManager()
    
    private init() {}
    
    func loadVocabulary() -> [VocabularyWord] {
        // Load vocabulary from bundled JSON files
        return []
    }
    
    func loadLessons() -> [Lesson] {
        // Load lessons from bundled JSON files
        return []
    }
    
    func loadPronunciationExercises() -> [PronunciationExercise] {
        // Load pronunciation exercises from bundled JSON files
        return []
    }
    
    func syncWithWebApp() {
        // Sync content with web app via API
    }
} 