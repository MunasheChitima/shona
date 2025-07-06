//
//  FlashcardViewModel.swift
//  Shona App
//
//  Created by AI Assistant on 6/1/2025.
//

import SwiftUI
import SwiftData
import Combine
import UserNotifications
import WidgetKit
import WatchConnectivity

@Observable
class FlashcardViewModel: NSObject {
    // MARK: - Properties
    private var modelContext: ModelContext?
    var flashcards: [Flashcard] = []
    var dueCards: [Flashcard] = []
    var currentCard: Flashcard?
    var studyStats = StudyStats()
    var isStudying = false
    var showAnswer = false
    var sessionStartTime: Date?
    var userPreferences = UserPreferences()
    
    // MARK: - Machine Learning Properties
    private var performanceAnalyzer = PerformanceAnalyzer()
    private var patternRecognizer = PatternRecognizer()
    private var predictiveEngine = PredictiveEngine()
    
    // MARK: - Publishers
    @Published var studyStreak: Int = 0
    @Published var dailyGoalProgress: Float = 0.0
    @Published var predictedRetention: Float = 0.0
    @Published var optimalReviewTime: Date?
    @Published var motivationalMessage: String = ""
    
    // MARK: - Watch Connectivity
    private var watchSession: WCSession?
    
    override init() {
        super.init()
        setupWatchConnectivity()
        setupNotificationObservers()
        loadUserPreferences()
    }
    
    func setup(with modelContext: ModelContext) {
        self.modelContext = modelContext
        loadFlashcards()
        updateDueCards()
        scheduleSmartNotifications()
    }
    
    // MARK: - Core Functions
    
    func loadFlashcards() {
        guard let modelContext = modelContext else { return }
        
        let descriptor = FetchDescriptor<Flashcard>(
            sortBy: [SortDescriptor(\.nextReview)]
        )
        
        do {
            flashcards = try modelContext.fetch(descriptor)
            analyzePerformancePatterns()
        } catch {
            print("Error loading flashcards: \(error)")
        }
    }
    
    func updateDueCards() {
        let now = Date()
        dueCards = flashcards.filter { card in
            guard let srsProgress = card.srsProgress else { return true }
            return srsProgress.nextReview <= now
        }.sorted { card1, card2 in
            // Advanced sorting using ML predictions
            let priority1 = calculateCardPriority(card1)
            let priority2 = calculateCardPriority(card2)
            return priority1 > priority2
        }
        
        updateDailyGoalProgress()
        sendToWatch()
    }
    
    // MARK: - Advanced SRS Algorithm
    
    func reviewCard(quality: Int, responseTime: TimeInterval) {
        guard let card = currentCard,
              let srsProgress = card.srsProgress,
              let sessionStartTime = sessionStartTime else { return }
        
        // Capture contextual factors
        let contextualFactors = ContextualFactors(
            timeOfDay: Calendar.current.component(.hour, from: Date()),
            dayOfWeek: Calendar.current.component(.weekday, from: Date()),
            sessionLength: Date().timeIntervalSince(sessionStartTime),
            ambientNoise: measureAmbientNoise(),
            cognitiveLoad: calculateCognitiveLoad()
        )
        
        // Apply advanced algorithm
        let wasCorrect = quality >= 3
        let result = applyAdvancedSRSAlgorithm(
            card: card,
            quality: quality,
            responseTime: responseTime,
            wasCorrect: wasCorrect,
            contextualFactors: contextualFactors
        )
        
        // Update progress
        srsProgress.easeFactor = result.easeFactor
        srsProgress.interval = result.interval
        srsProgress.repetitions = result.repetitions
        srsProgress.lastReview = Date()
        srsProgress.nextReview = result.nextReview
        srsProgress.quality = quality
        srsProgress.totalReviews += 1
        srsProgress.correctStreak = wasCorrect ? srsProgress.correctStreak + 1 : 0
        srsProgress.wrongStreak = wasCorrect ? 0 : srsProgress.wrongStreak + 1
        srsProgress.averageTime = updateAverageTime(srsProgress.averageTime, responseTime, srsProgress.totalReviews)
        
        // Update card metadata
        card.lastReviewed = Date()
        
        // Machine learning updates
        performanceAnalyzer.recordPerformance(card: card, quality: quality, responseTime: responseTime, factors: contextualFactors)
        predictiveEngine.updatePredictions(for: card)
        
        // Generate insights
        generatePersonalizedInsights(for: card, result: result)
        
        // Update UI
        updateMotivationalMessage(quality: quality, wasCorrect: wasCorrect)
        
        // Save and sync
        saveContext()
        syncWithCloud()
        updateWidget()
        
        // Move to next card
        moveToNextCard()
    }
    
