'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '../../components/Navigation'
import CelebrationModal from '../../components/CelebrationModal'
import { FaArrowLeft, FaCheck, FaTimes, FaPuzzlePiece, FaRedo, FaClock, FaStar, FaLightbulb, FaTrash } from 'react-icons/fa'

interface Morpheme {
  id: string
  text: string
  type: 'prefix' | 'root' | 'suffix' | 'infix'
  meaning: string
  isUsed: boolean
  position?: number
}

interface WordChallenge {
  id: string
  targetWord: string
  translation: string
  morphemes: Morpheme[]
  correctOrder: string[]
  category: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  explanation: string
  grammaticalInfo: string
}

interface GameState {
  currentChallengeIndex: number
  score: number
  timeLeft: number
  streak: number
  mistakes: number
  challengesCompleted: number
  gameStarted: boolean
  gameEnded: boolean
  builtWord: Morpheme[]
  showFeedback: boolean
  isCorrect: boolean
}

export default function WordBuilderGame() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [gameState, setGameState] = useState<GameState>({
    currentChallengeIndex: 0,
    score: 0,
    timeLeft: 240, // 4 minutes
    streak: 0,
    mistakes: 0,
    challengesCompleted: 0,
    gameStarted: false,
    gameEnded: false,
    builtWord: [],
    showFeedback: false,
    isCorrect: false
  })
  const [currentChallenges, setCurrentChallenges] = useState<WordChallenge[]>([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [showHint, setShowHint] = useState(false)

  // Word building challenges focusing on Shona morphology
  const wordChallenges: WordChallenge[] = [
    {
      id: 'w1',
      targetWord: 'ndichatenga',
      translation: 'I will buy',
      morphemes: [
        { id: 'm1', text: 'ndi', type: 'prefix', meaning: 'I (subject)', isUsed: false },
        { id: 'm2', text: 'cha', type: 'infix', meaning: 'will (future)', isUsed: false },
        { id: 'm3', text: 'tenga', type: 'root', meaning: 'buy', isUsed: false },
        { id: 'm4', text: 'va', type: 'prefix', meaning: 'they (subject)', isUsed: false },
        { id: 'm5', text: 'ka', type: 'infix', meaning: 'past tense', isUsed: false }
      ],
      correctOrder: ['ndi', 'cha', 'tenga'],
      category: 'Future Tense',
      difficulty: 'Easy',
      explanation: 'Future tense in Shona is formed by adding "cha" between the subject prefix and the verb root.',
      grammaticalInfo: 'Structure: Subject + cha + Verb Root'
    },
    {
      id: 'w2',
      targetWord: 'vakatenga',
      translation: 'they bought',
      morphemes: [
        { id: 'm1', text: 'va', type: 'prefix', meaning: 'they (subject)', isUsed: false },
        { id: 'm2', text: 'ka', type: 'infix', meaning: 'past tense', isUsed: false },
        { id: 'm3', text: 'tenga', type: 'root', meaning: 'buy', isUsed: false },
        { id: 'm4', text: 'ndi', type: 'prefix', meaning: 'I (subject)', isUsed: false },
        { id: 'm5', text: 'cha', type: 'infix', meaning: 'will (future)', isUsed: false }
      ],
      correctOrder: ['va', 'ka', 'tenga'],
      category: 'Past Tense',
      difficulty: 'Easy',
      explanation: 'Past tense in Shona is formed by adding "ka" between the subject prefix and the verb root.',
      grammaticalInfo: 'Structure: Subject + ka + Verb Root'
    },
    {
      id: 'w3',
      targetWord: 'ndinotenda',
      translation: 'I thank/am thankful',
      morphemes: [
        { id: 'm1', text: 'ndi', type: 'prefix', meaning: 'I (subject)', isUsed: false },
        { id: 'm2', text: 'no', type: 'infix', meaning: 'present tense', isUsed: false },
        { id: 'm3', text: 'tenda', type: 'root', meaning: 'thank', isUsed: false },
        { id: 'm4', text: 'cha', type: 'infix', meaning: 'will (future)', isUsed: false },
        { id: 'm5', text: 'mu', type: 'prefix', meaning: 'you (subject)', isUsed: false }
      ],
      correctOrder: ['ndi', 'no', 'tenda'],
      category: 'Present Tense',
      difficulty: 'Medium',
      explanation: 'Present tense in Shona uses "no" as the tense marker between subject and verb.',
      grammaticalInfo: 'Structure: Subject + no + Verb Root'
    },
    {
      id: 'w4',
      targetWord: 'munotaura',
      translation: 'you (pl) speak',
      morphemes: [
        { id: 'm1', text: 'mu', type: 'prefix', meaning: 'you (plural subject)', isUsed: false },
        { id: 'm2', text: 'no', type: 'infix', meaning: 'present tense', isUsed: false },
        { id: 'm3', text: 'taura', type: 'root', meaning: 'speak', isUsed: false },
        { id: 'm4', text: 'ndi', type: 'prefix', meaning: 'I (subject)', isUsed: false },
        { id: 'm5', text: 'ka', type: 'infix', meaning: 'past tense', isUsed: false }
      ],
      correctOrder: ['mu', 'no', 'taura'],
      category: 'Present Tense',
      difficulty: 'Medium',
      explanation: 'The prefix "mu" indicates "you" (plural) as the subject.',
      grammaticalInfo: 'Structure: mu- (you plural) + no + Verb Root'
    },
    {
      id: 'w5',
      targetWord: 'handina',
      translation: 'I do not have',
      morphemes: [
        { id: 'm1', text: 'ha', type: 'prefix', meaning: 'negative marker', isUsed: false },
        { id: 'm2', text: 'ndi', type: 'prefix', meaning: 'I (subject)', isUsed: false },
        { id: 'm3', text: 'na', type: 'root', meaning: 'have/with', isUsed: false },
        { id: 'm4', text: 'no', type: 'infix', meaning: 'present tense', isUsed: false },
        { id: 'm5', text: 'ka', type: 'infix', meaning: 'past tense', isUsed: false }
      ],
      correctOrder: ['ha', 'ndi', 'na'],
      category: 'Negation',
      difficulty: 'Hard',
      explanation: 'Negation in Shona is formed with "ha" prefix before the subject prefix.',
      grammaticalInfo: 'Structure: ha + Subject + Verb (no tense marker in negative)'
    },
    {
      id: 'w6',
      targetWord: 'ndikakuona',
      translation: 'if I see you',
      morphemes: [
        { id: 'm1', text: 'ndi', type: 'prefix', meaning: 'I (subject)', isUsed: false },
        { id: 'm2', text: 'ka', type: 'infix', meaning: 'conditional/if', isUsed: false },
        { id: 'm3', text: 'ku', type: 'prefix', meaning: 'you (object)', isUsed: false },
        { id: 'm4', text: 'ona', type: 'root', meaning: 'see', isUsed: false },
        { id: 'm5', text: 'cha', type: 'infix', meaning: 'will (future)', isUsed: false }
      ],
      correctOrder: ['ndi', 'ka', 'ku', 'ona'],
      category: 'Conditional',
      difficulty: 'Hard',
      explanation: 'Conditional mood uses "ka" and can include object prefixes like "ku" (you).',
      grammaticalInfo: 'Structure: Subject + ka + Object + Verb Root'
    },
    {
      id: 'w7',
      targetWord: 'ndichakuvona',
      translation: 'I will see you',
      morphemes: [
        { id: 'm1', text: 'ndi', type: 'prefix', meaning: 'I (subject)', isUsed: false },
        { id: 'm2', text: 'cha', type: 'infix', meaning: 'will (future)', isUsed: false },
        { id: 'm3', text: 'ku', type: 'prefix', meaning: 'you (object)', isUsed: false },
        { id: 'm4', text: 'vona', type: 'root', meaning: 'see', isUsed: false },
        { id: 'm5', text: 'mu', type: 'prefix', meaning: 'you (subject)', isUsed: false }
      ],
      correctOrder: ['ndi', 'cha', 'ku', 'vona'],
      category: 'Future Tense with Object',
      difficulty: 'Hard',
      explanation: 'Future tense with object prefixes: subject + cha + object + verb.',
      grammaticalInfo: 'Structure: Subject + cha + Object + Verb Root'
    },
    {
      id: 'w8',
      targetWord: 'vanowanikwa',
      translation: 'they are found',
      morphemes: [
        { id: 'm1', text: 'va', type: 'prefix', meaning: 'they (subject)', isUsed: false },
        { id: 'm2', text: 'no', type: 'infix', meaning: 'present tense', isUsed: false },
        { id: 'm3', text: 'wan', type: 'root', meaning: 'find', isUsed: false },
        { id: 'm4', text: 'ik', type: 'suffix', meaning: 'passive/causative', isUsed: false },
        { id: 'm5', text: 'wa', type: 'suffix', meaning: 'passive voice', isUsed: false }
      ],
      correctOrder: ['va', 'no', 'wan', 'ik', 'wa'],
      category: 'Passive Voice',
      difficulty: 'Hard',
      explanation: 'Passive voice in Shona uses -ik- and -wa suffixes to show the action is done to the subject.',
      grammaticalInfo: 'Structure: Subject + Tense + Verb Root + ik + wa'
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
    if (gameState.gameStarted && gameState.timeLeft > 0 && !gameState.gameEnded) {
      interval = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            endGame()
            return { ...prev, timeLeft: 0 }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 }
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [gameState.gameStarted, gameState.timeLeft, gameState.gameEnded])

  const startGame = () => {
    // Shuffle challenges and select 6
    const shuffled = [...wordChallenges].sort(() => Math.random() - 0.5).slice(0, 6)
    setCurrentChallenges(shuffled)
    
    setGameState({
      currentChallengeIndex: 0,
      score: 0,
      timeLeft: 240,
      streak: 0,
      mistakes: 0,
      challengesCompleted: 0,
      gameStarted: true,
      gameEnded: false,
      builtWord: [],
      showFeedback: false,
      isCorrect: false
    })
    setShowCelebration(false)
    setShowHint(false)
  }

  const addMorpheme = (morpheme: Morpheme) => {
    if (morpheme.isUsed || gameState.showFeedback) return
    
    const newBuiltWord = [...gameState.builtWord, { ...morpheme, isUsed: true, position: gameState.builtWord.length }]
    setGameState(prev => ({ ...prev, builtWord: newBuiltWord }))
    
    // Mark morpheme as used
    const currentChallenge = currentChallenges[gameState.currentChallengeIndex]
    currentChallenge.morphemes.forEach(m => {
      if (m.id === morpheme.id) m.isUsed = true
    })
  }

  const removeMorpheme = (index: number) => {
    if (gameState.showFeedback) return
    
    const morphemeToRemove = gameState.builtWord[index]
    const newBuiltWord = gameState.builtWord.filter((_, i) => i !== index)
    setGameState(prev => ({ ...prev, builtWord: newBuiltWord }))
    
    // Mark morpheme as unused
    const currentChallenge = currentChallenges[gameState.currentChallengeIndex]
    currentChallenge.morphemes.forEach(m => {
      if (m.id === morphemeToRemove.id) m.isUsed = false
    })
  }

  const clearBuiltWord = () => {
    if (gameState.showFeedback) return
    
    // Mark all morphemes as unused
    const currentChallenge = currentChallenges[gameState.currentChallengeIndex]
    currentChallenge.morphemes.forEach(m => { m.isUsed = false })
    
    setGameState(prev => ({ ...prev, builtWord: [] }))
  }

  const checkAnswer = () => {
    const currentChallenge = currentChallenges[gameState.currentChallengeIndex]
    const builtWordText = gameState.builtWord.map(m => m.text).join('')
    const isCorrect = builtWordText === currentChallenge.targetWord
    
    let scoreIncrease = 0
    if (isCorrect) {
      scoreIncrease = 200 + (gameState.streak * 50) + Math.max(0, gameState.timeLeft)
    }
    
    setGameState(prev => ({
      ...prev,
      score: prev.score + scoreIncrease,
      streak: isCorrect ? prev.streak + 1 : 0,
      mistakes: isCorrect ? prev.mistakes : prev.mistakes + 1,
      showFeedback: true,
      isCorrect
    }))
  }

  const nextChallenge = () => {
    if (gameState.currentChallengeIndex < currentChallenges.length - 1) {
      setGameState(prev => ({
        ...prev,
        currentChallengeIndex: prev.currentChallengeIndex + 1,
        challengesCompleted: prev.challengesCompleted + 1,
        builtWord: [],
        showFeedback: false,
        isCorrect: false
      }))
      
      // Reset morpheme usage for next challenge
      const nextChallenge = currentChallenges[gameState.currentChallengeIndex + 1]
      nextChallenge.morphemes.forEach(m => { m.isUsed = false })
      setShowHint(false)
    } else {
      endGame()
    }
  }

  const endGame = () => {
    setGameState(prev => ({ ...prev, gameEnded: true, challengesCompleted: prev.challengesCompleted + 1 }))
    setShowCelebration(true)
    submitScore()
  }

  const submitScore = async () => {
    const finalScore = Math.round((gameState.score / 1000) * 100) // Normalize to percentage

    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          gameId: 'word-builder',
          score: finalScore,
          gameType: 'morphology',
          difficulty: 'Hard'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        const updatedUser = { ...user, xp: result.totalXP }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        const gameProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}')
        gameProgress['word-builder'] = {
          ...gameProgress['word-builder'],
          highScore: Math.max(gameProgress['word-builder']?.highScore || 0, finalScore),
          plays: (gameProgress['word-builder']?.plays || 0) + 1,
          totalXP: (gameProgress['word-builder']?.totalXP || 0) + result.xpGained
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

  const currentChallenge = currentChallenges[gameState.currentChallengeIndex]

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
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
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Word Builder
          </h1>
          
          <div className="w-32" /> {/* Spacer */}
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-xl font-bold text-red-600">{gameState.score}</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Time</p>
              <p className="text-xl font-bold text-blue-600">{formatTime(gameState.timeLeft)}</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Streak</p>
              <p className="text-xl font-bold text-green-600">{gameState.streak}</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Progress</p>
              <p className="text-xl font-bold text-purple-600">
                {gameState.challengesCompleted}/6
              </p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Mistakes</p>
              <p className="text-xl font-bold text-orange-600">{gameState.mistakes}</p>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-4xl mx-auto">
          {!gameState.gameStarted ? (
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-soft border border-white/20">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Build Words?</h2>
              <p className="text-gray-600 mb-8">
                Construct Shona words by arranging morphemes in the correct order. Learn about prefixes, roots, and suffixes!
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-red-100 to-pink-100 p-6 rounded-xl border border-red-300">
                  <FaPuzzlePiece className="text-3xl text-red-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Morphology Focus</h3>
                  <p className="text-gray-600 text-sm">Learn how Shona words are built from meaningful parts</p>
                </div>
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl border border-purple-300">
                  <FaLightbulb className="text-3xl text-purple-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-800 mb-2">Grammar Patterns</h3>
                  <p className="text-gray-600 text-sm">Understand tense markers, prefixes, and word structure</p>
                </div>
              </div>
              
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Building
              </motion.button>
            </div>
          ) : currentChallenge ? (
            <div className="space-y-8">
              {/* Challenge Info */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold">
                      {currentChallenge.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      currentChallenge.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                      currentChallenge.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {currentChallenge.difficulty}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center space-x-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-4 py-2 rounded-xl transition-colors"
                  >
                    <FaLightbulb />
                    <span>Grammar Hint</span>
                  </button>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Build: "{currentChallenge.translation}"
                </h2>
                <p className="text-gray-600 mb-6">Target word: <span className="font-mono font-bold">{currentChallenge.targetWord}</span></p>
                
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6"
                    >
                      <h4 className="font-semibold text-yellow-800 mb-2">Grammar Structure:</h4>
                      <p className="text-yellow-700 text-sm">{currentChallenge.grammaticalInfo}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Word Building Area */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Your Word:</h3>
                  <button
                    onClick={clearBuiltWord}
                    className="flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl transition-colors"
                    disabled={gameState.showFeedback}
                  >
                    <FaTrash />
                    <span>Clear</span>
                  </button>
                </div>
                
                <div className="min-h-16 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 mb-6 flex items-center">
                  {gameState.builtWord.length === 0 ? (
                    <p className="text-gray-500 italic">Drop morphemes here to build your word...</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {gameState.builtWord.map((morpheme, index) => (
                        <motion.div
                          key={`${morpheme.id}-${index}`}
                          className={`px-3 py-2 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                            morpheme.type === 'prefix' ? 'bg-blue-100 border-blue-400 text-blue-700' :
                            morpheme.type === 'root' ? 'bg-green-100 border-green-400 text-green-700' :
                            morpheme.type === 'suffix' ? 'bg-purple-100 border-purple-400 text-purple-700' :
                            'bg-orange-100 border-orange-400 text-orange-700'
                          }`}
                          onClick={() => removeMorpheme(index)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="font-mono font-bold">{morpheme.text}</div>
                          <div className="text-xs">{morpheme.meaning}</div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="text-lg">
                    <span className="text-gray-600">Built word: </span>
                    <span className="font-mono font-bold text-gray-800">
                      {gameState.builtWord.map(m => m.text).join('')}
                    </span>
                  </div>
                  
                  <motion.button
                    onClick={checkAnswer}
                    disabled={gameState.builtWord.length === 0 || gameState.showFeedback}
                    className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={gameState.builtWord.length > 0 && !gameState.showFeedback ? { scale: 1.05 } : {}}
                    whileTap={gameState.builtWord.length > 0 && !gameState.showFeedback ? { scale: 0.95 } : {}}
                  >
                    Check Answer
                  </motion.button>
                </div>
              </div>

              {/* Morpheme Selection */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-soft border border-white/20">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Available Morphemes:</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {currentChallenge.morphemes.map((morpheme) => (
                    <motion.div
                      key={morpheme.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                        morpheme.isUsed 
                          ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                          : morpheme.type === 'prefix' 
                            ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 text-blue-700'
                            : morpheme.type === 'root'
                              ? 'bg-green-50 border-green-300 hover:bg-green-100 text-green-700'
                              : morpheme.type === 'suffix'
                                ? 'bg-purple-50 border-purple-300 hover:bg-purple-100 text-purple-700'
                                : 'bg-orange-50 border-orange-300 hover:bg-orange-100 text-orange-700'
                      }`}
                      onClick={() => addMorpheme(morpheme)}
                      whileHover={!morpheme.isUsed ? { scale: 1.05 } : {}}
                      whileTap={!morpheme.isUsed ? { scale: 0.95 } : {}}
                    >
                      <div className="text-center">
                        <div className="font-mono font-bold text-lg mb-1">{morpheme.text}</div>
                        <div className="text-xs mb-1">{morpheme.type}</div>
                        <div className="text-xs">{morpheme.meaning}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {gameState.showFeedback && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className={`p-6 rounded-2xl ${
                      gameState.isCorrect
                        ? 'bg-gradient-to-r from-green-100 to-green-200 border border-green-300'
                        : 'bg-gradient-to-r from-red-100 to-red-200 border border-red-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`text-3xl ${gameState.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                        {gameState.isCorrect ? <FaCheck /> : <FaTimes />}
                      </div>
                      <div>
                        <p className={`font-bold text-lg ${gameState.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {gameState.isCorrect ? 'Perfect!' : 'Not quite right'}
                        </p>
                        <p className="text-gray-700">{currentChallenge.explanation}</p>
                      </div>
                    </div>
                    
                    {!gameState.isCorrect && (
                      <div className="bg-white/50 rounded-xl p-4 mb-4">
                        <p className="text-gray-800">
                          <span className="font-semibold">Correct order: </span>
                          {currentChallenge.correctOrder.join(' + ')} = {currentChallenge.targetWord}
                        </p>
                      </div>
                    )}
                    
                    <motion.button
                      onClick={nextChallenge}
                      className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Next Challenge
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : null}
          
          {gameState.gameEnded && (
            <div className="text-center mt-8">
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 flex items-center space-x-2 mx-auto"
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
        score={Math.round((gameState.score / 1000) * 100)}
        lessonTitle="Word Builder"
        onClose={() => setShowCelebration(false)}
      />
    </div>
  )
}