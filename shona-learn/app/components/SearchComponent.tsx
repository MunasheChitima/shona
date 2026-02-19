'use client'
import { useState, useEffect, useCallback } from 'react'
import { FaSearch, FaFilter, FaTimes, FaBook, FaVolumeUp, FaGlobeAfrica, FaGraduationCap } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import { useContentChunking } from '@/hooks/useContentChunking'

interface SearchResult {
  id: string
  type: 'lesson' | 'vocabulary' | 'exercise' | 'cultural'
  title: string
  description: string
  category: string
  level?: string
  relevance: number
  url: string
}

interface SearchFilters {
  type: string[]
  category: string[]
  level: string[]
  difficulty: string[]
}

export default function SearchComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<SearchResult[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    type: [],
    category: [],
    level: [],
    difficulty: []
  })
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)

  // Content chunking hook for lessons
  const {
    chunks: lessonChunks,
    isLoading: lessonsLoading,
    loadChunks: loadLessons
  } = useContentChunking({
    type: 'lesson',
    autoLoad: false
  })

  // Content chunking hook for vocabulary
  const {
    chunks: vocabChunks,
    isLoading: vocabLoading,
    loadChunks: loadVocabulary
  } = useContentChunking({
    type: 'vocabulary',
    autoLoad: false
  })

  // Search function with debouncing
  const searchContent = useCallback(async (query: string, searchFilters: SearchFilters) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    const searchResults: SearchResult[] = []

    try {
      // Search lessons
      await loadLessons(1, { search: query, ...searchFilters })
      lessonChunks.forEach(chunk => {
        chunk.data.forEach((lesson: any) => {
          const relevance = calculateRelevance(query, lesson.title, lesson.description)
          if (relevance > 0) {
            searchResults.push({
              id: lesson.id,
              type: 'lesson',
              title: lesson.title,
              description: lesson.description,
              category: lesson.category,
              level: lesson.level,
              relevance,
              url: `/learn?lesson=${lesson.id}`
            })
          }
        })
      })

      // Search vocabulary
      await loadVocabulary(1, { search: query, ...searchFilters })
      vocabChunks.forEach(chunk => {
        chunk.data.forEach((vocab: any) => {
          const relevance = calculateRelevance(query, vocab.shona, vocab.english)
          if (relevance > 0) {
            searchResults.push({
              id: vocab.id || vocab.shona,
              type: 'vocabulary',
              title: vocab.shona,
              description: vocab.english,
              category: vocab.category,
              relevance,
              url: `/flashcards?word=${vocab.shona}`
            })
          }
        })
      })

      // Sort by relevance
      searchResults.sort((a, b) => b.relevance - a.relevance)
      setResults(searchResults)
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [lessonChunks, vocabChunks, loadLessons, loadVocabulary])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchContent(searchQuery, filters)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, filters, searchContent])

  // Calculate search relevance
  const calculateRelevance = (query: string, title: string, description: string): number => {
    const queryLower = query.toLowerCase()
    const titleLower = title.toLowerCase()
    const descLower = description.toLowerCase()

    let relevance = 0

    // Exact title match gets highest score
    if (titleLower === queryLower) relevance += 100
    // Title contains query
    else if (titleLower.includes(queryLower)) relevance += 50
    // Description contains query
    else if (descLower.includes(queryLower)) relevance += 25

    // Word-by-word matching
    const queryWords = queryLower.split(' ').filter(word => word.length > 2)
    queryWords.forEach(word => {
      if (titleLower.includes(word)) relevance += 10
      if (descLower.includes(word)) relevance += 5
    })

    return relevance
  }

  // Filter options
  const filterOptions = {
    type: [
      { value: 'lesson', label: 'Lessons', icon: FaBook },
      { value: 'vocabulary', label: 'Vocabulary', icon: FaVolumeUp },
      { value: 'cultural', label: 'Cultural', icon: FaGlobeAfrica },
      { value: 'exercise', label: 'Exercises', icon: FaGraduationCap }
    ],
    category: [
      'Basics', 'Numbers', 'Family', 'Colors', 'Animals', 'Food', 'Weather', 'Time', 'Travel'
    ],
    level: ['beginner', 'intermediate', 'advanced'],
    difficulty: ['easy', 'medium', 'hard']
  }

  // Handle filter changes
  const handleFilterChange = (filterType: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      type: [],
      category: [],
      level: [],
      difficulty: []
    })
  }

  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    setSelectedResult(result)
    // Navigate to the result
    window.location.href = result.url
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search lessons, vocabulary, cultural content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-20 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                showFilters ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <FaFilter className="w-4 h-4" />
            </button>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 bg-white rounded-xl p-4 shadow-soft border border-gray-200"
          >
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Content Type</h4>
                <div className="space-y-2">
                  {filterOptions.type.map(option => (
                    <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.type.includes(option.value)}
                        onChange={() => handleFilterChange('type', option.value)}
                        className="rounded text-green-500 focus:ring-green-500"
                      />
                      <option.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Category</h4>
                <div className="space-y-2">
                  {filterOptions.category.map(category => (
                    <label key={category} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.category.includes(category)}
                        onChange={() => handleFilterChange('category', category)}
                        className="rounded text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Level Filter */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Level</h4>
                <div className="space-y-2">
                  {filterOptions.level.map(level => (
                    <label key={level} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.level.includes(level)}
                        onChange={() => handleFilterChange('level', level)}
                        className="rounded text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600 capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Difficulty</h4>
                <div className="space-y-2">
                  {filterOptions.difficulty.map(difficulty => (
                    <label key={difficulty} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.difficulty.includes(difficulty)}
                        onChange={() => handleFilterChange('difficulty', difficulty)}
                        className="rounded text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-600 capitalize">{difficulty}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results */}
      <div className="space-y-4">
        {/* Loading State */}
        {isSearching && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-gray-600">Searching...</p>
          </div>
        )}

        {/* No Results */}
        {!isSearching && searchQuery && results.length === 0 && (
          <div className="text-center py-8">
            <FaSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No results found</h3>
            <p className="text-gray-500">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        )}

        {/* Results List */}
        {!isSearching && results.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </h3>
              <p className="text-sm text-gray-500">
                Showing results for "{searchQuery}"
              </p>
            </div>

            <div className="space-y-3">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleResultClick(result)}
                  className="bg-white rounded-xl p-4 shadow-soft border border-gray-200 hover:shadow-medium transition-all cursor-pointer group"
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        {result.type === 'lesson' && <FaBook className="w-5 h-5 text-green-600" />}
                        {result.type === 'vocabulary' && <FaVolumeUp className="w-5 h-5 text-green-600" />}
                        {result.type === 'cultural' && <FaGlobeAfrica className="w-5 h-5 text-green-600" />}
                        {result.type === 'exercise' && <FaGraduationCap className="w-5 h-5 text-green-600" />}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                          {result.title}
                        </h4>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full capitalize">
                          {result.type}
                        </span>
                        {result.level && (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-600 rounded-full capitalize">
                            {result.level}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2 line-clamp-2">{result.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="capitalize">{result.category}</span>
                        <span>•</span>
                        <span>{Math.round(result.relevance)}% match</span>
                      </div>
                    </div>

                    {/* Relevance Score */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-600">
                          {Math.round(result.relevance)}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 