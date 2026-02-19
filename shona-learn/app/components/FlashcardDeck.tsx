'use client'
import { useState, useEffect } from 'react'
import { FaVolumeUp, FaArrowLeft, FaArrowRight, FaRandom, FaBookOpen, FaLightbulb, FaGlobeAfrica, FaPlay, FaPause } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'
import PronunciationText from './shared/PronunciationText'
import LoadingSpinner from './LoadingSpinner'

interface Flashcard {
  id: string
  shona: string
  english: string
  pronunciation: string
  ipa: string
  tones: string
  category: string
  audioFile?: string
  example: string
  translation: string
  grammarNotes?: string
  culturalContext?: string
  usageNotes?: string
  phoneticPronunciation?: string
}

interface FlashcardDeckProps {
  category?: string
  limit?: number
}

export default function FlashcardDeck({ category, limit = 10 }: FlashcardDeckProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showEducationalContent, setShowEducationalContent] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  useEffect(() => {
    loadFlashcards()
    
    // Cleanup on unmount
    return () => {
      if (audio) {
        audio.pause()
        audio.removeEventListener('ended', () => setAudio(null))
        setAudio(null)
      }
      // Cancel any ongoing speech synthesis
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [category, limit])

  const loadFlashcards = async () => {
    try {
      setIsLoading(true)
      let data = []
      let token = null
      if (typeof window !== 'undefined') {
        token = localStorage.getItem('token')
      }
      // Only try API if we have a token
      if (token) {
        try {
          const response = await fetch('/api/vocabulary', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          if (response.ok) {
            data = await response.json()
          }
        } catch (apiError) {
          console.log('API call failed, using static data fallback')
        }
      }
      // If no data from API (or no token), fallback to static data
      if (data.length === 0) {
        try {
          const staticResponse = await fetch('/flashcards.json')
          const staticData = await staticResponse.json()
          data = staticData.flashcards || []
        } catch (staticError) {
          console.error('Failed to load static flashcards:', staticError)
        }
      }
      let filteredCards = data
      if (category) {
        filteredCards = data.filter((card: Flashcard) => card.category === category)
      }
      // Add educational content to cards
      const enhancedCards = filteredCards.map((card: Flashcard, idx: number) => ({
        ...card,
        id: card.id || `${card.shona || 'card'}_${idx}`,
        // Fix capitalization - capitalize first letter of Shona word
        shona: card.shona.charAt(0).toUpperCase() + card.shona.slice(1).toLowerCase(),
        // Create phonetic pronunciation instead of IPA
        phoneticPronunciation: createPhoneticPronunciation(card.shona, card.pronunciation),
        grammarNotes: getGrammarNotes(card.shona, card.category),
        culturalContext: getCulturalContext(card.shona, card.category),
        usageNotes: getUsageNotes(card.shona, card.category)
      }))
      // Shuffle and limit
      const shuffled = enhancedCards.sort(() => Math.random() - 0.5).slice(0, limit)
      setFlashcards(shuffled)
      setIsLoading(false)
    } catch (error) {
      console.error('Error loading flashcards:', error)
      setIsLoading(false)
    }
  }

  const createPhoneticPronunciation = (word: string, pronunciation: string) => {
    // Convert complex pronunciation to simple phonetic spelling
    const phoneticMap: { [key: string]: string } = {
      'hongu': 'HON-goo',
      'kwete': 'KWAY-tay',
      'manzino': 'man-ZEE-no',
      'maoko': 'mah-OH-ko',
      'maziso': 'mah-ZEE-so',
      'dumbu': 'DOOM-boo',
      'muromo': 'moo-ROH-mo',
      'baba': 'BAH-bah',
      'mai': 'MY',
      'mbuya': 'mm-BOO-yah',
      'sekuru': 'say-KOO-roo',
      'mhoro': 'mm-HOH-ro',
      'babamukuru': 'bah-bah-moo-KOO-roo'
    }
    
    return phoneticMap[word.toLowerCase()] || pronunciation.replace(/[/]/g, '').toUpperCase()
  }

  const getGrammarNotes = (word: string, category: string) => {
    const grammarMap: { [key: string]: string } = {
      'hongu': 'Affirmative response particle. Used to confirm statements.',
      'kwete': 'Negative response particle. Used to deny or refuse.',
      'manzino': 'Plural noun (ma- prefix). Singular would be zino.',
      'maoko': 'Plural noun (ma- prefix). Singular would be ruoko.',
      'maziso': 'Plural noun (ma- prefix). Singular would be ziso.',
      'dumbu': 'Singular noun. Part of body vocabulary.',
      'muromo': 'Singular noun with mu- prefix. Part of body vocabulary.'
    }
    return grammarMap[word.toLowerCase()] || `${category} vocabulary word following Shona grammar patterns.`
  }

  const getCulturalContext = (word: string, category: string) => {
    const culturalMap: { [key: string]: string } = {
      'hongu': 'In Shona culture, direct "yes" responses show respect and agreement.',
      'kwete': 'Polite way to decline. Often accompanied by explanations to maintain harmony.',
      'manzino': 'Dental health is important in Shona culture. Traditional methods included chewing sticks.',
      'maoko': 'Hands are significant in Shona culture - used for greetings, work, and artistic expression.',
      'maziso': 'Eyes are considered windows to the soul in Shona culture. Respect is shown through eye contact.',
      'dumbu': 'Stomach represents health and well-being in traditional Shona medicine.',
      'muromo': 'The mouth is sacred in Shona culture - used for speaking wisdom and singing.'
    }
    return culturalMap[word.toLowerCase()] || `This ${category} word has cultural significance in Shona tradition.`
  }

  const getUsageNotes = (word: string, category: string) => {
    const usageMap: { [key: string]: string } = {
      'hongu': 'Used in formal and informal settings. Can be emphasized for stronger agreement.',
      'kwete': 'More polite than "aiwa" (no). Used when declining offers or requests.',
      'manzino': 'Always used in plural form when referring to teeth collectively.',
      'maoko': 'Can refer to both hands or arms depending on context.',
      'maziso': 'Used both literally (physical eyes) and metaphorically (seeing/understanding).',
      'dumbu': 'Common in health-related conversations and when discussing hunger.',
      'muromo': 'Used in contexts of speaking, eating, or kissing.'
    }
    return usageMap[word.toLowerCase()] || `Commonly used in ${category} contexts and everyday conversation.`
  }

  const playAudio = async (audioFile?: string) => {
    if (typeof window === 'undefined') return
    setAudioError(null)
    
    if (isPlaying) {
      if (audio) {
        audio.pause()
        setIsPlaying(false)
        setAudio(null)
      }
      return
    }

    const currentCard = flashcards[currentIndex]
    if (!currentCard) return

    // Try ElevenLabs first
    const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY
    if (apiKey) {
      try {
        setIsPlaying(true)
        const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/EXAVITQu4vr4xnSDxMaL', {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify({
            text: currentCard.shona,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.75,
              similarity_boost: 0.85,
              style: 0.4,
              use_speaker_boost: true
            }
          })
        })

        if (response.ok) {
          const audioBlob = await response.blob()
          const audioUrl = URL.createObjectURL(audioBlob)
          const newAudio = new Audio(audioUrl)
          
          newAudio.addEventListener('ended', () => {
            setIsPlaying(false)
            setAudio(null)
            URL.revokeObjectURL(audioUrl)
          })
          
          newAudio.addEventListener('error', () => {
            setIsPlaying(false)
            setAudioError('ElevenLabs audio failed. Using fallback.')
            fallbackToTTS()
          })
          
          setAudio(newAudio)
          await newAudio.play()
          return
        }
      } catch (error) {
        console.error('ElevenLabs error:', error)
        setIsPlaying(false)
        setAudioError('ElevenLabs unavailable. Using fallback.')
      }
    }

    // Fallback to local audio file or TTS
    fallbackToTTS()
  }

  const fallbackToTTS = async () => {
    const currentCard = flashcards[currentIndex]
    if (!currentCard) return

    // Try local audio file first
    if (currentCard.audioFile) {
      try {
        const newAudio = new Audio(`/content/audio/${currentCard.audioFile}`)
        newAudio.addEventListener('ended', () => {
          setIsPlaying(false)
          setAudio(null)
        })
        newAudio.addEventListener('error', () => {
          setIsPlaying(false)
          useBrowserTTS()
        })
        setAudio(newAudio)
        await newAudio.play()
        return
      } catch (error) {
        console.error('Local audio error:', error)
      }
    }

    // Final fallback to browser TTS
    useBrowserTTS()
  }

  const useBrowserTTS = () => {
    const currentCard = flashcards[currentIndex]
    if (!currentCard) return

    if ('speechSynthesis' in window) {
      setAudioError('Using browser text-to-speech (limited quality)')
      const utterance = new SpeechSynthesisUtterance(currentCard.shona)
      utterance.lang = 'en-US' // Use English for better pronunciation
      utterance.rate = 0.8
      utterance.pitch = 1.0
      utterance.onstart = () => setIsPlaying(true)
      utterance.onend = () => setIsPlaying(false)
      utterance.onerror = () => {
        setIsPlaying(false)
        setAudioError('Audio playback failed')
      }
      speechSynthesis.speak(utterance)
    } else {
      setAudioError('Audio not supported on this device')
    }
  }

  const nextCard = () => {
    setIsFlipped(false)
    setShowEducationalContent(false)
    setCurrentIndex((prev) => (prev + 1) % flashcards.length)
  }

  const prevCard = () => {
    setIsFlipped(false)
    setShowEducationalContent(false)
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length)
  }

  const shuffleCards = () => {
    setIsFlipped(false)
    setShowEducationalContent(false)
    setCurrentIndex(0)
    setFlashcards(prev => [...prev].sort(() => Math.random() - 0.5))
  }

  const flipCard = () => {
    setIsFlipped(!isFlipped)
  }

  if (isLoading) {
    return (
      <LoadingSpinner fullScreen message="Loading flashcards..." />
    )
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <FaBookOpen className="text-6xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No flashcards found</h3>
        <p className="text-gray-500">Try selecting a different category or check back later.</p>
      </div>
    )
  }

  const currentCard = flashcards[currentIndex]

  return (
    <div className="max-w-2xl mx-auto">
      {audioError && (
        <div className="text-center text-yellow-600 mb-4 p-3 bg-yellow-50 rounded-lg">
          {audioError}
        </div>
      )}
      
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-600">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={shuffleCards}
            className="p-2 text-gray-600 hover:text-accent-gold transition-colors"
            title="Shuffle cards"
          >
            <FaRandom />
          </button>
        </div>
      </div>

      {/* Organic Flashcard - Inspired by hand-drawn concept */}
      <div className="relative cursor-pointer mb-8" onClick={flipCard}>
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl overflow-hidden"
          style={{
            borderRadius: '30px 35px 25px 40px', // Organic wavy border
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transformStyle: 'preserve-3d',
            transition: 'transform 0.6s ease-in-out'
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          {/* Front of card */}
          <AnimatePresence mode="wait">
            {!isFlipped ? (
              <motion.div
                key="front"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 min-h-[500px]"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Flash Card Title */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Flash Card</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-accent-gold to-primary mx-auto rounded-full"></div>
                </div>

                {/* Shona Word Section - Blue */}
                <div className="mb-8 p-6 bg-gradient-to-r from-accent-blue-50 to-accent-blue-100 rounded-2xl border-l-4 border-accent-blue-500">
                  <h3 className="text-accent-blue-700 font-semibold mb-2 text-lg">Shona Word</h3>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-accent-blue-800 mb-2">{currentCard.shona}</p>
                    <p className="text-accent-blue-600 text-sm">({currentCard.category})</p>
                  </div>
                </div>

                {/* Pronunciation Section - Yellow/Orange */}
                <div className="mb-8 p-6 bg-gradient-to-r from-accent-gold-50 to-accent-gold-100 rounded-2xl border-l-4 border-accent-gold-500">
                  <h3 className="text-accent-gold-700 font-semibold mb-2 text-lg">Pronunciation</h3>
                  <div className="text-center">
                    <p className="text-2xl font-medium text-accent-gold-800 mb-1">{currentCard.phoneticPronunciation || currentCard.pronunciation}</p>
                    <p className="text-accent-gold-600 text-sm">Phonetic spelling</p>
                    {currentCard.tones && (
                      <p className="text-accent-gold-600 text-sm">Tones: {currentCard.tones}</p>
                    )}
                  </div>
                </div>

                {/* Audio Section - Boxed at bottom */}
                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        playAudio(currentCard.audioFile)
                      }}
                      disabled={isPlaying}
                      className="flex items-center space-x-3 px-6 py-3 bg-accent-green text-white rounded-xl hover:bg-accent-green-600 transition-colors disabled:opacity-50"
                    >
                      {isPlaying ? <FaPause /> : <FaPlay />}
                      <span className="font-medium">
                        {isPlaying ? 'Playing...' : 'Play Audio'}
                      </span>
                    </button>
                  </div>
                </div>

                <p className="text-center text-gray-500 mt-6 text-sm">
                  Tap to see definition and usage
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 min-h-[500px]"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                {/* Flash Card Title */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Flash Card</h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-accent-gold to-primary mx-auto rounded-full"></div>
                </div>

                {/* Definition/Translation Section - Green */}
                <div className="mb-8 p-6 bg-gradient-to-r from-accent-green-50 to-accent-green-100 rounded-2xl border-l-4 border-accent-green-500">
                  <h3 className="text-accent-green-700 font-semibold mb-2 text-lg">Definition / Translation</h3>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-accent-green-800 mb-2">{currentCard.english}</p>
                  </div>
                </div>

                {/* Use Case Section - Red */}
                <div className="mb-8 p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-2xl border-l-4 border-red-500">
                  <h3 className="text-red-700 font-semibold mb-2 text-lg">Use Case</h3>
                  <div className="text-center">
                    <p className="text-lg font-medium text-red-800 mb-2">{currentCard.example}</p>
                    <p className="text-red-600 text-sm italic">{currentCard.translation}</p>
                  </div>
                </div>

                {/* Audio Section - Boxed at bottom */}
                <div className="p-4 bg-gray-50 rounded-2xl border-2 border-gray-200">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        playAudio(currentCard.audioFile)
                      }}
                      disabled={isPlaying}
                      className="flex items-center space-x-3 px-6 py-3 bg-accent-green text-white rounded-xl hover:bg-accent-green-600 transition-colors disabled:opacity-50"
                    >
                      {isPlaying ? <FaPause /> : <FaPlay />}
                      <span className="font-medium">
                        {isPlaying ? 'Playing...' : 'Play Audio'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Educational Content Toggle */}
                <div className="text-center mt-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowEducationalContent(!showEducationalContent)
                    }}
                    className="flex items-center justify-center space-x-2 mx-auto px-4 py-2 bg-accent-gold text-white rounded-lg hover:bg-accent-gold-600 transition-colors"
                  >
                    <FaLightbulb />
                    <span>Learn More</span>
                  </button>
                </div>
                
                {showEducationalContent && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 p-4 bg-gradient-to-r from-accent-green-50 to-accent-blue-50 rounded-xl border border-accent-green-200"
                  >
                    <div className="text-left space-y-3">
                      <div>
                        <h4 className="font-semibold text-accent-green-700 flex items-center">
                          <FaGlobeAfrica className="mr-2" />
                          Cultural Context
                        </h4>
                        <p className="text-sm text-gray-700">{currentCard.culturalContext || 'No cultural context available'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent-blue-700 flex items-center">
                          <FaBookOpen className="mr-2" />
                          Grammar Notes
                        </h4>
                        <p className="text-sm text-gray-700">{currentCard.grammarNotes || 'No grammar notes available'}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-accent-gold-700 flex items-center">
                          <FaLightbulb className="mr-2" />
                          Usage Notes
                        </h4>
                        <p className="text-sm text-gray-700">{currentCard.usageNotes || 'No usage notes available'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <p className="text-center text-gray-500 mt-6 text-sm">
                  Tap to see Shona word
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevCard}
          className="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-lg transition-all border-2 border-gray-200"
        >
          <FaArrowLeft />
          <span>Previous</span>
        </button>
        
        <button
          onClick={nextCard}
          className="flex items-center space-x-2 px-6 py-3 bg-accent-green hover:bg-accent-green-600 text-white rounded-xl shadow-lg transition-all"
        >
          <span>Next</span>
          <FaArrowRight />
        </button>
      </div>
    </div>
  )
} 