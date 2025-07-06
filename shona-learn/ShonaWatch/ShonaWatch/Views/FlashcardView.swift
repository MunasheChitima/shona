import SwiftUI

struct FlashcardView: View {
    @StateObject private var flashcardManager = FlashcardManager()
    @StateObject private var speechSynthesizer = SpeechSynthesizer()
    @State private var showingAnswer = false
    @State private var startTime = Date()
    @State private var sessionStarted = false
    
    var body: some View {
        VStack(spacing: 16) {
            if let card = flashcardManager.currentCard {
                // Progress indicator
                HStack {
                    Text("Card \(flashcardManager.currentSession?.totalReviewed ?? 0 + 1)")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                    
                    Button(action: {
                        if let pronunciation = card.pronunciation {
                            speechSynthesizer.speak(pronunciation)
                        } else {
                            speechSynthesizer.speak(card.shonaText)
                        }
                    }) {
                        Image(systemName: "speaker.wave.2")
                            .font(.system(size: 14))
                            .foregroundColor(.orange)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
                .padding(.horizontal)
                
                // Card content
                VStack(spacing: 12) {
                    if !showingAnswer {
                        // Question side
                        VStack(spacing: 8) {
                            Text(card.shonaText)
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.primary)
                                .multilineTextAlignment(.center)
                            
                            if let pronunciation = card.pronunciation {
                                Text("[\(pronunciation)]")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            
                            Text(card.category)
                                .font(.caption2)
                                .foregroundColor(.orange)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(Color.orange.opacity(0.1))
                                .cornerRadius(8)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, minHeight: 100)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(12)
                        
                        Button("Show Answer") {
                            withAnimation(.easeInOut(duration: 0.3)) {
                                showingAnswer = true
                            }
                        }
                        .buttonStyle(.borderedProminent)
                        .tint(.orange)
                        
                    } else {
                        // Answer side
                        VStack(spacing: 8) {
                            Text(card.shonaText)
                                .font(.title3)
                                .fontWeight(.semibold)
                                .foregroundColor(.primary)
                            
                            Text(card.englishText)
                                .font(.title2)
                                .fontWeight(.bold)
                                .foregroundColor(.blue)
                                .multilineTextAlignment(.center)
                            
                            if let pronunciation = card.pronunciation {
                                Text("[\(pronunciation)]")
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                            
                            if let culturalNotes = card.culturalNotes {
                                Text(culturalNotes)
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                                    .multilineTextAlignment(.center)
                                    .padding(.top, 4)
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity, minHeight: 100)
                        .background(Color.blue.opacity(0.1))
                        .cornerRadius(12)
                        
                        // Review buttons
                        VStack(spacing: 8) {
                            HStack(spacing: 6) {
                                Button("Again") {
                                    reviewCard(.again)
                                }
                                .buttonStyle(.bordered)
                                .tint(.red)
                                .font(.caption)
                                
                                Button("Hard") {
                                    reviewCard(.hard)
                                }
                                .buttonStyle(.bordered)
                                .tint(.orange)
                                .font(.caption)
                            }
                            
                            HStack(spacing: 6) {
                                Button("Good") {
                                    reviewCard(.good)
                                }
                                .buttonStyle(.bordered)
                                .tint(.green)
                                .font(.caption)
                                
                                Button("Easy") {
                                    reviewCard(.easy)
                                }
                                .buttonStyle(.bordered)
                                .tint(.blue)
                                .font(.caption)
                            }
                        }
                    }
                }
                .padding()
                
            } else {
                // Session completed
                VStack(spacing: 16) {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 40))
                        .foregroundColor(.green)
                    
                    Text("Well Done!")
                        .font(.title3)
                        .fontWeight(.bold)
                    
                    if let session = flashcardManager.currentSession {
                        VStack(spacing: 8) {
                            Text("Session Stats")
                                .font(.headline)
                                .foregroundColor(.orange)
                            
                            HStack {
                                VStack {
                                    Text("\(session.totalReviewed)")
                                        .font(.title2)
                                        .fontWeight(.bold)
                                    Text("Cards")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                VStack {
                                    Text("\(session.correct)")
                                        .font(.title2)
                                        .fontWeight(.bold)
                                        .foregroundColor(.green)
                                    Text("Correct")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                VStack {
                                    Text("\(Int(session.timeSpent))s")
                                        .font(.title2)
                                        .fontWeight(.bold)
                                    Text("Time")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                            .padding()
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(12)
                        }
                    }
                }
                .padding()
            }
            
            Spacer()
        }
        .navigationTitle("Study")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            if !sessionStarted {
                flashcardManager.startSession()
                sessionStarted = true
                startTime = Date()
            }
        }
        .onDisappear {
            flashcardManager.endSession()
        }
    }
    
    private func reviewCard(_ result: ReviewResult) {
        let responseTime = Date().timeIntervalSince(startTime)
        flashcardManager.reviewCard(result: result, responseTime: responseTime)
        
        // Reset for next card
        showingAnswer = false
        startTime = Date()
    }
}

struct FlashcardView_Previews: PreviewProvider {
    static var previews: some View {
        FlashcardView()
    }
}