import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
  Vibration,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProps, VocabularyItem } from '../types';
import DatabaseService from '../services/database';
import AudioService from '../services/audio';

const { width, height } = Dimensions.get('window');

interface AdvancedFlashcard {
  id: string;
  word: VocabularyItem;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  memoryStrength: number; // 0-1 scale
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
  correctStreak: number;
  easeFactor: number; // SM-2 algorithm
  interval: number; // days until next review
  culturalContext: string;
  mnemonicHint: string;
  visualAssociation: string;
  personalConnection: string;
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  cognitiveLoad: number;
  masteryLevel: number;
}

interface LearningSession {
  sessionId: string;
  startTime: Date;
  cardsReviewed: number;
  correctAnswers: number;
  averageResponseTime: number;
  difficultyProgression: string[];
  learningVelocity: number;
  cognitiveState: 'fresh' | 'focused' | 'tired' | 'distracted';
  retentionRate: number;
  masteryGains: number;
}

interface AdvancedMetrics {
  totalMastery: number;
  weeklyProgress: number;
  retentionCurve: number[];
  learningEfficiency: number;
  culturalKnowledge: number;
  streakDays: number;
  totalTimeSpent: number;
  wordsPerMinute: number;
  difficultyDistribution: { [key: string]: number };
  strongestCategories: string[];
  weakestCategories: string[];
}

