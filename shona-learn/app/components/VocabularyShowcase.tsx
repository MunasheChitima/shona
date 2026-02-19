'use client'
import React, { useState, useEffect } from 'react'
import { FaSearch, FaPlay, FaBook, FaGlobe } from 'react-icons/fa'
import LoadingSpinner from './LoadingSpinner'

interface VocabularyWord {
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
  grammarNotes: string
  culturalContext: string
  usageNotes: string
}

export default function VocabularyShowcase() {
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVocabulary()
  }, [])

  const fetchVocabulary = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please log in to view vocabulary')
        setLoading(false)
        return
      }

      const response = await fetch('/api/vocabulary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch vocabulary')
      }

      const data = await response.json()
      setVocabulary(data)
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map((word: VocabularyWord) => word.category))]
        .filter((category): category is string => Boolean(category))
        .sort()
      setCategories(uniqueCategories)
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load vocabulary')
    } finally {
      setLoading(false)
    }
  }

  const filteredVocabulary = vocabulary.filter(word => {
    const matchesSearch = !searchTerm || 
      word.shona.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.english.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = !selectedCategory || word.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading vocabulary..." />
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="text-red-600 text-lg font-semibold mb-2">Error Loading Vocabulary</div>
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">Shona Vocabulary Collection</h2>
        <p className="text-xl opacity-90 mb-4">
          Explore {vocabulary.length} words across {categories.length} categories
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{vocabulary.length}</div>
            <div className="text-sm opacity-80">Total Words</div>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{categories.length}</div>
            <div className="text-sm opacity-80">Categories</div>
          </div>
          <div className="bg-white/20 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{filteredVocabulary.length}</div>
            <div className="text-sm opacity-80">Filtered Results</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-soft p-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search words in Shona or English..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <div className="md:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Category Overview */}
      {!searchTerm && !selectedCategory && (
        <div className="bg-white rounded-xl shadow-soft p-6 border border-white/20">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Browse by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map(category => {
              const count = vocabulary.filter(word => word.category === category).length
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className="p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl hover:from-green-200 hover:to-blue-200 transition-all duration-200 text-left"
                >
                  <div className="font-semibold text-gray-800">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </div>
                  <div className="text-sm text-gray-600">{count} words</div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Vocabulary Grid */}
      <div className="grid gap-4">
        {filteredVocabulary.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaSearch className="mx-auto text-4xl mb-4 opacity-50" />
            <p className="text-lg">No vocabulary found matching your search.</p>
            <p className="text-sm mt-2">Try adjusting your search terms or category filter.</p>
          </div>
        ) : (
          filteredVocabulary.map(word => (
            <VocabularyCard key={word.id} word={word} />
          ))
        )}
      </div>
    </div>
  )
}

function VocabularyCard({ word }: { word: VocabularyWord }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white rounded-xl shadow-soft p-6 border border-white/20 hover:shadow-medium transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-2xl font-bold text-gray-800">{word.shona}</h3>
            <span className="text-lg text-gray-600">{word.english}</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-gray-500">{word.pronunciation}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">{word.ipa}</span>
            {word.tones && (
              <>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">Tones: {word.tones}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {word.category}
            </span>
            {word.audioFile && (
              <button className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
                <FaPlay className="mr-1" />
                Audio
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-green-600 hover:text-green-700 font-medium text-sm"
        >
          {expanded ? 'Less' : 'More'}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          {word.example && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-1 flex items-center">
                <FaBook className="mr-2 text-green-600" />
                Example
              </h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="font-medium text-gray-800">{word.example}</p>
                <p className="text-gray-600 text-sm mt-1">{word.translation}</p>
              </div>
            </div>
          )}

          {word.culturalContext && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-1 flex items-center">
                <FaGlobe className="mr-2 text-blue-600" />
                Cultural Context
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">{word.culturalContext}</p>
            </div>
          )}

          {word.usageNotes && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Usage Notes</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{word.usageNotes}</p>
            </div>
          )}

          {word.grammarNotes && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Grammar Notes</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{word.grammarNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 