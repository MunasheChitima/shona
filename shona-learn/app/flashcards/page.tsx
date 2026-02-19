'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import FlashcardDeck from '../components/FlashcardDeck'
import ErrorBoundary from '../components/ErrorBoundary'
import { FaBookOpen, FaUsers, FaPalette, FaHandshake, FaHome, FaUtensils, FaHeart, FaGraduationCap } from 'react-icons/fa'
import LoadingSpinner from '../components/LoadingSpinner'

const categories = [
  { id: 'basic', name: 'Basic Words', icon: FaBookOpen, color: 'from-blue-400 to-blue-600' },
  { id: 'family', name: 'Family', icon: FaUsers, color: 'from-green-400 to-green-600' },
  { id: 'colors', name: 'Colors', icon: FaPalette, color: 'from-purple-400 to-purple-600' },
  { id: 'greetings', name: 'Greetings', icon: FaHandshake, color: 'from-orange-400 to-orange-600' },
  { id: 'home', name: 'Home', icon: FaHome, color: 'from-red-400 to-red-600' },
  { id: 'food', name: 'Food', icon: FaUtensils, color: 'from-yellow-400 to-yellow-600' },
  { id: 'body', name: 'Body Parts', icon: FaHeart, color: 'from-pink-400 to-pink-600' },
  { id: 'communication', name: 'Communication', icon: FaGraduationCap, color: 'from-indigo-400 to-indigo-600' }
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
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                Choose a Category
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-soft border border-white/20 hover:shadow-large transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-r ${category.color} mx-auto mb-4`}>
                      <category.icon className="text-white text-2xl" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {category.name}
                    </h3>
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
                  <FaBookOpen />
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
