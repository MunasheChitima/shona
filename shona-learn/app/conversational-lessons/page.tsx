'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ConversationalLessons from '../components/ConversationalLessons'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBoundary from '../components/ErrorBoundary'

export default function ConversationalLessonsPage() {
  const [lessons, setLessons] = useState([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))

    // Load conversational lessons
    loadConversationalLessons()
  }, [router])

  const loadConversationalLessons = async () => {
    try {
      const response = await fetch('/content/conversational-lessons.json')
      if (!response.ok) {
        throw new Error('Failed to load conversational lessons')
      }
      const data = await response.json()
      setLessons(data.lessons || [])
    } catch (err) {
      console.error('Error loading conversational lessons:', err)
      setError('Failed to load conversational lessons')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading conversational lessons..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-red-600 py-8">
            <h2 className="text-2xl font-bold mb-4">Error Loading Lessons</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-gradient-zimbabwe text-white px-6 py-2 rounded-xl hover:bg-gradient-green transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <ConversationalLessons lessons={lessons} />
        </div>
      </div>
    </ErrorBoundary>
  )
} 