//
//  FlashcardView.swift
//  Shona App
//
//  Created by AI Assistant on 6/1/2025.
//

import SwiftUI
import SwiftData

struct FlashcardView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var flashcards: [Flashcard]
    @Query private var users: [User]
    
    @State private var currentCard: Flashcard?
    @State private var showAnswer = false
    @State private var isStudying = false
    @State private var sessionStats = SessionStats()
    @State private var studyQueue: [Flashcard] = []
    @State private var startTime: Date?
    @State private var showingStats = false
    
    private var currentUser: User? {
        users.first
    }
    
    private var dueCards: [Flashcard] {
        flashcards.filter { card in
            guard let srsProgress = card.srsProgress else { return true }
            return srsProgress.nextReview <= Date()
        }
    }
    
    private var stats: FlashcardStats {
        calculateStats()
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if isStudying && currentCard != nil {
                    studyView
                } else {
                    homeView
                }
            }
            .navigationTitle("Flashcards")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Stats") {
                        showingStats.toggle()
                    }
                }
            }
            .sheet(isPresented: $showingStats) {
                statsView
            }
        }
    }
    
    private var homeView: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Stats Cards
                LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 15) {
                    StatCard(title: "Total Cards", value: "\(stats.totalCards)", color: .blue)
                    StatCard(title: "Due Today", value: "\(stats.dueCards)", color: .orange)
                    StatCard(title: "Mastered", value: "\(stats.masteredCards)", color: .green)
                    StatCard(title: "Accuracy", value: "\(stats.accuracy)%", color: .purple)
                }
                .padding(.horizontal)
                
                // Study Options
                VStack(spacing: 15) {
                    if !dueCards.isEmpty {
                        StudyOptionCard(
                            title: "Review Due Cards",
                            subtitle: "\(dueCards.count) cards ready for review",
                            color: .blue,
                            action: startStudySession
                        )
                    }
                    
                    StudyOptionCard(
                        title: "Browse All Cards",
                        subtitle: "View and manage your flashcard collection",
                        color: .green,
                        action: { /* Navigate to browse view */ }
                    )
                    
                    StudyOptionCard(
                        title: "Add New Cards",
                        subtitle: "Create custom flashcards from lessons",
                        color: .orange,
                        action: { /* Navigate to add cards view */ }
                    )
                }
                .padding(.horizontal)
                
                if dueCards.isEmpty {
                    VStack(spacing: 15) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 60))
                            .foregroundColor(.green)
                        
                        Text("All Caught Up!")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Text("You've reviewed all your cards. Come back later or add more cards to study.")
                            .font(.body)
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                }
            }
            .padding(.vertical)
        }
        .background(Color(.systemGroupedBackground))
    }
    
    private var studyView: some View {
        VStack {
            // Progress Header
            VStack(spacing: 10) {
                HStack {
                    Text("Card \(sessionStats.totalReviewed + 1) of \(studyQueue.count + sessionStats.totalReviewed)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    HStack(spacing: 15) {
                        Label("\(sessionStats.correct)", systemImage: "checkmark.circle.fill")
                            .font(.caption)
                            .foregroundColor(.green)
                        
                        Label("\(sessionStats.incorrect)", systemImage: "xmark.circle.fill")
                            .font(.caption)
                            .foregroundColor(.red)
                    }
                }
                
                ProgressView(value: Double(sessionStats.totalReviewed), total: Double(studyQueue.count + sessionStats.totalReviewed))
                    .progressViewStyle(LinearProgressViewStyle())
            }
            .padding()
            .background(Color(.systemBackground))
            
            // Flashcard
            if let card = currentCard {
                VStack(spacing: 0) {
                    // Card Content
                    VStack(spacing: 20) {
                        // Difficulty Badge
                        DifficultyBadge(difficulty: card.difficulty)
                        
                        // Shona Text
                        Text(card.shonaText)
                            .font(.largeTitle)
                            .fontWeight(.bold)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        
                        // Pronunciation
                        if let pronunciation = card.pronunciation {
                            Text("/\(pronunciation)/")
                                .font(.title3)
                                .foregroundColor(.secondary)
                        }
                        
                        // Context
                        if let context = card.context {
                            Text(""\(context)"")
                                .font(.body)
                                .italic()
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }
                        
                        Spacer()
                        
                        // Answer Section
                        if !showAnswer {
                            Button("Show Answer") {
                                withAnimation(.spring()) {
                                    showAnswer = true
                                }
                            }
                            .buttonStyle(PrimaryButtonStyle())
                        } else {
                            VStack(spacing: 20) {
                                // English Translation
                                Text(card.englishText)
                                    .font(.title2)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.green)
                                    .multilineTextAlignment(.center)
                                    .padding(.horizontal)
                                
                                // Quality Buttons
                                VStack(spacing: 10) {
                                    Text("How well did you know this word?")
                                        .font(.body)
                                        .foregroundColor(.secondary)
                                    
                                    HStack(spacing: 10) {
                                        QualityButton(title: "Again", color: .red) {
                                            reviewCard(quality: 1, wasCorrect: false)
                                        }
                                        QualityButton(title: "Hard", color: .orange) {
                                            reviewCard(quality: 2, wasCorrect: false)
                                        }
                                        QualityButton(title: "Good", color: .yellow) {
                                            reviewCard(quality: 3, wasCorrect: true)
                                        }
                                        QualityButton(title: "Easy", color: .green) {
                                            reviewCard(quality: 4, wasCorrect: true)
                                        }
                                    }
                                }
                            }
                        }
                        
                        Spacer()
                    }
                    .padding()
                }
            }
            
            Spacer()
        }
        .background(Color(.systemGroupedBackground))
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button("End Session") {
                    endStudySession()
                }
                .foregroundColor(.red)
            }
        }
    }
    
    private var statsView: some View {
        NavigationView {
            VStack(spacing: 20) {
                // Detailed Stats
                VStack(spacing: 15) {
                    StatRow(title: "Total Cards", value: "\(stats.totalCards)")
                    StatRow(title: "Due Today", value: "\(stats.dueCards)")
                    StatRow(title: "New Cards", value: "\(stats.newCards)")
                    StatRow(title: "Reviewed Today", value: "\(stats.reviewedToday)")
                    StatRow(title: "Accuracy", value: "\(stats.accuracy)%")
                    StatRow(title: "Current Streak", value: "\(stats.streakDays) days")
                    StatRow(title: "Mastered Cards", value: "\(stats.masteredCards)")
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                
                Spacer()
            }
            .padding()
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Statistics")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        showingStats = false
                    }
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private func startStudySession() {
        guard let user = currentUser else { return }
        
        studyQueue = Array(dueCards.prefix(20)) // Limit to 20 cards per session
        sessionStats = SessionStats()
        startTime = Date()
        isStudying = true
        
        if let firstCard = studyQueue.first {
            currentCard = firstCard
            studyQueue.removeFirst()
        }
        
        // Request notification permissions
        requestNotificationPermissions()
    }
    
    private func reviewCard(quality: Int, wasCorrect: Bool) {
        guard let card = currentCard, let user = currentUser else { return }
        
        let responseTime = startTime != nil ? Date().timeIntervalSince(startTime!) : 0
        
        // Update SRS progress
        updateSRSProgress(card: card, quality: quality, responseTime: responseTime, wasCorrect: wasCorrect)
        
        // Update session stats
        sessionStats.totalReviewed += 1
        if wasCorrect {
            sessionStats.correct += 1
        } else {
            sessionStats.incorrect += 1
        }
        
        // Move to next card or end session
        if let nextCard = studyQueue.first {
            currentCard = nextCard
            studyQueue.removeFirst()
            showAnswer = false
            startTime = Date()
        } else {
            endStudySession()
        }
    }
    
    private func endStudySession() {
        isStudying = false
        currentCard = nil
        showAnswer = false
        startTime = nil
        
        // Show completion feedback
        // This could be enhanced with a completion modal
    }
    
    private func updateSRSProgress(card: Flashcard, quality: Int, responseTime: TimeInterval, wasCorrect: Bool) {
        guard let srsProgress = card.srsProgress else { return }
        
        // Simple SRS algorithm (simplified version)
        let newEaseFactor = max(1.3, srsProgress.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
        
        let newInterval: Int
        let newRepetitions: Int
        
        if quality < 3 {
            newInterval = 1
            newRepetitions = 0
        } else {
            newRepetitions = srsProgress.repetitions + 1
            if newRepetitions == 1 {
                newInterval = 1
            } else if newRepetitions == 2 {
                newInterval = 6
            } else {
                newInterval = Int(Double(srsProgress.interval) * newEaseFactor)
            }
        }
        
        srsProgress.easeFactor = newEaseFactor
        srsProgress.interval = newInterval
        srsProgress.repetitions = newRepetitions
        srsProgress.lastReview = Date()
        srsProgress.nextReview = Calendar.current.date(byAdding: .day, value: newInterval, to: Date()) ?? Date()
        srsProgress.quality = quality
        srsProgress.totalReviews += 1
        srsProgress.correctStreak = wasCorrect ? srsProgress.correctStreak + 1 : 0
        srsProgress.wrongStreak = wasCorrect ? 0 : srsProgress.wrongStreak + 1
        srsProgress.averageTime = ((srsProgress.averageTime * Double(srsProgress.totalReviews - 1)) + responseTime) / Double(srsProgress.totalReviews)
        
        card.lastReviewed = Date()
        
        try? modelContext.save()
    }
    
    private func calculateStats() -> FlashcardStats {
        let totalCards = flashcards.count
        let dueCards = self.dueCards.count
        let newCards = flashcards.filter { $0.srsProgress?.totalReviews == 0 }.count
        
        let today = Calendar.current.startOfDay(for: Date())
        let reviewedToday = flashcards.filter { card in
            guard let lastReviewed = card.lastReviewed else { return false }
            return Calendar.current.startOfDay(for: lastReviewed) == today
        }.count
        
        let totalReviews = flashcards.compactMap { $0.srsProgress?.totalReviews }.reduce(0, +)
        let correctReviews = flashcards.compactMap { card in
            guard let srsProgress = card.srsProgress else { return 0 }
            return srsProgress.quality >= 3 ? srsProgress.totalReviews : 0
        }.reduce(0, +)
        
        let accuracy = totalReviews > 0 ? (correctReviews * 100) / totalReviews : 0
        
        let streakDays = flashcards.compactMap { $0.srsProgress?.correctStreak }.max() ?? 0
        let masteredCards = flashcards.filter { $0.srsProgress?.interval ?? 0 >= 30 }.count
        
        return FlashcardStats(
            totalCards: totalCards,
            dueCards: dueCards,
            newCards: newCards,
            reviewedToday: reviewedToday,
            accuracy: accuracy,
            streakDays: streakDays,
            masteredCards: masteredCards
        )
    }
    
    private func requestNotificationPermissions() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                // Schedule notifications
                scheduleReviewNotifications()
            }
        }
    }
    
    private func scheduleReviewNotifications() {
        let center = UNUserNotificationCenter.current()
        center.removeAllPendingNotificationRequests()
        
        // Schedule notifications for the next 7 days
        for i in 1...7 {
            let date = Calendar.current.date(byAdding: .day, value: i, to: Date()) ?? Date()
            let cardsForDay = flashcards.filter { card in
                guard let nextReview = card.srsProgress?.nextReview else { return false }
                return Calendar.current.isDate(nextReview, inSameDayAs: date)
            }
            
            if !cardsForDay.isEmpty {
                let content = UNMutableNotificationContent()
                content.title = "Time to review Shona! 📚"
                content.body = "You have \(cardsForDay.count) cards ready for review"
                content.sound = UNNotificationSound.default
                content.badge = NSNumber(value: cardsForDay.count)
                
                var dateComponents = Calendar.current.dateComponents([.year, .month, .day], from: date)
                dateComponents.hour = 10 // 10 AM
                dateComponents.minute = 0
                
                let trigger = UNCalendarNotificationTrigger(dateMatching: dateComponents, repeats: false)
                let request = UNNotificationRequest(identifier: "flashcard-review-\(i)", content: content, trigger: trigger)
                
                center.add(request)
            }
        }
    }
}

