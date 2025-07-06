import SwiftUI
import AVFoundation

struct PronunciationPracticeView: View {
    let card: Flashcard
    @Environment(\.dismiss) var dismiss
    @ObservedObject var audio = AudioPronunciationService.shared
    
    @State private var currentStep = 0
    @State private var isRecording = false
    @State private var recordingLevel: CGFloat = 0
    @State private var showingFeedback = false
    @State private var pronunciationScore: Double = 0
    @State private var practiceMode: PracticeMode = .listen
    @State private var syllableIndex = 0
    @State private var animateMouth = false
    
    private let practiceSteps = [
        "Listen to the pronunciation",
        "Practice each syllable",
        "Say the whole word",
        "Record and compare"
    ]
    
    enum PracticeMode {
        case listen, syllables, fullWord, record
    }
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Word display
                    wordHeader
                    
                    // Progress indicator
                    progressIndicator
                    
                    // Main practice area
                    practiceArea
                    
                    // Controls
                    controlButtons
                    
                    // Tips section
                    if currentStep < 3 {
                        pronunciationTips
                    }
                }
                .padding()
            }
            .navigationTitle("Pronunciation Practice")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            startPractice()
        }
    }
    
    // MARK: - Word Header
    private var wordHeader: some View {
        VStack(spacing: 16) {
            Text(card.shonaText)
                .font(.system(size: 36, weight: .bold, design: .rounded))
                .foregroundColor(.primary)
            
            if let pronunciation = card.pronunciation {
                Text(pronunciation)
                    .font(.title3)
                    .foregroundColor(.orange)
            }
            
            if let phonetic = card.phonetic {
                Text(phonetic)
                    .font(.system(size: 16, weight: .regular, design: .monospaced))
                    .foregroundColor(.secondary)
            }
            
            // Tone pattern visualization
            if let tonePattern = card.tonePattern {
                TonePatternView(pattern: tonePattern)
                    .frame(height: 40)
                    .scaleEffect(animateMouth ? 1.1 : 1.0)
                    .animation(.easeInOut(duration: 0.5).repeatCount(3, autoreverses: true), value: animateMouth)
            }
        }
        .padding()
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(LinearGradient(
                    colors: [Color.orange.opacity(0.1), Color.orange.opacity(0.05)],
                    startPoint: .top,
                    endPoint: .bottom
                ))
        )
    }
    
    // MARK: - Progress Indicator
    private var progressIndicator: some View {
        VStack(spacing: 8) {
            HStack(spacing: 16) {
                ForEach(0..<practiceSteps.count, id: \.self) { index in
                    stepIndicator(index: index)
                }
            }
            
            Text(practiceSteps[currentStep])
                .font(.headline)
                .foregroundColor(.primary)
        }
    }
    
    private func stepIndicator(index: Int) -> some View {
        Circle()
            .fill(index <= currentStep ? Color.orange : Color.gray.opacity(0.3))
            .frame(width: 12, height: 12)
            .overlay(
                Circle()
                    .stroke(Color.orange, lineWidth: 2)
                    .scaleEffect(index == currentStep ? 1.5 : 1.0)
                    .opacity(index == currentStep ? 0.5 : 0)
                    .animation(.easeInOut(duration: 1).repeatForever(autoreverses: true), value: currentStep)
            )
    }
    
    // MARK: - Practice Area
    private var practiceArea: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.gray.opacity(0.05))
                .frame(height: 200)
            
            switch practiceMode {
            case .listen:
                listenModeView
            case .syllables:
                syllablesModeView
            case .fullWord:
                fullWordModeView
            case .record:
                recordModeView
            }
        }
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(isRecording ? Color.red : Color.clear, lineWidth: 3)
                .animation(.easeInOut(duration: 0.5).repeatForever(autoreverses: true), value: isRecording)
        )
    }
    
    private var listenModeView: some View {
        VStack(spacing: 20) {
            Image(systemName: "ear")
                .font(.system(size: 50))
                .foregroundColor(.orange)
                .symbolEffect(.pulse, value: audio.isSpeaking)
            
            Text("Listen carefully to the pronunciation")
                .font(.callout)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            if audio.isSpeaking {
                AudioWaveformView(amplitude: 0.7)
                    .frame(height: 30)
                    .padding(.horizontal)
            }
        }
    }
    
    private var syllablesModeView: some View {
        VStack(spacing: 20) {
            if let breakdown = getPronunciationBreakdown() {
                HStack(spacing: 16) {
                    ForEach(Array(breakdown.syllables.enumerated()), id: \.offset) { index, syllable in
                        SyllableCard(
                            syllable: syllable,
                            tone: breakdown.syllableTones[index],
                            isActive: index == syllableIndex,
                            isCompleted: index < syllableIndex
                        )
                    }
                }
                
                Text("Practice: \(breakdown.syllables[syllableIndex])")
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(.orange)
                
                // Mouth position guide
                MouthPositionGuide(syllable: breakdown.syllables[syllableIndex])
            }
        }
    }
    
    private var fullWordModeView: some View {
        VStack(spacing: 20) {
            Image(systemName: "mouth")
                .font(.system(size: 50))
                .foregroundColor(.green)
                .scaleEffect(animateMouth ? 1.2 : 1.0)
            
            Text("Say the complete word")
                .font(.callout)
                .foregroundColor(.secondary)
            
            // Speed control
            HStack {
                Text("Speed:")
                    .font(.caption)
                    .foregroundColor(.secondary)
                
                ForEach(["Slow", "Normal", "Fast"], id: \.self) { speed in
                    Button(speed) {
                        playAtSpeed(speed)
                    }
                    .font(.caption)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color.orange.opacity(0.1))
                    .foregroundColor(.orange)
                    .cornerRadius(8)
                }
            }
        }
    }
    
    private var recordModeView: some View {
        VStack(spacing: 20) {
            ZStack {
                Circle()
                    .fill(Color.red.opacity(0.1))
                    .frame(width: 100, height: 100)
                
                Circle()
                    .fill(Color.red)
                    .frame(width: 80, height: 80)
                    .scaleEffect(isRecording ? 0.8 : 1.0)
                
                Image(systemName: isRecording ? "stop.fill" : "mic.fill")
                    .font(.system(size: 30))
                    .foregroundColor(.white)
            }
            .onTapGesture {
                toggleRecording()
            }
            
            if isRecording {
                VStack(spacing: 8) {
                    Text("Recording...")
                        .font(.headline)
                        .foregroundColor(.red)
                    
                    AudioLevelMeter(level: recordingLevel)
                        .frame(height: 20)
                        .padding(.horizontal)
                }
            } else if showingFeedback {
                feedbackView
            } else {
                Text("Tap to record your pronunciation")
                    .font(.callout)
                    .foregroundColor(.secondary)
            }
        }
    }
    
    // MARK: - Control Buttons
    private var controlButtons: some View {
        HStack(spacing: 16) {
            if currentStep > 0 {
                Button(action: previousStep) {
                    Label("Previous", systemImage: "arrow.left")
                        .font(.callout)
                }
                .buttonStyle(.bordered)
            }
            
            Button(action: playCurrentStep) {
                Label(getPlayButtonTitle(), systemImage: "play.fill")
                    .font(.callout)
            }
            .buttonStyle(.borderedProminent)
            .tint(.orange)
            
            if currentStep < practiceSteps.count - 1 {
                Button(action: nextStep) {
                    Label("Next", systemImage: "arrow.right")
                        .font(.callout)
                }
                .buttonStyle(.bordered)
            }
        }
    }
    
    // MARK: - Tips Section
    private var pronunciationTips: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Pronunciation Tips", systemImage: "lightbulb")
                .font(.headline)
                .foregroundColor(.orange)
            
            if let difficulty = audio.analyzePronunciationDifficulty(card.shonaText) {
                ForEach(difficulty.practiceRecommendations, id: \.self) { tip in
                    HStack(alignment: .top, spacing: 8) {
                        Circle()
                            .fill(Color.orange)
                            .frame(width: 6, height: 6)
                            .offset(y: 6)
                        
                        Text(tip)
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                if !difficulty.challenges.isEmpty {
                    Text("Challenges: \(difficulty.challenges.joined(separator: ", "))")
                        .font(.caption2)
                        .foregroundColor(.orange)
                        .padding(.top, 4)
                }
            }
        }
        .padding()
        .background(Color.orange.opacity(0.05))
        .cornerRadius(12)
    }
    
    // MARK: - Feedback View
    private var feedbackView: some View {
        VStack(spacing: 12) {
            ScoreGauge(score: pronunciationScore)
                .frame(width: 80, height: 80)
            
            Text(getFeedbackText())
                .font(.headline)
                .foregroundColor(getFeedbackColor())
            
            if pronunciationScore < 0.7 {
                Text("Keep practicing! Focus on: \(getImprovementAreas())")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
    }
    
    // MARK: - Helper Methods
    private func startPractice() {
        playCurrentStep()
    }
    
    private func playCurrentStep() {
        switch currentStep {
        case 0:
            practiceMode = .listen
            audio.pronounce(card.shonaText, tonePattern: card.tonePattern, speed: 0.4)
            
        case 1:
            practiceMode = .syllables
            if let breakdown = getPronunciationBreakdown() {
                audio.pronounceSyllables(
                    card.shonaText,
                    syllables: breakdown.syllables,
                    tones: breakdown.syllableTones
                )
            }
            
        case 2:
            practiceMode = .fullWord
            animateMouth = true
            audio.pronounce(card.shonaText, tonePattern: card.tonePattern, speed: 0.5)
            DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                animateMouth = false
            }
            
        case 3:
            practiceMode = .record
            
        default:
            break
        }
    }
    
    private func nextStep() {
        if currentStep < practiceSteps.count - 1 {
            currentStep += 1
            playCurrentStep()
        }
    }
    
    private func previousStep() {
        if currentStep > 0 {
            currentStep -= 1
            syllableIndex = 0
            playCurrentStep()
        }
    }
    
    private func toggleRecording() {
        if isRecording {
            stopRecording()
        } else {
            startRecording()
        }
    }
    
    private func startRecording() {
        isRecording = true
        showingFeedback = false
        // Start recording logic
        simulateRecording()
    }
    
    private func stopRecording() {
        isRecording = false
        // Stop recording and analyze
        analyzePronunciation()
    }
    
    private func simulateRecording() {
        // Simulate recording level changes
        Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { timer in
            if isRecording {
                recordingLevel = CGFloat.random(in: 0.3...0.8)
            } else {
                timer.invalidate()
                recordingLevel = 0
            }
        }
    }
    
    private func analyzePronunciation() {
        // Simulate pronunciation analysis
        pronunciationScore = Double.random(in: 0.5...0.95)
        showingFeedback = true
    }
    
    private func playAtSpeed(_ speed: String) {
        let rate: Float = speed == "Slow" ? 0.3 : (speed == "Fast" ? 0.7 : 0.5)
        audio.pronounce(card.shonaText, tonePattern: card.tonePattern, speed: rate)
    }
    
    private func getPronunciationBreakdown() -> PronunciationBreakdown? {
        // This would be properly implemented with syllable analysis
        let syllables = card.shonaText.count > 4 ? 
            [String(card.shonaText.prefix(2)), String(card.shonaText.suffix(card.shonaText.count - 2))] :
            [card.shonaText]
        
        return PronunciationBreakdown(
            syllables: syllables,
            syllableTones: Array(repeating: "H", count: syllables.count),
            tonePattern: card.tonePattern ?? "H",
            phonetic: card.phonetic ?? "",
            audioGuide: card.audioGuide ?? ""
        )
    }
    
    private func getPlayButtonTitle() -> String {
        switch currentStep {
        case 0: return "Listen"
        case 1: return "Play Syllables"
        case 2: return "Play Word"
        case 3: return "Example"
        default: return "Play"
        }
    }
    
    private func getFeedbackText() -> String {
        if pronunciationScore > 0.9 {
            return "Excellent! 🌟"
        } else if pronunciationScore > 0.7 {
            return "Good job! 👍"
        } else if pronunciationScore > 0.5 {
            return "Getting there! 💪"
        } else {
            return "Keep practicing! 🎯"
        }
    }
    
    private func getFeedbackColor() -> Color {
        if pronunciationScore > 0.9 {
            return .green
        } else if pronunciationScore > 0.7 {
            return .blue
        } else if pronunciationScore > 0.5 {
            return .orange
        } else {
            return .red
        }
    }
    
    private func getImprovementAreas() -> String {
        // This would analyze actual pronunciation
        return "tone patterns, final syllable"
    }
}

