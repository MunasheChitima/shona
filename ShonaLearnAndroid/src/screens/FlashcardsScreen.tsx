import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProps, Flashcard, VocabularyItem } from '../types';
import AudioService from '../services/audio';
import DatabaseService from '../services/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function FlashcardsScreen({ navigation }: NavigationProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [reviewCount, setReviewCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showPhonetic, setShowPhonetic] = useState(true);
  const [flipAnimation] = useState(new Animated.Value(0));
  const [slideAnimation] = useState(new Animated.Value(0));
  const [scaleAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    loadFlashcards();
  }, []);

  const loadFlashcards = async () => {
    try {
      const userId = await AsyncStorage.getItem('currentUserId');
      if (!userId) return;

      // Get existing flashcards
      let userFlashcards = await DatabaseService.getUserFlashcards(userId);
      
      // If no flashcards exist, create them from lessons
      if (userFlashcards.length === 0) {
        await createInitialFlashcards(userId);
        userFlashcards = await DatabaseService.getUserFlashcards(userId);
      }

      // Sort by next review date
      userFlashcards.sort((a, b) => a.nextReview.getTime() - b.nextReview.getTime());
      setFlashcards(userFlashcards);
      
    } catch (error) {
      console.error('Error loading flashcards:', error);
      Alert.alert('Error', 'Failed to load flashcards');
    }
  };

  const createInitialFlashcards = async (userId: string) => {
    try {
      const lessons = await DatabaseService.getAllLessons();
      const allVocabulary: VocabularyItem[] = [];
      
      lessons.forEach(lesson => {
        if (lesson.vocabulary) {
          allVocabulary.push(...lesson.vocabulary);
        }
      });

      for (const word of allVocabulary) {
        const flashcard: Flashcard = {
          id: `flashcard-${userId}-${word.shona}`,
          userId,
          shona: word.shona,
          english: word.english,
          phonetic: word.phonetic,
          audioFile: word.audioFile,
          category: word.category || 'general',
          difficulty: 1,
          nextReview: new Date(),
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
          correctStreak: 0,
        };

        await DatabaseService.insertFlashcard(flashcard);
      }
    } catch (error) {
      console.error('Error creating initial flashcards:', error);
    }
  };

  const flipCard = () => {
    Animated.timing(flipAnimation, {
      toValue: isFlipped ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const handleDifficultyResponse = async (difficulty: 'easy' | 'medium' | 'hard') => {
    const currentCard = flashcards[currentIndex];
    if (!currentCard) return;

    try {
      // Calculate next review based on spaced repetition algorithm
      const updatedCard = calculateNextReview(currentCard, difficulty);
      
      // Update in database
      await DatabaseService.insertFlashcard(updatedCard);
      
      // Update stats
      setReviewCount(prev => prev + 1);
      if (difficulty === 'easy') {
        setCorrectCount(prev => prev + 1);
      }

      // Move to next card with animation
      await slideToNextCard();
      
    } catch (error) {
      console.error('Error updating flashcard:', error);
    }
  };

  const calculateNextReview = (card: Flashcard, difficulty: 'easy' | 'medium' | 'hard'): Flashcard => {
    let interval = card.interval;
    let easeFactor = card.easeFactor;
    let repetitions = card.repetitions;
    let correctStreak = card.correctStreak;

    switch (difficulty) {
      case 'easy':
        interval = Math.max(1, interval * easeFactor);
        easeFactor = Math.max(1.3, easeFactor + 0.1);
        repetitions += 1;
        correctStreak += 1;
        break;
      case 'medium':
        interval = Math.max(1, interval * 1.2);
        repetitions += 1;
        correctStreak += 1;
        break;
      case 'hard':
        interval = 1;
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        repetitions = 0;
        correctStreak = 0;
        break;
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + Math.ceil(interval));

    return {
      ...card,
      interval,
      easeFactor,
      repetitions,
      correctStreak,
      nextReview,
      lastReviewed: new Date(),
    };
  };

  const slideToNextCard = async () => {
    return new Promise<void>((resolve) => {
      Animated.timing(slideAnimation, {
        toValue: -width,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Move to next card
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          // End of session
          showSessionComplete();
        }
        
        // Reset animations
        setIsFlipped(false);
        flipAnimation.setValue(0);
        slideAnimation.setValue(0);
        resolve();
      });
    });
  };

  const showSessionComplete = () => {
    Alert.alert(
      'Session Complete! 🎉',
      `You reviewed ${reviewCount} cards with ${correctCount} correct answers.`,
      [
        { text: 'Continue', onPress: () => navigation.goBack() },
        { text: 'Review More', onPress: () => loadFlashcards() },
      ]
    );
  };

  const playAudio = async (word: string) => {
    try {
      await AudioService.speakShona(word);
      // Add scale animation for audio feedback
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
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

  const currentCard = flashcards[currentIndex];

  if (flashcards.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FF9800', '#F57C00']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Flashcards</Text>
          <Text style={styles.headerSubtitle}>Review vocabulary with spaced repetition</Text>
        </LinearGradient>
        
        <View style={styles.emptyContainer}>
          <Icon name="style" size={64} color="#ccc" />
          <Text style={styles.emptyText}>Loading flashcards...</Text>
        </View>
      </View>
    );
  }

  if (!currentCard) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#FF9800', '#F57C00']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Flashcards</Text>
          <Text style={styles.headerSubtitle}>Review vocabulary with spaced repetition</Text>
        </LinearGradient>
        
        <View style={styles.emptyContainer}>
          <Icon name="check-circle" size={64} color="#4CAF50" />
          <Text style={styles.emptyText}>All cards reviewed!</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => loadFlashcards()}
          >
            <Text style={styles.refreshButtonText}>Load More Cards</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF9800', '#F57C00']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Flashcards</Text>
          <Text style={styles.headerSubtitle}>
            Card {currentIndex + 1} of {flashcards.length}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.phoneticToggle}
          onPress={() => setShowPhonetic(!showPhonetic)}
        >
          <Icon name={showPhonetic ? 'visibility' : 'visibility-off'} size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / flashcards.length) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(((currentIndex + 1) / flashcards.length) * 100)}%
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{reviewCount}</Text>
          <Text style={styles.statLabel}>Reviewed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{correctCount}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{flashcards.length - currentIndex}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
      </View>

      {/* Card */}
      <View style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: slideAnimation },
                { scale: scaleAnimation },
              ],
            },
          ]}
        >
          <TouchableOpacity onPress={flipCard} style={styles.cardContent}>
            <Animated.View
              style={[
                styles.cardFront,
                {
                  opacity: flipAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[
                  styles.difficultyBadge,
                  { backgroundColor: getDifficultyColor('medium') }
                ]}>
                  <Text style={styles.difficultyText}>
                    {currentCard.repetitions > 0 ? 'REVIEW' : 'NEW'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => playAudio(currentCard.shona)}
                  style={styles.audioButton}
                >
                  <Icon name="volume-up" size={24} color="#FF9800" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.wordContainer}>
                <Text style={styles.shonaWord}>{currentCard.shona}</Text>
                
                {/* Pronunciation Guide */}
                {showPhonetic && (
                  <View style={styles.pronunciationContainer}>
                    <Text style={styles.pronunciationLabel}>Pronunciation:</Text>
                    <Text style={styles.phoneticText}>
                      /{currentCard.phonetic || currentCard.shona.toLowerCase()}/
                    </Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.tapHint}>Tap to reveal translation</Text>
            </Animated.View>

            <Animated.View
              style={[
                styles.cardBack,
                {
                  opacity: flipAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ]}
            >
              <View style={styles.translationContainer}>
                <Text style={styles.englishWord}>{currentCard.english}</Text>
                <Text style={styles.shonaWordSmall}>{currentCard.shona}</Text>
              </View>
              
              <Text style={styles.rateHint}>How well did you know this word?</Text>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Difficulty Buttons */}
      {isFlipped && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.difficultyButton, { backgroundColor: '#F44336' }]}
            onPress={() => handleDifficultyResponse('hard')}
          >
            <Icon name="close" size={20} color="white" />
            <Text style={styles.buttonText}>Hard</Text>
            <Text style={styles.buttonSubtext}>{'< 1 day'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.difficultyButton, { backgroundColor: '#FF9800' }]}
            onPress={() => handleDifficultyResponse('medium')}
          >
            <Icon name="remove" size={20} color="white" />
            <Text style={styles.buttonText}>Medium</Text>
            <Text style={styles.buttonSubtext}>3 days</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.difficultyButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => handleDifficultyResponse('easy')}
          >
            <Icon name="check" size={20} color="white" />
            <Text style={styles.buttonText}>Easy</Text>
            <Text style={styles.buttonSubtext}>1 week</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    marginRight: 15,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  phoneticToggle: {
    padding: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF9800',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: width * 0.9,
    height: height * 0.5,
    backgroundColor: 'white',
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardContent: {
    flex: 1,
    position: 'relative',
  },
  cardFront: {
    flex: 1,
    padding: 30,
    justifyContent: 'space-between',
  },
  cardBack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  audioButton: {
    padding: 8,
  },
  wordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shonaWord: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FF9800',
    textAlign: 'center',
    marginBottom: 20,
  },
  pronunciationContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  pronunciationLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  phoneticText: {
    fontSize: 18,
    fontFamily: 'monospace',
    color: '#FF9800',
  },
  tapHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  translationContainer: {
    alignItems: 'center',
  },
  englishWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  shonaWordSmall: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  rateHint: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  difficultyButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
  },
  buttonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 20,
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});