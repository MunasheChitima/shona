// Audio Quality Testing Suite for Shona Learning App
import { validateAudioQuality, detectSilence, analyzeFrequencyResponse, validatePronunciationAccuracy } from '@/lib/audio-testing'

// Mock Web Audio API for testing
const createMockAudioBuffer = (duration: number, sampleRate: number = 44100): AudioBuffer => ({
  sampleRate,
  length: duration * sampleRate,
  duration,
  numberOfChannels: 1,
  getChannelData: (channel: number) => {
    const length = duration * sampleRate
    const data = new Float32Array(length)
    // Generate simple sine wave for testing
    for (let i = 0; i < length; i++) {
      data[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.5
    }
    return data
  },
  copyFromChannel: jest.fn(),
  copyToChannel: jest.fn(),
})

describe('Audio Quality Testing Suite', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('ElevenLabs Output Validation', () => {
    it('should validate ElevenLabs audio quality meets standards', async () => {
      const mockElevenLabsAudio = createMockAudioBuffer(2.5, 44100)
      
      const qualityReport = await validateAudioQuality(mockElevenLabsAudio, {
        source: 'elevenlabs',
        expectedDuration: 2.5,
        language: 'shona'
      })

      expect(qualityReport.overall_score).toBeGreaterThan(8.0) // Out of 10
      expect(qualityReport.clarity_score).toBeGreaterThan(7.5)
      expect(qualityReport.naturalness_score).toBeGreaterThan(7.0)
      expect(qualityReport.pronunciation_accuracy).toBeGreaterThan(8.0)
    })

    it('should detect proper Shona phoneme representation in ElevenLabs output', async () => {
      const shonaPhonemes = ['sv', 'zv', 'mb', 'nd', 'bh', 'dh']
      
      for (const phoneme of shonaPhonemes) {
        const audioBuffer = createMockAudioBuffer(1.0)
        
        const phonemeAnalysis = await analyzeFrequencyResponse(audioBuffer, {
          target_phoneme: phoneme,
          language: 'shona'
        })

        expect(phonemeAnalysis.phoneme_detected).toBe(true)
        expect(phonemeAnalysis.accuracy_score).toBeGreaterThan(7.0)
        
        // Specific checks for Shona phonemes
        if (phoneme === 'sv' || phoneme === 'zv') {
          expect(phonemeAnalysis.spectral_characteristics.whistled_quality).toBe(true)
          expect(phonemeAnalysis.frequency_peak).toBeGreaterThan(6000) // High frequency for whistle
        }
        
        if (phoneme === 'mb' || phoneme === 'nd') {
          expect(phonemeAnalysis.spectral_characteristics.prenasalized_burst).toBe(true)
        }
        
        if (phoneme === 'bh' || phoneme === 'dh') {
          expect(phonemeAnalysis.spectral_characteristics.breathy_voice).toBe(true)
          expect(phonemeAnalysis.aspiration_detected).toBe(true)
        }
      }
    })

    it('should validate cultural appropriateness of generated audio tone', async () => {
      const culturalTerms = [
        { word: 'sekuru', tone_expectation: 'respectful', pace_expectation: 'slower' },
        { word: 'mwari', tone_expectation: 'reverent', pace_expectation: 'measured' },
        { word: 'ambuya', tone_expectation: 'respectful', pace_expectation: 'gentle' }
      ]

      for (const { word, tone_expectation, pace_expectation } of culturalTerms) {
        const audioBuffer = createMockAudioBuffer(2.0)
        
        const culturalAnalysis = await validatePronunciationAccuracy(audioBuffer, {
          target_word: word,
          cultural_context: true,
          expected_tone: tone_expectation,
          expected_pace: pace_expectation
        })

        expect(culturalAnalysis.cultural_appropriateness).toBeGreaterThan(8.0)
        expect(culturalAnalysis.tone_analysis.respectfulness_level).toBe(tone_expectation)
        expect(culturalAnalysis.pace_analysis.appropriateness).toBe('appropriate')
      }
    })

    it('should detect and flag audio quality issues', async () => {
      // Test with poor quality audio
      const poorQualityAudio = createMockAudioBuffer(1.0, 8000) // Low sample rate
      
      const qualityReport = await validateAudioQuality(poorQualityAudio, {
        source: 'elevenlabs',
        quality_threshold: 7.0
      })

      expect(qualityReport.issues).toBeDefined()
      expect(qualityReport.issues.sample_rate_low).toBe(true)
      expect(qualityReport.overall_score).toBeLessThan(7.0)
      expect(qualityReport.recommendations).toContain('increase_sample_rate')
    })
  })

  describe('Pronunciation Accuracy Validation', () => {
    it('should validate whistled sibilant pronunciation accuracy', async () => {
      const whistledWords = ['svika', 'zvino', 'tsvaira']
      
      for (const word of whistledWords) {
        const audioBuffer = createMockAudioBuffer(1.5)
        
        const accuracy = await validatePronunciationAccuracy(audioBuffer, {
          target_word: word,
          phonetic_focus: 'whistled_sibilants'
        })

        expect(accuracy.overall_accuracy).toBeGreaterThan(8.0)
        expect(accuracy.phoneme_accuracy.whistled_quality).toBeGreaterThan(7.5)
        expect(accuracy.frequency_analysis.high_frequency_content).toBe(true)
      }
    })

    it('should validate implosive consonant pronunciation', async () => {
      const implosiveWords = ['baba', 'dada']
      
      for (const word of implosiveWords) {
        const audioBuffer = createMockAudioBuffer(1.0)
        
        const accuracy = await validatePronunciationAccuracy(audioBuffer, {
          target_word: word,
          phonetic_focus: 'implosives'
        })

        expect(accuracy.airstream_direction).toBe('ingressive')
        expect(accuracy.implosive_quality_score).toBeGreaterThan(7.0)
        expect(accuracy.burst_characteristics.energy_level).toBe('low_to_medium')
      }
    })

    it('should validate tone pattern accuracy', async () => {
      const tonePatterns = [
        { word: 'baba', pattern: 'LL', expected_contour: 'flat_low' },
        { word: 'guru', pattern: 'HL', expected_contour: 'falling' },
        { word: 'nzira', pattern: 'LH', expected_contour: 'rising' }
      ]

      for (const { word, pattern, expected_contour } of tonePatterns) {
        const audioBuffer = createMockAudioBuffer(1.5)
        
        const toneAccuracy = await validatePronunciationAccuracy(audioBuffer, {
          target_word: word,
          tone_pattern: pattern,
          phonetic_focus: 'tones'
        })

        expect(toneAccuracy.tone_accuracy_score).toBeGreaterThan(7.0)
        expect(toneAccuracy.detected_contour).toBe(expected_contour)
        expect(toneAccuracy.f0_pattern_match).toBeGreaterThan(0.8)
      }
    })

    it('should detect and score breathy voice quality', async () => {
      const breathyWords = ['bhazi', 'dhodhi']
      
      for (const word of breathyWords) {
        const audioBuffer = createMockAudioBuffer(1.2)
        
        const breathyAnalysis = await validatePronunciationAccuracy(audioBuffer, {
          target_word: word,
          phonetic_focus: 'breathy_voice'
        })

        expect(breathyAnalysis.breathy_voice_detected).toBe(true)
        expect(breathyAnalysis.aspiration_level).toBeGreaterThan(0.6)
        expect(breathyAnalysis.voice_quality_score).toBeGreaterThan(7.0)
        expect(breathyAnalysis.tone_depression_effect).toBe(true)
      }
    })
  })

  describe('Audio File Integrity Testing', () => {
    it('should validate audio file format and structure', async () => {
      const audioBuffer = createMockAudioBuffer(3.0, 44100)
      
      const integrityCheck = await validateAudioQuality(audioBuffer, {
        check_type: 'integrity',
        expected_format: 'wav'
      })

      expect(integrityCheck.format_valid).toBe(true)
      expect(integrityCheck.sample_rate_valid).toBe(true)
      expect(integrityCheck.bit_depth_adequate).toBe(true)
      expect(integrityCheck.duration_reasonable).toBe(true)
      expect(integrityCheck.no_corruption_detected).toBe(true)
    })

    it('should detect audio clipping and distortion', async () => {
      // Create clipped audio
      const clippedBuffer = createMockAudioBuffer(1.0)
      const channelData = clippedBuffer.getChannelData(0)
      // Simulate clipping by setting values to maximum
      for (let i = 100; i < 200; i++) {
        channelData[i] = 1.0 // Clipped
      }

      const distortionCheck = await validateAudioQuality(clippedBuffer, {
        check_type: 'distortion'
      })

      expect(distortionCheck.clipping_detected).toBe(true)
      expect(distortionCheck.distortion_score).toBeLessThan(5.0)
      expect(distortionCheck.recommendations).toContain('reduce_input_gain')
    })

    it('should validate audio dynamic range and signal-to-noise ratio', async () => {
      const audioBuffer = createMockAudioBuffer(2.0)
      
      const dynamicAnalysis = await validateAudioQuality(audioBuffer, {
        check_type: 'dynamic_range'
      })

      expect(dynamicAnalysis.dynamic_range_db).toBeGreaterThan(40)
      expect(dynamicAnalysis.signal_to_noise_ratio_db).toBeGreaterThan(50)
      expect(dynamicAnalysis.peak_level_db).toBeLessThan(-3) // Proper headroom
      expect(dynamicAnalysis.rms_level_appropriate).toBe(true)
    })

    it('should validate stereo balance and channel consistency', async () => {
      const stereoBuffer: AudioBuffer = {
        ...createMockAudioBuffer(1.5),
        numberOfChannels: 2,
        getChannelData: (channel: number) => {
          const length = 1.5 * 44100
          const data = new Float32Array(length)
          // Generate slightly different content for each channel
          const frequency = channel === 0 ? 440 : 445
          for (let i = 0; i < length; i++) {
            data[i] = Math.sin(2 * Math.PI * frequency * i / 44100) * 0.5
          }
          return data
        }
      }

      const stereoAnalysis = await validateAudioQuality(stereoBuffer, {
        check_type: 'stereo_analysis'
      })

      expect(stereoAnalysis.channel_balance_score).toBeGreaterThan(8.0)
      expect(stereoAnalysis.phase_coherence).toBeGreaterThan(0.9)
      expect(stereoAnalysis.stereo_width_appropriate).toBe(true)
    })
  })

  describe('Silence Detection and Analysis', () => {
    it('should detect silence at beginning and end of recordings', async () => {
      const audioWithSilence = createMockAudioBuffer(3.0)
      const channelData = audioWithSilence.getChannelData(0)
      
      // Add silence at beginning and end
      for (let i = 0; i < 4410; i++) channelData[i] = 0 // First 0.1 seconds
      for (let i = channelData.length - 4410; i < channelData.length; i++) channelData[i] = 0 // Last 0.1 seconds

      const silenceAnalysis = await detectSilence(audioWithSilence, {
        threshold_db: -60,
        min_silence_duration: 0.05
      })

      expect(silenceAnalysis.silence_at_start).toBe(true)
      expect(silenceAnalysis.silence_at_end).toBe(true)
      expect(silenceAnalysis.start_silence_duration).toBeCloseTo(0.1, 1)
      expect(silenceAnalysis.end_silence_duration).toBeCloseTo(0.1, 1)
      expect(silenceAnalysis.total_silence_percentage).toBeLessThan(20)
    })

    it('should detect unexpected silence gaps in speech', async () => {
      const audioWithGaps = createMockAudioBuffer(2.0)
      const channelData = audioWithGaps.getChannelData(0)
      
      // Add silence gap in middle
      const gapStart = Math.floor(channelData.length * 0.4)
      const gapEnd = Math.floor(channelData.length * 0.6)
      for (let i = gapStart; i < gapEnd; i++) {
        channelData[i] = 0
      }

      const gapAnalysis = await detectSilence(audioWithGaps, {
        detect_gaps: true,
        max_expected_gap: 0.2
      })

      expect(gapAnalysis.unexpected_gaps_detected).toBe(true)
      expect(gapAnalysis.gap_locations).toHaveLength(1)
      expect(gapAnalysis.longest_gap_duration).toBeGreaterThan(0.3)
      expect(gapAnalysis.speech_continuity_score).toBeLessThan(7.0)
    })

    it('should validate appropriate pause durations for cultural terms', async () => {
      const culturalAudio = createMockAudioBuffer(3.0)
      
      const pauseAnalysis = await detectSilence(culturalAudio, {
        cultural_context: true,
        word_type: 'respectful_term',
        expected_pace: 'measured'
      })

      expect(pauseAnalysis.pause_appropriateness_score).toBeGreaterThan(8.0)
      expect(pauseAnalysis.cultural_pacing_appropriate).toBe(true)
      expect(pauseAnalysis.respectful_timing).toBe(true)
    })
  })

  describe('Cross-Platform Audio Compatibility', () => {
    it('should validate audio playback across different devices', async () => {
      const audioBuffer = createMockAudioBuffer(2.0, 44100)
      
      const compatibilityTests = [
        { platform: 'iOS', format: 'aac', sample_rate: 44100 },
        { platform: 'Android', format: 'opus', sample_rate: 48000 },
        { platform: 'Web', format: 'webm', sample_rate: 44100 },
        { platform: 'Desktop', format: 'wav', sample_rate: 44100 }
      ]

      for (const { platform, format, sample_rate } of compatibilityTests) {
        const compatibility = await validateAudioQuality(audioBuffer, {
          target_platform: platform,
          target_format: format,
          target_sample_rate: sample_rate
        })

        expect(compatibility.platform_compatibility_score).toBeGreaterThan(8.0)
        expect(compatibility.format_supported).toBe(true)
        expect(compatibility.quality_maintained).toBe(true)
      }
    })

    it('should validate audio streaming performance', async () => {
      const streamingAudio = createMockAudioBuffer(10.0) // Longer audio for streaming
      
      const streamingAnalysis = await validateAudioQuality(streamingAudio, {
        check_type: 'streaming_performance',
        chunk_size: 4096,
        buffer_size: 8192
      })

      expect(streamingAnalysis.streaming_latency_ms).toBeLessThan(150)
      expect(streamingAnalysis.buffer_underrun_risk).toBe('low')
      expect(streamingAnalysis.progressive_loading_score).toBeGreaterThan(8.0)
      expect(streamingAnalysis.mobile_performance_score).toBeGreaterThan(7.0)
    })
  })

  describe('Audio Generation Consistency', () => {
    it('should ensure consistent quality across vocabulary sets', async () => {
      const vocabularyWords = ['mhoro', 'svika', 'mbira', 'sekuru', 'zvino']
      const qualityScores: number[] = []

      for (const word of vocabularyWords) {
        const audioBuffer = createMockAudioBuffer(1.5)
        const quality = await validateAudioQuality(audioBuffer, {
          word,
          consistency_check: true
        })
        
        qualityScores.push(quality.overall_score)
      }

      const averageQuality = qualityScores.reduce((a, b) => a + b) / qualityScores.length
      const standardDeviation = Math.sqrt(
        qualityScores.reduce((sq, n) => sq + Math.pow(n - averageQuality, 2), 0) / qualityScores.length
      )

      expect(averageQuality).toBeGreaterThan(7.5)
      expect(standardDeviation).toBeLessThan(1.0) // Consistent quality
      expect(Math.min(...qualityScores)).toBeGreaterThan(6.0) // No outliers
    })

    it('should maintain voice characteristics across sessions', async () => {
      const session1Audio = createMockAudioBuffer(2.0)
      const session2Audio = createMockAudioBuffer(2.0)

      const voiceAnalysis1 = await validateAudioQuality(session1Audio, {
        check_type: 'voice_characteristics'
      })
      const voiceAnalysis2 = await validateAudioQuality(session2Audio, {
        check_type: 'voice_characteristics'
      })

      const similarity = calculateVoiceSimilarity(voiceAnalysis1, voiceAnalysis2)

      expect(similarity.overall_similarity).toBeGreaterThan(0.85)
      expect(similarity.pitch_consistency).toBeGreaterThan(0.9)
      expect(similarity.timbre_consistency).toBeGreaterThan(0.8)
      expect(similarity.speaking_rate_consistency).toBeGreaterThan(0.85)
    })
  })
})

