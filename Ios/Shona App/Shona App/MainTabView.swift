//
//  MainTabView.swift
//  Shona App
//
//  Created by Munashe T Chitima on 6/7/2025.
//

import SwiftUI
import SwiftData
import UserNotifications

struct MainTabView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var users: [User]
    @State private var isFirstLaunch = true
    
    var currentUser: User? {
        users.first
    }
    
    var body: some View {
        Group {
            if isFirstLaunch || currentUser == nil {
                OnboardingView(isFirstLaunch: $isFirstLaunch)
            } else {
                TabView {
                    HomeView()
                        .tabItem {
                            Image(systemName: "house.fill")
                            Text("Home")
                        }
                    
                    LearnView()
                        .tabItem {
                            Image(systemName: "book.fill")
                            Text("Learn")
                        }
                    
                    FlashcardView()
                        .tabItem {
                            Image(systemName: "rectangle.on.rectangle.fill")
                            Text("Flashcards")
                        }
                    
                    ProfileView()
                        .tabItem {
                            Image(systemName: "person.fill")
                            Text("Profile")
                        }
                }
                .accentColor(.green)
            }
        }
        .onAppear {
            checkFirstLaunch()
        }
    }
    
    private func checkFirstLaunch() {
        if users.isEmpty {
            isFirstLaunch = true
        } else {
            isFirstLaunch = false
        }
    }
}

#Preview {
    MainTabView()
        .modelContainer(for: [User.self, Lesson.self, Progress.self, Exercise.self, Flashcard.self, SRSProgress.self, NotificationPreference.self], inMemory: true)
} 