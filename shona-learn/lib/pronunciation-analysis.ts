// Muturikiri AI - Shona Pronunciation Analysis System v4.0
// Masterless Architecture Implementation

import { GoogleGenerativeAI } from '@google/generative-ai';

// Types for the pronunciation analysis system
export interface PhonemeObservation {
  phoneme_observed: string;
  phoneme_type_observed: string;
  acoustic_features: {
    formant_f1_hz: number | null;
    formant_f2_hz: number | null;
    is_voiced: boolean;
    plosive_burst_energy: 'none' | 'low' | 'medium' | 'high';
    aspiration_noise_level: 'none' | 'low' | 'medium' | 'high';
    spectral_centroid_khz: number | null;
    is_implosive_airstream_detected: boolean;
  };
  tone_observed: 'High' | 'Low' | 'Rising' | 'Falling' | 'Unclear';
  observation_confidence: number;
}

export interface AIAnalysisResponse {
  word_transcription: string;
  phoneme_observations: PhonemeObservation[];
}

export interface GroundTruthProfile {
  phoneme: string;
  expected_type: string;
  expected_features: {
    formants?: 'stable' | 'fluctuating';
    airstream?: boolean;
    burst_energy?: 'low' | 'medium' | 'high';
    aspiration?: 'none' | 'low' | 'medium' | 'high';
    spectral_centroid_khz?: number;
    tone_effect?: 'depressor' | 'neutral';
  };
  expected_tone?: 'High' | 'Low';
}

export interface DeviationLog {
  phoneme: string;
  feature: string;
  expected: any;
  observed: any;
  feedback_code: string;
}

export interface PhonemeAnalysis {
  phoneme: string;
  score: number;
  deviations: DeviationLog[];
  feedback_codes: string[];
}

export interface PronunciationAnalysisResult {
  target_word: string;
  overall_score: number;
  phoneme_analyses: PhonemeAnalysis[];
  feedback_messages: string[];
  error?: {
    code: string;
    message: string;
  };
}

