//
//  Shona_AppApp.swift
//  Shona App
//
//  Created by Munashe T Chitima on 6/7/2025.
//

import SwiftUI
import SwiftData

@main
struct Shona_AppApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            User.self,
            Lesson.self,
            Progress.self,
            Exercise.self
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            MainTabView()
        }
        .modelContainer(sharedModelContainer)
    }
}
