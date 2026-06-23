import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { User } from '../types';
import DatabaseService from '../services/database';

const { width, height } = Dimensions.get('window');

interface OnboardingScreenProps {
  onComplete: (user: User) => void;
}

interface OnboardingStep {
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: 'Welcome to Shona Learning! 🇿🇼',
    subtitle: 'Discover the beautiful language of Zimbabwe',
    description: 'Learn Shona through interactive lessons, games, and voice practice designed for all ages.',
    icon: 'language',
  },
  {
    title: 'Interactive Learning 📚',
    subtitle: 'Fun and engaging lessons',
    description: 'Master Shona with multiple choice questions, translations, pronunciation practice, and cultural insights.',
    icon: 'school',
  },
  {
    title: 'Track Your Progress 📈',
    subtitle: 'Watch your skills grow',
    description: 'Earn XP, unlock achievements, maintain streaks, and see your Shona proficiency improve over time.',
    icon: 'trending-up',
  },
];

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Show user setup form
      setCurrentStep(onboardingSteps.length);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateUser = async () => {
    if (!name.trim()) return;

    try {
      setIsCreatingUser(true);
      
      const newUser: Omit<User, 'id'> = {
        name: name.trim(),
        email: email.trim() || 'user@shona.app',
        level: 1,
        xp: 0,
        hearts: 5,
        streak: 0,
        lastActive: new Date(),
        createdAt: new Date(),
      };

      const userId = await DatabaseService.createUser(newUser);
      const user = await DatabaseService.getUser(userId);
      
      if (user) {
        onComplete(user);
      }
    } catch (error) {
      console.error('Error creating user:', error);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const isUserSetupStep = currentStep >= onboardingSteps.length;

  return (
    <LinearGradient
      colors={['#4CAF50', '#2E7D32']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index <= currentStep ? styles.progressDotActive : null,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.contentContainer}>
          {!isUserSetupStep ? (
            // Onboarding Steps
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <Icon 
                  name={onboardingSteps[currentStep].icon} 
                  size={80} 
                  color="white" 
                />
              </View>
              
              <Text style={styles.title}>
                {onboardingSteps[currentStep].title}
              </Text>
              
              <Text style={styles.subtitle}>
                {onboardingSteps[currentStep].subtitle}
              </Text>
              
              <Text style={styles.description}>
                {onboardingSteps[currentStep].description}
              </Text>
            </View>
          ) : (
            // User Setup Form
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <Icon name="person-add" size={80} color="white" />
              </View>
              
              <Text style={styles.title}>Let's Get Started!</Text>
              <Text style={styles.subtitle}>Tell us about yourself</Text>
              
              <View style={styles.formContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor="#888"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
                
                <TextInput
                  style={styles.input}
                  placeholder="Email (optional)"
                  placeholderTextColor="#888"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
          )}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[styles.button, styles.backButton]}
              onPress={handleBack}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.spacer} />
          
          {!isUserSetupStep ? (
            <TouchableOpacity
              style={[styles.button, styles.nextButton]}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1 ? 'Continue' : 'Next'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button, 
                styles.nextButton,
                (!name.trim() || isCreatingUser) && styles.disabledButton
              ]}
              onPress={handleCreateUser}
              disabled={!name.trim() || isCreatingUser}
            >
              <Text style={styles.nextButtonText}>
                {isCreatingUser ? 'Creating...' : 'Get Started'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 6,
  },
  progressDotActive: {
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: '100%',
    marginTop: 30,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 100,
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'white',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nextButton: {
    backgroundColor: 'white',
  },
  nextButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  spacer: {
    flex: 1,
  },
});