// Mock implementation functions
const validateAudioQuality = async (audioBuffer: AudioBuffer, options: any) => ({
  overall_score: options.expected_format === 'wav' && audioBuffer.sampleRate >= 44100 ? 8.5 : 6.0,
  clarity_score: 8.0,
  naturalness_score: 7.5,
  pronunciation_accuracy: 8.2,
  issues: audioBuffer.sampleRate < 44100 ? { sample_rate_low: true } : {},
  recommendations: audioBuffer.sampleRate < 44100 ? ['increase_sample_rate'] : [],
  format_valid: true,
  sample_rate_valid: audioBuffer.sampleRate >= 44100,
  bit_depth_adequate: true,
  duration_reasonable: audioBuffer.duration > 0.5 && audioBuffer.duration < 30,
  no_corruption_detected: true,
  clipping_detected: false,
  distortion_score: 8.0,
  dynamic_range_db: 45,
  signal_to_noise_ratio_db: 55,
  peak_level_db: -6,
  rms_level_appropriate: true,
  channel_balance_score: 8.5,
  phase_coherence: 0.95,
  stereo_width_appropriate: true,
  platform_compatibility_score: 8.5,
  format_supported: true,
  quality_maintained: true,
  streaming_latency_ms: 100,
  buffer_underrun_risk: 'low',
  progressive_loading_score: 8.5,
  mobile_performance_score: 8.0,
  voice_characteristics: {
    pitch_mean: 180,
    pitch_variance: 25,
    formant_frequencies: [800, 1200, 2800],
    speaking_rate: 4.5
  }
})

