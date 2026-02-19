'use client'
import { useState } from 'react'
import { FaVolumeUp, FaArrowLeft, FaArrowRight, FaRandom, FaBookOpen, FaLightbulb, FaGlobeAfrica, FaPlay, FaPause } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import PronunciationText from './shared/PronunciationText'
import LoadingSpinner from './LoadingSpinner'
import { useFlashcards } from '@/hooks/useFlashcards'

interface FlashcardDeckProps {
  category?: string
  limit?: number
}

export default function FlashcardDeckRefactored({ category, limit = 10 }: FlashcardDeckProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [showEducationalContent, setShowEducationalContent] = useState(false)
  
  const {
    flashcards,
    currentIndex,
    isLoading,
    audioError,
    currentCard,
    progress,
    isPlaying,
    playAudio,
    nextCard,
    prevCard,
    shuffleCards
  } = useFlashcards({ category, limit })

  const handlePlayAudio = async () => {
    if (currentCard) {
      await playAudio(currentCard.audioFile, currentCard.shona)
    }
  }

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleNextCard = () => {
    setIsFlipped(false)
    setShowEducationalContent(false)
    nextCard()
  }

  const handlePrevCard = () => {
    setIsFlipped(false)
    setShowEducationalContent(false)
    prevCard()
  }

  const handleShuffle = () => {
    setIsFlipped(false)
    setShowEducationalContent(false)
    shuffleCards()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No flashcards available</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          📚 Shona Flashcards
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {progress.current} / {progress.total}
          </span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-zimbabwe transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative mb-8">
        <motion.div
          className="relative cursor-pointer"
          onClick={handleCardFlip}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-white rounded-2xl shadow-large p-8 border border-gray-200 min-h-64">
            <AnimatePresence mode="wait">
              {!isFlipped ? (
                <motion.div
                  key="front"
                  initial={{ rotateY: 0 }}
                  exit={{ rotateY: -90 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="mb-6">
                    <h3 className="text-4xl font-bold text-gray-800 mb-2">
                      {currentCard.shona}
                    </h3>
                    <PronunciationText 
                      word={currentCard.shona}
                      pronunciation={currentCard.pronunciation}
                      phonetic={currentCard.phoneticPronunciation}
                    />
                  </div>
                  
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePlayAudio()
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-zimbabwe text-white rounded-xl hover:shadow-medium transition-all"
                      disabled={isPlaying}
                    >
                      {isPlaying ? <FaPause /> : <FaPlay />}
                      <span>Listen</span>
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-500 mt-4">
                    Click to flip and see translation
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="back"
                  initial={{ rotateY: 90 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="mb-6">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">
                      {currentCard.english}
                    </h3>
                    <p className="text-lg text-gray-600 mb-4">
                      {currentCard.translation}
                    </p>
                    {currentCard.example && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-700">
                          <strong>Example:</strong> {currentCard.example}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowEducationalContent(!showEducationalContent)
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <FaLightbulb />
                      <span>Learn More</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Educational Content */}
        {showEducationalContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-white rounded-xl shadow-medium p-6 border border-gray-200"
          >
            <div className="grid md:grid-cols-2 gap-6">
              {currentCard.grammarNotes && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <FaBookOpen className="mr-2" />
                    Grammar Notes
                  </h4>
                  <p className="text-sm text-gray-600">{currentCard.grammarNotes}</p>
                </div>
              )}
              
              {currentCard.culturalContext && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <FaGlobeAfrica className="mr-2" />
                    Cultural Context
                  </h4>
                  <p className="text-sm text-gray-600">{currentCard.culturalContext}</p>
                </div>
              )}
              
              {currentCard.usageNotes && (
                <div className="md:col-span-2">
                  <h4 className="font-semibold text-gray-800 mb-2">Usage Notes</h4>
                  <p className="text-sm text-gray-600">{currentCard.usageNotes}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Audio Error */}
      {audioError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{audioError}</p>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevCard}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
        >
          <FaArrowLeft />
          <span>Previous</span>
        </button>

        <div className="flex space-x-2">
          <button
            onClick={handleShuffle}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
          >
            <FaRandom />
            <span>Shuffle</span>
          </button>
        </div>

        <button
          onClick={handleNextCard}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-zimbabwe text-white rounded-xl hover:shadow-medium transition-all"
        >
          <span>Next</span>
          <FaArrowRight />
        </button>
      </div>
    </div>
  )
} 