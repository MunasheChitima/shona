//
//  PronunciationTextView.swift
//  Shona App
//
//  Created by Munashe T Chitima on 7/1/2025.
//

import SwiftUI

struct PronunciationTextView: View {
    let word: String
    let pronunciation: String
    let phonetic: String?
    let syllables: String?
    let tonePattern: String?
    let audioFile: String?
    var size: PronunciationSize = .medium
    var showDetails: Bool = true
    
    @StateObject private var audioService = AudioService.shared
    @State private var showPhonetic = false
    @State private var isPlaying = false
    
    enum PronunciationSize {
        case small, medium, large
        
        var wordFont: Font {
            switch self {
            case .small: return .title3.weight(.semibold)
            case .medium: return .title2.weight(.semibold)
            case .large: return .largeTitle.weight(.bold)
            }
        }
        
        var pronunciationFont: Font {
            switch self {
            case .small: return .callout.weight(.medium)
            case .medium: return .body.weight(.medium)
            case .large: return .title3.weight(.medium)
            }
        }
        
        var phoneticFont: Font {
            switch self {
            case .small: return .caption2
            case .medium: return .caption
            case .large: return .body
            }
        }
        
        var buttonSize: CGFloat {
            switch self {
            case .small: return 32
            case .medium: return 40
            case .large: return 48
            }
        }
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Main word display
            HStack(spacing: 12) {
                Text(word)
                    .font(size.wordFont)
                    .foregroundColor(.primary)
                
                // Audio button
                Button(action: playAudio) {
                    Image(systemName: isPlaying ? "speaker.wave.2.fill" : "speaker.wave.2")
                        .font(.system(size: size.buttonSize * 0.4))
                        .foregroundColor(.white)
                        .frame(width: size.buttonSize, height: size.buttonSize)
                        .background(
                            Circle()
                                .fill(isPlaying ? Color.blue.opacity(0.8) : Color.blue)
                        )
                        .scaleEffect(isPlaying ? 1.1 : 1.0)
                        .animation(.easeInOut(duration: 0.1), value: isPlaying)
                }
                .disabled(isPlaying)
                
                Spacer()
            }
            
            // Pronunciation text - always visible
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("PRONUNCIATION")
                            .font(.caption2)
                            .fontWeight(.medium)
                            .foregroundColor(.blue)
                            .tracking(0.5)
                        
                        Text(pronunciation)
                            .font(size.pronunciationFont)
                            .foregroundColor(.blue)
                            .fontWeight(.medium)
                    }
                    
                    Spacer()
                    
