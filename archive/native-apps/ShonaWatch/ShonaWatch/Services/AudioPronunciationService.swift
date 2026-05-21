import AVFoundation
import Foundation

class AudioPronunciationService: NSObject, ObservableObject {
    static let shared = AudioPronunciationService()
    
    private let synthesizer = AVSpeechSynthesizer()
    @Published var isSpeaking = false
    @Published var currentPhoneme: String = ""
    
    // Shona-specific phoneme mappings
    private let shonaPhonemes: [String: String] = [
        "mh": "m̥", // voiceless m
        "nh": "n̥", // voiceless n
        "ng": "ŋ", // velar nasal
        "ngw": "ŋʷ", // labialized velar nasal
        "nzv": "nz̤", // breathy voiced
        "sv": "s̤", // breathy s
        "zv": "z̤", // breathy z
        "bh": "ɓ", // bilabial implosive
        "dh": "ɗ", // alveolar implosive
        "hw": "ʍ", // voiceless labio-velar
        "ty": "tʲ", // palatalized t
        "dy": "dʲ"  // palatalized d
    ]
    
    // Tone patterns for Shona
    private let tonePatterns: [String: [(pitch: Float, duration: Float)]] = [
        "H": [(pitch: 1.2, duration: 1.0)],
        "L": [(pitch: 0.8, duration: 1.0)],
        "HL": [(pitch: 1.2, duration: 0.5), (pitch: 0.8, duration: 0.5)],
        "LH": [(pitch: 0.8, duration: 0.5), (pitch: 1.2, duration: 0.5)],
        "HLH": [(pitch: 1.2, duration: 0.33), (pitch: 0.8, duration: 0.33), (pitch: 1.2, duration: 0.34)]
    ]
    
    override init() {
        super.init()
        synthesizer.delegate = self
        configureAudioSession()
    }
    
    private func configureAudioSession() {
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio)
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            print("Failed to configure audio session: \(error)")
        }
    }
    
    // MARK: - Main pronunciation method
    func pronounce(_ text: String, tonePattern: String? = nil, speed: Float = 0.4) {
        let processedText = processShonaPronunciation(text)
        let utterance = AVSpeechUtterance(string: processedText)
        
        // Use South African English voice as closest to Shona phonetics
        if let voice = AVSpeechSynthesisVoice(language: "en-ZA") {
            utterance.voice = voice
        } else if let voice = AVSpeechSynthesisVoice(language: "en-GB") {
            utterance.voice = voice
        }
        
        utterance.rate = speed // Slower for language learning
        utterance.pitchMultiplier = 1.0
        utterance.volume = 0.9
        
        // Apply tone pattern if provided
        if let pattern = tonePattern, let tones = tonePatterns[pattern] {
            applyTonePattern(to: utterance, pattern: tones)
        }
        
        synthesizer.speak(utterance)
        isSpeaking = true
    }
    
    // MARK: - Syllable-by-syllable pronunciation
    func pronounceSyllables(_ word: String, syllables: [String], tones: [String]) {
        guard syllables.count == tones.count else { return }
        
        for (index, syllable) in syllables.enumerated() {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(index) * 0.8) { [weak self] in
                self?.currentPhoneme = syllable
                self?.pronounceSyllableWithTone(syllable, tone: tones[index])
            }
        }
    }
    
    private func pronounceSyllableWithTone(_ syllable: String, tone: String) {
        let utterance = AVSpeechUtterance(string: syllable)
        
        if let voice = AVSpeechSynthesisVoice(language: "en-ZA") {
            utterance.voice = voice
        }
        
        utterance.rate = 0.3 // Very slow for individual syllables
        
        // Apply tone
        switch tone {
        case "H":
            utterance.pitchMultiplier = 1.3
        case "L":
            utterance.pitchMultiplier = 0.7
        default:
            utterance.pitchMultiplier = 1.0
        }
        
        synthesizer.speak(utterance)
    }
    
    // MARK: - Shona-specific processing
    private func processShonaPronunciation(_ text: String) -> String {
        var processed = text.lowercased()
        
        // Replace Shona-specific phonemes with approximations
        for (shona, phonetic) in shonaPhonemes {
            processed = processed.replacingOccurrences(of: shona, with: phonetic)
        }
        
        // Handle common Shona patterns
        processed = applyShonaPronunciationRules(processed)
        
        return processed
    }
    
    private func applyShonaPronunciationRules(_ text: String) -> String {
        var result = text
        
        // Rule 1: 'r' is always rolled/tapped
        result = result.replacingOccurrences(of: "r", with: "ɾ")
        
        // Rule 2: Final 'e' is pronounced as 'eh'
        if result.hasSuffix("e") {
            result = String(result.dropLast()) + "eh"
        }
        
        // Rule 3: 'i' at word end is often elongated
        if result.hasSuffix("i") {
            result = result + "i"
        }
        
        // Rule 4: Double vowels indicate length
        result = result.replacingOccurrences(of: "aa", with: "aː")
        result = result.replacingOccurrences(of: "ee", with: "eː")
        result = result.replacingOccurrences(of: "ii", with: "iː")
        result = result.replacingOccurrences(of: "oo", with: "oː")
        result = result.replacingOccurrences(of: "uu", with: "uː")
        
        return result
    }
    
    // MARK: - Tone pattern application
    private func applyTonePattern(to utterance: AVSpeechUtterance, pattern: [(pitch: Float, duration: Float)]) {
        // This is a simplified approach - in reality, tone patterns in Shona are complex
        let averagePitch = pattern.reduce(0) { $0 + $1.pitch } / Float(pattern.count)
        utterance.pitchMultiplier = averagePitch
    }
    
    // MARK: - Control methods
    func stop() {
        synthesizer.stopSpeaking(at: .immediate)
        isSpeaking = false
        currentPhoneme = ""
    }
    
    func pause() {
        synthesizer.pauseSpeaking(at: .immediate)
    }
    
    func resume() {
        synthesizer.continueSpeaking()
    }
    
    // MARK: - Teaching methods
    func teachPronunciation(for word: String, breakdown: PronunciationBreakdown) {
        // First, say the whole word slowly
        pronounce(word, tonePattern: breakdown.tonePattern, speed: 0.3)
        
        // Then break it down by syllables
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.pronounceSyllables(word, syllables: breakdown.syllables, tones: breakdown.syllableTones)
        }
        
        // Finally, say it at normal speed
        DispatchQueue.main.asyncAfter(deadline: .now() + Double(breakdown.syllables.count) * 0.8 + 3.0) { [weak self] in
            self?.pronounce(word, tonePattern: breakdown.tonePattern, speed: 0.5)
        }
    }
    
    // MARK: - Minimal pairs practice
    func practiceMinimalPairs(_ pair1: String, _ pair2: String, explanation: String) {
        // Announce the practice
        let intro = "Listen carefully to the difference"
        pronounce(intro, speed: 0.5)
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) { [weak self] in
            self?.pronounce(pair1, speed: 0.35)
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 3.5) { [weak self] in
            self?.pronounce(pair2, speed: 0.35)
        }
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 5.0) { [weak self] in
            self?.pronounce(explanation, speed: 0.5)
        }
    }
}

