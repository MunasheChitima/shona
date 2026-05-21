// LoadingSpinner is imported by basically every page, so it used to drag
// framer-motion into every initial bundle. We've replaced the framer-
// motion animations with Tailwind's built-in `animate-spin` and
// `animate-pulse`, plus a small CSS-only fade-in.
import { useEffect, useState } from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({
  size = 'medium',
  message,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const [randomMessage, setRandomMessage] = useState('Tiri kushanda...')

  useEffect(() => {
    const messages = ['Tiri kushanda...', 'Mbira inorira 🎶', 'Dzidza Shona!', '🇿🇼']
    setRandomMessage(messages[Math.floor(Math.random() * messages.length)])
  }, [])

  const sizeClasses = {
    small: 'h-8 w-8 border-2',
    medium: 'h-16 w-16 border-[3px]',
    large: 'h-24 w-24 border-4',
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={`relative ${sizeClasses[size]} border-green-200 border-t-green-600 rounded-full animate-spin`}
      >
        <span className="absolute text-3xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none animate-pulse-glow">
          🇿🇼
        </span>
      </div>
      <p className="text-gray-600 font-medium text-center animate-slide-in-up">
        {message || 'Loading Shona magic...'}
      </p>
      <p className="text-xs text-green-500 font-semibold animate-pulse">
        {randomMessage}
      </p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}