    private func applyAdvancedSRSAlgorithm(
        card: Flashcard,
        quality: Int,
        responseTime: TimeInterval,
        wasCorrect: Bool,
        contextualFactors: ContextualFactors
    ) -> SRSResult {
        guard let srsProgress = card.srsProgress else {
            return SRSResult(easeFactor: 2.5, interval: 1, repetitions: 0, nextReview: Date())
        }
        
        // Base SuperMemo calculation
        var easeFactor = srsProgress.easeFactor
        easeFactor = easeFactor + (0.1 - Double(5 - quality) * (0.08 + Double(5 - quality) * 0.02))
        
        // ML-based adjustments
        let mlAdjustment = performanceAnalyzer.getEaseFactorAdjustment(for: card, contextualFactors: contextualFactors)
        easeFactor *= (1 + mlAdjustment)
        
        // Pattern-based adjustments
        let patternAdjustment = patternRecognizer.getPatternAdjustment(for: card, in: flashcards)
        easeFactor *= (1 + patternAdjustment)
        
        // Time-based adjustments
        let timeAdjustment = calculateTimeAdjustment(responseTime: responseTime, averageTime: srsProgress.averageTime)
        easeFactor *= (1 + timeAdjustment)
        
        // Difficulty adjustments
        let difficultyAdjustment = (0.5 - card.difficulty) * 0.1
        easeFactor += difficultyAdjustment
        
        // Clamp ease factor
        easeFactor = max(1.3, min(4.0, easeFactor))
        
        // Calculate interval
        var interval: Int
        var repetitions: Int
        
        if quality < 3 {
            interval = 1
            repetitions = 0
        } else {
            repetitions = srsProgress.repetitions + 1
            if repetitions == 1 {
                interval = 1
            } else if repetitions == 2 {
                interval = 6
            } else {
                interval = Int(Double(srsProgress.interval) * easeFactor)
            }
        }
        
        // Cognitive load balancing
        interval = applyCognitiveLoadBalancing(interval: interval)
        
        // Predict optimal review time
        let optimalTime = predictiveEngine.getOptimalReviewTime(
            baseInterval: interval,
            userPreferences: userPreferences,
            performanceHistory: performanceAnalyzer.getHistory(for: card)
        )
        
        return SRSResult(
            easeFactor: easeFactor,
            interval: interval,
            repetitions: repetitions,
            nextReview: optimalTime
        )
    }
    
    // MARK: - Machine Learning
    
    private func calculateCardPriority(_ card: Flashcard) -> Double {
        guard let srsProgress = card.srsProgress else { return 0 }
        
        let overdueFactor = max(0, -srsProgress.nextReview.timeIntervalSinceNow) / (24 * 60 * 60)
        let difficultyFactor = card.difficulty
        let streakFactor = Double(srsProgress.wrongStreak) * 0.2
        let predictionFactor = predictiveEngine.getForgettingProbability(for: card)
        
        return overdueFactor * 2 + difficultyFactor + streakFactor + predictionFactor
    }
    
    private func analyzePerformancePatterns() {
        performanceAnalyzer.analyzePatterns(flashcards: flashcards)
        
        // Identify weak areas
        let weakAreas = performanceAnalyzer.identifyWeakAreas()
        
        // Generate recommendations
        for area in weakAreas {
            generateRecommendation(for: area)
        }
    }
    
    // MARK: - Notifications
    
    func scheduleSmartNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        
        let schedule = predictiveEngine.generateOptimalSchedule(
            flashcards: flashcards,
            userPreferences: userPreferences,
            days: 7
        )
        
