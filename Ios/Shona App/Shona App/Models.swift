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
    var level: String
    var xpReward: Int
    var estimatedDuration: Int
    var isCompleted: Bool
    var culturalContext: String?
    var learningObjectives: [String]
    var discoveryElements: [String]
    var culturalNotes: [String]
    var exercises: [Exercise]
    var vocabulary: [VocabularyItem]
    var questId: String?
    
    init(id: String = UUID().uuidString, title: String, description: String, category: String, orderIndex: Int, level: String = "beginner", xpReward: Int = 50, estimatedDuration: Int = 15) {
        self.id = id
        self.title = title
        self.lessonDescription = description
        self.category = category
        self.orderIndex = orderIndex
        self.level = level
        self.xpReward = xpReward
        self.estimatedDuration = estimatedDuration
        self.isCompleted = false
        self.learningObjectives = []
        self.discoveryElements = []
        self.culturalNotes = []
        self.exercises = []
        self.vocabulary = []
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
final class VocabularyItem {
    var id: String
    var shona: String
    var english: String
    var audioFile: String?
    var usage: String?
    var example: String?
    var category: String
    var level: String
    var pronunciation: String?
    var phonetic: String?
    var tonePattern: String?
    var culturalNote: String?
    var createdAt: Date
    
    init(id: String = UUID().uuidString, shona: String, english: String, audioFile: String? = nil, usage: String? = nil, example: String? = nil, category: String = "General", level: String = "beginner") {
        self.id = id
        self.shona = shona
        self.english = english
        self.audioFile = audioFile
        self.usage = usage
        self.example = example
        self.category = category
        self.level = level
        self.createdAt = Date()
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
    var activities: [QuestActivity]
    var isCompleted: Bool
    var createdAt: Date
    
    init(id: String = UUID().uuidString, title: String, description: String, storyNarrative: String = "", category: String, orderIndex: Int, requiredLevel: Int = 1) {
        self.id = id
        self.title = title
        self.description = description
        self.storyNarrative = storyNarrative
        self.category = category
        self.orderIndex = orderIndex
        self.requiredLevel = requiredLevel
        self.activities = []
        self.isCompleted = false
        self.createdAt = Date()
    }
}

@Model
final class QuestActivity {
    var id: String
    var type: String
    var title: String
    var description: String
    var content: String // JSON string for activity content
    var isCompleted: Bool
    var questId: String
    
    init(id: String = UUID().uuidString, type: String, title: String, description: String, content: String = "{}", questId: String) {
        self.id = id
        self.type = type
        self.title = title
        self.description = description
        self.content = content
        self.isCompleted = false
        self.questId = questId
    }
}

@Model
final class QuestProgress {
    var id: String
    var userId: String
    var questId: String
    var activitiesCompleted: Int
    var totalActivities: Int
    var completed: Bool
    var completedAt: Date?
    var score: Int
    
    init(id: String = UUID().uuidString, userId: String, questId: String, totalActivities: Int = 0) {
        self.id = id
        self.userId = userId
        self.questId = questId
        self.activitiesCompleted = 0
        self.totalActivities = totalActivities
        self.completed = false
        self.score = 0
    }
}

@Model
final class PronunciationExercise {
    var id: String
    var word: String
    var phonetic: String
    var audioFile: String?
    var difficulty: String
    var category: String
    var tips: [String]
    var commonMistakes: [String]
    var syllables: String?
    var tonePattern: String?
    var specialSounds: [PronunciationSound]
    var isCompleted: Bool
    var createdAt: Date
    
    init(id: String = UUID().uuidString, word: String, phonetic: String, audioFile: String? = nil, difficulty: String = "beginner", category: String = "General") {
        self.id = id
        self.word = word
        self.phonetic = phonetic
        self.audioFile = audioFile
        self.difficulty = difficulty
        self.category = category
        self.tips = []
        self.commonMistakes = []
        self.specialSounds = []
        self.isCompleted = false
        self.createdAt = Date()
    }
}

@Model
final class PronunciationSound {
    var id: String
    var token: String
    var type: String
    var description: String?
    var exerciseId: String
    
    init(id: String = UUID().uuidString, token: String, type: String, description: String? = nil, exerciseId: String) {
        self.id = id
        self.token = token
        self.type = type
        self.description = description
        self.exerciseId = exerciseId
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

// MARK: - Content Loading Structures

struct LessonContent: Codable {
    let lessons: [LessonData]
}

struct LessonData: Codable {
    let id: String
    let title: String
    let description: String
    let questId: String?
    let category: String
    let orderIndex: Int
    let level: String
    let xpReward: Int
    let estimatedDuration: Int
    let learningObjectives: [String]
    let discoveryElements: [String]
    let culturalNotes: [String]
    let vocabulary: [VocabularyData]
}

struct VocabularyData: Codable {
    let shona: String
    let english: String
    let audioFile: String?
    let usage: String?
    let example: String?
}

struct QuestContent: Codable {
    let quests: [QuestData]
}

struct QuestData: Codable {
    let id: String
    let title: String
    let activities: [QuestActivityData]
}

struct QuestActivityData: Codable {
    let type: String
    let title: String
    let description: String
}

// MARK: - Session Statistics

struct PronunciationSessionStats {
    var totalExercises: Int = 0
    var correctPronunciations: Int = 0
    var averageAccuracy: Double = 0.0
    var timeSpent: TimeInterval = 0
    var difficultyLevel: String = "beginner"
    var improvementAreas: [String] = []
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