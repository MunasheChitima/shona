//
//  OnboardingView.swift
//  Shona App
//
//  Created by Munashe T Chitima on 6/7/2025.
//

import SwiftUI
import SwiftData

struct OnboardingView: View {
    @Environment(\.modelContext) private var modelContext
    @Binding var isFirstLaunch: Bool
    @State private var name = ""
    @State private var email = ""
    @State private var currentStep = 0
    
    private let steps = [
        OnboardingStep(
            title: "Welcome to Shona Learning! 🇿🇼",
            subtitle: "Discover the beautiful language of Zimbabwe",
            image: "flag.zimbabwe",
            description: "Learn Shona through interactive lessons, games, and voice practice."
        ),
        OnboardingStep(
            title: "Interactive Learning",
            subtitle: "Fun and engaging lessons",
            image: "brain.head.profile",
            description: "Master Shona with multiple choice questions, translations, and pronunciation practice."
        ),
        OnboardingStep(
            title: "Track Your Progress",
            subtitle: "Watch your skills grow",
            image: "chart.line.uptrend.xyaxis",
            description: "Earn XP, unlock achievements, and see your Shona proficiency improve over time."
        )
    ]
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Progress indicator
                HStack {
                    ForEach(0..<steps.count, id: \.self) { index in
                        Rectangle()
                            .fill(index <= currentStep ? Color.green : Color.gray.opacity(0.3))
                            .frame(height: 4)
                            .animation(.easeInOut(duration: 0.3), value: currentStep)
                    }
                }
                .padding(.horizontal)
                .padding(.top)
                
                // Content
                TabView(selection: $currentStep) {
                    ForEach(0..<steps.count, id: \.self) { index in
                        OnboardingStepView(step: steps[index])
                            .tag(index)
                    }
                }
                #if os(iOS)
                .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
                #endif
                .animation(.easeInOut(duration: 0.3), value: currentStep)
                
                // Bottom section
                VStack(spacing: 20) {
                    if currentStep == steps.count - 1 {
                        // User setup form
                        VStack(spacing: 16) {
                            TextField("Your Name", text: $name)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .padding(.horizontal)
                            
                            TextField("Email (optional)", text: $email)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .padding(.horizontal)
                                #if os(iOS)
                                .keyboardType(.emailAddress)
                                #endif
                        }
                    }
                    
                    // Navigation buttons
                    HStack {
                        if currentStep > 0 {
                            Button("Back") {
                                withAnimation {
                                    currentStep -= 1
                                }
                            }
                            .buttonStyle(SecondaryButtonStyle())
                        }
                        
                        Spacer()
                        
                        if currentStep < steps.count - 1 {
                            Button("Next") {
                                withAnimation {
                                    currentStep += 1
                                }
                            }
                            .buttonStyle(PrimaryButtonStyle())
                        } else {
                            Button("Get Started") {
                                createUser()
                            }
                            .buttonStyle(PrimaryButtonStyle())
                            .disabled(name.isEmpty)
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.bottom, 50)
            }
            #if os(iOS)
            .navigationBarHidden(true)
            #else
            .toolbar(.hidden, for: .navigationBar)
            #endif
        }
    }
    
    private func createUser() {
        let user = User(name: name, email: email.isEmpty ? "user@shona.app" : email)
        modelContext.insert(user)
        
        // Create sample lessons
        createSampleLessons()
        
        withAnimation {
            isFirstLaunch = false
        }
    }
    
    private func createSampleLessons() {
        let lessons = [
            Lesson(title: "Greetings & Basics", description: "Learn essential Shona greetings", category: "Basics", orderIndex: 1),
            Lesson(title: "Numbers 1-10", description: "Count from 1 to 10 in Shona", category: "Numbers", orderIndex: 2),
            Lesson(title: "Family Members", description: "Learn family vocabulary", category: "Family", orderIndex: 3),
            Lesson(title: "Common Verbs", description: "Essential action words", category: "Verbs", orderIndex: 4),
            Lesson(title: "Colors", description: "Learn Shona colors", category: "Colors", orderIndex: 5)
        ]
        
        for lesson in lessons {
            modelContext.insert(lesson)
        }
    }
}

struct OnboardingStep {
    let title: String
    let subtitle: String
    let image: String
    let description: String
}

struct OnboardingStepView: View {
    let step: OnboardingStep
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            Image(systemName: step.image)
                .font(.system(size: 80))
                .foregroundColor(.green)
            
            VStack(spacing: 16) {
                Text(step.title)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                
                Text(step.subtitle)
                    .font(.title2)
                    .foregroundColor(.secondary)
                
                Text(step.description)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }
            
            Spacer()
        }
        .padding()
    }
}

struct PrimaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .foregroundColor(.white)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.green)
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

struct SecondaryButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.headline)
            .foregroundColor(.green)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.green.opacity(0.1))
            .cornerRadius(12)
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

#Preview {
    OnboardingView(isFirstLaunch: .constant(true))
        .modelContainer(for: [User.self, Lesson.self, Progress.self, Exercise.self], inMemory: true)
} 