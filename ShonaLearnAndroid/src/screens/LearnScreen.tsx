import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProps, Lesson, Progress, User } from '../types';
import DatabaseService from '../services/database';
import AudioService from '../services/audio';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function LearnScreen({ navigation }: NavigationProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load current user
      const userId = await AsyncStorage.getItem('currentUserId');
      if (userId) {
        const user = await DatabaseService.getUser(userId);
        setCurrentUser(user);
        
        // Load user progress
        const userProgress = await DatabaseService.getUserProgress(userId);
        setProgress(userProgress);
      }
      
      // Load lessons
      const allLessons = await DatabaseService.getAllLessons();
      setLessons(allLessons);
      
    } catch (error) {
      console.error('Error loading learn screen data:', error);
      Alert.alert('Error', 'Failed to load lessons. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'All Lessons', icon: 'book' },
    { id: 'Cultural Immersion', name: 'Culture', icon: 'public' },
    { id: 'Family & Relationships', name: 'Family', icon: 'people' },
    { id: 'Practical Communication', name: 'Communication', icon: 'chat' },
    { id: 'Pronunciation Mastery', name: 'Pronunciation', icon: 'record-voice-over' },
  ];

  const filteredLessons = selectedCategory === 'all' 
    ? lessons 
    : lessons.filter(lesson => lesson.category === selectedCategory);

  const getLessonProgress = (lessonId: string) => {
    return progress.find(p => p.lessonId === lessonId);
  };

  const isLessonUnlocked = (lesson: Lesson) => {
    if (lesson.orderIndex === 1) return true;
    
    const previousLesson = lessons.find(l => l.orderIndex === lesson.orderIndex - 1);
    if (!previousLesson) return true;
    
    const prevProgress = getLessonProgress(previousLesson.id);
    return prevProgress?.completed || false;
  };

  const handleLessonPress = (lesson: Lesson) => {
    if (!isLessonUnlocked(lesson)) {
      Alert.alert(
        'Lesson Locked',
        'Complete the previous lesson to unlock this one.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    navigation.navigate('Lesson', { lesson });
  };

  const CategoryButton = ({ category }: { category: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Icon 
        name={category.icon} 
        size={20} 
        color={selectedCategory === category.id ? 'white' : '#666'} 
      />
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category.id && styles.selectedCategoryButtonText
      ]}>
        {category.name}
      </Text>
    </TouchableOpacity>
  );

  const LessonCard = ({ lesson }: { lesson: Lesson }) => {
    const lessonProgress = getLessonProgress(lesson.id);
    const isUnlocked = isLessonUnlocked(lesson);
    const isCompleted = lessonProgress?.completed || false;
    
    return (
      <TouchableOpacity
        style={[
          styles.lessonCard,
          !isUnlocked && styles.lockedLessonCard,
          isCompleted && styles.completedLessonCard
        ]}
        onPress={() => handleLessonPress(lesson)}
        disabled={!isUnlocked}
      >
        <View style={styles.lessonHeader}>
          <View style={styles.lessonIconContainer}>
            {isCompleted ? (
              <Icon name="check-circle" size={24} color="#4CAF50" />
            ) : !isUnlocked ? (
              <Icon name="lock" size={24} color="#999" />
            ) : (
              <Icon name="play-circle-outline" size={24} color="#2196F3" />
            )}
          </View>
          <View style={styles.lessonInfo}>
            <Text style={[
              styles.lessonTitle,
              !isUnlocked && styles.lockedText
            ]}>
              {lesson.title}
            </Text>
            <Text style={[
              styles.lessonDescription,
              !isUnlocked && styles.lockedText
            ]}>
              {lesson.description}
            </Text>
          </View>
        </View>
        
        <View style={styles.lessonMeta}>
          <View style={styles.metaItem}>
            <Icon name="access-time" size={16} color="#666" />
            <Text style={styles.metaText}>{lesson.estimatedDuration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="stars" size={16} color="#FFD700" />
            <Text style={styles.metaText}>{lesson.xpReward} XP</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="translate" size={16} color="#FF9800" />
            <Text style={styles.metaText}>{lesson.vocabulary?.length || 0} words</Text>
          </View>
        </View>
        
        {/* Pronunciation Preview */}
        {lesson.vocabulary && lesson.vocabulary.length > 0 && (
          <View style={styles.pronunciationPreview}>
            <Text style={styles.previewTitle}>Key Words:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {lesson.vocabulary.slice(0, 3).map((word, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.wordPreview}
                  onPress={() => AudioService.speakShona(word.shona)}
                >
                  <Text style={styles.shonaWord}>{word.shona}</Text>
                  <Text style={styles.englishWord}>{word.english}</Text>
                  {word.phonetic && (
                    <Text style={styles.phoneticText}>/{word.phonetic}/</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading lessons...</Text>
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
        <Text style={styles.headerTitle}>Learn Shona</Text>
        <Text style={styles.headerSubtitle}>
          {currentUser?.name ? `Welcome back, ${currentUser.name}!` : 'Start your learning journey'}
        </Text>
      </LinearGradient>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map(category => (
            <CategoryButton key={category.id} category={category} />
          ))}
        </ScrollView>
      </View>

      {/* Lessons List */}
      <FlatList
        data={filteredLessons}
        renderItem={({ item }) => <LessonCard lesson={item} />}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.lessonsList}
        showsVerticalScrollIndicator={false}
      />
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
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedCategoryButton: {
    backgroundColor: '#4CAF50',
  },
  categoryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  lessonsList: {
    padding: 20,
  },
  lessonCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lockedLessonCard: {
    backgroundColor: '#f8f8f8',
    opacity: 0.7,
  },
  completedLessonCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  lessonIconContainer: {
    marginRight: 12,
    paddingTop: 2,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  lockedText: {
    color: '#999',
  },
  lessonMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  pronunciationPreview: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  wordPreview: {
    marginRight: 15,
    alignItems: 'center',
    minWidth: 80,
  },
  shonaWord: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  englishWord: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  phoneticText: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic',
  },
});