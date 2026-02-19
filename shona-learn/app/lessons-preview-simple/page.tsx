'use client'
import { useState, useEffect } from 'react'

interface Lesson {
  id: string
  title: string
  description: string
  category: string
}

export default function LessonsPreviewSimple() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log('Component mounted')
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
        console.log('Lessons data received:', data.lessons?.length || 0, 'lessons')
        setLessons(data.lessons || [])
      } else {
        setError(`Failed to load lessons: ${response.status}`)
      }
    } catch (error) {
      console.error('Failed to load lessons:', error)
      setError('Failed to load lessons')
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lessons...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={loadLessons}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Lessons Preview (Simple)</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">{lesson.title}</h3>
              <p className="text-gray-600 mb-4">{lesson.description}</p>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                {lesson.category}
              </span>
            </div>
          ))}
        </div>
        
        {lessons.length === 0 && (
          <div className="text-center text-gray-600 py-8">
            No lessons found.
          </div>
        )}
      </div>
    </div>
  )
} 