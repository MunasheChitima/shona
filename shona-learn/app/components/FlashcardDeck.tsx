'use client'
import { useState, useEffect } from 'react'
import { FaArrowLeft, FaArrowRight, FaRandom, FaBookOpen, FaLightbulb, FaGlobeAfrica } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import LoadingSpinner from './LoadingSpinner'
import { BETA_OPEN_ACCESS } from '@/lib/beta-access'
import { apiAuthHeaders } from '@/lib/api-auth-headers'

interface Flashcard {
  id: string
  shona: string
  english: string
  pronunciation: string
  englishAnchor?: string
  pronounceDifficulty?: string
  tonePattern?: string
  toneHint?: string
  category: string
  level?: string
  lessonId?: string
  example: string
  translation: string
  culturalContext?: string
  usageNotes?: string
  // Legacy fields kept for backwards compatibility
  ipa?: string
  tones?: string
  grammarNotes?: string
  phoneticPronunciation?: string
}

interface FlashcardDeckProps {
  category?: string
  limit?: number
}

const FLASHCARD_PRACTICE_KEY = 'flashcard_practice_v1'

function recordFlashcardPractice(category: string | undefined, cardId: string) {
  if (typeof window === 'undefined' || !category || !cardId) return
  try {
    const raw = localStorage.getItem(FLASHCARD_PRACTICE_KEY)
    const map: Record<string, string[]> = raw ? JSON.parse(raw) : {}
    if (!Array.isArray(map[category])) map[category] = []
    if (!map[category].includes(cardId)) {
      map[category].push(cardId)
      localStorage.setItem(FLASHCARD_PRACTICE_KEY, JSON.stringify(map))
      window.dispatchEvent(new Event('flashcard-practice'))
    }
  } catch {
    /* ignore */
  }
}

