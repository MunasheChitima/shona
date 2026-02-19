import { lazy } from 'react'

// Lazy load heavy components
export const LazyExerciseModal = lazy(() => import('./ExerciseModal'))
export const LazyCelebrationModal = lazy(() => import('./CelebrationModal'))
export const LazyOnboardingFlow = lazy(() => import('./OnboardingFlow'))
export const LazyVoiceNavigationWrapper = lazy(() => import('./VoiceNavigationWrapper'))
export const LazySocialLearning = lazy(() => import('./SocialLearning'))
export const LazyIntrinsicMotivationTracker = lazy(() => import('./IntrinsicMotivationTracker'))

// Lazy load voice components
export const LazyPronunciationPractice = lazy(() => import('./voice/PronunciationPractice'))
export const LazySpeechRecognition = lazy(() => import('./voice/SpeechRecognition'))
export const LazyTextToSpeech = lazy(() => import('./voice/TextToSpeech')) 