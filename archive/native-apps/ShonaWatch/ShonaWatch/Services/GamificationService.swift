import Foundation
import SwiftUI

// MARK: - Gamification Service
class GamificationService: ObservableObject {
    static let shared = GamificationService()
    
    @Published var userLevel: Int = 1
    @Published var currentXP: Int = 0
    @Published var achievements: [Achievement] = []
    @Published var unlockedAchievements: Set<String> = []
    @Published var activeChallenges: [Challenge] = []
    @Published var culturalPoints: Int = 0
    @Published var wisdomGems: Int = 0
    @Published var currentTitle: UserTitle = .mutandiMudiki
    
    // Leaderboard
    @Published var weeklyRank: Int = 0
    @Published var globalRank: Int = 0
    @Published var friendsRank: Int = 0
    
    // Special collections
    @Published var proverbsUnlocked: [ShonaProverb] = []
    @Published var storiesUnlocked: [CulturalStory] = []
    @Published var songsUnlocked: [TraditionalSong] = []
    
    private let xpPerLevel = 1000
    private let culturalBonusMultiplier = 1.5
    
    init() {
        loadGameData()
        setupAchievements()
        setupDailyChallenges()
    }
    
    // MARK: - XP and Leveling
    func awardXP(_ amount: Int, reason: XPReason) {
        var finalAmount = amount
        
        // Apply bonuses
        if reason.isCultural {
            finalAmount = Int(Double(finalAmount) * culturalBonusMultiplier)
            culturalPoints += amount
        }
        
        // Add streak bonus
        if let streakBonus = calculateStreakBonus() {
            finalAmount += streakBonus
        }
        
        currentXP += finalAmount
        
        // Check for level up
        while currentXP >= xpPerLevel {
            levelUp()
        }
        
        // Check achievements
        checkXPAchievements()
        
        // Update rank
        updateRankings()
        
        // Visual feedback
        showXPGain(amount: finalAmount, reason: reason)
    }
    
    private func levelUp() {
        userLevel += 1
        currentXP -= xpPerLevel
        
        // Unlock rewards
        let rewards = getLevelRewards(userLevel)
        applyRewards(rewards)
        
        // Update title
        updateUserTitle()
        
        // Achievement check
        checkLevelAchievements()
        
        // Celebration animation
        triggerLevelUpCelebration()
    }
    
    private func updateUserTitle() {
        currentTitle = UserTitle.titleForLevel(userLevel)
    }
    
