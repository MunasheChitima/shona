import { useState, useEffect, useCallback } from 'react'
import { contentChunkingService, ContentChunk } from '@/lib/services/ContentChunkingService'

export interface UseContentChunkingOptions {
  type: 'lesson' | 'vocabulary' | 'exercise' | 'cultural'
  page?: number
  filters?: any
  chunkSize?: number
  autoLoad?: boolean
}

export interface UseContentChunkingReturn {
  chunks: ContentChunk[]
  currentChunk: ContentChunk | null
  isLoading: boolean
  error: string | null
  hasNext: boolean
  hasPrevious: boolean
  totalChunks: number
  currentPage: number
  loadChunks: (page?: number, filters?: any) => Promise<void>
  nextChunk: () => void
  previousChunk: () => void
  goToChunk: (index: number) => void
  refresh: () => Promise<void>
}

export function useContentChunking({
  type,
  page = 1,
  filters = {},
  chunkSize,
  autoLoad = true
}: UseContentChunkingOptions): UseContentChunkingReturn {
  const [chunks, setChunks] = useState<ContentChunk[]>([])
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(page)

  const loadChunks = useCallback(async (pageNum?: number, newFilters?: any) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const targetPage = pageNum ?? currentPage
      const targetFilters = newFilters ?? filters
      
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        setChunks([])
        return
      }
      
      const loadedChunks = await contentChunkingService.loadContentChunks(
        type,
        targetPage,
        targetFilters
      )
      
      setChunks(loadedChunks)
      setCurrentChunkIndex(0)
      setCurrentPage(targetPage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content')
      console.error('Error loading content chunks:', err)
      setChunks([]) // Set empty chunks on error
    } finally {
      setIsLoading(false)
    }
  }, [type, currentPage, filters])

  const nextChunk = useCallback(() => {
    if (currentChunkIndex < chunks.length - 1) {
      setCurrentChunkIndex(prev => prev + 1)
    }
  }, [currentChunkIndex, chunks.length])

  const previousChunk = useCallback(() => {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex(prev => prev - 1)
    }
  }, [currentChunkIndex])

  const goToChunk = useCallback((index: number) => {
    if (index >= 0 && index < chunks.length) {
      setCurrentChunkIndex(index)
    }
  }, [chunks.length])

  const refresh = useCallback(async () => {
    await loadChunks(currentPage, filters)
  }, [loadChunks, currentPage, filters])

  // Auto-load chunks on mount or when dependencies change
  useEffect(() => {
    if (autoLoad) {
      loadChunks()
    }
  }, [autoLoad, loadChunks])

  const currentChunk = chunks[currentChunkIndex] || null
  const hasNext = currentChunkIndex < chunks.length - 1
  const hasPrevious = currentChunkIndex > 0
  const totalChunks = chunks.length

  return {
    chunks,
    currentChunk,
    isLoading,
    error,
    hasNext,
    hasPrevious,
    totalChunks,
    currentPage,
    loadChunks,
    nextChunk,
    previousChunk,
    goToChunk,
    refresh
  }
} 