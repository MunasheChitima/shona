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
    @AppStorage("hasCompletedOnboarding") private var hasCompletedOnboarding = false
    @AppStorage("username") private var username = ""
    @AppStorage("userId") private var userId = ""
    
    @State private var name = ""
    @State private var currentPage = 0
    @State private var contentManager: ContentManager?
    @State private var isLoadingContent = false
    @State private var loadError: String?
    
    var body: some View {
        if isLoadingContent {
            ContentLoadingView(contentManager: contentManager!)
                .navigationBarHidden(true)
        } else {
            VStack {
                TabView(selection: $currentPage) {
                    // Welcome Page
                    VStack(spacing: 30) {
                        Image(systemName: "globe.africa")
                            .font(.system(size: 100))
                            .foregroundColor(.blue)
                        
                        Text("Mauya - Welcome!")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Let's begin your journey into the beautiful Shona language")
                            .font(.headline)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                    }
                    .tag(0)
                    
                    // Name Input Page
                    VStack(spacing: 30) {
                        Text("Zita rako ndiani?")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("What is your name?")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        
                        TextField("Enter your name", text: $name)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .padding(.horizontal, 40)
                            .autocapitalization(.words)
                    }
                    .tag(1)
                    
                    // Features Page
                    VStack(spacing: 30) {
                        Text("What You'll Learn")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        VStack(alignment: .leading, spacing: 20) {
                            FeatureRow(icon: "bubble.left.and.bubble.right", 
                                      title: "Greetings & Conversations",
                                      description: "Master daily communication")
                            
                            FeatureRow(icon: "mic", 
                                      title: "Perfect Pronunciation",
                                      description: "AI-powered voice coaching")
                            
                            FeatureRow(icon: "sparkles", 
                                      title: "Cultural Immersion",
                                      description: "Understand traditions and customs")
                            
                            FeatureRow(icon: "trophy", 
                                      title: "Interactive Quests",
                                      description: "Learn through engaging stories")
                        }
                        .padding(.horizontal)
                    }
                    .tag(2)
                    
                    // Ready Page
                    VStack(spacing: 30) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 100))
                            .foregroundColor(.green)
                        
                        Text("Takagadzirira!")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("You're ready to start learning")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        
                        if let error = loadError {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                                .multilineTextAlignment(.center)
                                .padding()
                        }
                    }
                    .tag(3)
                }
                .tabViewStyle(PageTabViewStyle())
                
                // Navigation Buttons
                HStack {
                    if currentPage > 0 {
                        Button("Back") {
                            withAnimation {
                                currentPage -= 1
                            }
                        }
                        .padding()
                    }
                    
                    Spacer()
                    
                    Button(currentPage == 3 ? "Start Learning" : "Next") {
                        if currentPage < 3 {
                            withAnimation {
                                currentPage += 1
                            }
                        } else {
                            completeOnboarding()
                        }
                    }
                    .padding()
                    .disabled(currentPage == 1 && name.isEmpty)
                }
                .padding(.horizontal)
            }
        }
    }
    
    private func completeOnboarding() {
        // Save user data
        username = name
        userId = UUID().uuidString
        
        // Create user
        let user = User(id: userId, name: username)
        modelContext.insert(user)
        
        // Initialize ContentManager and load content
        contentManager = ContentManager(modelContext: modelContext)
        isLoadingContent = true
        
        Task {
            await contentManager?.loadAllContent()
            
            // After content is loaded, complete onboarding
            await MainActor.run {
                isLoadingContent = false
                if contentManager?.error == nil {
                    hasCompletedOnboarding = true
                } else {
                    loadError = contentManager?.error
                }
            }
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(spacing: 15) {
            Image(systemName: icon)
                .font(.largeTitle)
                .foregroundColor(.blue)
                .frame(width: 50)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

#Preview {
    OnboardingView()
        .modelContainer(for: [User.self, Lesson.self, VocabularyItem.self])
} 