// MARK: - Supporting Views
struct SyllableCard: View {
    let syllable: String
    let tone: String
    let isActive: Bool
    let isCompleted: Bool
    
    var body: some View {
        VStack(spacing: 4) {
            Text(syllable)
                .font(.title3)
                .fontWeight(.bold)
                .foregroundColor(isActive ? .white : (isCompleted ? .green : .primary))
            
            Text(tone)
                .font(.caption)
                .foregroundColor(isActive ? .white.opacity(0.8) : .secondary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(isActive ? Color.orange : (isCompleted ? Color.green.opacity(0.2) : Color.gray.opacity(0.1)))
        )
        .scaleEffect(isActive ? 1.1 : 1.0)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isActive)
    }
}

struct MouthPositionGuide: View {
    let syllable: String
    
    var body: some View {
        HStack(spacing: 20) {
            Image(systemName: "mouth")
                .font(.system(size: 30))
                .foregroundColor(.orange)
            
            VStack(alignment: .leading, spacing: 4) {
                Text("Mouth Position")
                    .font(.caption)
                    .fontWeight(.semibold)
                Text(getMouthPosition())
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(Color.orange.opacity(0.05))
        .cornerRadius(12)
    }
    
    private func getMouthPosition() -> String {
        // Simplified mouth position guide
        if syllable.contains("o") {
            return "Round lips, open mouth"
        } else if syllable.contains("i") {
            return "Spread lips, narrow opening"
        } else {
            return "Relaxed mouth position"
        }
    }
}

struct AudioWaveformView: View {
    let amplitude: CGFloat
    @State private var phase: CGFloat = 0
    
    var body: some View {
        GeometryReader { geometry in
            Path { path in
                let width = geometry.size.width
                let height = geometry.size.height
                let midHeight = height / 2
                
                path.move(to: CGPoint(x: 0, y: midHeight))
                
                for x in stride(from: 0, to: width, by: 2) {
                    let relativeX = x / width
                    let sine = sin(relativeX * .pi * 4 + phase) * amplitude
                    let y = midHeight + sine * (height / 2 - 2)
                    path.addLine(to: CGPoint(x: x, y: y))
                }
            }
            .stroke(Color.orange, lineWidth: 2)
        }
        .onAppear {
            withAnimation(.linear(duration: 2).repeatForever(autoreverses: false)) {
                phase = .pi * 2
            }
        }
    }
}

struct AudioLevelMeter: View {
    let level: CGFloat
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                RoundedRectangle(cornerRadius: 10)
                    .fill(Color.gray.opacity(0.2))
                
                RoundedRectangle(cornerRadius: 10)
                    .fill(
                        LinearGradient(
                            colors: [.green, .yellow, .orange, .red],
                            startPoint: .leading,
                            endPoint: .trailing
                        )
                    )
                    .frame(width: geometry.size.width * level)
                    .animation(.easeOut(duration: 0.1), value: level)
            }
        }
    }
}

struct ScoreGauge: View {
    let score: Double
    
    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.gray.opacity(0.3), lineWidth: 8)
            
            Circle()
                .trim(from: 0, to: score)
                .stroke(
                    score > 0.8 ? Color.green : (score > 0.6 ? Color.orange : Color.red),
                    style: StrokeStyle(lineWidth: 8, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.spring(response: 0.5, dampingFraction: 0.7), value: score)
            
            Text("\(Int(score * 100))%")
                .font(.title3)
                .fontWeight(.bold)
        }
    }
}

struct PronunciationPracticeView_Previews: PreviewProvider {
    static var previews: some View {
        PronunciationPracticeView(card: Flashcard(
            id: "test",
            shonaText: "mhoro",
            englishText: "hello",
            pronunciation: "mho-ro",
            phonetic: "/mʰoro/",
            tonePattern: "HL",
            category: "Greetings",
            difficulty: 1.0
        ))
    }
}