// Shona Phonetic Rules Database
const SHONA_PHONETIC_RULES = {
  // Pure Vowels
  vowels: {
    'a': { type: 'Pure Vowel', features: { formants: 'stable' }, tone: 'Low' },
    'e': { type: 'Pure Vowel', features: { formants: 'stable' }, tone: 'Low' },
    'i': { type: 'Pure Vowel', features: { formants: 'stable' }, tone: 'Low' },
    'o': { type: 'Pure Vowel', features: { formants: 'stable' }, tone: 'Low' },
    'u': { type: 'Pure Vowel', features: { formants: 'stable' }, tone: 'Low' }
  },
  
  // Implosives
  implosives: {
    'b': { type: 'Implosive', features: { airstream: true, burst_energy: 'low' } },
    'd': { type: 'Implosive', features: { airstream: true, burst_energy: 'low' } }
  },
  
  // Breathy-Voiced
  breathy_voiced: {
    'bh': { type: 'Breathy-Voiced', features: { aspiration: 'high' }, tone_effect: 'depressor' },
    'dh': { type: 'Breathy-Voiced', features: { aspiration: 'high' }, tone_effect: 'depressor' }
  },
  
  // Whistled Sibilants
  whistled_sibilants: {
    'sv': { type: 'Whistled Sibilant', features: { spectral_centroid_khz: 7.5 } },
    'zv': { type: 'Whistled Sibilant', features: { spectral_centroid_khz: 7.5 } }
  },
  
  // Prenasalized Consonants
  prenasalized: {
    'mb': { type: 'Prenasalized Plosive', features: { burst_energy: 'medium' } },
    'nd': { type: 'Prenasalized Plosive', features: { burst_energy: 'medium' } },
    'ng': { type: 'Prenasalized Plosive', features: { burst_energy: 'medium' } }
  },
  
  // Affricates
  affricates: {
    'ts': { type: 'Affricate', features: { burst_energy: 'medium' } },
    'dz': { type: 'Affricate', features: { burst_energy: 'medium' } }
  },

  // Whistled Affricates / Complex Sibilants
  whistled_affricates: {
    'tsv': { 
      type: 'Whistled Affricate', 
      features: { burst_energy: 'high', spectral_centroid_khz: 8.5 } 
    }
  },

  // Core Plosives
  plosives: {
    'p': { type: 'Voiceless Plosive', features: { burst_energy: 'high', aspiration: 'low' } },
    't': { type: 'Voiceless Plosive', features: { burst_energy: 'high', aspiration: 'low' } },
    'k': { type: 'Voiceless Plosive', features: { burst_energy: 'high', aspiration: 'low' } },
    'g': { type: 'Voiced Plosive', features: { burst_energy: 'medium', aspiration: 'none' } }
  },

  // Fricatives
  fricatives: {
    's': { type: 'Voiceless Fricative', features: { spectral_centroid_khz: 6.5 } },
    'z': { type: 'Voiced Fricative', features: { spectral_centroid_khz: 6.2 } },
    'f': { type: 'Voiceless Fricative', features: { spectral_centroid_khz: 5.8 } },
    'v': { type: 'Voiced Fricative', features: { spectral_centroid_khz: 5.5 } },
    'h': { type: 'Glottal Fricative', features: { aspiration: 'medium' } },
    'sh': { type: 'Postalveolar Fricative', features: { spectral_centroid_khz: 6.8 } }
  },

  // Nasals
  nasals: {
    'm': { type: 'Nasal', features: { formants: 'stable' } },
    'n': { type: 'Nasal', features: { formants: 'stable' } },
    'ny': { type: 'Palatal Nasal', features: { formants: 'stable' } }
  },

  // Liquids and Approximants
  liquids: {
    'r': { type: 'Alveolar Tap', features: { formants: 'fluctuating' } },
    'l': { type: 'Lateral Approximant', features: { formants: 'stable' } }
  },

  semivowels: {
    'w': { type: 'Labio-Velar Approximant', features: { formants: 'fluctuating' } },
    'y': { type: 'Palatal Approximant', features: { formants: 'fluctuating' } }
  }
};

// Feedback Code Templates
const FEEDBACK_TEMPLATES = {
  VOWEL_NOT_PURE: "Try to keep your vowel sound steady and pure. Don't let it change as you say it.",
  INCORRECT_TONE: "Pay attention to the tone. This syllable should be {expected_tone} tone.",
  IMPLOSIVE_TOO_PLOSIVE: "This is an implosive sound. Try to suck air in slightly as you make the sound, rather than pushing air out.",
  BREATHY_VOICE_WEAK: "Make the breathy quality stronger. You should hear a clear 'h' sound mixed with the consonant.",
  DEPRESSOR_TONE_ERROR: "This sound affects the tone of the following vowel. The vowel should be lower in pitch.",
  WHISTLE_QUALITY_LOW: "This is a whistled sound. Try to make it more high-pitched and whistling-like.",
  WHISTLE_MISSING: "This should be a whistled sound, not a regular fricative. Make it more high-pitched.",
  VOWEL_HIATUS_ERROR: "These are two separate vowel sounds, not a diphthong. Say them distinctly.",
  UNEVEN_STRESS: "Try to keep even stress across all syllables. Don't emphasize one syllable too much.",
  PHONEME_MISSING: "This sound is missing from your pronunciation.",
  EXTRA_PHONEME: "This sound was not expected in the word."
};

// Error Messages
const ERROR_MESSAGES = {
  AUDIO_SILENT: "It looks like we couldn't hear you. Please make sure your microphone is working and try speaking a bit louder.",
  AUDIO_TOO_NOISY: "There seems to be a lot of background noise. Could you try recording again in a quieter place?",
  AI_RESPONSE_INVALID: "Sorry, our analysis tool is having a temporary issue. Please try again in a moment.",
  DURATION_MISMATCH: "It sounds like you might have said something different. Please try pronouncing just the word '{target_word}'."
};

