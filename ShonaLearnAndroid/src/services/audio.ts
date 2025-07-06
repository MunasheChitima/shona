import Sound from 'react-native-sound';
import Tts from 'react-native-tts';
import Voice from '@react-native-community/voice';
import { PronunciationResult } from '../types';

class AudioService {
  private currentSound: Sound | null = null;
  private isVoiceRecognitionSupported = false;

  async init(): Promise<void> {
    try {
      // Enable sound playback in silence mode
      Sound.setCategory('Playback');
      
      // Initialize text-to-speech
      await this.initializeTTS();
      
      // Initialize voice recognition
      await this.initializeVoiceRecognition();
      
      console.log('Audio service initialized successfully');
    } catch (error) {
      console.error('Audio service initialization error:', error);
      throw error;
    }
  }

  private async initializeTTS(): Promise<void> {
    try {
      // Set default TTS settings
      await Tts.setDefaultRate(0.7); // Slower rate for language learning
      await Tts.setDefaultPitch(1.0);
      await Tts.setDefaultLanguage('en-US');
      
      // Try to set Shona language if available
      const voices = await Tts.voices();
      const shonaVoice = voices.find(voice => 
        voice.language.includes('sn') || 
        voice.language.includes('shona') ||
        voice.name.toLowerCase().includes('shona')
      );
      
      if (shonaVoice) {
        await Tts.setDefaultLanguage(shonaVoice.language);
        console.log('Shona TTS voice found and set');
      } else {
        console.warn('Shona TTS voice not found, using default language');
      }
    } catch (error) {
      console.error('TTS initialization error:', error);
    }
  }

  private async initializeVoiceRecognition(): Promise<void> {
    try {
      // Check if voice recognition is available
      const available = await Voice.isAvailable();
      this.isVoiceRecognitionSupported = available === 1;
      
      if (!available) {
        console.warn('Voice recognition not available on this device');
        return;
      }

      // Set up voice recognition event listeners
      Voice.onSpeechStart = this.onSpeechStart;
      Voice.onSpeechRecognized = this.onSpeechRecognized;
      Voice.onSpeechEnd = this.onSpeechEnd;
      Voice.onSpeechError = this.onSpeechError;
      Voice.onSpeechResults = this.onSpeechResults;
      Voice.onSpeechPartialResults = this.onSpeechPartialResults;
      Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged;

      console.log('Voice recognition initialized successfully');
    } catch (error) {
      console.error('Voice recognition initialization error:', error);
      this.isVoiceRecognitionSupported = false;
    }
  }

  // Text-to-Speech methods
  async speak(text: string, language: string = 'en-US'): Promise<void> {
    try {
      // Stop any current speech
      await this.stopSpeech();
      
      // Set language if different from current
      await Tts.setDefaultLanguage(language);
      
      // Speak the text
      await Tts.speak(text);
    } catch (error) {
      console.error('Speech error:', error);
      throw error;
    }
  }

  async speakShona(text: string): Promise<void> {
    try {
      // Try to use Shona-specific pronunciation
      // Since Shona TTS might not be available, we'll use English with slower rate
      await Tts.setDefaultRate(0.5);
      await this.speak(text, 'en-US');
    } catch (error) {
      console.error('Shona speech error:', error);
      throw error;
    }
  }

  async stopSpeech(): Promise<void> {
    try {
      await Tts.stop();
    } catch (error) {
      console.error('Stop speech error:', error);
    }
  }

