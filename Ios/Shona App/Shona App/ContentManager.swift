//
//  ContentManager.swift
//  Shona App
//
//  Created by Munashe T Chitima on 7/7/2025.
//

import Foundation
import SwiftData
import SwiftUI

// MARK: - JSON Decodable Models
struct LessonJSON: Decodable {
    let id: String
    let title: String
    let description: String
    let category: String
    let orderIndex: Int
    let difficulty: String
    let xpReward: Int
    let culturalContext: String?
    let learningObjectives: String?
    let discoveryElements: String?
    let exercises: [ExerciseJSON]
}

struct ExerciseJSON: Decodable {
    let id: String
    let type: String
    let question: String
    let correctAnswer: String?
    let options: [String]
    let shonaPhrase: String?
    let englishPhrase: String?
    let audioText: String?
    let voiceContent: String?
    let voiceType: String?
    let culturalNote: String?
    let points: Int
    let difficulty: String
    let tags: [String]
    let category: String
}

struct VocabularyJSON: Decodable {
    let id: String
    let shona: String
    let english: String
    let category: String
    let subcategories: [String]
    let level: String
    let difficulty: Int
    let frequency: String
    let register: String
    let dialect: String
    let tones: String?
    let ipa: String?
    let pronunciation: String?
    let morphology: String?
    let culturalNotes: String?
    let usageNotes: String?
    let collocations: [String]
    let synonyms: [String]
    let antonyms: [String]
    let examples: String?
    let audioFile: String?
    let complexity: Int?
    let specialSounds: String?
    let pronunciationTips: [String]
    let learningLevel: String
}

struct QuestJSON: Decodable {
    let id: String
    let title: String
    let description: String
    let storyNarrative: String
    let category: String
    let orderIndex: Int
    let requiredLevel: Int
    let lessons: [String]
    let collaborativeElements: String?
    let intrinsicRewards: String?
}

struct PronunciationExerciseJSON: Decodable {
    let id: String
    let word: String
    let phonetic: String
    let syllables: String
    let tonePattern: String
    let audioFile: String
    let complexity: Int
    let specialSounds: String?
    let pronunciationTips: [String]
    let learningLevel: String
    let category: String
    let translation: String
}

struct FlashcardJSON: Decodable {
    let id: String
    let category: String
    let front: String
    let back: String
    let difficulty: String
    let tags: [String]
    let mnemonic: String?
    let usageExample: String?
    let culturalNote: String?
    let audioFile: String?
}

// MARK: - ContentManager
@MainActor
class ContentManager: ObservableObject {
    @Published var isLoading = false
    @Published var error: String?
    @Published var loadProgress: Double = 0.0
    
    private let modelContext: ModelContext
    
    init(modelContext: ModelContext) {
        self.modelContext = modelContext
    }
    
    func loadAllContent() async {
        isLoading = true
        error = nil
        loadProgress = 0.0
        
        do {
            // Clear existing data first
            try await clearExistingData()
            loadProgress = 0.1
            
            // Load content in sequence
            try await loadVocabulary()
            loadProgress = 0.3
            
            try await loadLessons()
            loadProgress = 0.5
            
            try await loadQuests()
            loadProgress = 0.7
            
            try await loadPronunciationExercises()
            loadProgress = 0.85
            
            try await loadFlashcards()
            loadProgress = 1.0
            
            // Save all changes
            try modelContext.save()
            
            print("✅ Successfully loaded all content")
        } catch {
            self.error = "Failed to load content: \(error.localizedDescription)"
            print("❌ Content loading error: \(error)")
        }
        
        isLoading = false
    }
    
    private func clearExistingData() async throws {
        // Delete all existing data
        let lessonDescriptor = FetchDescriptor<Lesson>()
        let lessons = try modelContext.fetch(lessonDescriptor)
        for lesson in lessons {
            modelContext.delete(lesson)
        }
        
        let vocabDescriptor = FetchDescriptor<VocabularyItem>()
        let vocabItems = try modelContext.fetch(vocabDescriptor)
        for item in vocabItems {
            modelContext.delete(item)
        }
        
        let questDescriptor = FetchDescriptor<Quest>()
        let quests = try modelContext.fetch(questDescriptor)
        for quest in quests {
            modelContext.delete(quest)
        }
        
        let pronunciationDescriptor = FetchDescriptor<PronunciationExercise>()
        let pronunciationExercises = try modelContext.fetch(pronunciationDescriptor)
        for exercise in pronunciationExercises {
            modelContext.delete(exercise)
        }
        
        let flashcardDescriptor = FetchDescriptor<Flashcard>()
        let flashcards = try modelContext.fetch(flashcardDescriptor)
        for flashcard in flashcards {
            modelContext.delete(flashcard)
        }
        
        try modelContext.save()
    }
    