export class MuturikiriAI {
  private genAI: GoogleGenerativeAI;
  
  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Core pronunciation analysis function as specified in the mandate
   */
  async analyzePronunciation(
    target_word: string, 
    user_audio_path: string
  ): Promise<PronunciationAnalysisResult> {
    try {
      // Step 3.1: Initialization & Pre-flight Checks
      const audioValidation = await this.validateAudio(user_audio_path);
      if (!audioValidation.valid) {
        return {
          target_word,
          overall_score: 0,
          phoneme_analyses: [],
          feedback_messages: [],
          error: {
            code: audioValidation.errorCode,
            message: ERROR_MESSAGES[audioValidation.errorCode as keyof typeof ERROR_MESSAGES]
          }
        };
      }

      // Step 3.2: Ground Truth Generation
      const groundTruthProfile = this.generateGroundTruth(target_word);

      // Step 3.3: AI-Powered Phonetic Analysis
      const aiAnalysis = await this.performAIAnalysis(target_word, user_audio_path, groundTruthProfile);
      if (!aiAnalysis) {
        return {
          target_word,
          overall_score: 0,
          phoneme_analyses: [],
          feedback_messages: [],
          error: {
            code: 'AI_RESPONSE_INVALID',
            message: ERROR_MESSAGES.AI_RESPONSE_INVALID
          }
        };
      }

      // Step 3.4: Comparative Analysis
      const phonemeAnalyses = this.compareWithGroundTruth(groundTruthProfile, aiAnalysis);

      // Step 3.5: Scoring and Feedback Generation
      const overallScore = this.calculateOverallScore(phonemeAnalyses);
      const feedbackMessages = this.generateFeedbackMessages(phonemeAnalyses);

      return {
        target_word,
        overall_score: overallScore,
        phoneme_analyses: phonemeAnalyses,
        feedback_messages: feedbackMessages
      };

    } catch (error) {
      console.error('Pronunciation analysis error:', error);
      return {
        target_word,
        overall_score: 0,
        phoneme_analyses: [],
        feedback_messages: [],
        error: {
          code: 'AI_RESPONSE_INVALID',
          message: ERROR_MESSAGES.AI_RESPONSE_INVALID
        }
      };
    }
  }

  /**
   * Step 3.1: Audio validation
   */
  private async validateAudio(audioPath: string): Promise<{ valid: boolean; errorCode?: string }> {
    // This would integrate with actual audio processing libraries
    // For now, we'll implement basic checks
    try {
      // In a real implementation, you would:
      // 1. Load the audio file
      // 2. Calculate RMS energy
      // 3. Calculate signal-to-noise ratio
      // 4. Check duration
      
      // Placeholder implementation
      return { valid: true };
    } catch (error) {
      return { valid: false, errorCode: 'AUDIO_SILENT' };
    }
  }

  /**
   * Step 3.2: Generate Ground Truth Profile
   */
  private generateGroundTruth(target_word: string): GroundTruthProfile[] {
    const tokens = this.tokenizeWord(target_word);
    const groundTruth: GroundTruthProfile[] = [];

    for (const token of tokens) {
      const rule = this.findPhoneticRule(token);
      if (rule) {
        groundTruth.push({
          phoneme: token,
          expected_type: rule.type,
          expected_features: rule.features,
          expected_tone: rule.tone
        });
      } else {
        // Warn about unrecognized phonemes but still include them
        console.warn(`No phonetic rule found for token: ${token} in word: ${target_word}`);
        groundTruth.push({
          phoneme: token,
          expected_type: 'Unknown',
          expected_features: {},
          expected_tone: undefined
        });
      }
    }

    return groundTruth;
  }

