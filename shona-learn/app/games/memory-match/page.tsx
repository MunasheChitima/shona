'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '../../components/Navigation'
import CelebrationModal from '../../components/CelebrationModal'
import { FaArrowLeft, FaHeart, FaClock, FaStar, FaRedo } from 'react-icons/fa'

interface Card {
  id: string
  type: 'shona' | 'english'
  word: string
  matchId: string
  isFlipped: boolean
  isMatched: boolean
}

export default function MemoryMatchGame() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<string[]>([])
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [hearts, setHearts] = useState(5)

  // Sample vocabulary pairs from the existing content
  const vocabularyPairs = [
    { shona: 'mangwanani', english: 'good morning' },
    { shona: 'masikati', english: 'good afternoon' },
    { shona: 'manheru', english: 'good evening' },
    { shona: 'ndatenda', english: 'thank you' },
    { shona: 'zvakanaka', english: 'fine/good' },
    { shona: 'bhazi', english: 'bus' },
    { shona: 'svika', english: 'arrive' },
    { shona: 'zvino', english: 'now' },
    { shona: 'mbira', english: 'thumb piano' },
    { shona: 'ngoma', english: 'drum' },
    { shona: 'amai', english: 'mother' },
    { shona: 'baba', english: 'father' }
  ]

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    initializeGame()
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && timeLeft > 0 && !gameEnded) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameEnded(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, timeLeft, gameEnded])

  // Check for game completion
  useEffect(() => {
    if (matchedPairs.length === 6 && gameStarted) { // 6 pairs = 12 cards
      setGameEnded(true)
      const finalScore = calculateScore()
      setScore(finalScore)
      setShowCelebration(true)
      submitScore(finalScore)
    }
  }, [matchedPairs, gameStarted])

  const initializeGame = () => {
    // Select 6 random pairs for the game
    const selectedPairs = vocabularyPairs.slice(0, 6)
    const gameCards: Card[] = []
    
    selectedPairs.forEach((pair, index) => {
      const matchId = `pair-${index}`
      gameCards.push({
        id: `${matchId}-shona`,
        type: 'shona',
        word: pair.shona,
        matchId,
        isFlipped: false,
        isMatched: false
      })
      gameCards.push({
        id: `${matchId}-english`,
        type: 'english',
        word: pair.english,
        matchId,
        isFlipped: false,
        isMatched: false
      })
    })
    
    // Shuffle the cards
    const shuffledCards = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
  }

  const handleCardClick = (cardId: string) => {
    if (flippedCards.length >= 2 || gameEnded) return
    
    const card = cards.find(c => c.id === cardId)
    if (!card || card.isFlipped || card.isMatched) return

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)
    
    // Update card state
    setCards(prev => prev.map(c => 
      c.id === cardId ? { ...c, isFlipped: true } : c
    ))

    if (newFlippedCards.length === 2) {
      const [firstId, secondId] = newFlippedCards
      const firstCard = cards.find(c => c.id === firstId)
      const secondCard = cards.find(c => c.id === secondId)
      
      if (firstCard && secondCard && firstCard.matchId === secondCard.matchId) {
        // Match found!
        setTimeout(() => {
          setMatchedPairs(prev => [...prev, firstCard.matchId])
          setCards(prev => prev.map(c => 
            c.matchId === firstCard.matchId ? { ...c, isMatched: true } : c
          ))
          setFlippedCards([])
        }, 1000)
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => prev.map(c => 
            newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
          ))
          setFlippedCards([])
          setMistakes(prev => prev + 1)
          if (hearts > 1) {
            setHearts(prev => prev - 1)
          }
        }, 1500)
      }
    }
  }

  const calculateScore = () => {
    const timeBonus = timeLeft * 0.5
    const accuracyBonus = Math.max(0, (6 - mistakes) * 10)
    const matchBonus = matchedPairs.length * 10
    return Math.round(matchBonus + timeBonus + accuracyBonus)
  }

  const submitScore = async (finalScore: number) => {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          gameId: 'memory-match',
          score: finalScore,
          gameType: 'memory',
          difficulty: 'Easy'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        // Update user XP
        const updatedUser = { ...user, xp: result.totalXP }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        // Update game progress
        const gameProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}')
        gameProgress['memory-match'] = {
          ...gameProgress['memory-match'],
          highScore: Math.max(gameProgress['memory-match']?.highScore || 0, finalScore),
          plays: (gameProgress['memory-match']?.plays || 0) + 1,
          totalXP: (gameProgress['memory-match']?.totalXP || 0) + result.xpGained
        }
        localStorage.setItem('gameProgress', JSON.stringify(gameProgress))
      }
    } catch (error) {
      console.error('Failed to submit score:', error)
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setTimeLeft(120)
    setMistakes(0)
    setHearts(5)
    setMatchedPairs([])
    setFlippedCards([])
    setGameEnded(false)
    setShowCelebration(false)
    initializeGame()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
      <Navigation user={user} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/games')}
            className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-soft border border-white/20 hover:bg-white/90 transition-colors"
          >
            <FaArrowLeft className="text-gray-600" />
            <span className="text-gray-700 font-medium">Back to Games</span>
          </button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Memory Match
          </h1>
          
          <div className="w-32" /> {/* Spacer */}
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-white/20">
            <div className="flex items-center space-x-2">
              <FaClock className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Time</p>
                <p className="text-xl font-bold text-gray-800">{formatTime(timeLeft)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-white/20">
            <div className="flex items-center space-x-2">
              <FaStar className="text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Matches</p>
                <p className="text-xl font-bold text-gray-800">{matchedPairs.length}/6</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-white/20">
            <div className="flex items-center space-x-2">
              <FaHeart className="text-red-500" />
              <div>
                <p className="text-sm text-gray-600">Hearts</p>
                <p className="text-xl font-bold text-gray-800">{hearts}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-white/20">
            <div className="flex items-center space-x-2">
              <FaStar className="text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-xl font-bold text-gray-800">{score}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="max-w-4xl mx-auto">
          {!gameStarted ? (
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-soft border border-white/20">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Play?</h2>
              <p className="text-gray-600 mb-8">
                Match Shona words with their English translations. You have 2 minutes to find all 6 pairs!
              </p>
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Game
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  className={`aspect-square bg-white/80 backdrop-blur-sm rounded-xl shadow-soft border border-white/20 cursor-pointer transition-all duration-300 ${
                    card.isFlipped || card.isMatched ? 'bg-gradient-to-br from-green-100 to-blue-100' : 'hover:shadow-lg'
                  }`}
                  onClick={() => handleCardClick(card.id)}
                  whileHover={{ scale: card.isMatched ? 1 : 1.05 }}
                  whileTap={{ scale: card.isMatched ? 1 : 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: cards.indexOf(card) * 0.05 }}
                >
                  <div className="h-full flex items-center justify-center p-4">
                    <AnimatePresence mode="wait">
                      {card.isFlipped || card.isMatched ? (
                        <motion.div
                          key="front"
                          initial={{ rotateY: 90 }}
                          animate={{ rotateY: 0 }}
                          exit={{ rotateY: 90 }}
                          transition={{ duration: 0.3 }}
                          className="text-center"
                        >
                          <div className={`text-lg font-bold mb-1 ${card.type === 'shona' ? 'text-purple-600' : 'text-blue-600'}`}>
                            {card.word}
                          </div>
                          <div className="text-xs text-gray-500">
                            {card.type === 'shona' ? 'Shona' : 'English'}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="back"
                          initial={{ rotateY: 90 }}
                          animate={{ rotateY: 0 }}
                          exit={{ rotateY: 90 }}
                          transition={{ duration: 0.3 }}
                          className="text-4xl text-gray-400"
                        >
                          ?
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          {gameEnded && (
            <div className="text-center mt-8">
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 flex items-center space-x-2 mx-auto"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaRedo />
                <span>Play Again</span>
              </motion.button>
            </div>
          )}
        </div>
      </div>
      
      <CelebrationModal
        isOpen={showCelebration}
        score={score}
        lessonTitle="Memory Match"
        onClose={() => setShowCelebration(false)}
      />
    </div>
  )
}