import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProps, VocabularyItem, PronunciationResult } from '../types';
import AudioService from '../services/audio';
import DatabaseService from '../services/database';

const { width } = Dimensions.get('window');

interface PronunciationExercise {
  id: string;
  word: VocabularyItem;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

export default function PronunciationScreen({ navigation }: NavigationProps) {
  const [currentExercise, setCurrentExercise] = useState<PronunciationExercise | null>(null);
  const [exercises, setExercises] = useState<PronunciationExercise[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [lastResult, setLastResult] = useState<PronunciationResult | null>(null);
  const [showPhonetic, setShowPhonetic] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sessionScore, setSessionScore] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [pulseAnimation] = useState(new Animated.Value(1));
  const [feedbackAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      // Load lessons to get vocabulary
      const lessons = await DatabaseService.getAllLessons();
      const allVocabulary: VocabularyItem[] = [];
      
      lessons.forEach(lesson => {
        if (lesson.vocabulary) {
          allVocabulary.push(...lesson.vocabulary);
        }
      });

      // Create pronunciation exercises
      const pronunciationExercises: PronunciationExercise[] = allVocabulary.map((word, index) => ({
        id: `exercise-${index}`,
        word,
        difficulty: word.shona.length > 8 ? 'hard' : word.shona.length > 5 ? 'medium' : 'easy',
        category: word.category || 'general'
      }));

      setExercises(pronunciationExercises);
      if (pronunciationExercises.length > 0) {
        setCurrentExercise(pronunciationExercises[0]);
      }
    } catch (error) {
      console.error('Error loading pronunciation exercises:', error);
      Alert.alert('Error', 'Failed to load pronunciation exercises');
    }
  };

  const categories = [
    { id: 'all', name: 'All Words', icon: 'translate' },
    { id: 'greetings', name: 'Greetings', icon: 'waving-hand' },
    { id: 'family', name: 'Family', icon: 'people' },
    { id: 'numbers', name: 'Numbers', icon: 'numbers' },
    { id: 'colors', name: 'Colors', icon: 'palette' },
  ];

  const filteredExercises = selectedCategory === 'all' 
    ? exercises 
    : exercises.filter(ex => ex.category === selectedCategory);

  const startRecording = async () => {
    try {
      setIsRecording(true);
      startPulseAnimation();
      
      await AudioService.startVoiceRecognition({
        language: 'en-US',
        timeout: 5000,
        onStart: () => {
          console.log('Recording started');
        },
        onResult: (results: string[]) => {
          handleRecordingResult(results);
        },
        onError: (error: any) => {
          console.error('Recording error:', error);
          setIsRecording(false);
          stopPulseAnimation();
          Alert.alert('Error', 'Failed to record audio. Please try again.');
        }
      });
    } catch (error) {
      console.error('Start recording error:', error);
      setIsRecording(false);
      stopPulseAnimation();
    }
  };

