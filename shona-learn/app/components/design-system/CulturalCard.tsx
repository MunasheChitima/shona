'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { zimbabweanTheme } from '../../../lib/design-system/zimbabwean-theme'

interface CulturalCardProps {
  children: React.ReactNode
  variant?: 'sunset' | 'sunrise' | 'savanna' | 'river' | 'kopje'
  pattern?: 'chevron' | 'checkerboard' | 'waves' | 'zimbabweBird' | 'none'
  size?: 'small' | 'medium' | 'large'
  elevated?: boolean
  interactive?: boolean
  onClick?: () => void
  culturalContext?: string
  className?: string
  ariaLabel?: string
}

export default function CulturalCard({
  children,
  variant = 'savanna',
  pattern = 'none',
  size = 'medium',
  elevated = false,
  interactive = false,
  onClick,
  culturalContext,
  className = '',
  ariaLabel,
}: CulturalCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeStyles = {
    small: {
      padding: '12px',
      borderRadius: '12px',
      minHeight: '120px',
    },
    medium: {
      padding: '20px',
      borderRadius: '16px',
      minHeight: '160px',
    },
    large: {
      padding: '32px',
      borderRadius: '20px',
      minHeight: '220px',
    },
  }

  const variantGradients = {
    sunset: zimbabweanTheme.gradients.sunset,
    sunrise: zimbabweanTheme.gradients.sunrise,
    savanna: zimbabweanTheme.gradients.savanna,
    river: zimbabweanTheme.gradients.river,
    kopje: zimbabweanTheme.gradients.kopje,
  }

  const patternStyles = {
    chevron: {
      backgroundImage: zimbabweanTheme.patterns.chevron,
      backgroundSize: '28px 28px',
    },
    checkerboard: {
      backgroundImage: zimbabweanTheme.patterns.checkerboard,
      backgroundSize: '20px 20px',
    },
    waves: {
      backgroundImage: zimbabweanTheme.patterns.waves,
      backgroundSize: '60px 30px',
      backgroundRepeat: 'repeat-x',
    },
    zimbabweBird: {
      backgroundImage: zimbabweanTheme.patterns.zimbabweBird,
      backgroundSize: '40px 40px',
    },
    none: {},
  }

  return (
    <motion.div
      className={`
        relative overflow-hidden cultural-card font-ubuntu
        ${interactive ? 'cursor-pointer' : ''}
        ${className}
      `}
      style={{
        ...sizeStyles[size],
        background: zimbabweanTheme.colors.surface.white,
        border: `1px solid ${zimbabweanTheme.utils.getColorWithOpacity('flag.green', 0.1)}`,
        boxShadow: elevated 
          ? zimbabweanTheme.shadows.zimbabwe 
          : zimbabweanTheme.shadows.gentle,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={interactive ? {
        y: -8,
        scale: 1.02,
        transition: { duration: 0.3 }
      } : {}}
      whileTap={interactive ? {
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      role={interactive ? 'button' : 'article'}
      tabIndex={interactive ? 0 : -1}
      aria-label={ariaLabel}
    >
      {/* Top gradient stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: variantGradients[variant],
        }}
      />

      {/* Pattern overlay */}
      {pattern !== 'none' && (
        <div
          className="absolute inset-0 opacity-5"
          style={{
            ...patternStyles[pattern],
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Hover glow effect */}
      {interactive && isHovered && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${zimbabweanTheme.utils.getColorWithOpacity('flag.gold', 0.1)}, transparent 70%)`,
          }}
        />
      )}

      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Cultural context indicator */}
      {culturalContext && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 right-4"
          style={{
            background: zimbabweanTheme.utils.getColorWithOpacity('flag.gold', 0.1),
            color: zimbabweanTheme.colors.text.secondary,
            padding: '4px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            backdropFilter: 'blur(10px)',
          }}
        >
          {culturalContext}
        </motion.div>
      )}

      {/* Interactive focus ring */}
      {interactive && (
        <div
          className="absolute inset-0 rounded-inherit pointer-events-none transition-all duration-200"
          style={{
            outline: isHovered ? `2px solid ${zimbabweanTheme.colors.flag.gold}` : 'none',
            outlineOffset: '2px',
          }}
        />
      )}
    </motion.div>
  )
}