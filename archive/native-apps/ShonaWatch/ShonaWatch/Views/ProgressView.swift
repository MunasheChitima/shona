import SwiftUI

struct ProgressView: View {
    @StateObject private var flashcardManager = FlashcardManager()
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Daily Progress
                VStack(spacing: 8) {
                    Text("Today's Progress")
                        .font(.headline)
                        .foregroundColor(.orange)
                    
                    ZStack {
                        Circle()
                            .stroke(Color.gray.opacity(0.3), lineWidth: 8)
                            .frame(width: 80, height: 80)
                        
                        Circle()
                            .trim(from: 0, to: flashcardManager.getDailyProgress())
                            .stroke(Color.orange, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                            .frame(width: 80, height: 80)
                            .rotationEffect(.degrees(-90))
                        
                        VStack {
                            Text("\(Int(flashcardManager.getDailyProgress() * 100))%")
                                .font(.title3)
                                .fontWeight(.bold)
                            Text("Goal")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    Text("Goal: \(flashcardManager.settings.dailyGoal) cards")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                
                // Statistics
                VStack(spacing: 12) {
                    Text("Statistics")
                        .font(.headline)
                        .foregroundColor(.orange)
                    
                    LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 2), spacing: 12) {
                        StatCard(
                            title: "Total Cards",
                            value: "\(flashcardManager.totalCards)",
                            color: .blue
                        )
                        
                        StatCard(
                            title: "Accuracy",
                            value: "\(Int(flashcardManager.accuracy * 100))%",
                            color: .green
                        )
                        
                        StatCard(
                            title: "Current Streak",
                            value: "\(flashcardManager.streakCount)",
                            color: .orange
                        )
                        
                        StatCard(
                            title: "Study Days",
                            value: "\(flashcardManager.statistics.studyDays)",
                            color: .purple
                        )
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                
                // Weekly Activity
                VStack(spacing: 8) {
                    Text("Weekly Activity")
                        .font(.headline)
                        .foregroundColor(.orange)
                    
                    HStack(spacing: 4) {
                        ForEach(0..<7, id: \.self) { index in
                            let weeklyStats = flashcardManager.getWeeklyStats()
                            let count = weeklyStats.count > index ? weeklyStats[index] : 0
                            
                            VStack(spacing: 4) {
                                RoundedRectangle(cornerRadius: 4)
                                    .fill(count > 0 ? Color.green : Color.gray.opacity(0.3))
                                    .frame(width: 20, height: max(8, CGFloat(count) * 2))
                                
                                Text(dayLabel(for: index))
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                        }
                    }
                    .padding(.horizontal)
                    
                    Text("Cards reviewed per day")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                
                // Recent Sessions
                VStack(spacing: 8) {
                    Text("Recent Sessions")
                        .font(.headline)
                        .foregroundColor(.orange)
                    
                    let recentSessions = flashcardManager.getRecentSessions().prefix(3)
                    
                    if recentSessions.isEmpty {
                        Text("No sessions yet")
                            .font(.caption)
                            .foregroundColor(.secondary)
                            .padding()
                    } else {
                        ForEach(Array(recentSessions.enumerated()), id: \.offset) { index, session in
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(formatDate(session.startTime))
                                        .font(.caption)
                                        .fontWeight(.medium)
                                    Text("\(session.totalReviewed) cards")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text("\(session.correct)/\(session.totalReviewed)")
                                        .font(.caption)
                                        .fontWeight(.medium)
                                        .foregroundColor(.green)
                                    Text("\(Int(session.timeSpent))s")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding(.horizontal)
                            .padding(.vertical, 8)
                            .background(Color.gray.opacity(0.05))
                            .cornerRadius(8)
                        }
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                
                // Categories Progress
                VStack(spacing: 8) {
                    Text("Categories")
                        .font(.headline)
                        .foregroundColor(.orange)
                    
                    ForEach(flashcardManager.settings.selectedCategories, id: \.self) { category in
                        let categoryCards = flashcardManager.getFlashcardsByCategory(category)
                        
                        HStack {
                            Text(category)
                                .font(.caption)
                                .fontWeight(.medium)
                            
                            Spacer()
                            
                            Text("\(categoryCards.count)")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                        .padding(.horizontal)
                        .padding(.vertical, 6)
                        .background(Color.gray.opacity(0.05))
                        .cornerRadius(8)
                    }
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
            }
            .padding()
        }
        .navigationTitle("Progress")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func dayLabel(for index: Int) -> String {
        let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        let today = Calendar.current.component(.weekday, from: Date()) - 1
        let dayIndex = (today - 6 + index + 7) % 7
        return days[dayIndex]
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter.string(from: date)
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.title2)
                .fontWeight(.bold)
                .foregroundColor(color)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding()
        .background(Color.gray.opacity(0.05))
        .cornerRadius(8)
    }
}

struct ProgressView_Previews: PreviewProvider {
    static var previews: some View {
        ProgressView()
    }
}