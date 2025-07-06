import SwiftUI

struct PronunciationView: View {
    let flashcard: Flashcard
    @StateObject private var speechSynthesizer = SpeechSynthesizer()
    @State private var isPlaying = false
    
    var body: some View {
        VStack(spacing: 20) {
            // Word display
            VStack(spacing: 8) {
                Text(flashcard.shonaText)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.primary)
                
                Text(flashcard.englishText)
                    .font(.title3)
                    .foregroundColor(.secondary)
            }
            
            // Pronunciation guide
            VStack(spacing: 12) {
                if let pronunciation = flashcard.pronunciation {
                    HStack {
                        Text("Pronunciation:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text("[\(pronunciation)]")
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    .padding(.horizontal)
                }
                
                if let phonetic = flashcard.phonetic {
                    HStack {
                        Text("IPA:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(phonetic)
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    .padding(.horizontal)
                }
                
                if let tonePattern = flashcard.tonePattern {
                    HStack {
                        Text("Tone Pattern:")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Spacer()
                        Text(tonePattern)
                            .font(.caption)
                            .fontWeight(.medium)
                    }
                    .padding(.horizontal)
                }
            }
            .padding()
            .background(Color.gray.opacity(0.1))
            .cornerRadius(12)
            
            // Playback controls
            Button(action: {
                playPronunciation()
            }) {
                HStack {
                    Image(systemName: isPlaying ? "stop.circle.fill" : "play.circle.fill")
                        .font(.system(size: 24))
                    Text(isPlaying ? "Stop" : "Play")
                        .font(.system(size: 16, weight: .medium))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .frame(height: 44)
                .background(Color.orange)
                .cornerRadius(22)
            }
            .buttonStyle(PlainButtonStyle())
            
            // Examples
            if !flashcard.examples.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Examples:")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    ForEach(flashcard.examples.prefix(2)) { example in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(example.shona)
                                .font(.caption)
                                .fontWeight(.medium)
                            Text(example.english)
                                .font(.caption2)
                                .foregroundColor(.secondary)
                        }
                        .padding(.horizontal)
                    }
                }
                .padding()
                .background(Color.blue.opacity(0.1))
                .cornerRadius(12)
            }
            
            Spacer()
        }
        .padding()
        .navigationTitle("Pronunciation")
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func playPronunciation() {
        if isPlaying {
            speechSynthesizer.stopSpeaking()
            isPlaying = false
        } else {
            isPlaying = true
            let textToSpeak = flashcard.pronunciation ?? flashcard.shonaText
            speechSynthesizer.speak(textToSpeak) { [self] in
                isPlaying = false
            }
        }
    }
}

struct PronunciationView_Previews: PreviewProvider {
    static var previews: some View {
        PronunciationView(flashcard: Flashcard(
            shonaText: "mhoro",
            englishText: "hello (informal)",
            pronunciation: "mho-ro",
            phonetic: "/mʰoro/",
            tonePattern: "HL",
            category: "Greetings",
            examples: [
                FlashcardExample(
                    shona: "Mhoro shamwari!",
                    english: "Hello friend!",
                    context: "greeting friends"
                )
            ]
        ))
    }
}