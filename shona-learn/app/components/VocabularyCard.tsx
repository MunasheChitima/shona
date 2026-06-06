'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa'
import FlashcardCard from './flashcards/FlashcardCard'

interface VocabularyCardProps {
  shona: string
  english: string
  phonetic: string
  /** Optional example sentence shown on the meaning side. */
  example?: string
  /** Optional example translation. */
  translation?: string
  onFlip?: () => void
  className?: string
}

/**
 * A single warm flip card, sharing the same 3D-flip primitive as the study
 * deck so the app feels coherent. Audio is intentionally not implemented here —
 * see the audio seam inside FlashcardCard.
 */
export default function VocabularyCard({
  shona,
  english,
  phonetic,
  example,
  translation,
  onFlip,
  className = '',
}: VocabularyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  const handleFlip = () => {
    setIsFlipped((f) => !f)
    onFlip?.()
  }

  return (
    <div className={className}>
      <FlashcardCard
        card={{ id: shona, shona, english, pronunciation: phonetic, example, translation }}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />
    </div>
  )
}

interface VocabularyDeckProps {
  words: Array<{
    shona: string
    english: string
    phonetic: string
    example?: string
    translation?: string
  }>
  className?: string
}

export function VocabularyDeck({ words, className = '' }: VocabularyDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (words.length === 0) return null

  const nextCard = () => setCurrentIndex((prev) => (prev + 1) % words.length)
  const previousCard = () => setCurrentIndex((prev) => (prev - 1 + words.length) % words.length)

  const currentWord = words[currentIndex]

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-stone-600 lowercase tabular-nums">
          {currentIndex + 1} / {words.length}
        </span>
      </div>
      <div className="w-full bg-stone-100 rounded-full h-1.5 mb-8" aria-hidden>
        <motion.div
          className="h-1.5 rounded-full bg-emerald-600"
          animate={{ width: `${Math.round(((currentIndex + 1) / words.length) * 100)}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        />
      </div>

      <div className="mb-6">
        <VocabularyCard
          key={`${currentWord.shona}-${currentIndex}`}
          shona={currentWord.shona}
          english={currentWord.english}
          phonetic={currentWord.phonetic}
          example={currentWord.example}
          translation={currentWord.translation}
        />
      </div>

      <div className="flex justify-between items-center gap-3">
        <button
          type="button"
          onClick={previousCard}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors lowercase"
        >
          <FaArrowLeft className="w-3 h-3" />
          prev
        </button>
        <button
          type="button"
          onClick={nextCard}
          className="inline-flex items-center gap-2 px-5 py-3 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors lowercase"
        >
          next
          <FaArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
