'use client'
import { useState, useEffect, lazy, Suspense, useCallback, useMemo } from 'react'
import { useAudioService } from '@/lib/services/AudioService'
import LoadingSpinner from './LoadingSpinner'

// Lazy load heavy components
const FlashcardItem = lazy(() => import('./FlashcardItem'))
const AudioPlayer = lazy(() => import('./voice/AudioPlayer'))

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

interface LazyFlashcardDeckProps {
  userId: string
  lessonId?: string
  category?: string
  limit?: number
  onProgress?: (progress: number) => void
}

export default function LazyFlashcardDeck({
  userId,
  lessonId,
  category,
  limit = 20,
  onProgress
}: LazyFlashcardDeckProps) {
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visibleItems, setVisibleItems] = useState<number[]>([])
  
  const audioService = useAudioService()

  // Memoized fetch function
  const fetchVocabulary = useCallback(async (pageNum: number, reset = false) => {
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: limit.toString(),
        userId,
        ...(lessonId && { lessonId }),
        ...(category && { category }),
        includeAudio: 'true'
      })

      const response = await fetch(`/api/vocabulary?${params}`)
      if (!response.ok) throw new Error('Failed to fetch vocabulary')

      const data = await response.json()
      
      if (reset) {
        setVocabularyItems(data.items)
      } else {
        setVocabularyItems(prev => [...prev, ...data.items])
      }
      
      setHasMore(data.pagination.hasMore)
      
      // Preload audio for current batch
      const audioUrls = data.items
        .filter((item: VocabularyItem) => item.audioText)
        .map((item: VocabularyItem) => `/audio/${item.audioText}.mp3`)
      
      audioService.preloadLessonAudio(audioUrls)
      
    } catch (error) {
      console.error('Failed to fetch vocabulary:', error)
    } finally {
      setLoading(false)
    }
  }, [userId, lessonId, category, limit, audioService])

  // Initial load
  useEffect(() => {
    fetchVocabulary(0, true)
  }, [fetchVocabulary])

  // Virtual scrolling logic - only render visible items
  useEffect(() => {
    const itemsPerPage = 5
    const start = Math.max(0, currentIndex - itemsPerPage)
    const end = Math.min(vocabularyItems.length, currentIndex + itemsPerPage + 1)
    
    setVisibleItems(Array.from({ length: end - start }, (_, i) => start + i))
  }, [currentIndex, vocabularyItems.length])

  // Load more when reaching end
  const loadMore = useCallback(() => {
    if (!loading && hasMore && currentIndex >= vocabularyItems.length - 3) {
      setLoading(true)
      setPage(prev => {
        const nextPage = prev + 1
        fetchVocabulary(nextPage, false)
        return nextPage
      })
    }
  }, [loading, hasMore, currentIndex, vocabularyItems.length, fetchVocabulary])

  // Auto-load more when needed
  useEffect(() => {
    loadMore()
  }, [loadMore])

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(vocabularyItems.length - 1, prev + 1))
  }, [vocabularyItems.length])

  const handlePrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1))
  }, [])

  const handleItemSelect = useCallback((index: number) => {
    setCurrentIndex(index)
    onProgress?.(index / vocabularyItems.length * 100)
  }, [vocabularyItems.length, onProgress])

  if (loading && vocabularyItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading flashcards..." />
      </div>
    )
  }

  const currentItem = vocabularyItems[currentIndex]

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress bar */}
      {vocabularyItems.length > 0 && (
        <div className="mb-4">
          <div className="bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentIndex + 1) / vocabularyItems.length * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-1 text-center">
            {currentIndex + 1} of {vocabularyItems.length} flashcards
          </p>
        </div>
      )}

      {/* Current flashcard */}
      {currentItem ? (
        <div className="mb-6">
          <Suspense fallback={<div className="h-48 bg-gray-100 rounded-lg animate-pulse" />}>
            <FlashcardItem
              item={currentItem}
              isActive={true}
              onSelect={() => {}}
              onProgress={() => onProgress?.((currentIndex + 1) / vocabularyItems.length * 100)}
            />
          </Suspense>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">No flashcards found for the selected criteria.</p>
        </div>
      )}

      {/* Navigation controls */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors hover:bg-blue-600"
        >
          Previous
        </button>
        
        <div className="flex space-x-2">
          {vocabularyItems.slice(Math.max(0, currentIndex - 2), currentIndex + 3).map((_, i) => {
            const itemIndex = Math.max(0, currentIndex - 2) + i
            return (
              <button
                key={itemIndex}
                onClick={() => handleItemSelect(itemIndex)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  itemIndex === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            )
          })}
        </div>
        
        <button
          onClick={handleNext}
          disabled={currentIndex === vocabularyItems.length - 1}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors hover:bg-blue-600"
        >
          Next
        </button>
      </div>

      {/* Current flashcard audio player */}
      {currentItem?.audioText && (
        <div className="mb-4">
          <Suspense fallback={<div className="h-16 bg-gray-100 rounded animate-pulse" />}>
            <AudioPlayer
              src={`/audio/${currentItem.audioText}.mp3`}
              text={currentItem.shonaText}
              pronunciation={currentItem.pronunciation}
            />
          </Suspense>
        </div>
      )}

      {/* Thumbnail strip for quick navigation */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Quick Navigation</h3>
        <div className="flex overflow-x-auto space-x-3 pb-3">
          {visibleItems.map(index => {
            const item = vocabularyItems[index]
            if (!item) return null
            
            return (
              <button
                key={item.id}
                onClick={() => handleItemSelect(index)}
                className={`flex-shrink-0 w-32 h-20 bg-white rounded-lg border-2 p-2 transition-colors ${
                  index === currentIndex ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs font-medium text-gray-800 truncate">
                  {item.shonaText}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {item.englishText}
                </div>
              </button>
            )
          })}
          {loading && (
            <div className="flex-shrink-0 w-32 h-20 bg-gray-100 rounded-lg animate-pulse" />
          )}
        </div>
      </div>

      {/* Cache statistics (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <div>Audio Cache: {JSON.stringify(audioService.getCacheStats(), null, 2)}</div>
          <div>Visible Items: {visibleItems.length} / {vocabularyItems.length}</div>
        </div>
      )}
    </div>
  )
}