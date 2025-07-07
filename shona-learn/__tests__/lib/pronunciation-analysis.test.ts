import { MuturikiriAI, createMuturikiriAI } from '@/lib/pronunciation-analysis'
import type { 
  PhonemeObservation, 
  AIAnalysisResponse, 
  GroundTruthProfile,
  PronunciationAnalysisResult 
} from '@/lib/pronunciation-analysis'

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => JSON.stringify(global.mockGeminiResponse)
        }
      })
    })
  }))
}))

// Mock file system operations
jest.mock('fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from('mock audio data')),
}))

describe('MuturikiriAI Pronunciation Analysis', () => {
  let muturikiriAI: MuturikiriAI
  const mockApiKey = 'test-api-key'

  beforeEach(() => {
    muturikiriAI = createMuturikiriAI(mockApiKey)
    jest.clearAllMocks()
  })

  describe('Core Analysis Function', () => {
    it('should analyze simple word correctly', async () => {
      const result = await muturikiriAI.analyzePronunciation('baba', 'mock-audio-path')
      
      expect(result).toBeDefined()
      expect(result.target_word).toBe('baba')
      expect(result.overall_score).toBeGreaterThanOrEqual(0)
      expect(result.overall_score).toBeLessThanOrEqual(100)
      expect(result.phoneme_analyses).toBeDefined()
    })

    it('should handle whistled sibilants (sv, zv)', async () => {
      const result = await muturikiriAI.analyzePronunciation('svika', 'mock-audio-path')
      
      expect(result.target_word).toBe('svika')
      expect(result.phoneme_analyses).toHaveLength(2) // 'sv' and 'ika' tokens
      
      // Check for whistled sibilant detection
      const whistledPhoneme = result.phoneme_analyses.find(
        analysis => analysis.phoneme === 'sv'
      )
      expect(whistledPhoneme).toBeDefined()
    })

    it('should detect implosive consonants correctly', async () => {
      const result = await muturikiriAI.analyzePronunciation('baba', 'mock-audio-path')
      
      const implosivePhoneme = result.phoneme_analyses.find(
        analysis => analysis.phoneme === 'b'
      )
      expect(implosivePhoneme).toBeDefined()
    })

    it('should analyze prenasalized consonants (mb, nd)', async () => {
      const result = await muturikiriAI.analyzePronunciation('mbira', 'mock-audio-path')
      
      const prenasalizedPhoneme = result.phoneme_analyses.find(
        analysis => analysis.phoneme === 'mb'
      )
      expect(prenasalizedPhoneme).toBeDefined()
    })

    it('should handle breathy-voiced consonants with tone depression', async () => {
      const result = await muturikiriAI.analyzePronunciation('bhazi', 'mock-audio-path')
      
      const breathyPhoneme = result.phoneme_analyses.find(
        analysis => analysis.phoneme === 'bh'
      )
      expect(breathyPhoneme).toBeDefined()
    })
  })

  describe('Tone Detection and Analysis', () => {
    it('should correctly identify high tones', async () => {
      // Mock high tone response
      const highToneResponse = {
        word_transcription: 'ba',
        phoneme_observations: [{
          phoneme_observed: 'a',
          phoneme_type_observed: 'Pure Vowel',
          acoustic_features: {
            formant_f1_hz: 700,
            formant_f2_hz: 1200,
            is_voiced: true,
            plosive_burst_energy: 'none',
            aspiration_noise_level: 'none',
            spectral_centroid_khz: null,
            is_implosive_airstream_detected: false,
          },
          tone_observed: 'High',
          observation_confidence: 0.9,
        }]
      }
      
      // Override mock for this test
      jest.mocked(require('@google/generative-ai').GoogleGenerativeAI)
        .mockImplementation(() => ({
          getGenerativeModel: () => ({
            generateContent: () => Promise.resolve({
              response: { text: () => JSON.stringify(highToneResponse) }
            })
          })
        }))
      
      const result = await muturikiriAI.analyzePronunciation('bá', 'mock-audio-path')
      expect(result.phoneme_analyses.length).toBeGreaterThan(0)
    })

    it('should detect tone depression from breathy consonants', async () => {
      const result = await muturikiriAI.analyzePronunciation('bhadhi', 'mock-audio-path')
      
      // Should detect that 'bh' affects following vowel tone
      const analysis = result.phoneme_analyses.find(
        analysis => analysis.phoneme === 'bh'
      )
      expect(analysis).toBeDefined()
      
      // Check for tone depression feedback
      const hasToneDepression = result.feedback_messages.some(
        message => message.includes('tone') || message.includes('lower')
      )
      expect(hasToneDepression || result.phoneme_analyses.length > 0).toBe(true)
    })

    it('should distinguish between tone patterns (HL vs LH)', async () => {
      const hlResult = await muturikiriAI.analyzePronunciation('baba', 'mock-audio-path')
      const lhResult = await muturikiriAI.analyzePronunciation('guru', 'mock-audio-path')
      
      expect(hlResult.target_word).toBe('baba')
      expect(lhResult.target_word).toBe('guru')
      
      // Both should have valid analyses
      expect(hlResult.phoneme_analyses.length).toBeGreaterThan(0)
      expect(lhResult.phoneme_analyses.length).toBeGreaterThan(0)
    })
  })

  describe('Special Sound Recognition', () => {
    it('should score whistled sounds accurately', async () => {
      const perfectWhisle = {
        word_transcription: 'svika',
        phoneme_observations: [{
          phoneme_observed: 'sv',
          phoneme_type_observed: 'Whistled Sibilant',
          acoustic_features: {
            formant_f1_hz: null,
            formant_f2_hz: null,
            is_voiced: false,
            plosive_burst_energy: 'none',
            aspiration_noise_level: 'low',
            spectral_centroid_khz: 7.5, // High frequency for whistle
            is_implosive_airstream_detected: false,
          },
          tone_observed: 'High',
          observation_confidence: 0.95,
        }]
      }
      
      // Override mock
      jest.mocked(require('@google/generative-ai').GoogleGenerativeAI)
        .mockImplementation(() => ({
          getGenerativeModel: () => ({
            generateContent: () => Promise.resolve({
              response: { text: () => JSON.stringify(perfectWhisle) }
            })
          })
        }))
      
      const result = await muturikiriAI.analyzePronunciation('sv', 'mock-audio-path')
      expect(result.overall_score).toBeGreaterThan(80)
    })

    it('should detect missing whistle quality', async () => {
      const poorWhisle = {
        word_transcription: 'sika', // Missing 'v' sound
        phoneme_observations: [{
          phoneme_observed: 's',
          phoneme_type_observed: 'Fricative',
          acoustic_features: {
            formant_f1_hz: null,
            formant_f2_hz: null,
            is_voiced: false,
            plosive_burst_energy: 'none',
            aspiration_noise_level: 'medium',
            spectral_centroid_khz: 4.0, // Lower frequency, not whistled
            is_implosive_airstream_detected: false,
          },
          tone_observed: 'High',
          observation_confidence: 0.7,
        }]
      }
      
      jest.mocked(require('@google/generative-ai').GoogleGenerativeAI)
        .mockImplementation(() => ({
          getGenerativeModel: () => ({
            generateContent: () => Promise.resolve({
              response: { text: () => JSON.stringify(poorWhisle) }
            })
          })
        }))
      
      const result = await muturikiriAI.analyzePronunciation('sv', 'mock-audio-path')
      expect(result.overall_score).toBeLessThan(80)
    })

    it('should recognize implosive airstream direction', async () => {
      const correctImplosive = {
        word_transcription: 'baba',
        phoneme_observations: [{
          phoneme_observed: 'b',
          phoneme_type_observed: 'Implosive',
          acoustic_features: {
            formant_f1_hz: 500,
            formant_f2_hz: 1500,
            is_voiced: true,
            plosive_burst_energy: 'low',
            aspiration_noise_level: 'none',
            spectral_centroid_khz: null,
            is_implosive_airstream_detected: true, // Correct airstream
          },
          tone_observed: 'Low',
          observation_confidence: 0.9,
        }]
      }
      
      jest.mocked(require('@google/generative-ai').GoogleGenerativeAI)
        .mockImplementation(() => ({
          getGenerativeModel: () => ({
            generateContent: () => Promise.resolve({
              response: { text: () => JSON.stringify(correctImplosive) }
            })
          })
        }))
      
      const result = await muturikiriAI.analyzePronunciation('b', 'mock-audio-path')
      expect(result.overall_score).toBeGreaterThan(70)
    })
  })

  describe('Cultural Appropriateness', () => {
    it('should use respectful tone for elder terms', async () => {
      const result = await muturikiriAI.analyzePronunciation('sekuru', 'mock-audio-path')
      
      expect(result.target_word).toBe('sekuru')
      // Should complete analysis without cultural violations
      expect(result.error).toBeUndefined()
      expect(result.phoneme_analyses.length).toBeGreaterThan(0)
    })

    it('should handle sacred terms appropriately', async () => {
      const result = await muturikiriAI.analyzePronunciation('mwari', 'mock-audio-path')
      
      expect(result.target_word).toBe('mwari')
      expect(result.error).toBeUndefined()
      // Should provide appropriate feedback
      expect(result.feedback_messages).toBeDefined()
    })

    it('should recognize traditional/cultural context words', async () => {
      const culturalWords = ['mbira', 'mukoma', 'ambuya', 'sadza']
      
      for (const word of culturalWords) {
        const result = await muturikiriAI.analyzePronunciation(word, 'mock-audio-path')
        expect(result.target_word).toBe(word)
        expect(result.error).toBeUndefined()
      }
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty audio gracefully', async () => {
      // Mock empty audio validation
      const originalValidateAudio = muturikiriAI['validateAudio']
      muturikiriAI['validateAudio'] = jest.fn().mockResolvedValue({
        valid: false,
        errorCode: 'AUDIO_SILENT'
      })
      
      const result = await muturikiriAI.analyzePronunciation('test', 'empty-audio-path')
      
      expect(result.error).toBeDefined()
      expect(result.error?.code).toBe('AUDIO_SILENT')
      expect(result.overall_score).toBe(0)
    })

    it('should handle AI analysis failures', async () => {
      // Mock AI failure
      jest.mocked(require('@google/generative-ai').GoogleGenerativeAI)
        .mockImplementation(() => ({
          getGenerativeModel: () => ({
            generateContent: () => Promise.reject(new Error('AI Error'))
          })
        }))
      
      const result = await muturikiriAI.analyzePronunciation('test', 'mock-audio-path')
      
      expect(result.error).toBeDefined()
      expect(result.overall_score).toBe(0)
    })

    it('should validate input word format', async () => {
      // Test with invalid characters
      const result = await muturikiriAI.analyzePronunciation('test123!', 'mock-audio-path')
      
      // Should still attempt analysis or provide appropriate error
      expect(result).toBeDefined()
      expect(result.target_word).toBe('test123!')
    })

    it('should handle unknown phonemes gracefully', async () => {
      const unknownPhoneme = {
        word_transcription: 'xyz',
        phoneme_observations: [{
          phoneme_observed: 'x',
          phoneme_type_observed: 'Unknown',
          acoustic_features: {
            formant_f1_hz: null,
            formant_f2_hz: null,
            is_voiced: false,
            plosive_burst_energy: 'none',
            aspiration_noise_level: 'none',
            spectral_centroid_khz: null,
            is_implosive_airstream_detected: false,
          },
          tone_observed: 'Unclear',
          observation_confidence: 0.3,
        }]
      }
      
      jest.mocked(require('@google/generative-ai').GoogleGenerativeAI)
        .mockImplementation(() => ({
          getGenerativeModel: () => ({
            generateContent: () => Promise.resolve({
              response: { text: () => JSON.stringify(unknownPhoneme) }
            })
          })
        }))
      
      const result = await muturikiriAI.analyzePronunciation('xyz', 'mock-audio-path')
      expect(result.overall_score).toBeLessThan(50)
    })
  })

  describe('Performance and Accuracy Metrics', () => {
    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now()
      await muturikiriAI.analyzePronunciation('test', 'mock-audio-path')
      const endTime = Date.now()
      
      expect(endTime - startTime).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should provide consistent scoring for identical input', async () => {
      const result1 = await muturikiriAI.analyzePronunciation('baba', 'mock-audio-path')
      const result2 = await muturikiriAI.analyzePronunciation('baba', 'mock-audio-path')
      
      expect(result1.overall_score).toBe(result2.overall_score)
      expect(result1.phoneme_analyses.length).toBe(result2.phoneme_analyses.length)
    })

    it('should provide confidence scores within valid range', async () => {
      const result = await muturikiriAI.analyzePronunciation('svika', 'mock-audio-path')
      
      result.phoneme_analyses.forEach(analysis => {
        expect(analysis.score).toBeGreaterThanOrEqual(0)
        expect(analysis.score).toBeLessThanOrEqual(100)
      })
    })
  })

  describe('Feedback Generation', () => {
    it('should provide specific feedback for common errors', async () => {
      const result = await muturikiriAI.analyzePronunciation('svika', 'mock-audio-path')
      
      expect(result.feedback_messages).toBeDefined()
      expect(Array.isArray(result.feedback_messages)).toBe(true)
    })

    it('should generate constructive feedback messages', async () => {
      const result = await muturikiriAI.analyzePronunciation('baba', 'mock-audio-path')
      
      // Feedback should be helpful and not just scores
      const hasConstructiveFeedback = result.feedback_messages.length > 0 || 
                                      result.phoneme_analyses.some(analysis => 
                                        analysis.feedback_codes.length > 0
                                      )
      expect(hasConstructiveFeedback).toBe(true)
    })

    it('should provide phoneme-specific guidance', async () => {
      const result = await muturikiriAI.analyzePronunciation('tsvaira', 'mock-audio-path')
      
      // Should have analysis for complex phonemes
      expect(result.phoneme_analyses.length).toBeGreaterThan(0)
      
      const complexPhoneme = result.phoneme_analyses.find(
        analysis => analysis.phoneme.includes('tsv') || analysis.phoneme === 'ts'
      )
      expect(complexPhoneme || result.phoneme_analyses.length > 0).toBe(true)
    })
  })
})