  /**
   * Tokenize word using longest-match-first precedence
   */
  private tokenizeWord(word: string): string[] {
    const tokens: string[] = [];
    let remaining = word.toLowerCase();
    
    while (remaining.length > 0) {
      let matched = false;
      
      // Try multi-character phonemes first (longest match)
      const multiCharPhonemes = ['tsv', 'sv', 'zv', 'ts', 'dz', 'mb', 'nd', 'ng', 'bh', 'dh', 'ny', 'sh'];
      
      for (const phoneme of multiCharPhonemes) {
        if (remaining.startsWith(phoneme)) {
          tokens.push(phoneme);
          remaining = remaining.slice(phoneme.length);
          matched = true;
          break;
        }
      }
      
      if (!matched) {
        // Single character
        tokens.push(remaining[0]);
        remaining = remaining.slice(1);
      }
    }
    
    return tokens;
  }

  /**
   * Find phonetic rule for a token
   */
  private findPhoneticRule(token: string): any {
    // Check all rule categories
    const allRules = {
      ...SHONA_PHONETIC_RULES.vowels,
      ...SHONA_PHONETIC_RULES.implosives,
      ...SHONA_PHONETIC_RULES.breathy_voiced,
      ...SHONA_PHONETIC_RULES.whistled_sibilants,
      ...SHONA_PHONETIC_RULES.prenasalized,
      ...SHONA_PHONETIC_RULES.affricates,
      ...SHONA_PHONETIC_RULES.whistled_affricates,
      ...SHONA_PHONETIC_RULES.plosives,
      ...SHONA_PHONETIC_RULES.fricatives,
      ...SHONA_PHONETIC_RULES.nasals,
      ...SHONA_PHONETIC_RULES.liquids,
      ...SHONA_PHONETIC_RULES.semivowels
    };
    
    return allRules[token as keyof typeof allRules];
  }

  /**
   * Step 3.3: Perform AI Analysis using Gemini
   */
  private async performAIAnalysis(
    target_word: string, 
    audio_path: string, 
    ground_truth: GroundTruthProfile[]
  ): Promise<AIAnalysisResponse | null> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      // Read audio file
      const audioData = await this.readAudioFile(audio_path);
      
      // Construct the AI prompt as specified in Section 4.0
      const prompt = this.constructAIPrompt(target_word, ground_truth);
      
      // Generate content with audio
      const result = await model.generateContent([prompt, audioData]);
      const response = await result.response;
      const text = response.text();
      
