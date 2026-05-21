//
//  QuestView.swift
//  Shona App
//
//  Created by Munashe T Chitima on 6/7/2025.
//

import SwiftUI
import SwiftData

struct QuestView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var quests: [Quest]
    @Query private var questProgress: [QuestProgress]
    @Query private var users: [User]
    @Query private var lessons: [Lesson]
    
    @State private var selectedQuest: Quest?
    @State private var showingQuestDetail = false
    @State private var currentQuestIndex = 0
    
    private var currentUser: User? {
        users.first
    }
    
    private var sortedQuests: [Quest] {
        quests.sorted { $0.orderIndex < $1.orderIndex }
    }
    
    private var completedQuests: [Quest] {
        sortedQuests.filter { quest in
            questProgress.contains { $0.questId == quest.id && $0.completed }
        }
    }
    
    private var availableQuests: [Quest] {
        sortedQuests.filter { quest in
            isQuestAvailable(quest)
        }
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Hero Header
                    VStack(spacing: 16) {
                        HStack {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Learning Quests")
                                    .font(.title)
                                    .fontWeight(.bold)
                                
                                Text("Embark on epic journeys to master Shona")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            Circle()
                                .fill(LinearGradient(colors: [.orange, .red], startPoint: .topLeading, endPoint: .bottomTrailing))
                                .frame(width: 70, height: 70)
                                .overlay(
                                    Image(systemName: "crown.fill")
                                        .font(.title)
                                        .foregroundColor(.white)
                                )
                        }
                        
                        // Quest Stats
                        HStack(spacing: 20) {
                            QuestStatCard(title: "Completed", value: "\(completedQuests.count)", icon: "checkmark.circle.fill", color: .green)
                            QuestStatCard(title: "Available", value: "\(availableQuests.count)", icon: "play.circle.fill", color: .blue)
                            QuestStatCard(title: "Total XP", value: "\(currentUser?.xp ?? 0)", icon: "star.fill", color: .yellow)
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(20)
                    .shadow(radius: 3)
                    
                    // Current Quest Section
                    if let currentQuest = getCurrentQuest() {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Current Quest")
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            CurrentQuestCard(quest: currentQuest, progress: getQuestProgress(for: currentQuest))
                                .onTapGesture {
                                    selectedQuest = currentQuest
                                    showingQuestDetail = true
                                }
                        }
                    }
                    
                    // Available Quests
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Available Quests")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        LazyVStack(spacing: 16) {
                            ForEach(sortedQuests, id: \.id) { quest in
                                QuestCard(
                                    quest: quest,
                                    progress: getQuestProgress(for: quest),
                                    isLocked: !isQuestAvailable(quest),
                                    isCompleted: isQuestCompleted(quest)
                                )
                                .onTapGesture {
                                    if isQuestAvailable(quest) {
                                        selectedQuest = quest
                                        showingQuestDetail = true
                                    }
                                }
                            }
                        }
                    }
                    
                    // Achievement Showcase
                    if !completedQuests.isEmpty {
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Your Achievements")
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            ScrollView(.horizontal, showsIndicators: false) {
                                HStack(spacing: 16) {
                                    ForEach(completedQuests, id: \.id) { quest in
                                        AchievementBadge(quest: quest)
                                    }
                                }
                                .padding(.horizontal)
                            }
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Quests")
            .navigationBarTitleDisplayMode(.large)
            .sheet(isPresented: $showingQuestDetail) {
                if let quest = selectedQuest {
                    QuestDetailView(quest: quest, progress: getQuestProgress(for: quest))
                }
            }
        }
    }
    
    // MARK: - Helper Methods
    
    private func getCurrentQuest() -> Quest? {
        return availableQuests.first { quest in
            !isQuestCompleted(quest)
        }
    }
    
    private func getQuestProgress(for quest: Quest) -> QuestProgress {
        return questProgress.first { $0.questId == quest.id } ?? 
               QuestProgress(userId: currentUser?.id ?? "", questId: quest.id)
    }
    
    private func isQuestAvailable(_ quest: Quest) -> Bool {
        // Quest is available if user level is sufficient and previous quest is completed
        guard let user = currentUser else { return false }
        
        if quest.requiredLevel > user.level {
            return false
        }
        
        if quest.orderIndex == 1 {
            return true
        }
        
        // Check if previous quest is completed
        let previousQuest = sortedQuests.first { $0.orderIndex == quest.orderIndex - 1 }
        guard let previous = previousQuest else { return true }
        
        return isQuestCompleted(previous)
    }
    
    private func isQuestCompleted(_ quest: Quest) -> Bool {
        return questProgress.contains { $0.questId == quest.id && $0.completed }
    }
    
    private func startQuest(_ quest: Quest) {
        // Navigate to first lesson of the quest
        // This would typically open the lesson view with the quest context
    }
}

// MARK: - Supporting Views

struct QuestStatCard: View {
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

struct CurrentQuestCard: View {
    let quest: Quest
    let progress: QuestProgress
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(quest.title)
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    Text(quest.category)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.blue.opacity(0.2))
                        .foregroundColor(.blue)
                        .cornerRadius(6)
                }
                
                Spacer()
                
                Circle()
                    .fill(LinearGradient(colors: [.blue, .purple], startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 50, height: 50)
                    .overlay(
                        Image(systemName: "play.fill")
                            .font(.title3)
                            .foregroundColor(.white)
                    )
            }
            
            Text(quest.storyNarrative)
                .font(.body)
                .foregroundColor(.secondary)
                .lineLimit(3)
            
            HStack {
                Text("Continue Quest")
                    .font(.body)
                    .fontWeight(.semibold)
                    .foregroundColor(.blue)
                
                Spacer()
                
                Image(systemName: "arrow.right")
                    .foregroundColor(.blue)
            }
        }
        .padding()
        .background(
            LinearGradient(colors: [.blue.opacity(0.1), .purple.opacity(0.1)], startPoint: .topLeading, endPoint: .bottomTrailing)
        )
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(LinearGradient(colors: [.blue, .purple], startPoint: .topLeading, endPoint: .bottomTrailing), lineWidth: 2)
        )
    }
}

