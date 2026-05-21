import SwiftUI
import AVFoundation

struct FlashcardView: View {
    @StateObject private var flashcardManager = FlashcardManager()
    @StateObject private var speechSynthesizer = SpeechSynthesizer()
    @ObservedObject var gamification = GamificationService.shared
    @ObservedObject var audio = AudioPronunciationService.shared
    
    // Card states
    @State private var showingAnswer = false
    @State private var startTime = Date()
    @State private var sessionStarted = false
    @State private var currentCard: Flashcard?
    
    // UI states
    @State private var showingPronunciationGuide = false
    @State private var showingCulturalContext = false
    @State private var showingMinimalPairs = false
    @State private var cardRotation: Double = 0
    @State private var cardScale: CGFloat = 1.0
    @State private var glowAmount: CGFloat = 0
    @State private var particleEmission = false
    @State private var showingAchievement: Achievement? = nil
    @State private var comboCount = 0
    @State private var perfectStreak = 0
    
    // Animation
    @State private var flipAnimation = false
    @State private var bounceAnimation = false
    @State private var pulseAnimation = false
    
    // Colors based on performance
    private var cardGradient: LinearGradient {
        if perfectStreak > 5 {
            return LinearGradient(
                colors: [Color.yellow.opacity(0.3), Color.orange.opacity(0.5)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        } else if comboCount > 3 {
            return LinearGradient(
                colors: [Color.blue.opacity(0.3), Color.purple.opacity(0.5)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        } else {
            return LinearGradient(
                colors: [Color.gray.opacity(0.1), Color.gray.opacity(0.2)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
    
    var body: some View {
        ZStack {
            // Background with subtle animation
            RadialGradient(
                colors: [Color.orange.opacity(0.1), Color.clear],
                center: .center,
                startRadius: 5,
                endRadius: 200
            )
            .ignoresSafeArea()
            .animation(.easeInOut(duration: 2).repeatForever(autoreverses: true), value: glowAmount)
            
            VStack(spacing: 0) {
                // Top bar with stats
                topStatsBar
                
                ScrollView {
                    VStack(spacing: 16) {
                        if let card = flashcardManager.currentCard {
                            // Main card
                            cardView(card: card)
                                .rotation3DEffect(
                                    .degrees(cardRotation),
                                    axis: (x: 0, y: 1, z: 0)
                                )
                                .scaleEffect(cardScale)
                                .animation(.spring(response: 0.5, dampingFraction: 0.6), value: cardScale)
                            
                            // Action buttons based on state
                            if !showingAnswer {
                                showAnswerButton
                            } else {
                                reviewButtons
                                additionalContentSection(card: card)
                            }
                            
                        } else {
                            sessionCompletedView
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("")
        .navigationBarHidden(true)
        .onAppear {
            startSession()
        }
        .onDisappear {
            flashcardManager.endSession()
        }
        .sheet(item: $showingAchievement) { achievement in
            AchievementUnlockedView(achievement: achievement)
        }
    }
    
    // MARK: - Top Stats Bar
    private var topStatsBar: some View {
        HStack {
            // Level and XP
            VStack(alignment: .leading, spacing: 2) {
                Text("Level \(gamification.userLevel)")
                    .font(.caption2)
                    .fontWeight(.bold)
                
                ProgressView(value: Double(gamification.currentXP), total: 1000)
                    .progressViewStyle(LinearProgressViewStyle(tint: .orange))
                    .frame(width: 60, height: 4)
            }
            
            Spacer()
            
            // Streak
            HStack(spacing: 4) {
                Image(systemName: "flame.fill")
                    .foregroundColor(flashcardManager.streakCount > 0 ? .orange : .gray)
                    .font(.system(size: 14))
                
                Text("\(flashcardManager.streakCount)")
                    .font(.caption)
                    .fontWeight(.bold)
            }
            
            // Combo
            if comboCount > 0 {
                HStack(spacing: 4) {
                    Image(systemName: "sparkles")
                        .foregroundColor(.yellow)
                        .font(.system(size: 12))
                    
                    Text("×\(comboCount)")
                        .font(.caption)
                        .fontWeight(.bold)
                        .foregroundColor(.yellow)
                }
                .transition(.scale.combined(with: .opacity))
            }
            
            Spacer()
            
            // Progress
            if let session = flashcardManager.currentSession {
                Text("\(session.totalReviewed)/\(flashcardManager.dueCards.count + flashcardManager.newCards.count)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(Color.black.opacity(0.1))
    }
    
    // MARK: - Card View
    private func cardView(card: Flashcard) -> some View {
        VStack(spacing: 0) {
            // Card header
            HStack {
                categoryBadge(card.category)
                
                Spacer()
                
                difficultyIndicator(card.difficulty)
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            
            // Card content
            VStack(spacing: 16) {
                if !showingAnswer {
                    questionSide(card: card)
                } else {
                    answerSide(card: card)
                }
            }
            .padding(20)
        }
        .background(cardGradient)
        .cornerRadius(20)
        .shadow(color: Color.black.opacity(0.1), radius: 10, x: 0, y: 5)
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(perfectStreak > 0 ? Color.yellow.opacity(0.5) : Color.clear, lineWidth: 2)
                .animation(.easeInOut(duration: 0.5), value: perfectStreak)
        )
    }
    
    private func questionSide(card: Flashcard) -> some View {
        VStack(spacing: 12) {
            // Shona text with audio button
            HStack(spacing: 12) {
                Text(card.shonaText)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.primary)
                    .multilineTextAlignment(.center)
                
                Button(action: {
                    pronounceWord(card)
                    pulseAnimation.toggle()
                }) {
                    Image(systemName: audio.isSpeaking ? "speaker.wave.3.fill" : "speaker.wave.2.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.orange)
                        .scaleEffect(pulseAnimation ? 1.2 : 1.0)
                        .animation(.easeInOut(duration: 0.3), value: pulseAnimation)
                }
            }
            
            // Tone pattern visualization
            if let tonePattern = card.tonePattern {
                TonePatternView(pattern: tonePattern)
                    .frame(height: 30)
            }
            
            // Hint section
            if let examples = card.examples, !examples.isEmpty {
                Text("Hint: Used in '\(examples.first?.context ?? "")'")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .italic()
            }
        }
    }
    
    private func answerSide(card: Flashcard) -> some View {
        VStack(spacing: 16) {
            // Shona text (smaller)
            Text(card.shonaText)
                .font(.system(size: 20, weight: .semibold))
                .foregroundColor(.secondary)
            
            // English translation
            Text(card.englishText)
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(.blue)
                .multilineTextAlignment(.center)
            
            // Pronunciation guide
            if let pronunciation = card.pronunciation {
                VStack(spacing: 4) {
                    HStack(spacing: 8) {
                        Text(pronunciation)
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.orange)
                        
                        Button(action: {
                            showingPronunciationGuide.toggle()
                        }) {
                            Image(systemName: "info.circle")
                                .font(.system(size: 14))
                                .foregroundColor(.orange)
                        }
                    }
                    
                    if let phonetic = card.phonetic {
                        Text(phonetic)
                            .font(.system(size: 14, weight: .regular, design: .monospaced))
                            .foregroundColor(.secondary)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.orange.opacity(0.1))
                .cornerRadius(12)
            }
            
            // Cultural significance badge
            if card.culturalNotes != nil {
                HStack(spacing: 4) {
                    Image(systemName: "info.circle.fill")
                        .font(.system(size: 12))
                    Text("Cultural context available")
                        .font(.caption)
                }
                .foregroundColor(.purple)
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.purple.opacity(0.1))
                .cornerRadius(8)
            }
        }
    }
    
    // MARK: - Additional Content Section
    private func additionalContentSection(card: Flashcard) -> some View {
        VStack(spacing: 12) {
            // Examples
            if let examples = card.examples, !examples.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Label("Examples", systemImage: "quote.bubble")
                        .font(.headline)
                        .foregroundColor(.orange)
                    
                    ForEach(examples, id: \.id) { example in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(example.shona)
                                .font(.system(size: 14, weight: .medium))
                                .foregroundColor(.primary)
                            
                            Text(example.english)
                                .font(.caption)
                                .foregroundColor(.secondary)
                            
                            if let note = example.culturalNote {
                                Text(note)
                                    .font(.caption2)
                                    .foregroundColor(.purple)
                                    .italic()
                            }
                        }
                        .padding(12)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(8)
                    }
                }
            }
            
            // Action buttons
            HStack(spacing: 12) {
                if card.culturalNotes != nil {
                    Button(action: {
                        showingCulturalContext.toggle()
                    }) {
                        Label("Culture", systemImage: "globe.africa.fill")
                            .font(.caption)
                    }
                    .buttonStyle(.bordered)
                    .tint(.purple)
                }
                
                Button(action: {
                    showingPronunciationGuide.toggle()
                }) {
                    Label("Practice", systemImage: "mic")
                        .font(.caption)
                }
                .buttonStyle(.bordered)
                .tint(.orange)
                
                if hasMinimalPairs(for: card) {
                    Button(action: {
                        showingMinimalPairs.toggle()
                    }) {
                        Label("Compare", systemImage: "arrow.left.and.right")
                            .font(.caption)
                    }
                    .buttonStyle(.bordered)
                    .tint(.blue)
                }
            }
        }
        .sheet(isPresented: $showingCulturalContext) {
            if let card = flashcardManager.currentCard {
                CulturalContextView(card: card)
            }
        }
        .sheet(isPresented: $showingPronunciationGuide) {
            if let card = flashcardManager.currentCard {
                PronunciationPracticeView(card: card)
            }
        }
    }
    
    // MARK: - Buttons
    private var showAnswerButton: some View {
        Button(action: {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.8)) {
                showingAnswer = true
                cardRotation = 180
                hapticFeedback(.click)
            }
        }) {
            HStack {
                Text("Show Answer")
                    .font(.headline)
                Image(systemName: "arrow.forward.circle.fill")
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(
                LinearGradient(
                    colors: [Color.orange, Color.orange.opacity(0.8)],
                    startPoint: .leading,
                    endPoint: .trailing
                )
            )
            .foregroundColor(.white)
            .cornerRadius(16)
            .shadow(color: Color.orange.opacity(0.3), radius: 8, x: 0, y: 4)
        }
        .scaleEffect(bounceAnimation ? 1.05 : 1.0)
        .onAppear {
            withAnimation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true)) {
                bounceAnimation = true
            }
        }
    }
    
    private var reviewButtons: some View {
        VStack(spacing: 12) {
            Text("How well did you know this?")
                .font(.headline)
                .foregroundColor(.secondary)
            
            HStack(spacing: 8) {
                reviewButton(
                    title: "Again",
                    subtitle: "< 1 min",
                    color: .red,
                    icon: "xmark.circle.fill",
                    result: .again
                )
                
                reviewButton(
                    title: "Hard",
                    subtitle: "< 6 min",
                    color: .orange,
                    icon: "exclamationmark.circle.fill",
                    result: .hard
                )
            }
            
            HStack(spacing: 8) {
                reviewButton(
                    title: "Good",
                    subtitle: "< 10 min",
                    color: .green,
                    icon: "checkmark.circle.fill",
                    result: .good
                )
                
                reviewButton(
                    title: "Easy",
                    subtitle: "4 days",
                    color: .blue,
                    icon: "star.circle.fill",
                    result: .easy
                )
            }
        }
    }
    
    private func reviewButton(title: String, subtitle: String, color: Color, icon: String, result: ReviewResult) -> some View {
        Button(action: {
            reviewCard(result)
        }) {
            VStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.system(size: 24))
                Text(title)
                    .font(.caption)
                    .fontWeight(.semibold)
                Text(subtitle)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(color.opacity(0.15))
            .foregroundColor(color)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(color.opacity(0.3), lineWidth: 1)
            )
        }
        .buttonStyle(ScaleButtonStyle())
    }
    
    // MARK: - Session Completed View
    private var sessionCompletedView: some View {
        VStack(spacing: 24) {
            // Celebration
            ZStack {
                ForEach(0..<6, id: \.self) { index in
                    Image(systemName: "star.fill")
                        .font(.system(size: 20))
                        .foregroundColor(.yellow)
                        .offset(
                            x: cos(CGFloat(index) * .pi / 3) * 50,
                            y: sin(CGFloat(index) * .pi / 3) * 50
                        )
                        .rotationEffect(.degrees(Double(index) * 60))
                        .opacity(particleEmission ? 0 : 1)
                        .scaleEffect(particleEmission ? 2 : 0.5)
                        .animation(
                            .easeOut(duration: 1.5)
                            .delay(Double(index) * 0.1),
                            value: particleEmission
                        )
                }
                
                Image(systemName: "checkmark.seal.fill")
                    .font(.system(size: 60))
                    .foregroundColor(.green)
                    .scaleEffect(cardScale)
                    .onAppear {
                        withAnimation(.spring(response: 0.5, dampingFraction: 0.6)) {
                            cardScale = 1.2
                        }
                        particleEmission = true
                    }
            }
            
            Text("Zvakanaka! Well Done!")
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            // Session stats
            if let session = flashcardManager.currentSession {
                SessionStatsView(session: session)
            }
            
            // XP earned
            if gamification.currentXP > 0 {
                HStack {
                    Image(systemName: "star.circle.fill")
                        .foregroundColor(.yellow)
                    Text("+\(calculateSessionXP()) XP")
                        .font(.headline)
                        .foregroundColor(.yellow)
                }
                .padding()
                .background(Color.yellow.opacity(0.1))
                .cornerRadius(12)
            }
            
            // New achievement unlocked
            if let achievement = checkForNewAchievements() {
                Button(action: {
                    showingAchievement = achievement
                }) {
                    HStack {
                        Image(systemName: achievement.icon)
                            .foregroundColor(.purple)
                        VStack(alignment: .leading) {
                            Text("New Achievement!")
                                .font(.caption)
                                .foregroundColor(.secondary)
                            Text(achievement.title)
                                .font(.headline)
                                .foregroundColor(.purple)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(.purple)
                    }
                    .padding()
                    .background(Color.purple.opacity(0.1))
                    .cornerRadius(12)
                }
            }
            
            // Continue button
            Button(action: {
                flashcardManager.startSession()
                resetStates()
            }) {
                Text("Continue Learning")
                    .font(.headline)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.orange)
                    .foregroundColor(.white)
                    .cornerRadius(16)
            }
        }
        .padding()
    }
    
    // MARK: - Helper Views
    private func categoryBadge(_ category: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: categoryIcon(for: category))
                .font(.system(size: 12))
            Text(category)
                .font(.caption2)
                .fontWeight(.medium)
        }
        .foregroundColor(categoryColor(for: category))
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(categoryColor(for: category).opacity(0.15))
        .cornerRadius(8)
    }
    
    private func difficultyIndicator(_ difficulty: Double) -> some View {
        HStack(spacing: 2) {
            ForEach(0..<5) { index in
                Circle()
                    .fill(Double(index) < difficulty / 2 ? Color.orange : Color.gray.opacity(0.3))
                    .frame(width: 6, height: 6)
            }
        }
    }
    
    // MARK: - Helper Methods
    private func startSession() {
        if !sessionStarted {
            flashcardManager.startSession()
            sessionStarted = true
            startTime = Date()
            glowAmount = 1
        }
    }
    
    private func reviewCard(_ result: ReviewResult) {
        let responseTime = Date().timeIntervalSince(startTime)
        
        // Update combo
        if result == .good || result == .easy {
            comboCount += 1
            if result == .easy {
                perfectStreak += 1
            }
        } else {
            comboCount = 0
            perfectStreak = 0
        }
        
        // Award XP
        let baseXP = result == .easy ? 20 : (result == .good ? 15 : 10)
        let comboBonus = min(comboCount * 2, 10)
        let totalXP = baseXP + comboBonus
        
        gamification.awardXP(totalXP, reason: .cardReview(correct: result == .good || result == .easy))
        
        // Review card
        flashcardManager.reviewCard(result: result, responseTime: responseTime)
        
        // Haptic feedback
        hapticFeedback(result == .easy || result == .good ? .success : .warning)
        
        // Reset for next card
        withAnimation(.spring()) {
            showingAnswer = false
            cardRotation = 0
            startTime = Date()
            cardScale = 0.9
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.2) {
            withAnimation(.spring()) {
                cardScale = 1.0
            }
        }
    }
    
    private func pronounceWord(_ card: Flashcard) {
        if let tonePattern = card.tonePattern {
            audio.pronounce(card.shonaText, tonePattern: tonePattern)
        } else {
            speechSynthesizer.speak(card.shonaText)
        }
    }
    
    private func hasMinimalPairs(for card: Flashcard) -> Bool {
        // Check if there are similar words for comparison
        return false // Implement based on your data
    }
    
    private func calculateSessionXP() -> Int {
        guard let session = flashcardManager.currentSession else { return 0 }
        let accuracy = Double(session.correct) / Double(max(session.totalReviewed, 1))
        return Int(Double(session.totalReviewed) * 10 * accuracy)
    }
    
    private func checkForNewAchievements() -> Achievement? {
        // Check and return any newly unlocked achievements
        for achievement in gamification.achievements {
            if gamification.checkAchievement(achievement) && !gamification.unlockedAchievements.contains(achievement.id) {
                gamification.unlockAchievement(achievement)
                return achievement
            }
        }
        return nil
    }
    
    private func resetStates() {
        showingAnswer = false
        cardRotation = 0
        cardScale = 1.0
        particleEmission = false
        comboCount = 0
        perfectStreak = 0
    }
    
    private func categoryIcon(for category: String) -> String {
        switch category.lowercased() {
        case "greetings": return "hand.raised"
        case "family": return "person.2"
        case "numbers": return "number"
        case "food": return "fork.knife"
        case "colors": return "paintbrush"
        case "animals": return "hare"
        case "transportation": return "car"
        case "work": return "briefcase"
        case "body": return "figure.stand"
        case "nature": return "leaf"
        case "health": return "heart"
        default: return "folder"
        }
    }
    
    private func categoryColor(for category: String) -> Color {
        switch category.lowercased() {
        case "greetings": return .orange
        case "family": return .pink
        case "numbers": return .blue
        case "food": return .green
        case "colors": return .purple
        case "animals": return .brown
        case "transportation": return .indigo
        case "work": return .gray
        case "body": return .red
        case "nature": return .green
        case "health": return .red
        default: return .gray
        }
    }
    
    private func hapticFeedback(_ type: WKHapticType) {
        WKInterfaceDevice.current().play(type)
    }
}

// MARK: - Supporting Views
struct TonePatternView: View {
    let pattern: String
    
    var body: some View {
        HStack(spacing: 4) {
            ForEach(Array(pattern), id: \.self) { tone in
                Rectangle()
                    .fill(toneColor(for: tone))
                    .frame(width: 20, height: tone == "H" ? 20 : 10)
                    .offset(y: tone == "L" ? 5 : 0)
                    .cornerRadius(2)
            }
        }
    }
    
    private func toneColor(for tone: Character) -> Color {
        switch tone {
        case "H": return .orange
        case "L": return .blue
        default: return .gray
        }
    }
}

struct SessionStatsView: View {
    let session: ReviewSession
    
    var accuracy: Double {
        Double(session.correct) / Double(max(session.totalReviewed, 1))
    }
    
    var body: some View {
        VStack(spacing: 16) {
            // Accuracy gauge
            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.3), lineWidth: 8)
                    .frame(width: 80, height: 80)
                
                Circle()
                    .trim(from: 0, to: accuracy)
                    .stroke(
                        accuracy > 0.8 ? Color.green : (accuracy > 0.6 ? Color.orange : Color.red),
                        style: StrokeStyle(lineWidth: 8, lineCap: .round)
                    )
                    .frame(width: 80, height: 80)
                    .rotationEffect(.degrees(-90))
                
                VStack(spacing: 2) {
                    Text("\(Int(accuracy * 100))%")
                        .font(.title3)
                        .fontWeight(.bold)
                    Text("Accuracy")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            
            // Stats grid
            HStack(spacing: 20) {
                StatItem(
                    icon: "checkmark.circle",
                    value: "\(session.correct)",
                    label: "Correct",
                    color: .green
                )
                
                StatItem(
                    icon: "clock",
                    value: formatTime(session.timeSpent),
                    label: "Time",
                    color: .blue
                )
                
                StatItem(
                    icon: "star.fill",
                    value: "\(session.totalReviewed)",
                    label: "Reviewed",
                    color: .orange
                )
            }
        }
        .padding()
        .background(Color.gray.opacity(0.1))
        .cornerRadius(16)
    }
    
    private func formatTime(_ seconds: TimeInterval) -> String {
        let minutes = Int(seconds) / 60
        let remainingSeconds = Int(seconds) % 60
        if minutes > 0 {
            return "\(minutes)m \(remainingSeconds)s"
        } else {
            return "\(remainingSeconds)s"
        }
    }
}

struct StatItem: View {
    let icon: String
    let value: String
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(color)
            Text(value)
                .font(.headline)
                .foregroundColor(.primary)
            Text(label)
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}

struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// Additional supporting views would go here (CulturalContextView, PronunciationPracticeView, AchievementUnlockedView)

struct FlashcardView_Previews: PreviewProvider {
    static var previews: some View {
        FlashcardView()
    }
}