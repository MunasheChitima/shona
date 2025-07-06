import Foundation

// MARK: - Flashcard Models
struct Flashcard: Codable, Identifiable {
    let id: String
    let shonaText: String
    let englishText: String
    let pronunciation: String?
    let phonetic: String?
    let tonePattern: String?
    let category: String
    let difficulty: Double
    let level: String
    let culturalNotes: String?
    let usageNotes: String?
    let examples: [FlashcardExample]
    let tags: [String]
    var srsProgress: SRSProgress?
    
    init(id: String = UUID().uuidString,
         shonaText: String,
         englishText: String,
         pronunciation: String? = nil,
         phonetic: String? = nil,
         tonePattern: String? = nil,
         category: String = "General",
         difficulty: Double = 1.0,
         level: String = "A1",
         culturalNotes: String? = nil,
         usageNotes: String? = nil,
         examples: [FlashcardExample] = [],
         tags: [String] = []) {
        self.id = id
        self.shonaText = shonaText
        self.englishText = englishText
        self.pronunciation = pronunciation
        self.phonetic = phonetic
        self.tonePattern = tonePattern
        self.category = category
        self.difficulty = difficulty
        self.level = level
        self.culturalNotes = culturalNotes
        self.usageNotes = usageNotes
        self.examples = examples
        self.tags = tags
        self.srsProgress = SRSProgress(flashcardId: id)
    }
}

struct FlashcardExample: Codable, Identifiable {
    let id: String
    let shona: String
    let english: String
    let context: String
    let register: String
    
    init(id: String = UUID().uuidString,
         shona: String,
         english: String,
         context: String = "general",
         register: String = "neutral") {
        self.id = id
        self.shona = shona
        self.english = english
        self.context = context
        self.register = register
    }
}

// MARK: - SRS (Spaced Repetition System) Models
struct SRSProgress: Codable {
    let flashcardId: String
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
    
