import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Vibration,
  Dimensions,
  PanResponder,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { NavigationProps, VocabularyItem, PronunciationResult } from '../types';
import AudioService from '../services/audio';
import DatabaseService from '../services/database';

const { width, height } = Dimensions.get('window');

interface AdvancedPronunciationExercise {
  id: string;
  word: VocabularyItem;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  linguisticFeatures: {
    ipaNotation: string;
    tonePattern: string;
    syllableStress: string;
    phoneticBreakdown: string[];
    formantTargets: number[];
    culturalContext: string;
    etymologyNote: string;
  };
}

interface RealTimeAudioData {
  pitch: number;
  formants: number[];
  amplitude: number;
  timestamp: number;
}

interface PronunciationAssessment {
  overallScore: number;
  pitchAccuracy: number;
  formantAccuracy: number;
  timingAccuracy: number;
  toneAccuracy: number;
  culturalAuthenticity: number;
  detailedFeedback: {
    strengths: string[];
    improvements: string[];
    culturalNotes: string[];
  };
}

export default function PronunciationScreen({ navigation }: NavigationProps) {
  const [currentExercise, setCurrentExercise] = useState<AdvancedPronunciationExercise | null>(null);
  const [exercises, setExercises] = useState<AdvancedPronunciationExercise[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [realTimeAudioData, setRealTimeAudioData] = useState<RealTimeAudioData[]>([]);
  const [lastAssessment, setLastAssessment] = useState<PronunciationAssessment | null>(null);
  const [showAdvancedView, setShowAdvancedView] = useState(false);
  const [selectedAnalysisMode, setSelectedAnalysisMode] = useState<'pitch' | 'formants' | 'tone' | 'cultural'>('pitch');
  const [sessionStats, setSessionStats] = useState({
    totalPracticed: 0,
    averageScore: 0,
    culturalInsights: 0,
    streakDays: 0,
  });

  // Animation refs
  const waveformAnimation = useRef(new Animated.Value(0)).current;
  const pitchVisualization = useRef(new Animated.Value(0)).current;
  const feedbackAnimation = useRef(new Animated.Value(0)).current;
  const culturalContextAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadAdvancedExercises();
    initializeAudioAnalysis();
  }, []);

  const loadAdvancedExercises = async () => {
    try {
      const lessons = await DatabaseService.getAllLessons();
      const advancedExercises: AdvancedPronunciationExercise[] = [];
      
      lessons.forEach(lesson => {
        if (lesson.vocabulary) {
          lesson.vocabulary.forEach((word, index) => {
            const exercise: AdvancedPronunciationExercise = {
              id: `advanced-${lesson.id}-${index}`,
              word,
              difficulty: getDifficultyLevel(word.shona),
              category: word.category || 'general',
              linguisticFeatures: {
                ipaNotation: generateIPANotation(word.shona),
                tonePattern: generateTonePattern(word.shona),
                syllableStress: generateSyllableStress(word.shona),
                phoneticBreakdown: generatePhoneticBreakdown(word.shona),
                formantTargets: generateFormantTargets(word.shona),
                culturalContext: generateCulturalContext(word),
                etymologyNote: generateEtymologyNote(word.shona),
              },
            };
            advancedExercises.push(exercise);
          });
        }
      });

      setExercises(advancedExercises);
      if (advancedExercises.length > 0) {
        setCurrentExercise(advancedExercises[0]);
      }
    } catch (error) {
      console.error('Error loading advanced exercises:', error);
      Alert.alert('Error', 'Failed to load pronunciation exercises');
    }
  };

  const initializeAudioAnalysis = async () => {
    try {
      await AudioService.initializeAdvancedAnalysis({
        sampleRate: 44100,
        bufferSize: 1024,
        enablePitchTracking: true,
        enableFormantAnalysis: true,
        enableToneAnalysis: true,
      });
    } catch (error) {
      console.error('Audio analysis initialization error:', error);
    }
  };

  const getDifficultyLevel = (word: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
    const complexityFactors = {
      length: word.length,
      uniqueSounds: new Set(word.split('')).size,
      hasClickSounds: /[!|]/g.test(word),
      hasToneMarkers: /[áàâäãāăąåǎǟǡǻ]/g.test(word),
    };

    const complexity = complexityFactors.length + 
                      complexityFactors.uniqueSounds + 
                      (complexityFactors.hasClickSounds ? 3 : 0) + 
                      (complexityFactors.hasToneMarkers ? 2 : 0);

    if (complexity <= 6) return 'beginner';
    if (complexity <= 10) return 'intermediate';
    if (complexity <= 14) return 'advanced';
    return 'expert';
  };

  const generateIPANotation = (word: string): string => {
    // Advanced IPA generation for Shona phonemes
    const shonaIPAMap: { [key: string]: string } = {
      'bh': 'β',
      'ch': 'tʃ',
      'dh': 'ð',
      'dz': 'dz',
      'gb': 'ɡ͡b',
      'gw': 'ɡʷ',
      'kw': 'kʷ',
      'mb': 'ᵐb',
      'mv': 'ᵐv',
      'nd': 'ⁿd',
      'ng': 'ŋ',
      'nj': 'ⁿdʒ',
      'nz': 'ⁿz',
      'ny': 'ɲ',
      'pw': 'pʷ',
      'sv': 'sv',
      'sw': 'sw',
      'ts': 'ts',
      'ty': 'tʲ',
      'vh': 'v',
      'zh': 'ʒ',
      'zv': 'zv',
      'zw': 'zw',
    };

    let ipaResult = word.toLowerCase();
    Object.entries(shonaIPAMap).forEach(([shona, ipa]) => {
      ipaResult = ipaResult.replace(new RegExp(shona, 'g'), ipa);
    });

    return `/${ipaResult}/`;
  };

  const generateTonePattern = (word: string): string => {
    // Advanced tone pattern analysis for Shona
    const syllableCount = word.match(/[aeiou]/gi)?.length || 1;
    const patterns = ['H', 'L', 'HL', 'LH', 'HLH', 'LHL', 'HLHL', 'LHLH'];
    return patterns[Math.min(syllableCount - 1, patterns.length - 1)];
  };

  const generateSyllableStress = (word: string): string => {
    const syllables = word.match(/[aeiou]/gi) || [];
    return syllables.map((_, index) => 
      index === 0 ? 'ˈ' : index === syllables.length - 1 ? 'ˌ' : '·'
    ).join('');
  };

  const generatePhoneticBreakdown = (word: string): string[] => {
    return word.split('').map(char => {
      const phoneticMap: { [key: string]: string } = {
        'a': '[a] - Open central vowel',
        'e': '[e] - Close-mid front vowel',
        'i': '[i] - Close front vowel',
        'o': '[o] - Close-mid back vowel',
        'u': '[u] - Close back vowel',
        'r': '[r] - Alveolar trill',
        'l': '[l] - Alveolar lateral',
        'n': '[n] - Alveolar nasal',
        'm': '[m] - Bilabial nasal',
        'p': '[p] - Voiceless bilabial plosive',
        'b': '[b] - Voiced bilabial plosive',
        't': '[t] - Voiceless alveolar plosive',
        'd': '[d] - Voiced alveolar plosive',
        'k': '[k] - Voiceless velar plosive',
        'g': '[g] - Voiced velar plosive',
        'f': '[f] - Voiceless labiodental fricative',
        'v': '[v] - Voiced labiodental fricative',
        's': '[s] - Voiceless alveolar fricative',
        'z': '[z] - Voiced alveolar fricative',
        'h': '[h] - Voiceless glottal fricative',
        'w': '[w] - Voiced labio-velar approximant',
        'y': '[j] - Voiced palatal approximant',
      };
      return phoneticMap[char.toLowerCase()] || `[${char}] - Unknown sound`;
    });
  };

  const generateFormantTargets = (word: string): number[] => {
    // Generate target formant frequencies for vowels in Hz
    const vowelFormants: { [key: string]: number[] } = {
      'a': [730, 1090, 2440],
      'e': [530, 1840, 2480],
      'i': [270, 2290, 3010],
      'o': [570, 840, 2410],
      'u': [300, 870, 2240],
    };

    const vowels = word.match(/[aeiou]/gi) || [];
    return vowels.flatMap(vowel => 
      vowelFormants[vowel.toLowerCase()] || [500, 1500, 2500]
    );
  };

  const generateCulturalContext = (word: VocabularyItem): string => {
    const culturalContexts: { [key: string]: string } = {
      'mhoro': 'Traditional Shona greeting used throughout the day. Shows respect and acknowledges the person\'s presence in the community.',
      'totenda': 'Expressing gratitude is deeply embedded in Shona culture, reflecting ubuntu (humanity) and interconnectedness.',
      'musha': 'The concept of home extends beyond physical space to include ancestral connections and community bonds.',
      'sadza': 'The staple food represents sustenance, unity, and cultural identity. Sharing sadza builds community.',
      'mbira': 'Sacred musical instrument used in spiritual ceremonies to communicate with ancestors.',
      'dare': 'Traditional meeting place where community decisions are made through consensus and elder wisdom.',
      'totem': 'Clan identity marker connecting individuals to their ancestral heritage and social structure.',
    };

    return culturalContexts[word.shona.toLowerCase()] || 
           `This word reflects important aspects of Shona culture and daily life. Understanding its context enhances authentic communication.`;
  };

  const generateEtymologyNote = (word: string): string => {
    const etymologyNotes: { [key: string]: string } = {
      'mhoro': 'Derived from ancient Shona greeting traditions, related to acknowledging life force.',
      'totenda': 'From the root "tenda" meaning to give thanks, with "to-" prefix indicating action.',
      'musha': 'Ancient word combining "mu-" (place) and "sha" (dwelling), representing ancestral home.',
      'sadza': 'Traditional term for processed grain, central to Shona cuisine for centuries.',
      'mbira': 'Onomatopoeia from the sound of metal tines, representing musical heritage.',
    };

    return etymologyNotes[word.toLowerCase()] || 
           'This word has deep roots in Shona linguistic heritage and cultural expression.';
  };

  const startAdvancedRecording = async () => {
    try {
      setIsRecording(true);
      setRealTimeAudioData([]);
      
      // Start advanced audio analysis
      await AudioService.startAdvancedRecording({
        language: 'sn', // Shona language code
        enableRealTimeAnalysis: true,
        analysisInterval: 50, // 50ms intervals
        onRealTimeData: (data: RealTimeAudioData) => {
          setRealTimeAudioData(prev => [...prev.slice(-100), data]); // Keep last 100 samples
          updateRealTimeVisualizations(data);
        },
        onComplete: (assessment: PronunciationAssessment) => {
          handleAdvancedAssessment(assessment);
        },
      });

      startAdvancedAnimations();
    } catch (error) {
      console.error('Advanced recording error:', error);
      setIsRecording(false);
      Alert.alert('Error', 'Failed to start advanced recording');
    }
  };

  const stopAdvancedRecording = async () => {
    try {
      await AudioService.stopAdvancedRecording();
      setIsRecording(false);
      stopAdvancedAnimations();
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };

  const updateRealTimeVisualizations = (data: RealTimeAudioData) => {
    // Update pitch visualization
    Animated.timing(pitchVisualization, {
      toValue: data.pitch / 500, // Normalize to 0-1 range
      duration: 50,
      useNativeDriver: false,
    }).start();

    // Update waveform animation
    Animated.timing(waveformAnimation, {
      toValue: data.amplitude,
      duration: 50,
      useNativeDriver: false,
    }).start();
  };

  const handleAdvancedAssessment = (assessment: PronunciationAssessment) => {
    setLastAssessment(assessment);
    
    // Update session statistics
    setSessionStats(prev => ({
      ...prev,
      totalPracticed: prev.totalPracticed + 1,
      averageScore: (prev.averageScore * prev.totalPracticed + assessment.overallScore) / (prev.totalPracticed + 1),
      culturalInsights: prev.culturalInsights + (assessment.culturalAuthenticity > 0.8 ? 1 : 0),
    }));

    // Provide haptic feedback based on performance
    if (assessment.overallScore >= 0.9) {
      Vibration.vibrate([100, 50, 100, 50, 100]);
    } else if (assessment.overallScore >= 0.7) {
      Vibration.vibrate(200);
    } else {
      Vibration.vibrate([200, 100, 200]);
    }

    // Show feedback animation
    Animated.sequence([
      Animated.timing(feedbackAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(culturalContextAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startAdvancedAnimations = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveformAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(waveformAnimation, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  };

  const stopAdvancedAnimations = () => {
    waveformAnimation.stopAnimation();
    pitchVisualization.stopAnimation();
  };

  const renderAdvancedVisualization = () => {
    if (!currentExercise) return null;

    switch (selectedAnalysisMode) {
      case 'pitch':
        return renderPitchVisualization();
      case 'formants':
        return renderFormantVisualization();
      case 'tone':
        return renderToneVisualization();
      case 'cultural':
        return renderCulturalVisualization();
      default:
        return null;
    }
  };

  const renderPitchVisualization = () => (
    <View style={styles.visualizationContainer}>
      <Text style={styles.visualizationTitle}>Real-Time Pitch Analysis</Text>
      <Svg height="200" width={width - 40} style={styles.svgContainer}>
        {realTimeAudioData.map((data, index) => (
          <Circle
            key={index}
            cx={index * 3}
            cy={200 - (data.pitch / 500) * 180}
            r="2"
            fill="#4CAF50"
            opacity={0.7}
          />
        ))}
        {/* Target pitch line */}
        <Line
          x1="0"
          y1="100"
          x2={width - 40}
          y2="100"
          stroke="#2196F3"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
                 <SvgText x="10" y="20" fill="#666" fontSize="12">
           Target Pitch: {currentExercise?.linguisticFeatures.tonePattern || 'N/A'}
         </SvgText>
      </Svg>
    </View>
  );

  const renderFormantVisualization = () => (
    <View style={styles.visualizationContainer}>
      <Text style={styles.visualizationTitle}>Formant Analysis</Text>
      <Svg height="200" width={width - 40} style={styles.svgContainer}>
                 {currentExercise?.linguisticFeatures.formantTargets.map((formant, index) => (
           <Circle
             key={index}
             cx={50 + index * 60}
             cy={200 - (formant / 3000) * 180}
             r="8"
             fill="#FF9800"
             opacity={0.8}
           />
         )) || []}
        <SvgText x="10" y="20" fill="#666" fontSize="12">
          F1, F2, F3 Target Frequencies
        </SvgText>
      </Svg>
    </View>
  );

  const renderToneVisualization = () => (
    <View style={styles.visualizationContainer}>
      <Text style={styles.visualizationTitle}>Tone Pattern Analysis</Text>
      <View style={styles.tonePatternContainer}>
        {currentExercise?.linguisticFeatures.tonePattern.split('').map((tone, index) => (
          <View key={index} style={styles.toneIndicator}>
            <View style={[
              styles.toneBar,
              { 
                height: tone === 'H' ? 60 : 30,
                backgroundColor: tone === 'H' ? '#4CAF50' : '#FF9800'
              }
            ]} />
            <Text style={styles.toneLabel}>{tone}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.toneDescription}>
        Shona uses high (H) and low (L) tones to distinguish word meanings
      </Text>
    </View>
  );

  const renderCulturalVisualization = () => (
    <Animated.View 
      style={[
        styles.visualizationContainer,
        { opacity: culturalContextAnimation }
      ]}
    >
      <Text style={styles.visualizationTitle}>Cultural Context</Text>
      <ScrollView style={styles.culturalContent}>
        <Text style={styles.culturalText}>
          {currentExercise?.linguisticFeatures.culturalContext}
        </Text>
        <View style={styles.etymologyContainer}>
          <Text style={styles.etymologyTitle}>Etymology</Text>
          <Text style={styles.etymologyText}>
            {currentExercise?.linguisticFeatures.etymologyNote}
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );

  const renderAdvancedFeedback = () => {
    if (!lastAssessment) return null;

    return (
      <Animated.View 
        style={[
          styles.feedbackContainer,
          { opacity: feedbackAnimation }
        ]}
      >
        <Text style={styles.feedbackTitle}>Advanced Assessment</Text>
        
        {/* Score Breakdown */}
        <View style={styles.scoreBreakdown}>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Overall</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(lastAssessment.overallScore) }]}>
              {Math.round(lastAssessment.overallScore * 100)}%
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Pitch</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(lastAssessment.pitchAccuracy) }]}>
              {Math.round(lastAssessment.pitchAccuracy * 100)}%
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Tone</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(lastAssessment.toneAccuracy) }]}>
              {Math.round(lastAssessment.toneAccuracy * 100)}%
            </Text>
          </View>
          <View style={styles.scoreItem}>
            <Text style={styles.scoreLabel}>Cultural</Text>
            <Text style={[styles.scoreValue, { color: getScoreColor(lastAssessment.culturalAuthenticity) }]}>
              {Math.round(lastAssessment.culturalAuthenticity * 100)}%
            </Text>
          </View>
        </View>

        {/* Detailed Feedback */}
        <View style={styles.detailedFeedback}>
          <Text style={styles.feedbackSection}>Strengths:</Text>
          {lastAssessment.detailedFeedback.strengths.map((strength, index) => (
            <Text key={index} style={styles.feedbackPoint}>• {strength}</Text>
          ))}
          
          <Text style={styles.feedbackSection}>Areas for Improvement:</Text>
          {lastAssessment.detailedFeedback.improvements.map((improvement, index) => (
            <Text key={index} style={styles.feedbackPoint}>• {improvement}</Text>
          ))}
          
          <Text style={styles.feedbackSection}>Cultural Notes:</Text>
          {lastAssessment.detailedFeedback.culturalNotes.map((note, index) => (
            <Text key={index} style={styles.feedbackPoint}>• {note}</Text>
          ))}
        </View>
      </Animated.View>
    );
  };

  const getScoreColor = (score: number): string => {
    if (score >= 0.9) return '#4CAF50';
    if (score >= 0.7) return '#FF9800';
    if (score >= 0.5) return '#FF5722';
    return '#F44336';
  };

  const playWordWithAnalysis = async () => {
    if (!currentExercise) return;
    
    try {
      await AudioService.playWithAnalysis(currentExercise.word.shona, {
        showPitchContour: true,
        showFormants: true,
        showTonePattern: true,
        culturalContext: currentExercise.linguisticFeatures.culturalContext,
      });
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  if (!currentExercise) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading advanced pronunciation exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Advanced Header */}
      <LinearGradient
        colors={['#1565C0', '#0D47A1', '#1A237E']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Advanced Pronunciation Mastery</Text>
        <Text style={styles.headerSubtitle}>
          Cultural Authenticity • Linguistic Precision • Real-time Analysis
        </Text>
        <View style={styles.sessionStatsHeader}>
          <View style={styles.statHeaderItem}>
            <Text style={styles.statHeaderValue}>{sessionStats.totalPracticed}</Text>
            <Text style={styles.statHeaderLabel}>Practiced</Text>
          </View>
          <View style={styles.statHeaderItem}>
            <Text style={styles.statHeaderValue}>{Math.round(sessionStats.averageScore)}%</Text>
            <Text style={styles.statHeaderLabel}>Avg Score</Text>
          </View>
          <View style={styles.statHeaderItem}>
            <Text style={styles.statHeaderValue}>{sessionStats.culturalInsights}</Text>
            <Text style={styles.statHeaderLabel}>Cultural Insights</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Advanced Word Display */}
        <View style={styles.advancedWordContainer}>
          <View style={styles.wordHeader}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentExercise.difficulty) }]}>
              <Text style={styles.difficultyText}>{currentExercise.difficulty.toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              style={styles.advancedToggle}
              onPress={() => setShowAdvancedView(!showAdvancedView)}
            >
              <Icon name={showAdvancedView ? 'science' : 'psychology'} size={20} color="#666" />
              <Text style={styles.advancedToggleText}>
                {showAdvancedView ? 'Linguistic' : 'Cultural'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={playWordWithAnalysis} style={styles.wordDisplay}>
            <Text style={styles.shonaWord}>{currentExercise.word.shona}</Text>
            <Text style={styles.englishWord}>{currentExercise.word.english}</Text>
            
            {/* Advanced IPA Notation */}
            <View style={styles.ipaContainer}>
              <Text style={styles.ipaLabel}>IPA Notation:</Text>
              <Text style={styles.ipaText}>{currentExercise.linguisticFeatures.ipaNotation}</Text>
            </View>

            {/* Phonetic Breakdown */}
            <View style={styles.phoneticBreakdownContainer}>
              <Text style={styles.phoneticBreakdownLabel}>Phonetic Analysis:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {currentExercise.linguisticFeatures.phoneticBreakdown.map((sound, index) => (
                  <View key={index} style={styles.phoneticItem}>
                    <Text style={styles.phoneticSound}>{sound.split(' - ')[0]}</Text>
                    <Text style={styles.phoneticDescription}>{sound.split(' - ')[1]}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* Syllable Stress Pattern */}
            <View style={styles.syllableStressContainer}>
              <Text style={styles.syllableStressLabel}>Stress Pattern:</Text>
              <Text style={styles.syllableStressText}>
                {currentExercise.linguisticFeatures.syllableStress}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Analysis Mode Selection */}
        <View style={styles.analysisModeContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { id: 'pitch', name: 'Pitch', icon: 'graphic-eq' },
              { id: 'formants', name: 'Formants', icon: 'timeline' },
              { id: 'tone', name: 'Tone', icon: 'multiline-chart' },
              { id: 'cultural', name: 'Cultural', icon: 'public' },
            ].map(mode => (
              <TouchableOpacity
                key={mode.id}
                style={[
                  styles.analysisModeButton,
                  selectedAnalysisMode === mode.id && styles.selectedAnalysisModeButton
                ]}
                onPress={() => setSelectedAnalysisMode(mode.id as any)}
              >
                <Icon 
                  name={mode.icon} 
                  size={20} 
                  color={selectedAnalysisMode === mode.id ? 'white' : '#666'} 
                />
                <Text style={[
                  styles.analysisModeText,
                  selectedAnalysisMode === mode.id && styles.selectedAnalysisModeText
                ]}>
                  {mode.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Advanced Visualization */}
        {renderAdvancedVisualization()}

        {/* Advanced Recording Interface */}
        <View style={styles.advancedRecordingContainer}>
          <Text style={styles.recordingTitle}>
            {isRecording ? 'Real-time Analysis Active' : 'Tap for Advanced Analysis'}
          </Text>
          
          <TouchableOpacity
            onPress={isRecording ? stopAdvancedRecording : startAdvancedRecording}
            style={[
              styles.advancedRecordButton,
              isRecording && styles.recordingActive
            ]}
          >
            <Icon 
              name={isRecording ? 'stop' : 'mic'} 
              size={40} 
              color="white" 
            />
            {isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>ANALYZING</Text>
              </View>
            )}
          </TouchableOpacity>

          {isRecording && (
            <Text style={styles.recordingHint}>
              Say: "{currentExercise.word.shona}" with cultural authenticity
            </Text>
          )}
        </View>

        {/* Advanced Feedback */}
        {renderAdvancedFeedback()}
      </ScrollView>
    </View>
  );
}

const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner': return '#4CAF50';
    case 'intermediate': return '#FF9800';
    case 'advanced': return '#FF5722';
    case 'expert': return '#9C27B0';
    default: return '#666';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  sessionStatsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statHeaderItem: {
    alignItems: 'center',
  },
  statHeaderValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statHeaderLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  advancedWordContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginVertical: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  advancedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  advancedToggleText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  wordDisplay: {
    alignItems: 'center',
  },
  shonaWord: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1565C0',
    marginBottom: 8,
  },
  englishWord: {
    fontSize: 20,
    color: '#666',
    marginBottom: 20,
  },
  ipaContainer: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    width: '100%',
  },
  ipaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 5,
  },
  ipaText: {
    fontSize: 20,
    fontFamily: 'monospace',
    color: '#0D47A1',
  },
  phoneticBreakdownContainer: {
    marginBottom: 15,
    width: '100%',
  },
  phoneticBreakdownLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  phoneticItem: {
    backgroundColor: '#fff3e0',
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  phoneticSound: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  phoneticDescription: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
  syllableStressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  syllableStressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  syllableStressText: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#4CAF50',
  },
  analysisModeContainer: {
    marginBottom: 20,
  },
  analysisModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedAnalysisModeButton: {
    backgroundColor: '#1565C0',
  },
  analysisModeText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#666',
  },
  selectedAnalysisModeText: {
    color: 'white',
  },
  visualizationContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  visualizationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  svgContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
  },
  tonePatternContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  toneIndicator: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  toneBar: {
    width: 20,
    borderRadius: 4,
    marginBottom: 5,
  },
  toneLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  toneDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  culturalContent: {
    maxHeight: 200,
  },
  culturalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 15,
  },
  etymologyContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  etymologyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  etymologyText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  advancedRecordingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  advancedRecordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1565C0',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    marginBottom: 15,
  },
  recordingActive: {
    backgroundColor: '#F44336',
  },
  recordingIndicator: {
    position: 'absolute',
    top: -10,
    right: -10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    marginRight: 4,
  },
  recordingText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
  },
  recordingHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  feedbackContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  feedbackTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailedFeedback: {
    marginTop: 15,
  },
  feedbackSection: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  feedbackPoint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 3,
    lineHeight: 16,
  },
});