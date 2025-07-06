//
//  ContentSyncService.swift
//  Shona App
//
//  Created by Munashe T Chitima on 7/1/2025.
//

import Foundation
import SwiftUI
import Combine

struct ContentVersion: Codable {
    let id: String
    let version: Int
    let contentType: String
    let hash: String
    let timestamp: String
    let size: Int
    let dependencies: [String]?
}

struct ContentManifest: Codable {
    let version: String
    let lastUpdated: String
    let platform: String
    let content: ContentVersions
    let metadata: ManifestMetadata
    
    struct ContentVersions: Codable {
        let lessons: ContentVersion
        let vocabulary: ContentVersion
        let audio: ContentVersion
        let exercises: ContentVersion
        let cultural_notes: ContentVersion
    }
    
    struct ManifestMetadata: Codable {
        let totalSize: Int
        let requiredVersion: String
        let compatibilityVersion: String
    }
}

struct SyncResult {
    let success: Bool
    let updatedContent: [String]
    let errors: [String]
    let totalUpdates: Int
    let syncDuration: TimeInterval
}

struct SyncOptions {
    let forceSync: Bool
    let contentTypes: [String]?
    let priority: SyncPriority
    let backgroundSync: Bool
    let retryCount: Int
    
    enum SyncPriority: String, CaseIterable {
        case high = "high"
        case normal = "normal"
        case low = "low"
    }
}

@MainActor
class ContentSyncService: ObservableObject {
    static let shared = ContentSyncService()
    
    private let apiBaseUrl: String
    private let platform = "ios"
    private let maxRetries = 3
    
    @Published var localManifest: ContentManifest?
    @Published var syncInProgress = false
    @Published var lastSyncDate: Date?
    @Published var syncStatus: String = "Ready"
    
    private var syncQueue: [(contentType: String, priority: Int)] = []
    private var retryAttempts: [String: Int] = [:]
    private var cancellables = Set<AnyCancellable>()
    
    init(apiBaseUrl: String = "http://localhost:3000/api") {
        self.apiBaseUrl = apiBaseUrl
        Task {
            await initializeSync()
        }
    }
    
    private func initializeSync() async {
        await loadLocalManifest()
        setupPeriodicSync()
        await checkForUpdates()
    }
    
    // MARK: - Manifest Management
    
    private func loadLocalManifest() async {
        do {
            guard let url = getLocalManifestURL(),
                  FileManager.default.fileExists(atPath: url.path) else {
                return
            }
            
            let data = try Data(contentsOf: url)
            let manifest = try JSONDecoder().decode(ContentManifest.self, from: data)
            localManifest = manifest
            
        } catch {
            print("Failed to load local manifest: \(error)")
            localManifest = nil
        }
    }
    
    private func saveLocalManifest(_ manifest: ContentManifest) async {
        do {
            guard let url = getLocalManifestURL() else { return }
            
            let data = try JSONEncoder().encode(manifest)
            try data.write(to: url)
            localManifest = manifest
            lastSyncDate = Date()
            
        } catch {
            print("Failed to save local manifest: \(error)")
        }
    }
    
