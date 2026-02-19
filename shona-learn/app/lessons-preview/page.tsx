'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaLock, FaPlay, FaStar, FaClock, FaUsers } from 'react-icons/fa'

interface Lesson {
  id: string
  title: string
  description: string
  category: string
  level: string
  difficulty: string
  xpReward: number
  estimatedDuration: number
  emoji: string
  vocabulary?: any[]
  exercises?: any[]
}

export default function LessonsPreview() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    console.log('Component mounted, loading lessons...')
    loadLessons()
  }, [])

  const loadLessons = async () => {
    try {
      console.log('Loading lessons...')
      setLoading(true)
      const response = await fetch('/api/lessons/public')
      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Lessons data:', data)
        setLessons(data.lessons || [])
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.lessons?.map((l: Lesson) => l.category) || [])] as string[]
        setCategories(uniqueCategories)
        console.log('Categories:', uniqueCategories)
      } else {
        console.error('Response not ok:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Failed to load lessons:', error)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  const filteredLessons = selectedCategory === 'all' 
    ? lessons 
    : lessons.filter(lesson => lesson.category === selectedCategory)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'hard': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      'Cultural Immersion': '🌍',
      'Basic Vocabulary': '🔤',
      'Body Parts': '👤',
      'Colors': '🎨',
      'Communication': '💬',
      'Family': '👨‍👩‍👧‍👦',
      'Food': '🍽️',
      'Home': '🏠',
      'Nature': '🌿',
      'Numbers': '🔢'
    }
    return icons[category] || '📚'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-zimbabwe rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white text-xl font-bold">🇿🇼</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Shona Learning</h1>
                <p className="text-sm text-gray-600">Lesson Preview</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors">
                  Home
                </button>
              </Link>
              <Link href="/register">
                <button className="px-4 py-2 bg-gradient-zimbabwe text-white rounded-lg font-medium hover:shadow-md transition-all">
                  Start Learning
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Explore Shona Lessons
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover the beautiful language of Zimbabwe through our comprehensive lesson collection. 
            Each lesson is designed to help you learn Shona in a fun, interactive way.
          </p>
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-zimbabwe text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-zimbabwe text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {getCategoryIcon(category)} {category}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20 overflow-hidden"
            >
              {/* Lesson Header */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-4xl">{lesson.emoji}</div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(lesson.difficulty)}`}>
                      {lesson.difficulty}
                    </span>
                    <div className="flex items-center text-yellow-500">
                      <FaStar className="w-4 h-4" />
                      <span className="ml-1 text-sm font-medium">{lesson.xpReward} XP</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{lesson.title}</h3>
                <p className="text-gray-600 mb-4">{lesson.description}</p>

                {/* Lesson Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <FaClock className="w-4 h-4 mr-1" />
                    <span>{lesson.estimatedDuration} min</span>
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="w-4 h-4 mr-1" />
                    <span>{lesson.exercises?.length || 0} exercises</span>
                  </div>
                </div>

                {/* Sample Vocabulary */}
                {lesson.vocabulary && lesson.vocabulary.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Words:</h4>
                    <div className="flex flex-wrap gap-2">
                      {lesson.vocabulary.slice(0, 3).map((vocab: any, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {vocab.shona}
                        </span>
                      ))}
                      {lesson.vocabulary.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{lesson.vocabulary.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <Link href="/register">
                    <button className="flex items-center px-4 py-2 bg-gradient-zimbabwe text-white rounded-lg font-medium hover:shadow-md transition-all">
                      <FaLock className="w-4 h-4 mr-2" />
                      Unlock Lesson
                    </button>
                  </Link>
                  <div className="flex items-center text-sm text-gray-500">
                    <FaPlay className="w-4 h-4 mr-1" />
                    <span>Preview Available</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-zimbabwe rounded-3xl p-8 text-white shadow-large">
            <h3 className="text-2xl font-bold mb-4">Ready to Start Learning?</h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of learners and master the beautiful language of Zimbabwe!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="bg-white text-flag-red font-bold py-4 px-8 rounded-2xl hover:scale-105 transition-transform duration-200">
                  Start Learning Now - It's Free! 🎉
                </button>
              </Link>
              <Link href="/login">
                <button className="bg-white/20 text-white font-bold py-4 px-8 rounded-2xl hover:bg-white/30 transition-colors">
                  Already have an account? Sign In
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 