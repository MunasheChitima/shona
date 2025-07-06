import Foundation
import SwiftUI

class FlashcardManager: ObservableObject {
    @Published var flashcards: [Flashcard] = []
    @Published var dueCards: [Flashcard] = []
    @Published var newCards: [Flashcard] = []
    @Published var currentCard: Flashcard?
    @Published var currentSession: ReviewSession?
    @Published var statistics: StudyStatistics = StudyStatistics()
    @Published var settings: UserSettings = UserSettings()
    
    private let vocabularyLoader = VocabularyDataLoader.shared
    private let reviewScheduler = ReviewScheduler.shared
    
    // MARK: - Computed Properties
    var reviewCount: Int {
        dueCards.count
    }
    
    var newCount: Int {
        newCards.count
    }
    
    var streakCount: Int {
        statistics.currentStreak
    }
    
    var totalCards: Int {
        flashcards.count
    }
    
    var accuracy: Double {
        statistics.accuracy
    }
    
    init() {
        loadSettings()
        loadStatistics()
        loadFlashcards()
    }
    
    // MARK: - Data Loading
    func loadFlashcards() {
        let allCards = vocabularyLoader.loadVocabularyData()
        
        // Filter by user's selected categories and difficulty
        flashcards = allCards.filter { card in
            settings.selectedCategories.contains(card.category) &&
            isDifficultyAppropriate(card.difficulty)
        }
        
        updateCardQueues()
    }
    
    private func isDifficultyAppropriate(_ difficulty: Double) -> Bool {
        switch settings.difficultyLevel {
        case "Beginner":
            return difficulty <= 3.0
        case "Intermediate":
            return difficulty <= 6.0
        case "Advanced":
            return difficulty <= 8.0
        default:
            return true
        }
    }
    
    private func updateCardQueues() {
        let now = Date()
        
        // Due cards (cards that need review)
        dueCards = flashcards.filter { card in
            guard let srsProgress = card.srsProgress else { return false }
            return srsProgress.nextReview <= now
        }.shuffled()
        
        // New cards (cards never reviewed)
        newCards = flashcards.filter { card in
            guard let srsProgress = card.srsProgress else { return true }
            return srsProgress.totalReviews == 0
        }.shuffled()
        
        // Limit new cards per day
        if newCards.count > settings.maxNewCardsPerDay {
            newCards = Array(newCards.prefix(settings.maxNewCardsPerDay))
        }
        
        // Limit reviews per day
        if dueCards.count > settings.maxReviewsPerDay {
            dueCards = Array(dueCards.prefix(settings.maxReviewsPerDay))
        }
    }
    
    // MARK: - Session Management
    func startSession() {
        currentSession = ReviewSession()
        getNextCard()
    }
    
    func getNextCard() {
        // Prioritize due cards over new cards
        if !dueCards.isEmpty {
            currentCard = dueCards.removeFirst()
        } else if !newCards.isEmpty {
            currentCard = newCards.removeFirst()
        } else {
            currentCard = nil
            endSession()
        }
    }
    
    func reviewCard(result: ReviewResult, responseTime: TimeInterval) {
        guard let card = currentCard,
              var session = currentSession else { return }
        
        // Update session stats
        session.totalReviewed += 1
        session.timeSpent += responseTime
        session.cards.append(card.id)
        
        if result.qualityScore >= 3 {
            session.correct += 1
        } else {
            session.incorrect += 1
        }
        
        currentSession = session
        
        // Update card's SRS progress
        if let cardIndex = flashcards.firstIndex(where: { $0.id == card.id }) {
            flashcards[cardIndex].srsProgress?.updateAfterReview(
                quality: result.qualityScore,
                responseTime: responseTime
            )
        }
        
        // Update statistics
        updateStatistics(result: result, responseTime: responseTime)
        
        // Get next card
        getNextCard()
        
        // Save progress
        saveProgress()
    }
    
    func endSession() {
        guard var session = currentSession else { return }
        
        session.endTime = Date()
        currentSession = session
        
        // Update streak
        if session.totalReviewed > 0 {
            updateStreak()
        }
        
        // Save session data
        saveSession(session)
        
        // Clean up
        currentCard = nil
        currentSession = nil
        
        // Schedule notifications
        reviewScheduler.scheduleReviewNotifications(for: flashcards)
    }
    
    // MARK: - Statistics
    private func updateStatistics(result: ReviewResult, responseTime: TimeInterval) {
        statistics.totalCardsReviewed += 1
        statistics.totalStudyTime += responseTime
        
        if result.qualityScore >= 3 {
            statistics.totalCorrect += 1
        } else {
            statistics.totalIncorrect += 1
        }
        
        statistics.averageAccuracy = statistics.accuracy
        statistics.lastStudyDate = Date()
    }
    
