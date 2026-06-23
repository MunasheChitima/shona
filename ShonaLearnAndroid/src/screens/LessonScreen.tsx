import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProps, Lesson, VocabularyItem, Progress } from '../types';
import AudioService from '../services/audio';
import DatabaseService from '../services/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

interface LessonStep {
  id: string;
  type: 'introduction' | 'vocabulary' | 'cultural' | 'practice' | 'summary';
  title: string;
  content: any;
}

export default function LessonScreen({ navigation, route }: NavigationProps) {
  const [lesson] = useState<Lesson>(route?.params?.lesson);
  const [currentStep, setCurrentStep] = useState(0);
  const [lessonSteps, setLessonSteps] = useState<LessonStep[]>([]);
  const [selectedVocabulary, setSelectedVocabulary] = useState<VocabularyItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime] = useState(Date.now());
  const [scaleAnimation] = useState(new Animated.Value(1));

  useEffect(() => {
    if (lesson) {
      initializeLesson();
    }
    
    // Track time spent
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [lesson]);

  const initializeLesson = () => {
    const steps: LessonStep[] = [
      {
        id: 'intro',
        type: 'introduction',
        title: 'Lesson Introduction',
        content: {
          title: lesson.title,
          description: lesson.description,
          objectives: lesson.learningObjectives,
          estimatedTime: lesson.estimatedDuration,
        }
      },
      {
        id: 'vocabulary',
        type: 'vocabulary',
        title: 'Vocabulary',
        content: lesson.vocabulary || []
      },
      {
        id: 'cultural',
        type: 'cultural',
        title: 'Cultural Context',
        content: lesson.culturalNotes || []
      },
      {
        id: 'practice',
        type: 'practice',
        title: 'Practice',
        content: lesson.vocabulary || []
      },
      {
        id: 'summary',
        type: 'summary',
        title: 'Lesson Summary',
        content: {
          vocabulary: lesson.vocabulary || [],
          culturalNotes: lesson.culturalNotes || [],
          xpReward: lesson.xpReward,
        }
      }
    ];

    setLessonSteps(steps);
    setLessonProgress(0);
  };

  const handleNextStep = () => {
    if (currentStep < lessonSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setLessonProgress(((currentStep + 1) / lessonSteps.length) * 100);
    } else {
      completeLesson();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setLessonProgress(((currentStep - 1) / lessonSteps.length) * 100);
    }
  };

  const completeLesson = async () => {
    try {
      const userId = await AsyncStorage.getItem('currentUserId');
      if (!userId) return;

      // Save lesson progress
      const progress: Progress = {
        id: `progress-${lesson.id}-${userId}`,
        userId,
        lessonId: lesson.id,
        completed: true,
        score: 100,
        attempts: 1,
        timeSpent,
        completedAt: new Date(),
        lastAttempt: new Date(),
      };

      await DatabaseService.updateProgress(progress);

      // Update user XP
      const user = await DatabaseService.getUser(userId);
      if (user) {
        await DatabaseService.updateUser(userId, {
          xp: user.xp + lesson.xpReward,
        });
      }

      Alert.alert(
        'Lesson Complete! 🎉',
        `You earned ${lesson.xpReward} XP!`,
        [
          { text: 'Continue Learning', onPress: () => navigation.goBack() }
        ]
      );
    } catch (error) {
      console.error('Error completing lesson:', error);
      Alert.alert('Error', 'Failed to save lesson progress');
    }
  };

  const openVocabularyModal = (vocabulary: VocabularyItem) => {
    setSelectedVocabulary(vocabulary);
    setModalVisible(true);
  };

  const playVocabularyAudio = async (word: string) => {
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

  const renderIntroductionStep = (content: any) => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>{content.title}</Text>
      <Text style={styles.stepDescription}>{content.description}</Text>
      
      <View style={styles.metaContainer}>
        <View style={styles.metaItem}>
          <Icon name="access-time" size={16} color="#666" />
          <Text style={styles.metaText}>{content.estimatedTime} minutes</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon name="stars" size={16} color="#FFD700" />
          <Text style={styles.metaText}>{lesson.xpReward} XP</Text>
        </View>
      </View>

      <Text style={styles.objectivesTitle}>Learning Objectives:</Text>
      {content.objectives.map((objective: string, index: number) => (
        <View key={index} style={styles.objectiveItem}>
          <Icon name="check-circle" size={16} color="#4CAF50" />
          <Text style={styles.objectiveText}>{objective}</Text>
        </View>
      ))}
    </View>
  );

  const renderVocabularyStep = (vocabulary: VocabularyItem[]) => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Vocabulary</Text>
      <Text style={styles.stepDescription}>
        Tap on any word to hear pronunciation and see more details
      </Text>
      
      <View style={styles.vocabularyGrid}>
        {vocabulary.map((word, index) => (
          <TouchableOpacity
            key={index}
            style={styles.vocabularyCard}
            onPress={() => openVocabularyModal(word)}
          >
            <View style={styles.vocabularyHeader}>
              <Text style={styles.shonaWord}>{word.shona}</Text>
              <TouchableOpacity
                onPress={() => playVocabularyAudio(word.shona)}
                style={styles.audioButton}
              >
                <Animated.View style={{ transform: [{ scale: scaleAnimation }] }}>
                  <Icon name="volume-up" size={20} color="#4CAF50" />
                </Animated.View>
              </TouchableOpacity>
            </View>
            <Text style={styles.englishWord}>{word.english}</Text>
            {word.phonetic && (
              <Text style={styles.phoneticText}>/{word.phonetic}/</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCulturalStep = (culturalNotes: string[]) => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Cultural Context</Text>
      <Text style={styles.stepDescription}>
        Understanding culture helps you use the language appropriately
      </Text>
      
      {culturalNotes.map((note, index) => (
        <View key={index} style={styles.culturalNote}>
          <Icon name="lightbulb" size={20} color="#FF9800" />
          <Text style={styles.culturalNoteText}>{note}</Text>
        </View>
      ))}
    </View>
  );

  const renderPracticeStep = (vocabulary: VocabularyItem[]) => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Practice</Text>
      <Text style={styles.stepDescription}>
        Practice pronouncing these words
      </Text>
      
      <View style={styles.practiceContainer}>
        {vocabulary.slice(0, 5).map((word, index) => (
          <TouchableOpacity
            key={index}
            style={styles.practiceCard}
            onPress={() => playVocabularyAudio(word.shona)}
          >
            <Text style={styles.practiceShona}>{word.shona}</Text>
            <Text style={styles.practiceEnglish}>{word.english}</Text>
            <Icon name="mic" size={24} color="#2196F3" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSummaryStep = (content: any) => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Lesson Complete!</Text>
      <Text style={styles.stepDescription}>
        Great job! You've completed this lesson.
      </Text>
      
      <View style={styles.summaryStats}>
        <View style={styles.summaryItem}>
          <Icon name="translate" size={24} color="#4CAF50" />
          <Text style={styles.summaryValue}>{content.vocabulary.length}</Text>
          <Text style={styles.summaryLabel}>Words Learned</Text>
        </View>
        <View style={styles.summaryItem}>
          <Icon name="access-time" size={24} color="#2196F3" />
          <Text style={styles.summaryValue}>{Math.ceil(timeSpent / 60)}</Text>
          <Text style={styles.summaryLabel}>Minutes</Text>
        </View>
        <View style={styles.summaryItem}>
          <Icon name="stars" size={24} color="#FFD700" />
          <Text style={styles.summaryValue}>{content.xpReward}</Text>
          <Text style={styles.summaryLabel}>XP Earned</Text>
        </View>
      </View>
    </View>
  );

  const renderCurrentStep = () => {
    const step = lessonSteps[currentStep];
    if (!step) return null;

    switch (step.type) {
      case 'introduction':
        return renderIntroductionStep(step.content);
      case 'vocabulary':
        return renderVocabularyStep(step.content);
      case 'cultural':
        return renderCulturalStep(step.content);
      case 'practice':
        return renderPracticeStep(step.content);
      case 'summary':
        return renderSummaryStep(step.content);
      default:
        return null;
    }
  };

  if (!lesson) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lesson not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#4CAF50', '#2E7D32']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{lesson.title}</Text>
          <Text style={styles.headerSubtitle}>
            Step {currentStep + 1} of {lessonSteps.length}
          </Text>
        </View>
      </LinearGradient>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${lessonProgress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(lessonProgress)}%</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
          onPress={handlePreviousStep}
          disabled={currentStep === 0}
        >
          <Icon name="arrow-back" size={20} color={currentStep === 0 ? '#ccc' : '#4CAF50'} />
          <Text style={[styles.navButtonText, currentStep === 0 && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleNextStep}>
          <Text style={styles.navButtonText}>
            {currentStep === lessonSteps.length - 1 ? 'Complete' : 'Next'}
          </Text>
          <Icon name="arrow-forward" size={20} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Vocabulary Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedVocabulary && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Word Details</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Icon name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalWordContainer}>
                  <TouchableOpacity
                    onPress={() => playVocabularyAudio(selectedVocabulary.shona)}
                    style={styles.modalWordDisplay}
                  >
                    <Text style={styles.modalShonaWord}>{selectedVocabulary.shona}</Text>
                    <Text style={styles.modalEnglishWord}>{selectedVocabulary.english}</Text>
                    <Icon name="volume-up" size={32} color="#4CAF50" />
                  </TouchableOpacity>
                  
                  {selectedVocabulary.phonetic && (
                    <Text style={styles.modalPhoneticText}>
                      /{selectedVocabulary.phonetic}/
                    </Text>
                  )}
                  
                  {selectedVocabulary.usage && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Usage:</Text>
                      <Text style={styles.modalSectionText}>{selectedVocabulary.usage}</Text>
                    </View>
                  )}
                  
                  {selectedVocabulary.example && (
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Example:</Text>
                      <Text style={styles.modalSectionText}>{selectedVocabulary.example}</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
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
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 1,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  objectivesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  objectiveText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  vocabularyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vocabularyCard: {
    width: (width - 50) / 2,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
  },
  vocabularyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  shonaWord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  audioButton: {
    padding: 2,
  },
  englishWord: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  phoneticText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  culturalNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  culturalNoteText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    flex: 1,
    lineHeight: 20,
  },
  practiceContainer: {
    marginTop: 10,
  },
  practiceCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
  },
  practiceShona: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    flex: 1,
  },
  practiceEnglish: {
    fontSize: 14,
    color: '#666',
    marginRight: 10,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    elevation: 1,
    marginTop: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  navButtonDisabled: {
    backgroundColor: '#f8f8f8',
  },
  navButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    marginHorizontal: 8,
  },
  navButtonTextDisabled: {
    color: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalWordContainer: {
    alignItems: 'center',
  },
  modalWordDisplay: {
    alignItems: 'center',
    marginBottom: 15,
  },
  modalShonaWord: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  modalEnglishWord: {
    fontSize: 18,
    color: '#666',
    marginBottom: 10,
  },
  modalPhoneticText: {
    fontSize: 16,
    color: '#2196F3',
    fontFamily: 'monospace',
    marginBottom: 15,
  },
  modalSection: {
    width: '100%',
    marginBottom: 15,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  modalSectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});