    private func getLocalManifestURL() -> URL? {
        guard let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return nil
        }
        return documentsPath.appendingPathComponent("content-manifest.json")
    }
    
    // MARK: - Periodic Sync
    
    private func setupPeriodicSync() {
        // Check for updates every 30 minutes when app is active
        Timer.publish(every: 30 * 60, on: .main, in: .default)
            .autoconnect()
            .sink { [weak self] _ in
                Task {
                    await self?.checkForUpdates(options: SyncOptions(
                        forceSync: false,
                        contentTypes: nil,
                        priority: .normal,
                        backgroundSync: true,
                        retryCount: 0
                    ))
                }
            }
            .store(in: &cancellables)
        
        // Check when app becomes active
        NotificationCenter.default.publisher(for: UIApplication.willEnterForegroundNotification)
            .sink { [weak self] _ in
                Task {
                    await self?.checkForUpdates(options: SyncOptions(
                        forceSync: false,
                        contentTypes: nil,
                        priority: .normal,
                        backgroundSync: true,
                        retryCount: 0
                    ))
                }
            }
            .store(in: &cancellables)
    }
    
    // MARK: - Sync Operations
    
    func checkForUpdates(options: SyncOptions = SyncOptions(
        forceSync: false,
        contentTypes: nil,
        priority: .normal,
        backgroundSync: false,
        retryCount: 0
    )) async -> Bool {
        do {
            syncStatus = "Checking for updates..."
            
            let remoteManifest = try await fetchRemoteManifest()
            let updatesNeeded = compareManifests(local: localManifest, remote: remoteManifest)
            
            if !updatesNeeded.isEmpty {
                if options.backgroundSync && updatesNeeded.count > 2 {
                    // Queue updates for later if too many in background
                    queueUpdates(updatesNeeded, priority: options.priority)
                    syncStatus = "Updates queued"
                    return false
                }
                
                _ = try await syncContent(contentTypes: updatesNeeded, options: options)
                return true
            }
            
            syncStatus = "Up to date"
            return false
            
        } catch {
            print("Failed to check for updates: \(error)")
            syncStatus = "Check failed"
            return false
        }
    }
    
    private func fetchRemoteManifest() async throws -> ContentManifest {
        guard let url = URL(string: "\(apiBaseUrl)/sync/manifest") else {
            throw ContentSyncError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(platform, forHTTPHeaderField: "Platform")
        request.setValue(localManifest?.version ?? "0.0.0", forHTTPHeaderField: "Client-Version")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw ContentSyncError.networkError("Failed to fetch manifest")
        }
        
        return try JSONDecoder().decode(ContentManifest.self, from: data)
    }
    
    private func compareManifests(local: ContentManifest?, remote: ContentManifest) -> [String] {
        guard let local = local else {
            return ["lessons", "vocabulary", "exercises", "cultural_notes", "audio"]
        }
        
        var updatesNeeded: [String] = []
        
        let contentPairs = [
            ("lessons", local.content.lessons, remote.content.lessons),
            ("vocabulary", local.content.vocabulary, remote.content.vocabulary),
            ("exercises", local.content.exercises, remote.content.exercises),
            ("cultural_notes", local.content.cultural_notes, remote.content.cultural_notes),
            ("audio", local.content.audio, remote.content.audio)
        ]
        
        for (contentType, localVersion, remoteVersion) in contentPairs {
            if localVersion.version < remoteVersion.version || localVersion.hash != remoteVersion.hash {
                updatesNeeded.append(contentType)
            }
        }
        
        return updatesNeeded
    }
    
    private func queueUpdates(_ contentTypes: [String], priority: SyncOptions.SyncPriority) {
        let priorityNum = priority == .high ? 1 : priority == .normal ? 2 : 3
        
        for contentType in contentTypes {
            syncQueue.append((contentType: contentType, priority: priorityNum))
        }
        
        // Sort queue by priority
        syncQueue.sort { $0.priority < $1.priority }
    }
    
    func syncContent(contentTypes: [String], options: SyncOptions) async throws -> SyncResult {
        guard !syncInProgress || options.forceSync else {
            throw ContentSyncError.syncInProgress
        }
        
        syncInProgress = true
        syncStatus = "Syncing content..."
        
        let startTime = Date()
        var result = SyncResult(
            success: true,
            updatedContent: [],
            errors: [],
            totalUpdates: 0,
            syncDuration: 0
        )
        
        defer {
            syncInProgress = false
            result = SyncResult(
                success: result.success,
                updatedContent: result.updatedContent,
                errors: result.errors,
                totalUpdates: result.totalUpdates,
                syncDuration: Date().timeIntervalSince(startTime)
            )
            syncStatus = result.success ? "Sync completed" : "Sync failed"
        }
        
        do {
            for contentType in contentTypes {
                do {
                    try await syncContentType(contentType, options: options)
                    result = SyncResult(
                        success: result.success,
                        updatedContent: result.updatedContent + [contentType],
                        errors: result.errors,
                        totalUpdates: result.totalUpdates + 1,
                        syncDuration: result.syncDuration
                    )
                } catch {
                    let errorMsg = "Failed to sync \(contentType): \(error.localizedDescription)"
                    result = SyncResult(
                        success: false,
                        updatedContent: result.updatedContent,
                        errors: result.errors + [errorMsg],
                        totalUpdates: result.totalUpdates,
                        syncDuration: result.syncDuration
                    )
                    
                    await handleSyncError(contentType, error: error, options: options)
                }
            }
            
            // Update local manifest if any content was synced
            if !result.updatedContent.isEmpty {
                let newManifest = try await fetchRemoteManifest()
                await saveLocalManifest(newManifest)
            }
            
        } catch {
            result = SyncResult(
                success: false,
                updatedContent: result.updatedContent,
                errors: result.errors + ["Sync failed: \(error.localizedDescription)"],
                totalUpdates: result.totalUpdates,
                syncDuration: result.syncDuration
            )
        }
        
        return result
    }
    
    private func syncContentType(_ contentType: String, options: SyncOptions) async throws {
        // Download content with retry logic
        let content = try await downloadContent(contentType, retryCount: options.retryCount)
        
        // Validate content integrity
        try validateContent(contentType, content: content)
        
        // Store content locally
        try await storeContent(contentType, content: content)
        
        // Process content for iOS
        await processContentForIOS(contentType, content: content)
    }
    
    private func downloadContent(_ contentType: String, retryCount: Int) async throws -> [String: Any] {
        guard let url = URL(string: "\(apiBaseUrl)/sync/content/\(contentType)") else {
            throw ContentSyncError.invalidURL
        }
        
        var request = URLRequest(url: url)
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue(platform, forHTTPHeaderField: "Platform")
        request.setValue("gzip", forHTTPHeaderField: "Accept-Encoding")
        
        var lastError: Error?
        
        for attempt in 0...maxRetries {
            do {
                let (data, response) = try await URLSession.shared.data(for: request)
                
                guard let httpResponse = response as? HTTPURLResponse,
                      httpResponse.statusCode == 200 else {
                    throw ContentSyncError.networkError("HTTP Error")
                }
                
                let json = try JSONSerialization.jsonObject(with: data) as? [String: Any]
                guard let content = json else {
                    throw ContentSyncError.invalidData
                }
                
                // Reset retry count on success
                retryAttempts.removeValue(forKey: contentType)
                
                return content
                
            } catch {
                lastError = error
                
                if attempt < maxRetries {
                    // Exponential backoff
                    let delay = pow(2.0, Double(attempt))
                    try await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
                }
            }
        }
        
        throw lastError ?? ContentSyncError.downloadFailed
    }
    
    private func validateContent(_ contentType: String, content: [String: Any]) throws {
        switch contentType {
        case "lessons":
            try validateLessonsContent(content)
        case "vocabulary":
            try validateVocabularyContent(content)
        case "exercises":
            try validateExercisesContent(content)
        default:
            try validateGenericContent(content)
        }
    }
    
    private func validateLessonsContent(_ content: [String: Any]) throws {
        guard let lessons = content["lessons"] as? [[String: Any]] else {
            throw ContentSyncError.invalidContentStructure("Invalid lessons structure")
        }
        
        for (index, lesson) in lessons.enumerated() {
            guard lesson["id"] != nil,
                  lesson["title"] != nil,
                  lesson["vocabulary"] != nil else {
                throw ContentSyncError.invalidContentStructure("Invalid lesson at index \(index)")
            }
        }
    }
    
    private func validateVocabularyContent(_ content: [String: Any]) throws {
        guard let vocabulary = content["vocabulary"] as? [[String: Any]] else {
            throw ContentSyncError.invalidContentStructure("Invalid vocabulary structure")
        }
        
        for (index, word) in vocabulary.enumerated() {
            guard word["shona"] != nil,
                  word["english"] != nil,
                  word["pronunciation"] != nil else {
                throw ContentSyncError.invalidContentStructure("Invalid vocabulary item at index \(index)")
            }
        }
    }
    
    private func validateExercisesContent(_ content: [String: Any]) throws {
        guard let exercises = content["exercises"] as? [[String: Any]] else {
            throw ContentSyncError.invalidContentStructure("Invalid exercises structure")
        }
        
        for (index, exercise) in exercises.enumerated() {
            guard exercise["id"] != nil,
                  exercise["type"] != nil,
                  exercise["question"] != nil else {
                throw ContentSyncError.invalidContentStructure("Invalid exercise at index \(index)")
            }
        }
    }
    
    private func validateGenericContent(_ content: [String: Any]) throws {
        guard !content.isEmpty else {
            throw ContentSyncError.invalidData
        }
    }
    
    private func storeContent(_ contentType: String, content: [String: Any]) async throws {
        guard let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            throw ContentSyncError.storageError("Cannot access documents directory")
        }
        
        let contentURL = documentsPath.appendingPathComponent("content-\(contentType).json")
        
        do {
            let data = try JSONSerialization.data(withJSONObject: content, options: [])
            try data.write(to: contentURL)
        } catch {
            throw ContentSyncError.storageError("Failed to store content: \(error.localizedDescription)")
        }
    }
    
    private func processContentForIOS(_ contentType: String, content: [String: Any]) async {
        // iOS-specific content processing
        switch contentType {
        case "lessons":
            await processLessonsForIOS(content)
        case "audio":
            await processAudioForIOS(content)
        default:
            break
        }
    }
    
    private func processLessonsForIOS(_ content: [String: Any]) async {
        // Preload audio files for lessons
        guard let lessons = content["lessons"] as? [[String: Any]] else { return }
        
        for lesson in lessons {
            if let vocabulary = lesson["vocabulary"] as? [[String: Any]] {
                for word in vocabulary {
                    if let audioFile = word["audioFile"] as? String {
                        await preloadAudioFile(audioFile)
                    }
                }
            }
        }
    }
    
    private func processAudioForIOS(_ content: [String: Any]) async {
        // Process audio file manifest for iOS
        guard let files = content["files"] as? [[String: Any]] else { return }
        
        for file in files {
            if let fileName = file["name"] as? String,
               let type = file["type"] as? String,
               type == "mp3" || type == "m4a" {
                await preloadAudioFile(fileName)
            }
        }
    }
    
    private func preloadAudioFile(_ fileName: String) async {
        // This would integrate with the AudioService for preloading
        print("Preloading audio file: \(fileName)")
    }
    
    private func handleSyncError(_ contentType: String, error: Error, options: SyncOptions) async {
        let retryCount = retryAttempts[contentType, default: 0]
        
        if retryCount < maxRetries {
            retryAttempts[contentType] = retryCount + 1
            
            // Exponential backoff retry
            let delay = pow(2.0, Double(retryCount))
            try? await Task.sleep(nanoseconds: UInt64(delay * 1_000_000_000))
            
            do {
                try await syncContentType(contentType, options: options)
            } catch {
                print("Retry failed for \(contentType): \(error)")
            }
        } else {
            // Max retries reached
            retryAttempts.removeValue(forKey: contentType)
            print("Max retries reached for \(contentType)")
        }
    }
    
    // MARK: - Public Methods
    
    func forceSyncAll() async throws -> SyncResult {
        let contentTypes = ["lessons", "vocabulary", "exercises", "cultural_notes", "audio"]
        return try await syncContent(contentTypes: contentTypes, options: SyncOptions(
            forceSync: true,
            contentTypes: contentTypes,
            priority: .high,
            backgroundSync: false,
            retryCount: 0
        ))
    }
    
    func getLocalContent(_ contentType: String) async -> [String: Any]? {
        guard let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return nil
        }
        
        let contentURL = documentsPath.appendingPathComponent("content-\(contentType).json")
        
        do {
            let data = try Data(contentsOf: contentURL)
            return try JSONSerialization.jsonObject(with: data) as? [String: Any]
        } catch {
            print("Failed to get local content \(contentType): \(error)")
            return nil
        }
    }
    
    func clearLocalContent() async {
        let contentTypes = ["lessons", "vocabulary", "exercises", "cultural_notes", "audio"]
        
        guard let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            return
        }
        
        for contentType in contentTypes {
            let contentURL = documentsPath.appendingPathComponent("content-\(contentType).json")
            try? FileManager.default.removeItem(at: contentURL)
        }
        
        if let manifestURL = getLocalManifestURL() {
            try? FileManager.default.removeItem(at: manifestURL)
        }
        
        localManifest = nil
        lastSyncDate = nil
    }
    
    func getSyncStatus() -> (inProgress: Bool, queueLength: Int, lastSync: Date?) {
        return (syncInProgress, syncQueue.count, lastSyncDate)
    }
}

// MARK: - Error Types

enum ContentSyncError: LocalizedError {
    case invalidURL
    case networkError(String)
    case invalidData
    case invalidContentStructure(String)
    case storageError(String)
    case syncInProgress
    case downloadFailed
    
    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .networkError(let message):
            return "Network error: \(message)"
        case .invalidData:
            return "Invalid data received"
        case .invalidContentStructure(let message):
            return "Invalid content structure: \(message)"
        case .storageError(let message):
            return "Storage error: \(message)"
        case .syncInProgress:
            return "Sync already in progress"
        case .downloadFailed:
            return "Download failed"
        }
    }
}