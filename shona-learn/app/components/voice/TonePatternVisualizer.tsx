'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface TonePatternVisualizerProps {
  expectedPattern: string // e.g., "HLHL"
  detectedPattern?: string
  word: string
  isRecording?: boolean
  realTimePitch?: number[]
  onPatternMatch?: (accuracy: number) => void
}

export default function TonePatternVisualizer({ 
  expectedPattern, 
  detectedPattern, 
  word,
  isRecording = false,
  realTimePitch = [],
  onPatternMatch
}: TonePatternVisualizerProps) {
  const [syllables, setSyllables] = useState<string[]>([])
  const [currentSyllable, setCurrentSyllable] = useState(0)
  const [accuracy, setAccuracy] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Extract syllables from word
    const extractedSyllables = word.match(/[^aeiou]*[aeiou]+/gi) || [word]
    setSyllables(extractedSyllables)
  }, [word])

  useEffect(() => {
    if (detectedPattern && expectedPattern) {
      const acc = calculatePatternAccuracy(detectedPattern, expectedPattern)
      setAccuracy(acc)
      onPatternMatch?.(acc)
    }
  }, [detectedPattern, expectedPattern, onPatternMatch])

  useEffect(() => {
    if (isRecording && realTimePitch.length > 0) {
      drawRealTimePitch()
    }
  }, [realTimePitch, isRecording])

  const getToneHeight = (tone: string): number => {
    switch(tone) {
      case 'H': return 15  // High tone
      case 'L': return 75  // Low tone
      case 'R': return 45  // Rising (starts low, ends high)
      case 'F': return 45  // Falling (starts high, ends low)
      default: return 45
    }
  }

  const getToneColor = (tone: string, isDetected = false): string => {
    const colors = {
      'H': isDetected ? '#ef4444' : '#fca5a5', // red variants
      'L': isDetected ? '#3b82f6' : '#93c5fd', // blue variants
      'R': isDetected ? '#10b981' : '#6ee7b7', // green variants
      'F': isDetected ? '#f59e0b' : '#fbbf24', // yellow variants
    }
    return colors[tone as keyof typeof colors] || '#6b7280'
  }

  const calculatePatternAccuracy = (detected: string, expected: string): number => {
    if (!detected || !expected) return 0
    
    const minLength = Math.min(detected.length, expected.length)
    let matches = 0
    
    for (let i = 0; i < minLength; i++) {
      if (detected[i] === expected[i]) {
        matches++
      }
    }
    
    return Math.round((matches / Math.max(detected.length, expected.length)) * 100)
  }

  const drawRealTimePitch = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = (height / 4) * i
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw real-time pitch contour
    if (realTimePitch.length > 1) {
      ctx.strokeStyle = '#8b5cf6'
      ctx.lineWidth = 3
      ctx.beginPath()

      const xStep = width / realTimePitch.length
      const minPitch = Math.min(...realTimePitch)
      const maxPitch = Math.max(...realTimePitch)
      const pitchRange = maxPitch - minPitch || 1

      realTimePitch.forEach((pitch, index) => {
        const x = index * xStep
        const y = height - ((pitch - minPitch) / pitchRange) * height
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.stroke()
    }
  }

  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return 'text-green-600'
    if (accuracy >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAccuracyEmoji = (accuracy: number): string => {
    if (accuracy >= 90) return '🎯'
    if (accuracy >= 70) return '👍'
    return '💪'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-center mb-4">Tone Pattern Practice</h3>
      
      {/* Pattern Visualization */}
      <div className="relative h-32 mb-6 bg-gray-50 rounded-lg p-4">
        <canvas 
          ref={canvasRef}
          width={400}
          height={120}
          className="absolute inset-2 w-full h-full"
        />
        
        <svg className="w-full h-full" viewBox="0 0 400 120">
          {/* Expected pattern */}
          <g>
            {syllables.map((_, i) => {
              const x = (i + 0.5) * (400 / syllables.length)
              const expectedTone = expectedPattern[i] || 'L'
              const y = getToneHeight(expectedTone)
              
              return (
                <g key={`expected-${i}`}>
                  <circle
                    cx={x}
                    cy={y}
                    r="8"
                    fill={getToneColor(expectedTone)}
                    stroke="#374151"
                    strokeWidth="2"
                    opacity="0.7"
                  />
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    className="text-xs font-bold fill-white"
                  >
                    {expectedTone}
                  </text>
                </g>
              )
            })}
            
            {/* Connect expected pattern with line */}
            {syllables.length > 1 && (
              <path
                d={`M ${syllables.map((_, i) => {
                  const x = (i + 0.5) * (400 / syllables.length)
                  const y = getToneHeight(expectedPattern[i] || 'L')
                  return `${x},${y}`
                }).join(' L ')}`}
                stroke={getToneColor(expectedPattern[0])}
                strokeWidth="2"
                fill="none"
                opacity="0.5"
                strokeDasharray="5,5"
              />
            )}
          </g>

          {/* Detected pattern */}
          {detectedPattern && (
            <g>
              {syllables.map((_, i) => {
                const x = (i + 0.5) * (400 / syllables.length)
                const detectedTone = detectedPattern[i] || 'L'
                const y = getToneHeight(detectedTone) + 10 // Offset slightly
                
                return (
                  <motion.g 
                    key={`detected-${i}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill={getToneColor(detectedTone, true)}
                      stroke="#1f2937"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y={y + 3}
                      textAnchor="middle"
                      className="text-xs font-bold fill-white"
                    >
                      {detectedTone}
                    </text>
                  </motion.g>
                )
              })}
              
              {/* Connect detected pattern with line */}
              {syllables.length > 1 && (
                <motion.path
                  d={`M ${syllables.map((_, i) => {
                    const x = (i + 0.5) * (400 / syllables.length)
                    const y = getToneHeight(detectedPattern[i] || 'L') + 10
                    return `${x},${y}`
                  }).join(' L ')}`}
                  stroke={getToneColor(detectedPattern[0], true)}
                  strokeWidth="3"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                />
              )}
            </g>
          )}
        </svg>

        {/* Recording indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-2 right-2 flex items-center space-x-2"
            >
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600">Recording</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Syllable breakdown */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {syllables.map((syllable, i) => (
          <div 
            key={i} 
            className={`text-center p-3 rounded-lg border-2 transition-all ${
              i === currentSyllable && isRecording 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="font-bold text-lg">{syllable}</div>
            <div className="text-sm text-gray-600 mt-1">
              Expected: <span className={`font-medium`} style={{ color: getToneColor(expectedPattern[i] || 'L') }}>
                {expectedPattern[i] === 'H' ? 'High' : 
                 expectedPattern[i] === 'L' ? 'Low' :
                 expectedPattern[i] === 'R' ? 'Rising' : 'Falling'}
              </span>
            </div>
            {detectedPattern && detectedPattern[i] && (
              <div className="text-sm mt-1">
                You said: <span className={`font-medium`} style={{ color: getToneColor(detectedPattern[i], true) }}>
                  {detectedPattern[i] === 'H' ? 'High' : 
                   detectedPattern[i] === 'L' ? 'Low' :
                   detectedPattern[i] === 'R' ? 'Rising' : 'Falling'}
                </span>
                {expectedPattern[i] === detectedPattern[i] && (
                  <span className="ml-1 text-green-600">✓</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Accuracy display */}
      {detectedPattern && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center"
        >
          <div className={`text-2xl font-bold ${getAccuracyColor(accuracy)}`}>
            {getAccuracyEmoji(accuracy)} {accuracy}% Tone Accuracy
          </div>
          {accuracy >= 90 && (
            <div className="text-green-600 font-medium mt-1">Perfect tone pattern! 🎉</div>
          )}
          {accuracy >= 70 && accuracy < 90 && (
            <div className="text-yellow-600 font-medium mt-1">Good! Keep practicing to perfect it.</div>
          )}
          {accuracy < 70 && (
            <div className="text-red-600 font-medium mt-1">Focus on the tone differences. Try again!</div>
          )}
        </motion.div>
      )}

      {/* Legend */}
      <div className="mt-4 flex justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span>Expected</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
          <span>Your attempt</span>
        </div>
        {isRecording && (
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-purple-400"></div>
            <span>Live pitch</span>
          </div>
        )}
      </div>
    </div>
  )
}