    // MARK: - Achievements System
    private func setupAchievements() {
        achievements = [
            // Learning milestones
            Achievement(
                id: "first_word",
                title: "Mutauri Wekutanga",
                description: "Learn your first Shona word",
                icon: "star.fill",
                points: 10,
                category: .learning,
                requirement: .cardsLearned(1)
            ),
            Achievement(
                id: "vocabulary_10",
                title: "Mudzidzi",
                description: "Learn 10 Shona words",
                icon: "book.fill",
                points: 50,
                category: .learning,
                requirement: .cardsLearned(10)
            ),
            Achievement(
                id: "vocabulary_50",
                title: "Munhu Ane Ruzivo",
                description: "Learn 50 Shona words",
                icon: "graduationcap.fill",
                points: 100,
                category: .learning,
                requirement: .cardsLearned(50)
            ),
            Achievement(
                id: "vocabulary_100",
                title: "Nyanzvi",
                description: "Master 100 Shona words",
                icon: "crown.fill",
                points: 250,
                category: .learning,
                requirement: .cardsLearned(100)
            ),
            
            // Streak achievements
            Achievement(
                id: "streak_3",
                title: "Mutsigiri",
                description: "Study for 3 days in a row",
                icon: "flame.fill",
                points: 30,
                category: .consistency,
                requirement: .streak(3)
            ),
            Achievement(
                id: "streak_7",
                title: "Musikavanhu",
                description: "One week streak!",
                icon: "flame.circle.fill",
                points: 70,
                category: .consistency,
                requirement: .streak(7)
            ),
            Achievement(
                id: "streak_30",
                title: "Gamba Remwedzi",
                description: "30 day streak - incredible dedication!",
                icon: "flame.circle.fill",
                points: 300,
                category: .consistency,
                requirement: .streak(30),
                isRare: true
            ),
            
            // Perfect scores
            Achievement(
                id: "perfect_session",
                title: "Mhare Yakanaka",
                description: "Complete a session with no mistakes",
                icon: "checkmark.seal.fill",
                points: 40,
                category: .mastery,
                requirement: .perfectSessions(1)
            ),
            Achievement(
                id: "perfect_10",
                title: "Muparadzi",
                description: "10 perfect sessions",
                icon: "seal.fill",
                points: 150,
                category: .mastery,
                requirement: .perfectSessions(10)
            ),
            
            // Cultural achievements
            Achievement(
                id: "greetings_master",
                title: "Munhu Ane Hunhu",
                description: "Master all greeting forms",
                icon: "hands.sparkles.fill",
                points: 100,
                category: .cultural,
                requirement: .categoryMastered("Greetings"),
                culturalSignificance: "Greetings are the foundation of hunhu (ubuntu)"
            ),
            Achievement(
                id: "proverbs_collector",
                title: "Muunganidzi Wetsumo",
                description: "Unlock 10 Shona proverbs",
                icon: "quote.bubble.fill",
                points: 200,
                category: .cultural,
                requirement: .proverbsUnlocked(10),
                isRare: true
            ),
            Achievement(
                id: "tone_master",
                title: "Nyanzvi Yematauriro",
                description: "Master Shona tone patterns",
                icon: "waveform.path.ecg",
                points: 150,
                category: .mastery,
                requirement: .custom("Master tone patterns in 50 words")
            ),
            
            // Speed achievements
            Achievement(
                id: "lightning_fast",
                title: "Gona Remhepo",
                description: "Answer 10 cards correctly in under 30 seconds",
                icon: "bolt.fill",
                points: 80,
                category: .speed,
                requirement: .speedRun(cards: 10, seconds: 30)
            ),
            
            // Social achievements
            Achievement(
                id: "helper",
                title: "Mubatsiri",
                description: "Help 5 friends with pronunciation",
                icon: "person.2.fill",
                points: 60,
                category: .social,
                requirement: .friendsHelped(5)
            ),
            
            // Special achievements
            Achievement(
                id: "night_owl",
                title: "Zizi",
                description: "Study between midnight and 3 AM",
                icon: "moon.stars.fill",
                points: 30,
                category: .special,
                requirement: .timeBasedStudy(hour: 0, duration: 3)
            ),
            Achievement(
                id: "early_bird",
                title: "Jongwe",
                description: "Study before 6 AM",
                icon: "sunrise.fill",
                points: 30,
                category: .special,
                requirement: .timeBasedStudy(hour: 4, duration: 2)
            ),
            Achievement(
                id: "cultural_ambassador",
                title: "Mumiriri Wetsika",
                description: "Earn 1000 cultural points",
                icon: "globe.africa.fill",
                points: 500,
                category: .cultural,
                requirement: .culturalPoints(1000),
                isLegendary: true,
                culturalSignificance: "You've become a true ambassador of Shona culture"
            )
        ]
    }
    
    // MARK: - Daily Challenges
    private func setupDailyChallenges() {
        let today = Date()
        let challenges = generateDailyChallenges(for: today)
        activeChallenges = challenges
    }
    
    private func generateDailyChallenges(for date: Date) -> [Challenge] {
        let dayOfWeek = Calendar.current.component(.weekday, from: date)
        var challenges: [Challenge] = []
        
        // Always have a basic challenge
        challenges.append(Challenge(
            id: "daily_\(date.timeIntervalSince1970)",
            title: "Zuva Nezuva",
            description: "Study 10 cards today",
            icon: "sun.max.fill",
            xpReward: 50,
            requirement: .studyCards(10),
            expiresAt: endOfDay(date),
            culturalNote: "Kudzidza mazuva ose kunopa uchenjeri - Daily learning brings wisdom"
        ))
        
        // Day-specific challenges
        switch dayOfWeek {
        case 1: // Sunday
            challenges.append(Challenge(
                id: "sunday_\(date.timeIntervalSince1970)",
                title: "Svondo Retsvene",
                description: "Learn 5 words related to family",
                icon: "house.fill",
                xpReward: 80,
                requirement: .categoryCards(category: "Family", count: 5),
                bonusGems: 5,
                culturalNote: "Sunday is family day in Shona culture"
            ))
            
        case 2: // Monday
            challenges.append(Challenge(
                id: "monday_\(date.timeIntervalSince1970)",
                title: "Muvhuro Webasa",
                description: "Perfect score on 5 work-related words",
                icon: "briefcase.fill",
                xpReward: 100,
                requirement: .perfectCategory(category: "Work", count: 5),
                bonusGems: 10
            ))
            
        case 6: // Friday
            challenges.append(Challenge(
                id: "friday_\(date.timeIntervalSince1970)",
                title: "Chishanu Chemufaro",
                description: "Learn all greetings perfectly",
                icon: "party.popper.fill",
                xpReward: 120,
                requirement: .perfectCategory(category: "Greetings", count: 10),
                bonusGems: 15,
                culturalNote: "Friday begins the weekend celebrations"
            ))
            
        default:
            // Standard weekday challenge
            challenges.append(Challenge(
                id: "weekday_\(date.timeIntervalSince1970)",
                title: "Shingirira",
                description: "Maintain your streak",
                icon: "flame.fill",
                xpReward: 60,
                requirement: .maintainStreak,
                bonusGems: 5
            ))
        }
        
        // Special cultural challenges
        if let culturalEvent = getCulturalEvent(for: date) {
            challenges.append(Challenge(
                id: "cultural_\(date.timeIntervalSince1970)",
                title: culturalEvent.title,
                description: culturalEvent.description,
                icon: culturalEvent.icon,
                xpReward: 200,
                requirement: culturalEvent.requirement,
                bonusGems: 20,
                isSpecial: true,
                culturalNote: culturalEvent.significance
            ))
        }
        
        return challenges
    }
    