  // Audio playback methods
  async playAudio(audioFile: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Stop any currently playing audio
        this.stopAudio();
        
        // Create and play new sound
        this.currentSound = new Sound(audioFile, Sound.MAIN_BUNDLE, (error) => {
          if (error) {
            console.error('Failed to load audio file:', error);
            reject(error);
            return;
          }
          
          this.currentSound?.play((success) => {
            if (success) {
              console.log('Audio playback successful');
              resolve();
            } else {
              console.error('Audio playback failed');
              reject(new Error('Audio playback failed'));
            }
          });
        });
      } catch (error) {
        console.error('Audio playback error:', error);
        reject(error);
      }
    });
  }

  stopAudio(): void {
    if (this.currentSound) {
      this.currentSound.stop();
      this.currentSound.release();
      this.currentSound = null;
    }
  }

  // Voice recognition methods
  async startVoiceRecognition(options: {
    language?: string;
    timeout?: number;
    onStart?: () => void;
    onResult?: (results: string[]) => void;
    onError?: (error: any) => void;
  } = {}): Promise<void> {
    if (!this.isVoiceRecognitionSupported) {
      throw new Error('Voice recognition not supported on this device');
    }

    try {
      // Set up temporary event handlers
      if (options.onStart) {
        Voice.onSpeechStart = options.onStart;
      }
      if (options.onResult) {
        Voice.onSpeechResults = (e) => options.onResult?.(e.value || []);
      }
      if (options.onError) {
        Voice.onSpeechError = options.onError;
      }

      // Start listening
      await Voice.start(options.language || 'en-US');
    } catch (error) {
      console.error('Voice recognition start error:', error);
      throw error;
    }
  }

  async stopVoiceRecognition(): Promise<void> {
    try {
      await Voice.stop();
    } catch (error) {
      console.error('Voice recognition stop error:', error);
    }
  }

  async cancelVoiceRecognition(): Promise<void> {
    try {
      await Voice.cancel();
    } catch (error) {
      console.error('Voice recognition cancel error:', error);
    }
  }

  // Pronunciation assessment methods
  async assessPronunciation(
    targetWord: string,
    spokenText: string
  ): Promise<PronunciationResult> {
    try {
      // Simple pronunciation assessment algorithm
      // In a real app, you'd use more sophisticated phonetic comparison
      const similarity = this.calculateSimilarity(
        targetWord.toLowerCase(),
        spokenText.toLowerCase()
      );
      
      const score = Math.round(similarity * 100);
      const accuracy = similarity;
      
      let feedback = '';
      if (accuracy >= 0.9) {
        feedback = 'Excellent pronunciation! 🎉';
      } else if (accuracy >= 0.7) {
        feedback = 'Good pronunciation! Keep practicing. 👍';
      } else if (accuracy >= 0.5) {
        feedback = 'Getting better! Try again. 💪';
      } else {
        feedback = 'Keep practicing! Listen carefully and try again. 🔄';
      }

      return {
        word: targetWord,
        score,
        accuracy,
        feedback,
        confidence: accuracy
      };
    } catch (error) {
      console.error('Pronunciation assessment error:', error);
      throw error;
    }
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple Levenshtein distance-based similarity
    const maxLength = Math.max(str1.length, str2.length);
    if (maxLength === 0) return 1;
    
    const distance = this.levenshteinDistance(str1, str2);
    return 1 - (distance / maxLength);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // Voice recognition event handlers
  private onSpeechStart = () => {
    console.log('Voice recognition started');
  };

  private onSpeechRecognized = () => {
    console.log('Voice recognition recognized');
  };

  private onSpeechEnd = () => {
    console.log('Voice recognition ended');
  };

  private onSpeechError = (error: any) => {
    console.error('Voice recognition error:', error);
  };

  private onSpeechResults = (event: any) => {
    console.log('Voice recognition results:', event.value);
  };

  private onSpeechPartialResults = (event: any) => {
    console.log('Voice recognition partial results:', event.value);
  };

  private onSpeechVolumeChanged = (event: any) => {
    console.log('Voice volume changed:', event.value);
  };

  // Cleanup method
  async cleanup(): Promise<void> {
    try {
      await this.stopSpeech();
      this.stopAudio();
      await this.stopVoiceRecognition();
      
      // Remove voice recognition listeners
      Voice.destroy();
      
      console.log('Audio service cleaned up successfully');
    } catch (error) {
      console.error('Audio service cleanup error:', error);
    }
  }
}

export default new AudioService();