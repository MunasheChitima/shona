//
//  PronunciationView.swift
//  Shona App
//
//  Created by Munashe T Chitima on 6/7/2025.
//

import SwiftUI
import SwiftData
import AVFoundation
import Speech

struct PronunciationView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var pronunciationExercises: [PronunciationExercise]
    @Query private var users: [User]
    
    @State private var currentExercise: PronunciationExercise?
    @State private var isPlaying = false
    @State private var showPhonetics = false
    @State private var showTonePattern = false
    @State private var showSpecialSounds = false
    @State private var userRecording = false
    @State private var sessionStats = PronunciationSessionStats()
    @State private var showingResults = false
    @State private var pronunciationAccuracy: Double = 0.0
    @State private var currentIndex = 0
    @State private var audioEngine = AVAudioEngine()
    @State private var speechRecognizer = SFSpeechRecognizer()
    
    private var currentUser: User? {
        users.first
    }
    
    private var sortedExercises: [PronunciationExercise] {
        pronunciationExercises.sorted { $0.complexity < $1.complexity }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                if let exercise = currentExercise {
                    pronunciationPracticeView(exercise: exercise)
                } else {
                    pronunciationHomeView
                }
            }
            .navigationTitle("Pronunciation")
            .navigationBarTitleDisplayMode(.large)
            .onAppear {
                setupAudioSession()
                loadFirstExercise()
            }
        }
    }
    
    private var pronunciationHomeView: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Progress Header
                VStack(spacing: 16) {
                    HStack {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Pronunciation Practice")
                                .font(.title2)
                                .fontWeight(.bold)
                            
                            Text("Master Shona pronunciation with phonetic guidance")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        
                        Spacer()
                        
                        Circle()
                            .fill(LinearGradient(colors: [.blue, .purple], startPoint: .topLeading, endPoint: .bottomTrailing))
                            .frame(width: 60, height: 60)
                            .overlay(
                                Image(systemName: "mic.fill")
                                    .font(.title2)
                                    .foregroundColor(.white)
                            )
                    }
                    
                    // Stats Cards
                    HStack(spacing: 15) {
                        PronunciationStatCard(title: "Accuracy", value: "\(Int(sessionStats.averageAccuracy))%", color: .green)
                        PronunciationStatCard(title: "Practiced", value: "\(sessionStats.totalPracticed)", color: .blue)
                        PronunciationStatCard(title: "Mastered", value: "\(sessionStats.masteredWords)", color: .orange)
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(16)
                .shadow(radius: 2)
                
                // Exercise Categories
                VStack(alignment: .leading, spacing: 16) {
                    Text("Practice Categories")
                        .font(.title2)
                        .fontWeight(.bold)
                    
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        ForEach(getPronunciationCategories(), id: \.self) { category in
                            CategoryCard(category: category, exerciseCount: getExerciseCount(for: category))
                                .onTapGesture {
                                    startPracticeSession(category: category)
                                }
                        }
                    }
                }
                
                // Recent Practice
                if !sortedExercises.isEmpty {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Continue Practice")
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        ForEach(sortedExercises.prefix(3), id: \.id) { exercise in
                            PronunciationExerciseCard(exercise: exercise)
                                .onTapGesture {
                                    currentExercise = exercise
                                    currentIndex = sortedExercises.firstIndex(of: exercise) ?? 0
                                }
                        }
                    }
                }
            }
            .padding()
        }
        .background(Color(.systemGroupedBackground))
    }
    
    private func pronunciationPracticeView(exercise: PronunciationExercise) -> some View {
        VStack(spacing: 0) {
            // Progress Header
            VStack(spacing: 10) {
                HStack {
                    Button("← Back") {
                        currentExercise = nil
                    }
                    .font(.body)
                    .foregroundColor(.blue)
                    
                    Spacer()
                    
                    Text("\(currentIndex + 1) of \(sortedExercises.count)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                ProgressView(value: Double(currentIndex), total: Double(sortedExercises.count))
                    .progressViewStyle(LinearProgressViewStyle())
            }
            .padding()
            .background(Color(.systemBackground))
            
            ScrollView {
                VStack(spacing: 24) {
                    // Word Display
                    VStack(spacing: 16) {
                        Text(exercise.word)
                            .font(.system(size: 48, weight: .bold, design: .default))
                            .foregroundColor(.primary)
                        
                        Text(exercise.translation)
                            .font(.title2)
                            .foregroundColor(.secondary)
                        
                        // Category Badge
                        Text(exercise.category)
                            .font(.caption)
                            .padding(.horizontal, 12)
                            .padding(.vertical, 6)
                            .background(Color.blue.opacity(0.2))
                            .foregroundColor(.blue)
                            .cornerRadius(12)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(radius: 2)
                    
                    // Phonetic Information
                    VStack(spacing: 16) {
                        // Phonetic Breakdown
                        VStack(alignment: .leading, spacing: 12) {
                            Button(action: { showPhonetics.toggle() }) {
                                HStack {
                                    Image(systemName: "textformat.abc")
                                        .foregroundColor(.blue)
                                    Text("Phonetic Breakdown")
                                        .font(.headline)
                                        .foregroundColor(.primary)
                                    Spacer()
                                    Image(systemName: showPhonetics ? "chevron.up" : "chevron.down")
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            if showPhonetics {
                                VStack(alignment: .leading, spacing: 8) {
                                    Text("Phonetic: \(exercise.phonetic)")
                                        .font(.body)
                                        .foregroundColor(.secondary)
                                    
                                    if let syllables = exercise.syllables {
                                        Text("Syllables: \(syllables)")
                                            .font(.body)
                                            .foregroundColor(.secondary)
                                    }
                                }
                                .padding(.leading, 20)
                            }
                        }
                        
                        // Tone Pattern
                        VStack(alignment: .leading, spacing: 12) {
                            Button(action: { showTonePattern.toggle() }) {
                                HStack {
                                    Image(systemName: "waveform")
                                        .foregroundColor(.orange)
                                    Text("Tone Pattern")
                                        .font(.headline)
                                        .foregroundColor(.primary)
                                    Spacer()
                                    Image(systemName: showTonePattern ? "chevron.up" : "chevron.down")
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            if showTonePattern {
                                VStack(alignment: .leading, spacing: 8) {
                                    if let tonePattern = exercise.tonePattern {
                                        Text(tonePattern)
                                            .font(.title2)
                                            .fontWeight(.bold)
                                            .foregroundColor(.orange)
                                    } else {
                                        Text("No tone pattern available")
                                            .font(.body)
                                            .foregroundColor(.secondary)
                                    }
                                    
                                    Text("H = High tone, L = Low tone")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                .padding(.leading, 20)
                            }
                        }
                        
                                // Special Sounds
        if !exercise.specialSounds.isEmpty {
                            
                            VStack(alignment: .leading, spacing: 12) {
                                Button(action: { showSpecialSounds.toggle() }) {
                                    HStack {
                                        Image(systemName: "star.fill")
                                            .foregroundColor(.purple)
                                        Text("Special Sounds")
                                            .font(.headline)
                                            .foregroundColor(.primary)
                                        Spacer()
                                        Image(systemName: showSpecialSounds ? "chevron.up" : "chevron.down")
                                            .foregroundColor(.secondary)
                                    }
                                }
                                
                                if showSpecialSounds {
                                    VStack(alignment: .leading, spacing: 8) {
                                        ForEach(exercise.specialSounds, id: \.token) { sound in
                                            VStack(alignment: .leading, spacing: 4) {
                                                Text("\(sound.token) - \(sound.type)")
                                                    .font(.body)
                                                    .fontWeight(.semibold)
                                                
                                                if let description = sound.description {
                                                    Text(description)
                                                        .font(.caption)
                                                        .foregroundColor(.secondary)
                                                }
                                            }
                                        }
                                    }
                                    .padding(.leading, 20)
                                }
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(radius: 2)
                    
                    // Audio Controls
                    VStack(spacing: 16) {
                        Button(action: playAudio) {
                            HStack {
                                Image(systemName: isPlaying ? "pause.circle.fill" : "play.circle.fill")
                                    .font(.title)
                                Text(isPlaying ? "Pause Audio" : "Play Audio")
                                    .font(.headline)
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(LinearGradient(colors: [.blue, .purple], startPoint: .leading, endPoint: .trailing))
                            .cornerRadius(12)
                        }
                        
                        Button(action: startRecording) {
                            HStack {
                                Image(systemName: userRecording ? "stop.circle.fill" : "mic.circle.fill")
                                    .font(.title)
                                Text(userRecording ? "Stop Recording" : "Practice Speaking")
                                    .font(.headline)
                            }
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(LinearGradient(colors: [.red, .orange], startPoint: .leading, endPoint: .trailing))
                            .cornerRadius(12)
                        }
                        
                        if pronunciationAccuracy > 0 {
                            VStack(spacing: 8) {
                                Text("Pronunciation Accuracy")
                                    .font(.headline)
                                
                                HStack {
                                    Text("\(Int(pronunciationAccuracy))%")
                                        .font(.title2)
                                        .fontWeight(.bold)
                                        .foregroundColor(getAccuracyColor(pronunciationAccuracy))
                                    
                                    Spacer()
                                    
                                    Text(getAccuracyFeedback(pronunciationAccuracy))
                                        .font(.body)
                                        .foregroundColor(.secondary)
                                }
                                
                                ProgressView(value: pronunciationAccuracy / 100)
                                    .progressViewStyle(LinearProgressViewStyle(tint: getAccuracyColor(pronunciationAccuracy)))
                            }
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(12)
                        }
                    }
                    
                    // Navigation
                    HStack(spacing: 16) {
                        Button(action: previousExercise) {
                            Text("← Previous")
                                .font(.body)
                                .foregroundColor(.blue)
                        }
                        .disabled(currentIndex == 0)
                        
                        Spacer()
                        
                        Button(action: nextExercise) {
                            Text("Next →")
                                .font(.body)
                                .foregroundColor(.blue)
                        }
                        .disabled(currentIndex >= sortedExercises.count - 1)
                    }
                    .padding()
                }
                .padding()
            }
        }
        .background(Color(.systemGroupedBackground))
        .navigationBarTitleDisplayMode(.inline)
    }
    
    // MARK: - Helper Methods
    
    private func setupAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Audio session setup failed: \(error)")
        }
    }
    
    private func loadFirstExercise() {
        if let first = sortedExercises.first {
            currentExercise = first
            currentIndex = 0
        }
    }
    
    private func playAudio() {
        guard let exercise = currentExercise else { return }
        
        // Simulate audio playback
        isPlaying = true
        
        // Use text-to-speech for pronunciation
        let utterance = AVSpeechUtterance(string: exercise.word)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US") // Ideally would use Shona voice
        utterance.rate = 0.5 // Slower for pronunciation practice
        
        let synthesizer = AVSpeechSynthesizer()
        synthesizer.speak(utterance)
        
        // Reset playing state after a delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            isPlaying = false
        }
    }
    
    private func startRecording() {
        userRecording.toggle()
        
        if userRecording {
            // Start recording logic
            startSpeechRecognition()
        } else {
            // Stop recording and analyze
            stopSpeechRecognition()
        }
    }
    
    private func startSpeechRecognition() {
        // Implement speech recognition
        // This would integrate with iOS Speech Recognition framework
        // For now, simulate with random accuracy
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            pronunciationAccuracy = Double.random(in: 60...95)
            sessionStats.totalPracticed += 1
            if pronunciationAccuracy > 80 {
                sessionStats.masteredWords += 1
            }
        }
    }
    
    private func stopSpeechRecognition() {
        // Stop recording and provide feedback
        userRecording = false
    }
    
    private func nextExercise() {
        if currentIndex < sortedExercises.count - 1 {
            currentIndex += 1
            currentExercise = sortedExercises[currentIndex]
            pronunciationAccuracy = 0
        }
    }
    
    private func previousExercise() {
        if currentIndex > 0 {
            currentIndex -= 1
            currentExercise = sortedExercises[currentIndex]
            pronunciationAccuracy = 0
        }
    }
    
    private func getPronunciationCategories() -> [String] {
        Array(Set(pronunciationExercises.map { $0.category })).sorted()
    }
    
    private func getExerciseCount(for category: String) -> Int {
        pronunciationExercises.filter { $0.category == category }.count
    }
    
    private func startPracticeSession(category: String) {
        let categoryExercises = pronunciationExercises.filter { $0.category == category }
        if let first = categoryExercises.first {
            currentExercise = first
            currentIndex = sortedExercises.firstIndex(of: first) ?? 0
        }
    }
    
    private func getAccuracyColor(_ accuracy: Double) -> Color {
        switch accuracy {
        case 90...100: return .green
        case 70...89: return .orange
        default: return .red
        }
    }
    
    private func getAccuracyFeedback(_ accuracy: Double) -> String {
        switch accuracy {
        case 90...100: return "Excellent!"
        case 80...89: return "Good job!"
        case 70...79: return "Keep practicing!"
        default: return "Try again"
        }
    }
}

// MARK: - Supporting Views

struct PronunciationStatCard: View {
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
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(12)
    }
}

struct CategoryCard: View {
    let category: String
    let exerciseCount: Int
    
    var body: some View {
        VStack(spacing: 8) {
            Text(categoryEmoji(for: category))
                .font(.largeTitle)
            
            Text(category)
                .font(.headline)
                .fontWeight(.semibold)
            
            Text("\(exerciseCount) exercises")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(radius: 2)
    }
    
    private func categoryEmoji(for category: String) -> String {
        switch category {
        case "Greetings": return "👋"
        case "Transport": return "🚌"
        case "Movement": return "🏃"
        case "Time": return "⏰"
        case "Action": return "⚡"
        case "Communication": return "💬"
        case "Music": return "🎵"
        case "Pronouns": return "👤"
        case "Courtesy": return "🙏"
        case "Responses": return "💭"
        default: return "📚"
        }
    }
}

struct PronunciationExerciseCard: View {
    let exercise: PronunciationExercise
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(exercise.word)
                    .font(.headline)
                    .fontWeight(.semibold)
                
                Text(exercise.translation)
                    .font(.body)
                    .foregroundColor(.secondary)
                
                Text("Complexity: \(exercise.complexity)/10")
                    .font(.caption)
                    .foregroundColor(.orange)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 4) {
                Text(exercise.category)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.blue.opacity(0.2))
                    .foregroundColor(.blue)
                    .cornerRadius(6)
                
                Text(exercise.difficulty)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 1)
    }
}

// MARK: - Data Structures

extension PronunciationView {
    private func requestSpeechRecognitionPermission() {
        SFSpeechRecognizer.requestAuthorization { authStatus in
            DispatchQueue.main.async {
                switch authStatus {
                case .authorized:
                    print("Speech recognition authorized")
                case .denied:
                    print("Speech recognition denied")
                case .restricted:
                    print("Speech recognition restricted")
                case .notDetermined:
                    print("Speech recognition not determined")
                @unknown default:
                    print("Speech recognition unknown status")
                }
            }
        }
    }
}

#Preview {
    PronunciationView()
        .modelContainer(for: [PronunciationExercise.self, User.self], inMemory: true)
}