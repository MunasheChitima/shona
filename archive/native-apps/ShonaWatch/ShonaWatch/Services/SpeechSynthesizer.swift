import Foundation
import AVFoundation

class SpeechSynthesizer: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    private let synthesizer = AVSpeechSynthesizer()
    @Published var isSpeaking = false
    private var completionHandler: (() -> Void)?
    
    override init() {
        super.init()
        synthesizer.delegate = self
    }
    
    func speak(_ text: String, completion: (() -> Void)? = nil) {
        // Stop any current speech
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        
        // Store completion handler
        self.completionHandler = completion
        
        // Configure speech
        let utterance = AVSpeechUtterance(string: text)
        utterance.rate = 0.4 // Slower rate for learning
        utterance.volume = 1.0
        
        // Try to use a more appropriate voice for Shona
        // Fall back to default if not available
        if let voice = preferredVoice() {
            utterance.voice = voice
        }
        
        // Start speaking
        isSpeaking = true
        synthesizer.speak(utterance)
    }
    
    func stopSpeaking() {
        synthesizer.stopSpeaking(at: .immediate)
        isSpeaking = false
        completionHandler?()
        completionHandler = nil
    }
    
    private func preferredVoice() -> AVSpeechSynthesisVoice? {
        // Try to find a voice that might work well for Shona
        // Priority order: African English voices, then default
        let preferredLanguages = ["en-ZA", "en-US", "en-GB"]
        
        for language in preferredLanguages {
            if let voice = AVSpeechSynthesisVoice(language: language) {
                return voice
            }
        }
        
        return AVSpeechSynthesisVoice(language: "en-US")
    }
    
    // MARK: - AVSpeechSynthesizerDelegate
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        isSpeaking = true
    }
    
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        isSpeaking = false
        completionHandler?()
        completionHandler = nil
    }
    
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        isSpeaking = false
        completionHandler?()
        completionHandler = nil
    }
}

// MARK: - Extensions
extension SpeechSynthesizer {
    func speakSlowly(_ text: String, completion: (() -> Void)? = nil) {
        if synthesizer.isSpeaking {
            synthesizer.stopSpeaking(at: .immediate)
        }
        
        self.completionHandler = completion
        
        let utterance = AVSpeechUtterance(string: text)
        utterance.rate = 0.2 // Very slow for pronunciation practice
        utterance.volume = 1.0
        
        if let voice = preferredVoice() {
            utterance.voice = voice
        }
        
        isSpeaking = true
        synthesizer.speak(utterance)
    }
    
    func speakWithPauses(_ text: String, completion: (() -> Void)? = nil) {
        // Split text into syllables or words and speak with pauses
        let components = text.components(separatedBy: "-")
        speakComponents(components, index: 0, completion: completion)
    }
    
    private func speakComponents(_ components: [String], index: Int, completion: (() -> Void)? = nil) {
        guard index < components.count else {
            completion?()
            return
        }
        
        let component = components[index].trimmingCharacters(in: .whitespaces)
        speak(component) { [weak self] in
            // Add a pause between components
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                self?.speakComponents(components, index: index + 1, completion: completion)
            }
        }
    }
}