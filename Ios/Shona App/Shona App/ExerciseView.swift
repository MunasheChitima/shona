//
//  ExerciseView.swift
//  Shona App
//
//  Created by Munashe T Chitima on 6/7/2025.
//

import SwiftUI
import SwiftData

struct ExerciseView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    @Query private var users: [User]
    @Query private var progress: [Progress]
    
    let lesson: Lesson
    @State private var currentExerciseIndex = 0
    @State private var selectedAnswer: String?
    @State private var showingResult = false
    @State private var isCorrect = false
    @State private var score = 0
    @State private var completedExercises = 0
    @State private var showingCompletion = false
    
    var currentUser: User? {
        users.first
    }
    
    var exercises: [Exercise] {
        // Create sample exercises for the lesson
        return createSampleExercises()
    }
    
    var currentExercise: Exercise? {
        guard currentExerciseIndex < exercises.count else { return nil }
        return exercises[currentExerciseIndex]
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Progress header
                VStack(spacing: 16) {
                    HStack {
                        Text(lesson.title)
                            .font(.title2)
                            .fontWeight(.bold)
                        
                        Spacer()
                        
                        Text("\(currentExerciseIndex + 1)/\(exercises.count)")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    ProgressView(value: Double(currentExerciseIndex), total: Double(exercises.count))
                        .progressViewStyle(LinearProgressViewStyle(tint: .green))
                }
                .padding()
                .background(Color(.systemBackground))
                
                // Exercise content
                if let exercise = currentExercise {
                    ScrollView {
                        VStack(spacing: 24) {
                            // Question
                            VStack(spacing: 16) {
                                Text(exercise.question)
                                    .font(.title3)
                                    .fontWeight(.semibold)
                                    .multilineTextAlignment(.center)
                                    .padding()
                                    .background(Color(.systemGray6))
                                    .cornerRadius(12)
                                
                                if let shonaPhrase = exercise.shonaPhrase {
                                    Text(shonaPhrase)
                                        .font(.title)
                                        .fontWeight(.bold)
                                        .foregroundColor(.green)
                                }
                                
                                if let englishPhrase = exercise.englishPhrase {
                                    Text(englishPhrase)
                                        .font(.headline)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            // Answer options
                            VStack(spacing: 12) {
                                ForEach(exercise.options, id: \.self) { option in
                                    AnswerButton(
                                        text: option,
                                        isSelected: selectedAnswer == option,
                                        isCorrect: showingResult ? (option == exercise.correctAnswer) : nil,
                                        action: {
                                            if !showingResult {
                                                selectedAnswer = option
                                            }
                                        }
                                    )
                                }
                            }
                            
                            // Submit button
                            if selectedAnswer != nil && !showingResult {
                                Button("Submit Answer") {
                                    checkAnswer()
                                }
                                .buttonStyle(PrimaryButtonStyle())
                                .padding(.top)
                            }
                            
                            // Result feedback
                            if showingResult {
                                VStack(spacing: 16) {
                                    Image(systemName: isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                                        .font(.system(size: 60))
                                        .foregroundColor(isCorrect ? .green : .red)
                                    
                                    Text(isCorrect ? "Correct!" : "Incorrect")
                                        .font(.title2)
                                        .fontWeight(.bold)
                                        .foregroundColor(isCorrect ? .green : .red)
                                    
                                    if !isCorrect {
                                        Text("The correct answer is: \(exercise.correctAnswer)")
                                            .font(.body)
                                            .foregroundColor(.secondary)
                                            .multilineTextAlignment(.center)
                                    }
                                    
                                    Button("Continue") {
                                        nextExercise()
                                    }
                                    .buttonStyle(PrimaryButtonStyle())
                                }
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(16)
                            }
                        }
                        .padding()
                    }
                }
                
                Spacer()
            }
            .navigationTitle("Exercise")
            #if os(iOS)
            .navigationBarTitleDisplayMode(.inline)
            #endif
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
        }
        .sheet(isPresented: $showingCompletion) {
            CompletionView(lesson: lesson, score: score, totalExercises: exercises.count)
        }
    }
    
    private func checkAnswer() {
        guard let exercise = currentExercise, let selectedAnswer = selectedAnswer else { return }
        
        isCorrect = selectedAnswer == exercise.correctAnswer
        if isCorrect {
            score += exercise.points
        }
        
        completedExercises += 1
        showingResult = true
    }
    
    private func nextExercise() {
        if currentExerciseIndex < exercises.count - 1 {
            currentExerciseIndex += 1
            selectedAnswer = nil
            showingResult = false
        } else {
            // Lesson completed
            completeLesson()
        }
    }
    
    private func completeLesson() {
        let finalScore = Int((Double(score) / Double(exercises.reduce(0) { $0 + $1.points })) * 100)
        
        // Update user XP
        if let user = currentUser {
            user.xp += finalScore
            user.level = max(1, user.xp / 100 + 1)
        }
        
        // Create or update progress
        let lessonProgress = progress.first { $0.lessonId == lesson.id } ?? Progress(userId: currentUser?.id ?? "", lessonId: lesson.id)
        lessonProgress.score = finalScore
        lessonProgress.completed = true
        lessonProgress.completedAt = Date()
        
        if progress.first(where: { $0.lessonId == lesson.id }) == nil {
            modelContext.insert(lessonProgress)
        }
        
        // Mark lesson as completed
        lesson.isCompleted = true
        
        showingCompletion = true
    }
    
    private func createSampleExercises() -> [Exercise] {
        switch lesson.category {
        case "Basics":
            return [
                Exercise(type: "multiple_choice", question: "What does 'Mangwanani' mean?", correctAnswer: "Good morning", options: ["Good morning", "Good evening", "Thank you", "Hello"], points: 10),
                Exercise(type: "multiple_choice", question: "How do you say 'Good afternoon' in Shona?", correctAnswer: "Masikati", options: ["Manheru", "Masikati", "Mangwanani", "Ndatenda"], points: 10),
                Exercise(type: "translation", question: "Translate to English: Manheru", correctAnswer: "Good evening", options: ["Good morning", "Good afternoon", "Good evening", "Thank you"], points: 15),
                Exercise(type: "multiple_choice", question: "What is the correct response to 'Makadii?' (How are you?)", correctAnswer: "Ndiripo", options: ["Ndiripo", "Mangwanani", "Ndatenda", "Masikati"], points: 10),
                Exercise(type: "translation", question: "Translate to Shona: Thank you", correctAnswer: "Ndatenda", options: ["Mangwanani", "Masikati", "Manheru", "Ndatenda"], points: 15)
            ]
        case "Numbers":
            return [
                Exercise(type: "multiple_choice", question: "What is 'one' in Shona?", correctAnswer: "Potsi", options: ["Potsi", "Piri", "Tatu", "Ina"], points: 10),
                Exercise(type: "matching", question: "Match the numbers", correctAnswer: "2-Piri", options: ["1-Potsi", "2-Piri", "3-Tatu", "4-Ina"], points: 10),
                Exercise(type: "multiple_choice", question: "What number is 'Tatu'?", correctAnswer: "Three", options: ["One", "Two", "Three", "Four"], points: 10),
                Exercise(type: "translation", question: "Translate to Shona: Five", correctAnswer: "Shanu", options: ["Tatu", "Ina", "Shanu", "Tanhatu"], points: 15),
                Exercise(type: "multiple_choice", question: "What is 'Gumi' in English?", correctAnswer: "Ten", options: ["Eight", "Nine", "Ten", "Seven"], points: 10)
            ]
        default:
            return [
                Exercise(type: "multiple_choice", question: "Sample question", correctAnswer: "Correct answer", options: ["Correct answer", "Wrong answer 1", "Wrong answer 2", "Wrong answer 3"], points: 10)
            ]
        }
    }
}

struct AnswerButton: View {
    let text: String
    let isSelected: Bool
    let isCorrect: Bool?
    let action: () -> Void
    
    private var backgroundColor: Color {
        if let isCorrect = isCorrect {
            return isCorrect ? .green.opacity(0.2) : .red.opacity(0.2)
        }
        return isSelected ? .blue.opacity(0.2) : Color(.systemGray6)
    }
    
    private var borderColor: Color {
        if let isCorrect = isCorrect {
            return isCorrect ? .green : .red
        }
        return isSelected ? .blue : .clear
    }
    
    var body: some View {
        Button(action: action) {
            HStack {
                Text(text)
                    .font(.body)
                    .foregroundColor(.primary)
                    .multilineTextAlignment(.leading)
                
                Spacer()
                
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundColor(.blue)
                }
            }
            .padding()
            .background(backgroundColor)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(borderColor, lineWidth: 2)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct CompletionView: View {
    @Environment(\.dismiss) private var dismiss
    let lesson: Lesson
    let score: Int
    let totalExercises: Int
    
    var percentage: Int {
        Int((Double(score) / Double(totalExercises * 10)) * 100)
    }
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            VStack(spacing: 20) {
                Image(systemName: "star.fill")
                    .font(.system(size: 80))
                    .foregroundColor(.yellow)
                
                Text("Lesson Completed!")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Congratulations! You've completed \(lesson.title)")
                    .font(.title3)
                    .multilineTextAlignment(.center)
                    .foregroundColor(.secondary)
                
                VStack(spacing: 8) {
                    Text("\(percentage)%")
                        .font(.system(size: 48, weight: .bold))
                        .foregroundColor(.green)
                    
                    Text("Score")
                        .font(.headline)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(16)
            }
            
            Spacer()
            
            Button("Continue") {
                dismiss()
            }
            .buttonStyle(PrimaryButtonStyle())
        }
        .padding()
    }
}

#Preview {
    ExerciseView(lesson: Lesson(title: "Test Lesson", description: "Test", category: "Basics", orderIndex: 1))
        .modelContainer(for: [User.self, Lesson.self, Progress.self, Exercise.self], inMemory: true)
} 