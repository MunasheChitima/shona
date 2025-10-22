'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaGlobeAfrica, FaChevronDown, FaChevronUp, FaLightbulb, FaHeart } from 'react-icons/fa'

interface CulturalContextProps {
  culturalNotes: string[]
  title?: string
  expanded?: boolean
  variant?: 'default' | 'compact' | 'highlight'
  className?: string
}

export default function CulturalContext({
  culturalNotes,
  title = 'Cultural Context',
  expanded = false,
  variant = 'default',
  className = ''
}: CulturalContextProps) {
  const [isExpanded, setIsExpanded] = useState(expanded)

  if (!culturalNotes || culturalNotes.length === 0) {
    return null
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const variantStyles = {
    default: {
      container: 'bg-orange-50 border-orange-200 text-orange-800',
      header: 'text-orange-700',
      icon: 'text-orange-600',
      button: 'text-orange-600 hover:text-orange-800'
    },
    compact: {
      container: 'bg-amber-50 border-amber-200 text-amber-800',
      header: 'text-amber-700',
      icon: 'text-amber-600',
      button: 'text-amber-600 hover:text-amber-800'
    },
    highlight: {
      container: 'bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300 text-orange-900',
      header: 'text-orange-800',
      icon: 'text-orange-700',
      button: 'text-orange-700 hover:text-orange-900'
    }
  }

  const currentStyle = variantStyles[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        cultural-context border rounded-lg p-4 ${currentStyle.container} ${className}
      `}
      data-testid="cultural-context"
    >
      {/* Header */}
      <button
        onClick={toggleExpanded}
        className={`
          flex items-center justify-between w-full text-left focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 rounded
          ${currentStyle.button}
        `}
        aria-expanded={isExpanded}
        aria-controls="cultural-content"
      >
        <div className="flex items-center space-x-3">
          <FaGlobeAfrica className={`text-xl ${currentStyle.icon}`} />
          <span className={`font-semibold text-lg ${currentStyle.header}`}>
            {title}
          </span>
          {variant === 'highlight' && (
            <FaHeart className="text-red-500 text-sm animate-pulse" />
          )}
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FaChevronDown className={currentStyle.icon} />
        </motion.div>
      </button>

      {/* Cultural Notes Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id="cultural-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-3"
          >
            {culturalNotes.map((note, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                className="flex items-start space-x-3 p-3 bg-white bg-opacity-50 rounded-lg"
              >
                <div className={`flex-shrink-0 mt-1 ${currentStyle.icon}`}>
                  <FaLightbulb className="text-sm" />
                </div>
                <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${currentStyle.container.split(' ')[2]}`}>
                    {note}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Cultural insight callout */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="mt-4 p-3 bg-white bg-opacity-60 rounded-lg border border-orange-200"
            >
              <div className="flex items-center space-x-2 mb-2">
                <FaHeart className="text-red-500 text-sm" />
                <span className="text-sm font-medium text-orange-800">
                  Cultural Insight
                </span>
              </div>
              <p className="text-xs text-orange-700 leading-relaxed">
                Understanding these cultural contexts helps you communicate more naturally and respectfully in Shona. 
                Language and culture are deeply connected - when you learn one, you discover the other.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// Compact version for inline use
export function CulturalContextCompact({
  culturalNotes,
  maxNotes = 2,
  className = ''
}: {
  culturalNotes: string[]
  maxNotes?: number
  className?: string
}) {
  if (!culturalNotes || culturalNotes.length === 0) {
    return null
  }

  const displayNotes = culturalNotes.slice(0, maxNotes)
  const hasMore = culturalNotes.length > maxNotes

  return (
    <div className={`cultural-context-compact ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <FaGlobeAfrica className="text-orange-600 text-sm" />
        <span className="text-sm font-medium text-orange-800">Cultural Notes</span>
      </div>
      
      <div className="space-y-1">
        {displayNotes.map((note, index) => (
          <div key={index} className="flex items-start space-x-2">
            <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
            <p className="text-xs text-orange-700 leading-relaxed">{note}</p>
          </div>
        ))}
        
        {hasMore && (
          <div className="flex items-center space-x-2">
            <div className="w-1 h-1 bg-orange-300 rounded-full mt-2 flex-shrink-0" />
            <p className="text-xs text-orange-600 italic">
              +{culturalNotes.length - maxNotes} more cultural insight{culturalNotes.length - maxNotes > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Highlight version for important cultural context
export function CulturalContextHighlight({
  culturalNotes,
  className = ''
}: {
  culturalNotes: string[]
  className?: string
}) {
  if (!culturalNotes || culturalNotes.length === 0) {
    return null
  }

  const featuredNote = culturalNotes[0]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`
        cultural-context-highlight bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 
        border border-orange-300 rounded-xl p-4 ${className}
      `}
    >
      <div className="flex items-center space-x-3 mb-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
            <FaGlobeAfrica className="text-white text-sm" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-orange-800">Cultural Spotlight</h3>
          <p className="text-xs text-orange-600">Essential cultural understanding</p>
        </div>
      </div>
      
      <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-orange-200">
        <p className="text-sm text-orange-900 leading-relaxed">{featuredNote}</p>
      </div>
      
      {culturalNotes.length > 1 && (
        <div className="mt-3 text-center">
          <span className="text-xs text-orange-600">
            +{culturalNotes.length - 1} more cultural insight{culturalNotes.length - 1 > 1 ? 's' : ''}
          </span>
        </div>
      )}
    </motion.div>
  )
}