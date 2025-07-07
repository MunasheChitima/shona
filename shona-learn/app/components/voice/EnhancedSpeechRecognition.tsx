'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { FaMicrophone, FaMicrophoneSlash, FaSpinner } from 'react-icons/fa'

interface EnhancedSpeechRecognitionProps {
  targetPhrase: string
  targetIPA?: string
  tonePattern?: string
  culturalContext?: 'respectful' | 'casual' | 'ceremonial'
  onResult: (result: PronunciationResult) => void
  language?: string
}

interface PronunciationResult {
  transcript: string
  overallScore: number
  breakdownScores: {
    pronunciation: number
    toneAccuracy: number
    specialSounds: number
    culturalAppropriateness: number
  }
  detectedTones?: string
  specialSoundsDetected: string[]
  feedback: string[]
  audioAnalysis?: AudioAnalysisData
}

interface AudioAnalysisData {
  pitchContour: number[]
  formants: number[][]
  spectralCentroid: number[]
  duration: number
}

export default function EnhancedSpeechRecognition({ 
  targetPhrase, 
  targetIPA,
  tonePattern,
  culturalContext = 'casual',
  onResult, 
  language = 'en-US' 
}: EnhancedSpeechRecognitionProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysisData | null>(null)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser')
    }
  }, [])

  const initializeAudioAnalysis = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      analyserRef.current = audioContextRef.current.createAnalyser()
      
      analyserRef.current.fftSize = 4096
      analyserRef.current.minDecibels = -90
      analyserRef.current.maxDecibels = -10
      
      source.connect(analyserRef.current)
      
      return true
    } catch (error) {
      console.error('Error initializing audio analysis:', error)
      return false
    }
  }, [])

  const analyzeAudio = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return null
    
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    const freqArray = new Float32Array(bufferLength)
    
    analyserRef.current.getByteFrequencyData(dataArray)
    analyserRef.current.getFloatFrequencyData(freqArray)
    
    // Calculate pitch using autocorrelation
    const pitch = detectPitch(dataArray, audioContextRef.current.sampleRate)
    
    // Calculate formants (simplified)
    const formants = detectFormants(freqArray, audioContextRef.current.sampleRate)
    
    // Calculate spectral centroid
    const spectralCentroid = calculateSpectralCentroid(freqArray)
    
    return {
      pitch,
      formants,
      spectralCentroid,
      timestamp: audioContextRef.current.currentTime
    }
  }, [])

  const startListening = useCallback(async () => {
    const audioInitialized = await initializeAudioAnalysis()
    if (!audioInitialized) {
      setError('Could not access microphone for advanced analysis')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = language
    recognition.maxAlternatives = 3

    const pitchData: number[] = []
    const formantData: number[][] = []
    const spectralData: number[] = []
    let startTime = 0
    let analysisInterval: NodeJS.Timeout | null = null

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      setTranscript('')
      startTime = Date.now()
      
      // Start audio analysis
      analysisInterval = setInterval(() => {
        const analysis = analyzeAudio()
        if (analysis) {
          pitchData.push(analysis.pitch)
          formantData.push(analysis.formants)
          spectralData.push(analysis.spectralCentroid)
        }
      }, 50) // Analyze every 50ms
    }

    recognition.onresult = (event) => {
      const current = event.resultIndex
      const result = event.results[current]
      const primaryTranscript = result[0].transcript
      const primaryConfidence = result[0].confidence || 0.9

      setTranscript(primaryTranscript)
      setConfidence(primaryConfidence)

      if (result.isFinal) {
        const endTime = Date.now()
        const duration = (endTime - startTime) / 1000
        
        const audioAnalysisData: AudioAnalysisData = {
          pitchContour: pitchData,
          formants: formantData,
          spectralCentroid: spectralData,
          duration
        }
        
        setAudioAnalysis(audioAnalysisData)
        
        // Enhanced pronunciation scoring
        const pronunciationResult = calculateEnhancedPronunciationScore(
          primaryTranscript,
          targetPhrase,
          targetIPA,
          tonePattern,
          culturalContext,
          primaryConfidence,
          audioAnalysisData
        )
        
        onResult(pronunciationResult)
      }
    }

    recognition.onerror = (event) => {
      setError(`Error: ${event.error}`)
      setIsListening(false)
      cleanup()
    }

    recognition.onend = () => {
      setIsListening(false)
      cleanup()
    }

    const cleanup = () => {
      if (analysisInterval) {
        clearInterval(analysisInterval)
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }

    recognition.start()
  }, [language, targetPhrase, targetIPA, tonePattern, culturalContext, onResult, initializeAudioAnalysis, analyzeAudio])

  const calculateEnhancedPronunciationScore = (
    spoken: string,
    target: string,
    targetIPA?: string,
    tonePattern?: string,
    culturalContext?: string,
    confidence?: number,
    audioData?: AudioAnalysisData
  ): PronunciationResult => {
    const spokenNorm = spoken.toLowerCase().trim()
    const targetNorm = target.toLowerCase().trim()

    // 1. Basic pronunciation similarity (Levenshtein + IPA)
    const basicScore = calculateBasicScore(spokenNorm, targetNorm, targetIPA)
    
    // 2. Tone pattern accuracy
    const toneScore = calculateToneScore(audioData?.pitchContour || [], tonePattern || '')
    
    // 3. Special sound cluster recognition
    const specialSoundsResult = analyzeSpecialSounds(spokenNorm, targetNorm, audioData)
    
    // 4. Cultural appropriateness
    const culturalScore = assessCulturalAppropriateness(
      target, 
      audioData?.pitchContour || [], 
      culturalContext || 'casual'
    )

    // Overall weighted score
    const overallScore = Math.round(
      (basicScore * 0.4) + 
      (toneScore.score * 0.3) + 
      (specialSoundsResult.score * 0.2) + 
      (culturalScore.score * 0.1)
    )

    const feedback: string[] = []
    
    if (basicScore < 70) feedback.push("Focus on clearer pronunciation of individual sounds")
    if (toneScore.score < 70) feedback.push(toneScore.feedback)
    if (specialSoundsResult.score < 70) feedback.push(specialSoundsResult.feedback)
    if (culturalScore.score < 70) feedback.push(culturalScore.feedback)
    if (overallScore >= 90) feedback.push("Excellent pronunciation! 🎉")
    else if (overallScore >= 80) feedback.push("Very good! Keep practicing to perfect it 👏")

    return {
      transcript: spoken,
      overallScore,
      breakdownScores: {
        pronunciation: basicScore,
        toneAccuracy: toneScore.score,
        specialSounds: specialSoundsResult.score,
        culturalAppropriateness: culturalScore.score
      },
      detectedTones: toneScore.detectedPattern,
      specialSoundsDetected: specialSoundsResult.detected,
      feedback,
      audioAnalysis: audioData
    }
  }

  // Helper functions for analysis
  const calculateBasicScore = (spoken: string, target: string, targetIPA?: string): number => {
    if (spoken === target) return 100
    
    const distance = levenshteinDistance(spoken, target)
    const maxLen = Math.max(spoken.length, target.length)
    let similarity = 1 - (distance / maxLen)
    
    // Boost score if IPA analysis shows good phoneme matching
    if (targetIPA) {
      const phonemeMatch = comparePhonemes(spoken, targetIPA)
      similarity = (similarity + phonemeMatch) / 2
    }
    
    return Math.round(similarity * 100)
  }

  const calculateToneScore = (pitchContour: number[], expectedPattern: string): {
    score: number
    detectedPattern: string
    feedback: string
  } => {
    if (!pitchContour.length || !expectedPattern) {
      return { score: 100, detectedPattern: '', feedback: '' }
    }

    const detectedPattern = extractTonePattern(pitchContour)
    const accuracy = compareTonePatterns(detectedPattern, expectedPattern)
    
    let feedback = ''
    if (accuracy < 0.7) {
      feedback = `Tone pattern needs work. Expected: ${expectedPattern}, detected: ${detectedPattern}`
    }

    return {
      score: Math.round(accuracy * 100),
      detectedPattern,
      feedback
    }
  }

  const analyzeSpecialSounds = (spoken: string, target: string, audioData?: AudioAnalysisData): {
    score: number
    detected: string[]
    feedback: string
  } => {
    const specialSounds = ['sv', 'zv', 'mb', 'nd', 'ng', 'pf', 'bv']
    const targetSpecials = specialSounds.filter(sound => target.includes(sound))
    const detectedSpecials: string[] = []
    
    if (!targetSpecials.length) {
      return { score: 100, detected: [], feedback: '' }
    }

    let correctCount = 0
    for (const sound of targetSpecials) {
      if (isSpecialSoundCorrect(sound, spoken, audioData)) {
        detectedSpecials.push(sound)
        correctCount++
      }
    }

    const score = (correctCount / targetSpecials.length) * 100
    let feedback = ''
    
    if (score < 70) {
      const missed = targetSpecials.filter(s => !detectedSpecials.includes(s))
      feedback = `Practice these special sounds: ${missed.join(', ')}`
    }

    return { score: Math.round(score), detected: detectedSpecials, feedback }
  }

  const assessCulturalAppropriateness = (
    word: string, 
    pitchContour: number[], 
    context: string
  ): { score: number; feedback: string } => {
    const respectfulWords = ['sekuru', 'ambuya', 'mukoma', 'mainini']
    const isRespectfulWord = respectfulWords.some(w => word.includes(w))
    
    if (!isRespectfulWord || context === 'casual') {
      return { score: 100, feedback: '' }
    }

    const hasRespectfulTone = checkRespectfulTone(pitchContour)
    const score = hasRespectfulTone ? 100 : 70
    const feedback = hasRespectfulTone ? '' : 'Try using a more respectful tone for elder terms'

    return { score, feedback }
  }

  // Audio analysis helper functions
  const detectPitch = (audioData: Uint8Array, sampleRate: number): number => {
    // Simplified pitch detection using peak finding
    const bufferLength = audioData.length
    let maxIndex = 0
    let maxValue = 0
    
    for (let i = 0; i < bufferLength; i++) {
      if (audioData[i] > maxValue) {
        maxValue = audioData[i]
        maxIndex = i
      }
    }
    
    return (maxIndex * sampleRate) / (bufferLength * 2)
  }

  const detectFormants = (freqData: Float32Array, sampleRate: number): number[] => {
    // Simplified formant detection - find first 3 peaks
    const formants: number[] = []
    const peaks = findPeaks(freqData, 3)
    
    for (const peak of peaks) {
      formants.push((peak * sampleRate) / (freqData.length * 2))
    }
    
    return formants
  }

  const calculateSpectralCentroid = (freqData: Float32Array): number => {
    let weightedSum = 0
    let magnitudeSum = 0
    
    for (let i = 0; i < freqData.length; i++) {
      const magnitude = Math.abs(freqData[i])
      weightedSum += i * magnitude
      magnitudeSum += magnitude
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0
  }

  const findPeaks = (data: Float32Array, numPeaks: number): number[] => {
    const peaks: { index: number; value: number }[] = []
    
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > data[i - 1] && data[i] > data[i + 1]) {
        peaks.push({ index: i, value: data[i] })
      }
    }
    
    return peaks
      .sort((a, b) => b.value - a.value)
      .slice(0, numPeaks)
      .map(p => p.index)
  }

  const extractTonePattern = (pitchContour: number[]): string => {
    if (pitchContour.length < 10) return ''
    
    const smoothed = smoothPitchContour(pitchContour)
    const segments = segmentBySyllables(smoothed)
    
    return segments.map(segment => {
      const start = segment[0]
      const end = segment[segment.length - 1]
      const diff = end - start
      
      if (diff > 20) return 'R' // Rising
      if (diff < -20) return 'F' // Falling
      if (start > averagePitch(pitchContour)) return 'H' // High
      return 'L' // Low
    }).join('')
  }

  const smoothPitchContour = (contour: number[]): number[] => {
    const smoothed: number[] = []
    const windowSize = 3
    
    for (let i = 0; i < contour.length; i++) {
      let sum = 0
      let count = 0
      
      for (let j = Math.max(0, i - windowSize); j <= Math.min(contour.length - 1, i + windowSize); j++) {
        sum += contour[j]
        count++
      }
      
      smoothed.push(sum / count)
    }
    
    return smoothed
  }

  const segmentBySyllables = (pitchContour: number[]): number[][] => {
    // Simplified syllable segmentation based on pitch changes
    const segments: number[][] = []
    const segmentSize = Math.floor(pitchContour.length / 3) // Assume 3 syllables max
    
    for (let i = 0; i < pitchContour.length; i += segmentSize) {
      segments.push(pitchContour.slice(i, i + segmentSize))
    }
    
    return segments.filter(seg => seg.length > 0)
  }

  const compareTonePatterns = (detected: string, expected: string): number => {
    if (!detected || !expected) return 1
    if (detected === expected) return 1
    
    const minLength = Math.min(detected.length, expected.length)
    let matches = 0
    
    for (let i = 0; i < minLength; i++) {
      if (detected[i] === expected[i]) matches++
    }
    
    return matches / Math.max(detected.length, expected.length)
  }

  const averagePitch = (pitchContour: number[]): number => {
    return pitchContour.reduce((sum, pitch) => sum + pitch, 0) / pitchContour.length
  }

  const isSpecialSoundCorrect = (sound: string, spoken: string, audioData?: AudioAnalysisData): boolean => {
    // Check if the word contains the special sound
    if (!spoken.includes(sound)) return false
    
    // For whistled sounds (sv, zv), check spectral centroid
    if (['sv', 'zv'].includes(sound) && audioData?.spectralCentroid) {
      const avgCentroid = audioData.spectralCentroid.reduce((sum, c) => sum + c, 0) / audioData.spectralCentroid.length
      return avgCentroid > 5000 // High frequency content indicates whistling
    }
    
    // For prenasalized sounds (mb, nd, ng), check for duration patterns
    if (['mb', 'nd', 'ng'].includes(sound) && audioData?.duration) {
      // Prenasalized sounds typically take longer
      return audioData.duration > 0.8
    }
    
    return true // Default to true if we can't analyze acoustically
  }

  const checkRespectfulTone = (pitchContour: number[]): boolean => {
    if (!pitchContour.length) return true
    
    const avgPitch = averagePitch(pitchContour)
    const startPitch = pitchContour[0]
    const endPitch = pitchContour[pitchContour.length - 1]
    
    // Respectful tone typically starts lower and has gentle contour
    return startPitch <= avgPitch && Math.abs(endPitch - startPitch) < 50
  }

  const comparePhonemes = (spoken: string, targetIPA: string): number => {
    // Simplified phoneme comparison - would integrate with more sophisticated IPA analysis
    const spokenPhonemes = convertToPhonemes(spoken)
    const targetPhonemes = parseIPA(targetIPA)
    
    const distance = levenshteinDistance(spokenPhonemes, targetPhonemes)
    const maxLen = Math.max(spokenPhonemes.length, targetPhonemes.length)
    
    return 1 - (distance / maxLen)
  }

  const convertToPhonemes = (word: string): string => {
    // Simplified conversion - would use proper phoneme mapping
    return word.toLowerCase()
  }

  const parseIPA = (ipa: string): string => {
    // Remove IPA notation characters for comparison
    return ipa.replace(/[\/\[\]]/g, '')
  }

  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = []

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[b.length][a.length]
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={startListening}
        disabled={isListening || !!error}
        className={`
          p-6 rounded-full transition-all transform
          ${isListening 
            ? 'bg-red-500 scale-110 animate-pulse' 
            : 'bg-blue-500 hover:bg-blue-600 hover:scale-105'
          }
          ${error ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {isListening ? (
          <FaMicrophone className="text-white text-3xl" />
        ) : (
          <FaMicrophoneSlash className="text-white text-3xl" />
        )}
      </button>

      {isListening && (
        <div className="flex items-center space-x-2">
          <FaSpinner className="animate-spin text-blue-500" />
          <span className="text-gray-600">Analyzing pronunciation...</span>
        </div>
      )}

      {transcript && (
        <div className="bg-gray-100 rounded-lg p-4 max-w-md">
          <p className="text-center text-lg">{transcript}</p>
          <div className="mt-2 flex justify-center">
            <div className="text-sm text-gray-500">
              Confidence: {Math.round(confidence * 100)}%
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  )
}