export default function FlashcardDeck({ category, limit = 10 }: FlashcardDeckProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showEducationalContent, setShowEducationalContent] = useState(false)

  useEffect(() => {
    loadFlashcards()
  }, [category, limit])

  const loadFlashcards = async () => {
    try {
      setIsLoading(true)
      let data = []
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token')
      }
      // Load from static file first — it has the correct Unit-based categories
      try {
        const staticResponse = await fetch('/flashcards.json')
        const staticData = await staticResponse.json()
        data = staticData.flashcards || []
      } catch (staticError) {
        console.error('Failed to load static flashcards:', staticError)
      }
      // If static file yielded nothing, try API as fallback
      if (data.length === 0 && (token || BETA_OPEN_ACCESS)) {
        try {
          const response = await fetch('/api/vocabulary', {
            headers: { ...apiAuthHeaders() },
          })
          if (response.ok) {
            data = await response.json()
          }
        } catch (apiError) {
          console.log('API call also failed')
        }
      }
      let filteredCards = data
      if (category) {
        filteredCards = data.filter((card: Flashcard) =>
          card.category === category || card.level === category
        )
      }
      // Ensure each card has an id and proper capitalization
      const enhancedCards = filteredCards.map((card: Flashcard, idx: number) => ({
        ...card,
        id: card.id || `${card.shona || 'card'}_${idx}`,
        shona: card.shona.charAt(0).toUpperCase() + card.shona.slice(1),
      }))
      // Shuffle and limit
      const shuffled = enhancedCards.sort(() => Math.random() - 0.5).slice(0, limit)
      setFlashcards(shuffled)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading flashcards:', error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const card = flashcards[currentIndex]
    if (card?.id && category) {
      recordFlashcardPractice(category, card.id)
    }
  }, [currentIndex, category, flashcards])

  const nextCard = () => {
    setIsFlipped(false)
    setShowEducationalContent(false)
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
  }

  const prevCard = () => {
    setIsFlipped(false)
    setShowEducationalContent(false)
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const shuffleCards = () => {
    setIsFlipped(false)
    setShowEducationalContent(false)
    setCurrentIndex(0)
    setFlashcards(prev => [...prev].sort(() => Math.random() - 0.5))
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen message="Loading flashcards..." />
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <FaBookOpen className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No flashcards found</h3>
        <p className="text-gray-500">Try selecting a different category or check back later.</p>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={shuffleCards}
            className="p-2 text-gray-600 hover:text-accent-gold transition-colors"
            title="Shuffle cards"
          >
            <FaRandom />
          </button>
        </div>
      </div>

      {/* Organic Flashcard - Inspired by hand-drawn concept */}
      <div className="relative cursor-pointer mb-8" onClick={flipCard}>
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{
            borderRadius: '30px 35px 25px 40px', // Organic wavy border
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s ease-in-out'
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Front of card */}
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="front"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 min-h-[500px]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Flash Card Title */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Flash Card</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-accent-gold to-primary mx-auto rounded-full"></div>
                </div>

                {/* Shona Word Section - Blue */}
                <div className="mb-8 p-6 bg-gradient-to-r from-accent-blue-50 to-accent-blue-100 rounded-2xl border-l-4 border-accent-blue-500">
                  <h3 className="text-accent-blue-700 font-semibold mb-2 text-lg">Shona Word</h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-accent-blue-800 mb-2">{currentCard.shona}</p>
                    <p className="text-accent-blue-600 text-sm">({currentCard.category})</p>
                  </div>
                </div>

                {/* Pronunciation Section - Yellow/Orange */}
                <div className="mb-8 p-6 bg-gradient-to-r from-accent-gold-50 to-accent-gold-100 rounded-2xl border-l-4 border-accent-gold-500">
                  <h3 className="text-accent-gold-700 font-semibold mb-2 text-lg">Pronunciation</h3>
                  <div className="text-center">
                    <p className="text-2xl font-medium text-accent-gold-800 mb-2">{currentCard.pronunciation}</p>
                    {currentCard.englishAnchor && (
                      <p className="text-accent-gold-700 text-sm leading-relaxed">{currentCard.englishAnchor}</p>
                    )}
                    {currentCard.pronounceDifficulty && (
                      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                        currentCard.pronounceDifficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        currentCard.pronounceDifficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {currentCard.pronounceDifficulty === 'easy' ? 'Familiar sounds' :
                         currentCard.pronounceDifficulty === 'medium' ? 'New sound combos' :
                         'Uniquely Shona sounds'}
                      </span>
                    )}
                    {currentCard.tonePattern && currentCard.toneHint && (
                      <p className="text-accent-gold-800 text-xs mt-3 max-w-md mx-auto leading-relaxed">
                        <span className="font-semibold">Tone {currentCard.tonePattern}: </span>
                        {currentCard.toneHint}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-center text-gray-500 mt-6 text-sm">
                  Tap to see definition and usage
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 min-h-[500px]"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Flash Card Title */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Flash Card</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-accent-gold to-primary mx-auto rounded-full"></div>
                </div>

                {/* Definition/Translation Section - Green */}
                <div className="mb-8 p-6 bg-gradient-to-r from-accent-green-50 to-accent-green-100 rounded-2xl border-l-4 border-accent-green-500">
                  <h3 className="text-accent-green-700 font-semibold mb-2 text-lg">Definition / Translation</h3>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-accent-green-800 mb-2">{currentCard.english}</p>
                  </div>
                </div>

                {/* Use Case Section - Red */}
                <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border-l-4 border-red-500">
                  <h3 className="text-red-700 font-semibold mb-2 text-lg">Use Case</h3>
                  <div className="text-center">
                    <p className="text-lg font-medium text-red-800 mb-2">{currentCard.example}</p>
                    <p className="text-red-600 text-sm italic">{currentCard.translation}</p>
                  </div>
                </div>

                {/* Educational Content Toggle */}
                <div className="text-center mt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowEducationalContent(!showEducationalContent)
                    }}
                    className="flex items-center justify-center space-x-2 mx-auto px-4 py-2 bg-accent-gold text-white rounded-lg hover:bg-accent-gold-600 transition-colors"
                  >
                    <FaLightbulb />
                    <span>Learn More</span>
                  </button>
                </div>

                {showEducationalContent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-accent-green-50 to-accent-blue-50 rounded-xl border border-accent-green-200"
                  >
                    <div className="text-left space-y-3">
                      {currentCard.culturalContext && (
                        <div>
                          <h4 className="font-semibold text-accent-green-700 flex items-center">
                            <FaGlobeAfrica className="mr-2" />
                            Cultural Context
                          </h4>
                          <p className="text-sm text-gray-700">{currentCard.culturalContext}</p>
                        </div>
                      )}
                      {currentCard.usageNotes && (
                        <div>
                          <h4 className="font-semibold text-accent-gold-700 flex items-center">
                            <FaLightbulb className="mr-2" />
                            Usage
                          </h4>
                          <p className="text-sm text-gray-700">{currentCard.usageNotes}</p>
                        </div>
                      )}
                      {currentCard.englishAnchor && (
                        <div>
                          <h4 className="font-semibold text-accent-blue-700 flex items-center">
                            <FaBookOpen className="mr-2" />
                            How to Pronounce
                          </h4>
                          <p className="text-sm text-gray-700">{currentCard.englishAnchor}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                <p className="text-center text-gray-500 mt-6 text-sm">
                  Tap to see Shona word
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevCard}
          className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-lg transition-all border-2 border-gray-200"
        >
          <FaArrowLeft />
          <span>Previous</span>
        </button>

        <button
          onClick={nextCard}
          className="flex items-center space-x-2 px-6 py-3 bg-accent-green hover:bg-accent-green-600 text-white rounded-xl shadow-lg transition-all"
        >
          <span>Next</span>
          <FaArrowRight />
        </button>
      </div>
    </div>
  )
}