    // MARK: - Rewards System
    private func getLevelRewards(_ level: Int) -> [Reward] {
        var rewards: [Reward] = []
        
        // Base rewards
        rewards.append(.wisdomGems(amount: level * 10))
        
        // Milestone rewards
        switch level {
        case 5:
            rewards.append(.proverb(ShonaProverb(
                shona: "Chara chimwe hachitswanyi inda",
                english: "One finger cannot crush a louse",
                meaning: "Unity and cooperation are essential for success",
                usage: "Used to encourage teamwork"
            )))
            
        case 10:
            rewards.append(.story(CulturalStory(
                title: "Ngano Yetsuro Nekamba",
                english: "The Hare and the Tortoise",
                moral: "Kushingirira kunokunda kumhanyisa - Persistence beats speed",
                content: "Traditional Shona fable teaching patience..."
            )))
            rewards.append(.title(.mudzidziWepamusoro))
            
        case 15:
            rewards.append(.song(TraditionalSong(
                title: "Ndinotenda",
                lyrics: "Song of gratitude...",
                occasion: "Thanksgiving ceremonies",
                culturalContext: "Sung during harvest celebrations"
            )))
            
        case 20:
            rewards.append(.title(.nyanzviYemutauro))
            rewards.append(.specialBadge("Cultural Master"))
            
        case 25:
            rewards.append(.proverb(ShonaProverb(
                shona: "Rinamanyanga hariputirwi",
                english: "What has horns cannot be wrapped up",
                meaning: "Truth cannot be hidden forever",
                usage: "When discussing transparency and honesty"
            )))
            rewards.append(.wisdomGems(amount: 500))
            
        default:
            break
        }
        
        return rewards
    }
    
    private func applyRewards(_ rewards: [Reward]) {
        for reward in rewards {
            switch reward {
            case .wisdomGems(let amount):
                wisdomGems += amount
                
            case .proverb(let proverb):
                proverbsUnlocked.append(proverb)
                
            case .story(let story):
                storiesUnlocked.append(story)
                
            case .song(let song):
                songsUnlocked.append(song)
                
            case .title(let title):
                // Titles are automatically updated based on level
                break
                
            case .specialBadge(let badge):
                // Add to special badges collection
                break
            }
        }
    }
    
    // MARK: - Progress Tracking
    func checkAchievement(_ achievement: Achievement) -> Bool {
        switch achievement.requirement {
        case .cardsLearned(let target):
            return FlashcardManager.shared.statistics.totalCardsReviewed >= target
            
        case .streak(let days):
            return FlashcardManager.shared.statistics.currentStreak >= days
            
        case .perfectSessions(let count):
            return getPerfectSessionCount() >= count
            
        case .categoryMastered(let category):
            return isCategoryMastered(category)
            
        case .proverbsUnlocked(let count):
            return proverbsUnlocked.count >= count
            
        case .speedRun(let cards, let seconds):
            return hasCompletedSpeedRun(cards: cards, seconds: seconds)
            
        case .culturalPoints(let points):
            return culturalPoints >= points
            
        case .friendsHelped(let count):
            return getFriendsHelpedCount() >= count
            
        case .timeBasedStudy(let hour, let duration):
            return hasStudiedDuringTime(hour: hour, duration: duration)
            
        case .custom(let description):
            return checkCustomRequirement(description)
            
        default:
            return false
        }
    }
    
