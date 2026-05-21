'use client'
import { motion } from 'framer-motion'

interface ToneMeterProps {
  pattern: string // e.g., "HL" for High-Low
  word: string
}

export default function ToneMeter({ pattern, word }: ToneMeterProps) {
  const syllables = word.match(/[^aeiou]*[aeiou]+/gi) || []
  
  const getToneHeight = (tone: string) => {
    switch(tone) {
      case 'H': return 20  // High tone
      case 'L': return 60  // Low tone
      case 'R': return 40  // Rising (mid)
      case 'F': return 40  // Falling (mid)
      default: return 40
    }
  }

  const getToneColor = (tone: string) => {
    switch(tone) {
      case 'H': return '#ef4444' // red for high
      case 'L': return '#3b82f6' // blue for low
      case 'R': return '#10b981' // green for rising
      case 'F': return '#f59e0b' // yellow for falling
      default: return '#6b7280'
    }
  }

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h4 className="text-sm font-semibold text-gray-600 mb-3 text-center">Tone Pattern</h4>
      
      <div className="relative h-20 mb-4">
        <svg className="w-full h-full">
          {/* Grid lines */}
          <line x1="0" y1="20" x2="100%" y2="20" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="0" y1="40" x2="100%" y2="40" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="0" y1="60" x2="100%" y2="60" stroke="#e5e7eb" strokeWidth="1" />
          
          {/* Tone line */}
          <motion.path
            d={`M ${syllables.map((_, i) => {
              const x = (i + 0.5) * (100 / syllables.length)
              const y = getToneHeight(pattern[i] || 'L')
              return `${x},${y}`
            }).join(' L ')}`}
            stroke={getToneColor(pattern[0])}
            strokeWidth="3"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          
          {/* Tone dots */}
          {syllables.map((_, i) => {
            const x = (i + 0.5) * (100 / syllables.length)
            const y = getToneHeight(pattern[i] || 'L')
            return (
              <motion.circle
                key={i}
                cx={`${x}%`}
                cy={y}
                r="6"
                fill={getToneColor(pattern[i] || 'L')}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.2 }}
              />
            )
          })}
        </svg>
      </div>
      
      {/* Syllable labels */}
      <div className="flex justify-around">
        {syllables.map((syllable, i) => (
          <div key={i} className="text-center">
            <p className="font-semibold">{syllable}</p>
            <p className="text-xs text-gray-500">
              {pattern[i] === 'H' ? 'High' : 
               pattern[i] === 'L' ? 'Low' :
               pattern[i] === 'R' ? 'Rising' : 'Falling'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
} 