  const stopRecording = async () => {
    try {
      await AudioService.stopVoiceRecognition();
      setIsRecording(false);
      stopPulseAnimation();
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };

  const handleRecordingResult = async (results: string[]) => {
    if (!currentExercise || results.length === 0) return;

    const spokenText = results[0];
    const targetWord = currentExercise.word.shona;

    try {
      const result = await AudioService.assessPronunciation(targetWord, spokenText);
      setLastResult(result);
      
      // Update session score
      setSessionScore(prev => prev + result.score);
      setCompletedCount(prev => prev + 1);

      // Provide haptic feedback
      if (result.accuracy >= 0.7) {
        Vibration.vibrate(100);
      } else {
        Vibration.vibrate([100, 50, 100]);
      }

      // Show feedback animation
      showFeedbackAnimation();

      // Auto-move to next exercise after good pronunciation
      if (result.accuracy >= 0.8) {
        setTimeout(() => {
          nextExercise();
        }, 2000);
      }
    } catch (error) {
      console.error('Pronunciation assessment error:', error);
      Alert.alert('Error', 'Failed to assess pronunciation');
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnimation.stopAnimation();
    pulseAnimation.setValue(1);
  };

  const showFeedbackAnimation = () => {
    Animated.sequence([
      Animated.timing(feedbackAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(feedbackAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const nextExercise = () => {
    if (!currentExercise) return;
    
    const currentIndex = filteredExercises.findIndex(ex => ex.id === currentExercise.id);
    const nextIndex = (currentIndex + 1) % filteredExercises.length;
    setCurrentExercise(filteredExercises[nextIndex]);
    setLastResult(null);
  };

  const previousExercise = () => {
    if (!currentExercise) return;
    
    const currentIndex = filteredExercises.findIndex(ex => ex.id === currentExercise.id);
    const prevIndex = currentIndex === 0 ? filteredExercises.length - 1 : currentIndex - 1;
    setCurrentExercise(filteredExercises[prevIndex]);
    setLastResult(null);
  };

  const playWordAudio = async () => {
    if (!currentExercise) return;
    
    try {
      await AudioService.speakShona(currentExercise.word.shona);
    } catch (error) {
      console.error('Audio playback error:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#666';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  if (!currentExercise) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading pronunciation exercises...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#2196F3', '#1565C0']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Pronunciation Practice</Text>
        <Text style={styles.headerSubtitle}>Master Shona sounds and tones</Text>
      </LinearGradient>

      {/* Session Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>Practiced</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{Math.round(sessionScore / Math.max(completedCount, 1))}</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{filteredExercises.length}</Text>
          <Text style={styles.statLabel}>Total Words</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategory === category.id && styles.selectedCategoryButton
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  selectedCategory === category.id && styles.selectedCategoryButtonText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Word Display */}
        <View style={styles.wordContainer}>
          <View style={styles.wordHeader}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentExercise.difficulty) }]}>
              <Text style={styles.difficultyText}>{currentExercise.difficulty.toUpperCase()}</Text>
            </View>
            <TouchableOpacity
              style={styles.phoneticToggle}
              onPress={() => setShowPhonetic(!showPhonetic)}
            >
              <Icon name={showPhonetic ? 'visibility' : 'visibility-off'} size={20} color="#666" />
              <Text style={styles.phoneticToggleText}>Phonetic</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={playWordAudio} style={styles.wordDisplay}>
            <Text style={styles.shonaWord}>{currentExercise.word.shona}</Text>
            <Text style={styles.englishWord}>{currentExercise.word.english}</Text>
            
            {/* Pronunciation Guide - Key Feature */}
            {showPhonetic && (
              <View style={styles.pronunciationGuide}>
                <Text style={styles.phoneticLabel}>Pronunciation Guide:</Text>
                {currentExercise.word.phonetic ? (
                  <Text style={styles.phoneticText}>/{currentExercise.word.phonetic}/</Text>
                ) : (
                  <Text style={styles.phoneticText}>/{currentExercise.word.shona.toLowerCase()}/</Text>
                )}
                
                {/* Syllable breakdown */}
                <View style={styles.syllableContainer}>
                  <Text style={styles.syllableLabel}>Syllables:</Text>
                  <View style={styles.syllableBreakdown}>
                    {currentExercise.word.shona.split('').map((char, index) => (
                      <Text key={index} style={styles.syllableChar}>{char}</Text>
                    ))}
                  </View>
                </View>

                {/* Tone indicators */}
                <View style={styles.toneContainer}>
                  <Text style={styles.toneLabel}>Tone Pattern:</Text>
                  <Text style={styles.tonePattern}>
                    {currentExercise.word.tonePattern || 'High - Low - High'}
                  </Text>
                </View>
              </View>
            )}

            {currentExercise.word.usage && (
              <Text style={styles.usageText}>Usage: {currentExercise.word.usage}</Text>
            )}
            
            {currentExercise.word.example && (
              <Text style={styles.exampleText}>Example: {currentExercise.word.example}</Text>
            )}

            <View style={styles.playIcon}>
              <Icon name="volume-up" size={24} color="#4CAF50" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Recording Interface */}
        <View style={styles.recordingContainer}>
          <Text style={styles.recordingTitle}>
            {isRecording ? 'Listening...' : 'Tap to practice pronunciation'}
          </Text>
          
          <Animated.View style={[
            styles.recordButton,
            { transform: [{ scale: pulseAnimation }] }
          ]}>
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={[
                styles.recordButtonInner,
                isRecording && styles.recordingActive
              ]}
            >
              <Icon 
                name={isRecording ? 'stop' : 'mic'} 
                size={32} 
                color="white" 
              />
            </TouchableOpacity>
          </Animated.View>

          {isRecording && (
            <Text style={styles.recordingHint}>
              Say: "{currentExercise.word.shona}"
            </Text>
          )}
        </View>

        {/* Feedback */}
        {lastResult && (
          <Animated.View 
            style={[
              styles.feedbackContainer,
              { opacity: feedbackAnimation }
            ]}
          >
            <View style={styles.scoreContainer}>
              <Text style={[styles.score, { color: getScoreColor(lastResult.score) }]}>
                {lastResult.score}%
              </Text>
              <Text style={styles.accuracy}>
                Accuracy: {Math.round(lastResult.accuracy * 100)}%
              </Text>
            </View>
            <Text style={styles.feedbackText}>{lastResult.feedback}</Text>
            
            {lastResult.accuracy < 0.7 && (
              <TouchableOpacity style={styles.retryButton} onPress={startRecording}>
                <Icon name="refresh" size={16} color="#2196F3" />
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </Animated.View>
        )}

        {/* Navigation */}
        <View style={styles.navigationContainer}>
          <TouchableOpacity style={styles.navButton} onPress={previousExercise}>
            <Icon name="arrow-back" size={24} color="#4CAF50" />
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton} onPress={nextExercise}>
            <Text style={styles.navButtonText}>Next</Text>
            <Icon name="arrow-forward" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    marginVertical: 20,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryButton: {
    backgroundColor: '#2196F3',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  wordContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  wordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  phoneticToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phoneticToggleText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  wordDisplay: {
    alignItems: 'center',
    position: 'relative',
  },
  shonaWord: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  englishWord: {
    fontSize: 18,
    color: '#666',
    marginBottom: 15,
  },
  pronunciationGuide: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  phoneticLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  phoneticText: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#2196F3',
    marginBottom: 10,
  },
  syllableContainer: {
    marginBottom: 10,
  },
  syllableLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  syllableBreakdown: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  syllableChar: {
    fontSize: 16,
    color: '#666',
    marginRight: 2,
    padding: 2,
    backgroundColor: '#e3f2fd',
    borderRadius: 4,
  },
  toneContainer: {
    marginTop: 5,
  },
  toneLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  tonePattern: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  usageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  playIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  recordingContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recordingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  recordButton: {
    marginBottom: 15,
  },
  recordButtonInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordingActive: {
    backgroundColor: '#F44336',
  },
  recordingHint: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  feedbackContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  score: {
    fontSize: 32,
    fontWeight: 'bold',
    marginRight: 15,
  },
  accuracy: {
    fontSize: 16,
    color: '#666',
  },
  feedbackText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
  },
  retryText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#2196F3',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    marginHorizontal: 8,
  },
});