    func unlockAchievement(_ achievement: Achievement) {
        guard !unlockedAchievements.contains(achievement.id) else { return }
        
        unlockedAchievements.insert(achievement.id)
        awardXP(achievement.points, reason: .achievement(achievement.title))
        
        if achievement.category == .cultural {
            culturalPoints += achievement.points
        }
        
        // Show celebration
        showAchievementUnlocked(achievement)
        
        // Save progress
        saveGameData()
    }
    
    // MARK: - Helper Methods
    private func calculateStreakBonus() -> Int? {
        let streak = FlashcardManager.shared.statistics.currentStreak
        if streak > 0 {
            return min(streak * 5, 50) // Max 50 XP streak bonus
        }
        return nil
    }
    
    private func updateRankings() {
        // In a real app, this would connect to a backend
        // For now, simulate ranking based on XP
        let totalXP = (userLevel - 1) * xpPerLevel + currentXP
        
        // Simulated rankings
        weeklyRank = max(1, 100 - (totalXP / 100))
        globalRank = max(1, 10000 - (totalXP / 10))
        friendsRank = max(1, 20 - (userLevel / 2))
    }
    
    private func endOfDay(_ date: Date) -> Date {
        Calendar.current.date(bySettingHour: 23, minute: 59, second: 59, of: date) ?? date
    }
    
    private func getCulturalEvent(for date: Date) -> CulturalEvent? {
        // Check for special Shona cultural days
        let calendar = Calendar.current
        let components = calendar.dateComponents([.month, .day], from: date)
        
        // Examples of cultural events
        if components.month == 9 && components.day == 21 {
            return CulturalEvent(
                title: "Zuva reChiShona",
                description: "Celebrate Shona Language Day",
                icon: "flag.fill",
                requirement: .studyCards(21),
                significance: "International Mother Language Day for Shona"
            )
        }
        
        return nil
    }
    
    // MARK: - Persistence
    private func saveGameData() {
        let gameData = GameData(
            level: userLevel,
            xp: currentXP,
            unlockedAchievements: Array(unlockedAchievements),
            culturalPoints: culturalPoints,
            wisdomGems: wisdomGems,
            proverbsUnlocked: proverbsUnlocked,
            storiesUnlocked: storiesUnlocked,
            songsUnlocked: songsUnlocked
        )
        
        if let encoded = try? JSONEncoder().encode(gameData) {
            UserDefaults.standard.set(encoded, forKey: "gameData")
        }
    }
    
    private func loadGameData() {
        if let data = UserDefaults.standard.data(forKey: "gameData"),
           let gameData = try? JSONDecoder().decode(GameData.self, from: data) {
            userLevel = gameData.level
            currentXP = gameData.xp
            unlockedAchievements = Set(gameData.unlockedAchievements)
            culturalPoints = gameData.culturalPoints
            wisdomGems = gameData.wisdomGems
            proverbsUnlocked = gameData.proverbsUnlocked
            storiesUnlocked = gameData.storiesUnlocked
            songsUnlocked = gameData.songsUnlocked
        }
    }
    
    // MARK: - Stub Methods (would be implemented fully in production)
    private func getPerfectSessionCount() -> Int { 
        // Count sessions with 100% accuracy
        return 0 
    }
    
    private func isCategoryMastered(_ category: String) -> Bool { 
        // Check if all cards in category have high retention
        return false 
    }
    
    private func hasCompletedSpeedRun(cards: Int, seconds: Int) -> Bool { 
        // Check session history for speed runs
        return false 
    }
    
    private func getFriendsHelpedCount() -> Int { 
        // Track social interactions
        return 0 
    }
    
    private func hasStudiedDuringTime(hour: Int, duration: Int) -> Bool { 
        // Check study session timestamps
        return false 
    }
    
    private func checkCustomRequirement(_ description: String) -> Bool { 
        // Handle special requirements
        return false 
    }
    
    private func checkXPAchievements() { 
        // Check XP-based achievements
    }
    
    private func checkLevelAchievements() { 
        // Check level-based achievements
    }
    
    private func showXPGain(amount: Int, reason: XPReason) { 
        // Visual feedback
    }
    
    private func triggerLevelUpCelebration() { 
        // Celebration animation
    }
    
    private func showAchievementUnlocked(_ achievement: Achievement) { 
        // Achievement notification
    }
}