        for (day, sessions) in schedule.enumerated() {
            for session in sessions {
                scheduleNotification(
                    date: session.date,
                    cardCount: session.cardCount,
                    priority: session.priority
                )
            }
        }
    }
    
    private func scheduleNotification(date: Date, cardCount: Int, priority: NotificationPriority) {
        let content = UNMutableNotificationContent()
        
        switch priority {
        case .high:
            content.title = "Important Review! 🚨"
            content.body = "\(cardCount) critical cards need review to maintain your streak"
            content.sound = .defaultCritical
        case .medium:
            content.title = "Time to Review 📚"
            content.body = "\(cardCount) cards are ready for optimal learning"
            content.sound = .default
        case .low:
            content.title = "Quick Review? 💭"
            content.body = "\(cardCount) easy cards for a quick session"
            content.sound = UNNotificationSound(named: UNNotificationSoundName("gentle.caf"))
        }
        
        content.badge = NSNumber(value: cardCount)
        content.categoryIdentifier = "FLASHCARD_REVIEW"
        content.userInfo = [
            "cardCount": cardCount,
            "priority": priority.rawValue
        ]
        
        // Rich notification with image
        if let imageURL = Bundle.main.url(forResource: "notification-banner", withExtension: "png") {
            let attachment = try? UNNotificationAttachment(identifier: "banner", url: imageURL)
            if let attachment = attachment {
                content.attachments = [attachment]
            }
        }
        
        let trigger = UNCalendarNotificationTrigger(
            dateMatching: Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: date),
            repeats: false
        )
        
        let request = UNNotificationRequest(
            identifier: "flashcard-\(date.timeIntervalSince1970)",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request)
    }
    
    // MARK: - Watch Integration
    
    private func setupWatchConnectivity() {
        if WCSession.isSupported() {
            watchSession = WCSession.default
            watchSession?.delegate = self
            watchSession?.activate()
        }
    }
    
    private func sendToWatch() {
        guard let watchSession = watchSession,
              watchSession.isReachable else { return }
        
        let watchData: [String: Any] = [
            "dueCount": dueCards.count,
            "streak": studyStreak,
            "nextCard": currentCard?.shonaText ?? "",
            "dailyProgress": dailyGoalProgress
        ]
        
        watchSession.sendMessage(watchData, replyHandler: nil)
        
        // Update complication
        if watchSession.isComplicationEnabled {
            watchSession.transferCurrentComplicationUserInfo(watchData)
        }
    }
    
    // MARK: - Widget Support
    
    private func updateWidget() {
        let widgetData = WidgetData(
            dueCount: dueCards.count,
            streak: studyStreak,
            nextReviewTime: dueCards.first?.srsProgress?.nextReview,
            dailyProgress: dailyGoalProgress,
            motivationalQuote: getMotivationalQuote()
        )
        
        WidgetDataManager.shared.save(widgetData)
        WidgetCenter.shared.reloadAllTimelines()
    }
    
    // MARK: - Helpers
    
    private func calculateTimeAdjustment(responseTime: TimeInterval, averageTime: Double) -> Double {
        guard averageTime > 0 else { return 0 }
        
        let ratio = responseTime / averageTime
        
        if ratio > 2.0 {
            return -0.1 // Slow response
        } else if ratio < 0.5 {
            return 0.05 // Fast response
        }
        
        return 0
    }
    
    private func applyCognitiveLoadBalancing(interval: Int) -> Int {
        let dailyLoad = predictiveEngine.predictDailyLoad(for: Date())
        let targetLoad = userPreferences.targetDailyReviews
        
        let loadRatio = Double(dailyLoad) / Double(targetLoad)
        
        if loadRatio > 0.8 {
            let adjustment = 1 + (loadRatio - 0.8)
            return Int(Double(interval) * adjustment)
        }
        
        return interval
    }
    
    private func updateAverageTime(_ current: Double, _ new: TimeInterval, _ totalReviews: Int) -> Double {
        return ((current * Double(totalReviews - 1)) + new) / Double(totalReviews)
    }
    
    private func generatePersonalizedInsights(for card: Flashcard, result: SRSResult) {
        let insights = InsightGenerator.generate(
            card: card,
            result: result,
            performanceHistory: performanceAnalyzer.getHistory(for: card),
            patternData: patternRecognizer.getPatterns(for: card)
        )
        
        // Show insights in UI
        if let topInsight = insights.first {
            showInsight(topInsight)
        }
    }
    
    private func saveContext() {
        guard let modelContext = modelContext else { return }
        
        do {
            try modelContext.save()
        } catch {
            print("Error saving context: \(error)")
        }
    }
    
    private func syncWithCloud() {
        // CloudKit sync implementation
        CloudSyncManager.shared.sync(flashcards: flashcards)
    }
    
    // MARK: - Additional Helper Methods
    
    func startStudySession() {
        guard !dueCards.isEmpty else { return }
        
        isStudying = true
        sessionStartTime = Date()
        studyStats = StudyStats()
        
        if let firstCard = dueCards.first {
            currentCard = firstCard
            showAnswer = false
        }
        
        // Haptic feedback
        if userPreferences.hapticFeedback {
            UIImpactFeedbackGenerator(style: .medium).impactOccurred()
        }
    }
    
    private func moveToNextCard() {
        guard let current = currentCard,
              let index = dueCards.firstIndex(where: { $0.id == current.id }) else { return }
        
        dueCards.remove(at: index)
        
        if let nextCard = dueCards.first {
            currentCard = nextCard
            showAnswer = false
        } else {
            endStudySession()
        }
    }
    
    private func endStudySession() {
        isStudying = false
        currentCard = nil
        showAnswer = false
        
        // Calculate session results
        let sessionResult = calculateSessionResults()
        
        // Show completion celebration
        showSessionCompletion(result: sessionResult)
        
        // Update achievements
        checkForAchievements()
        
        // Haptic feedback
        if userPreferences.hapticFeedback {
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        }
    }
    
    private func measureAmbientNoise() -> Double {
        // Placeholder for ambient noise measurement
        // In real implementation, would use AVAudioSession
        return 0.3
    }
    
    private func calculateCognitiveLoad() -> Double {
        // Calculate based on session length and cards reviewed
        guard let sessionStart = sessionStartTime else { return 0.5 }
        
        let sessionDuration = Date().timeIntervalSince(sessionStart) / 60 // minutes
        let cardsPerMinute = Double(studyStats.totalReviewed) / max(1, sessionDuration)
        
        // Higher cards per minute = higher cognitive load
        return min(1.0, cardsPerMinute / 3.0)
    }
    
    private func updateDailyGoalProgress() {
        let dailyGoal = userPreferences.targetDailyReviews
        let reviewedToday = getReviewedTodayCount()
        
        dailyGoalProgress = min(1.0, Float(reviewedToday) / Float(dailyGoal))
    }
    
    private func getReviewedTodayCount() -> Int {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())
        
        return flashcards.filter { card in
            guard let lastReviewed = card.lastReviewed else { return false }
            return calendar.startOfDay(for: lastReviewed) == today
        }.count
    }
    
    private func updateMotivationalMessage(quality: Int, wasCorrect: Bool) {
        if wasCorrect {
            if quality >= 4 {
                motivationalMessage = ["Perfect! 🎯", "Excellent! 🌟", "Outstanding! 🚀"].randomElement()!
            } else {
                motivationalMessage = ["Good job! 👍", "Nice work! 💪", "Keep going! 🔥"].randomElement()!
            }
        } else {
            motivationalMessage = ["Don't worry, you'll get it! 💭", "Keep practicing! 📚", "Almost there! 🎯"].randomElement()!
        }
    }
    
    private func generateRecommendation(for area: String) {
        // Generate and show personalized recommendations
        print("Recommendation for \(area)")
    }
    
    private func showInsight(_ insight: String) {
        // Display insight in UI
        print("Insight: \(insight)")
    }
    
    private func getMotivationalQuote() -> String {
        let quotes = [
            "Every expert was once a beginner",
            "Progress, not perfection",
            "Small steps daily lead to big changes",
            "Consistency is the key to mastery",
            "You're closer than you were yesterday"
        ]
        return quotes.randomElement()!
    }
    
    private func setupNotificationObservers() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAppBecameActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
    }
    
    @objc private func handleAppBecameActive() {
        updateDueCards()
        scheduleSmartNotifications()
    }
    
    private func loadUserPreferences() {
        // Load from UserDefaults or Core Data
        if let data = UserDefaults.standard.data(forKey: "userPreferences"),
           let preferences = try? JSONDecoder().decode(UserPreferences.self, from: data) {
            userPreferences = preferences
        }
    }
    
    private func calculateSessionResults() -> SessionResult {
        return SessionResult(
            totalCards: studyStats.totalReviewed,
            correctCards: studyStats.correctCount,
            accuracy: studyStats.totalReviewed > 0 ? Float(studyStats.correctCount) / Float(studyStats.totalReviewed) : 0,
            averageTime: studyStats.averageResponseTime,
            xpGained: studyStats.sessionXP
        )
    }
    
    private func showSessionCompletion(result: SessionResult) {
        // Show completion UI with results
        print("Session completed: \(result)")
    }
    
    private func checkForAchievements() {
        // Check and unlock achievements
        AchievementManager.shared.checkAchievements(
            stats: studyStats,
            streak: studyStreak,
            totalCards: flashcards.count
        )
    }
}

