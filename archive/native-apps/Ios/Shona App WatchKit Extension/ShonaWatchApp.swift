//
//  ShonaWatchApp.swift
//  Shona App WatchKit Extension
//
//  Created by Munashe T Chitima on 12/7/2024.
//

import SwiftUI
import WatchKit

@main
struct ShonaWatchApp: App {
    @SceneBuilder var body: some Scene {
        WindowGroup {
            ContentView()
        }
        
        WKNotificationScene(controller: NotificationController.self, category: "ShonaLearning")
    }
}

struct ContentView: View {
    @State private var currentTab = 0
    
    var body: some View {
        TabView(selection: $currentTab) {
            HomeWatchView()
                .tag(0)
            
            PronunciationWatchView()
                .tag(1)
            
            QuickPhrasesWatchView()
                .tag(2)
            
            ProgressWatchView()
                .tag(3)
        }
        .tabViewStyle(PageTabViewStyle())
        .indexViewStyle(PageIndexViewStyle(backgroundDisplayMode: .interactive))
    }
}

// MARK: - Home View
struct HomeWatchView: View {
    @State private var dailyProgress: Float = 0.65
    @State private var streakCount = 7
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // App title
                Text("Shona Learn")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.blue)
                
                // Daily progress
                VStack(spacing: 8) {
                    Text("Today's Progress")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    ZStack {
                        Circle()
                            .stroke(Color.gray.opacity(0.3), lineWidth: 8)
                        
                        Circle()
                            .trim(from: 0, to: CGFloat(dailyProgress))
                            .stroke(
                                LinearGradient(
                                    colors: [.blue, .green],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                ),
                                style: StrokeStyle(lineWidth: 8, lineCap: .round)
                            )
                            .rotationEffect(.degrees(-90))
                        
                        VStack {
                            Text("\(Int(dailyProgress * 100))%")
                                .font(.title3)
                                .fontWeight(.bold)
                            Text("Complete")
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                    }
                    .frame(width: 80, height: 80)
                }
                
                // Streak counter
                HStack {
                    Image(systemName: "flame.fill")
                        .foregroundColor(.orange)
                    Text("\(streakCount) day streak")
                        .font(.caption)
                        .fontWeight(.medium)
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .background(Color.orange.opacity(0.1))
                .cornerRadius(12)
                
                // Quick actions
                VStack(spacing: 8) {
                    ShonaWatchButton(
                        title: "Practice",
                        icon: "mic.fill",
                        color: .blue,
                        action: { }
                    )
                    
                    ShonaWatchButton(
                        title: "Quick Lesson",
                        icon: "book.fill",
                        color: .green,
                        action: { }
                    )
                }
            }
            .padding()
        }
        .navigationTitle("Home")
    }
}

// MARK: - Pronunciation View
struct PronunciationWatchView: View {
    @State private var isRecording = false
    @State private var currentWord = "Hallo"
    @State private var pronunciation = "/ˈhʌ.loʊ/"
    @State private var translation = "Hello"
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Current word
                VStack(spacing: 4) {
                    Text(currentWord)
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.primary)
                    
                    Text(pronunciation)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .fontFamily(.monospaced)
                    
                    Text(translation)
                        .font(.caption)
                        .foregroundColor(.blue)
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                
                // Recording button
                ShonaWatchButton(
                    title: isRecording ? "Stop" : "Record",
                    icon: isRecording ? "stop.circle.fill" : "mic.circle.fill",
                    color: isRecording ? .red : .blue,
                    size: .large,
                    action: {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            isRecording.toggle()
                        }
                    }
                )
                
                // Playback button
                ShonaWatchButton(
                    title: "Listen",
                    icon: "speaker.wave.2.fill",
                    color: .green,
                    action: { }
                )
                
                // Next word button
                ShonaWatchButton(
                    title: "Next Word",
                    icon: "arrow.right.circle.fill",
                    color: .orange,
                    action: { }
                )
            }
            .padding()
        }
        .navigationTitle("Practice")
    }
}

// MARK: - Quick Phrases View
struct QuickPhrasesWatchView: View {
    private let phrases = [
        ("Mhoro", "/mhoro/", "Hello"),
        ("Tatenda", "/tətɛndə/", "Thank you"),
        ("Zvakanaka", "/zvəkənəkə/", "Good/Fine"),
        ("Chisarai", "/t͡ʃisərai/", "Goodbye"),
        ("Ndiri kutenda", "/ndiri kutɛndə/", "I am learning")
    ]
    
