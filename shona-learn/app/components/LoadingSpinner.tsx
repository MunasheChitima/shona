import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
  fullScreen?: boolean
}

export default function LoadingSpinner({ 
  size = 'medium', 
  message, 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const [randomMessage, setRandomMessage] = useState('Tiri kushanda...')
  
  useEffect(() => {
    const messages = ['Tiri kushanda...', 'Mbira inorira 🎶', 'Dzidza Shona!', '🇿🇼']
    setRandomMessage(messages[Math.floor(Math.random() * messages.length)])
  }, [])

  const sizeClasses = {
    small: 'h-8 w-8 border-2',
    medium: 'h-16 w-16 border-3',
    large: 'h-24 w-24 border-4'
  }

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        className={`${sizeClasses[size]} border-green-200 border-t-green-600 rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <motion.span
          className="absolute text-3xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatType: 'loop', ease: 'easeInOut' }}
        >🇿🇼</motion.span>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 font-medium text-center"
      >
        {message || 'Loading Shona magic...'}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatType: 'loop' }}
        className="text-xs text-green-500 font-semibold"
      >
        {randomMessage}
      </motion.p>
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