      // Parse JSON response
      try {
        const aiResponse = JSON.parse(text) as AIAnalysisResponse;
        return this.validateAIResponse(aiResponse) ? aiResponse : null;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return null;
      }
      
    } catch (error) {
      console.error('AI analysis error:', error);
      return null;
    }
  }

  /**
   * Construct AI prompt as specified in Section 4.0
   */
  private constructAIPrompt(target_word: string, ground_truth: GroundTruthProfile[]): string {
    const groundTruthJson = JSON.stringify(ground_truth, null, 2);
    
    return `You are 'Muturikiri AI', a world-class phonetician from the University of Zimbabwe, specializing in the acoustic phonology of the Shona language. Your analysis is based on the principles outlined by linguist Clement Doke and modern acoustic research. Your task is to perform a technical analysis of a user's pronunciation from an audio file and provide a detailed, structured phonetic breakdown. You must identify the phonemes produced and quantify their key acoustic properties. Your analysis must be acutely sensitive to the defining features of Shona: glottalic ingressive airstreams (implosives), breathy-voice murmur (and its tone-depressing effects), and high-frequency whistled (sibilant) fricatives. You must adhere strictly to the requested JSON output schema. Do not add any conversational text or explanations; your response must be only the JSON object.

Perform a detailed phonetic analysis of the attached audio file. The user was attempting to pronounce the Shona word: ${target_word}.

Reference Data: Ground Truth Phonetic Profile for ${target_word}
This is the profile of a perfect pronunciation. Use it to guide your analysis of the user's audio.
${groundTruthJson}

Your Task:
Listen to the audio. Transcribe what you hear phonetically. Then, for each phoneme you identify in the user's speech, provide a detailed analysis of its acoustic properties. Compare the user's attempt to the ground truth and fill in the schema below based on your observations of the user's audio only.

Required JSON Output Schema:

{
  "word_transcription": "Your phonetic transcription of what the user actually said.",
  "phoneme_observations": [
    {
      "phoneme_observed": "The phoneme you identified, e.g., 'b', 'bh', 'sv'.",
      "phoneme_type_observed": "Your classification, e.g., 'Implosive', 'Breathy-Voiced Plosive'.",
      "acoustic_features": {
        "formant_f1_hz": "integer or null",
        "formant_f2_hz": "integer or null",
        "is_voiced": "boolean",
        "plosive_burst_energy": "'none', 'low', 'medium', or 'high'",
        "aspiration_noise_level": "'none', 'low', 'medium', or 'high'",
        "spectral_centroid_khz": "float or null",
        "is_implosive_airstream_detected": "boolean"
      },
      "tone_observed": "'High', 'Low', 'Rising', 'Falling', or 'Unclear'",
      "observation_confidence": "A float from 0.0 to 1.0 indicating your confidence in this specific phoneme's analysis."
    }
  ]
}

Now, analyze the provided audio and return the JSON object.`;
  }

  /**
   * Read audio file for AI analysis
   */
  private async readAudioFile(audio_path: string): Promise<any> {
    // This would integrate with actual file reading
    // For now, return a placeholder
    return { inlineData: { data: "placeholder", mimeType: "audio/wav" } };
  }

  /**
   * Validate AI response structure
   */
  private validateAIResponse(response: any): response is AIAnalysisResponse {
    return (
      typeof response === 'object' &&
      typeof response.word_transcription === 'string' &&
      Array.isArray(response.phoneme_observations) &&
      response.phoneme_observations.every((obs: any) => 
        typeof obs.phoneme_observed === 'string' &&
        typeof obs.phoneme_type_observed === 'string' &&
        typeof obs.acoustic_features === 'object' &&
        typeof obs.tone_observed === 'string' &&
        typeof obs.observation_confidence === 'number'
      )
    );
  }

  /**
   * Align ground truth and AI observations using dynamic programming
   * Returns aligned pairs with nulls for missing phonemes
   */
  private alignPhonemes(
    ground_truth: GroundTruthProfile[],
    ai_observations: PhonemeObservation[]
  ): Array<{ gt: GroundTruthProfile | null; ai: PhonemeObservation | null }> {
    const gtLen = ground_truth.length;
    const aiLen = ai_observations.length;
    
    // Simple alignment: try to match phonemes by position, allowing for insertions/deletions
    const aligned: Array<{ gt: GroundTruthProfile | null; ai: PhonemeObservation | null }> = [];
    let gtIdx = 0;
    let aiIdx = 0;
    
    while (gtIdx < gtLen || aiIdx < aiLen) {
      if (gtIdx >= gtLen) {
        // Extra AI observations
        aligned.push({ gt: null, ai: ai_observations[aiIdx] });
        aiIdx++;
      } else if (aiIdx >= aiLen) {
        // Missing phonemes in AI observations
        aligned.push({ gt: ground_truth[gtIdx], ai: null });
        gtIdx++;
      } else {
        // Try to match current phonemes
        const gtPhoneme = ground_truth[gtIdx].phoneme.toLowerCase();
        const aiPhoneme = ai_observations[aiIdx].phoneme_observed.toLowerCase();
        
        if (gtPhoneme === aiPhoneme || this.arePhonemesSimilar(gtPhoneme, aiPhoneme)) {
          // Match found
          aligned.push({ gt: ground_truth[gtIdx], ai: ai_observations[aiIdx] });
          gtIdx++;
          aiIdx++;
        } else if (gtIdx + 1 < gtLen && 
                   ground_truth[gtIdx + 1].phoneme.toLowerCase() === aiPhoneme) {
          // GT has extra phoneme
          aligned.push({ gt: ground_truth[gtIdx], ai: null });
          gtIdx++;
        } else if (aiIdx + 1 < aiLen && 
                   ai_observations[aiIdx + 1].phoneme_observed.toLowerCase() === gtPhoneme) {
          // AI has extra phoneme
          aligned.push({ gt: null, ai: ai_observations[aiIdx] });
          aiIdx++;
        } else {
          // No clear match, align both and continue
          aligned.push({ gt: ground_truth[gtIdx], ai: ai_observations[aiIdx] });
          gtIdx++;
          aiIdx++;
        }
      }
    }
    
    return aligned;
  }

  /**
   * Check if two phonemes are similar enough to be considered a match
   */
  private arePhonemesSimilar(gt: string, ai: string): boolean {
    // Exact match
    if (gt === ai) return true;
    
    // Check if one is a substring of the other (e.g., 'ts' vs 'tsv')
    if (gt.includes(ai) || ai.includes(gt)) return true;
    
    // Check for common substitutions
    const substitutions: Record<string, string[]> = {
      'b': ['bh'],
      'd': ['dh'],
      's': ['sv', 'sh'],
      'z': ['zv'],
      'ts': ['tsv', 't']
    };
    
    for (const [key, variants] of Object.entries(substitutions)) {
      if ((gt === key && variants.includes(ai)) || (ai === key && variants.includes(gt))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Step 3.4: Compare AI observations with Ground Truth
   */
  private compareWithGroundTruth(
    ground_truth: GroundTruthProfile[], 
    ai_analysis: AIAnalysisResponse
  ): PhonemeAnalysis[] {
    const analyses: PhonemeAnalysis[] = [];
    
    // Align profiles instead of auto-zeroing
    const aligned = this.alignPhonemes(ground_truth, ai_analysis.phoneme_observations);
    
    // Compare each aligned pair
    for (const pair of aligned) {
      if (!pair.gt) {
        // Extra phoneme in AI output
        analyses.push({
          phoneme: pair.ai!.phoneme_observed,
          score: 0,
          deviations: [{
            phoneme: pair.ai!.phoneme_observed,
            feature: 'phoneme_presence',
            expected: 'not present',
            observed: 'present',
            feedback_code: 'EXTRA_PHONEME'
          }],
          feedback_codes: ['EXTRA_PHONEME']
        });
      } else if (!pair.ai) {
        // Missing phoneme in AI output
        analyses.push({
          phoneme: pair.gt.phoneme,
          score: 0,
          deviations: [{
            phoneme: pair.gt.phoneme,
            feature: 'phoneme_presence',
            expected: 'present',
            observed: 'not present',
            feedback_code: 'PHONEME_MISSING'
          }],
          feedback_codes: ['PHONEME_MISSING']
        });
      } else {
        // Both present - compare them
        const deviations = this.comparePhoneme(pair.gt, pair.ai);
        const score = this.calculatePhonemeScore(deviations);
        const feedback_codes = deviations.map(d => d.feedback_code);
        
        analyses.push({
          phoneme: pair.gt.phoneme,
          score,
          deviations,
          feedback_codes
        });
      }
    }
    
    return analyses;
  }

  /**
   * Compare individual phoneme
   */
  private comparePhoneme(ground_truth: GroundTruthProfile, ai_observation: PhonemeObservation): DeviationLog[] {
    const deviations: DeviationLog[] = [];
    
    // Check phoneme type
    if (ground_truth.expected_type !== ai_observation.phoneme_type_observed) {
      deviations.push({
        phoneme: ground_truth.phoneme,
        feature: 'phoneme_type',
        expected: ground_truth.expected_type,
        observed: ai_observation.phoneme_type_observed,
        feedback_code: this.getFeedbackCodeForType(ground_truth.expected_type, ai_observation.phoneme_type_observed)
      });
    }
    
    // Check acoustic features
    if (ground_truth.expected_features.airstream !== undefined) {
      if (ground_truth.expected_features.airstream !== ai_observation.acoustic_features.is_implosive_airstream_detected) {
        deviations.push({
          phoneme: ground_truth.phoneme,
          feature: 'implosive_airstream',
          expected: ground_truth.expected_features.airstream,
          observed: ai_observation.acoustic_features.is_implosive_airstream_detected,
          feedback_code: 'IMPLOSIVE_TOO_PLOSIVE'
        });
      }
    }
    
    if (ground_truth.expected_features.aspiration !== undefined) {
      if (ground_truth.expected_features.aspiration !== ai_observation.acoustic_features.aspiration_noise_level) {
        deviations.push({
          phoneme: ground_truth.phoneme,
          feature: 'aspiration',
          expected: ground_truth.expected_features.aspiration,
          observed: ai_observation.acoustic_features.aspiration_noise_level,
          feedback_code: 'BREATHY_VOICE_WEAK'
        });
      }
    }
    
    if (ground_truth.expected_features.spectral_centroid_khz !== undefined) {
      const observed = ai_observation.acoustic_features.spectral_centroid_khz;
      if (observed && observed < ground_truth.expected_features.spectral_centroid_khz! * 0.8) {
        deviations.push({
          phoneme: ground_truth.phoneme,
          feature: 'spectral_centroid',
          expected: ground_truth.expected_features.spectral_centroid_khz,
          observed,
          feedback_code: 'WHISTLE_QUALITY_LOW'
        });
      }
    }
    
    // Check tone
    if (ground_truth.expected_tone && ground_truth.expected_tone !== ai_observation.tone_observed) {
      deviations.push({
        phoneme: ground_truth.phoneme,
        feature: 'tone',
        expected: ground_truth.expected_tone,
        observed: ai_observation.tone_observed,
        feedback_code: 'INCORRECT_TONE'
      });
    }
    
    return deviations;
  }

  /**
   * Get feedback code for phoneme type mismatch
   */
  private getFeedbackCodeForType(expected: string, observed: string): string {
    if (expected === 'Implosive' && observed.includes('Plosive')) {
      return 'IMPLOSIVE_TOO_PLOSIVE';
    }
    if (expected === 'Breathy-Voiced' && !observed.includes('Breathy')) {
      return 'BREATHY_VOICE_WEAK';
    }
    if (expected === 'Whistled Sibilant' && observed === 'Fricative') {
      return 'WHISTLE_MISSING';
    }
    return 'PHONEME_TYPE_ERROR';
  }

  /**
   * Step 3.5: Calculate phoneme score using deterministic algorithm
   */
  private calculatePhonemeScore(deviations: DeviationLog[]): number {
    let score = 100;
    
    for (const deviation of deviations) {
      switch (deviation.feedback_code) {
        case 'IMPLOSIVE_TOO_PLOSIVE':
        case 'BREATHY_VOICE_WEAK':
        case 'WHISTLE_MISSING':
        case 'PHONEME_MISSING':
        case 'EXTRA_PHONEME':
          score -= 60; // Critical error
          break;
        case 'INCORRECT_TONE':
          score -= 25; // Tonal error
          break;
        case 'WHISTLE_QUALITY_LOW':
        case 'VOWEL_NOT_PURE':
          score -= 15; // Secondary feature error
          break;
        default:
          score -= 40; // Major feature error
      }
    }
    
    return Math.max(0, score);
  }

  /**
   * Calculate overall word score
   */
  private calculateOverallScore(phonemeAnalyses: PhonemeAnalysis[]): number {
    if (phonemeAnalyses.length === 0) return 0;
    
    const totalScore = phonemeAnalyses.reduce((sum, analysis) => sum + analysis.score, 0);
    return Math.round(totalScore / phonemeAnalyses.length);
  }

  /**
   * Generate user-friendly feedback messages
   */
  private generateFeedbackMessages(phonemeAnalyses: PhonemeAnalysis[]): string[] {
    const messages: string[] = [];
    
    for (const analysis of phonemeAnalyses) {
      for (const feedbackCode of analysis.feedback_codes) {
        const template = FEEDBACK_TEMPLATES[feedbackCode as keyof typeof FEEDBACK_TEMPLATES];
        if (template) {
          messages.push(`${analysis.phoneme}: ${template}`);
        }
      }
    }
    
    return messages;
  }
}

// Export a factory function for creating the Muturikiri AI instance
export function createMuturikiriAI(apiKey: string): MuturikiriAI {
  return new MuturikiriAI(apiKey);
}
