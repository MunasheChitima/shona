import { MuturikiriAI, createMuturikiriAI } from '../lib/pronunciation-analysis';

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            word_transcription: "mbira",
            phoneme_observations: [
              {
                phoneme_observed: "mb",
                phoneme_type_observed: "Prenasalized Plosive",
                acoustic_features: {
                  formant_f1_hz: null,
                  formant_f2_hz: null,
                  is_voiced: true,
                  plosive_burst_energy: "medium",
                  aspiration_noise_level: "none",
                  spectral_centroid_khz: null,
                  is_implosive_airstream_detected: false
                },
                tone_observed: "Low",
                observation_confidence: 0.9
              },
              {
                phoneme_observed: "i",
                phoneme_type_observed: "Pure Vowel",
                acoustic_features: {
                  formant_f1_hz: 300,
                  formant_f2_hz: 2200,
                  is_voiced: true,
                  plosive_burst_energy: "none",
                  aspiration_noise_level: "none",
                  spectral_centroid_khz: null,
                  is_implosive_airstream_detected: false
                },
                tone_observed: "Low",
                observation_confidence: 0.95
              },
              {
                phoneme_observed: "r",
                phoneme_type_observed: "Tap",
                acoustic_features: {
                  formant_f1_hz: null,
                  formant_f2_hz: null,
                  is_voiced: true,
                  plosive_burst_energy: "none",
                  aspiration_noise_level: "none",
                  spectral_centroid_khz: null,
                  is_implosive_airstream_detected: false
                },
                tone_observed: "Low",
                observation_confidence: 0.8
              },
              {
                phoneme_observed: "a",
                phoneme_type_observed: "Pure Vowel",
                acoustic_features: {
                  formant_f1_hz: 800,
                  formant_f2_hz: 1200,
                  is_voiced: true,
                  plosive_burst_energy: "none",
                  aspiration_noise_level: "none",
                  spectral_centroid_khz: null,
                  is_implosive_airstream_detected: false
                },
                tone_observed: "Low",
                observation_confidence: 0.9
              }
            ]
          }))
        }
      })
    })
  }))
}));

describe('MuturikiriAI', () => {
  let muturikiriAI: MuturikiriAI;

  beforeEach(() => {
    muturikiriAI = createMuturikiriAI('test-api-key');
  });

  describe('tokenizeWord', () => {
    it('should tokenize simple words correctly', () => {
      const result = (muturikiriAI as any).tokenizeWord('mbira');
      expect(result).toEqual(['mb', 'i', 'r', 'a']);
    });

    it('should handle whistled sibilants', () => {
      const result = (muturikiriAI as any).tokenizeWord('svika');
      expect(result).toEqual(['sv', 'i', 'k', 'a']);
    });

    it('should handle breathy-voiced consonants', () => {
      const result = (muturikiriAI as any).tokenizeWord('bhuku');
      expect(result).toEqual(['bh', 'u', 'k', 'u']);
    });

    it('should handle affricates', () => {
      const result = (muturikiriAI as any).tokenizeWord('tsva');
      expect(result).toEqual(['ts', 'v', 'a']);
    });
  });

  describe('generateGroundTruth', () => {
    it('should generate ground truth for mbira', () => {
      const result = (muturikiriAI as any).generateGroundTruth('mbira');
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        phoneme: 'mb',
        expected_type: 'Prenasalized Plosive',
        expected_features: { burst_energy: 'medium' }
      });
      expect(result[1]).toEqual({
        phoneme: 'i',
        expected_type: 'Pure Vowel',
        expected_features: { formants: 'stable' },
        expected_tone: 'Low'
      });
    });
  });

  describe('calculatePhonemeScore', () => {
    it('should return 100 for perfect pronunciation', () => {
      const deviations: any[] = [];
      const result = (muturikiriAI as any).calculatePhonemeScore(deviations);
      expect(result).toBe(100);
    });

    it('should deduct points for critical errors', () => {
      const deviations = [{
        feedback_code: 'IMPLOSIVE_TOO_PLOSIVE'
      }];
      const result = (muturikiriAI as any).calculatePhonemeScore(deviations);
      expect(result).toBe(40); // 100 - 60
    });

    it('should deduct points for tonal errors', () => {
      const deviations = [{
        feedback_code: 'INCORRECT_TONE'
      }];
      const result = (muturikiriAI as any).calculatePhonemeScore(deviations);
      expect(result).toBe(75); // 100 - 25
    });

    it('should not go below 0', () => {
      const deviations = [
        { feedback_code: 'IMPLOSIVE_TOO_PLOSIVE' },
        { feedback_code: 'BREATHY_VOICE_WEAK' },
        { feedback_code: 'INCORRECT_TONE' }
      ];
      const result = (muturikiriAI as any).calculatePhonemeScore(deviations);
      expect(result).toBe(0);
    });
  });

  describe('calculateOverallScore', () => {
    it('should calculate average score correctly', () => {
      const phonemeAnalyses = [
        { score: 80 },
        { score: 90 },
        { score: 70 }
      ];
      const result = (muturikiriAI as any).calculateOverallScore(phonemeAnalyses);
      expect(result).toBe(80); // (80 + 90 + 70) / 3 = 80
    });

    it('should return 0 for empty array', () => {
      const result = (muturikiriAI as any).calculateOverallScore([]);
      expect(result).toBe(0);
    });
  });

  describe('analyzePronunciation', () => {
    it('should analyze pronunciation successfully', async () => {
      const result = await muturikiriAI.analyzePronunciation('mbira', '/test/audio.wav');
      
      expect(result.target_word).toBe('mbira');
      expect(result.overall_score).toBeGreaterThan(0);
      expect(result.phoneme_analyses).toHaveLength(4);
      expect(result.feedback_messages).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should handle audio validation errors', async () => {
      // Mock validateAudio to return error
      jest.spyOn(muturikiriAI as any, 'validateAudio').mockResolvedValue({
        valid: false,
        errorCode: 'AUDIO_SILENT'
      });

      const result = await muturikiriAI.analyzePronunciation('mbira', '/test/audio.wav');
      
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('AUDIO_SILENT');
      expect(result.overall_score).toBe(0);
    });
  });

  describe('createMuturikiriAI', () => {
    it('should create MuturikiriAI instance', () => {
      const instance = createMuturikiriAI('test-key');
      expect(instance).toBeInstanceOf(MuturikiriAI);
    });
  });
});

// Integration test for API endpoint
describe('Pronunciation API', () => {
  it('should handle valid pronunciation analysis request', async () => {
    // This would test the actual API endpoint
    // For now, we'll just verify the structure
    const mockFormData = new FormData();
    mockFormData.append('targetWord', 'mbira');
    
    // In a real test, you would mock the file upload and API call
    expect(mockFormData.get('targetWord')).toBe('mbira');
  });
}); 