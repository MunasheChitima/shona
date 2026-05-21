import Foundation
import UserNotifications

class ReviewScheduler: ObservableObject {
    static let shared = ReviewScheduler()
    private init() {}
    
    func scheduleReviewNotifications(for flashcards: [Flashcard]) {
        // Request notification permissions
        requestNotificationPermissions()
        
        // Clear existing notifications
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
        
        // Schedule notifications for due cards
        let dueCards = flashcards.filter { card in
            guard let srsProgress = card.srsProgress else { return false }
            return srsProgress.nextReview > Date()
        }
        
        for card in dueCards.prefix(10) { // Limit to 10 notifications
            scheduleNotification(for: card)
        }
        
        // Schedule daily reminder
        scheduleDailyReminder()
    }
    
    private func requestNotificationPermissions() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
            if let error = error {
                print("Notification permission error: \(error)")
            }
        }
    }
    
    private func scheduleNotification(for card: Flashcard) {
        guard let srsProgress = card.srsProgress else { return }
        
        let content = UNMutableNotificationContent()
        content.title = "Shona Flash - Review Time!"
        content.body = "Time to review: \(card.shonaText) - \(card.englishText)"
        content.sound = UNNotificationSound.default
        content.badge = 1
        
        // Set category for interactive notifications
        content.categoryIdentifier = "REVIEW_REMINDER"
        
        // Schedule for the next review time
        let trigger = UNCalendarNotificationTrigger(
            dateMatching: Calendar.current.dateComponents([.year, .month, .day, .hour, .minute], from: srsProgress.nextReview),
            repeats: false
        )
        
        let request = UNNotificationRequest(
            identifier: "review_\(card.id)",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Failed to schedule notification: \(error)")
            }
        }
    }
    
    private func scheduleDailyReminder() {
        let content = UNMutableNotificationContent()
        content.title = "Shona Flash"
        content.body = "Don't forget your daily Shona practice!"
        content.sound = UNNotificationSound.default
        content.badge = 1
        content.categoryIdentifier = "DAILY_REMINDER"
        
        // Default to 9 AM daily
        var dateComponents = DateComponents()
        dateComponents.hour = 9
        dateComponents.minute = 0
        
        let trigger = UNCalendarNotificationTrigger(
            dateMatching: dateComponents,
            repeats: true
        )
        
        let request = UNNotificationRequest(
            identifier: "daily_reminder",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Failed to schedule daily reminder: \(error)")
            }
        }
    }
    
    func updateDailyReminderTime(_ time: Date) {
        // Remove existing daily reminder
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["daily_reminder"])
        
        // Schedule new one
        let content = UNMutableNotificationContent()
        content.title = "Shona Flash"
        content.body = "Don't forget your daily Shona practice!"
        content.sound = UNNotificationSound.default
        content.badge = 1
        content.categoryIdentifier = "DAILY_REMINDER"
        
        let components = Calendar.current.dateComponents([.hour, .minute], from: time)
        let trigger = UNCalendarNotificationTrigger(
            dateMatching: components,
            repeats: true
        )
        
        let request = UNNotificationRequest(
            identifier: "daily_reminder",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Failed to update daily reminder: \(error)")
            }
        }
    }
    
    func cancelAllNotifications() {
        UNUserNotificationCenter.current().removeAllPendingNotificationRequests()
    }
    
    func scheduleStreakReminder() {
        let content = UNMutableNotificationContent()
        content.title = "Keep Your Streak!"
        content.body = "You haven't practiced today. Keep your learning streak alive!"
        content.sound = UNNotificationSound.default
        content.badge = 1
        content.categoryIdentifier = "STREAK_REMINDER"
        
        // Schedule for 8 PM if no practice today
        var dateComponents = DateComponents()
        dateComponents.hour = 20
        dateComponents.minute = 0
        
        let trigger = UNCalendarNotificationTrigger(
            dateMatching: dateComponents,
            repeats: false
        )
        
        let request = UNNotificationRequest(
            identifier: "streak_reminder",
            content: content,
            trigger: trigger
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Failed to schedule streak reminder: \(error)")
            }
        }
    }
    
    func setupNotificationCategories() {
        // Review reminder actions
        let reviewAction = UNNotificationAction(
            identifier: "REVIEW_ACTION",
            title: "Review Now",
            options: [.foreground]
        )
        
        let reviewLaterAction = UNNotificationAction(
            identifier: "REVIEW_LATER",
            title: "Later",
            options: []
        )
        
        let reviewCategory = UNNotificationCategory(
            identifier: "REVIEW_REMINDER",
            actions: [reviewAction, reviewLaterAction],
            intentIdentifiers: [],
            options: []
        )
        
        // Daily reminder actions
        let practiceAction = UNNotificationAction(
            identifier: "PRACTICE_ACTION",
            title: "Practice Now",
            options: [.foreground]
        )
        
        let skipAction = UNNotificationAction(
            identifier: "SKIP_ACTION",
            title: "Skip Today",
            options: []
        )
        
        let dailyCategory = UNNotificationCategory(
            identifier: "DAILY_REMINDER",
            actions: [practiceAction, skipAction],
            intentIdentifiers: [],
            options: []
        )
        
        // Streak reminder actions
        let streakPracticeAction = UNNotificationAction(
            identifier: "STREAK_PRACTICE_ACTION",
            title: "Save Streak",
            options: [.foreground]
        )
        
        let streakCategory = UNNotificationCategory(
            identifier: "STREAK_REMINDER",
            actions: [streakPracticeAction],
            intentIdentifiers: [],
            options: []
        )
        
        UNUserNotificationCenter.current().setNotificationCategories([
            reviewCategory,
            dailyCategory,
            streakCategory
        ])
    }
}