    private func loadVocabulary() async throws {
        guard let url = Bundle.main.url(forResource: "vocabulary", withExtension: "json", subdirectory: "Content") else {
            throw ContentError.fileNotFound("vocabulary.json")
        }
        
        let data = try Data(contentsOf: url)
        let vocabItems = try JSONDecoder().decode([VocabularyJSON].self, from: data)
        
        for item in vocabItems {
            let vocabItem = VocabularyItem(
                id: item.id,
                shona: item.shona,
                english: item.english,
                phonetic: item.ipa ?? "",
                audioFile: item.audioFile,
                category: item.category,
                difficulty: item.learningLevel,
                tonePattern: item.tones ?? "",
                usageNotes: item.usageNotes,
                culturalNotes: item.culturalNotes
            )
            modelContext.insert(vocabItem)
        }
        
        print("✅ Loaded \(vocabItems.count) vocabulary items")
    }
    
    private func loadLessons() async throws {
        guard let url = Bundle.main.url(forResource: "lessons", withExtension: "json", subdirectory: "Content") else {
            throw ContentError.fileNotFound("lessons.json")
        }
        
        let data = try Data(contentsOf: url)
        let lessonsJSON = try JSONDecoder().decode([LessonJSON].self, from: data)
        
        // Fetch vocabulary items to associate with lessons
        let vocabDescriptor = FetchDescriptor<VocabularyItem>()
        let allVocabulary = try modelContext.fetch(vocabDescriptor)
        let vocabByCategory = Dictionary(grouping: allVocabulary) { $0.category }
        
        for lessonData in lessonsJSON {
            let lesson = Lesson(
                id: lessonData.id,
                title: lessonData.title,
                description: lessonData.description,
                category: lessonData.category,
                orderIndex: lessonData.orderIndex,
                difficulty: lessonData.difficulty,
                xpReward: lessonData.xpReward,
                culturalContext: lessonData.culturalContext ?? "",
                learningObjectives: parseLearningObjectives(lessonData.learningObjectives),
                vocabularyItems: []
            )
            
            // Add relevant vocabulary items based on category
            if let categoryVocab = vocabByCategory[lessonData.category] {
                lesson.vocabularyItems = Array(categoryVocab.prefix(10)) // Add first 10 items
            }
            
            // Convert exercises
            for exerciseData in lessonData.exercises {
                let exercise = Exercise(
                    id: exerciseData.id,
                    type: exerciseData.type,
                    question: exerciseData.question,
                    correctAnswer: exerciseData.correctAnswer ?? "",
                    options: exerciseData.options,
                    points: exerciseData.points,
                    shonaPhrase: exerciseData.shonaPhrase,
                    englishPhrase: exerciseData.englishPhrase,
                    audioText: exerciseData.audioText,
                    culturalNote: exerciseData.culturalNote
                )
                lesson.exercises.append(exercise)
            }
            
            modelContext.insert(lesson)
        }
        
        print("✅ Loaded \(lessonsJSON.count) lessons")
    }
    
    private func loadQuests() async throws {
        guard let url = Bundle.main.url(forResource: "quests", withExtension: "json", subdirectory: "Content") else {
            throw ContentError.fileNotFound("quests.json")
        }
        
        let data = try Data(contentsOf: url)
        let questsJSON = try JSONDecoder().decode([QuestJSON].self, from: data)
        
        // Fetch lessons to associate with quests
        let lessonDescriptor = FetchDescriptor<Lesson>()
        let allLessons = try modelContext.fetch(lessonDescriptor)
        let lessonsById = Dictionary(uniqueKeysWithValues: allLessons.map { ($0.id, $0) })
        
        for questData in questsJSON {
            let quest = Quest(
                id: questData.id,
                title: questData.title,
                description: questData.description,
                storyNarrative: questData.storyNarrative,
                category: questData.category,
                orderIndex: questData.orderIndex,
                requiredLevel: questData.requiredLevel,
                xpReward: 50, // Default XP reward
                isUnlocked: questData.requiredLevel == 1,
                activities: []
            )
            
            // Create activities from lesson references
            for (index, lessonId) in questData.lessons.enumerated() {
                if let lesson = lessonsById[lessonId] {
                    let activity = QuestActivity(
                        id: "\(questData.id)_activity_\(index)",
                        title: lesson.title,
                        description: lesson.description,
                        type: "lesson",
                        requiredScore: 80,
                        xpReward: 10,
                        culturalInsight: lesson.culturalContext
                    )
                    quest.activities.append(activity)
                }
            }
            
            modelContext.insert(quest)
        }
        
        print("✅ Loaded \(questsJSON.count) quests")
    }
    
