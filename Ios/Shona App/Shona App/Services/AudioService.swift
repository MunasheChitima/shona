//
//  AudioService.swift
//  Shona App
//
//  Created by Munashe T Chitima on 7/1/2025.
//

import AVFoundation
import SwiftUI

protocol AudioServiceProtocol {
    func playWord(audioFile: String, fallbackText: String?) async throws
    func playPhrase(text: String, options: SpeechOptions?) async throws
    func isSupported() -> Bool
    func prefetchAudio(audioFiles: [String]) async
    func setVolume(_ volume: Float)
    func pause()
    func resume()
}

struct SpeechOptions {
    let rate: Float
    let pitch: Float
    let voice: String?
    let language: String
    
    init(rate: Float = 0.8, pitch: Float = 1.0, voice: String? = nil, language: String = "en-US") {
        self.rate = rate
        self.pitch = pitch
        self.voice = voice
        self.language = language
    }
}

@MainActor
class AudioService: NSObject, ObservableObject, AudioServiceProtocol {
    private var audioCache: [String: AVAudioPlayer] = [:]
    private var currentAudioPlayer: AVAudioPlayer?
    private var speechSynthesizer = AVSpeechSynthesizer()
    private var volume: Float = 1.0
    
    @Published var isPlaying = false
    @Published var currentFile: String?
    
    override init() {
        super.init()
        setupAudioSession()
        speechSynthesizer.delegate = self
        preloadCommonAudio()
    }
    
