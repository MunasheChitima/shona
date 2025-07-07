'use client'
import React, { useState, useRef } from 'react'
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { zimbabweanTheme } from '../../../lib/design-system/zimbabwean-theme'

interface FlashcardData {
  id: string
  shona: string
  english: string
  pronunciation?: string
  culturalNote?: string
  example?: string
  audioUrl?: string
}

interface MobileOptimizedFlashcardProps {
  card: FlashcardData
  onSwipeLeft?: () => void  // Mark as incorrect/hard
  onSwipeRight?: () => void // Mark as correct/easy
  onSwipeUp?: () => void    // Mark as favorite
  onTap?: () => void        // Flip card
  showGestures?: boolean
  className?: string
}

export default function MobileOptimizedFlashcard({
  card,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onTap,
  showGestures = true,
  className = '',
}: MobileOptimizedFlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [dragDirection, setDragDirection] = useState<'left' | 'right' | 'up' | null>(null)
  const constraintsRef = useRef(null)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateZ = useTransform(x, [-200, 200], [-25, 25])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0])

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100
    const upThreshold = 80
    
    if (Math.abs(info.offset.x) > threshold) {
      if (info.offset.x > 0) {
        onSwipeRight?.()
      } else {
        onSwipeLeft?.()
      }
    } else if (info.offset.y < -upThreshold) {
      onSwipeUp?.()
    } else {
      // Snap back to center
      x.set(0)
      y.set(0)
    }
    setDragDirection(null)
  }

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50
    
    if (Math.abs(info.offset.x) > threshold) {
      setDragDirection(info.offset.x > 0 ? 'right' : 'left')
    } else if (info.offset.y < -threshold) {
      setDragDirection('up')
    } else {
      setDragDirection(null)
    }
  }

  const handleTap = () => {
    setIsFlipped(!isFlipped)
    onTap?.()
  }

  const playAudio = () => {
    if (card.audioUrl) {
      const audio = new Audio(card.audioUrl)
      audio.play().catch(() => {
        // Handle audio play failure silently
      })
    }
  }

  const getSwipeIndicatorColor = () => {
    switch (dragDirection) {
      case 'right':
        return zimbabweanTheme.colors.flag.green // Correct
      case 'left':
        return zimbabweanTheme.colors.flag.red   // Incorrect
      case 'up':
        return zimbabweanTheme.colors.flag.gold  // Favorite
      default:
        return 'transparent'
    }
  }

  const getSwipeIcon = () => {
    switch (dragDirection) {
      case 'right': return '✓'
      case 'left': return '✗'
      case 'up': return '★'
      default: return ''
    }
  }

  return (
    <div 
      ref={constraintsRef}
      className={`relative w-full max-w-sm mx-auto h-80 ${className}`}
      style={{ perspective: '1000px' }}
    >
      {/* Swipe indicators */}
      {showGestures && dragDirection && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
          style={{
            backgroundColor: getSwipeIndicatorColor() + '20',
            borderRadius: '20px',
          }}
        >
          <div
            className="text-6xl font-bold"
            style={{ color: getSwipeIndicatorColor() }}
          >
            {getSwipeIcon()}
          </div>
        </motion.div>
      )}

      {/* Gesture hints */}
      {showGestures && !dragDirection && (
        <div className="absolute -bottom-16 left-0 right-0 z-20">
          <div className="flex justify-between text-xs text-gray-500 px-4">
            <div className="flex items-center gap-1">
              <span className="text-red-500">←</span>
              <span>Hard</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gold-500">↑</span>
              <span>Favorite</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-green-500">→</span>
              <span>Easy</span>
            </div>
          </div>
        </div>
      )}

      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={handleTap}
        style={{
          x,
          y,
          rotateZ,
          opacity,
        }}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-target"
        whileTap={{ scale: 0.95 }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 40,
        }}
      >
        <div
          className="relative w-full h-full rounded-2xl cultural-card shadow-zimbabwe overflow-hidden"
          style={{
            background: zimbabweanTheme.colors.surface.white,
            border: `2px solid ${zimbabweanTheme.colors.flag.green}20`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Pattern background */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: zimbabweanTheme.patterns.zimbabweBird,
              backgroundSize: '60px 60px',
            }}
          />

          {/* Front side */}
          <motion.div
            className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            <div className="mb-4">
              <h2 className="text-shona-xl font-nunito font-bold text-gray-800 mb-2">
                {card.shona}
              </h2>
              {card.pronunciation && (
                <p className="text-sm text-gray-500 font-ubuntu">
                  /{card.pronunciation}/
                </p>
              )}
            </div>

            {/* Audio button */}
            {card.audioUrl && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  playAudio()
                }}
                className="mb-4 p-3 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                style={{ color: zimbabweanTheme.colors.flag.green }}
              >
                🔊
              </motion.button>
            )}

            <div className="text-sm text-gray-400 font-ubuntu">
              Tap to reveal • Swipe to answer
            </div>
          </motion.div>

          {/* Back side */}
          <motion.div
            className="absolute inset-0 p-6 flex flex-col justify-center items-center text-center"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                {card.english}
              </h3>
              {card.example && (
                <p className="text-sm text-gray-600 italic mb-3">
                  "{card.example}"
                </p>
              )}
            </div>

            {card.culturalNote && (
              <div 
                className="w-full p-3 rounded-lg mb-4 text-sm"
                style={{
                  background: zimbabweanTheme.colors.flag.gold + '20',
                  border: `1px solid ${zimbabweanTheme.colors.flag.gold}40`,
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">🏛️</span>
                  <div>
                    <div className="font-semibold text-gray-800 mb-1">Cultural Note</div>
                    <div className="text-gray-600">{card.culturalNote}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-400 font-ubuntu">
              Tap to return • Swipe to answer
            </div>
          </motion.div>

          {/* Top gradient stripe */}
          <div
            className="absolute top-0 left-0 right-0 h-1 z-10"
            style={{
              background: zimbabweanTheme.gradients.savanna,
            }}
          />
        </div>
      </motion.div>
    </div>
  )
}