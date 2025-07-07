'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ShonaButton,
  ProgressBaobab,
  AchievementBadge,
  CulturalCard,
  zimbabweanTheme,
} from '../components/design-system'
import MobileOptimizedFlashcard from '../components/design-system/MobileOptimizedFlashcard'

export default function DesignShowcase() {
  const [progress, setProgress] = useState(75)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const achievements = [
    { type: 'streak' as const, title: 'Fire Starter', earned: true, level: 7, rarity: 'common' as const },
    { type: 'cultural' as const, title: 'Culture Explorer', earned: true, level: 3, rarity: 'rare' as const },
    { type: 'mastery' as const, title: 'Shona Master', earned: false, level: 1, rarity: 'legendary' as const },
  ]

  const flashcardExample = {
    id: '1',
    shona: 'Mauya',
    english: 'Welcome',
    pronunciation: 'mah-oo-yah',
    culturalNote: 'Traditional greeting showing hospitality, fundamental to Zimbabwean culture',
    example: 'Mauya mukoma - Welcome, brother',
    audioUrl: '/audio/mauya.mp3',
  }

  return (
    <div className="min-h-screen bg-gradient-sunrise p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-shona-xl font-nunito font-bold text-gray-800 mb-4">
            Zimbabwean Design System
          </h1>
          <p className="text-shona-lg text-gray-600 mb-8">
            Cultural components inspired by the beauty of Zimbabwe
          </p>
          <div className="text-6xl animate-mbira mb-6">🇿🇼</div>
        </motion.div>

        {/* Component Showcase Grid */}
        <div className="space-y-16">
          
          {/* Buttons Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CulturalCard variant="savanna" size="large">
              <h2 className="text-2xl font-nunito font-bold mb-6 text-center">
                Shona Buttons
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <ShonaButton variant="primary" size="large" className="mb-4">
                    Primary Action
                  </ShonaButton>
                  <p className="text-sm text-gray-600">Flag colors with cultural patterns</p>
                </div>
                <div className="text-center">
                  <ShonaButton variant="secondary" size="large" className="mb-4">
                    Secondary Action
                  </ShonaButton>
                  <p className="text-sm text-gray-600">River and savanna gradient</p>
                </div>
                <div className="text-center">
                  <ShonaButton variant="accent" size="large" culturalPattern className="mb-4">
                    Accent Action
                  </ShonaButton>
                  <p className="text-sm text-gray-600">With traditional patterns</p>
                </div>
              </div>
            </CulturalCard>
          </motion.section>

          {/* Progress Indicators */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CulturalCard variant="river" size="large">
              <h2 className="text-2xl font-nunito font-bold mb-6 text-center">
                Progress Baobab Tree
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="text-center">
                  <ProgressBaobab
                    progress={25}
                    level={1}
                    size="medium"
                    showBirds={false}
                    label="Getting Started"
                    className="mb-4"
                  />
                  <p className="text-sm text-gray-600">Early growth stage</p>
                </div>
                <div className="text-center">
                  <ProgressBaobab
                    progress={progress}
                    level={5}
                    size="large"
                    showBirds={true}
                    label="Steady Progress"
                    className="mb-4"
                  />
                  <ShonaButton
                    size="small"
                    onClick={() => setProgress(Math.min(100, progress + 10))}
                    className="mr-2"
                  >
                    Grow
                  </ShonaButton>
                  <ShonaButton
                    size="small"
                    variant="secondary"
                    onClick={() => setProgress(Math.max(0, progress - 10))}
                  >
                    Reset
                  </ShonaButton>
                  <p className="text-sm text-gray-600 mt-2">Interactive demo</p>
                </div>
                <div className="text-center">
                  <ProgressBaobab
                    progress={100}
                    level={10}
                    size="medium"
                    showBirds={true}
                    label="Mastery Achieved!"
                    className="mb-4"
                  />
                  <p className="text-sm text-gray-600">Full canopy with birds</p>
                </div>
              </div>
            </CulturalCard>
          </motion.section>

          {/* Achievement Badges */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CulturalCard variant="sunset" size="large">
              <h2 className="text-2xl font-nunito font-bold mb-6 text-center">
                Achievement Badges
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {achievements.map((achievement, index) => (
                  <div key={index} className="text-center">
                    <AchievementBadge
                      type={achievement.type}
                      title={achievement.title}
                      description={`Level ${achievement.level} achievement`}
                      level={achievement.level}
                      earned={achievement.earned}
                      rarity={achievement.rarity}
                      size="large"
                      className="mb-4"
                    />
                    <p className="text-sm text-gray-600 capitalize">
                      {achievement.rarity} • {achievement.earned ? 'Earned' : 'Locked'}
                    </p>
                  </div>
                ))}
              </div>
            </CulturalCard>
          </motion.section>

          {/* Cultural Cards */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CulturalCard variant="kopje" size="large">
              <h2 className="text-2xl font-nunito font-bold mb-6 text-center">
                Cultural Card Variants
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {['sunrise', 'sunset', 'savanna', 'river', 'kopje'].map((variant) => (
                  <CulturalCard
                    key={variant}
                    variant={variant as any}
                    pattern="chevron"
                    interactive
                    culturalContext={variant.charAt(0).toUpperCase() + variant.slice(1)}
                    className="h-32"
                  >
                    <div className="text-center">
                      <h3 className="font-semibold text-gray-800 mb-2 capitalize">
                        {variant} Theme
                      </h3>
                      <p className="text-sm text-gray-600">
                        With traditional patterns
                      </p>
                    </div>
                  </CulturalCard>
                ))}
              </div>
            </CulturalCard>
          </motion.section>

          {/* Mobile Flashcard */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <CulturalCard variant="sunrise" size="large">
              <h2 className="text-2xl font-nunito font-bold mb-6 text-center">
                Mobile-Optimized Flashcard
              </h2>
              <div className="flex flex-col items-center">
                <MobileOptimizedFlashcard
                  card={flashcardExample}
                  onSwipeLeft={() => console.log('Marked as hard')}
                  onSwipeRight={() => console.log('Marked as easy')}
                  onSwipeUp={() => console.log('Added to favorites')}
                  className="mb-8"
                />
                <p className="text-sm text-gray-600 text-center max-w-md">
                  Swipe left for hard, right for easy, up for favorite. 
                  Tap to flip and see translation with cultural context.
                </p>
              </div>
            </CulturalCard>
          </motion.section>

          {/* Typography & Colors */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <CulturalCard variant="savanna" size="large">
              <h2 className="text-2xl font-nunito font-bold mb-6 text-center">
                Typography & Colors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-nunito font-bold mb-4">Cultural Typography</h3>
                  <div className="space-y-2">
                    <div className="text-shona-xl font-nunito">Shona XL Heading</div>
                    <div className="text-shona-lg font-nunito">Shona Large Text</div>
                    <div className="text-shona-base font-ubuntu">Ubuntu body text for readability</div>
                    <div className="font-ubuntu text-sm">Small supporting text</div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-nunito font-bold mb-4">Flag Colors</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className="h-16 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: zimbabweanTheme.colors.flag.green }}
                    >
                      Green
                    </div>
                    <div 
                      className="h-16 rounded-lg flex items-center justify-center text-black font-semibold"
                      style={{ backgroundColor: zimbabweanTheme.colors.flag.gold }}
                    >
                      Gold
                    </div>
                    <div 
                      className="h-16 rounded-lg flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: zimbabweanTheme.colors.flag.red }}
                    >
                      Red
                    </div>
                    <div 
                      className="h-16 rounded-lg flex items-center justify-center text-gray-600 font-semibold border-2 border-gray-200"
                      style={{ backgroundColor: zimbabweanTheme.colors.flag.white }}
                    >
                      White
                    </div>
                  </div>
                </div>
              </div>
            </CulturalCard>
          </motion.section>

          {/* Gradients & Patterns */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <CulturalCard variant="river" size="large">
              <h2 className="text-2xl font-nunito font-bold mb-6 text-center">
                Cultural Patterns & Gradients
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-nunito font-bold mb-4">African Gradients</h3>
                  <div className="space-y-3">
                    {Object.entries(zimbabweanTheme.gradients).map(([name, gradient]) => (
                      <div key={name} className="flex items-center gap-3">
                        <div 
                          className="w-16 h-8 rounded"
                          style={{ background: gradient }}
                        />
                        <span className="font-ubuntu capitalize">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-nunito font-bold mb-4">Traditional Patterns</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className="h-16 rounded pattern-chevron opacity-80"
                      title="Chevron - Great Zimbabwe"
                    />
                    <div 
                      className="h-16 rounded pattern-checkerboard opacity-80"
                      title="Checkerboard - Basket weaving"
                    />
                    <div 
                      className="h-16 rounded pattern-waves opacity-80"
                      title="Waves - River patterns"
                    />
                    <div 
                      className="h-16 rounded pattern-zimbabwe-bird opacity-80"
                      title="Zimbabwe bird symbolism"
                    />
                  </div>
                </div>
              </div>
            </CulturalCard>
          </motion.section>

        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16 py-8"
        >
          <p className="text-gray-600 font-ubuntu">
            Built with love for Zimbabwean culture and the Shona language community
          </p>
          <div className="mt-4 text-2xl">🇿🇼 ❤️ 🎨</div>
        </motion.div>
      </div>
    </div>
  )
}