// MARK: - WCSessionDelegate

extension FlashcardViewModel: WCSessionDelegate {
    func session(_ session: WCSession, activationDidCompleteWith activationState: WCSessionActivationState, error: Error?) {
        if activationState == .activated {
            sendToWatch()
        }
    }
    
    func sessionDidBecomeInactive(_ session: WCSession) {}
    
    func sessionDidDeactivate(_ session: WCSession) {
        WCSession.default.activate()
    }
    
    func session(_ session: WCSession, didReceiveMessage message: [String : Any]) {
        if let action = message["action"] as? String {
            switch action {
            case "startReview":
                DispatchQueue.main.async {
                    self.startStudySession()
                }
            case "reviewCard":
                if let quality = message["quality"] as? Int {
                    DispatchQueue.main.async {
                        self.reviewCard(quality: quality, responseTime: 5.0)
                    }
                }
            default:
                break
            }
        }
    }
}

// MARK: - Supporting Types

struct SRSResult {
    let easeFactor: Double
    let interval: Int
    let repetitions: Int
    let nextReview: Date
}

struct ContextualFactors {
    let timeOfDay: Int
    let dayOfWeek: Int
    let sessionLength: TimeInterval
    let ambientNoise: Double
    let cognitiveLoad: Double
}

struct StudyStats {
    var totalReviewed: Int = 0
    var correctCount: Int = 0
    var incorrectCount: Int = 0
    var averageResponseTime: TimeInterval = 0
    var sessionXP: Int = 0
}

