'use client'
import { useState } from 'react'
import { FaVolumeUp, FaInfoCircle } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { audioService } from '@/lib/services/AudioService'

interface PronunciationTextProps {
  word: string
  pronunciation: string
  phonetic?: string
  syllables?: string
  tonePattern?: string
  audioFile?: string
  size?: 'small' | 'medium' | 'large'
  showDetails?: boolean
  className?: string
}

export default function PronunciationText({
  word,
  pronunciation,
  phonetic,
  syllables,
  tonePattern,
  audioFile,
  size = 'medium',
  showDetails = true,
  className = ''
}: PronunciationTextProps) {
  const [showPhonetic, setShowPhonetic] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const sizeClasses = {
    small: {
      word: 'text-lg font-semibold',
      pronunciation: 'text-sm font-medium',
      phonetic: 'text-xs',
      button: 'text-sm p-2'
    },
    medium: {
      word: 'text-xl font-semibold',
      pronunciation: 'text-base font-medium',
      phonetic: 'text-sm',
      button: 'text-base p-2'
    },
    large: {
      word: 'text-2xl font-bold',
      pronunciation: 'text-lg font-medium',
      phonetic: 'text-base',
      button: 'text-lg p-3'
    }
  }

  const currentSize = sizeClasses[size]

  const playAudio = async () => {
    if (isPlaying) return
    
    setIsPlaying(true)
    try {
      const result = await audioService.playAudio(audioFile, word)
      if (!result.success) {
        console.warn('Audio playback failed:', result.error)
      }
    } catch (error: any) {
      console.warn('Audio playback failed:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  return (
    <div className={`pronunciation-text ${className}`}>
      {/* Main word display */}
      <div className="flex items-center space-x-3 mb-2">
        <span className={`text-gray-900 ${currentSize.word}`}>{word}</span>
        
        {/* Audio button */}
        <motion.button
          onClick={playAudio}
          disabled={isPlaying}
          className={`
            ${currentSize.button} flex items-center justify-center
            bg-blue-500 hover:bg-blue-600 text-white rounded-full
            transition-colors duration-200 disabled:opacity-50
            ${isPlaying ? 'bg-blue-600' : ''}
          `}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          data-testid="pronunciation-audio-button"
        >
          <FaVolumeUp className={isPlaying ? 'animate-pulse' : ''} />
        </motion.button>
      </div>

      {/* Pronunciation text - always visible */}
      <div className="pronunciation-display bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-1">
              Pronunciation
            </div>
            <div className={`text-blue-800 ${currentSize.pronunciation}`}>
              {pronunciation}
            </div>
          </div>
          
          {showDetails && (phonetic || syllables || tonePattern) && (
            <button
              onClick={() => setShowPhonetic(!showPhonetic)}
              className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
              title="Show phonetic details"
            >
              <FaInfoCircle />
            </button>
          )}
        </div>

        {/* Expandable phonetic information */}
        <AnimatePresence>
          {showPhonetic && showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 pt-3 border-t border-blue-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {phonetic && (
                  <div>
                    <div className="text-blue-600 font-medium mb-1">Phonetic</div>
                    <div className={`text-blue-800 font-mono ${currentSize.phonetic}`}>
                      {phonetic}
                    </div>
                  </div>
                )}
                
                {syllables && (
                  <div>
                    <div className="text-blue-600 font-medium mb-1">Syllables</div>
                    <div className={`text-blue-800 ${currentSize.phonetic}`}>
                      {syllables}
                    </div>
                  </div>
                )}
                
                {tonePattern && (
                  <div>
                    <div className="text-blue-600 font-medium mb-1">Tone Pattern</div>
                    <div className={`text-blue-800 font-mono ${currentSize.phonetic}`}>
                      {tonePattern}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tone pattern visualization */}
      {tonePattern && showDetails && (
        <div className="tone-pattern mt-2">
          <div className="text-xs text-gray-600 mb-1">Tone Pattern</div>
          <div className="flex items-center space-x-1">
            {tonePattern.split('-').map((tone, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={`
                    w-3 h-3 rounded-full
                    ${tone === 'H' ? 'bg-orange-500' : 'bg-blue-500'}
                    ${tone === 'H' ? 'translate-y-0' : 'translate-y-2'}
                  `}
                />
                <div className="text-xs text-gray-500 mt-1">{tone}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            H = High tone, L = Low tone
          </div>
        </div>
      )}
    </div>
  )
}

// Compact version for use in lists
export function PronunciationTextCompact({
  word,
  pronunciation,
  audioFile,
  className = ''
}: Pick<PronunciationTextProps, 'word' | 'pronunciation' | 'audioFile' | 'className'>) {
  const [isPlaying, setIsPlaying] = useState(false)

  const playAudio = async () => {
    if (isPlaying) return
    
    setIsPlaying(true)
    try {
      const result = await audioService.playAudio(audioFile, word)
      if (!result.success) {
        console.warn('Audio playback failed:', result.error)
      }
    } catch (error: any) {
      console.warn('Audio playback failed:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  return (
    <div className={`pronunciation-text-compact flex items-center space-x-2 ${className}`}>
      <span className="text-gray-900 font-medium">{word}</span>
      
      <motion.button
        onClick={playAudio}
        disabled={isPlaying}
        className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 transition-colors duration-200 disabled:opacity-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaVolumeUp className="text-sm" />
      </motion.button>
      
      <span className="text-sm text-gray-600">[{pronunciation}]</span>
    </div>
  )
}