struct QuestCard: View {
    let quest: Quest
    let progress: QuestProgress
    let isLocked: Bool
    let isCompleted: Bool
    
    private var categoryColor: Color {
        switch quest.category {
        case "Communication": return .green
        case "Time": return .blue
        case "Food": return .orange
        case "Commerce": return .purple
        case "Travel": return .red
        case "Environment": return .teal
        case "Health": return .pink
        case "Grammar": return .indigo
        case "Culture": return .brown
        default: return .gray
        }
    }
    
    private var categoryEmoji: String {
        switch quest.category {
        case "Communication": return "💬"
        case "Time": return "⏰"
        case "Food": return "🍽️"
        case "Commerce": return "🛒"
        case "Travel": return "✈️"
        case "Environment": return "🌿"
        case "Health": return "🏥"
        case "Grammar": return "📝"
        case "Culture": return "🎭"
        default: return "📚"
        }
    }
    
    var body: some View {
        HStack(spacing: 16) {
            // Quest Icon
            ZStack {
                Circle()
                    .fill(categoryColor.opacity(0.2))
                    .frame(width: 60, height: 60)
                
                if isCompleted {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title)
                        .foregroundColor(.green)
                } else if isLocked {
                    Image(systemName: "lock.fill")
                        .font(.title2)
                        .foregroundColor(.gray)
                } else {
                    Text(categoryEmoji)
                        .font(.title)
                }
            }
            
            // Quest Info
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(quest.title)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(isLocked ? .secondary : .primary)
                    
                    Spacer()
                    
                    if !isLocked && !isCompleted {
                        Image(systemName: "arrow.right.circle.fill")
                            .foregroundColor(.blue)
                    }
                }
                
                Text(quest.description)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .lineLimit(2)
                
                HStack {
                    Text(quest.category)
                        .font(.caption)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(categoryColor.opacity(0.2))
                        .foregroundColor(categoryColor)
                        .cornerRadius(6)
                    
                    Spacer()
                    
                    if quest.requiredLevel > 1 {
                        Text("Level \(quest.requiredLevel)")
                            .font(.caption)
                            .foregroundColor(.secondary)
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

struct AchievementBadge: View {
    let quest: Quest
    
    var body: some View {
        VStack(spacing: 8) {
            Circle()
                .fill(LinearGradient(colors: [.yellow, .orange], startPoint: .topLeading, endPoint: .bottomTrailing))
                .frame(width: 60, height: 60)
                .overlay(
                    Image(systemName: "crown.fill")
                        .font(.title2)
                        .foregroundColor(.white)
                )
            
            Text(quest.title)
                .font(.caption)
                .fontWeight(.semibold)
                .multilineTextAlignment(.center)
                .lineLimit(2)
        }
        .frame(width: 80)
    }
}

// MARK: - Quest Detail View

struct QuestDetailView: View {
    let quest: Quest
    let progress: QuestProgress
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Quest Header
                    VStack(spacing: 16) {
                        Circle()
                            .fill(LinearGradient(colors: [.blue, .purple], startPoint: .topLeading, endPoint: .bottomTrailing))
                            .frame(width: 100, height: 100)
                            .overlay(
                                Image(systemName: "map.fill")
                                    .font(.system(size: 40))
                                    .foregroundColor(.white)
                            )
                        
                        Text(quest.title)
                            .font(.title)
                            .fontWeight(.bold)
                            .multilineTextAlignment(.center)
                        
                        Text(quest.category)
                            .font(.headline)
                            .padding(.horizontal, 16)
                            .padding(.vertical, 8)
                            .background(Color.blue.opacity(0.2))
                            .foregroundColor(.blue)
                            .cornerRadius(20)
                    }
                    
                    // Quest Description
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Quest Description")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Text(quest.description)
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Story Narrative
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Your Journey")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        Text(quest.storyNarrative)
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Quest Requirements
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Requirements")
                            .font(.headline)
                            .fontWeight(.semibold)
                        
                        HStack {
                            Image(systemName: "star.fill")
                                .foregroundColor(.yellow)
                            Text("Level \(quest.requiredLevel) required")
                                .font(.body)
                        }
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color(.systemGray6))
                    .cornerRadius(12)
                    
                    // Action Button
                    Button(action: { /* Start Quest Action */ }) {
                        HStack {
                            Image(systemName: "play.fill")
                                .font(.title2)
                            Text(progress.completed ? "Quest Completed" : "Start Quest")
                                .font(.headline)
                                .fontWeight(.semibold)
                        }
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            LinearGradient(
                                colors: progress.completed ? [.green, .green] : [.blue, .purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .cornerRadius(12)
                    }
                    .disabled(progress.completed)
                }
                .padding()
            }
            .navigationTitle("Quest Details")
            .navigationBarTitleDisplayMode(.inline)
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
    QuestView()
        .modelContainer(for: [Quest.self, QuestProgress.self, User.self, Lesson.self], inMemory: true)
}