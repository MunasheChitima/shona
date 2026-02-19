'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaVolumeUp, FaGlobeAfrica, FaInfoCircle, FaEye, FaBookOpen } from 'react-icons/fa'
import PronunciationText, { PronunciationTextCompact } from './PronunciationText'
import { CulturalContextCompact } from './CulturalContext'
import audioService from '@/lib/services/AudioService'

interface VocabularyItem {
  shona: string
  english: string
  pronunciation: string
  phonetic?: string
  syllables?: string
  tonePattern?: string
  audioFile?: string
  usage?: string
  example?: string
  culturalContext?: string
}

interface VocabularyDisplayProps {
  vocabulary: VocabularyItem[]
  variant?: 'grid' | 'list' | 'cards' | 'compact'
  showPronunciation?: boolean
  showCultural?: boolean
  showUsage?: boolean
  showExamples?: boolean
  className?: string
}

export default function VocabularyDisplay({
  vocabulary,
  variant = 'cards',
  showPronunciation = true,
  showCultural = true,
  showUsage = true,
  showExamples = true,
  className = ''
}: VocabularyDisplayProps) {
  if (!vocabulary || vocabulary.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <FaBookOpen className="text-4xl mx-auto mb-2 opacity-50" />
        <p>No vocabulary items found</p>
      </div>
    )
  }

  const renderVocabularyItem = (item: VocabularyItem, index: number) => {
    switch (variant) {
      case 'grid':
        return <VocabularyGridItem key={index} item={item} showAll={{ showPronunciation, showCultural, showUsage, showExamples }} />
      case 'list':
        return <VocabularyListItem key={index} item={item} showAll={{ showPronunciation, showCultural, showUsage, showExamples }} />
      case 'compact':
        return <VocabularyCompactItem key={index} item={item} />
      default:
        return <VocabularyCard key={index} item={item} showAll={{ showPronunciation, showCultural, showUsage, showExamples }} />
    }
  }

  const containerClasses = {
    grid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    list: 'space-y-4',
    cards: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    compact: 'space-y-2'
  }

  return (
    <div className={`vocabulary-display ${containerClasses[variant]} ${className}`}>
      {vocabulary.map(renderVocabularyItem)}
    </div>
  )
}

// Card variant - detailed display
function VocabularyCard({ 
  item, 
  showAll 
}: { 
  item: VocabularyItem
  showAll: { showPronunciation: boolean, showCultural: boolean, showUsage: boolean, showExamples: boolean }
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const playAudio = async () => {
    if (isPlaying) return
    
    setIsPlaying(true)
    try {
      const result = await audioService.playAudio(item.audioFile, item.shona)
      if (!result.success) {
        console.warn('Audio playback failed:', result.error)
      }
    } catch (error) {
      console.warn('Audio playback failed:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="vocabulary-card bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
    >
      {/* Header with Shona word and audio */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <PronunciationText
            word={item.shona}
            pronunciation={item.pronunciation}
            phonetic={item.phonetic}
            syllables={item.syllables}
            tonePattern={item.tonePattern}
            audioFile={item.audioFile}
            size="medium"
            showDetails={false}
          />
          <p className="text-lg text-gray-600 mt-2">{item.english}</p>
        </div>
        
        <button
          onClick={playAudio}
          disabled={isPlaying}
          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50"
        >
          <FaVolumeUp className={`text-lg ${isPlaying ? 'animate-pulse' : ''}`} />
        </button>
      </div>

      {/* Usage and Example */}
      {(showAll.showUsage || showAll.showExamples) && (
        <div className="mb-4">
          {showAll.showUsage && item.usage && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <FaInfoCircle className="text-blue-500 text-sm" />
                <span className="text-sm font-medium text-gray-700">Usage</span>
              </div>
              <p className="text-sm text-gray-600 bg-blue-50 p-2 rounded">{item.usage}</p>
            </div>
          )}
          
          {showAll.showExamples && item.example && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-1">
                <FaBookOpen className="text-green-500 text-sm" />
                <span className="text-sm font-medium text-gray-700">Example</span>
              </div>
              <p className="text-sm text-gray-600 bg-green-50 p-2 rounded italic">{item.example}</p>
            </div>
          )}
        </div>
      )}

      {/* Cultural Context */}
      {showAll.showCultural && item.culturalContext && (
        <div className="mb-4">
          <CulturalContextCompact culturalNotes={[item.culturalContext]} maxNotes={1} />
        </div>
      )}

      {/* Expand/Collapse button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
      >
        <FaEye />
        <span>{isExpanded ? 'Show Less' : 'Show Details'}</span>
      </button>
    </motion.div>
  )
}

// Grid variant - compact cards
function VocabularyGridItem({ 
  item, 
  showAll 
}: { 
  item: VocabularyItem
  showAll: { showPronunciation: boolean, showCultural: boolean, showUsage: boolean, showExamples: boolean }
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="vocabulary-grid-item bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="text-center mb-3">
        <PronunciationTextCompact
          word={item.shona}
          pronunciation={item.pronunciation}
          audioFile={item.audioFile}
        />
        <p className="text-gray-600 mt-2">{item.english}</p>
      </div>

      {showAll.showUsage && item.usage && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          {item.usage}
        </div>
      )}
    </motion.div>
  )
}

// List variant - horizontal layout
function VocabularyListItem({ 
  item, 
  showAll 
}: { 
  item: VocabularyItem
  showAll: { showPronunciation: boolean, showCultural: boolean, showUsage: boolean, showExamples: boolean }
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  const playAudio = async () => {
    if (isPlaying) return
    
    setIsPlaying(true)
    try {
      const result = await audioService.playAudio(item.audioFile, item.shona)
      if (!result.success) {
        console.warn('Audio playback failed:', result.error)
      }
    } catch (error) {
      console.warn('Audio playback failed:', error)
    } finally {
      setIsPlaying(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="vocabulary-list-item bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <PronunciationTextCompact
              word={item.shona}
              pronunciation={item.pronunciation}
              audioFile={item.audioFile}
            />
            <span className="text-gray-600">→</span>
            <span className="text-gray-800 font-medium">{item.english}</span>
          </div>
          
          {showAll.showUsage && item.usage && (
            <p className="text-sm text-gray-600 mt-2">{item.usage}</p>
          )}
        </div>
        
        <button
          onClick={playAudio}
          disabled={isPlaying}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors disabled:opacity-50 ml-4"
        >
          <FaVolumeUp className={`text-sm ${isPlaying ? 'animate-pulse' : ''}`} />
        </button>
      </div>
    </motion.div>
  )
}

// Compact variant - minimal display
function VocabularyCompactItem({ item }: { item: VocabularyItem }) {
  return (
    <div className="vocabulary-compact-item flex items-center justify-between p-2 hover:bg-gray-50 rounded">
      <PronunciationTextCompact
        word={item.shona}
        pronunciation={item.pronunciation}
        audioFile={item.audioFile}
      />
      <span className="text-gray-600">{item.english}</span>
    </div>
  )
}

// Search and filter component
export function VocabularySearch({
  vocabulary,
  onFilter,
  className = ''
}: {
  vocabulary: VocabularyItem[]
  onFilter: (filtered: VocabularyItem[]) => void
  className?: string
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    const filtered = vocabulary.filter(item => 
      item.shona.toLowerCase().includes(term.toLowerCase()) ||
      item.english.toLowerCase().includes(term.toLowerCase()) ||
      item.pronunciation.toLowerCase().includes(term.toLowerCase())
    )
    onFilter(filtered)
  }

  return (
    <div className={`vocabulary-search mb-6 ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search vocabulary..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <FaBookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  )
}