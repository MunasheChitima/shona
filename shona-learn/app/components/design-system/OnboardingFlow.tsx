'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { zimbabweanTheme } from '../../../lib/design-system/zimbabwean-theme'
import ShonaButton from './ShonaButton'
import CulturalCard from './CulturalCard'
import ProgressBaobab from './ProgressBaobab'

interface OnboardingFlowProps {
  onComplete: (userData: OnboardingData) => void
  onSkip?: () => void
}

interface OnboardingData {
  name: string
  learningGoal: 'travel' | 'heritage' | 'business' | 'education' | 'family'
  proficiencyLevel: 'beginner' | 'some_words' | 'basic_conversation' | 'intermediate'
  dialectPreference: 'zezuru' | 'karanga' | 'manyika' | 'ndau' | 'korekore'
  culturalInterest: boolean
  voicePractice: boolean
  timeCommitment: '5min' | '15min' | '30min' | '60min'
}

export default function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userData, setUserData] = useState<Partial<OnboardingData>>({})
  const [showCelebration, setShowCelebration] = useState(false)

  const totalSteps = 7
  const progress = ((currentStep + 1) / totalSteps) * 100

  const steps = [
    'welcome',
    'name',
    'goal',
    'level',
    'dialect',
    'interests',
    'commitment',
  ] as const

  useEffect(() => {
    if (currentStep === totalSteps - 1) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 3000)
    }
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(userData as OnboardingData)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateUserData = (field: keyof OnboardingData, value: any) => {
    setUserData(prev => ({ ...prev, [field]: value }))
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  }

  const renderStep = () => {
    switch (steps[currentStep]) {
      case 'welcome':
        return (
          <CulturalCard
            variant="sunrise"
            size="large"
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-6xl mb-6 animate-mbira">🇿🇼</div>
              <h1 className="text-shona-xl text-gray-800 mb-4 font-nunito">
                Mauya! Welcome!
              </h1>
              <p className="text-shona-lg text-gray-600 mb-8 leading-relaxed">
                Join thousands learning ChiShona, the beautiful language of Zimbabwe. 
                Let's personalize your journey through our rich culture and language.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                  { emoji: '🎯', title: 'Personalized Learning', desc: 'Tailored to your goals' },
                  { emoji: '🎵', title: 'Cultural Context', desc: 'Learn with traditions' },
                  { emoji: '🔊', title: 'Voice Practice', desc: 'Perfect pronunciation' },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.2, duration: 0.5 }}
                    className="text-center p-4"
                  >
                    <div className="text-3xl mb-2">{feature.emoji}</div>
                    <h3 className="font-semibold text-gray-800 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </CulturalCard>
        )

      case 'name':
        return (
          <CulturalCard
            variant="savanna"
            size="large"
            className="text-center max-w-xl mx-auto"
            culturalContext="Personal Introduction"
          >
            <h2 className="text-shona-lg text-gray-800 mb-6 font-nunito">
              What should we call you?
            </h2>
            <p className="text-gray-600 mb-8">
              In Zimbabwean culture, names carry deep meaning and connect us to our ancestors.
            </p>
            <input
              type="text"
              placeholder="Enter your name"
              value={userData.name || ''}
              onChange={(e) => updateUserData('name', e.target.value)}
              className="w-full p-4 border-2 border-green-200 rounded-xl text-center text-lg font-ubuntu focus:border-gold-400 focus:outline-none mb-6"
              style={{
                background: zimbabweanTheme.colors.surface.light,
                borderColor: zimbabweanTheme.colors.flag.green + '40',
              }}
            />
            <div className="text-sm text-gray-500">
              Don't worry, you can change this later in settings
            </div>
          </CulturalCard>
        )

      case 'goal':
        return (
          <CulturalCard
            variant="river"
            size="large"
            className="max-w-4xl mx-auto"
            culturalContext="Learning Purpose"
          >
            <h2 className="text-shona-lg text-gray-800 mb-6 text-center font-nunito">
              Why do you want to learn Shona?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'heritage', emoji: '🏡', title: 'Connect with Heritage', desc: 'Reconnect with your roots and family history' },
                { id: 'travel', emoji: '✈️', title: 'Travel to Zimbabwe', desc: 'Communicate during your visit' },
                { id: 'family', emoji: '👨‍👩‍👧‍👦', title: 'Talk with Family', desc: 'Speak with relatives and loved ones' },
                { id: 'business', emoji: '💼', title: 'Business/Work', desc: 'Professional communication' },
                { id: 'education', emoji: '📚', title: 'Academic Study', desc: 'Language research or studies' },
              ].map((goal) => (
                <motion.div
                  key={goal.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CulturalCard
                    interactive
                    variant={userData.learningGoal === goal.id ? 'sunset' : 'savanna'}
                    onClick={() => updateUserData('learningGoal', goal.id)}
                    className={`h-full cursor-pointer transition-all ${
                      userData.learningGoal === goal.id 
                        ? 'ring-2 ring-gold-400 transform scale-105' 
                        : ''
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{goal.emoji}</div>
                      <h3 className="font-semibold text-gray-800 mb-2">{goal.title}</h3>
                      <p className="text-sm text-gray-600">{goal.desc}</p>
                    </div>
                  </CulturalCard>
                </motion.div>
              ))}
            </div>
          </CulturalCard>
        )

      case 'level':
        return (
          <CulturalCard
            variant="kopje"
            size="large"
            className="max-w-3xl mx-auto"
            culturalContext="Current Knowledge"
          >
            <h2 className="text-shona-lg text-gray-800 mb-6 text-center font-nunito">
              How much Shona do you know?
            </h2>
            <div className="space-y-4">
              {[
                { id: 'beginner', title: 'Complete Beginner', desc: 'Never studied Shona before', example: 'Starting fresh!' },
                { id: 'some_words', title: 'A Few Words', desc: 'Know basic greetings and simple words', example: 'Mhoro, tatenda, mangwanani' },
                { id: 'basic_conversation', title: 'Basic Conversation', desc: 'Can have simple conversations', example: 'Makadii? Ndiri right. Mumazuva ano?' },
                { id: 'intermediate', title: 'Intermediate', desc: 'Comfortable with everyday topics', example: 'Ndine mukana wekutaura nevarimi' },
              ].map((level) => (
                <motion.div
                  key={level.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <CulturalCard
                    interactive
                    variant={userData.proficiencyLevel === level.id ? 'sunrise' : 'savanna'}
                    onClick={() => updateUserData('proficiencyLevel', level.id)}
                    className={`cursor-pointer transition-all ${
                      userData.proficiencyLevel === level.id 
                        ? 'ring-2 ring-gold-400' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">{level.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{level.desc}</p>
                        <div className="text-xs text-green-600 font-ubuntu italic">
                          {level.example}
                        </div>
                      </div>
                      <div className="ml-4">
                        {userData.proficiencyLevel === level.id && (
                          <div className="text-2xl">✅</div>
                        )}
                      </div>
                    </div>
                  </CulturalCard>
                </motion.div>
              ))}
            </div>
          </CulturalCard>
        )

      case 'dialect':
        return (
          <CulturalCard
            variant="sunset"
            size="large"
            className="max-w-3xl mx-auto"
            culturalContext="Regional Variation"
          >
            <h2 className="text-shona-lg text-gray-800 mb-6 text-center font-nunito">
              Which dialect interests you most?
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Shona has beautiful regional variations across Zimbabwe. Each carries unique cultural heritage.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { id: 'zezuru', name: 'ChiZezuru', region: 'Harare & Central', speakers: 'Most common, urban centers' },
                { id: 'karanga', name: 'ChiKaranga', region: 'Masvingo & South', speakers: 'Great Zimbabwe heritage' },
                { id: 'manyika', name: 'ChiManyika', region: 'Manicaland & East', speakers: 'Mountain communities' },
                { id: 'korekore', name: 'ChiKorekore', region: 'Northern Zimbabwe', speakers: 'Traditional stronghold' },
                { id: 'ndau', name: 'ChiNdau', region: 'Eastern Highlands', speakers: 'Cultural bridge' },
              ].map((dialect) => (
                <motion.div
                  key={dialect.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <CulturalCard
                    interactive
                    variant={userData.dialectPreference === dialect.id ? 'sunrise' : 'river'}
                    onClick={() => updateUserData('dialectPreference', dialect.id)}
                    className={`cursor-pointer transition-all ${
                      userData.dialectPreference === dialect.id 
                        ? 'ring-2 ring-gold-400' 
                        : ''
                    }`}
                  >
                    <h3 className="font-semibold text-gray-800 mb-2">{dialect.name}</h3>
                    <p className="text-sm text-gray-600 mb-1">{dialect.region}</p>
                    <p className="text-xs text-green-600">{dialect.speakers}</p>
                  </CulturalCard>
                </motion.div>
              ))}
            </div>
          </CulturalCard>
        )

      case 'interests':
        return (
          <CulturalCard
            variant="savanna"
            size="large"
            className="max-w-3xl mx-auto"
            culturalContext="Learning Preferences"
          >
            <h2 className="text-shona-lg text-gray-800 mb-6 text-center font-nunito">
              What interests you most?
            </h2>
            <div className="space-y-6">
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData.culturalInterest || false}
                    onChange={(e) => updateUserData('culturalInterest', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Cultural Context 🎭</div>
                    <div className="text-sm text-gray-600">
                      Learn about traditions, proverbs, music, and Zimbabwe's rich heritage
                    </div>
                  </div>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userData.voicePractice || false}
                    onChange={(e) => updateUserData('voicePractice', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                  <div>
                    <div className="font-semibold text-gray-800">Voice Practice 🎤</div>
                    <div className="text-sm text-gray-600">
                      Practice pronunciation with speech recognition and audio feedback
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </CulturalCard>
        )

      case 'commitment':
        return (
          <CulturalCard
            variant="sunrise"
            size="large"
            className="max-w-3xl mx-auto"
            culturalContext="Time Investment"
          >
            <h2 className="text-shona-lg text-gray-800 mb-6 text-center font-nunito">
              How much time can you commit daily?
            </h2>
            <p className="text-center text-gray-600 mb-8">
              Consistency matters more than quantity. Even 5 minutes daily builds strong foundations.
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { id: '5min', time: '5 min', desc: 'Quick daily practice', baobab: 25 },
                { id: '15min', time: '15 min', desc: 'Steady progress', baobab: 50 },
                { id: '30min', time: '30 min', desc: 'Strong advancement', baobab: 75 },
                { id: '60min', time: '1 hour', desc: 'Intensive learning', baobab: 100 },
              ].map((option) => (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CulturalCard
                    interactive
                    variant={userData.timeCommitment === option.id ? 'sunset' : 'river'}
                    onClick={() => updateUserData('timeCommitment', option.id)}
                    className={`cursor-pointer text-center transition-all ${
                      userData.timeCommitment === option.id 
                        ? 'ring-2 ring-gold-400' 
                        : ''
                    }`}
                  >
                    <ProgressBaobab
                      progress={option.baobab}
                      size="small"
                      animated={false}
                      showLevel={false}
                      className="mb-4"
                    />
                    <h3 className="font-semibold text-gray-800 mb-1">{option.time}</h3>
                    <p className="text-xs text-gray-600">{option.desc}</p>
                  </CulturalCard>
                </motion.div>
              ))}
            </div>
          </CulturalCard>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-sunrise flex flex-col">
      {/* Header */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-nunito font-bold text-gray-800">
              Welcome to Shona Learning
            </h1>
            {onSkip && (
              <button
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>
          
          {/* Progress indicator */}
          <div className="mb-8">
            <ProgressBaobab
              progress={progress}
              level={currentStep + 1}
              size="medium"
              showBirds={currentStep > 3}
              label={`Step ${currentStep + 1} of ${totalSteps}`}
              className="mb-4"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center">
            <ShonaButton
              variant="secondary"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="min-w-32"
            >
              Back
            </ShonaButton>
            
            <div className="text-sm text-gray-600">
              {currentStep + 1} / {totalSteps}
            </div>
            
            <ShonaButton
              variant="primary"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !userData.name) ||
                (currentStep === 2 && !userData.learningGoal) ||
                (currentStep === 3 && !userData.proficiencyLevel) ||
                (currentStep === 4 && !userData.dialectPreference) ||
                (currentStep === 6 && !userData.timeCommitment)
              }
              className="min-w-32"
              culturalPattern={currentStep === totalSteps - 1}
            >
              {currentStep === totalSteps - 1 ? 'Start Learning!' : 'Next'}
            </ShonaButton>
          </div>
        </div>
      </div>

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              className="text-center text-white"
            >
              <div className="text-6xl mb-4 animate-mbira">🎉</div>
              <h2 className="text-4xl font-nunito font-bold mb-2">Congratulations!</h2>
              <p className="text-xl">Your Shona journey begins now!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}