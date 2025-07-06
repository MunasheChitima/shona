'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '../../components/Navigation'
import CelebrationModal from '../../components/CelebrationModal'
import { FaArrowLeft, FaPlay, FaPause, FaVolumeUp, FaHeart, FaClock, FaStar, FaRedo } from 'react-icons/fa'

interface Note {
  id: string
  tone: 'H' | 'L' | 'HL' | 'LH' // High, Low, High-Low, Low-High
  timing: number // milliseconds from start
  lane: number // 0-3 for four lanes
  word: string
  syllable: string
  hit: boolean
  missed: boolean
}

interface GameState {
  score: number
  combo: number
  maxCombo: number
  hits: number
  misses: number
  perfect: number
  good: number
  timeLeft: number
  gameStarted: boolean
  gameEnded: boolean
  isPaused: boolean
  currentTime: number
}

export default function RhythmTonesGame() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    hits: 0,
    misses: 0,
    perfect: 0,
    good: 0,
    timeLeft: 180, // 3 minutes
    gameStarted: false,
    gameEnded: false,
    isPaused: false,
    currentTime: 0
  })
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNotes, setActiveNotes] = useState<Note[]>([])
  const [showCelebration, setShowCelebration] = useState(false)
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())
  const gameLoopRef = useRef<NodeJS.Timeout | undefined>()
  const timerRef = useRef<NodeJS.Timeout | undefined>()

  // Sample words with tone patterns
  const toneWords = [
    { word: 'mangwanani', syllables: ['ma', 'ngwa', 'na', 'ni'], tones: ['H', 'L', 'H', 'L'] },
    { word: 'masikati', syllables: ['ma', 'si', 'ka', 'ti'], tones: ['H', 'L', 'H', 'L'] },
    { word: 'zvakanaka', syllables: ['zva', 'ka', 'na', 'ka'], tones: ['H', 'L', 'H', 'L'] },
    { word: 'ndatenda', syllables: ['nda', 'te', 'nda'], tones: ['H', 'L', 'H'] },
    { word: 'pamusoroi', syllables: ['pa', 'mu', 'so', 'ro', 'i'], tones: ['H', 'L', 'H', 'L', 'H'] },
    { word: 'mbira', syllables: ['mbi', 'ra'], tones: ['H', 'L'] },
    { word: 'ngoma', syllables: ['ngo', 'ma'], tones: ['H', 'L'] },
    { word: 'bhazi', syllables: ['bha', 'zi'], tones: ['H', 'L'] }
  ]

  // Key mappings for tone lanes
  const keyMappings = {
    'KeyA': 0, // High tone
    'KeyS': 1, // Low tone  
    'KeyD': 2, // High-Low tone
    'KeyF': 3  // Low-High tone
  }

  const laneColors = {
    0: 'from-red-400 to-red-600',    // High - Red
    1: 'from-blue-400 to-blue-600',  // Low - Blue
    2: 'from-yellow-400 to-yellow-600', // High-Low - Yellow
    3: 'from-green-400 to-green-600'  // Low-High - Green
  }

  const toneLabels = {
    'H': 'High',
    'L': 'Low',
    'HL': 'High-Low',
    'LH': 'Low-High'
  }

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/login')
      return
    }
    setUser(JSON.parse(userData))
    generateNotes()
  }, [])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameStarted && !gameState.isPaused && !gameState.gameEnded) {
        const lane = keyMappings[e.code as keyof typeof keyMappings]
        if (lane !== undefined && !pressedKeys.has(e.code)) {
          setPressedKeys(prev => new Set(prev).add(e.code))
          checkNoteHit(lane)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(e.code)
        return newSet
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameState, pressedKeys, activeNotes])

  // Game loop
  useEffect(() => {
    if (gameState.gameStarted && !gameState.isPaused && !gameState.gameEnded) {
      gameLoopRef.current = setInterval(() => {
        setGameState(prev => ({ ...prev, currentTime: prev.currentTime + 50 }))
        updateActiveNotes()
      }, 50)
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current)
    }
  }, [gameState.gameStarted, gameState.isPaused, gameState.gameEnded])

  // Timer
  useEffect(() => {
    if (gameState.gameStarted && !gameState.isPaused && !gameState.gameEnded) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            endGame()
            return { ...prev, timeLeft: 0 }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 }
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [gameState.gameStarted, gameState.isPaused, gameState.gameEnded])

  const generateNotes = () => {
    const gameNotes: Note[] = []
    let currentTime = 2000 // Start after 2 seconds
    
    // Generate notes for multiple words
    for (let i = 0; i < 15; i++) {
      const wordData = toneWords[i % toneWords.length]
      
      wordData.syllables.forEach((syllable, index) => {
        const tone = wordData.tones[index] as 'H' | 'L' | 'HL' | 'LH'
        let lane = 0
        
        // Map tones to lanes
        switch (tone) {
          case 'H': lane = 0; break
          case 'L': lane = 1; break
          case 'HL': lane = 2; break
          case 'LH': lane = 3; break
        }
        
        gameNotes.push({
          id: `${i}-${index}`,
          tone,
          timing: currentTime,
          lane,
          word: wordData.word,
          syllable,
          hit: false,
          missed: false
        })
        
        currentTime += 800 + Math.random() * 400 // 0.8-1.2 seconds between notes
      })
      
      currentTime += 1000 // Extra gap between words
    }
    
    setNotes(gameNotes)
  }

  const updateActiveNotes = () => {
    const currentTime = gameState.currentTime
    const newActiveNotes = notes.filter(note => 
      !note.hit && !note.missed && 
      note.timing <= currentTime + 3000 && // Show notes 3 seconds early
      note.timing >= currentTime - 1000    // Keep notes 1 second after timing
    )
    
    // Mark missed notes
    notes.forEach(note => {
      if (!note.hit && !note.missed && note.timing < currentTime - 500) {
        note.missed = true
        setGameState(prev => ({ 
          ...prev, 
          misses: prev.misses + 1, 
          combo: 0 
        }))
      }
    })
    
    setActiveNotes(newActiveNotes)
  }

  const checkNoteHit = (lane: number) => {
    const currentTime = gameState.currentTime
    const tolerance = 300 // 300ms tolerance
    
    const hitNote = activeNotes.find(note => 
      note.lane === lane && 
      !note.hit && 
      !note.missed &&
      Math.abs(note.timing - currentTime) <= tolerance
    )
    
    if (hitNote) {
      hitNote.hit = true
      const timingDiff = Math.abs(hitNote.timing - currentTime)
      
      let points = 0
      let hitType = ''
      
      if (timingDiff <= 100) {
        points = 100
        hitType = 'perfect'
        setGameState(prev => ({ ...prev, perfect: prev.perfect + 1 }))
      } else if (timingDiff <= 200) {
        points = 75
        hitType = 'good'
        setGameState(prev => ({ ...prev, good: prev.good + 1 }))
      } else {
        points = 50
        hitType = 'okay'
      }
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + points * Math.max(1, Math.floor(prev.combo / 10)),
        combo: prev.combo + 1,
        maxCombo: Math.max(prev.maxCombo, prev.combo + 1),
        hits: prev.hits + 1
      }))
      
      // Show hit feedback
      showHitFeedback(hitType, points, lane)
    }
  }

  const showHitFeedback = (type: string, points: number, lane: number) => {
    // This would show visual feedback - for now just console log
    console.log(`${type.toUpperCase()}: +${points} points in lane ${lane}`)
  }

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      gameEnded: false,
      currentTime: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      hits: 0,
      misses: 0,
      perfect: 0,
      good: 0,
      timeLeft: 180
    }))
    
    // Reset notes
    notes.forEach(note => {
      note.hit = false
      note.missed = false
    })
    
    setActiveNotes([])
    setShowCelebration(false)
  }

  const endGame = () => {
    setGameState(prev => ({ ...prev, gameEnded: true }))
    setShowCelebration(true)
    submitScore()
  }

  const submitScore = async () => {
    try {
      const response = await fetch('/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          gameId: 'rhythm-tones',
          score: gameState.score,
          gameType: 'rhythm',
          difficulty: 'Medium'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        const updatedUser = { ...user, xp: result.totalXP }
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
        
        const gameProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}')
        gameProgress['rhythm-tones'] = {
          ...gameProgress['rhythm-tones'],
          highScore: Math.max(gameProgress['rhythm-tones']?.highScore || 0, gameState.score),
          plays: (gameProgress['rhythm-tones']?.plays || 0) + 1,
          totalXP: (gameProgress['rhythm-tones']?.totalXP || 0) + result.xpGained
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

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 overflow-hidden">
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
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Rhythm Tones
          </h1>
          
          <div className="w-32" /> {/* Spacer */}
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-xl font-bold text-blue-600">{gameState.score}</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Combo</p>
              <p className="text-xl font-bold text-green-600">{gameState.combo}</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-xl font-bold text-purple-600">
                {gameState.hits + gameState.misses > 0 ? 
                  Math.round((gameState.hits / (gameState.hits + gameState.misses)) * 100) : 0}%
              </p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Perfect</p>
              <p className="text-xl font-bold text-yellow-600">{gameState.perfect}</p>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-white/20">
            <div className="text-center">
              <p className="text-sm text-gray-600">Time</p>
              <p className="text-xl font-bold text-red-600">{formatTime(gameState.timeLeft)}</p>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-4xl mx-auto">
          {!gameState.gameStarted ? (
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-soft border border-white/20">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready for Rhythm Tones?</h2>
              <p className="text-gray-600 mb-6">
                Hit the keys when the notes reach the bottom! Match the tone patterns of Shona words.
              </p>
              
              {/* Key Instructions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-r from-red-400 to-red-600 text-white p-4 rounded-xl">
                  <div className="text-2xl font-bold mb-2">A</div>
                  <div className="text-sm">High Tone</div>
                </div>
                <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 rounded-xl">
                  <div className="text-2xl font-bold mb-2">S</div>
                  <div className="text-sm">Low Tone</div>
                </div>
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-4 rounded-xl">
                  <div className="text-2xl font-bold mb-2">D</div>
                  <div className="text-sm">High-Low</div>
                </div>
                <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-xl">
                  <div className="text-2xl font-bold mb-2">F</div>
                  <div className="text-sm">Low-High</div>
                </div>
              </div>
              
              <motion.button
                onClick={startGame}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Game
              </motion.button>
            </div>
          ) : (
            /* Game Board */
            <div className="relative bg-black/90 rounded-3xl p-6 shadow-soft border border-white/20 overflow-hidden" style={{ height: '600px' }}>
              {/* Tone Lanes */}
              <div className="relative h-full flex">
                {[0, 1, 2, 3].map((lane) => (
                  <div key={lane} className="flex-1 relative border-r border-gray-700 last:border-r-0">
                    {/* Lane Background */}
                    <div 
                      className={`absolute inset-0 bg-gradient-to-b ${laneColors[lane as keyof typeof laneColors]} opacity-20`}
                    />
                    
                    {/* Hit Zone */}
                    <div 
                      className={`absolute bottom-16 left-0 right-0 h-20 bg-gradient-to-b ${laneColors[lane as keyof typeof laneColors]} opacity-40 border-2 border-white/50 rounded-lg`}
                    />
                    
                    {/* Key Pressed Effect */}
                    {Array.from(pressedKeys).some(key => keyMappings[key as keyof typeof keyMappings] === lane) && (
                      <div className="absolute bottom-16 left-0 right-0 h-20 bg-white/30 rounded-lg" />
                    )}
                    
                    {/* Lane Label */}
                    <div className="absolute bottom-2 left-0 right-0 text-center text-white font-bold text-sm">
                      {Object.keys(keyMappings)[lane]}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Notes */}
              <AnimatePresence>
                {activeNotes.map((note) => {
                  const progress = (gameState.currentTime - note.timing + 3000) / 3000
                  const yPosition = Math.max(0, Math.min(100, progress * 100))
                  
                  return (
                    <motion.div
                      key={note.id}
                      className={`absolute w-20 h-16 bg-gradient-to-b ${laneColors[note.lane as keyof typeof laneColors]} rounded-lg shadow-lg border-2 border-white/50 flex items-center justify-center text-white font-bold text-sm`}
                      style={{
                        left: `${12.5 + note.lane * 25}%`,
                        top: `${yPosition}%`,
                        transform: 'translateX(-50%)'
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <div className="text-center">
                        <div className="text-xs">{note.syllable}</div>
                        <div className="text-xs">{toneLabels[note.tone]}</div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
          
          {gameState.gameEnded && (
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
        score={Math.round((gameState.score / 100) * 100)} // Convert to percentage
        lessonTitle="Rhythm Tones"
        onClose={() => setShowCelebration(false)}
      />
    </div>
  )
}