// MARK: - AVSpeechSynthesizerDelegate
extension AudioPronunciationService: AVSpeechSynthesizerDelegate {
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        DispatchQueue.main.async { [weak self] in
            self?.isSpeaking = true
        }
    }
    
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        DispatchQueue.main.async { [weak self] in
            self?.isSpeaking = false
        }
    }
}

// MARK: - Supporting structures
struct PronunciationBreakdown {
    let syllables: [String]
    let syllableTones: [String]
    let tonePattern: String
    let phonetic: String
    let audioGuide: String
}

// MARK: - Pronunciation difficulty analyzer
extension AudioPronunciationService {
    func analyzePronunciationDifficulty(_ word: String) -> PronunciationDifficulty {
        var score = 0.0
        
        // Check for difficult phonemes
        for (phoneme, _) in shonaPhonemes {
            if word.contains(phoneme) {
                score += 1.5
            }
        }
        
        // Check for tone complexity
        let syllableCount = estimateSyllableCount(word)
        if syllableCount > 3 {
            score += Double(syllableCount - 3) * 0.5
        }
        
        // Check for consonant clusters
        let consonantClusters = findConsonantClusters(word)
        score += Double(consonantClusters.count) * 1.0
        
        return PronunciationDifficulty(
            score: min(score, 10.0),
            challenges: identifyChallenges(word),
            practiceRecommendations: generatePracticeRecommendations(word)
        )
    }
    
    private func estimateSyllableCount(_ word: String) -> Int {
        let vowels = CharacterSet(charactersIn: "aeiou")
        var count = 0
        var previousWasVowel = false
        
        for char in word.lowercased() {
            let isVowel = vowels.contains(char.unicodeScalars.first!)
            if isVowel && !previousWasVowel {
                count += 1
            }
            previousWasVowel = isVowel
        }
        
        return max(count, 1)
    }
    
    private func findConsonantClusters(_ word: String) -> [String] {
        let pattern = "[bcdfghjklmnpqrstvwxyz]{2,}"
        guard let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) else {
            return []
        }
        
        let matches = regex.matches(in: word, range: NSRange(word.startIndex..., in: word))
        return matches.compactMap { match in
            guard let range = Range(match.range, in: word) else { return nil }
            return String(word[range])
        }
    }
    
    private func identifyChallenges(_ word: String) -> [String] {
        var challenges: [String] = []
        
        if word.contains("mh") || word.contains("nh") {
            challenges.append("Voiceless nasals (mh, nh)")
        }
        if word.contains("ng") || word.contains("ngw") {
            challenges.append("Velar nasals (ng, ngw)")
        }
        if word.contains("bh") || word.contains("dh") {
            challenges.append("Implosive consonants")
        }
        if estimateSyllableCount(word) > 3 {
            challenges.append("Multiple syllables with tone changes")
        }
        
        return challenges
    }
    
    private func generatePracticeRecommendations(_ word: String) -> [String] {
        var recommendations: [String] = []
        
        if word.contains("mh") || word.contains("nh") {
            recommendations.append("Practice voiceless nasals by humming then stopping airflow")
        }
        if word.contains("r") {
            recommendations.append("Practice rolled/tapped 'r' - tongue briefly touches roof of mouth")
        }
        if estimateSyllableCount(word) > 2 {
            recommendations.append("Break word into syllables and practice each separately first")
        }
        
        return recommendations
    }
}

struct PronunciationDifficulty {
    let score: Double // 0-10
    let challenges: [String]
    let practiceRecommendations: [String]
}