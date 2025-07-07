'use client'
import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { zimbabweanTheme } from '../../../lib/design-system/zimbabwean-theme'

interface ShonaButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'small' | 'medium' | 'large'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  icon?: React.ReactNode
  soundEffect?: keyof typeof zimbabweanTheme.sounds
  culturalPattern?: boolean
  ariaLabel?: string
  className?: string
}

export default function ShonaButton({
  children,
  variant = 'primary',
  size = 'medium',
  onClick,
  disabled = false,
  loading = false,
  icon,
  soundEffect = 'navigation',
  culturalPattern = false,
  ariaLabel,
  className = '',
}: ShonaButtonProps) {
  const [isPressed, setIsPressed] = useState(false)
  const [showRipple, setShowRipple] = useState(false)
  const [ripplePosition, setRipplePosition] = useState({ x: 0, y: 0 })
  const buttonRef = useRef<HTMLButtonElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Preload sound effect
    if (typeof window !== 'undefined' && soundEffect) {
      audioRef.current = new Audio(`/audio/effects/${soundEffect}.mp3`)
      audioRef.current.preload = 'auto'
    }
  }, [soundEffect])

  const sizeStyles = {
    small: {
      padding: '8px 16px',
      fontSize: '14px',
      minHeight: '36px',
    },
    medium: {
      padding: '12px 24px',
      fontSize: '16px',
      minHeight: '44px',
    },
    large: {
      padding: '16px 32px',
      fontSize: '18px',
      minHeight: '52px',
    },
  }

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${zimbabweanTheme.colors.flag.green}, ${zimbabweanTheme.colors.flag.gold})`,
      borderColor: zimbabweanTheme.colors.flag.gold,
      color: zimbabweanTheme.colors.flag.white,
    },
    secondary: {
      background: `linear-gradient(135deg, ${zimbabweanTheme.colors.landscape.riverBlue}, ${zimbabweanTheme.colors.landscape.savannaGold})`,
      borderColor: zimbabweanTheme.colors.landscape.riverBlue,
      color: zimbabweanTheme.colors.flag.white,
    },
    accent: {
      background: `linear-gradient(135deg, ${zimbabweanTheme.colors.flag.red}, ${zimbabweanTheme.colors.landscape.sunsetOrange})`,
      borderColor: zimbabweanTheme.colors.flag.red,
      color: zimbabweanTheme.colors.flag.white,
    },
  }

  const playSound = () => {
    if (audioRef.current && !disabled) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Handle audio play failure silently
      })
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return

    const rect = buttonRef.current?.getBoundingClientRect()
    if (rect) {
      setRipplePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setShowRipple(true)
      setTimeout(() => setShowRipple(false), 600)
    }

    playSound()
    onClick?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsPressed(true)
    }
  }

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      setIsPressed(false)
      handleClick(e as any)
    }
  }

  return (
    <motion.button
      ref={buttonRef}
      className={`
        relative overflow-hidden font-ubuntu font-semibold
        border-2 rounded-xl cursor-pointer
        transition-all duration-300 ease-out
        focus:outline-none focus:ring-3 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${culturalPattern ? 'pattern-chevron' : ''}
        ${className}
      `}
             style={{
         ...sizeStyles[size],
         ...variantStyles[variant],
         boxShadow: disabled ? 'none' : zimbabweanTheme.shadows.zimbabwe,
       }}
      disabled={disabled || loading}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => setIsPressed(false)}
      aria-label={ariaLabel || (typeof children === 'string' ? children : 'Button')}
      whileHover={disabled ? {} : { 
        scale: 1.02,
        y: -2,
        transition: { duration: 0.2 }
      }}
      whileTap={disabled ? {} : { 
        scale: 0.98,
        y: 0,
        transition: { duration: 0.1 }
      }}
      animate={{
        filter: isPressed ? 'brightness(0.9)' : 'brightness(1)',
      }}
    >
      {/* Shimmer effect */}
      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
          transform: 'translateX(-100%)',
          animation: !disabled ? 'shimmer 2s ease-in-out infinite' : 'none',
        }}
      />

      {/* Cultural pattern overlay */}
      {culturalPattern && (
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: zimbabweanTheme.patterns.zimbabweBird,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      {/* Ripple effect */}
      {showRipple && (
        <div
          className="absolute pointer-events-none animate-water-ripple"
          style={{
            left: ripplePosition.x - 20,
            top: ripplePosition.y - 20,
            width: 40,
            height: 40,
            background: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%',
          }}
        />
      )}

      {/* Content container */}
      <div className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <div className="loading-mbira" />
        ) : (
          <>
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
          </>
        )}
      </div>

      {/* Accessibility: Hidden text for screen readers */}
      <span className="sr-only">
        {disabled ? 'Button disabled' : loading ? 'Loading' : ''}
      </span>
    </motion.button>
  )
}

// Keyframe for shimmer effect
const shimmerKeyframes = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`

// Inject keyframes into document head
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = shimmerKeyframes
  document.head.appendChild(style)
}