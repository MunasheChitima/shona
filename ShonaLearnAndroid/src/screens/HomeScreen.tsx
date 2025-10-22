import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProps, User, Progress, Lesson, SessionStats } from '../types';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: NavigationProps) {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress[]>([]);
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalPracticed: 0,
    averageAccuracy: 0,
    masteredWords: 0,
    timeSpent: 0,
    xpEarned: 0,
    streakDays: 0,
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    // Load user data, progress, and statistics
    // This will be implemented with actual database calls
    console.log('Loading user data...');
  };

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: string;
    icon: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Icon name={icon} size={24} color={color} />
      <View style={styles.statTextContainer}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );

  const QuickAccessCard = ({ title, description, icon, onPress, color }: {
    title: string;
    description: string;
    icon: string;
    onPress: () => void;
    color: string[];
  }) => (
    <TouchableOpacity style={styles.quickAccessCard} onPress={onPress}>
      <LinearGradient colors={color} style={styles.quickAccessGradient}>
        <Icon name={icon} size={32} color="white" />
        <Text style={styles.quickAccessTitle}>{title}</Text>
        <Text style={styles.quickAccessDescription}>{description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Mhoro! 👋</Text>
        <Text style={styles.subGreeting}>Welcome back to your Shona learning journey</Text>
      </View>

      {/* User Progress Summary */}
      <View style={styles.progressSection}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.progressCard}>
          <View style={styles.levelContainer}>
            <Icon name="star" size={24} color="#FFD700" />
            <Text style={styles.levelText}>Level 1</Text>
          </View>
          <View style={styles.xpContainer}>
            <Text style={styles.xpText}>0 XP</Text>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: '0%' }]} />
            </View>
            <Text style={styles.xpTarget}>/ 100 XP</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Today's Stats</Text>
        <View style={styles.statsGrid}>
          <StatCard
            title="Streak"
            value="0 days"
            icon="local-fire-department"
            color="#FF5722"
          />
          <StatCard
            title="Lessons"
            value="0"
            icon="book"
            color="#2196F3"
          />
          <StatCard
            title="Words"
            value="0"
            icon="translate"
            color="#4CAF50"
          />
          <StatCard
            title="Time"
            value="0 min"
            icon="access-time"
            color="#9C27B0"
          />
        </View>
      </View>

      {/* Quick Access */}
      <View style={styles.quickAccessSection}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          <QuickAccessCard
            title="Start Learning"
            description="Begin your next lesson"
            icon="play-arrow"
            color={['#4CAF50', '#2E7D32']}
            onPress={() => navigation.navigate('Learn')}
          />
          <QuickAccessCard
            title="Practice Speaking"
            description="Improve pronunciation"
            icon="mic"
            color={['#2196F3', '#1565C0']}
            onPress={() => navigation.navigate('Pronunciation')}
          />
          <QuickAccessCard
            title="Flashcards"
            description="Review vocabulary"
            icon="style"
            color={['#FF9800', '#F57C00']}
            onPress={() => navigation.navigate('Flashcards')}
          />
          <QuickAccessCard
            title="Quests"
            description="Complete challenges"
            icon="map"
            color={['#9C27B0', '#7B1FA2']}
            onPress={() => navigation.navigate('Quests')}
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.recentCard}>
          <Icon name="schedule" size={24} color="#666" />
          <Text style={styles.recentText}>
            Start your first lesson to see your activity here
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
  },
  progressSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  levelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  xpText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  xpBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  xpFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  xpTarget: {
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    width: (width - 50) / 2,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statTextContainer: {
    marginLeft: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  quickAccessSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    width: (width - 50) / 2,
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  quickAccessGradient: {
    padding: 20,
    alignItems: 'center',
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textAlign: 'center',
  },
  quickAccessDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  recentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  recentText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 15,
    flex: 1,
  },
});