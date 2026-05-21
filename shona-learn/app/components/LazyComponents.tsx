import { lazy } from 'react'

// Lazy load heavy components
export const LazyExerciseModal = lazy(() => import('./ExerciseModal'))
export const LazyCelebrationModal = lazy(() => import('./CelebrationModal'))
export const LazyOnboardingFlow = lazy(() => import('./OnboardingFlow'))
export const LazySocialLearning = lazy(() => import('./SocialLearning'))
export const LazyIntrinsicMotivationTracker = lazy(() => import('./IntrinsicMotivationTracker'))
