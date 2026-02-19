import { useState, useEffect } from 'react'
import { audioService } from '@/lib/services/AudioService'
import { enhanceFlashcard } from '@/lib/flashcard-utils'

export interface Flashcard {
  id: string
  shona: string
  english: string
  pronunciation: string
  ipa: string
  tones: string
  category: string
  audioFile?: string
  example: string
  translation: string
  grammarNotes?: string
  culturalContext?: string
  usageNotes?: string
  phoneticPronunciation?: string
}

export interface UseFlashcardsOptions {
  category?: string
  limit?: number
}

export function useFlashcards({ category, limit = 10 }: UseFlashcardsOptions) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [audioError, setAudioError] = useState<string | null>(null)

  useEffect(() => {
    loadFlashcards()
    
    // Cleanup on unmount
    return () => {
      audioService.cleanup()
    }
  }, [category, limit])

  const loadFlashcards = async () => {
    try {
      setIsLoading(true)
      let data = []
      let token = null
      
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token')
      }
      
      // Try API first if we have a token
      if (token) {
        try {
          const response = await fetch('/api/vocabulary', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            data = await response.json()
          }
        } catch (apiError) {
          console.log('API call failed, using static data fallback')
        }
      }
      
      // Fallback to static data if no API data
      if (data.length === 0) {
        try {
          const staticResponse = await fetch('/flashcards.json')
          const staticData = await staticResponse.json()
          data = staticData.flashcards || []
        } catch (staticError) {
          console.error('Failed to load static flashcards:', staticError)
        }
      }
      
      // Filter by category if specified
      let filteredCards = data
      if (category) {
        filteredCards = data.filter((card: Flashcard) => card.category === category)
      }
      
      // Enhance cards with additional data
      const enhancedCards = filteredCards.map((card: Flashcard, idx: number) => 
        enhanceFlashcard(card, idx)
      )
      
      // Shuffle and limit
      const shuffled = enhancedCards.sort(() => Math.random() - 0.5).slice(0, limit)
      setFlashcards(shuffled)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading flashcards:', error)
      setIsLoading(false)
    }
  }

  const playAudio = async (audioFile?: string, text?: string) => {
    setAudioError(null)
    
    const result = await audioService.playAudio(audioFile, text)
    if (!result.success) {
      setAudioError(result.error || 'Failed to play audio')
    }
  }

  const nextCard = () => {
    setCurrentIndex(prev => (prev + 1) % flashcards.length)
  }

  const prevCard = () => {
    setCurrentIndex(prev => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const shuffleCards = () => {
    setFlashcards(prev => [...prev].sort(() => Math.random() - 0.5))
    setCurrentIndex(0)
  }

  const getCurrentCard = () => flashcards[currentIndex] || null

  const getProgress = () => ({
    current: currentIndex + 1,
    total: flashcards.length,
    percentage: flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0
  })

  return {
    flashcards,
    currentIndex,
    isLoading,
    audioError,
    currentCard: getCurrentCard(),
    progress: getProgress(),
    isPlaying: audioService.getIsPlaying(),
    playAudio,
    nextCard,
    prevCard,
    shuffleCards,
    reload: loadFlashcards
  }
} 