                    if showDetails && (phonetic != nil || syllables != nil || tonePattern != nil) {
                        Button(action: { showPhonetic.toggle() }) {
                            Image(systemName: "info.circle")
                                .font(.callout)
                                .foregroundColor(.blue)
                        }
                    }
                }
                
                // Expandable phonetic information
                if showPhonetic && showDetails {
                    VStack(alignment: .leading, spacing: 8) {
                        Rectangle()
                            .fill(Color.blue.opacity(0.3))
                            .frame(height: 1)
                        
                        VStack(alignment: .leading, spacing: 8) {
                            if let phonetic = phonetic {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Phonetic")
                                        .font(.caption)
                                        .fontWeight(.medium)
                                        .foregroundColor(.blue)
                                    
                                    Text(phonetic)
                                        .font(size.phoneticFont.monospaced())
                                        .foregroundColor(.blue)
                                }
                            }
                            
                            if let syllables = syllables {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Syllables")
                                        .font(.caption)
                                        .fontWeight(.medium)
                                        .foregroundColor(.blue)
                                    
                                    Text(syllables)
                                        .font(size.phoneticFont)
                                        .foregroundColor(.blue)
                                }
                            }
                            
                            if let tonePattern = tonePattern {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Tone Pattern")
                                        .font(.caption)
                                        .fontWeight(.medium)
                                        .foregroundColor(.blue)
                                    
                                    Text(tonePattern)
                                        .font(size.phoneticFont.monospaced())
                                        .foregroundColor(.blue)
                                }
                            }
                        }
                    }
                    .transition(.opacity.combined(with: .scale))
                }
            }
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(Color.blue.opacity(0.1))
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.blue.opacity(0.3), lineWidth: 1)
                    )
            )
            
            // Tone pattern visualization
            if let tonePattern = tonePattern, showDetails {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Tone Pattern")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    HStack(spacing: 8) {
                        ForEach(Array(tonePattern.split(separator: "-").enumerated()), id: \.offset) { index, tone in
                            VStack(spacing: 4) {
                                Circle()
                                    .fill(tone == "H" ? Color.orange : Color.blue)
                                    .frame(width: 12, height: 12)
                                    .offset(y: tone == "H" ? -4 : 4)
                                
                                Text(String(tone))
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                        }
                        
                        Spacer()
                    }
                    
                    Text("H = High tone, L = Low tone")
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
        }
        .animation(.easeInOut, value: showPhonetic)
        .onReceive(audioService.$isPlaying) { playing in
            isPlaying = playing && audioService.currentFile == audioFile
        }
    }
    
    private func playAudio() {
        Task { @MainActor in
            isPlaying = true
            do {
                if let audioFile = audioFile {
                    try await audioService.playWord(audioFile: audioFile, fallbackText: word)
                } else {
                    try await audioService.playPhrase(text: word, options: SpeechOptions(rate: 0.7))
                }
            } catch {
                print("Audio playback failed: \(error)")
            }
            isPlaying = false
        }
    }
}

// MARK: - Compact Version

struct PronunciationTextCompact: View {
    let word: String
    let pronunciation: String
    let audioFile: String?
    
    @StateObject private var audioService = AudioService.shared
    @State private var isPlaying = false
    
    var body: some View {
        HStack(spacing: 8) {
            Text(word)
                .font(.body)
                .fontWeight(.medium)
                .foregroundColor(.primary)
            
            Text(pronunciation)
                .font(.caption)
                .fontWeight(.medium)
                .foregroundColor(.blue)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(
                    Capsule()
                        .fill(Color.blue.opacity(0.1))
                )
            
            Button(action: playAudio) {
                Image(systemName: isPlaying ? "speaker.wave.2.fill" : "speaker.wave.2")
                    .font(.caption)
                    .foregroundColor(.blue)
                    .frame(width: 24, height: 24)
                    .background(
                        Circle()
                            .fill(Color.blue.opacity(0.1))
                    )
            }
            .disabled(isPlaying)
        }
        .onReceive(audioService.$isPlaying) { playing in
            isPlaying = playing && audioService.currentFile == audioFile
        }
    }
    
    private func playAudio() {
        Task { @MainActor in
            isPlaying = true
            do {
                if let audioFile = audioFile {
                    try await audioService.playWord(audioFile: audioFile, fallbackText: word)
                } else {
                    try await audioService.playPhrase(text: word, options: SpeechOptions(rate: 0.7))
                }
            } catch {
                print("Audio playback failed: \(error)")
            }
            isPlaying = false
        }
    }
}

// MARK: - Preview

#Preview {
    VStack(spacing: 20) {
        PronunciationTextView(
            word: "mhoro",
            pronunciation: "mm-HO-ro",
            phonetic: "/m̩.ho.ro/",
            syllables: "m-ho-ro",
            tonePattern: "L-H-L",
            audioFile: "mhoro.mp3",
            size: .large
        )
        
        PronunciationTextView(
            word: "shamwari",
            pronunciation: "sham-WAH-ree",
            phonetic: "/ʃam.wa.ri/",
            syllables: "sham-wa-ri",
            tonePattern: "L-H-L",
            audioFile: "shamwari.mp3",
            size: .medium
        )
        
        PronunciationTextCompact(
            word: "makadii",
            pronunciation: "mah-kah-DEE",
            audioFile: "makadii.mp3"
        )
    }
    .padding()
}