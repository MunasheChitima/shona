//
//  HomeView.swift
//  Shona App
//
//  Created by Munashe T Chitima on 6/7/2025.
//

import SwiftUI
import SwiftData

struct HomeView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var users: [User]
    @Query private var lessons: [Lesson]
    @Query private var progress: [Progress]
    
    var currentUser: User? {
        users.first
    }
    
    var completedLessons: Int {
        progress.filter { $0.completed }.count
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Welcome header
                    VStack(spacing: 16) {
                        HStack {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Welcome back!")
                                    .font(.title2)
                                    .foregroundColor(.secondary)
                                
                                Text(currentUser?.name ?? "Shona Learner")
                                    .font(.largeTitle)
                                    .fontWeight(.bold)
                            }
                            
                            Spacer()
                            
                            // User avatar
                            Circle()
                                .fill(LinearGradient(colors: [.green, .blue], startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: 60, height: 60)
                                .overlay(
                                    Text(String(currentUser?.name.prefix(1) ?? "U").uppercased())
                                        .font(.title2)
                                        .fontWeight(.bold)
                                        .foregroundColor(.white)
                                )
                        }
                        
                        // Progress summary
                        HStack(spacing: 20) {
                            ProgressCard(title: "Level", value: "\(currentUser?.level ?? 1)", icon: "star.fill", color: .orange)
                            ProgressCard(title: "XP", value: "\(currentUser?.xp ?? 0)", icon: "trophy.fill", color: .yellow)
                            ProgressCard(title: "Lessons", value: "\(completedLessons)", icon: "book.fill", color: .blue)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(radius: 2)
                    
                    // Continue learning section
                    if let nextLesson = getNextLesson() {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Continue Learning")
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            LessonCard(lesson: nextLesson, progress: getProgress(for: nextLesson), isLocked: false)
                                .onTapGesture {
                                    // Navigate to lesson
                                }
                        }
                    }
                    
                    // Recent activity
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Recent Activity")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        if let recentProgress = getRecentProgress() {
                            ForEach(recentProgress, id: \.id) { progress in
                                ActivityRow(progress: progress, lesson: getLesson(for: progress))
                            }
                        } else {
                            Text("No recent activity. Start learning to see your progress!")
                                .foregroundColor(.secondary)
                                .padding()
                        }
                    }
                    
                    // Quick stats
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Your Stats")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 16) {
                            StatCard(title: "Current Streak", value: "\(getCurrentStreak()) days", icon: "flame.fill", color: .red)
                            StatCard(title: "Average Score", value: "\(getAverageScore())%", icon: "chart.bar.fill", color: .green)
                            StatCard(title: "Total Time", value: "\(getTotalTime()) min", icon: "clock.fill", color: .purple)
                            StatCard(title: "Hearts", value: "\(currentUser?.hearts ?? 5)/5", icon: "heart.fill", color: .pink)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Home")
            .navigationBarTitleDisplayMode(.large)
        }
    }
    
    private func getNextLesson() -> Lesson? {
        lessons.first { lesson in
            !getProgress(for: lesson).completed
        }
    }
    
    private func getProgress(for lesson: Lesson) -> Progress {
        progress.first { $0.lessonId == lesson.id } ?? Progress(userId: currentUser?.id ?? "", lessonId: lesson.id)
    }
    
    private func getLesson(for progress: Progress) -> Lesson? {
        lessons.first { $0.id == progress.lessonId }
    }
    
    private func getRecentProgress() -> [Progress]? {
        let completed = progress.filter { $0.completed }.sorted { $0.completedAt ?? Date() > $1.completedAt ?? Date() }
        return completed.isEmpty ? nil : Array(completed.prefix(3))
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
    
    private func getTotalTime() -> Int {
        // Mock implementation - in real app this would track actual time spent
        return completedLessons * 5
    }
}

struct ProgressCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(color)
            
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct StatCard: View {
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

struct ActivityRow: View {
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

#Preview {
    HomeView()
        .modelContainer(for: [User.self, Lesson.self, Progress.self, Exercise.self], inMemory: true)
} 