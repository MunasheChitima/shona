import SwiftUI

struct SettingsView: View {
    @StateObject private var flashcardManager = FlashcardManager()
    @State private var settings: UserSettings = UserSettings()
    
    var body: some View {
        List {
            Section("Study Goals") {
                HStack {
                    Text("Daily Goal")
                    Spacer()
                    Picker("Daily Goal", selection: $settings.dailyGoal) {
                        ForEach([5, 10, 15, 20, 25, 30, 50], id: \.self) { goal in
                            Text("\(goal) cards").tag(goal)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                HStack {
                    Text("Max New Cards")
                    Spacer()
                    Picker("Max New Cards", selection: $settings.maxNewCardsPerDay) {
                        ForEach([5, 10, 15, 20, 25], id: \.self) { max in
                            Text("\(max)").tag(max)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                HStack {
                    Text("Max Reviews")
                    Spacer()
                    Picker("Max Reviews", selection: $settings.maxReviewsPerDay) {
                        ForEach([25, 50, 75, 100, 150, 200], id: \.self) { max in
                            Text("\(max)").tag(max)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
            }
            
            Section("Difficulty") {
                Picker("Difficulty Level", selection: $settings.difficultyLevel) {
                    Text("Beginner").tag("Beginner")
                    Text("Intermediate").tag("Intermediate")
                    Text("Advanced").tag("Advanced")
                    Text("All Levels").tag("All")
                }
                .pickerStyle(MenuPickerStyle())
            }
            
            Section("Categories") {
                ForEach(FlashcardCategory.allCases, id: \.self) { category in
                    HStack {
                        Text(category.displayName)
                        Spacer()
                        Image(systemName: settings.selectedCategories.contains(category.rawValue) ? "checkmark.circle.fill" : "circle")
                            .foregroundColor(settings.selectedCategories.contains(category.rawValue) ? .green : .gray)
                    }
                    .onTapGesture {
                        toggleCategory(category.rawValue)
                    }
                }
            }
            
            Section("Audio & Haptics") {
                Toggle("Sound Effects", isOn: $settings.enableSound)
                Toggle("Haptic Feedback", isOn: $settings.enableVibration)
            }
            
            Section("Notifications") {
                Toggle("Review Reminders", isOn: $settings.reviewReminderEnabled)
                
                if settings.reviewReminderEnabled {
                    HStack {
                        Text("Reminder Time")
                        Spacer()
                        DatePicker("", selection: $settings.reviewReminderTime, displayedComponents: .hourAndMinute)
                            .labelsHidden()
                    }
                }
            }
            
            Section("Data") {
                Button("Export Data") {
                    exportData()
                }
                .foregroundColor(.blue)
                
                Button("Reset Progress") {
                    resetProgress()
                }
                .foregroundColor(.red)
            }
        }
        .navigationTitle("Settings")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            settings = flashcardManager.settings
        }
        .onChange(of: settings) { _ in
            flashcardManager.updateSettings(settings)
        }
    }
    
    private func toggleCategory(_ category: String) {
        if settings.selectedCategories.contains(category) {
            settings.selectedCategories.removeAll { $0 == category }
        } else {
            settings.selectedCategories.append(category)
        }
    }
    
    private func exportData() {
        let exportString = flashcardManager.exportData()
        // On watchOS, we can't easily share files, but we can log or store
        print("Export data: \(exportString)")
    }
    
    private func resetProgress() {
        flashcardManager.resetProgress()
    }
}

struct SettingsView_Previews: PreviewProvider {
    static var previews: some View {
        NavigationView {
            SettingsView()
        }
    }
}