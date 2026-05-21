//
//  LearnView.swift
//  Shona App
//
//  Created by Munashe T Chitima on 6/7/2025.
//

import SwiftUI
import SwiftData

struct LearnView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var users: [User]
    @Query private var lessons: [Lesson]
    @Query private var progress: [Progress]
    @State private var selectedLesson: Lesson?
    @State private var showingExercise = false
    
    var currentUser: User? {
        users.first
    }
    
    var sortedLessons: [Lesson] {
        lessons.sorted { $0.orderIndex < $1.orderIndex }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Progress header
                    VStack(spacing: 16) {
                        HStack {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Your Learning Journey")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                
                                Text("Keep going! You're doing amazing in your Shona adventure.")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                        }
                        
                        // Progress stats
                        HStack(spacing: 20) {
                            ProgressStatCard(title: "Total XP", value: "\(currentUser?.xp ?? 0)", icon: "trophy.fill", color: .yellow)
                            ProgressStatCard(title: "Level", value: "\(currentUser?.level ?? 1)", icon: "star.fill", color: .orange)
                            ProgressStatCard(title: "Completed", value: "\(completedLessons)", icon: "checkmark.circle.fill", color: .green)
                        }
                        
                        // Level progress bar
                        VStack(alignment: .leading, spacing: 8) {
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
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(radius: 2)
                    
                    // Lessons grid
                    VStack(alignment: .leading, spacing: 16) {
                        HStack {
                            Text("Available Lessons")
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            Spacer()
                            
                            Text("\(completedLessons) of \(lessons.count) completed")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        
                        LazyVGrid(columns: [
                            GridItem(.flexible()),
                            GridItem(.flexible())
                        ], spacing: 16) {
                            ForEach(sortedLessons, id: \.id) { lesson in
                                LessonCard(
                                    lesson: lesson,
                                    progress: getProgress(for: lesson),
                                    isLocked: isLessonLocked(lesson)
                                )
                                .onTapGesture {
                                    if !isLessonLocked(lesson) {
                                        selectedLesson = lesson
                                        showingExercise = true
                                    }
                                }
                            }
                        }
                    }
                    
                    // Motivation section
                    if completedLessons > 0 {
                        VStack(spacing: 16) {
                            Image(systemName: "star.fill")
                                .font(.system(size: 40))
                                .foregroundColor(.yellow)
                            
                            Text("Amazing Progress!")
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            Text("You've completed \(completedLessons) lessons! Keep up the great work!")
                                .font(.body)
                                .multilineTextAlignment(.center)
                                .foregroundColor(.secondary)
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(LinearGradient(colors: [.green, .blue], startPoint: .leading, endPoint: .trailing))
                        .foregroundColor(.white)
                        .cornerRadius(16)
                    }
                }
                .padding()
            }
            .navigationTitle("Learn")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.large)
            #endif
            .sheet(isPresented: $showingExercise) {
                if let lesson = selectedLesson {
                    ExerciseView(lesson: lesson)
                }
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
    
    private func getProgress(for lesson: Lesson) -> Progress {
        progress.first { $0.lessonId == lesson.id } ?? Progress(userId: currentUser?.id ?? "", lessonId: lesson.id)
    }
    
    private func isLessonLocked(_ lesson: Lesson) -> Bool {
        if lesson.orderIndex == 1 { return false }
        
        let previousLesson = sortedLessons.first { $0.orderIndex == lesson.orderIndex - 1 }
        guard let previous = previousLesson else { return false }
        
        let previousProgress = getProgress(for: previous)
        return !previousProgress.completed
    }
}

struct ProgressStatCard: View {
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

struct LessonCard: View {
    let lesson: Lesson
    let progress: Progress
    let isLocked: Bool
    
    private var categoryEmoji: String {
        switch lesson.category {
        case "Basics": return "👋"
        case "Numbers": return "🔢"
        case "Family": return "👨‍👩‍👧‍👦"
        case "Verbs": return "🏃"
        case "Colors": return "🎨"
        default: return "📚"
        }
    }
    
    private var categoryColor: Color {
        switch lesson.category {
        case "Basics": return .green
        case "Numbers": return .blue
        case "Family": return .purple
        case "Verbs": return .orange
        case "Colors": return .pink
        default: return .gray
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(categoryEmoji)
                    .font(.title)
                
                Spacer()
                
                if progress.completed {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.green)
                        .font(.title2)
                } else if isLocked {
                    Image(systemName: "lock.fill")
                        .foregroundColor(.gray)
                        .font(.title2)
                }
            }
            
            VStack(alignment: .leading, spacing: 8) {
                Text(lesson.title)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .lineLimit(2)
                
                Text(lesson.lessonDescription)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                HStack {
                    Text(lesson.difficulty)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(categoryColor.opacity(0.2))
                        .foregroundColor(categoryColor)
                        .cornerRadius(8)
                    
                    Spacer()
                    
                    if progress.completed {
                        Text("\(progress.score)%")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.green)
                    }
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(radius: 2)
        .opacity(isLocked ? 0.6 : 1.0)
    }
}

#Preview {
    LearnView()
        .modelContainer(for: [User.self, Lesson.self, Progress.self, Exercise.self], inMemory: true)
} 