// MARK: - Supporting Views

struct StatCard: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 5) {
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

struct StudyOptionCard: View {
    let title: String
    let subtitle: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                VStack(alignment: .leading, spacing: 5) {
                    Text(title)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(radius: 2)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct DifficultyBadge: View {
    let difficulty: Double
    
    private var difficultyInfo: (String, Color) {
        if difficulty < 0.3 {
            return ("Easy", .green)
        } else if difficulty < 0.7 {
            return ("Medium", .yellow)
        } else {
            return ("Hard", .red)
        }
    }
    
    var body: some View {
        let (text, color) = difficultyInfo
        
        Text(text)
            .font(.caption)
            .fontWeight(.medium)
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .background(color.opacity(0.2))
            .foregroundColor(color)
            .cornerRadius(12)
    }
}

struct QualityButton: View {
    let title: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.caption)
                .fontWeight(.medium)
                .padding(.horizontal, 12)
                .padding(.vertical, 8)
                .background(color)
                .foregroundColor(.white)
                .cornerRadius(8)
        }
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .padding()
            .background(Color.blue)
            .foregroundColor(.white)
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
    }
}

struct StatRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .foregroundColor(.primary)
            
            Spacer()
            
            Text(value)
                .fontWeight(.medium)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 2)
    }
}

// MARK: - Data Models

struct SessionStats {
    var correct: Int = 0
    var incorrect: Int = 0
    var totalReviewed: Int = 0
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

#Preview {
    FlashcardView()
        .modelContainer(for: [User.self, Flashcard.self, SRSProgress.self], inMemory: true)
}