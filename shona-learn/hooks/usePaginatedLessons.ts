import { useState, useEffect, useCallback } from 'react'

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface UsePaginatedLessonsResult {
  lessons: any[]
  pagination: PaginationInfo | null
  isLoading: boolean
  error: string | null
  loadMore: () => void
  refreshLessons: () => void
  setCategory: (category: string | null) => void
  setSearch: (search: string) => void
}

export function usePaginatedLessons(initialLimit: number = 10): UsePaginatedLessonsResult {
  const [lessons, setLessons] = useState<any[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [category, setCategory] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const fetchLessons = useCallback(async (pageNum: number, append: boolean = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: initialLimit.toString()
      })

      if (category) params.append('category', category)
      if (search) params.append('search', search)

      const res = await fetch(`/api/lessons?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!res.ok) {
        throw new Error('Failed to fetch lessons')
      }

      const data = await res.json()
      
      if (append) {
        setLessons(prev => [...prev, ...data.lessons])
      } else {
        setLessons(data.lessons)
      }
      
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load lessons')
    } finally {
      setIsLoading(false)
    }
  }, [category, search, initialLimit])

  useEffect(() => {
    setPage(1)
    fetchLessons(1, false)
  }, [category, search, fetchLessons])

  const loadMore = useCallback(() => {
    if (pagination?.hasNextPage && !isLoading) {
      const nextPage = page + 1
      setPage(nextPage)
      fetchLessons(nextPage, true)
    }
  }, [pagination, isLoading, page, fetchLessons])

  const refreshLessons = useCallback(() => {
    setPage(1)
    fetchLessons(1, false)
  }, [fetchLessons])

  return {
    lessons,
    pagination,
    isLoading,
    error,
    loadMore,
    refreshLessons,
    setCategory,
    setSearch
  }
} 