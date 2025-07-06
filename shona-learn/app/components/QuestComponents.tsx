'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaMusic, FaHeart, FaUsers, FaBookOpen, FaLeaf, FaGem, FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa'

// Types
interface QuestComponentProps {
  onComplete: (result: any) => void
  questData: any
}

interface Herb {
  id: number
  name: string
  shona: string
  uses: string[]
  description: string
  culturalSignificance: string
  image: string
}

// Virtual Market Simulation Component
export const VirtualMarketSimulation: React.FC<QuestComponentProps> = ({ onComplete, questData }) => {
  const [currentStage, setCurrentStage] = useState(0)
  const [score, setScore] = useState(0)
  const [marketItems] = useState([
    { id: 1, name: 'Bananas', shona: 'Mabhananazi', price: 5, image: '🍌' },
    { id: 2, name: 'Tomatoes', shona: 'Matomato', price: 3, image: '🍅' },
    { id: 3, name: 'Pottery', shona: 'Hari', price: 15, image: '🏺' },
    { id: 4, name: 'Baskets', shona: 'Dengu', price: 8, image: '🧺' }
  ])

  const marketStages = [
    { action: 'greeting', phrase: 'Mangwanani! How are you?', shona: 'Mangwanani! Makadii?' },
    { action: 'browsing', phrase: 'What do you have today?', shona: 'Mune chii nhasi?' },
    { action: 'bargaining', phrase: 'How much is this?', shona: 'Zvinodhura marii izvi?' },
    { action: 'payment', phrase: 'Here is your money', shona: 'Heri mari yenyu' }
  ]

  const handleStageComplete = (stageScore: number) => {
    setScore(score + stageScore)
    if (currentStage < marketStages.length - 1) {
      setCurrentStage(currentStage + 1)
    } else {
      onComplete({ score, completed: true })
    }
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-3xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-orange-800 mb-2">Virtual Market Adventure</h3>
        <p className="text-orange-600">Navigate the market using Shona phrases</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Market Scene */}
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {marketItems.map(item => (
              <div key={item.id} className="text-center p-3 bg-gray-50 rounded-xl">
                <div className="text-3xl mb-2">{item.image}</div>
                <div className="font-semibold text-sm">{item.name}</div>
                <div className="text-xs text-gray-600">{item.shona}</div>
                <div className="text-orange-600 font-bold">${item.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Stage */}
        <div className="bg-white rounded-2xl p-4 shadow-soft">
          <div className="mb-4">
            <div className="text-sm text-gray-500 mb-2">Stage {currentStage + 1} of {marketStages.length}</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStage + 1) / marketStages.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-center">
            <h4 className="font-semibold text-gray-800 mb-2 capitalize">{marketStages[currentStage].action}</h4>
            <div className="bg-orange-100 p-3 rounded-xl mb-3">
              <p className="text-orange-800 font-semibold">{marketStages[currentStage].phrase}</p>
              <p className="text-orange-600 text-sm">{marketStages[currentStage].shona}</p>
            </div>
            <motion.button
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStageComplete(25)}
            >
              Practice Phrase
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Traditional Music Component
export const TraditionalMusicComponent: React.FC<QuestComponentProps> = ({ onComplete, questData }) => {
  const [currentSong, setCurrentSong] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [completedSongs, setCompletedSongs] = useState<number[]>([])

  const songs = [
    {
      title: 'Nherera (Orphan)',
      theme: 'Community Support',
      lyrics: ['Nherera haipeswi', 'Inoyambirwa nevamwe', 'Vana vese tinodanana'],
      meaning: 'An orphan is not lost, they are helped by others, all children belong to each other',
      culturalContext: 'This song teaches about Ubuntu - the philosophy of interconnectedness'
    },
    {
      title: 'Kurima (Farming)',
      theme: 'Agricultural Life',
      lyrics: ['Kurima ndekorufu', 'Tinodya zvatakasima', 'Vese tinobatsirana'],
      meaning: 'Farming is life, we eat what we plant, we all help each other',
      culturalContext: 'Celebrates the importance of agriculture and community cooperation'
    }
  ]

  const handleSongComplete = (songIndex: number) => {
    if (!completedSongs.includes(songIndex)) {
      setCompletedSongs([...completedSongs, songIndex])
    }
    if (completedSongs.length === songs.length - 1) {
      onComplete({ songsLearned: songs.length, completed: true })
    }
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-3xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-purple-800 mb-2">Songs of the Ancestors</h3>
        <p className="text-purple-600">Learn Shona through traditional music</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {songs.map((song, index) => (
          <motion.div
            key={index}
            className={`bg-white rounded-2xl p-4 shadow-soft border-2 ${
              completedSongs.includes(index) ? 'border-green-300' : 'border-transparent'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-800">{song.title}</h4>
              <div className="flex items-center space-x-2">
                <FaMusic className="text-purple-500" />
                {completedSongs.includes(index) && <FaHeart className="text-green-500" />}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">{song.theme}</p>
              <div className="bg-purple-100 p-3 rounded-xl">
                {song.lyrics.map((line, lineIndex) => (
                  <p key={lineIndex} className="text-purple-800 font-semibold">{line}</p>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-sm text-gray-700 italic">{song.meaning}</p>
            </div>

            <div className="mb-4">
              <p className="text-xs text-gray-600">{song.culturalContext}</p>
            </div>

            <div className="flex space-x-2">
              <motion.button
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <FaPause className="mr-2" /> : <FaPlay className="mr-2" />}
                {isPlaying ? 'Pause' : 'Play'}
              </motion.button>
              <motion.button
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSongComplete(index)}
              >
                Learned
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// Proverb Matching Game
export const ProverbMatchingGame: React.FC<QuestComponentProps> = ({ onComplete, questData }) => {
  const [currentProverb, setCurrentProverb] = useState(0)
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const proverbs = [
    {
      shona: 'Chakafukidza dzimba matenga',
      meaning: 'What covers houses is roofs',
      lesson: 'Every problem has a solution; every need has a way to be met',
      context: 'Used to encourage problem-solving and resourcefulness'
    },
    {
      shona: 'Rume rimwe harikombi churu',
      meaning: 'One male cannot cover the granary',
      lesson: 'Teamwork and cooperation are essential for big tasks',
      context: 'Teaches the importance of community and collaboration'
    },
    {
      shona: 'Mwana mukoma wani',
      meaning: 'Every child is an elder brother/sister',
      lesson: 'Everyone has the potential to be a leader and helper',
      context: 'Emphasizes the value of every individual in the community'
    }
  ]

  const meaningOptions = [
    'Every problem has a solution',
    'Teamwork is essential',
    'Everyone has leadership potential',
    'Patience brings wisdom'
  ]

  const handleMeaningSelect = (meaning: string) => {
    setSelectedMeaning(meaning)
    setShowResult(true)
    
    const isCorrect = meaning === proverbs[currentProverb].lesson
    if (isCorrect) {
      setScore(score + 1)
    }
    
    setTimeout(() => {
      if (currentProverb < proverbs.length - 1) {
        setCurrentProverb(currentProverb + 1)
        setSelectedMeaning(null)
        setShowResult(false)
      } else {
        onComplete({ score, total: proverbs.length, completed: true })
      }
    }, 3000)
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-3xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-amber-800 mb-2">Wisdom of the Elders</h3>
        <p className="text-amber-600">Match proverbs with their meanings</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl p-6 shadow-soft mb-6">
          <div className="text-center mb-4">
            <div className="text-sm text-gray-500 mb-2">Proverb {currentProverb + 1} of {proverbs.length}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentProverb + 1) / proverbs.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="bg-amber-100 p-4 rounded-xl mb-3">
              <p className="text-xl font-bold text-amber-800 mb-2">{proverbs[currentProverb].shona}</p>
              <p className="text-amber-600 italic">{proverbs[currentProverb].meaning}</p>
            </div>
            <p className="text-sm text-gray-600">{proverbs[currentProverb].context}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {meaningOptions.map((meaning, index) => (
              <motion.button
                key={index}
                className={`p-3 rounded-xl border-2 transition-all text-sm ${
                  selectedMeaning === meaning
                    ? meaning === proverbs[currentProverb].lesson
                      ? 'border-green-500 bg-green-100 text-green-800'
                      : 'border-red-500 bg-red-100 text-red-800'
                    : 'border-gray-200 hover:border-amber-300 bg-gray-50 hover:bg-amber-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleMeaningSelect(meaning)}
                disabled={showResult}
              >
                {meaning}
              </motion.button>
            ))}
          </div>

          {showResult && (
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className={`p-3 rounded-xl ${
                selectedMeaning === proverbs[currentProverb].lesson
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedMeaning === proverbs[currentProverb].lesson ? '✅ Correct!' : '❌ Not quite right'}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

// Virtual Herb Garden Component
export const VirtualHerbGarden: React.FC<QuestComponentProps> = ({ onComplete, questData }) => {
  const [discoveredHerbs, setDiscoveredHerbs] = useState<Herb[]>([])
  const [currentHerb, setCurrentHerb] = useState<Herb | null>(null)

  const herbs: Herb[] = [
    {
      id: 1,
      name: 'Aloe Vera',
      shona: 'Gavakava',
      uses: ['Healing burns', 'Treating wounds', 'Digestive aid'],
      description: 'A succulent plant with thick, fleshy leaves containing healing gel',
      culturalSignificance: 'Traditionally used by Shona healers for skin conditions',
      image: '🌿'
    },
    {
      id: 2,
      name: 'African Potato',
      shona: 'Chitunga',
      uses: ['Immune booster', 'Respiratory health', 'General wellness'],
      description: 'A tuberous plant with medicinal properties',
      culturalSignificance: 'Considered sacred and used in traditional ceremonies',
      image: '🥔'
    },
    {
      id: 3,
      name: 'Fever Tree',
      shona: 'Muhacha',
      uses: ['Reducing fever', 'Treating malaria', 'Pain relief'],
      description: 'A tree with distinctive yellow bark and medicinal bark',
      culturalSignificance: 'Used by traditional healers for generations',
      image: '🌳'
    }
  ]

  const handleHerbDiscovery = (herb: Herb) => {
    if (!discoveredHerbs.find(h => h.id === herb.id)) {
      setDiscoveredHerbs([...discoveredHerbs, herb])
    }
    setCurrentHerb(herb)
  }

  const handleComplete = () => {
    onComplete({ herbsDiscovered: discoveredHerbs.length, completed: true })
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-3xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-green-800 mb-2">The Healing Garden</h3>
        <p className="text-green-600">Discover traditional medicinal plants</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {herbs.map(herb => (
          <motion.div
            key={herb.id}
            className={`bg-white rounded-2xl p-4 shadow-soft cursor-pointer border-2 ${
              discoveredHerbs.find(h => h.id === herb.id)
                ? 'border-green-300'
                : 'border-transparent hover:border-green-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleHerbDiscovery(herb)}
          >
            <div className="text-center">
              <div className="text-4xl mb-2">{herb.image}</div>
              <h4 className="font-semibold text-gray-800">{herb.name}</h4>
              <p className="text-sm text-green-600 font-medium">{herb.shona}</p>
              {discoveredHerbs.find(h => h.id === herb.id) && (
                <div className="mt-2">
                  <FaLeaf className="text-green-500 mx-auto" />
                  <p className="text-xs text-green-700">Discovered!</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {currentHerb && (
        <motion.div
          className="bg-white rounded-2xl p-6 shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-xl font-bold text-gray-800 mb-2">{currentHerb.name}</h4>
              <p className="text-green-600 font-semibold mb-3">{currentHerb.shona}</p>
              <p className="text-gray-700 mb-4">{currentHerb.description}</p>
              <div className="bg-green-100 p-3 rounded-xl">
                <p className="text-green-800 font-semibold mb-2">Traditional Uses:</p>
                <ul className="text-sm text-green-700">
                  {currentHerb.uses.map((use, index) => (
                    <li key={index} className="flex items-center mb-1">
                      <FaLeaf className="text-green-500 mr-2 text-xs" />
                      {use}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="bg-amber-50 p-4 rounded-xl">
              <h5 className="font-semibold text-amber-800 mb-2">Cultural Significance</h5>
              <p className="text-amber-700 text-sm">{currentHerb.culturalSignificance}</p>
            </div>
          </div>
        </motion.div>
      )}

      {discoveredHerbs.length === herbs.length && (
        <div className="text-center mt-6">
          <motion.button
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleComplete}
          >
            Complete Garden Quest
          </motion.button>
        </div>
      )}
    </div>
  )
}

// Master Quest Component Container
export const QuestInteractiveComponent = ({ questType, questData, onComplete }) => {
  const components = {
    'market-simulation': VirtualMarketSimulation,
    'traditional-music': TraditionalMusicComponent,
    'proverb-matching': ProverbMatchingGame,
    'herb-garden': VirtualHerbGarden
  }

  const Component = components[questType]
  
  if (!Component) {
    return (
      <div className="bg-gray-100 p-6 rounded-3xl text-center">
        <p className="text-gray-600">Interactive component not found for: {questType}</p>
      </div>
    )
  }

  return <Component onComplete={onComplete} questData={questData} />
}

export default QuestInteractiveComponent