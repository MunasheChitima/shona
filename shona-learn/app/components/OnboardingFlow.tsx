'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowRight, FaBook, FaMicrophone, FaTrophy, FaUsers, FaCheck } from 'react-icons/fa'

interface OnboardingFlowProps {
  onComplete: () => void
}

const steps = [
  {
    id: 1,
    title: "Welcome to Learn Shona! 🇿🇼",
    description: "Start your journey to mastering Zimbabwe's beautiful language",
    icon: FaBook,
    content: (
      <div className="text-center">
        <div className="text-6xl mb-4">🎉</div>
        <p className="text-lg text-gray-700">
          Join thousands of learners discovering the rich culture and language of Zimbabwe.
        </p>
      </div>
    )
  },
  {
    id: 2,
    title: "Interactive Lessons",
    description: "Learn through fun, engaging exercises",
    icon: FaBook,
    content: (
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">📚</div>
          <div>
            <h4 className="font-semibold">79 Comprehensive Lessons</h4>
            <p className="text-sm text-gray-600">From basic greetings to advanced conversations</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🎯</div>
          <div>
            <h4 className="font-semibold">Multiple Exercise Types</h4>
            <p className="text-sm text-gray-600">Practice vocabulary, pronunciation, and cultural context</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🌍</div>
          <div>
            <h4 className="font-semibold">Cultural Integration</h4>
            <p className="text-sm text-gray-600">Learn the language within its cultural context</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "Voice Practice",
    description: "Perfect your pronunciation with AI feedback",
    icon: FaMicrophone,
    content: (
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <FaMicrophone className="text-blue-600 text-xl" />
            <h4 className="font-semibold">Speech Recognition</h4>
          </div>
          <p className="text-sm text-gray-700">Get instant feedback on your pronunciation</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <div className="text-xl">🔊</div>
            <h4 className="font-semibold">Native Audio</h4>
          </div>
          <p className="text-sm text-gray-700">Listen to authentic Shona pronunciation</p>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Track Your Progress",
    description: "Earn XP, unlock achievements, and level up",
    icon: FaTrophy,
    content: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-3xl mb-2">🏆</div>
            <h4 className="font-semibold">Achievements</h4>
            <p className="text-xs text-gray-600">Unlock rewards as you learn</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-3xl mb-2">⚡</div>
            <h4 className="font-semibold">Streaks</h4>
            <p className="text-xs text-gray-600">Learn daily to build streaks</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-3xl mb-2">📈</div>
            <h4 className="font-semibold">Progress</h4>
            <p className="text-xs text-gray-600">Track your improvement</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg text-center">
            <div className="text-3xl mb-2">❤️</div>
            <h4 className="font-semibold">Hearts</h4>
            <p className="text-xs text-gray-600">Learn without pressure</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 5,
    title: "Learn Together",
    description: "Join study groups and find learning partners",
    icon: FaUsers,
    content: (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg text-center">
          <FaUsers className="text-4xl text-green-600 mx-auto mb-3" />
          <h4 className="font-semibold mb-2">Community Features</h4>
          <p className="text-sm text-gray-700">
            Connect with fellow learners, join study groups, and practice together
          </p>
        </div>
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <FaCheck className="text-green-500" />
          <span>Safe and supportive environment</span>
        </div>
      </div>
    )
  }
]

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    setIsCompleting(true)
    // Save onboarding completion to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('onboardingCompleted', 'true')
    }
    setTimeout(() => {
      onComplete()
    }, 500)
  }

  const handleSkip = () => {
    handleComplete()
  }

  const step = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden"
      >
        {/* Progress bar */}
        <div className="h-2 bg-gray-200">
          <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-8">
          {/* Step indicator */}
          <div className="flex justify-center mb-6">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full mx-1 transition-colors ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <step.icon className="text-white text-2xl" />
                </div>
              </div>

              {/* Title and description */}
              <h2 className="text-2xl font-bold text-center mb-2">{step.title}</h2>
              <p className="text-gray-600 text-center mb-6">{step.description}</p>

              {/* Content */}
              <div className="mb-8">
                {step.content}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleSkip}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              disabled={isCompleting}
            >
              Skip
            </button>

            <button
              onClick={handleNext}
              disabled={isCompleting}
              className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? "Get Started" : "Next"}</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 