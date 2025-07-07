'use client'
import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { zimbabweanTheme } from '../../../lib/design-system/zimbabwean-theme'

interface ProgressBaobabProps {
  progress: number // 0-100
  level?: number
  showLevel?: boolean
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
  showLeaves?: boolean
  showBirds?: boolean
  label?: string
  className?: string
}

export default function ProgressBaobab({
  progress,
  level = 1,
  showLevel = true,
  size = 'medium',
  animated = true,
  showLeaves = true,
  showBirds = false,
  label,
  className = '',
}: ProgressBaobabProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setAnimatedProgress(progress)
    }
  }, [progress, animated])

  useEffect(() => {
    if (progress === 100 && animated) {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)
    }
  }, [progress, animated])

  const sizes = {
    small: { width: 60, height: 80, trunk: 12 },
    medium: { width: 100, height: 120, trunk: 20 },
    large: { width: 140, height: 160, trunk: 28 },
  }

  const { width, height, trunk } = sizes[size]
  const trunkHeight = Math.max(trunk, (animatedProgress / 100) * (height * 0.6))
  const showBranches = animatedProgress > 30
  const showFullCanopy = animatedProgress > 70
  const branchOpacity = Math.min(1, (animatedProgress - 30) / 40)

  const birds = showBirds ? [
    { delay: 0, direction: 1 },
    { delay: 1, direction: -1 },
    { delay: 2, direction: 1 },
  ] : []

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {/* Container */}
      <div 
        className="relative mx-auto"
        style={{ width, height }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || `Progress: ${progress}%`}
      >
        {/* Ground/roots */}
        <div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
          style={{
            width: width * 0.8,
            height: 8,
            background: `linear-gradient(90deg, ${zimbabweanTheme.colors.cultural.earthBrown}, ${zimbabweanTheme.colors.landscape.kopjeBrown})`,
            borderRadius: '50%',
            opacity: 0.6,
          }}
        />

        {/* Root system (visible when progress > 10) */}
        {animatedProgress > 10 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
            style={{
              width: width * 0.6,
              height: height * 0.3,
              background: `radial-gradient(ellipse at bottom, ${zimbabweanTheme.colors.cultural.earthBrown}30 0%, transparent 70%)`,
            }}
          />
        )}

        {/* Trunk */}
        <motion.div
          className={animated ? 'animate-baobab' : ''}
          initial={{ height: trunk }}
          animate={{ height: trunkHeight }}
          transition={{ duration: animated ? 1.5 : 0, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: trunk,
            background: `linear-gradient(180deg, ${zimbabweanTheme.colors.landscape.baobabGrey}, ${zimbabweanTheme.colors.cultural.earthBrown})`,
            borderRadius: `${trunk/2}px ${trunk/2}px 0 0`,
            boxShadow: `inset 0 0 ${trunk/4}px rgba(0,0,0,0.3)`,
          }}
        />

        {/* Trunk texture lines */}
        {animatedProgress > 20 && (
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
            style={{
              width: trunk * 0.8,
              height: trunkHeight,
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 8px,
                rgba(0,0,0,0.1) 8px,
                rgba(0,0,0,0.1) 10px
              )`,
            }}
          />
        )}

        {/* Main canopy */}
        <AnimatePresence>
          {showBranches && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ 
                opacity: branchOpacity, 
                scale: showFullCanopy ? 1 : 0.7 
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: height * 0.1,
                left: '50%',
                transform: 'translateX(-50%)',
                width: width * 0.8,
                height: height * 0.4,
                background: `radial-gradient(circle, ${zimbabweanTheme.colors.flag.green}90 20%, ${zimbabweanTheme.colors.flag.green}60 50%, transparent 70%)`,
                borderRadius: '50%',
                filter: 'blur(1px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Detailed leaves (when progress > 50) */}
        {showLeaves && animatedProgress > 50 && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.8, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 1 + i * 0.2,
                  ease: 'easeOut'
                }}
                style={{
                  position: 'absolute',
                  top: height * (0.15 + i * 0.05),
                  left: '50%',
                  transform: `translateX(-50%) rotate(${i * 60}deg)`,
                  width: width * 0.3,
                  height: width * 0.15,
                  background: zimbabweanTheme.colors.flag.green,
                  borderRadius: '0 100% 0 100%',
                  opacity: 0.7,
                }}
                className={animated ? 'animate-baobab' : ''}
              />
            ))}
          </>
        )}

        {/* Flying birds */}
        <AnimatePresence>
          {birds.map((bird, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: bird.direction > 0 ? -50 : width + 50,
                y: height * 0.2,
                opacity: 0 
              }}
              animate={{ 
                x: bird.direction > 0 ? width + 50 : -50,
                y: height * 0.1,
                opacity: [0, 1, 1, 0] 
              }}
              transition={{ 
                duration: 4,
                delay: bird.delay,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 8 
              }}
              style={{
                position: 'absolute',
                fontSize: '16px',
                pointerEvents: 'none',
              }}
            >
              🐦
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Level indicator */}
        {showLevel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
            style={{
              background: zimbabweanTheme.colors.flag.gold,
              color: zimbabweanTheme.colors.flag.black,
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: size === 'small' ? '12px' : '14px',
              fontWeight: 600,
              fontFamily: zimbabweanTheme.fonts.ubuntu,
              boxShadow: zimbabweanTheme.shadows.gentle,
            }}
          >
            Level {level}
          </motion.div>
        )}

        {/* Celebration effect */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 pointer-events-none"
            >
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ 
                    x: width / 2, 
                    y: height / 2, 
                    scale: 0 
                  }}
                  animate={{ 
                    x: width / 2 + Math.cos(i * 30 * Math.PI / 180) * 60,
                    y: height / 2 + Math.sin(i * 30 * Math.PI / 180) * 60,
                    scale: [0, 1, 0] 
                  }}
                  transition={{ 
                    duration: 2,
                    delay: i * 0.1,
                    ease: 'easeOut' 
                  }}
                  style={{
                    position: 'absolute',
                    fontSize: '20px',
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress text */}
        {label && (
          <div
            className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center"
            style={{
              color: zimbabweanTheme.colors.text.secondary,
              fontSize: size === 'small' ? '12px' : '14px',
              fontFamily: zimbabweanTheme.fonts.ubuntu,
            }}
          >
            {label}
          </div>
        )}
      </div>

      {/* Screen reader progress announcement */}
      <div className="sr-only" aria-live="polite">
        {progress === 100 ? 'Level completed!' : `Progress: ${progress} percent`}
      </div>
    </div>
  )
}