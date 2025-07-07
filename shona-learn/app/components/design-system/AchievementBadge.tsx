'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { zimbabweanTheme } from '../../../lib/design-system/zimbabwean-theme'

interface AchievementBadgeProps {
  type: 'streak' | 'milestone' | 'cultural' | 'elder' | 'community' | 'mastery'
  title: string
  description?: string
  level?: number
  earned?: boolean
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
  showConfetti?: boolean
  culturalSymbol?: string
  rarity?: 'common' | 'rare' | 'legendary'
  onClick?: () => void
  className?: string
}

export default function AchievementBadge({
  type,
  title,
  description,
  level = 1,
  earned = false,
  size = 'medium',
  animated = true,
  showConfetti = true,
  culturalSymbol,
  rarity = 'common',
  onClick,
  className = '',
}: AchievementBadgeProps) {
  const [isRevealing, setIsRevealing] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (earned && animated) {
      setIsRevealing(true)
      if (showConfetti) {
        setTimeout(() => setShowCelebration(true), 500)
        setTimeout(() => setShowCelebration(false), 3000)
      }
    }
  }, [earned, animated, showConfetti])

  const sizes = {
    small: { width: 60, height: 60, fontSize: '24px' },
    medium: { width: 80, height: 80, fontSize: '32px' },
    large: { width: 120, height: 120, fontSize: '48px' },
  }

  const badgeTypes = {
    streak: {
      symbol: '🔥',
      gradient: zimbabweanTheme.gradients.sunset,
      culturalName: 'Moto (Fire)',
    },
    milestone: {
      symbol: '🏔️',
      gradient: zimbabweanTheme.gradients.kopje,
      culturalName: 'Kopje (Hill)',
    },
    cultural: {
      symbol: '🎭',
      gradient: zimbabweanTheme.gradients.savanna,
      culturalName: 'Tsika (Culture)',
    },
         elder: {
       symbol: '👴🏿',
       gradient: zimbabweanTheme.gradients.kopje,
       culturalName: 'Sekuru (Elder)',
     },
    community: {
      symbol: '👥',
      gradient: zimbabweanTheme.gradients.river,
      culturalName: 'Ubuntu (Community)',
    },
    mastery: {
      symbol: '🎯',
      gradient: `linear-gradient(135deg, ${zimbabweanTheme.colors.flag.gold}, ${zimbabweanTheme.colors.flag.white})`,
      culturalName: 'Nyanzvi (Expert)',
    },
  }

  const rarityStyles = {
    common: {
      border: `3px solid ${zimbabweanTheme.colors.flag.green}`,
      glow: `0 0 20px ${zimbabweanTheme.colors.flag.green}40`,
    },
    rare: {
      border: `3px solid ${zimbabweanTheme.colors.flag.gold}`,
      glow: `0 0 30px ${zimbabweanTheme.colors.flag.gold}60`,
    },
    legendary: {
      border: `3px solid ${zimbabweanTheme.colors.flag.red}`,
      glow: `0 0 40px ${zimbabweanTheme.colors.flag.red}80`,
    },
  }

  const { width, height, fontSize } = sizes[size]
  const badgeConfig = badgeTypes[type]
  const rarityConfig = rarityStyles[rarity]

  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="relative cursor-pointer group"
        style={{ width, height }}
        onClick={onClick}
        initial={earned ? { scale: 0, rotate: -180 } : { scale: 1, opacity: 0.3 }}
        animate={earned ? { 
          scale: 1, 
          rotate: 0,
          opacity: 1
        } : { 
          scale: 1, 
          opacity: 0.3 
        }}
        transition={{ 
          duration: animated ? 1 : 0,
          type: 'spring',
          stiffness: 200,
          damping: 20 
        }}
        whileHover={earned ? { 
          scale: 1.1,
          transition: { duration: 0.2 }
        } : {}}
        role="button"
        tabIndex={onClick ? 0 : -1}
        aria-label={`${earned ? 'Earned' : 'Locked'} achievement: ${title}`}
      >
        {/* Background circle */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: earned ? badgeConfig.gradient : zimbabweanTheme.colors.surface.medium,
            border: earned ? rarityConfig.border : `2px solid ${zimbabweanTheme.colors.text.light}`,
            boxShadow: earned ? rarityConfig.glow : 'none',
          }}
        />

        {/* Traditional pattern overlay */}
        {earned && (
          <div
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              backgroundImage: zimbabweanTheme.patterns.chevron,
              backgroundSize: '16px 16px',
              clipPath: 'circle(50% at center)',
            }}
          />
        )}

        {/* Main symbol */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontSize }}
        >
          {earned ? (culturalSymbol || badgeConfig.symbol) : '🔒'}
        </div>

        {/* Level indicator */}
        {earned && level > 1 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="absolute -top-2 -right-2"
            style={{
              background: zimbabweanTheme.colors.flag.gold,
              color: zimbabweanTheme.colors.flag.black,
              borderRadius: '50%',
              width: size === 'small' ? '20px' : '24px',
              height: size === 'small' ? '20px' : '24px',
              fontSize: size === 'small' ? '10px' : '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${zimbabweanTheme.colors.flag.white}`,
            }}
          >
            {level}
          </motion.div>
        )}

        {/* Rarity glow effect */}
        {earned && rarity !== 'common' && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                rarityConfig.glow,
                `0 0 ${rarity === 'legendary' ? '60px' : '40px'} ${
                  rarity === 'legendary' 
                    ? zimbabweanTheme.colors.flag.red + '40'
                    : zimbabweanTheme.colors.flag.gold + '40'
                }`,
                rarityConfig.glow,
              ],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        )}

        {/* Tooltip on hover */}
        <AnimatePresence>
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none z-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              background: zimbabweanTheme.colors.flag.black,
              color: zimbabweanTheme.colors.flag.white,
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: zimbabweanTheme.fonts.ubuntu,
              whiteSpace: 'nowrap',
              maxWidth: '200px',
              textAlign: 'center',
              boxShadow: zimbabweanTheme.shadows.gentle,
            }}
          >
            <div className="font-semibold">{title}</div>
            {description && (
              <div className="text-xs opacity-80 mt-1">{description}</div>
            )}
            <div className="text-xs opacity-60 mt-1">
              {badgeConfig.culturalName}
            </div>
            
            {/* Tooltip arrow */}
            <div
              className="absolute top-full left-1/2 transform -translate-x-1/2"
              style={{
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: `6px solid ${zimbabweanTheme.colors.flag.black}`,
              }}
            />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Celebration confetti */}
      <AnimatePresence>
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(16)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  x: width / 2,
                  y: height / 2,
                  scale: 0,
                  rotate: 0,
                }}
                animate={{
                  x: width / 2 + (Math.random() - 0.5) * 200,
                  y: height / 2 + (Math.random() - 0.5) * 200,
                  scale: [0, 1, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  ease: 'easeOut',
                }}
                style={{
                  position: 'absolute',
                  fontSize: '16px',
                  color: Object.values(zimbabweanTheme.colors.flag)[
                    Math.floor(Math.random() * 3)
                  ],
                }}
              >
                {['✨', '🎉', '⭐', '💫'][Math.floor(Math.random() * 4)]}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Achievement earning sound effect */}
      {earned && animated && (
        <audio autoPlay>
          <source src="/audio/effects/achievement.mp3" type="audio/mpeg" />
        </audio>
      )}
    </div>
  )
}