struct UserPreferences {
    var studyTimes: [Int] = [9, 14, 19] // Preferred hours
    var targetDailyReviews: Int = 30
    var notificationEnabled: Bool = true
    var hapticFeedback: Bool = true
    var soundEffects: Bool = true
}

enum NotificationPriority: String {
    case high, medium, low
}

// MARK: - Mock Classes (To be implemented)

class PerformanceAnalyzer {
    func recordPerformance(card: Flashcard, quality: Int, responseTime: TimeInterval, factors: ContextualFactors) {}
    func getEaseFactorAdjustment(for card: Flashcard, contextualFactors: ContextualFactors) -> Double { 0.0 }
    func analyzePatterns(flashcards: [Flashcard]) {}
    func identifyWeakAreas() -> [String] { [] }
    func getHistory(for card: Flashcard) -> [PerformanceMetric] { [] }
}

class PatternRecognizer {
    func getPatternAdjustment(for card: Flashcard, in flashcards: [Flashcard]) -> Double { 0.0 }
    func getPatterns(for card: Flashcard) -> [Pattern] { [] }
}

class PredictiveEngine {
    func updatePredictions(for card: Flashcard) {}
    func getOptimalReviewTime(baseInterval: Int, userPreferences: UserPreferences, performanceHistory: [PerformanceMetric]) -> Date { Date() }
    func getForgettingProbability(for card: Flashcard) -> Double { 0.0 }
    func generateOptimalSchedule(flashcards: [Flashcard], userPreferences: UserPreferences, days: Int) -> [[(date: Date, cardCount: Int, priority: NotificationPriority)]] { [] }
    func predictDailyLoad(for date: Date) -> Int { 0 }
}

struct PerformanceMetric {}
struct Pattern {}
struct WidgetData {
    let dueCount: Int
    let streak: Int
    let nextReviewTime: Date?
    let dailyProgress: Float
    let motivationalQuote: String
}

class WidgetDataManager {
    static let shared = WidgetDataManager()
    func save(_ data: WidgetData) {}
}

class CloudSyncManager {
    static let shared = CloudSyncManager()
    func sync(flashcards: [Flashcard]) {}
}

class InsightGenerator {
    static func generate(card: Flashcard, result: SRSResult, performanceHistory: [PerformanceMetric], patternData: [Pattern]) -> [String] { [] }
}

struct SessionResult {
    let totalCards: Int
    let correctCards: Int
    let accuracy: Float
    let averageTime: TimeInterval
    let xpGained: Int
}

class AchievementManager {
    static let shared = AchievementManager()
    
    func checkAchievements(stats: StudyStats, streak: Int, totalCards: Int) {
        // Check various achievement conditions
        if streak >= 7 {
            unlockAchievement("Week Warrior")
        }
        if stats.accuracy >= 0.9 && stats.totalReviewed >= 20 {
            unlockAchievement("Accuracy Master")
        }
        if totalCards >= 100 {
            unlockAchievement("Century Club")
        }
    }
    
    private func unlockAchievement(_ name: String) {
        // Save achievement and show notification
        print("Achievement unlocked: \(name)")
    }
}

// Make UserPreferences Codable for persistence
extension UserPreferences: Codable {}