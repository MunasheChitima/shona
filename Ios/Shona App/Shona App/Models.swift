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
    var culturalContext: String
    var learningObjectives: [String]
    var vocabularyItems: [VocabularyItem]
    var exercises: [Exercise]
    
    init(id: String = UUID().uuidString, 
         title: String, 
         description: String, 
         category: String, 
         orderIndex: Int, 
         difficulty: String = "Easy", 
         xpReward: Int = 50, 
         culturalContext: String = "",
         learningObjectives: [String] = [],
         vocabularyItems: [VocabularyItem] = []) {
        self.id = id
        self.title = title
        self.lessonDescription = description
        self.category = category
        self.orderIndex = orderIndex
        self.difficulty = difficulty
        self.xpReward = xpReward
        self.isCompleted = false
        self.culturalContext = culturalContext
        self.learningObjectives = learningObjectives
        self.vocabularyItems = vocabularyItems
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
    var culturalNote: String?
    var points: Int
    var isCompleted: Bool
    
    init(id: String = UUID().uuidString, 
         type: String, 
         question: String, 
         correctAnswer: String, 
         options: [String] = [], 
         points: Int = 10,
         shonaPhrase: String? = nil,
         englishPhrase: String? = nil,
         audioText: String? = nil,
         culturalNote: String? = nil) {
        self.id = id
        self.type = type
        self.question = question
        self.correctAnswer = correctAnswer
        self.options = options
        self.points = points
        self.shonaPhrase = shonaPhrase
        self.englishPhrase = englishPhrase
        self.audioText = audioText
        self.culturalNote = culturalNote
        self.isCompleted = false
    }
}

@Model
final class VocabularyItem {
    var id: String
    var shona: String
    var english: String
    var phonetic: String
    var audioFile: String?
    var category: String
    var difficulty: String
    var tonePattern: String
    var usageNotes: String?
    var culturalNotes: String?
    var createdAt: Date
    
    init(id: String = UUID().uuidString, 
         shona: String, 
         english: String, 
         phonetic: String = "", 
         audioFile: String? = nil, 
         category: String = "General", 
         difficulty: String = "Beginner",
         tonePattern: String = "",
         usageNotes: String? = nil,
         culturalNotes: String? = nil) {
        self.id = id
        self.shona = shona
        self.english = english
        self.phonetic = phonetic
        self.audioFile = audioFile
        self.category = category
        self.difficulty = difficulty
        self.tonePattern = tonePattern
        self.usageNotes = usageNotes
        self.culturalNotes = culturalNotes
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
    var questDescription: String
    var storyNarrative: String
    var category: String
    var orderIndex: Int
    var requiredLevel: Int
    var xpReward: Int
    var isUnlocked: Bool
    var activities: [QuestActivity]
    var isCompleted: Bool
    var createdAt: Date
    
    init(id: String = UUID().uuidString, 
         title: String, 
         description: String, 
         storyNarrative: String = "", 
         category: String, 
         orderIndex: Int, 
         requiredLevel: Int = 1,
         xpReward: Int = 50,
         isUnlocked: Bool = false,
         activities: [QuestActivity] = []) {
        self.id = id
        self.title = title
        self.questDescription = description
        self.storyNarrative = storyNarrative
        self.category = category
        self.orderIndex = orderIndex
        self.requiredLevel = requiredLevel
        self.xpReward = xpReward
        self.isUnlocked = isUnlocked
        self.activities = activities
        self.isCompleted = false
        self.createdAt = Date()
    }
}

@Model
final class QuestActivity {
    var id: String
    var title: String
    var activityDescription: String
    var type: String
    var requiredScore: Int
    var xpReward: Int
    var culturalInsight: String?
    var isCompleted: Bool
    
    init(id: String = UUID().uuidString, 
         title: String, 
         description: String, 
         type: String,
         requiredScore: Int = 80,
         xpReward: Int = 10,
         culturalInsight: String? = nil) {
        self.id = id
        self.title = title
        self.activityDescription = description
        self.type = type
        self.requiredScore = requiredScore
        self.xpReward = xpReward
        self.culturalInsight = culturalInsight
        self.isCompleted = false
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
    var syllables: String
    var tonePattern: String
    var audioFile: String
    var complexity: Int
    var specialSounds: [String]
    var pronunciationTips: [String]
    var learningLevel: String
    var category: String
    var translation: String
    var isCompleted: Bool
    var createdAt: Date
    
    init(id: String = UUID().uuidString, 
         word: String, 
         phonetic: String, 
         syllables: String = "",
         tonePattern: String = "",
         audioFile: String = "", 
         complexity: Int = 1,
         specialSounds: [String] = [],
         pronunciationTips: [String] = [],
         learningLevel: String = "Beginner",
         category: String = "General", 
         translation: String = "") {
        self.id = id
        self.word = word
        self.phonetic = phonetic
        self.syllables = syllables
        self.tonePattern = tonePattern
        self.audioFile = audioFile
        self.complexity = complexity
        self.specialSounds = specialSounds
        self.pronunciationTips = pronunciationTips
        self.learningLevel = learningLevel
        self.category = category
        self.translation = translation
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
    var category: String
    var front: String
    var back: String
    var difficulty: String
    var tags: [String]
    var mnemonic: String?
    var usageExample: String?
    var culturalNote: String?
    var audioFile: String?
    var lastReviewed: Date?
    var nextReviewDate: Date
    var repetitionCount: Int
    var easeFactor: Double
    
    init(id: String = UUID().uuidString,
         category: String,
         front: String,
         back: String,
         difficulty: String = "Beginner",
         tags: [String] = [],
         mnemonic: String? = nil,
         usageExample: String? = nil,
         culturalNote: String? = nil,
         audioFile: String? = nil,
         lastReviewed: Date? = nil,
         nextReviewDate: Date = Date(),
         repetitionCount: Int = 0,
         easeFactor: Double = 2.5) {
        self.id = id
        self.category = category
        self.front = front
        self.back = back
        self.difficulty = difficulty
        self.tags = tags
        self.mnemonic = mnemonic
        self.usageExample = usageExample
        self.culturalNote = culturalNote
        self.audioFile = audioFile
        self.lastReviewed = lastReviewed
        self.nextReviewDate = nextReviewDate
        self.repetitionCount = repetitionCount
        self.easeFactor = easeFactor
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
    var totalPracticed: Int = 0
    var masteredWords: Int = 0
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