export default function FlashcardsScreen({ navigation }: NavigationProps) {
  const [flashcards, setFlashcards] = useState<AdvancedFlashcard[]>([]);
  const [currentCard, setCurrentCard] = useState<AdvancedFlashcard | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [sessionData, setSessionData] = useState<LearningSession>({
    sessionId: Date.now().toString(),
    startTime: new Date(),
    cardsReviewed: 0,
    correctAnswers: 0,
    averageResponseTime: 0,
    difficultyProgression: [],
    learningVelocity: 0,
    cognitiveState: 'fresh',
    retentionRate: 0,
    masteryGains: 0,
  });
  const [metrics, setMetrics] = useState<AdvancedMetrics>({
    totalMastery: 0,
    weeklyProgress: 0,
    retentionCurve: [],
    learningEfficiency: 0,
    culturalKnowledge: 0,
    streakDays: 0,
    totalTimeSpent: 0,
    wordsPerMinute: 0,
    difficultyDistribution: {},
    strongestCategories: [],
    weakestCategories: [],
  });
  const [selectedMode, setSelectedMode] = useState<'review' | 'learn' | 'master' | 'cultural'>('review');
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [cardStartTime, setCardStartTime] = useState<Date>(new Date());

  // Animation refs
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const masteryAnimation = useRef(new Animated.Value(0)).current;

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      return Math.abs(gestureState.dx) > 20 || Math.abs(gestureState.dy) > 20;
    },
    onPanResponderMove: (evt, gestureState) => {
      slideAnimation.setValue(gestureState.dx);
      
      // Visual feedback for swipe direction
      if (gestureState.dx > 50) {
        // Swipe right (easy)
        scaleAnimation.setValue(1.05);
      } else if (gestureState.dx < -50) {
        // Swipe left (difficult)
        scaleAnimation.setValue(0.95);
      } else {
        scaleAnimation.setValue(1);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (Math.abs(gestureState.dx) > 100) {
        // Swipe threshold met
        const difficulty = gestureState.dx > 0 ? 'easy' : 'hard';
        handleCardResponse(difficulty);
      } else {
        // Snap back to center
        Animated.spring(slideAnimation, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        Animated.spring(scaleAnimation, {
          toValue: 1,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  useEffect(() => {
    loadAdvancedFlashcards();
    loadLearningMetrics();
  }, []);

  const loadAdvancedFlashcards = async () => {
    try {
      const lessons = await DatabaseService.getAllLessons();
      const cards: AdvancedFlashcard[] = [];
      
      lessons.forEach(lesson => {
        if (lesson.vocabulary) {
          lesson.vocabulary.forEach((word, index) => {
            const card: AdvancedFlashcard = {
              id: `card-${lesson.id}-${index}`,
              word,
              difficulty: calculateWordDifficulty(word),
              memoryStrength: Math.random() * 0.5 + 0.3, // 0.3-0.8 initial strength
              lastReviewed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
              nextReview: new Date(Date.now() + Math.random() * 3 * 24 * 60 * 60 * 1000),
              reviewCount: Math.floor(Math.random() * 10),
              correctStreak: Math.floor(Math.random() * 5),
              easeFactor: 2.5,
              interval: Math.floor(Math.random() * 7) + 1,
              culturalContext: generateCulturalContext(word),
              mnemonicHint: generateMnemonicHint(word),
              visualAssociation: generateVisualAssociation(word),
              personalConnection: generatePersonalConnection(word),
              learningStyle: ['visual', 'auditory', 'kinesthetic', 'reading'][Math.floor(Math.random() * 4)] as any,
              cognitiveLoad: Math.random() * 0.5 + 0.3,
              masteryLevel: Math.random() * 0.7 + 0.2,
            };
            cards.push(card);
          });
        }
      });

      // Sort by spaced repetition algorithm
      const sortedCards = cards.sort((a, b) => {
        const aScore = calculateReviewPriority(a);
        const bScore = calculateReviewPriority(b);
        return bScore - aScore;
      });

      setFlashcards(sortedCards);
      if (sortedCards.length > 0) {
        setCurrentCard(sortedCards[0]);
        setCardStartTime(new Date());
      }
    } catch (error) {
      console.error('Error loading flashcards:', error);
      Alert.alert('Error', 'Failed to load flashcards');
    }
  };

  const loadLearningMetrics = async () => {
    try {
      // In a real app, this would load from database
      const mockMetrics: AdvancedMetrics = {
        totalMastery: 67.5,
        weeklyProgress: 12.3,
        retentionCurve: [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.35],
        learningEfficiency: 0.78,
        culturalKnowledge: 45.2,
        streakDays: 7,
        totalTimeSpent: 145.5, // minutes
        wordsPerMinute: 2.3,
        difficultyDistribution: {
          beginner: 35,
          intermediate: 40,
          advanced: 20,
          expert: 5,
        },
        strongestCategories: ['Greetings', 'Family', 'Numbers'],
        weakestCategories: ['Complex Grammar', 'Idiomatic Expressions'],
      };
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const calculateWordDifficulty = (word: VocabularyItem): 'beginner' | 'intermediate' | 'advanced' | 'expert' => {
    const factors = {
      length: word.shona.length,
      complexity: (word.shona.match(/[^aeiou]/g) || []).length,
      cultural: word.category === 'cultural' ? 2 : 0,
      grammar: word.shona.includes('ku') || word.shona.includes('chi') ? 1 : 0,
    };
    
    const score = factors.length + factors.complexity + factors.cultural + factors.grammar;
    
    if (score <= 6) return 'beginner';
    if (score <= 10) return 'intermediate';
    if (score <= 15) return 'advanced';
    return 'expert';
  };

  const calculateReviewPriority = (card: AdvancedFlashcard): number => {
    const now = new Date();
    const timeSinceReview = (now.getTime() - card.lastReviewed.getTime()) / (1000 * 60 * 60 * 24);
    const timeUntilReview = (card.nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    // Higher priority for overdue cards and low memory strength
    let priority = 0;
    if (timeUntilReview <= 0) priority += 10; // Overdue
    priority += (1 - card.memoryStrength) * 5; // Low memory strength
    priority += Math.max(0, timeSinceReview - 1) * 2; // Time since last review
    priority += (1 - card.masteryLevel) * 3; // Low mastery
    
    return priority;
  };

  const generateCulturalContext = (word: VocabularyItem): string => {
    const contexts = [
      'This word reflects the communal values of Shona society',
      'Traditional usage in ceremonial contexts',
      'Connected to ancestral wisdom and ubuntu philosophy',
      'Represents the harmony between nature and community',
      'Used in traditional storytelling and oral history',
      'Embodies respect for elders and family hierarchy',
      'Reflects the agricultural heritage of the Shona people',
    ];
    return contexts[Math.floor(Math.random() * contexts.length)];
  };

  const generateMnemonicHint = (word: VocabularyItem): string => {
    const hints = [
      `Remember: "${word.shona}" sounds like...`,
      `Think of the connection between "${word.shona}" and "${word.english}"`,
      `Visual: Imagine ${word.english} when you hear "${word.shona}"`,
      `Story: Create a story using "${word.shona}" and ${word.english}`,
      `Rhyme: "${word.shona}" rhymes with...`,
      `Association: "${word.shona}" reminds you of...`,
    ];
    return hints[Math.floor(Math.random() * hints.length)];
  };

  const generateVisualAssociation = (word: VocabularyItem): string => {
    return `Visualize a vivid scene involving ${word.english} to remember "${word.shona}"`;
  };

  const generatePersonalConnection = (word: VocabularyItem): string => {
    return `Connect "${word.shona}" to a personal memory or experience with ${word.english}`;
  };

  const handleCardResponse = async (difficulty: 'easy' | 'medium' | 'hard') => {
    if (!currentCard) return;

    const responseTime = (new Date().getTime() - cardStartTime.getTime()) / 1000;
    const isCorrect = difficulty === 'easy' || difficulty === 'medium';
    
    // Update card using SM-2 algorithm
    const updatedCard = updateCardWithSM2(currentCard, difficulty, responseTime);
    
    // Update session data
    setSessionData(prev => ({
      ...prev,
      cardsReviewed: prev.cardsReviewed + 1,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      averageResponseTime: (prev.averageResponseTime * prev.cardsReviewed + responseTime) / (prev.cardsReviewed + 1),
      difficultyProgression: [...prev.difficultyProgression, difficulty],
      retentionRate: (prev.correctAnswers + (isCorrect ? 1 : 0)) / (prev.cardsReviewed + 1),
      masteryGains: prev.masteryGains + (updatedCard.masteryLevel - currentCard.masteryLevel),
    }));

    // Haptic feedback
    if (isCorrect) {
      Vibration.vibrate(100);
    } else {
      Vibration.vibrate([100, 50, 100]);
    }

    // Play pronunciation
    try {
      await AudioService.speakShona(currentCard.word.shona);
    } catch (error) {
      console.error('Audio playback error:', error);
    }

    // Animate card transition
    await animateCardTransition(difficulty);
    
    // Move to next card
    const nextCardIndex = flashcards.findIndex(card => card.id === currentCard.id) + 1;
    if (nextCardIndex < flashcards.length) {
      setCurrentCard(flashcards[nextCardIndex]);
      setCardStartTime(new Date());
      setIsFlipped(false);
      setShowAnswer(false);
    } else {
      // Session complete
      showSessionSummary();
    }
  };

  const updateCardWithSM2 = (card: AdvancedFlashcard, difficulty: string, responseTime: number): AdvancedFlashcard => {
    let quality = 0;
    switch (difficulty) {
      case 'easy': quality = 5; break;
      case 'medium': quality = 3; break;
      case 'hard': quality = 1; break;
    }

    // SM-2 Algorithm implementation
    let newEaseFactor = card.easeFactor;
    let newInterval = card.interval;
    let newCorrectStreak = card.correctStreak;

    if (quality >= 3) {
      newCorrectStreak = card.correctStreak + 1;
      if (newCorrectStreak === 1) {
        newInterval = 1;
      } else if (newCorrectStreak === 2) {
        newInterval = 6;
      } else {
        newInterval = Math.round(card.interval * card.easeFactor);
      }
    } else {
      newCorrectStreak = 0;
      newInterval = 1;
    }

    newEaseFactor = Math.max(1.3, card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

    // Update memory strength based on performance and time
    const timeWeight = Math.min(responseTime / 10, 1); // Normalize response time
    const performanceWeight = quality / 5;
    const newMemoryStrength = Math.min(1, card.memoryStrength * 0.8 + performanceWeight * 0.2 - timeWeight * 0.1);

    // Update mastery level
    const newMasteryLevel = Math.min(1, card.masteryLevel + (performanceWeight - 0.6) * 0.1);

    return {
      ...card,
      easeFactor: newEaseFactor,
      interval: newInterval,
      correctStreak: newCorrectStreak,
      memoryStrength: newMemoryStrength,
      masteryLevel: newMasteryLevel,
      lastReviewed: new Date(),
      nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000),
      reviewCount: card.reviewCount + 1,
    };
  };

  const animateCardTransition = async (difficulty: string): Promise<void> => {
    const direction = difficulty === 'easy' ? 1 : -1;
    
    await new Promise(resolve => {
      Animated.parallel([
        Animated.timing(slideAnimation, {
          toValue: direction * width,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(resolve);
    });

    // Reset animations
    slideAnimation.setValue(0);
    scaleAnimation.setValue(1);
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
    setShowAnswer(!showAnswer);
    
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const showSessionSummary = () => {
    const accuracy = Math.round((sessionData.correctAnswers / sessionData.cardsReviewed) * 100);
    const avgTime = Math.round(sessionData.averageResponseTime);
    
    Alert.alert(
      'Session Complete! 🎉',
      `Cards Reviewed: ${sessionData.cardsReviewed}\n` +
      `Accuracy: ${accuracy}%\n` +
      `Average Time: ${avgTime}s\n` +
      `Mastery Gained: +${Math.round(sessionData.masteryGains * 100)}%`,
      [
        { text: 'Continue Learning', onPress: loadAdvancedFlashcards },
        { text: 'View Analytics', onPress: () => setShowAdvancedStats(true) },
      ]
    );
  };

  const renderCard = () => {
    if (!currentCard) return null;

    const frontInterpolate = flipAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '180deg'],
    });

    const backInterpolate = flipAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: ['180deg', '360deg'],
    });

    return (
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [
              { translateX: slideAnimation },
              { scale: scaleAnimation },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Front of card */}
        <Animated.View
          style={[
            styles.card,
            styles.cardFront,
            { transform: [{ rotateY: frontInterpolate }] },
            !showAnswer && { zIndex: 2 },
          ]}
        >
          <LinearGradient
            colors={['#1565C0', '#0D47A1']}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentCard.difficulty) }]}>
                <Text style={styles.difficultyText}>{currentCard.difficulty.toUpperCase()}</Text>
              </View>
              <View style={styles.masteryIndicator}>
                <Text style={styles.masteryText}>{Math.round(currentCard.masteryLevel * 100)}%</Text>
              </View>
            </View>
            
            <View style={styles.cardContent}>
              <Text style={styles.shonaText}>{currentCard.word.shona}</Text>
              <Text style={styles.categoryText}>{currentCard.word.category || 'General'}</Text>
              
              <View style={styles.memoryStrengthContainer}>
                <Text style={styles.memoryLabel}>Memory Strength</Text>
                <View style={styles.memoryBar}>
                  <View 
                    style={[
                      styles.memoryFill,
                      { width: `${currentCard.memoryStrength * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.flipButton} onPress={flipCard}>
              <Icon name="flip" size={24} color="white" />
              <Text style={styles.flipText}>Tap to reveal</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Back of card */}
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            { transform: [{ rotateY: backInterpolate }] },
            showAnswer && { zIndex: 2 },
          ]}
        >
          <LinearGradient
            colors={['#4CAF50', '#2E7D32']}
            style={styles.cardGradient}
          >
            <ScrollView style={styles.cardBackContent}>
              <Text style={styles.englishText}>{currentCard.word.english}</Text>
              
              {currentCard.word.usage && (
                <View style={styles.usageContainer}>
                  <Text style={styles.usageLabel}>Usage:</Text>
                  <Text style={styles.usageText}>{currentCard.word.usage}</Text>
                </View>
              )}
              
              {currentCard.word.example && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleLabel}>Example:</Text>
                  <Text style={styles.exampleText}>{currentCard.word.example}</Text>
                </View>
              )}

              <View style={styles.culturalContainer}>
                <Text style={styles.culturalLabel}>Cultural Context:</Text>
                <Text style={styles.culturalText}>{currentCard.culturalContext}</Text>
              </View>

              <View style={styles.mnemonicContainer}>
                <Text style={styles.mnemonicLabel}>Memory Tip:</Text>
                <Text style={styles.mnemonicText}>{currentCard.mnemonicHint}</Text>
              </View>
            </ScrollView>

            <View style={styles.responseButtons}>
              <TouchableOpacity
                style={[styles.responseButton, styles.hardButton]}
                onPress={() => handleCardResponse('hard')}
              >
                <Icon name="thumb-down" size={20} color="white" />
                <Text style={styles.responseText}>Hard</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.responseButton, styles.mediumButton]}
                onPress={() => handleCardResponse('medium')}
              >
                <Icon name="remove" size={20} color="white" />
                <Text style={styles.responseText}>Medium</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.responseButton, styles.easyButton]}
                onPress={() => handleCardResponse('easy')}
              >
                <Icon name="thumb-up" size={20} color="white" />
                <Text style={styles.responseText}>Easy</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    );
  };

  const renderAdvancedStats = () => {
    if (!showAdvancedStats) return null;

    return (
      <View style={styles.statsOverlay}>
        <View style={styles.statsContainer}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Learning Analytics</Text>
            <TouchableOpacity onPress={() => setShowAdvancedStats(false)}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.statsContent}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Mastery</Text>
              <Text style={styles.statValue}>{metrics.totalMastery}%</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Learning Efficiency</Text>
              <Text style={styles.statValue}>{Math.round(metrics.learningEfficiency * 100)}%</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Cultural Knowledge</Text>
              <Text style={styles.statValue}>{metrics.culturalKnowledge}%</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Current Streak</Text>
              <Text style={styles.statValue}>{metrics.streakDays} days</Text>
            </View>
            
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Words per Minute</Text>
              <Text style={styles.statValue}>{metrics.wordsPerMinute}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    );
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#FF5722';
      case 'expert': return '#9C27B0';
      default: return '#666';
    }
  };

  if (!currentCard) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading advanced flashcards...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#1565C0', '#0D47A1', '#1A237E']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Advanced Flashcards</Text>
        <Text style={styles.headerSubtitle}>
          AI-Powered Spaced Repetition • Cultural Mastery • Adaptive Learning
        </Text>
        
        <View style={styles.sessionStats}>
          <View style={styles.sessionStatItem}>
            <Text style={styles.sessionStatValue}>{sessionData.cardsReviewed}</Text>
            <Text style={styles.sessionStatLabel}>Reviewed</Text>
          </View>
          <View style={styles.sessionStatItem}>
            <Text style={styles.sessionStatValue}>
              {Math.round((sessionData.correctAnswers / Math.max(sessionData.cardsReviewed, 1)) * 100)}%
            </Text>
            <Text style={styles.sessionStatLabel}>Accuracy</Text>
          </View>
          <View style={styles.sessionStatItem}>
            <Text style={styles.sessionStatValue}>{metrics.streakDays}</Text>
            <Text style={styles.sessionStatLabel}>Streak</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill,
              { width: `${(sessionData.cardsReviewed / flashcards.length) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {sessionData.cardsReviewed} / {flashcards.length} cards
        </Text>
      </View>

      {/* Card */}
      <View style={styles.cardArea}>
        {renderCard()}
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to use:</Text>
        <Text style={styles.instructionsText}>
          • Tap card to flip and reveal answer{'\n'}
          • Swipe right for easy, left for hard{'\n'}
          • Use buttons for precise difficulty rating
        </Text>
      </View>

      {/* Advanced Stats Button */}
      <TouchableOpacity
        style={styles.statsButton}
        onPress={() => setShowAdvancedStats(true)}
      >
        <Icon name="analytics" size={20} color="white" />
        <Text style={styles.statsButtonText}>View Analytics</Text>
      </TouchableOpacity>

      {/* Advanced Stats Modal */}
      {renderAdvancedStats()}
    </View>
  );
}

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
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sessionStatItem: {
    alignItems: 'center',
  },
  sessionStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  sessionStatLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  cardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: width - 40,
    height: height * 0.6,
    position: 'relative',
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    backfaceVisibility: 'hidden',
  },
  cardFront: {
    zIndex: 2,
  },
  cardBack: {
    zIndex: 1,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
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
  masteryIndicator: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  masteryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shonaText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 30,
  },
  memoryStrengthContainer: {
    width: '100%',
    alignItems: 'center',
  },
  memoryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  memoryBar: {
    width: '80%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
  },
  memoryFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 20,
  },
  flipText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  cardBackContent: {
    flex: 1,
  },
  englishText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  usageContainer: {
    marginBottom: 15,
  },
  usageLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  usageText: {
    fontSize: 14,
    color: 'white',
  },
  exampleContainer: {
    marginBottom: 15,
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  exampleText: {
    fontSize: 14,
    color: 'white',
    fontStyle: 'italic',
  },
  culturalContainer: {
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  culturalLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  culturalText: {
    fontSize: 12,
    color: 'white',
    lineHeight: 16,
  },
  mnemonicContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 8,
  },
  mnemonicLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 5,
  },
  mnemonicText: {
    fontSize: 12,
    color: 'white',
    lineHeight: 16,
  },
  responseButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  responseButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  hardButton: {
    backgroundColor: '#F44336',
  },
  mediumButton: {
    backgroundColor: '#FF9800',
  },
  easyButton: {
    backgroundColor: '#4CAF50',
  },
  responseText: {
    color: 'white',
    marginLeft: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565C0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  statsButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: height * 0.8,
    width: width - 40,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContent: {
    flex: 1,
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565C0',
  },
});