    private func loadPronunciationExercises() async throws {
        guard let url = Bundle.main.url(forResource: "pronunciation-exercises", withExtension: "json", subdirectory: "Content") else {
            throw ContentError.fileNotFound("pronunciation-exercises.json")
        }
        
        let data = try Data(contentsOf: url)
        let exercisesJSON = try JSONDecoder().decode([PronunciationExerciseJSON].self, from: data)
        
        for exerciseData in exercisesJSON {
            let exercise = PronunciationExercise(
                id: exerciseData.id,
                word: exerciseData.word,
                phonetic: exerciseData.phonetic,
                syllables: exerciseData.syllables,
                tonePattern: exerciseData.tonePattern,
                audioFile: exerciseData.audioFile,
                complexity: exerciseData.complexity,
                specialSounds: parseSpecialSounds(exerciseData.specialSounds),
                pronunciationTips: exerciseData.pronunciationTips,
                learningLevel: exerciseData.learningLevel,
                category: exerciseData.category,
                translation: exerciseData.translation
            )
            modelContext.insert(exercise)
        }
        
        print("✅ Loaded \(exercisesJSON.count) pronunciation exercises")
    }
    
    private func loadFlashcards() async throws {
        guard let url = Bundle.main.url(forResource: "flashcards", withExtension: "json", subdirectory: "Content") else {
            // If flashcards.json doesn't exist, create from vocabulary
            try await createFlashcardsFromVocabulary()
            return
        }
        
        let data = try Data(contentsOf: url)
        let flashcardsJSON = try JSONDecoder().decode([FlashcardJSON].self, from: data)
        
        for cardData in flashcardsJSON {
            let flashcard = Flashcard(
                id: cardData.id,
                category: cardData.category,
                front: cardData.front,
                back: cardData.back,
                difficulty: cardData.difficulty,
                tags: cardData.tags,
                mnemonic: cardData.mnemonic,
                usageExample: cardData.usageExample,
                culturalNote: cardData.culturalNote,
                audioFile: cardData.audioFile,
                lastReviewed: nil,
                nextReviewDate: Date(),
                repetitionCount: 0,
                easeFactor: 2.5
            )
            modelContext.insert(flashcard)
        }
        
        print("✅ Loaded \(flashcardsJSON.count) flashcards")
    }
    
    private func createFlashcardsFromVocabulary() async throws {
        let vocabDescriptor = FetchDescriptor<VocabularyItem>()
        let vocabulary = try modelContext.fetch(vocabDescriptor)
        
        for (index, item) in vocabulary.prefix(100).enumerated() { // Create flashcards for first 100 vocab items
            let flashcard = Flashcard(
                id: "flashcard_\(index)",
                category: item.category,
                front: item.shona,
                back: item.english,
                difficulty: item.difficulty,
                tags: [],
                mnemonic: nil,
                usageExample: item.usageNotes,
                culturalNote: item.culturalNotes,
                audioFile: item.audioFile,
                lastReviewed: nil,
                nextReviewDate: Date(),
                repetitionCount: 0,
                easeFactor: 2.5
            )
            modelContext.insert(flashcard)
        }
        
        print("✅ Created \(vocabulary.prefix(100).count) flashcards from vocabulary")
    }
    
    // MARK: - Helper Methods
    private func parseLearningObjectives(_ objectivesString: String?) -> [String] {
        guard let objectives = objectivesString else { return [] }
        
        // Try to parse as JSON array first
        if let data = objectives.data(using: .utf8),
           let array = try? JSONDecoder().decode([String].self, from: data) {
            return array
        }
        
        // Otherwise split by common delimiters
        return objectives
            .split(separator: ";")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
    }
    
    private func parseSpecialSounds(_ soundsString: String?) -> [String] {
        guard let sounds = soundsString else { return [] }
        
        // Try to parse as JSON array
        if let data = sounds.data(using: .utf8),
           let array = try? JSONDecoder().decode([[String: String]].self, from: data) {
            return array.compactMap { $0["token"] }
        }
        
        return []
    }
}

// MARK: - Error Types
enum ContentError: LocalizedError {
    case fileNotFound(String)
    case decodingError(String)
    case savingError(String)
    
    var errorDescription: String? {
        switch self {
        case .fileNotFound(let filename):
            return "Could not find file: \(filename)"
        case .decodingError(let message):
            return "Failed to decode content: \(message)"
        case .savingError(let message):
            return "Failed to save content: \(message)"
        }
    }
}

// MARK: - Loading View
struct ContentLoadingView: View {
    @ObservedObject var contentManager: ContentManager
    
    var body: some View {
        VStack(spacing: 20) {
            ProgressView(value: contentManager.loadProgress) {
                Text("Loading Content...")
                    .font(.headline)
            }
            .progressViewStyle(LinearProgressViewStyle())
            .padding(.horizontal)
            
            if let error = contentManager.error {
                VStack {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.largeTitle)
                        .foregroundColor(.red)
                    Text(error)
                        .font(.caption)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
            } else {
                Text(getLoadingMessage())
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
    }
    
    private func getLoadingMessage() -> String {
        switch contentManager.loadProgress {
        case 0..<0.3:
            return "Loading vocabulary..."
        case 0.3..<0.5:
            return "Loading lessons..."
        case 0.5..<0.7:
            return "Loading quests..."
        case 0.7..<0.85:
            return "Loading pronunciation exercises..."
        case 0.85..<1.0:
            return "Loading flashcards..."
        default:
            return "Almost ready..."
        }
    }
}