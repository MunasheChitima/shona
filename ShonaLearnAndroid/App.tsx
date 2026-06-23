/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import services
import DatabaseService from './src/services/database';
import AudioService from './src/services/audio';

// Import screens
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import PronunciationScreen from './src/screens/PronunciationScreen';
import QuestsScreen from './src/screens/QuestsScreen';
import FlashcardsScreen from './src/screens/FlashcardsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LessonScreen from './src/screens/LessonScreen';
import ExerciseScreen from './src/screens/ExerciseScreen';

// Import types
import { User } from './src/types';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Learn':
              iconName = 'book';
              break;
            case 'Pronunciation':
              iconName = 'mic';
              break;
            case 'Quests':
              iconName = 'map';
              break;
            case 'Flashcards':
              iconName = 'style';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Learn" 
        component={LearnScreen}
        options={{ tabBarLabel: 'Learn' }}
      />
      <Tab.Screen 
        name="Pronunciation" 
        component={PronunciationScreen}
        options={{ tabBarLabel: 'Speak' }}
      />
      <Tab.Screen 
        name="Quests" 
        component={QuestsScreen}
        options={{ tabBarLabel: 'Quests' }}
      />
      <Tab.Screen 
        name="Flashcards" 
        component={FlashcardsScreen}
        options={{ tabBarLabel: 'Cards' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

// Main stack navigator
function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="Lesson" 
        component={LessonScreen}
        options={{ 
          headerShown: true,
          title: 'Lesson',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: 'white',
        }}
      />
      <Stack.Screen 
        name="Exercise" 
        component={ExerciseScreen}
        options={{ 
          headerShown: true,
          title: 'Exercise',
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: 'white',
        }}
      />
    </Stack.Navigator>
  );
}

export default function App(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setIsLoading(true);

      // Initialize services
      await DatabaseService.init();
      await AudioService.init();

      // Check if this is the first launch
      const hasLaunchedBefore = await AsyncStorage.getItem('hasLaunchedBefore');
      setIsFirstLaunch(!hasLaunchedBefore);

      if (hasLaunchedBefore) {
        // Try to load existing user
        const userId = await AsyncStorage.getItem('currentUserId');
        if (userId) {
          const user = await DatabaseService.getUser(userId);
          if (user) {
            setCurrentUser(user);
            setIsFirstLaunch(false);
          }
        }
      }

      // Load initial content if first launch
      if (!hasLaunchedBefore) {
        await loadInitialContent();
      }

    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialContent = async () => {
    try {
      // Load lessons from JSON data
      const lessonsData = require('./src/data/content/lessons.json');
      
      if (lessonsData && lessonsData.lessons) {
        for (const lesson of lessonsData.lessons) {
          await DatabaseService.insertLesson(lesson);
        }
        console.log('Initial lessons loaded successfully');
      }

      // Load other content as needed (quests, vocabulary, etc.)
      
    } catch (error) {
      console.error('Error loading initial content:', error);
    }
  };

  const handleOnboardingComplete = async (user: User) => {
    try {
      // Mark that the app has been launched before
      await AsyncStorage.setItem('hasLaunchedBefore', 'true');
      await AsyncStorage.setItem('currentUserId', user.id);
      
      setCurrentUser(user);
      setIsFirstLaunch(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (isLoading) {
    // You could show a splash screen here
    return <></>;
  }

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
    flex: 1,
  };

  return (
    <PaperProvider>
      <SafeAreaView style={backgroundStyle}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={isDarkMode ? '#121212' : '#f5f5f5'}
        />
        <NavigationContainer>
          {isFirstLaunch ? (
            <OnboardingScreen onComplete={handleOnboardingComplete} />
          ) : (
            <AppNavigator />
          )}
        </NavigationContainer>
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  // Add any global styles here if needed
});