    var body: some View {
        List {
            ForEach(phrases.indices, id: \.self) { index in
                let phrase = phrases[index]
                PhraseRow(
                    shona: phrase.0,
                    pronunciation: phrase.1,
                    english: phrase.2
                )
            }
        }
        .navigationTitle("Phrases")
    }
}

struct PhraseRow: View {
    let shona: String
    let pronunciation: String
    let english: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(shona)
                .font(.headline)
                .fontWeight(.semibold)
            
            Text(pronunciation)
                .font(.caption)
                .foregroundColor(.secondary)
                .fontFamily(.monospaced)
            
            Text(english)
                .font(.caption)
                .foregroundColor(.blue)
        }
        .padding(.vertical, 2)
    }
}

// MARK: - Progress View
struct ProgressWatchView: View {
    @State private var weeklyGoal: Float = 0.8
    @State private var wordsLearned = 45
    @State private var lessonsCompleted = 12
    
    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Weekly goal
                VStack(spacing: 8) {
                    Text("Weekly Goal")
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    ZStack {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(Color.gray.opacity(0.2))
                            .frame(height: 16)
                        
                        HStack {
                            RoundedRectangle(cornerRadius: 8)
                                .fill(
                                    LinearGradient(
                                        colors: [.blue, .green],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(width: 120 * CGFloat(weeklyGoal), height: 16)
                            Spacer()
                        }
                    }
                    .frame(width: 120)
                    
                    Text("\(Int(weeklyGoal * 100))% Complete")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                // Stats
                VStack(spacing: 8) {
                    StatRow(title: "Words Learned", value: "\(wordsLearned)")
                    StatRow(title: "Lessons Done", value: "\(lessonsCompleted)")
                    StatRow(title: "This Week", value: "4 days")
                }
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(12)
                
                // Achievements
                Text("Latest Achievement")
                    .font(.headline)
                    .fontWeight(.semibold)
                
                HStack {
                    Image(systemName: "star.fill")
                        .foregroundColor(.yellow)
                        .font(.title2)
                    
                    VStack(alignment: .leading) {
                        Text("Pronunciation Pro")
                            .font(.caption)
                            .fontWeight(.semibold)
                        Text("Perfect pronunciation 5 times")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
                .padding()
                .background(Color.yellow.opacity(0.1))
                .cornerRadius(12)
            }
            .padding()
        }
        .navigationTitle("Progress")
    }
}

struct StatRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Spacer()
            Text(value)
                .font(.caption)
                .fontWeight(.semibold)
        }
    }
}

// MARK: - Custom Watch Button Component
struct ShonaWatchButton: View {
    let title: String
    let icon: String
    let color: Color
    var size: ButtonSize = .medium
    let action: () -> Void
    
    enum ButtonSize {
        case small, medium, large
        
        var height: CGFloat {
            switch self {
            case .small: return 32
            case .medium: return 40
            case .large: return 48
            }
        }
        
        var fontSize: Font {
            switch self {
            case .small: return .caption
            case .medium: return .caption
            case .large: return .footnote
            }
        }
        
        var iconSize: Font {
            switch self {
            case .small: return .caption
            case .medium: return .footnote
            case .large: return .body
            }
        }
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .font(size.iconSize)
                
                Text(title)
                    .font(size.fontSize)
                    .fontWeight(.medium)
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .frame(height: size.height)
            .background(color)
            .cornerRadius(size.height / 2)
        }
        .buttonStyle(PlainButtonStyle())
        .contentShape(RoundedRectangle(cornerRadius: size.height / 2))
        .accessibilityLabel(title)
        .accessibilityHint("Double tap to \(title.lowercased())")
    }
}

// MARK: - Notification Controller
class NotificationController: WKUserNotificationHostingController<NotificationView> {
    override var body: NotificationView {
        return NotificationView()
    }
}

struct NotificationView: View {
    var body: some View {
        VStack {
            Image(systemName: "book.fill")
                .font(.largeTitle)
                .foregroundColor(.blue)
            
            Text("Time to Practice!")
                .font(.headline)
                .fontWeight(.semibold)
            
            Text("Continue your Shona learning journey")
                .font(.caption)
                .multilineTextAlignment(.center)
                .foregroundColor(.secondary)
        }
        .padding()
    }
}

#Preview {
    ContentView()
}