'use client'
import React, { memo, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FaVolumeUp, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa'
import { useAudioService } from '@/lib/services/AudioService'

interface VocabularyItem {
  id: string
  shonaText: string
  englishText: string
  pronunciation?: string
  audioText?: string
  difficulty: number
  tags?: string
  context?: string
}

interface FlashcardItemProps {
  item: VocabularyItem
  isActive: boolean
  onSelect: () => void
  onProgress: () => void
}

const FlashcardItem = memo(function FlashcardItem({
  item,
  isActive,
  onSelect,
  onProgress
}: FlashcardItemProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showPronunciation, setShowPronunciation] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const audioService = useAudioService()

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev)
    if (!isFlipped) {
      onProgress()
    }
  }, [isFlipped, onProgress])

  const playAudio = useCallback(async () => {
    if (!item.audioText || isPlaying) return
    
    setIsPlaying(true)
    try {
      await audioService.playAudio(`/audio/${item.audioText}.mp3`, {
        volume: 0.8,
        onEnd: () => setIsPlaying(false)
      })
    } catch (error) {
      console.error('Audio play failed:', error)
      setIsPlaying(false)
    }
  }, [item.audioText, isPlaying, audioService])

  const handleCorrect = useCallback(() => {
    // Handle correct answer
    onProgress()
    // Could emit analytics event here
  }, [onProgress])

  const handleIncorrect = useCallback(() => {
    // Handle incorrect answer
    // Could emit analytics event here
    setIsFlipped(false)
  }, [])

  const parsedTags = React.useMemo(() => {
    if (!item.tags) return []
    try {
      return Array.isArray(item.tags) ? item.tags : JSON.parse(item.tags)
    } catch {
      return [item.tags]
    }
  }, [item.tags])

  const difficultyColor = React.useMemo(() => {
    if (item.difficulty < 0.3) return 'text-green-500'
    if (item.difficulty < 0.7) return 'text-yellow-500'
    return 'text-red-500'
  }, [item.difficulty])

  return (
    <motion.div
      className={`relative w-full h-48 cursor-pointer ${
        isActive ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-lg shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-gray-800">{item.shonaText}</h3>
              {item.audioText && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playAudio()
                  }}
                  disabled={isPlaying}
                  className={`p-2 rounded-full transition-colors ${
                    isPlaying 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  <FaVolumeUp className={isPlaying ? 'animate-pulse' : ''} />
                </button>
              )}
            </div>

            {item.pronunciation && (
              <div className="mb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowPronunciation(!showPronunciation)
                  }}
                  className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                >
                  {showPronunciation ? <FaEyeSlash /> : <FaEye />}
                  <span className="text-sm">Pronunciation</span>
                </button>
                {showPronunciation && (
                  <p className="text-lg font-mono text-blue-600 mt-2">
                    {item.pronunciation}
                  </p>
                )}
              </div>
            )}

            <div className="flex-grow" />

            <div className="flex justify-between items-end">
              <div className="flex flex-wrap gap-1">
                {parsedTags.slice(0, 3).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className={`text-sm font-medium ${difficultyColor}`}>
                {Math.round(item.difficulty * 100)}% difficulty
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleFlip()
              }}
              className="mt-4 w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Reveal Answer
            </button>
          </div>
        </div>

        {/* Back of card */}
        <div className="absolute inset-0 w-full h-full backface-hidden bg-green-50 rounded-lg shadow-lg border border-green-200 p-6 rotate-y-180">
          <div className="flex flex-col h-full">
            <div className="text-center mb-4">
              <h4 className="text-lg font-medium text-gray-600 mb-2">English Translation</h4>
              <p className="text-2xl font-bold text-gray-800">{item.englishText}</p>
            </div>

            {item.context && (
              <div className="mb-4 p-3 bg-white rounded border">
                <h5 className="text-sm font-medium text-gray-600 mb-1">Context</h5>
                <p className="text-sm text-gray-700">{item.context}</p>
              </div>
            )}

            <div className="flex-grow" />

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleIncorrect()
                }}
                className="flex items-center justify-center space-x-2 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <FaTimes />
                <span>Incorrect</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleCorrect()
                }}
                className="flex items-center justify-center space-x-2 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                <FaCheck />
                <span>Correct</span>
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                handleFlip()
              }}
              className="mt-3 w-full py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Back to Question
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
})

export default FlashcardItem