    private func updateStreak() {
        let today = Calendar.current.startOfDay(for: Date())
        let lastStudyDate = statistics.lastStudyDate ?? Date.distantPast
        let lastStudyDay = Calendar.current.startOfDay(for: lastStudyDate)
        
        if Calendar.current.isDate(lastStudyDay, inSameDayAs: today) {
            // Already studied today, don't increment streak
            return
        }
        
        let daysBetween = Calendar.current.dateComponents([.day], from: lastStudyDay, to: today).day ?? 0
        
        if daysBetween == 1 {
            // Consecutive day
            statistics.currentStreak += 1
        } else if daysBetween > 1 {
            // Streak broken
            statistics.currentStreak = 1
        }
        
        if statistics.currentStreak > statistics.longestStreak {
            statistics.longestStreak = statistics.currentStreak
        }
        
        statistics.studyDays += 1
    }
    
    // MARK: - Settings
    func updateSettings(_ newSettings: UserSettings) {
        settings = newSettings
        saveSettings()
        loadFlashcards() // Reload with new settings
    }
    
    // MARK: - Persistence
    private func saveProgress() {
        // Save flashcards with updated SRS progress
        if let encoded = try? JSONEncoder().encode(flashcards) {
            UserDefaults.standard.set(encoded, forKey: "flashcards")
        }
    }
    
    private func saveStatistics() {
        if let encoded = try? JSONEncoder().encode(statistics) {
            UserDefaults.standard.set(encoded, forKey: "statistics")
        }
    }
    
    private func saveSettings() {
        if let encoded = try? JSONEncoder().encode(settings) {
            UserDefaults.standard.set(encoded, forKey: "settings")
        }
    }
    
    private func saveSession(_ session: ReviewSession) {
        // Save session for history/analytics
        var sessions = loadSessions()
        sessions.append(session)
        
        // Keep only last 30 sessions
        if sessions.count > 30 {
            sessions = Array(sessions.suffix(30))
        }
        
        if let encoded = try? JSONEncoder().encode(sessions) {
            UserDefaults.standard.set(encoded, forKey: "sessions")
        }
    }
    
    private func loadStatistics() {
        if let data = UserDefaults.standard.data(forKey: "statistics"),
           let decoded = try? JSONDecoder().decode(StudyStatistics.self, from: data) {
            statistics = decoded
        }
    }
    
    private func loadSettings() {
        if let data = UserDefaults.standard.data(forKey: "settings"),
           let decoded = try? JSONDecoder().decode(UserSettings.self, from: data) {
            settings = decoded
        }
    }
    
    private func loadSessions() -> [ReviewSession] {
        if let data = UserDefaults.standard.data(forKey: "sessions"),
           let decoded = try? JSONDecoder().decode([ReviewSession].self, from: data) {
            return decoded
        }
        return []
    }
    
    // MARK: - Utility Methods
    func getFlashcardsByCategory(_ category: String) -> [Flashcard] {
        return flashcards.filter { $0.category == category }
    }
    
    func getRecentSessions() -> [ReviewSession] {
        return loadSessions().reversed()
    }
    
    func resetProgress() {
        UserDefaults.standard.removeObject(forKey: "flashcards")
        UserDefaults.standard.removeObject(forKey: "statistics")
        UserDefaults.standard.removeObject(forKey: "sessions")
        
        statistics = StudyStatistics()
        loadFlashcards()
    }
    
    func exportData() -> String {
        let data = [
            "flashcards": flashcards,
            "statistics": statistics,
            "settings": settings
        ] as [String: Any]
        
        if let jsonData = try? JSONSerialization.data(withJSONObject: data, options: .prettyPrinted),
           let jsonString = String(data: jsonData, encoding: .utf8) {
            return jsonString
        }
        
        return "Export failed"
    }
}

// MARK: - Extensions
extension FlashcardManager {
    func getDailyProgress() -> Double {
        let today = Calendar.current.startOfDay(for: Date())
        let sessions = loadSessions().filter { session in
            Calendar.current.isDate(session.startTime, inSameDayAs: today)
        }
        
        let todayReviewed = sessions.reduce(0) { $0 + $1.totalReviewed }
        return min(Double(todayReviewed) / Double(settings.dailyGoal), 1.0)
    }
    
    func getWeeklyStats() -> [Int] {
        let calendar = Calendar.current
        let today = Date()
        let sessions = loadSessions()
        
        return (0..<7).map { dayOffset in
            let date = calendar.date(byAdding: .day, value: -dayOffset, to: today) ?? today
            let dayStart = calendar.startOfDay(for: date)
            let dayEnd = calendar.date(byAdding: .day, value: 1, to: dayStart) ?? dayStart
            
            return sessions.filter { session in
                session.startTime >= dayStart && session.startTime < dayEnd
            }.reduce(0) { $0 + $1.totalReviewed }
        }.reversed()
    }
}