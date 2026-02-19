'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '../../components/Navigation'
import CelebrationModal from '../../components/CelebrationModal'
import { FaArrowLeft, FaCheck, FaTimes, FaQuestionCircle, FaRedo, FaClock, FaStar, FaGlobe, FaLightbulb } from 'react-icons/fa'

interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  explanation: string
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  culturalContext: string
}

interface QuizState {
  currentQuestionIndex: number
  score: number
  lives: number
  streak: number
  timeLeft: number
  questionsAnswered: number
  correctAnswers: number
  gameStarted: boolean
  gameEnded: boolean
  showExplanation: boolean
  selectedAnswer: string | null
  isAnswerCorrect: boolean
}

export default function CulturalQuizGame() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    score: 0,
    lives: 3,
    streak: 0,
    timeLeft: 20,
    questionsAnswered: 0,
    correctAnswers: 0,
    gameStarted: false,
    gameEnded: false,
    showExplanation: false,
    selectedAnswer: null,
    isAnswerCorrect: false
  })
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([])
  const [showCelebration, setShowCelebration] = useState(false)

  // Cultural quiz questions about Shona culture
  const culturalQuestions: Question[] = [
    {
      id: 'q1',
      question: 'What is the traditional Shona thumb piano called?',
      options: ['Mbira', 'Marimba', 'Hosho', 'Ngoma'],
      correctAnswer: 'Mbira',
      explanation: 'The mbira is a traditional Shona musical instrument consisting of metal tines mounted on a wooden board, played with thumbs and fingers.',
      category: 'Music & Arts',
      difficulty: 'Easy',
      culturalContext: 'The mbira is central to Shona spiritual and cultural life, often used in ceremonies to communicate with ancestors.'
    },
    {
      id: 'q2',
      question: 'What does "Mwari" refer to in Shona culture?',
      options: ['Ancestor spirit', 'Supreme God', 'Traditional healer', 'Tribal chief'],
      correctAnswer: 'Supreme God',
      explanation: 'Mwari is the Shona name for the Supreme Being or God, who is considered the creator of all things.',
      category: 'Religion & Spirituality',
      difficulty: 'Medium',
      culturalContext: 'Mwari is believed to be accessible through ancestral spirits and is central to traditional Shona religious practices.'
    },
    {
      id: 'q3',
      question: 'What is a "dare" in traditional Shona society?',
      options: ['A cooking pot', 'A meeting place for men', 'A type of dance', 'A farming tool'],
      correctAnswer: 'A meeting place for men',
      explanation: 'A dare is a traditional meeting place where Shona men gather to discuss community matters, make decisions, and socialize.',
      category: 'Social Structure',
      difficulty: 'Medium',
      culturalContext: 'The dare represents the democratic nature of traditional Shona governance, where community decisions were made collectively.'
    },
    {
      id: 'q4',
      question: 'Which ancient city is considered the heart of the Shona civilization?',
      options: ['Great Zimbabwe', 'Mapungubwe', 'Thulamela', 'Khami'],
      correctAnswer: 'Great Zimbabwe',
      explanation: 'Great Zimbabwe was the capital of the Kingdom of Zimbabwe and is the largest ancient structure south of the Sahara Desert.',
      category: 'History',
      difficulty: 'Easy',
      culturalContext: 'Great Zimbabwe gave its name to the modern country and represents the pinnacle of Shona architectural achievement.'
    },
    {
      id: 'q5',
      question: 'What is "kurova guva" in Shona tradition?',
      options: ['A wedding ceremony', 'A harvest festival', 'A burial ritual', 'An ancestral ceremony'],
      correctAnswer: 'An ancestral ceremony',
      explanation: 'Kurova guva is a ceremony performed to bring the spirit of a deceased person back home to become a protective ancestor.',
      category: 'Religion & Spirituality',
      difficulty: 'Hard',
      culturalContext: 'This ceremony is crucial for maintaining the connection between the living and the ancestors in Shona spirituality.'
    },
    {
      id: 'q6',
      question: 'What does "ukama" mean in Shona culture?',
      options: ['Friendship', 'Kinship/Family relations', 'Respect', 'Hospitality'],
      correctAnswer: 'Kinship/Family relations',
      explanation: 'Ukama refers to the complex system of kinship relationships that form the foundation of Shona social organization.',
      category: 'Social Structure',
      difficulty: 'Medium',
      culturalContext: 'Ukama extends beyond blood relations to include spiritual and social bonds that unite the Shona community.'
    },
    {
      id: 'q7',
      question: 'What is the traditional Shona shaker instrument called?',
      options: ['Mbira', 'Hosho', 'Ngoma', 'Mukwa'],
      correctAnswer: 'Hosho',
      explanation: 'Hosho are traditional Shona rattles made from gourds filled with seeds, used to accompany mbira music.',
      category: 'Music & Arts',
      difficulty: 'Easy',
      culturalContext: 'Hosho provide the rhythmic foundation for Shona music and are essential in ceremonial performances.'
    },
    {
      id: 'q8',
      question: 'What is "chimurenga" in Shona history?',
      options: ['A traditional dance', 'A resistance/liberation struggle', 'A type of pottery', 'A farming technique'],
      correctAnswer: 'A resistance/liberation struggle',
      explanation: 'Chimurenga refers to the Shona uprisings against colonial rule, particularly the wars of 1896-1897 and 1966-1979.',
      category: 'History',
      difficulty: 'Hard',
      culturalContext: 'The chimurenga wars were inspired by spirit mediums and represent the Shona peoples resistance to foreign domination.'
    },
    {
      id: 'q9',
      question: 'What is the Shona term for a traditional healer?',
      options: ['N\'anga', 'Mukoma', 'Sabhuku', 'Mambo'],
      correctAnswer: 'N\'anga',
      explanation: 'N\'anga is a traditional healer who uses herbal medicine and spiritual practices to treat illness and provide guidance.',
      category: 'Religion & Spirituality',
      difficulty: 'Medium',
      culturalContext: 'N\'anga serve as intermediaries between the physical and spiritual worlds in Shona society.'
    },
    {
      id: 'q10',
      question: 'What is "roora" in Shona culture?',
      options: ['Bride price', 'A rain ceremony', 'A hunting ritual', 'A coming-of-age ceremony'],
      correctAnswer: 'Bride price',
      explanation: 'Roora is the bride price paid by the groom\'s family to the bride\'s family as part of the marriage process.',
      category: 'Social Structure',
      difficulty: 'Medium',
      culturalContext: 'Roora establishes a formal relationship between families and ensures the wife\'s security and status.'
    },
    {
      id: 'q11',
      question: 'Which bird is sacred in Shona culture and appears on Zimbabwe\'s flag?',
      options: ['Eagle', 'Fish Eagle', 'Falcon', 'Zimbabwe Bird (Hungwe)'],
      correctAnswer: 'Zimbabwe Bird (Hungwe)',
      explanation: 'The Zimbabwe Bird, found at Great Zimbabwe ruins, is a sacred symbol representing the connection between earthly and spiritual realms.',
      category: 'Symbols & Identity',
      difficulty: 'Easy',
      culturalContext: 'The bird is believed to be a messenger between the ancestors and the living, making it deeply significant in Shona spirituality.'
    },
    {
      id: 'q12',
      question: 'What is "hunhu" in Shona philosophy?',
      options: ['Traditional medicine', 'Moral philosophy/Ubuntu', 'Farming practice', 'Musical rhythm'],
      correctAnswer: 'Moral philosophy/Ubuntu',
      explanation: 'Hunhu is the Shona concept of humanness, emphasizing compassion, respect, and communal responsibility.',
      category: 'Philosophy & Values',
      difficulty: 'Hard',
      culturalContext: 'Hunhu guides ethical behavior and community harmony, similar to Ubuntu in other African cultures.'
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
    if (quizState.gameStarted && !quizState.gameEnded && !quizState.showExplanation && quizState.timeLeft > 0) {
      interval = setInterval(() => {
        setQuizState(prev => {
          if (prev.timeLeft <= 1) {
            // Time's up - treat as wrong answer
            return {
              ...prev,
              timeLeft: 0,
              lives: prev.lives - 1,
              streak: 0,
              showExplanation: true,
              selectedAnswer: null,
              isAnswerCorrect: false
            }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 }
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [quizState.gameStarted, quizState.gameEnded, quizState.showExplanation, quizState.timeLeft])

  // Check if game should end
  useEffect(() => {
    if (quizState.lives <= 0 || (quizState.questionsAnswered >= 10 && quizState.gameStarted)) {
      endGame()
    }
  }, [quizState.lives, quizState.questionsAnswered])

  const startGame = () => {
    // Shuffle questions and select 10
    const shuffled = [...culturalQuestions].sort(() => Math.random() - 0.5).slice(0, 10)
    setCurrentQuestions(shuffled)
    
    setQuizState({
      currentQuestionIndex: 0,
      score: 0,
      lives: 3,
      streak: 0,
      timeLeft: 20,
      questionsAnswered: 0,
      correctAnswers: 0,
      gameStarted: true,
      gameEnded: false,
      showExplanation: false,
      selectedAnswer: null,
      isAnswerCorrect: false
    })
    setShowCelebration(false)
  }

  const handleAnswerSelect = (selectedAnswer: string) => {
    if (quizState.showExplanation || quizState.gameEnded) return

    const currentQuestion = currentQuestions[quizState.currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    
    let scoreIncrease = 0
    if (isCorrect) {
      scoreIncrease = 100 + (quizState.streak * 25) + (quizState.timeLeft * 5)
    }

    setQuizState(prev => ({
      ...prev,
      selectedAnswer,
      isAnswerCorrect: isCorrect,
      showExplanation: true,
      timeLeft: 20,
      score: prev.score + scoreIncrease,
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      streak: isCorrect ? prev.streak + 1 : 0,
      lives: isCorrect ? prev.lives : prev.lives - 1
    }))
  }

  const nextQuestion = () => {
    if (quizState.currentQuestionIndex < currentQuestions.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
        questionsAnswered: prev.questionsAnswered + 1,
        showExplanation: false,
        selectedAnswer: null,
        timeLeft: 20
      }))
    } else {
      setQuizState(prev => ({ ...prev, questionsAnswered: prev.questionsAnswered + 1 }))
    }
  }

  const endGame = () => {
    setQuizState(prev => ({ ...prev, gameEnded: true }))
    setShowCelebration(true)
    submitScore()
  }

  const submitScore = async () => {
    const finalScore = Math.round((quizState.correctAnswers / Math.max(1, quizState.questionsAnswered)) * 100)

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          gameId: 'cultural-quiz',
          score: finalScore,
          gameType: 'quiz',
          difficulty: 'Hard'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        const updatedUser = { ...user, xp: result.totalXP }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        const gameProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}')
        gameProgress['cultural-quiz'] = {
          ...gameProgress['cultural-quiz'],
          highScore: Math.max(gameProgress['cultural-quiz']?.highScore || 0, finalScore),
          plays: (gameProgress['cultural-quiz']?.plays || 0) + 1,
          totalXP: (gameProgress['cultural-quiz']?.totalXP || 0) + result.xpGained
        }
        localStorage.setItem('gameProgress', JSON.stringify(gameProgress))
      }
    } catch (error) {
      console.error('Failed to submit score:', error)
    }
  }

  const currentQuestion = currentQuestions[quizState.currentQuestionIndex]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <Navigation />
      
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
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            Cultural Quiz
          </h1>
          
          <div className="w-32" /> {/* Spacer */}
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-xl font-bold text-yellow-600">{quizState.score}</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Lives</p>
              <p className="text-xl font-bold text-red-600">{'❤️'.repeat(quizState.lives)}</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Streak</p>
              <p className="text-xl font-bold text-orange-600">{quizState.streak}</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Time</p>
              <p className="text-xl font-bold text-blue-600">{quizState.timeLeft}s</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-xl font-bold text-purple-600">
                {quizState.questionsAnswered}/10
              </p>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-4xl mx-auto">
          {!quizState.gameStarted ? (
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-soft border border-white/20">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready for the Cultural Quiz?</h2>
              <p className="text-gray-600 mb-8">
                Test your knowledge of Shona culture, history, and traditions. You have 3 lives and 20 seconds per question!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-xl border border-yellow-300">
                  <FaGlobe className="text-2xl text-yellow-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">Culture & Traditions</h3>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-xl border border-blue-300">
                  <FaQuestionCircle className="text-2xl text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">History & Heritage</h3>
                </div>
                <div className="bg-gradient-to-r from-green-100 to-teal-100 p-4 rounded-xl border border-green-300">
                  <FaLightbulb className="text-2xl text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-800">Philosophy & Values</h3>
                </div>
              </div>
              
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Quiz
              </motion.button>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-8">
              {/* Question Display */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl font-semibold">
                    {currentQuestion.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    currentQuestion.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                    currentQuestion.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {currentQuestion.question}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentQuestion.options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={quizState.showExplanation}
                      className={`p-4 rounded-xl border-2 text-left font-medium transition-all duration-300 ${
                        quizState.showExplanation
                          ? option === currentQuestion.correctAnswer
                            ? 'bg-green-100 border-green-400 text-green-700'
                            : option === quizState.selectedAnswer
                              ? 'bg-red-100 border-red-400 text-red-700'
                              : 'bg-gray-100 border-gray-300 text-gray-600'
                          : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 hover:from-yellow-100 hover:to-orange-100 hover:border-orange-400 text-gray-800'
                      }`}
                      whileHover={!quizState.showExplanation ? { scale: 1.02 } : {}}
                      whileTap={!quizState.showExplanation ? { scale: 0.98 } : {}}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {quizState.showExplanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-6 rounded-2xl ${
                      quizState.isAnswerCorrect
                        ? 'bg-gradient-to-r from-green-100 to-green-200 border border-green-300'
                        : 'bg-gradient-to-r from-red-100 to-red-200 border border-red-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`text-3xl ${quizState.isAnswerCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {quizState.isAnswerCorrect ? <FaCheck /> : <FaTimes />}
                      </div>
                      <div>
                        <p className={`font-bold text-lg ${quizState.isAnswerCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {quizState.isAnswerCorrect ? 'Correct!' : 'Incorrect'}
                        </p>
                        <p className="text-gray-700">{currentQuestion.explanation}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white/50 rounded-xl p-4 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Cultural Context:</h4>
                      <p className="text-gray-700 text-sm">{currentQuestion.culturalContext}</p>
                    </div>
                    
                    <motion.button
                      onClick={nextQuestion}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next Question
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}
          
          {quizState.gameEnded && (
            <div className="text-center mt-8">
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 flex items-center space-x-2 mx-auto"
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
        score={Math.round((quizState.correctAnswers / Math.max(1, quizState.questionsAnswered)) * 100)}
        lessonTitle="Cultural Quiz"
        onClose={() => setShowCelebration(false)}
      />
    </div>
  )
}