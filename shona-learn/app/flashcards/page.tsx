'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Flashcard {
  id: string
  shonaText: string
  englishText: string
  pronunciation?: string
  context?: string
  difficulty: number
  tags?: string
  srsProgress?: {
    interval: number
    easeFactor: number
    repetitions: number
    correctStreak: number
  }
}

interface FlashcardStats {
  totalCards: number
  dueCards: number
  newCards: number
  reviewedToday: number
  accuracy: number
  streakDays: number
  masteredCards: number
}

export default function FlashcardsPage() {
  const router = useRouter()
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [stats, setStats] = useState<FlashcardStats | null>(null)
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isStudying, setIsStudying] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0
  })
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFlashcards()
    loadStats()
  }, [])

  const loadFlashcards = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await fetch(`/api/flashcards?userId=${user.id}&action=due&limit=20`)
      const data = await response.json()
      setFlashcards(data)
    } catch (error) {
      console.error('Error loading flashcards:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await fetch(`/api/flashcards?userId=${user.id}&action=stats`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const startStudySession = () => {
    if (flashcards.length === 0) return
    
    setIsStudying(true)
    setCurrentCard(flashcards[0])
    setShowAnswer(false)
    setStartTime(new Date())
    setSessionStats({ correct: 0, incorrect: 0, total: 0 })
  }

  const reviewCard = async (quality: number, wasCorrect: boolean) => {
    if (!currentCard || !startTime) return

    const responseTime = (Date.now() - startTime.getTime()) / 1000
    const user = JSON.parse(localStorage.getItem('user') || '{}')

    try {
      await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'review',
          flashcardId: currentCard.id,
          quality,
          responseTime,
          wasCorrect
        }),
      })

      // Update session stats
      setSessionStats(prev => ({
        correct: prev.correct + (wasCorrect ? 1 : 0),
        incorrect: prev.incorrect + (wasCorrect ? 0 : 1),
        total: prev.total + 1
      }))

      // Move to next card
      const remainingCards = flashcards.filter(card => card.id !== currentCard.id)
      if (remainingCards.length > 0) {
        setCurrentCard(remainingCards[0])
        setFlashcards(remainingCards)
        setShowAnswer(false)
        setStartTime(new Date())
      } else {
        // Session complete
        endStudySession()
      }
    } catch (error) {
      console.error('Error reviewing card:', error)
    }
  }

  const endStudySession = async () => {
    if (!startTime) return

    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const sessionEndTime = new Date()
    
    try {
      await fetch('/api/flashcards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          action: 'complete_session',
          sessionStartTime: startTime.toISOString(),
          sessionEndTime: sessionEndTime.toISOString(),
          reviewedCards: [] // This would normally contain the reviewed cards data
        }),
      })
    } catch (error) {
      console.error('Error completing session:', error)
    }

    setIsStudying(false)
    setCurrentCard(null)
    setShowAnswer(false)
    loadStats() // Refresh stats
  }

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 0.3) return 'bg-green-100 text-green-800'
    if (difficulty < 0.7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getDifficultyText = (difficulty: number) => {
    if (difficulty < 0.3) return 'Easy'
    if (difficulty < 0.7) return 'Medium'
    return 'Hard'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Shona Flashcards
            </h1>
            <p className="text-gray-600">
              Master Shona vocabulary with adaptive spaced repetition
            </p>
          </div>

          {/* Stats Dashboard */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-blue-600">{stats.totalCards}</div>
                <div className="text-sm text-gray-500">Total Cards</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-orange-600">{stats.dueCards}</div>
                <div className="text-sm text-gray-500">Due Today</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">{stats.masteredCards}</div>
                <div className="text-sm text-gray-500">Mastered</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="text-2xl font-bold text-purple-600">{stats.accuracy}%</div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
            </div>
          )}

          {/* Study Session */}
          {isStudying && currentCard ? (
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              {/* Session Progress */}
              <div className="flex justify-between items-center mb-6">
                <div className="text-sm text-gray-500">
                  Card {sessionStats.total + 1} of {flashcards.length + sessionStats.total}
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">✓ {sessionStats.correct}</span>
                  <span className="text-red-600">✗ {sessionStats.incorrect}</span>
                </div>
              </div>

              {/* Flashcard */}
              <div className="text-center mb-8">
                <div className="mb-4">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentCard.difficulty)}`}>
                    {getDifficultyText(currentCard.difficulty)}
                  </span>
                </div>
                
                <div className="text-3xl font-bold text-gray-900 mb-4">
                  {currentCard.shonaText}
                </div>
                
                {currentCard.pronunciation && (
                  <div className="text-lg text-gray-600 mb-4">
                    /{currentCard.pronunciation}/
                  </div>
                )}
                
                {currentCard.context && (
                  <div className="text-sm text-gray-500 italic mb-6">
                    &quot;{currentCard.context}&quot;
                  </div>
                )}

                {!showAnswer ? (
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Show Answer
                  </button>
                ) : (
                  <div>
                    <div className="text-2xl font-semibold text-green-700 mb-6">
                      {currentCard.englishText}
                    </div>
                    
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">How well did you know this word?</p>
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => reviewCard(1, false)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                        >
                          Again
                        </button>
                        <button
                          onClick={() => reviewCard(2, false)}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm"
                        >
                          Hard
                        </button>
                        <button
                          onClick={() => reviewCard(3, true)}
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 text-sm"
                        >
                          Good
                        </button>
                        <button
                          onClick={() => reviewCard(4, true)}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm"
                        >
                          Easy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((sessionStats.total) / (flashcards.length + sessionStats.total)) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          ) : (
            /* Study Options */
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Ready to Study?</h2>
              
              {flashcards.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Review Due Cards</h3>
                      <p className="text-sm text-gray-600">
                        {flashcards.length} cards ready for review
                      </p>
                    </div>
                    <button
                      onClick={startStudySession}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Start Studying
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900">Browse All Cards</h3>
                      <p className="text-sm text-gray-600">
                        View and manage your flashcard collection
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/flashcards/browse')}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Browse Cards
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No cards due</h3>
                  <p className="text-gray-600 mb-4">
                    You&apos;re all caught up! Come back later or add more cards to study.
                  </p>
                  <button
                    onClick={() => router.push('/learn')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Learn New Words
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}