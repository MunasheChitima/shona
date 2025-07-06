'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '../../components/Navigation'
import CelebrationModal from '../../components/CelebrationModal'
import { FaArrowLeft, FaCheck, FaTimes, FaLightbulb, FaRedo, FaClock, FaStar, FaBook } from 'react-icons/fa'

interface StoryBlank {
  id: string
  correctAnswer: string
  userAnswer: string
  position: number
  options: string[]
  isCorrect: boolean
  isAnswered: boolean
  hint: string
}

interface Story {
  id: string
  title: string
  content: string
  translation: string
  blanks: StoryBlank[]
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
}

export default function StoryCompleteGame() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [currentStory, setCurrentStory] = useState<Story | null>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const [score, setScore] = useState(0)
  const [currentBlankIndex, setCurrentBlankIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [showCelebration, setShowCelebration] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [mistakes, setMistakes] = useState(0)
  const [streak, setStreak] = useState(0)

  // Sample stories with blanks
  const stories: Story[] = [
    {
      id: 'morning-routine',
      title: 'Morning Routine',
      content: 'Mangwanani ndimuka _1_ 6 o\'clock. Ndinoshambidzwa _2_ ndinopinda _3_ kubhafira. Ndinonwa _4_ _5_ ndinodya _6_. Ndinoenda _7_ mushando _8_ 8 o\'clock.',
      translation: 'In the morning I wake up at 6 o\'clock. I wash myself and go to the bathroom. I drink tea and eat breakfast. I go to work at 8 o\'clock.',
      blanks: [
        {
          id: 'blank-1',
          correctAnswer: 'nenguva',
          userAnswer: '',
          position: 1,
          options: ['nenguva', 'neshamwari', 'nemvura', 'neguva'],
          isCorrect: false,
          isAnswered: false,
          hint: 'This word means "at time" or "on time"'
        },
        {
          id: 'blank-2',
          correctAnswer: 'ndichizorora',
          userAnswer: '',
          position: 2,
          options: ['ndichizorora', 'ndichinwa', 'ndichitya', 'ndichimhanya'],
          isCorrect: false,
          isAnswered: false,
          hint: 'This word means "then I rest" or "then I relax"'
        },
        {
          id: 'blank-3',
          correctAnswer: 'kumba',
          userAnswer: '',
          position: 3,
          options: ['kumba', 'kumhanya', 'kurara', 'kukura'],
          isCorrect: false,
          isAnswered: false,
          hint: 'This word means "to home" or "to house"'
        },
        {
          id: 'blank-4',
          correctAnswer: 'tea',
          userAnswer: '',
          position: 4,
          options: ['tea', 'mvura', 'mukaka', 'doro'],
          isCorrect: false,
          isAnswered: false,
          hint: 'A common morning beverage'
        },
        {
          id: 'blank-5',
          correctAnswer: 'uye',
          userAnswer: '',
          position: 5,
          options: ['uye', 'asi', 'kana', 'nge'],
          isCorrect: false,
          isAnswered: false,
          hint: 'This word means "and"'
        },
        {
          id: 'blank-6',
          correctAnswer: 'mangwanani',
          userAnswer: '',
          position: 6,
          options: ['mangwanani', 'masikati', 'manheru', 'usiku'],
          isCorrect: false,
          isAnswered: false,
          hint: 'Morning meal'
        },
        {
          id: 'blank-7',
          correctAnswer: 'ku',
          userAnswer: '',
          position: 7,
          options: ['ku', 'pa', 'mu', 'ne'],
          isCorrect: false,
          isAnswered: false,
          hint: 'Preposition meaning "to"'
        },
        {
          id: 'blank-8',
          correctAnswer: 'nenguva',
          userAnswer: '',
          position: 8,
          options: ['nenguva', 'nezuva', 'nemwedzi', 'negore'],
          isCorrect: false,
          isAnswered: false,
          hint: 'This word means "at time"'
        }
      ],
      difficulty: 'Easy',
      category: 'Daily Life'
    },
    {
      id: 'family-visit',
      title: 'Family Visit',
      content: 'Nezuva _1_ ndinoenda _2_ mhuri yangu. Ndinosangana _3_ amai _4_ baba vangu. Isu _5_ pamwe chete _6_ ndinovafadza _7_ zvipo. Ndinogarika _8_ navo _9_ mazuva mashoma.',
      translation: 'On Sunday I go to my family. I meet with my mother and father. We sit together and I make them happy with gifts. I stay with them for a few days.',
      blanks: [
        {
          id: 'blank-1',
          correctAnswer: 'reSvondo',
          userAnswer: '',
          position: 1,
          options: ['reSvondo', 'reMuvhuro', 'reChipiri', 'reChitatu'],
          isCorrect: false,
          isAnswered: false,
          hint: 'The day of rest and worship'
        },
        {
          id: 'blank-2',
          correctAnswer: 'kuna',
          userAnswer: '',
          position: 2,
          options: ['kuna', 'naye', 'pana', 'muna'],
          isCorrect: false,
          isAnswered: false,
          hint: 'Preposition meaning "to" (towards people)'
        },
        {
          id: 'blank-3',
          correctAnswer: 'na',
          userAnswer: '',
          position: 3,
          options: ['na', 'pa', 'ku', 'mu'],
          isCorrect: false,
          isAnswered: false,
          hint: 'Preposition meaning "with"'
        },
        {
          id: 'blank-4',
          correctAnswer: 'na',
          userAnswer: '',
          position: 4,
          options: ['na', 'uye', 'kana', 'asi'],
          isCorrect: false,
          isAnswered: false,
          hint: 'Word connecting "mother" and "father"'
        },
        {
          id: 'blank-5',
          correctAnswer: 'tinogara',
          userAnswer: '',
          position: 5,
          options: ['tinogara', 'vanogara', 'unogara', 'tinorara'],
          isCorrect: false,
          isAnswered: false,
          hint: 'We (action of sitting/staying)'
        },
        {
          id: 'blank-6',
          correctAnswer: 'uye',
          userAnswer: '',
          position: 6,
          options: ['uye', 'asi', 'kana', 'nge'],
          isCorrect: false,
          isAnswered: false,
          hint: 'This word means "and"'
        },
        {
          id: 'blank-7',
          correctAnswer: 'ne',
          userAnswer: '',
          position: 7,
          options: ['ne', 'pa', 'ku', 'mu'],
          isCorrect: false,
          isAnswered: false,
          hint: 'Preposition meaning "with" (for instruments/things)'
        },
        {
          id: 'blank-8',
          correctAnswer: 'ndinogarika',
          userAnswer: '',
          position: 8,
          options: ['ndinogarika', 'ndinorara', 'ndinoenda', 'ndinosvika'],
          isCorrect: false,
          isAnswered: false,
          hint: 'I (action of staying/remaining)'
        },
        {
          id: 'blank-9',
          correctAnswer: 'kwe',
          userAnswer: '',
          position: 9,
          options: ['kwe', 'kwa', 'ku', 'pa'],
          isCorrect: false,
          isAnswered: false,
          hint: 'Preposition meaning "for" (duration)'
        }
      ],
      difficulty: 'Medium',
      category: 'Family'
    }
  ]

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
  }, [])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (gameStarted && timeLeft > 0 && !gameEnded) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            endGame()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameStarted, timeLeft, gameEnded])

  const startGame = () => {
    const randomStory = stories[Math.floor(Math.random() * stories.length)]
    setCurrentStory(randomStory)
    setGameStarted(true)
    setGameEnded(false)
    setScore(0)
    setCurrentBlankIndex(0)
    setTimeLeft(300)
    setShowCelebration(false)
    setMistakes(0)
    setStreak(0)
    setShowHint(false)
    
    // Reset all blanks
    randomStory.blanks.forEach(blank => {
      blank.userAnswer = ''
      blank.isCorrect = false
      blank.isAnswered = false
    })
  }

  const handleAnswerSelect = (selectedAnswer: string) => {
    if (!currentStory || gameEnded) return

    const currentBlank = currentStory.blanks[currentBlankIndex]
    currentBlank.userAnswer = selectedAnswer
    currentBlank.isAnswered = true
    
    if (selectedAnswer === currentBlank.correctAnswer) {
      currentBlank.isCorrect = true
      setScore(prev => prev + 100 + (streak * 10))
      setStreak(prev => prev + 1)
    } else {
      currentBlank.isCorrect = false
      setMistakes(prev => prev + 1)
      setStreak(0)
    }

    // Move to next blank or end game
    setTimeout(() => {
      if (currentBlankIndex < currentStory.blanks.length - 1) {
        setCurrentBlankIndex(prev => prev + 1)
        setShowHint(false)
      } else {
        endGame()
      }
    }, 1500)
  }

  const endGame = () => {
    setGameEnded(true)
    setShowCelebration(true)
    submitScore()
  }

  const submitScore = async () => {
    if (!currentStory) return

    const correctAnswers = currentStory.blanks.filter(blank => blank.isCorrect).length
    const totalBlanks = currentStory.blanks.length
    const finalScore = Math.round((correctAnswers / totalBlanks) * 100)

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          gameId: 'story-complete',
          score: finalScore,
          gameType: 'story',
          difficulty: currentStory.difficulty
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        const updatedUser = { ...user, xp: result.totalXP }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        const gameProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}')
        gameProgress['story-complete'] = {
          ...gameProgress['story-complete'],
          highScore: Math.max(gameProgress['story-complete']?.highScore || 0, finalScore),
          plays: (gameProgress['story-complete']?.plays || 0) + 1,
          totalXP: (gameProgress['story-complete']?.totalXP || 0) + result.xpGained
        }
        localStorage.setItem('gameProgress', JSON.stringify(gameProgress))
      }
    } catch (error) {
      console.error('Failed to submit score:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const renderStoryWithBlanks = () => {
    if (!currentStory) return null

    const parts = currentStory.content.split(/_\d+_/)
    const result = []
    
    for (let i = 0; i < parts.length; i++) {
      result.push(
        <span key={`text-${i}`} className="text-gray-800">
          {parts[i]}
        </span>
      )
      
      if (i < currentStory.blanks.length) {
        const blank = currentStory.blanks[i]
        const isCurrentBlank = i === currentBlankIndex
        const isAnswered = blank.isAnswered
        
        result.push(
          <span
            key={`blank-${i}`}
            className={`inline-block min-w-20 px-3 py-1 mx-1 rounded-lg font-semibold text-center border-2 transition-all duration-300 ${
              isCurrentBlank 
                ? 'bg-blue-100 border-blue-400 text-blue-700 animate-pulse' 
                : isAnswered 
                  ? blank.isCorrect 
                    ? 'bg-green-100 border-green-400 text-green-700'
                    : 'bg-red-100 border-red-400 text-red-700'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
            }`}
          >
            {isAnswered ? blank.userAnswer : isCurrentBlank ? '___' : '___'}
          </span>
        )
      }
    }
    
    return result
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
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
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Story Complete
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
              <FaBook className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Progress</p>
                <p className="text-xl font-bold text-gray-800">
                  {currentStory ? `${currentBlankIndex + 1}/${currentStory.blanks.length}` : '0/0'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-white/20">
            <div className="flex items-center space-x-2">
              <FaStar className="text-yellow-500" />
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <p className="text-xl font-bold text-gray-800">{score}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-soft border border-white/20">
            <div className="flex items-center space-x-2">
              <FaCheck className="text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Streak</p>
                <p className="text-xl font-bold text-gray-800">{streak}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-4xl mx-auto">
          {!gameStarted ? (
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-soft border border-white/20">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Complete Stories?</h2>
              <p className="text-gray-600 mb-8">
                Fill in the missing words in Shona stories. Use context clues and your vocabulary knowledge!
              </p>
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Game
              </motion.button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Story Display */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentStory?.title}</h2>
                
                <div className="text-lg leading-relaxed mb-6">
                  {renderStoryWithBlanks()}
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">English Translation:</h3>
                  <p className="text-gray-600 italic">{currentStory?.translation}</p>
                </div>
              </div>

              {/* Answer Options */}
              {currentStory && currentBlankIndex < currentStory.blanks.length && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-800">
                      Choose the correct word for blank {currentBlankIndex + 1}:
                    </h3>
                    
                    <button
                      onClick={() => setShowHint(!showHint)}
                      className="flex items-center space-x-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-xl transition-colors"
                    >
                      <FaLightbulb />
                      <span>Hint</span>
                    </button>
                  </div>
                  
                  <AnimatePresence>
                    {showHint && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6"
                      >
                        <p className="text-yellow-800">
                          💡 {currentStory.blanks[currentBlankIndex].hint}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStory.blanks[currentBlankIndex].options.map((option, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswerSelect(option)}
                        className="bg-gradient-to-r from-green-100 to-blue-100 hover:from-green-200 hover:to-blue-200 border border-green-300 hover:border-blue-300 rounded-xl p-4 text-left transition-all duration-300 font-medium text-gray-800"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={currentStory.blanks[currentBlankIndex].isAnswered}
                      >
                        {option}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Answer Feedback */}
              {currentStory && currentBlankIndex < currentStory.blanks.length && currentStory.blanks[currentBlankIndex].isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-6 rounded-2xl ${
                    currentStory.blanks[currentBlankIndex].isCorrect
                      ? 'bg-gradient-to-r from-green-100 to-green-200 border border-green-300'
                      : 'bg-gradient-to-r from-red-100 to-red-200 border border-red-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`text-3xl ${currentStory.blanks[currentBlankIndex].isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {currentStory.blanks[currentBlankIndex].isCorrect ? <FaCheck /> : <FaTimes />}
                    </div>
                    <div>
                      <p className={`font-bold text-lg ${currentStory.blanks[currentBlankIndex].isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {currentStory.blanks[currentBlankIndex].isCorrect ? 'Correct!' : 'Incorrect'}
                      </p>
                      {!currentStory.blanks[currentBlankIndex].isCorrect && (
                        <p className="text-red-600 mt-1">
                          The correct answer was: <span className="font-bold">{currentStory.blanks[currentBlankIndex].correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
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
        score={currentStory ? Math.round((currentStory.blanks.filter(b => b.isCorrect).length / currentStory.blanks.length) * 100) : 0}
        lessonTitle="Story Complete"
        onClose={() => setShowCelebration(false)}
      />
    </div>
  )
}