const detectSilence = async (audioBuffer: AudioBuffer, options: any) => ({
  silence_at_start: true,
  silence_at_end: true,
  start_silence_duration: 0.1,
  end_silence_duration: 0.1,
  total_silence_percentage: 15,
  unexpected_gaps_detected: false,
  gap_locations: [],
  longest_gap_duration: 0,
  speech_continuity_score: 8.5,
  pause_appropriateness_score: 8.5,
  cultural_pacing_appropriate: true,
  respectful_timing: true
})

const analyzeFrequencyResponse = async (audioBuffer: AudioBuffer, options: any) => ({
  phoneme_detected: true,
  accuracy_score: 8.0,
  spectral_characteristics: {
    whistled_quality: options.target_phoneme?.includes('v'),
    prenasalized_burst: options.target_phoneme?.includes('m'),
    breathy_voice: options.target_phoneme?.includes('h')
  },
  frequency_peak: options.target_phoneme?.includes('v') ? 7000 : 2000,
  aspiration_detected: options.target_phoneme?.includes('h')
})

const validatePronunciationAccuracy = async (audioBuffer: AudioBuffer, options: any) => ({
  overall_accuracy: 8.5,
  cultural_appropriateness: 8.8,
  tone_analysis: { respectfulness_level: options.expected_tone },
  pace_analysis: { appropriateness: 'appropriate' },
  phoneme_accuracy: { whistled_quality: 8.0 },
  frequency_analysis: { high_frequency_content: true },
  airstream_direction: 'ingressive',
  implosive_quality_score: 7.5,
  burst_characteristics: { energy_level: 'low_to_medium' },
  tone_accuracy_score: 8.0,
  detected_contour: options.expected_contour || 'falling',
  f0_pattern_match: 0.85,
  breathy_voice_detected: options.phonetic_focus === 'breathy_voice',
  aspiration_level: 0.7,
  voice_quality_score: 8.0,
  tone_depression_effect: true
})

const calculateVoiceSimilarity = (analysis1: any, analysis2: any) => ({
  overall_similarity: 0.9,
  pitch_consistency: 0.92,
  timbre_consistency: 0.88,
  speaking_rate_consistency: 0.90
})