'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FlashcardDeck from '../components/FlashcardDeck'
import ErrorBoundary from '../components/ErrorBoundary'
import { FaArrowLeft } from 'react-icons/fa'
import LoadingSpinner from '../components/LoadingSpinner'

const categories = [
  // Beginner
  { id: 'Unit 1: First Words', name: 'First Words', level: 'beginner', color: 'from-green-400 to-green-600' },
  { id: 'Unit 2: People Around You', name: 'People', level: 'beginner', color: 'from-pink-400 to-pink-600' },
  { id: 'Unit 3: Numbers & Time', name: 'Numbers & Time', level: 'beginner', color: 'from-purple-400 to-purple-600' },
  { id: 'Unit 4: Daily Life', name: 'Daily Life', level: 'beginner', color: 'from-yellow-400 to-yellow-600' },
  { id: 'Unit 5: Getting Around', name: 'Getting Around', level: 'beginner', color: 'from-cyan-400 to-cyan-600' },
  { id: 'Unit 6: Doing Things', name: 'Doing Things', level: 'beginner', color: 'from-red-400 to-red-600' },
  // Intermediate
  { id: 'Unit 7: Expressing Yourself', name: 'Expressing Yourself', level: 'intermediate', color: 'from-indigo-400 to-indigo-600' },
  { id: 'Unit 8: Culture & Traditions', name: 'Culture', level: 'intermediate', color: 'from-emerald-400 to-emerald-600' },
  { id: 'Unit 9: Nature & Environment', name: 'Nature', level: 'intermediate', color: 'from-teal-400 to-teal-600' },
  { id: 'Unit 10: Modern Life', name: 'Modern Life', level: 'intermediate', color: 'from-sky-400 to-sky-600' },
  // Advanced
  { id: 'Unit 11: Society & Governance', name: 'Society', level: 'advanced', color: 'from-red-500 to-red-700' },
  { id: 'Unit 12: Complex Communication', name: 'Complex Shona', level: 'advanced', color: 'from-violet-500 to-violet-700' },
  { id: 'Unit 13: Deeper Culture', name: 'Deep Culture', level: 'advanced', color: 'from-amber-500 to-amber-700' },
]

export default function Flashcards() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const userData = localStorage.getItem('user')
        if (userData) {
          try {
            setUser(JSON.parse(userData))
          } catch (error) {
            console.error('Error parsing user data:', error)
            router.push('/login')
          }
        } else {
          router.push('/login')
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [router])

  // Don't render anything while checking auth
  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading flashcards..." />
  }
  if (!user) {
    return <div className="text-center text-red-600 py-8">Failed to load user data. Please try again.</div>
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-sunrise">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Shona Flashcards
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Practice Shona vocabulary with interactive flashcards. Tap to flip, listen to pronunciation, and master the language!
            </p>
          </div>

          {!selectedCategory ? (
            // Category Selection
            <div className="max-w-4xl mx-auto">
              {/* Beginner */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Beginner</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {categories.filter(c => c.level === 'beginner').map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-large transition-all duration-300 hover:-translate-y-1 text-left"
                  >
                    <div className={`w-full h-2 rounded-full bg-gradient-to-r ${category.color} mb-3`} />
                    <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-green-600 font-medium">Beginner</p>
                  </button>
                ))}
              </div>

              {/* Intermediate */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Intermediate</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {categories.filter(c => c.level === 'intermediate').map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-large transition-all duration-300 hover:-translate-y-1 text-left"
                  >
                    <div className={`w-full h-2 rounded-full bg-gradient-to-r ${category.color} mb-3`} />
                    <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-blue-600 font-medium">Intermediate</p>
                  </button>
                ))}
              </div>

              {/* Advanced */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Advanced</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {categories.filter(c => c.level === 'advanced').map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-soft border border-white/20 hover:shadow-large transition-all duration-300 hover:-translate-y-1 text-left"
                  >
                    <div className={`w-full h-2 rounded-full bg-gradient-to-r ${category.color} mb-3`} />
                    <h3 className="text-lg font-semibold text-gray-800">{category.name}</h3>
                    <p className="text-sm text-red-600 font-medium">Advanced</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Flashcard Deck
            <div>
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
                >
                  <FaArrowLeft />
                  <span>Back to Categories</span>
                </button>
                
                <h2 className="text-2xl font-bold text-gray-800">
                  {categories.find(c => c.id === selectedCategory)?.name} Flashcards
                </h2>
              </div>
              
              <FlashcardDeck category={selectedCategory} limit={20} />
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
}