    private func setupAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playAndRecord, mode: .default, options: [.defaultToSpeaker])
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to setup audio session: \(error)")
        }
    }
    
    private func preloadCommonAudio() {
        Task {
            let commonFiles = [
                "mhoro.mp3", "mhoroi.mp3", "shamwari.mp3", "makadii.mp3", "wakadii.mp3",
                "zita.mp3", "ini_ndinonzi.mp3", "munonzi_ani.mp3", "motsi.mp3", "piri.mp3"
            ]
            await prefetchAudio(audioFiles: commonFiles)
        }
    }
    
    func playWord(audioFile: String, fallbackText: String? = nil) async throws {
        do {
            // Try to play audio file first
            let player = try await getAudioPlayer(for: audioFile)
            
            // Stop any currently playing audio
            pause()
            
            currentAudioPlayer = player
            currentFile = audioFile
            isPlaying = true
            
            player.play()
            
            // Wait for playback to complete
            await withCheckedContinuation { continuation in
                player.setFinishCallback {
                    Task { @MainActor in
                        self.isPlaying = false
                        self.currentFile = nil
                    }
                    continuation.resume()
                }
            }
            
        } catch {
            print("Failed to play audio file \(audioFile): \(error)")
            
            // Fallback to text-to-speech
            if let text = fallbackText {
                try await playPhrase(text: text, options: SpeechOptions(rate: 0.7))
            } else {
                throw AudioError.playbackFailed
            }
        }
    }
    
    func playPhrase(text: String, options: SpeechOptions? = nil) async throws {
        let speechOptions = options ?? SpeechOptions()
        
        return try await withCheckedThrowingContinuation { continuation in
            // Stop any ongoing speech
            if speechSynthesizer.isSpeaking {
                speechSynthesizer.stopSpeaking(at: .immediate)
            }
            
            let utterance = AVSpeechUtterance(string: text)
            utterance.rate = speechOptions.rate
            utterance.pitchMultiplier = speechOptions.pitch
            utterance.volume = volume
            
            // Set voice if specified
            if let voiceName = speechOptions.voice {
                utterance.voice = AVSpeechSynthesisVoice(identifier: voiceName) ?? 
                                 AVSpeechSynthesisVoice(language: speechOptions.language)
            } else {
                utterance.voice = AVSpeechSynthesisVoice(language: speechOptions.language)
            }
            
            isPlaying = true
            
            speechSynthesizer.speak(utterance)
            
            // The delegate will handle completion
            speechCompletionHandler = { error in
                self.isPlaying = false
                if let error = error {
                    continuation.resume(throwing: error)
                } else {
                    continuation.resume()
                }
            }
        }
    }
    
    func isSupported() -> Bool {
        return true // iOS always supports both AVAudioPlayer and speech synthesis
    }
    
    func prefetchAudio(audioFiles: [String]) async {
        await withTaskGroup(of: Void.self) { group in
            for file in audioFiles {
                group.addTask { [weak self] in
                    await self?.preloadAudioFile(file)
                }
            }
        }
    }
    
    private func preloadAudioFile(_ audioFile: String) async {
        guard audioCache[audioFile] == nil else { return }
        
        do {
            let player = try await getAudioPlayer(for: audioFile)
            audioCache[audioFile] = player
        } catch {
            print("Failed to preload audio file \(audioFile): \(error)")
        }
    }
    
    private func getAudioPlayer(for audioFile: String) async throws -> AVAudioPlayer {
        if let cachedPlayer = audioCache[audioFile] {
            cachedPlayer.currentTime = 0 // Reset to beginning
            return cachedPlayer
        }
        
        // Try to load from bundle first
        if let bundleURL = Bundle.main.url(forResource: audioFile.replacingOccurrences(of: ".mp3", with: ""), withExtension: "mp3") {
            let player = try AVAudioPlayer(contentsOf: bundleURL)
            player.volume = volume
            audioCache[audioFile] = player
            return player
        }
        
        // Try to load from documents directory
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let audioURL = documentsPath.appendingPathComponent("audio").appendingPathComponent(audioFile)
        
        if FileManager.default.fileExists(atPath: audioURL.path) {
            let player = try AVAudioPlayer(contentsOf: audioURL)
            player.volume = volume
            audioCache[audioFile] = player
            return player
        }
        
        throw AudioError.fileNotFound
    }
    
    func setVolume(_ volume: Float) {
        self.volume = max(0, min(1, volume))
        
        // Update volume for all cached players
        audioCache.values.forEach { player in
            player.volume = self.volume
        }
        
        currentAudioPlayer?.volume = self.volume
    }
    
    func pause() {
        currentAudioPlayer?.pause()
        
        if speechSynthesizer.isSpeaking {
            speechSynthesizer.pauseSpeaking(at: .immediate)
        }
        
        isPlaying = false
    }
    
    func resume() {
        if let player = currentAudioPlayer, !player.isPlaying {
            player.play()
            isPlaying = true
        }
        
        if speechSynthesizer.isPaused {
            speechSynthesizer.continueSpeaking()
            isPlaying = true
        }
    }
    
    func getPlaybackState() -> (isPlaying: Bool, currentFile: String?) {
        return (isPlaying, currentFile)
    }
    
    // MARK: - Private
    
    private var speechCompletionHandler: ((Error?) -> Void)?
}

// MARK: - AVSpeechSynthesizerDelegate

extension AudioService: AVSpeechSynthesizerDelegate {
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        speechCompletionHandler?(nil)
        speechCompletionHandler = nil
    }
    
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        speechCompletionHandler?(AudioError.cancelled)
        speechCompletionHandler = nil
    }
}

// MARK: - Extensions

extension AVAudioPlayer {
    private static var finishCallbacks: [ObjectIdentifier: () -> Void] = [:]
    
    func setFinishCallback(_ callback: @escaping () -> Void) {
        let id = ObjectIdentifier(self)
        AVAudioPlayer.finishCallbacks[id] = callback
        
        // Set up notification for when playback finishes
        NotificationCenter.default.addObserver(
            forName: .AVPlayerItemDidPlayToEndTime,
            object: nil,
            queue: .main
        ) { _ in
            callback()
            AVAudioPlayer.finishCallbacks.removeValue(forKey: id)
        }
    }
}

// MARK: - Error Types

enum AudioError: Error, LocalizedError {
    case fileNotFound
    case playbackFailed
    case cancelled
    
    var errorDescription: String? {
        switch self {
        case .fileNotFound:
            return "Audio file not found"
        case .playbackFailed:
            return "Audio playback failed"
        case .cancelled:
            return "Audio playback was cancelled"
        }
    }
}

// MARK: - Singleton

extension AudioService {
    static let shared = AudioService()
}