    init(flashcardId: String) {
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

// MARK: - Review Session Models
struct ReviewSession: Codable {
    let id: String
    let startTime: Date
    var endTime: Date?
    var totalReviewed: Int
    var correct: Int
    var incorrect: Int
    var timeSpent: TimeInterval
    var cards: [String] // Flashcard IDs
    
    init(id: String = UUID().uuidString) {
        self.id = id
        self.startTime = Date()
        self.endTime = nil
        self.totalReviewed = 0
        self.correct = 0
        self.incorrect = 0
        self.timeSpent = 0
        self.cards = []
    }
}

// MARK: - User Settings Models
struct UserSettings: Codable {
    var dailyGoal: Int
    var enableSound: Bool
    var enableVibration: Bool
    var reviewReminderEnabled: Bool
    var reviewReminderTime: Date
    var maxNewCardsPerDay: Int
    var maxReviewsPerDay: Int
    var selectedCategories: [String]
    var difficultyLevel: String
    
    init() {
        self.dailyGoal = 20
        self.enableSound = true
        self.enableVibration = true
        self.reviewReminderEnabled = true
        self.reviewReminderTime = Calendar.current.date(bySettingHour: 9, minute: 0, second: 0, of: Date()) ?? Date()
        self.maxNewCardsPerDay = 10
        self.maxReviewsPerDay = 50
        self.selectedCategories = ["General", "Greetings", "Family", "Numbers"]
        self.difficultyLevel = "Beginner"
    }
}

// MARK: - Statistics Models
struct StudyStatistics: Codable {
    var totalStudyTime: TimeInterval
    var totalCardsReviewed: Int
    var totalCorrect: Int
    var totalIncorrect: Int
    var currentStreak: Int
    var longestStreak: Int
    var averageAccuracy: Double
    var studyDays: Int
    var lastStudyDate: Date?
    
    init() {
        self.totalStudyTime = 0
        self.totalCardsReviewed = 0
        self.totalCorrect = 0
        self.totalIncorrect = 0
        self.currentStreak = 0
        self.longestStreak = 0
        self.averageAccuracy = 0.0
        self.studyDays = 0
        self.lastStudyDate = nil
    }
    
    var accuracy: Double {
        guard totalCardsReviewed > 0 else { return 0.0 }
        return Double(totalCorrect) / Double(totalCardsReviewed)
    }
}

// MARK: - Review Result Enum
enum ReviewResult: String, CaseIterable {
    case again = "again"
    case hard = "hard"
    case good = "good"
    case easy = "easy"
    
    var qualityScore: Int {
        switch self {
        case .again: return 0
        case .hard: return 1
        case .good: return 3
        case .easy: return 5
        }
    }
    
    var title: String {
        switch self {
        case .again: return "Again"
        case .hard: return "Hard"
        case .good: return "Good"
        case .easy: return "Easy"
        }
    }
    
    var color: String {
        switch self {
        case .again: return "red"
        case .hard: return "orange"
        case .good: return "green"
        case .easy: return "blue"
        }
    }
}

// MARK: - Flashcard Categories
enum FlashcardCategory: String, CaseIterable {
    case general = "General"
    case greetings = "Greetings"
    case family = "Family"
    case numbers = "Numbers"
    case colors = "Colors"
    case food = "Food"
    case time = "Time"
    case animals = "Animals"
    case body = "Body"
    case nature = "Nature"
    case urban = "Urban Life"
    case social = "Social Media"
    case relationships = "Relationships"
    case work = "Work"
    case education = "Education"
    case health = "Health"
    case transport = "Transportation"
    case shopping = "Shopping"
    case culture = "Culture"
    case religion = "Religion"
    
    var displayName: String {
        return rawValue
    }
}

// MARK: - Difficulty Levels
enum DifficultyLevel: String, CaseIterable {
    case beginner = "Beginner"
    case intermediate = "Intermediate"
    case advanced = "Advanced"
    case native = "Native"
    
    var range: ClosedRange<Double> {
        switch self {
        case .beginner: return 1.0...3.0
        case .intermediate: return 3.0...6.0
        case .advanced: return 6.0...8.0
        case .native: return 8.0...10.0
        }
    }
}

// MARK: - Extensions
extension Flashcard {
    var isOverdue: Bool {
        guard let srsProgress = srsProgress else { return false }
        return srsProgress.nextReview <= Date()
    }
    
    var daysSinceReview: Int {
        guard let srsProgress = srsProgress else { return 0 }
        return Calendar.current.dateComponents([.day], from: srsProgress.lastReview, to: Date()).day ?? 0
    }
    
    var difficultyDescription: String {
        switch difficulty {
        case 1.0...3.0: return "Beginner"
        case 3.0...6.0: return "Intermediate"
        case 6.0...8.0: return "Advanced"
        case 8.0...10.0: return "Native"
        default: return "Unknown"
        }
    }
}

extension SRSProgress {
    mutating func updateAfterReview(quality: Int, responseTime: TimeInterval) {
        self.quality = quality
        self.totalReviews += 1
        self.averageTime = (averageTime * Double(totalReviews - 1) + responseTime) / Double(totalReviews)
        self.lastReview = Date()
        
        if quality >= 3 {
            self.correctStreak += 1
            self.wrongStreak = 0
        } else {
            self.wrongStreak += 1
            self.correctStreak = 0
        }
        
        // SuperMemo SM-2 algorithm
        if repetitions == 0 {
            interval = 1
            repetitions = 1
        } else if repetitions == 1 {
            interval = 6
            repetitions = 2
        } else {
            if quality >= 3 {
                interval = Int(Double(interval) * easeFactor)
                repetitions += 1
            } else {
                repetitions = 0
                interval = 1
            }
        }
        
        easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        if easeFactor < 1.3 {
            easeFactor = 1.3
        }
        
        nextReview = Calendar.current.date(byAdding: .day, value: interval, to: Date()) ?? Date()
    }
}