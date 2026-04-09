'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FaVolumeUp, FaInfoCircle, FaTimes, FaLeaf } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { audioService } from '@/lib/services/AudioService'

interface PronunciationTextProps {
  word: string
  pronunciation: string
  phonetic?: string
  syllables?: string
  tonePattern?: string
  /** Syllable-by-syllable English anchoring (matches flashcards / lessons). */
  englishAnchor?: string
  toneHint?: string
  /** Tokens linking to Sound Guide sections, e.g. ["mh","nd"]. */
  soundGuideLinks?: string[]
  audioFile?: string
  size?: 'small' | 'medium' | 'large'
  showDetails?: boolean
  /** Collapsible “how to say it” / tone / sound-guide hints (default true when data exists). */
  showEnglishAnchor?: boolean
  className?: string
}

function soundGuideHash(token: string) {
  return `sound-${encodeURIComponent(token.replace(/[^a-z0-9]/gi, '-'))}`
}

export default function PronunciationText({
  word,
  pronunciation,
  phonetic,
  syllables,
  tonePattern,
  englishAnchor,
  toneHint,
  soundGuideLinks = [],
  audioFile,
  size = 'medium',
  showDetails = true,
  showEnglishAnchor,
  className = ''
}: PronunciationTextProps) {
  const [showPhonetic, setShowPhonetic] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [dismissedHint, setDismissedHint] = useState(false)

  const showAnchorBlock =
    (showEnglishAnchor ?? true) &&
    !!(englishAnchor || (toneHint && tonePattern) || (soundGuideLinks && soundGuideLinks.length > 0))

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
          
          {showDetails && (phonetic || syllables || tonePattern || englishAnchor) && (
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
                {englishAnchor && (
                  <div className="md:col-span-3">
                    <div className="text-blue-600 font-medium mb-1">English anchor</div>
                    <div className={`text-blue-900 leading-relaxed ${currentSize.phonetic}`}>
                      {englishAnchor}
                    </div>
                  </div>
                )}
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
                    {toneHint && (
                      <p className="text-blue-700/90 mt-1 text-xs leading-snug">{toneHint}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showAnchorBlock && !dismissedHint && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50/90 p-3 text-sm text-emerald-900"
        >
          <div className="flex justify-between gap-2">
            <div className="font-medium text-emerald-800 flex items-center gap-2">
              <FaLeaf className="shrink-0 opacity-80" aria-hidden />
              How to say it
            </div>
            <button
              type="button"
              onClick={() => setDismissedHint(true)}
              className="text-emerald-700 hover:text-emerald-900 p-1 rounded"
              aria-label="Dismiss pronunciation hints"
            >
              <FaTimes />
            </button>
          </div>
          {englishAnchor && (
            <p className="mt-2 text-emerald-900/95 leading-relaxed whitespace-pre-wrap">{englishAnchor}</p>
          )}
          {tonePattern && toneHint && (
            <p className="mt-2 text-xs text-emerald-800">
              <span className="font-semibold">Tone ({tonePattern}):</span> {toneHint}
            </p>
          )}
          {soundGuideLinks.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {soundGuideLinks.map((s) => (
                <Link
                  key={s}
                  href={`/sound-guide#${soundGuideHash(s)}`}
                  className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100"
                >
                  Sound: {s}
                </Link>
              ))}
            </div>
          )}
          <p className="mt-2 text-xs text-emerald-800/80">
            <Link href="/sound-guide" className="underline underline-offset-2 font-medium">
              Open full Sound Guide
            </Link>
          </p>
        </motion.div>
      )}

      {/* Tone pattern visualization */}
      {tonePattern && showDetails && (
        <div className="tone-pattern mt-2">
          <div className="text-xs text-gray-600 mb-1">Tone Pattern</div>
          <div className="flex items-center space-x-1">
            {tonePattern
              .replace(/[^HhLl]/g, '')
              .split('')
              .filter(Boolean)
              .map((t) => t.toUpperCase())
              .map((tone, index) => (
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