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
    var createdAt: Date
    
    init(id: String = UUID().uuidString, name: String, email: String, xp: Int = 0, hearts: Int = 5) {
        self.id = id
        self.name = name
        self.email = email
        self.xp = xp
        self.hearts = hearts
        self.level = max(1, xp / 100 + 1)
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
    var isCompleted: Bool
    var exercises: [Exercise]
    
    init(id: String = UUID().uuidString, title: String, description: String, category: String, orderIndex: Int, difficulty: String = "Easy") {
        self.id = id
        self.title = title
        self.lessonDescription = description
        self.category = category
        self.orderIndex = orderIndex
        self.difficulty = difficulty
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
    var points: Int
    var isCompleted: Bool
    
    init(id: String = UUID().uuidString, type: String, question: String, correctAnswer: String, options: [String] = [], points: Int = 10) {
        self.id = id
        self.type = type
        self.question = question
        self.correctAnswer = correctAnswer
        self.options = options
        self.points = points
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
final class Flashcard {
    var id: String
    var userId: String
    var lessonId: String?
    var shonaText: String
    var englishText: String
    var audioText: String?
    var pronunciation: String?
    var difficulty: Double
    var tags: [String]
    var context: String?
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
final class NotificationPreference {
    var id: String
    var userId: String
    var enabledDays: [String]
    var startTime: String
    var endTime: String
    var maxDailyNotifications: Int
    var intervalMinutes: Int
    var enabledTypes: [String]
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
        self.createdAt = Date()
    }
} 