// MARK: - Supporting Types
struct Achievement: Identifiable, Codable {
    let id: String
    let title: String
    let description: String
    let icon: String
    let points: Int
    let category: AchievementCategory
    let requirement: AchievementRequirement
    var isRare: Bool = false
    var isLegendary: Bool = false
    var culturalSignificance: String? = nil
}

struct Challenge: Identifiable {
    let id: String
    let title: String
    let description: String
    let icon: String
    let xpReward: Int
    let requirement: ChallengeRequirement
    var bonusGems: Int = 0
    var expiresAt: Date = Date().addingTimeInterval(86400) // 24 hours
    var isSpecial: Bool = false
    var culturalNote: String? = nil
}

struct ShonaProverb: Codable {
    let shona: String
    let english: String
    let meaning: String
    let usage: String
}

struct CulturalStory: Codable {
    let title: String
    let english: String
    let moral: String
    let content: String
}

struct TraditionalSong: Codable {
    let title: String
    let lyrics: String
    let occasion: String
    let culturalContext: String
}

struct CulturalEvent {
    let title: String
    let description: String
    let icon: String
    let requirement: ChallengeRequirement
    let significance: String
}

struct GameData: Codable {
    let level: Int
    let xp: Int
    let unlockedAchievements: [String]
    let culturalPoints: Int
    let wisdomGems: Int
    let proverbsUnlocked: [ShonaProverb]
    let storiesUnlocked: [CulturalStory]
    let songsUnlocked: [TraditionalSong]
}

enum AchievementCategory: String, Codable {
    case learning = "Learning"
    case consistency = "Consistency"
    case mastery = "Mastery"
    case cultural = "Cultural"
    case speed = "Speed"
    case social = "Social"
    case special = "Special"
}

enum AchievementRequirement: Codable {
    case cardsLearned(Int)
    case streak(Int)
    case perfectSessions(Int)
    case categoryMastered(String)
    case proverbsUnlocked(Int)
    case speedRun(cards: Int, seconds: Int)
    case culturalPoints(Int)
    case friendsHelped(Int)
    case timeBasedStudy(hour: Int, duration: Int)
    case custom(String)
}

enum ChallengeRequirement {
    case studyCards(Int)
    case perfectCards(Int)
    case categoryCards(category: String, count: Int)
    case perfectCategory(category: String, count: Int)
    case maintainStreak
    case speedChallenge(cards: Int, seconds: Int)
}

enum Reward {
    case wisdomGems(amount: Int)
    case proverb(ShonaProverb)
    case story(CulturalStory)
    case song(TraditionalSong)
    case title(UserTitle)
    case specialBadge(String)
}

enum UserTitle: String, CaseIterable {
    case mutandiMudiki = "Mutandi Mudiki" // Little Learner
    case mudzidzi = "Mudzidzi" // Student
    case mudzidziWepamusoro = "Mudzidzi Wepamusoro" // Advanced Student
    case mudzidziMukuru = "Mudzidzi Mukuru" // Senior Student
    case nyanzviYemutauro = "Nyanzvi Yemutauro" // Language Expert
    case guruveMutauro = "Guruve Mutauro" // Language Master
    case mamboWemutauro = "Mambo Wemutauro" // King of Language
    
    static func titleForLevel(_ level: Int) -> UserTitle {
        switch level {
        case 1...4: return .mutandiMudiki
        case 5...9: return .mudzidzi
        case 10...14: return .mudzidziWepamusoro
        case 15...19: return .mudzidziMukuru
        case 20...29: return .nyanzviYemutauro
        case 30...49: return .guruveMutauro
        default: return .mamboWemutauro
        }
    }
    
    var englishTranslation: String {
        switch self {
        case .mutandiMudiki: return "Little Learner"
        case .mudzidzi: return "Student"
        case .mudzidziWepamusoro: return "Advanced Student"
        case .mudzidziMukuru: return "Senior Student"
        case .nyanzviYemutauro: return "Language Expert"
        case .guruveMutauro: return "Language Master"
        case .mamboWemutauro: return "King of Language"
        }
    }
}

enum XPReason {
    case cardReview(correct: Bool)
    case achievement(String)
    case challenge(String)
    case culturalBonus
    case streakBonus
    case perfectSession
    
    var isCultural: Bool {
        switch self {
        case .culturalBonus:
            return true
        case .achievement(let name):
            return name.contains("Cultural") || name.contains("Tsika")
        default:
            return false
        }
    }
}