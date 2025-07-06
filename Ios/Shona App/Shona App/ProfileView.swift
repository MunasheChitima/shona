//
//  ProfileView.swift
//  Shona App
//
//  Created by Munashe T Chitima on 6/7/2025.
//

import SwiftUI
import SwiftData

struct ProfileView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var users: [User]
    @Query private var lessons: [Lesson]
    @Query private var progress: [Progress]
    @State private var showingSettings = false
    
    var currentUser: User? {
        users.first
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Profile header
                    VStack(spacing: 20) {
                        // Avatar and basic info
                        VStack(spacing: 16) {
                            Circle()
                                .fill(LinearGradient(colors: [.green, .blue], startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: 100, height: 100)
                                .overlay(
                                    Text(String(currentUser?.name.prefix(1) ?? "U").uppercased())
                                        .font(.largeTitle)
                                        .fontWeight(.bold)
                                        .foregroundColor(.white)
                                )
                            
                            VStack(spacing: 8) {
                                Text(currentUser?.name ?? "Shona Learner")
                                    .font(.title)
                                    .fontWeight(.bold)
                                
                                Text("Level \(currentUser?.level ?? 1) • \(completedLessons) lessons completed")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        // Level progress
                        VStack(spacing: 8) {
                            HStack {
                                Text("Level \(currentUser?.level ?? 1)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                                
                                Spacer()
                                
                                Text("Level \((currentUser?.level ?? 1) + 1)")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            
                            ProgressView(value: Double(levelProgress), total: 100)
                                .progressViewStyle(LinearProgressViewStyle(tint: .green))
                            
                            Text("\(levelProgress)% to next level")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(radius: 2)
                    
                    // Stats grid
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Your Stats")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 16) {
                            ProfileStatCard(title: "Total XP", value: "\(currentUser?.xp ?? 0)", icon: "trophy.fill", color: .yellow)
                            ProfileStatCard(title: "Current Streak", value: "\(getCurrentStreak()) days", icon: "flame.fill", color: .red)
                            ProfileStatCard(title: "Average Score", value: "\(getAverageScore())%", icon: "chart.bar.fill", color: .green)
                            ProfileStatCard(title: "Hearts", value: "\(currentUser?.hearts ?? 5)/5", icon: "heart.fill", color: .pink)
                        }
                    }
                    
                    // Recent achievements
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Recent Achievements")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        if let recentProgress = getRecentProgress() {
                            ForEach(recentProgress, id: \.id) { progress in
                                AchievementRow(progress: progress, lesson: getLesson(for: progress))
                            }
                        } else {
                            Text("No achievements yet. Complete lessons to earn achievements!")
                                .foregroundColor(.secondary)
                                .padding()
                        }
                    }
                    
                    // Settings section
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Settings")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        VStack(spacing: 0) {
                            SettingsRow(title: "Notifications", icon: "bell.fill", color: .blue) {
                                // Handle notifications
                            }
                            
                            Divider()
                            
                            SettingsRow(title: "Sound Effects", icon: "speaker.wave.2.fill", color: .green) {
                                // Handle sound settings
                            }
                            
                            Divider()
                            
                            SettingsRow(title: "About", icon: "info.circle.fill", color: .gray) {
                                // Show about info
                            }
                        }
                        .background(Color(.systemBackground))
                        .cornerRadius(12)
                        .shadow(radius: 1)
                    }
                    
                    // Reset progress button
                    Button(action: resetProgress) {
                        Text("Reset Progress")
                            .font(.headline)
                            .foregroundColor(.red)
                            .padding()
                            .frame(maxWidth: .infinity)
                            .background(Color.red.opacity(0.1))
                            .cornerRadius(12)
                    }
                }
                .padding()
            }
            .navigationTitle("Profile")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.large)
            #endif
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Settings") {
                        showingSettings = true
                    }
                }
            }
            .sheet(isPresented: $showingSettings) {
                SettingsView()
            }
        }
    }
    
    private var completedLessons: Int {
        progress.filter { $0.completed }.count
    }
    
    private var levelProgress: Int {
        guard let user = currentUser else { return 0 }
        return user.xp % 100
    }
    
    private func getCurrentStreak() -> Int {
        // Mock implementation - in real app this would calculate actual streak
        return min(completedLessons, 7)
    }
    
    private func getAverageScore() -> Int {
        let completed = progress.filter { $0.completed }
        guard !completed.isEmpty else { return 0 }
        return completed.reduce(0) { $0 + $1.score } / completed.count
    }
    
    private func getRecentProgress() -> [Progress]? {
        let completed = progress.filter { $0.completed }.sorted { $0.completedAt ?? Date() > $1.completedAt ?? Date() }
        return completed.isEmpty ? nil : Array(completed.prefix(3))
    }
    
    private func getLesson(for progress: Progress) -> Lesson? {
        lessons.first { $0.id == progress.lessonId }
    }
    
    private func resetProgress() {
        // Reset all progress
        for progressItem in progress {
            modelContext.delete(progressItem)
        }
        
        // Reset user stats
        if let user = currentUser {
            user.xp = 0
            user.level = 1
            user.hearts = 5
        }
        
        // Reset lesson completion
        for lesson in lessons {
            lesson.isCompleted = false
        }
    }
}

struct ProfileStatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Spacer()
            }
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct AchievementRow: View {
    let progress: Progress
    let lesson: Lesson?
    
    var body: some View {
        HStack {
            Circle()
                .fill(Color.green)
                .frame(width: 12, height: 12)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(lesson?.title ?? "Unknown Lesson")
                    .font(.headline)
                
                Text("Completed with \(progress.score)% score")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text("+\(progress.score) XP")
                .font(.caption)
                .foregroundColor(.green)
                .fontWeight(.semibold)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct SettingsRow: View {
    let title: String
    let icon: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                    .frame(width: 24)
                
                Text(title)
                    .foregroundColor(.primary)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundColor(.secondary)
                    .font(.caption)
            }
            .padding()
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            List {
                Section("App Settings") {
                    SettingsRow(title: "Notifications", icon: "bell.fill", color: .blue) {}
                    SettingsRow(title: "Sound Effects", icon: "speaker.wave.2.fill", color: .green) {}
                    SettingsRow(title: "Haptic Feedback", icon: "iphone", color: .purple) {}
                }
                
                Section("About") {
                    SettingsRow(title: "Version", icon: "info.circle.fill", color: .gray) {}
                    SettingsRow(title: "Privacy Policy", icon: "hand.raised.fill", color: .blue) {}
                    SettingsRow(title: "Terms of Service", icon: "doc.text.fill", color: .green) {}
                }
            }
            .navigationTitle("Settings")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    ProfileView()
        .modelContainer(for: [User.self, Lesson.self, Progress.self, Exercise.self], inMemory: true)
} 